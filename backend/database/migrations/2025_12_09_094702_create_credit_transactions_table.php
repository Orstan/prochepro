<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('credit_transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->enum('type', ['client', 'prestataire']); // тип кредитів
            $table->enum('action', ['purchase', 'use', 'bonus', 'referral', 'refund', 'expire']);
            $table->integer('amount'); // +/- кількість кредитів
            $table->integer('balance_after'); // баланс після транзакції
            $table->foreignId('credit_package_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('task_id')->nullable()->constrained()->nullOnDelete(); // якщо використано на завдання
            $table->foreignId('offer_id')->nullable()->constrained()->nullOnDelete(); // якщо використано на офер
            $table->string('description')->nullable();
            $table->string('payment_provider')->nullable(); // stripe, paypal, etc
            $table->string('payment_id')->nullable(); // ID платежу
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('credit_transactions');
    }
};
