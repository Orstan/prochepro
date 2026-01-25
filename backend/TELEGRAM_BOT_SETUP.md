# 🤖 TELEGRAM BOT SETUP - ProchePro.fr

**Дата:** 25 січня 2026  
**Версія:** 1.0  
**Статус:** Ready for Production

---

## 📋 ОГЛЯД

Telegram Bot для ProchePro.fr надає користувачам можливість:
- Отримувати сповіщення про нові повідомлення, офери, відгуки
- Переглядати статистику через команди бота
- Перевіряти профіль та активні задачі
- Швидкий доступ до платформи

---

## 🎯 ДОСТУПНІ КОМАНДИ

### Основні команди:

1. **`/start`** - Початкове привітання, інформація про бота
2. **`/stats`** - Детальна статистика користувача:
   - Кількість задач (відкриті, в процесі, завершені)
   - Кількість оферів (очікують, прийняті)
   - Непрочитані повідомлення
   - Дохід (сьогодні та загальний)
   - Рівень та XP (gamification)
   - Середня оцінка

3. **`/profile`** - Інформація про профіль:
   - Ім'я, email, телефон
   - Місто, роль
   - Категорії послуг (для виконавців)
   - Статус верифікації
   - Статистика (задачі, відгуки, рейтинг)

4. **`/tasks`** - Активні задачі:
   - Задачі де користувач клієнт (відкриті, в процесі)
   - Задачі де користувач виконавець (прийняті офери)
   - Кількість оферів на кожну задачу
   - Непрочитані повідомлення по задачах
   - Прямі посилання на задачі

5. **`/help`** - Довідка по командах

---

## 🔧 НАЛАШТУВАННЯ WEBHOOK

### Крок 1: Отримати Bot Token

1. Відкрий [@BotFather](https://t.me/BotFather) в Telegram
2. Надішли `/newbot` або використай існуючого бота
3. Скопіюй Bot Token (формат: `123456789:ABCdefGHIjklMNOpqrsTUVwxyz`)

### Крок 2: Додати Token в .env

```env
TELEGRAM_BOT_TOKEN=your_bot_token_here
```

### Крок 3: Налаштувати config

Файл `config/services.php`:
```php
'telegram' => [
    'bot_token' => env('TELEGRAM_BOT_TOKEN'),
],
```

### Крок 4: Встановити Webhook

Виконай команду (замість `YOUR_BOT_TOKEN` та `YOUR_DOMAIN`):

```bash
curl -X POST "https://api.telegram.org/botYOUR_BOT_TOKEN/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://YOUR_DOMAIN/api/telegram/webhook",
    "allowed_updates": ["message"],
    "drop_pending_updates": true
  }'
```

**Для ProchePro.fr:**
```bash
curl -X POST "https://api.telegram.org/bot123456789:ABCdefGHIjklMNOpqrsTUVwxyz/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://api.prochepro.fr/api/telegram/webhook",
    "allowed_updates": ["message"],
    "drop_pending_updates": true
  }'
```

### Крок 5: Перевірити Webhook

```bash
curl "https://api.telegram.org/botYOUR_BOT_TOKEN/getWebhookInfo"
```

**Очікуваний response:**
```json
{
  "ok": true,
  "result": {
    "url": "https://api.prochepro.fr/api/telegram/webhook",
    "has_custom_certificate": false,
    "pending_update_count": 0,
    "last_error_date": 0,
    "max_connections": 40,
    "allowed_updates": ["message"]
  }
}
```

---

## 👤 ПІДКЛЮЧЕННЯ КОРИСТУВАЧА

### Спосіб 1: Через Frontend (рекомендований)

1. Користувач йде в Налаштування → Messenger
2. Натискає "Підключити Telegram"
3. Отримує унікальне посилання: `https://t.me/ProchePro_bot?start=UNIQUE_CODE`
4. Переходить в Telegram, натискає START
5. Bot автоматично зв'язує chat_id з аккаунтом

### Спосіб 2: Пряме підключення через API

```bash
POST /api/messenger/telegram/connect-direct
{
  "user_id": 1,
  "telegram_chat_id": "123456789",
  "telegram_username": "johndoe"
}
```

### База даних

Таблиця `messenger_settings`:
```sql
CREATE TABLE messenger_settings (
  id BIGINT,
  user_id BIGINT,
  telegram_chat_id VARCHAR(255),
  telegram_username VARCHAR(255),
  telegram_enabled BOOLEAN DEFAULT TRUE,
  -- ...
);
```

---

## 📊 ПРИКЛАДИ ВІДПОВІДЕЙ БОТА

### `/stats`
```
📊 Vos Statistiques

📋 Tâches:
  • Ouvertes: 3
  • En cours: 1
  • Terminées: 15

💼 Offres:
  • En attente: 2
  • Acceptées: 5

💰 Revenus:
  • Aujourd'hui: 150.00 €
  • Total: 2,450.00 €

✉️ Messages:
  • Non lus: 5

🎯 Niveau: 8
⭐ XP: 1250
⭐ Note: ⭐⭐⭐⭐⭐ (4.8/5)

🔗 Voir plus (link)
```

### `/profile`
```
👤 Votre Profil

📛 Nom: Jean Dupont
📧 Email: jean@example.com
📱 Téléphone: +33 6 12 34 56 78
📍 Ville: Paris
👔 Rôle: Prestataire

🔧 Services:
  • Plomberie
  • Électricité
  • Rénovation

✅ Compte vérifié

📊 Tâches terminées: 15
⭐ Avis reçus: 12
⭐ Note moyenne: 4.8/5

🔗 Voir profil complet (link)
```

### `/tasks`
```
📋 Vos Tâches Actives

👤 Vos demandes:

🔵 Réparation fuite d'eau
   Status: Ouverte
   Budget: 150 €
   💼 3 offre(s)
   🔗 Voir (link)

💼 Vos missions:

🟢 Installation électrique
   Client: Marie Martin
   Budget: 500 €
   ✉️ 2 message(s) non lu(s)
   🔗 Voir (link)
```

---

## 🔔 АВТОМАТИЧНІ СПОВІЩЕННЯ

Bot автоматично надсилає сповіщення про:

1. **Нові офери** на задачу клієнта
2. **Прийняття офера** виконавцем
3. **Нові повідомлення** в чаті задачі
4. **Нові відгуки** від клієнтів
5. **Зміна статусу задачі**

Код знаходиться в:
- `app/Services/TelegramNotificationService.php`
- `app/Http/Controllers/Api/MessageController.php`
- `app/Http/Controllers/Api/OfferController.php`
- `app/Http/Controllers/Api/ReviewController.php`

---

## 🧪 ТЕСТУВАННЯ

### 1. Тестування команд

```bash
# Відкрий бота в Telegram
# Надішли:
/start
/stats
/profile
/tasks
/help
```

### 2. Тестування webhook

```bash
# Перевір логи
tail -f storage/logs/laravel.log | grep Telegram

# Надішли команду в бота
# Перевір що webhook отримав запит
```

### 3. Тестування сповіщень

```php
// В tinker
php artisan tinker

use App\Models\User;
use App\Services\TelegramNotificationService;

$user = User::find(1);
TelegramNotificationService::sendToUser($user, "Test notification! 🎉");
```

---

## 🐛 TROUBLESHOOTING

### Problem: Webhook не працює

**Перевір:**
```bash
# 1. Webhook встановлено?
curl "https://api.telegram.org/botYOUR_TOKEN/getWebhookInfo"

# 2. Endpoint доступний?
curl "https://api.prochepro.fr/api/telegram/webhook"

# 3. SSL certificate валідний?
curl -I "https://api.prochepro.fr"
```

**Рішення:**
- Переконайся що SSL certificate валідний
- Telegram вимагає HTTPS для webhook
- Перевір що route існує: `php artisan route:list | grep telegram`

### Problem: Команди не відповідають

**Перевір:**
```bash
# Логи Laravel
tail -f storage/logs/laravel.log | grep Telegram

# Перевір що user підключений
php artisan tinker
> \App\Models\MessengerSettings::where('telegram_chat_id', 'CHAT_ID')->first();
```

**Рішення:**
- Користувач повинен спочатку підключити Telegram в налаштуваннях
- Перевір що `telegram_enabled = true`
- Перевір що `telegram_chat_id` збережений

### Problem: Сповіщення не приходять

**Перевір:**
```php
// В tinker
$user = User::find(1);
$settings = $user->messengerSettings;

echo $settings->telegram_enabled; // should be true
echo $settings->telegram_chat_id; // should have value
```

**Рішення:**
- `telegram_enabled` має бути `true`
- `telegram_chat_id` має бути заповнений
- Bot token правильний в .env

---

## 📈 MONITORING

### Metrics to Track

```sql
-- Active Telegram users
SELECT COUNT(*) FROM messenger_settings 
WHERE telegram_enabled = 1 
AND telegram_chat_id IS NOT NULL;

-- Messages sent today
SELECT COUNT(*) FROM logs 
WHERE message LIKE '%Telegram message sent%' 
AND created_at >= CURDATE();

-- Failed notifications
SELECT COUNT(*) FROM logs 
WHERE message LIKE '%Failed to send Telegram%' 
AND created_at >= CURDATE();
```

### Logs to Monitor

```bash
# Success
tail -f storage/logs/laravel.log | grep "Telegram message sent successfully"

# Errors
tail -f storage/logs/laravel.log | grep "Failed to send Telegram"

# Webhook calls
tail -f storage/logs/laravel.log | grep "Telegram webhook received"
```

---

## 🔒 БЕЗПЕКА

### Best Practices

1. **Перевіряй chat_id**
   - Тільки зареєстровані користувачі можуть використовувати команди
   - Кожна команда перевіряє що chat_id належить користувачу

2. **Rate Limiting**
   - Обмеж кількість команд на хвилину
   - Telegram має власний rate limit (30 msgs/second)

3. **Sensitive Data**
   - Не надсилай паролі через Telegram
   - Не показуй повні номери карток
   - Логуй всі дії для аудиту

4. **Bot Token**
   - Ніколи не commitь token в git
   - Зберігай тільки в .env
   - Оновлюй токен якщо скомпрометований

---

## 📦 DEPLOYMENT CHECKLIST

### Pre-deployment

- [ ] Bot token додано в `.env`
- [ ] Config cached: `php artisan config:cache`
- [ ] Routes cached: `php artisan route:cache`
- [ ] Webhook URL правильний

### Deployment

- [ ] `git pull origin main`
- [ ] `php artisan migrate` (якщо нові міграції)
- [ ] `php artisan config:cache`
- [ ] `php artisan route:cache`
- [ ] Set webhook URL

### Post-deployment

- [ ] Webhook info перевірено
- [ ] Тестові команди працюють
- [ ] Notifications приходять
- [ ] Логи чисті (без errors)

---

## 🎯 COMMANDS REFERENCE

| Command | Description | Auth Required | Example Output |
|---------|-------------|---------------|----------------|
| `/start` | Welcome message | Yes | Bot introduction |
| `/stats` | User statistics | Yes | Tasks, offers, revenue |
| `/profile` | User profile info | Yes | Name, email, rating |
| `/tasks` | Active tasks | Yes | List of tasks |
| `/help` | Help information | Yes | Commands list |

---

## 🔗 USEFUL LINKS

- [Telegram Bot API](https://core.telegram.org/bots/api)
- [BotFather](https://t.me/BotFather)
- [Webhook Guide](https://core.telegram.org/bots/webhooks)

---

**Автор:** Cascade AI  
**Дата створення:** 25 січня 2026  
**Версія:** 1.0  
**Статус:** ✅ Production Ready
