<?php

namespace App\Http\Controllers;

use App\Models\Wallet;

class WalletTransactionController extends Controller
{
    public function index(Wallet $wallet)
    {
        return $wallet->transactions()->orderBy('date', 'desc')->get();
    }
}
