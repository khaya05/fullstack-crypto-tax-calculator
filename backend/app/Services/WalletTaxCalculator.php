<?php

namespace App\Services;

use App\Models\WalletTransaction;
use Carbon\Carbon;
use Illuminate\Support\Collection;

class WalletTaxCalculator
{
    public function calculate(array $walletIds, int $taxYear, float $otherIncome = 0): array
    {
        $start = Carbon::create($taxYear - 1, 3, 1);
        $end   = Carbon::create($taxYear, 2, $taxYear % 4 === 0 ? 29 : 28);

        $transactions = WalletTransaction::whereIn('wallet_id', $walletIds)
            ->where('date', '<=', $end)
            ->orderBy('date')
            ->get();

        return $this->processFifo($transactions, $start, $end, $taxYear, $otherIncome);
    }

    private function processFifo(Collection $txs, Carbon $start, Carbon $end, int $taxYear, float $otherIncome): array
    {
        $fifo = [];
        $disposals = [];
        $netGain = 0.0;

        foreach ($txs as $tx) {
            $asset = $tx->asset;
            $date = Carbon::parse($tx->date);

            if (!isset($fifo[$asset])) $fifo[$asset] = [];

            if ($tx->type === 'buy') {
                $cost = $tx->total_value_zar + $tx->fees_zar;
                $fifo[$asset][] = [
                    'qty'   => $tx->quantity,
                    'cost'  => $cost,
                    'date'  => $date,
                ];
            }
            elseif (in_array($tx->type, ['sell', 'trade'])) {
                $proceeds = $tx->total_value_zar - $tx->fees_zar;
                $soldQty = $tx->quantity;
                $costBase = 0.0;
                $lotsUsed = [];

                $i = 0;
                while ($soldQty > 0 && $i < count($fifo[$asset])) {
                    $lot = &$fifo[$asset][$i];

                    if ($lot['qty'] <= $soldQty) {
                        $costBase += $lot['cost'];
                        $lotsUsed[] = [
                            'lot_date' => $lot['date']->toDateString(),
                            'lot_qty'  => $lot['qty'],
                            'lot_cost' => $lot['cost']
                        ];
                        $soldQty -= $lot['qty'];
                        array_splice($fifo[$asset], $i, 1);
                    } else {
                        $portion = $soldQty / $lot['qty'];
                        $portionCost = $lot['cost'] * $portion;
                        $costBase += $portionCost;
                        $lotsUsed[] = [
                            'lot_date' => $lot['date']->toDateString(),
                            'lot_qty'  => $soldQty,
                            'lot_cost' => $portionCost
                        ];
                        $lot['qty'] -= $soldQty;
                        $lot['cost'] -= $portionCost;
                        $soldQty = 0;
                    }
                    $i++;
                }

                $gain = $proceeds - $costBase;

                if ($date->between($start, $end)) {
                    $disposals[] = [
                        'date'          => $date->toDateString(),
                        'asset'         => $asset,
                        'qty_sold'      => $tx->quantity,
                        'proceeds'      => round($proceeds, 2),
                        'cost_base'     => round($costBase, 2),
                        'gain_loss'     => round($gain, 2),
                        'transaction_id'=> $tx->transaction_id,
                        'lots_used'     => $lotsUsed,
                    ];
                    $netGain += $gain;
                }

                if ($tx->type === 'trade' && $tx->acquired_asset) {
                    $acqCost = $tx->total_value_zar + $tx->fees_zar;
                    $fifo[$tx->acquired_asset][] = [
                        'qty'  => $tx->acquired_quantity,
                        'cost' => $acqCost,
                        'date' => $date,
                    ];
                }
            }
        }

        $annualExclusion = 40000;
        $taxableGain = max(0, $netGain - $annualExclusion);
        $includedInIncome = $taxableGain * 0.4;

        $totalIncome = $otherIncome + $includedInIncome;
        $taxOnTotal = $this->calculateIncomeTax($totalIncome);
        $taxOnOther = $this->calculateIncomeTax($otherIncome);
        $additionalTax = $taxOnTotal - $taxOnOther;
        $marginalRate = $this->getMarginalRate($totalIncome);

        return [
            'tax_year'                       => $taxYear,
            'net_capital_gain'               => round($netGain, 2),
            'annual_exclusion'               => $annualExclusion,
            'taxable_capital_gain'           => round($taxableGain, 2),
            'inclusion_rate'                 => 40,
            'amount_included_in_income'      => round($includedInIncome, 2),
            'estimated_other_income'         => round($otherIncome, 2),
            'estimated_additional_tax'      => round($additionalTax, 2),
            'marginal_tax_rate_percent'      => round($marginalRate * 100),
            'tax_note'                       => 'Estimated additional tax on crypto gains (SARS 2025/2026 brackets). Assumes other taxable income of R' . number_format($otherIncome) . '. Rebates & deductions not included.',
            'disposals'                      => $disposals,
            'explanation'                    => 'FIFO method applied. Acquisition fees added to cost base. Disposal fees deducted from proceeds. Trades treated as simultaneous disposal + acquisition at market value.'
        ];
    }

    private function calculateIncomeTax(float $income): float
    {
        // SARS 2025/2026 individual tax tables (as at Feb 2026 budget)
        if ($income <= 237100) return $income * 0.18;
        if ($income <= 370500) return 42678 + ($income - 237100) * 0.26;
        if ($income <= 512800) return 77362 + ($income - 370500) * 0.31;
        if ($income <= 673000) return 121475 + ($income - 512800) * 0.33;
        if ($income <= 857900) return 174438 + ($income - 673000) * 0.36;
        if ($income <= 1817000) return 262994 + ($income - 857900) * 0.39;
        if ($income <= 999999999) return 644489 + ($income - 1817000) * 0.41;
        return 644489 + ($income - 1817000) * 0.45;
    }

    private function getMarginalRate(float $income): float
    {
        if ($income <= 237100) return 0.18;
        if ($income <= 370500) return 0.26;
        if ($income <= 512800) return 0.31;
        if ($income <= 673000) return 0.33;
        if ($income <= 857900) return 0.36;
        if ($income <= 1817000) return 0.39;
        if ($income <= 999999999) return 0.41;
        return 0.45;
    }
}
