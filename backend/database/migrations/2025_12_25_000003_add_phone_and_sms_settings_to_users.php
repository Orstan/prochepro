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
            // phone вже існує в старішій міграції, додаємо тільки нові поля
            if (!Schema::hasColumn('users', 'phone_verified')) {
                $table->boolean('phone_verified')->default(false)->after('phone');
            }
            if (!Schema::hasColumn('users', 'sms_notifications_enabled')) {
                $table->boolean('sms_notifications_enabled')->default(true)->after('phone_verified');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // Видаляємо тільки нові поля, phone залишаємо (він з старішої міграції)
            if (Schema::hasColumn('users', 'phone_verified')) {
                $table->dropColumn('phone_verified');
            }
            if (Schema::hasColumn('users', 'sms_notifications_enabled')) {
                $table->dropColumn('sms_notifications_enabled');
            }
        });
    }
};
