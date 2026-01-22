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
        // Оновлюємо всі завдання з category='plumber' на 'plumbing'
        DB::table('tasks')
            ->where('category', 'plumber')
            ->update(['category' => 'plumbing']);
        
        // Логуємо результат
        $updatedCount = DB::table('tasks')
            ->where('category', 'plumbing')
            ->where('updated_at', '>=', now()->subMinute())
            ->count();
            
        if ($updatedCount > 0) {
            \Log::info("Fixed category 'plumber' to 'plumbing' for {$updatedCount} tasks");
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Повертаємо назад якщо потрібно (не рекомендується)
        DB::table('tasks')
            ->where('category', 'plumbing')
            ->whereNotNull('subcategory')
            ->whereIn('subcategory', [
                'pipe_install', 'leak_repair', 'bathroom', 'heating', 
                'drain_cleaning', 'toilet_install', 'sink_install', 
                'shower_install', 'bathtub_install'
            ])
            ->update(['category' => 'plumber']);
    }
};
