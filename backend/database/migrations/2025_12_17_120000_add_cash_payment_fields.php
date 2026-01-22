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
        // Add payment_method to payments table
        Schema::table('payments', function (Blueprint $table) {
            $table->string('payment_method')->default('online')->after('status'); // online, cash
            $table->decimal('platform_fee', 10, 2)->nullable()->after('amount'); // 10% commission for cash
            $table->decimal('provider_amount', 10, 2)->nullable()->after('platform_fee'); // amount for prestataire
        });

        // Add cash_received_at to tasks table
        Schema::table('tasks', function (Blueprint $table) {
            $table->timestamp('cash_received_at')->nullable(); // when prestataire confirmed cash receipt
            $table->timestamp('cash_confirmed_by_client_at')->nullable(); // when client confirmed cash was given
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('payments', function (Blueprint $table) {
            $table->dropColumn(['payment_method', 'platform_fee', 'provider_amount']);
        });

        Schema::table('tasks', function (Blueprint $table) {
            $table->dropColumn(['cash_received_at', 'cash_confirmed_by_client_at']);
        });
    }
};
