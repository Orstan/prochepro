<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('campaigns', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('utm_campaign')->unique();
            $table->string('utm_source')->nullable();
            $table->string('utm_medium')->nullable();
            $table->text('description')->nullable();
            $table->decimal('budget', 10, 2)->nullable();
            $table->timestamp('started_at')->nullable();
            $table->timestamp('ended_at')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('campaign_clicks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('campaign_id')->constrained()->onDelete('cascade');
            $table->foreignId('user_id')->nullable()->constrained()->onDelete('set null');
            $table->string('ip_address', 45)->nullable();
            $table->string('user_agent')->nullable();
            $table->string('referrer')->nullable();
            $table->timestamps();
            
            $table->index(['campaign_id', 'created_at']);
        });

        Schema::create('campaign_conversions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('campaign_id')->constrained()->onDelete('cascade');
            $table->foreignId('user_id')->nullable()->constrained()->onDelete('set null');
            $table->string('conversion_type');
            $table->decimal('conversion_value', 10, 2)->nullable();
            $table->json('conversion_data')->nullable();
            $table->timestamps();
            
            $table->index(['campaign_id', 'conversion_type', 'created_at'], 'campaign_conv_idx');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('campaign_conversions');
        Schema::dropIfExists('campaign_clicks');
        Schema::dropIfExists('campaigns');
    }
};
