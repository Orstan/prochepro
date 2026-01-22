<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('support_chat_rooms', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('status')->default('open'); // open, assigned, resolved, closed
            $table->foreignId('assigned_to')->nullable()->constrained('users')->onDelete('set null');
            $table->string('priority')->default('normal'); // low, normal, high, urgent
            $table->string('category')->nullable(); // general, technical, billing, other
            $table->timestamp('last_message_at')->nullable();
            $table->timestamp('assigned_at')->nullable();
            $table->timestamp('resolved_at')->nullable();
            $table->timestamp('closed_at')->nullable();
            $table->integer('unread_user_count')->default(0);
            $table->integer('unread_admin_count')->default(0);
            $table->json('metadata')->nullable();
            $table->timestamps();
            
            $table->index(['user_id', 'status']);
            $table->index(['assigned_to', 'status']);
            $table->index('status');
        });

        Schema::create('support_chat_messages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('chat_room_id')->constrained('support_chat_rooms')->onDelete('cascade');
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->text('message');
            $table->string('type')->default('text'); // text, image, file, system
            $table->json('attachments')->nullable();
            $table->boolean('is_admin')->default(false);
            $table->timestamp('read_at')->nullable();
            $table->timestamps();
            
            $table->index(['chat_room_id', 'created_at']);
            $table->index('user_id');
        });

        Schema::create('chat_typing_indicators', function (Blueprint $table) {
            $table->id();
            $table->foreignId('chat_room_id')->constrained('support_chat_rooms')->onDelete('cascade');
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->timestamp('expires_at');
            $table->timestamps();
            
            $table->unique(['chat_room_id', 'user_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('chat_typing_indicators');
        Schema::dropIfExists('support_chat_messages');
        Schema::dropIfExists('support_chat_rooms');
    }
};
