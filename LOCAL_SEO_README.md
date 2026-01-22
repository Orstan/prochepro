# 🌍 Гіперлокальні SEO-сторінки для ProchePro

Повна реалізація системи автоматичної генерації локальних SEO-сторінок для максимізації органічного трафіку.

## 📊 Що реалізовано

### Backend

1. **База даних**
   - `popular_services` - топ-50 найпопулярніших послуг
   - `city_districts` - райони 4 міст (Paris, Lyon, Marseille, Toulouse)
   - Оновлена `local_seo_pages` з підтримкою багатьох міст

2. **Моделі Laravel**
   - `PopularService` - управління популярними послугами
   - `CityDistrict` - управління районами міст
   - Оновлена `LocalSeoPage`

3. **Artisan команди**
   - `seo:generate-local-pages` - генерація базових сторінок (Paris)
   - `seo:generate-multi-city` - генерація для всіх міст
   - `seo:generate-sitemap` - створення XML sitemap

4. **API Endpoints**
   - `/api/popular-services` - список популярних послуг
   - `/api/city-districts` - список районів міст
   - `/api/local-pages` - SEO сторінки

5. **AI Генерація контенту**
   - Сервіс `AIContentGenerator` з OpenAI
   - Унікальний контент для кожної сторінки
   - Автоматичні FAQ

### Frontend

Структура сторінок:
- `/services/[service]/[city]` - Послуга + Місто
- `/services/[category]/[district]` - Категорія + Район

---

## 🚀 Інструкція по запуску

### Крок 1: Міграції БД

```bash
cd backend

# Запустити міграції
php artisan migrate

# Заповнити дані
php artisan db:seed --class=PopularServicesSeeder
php artisan db:seed --class=CityDistrictsSeeder
```

### Крок 2: Генерація базових сторінок (ТОП-20 послуг × 20 районів Парижа)

```bash
# Генерувати 400 базових сторінок
php artisan seo:generate-local-pages --limit=20

# Або з AI контентом (потрібен OpenAI API key)
php artisan seo:generate-local-pages --limit=20 --ai
```

**Очікуваний результат:** 400 сторінок створено

### Крок 3: Генерація для всіх міст (2400+ сторінок)

```bash
# Генерувати для всіх міст
php artisan seo:generate-multi-city --limit=20

# Тільки для конкретного міста
php artisan seo:generate-multi-city --city=Lyon --limit=15

# З примусовим оновленням існуючих
php artisan seo:generate-multi-city --force --ai
```

**Очікуваний результат:** 
- Paris: 20 послуг × 20 районів = 400 сторінок
- Lyon: 20 послуг × 9 районів = 180 сторінок
- Marseille: 20 послуг × 16 районів = 320 сторінок
- Toulouse: 20 послуг × 10 районів = 200 сторінок
- **ВСЬОГО: ~1,100 сторінок**

### Крок 4: Генерація Sitemap

```bash
# Створити XML sitemap
php artisan seo:generate-sitemap

# Вказати інший шлях
php artisan seo:generate-sitemap --output=public/sitemap-local.xml
```

Sitemap буде доступний за адресою: `https://prochepro.fr/sitemap-local.xml`

---

## ✅ ЩО ДАЛІ ПІСЛЯ ГЕНЕРАЦІЇ 1,100 СТОРІНОК

### Крок 5: Створити XML Sitemap

```bash
cd /var/www/prochepro.fr/backend

# Згенерувати sitemap з усіма 1100 сторінками
php artisan seo:generate-sitemap --output=../frontend/public/sitemap-local.xml

# Перевірити створення
ls -lh ../frontend/public/sitemap-local.xml
```

**Очікуваний результат:** Файл ~300-400 KB з 1,100 URLs

### Крок 6: Налаштувати robots.txt

Додайте у `frontend/public/robots.txt`:

```txt
# Sitemap для локальних SEO-сторінок
Sitemap: https://prochepro.fr/sitemap-local.xml
Sitemap: https://prochepro.fr/sitemap.xml

User-agent: *
Allow: /services/
Crawl-delay: 1
```

### Крок 7: Перевірити роботу сторінок

Відкрийте у браузері декілька згенерованих сторінок:

```
https://prochepro.fr/services/plombier/paris-15eme
https://prochepro.fr/services/electricien/lyon-3eme
https://prochepro.fr/services/menage/marseille-8eme
https://prochepro.fr/services/jardinier/toulouse-capitole
```

**Перевірте:**
- ✅ Сторінка відкривається (не 404)
- ✅ Title та meta description правильні
- ✅ Контент відображається
- ✅ FAQ секція присутня
- ✅ CTA кнопки працюють

### Крок 8: Google Search Console

1. **Відправити sitemap:**
   - Перейти: https://search.google.com/search-console
   - Виберіть властивість `prochepro.fr`
   - Sitemaps → Add new sitemap
   - Введіть: `sitemap-local.xml`
   - Submit

2. **Запросити індексацію:**
   - URL Inspection → перевірте 5-10 сторінок
   - Request Indexing для кожної

3. **Моніторинг:**
   - Coverage → перевіряйте щотижня
   - Performance → відстежуйте зростання трафіку

### Крок 9: Налаштувати аналітику

**Google Analytics 4:**
```javascript
// Додайте події для відстеження конверсій
gtag('event', 'local_page_view', {
  'city': 'Paris',
  'district': '15eme',
  'service': 'plombier'
});

gtag('event', 'local_conversion', {
  'city': 'Paris',
  'district': '15eme',
  'service': 'plombier',
  'value': 1
});
```

**Відстеження в БД:**
```bash
# Перевірити статистику
php artisan tinker

# Виконати:
DB::table('local_seo_pages')
  ->select('city', DB::raw('count(*) as pages'))
  ->groupBy('city')
  ->get();

DB::table('local_seo_pages')
  ->select(DB::raw('SUM(view_count) as total_views, SUM(conversion_count) as total_conversions'))
  ->first();

exit
```

### Крок 10: Розширення (опційно)

**Додати більше послуг (до 2,750 сторінок):**

```bash
# Згенерувати ТОП-50 послуг
php artisan seo:generate-multi-city --limit=50

# Це створить:
# 50 послуг × 55 районів = 2,750 сторінок
```

**Додати нові міста:**

1. Відредагуйте `CityDistrictsSeeder.php`
2. Додайте райони Bordeaux, Nice, Nantes
3. Запустіть:
```bash
php artisan db:seed --class=CityDistrictsSeeder
php artisan seo:generate-multi-city --city=Bordeaux --limit=20
```

---

## 🎯 Розширення до 2400+ сторінок

### Додати більше послуг

Відредагуйте `PopularServicesSeeder.php` і додайте нові послуги:

```php
[
    'slug' => 'votre-service',
    'name' => 'Service Name',
    'name_fr' => 'Nom du Service',
    'category' => 'category_key',
    'subcategory' => 'subcategory_key',
    'description_fr' => 'Description...',
    'price_range' => '50€ - 150€',
    'search_volume' => 2000,
]
```

Потім:
```bash
php artisan db:seed --class=PopularServicesSeeder
php artisan seo:generate-multi-city --limit=50
```

### Додати інші міста

Відредагуйте `CityDistrictsSeeder.php` і додайте райони нового міста:

```php
private function getBordeauxDistricts(): array
{
    return [
        ['city' => 'Bordeaux', 'code' => '33BOR01', ...],
        // ...
    ];
}
```

---

## 🤖 AI Генерація контенту

### Налаштування OpenAI

1. Отримайте API ключ: https://platform.openai.com/api-keys

2. Додайте у `.env`:
```env
OPENAI_API_KEY=sk-...
```

3. Оновіть `config/services.php`:
```php
'openai' => [
    'api_key' => env('OPENAI_API_KEY'),
],
```

### Використання

```bash
# Генерувати з AI контентом
php artisan seo:generate-multi-city --ai --limit=10

# Оновити існуючі сторінки AI контентом
php artisan seo:generate-multi-city --force --ai
```

**Переваги AI:**
- Унікальний текст для кожної сторінки
- Згадування локальних особливостей
- SEO-оптимізований контент
- Автоматичні FAQ

**Вартість:** ~$0.01-0.02 на сторінку (GPT-4)

---

## 📈 Моніторинг та Аналітика

### Переглянути статистику

```bash
# API endpoint
GET /api/local-pages/statistics
```

Відповідь:
```json
{
  "total_pages": 1100,
  "total_views": 45230,
  "total_conversions": 892,
  "top_performing_pages": [...],
  "pages_by_city": {...}
}
```

### Відстеження конверсій

Кожна сторінка автоматично відстежує:
- Кількість переглядів
- Кількість конверсій (натискання "Demander un devis")
- Conversion rate

---

## 🔧 Технічні деталі

### Структура URL

```
Paris:
/services/plombier/paris-15eme
/services/electricien/paris-11eme
/services/montage-meuble-ikea/paris-13eme

Lyon:
/services/plombier/lyon-3eme
/services/jardinier/lyon-6eme

Marseille:
/services/electricien/marseille-8eme
```

### SEO Оптимізація

Кожна сторінка містить:
- ✅ Унікальний `<title>` та `meta description`
- ✅ Structured data (Schema.org)
- ✅ FAQ з structured data
- ✅ Breadcrumbs
- ✅ H1, H2, H3 заголовки
- ✅ Локальні ключові слова
- ✅ Internal linking

### Приклад generated title:

```
Plombier Paris 15ème - Devis Gratuit | ProchePro
```

### Приклад meta description:

```
Trouvez un Plombier à Paris 15ème. Services de plomberie générale 
✓ Devis gratuits ✓ Professionnels vérifiés ✓ Avis clients.
```

---

## 📋 Чеклист розгортання

- [ ] Запустити міграції БД
- [ ] Заповнити seeders
- [ ] Згенерувати базові 400 сторінок (Paris)
- [ ] Перевірити 5-10 сторінок вручну
- [ ] Налаштувати OpenAI (опційно)
- [ ] Згенерувати для всіх міст (~1100 сторінок)
- [ ] Створити sitemap
- [ ] Додати sitemap у robots.txt
- [ ] Відправити sitemap у Google Search Console
- [ ] Налаштувати моніторинг конверсій
- [ ] Розширити до 50 послуг (2400+ сторінок)

---

## 🎯 Очікувані результати

### Короткострокові (1-3 місяці):
- +500-800 нових органічних відвідувачів/місяць
- +50-100 нових заявок з SEO
- Індексація 80%+ сторінок в Google

### Середньострокові (3-6 місяців):
- +2000-3000 органічних відвідувачів/місяць
- +200-300 нових заявок з SEO
- ТОП-3 по гіперлокальних запитах

### Довгострокові (6-12 місяців):
- +5000-8000 органічних відвідувачів/місяць
- +500-800 нових заявок з SEO
- Домінування в локальному пошуку

**ROI:** 200-300% порівняно з платною рекламою

---

## 🆘 Troubleshooting

### Помилка: "Table 'popular_services' doesn't exist"
```bash
php artisan migrate
php artisan db:seed --class=PopularServicesSeeder
```

### Помилка: "OpenAI API key not found"
Додайте `OPENAI_API_KEY` у `.env`

### Генерація зависає
Використайте `--limit` для меншої кількості:
```bash
php artisan seo:generate-multi-city --limit=5
```

### Дублікати сторінок
```bash
# Видалити всі і регенерувати
php artisan tinker
LocalSeoPage::truncate();
exit
php artisan seo:generate-multi-city
```

---

## 📞 Підтримка

Для питань або проблем:
- Email: support@prochepro.fr
- GitHub Issues: створити issue

---

**Створено:** Січень 2026  
**Версія:** 1.0.0  
**Автор:** ProchePro Dev Team
