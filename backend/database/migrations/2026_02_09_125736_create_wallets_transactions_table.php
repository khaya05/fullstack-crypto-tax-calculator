<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('wallet_transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('wallet_id')->constrained()->onDelete('cascade');
            $table->dateTime('date');
            $table->enum('type', ['buy', 'sell', 'trade']);
            $table->string('asset');
            $table->decimal('quantity', 18, 8);
            $table->decimal('price_per_unit_zar', 18, 2)->nullable();
            $table->decimal('total_value_zar', 18, 2);
            $table->decimal('fees_zar', 18, 2);
            $table->string('exchange');
            $table->string('transaction_id')->unique();
            $table->text('notes')->nullable();

            // Trade support
            $table->string('acquired_asset')->nullable();
            $table->decimal('acquired_quantity', 18, 8)->nullable();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('wallet_transactions');
    }
};
