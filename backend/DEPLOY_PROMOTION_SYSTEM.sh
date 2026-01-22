#!/bin/bash

echo "=== Деплой системи ТОП-оголошень ==="
echo ""

# 1. Перевірка чи є composer.lock
echo "1. Оновлюємо залежності..."
composer install --no-dev --optimize-autoloader

# 2. Запускаємо міграції
echo ""
echo "2. Запускаємо міграції..."
php artisan migrate --force

# 3. Запускаємо seeder для створення пакетів
echo ""
echo "3. Створюємо початкові ТОП-пакети..."
php artisan db:seed --class=PromotionPackageSeeder --force

# 4. Очищаємо кеш
echo ""
echo "4. Очищаємо кеш..."
php artisan config:clear
php artisan cache:clear
php artisan route:clear
php artisan view:clear

# 5. Перевірка налаштувань Stripe
echo ""
echo "5. Перевірка Stripe..."
php artisan tinker --execute="echo 'STRIPE_SECRET: ' . (config('services.stripe.secret') ? 'OK' : 'MISSING') . PHP_EOL;"

# 6. Перевірка таблиць
echo ""
echo "6. Перевірка таблиць..."
php artisan tinker --execute="
    echo 'promotion_packages: ' . \DB::table('promotion_packages')->count() . ' records' . PHP_EOL;
    echo 'promotion_purchases: ' . \DB::table('promotion_purchases')->count() . ' records' . PHP_EOL;
"

echo ""
echo "=== Деплой завершено! ==="
echo ""
echo "Тепер перевірте:"
echo "1. https://api.prochepro.fr/api/promotions/packages - має повернути JSON з пакетами"
echo "2. https://api.prochepro.fr/api/tasks - ТОП-оголошення мають бути вгорі"
