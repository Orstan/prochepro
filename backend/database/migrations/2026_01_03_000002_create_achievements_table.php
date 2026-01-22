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
        Schema::create('achievements', function (Blueprint $table) {
            $table->id();
            $table->string('key')->unique(); // e.g., 'first_task', 'tasks_10', 'rating_excellent'
            $table->string('name'); // e.g., 'Новачок'
            $table->text('description'); // e.g., 'Виконав перше завдання'
            $table->string('icon'); // e.g., '🥉', '🥈', '🥇', '💎'
            $table->string('category'); // e.g., 'tasks', 'reviews', 'special'
            $table->unsignedInteger('xp_reward')->default(0); // XP за досягнення
            $table->json('requirements')->nullable(); // Умови для отримання
            $table->boolean('is_active')->default(true);
            $table->unsignedInteger('sort_order')->default(0);
            $table->timestamps();
        });

        Schema::create('user_achievements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('achievement_id')->constrained('achievements')->cascadeOnDelete();
            $table->timestamp('earned_at')->useCurrent();
            $table->boolean('is_notified')->default(false); // Чи було показано користувачу
            $table->timestamps();

            $table->unique(['user_id', 'achievement_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('user_achievements');
        Schema::dropIfExists('achievements');
    }
};
