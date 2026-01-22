<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('email_automation_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('campaign_type'); // welcome_series, task_reminder, re_engagement, weekly_digest
            $table->integer('sequence_step')->default(1); // для multi-step campaigns
            $table->string('status')->default('pending'); // pending, sent, failed, skipped
            $table->timestamp('scheduled_for')->nullable();
            $table->timestamp('sent_at')->nullable();
            $table->text('error_message')->nullable();
            $table->json('metadata')->nullable(); // додаткова інформація
            $table->timestamps();
            
            $table->index(['user_id', 'campaign_type']);
            $table->index(['status', 'scheduled_for']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('email_automation_logs');
    }
};
