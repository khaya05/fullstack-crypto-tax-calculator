<?php

namespace App\Http\Controllers;

use App\Models\Wallet;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Carbon\Carbon;
use App\Models\WalletTransaction;

class WalletController extends Controller
{
    public function index()
    {
        return Wallet::withCount('transactions')->get();
    }

    public function show(Wallet $wallet)
    {
        return $wallet->load('transactions');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name'    => 'required|string|max:255',
            'address' => 'required|string|unique:wallets,address',  // mandatory + unique
        ]);

        $wallet = Wallet::create($validated);

        // Trigger random demo transactions if address contains "demo"
        if (str_contains(strtolower($wallet->address), 'demo')) {
            $this->seedRandomDemoTransactions($wallet);
        }

        return response()->json($wallet, 201);
    }

    private function seedRandomDemoTransactions(Wallet $wallet)
    {
        $assets = ['BTC', 'ETH', 'SOL', 'ADA'];
        $exchanges = ['Binance', 'Luno'];
        $startDate = Carbon::create(2024, 1, 1);
        $endDate = Carbon::create(2025, 2, 28);
        $numTxs = rand(30, 80);

        $holdings = []; // asset => quantity held
        $txData = [];

        for ($i = 0; $i < $numTxs; $i++) {
            $date = $startDate->copy()->addDays(rand(0, $startDate->diffInDays($endDate)));

            $asset = $assets[array_rand($assets)];

            $forceBuy = !isset($holdings[$asset]) || $holdings[$asset] <= 0.0001;
            $isBuy = $forceBuy || rand(1, 10) <= 6; // ~60% buys

            $type = $isBuy ? 'buy' : 'sell';

            $progress = $date->floatDiffInYears($startDate);
            $basePrice = match($asset) {
                'BTC' => 800000 + 300000 * $progress,
                'ETH' => 45000 + 20000 * $progress,
                'SOL' => 2800 + 1500 * $progress,
                'ADA' => 9 + 6 * $progress,
            };
            $price = max(1000, $basePrice + rand(-10000, 10000));

            $maxQty = match($asset) {
                'BTC' => 0.05,
                'ETH' => 1.0,
                'SOL' => 50.0,
                'ADA' => 5000.0,
            };

            if ($isBuy) {
                $qty = round(rand(10, 100) / 100 * ($maxQty / 5), 8);
            } else {
                $available = $holdings[$asset] ?? 0;
                $qty = round($available * (rand(20, 90) / 100), 8);
                if ($qty < 0.00000001) continue;
            }

            $total = round($price * $qty, 2);
            $fees = round($total * 0.0015 + rand(10, 200), 2);

            $txData[] = [
                'wallet_id'           => $wallet->id,
                'date'                => $date->format('Y-m-d'),
                'type'                => $type,
                'asset'               => $asset,
                'quantity'            => $qty,
                'price_per_unit_zar'  => round($price, 2),
                'total_value_zar'     => $total,
                'fees_zar'            => $fees,
                'exchange'            => $exchanges[array_rand($exchanges)],
                'transaction_id'      => 'DEMO-' . strtoupper(Str::random(8)),
                'notes'               => $type === 'buy' ? 'Random demo buy' : 'Random demo sell',
                'acquired_asset'      => null,
                'acquired_quantity'   => null,
            ];

            if ($isBuy) {
                $holdings[$asset] = ($holdings[$asset] ?? 0) + $qty;
            } else {
                $holdings[$asset] -= $qty;
            }
        }

        usort($txData, fn($a, $b) => strtotime($a['date']) <=> strtotime($b['date']));

        foreach ($txData as $tx) {
            WalletTransaction::create($tx);
        }
    }
}
