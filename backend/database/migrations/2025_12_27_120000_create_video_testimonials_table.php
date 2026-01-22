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
        Schema::create('video_testimonials', function (Blueprint $table) {
            $table->id();
            $table->string('cloudinary_public_id'); // ID відео в Cloudinary
            $table->string('name'); // Ім'я автора відгуку
            $table->string('role')->nullable(); // Роль (client/prestataire)
            $table->text('text')->nullable(); // Текст відгуку (опціонально)
            $table->integer('duration')->nullable(); // Тривалість відео в секундах
            $table->string('thumbnail_url')->nullable(); // URL превью
            $table->boolean('is_active')->default(false); // Модерація
            $table->integer('sort_order')->default(0); // Порядок відображення
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('video_testimonials');
    }
};
