<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('local_seo_pages', function (Blueprint $table) {
            // Add new columns for multi-city support
            $table->string('city')->nullable()->after('district_id');
            $table->unsignedBigInteger('city_district_id')->nullable()->after('city');
            $table->string('service_name')->nullable()->after('service_subcategory');
            $table->integer('views_count')->default(0)->after('conversion_count');
            $table->decimal('conversion_rate', 5, 2)->nullable()->after('views_count');
            
            // Add indexes for better performance
            $table->index('city');
            $table->index('city_district_id');
            $table->index('service_name');
            $table->index(['city', 'service_category']);
            
            // Foreign key to city_districts
            $table->foreign('city_district_id')
                  ->references('id')
                  ->on('city_districts')
                  ->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::table('local_seo_pages', function (Blueprint $table) {
            $table->dropForeign(['city_district_id']);
            $table->dropIndex(['city']);
            $table->dropIndex(['city_district_id']);
            $table->dropIndex(['service_name']);
            $table->dropIndex(['city', 'service_category']);
            $table->dropColumn(['city', 'city_district_id', 'service_name', 'views_count', 'conversion_rate']);
        });
    }
};
