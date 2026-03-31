<?php

use App\Http\Controllers\Api\TransactionController;
use App\Http\Controllers\Api\TransactionUploadController;
use App\Services\FIFOCalculatorService;
use App\Services\PdfReportService;
use App\Services\TaxCalculatorService;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\WalletController;
use App\Http\Controllers\WalletTransactionController;
use App\Http\Controllers\TaxReportController;
use App\Http\Controllers\TaxController;
use Illuminate\Http\Request;


Route::apiResource('transactions', TransactionController::class);

Route::post('/transactions/upload', [TransactionUploadController::class, 'upload']);
// Route::post('/transactions', [TransactionUploadController::class, 'transactions']);


Route::apiResource('wallets', WalletController::class);
Route::get('wallets/{wallet}/transactions', [WalletTransactionController::class, 'index']);

Route::post('tax/calculate', [TaxController::class, 'calculate']);
Route::post('tax/export-pdf', [TaxController::class, 'exportPdf']);
Route::post('tax/preview', [TaxController::class, 'preview']);

// Tax report routes
Route::prefix('tax')->group(function () {
    Route::get('/wallet/{wallet}/{year?}', [TaxReportController::class, 'calculateWalletTax']);
    Route::get('/wallet/{wallet}/pdf/{year?}', [TaxReportController::class, 'generateWalletPdf']);
});

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

Route::post('transactions/upload', [TransactionUploadController::class, 'upload']);

Route::get('transactions/by-tax-year/{sessionId}', [TransactionController::class, 'getTransactionsByTaxYear']);

Route::get('transactions/session/{sessionId}', [TransactionUploadController::class, 'getSessionTransactions']);
Route::delete('transactions/session/{sessionId}', [TransactionUploadController::class, 'deleteSession']);

Route::apiResource('transactions', TransactionController::class);

/*
|--------------------------------------------------------------------------
| Calculation Endpoints
|--------------------------------------------------------------------------
*/

/**
 * Main calculation endpoint - Calculate gains BY TAX YEAR
 */
Route::post('/calculate', function (
  Request $request,
  FIFOCalculatorService $fifoCalc,
  TaxCalculatorService $taxCalc
) {
  $request->validate([
    'session_id' => 'required|string'
  ]);

  try {
    $fifoResults = $fifoCalc->calculateByTaxYear($request->session_id);

    $taxResults = $taxCalc->calculateTaxByYear($fifoResults);

    return response()->json([
      'status' => 'success',
      'data' => $taxResults
    ]);
  } catch (\Exception $e) {
    return response()->json([
      'status' => 'fail',
      'message' => $e->getMessage()
    ], 400);
  }
});

/**
 * Simple calculation endpoint
 */
Route::post('/calculate/simple', function (
  Request $request,
  FIFOCalculatorService $fifoCalc,
  TaxCalculatorService $taxCalc
) {
  $request->validate([
    'session_id' => 'required|string'
  ]);

  try {
    $fifoResults = $fifoCalc->calculate($request->session_id);
    $taxResults = $taxCalc->calculateTax($fifoResults);

    return response()->json([
      'status' => 'success',
      'data' => $taxResults
    ]);
  } catch (\Exception $e) {
    return response()->json([
      'status' => 'fail',
      'message' => $e->getMessage()
    ], 400);
  }
});

/**
 * Download PDF report for tax calculations
 */
Route::post('/calculate/download-pdf', function (
  Request $request,
  FIFOCalculatorService $fifoCalc,
  TaxCalculatorService $taxCalc,
  PdfReportService $pdfService
) {
  $request->validate([
    'session_id' => 'required|string'
  ]);

  try {
    $fifoResults = $fifoCalc->calculateByTaxYear($request->session_id);

    $taxResults = $taxCalc->calculateTaxByYear($fifoResults);

    $pdf = $pdfService->generateTaxReport($taxResults);

    $filename = 'crypto-tax-report-' . $request->session_id . '.pdf';

    return $pdf->download($filename);
  } catch (\Exception $e) {
    return response()->json([
      'status' => 'fail',
      'message' => $e->getMessage()
    ], 400);
  }
});
