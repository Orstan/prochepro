# 📦 Встановлення залежностей

## 1. Встановити next-cloudinary

```bash
cd frontend
npm install next-cloudinary
```

## 2. Додати в .env.local

Створіть файл `.env.local` у папці `frontend` з таким вмістом:

```env
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=dbcrrwox1
NEXT_PUBLIC_CLOUDINARY_API_KEY=841235239618376
CLOUDINARY_API_SECRET=9l5XDgs4Z-eJMJtmPPCp3mJ2vZM
```

## 3. Перезапустити dev сервер

```bash
npm run dev
```

Після цього помилка `Cannot find module 'next-cloudinary'` зникне.
