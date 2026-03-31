<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class WalletTransaction extends Model
{
    use HasFactory;

    protected $fillable = [
        'wallet_id', 'date', 'type', 'asset', 'quantity',
        'price_per_unit_zar', 'total_value_zar', 'fees_zar',
        'exchange', 'transaction_id', 'notes',
        'acquired_asset', 'acquired_quantity'
    ];

    protected $casts = [
        'date' => 'datetime',
        'quantity' => 'decimal:8',
        'price_per_unit_zar' => 'decimal:2',
        'total_value_zar' => 'decimal:2',
        'fees_zar' => 'decimal:2',
        'acquired_quantity' => 'decimal:8',
    ];

    public function wallet(): BelongsTo
    {
        return $this->belongsTo(Wallet::class);
    }
}
