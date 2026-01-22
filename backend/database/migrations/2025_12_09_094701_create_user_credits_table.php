<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('user_credits', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->enum('type', ['client', 'prestataire']); // тип кредитів
            $table->integer('balance')->default(0); // поточний баланс
            $table->boolean('has_unlimited')->default(false); // чи є безліміт
            $table->timestamp('unlimited_expires_at')->nullable(); // коли закінчується безліміт
            $table->boolean('used_free_credit')->default(false); // чи використано безкоштовний кредит
            $table->timestamps();

            $table->unique(['user_id', 'type']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('user_credits');
    }
};
