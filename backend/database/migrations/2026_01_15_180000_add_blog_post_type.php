<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('blog_posts', function (Blueprint $table) {
            $table->enum('type', ['article', 'guide', 'local-seo', 'case-study'])->default('article')->after('category');
            $table->string('location')->nullable()->after('type'); // For local SEO articles
            $table->integer('views')->default(0)->after('reading_time');
        });

        // Create blog categories if not exist
        $categories = [
            ['name' => 'Guides Prix', 'slug' => 'guides-prix', 'icon' => '💰'],
            ['name' => 'SEO Local', 'slug' => 'local-seo', 'icon' => '📍'],
            ['name' => 'Success Stories', 'slug' => 'success-stories', 'icon' => '⭐'],
            ['name' => 'Conseils', 'slug' => 'conseils', 'icon' => '💡'],
            ['name' => 'Actualités', 'slug' => 'actualites', 'icon' => '📰'],
        ];

        foreach ($categories as $category) {
            \DB::table('blog_categories')->updateOrInsert(
                ['slug' => $category['slug']],
                array_merge($category, ['created_at' => now(), 'updated_at' => now()])
            );
        }
    }

    public function down(): void
    {
        Schema::table('blog_posts', function (Blueprint $table) {
            $table->dropColumn(['type', 'location', 'views']);
        });
    }
};
