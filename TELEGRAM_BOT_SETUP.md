# 🤖 Telegram Bot - Професійне налаштування

## ✅ Що реалізовано:

### 🎯 Основні функції:
- ✅ **Авторизація** через унікальний лінк з сайту
- ✅ **Інтерактивне меню** з кнопками
- ✅ **Реальні дані** користувача (завдання, баланс, статистика)
- ✅ **Rich notifications** з inline кнопками
- ✅ **Налаштування сповіщень** прямо в боті

### 📋 Команди бота:
- `/start` - Початок роботи з ботом
- `/help` - Довідка по командах
- `/tasks` або `/missions` - Список активних завдань
- `/balance` - Баланс та кредити
- `/stats` або `/statistiques` - Статистика користувача
- `/messages` - Останні повідомлення
- `/offers` або `/offres` - Мої пропозиції
- `/settings` або `/parametres` - Налаштування сповіщень

### ⌨️ Інтерактивне меню:
```
📋 Mes missions      🔍 Trouver une mission
💬 Messages          🎯 Mes Offres
💰 Mon Solde         📊 Statistiques
👤 Mon Profil        ⚙️ Paramètres
🆘 Aide / Support
```

### 🔔 Типи сповіщень:
1. **Нові завдання** - з inline кнопками "Voir" та "Faire une offre"
2. **Нові повідомлення** - з preview та кнопкою "Répondre"
3. **Прийняті пропозиції** - з деталями
4. **Нові відгуки** - зірки + коментар
5. **Платежі** - сума + завдання
6. **Низький баланс** - попередження
7. **Скасування завдань** - з причиною
8. **Закінчення підписки** - нагадування

---

## 🚀 Налаштування на сервері:

### 1. Створення бота в BotFather

Відкрий Telegram, знайди [@BotFather](https://t.me/BotFather) і створи бота:

```
/newbot
Назва бота: ProchePro Bot
Username: ProchePro_bot (або інший доступний)
```

**Зберігай TOKEN!** Він виглядає так: `123456789:ABCdefGHIjklMNOpqrsTUVwxyz`

### 2. Додай TOKEN в .env

```bash
cd /var/www/prochepro.fr/backend
nano .env
```

Додай:
```env
TELEGRAM_BOT_TOKEN=123456789:ABCdefGHIjklMNOpqrsTUVwxyz
TELEGRAM_BOT_USERNAME=ProchePro_bot
```

### 3. Налаштуй команди в BotFather

Відкрий [@BotFather](https://t.me/BotFather):

```
/mybots
→ Вибери свого бота
→ Edit Bot
→ Edit Commands
```

Вставь це:
```
start - Démarrer le bot
help - Aide et commandes
tasks - Voir mes missions
balance - Mon solde et crédits
stats - Mes statistiques
messages - Messages récents
offers - Mes offres actives
settings - Paramètres de notifications
```

### 4. Встанови Webhook

**Варіант A: Webhook (рекомендується для production)**

```bash
curl -X POST "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook" \
  -d "url=https://api.prochepro.fr/api/telegram/webhook"
```

Перевірити webhook:
```bash
curl "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getWebhookInfo"
```

**Варіант B: Long Polling (для тестування)**

```bash
cd /var/www/prochepro.fr/backend
php artisan telegram:bot
```

Або додай в cron:
```bash
* * * * * cd /var/www/prochepro.fr/backend && php artisan telegram:bot --once >> /dev/null 2>&1
```

### 5. Завантаж файли на сервер

**Backend файли:**
```
backend/app/Http/Controllers/Api/TelegramWebhookController.php
backend/app/Services/TelegramNotificationService.php
backend/app/Console/Commands/TelegramBotCommand.php
```

### 6. Перезапусти backend

```bash
cd /var/www/prochepro.fr/backend
php artisan config:clear
php artisan cache:clear
```

---

## 🎨 Налаштування опису бота в BotFather

### Description (що користувачі бачать в списку ботів):

```
🤖 ProchePro Bot Officiel

Recevez instantanément:
🔔 Nouvelles missions près de chez vous
💬 Messages des clients
⚡ Mises à jour en temps réel
📊 Statistiques et solde

Connectez votre compte depuis prochepro.fr
```

В BotFather:
```
/mybots
→ Вибери бота
→ Edit Bot
→ Edit Description
```

### About (коротка версія):

```
Bot officiel ProchePro - Notifications et gestion de missions en temps réel
```

В BotFather:
```
/mybots
→ Вибери бота
→ Edit Bot
→ Edit About Text
```

### Botpic (аватарка):

Завантаж лого ProchePro (512x512 px, PNG)

```
/mybots
→ Вибери бота
→ Edit Bot
→ Edit Botpic
```

---

## 🔗 Підключення користувачів

### На frontend (в налаштуваннях користувача):

Користувач натискає кнопку "Connecter Telegram" і відкривається:
```
https://t.me/ProchePro_bot?start=connect_<USER_ID_BASE64>
```

Приклад коду для frontend:
```javascript
const userId = user.id;
const encodedUserId = btoa(`connect_${userId}`);
const telegramLink = `https://t.me/${TELEGRAM_BOT_USERNAME}?start=${encodedUserId}`;
```

### Автоматичне підключення:

Бот отримує `/start connect_123`, декодує, знаходить користувача і підключає Telegram Chat ID.

---

## 📱 Як використовувати бот:

### 1. Перше підключення:
- Користувач натискає "Connecter Telegram" на сайті
- Відкривається Telegram → `/start`
- Бот автоматично підключає аккаунт
- З'являється інтерактивне меню

### 2. Перегляд завдань:
```
📋 Mes missions
```
Показує:
- Активні пропозиції
- Статус (⏳ En attente / ✅ Acceptée)
- Бюджет і локація
- Inline кнопки для швидких дій

### 3. Перевірка балансу:
```
💰 Mon Solde
```
Показує:
- Кредити
- Тип підписки (🆓 Gratuit / ⭐ Premium / 🏆 Business)
- Попередження якщо кредитів мало

### 4. Статистика:
```
📊 Statistiques
```
Показує:
- Кількість пропозицій
- Відсоток прийнятих
- Завершені завдання
- Середній рейтинг ⭐

### 5. Останні повідомлення:
```
💬 Messages
```
Показує:
- 5 останніх повідомлень
- Preview тексту
- Від кого
- Лінк для відповіді

### 6. Мої пропозиції:
```
🎯 Mes Offres
```
Показує:
- Пропозиції в очікуванні
- Прийняті пропозиції
- Сума та назва завдання

---

## 🔔 Приклади сповіщень:

### Нове завдання:
```
🔔 Nouvelle Mission dans votre secteur!

📋 Ménage appartement 3 pièces
📍 Paris 15ème (75015)
💰 Budget: 50€ - 80€
🏷️ Catégorie: Ménage

⚡ Soyez rapide! Les meilleures offres partent vite!

[👀 Voir la mission] [✅ Faire une offre]
```

### Нове повідомлення:
```
💬 Nouveau Message

Mission: Ménage appartement
De: Marie Dupont

"Bonjour, pouvez-vous venir demain à 14h?"

[💬 Répondre]
```

### Прийнята пропозиція:
```
✅ Votre offre a été acceptée!

Mission: Ménage appartement 3 pièces
Montant: 65€
Client: Marie Dupont

👉 Voir les détails: https://prochepro.fr/tasks/123
```

### Новий відгук:
```
🌟 Nouvel Avis Reçu!

Note: ⭐⭐⭐⭐⭐ (5/5)
Mission: Ménage appartement

Commentaire: "Travail impeccable, très professionnel!"

🏆 Excellent travail! Continuez ainsi!
```

---

## ⚙️ Налаштування сповіщень в боті:

Користувач натискає `⚙️ Paramètres` і бачить:

```
🔔 Paramètres de notifications

Choisissez les notifications que vous souhaitez recevoir :

✅ Nouvelles missions dans mon secteur
✅ Messages des clients
✅ Réponses à mes offres
✅ Notifications système

[Кнопки для toggle кожного типу]
```

Натиснувши на кнопку, користувач вмикає/вимикає тип сповіщень.

---

## 🧪 Тестування:

### 1. Перевірити підключення бота:

```bash
curl "https://api.telegram.org/bot<YOUR_TOKEN>/getMe"
```

Має повернути інфу про бота.

### 2. Перевірити webhook:

```bash
curl "https://api.telegram.org/bot<YOUR_TOKEN>/getWebhookInfo"
```

Має показати `url: https://api.prochepro.fr/api/telegram/webhook`

### 3. Тестове сповіщення:

В коді backend:
```php
use App\Services\TelegramNotificationService;
use App\Models\User;

$user = User::find(1); // Твій ID
TelegramNotificationService::sendToUser($user, "🧪 <b>Test!</b>\n\nЦе тестове повідомлення від ProchePro Bot!");
```

### 4. Перевірити логи:

```bash
tail -f /var/www/prochepro.fr/backend/storage/logs/laravel.log | grep -i telegram
```

---

## 🔧 Інтеграція з подіями:

### В MessageController (вже додано):

```php
// Відправка Telegram сповіщення при новому повідомленні
try {
    TelegramNotificationService::notifyNewMessage(
        $recipient,
        $task,
        $message->body,
        $sender->name
    );
} catch (\Throwable $e) {
    \Log::error('Telegram notification failed', ['error' => $e->getMessage()]);
}
```

### В OfferController (додати):

```php
// При прийнятті пропозиції
use App\Services\TelegramNotificationService;

if ($offer->status === 'accepted') {
    try {
        TelegramNotificationService::notifyOfferAccepted($offer->user, $offer);
    } catch (\Throwable $e) {
        \Log::error('Telegram notification failed');
    }
}
```

### В TaskController (додати):

```php
// При скасуванні завдання
try {
    TelegramNotificationService::notifyTaskCancelled($prestataire, $task, $reason);
} catch (\Throwable $e) {
    \Log::error('Telegram notification failed');
}
```

### При новому відгуку:

```php
try {
    TelegramNotificationService::notifyNewReview($user, $rating, $review, $task);
} catch (\Throwable $e) {
    \Log::error('Telegram notification failed');
}
```

---

## 📊 Моніторинг:

### Статистика бота:

```bash
# Кількість підключених користувачів
mysql -u root -p prochepro_db -e "SELECT COUNT(*) FROM messenger_settings WHERE telegram_enabled = 1"

# Останні підключення
mysql -u root -p prochepro_db -e "SELECT user_id, telegram_chat_id, created_at FROM messenger_settings WHERE telegram_enabled = 1 ORDER BY updated_at DESC LIMIT 10"
```

### Логи Telegram:

```bash
# Показати останні помилки
tail -100 /var/www/prochepro.fr/backend/storage/logs/laravel.log | grep -i "telegram" | grep -i "error"

# Показати успішні відправки
tail -100 /var/www/prochepro.fr/backend/storage/logs/laravel.log | grep -i "Telegram message sent"
```

---

## 🐛 Troubleshooting:

### Бот не відповідає:

1. **Перевір TOKEN:**
   ```bash
   php artisan tinker
   >>> config('services.telegram.bot_token')
   ```

2. **Перевір webhook:**
   ```bash
   curl "https://api.telegram.org/bot<TOKEN>/getWebhookInfo"
   ```

3. **Перевір маршрути:**
   ```bash
   php artisan route:list | grep telegram
   ```

### Сповіщення не приходять:

1. **Перевір чи користувач підключив Telegram:**
   ```sql
   SELECT * FROM messenger_settings WHERE user_id = <USER_ID>;
   ```

2. **Перевір логи:**
   ```bash
   tail -f storage/logs/laravel.log | grep Telegram
   ```

3. **Тестове повідомлення:**
   ```bash
   curl -X POST "https://api.telegram.org/bot<TOKEN>/sendMessage" \
     -d "chat_id=<CHAT_ID>" \
     -d "text=Test"
   ```

---

## ✅ Чекліст після deployment:

- [ ] Бот створений в BotFather
- [ ] TOKEN доданий в `.env`
- [ ] Команди налаштовані в BotFather
- [ ] Description та About заповнені
- [ ] Botpic завантажений
- [ ] Webhook налаштований
- [ ] Backend файли завантажені
- [ ] Cache очищений
- [ ] Тестове підключення пройшло успішно
- [ ] Тестове сповіщення отримано
- [ ] Inline кнопки працюють
- [ ] Всі команди відповідають
- [ ] Меню відображається

---

## 🎉 Бот готовий!

Професійний Telegram бот з:
- ✅ Інтерактивним меню
- ✅ Реальними даними користувача
- ✅ Rich notifications з кнопками
- ✅ Налаштуваннями сповіщень
- ✅ Повною інтеграцією з сайтом

**Користувачі тепер отримують миттєві сповіщення про всі події безпосередньо в Telegram!**
