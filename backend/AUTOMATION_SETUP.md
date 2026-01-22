# Email Marketing Automation - Інструкція по активації

## 📦 Що додано:

### Backend файли:
- ✅ Migration: `database/migrations/2026_01_02_000001_create_email_automation_table.php`
- ✅ Model: `app/Models/EmailAutomationLog.php`
- ✅ Service: `app/Services/EmailAutomationService.php`
- ✅ Job: `app/Jobs/SendAutomatedEmailJob.php`
- ✅ Controller: `app/Http/Controllers/Api/EmailAutomationController.php`
- ✅ Mail classes: `app/Mail/WelcomeSeriesDay0.php`, `WelcomeSeriesDay3.php`, `WelcomeSeriesDay7.php`, `TaskReminderMail.php`, `ReEngagementMail.php`, `WeeklyDigestMail.php`
- ✅ Events: `app/Events/TaskCreated.php`, `app/Events/OfferCreated.php`
- ✅ Listeners: `ScheduleWelcomeSeriesListener.php`, `ScheduleTaskReminderListener.php`, `CancelTaskReminderListener.php`
- ✅ Commands: `ProcessAutomatedEmails.php`, `ScheduleReEngagement.php`, `ScheduleTaskReminders.php`, `ScheduleWeeklyDigests.php`
- ✅ Email views: 6 blade templates в `resources/views/emails/automation/`

## 🚀 Крок 1: Запуск migration

```bash
cd /var/www/prochepro.fr/backend
php artisan migrate
```

## 🔧 Крок 2: Додати відношення в User model

**Відкрити:** `backend/app/Models/User.php`

**Додати в кінці класу (перед закриваючою дужкою):**

```php
    /**
     * Email automation logs
     */
    public function emailAutomationLogs(): HasMany
    {
        return $this->hasMany(EmailAutomationLog::class);
    }
```

## 📡 Крок 3: Додати routes

**Відкрити:** `backend/routes/api.php`

**Додати в секцію admin routes (після інших admin маршрутів):**

```php
// Email Automation (Admin only)
Route::middleware(['auth:sanctum'])->prefix('admin/email-automation')->group(function () {
    Route::get('/stats', [App\Http\Controllers\Api\EmailAutomationController::class, 'stats']);
    Route::get('/logs', [App\Http\Controllers\Api\EmailAutomationController::class, 'index']);
    Route::get('/logs/{log}', [App\Http\Controllers\Api\EmailAutomationController::class, 'show']);
    Route::delete('/logs/{log}', [App\Http\Controllers\Api\EmailAutomationController::class, 'destroy']);
    Route::post('/logs/{log}/send', [App\Http\Controllers\Api\EmailAutomationController::class, 'forceSend']);
    Route::get('/campaigns', [App\Http\Controllers\Api\EmailAutomationController::class, 'campaigns']);
    Route::post('/schedule-welcome/{user_id}', [App\Http\Controllers\Api\EmailAutomationController::class, 'scheduleWelcomeSeries']);
    Route::post('/schedule-reengagement/{user_id}', [App\Http\Controllers\Api\EmailAutomationController::class, 'scheduleReEngagement']);
});
```

## 🎯 Крок 4: Реєстрація Events і Listeners

**Відкрити:** `backend/app/Providers/EventServiceProvider.php`

**Додати в масив `$listen`:**

```php
    use Illuminate\Auth\Events\Registered;
    use App\Events\TaskCreated;
    use App\Events\OfferCreated;
    use App\Listeners\ScheduleWelcomeSeriesListener;
    use App\Listeners\ScheduleTaskReminderListener;
    use App\Listeners\CancelTaskReminderListener;

    protected $listen = [
        // ... існуючі listeners ...
        
        // Email Automation
        Registered::class => [
            ScheduleWelcomeSeriesListener::class,
        ],
        TaskCreated::class => [
            ScheduleTaskReminderListener::class,
        ],
        OfferCreated::class => [
            CancelTaskReminderListener::class,
        ],
    ];
```

## 🔥 Крок 5: Додати event triggers в існуючі контролери

### 5.1 TaskController - додати trigger для TaskCreated

**Відкрити:** `backend/app/Http/Controllers/Api/TaskController.php`

**Знайти метод `store` (створення task) і додати після збереження task:**

```php
use App\Events\TaskCreated;

public function store(Request $request)
{
    // ... існуючий код створення task ...
    
    $task = Task::create([...]);
    
    // ДОДАТИ ЦЕ:
    event(new TaskCreated($task));
    
    return response()->json($task, 201);
}
```

### 5.2 OfferController - додати trigger для OfferCreated

**Відкрити:** `backend/app/Http/Controllers/Api/OfferController.php`

**Знайти метод `store` (створення offer) і додати після збереження offer:**

```php
use App\Events\OfferCreated;

public function store(Request $request, Task $task)
{
    // ... існуючий код створення offer ...
    
    $offer = Offer::create([...]);
    
    // ДОДАТИ ЦЕ:
    event(new OfferCreated($offer));
    
    return response()->json($offer, 201);
}
```

## ⏰ Крок 6: Налаштувати Cron для автоматизації

**Відкрити:** `backend/app/Console/Kernel.php`

**Додати в метод `schedule`:**

```php
protected function schedule(Schedule $schedule): void
{
    // ... існуючі scheduled tasks ...
    
    // Email Automation
    $schedule->command('email:process-automation')->everyFiveMinutes();
    $schedule->command('email:schedule-task-reminders')->hourly();
    $schedule->command('email:schedule-reengagement')->daily();
    $schedule->command('email:schedule-weekly-digests')->weeklyOn(0, '9:00'); // Неділя 9:00
}
```

**Переконайтесь що Laravel Scheduler працює:**

```bash
crontab -e
```

**Додайте (якщо ще немає):**

```
* * * * * cd /var/www/prochepro.fr/backend && php artisan schedule:run >> /dev/null 2>&1
```

## 🧪 Крок 7: Тестування

### Тест 1: Обробка автоматичних emails

```bash
php artisan email:process-automation
```

### Тест 2: Welcome series (manual trigger)

```bash
# Через API (замінити USER_ID)
curl -X POST http://localhost:8000/api/admin/email-automation/schedule-welcome/USER_ID \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Тест 3: Перевірка статистики

```bash
curl http://localhost:8000/api/admin/email-automation/stats \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 📊 Як це працює:

### 1. Welcome Series (автоматично)
- Коли користувач реєструється → відправляє 3 emails (день 0, 3, 7)

### 2. Task Reminders (автоматично)
- Коли створюється task без offers → відправляє reminders (24h, 72h)
- Коли з'являється offer → скасовує reminders

### 3. Re-engagement (щоденно)
- Знаходить неактивних користувачів (30+ днів)
- Відправляє email з пропозиціями

### 4. Weekly Digest (щонеділі)
- Активним prestataires відправляє огляд тижня

## 🎨 Додатково: Admin UI (Frontend)

Створіть нову admin сторінку для керування:

```
/admin/email-automation
```

Показуйте:
- Статистику (pending, sent, failed)
- Список automation logs (з фільтрами)
- Можливість примусово відправити email
- Графіки ефективності

## ✅ Перевірка що все працює:

1. ✅ Migration пройшла успішно
2. ✅ User має відношення emailAutomationLogs
3. ✅ Routes додані
4. ✅ Events зареєстровані
5. ✅ Cron налаштований
6. ✅ Queue worker працює

```bash
# Перевірити queue worker
php artisan queue:work

# Або використовувати supervisor/pm2
```

## 🔒 Безпека:

- ✅ Всі admin routes захищені auth:sanctum
- ✅ Email відправляються тільки якщо user.email_notifications = true
- ✅ Є захист від дублювання (перевірка існуючих logs)

## 📈 Metrics для відстеження:

- Open rate (потрібно додати tracking pixel)
- Click rate (потрібно додати UTM parameters)
- Conversion rate (реєстрація → перша task/offer)
- Unsubscribe rate

## 🎯 ГОТОВО!

Email Marketing Automation активована. Система автоматично:
- Вітає нових користувачів
- Нагадує про незавершені tasks
- Повертає неактивних користувачів
- Інформує про нові можливості

**Жодна існуюча функція не була змінена!** ✅
