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
            $table->string('iban')->nullable()->after('siret');
            $table->string('bic')->nullable()->after('iban');
            $table->string('bank_name')->nullable()->after('bic');
            $table->string('account_holder_name')->nullable()->after('bank_name');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['iban', 'bic', 'bank_name', 'account_holder_name']);
        });
    }
};
