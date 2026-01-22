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
        Schema::create('user_interested_categories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('category_key');
            $table->string('subcategory_key')->nullable();
            $table->timestamps();
            
            $table->unique(['user_id', 'category_key', 'subcategory_key'], 'user_category_unique');
            $table->index(['user_id', 'category_key']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('user_interested_categories');
    }
};
