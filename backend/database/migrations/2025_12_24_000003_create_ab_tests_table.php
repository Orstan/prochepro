<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ab_tests', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('key')->unique();
            $table->text('description')->nullable();
            $table->json('variants');
            $table->boolean('is_active')->default(true);
            $table->timestamp('started_at')->nullable();
            $table->timestamp('ended_at')->nullable();
            $table->timestamps();
        });

        Schema::create('ab_test_assignments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('ab_test_id')->constrained()->onDelete('cascade');
            $table->foreignId('user_id')->nullable()->constrained()->onDelete('cascade');
            $table->string('session_id')->nullable();
            $table->string('variant');
            $table->timestamps();
            
            $table->index(['ab_test_id', 'user_id']);
            $table->index(['ab_test_id', 'session_id']);
        });

        Schema::create('ab_test_conversions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('ab_test_id')->constrained()->onDelete('cascade');
            $table->foreignId('assignment_id')->constrained('ab_test_assignments')->onDelete('cascade');
            $table->string('conversion_type');
            $table->json('conversion_data')->nullable();
            $table->timestamps();
            
            $table->index(['ab_test_id', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ab_test_conversions');
        Schema::dropIfExists('ab_test_assignments');
        Schema::dropIfExists('ab_tests');
    }
};
