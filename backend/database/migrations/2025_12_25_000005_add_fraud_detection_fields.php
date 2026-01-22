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
            // is_blocked вже існує в старішій міграції, додаємо тільки нові поля
            if (!Schema::hasColumn('users', 'blocked_reason')) {
                $table->text('blocked_reason')->nullable()->after('is_blocked');
            }
            if (!Schema::hasColumn('users', 'blocked_at')) {
                $table->timestamp('blocked_at')->nullable()->after('blocked_reason');
            }
            if (!Schema::hasColumn('users', 'last_login_ip')) {
                $table->string('last_login_ip')->nullable()->after('blocked_at');
            }
            if (!Schema::hasColumn('users', 'fraud_risk_score')) {
                $table->integer('fraud_risk_score')->default(0)->after('last_login_ip');
            }
        });

        Schema::table('payments', function (Blueprint $table) {
            if (!Schema::hasColumn('payments', 'fraud_check_passed')) {
                $table->boolean('fraud_check_passed')->default(true)->after('status');
            }
            if (!Schema::hasColumn('payments', 'fraud_check_notes')) {
                $table->text('fraud_check_notes')->nullable()->after('fraud_check_passed');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // Видаляємо тільки нові поля, is_blocked залишаємо (він з старішої міграції)
            $columns = ['blocked_reason', 'blocked_at', 'last_login_ip', 'fraud_risk_score'];
            foreach ($columns as $column) {
                if (Schema::hasColumn('users', $column)) {
                    $table->dropColumn($column);
                }
            }
        });

        Schema::table('payments', function (Blueprint $table) {
            if (Schema::hasColumn('payments', 'fraud_check_passed')) {
                $table->dropColumn('fraud_check_passed');
            }
            if (Schema::hasColumn('payments', 'fraud_check_notes')) {
                $table->dropColumn('fraud_check_notes');
            }
        });
    }
};
