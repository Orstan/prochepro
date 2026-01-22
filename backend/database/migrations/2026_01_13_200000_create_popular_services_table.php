<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('popular_services', function (Blueprint $table) {
            $table->id();
            $table->string('slug')->unique();
            $table->string('name');
            $table->string('name_fr');
            $table->string('category');
            $table->string('subcategory')->nullable();
            $table->text('description');
            $table->text('description_fr');
            $table->string('price_range')->nullable();
            $table->json('keywords')->nullable();
            $table->integer('search_volume')->default(0); // Pour prioriser
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('popular_services');
    }
};
