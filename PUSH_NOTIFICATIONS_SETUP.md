# 🔔 Push Notifications - Інструкція з налаштування

## ✅ Що вже налаштовано:

### Backend:
1. ✅ `WebPushService` - сервіс для відправки push
2. ✅ `PushController` - API endpoints для підписки
3. ✅ `MessageController` - відправляє push при новому повідомленні
4. ✅ Database migrations для `push_subscriptions`
5. ✅ VAPID ключі конфігурація

### Frontend:
1. ✅ Service Worker (`/public/sw.js`) з обробкою push
2. ✅ PWA manifest (`/public/site.webmanifest`)
3. ✅ Auto-subscription в `layout.tsx`
4. ✅ `InAppNotifications` компонент для показу сповіщень в додатку
5. ✅ Звук сповіщень (`/sounds/notification.mp3`)

---

## 🚀 Налаштування на сервері (ОБОВ'ЯЗКОВО):

### 1. Генеруємо VAPID ключі:

```bash
cd /var/www/prochepro.fr/backend
php artisan vapid:generate
```

**Скопіюй згенеровані ключі в `.env`:**

```env
VAPID_PUBLIC_KEY=BNdJ...ваш_публічний_ключ
VAPID_PRIVATE_KEY=...ваш_приватний_ключ
VAPID_SUBJECT=mailto:contact@prochepro.fr
```

### 2. Встановлюємо бібліотеку web-push:

```bash
cd /var/www/prochepro.fr/backend
composer require minishlink/web-push
```

### 3. Завантажуємо оновлені файли на сервер:

**Backend:**
```
backend/app/Http/Controllers/Api/MessageController.php
backend/app/Services/WebPushService.php
backend/app/Http/Controllers/Api/PushController.php
backend/config/services.php
```

**Frontend:**
```
frontend/public/sw.js
frontend/src/app/layout.tsx
frontend/src/components/notifications/InAppNotifications.tsx
```

### 4. Перезапускаємо backend:

```bash
cd /var/www/prochepro.fr/backend
php artisan config:clear
php artisan cache:clear
```

### 5. Перебудовуємо frontend:

```bash
cd /var/www/prochepro.fr/frontend
npm run build
pm2 restart prochepro-frontend
```

---

## 📱 Як працюють сповіщення:

### 1. **Browser/Desktop Push** (Браузер на комп'ютері):
- Користувач заходить на сайт → автоматично запитується дозвіл на сповіщення
- При новому повідомленні → системне сповіщення Windows/Mac
- Працює навіть коли вкладка закрита (якщо браузер відкритий)

### 2. **Mobile Push** (Мобільний телефон):
- Android/iOS Chrome → нативні push сповіщення
- Працюють на заблокованому екрані
- З'являються як звичайні сповіщення додатків

### 3. **PWA Push** (Встановлений додаток):
- Якщо користувач встановив PWA → сповіщення як в нативному додатку
- З'являються на заблокованому екрані
- Можна клікнути → відкриється потрібна сторінка

### 4. **In-App Notifications** (В додатку):
- Коли користувач на сайті → спливаюче сповіщення в правому верхньому куті
- Зі звуком
- Auto-hide через 5 секунд

---

## 🎯 Події, які відправляють push:

### Вже працюють:
- ✅ **Нове повідомлення** в чаті task

### Готові до використання (потрібно увімкнути):
- 📧 Нова пропозиція (offer)
- ⭐ Відгук/рейтинг
- 🎯 Нове завдання в районі користувача
- 💳 Оплата/баланс
- 🎁 Промо/акції

---

## 🧪 Тестування:

### 1. Перевірити підписку:

**На frontend в консолі браузера:**
```javascript
// Перевірити Service Worker
navigator.serviceWorker.getRegistration().then(reg => console.log(reg))

// Перевірити підписку
navigator.serviceWorker.ready.then(reg => 
  reg.pushManager.getSubscription().then(sub => console.log(sub))
)
```

### 2. Відправити тестове сповіщення:

**API запит:**
```bash
curl -X POST https://api.prochepro.fr/api/push/test \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"user_id": 1}'
```

Або через frontend:
```javascript
const token = localStorage.getItem('prochepro_token');
fetch('https://api.prochepro.fr/api/push/test', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ user_id: USER_ID })
})
```

---

## 🔧 API Endpoints:

### Push Subscription:
- `GET /api/push/vapid-key` - Отримати публічний VAPID ключ
- `POST /api/push/subscribe` - Підписатися на push
- `POST /api/push/unsubscribe` - Відписатися
- `GET /api/push/subscriptions` - Список підписок користувача
- `POST /api/push/test` - Відправити тестове сповіщення

### Notifications:
- `GET /api/notifications` - Список сповіщень
- `POST /api/notifications/{id}/read` - Позначити як прочитане
- `POST /api/notifications/read-all` - Позначити всі як прочитані

---

## ⚙️ Налаштування в коді:

### Додати push для інших подій:

**Приклад: Нова пропозиція (Offer)**

```php
// В OfferController.php
use App\Services\WebPushService;

public function store(Request $request, WebPushService $webPush)
{
    // ... створюємо offer
    
    // Відправляємо push клієнту
    try {
        $webPush->notifyNewOffer(
            $task->client,
            $prestataire->name,
            $task->title
        );
    } catch (\Throwable $e) {
        \Log::error('Push notification failed', ['error' => $e->getMessage()]);
    }
}
```

### Додати custom сповіщення:

```php
use App\Services\WebPushService;

$webPush = app(WebPushService::class);
$webPush->sendToUser(
    $user,
    'Заголовок сповіщення 🎉',
    'Текст повідомлення',
    '/url-to-redirect',  // Опціонально
    'unique-tag'          // Опціонально
);
```

---

## 🐛 Troubleshooting:

### Push не приходять:

1. **Перевірити VAPID ключі в `.env`**
2. **Перевірити чи встановлена бібліотека:**
   ```bash
   composer show minishlink/web-push
   ```
3. **Перевірити Laravel logs:**
   ```bash
   tail -f /var/www/prochepro.fr/backend/storage/logs/laravel.log
   ```
4. **Перевірити browser console** на помилки

### Сповіщення не показуються на телефоні:

1. **Переконатися що дозвіл надано** в налаштуваннях браузера
2. **iOS Safari** - потрібно додати сайт на головний екран (PWA)
3. **Android** - має працювати відразу в Chrome

### Sound не грає:

1. Перевірити файл `/public/sounds/notification.mp3` існує
2. Browser може блокувати звук до першої user interaction

---

## 📊 Моніторинг:

### Логи push сповіщень:

```bash
# Backend logs
tail -f /var/www/prochepro.fr/backend/storage/logs/laravel.log | grep -i "push"

# Перевірити кількість підписок
mysql -u root -p prochepro_db -e "SELECT COUNT(*) FROM push_subscriptions"

# Перевірити підписки користувача
mysql -u root -p prochepro_db -e "SELECT * FROM push_subscriptions WHERE user_id = 1"
```

---

## ✅ Чекліст після deployment:

- [ ] VAPID ключі згенеровані і додані в `.env`
- [ ] `minishlink/web-push` встановлена
- [ ] Backend файли завантажені
- [ ] Frontend перебудований
- [ ] PM2 перезапущено
- [ ] Тестове сповіщення відправлене і отримане
- [ ] Перевірено на мобільному пристрої
- [ ] Перевірено на desktop
- [ ] Sound працює
- [ ] In-app notifications показуються

---

🎉 **Система сповіщень повністю налаштована!**
