<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Spatie\Sitemap\Sitemap;
use Spatie\Sitemap\Tags\Url;
use App\Models\User;
use App\Models\ServiceCategory;
use App\Models\ServiceSubcategory;
use App\Models\BlogPost;
use App\Models\Task;

class GenerateSitemap extends Command
{
    protected $signature = 'sitemap:generate';
    protected $description = 'Генерує sitemap.xml для сайту';

    public function handle()
    {
        $this->info('🚀 Початок генерації sitemap...');

        $baseUrl = 'https://prochepro.fr';
        $sitemap = Sitemap::create();

        $staticPages = [
            ['url' => '/', 'priority' => 1.0, 'frequency' => Url::CHANGE_FREQUENCY_DAILY],
            ['url' => '/about', 'priority' => 0.8, 'frequency' => Url::CHANGE_FREQUENCY_MONTHLY],
            ['url' => '/how-it-works', 'priority' => 0.9, 'frequency' => Url::CHANGE_FREQUENCY_MONTHLY],
            ['url' => '/pricing', 'priority' => 0.9, 'frequency' => Url::CHANGE_FREQUENCY_WEEKLY],
            ['url' => '/contact', 'priority' => 0.7, 'frequency' => Url::CHANGE_FREQUENCY_MONTHLY],
            ['url' => '/faq', 'priority' => 0.7, 'frequency' => Url::CHANGE_FREQUENCY_MONTHLY],
            ['url' => '/testimonials', 'priority' => 0.6, 'frequency' => Url::CHANGE_FREQUENCY_WEEKLY],
            ['url' => '/auth/login', 'priority' => 0.5, 'frequency' => Url::CHANGE_FREQUENCY_MONTHLY],
            ['url' => '/auth/register', 'priority' => 0.5, 'frequency' => Url::CHANGE_FREQUENCY_MONTHLY],
            ['url' => '/privacy', 'priority' => 0.4, 'frequency' => Url::CHANGE_FREQUENCY_YEARLY],
            ['url' => '/terms', 'priority' => 0.4, 'frequency' => Url::CHANGE_FREQUENCY_YEARLY],
        ];

        foreach ($staticPages as $page) {
            $sitemap->add(Url::create($baseUrl . $page['url'])
                ->setLastModificationDate(now())
                ->setChangeFrequency($page['frequency'])
                ->setPriority($page['priority']));
        }

        $this->info('✅ Додано ' . count($staticPages) . ' статичних сторінок');

        // ❌ Categories/Subcategories removed - no corresponding Next.js pages

        $prestatairesCount = 0;
        User::where('is_verified', true)
            ->where('is_blocked', false)
            ->whereJsonContains('roles', 'prestataire')
            ->orWhere('role', 'prestataire')
            ->each(function (User $user) use ($sitemap, $baseUrl, &$prestatairesCount) {
                $sitemap->add(Url::create("{$baseUrl}/prestataires/{$user->id}")
                    ->setLastModificationDate($user->updated_at)
                    ->setChangeFrequency(Url::CHANGE_FREQUENCY_WEEKLY)
                    ->setPriority(0.6));
                $prestatairesCount++;
            });

        $this->info("✅ Додано {$prestatairesCount} профілів виконавців");

        // Tasks disabled - they contain special characters causing XML errors
        // Will re-enable with proper escaping after testing
        // $tasksCount = 0;
        // Task::whereIn('status', ['open', 'in_progress'])
        //     ->each(function (Task $task) use ($sitemap, &$tasksCount) {
        //         $sitemap->add(Url::create("/tasks/{$task->id}")
        //             ->setLastModificationDate($task->updated_at)
        //             ->setChangeFrequency(Url::CHANGE_FREQUENCY_DAILY)
        //             ->setPriority(0.7));
        //         $tasksCount++;
        //     });

        // $this->info("✅ Додано {$tasksCount} активних завдань");

        $blogCount = 0;
        BlogPost::where('published', true)
            ->whereNotNull('published_at')
            ->where('published_at', '<=', now())
            ->each(function (BlogPost $post) use ($sitemap, $baseUrl, &$blogCount) {
                $sitemap->add(Url::create("{$baseUrl}/blog/{$post->slug}")
                    ->setLastModificationDate($post->updated_at)
                    ->setChangeFrequency(Url::CHANGE_FREQUENCY_MONTHLY)
                    ->setPriority(0.6));
                $blogCount++;
            });

        $this->info("✅ Додано {$blogCount} статей блогу");

        $blogCategoriesCount = 0;
        \App\Models\BlogCategory::orderBy('sort_order')
            ->each(function ($category) use ($sitemap, $baseUrl, &$blogCategoriesCount) {
                $sitemap->add(Url::create("{$baseUrl}/blog/categorie/{$category->slug}")
                    ->setLastModificationDate($category->updated_at)
                    ->setChangeFrequency(Url::CHANGE_FREQUENCY_WEEKLY)
                    ->setPriority(0.7));
                $blogCategoriesCount++;
            });

        $this->info("✅ Додано {$blogCategoriesCount} категорій блогу");

        $localSeoCount = 0;
        \App\Models\LocalSeoPage::orderBy('city')
            ->orderBy('updated_at', 'desc')
            ->each(function ($page) use ($sitemap, $baseUrl, &$localSeoCount) {
                $district = \App\Models\CityDistrict::find($page->district_id);
                if ($district) {
                    $sitemap->add(Url::create("{$baseUrl}/zone/{$page->service_category}/{$district->slug}")
                        ->setLastModificationDate($page->updated_at)
                        ->setChangeFrequency(Url::CHANGE_FREQUENCY_WEEKLY)
                        ->setPriority(0.8));
                    $localSeoCount++;
                }
            });

        $this->info("✅ Додано {$localSeoCount} LocalSeo сторінок");

        $sitemap->writeToFile(public_path('sitemap.xml'));

        $this->info('🎉 Sitemap успішно згенеровано: ' . public_path('sitemap.xml'));

        return 0;
    }
}
