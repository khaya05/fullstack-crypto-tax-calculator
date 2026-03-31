<?php

namespace App\Http\Controllers;

use App\Services\WalletTaxCalculator;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;

class TaxController extends Controller
{
    public function calculate(Request $request)
    {
        $data = $request->validate([
            'wallet_ids'   => 'required|array|min:1',
            'wallet_ids.*' => 'exists:wallets,id',
            'tax_year'     => 'required|integer|min:2020',
            'other_income' => 'sometimes|numeric|min:0',
        ]);

        $result = (new WalletTaxCalculator())->calculate(
            $data['wallet_ids'],
            $data['tax_year'],
            $data['other_income'] ?? 0
        );

        return response()->json($result);
    }

    public function exportPdf(Request $request)
    {
        $data = $request->validate([
            'wallet_ids'   => 'required|array|min:1',
            'wallet_ids.*' => 'exists:wallets,id',
            'tax_year'     => 'required|integer|min:2020',
            'other_income' => 'sometimes|numeric|min:0',
        ]);

        $result = (new WalletTaxCalculator())->calculate(
            $data['wallet_ids'],
            $data['tax_year'],
            $data['other_income'] ?? 0
        );

        $pdf = Pdf::loadView('report', $result);
        return $pdf->download("SARS-Crypto-Tax-{$data['tax_year']}.pdf");
    }

    public function preview(Request $request)
    {
        $data = $request->validate([
            'wallet_ids'   => 'required|array|min:1',
            'wallet_ids.*' => 'exists:wallets,id',
            'tax_year'     => 'required|integer|min:2020',
            'other_income' => 'sometimes|numeric|min:0',
        ]);

        $result = (new WalletTaxCalculator())->calculate(
            $data['wallet_ids'],
            $data['tax_year'],
            $data['other_income'] ?? 0
        );

        return view('report', $result);
    }
}
