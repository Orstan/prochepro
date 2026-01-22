<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('city_districts', function (Blueprint $table) {
            $table->id();
            $table->string('city'); // Paris, Lyon, Marseille, etc.
            $table->string('code')->unique();
            $table->string('name');
            $table->string('name_fr');
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->json('notable_places')->nullable();
            $table->decimal('latitude', 10, 8)->nullable();
            $table->decimal('longitude', 11, 8)->nullable();
            $table->integer('population')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            
            $table->index(['city', 'is_active']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('city_districts');
    }
};
