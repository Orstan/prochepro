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
        Schema::create('messenger_settings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('telegram_chat_id')->nullable();
            $table->string('telegram_username')->nullable();
            $table->string('whatsapp_number')->nullable();
            $table->boolean('whatsapp_verified')->default(false);
            $table->boolean('telegram_enabled')->default(false);
            $table->boolean('whatsapp_enabled')->default(false);
            $table->json('notification_types')->nullable();
            $table->string('verification_code')->nullable();
            $table->timestamp('verification_expires_at')->nullable();
            $table->timestamps();
            
            // Index for faster lookups
            $table->index('user_id');
            $table->index('telegram_chat_id');
            $table->index('whatsapp_number');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('messenger_settings');
    }
};
