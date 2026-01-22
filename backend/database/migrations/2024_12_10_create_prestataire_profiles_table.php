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
        // Add portfolio fields to users table
        Schema::table('users', function (Blueprint $table) {
            $table->text('bio')->nullable()->after('avatar');
            $table->string('phone')->nullable()->after('bio');
            $table->string('website')->nullable()->after('phone');
            $table->json('skills')->nullable()->after('website');
            $table->string('experience_years')->nullable()->after('skills');
            $table->json('service_areas')->nullable()->after('experience_years');
            $table->json('certifications')->nullable()->after('service_areas');
            $table->boolean('is_verified')->default(false)->after('certifications');
            $table->decimal('hourly_rate', 10, 2)->nullable()->after('is_verified');
            $table->string('company_name')->nullable()->after('hourly_rate');
            $table->string('siret')->nullable()->after('company_name');
        });

        // Create portfolio_items table for work examples
        Schema::create('portfolio_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('title');
            $table->text('description')->nullable();
            $table->string('category')->nullable();
            $table->json('images')->nullable();
            $table->string('location')->nullable();
            $table->date('completed_at')->nullable();
            $table->decimal('budget', 10, 2)->nullable();
            $table->integer('duration_days')->nullable();
            $table->boolean('is_featured')->default(false);
            $table->integer('sort_order')->default(0);
            $table->timestamps();
            
            $table->index(['user_id', 'is_featured']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('portfolio_items');
        
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'bio',
                'phone',
                'website',
                'skills',
                'experience_years',
                'service_areas',
                'certifications',
                'is_verified',
                'hourly_rate',
                'company_name',
                'siret',
            ]);
        });
    }
};
