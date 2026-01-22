# ENV змінні для Live Chat

## ⚠️ ДЛЯ ТВОГО ВИПАДКУ (production сервер):

Створи файл `frontend/.env` або `frontend/.env.production` з:

```env
NEXT_PUBLIC_API_URL=https://prochepro.fr/api

# Reverb WebSocket
NEXT_PUBLIC_REVERB_APP_KEY=prochepro-key
NEXT_PUBLIC_REVERB_HOST=prochepro.fr
NEXT_PUBLIC_REVERB_PORT=443
NEXT_PUBLIC_REVERB_SCHEME=https
```

**Важливо:** 
- Ці значення мають співпадати з `backend/.env`
- Для production використовуй порт 443 (HTTPS)
- Reverb має працювати через Nginx proxy (див. LIVE_CHAT_SETUP.md)

---

## Альтернативно (тільки для локальної розробки):

Якщо хочеш тестувати локально перед завантаженням на сервер:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
NEXT_PUBLIC_REVERB_APP_KEY=prochepro-key
NEXT_PUBLIC_REVERB_HOST=localhost
NEXT_PUBLIC_REVERB_PORT=8080
NEXT_PUBLIC_REVERB_SCHEME=http
```
