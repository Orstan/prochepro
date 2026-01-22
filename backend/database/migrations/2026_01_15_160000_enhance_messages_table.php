<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('messages', function (Blueprint $table) {
            $table->enum('type', ['text', 'voice', 'video_call'])->default('text')->after('body');
            $table->string('voice_url')->nullable()->after('type');
            $table->integer('voice_duration')->nullable()->after('voice_url'); // seconds
            $table->boolean('is_read')->default(false)->after('voice_duration');
            $table->timestamp('read_at')->nullable()->after('is_read');
        });
    }

    public function down(): void
    {
        Schema::table('messages', function (Blueprint $table) {
            $table->dropColumn(['type', 'voice_url', 'voice_duration', 'is_read', 'read_at']);
        });
    }
};
