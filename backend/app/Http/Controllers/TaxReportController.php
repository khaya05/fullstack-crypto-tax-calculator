<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Wallet;
use Illuminate\Http\Request;
use PDF;

class TaxReportController extends Controller
{
    // Calculate tax for single wallet
    public function calculateWalletTax(Wallet $wallet, $year = null)
    {
        $year = $year ?? date('Y');

        $transactions = $wallet->transactions()
            ->whereYear('transaction_date', $year)
            ->get();

        $taxBracket = $wallet->calculateIncomeTaxAndBracket($year);
        $totalProfit = $wallet->calculateTotalProfitLossYear($year);

        return response()->json([
            'wallet' => $wallet,
            'year' => $year,
            'transactions' => $transactions,
            'total_profit' => "R" . number_format($totalProfit, 2, '.', ' '),
            'tax_rate' => $taxBracket[0],
            'tax_threshold' => "R95 750",
            'tax_amount' => $taxBracket[2],
            'tax_eligible' => $totalProfit > 95_750
        ]);
    }

    // Generate PDF report for single wallet
    public function generateWalletPdf(Wallet $wallet, $year = null)
    {
        $year = $year ?? date('Y');

        $data = $this->calculateWalletTax($wallet, $year);
        $data = json_decode(json_encode($data->original), true);

        $pdf = PDF::loadView('pdf.wallet-tax-report', $data)
                  ->setPaper('a4', 'portrait');

        return $pdf->download("tax-report-wallet-{$wallet->id}-{$year}.pdf");
    }
}
