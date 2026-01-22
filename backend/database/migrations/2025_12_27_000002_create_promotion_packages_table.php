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
        Schema::create('promotion_packages', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // e.g., "TOP 7 jours"
            $table->text('description')->nullable();
            $table->integer('days'); // Кількість днів ТОП
            $table->decimal('price', 10, 2); // Ціна в євро
            $table->decimal('original_price', 10, 2)->nullable(); // Оригінальна ціна для розрахунку знижки
            $table->integer('discount_percentage')->default(0); // Знижка %
            $table->boolean('is_active')->default(true); // Активний/неактивний
            $table->integer('sort_order')->default(0); // Порядок відображення
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('promotion_packages');
    }
};
