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
            $table->unsignedInteger('level')->default(1)->after('last_login_at');
            $table->unsignedInteger('xp')->default(0)->after('level');
            $table->unsignedInteger('total_tasks_completed')->default(0)->after('xp');
            $table->unsignedInteger('total_reviews_received')->default(0)->after('total_tasks_completed');
            $table->decimal('average_rating', 3, 2)->nullable()->after('total_reviews_received');
            $table->json('earned_badges')->nullable()->after('average_rating');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'level',
                'xp',
                'total_tasks_completed',
                'total_reviews_received',
                'average_rating',
                'earned_badges',
            ]);
        });
    }
};
