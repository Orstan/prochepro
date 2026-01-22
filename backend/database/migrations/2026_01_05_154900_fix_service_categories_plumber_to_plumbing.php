<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Оновлюємо ключ категорії в таблиці service_categories
        DB::table('service_categories')
            ->where('key', 'plumber')
            ->update([
                'key' => 'plumbing',
                'updated_at' => now(),
            ]);
        
        \Log::info("Fixed service_categories key from 'plumber' to 'plumbing'");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Повертаємо назад якщо потрібно (не рекомендується)
        DB::table('service_categories')
            ->where('key', 'plumbing')
            ->update([
                'key' => 'plumber',
                'updated_at' => now(),
            ]);
    }
};
