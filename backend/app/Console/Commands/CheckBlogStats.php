<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\BlogPost;
use App\Models\LocalSeoPage;

class CheckBlogStats extends Command
{
    protected $signature = 'blog:check-stats';
    protected $description = 'Check blog posts and local SEO pages statistics';

    public function handle()
    {
        $this->info('📊 Checking blog statistics...');
        $this->newLine();

        // Blog posts by category and status
        $this->info('=== BLOG POSTS BY CATEGORY ===');
        $blogsByCategory = BlogPost::selectRaw('category, published, COUNT(*) as count')
            ->groupBy('category', 'published')
            ->orderBy('category')
            ->get();

        $totalPublished = 0;
        $totalUnpublished = 0;
        
        foreach ($blogsByCategory->groupBy('category') as $category => $posts) {
            $published = $posts->where('published', true)->first()?->count ?? 0;
            $unpublished = $posts->where('published', false)->first()?->count ?? 0;
            
            $totalPublished += $published;
            $totalUnpublished += $unpublished;
            
            $this->line("  {$category}:");
            $this->line("    ✅ Published: {$published}");
            if ($unpublished > 0) {
                $this->line("    ❌ Unpublished: {$unpublished}");
            }
        }
        
        $this->newLine();
        $this->info("TOTAL BLOG POSTS:");
        $this->line("  ✅ Published: {$totalPublished}");
        $this->line("  ❌ Unpublished: {$totalUnpublished}");
        $this->line("  📝 Total: " . ($totalPublished + $totalUnpublished));

        $this->newLine();
        $this->info('=== LOCAL SEO PAGES ===');
        $localSeoTotal = LocalSeoPage::count();
        $this->line("  📍 Total: {$localSeoTotal}");

        $this->newLine();
        $this->info('=== RECENT UNPUBLISHED POSTS (if any) ===');
        $unpublished = BlogPost::where('published', false)
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get(['id', 'title', 'category', 'created_at']);
        
        if ($unpublished->count() > 0) {
            foreach ($unpublished as $post) {
                $this->line("  ❌ [{$post->id}] {$post->title} ({$post->category}) - {$post->created_at}");
            }
        } else {
            $this->line("  ✅ No unpublished posts");
        }

        $this->newLine();
        $this->info('=== POSTS MISSING published_at ===');
        $missingDate = BlogPost::where('published', true)
            ->whereNull('published_at')
            ->count();
        
        if ($missingDate > 0) {
            $this->warn("  ⚠️  Found {$missingDate} published posts without published_at date!");
            $this->line("  These won't appear in sitemap!");
        } else {
            $this->line("  ✅ All published posts have published_at");
        }

        return 0;
    }
}
