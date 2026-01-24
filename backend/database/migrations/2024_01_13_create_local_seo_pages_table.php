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
        Schema::create('local_seo_pages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('district_id')->constrained('paris_districts')->onDelete('cascade');
            $table->string('service_category')->nullable();
            $table->string('service_subcategory')->nullable();
            $table->string('slug')->unique();
            $table->string('title');
            $table->string('title_fr');
            $table->string('meta_title')->nullable();
            $table->string('meta_description')->nullable();
            $table->text('content');
            $table->text('content_fr');
            $table->boolean('is_published')->default(true);
            $table->integer('view_count')->default(0);
            $table->integer('conversion_count')->default(0);
            $table->json('faq_content')->nullable();
            $table->string('image_path')->nullable();
            $table->timestamps();
            
            // Create composite index for faster lookups
            $table->index(['district_id', 'service_category', 'service_subcategory'], 'lsp_dist_cat_subcat_idx');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('local_seo_pages');
    }
};
