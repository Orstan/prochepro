-- Надання адмін прав користувачу
-- Замініть 'vitaliilevenets@gmail.com' на ваш email

UPDATE users 
SET is_admin = 1
WHERE email = 'vitaliilevenets@gmail.com';

-- Перевірка результату
SELECT id, name, email, is_admin 
FROM users 
WHERE email = 'vitaliilevenets@gmail.com';
