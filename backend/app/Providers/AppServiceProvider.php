<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Gate;
use Illuminate\Http\Request;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        RateLimiter::for('auth', function (Request $request) {
            return Limit::perMinute(10)->by($request->ip());
        });

        RateLimiter::for('contact', function (Request $request) {
            return Limit::perMinute(3)->by($request->ip());
        });

        RateLimiter::for('api', function (Request $request) {
            return Limit::perMinute(60)->by($request->ip());
        });

        // Email Automation Event Listeners
        Event::listen(
            \Illuminate\Auth\Events\Registered::class,
            \App\Listeners\ScheduleWelcomeSeriesListener::class,
        );

        Event::listen(
            \App\Events\TaskCreated::class,
            \App\Listeners\ScheduleTaskReminderListener::class,
        );

        Event::listen(
            \App\Events\OfferCreated::class,
            \App\Listeners\CancelTaskReminderListener::class,
        );

        // Register policies
        Gate::policy(\App\Models\SupportChatRoom::class, \App\Policies\SupportChatRoomPolicy::class);
    }
}
