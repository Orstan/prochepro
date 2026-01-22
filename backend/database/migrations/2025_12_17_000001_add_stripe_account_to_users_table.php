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
        Schema::table('users', function (Blueprint $table) {
            $table->string('stripe_account_id')->nullable()->after('iban');
            $table->string('stripe_account_status')->nullable()->after('stripe_account_id'); // pending, active, restricted
            $table->timestamp('stripe_onboarding_completed_at')->nullable()->after('stripe_account_status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['stripe_account_id', 'stripe_account_status', 'stripe_onboarding_completed_at']);
        });
    }
};
