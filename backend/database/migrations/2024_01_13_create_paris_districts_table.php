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
        Schema::create('paris_districts', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique(); // e.g. "75001", "75002", etc.
            $table->string('name'); // e.g. "Paris 1st Arrondissement"
            $table->string('name_fr'); // e.g. "Paris 1er Arrondissement"
            $table->string('slug')->unique(); // e.g. "paris-1st-arrondissement"
            $table->text('description')->nullable();
            $table->integer('population')->nullable();
            $table->float('area_km2')->nullable();
            $table->float('latitude')->nullable();
            $table->float('longitude')->nullable();
            $table->json('boundaries')->nullable(); // GeoJSON boundaries
            $table->json('notable_places')->nullable(); // Array of notable places
            $table->string('meta_title')->nullable();
            $table->string('meta_description')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('paris_districts');
    }
};
