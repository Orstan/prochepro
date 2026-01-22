-- Перевірка чи існують таблиці
SHOW TABLES LIKE 'promotion%';

-- Перевірка структури таблиць
DESCRIBE promotion_packages;
DESCRIBE promotion_purchases;

-- Перевірка чи є дані в таблиці пакетів
SELECT * FROM promotion_packages;

-- Перевірка promoted_until поля в tasks
DESCRIBE tasks;

-- Перевірка ТОП-оголошень
SELECT id, title, promoted_until, created_at 
FROM tasks 
WHERE promoted_until IS NOT NULL 
ORDER BY promoted_until DESC 
LIMIT 5;

-- Перевірка всіх оголошень з сортуванням
SELECT 
    id, 
    title, 
    promoted_until, 
    created_at,
    CASE WHEN promoted_until IS NOT NULL AND promoted_until > NOW() THEN 'TOP' ELSE 'Normal' END as status
FROM tasks 
ORDER BY 
    IF(promoted_until IS NOT NULL AND promoted_until > NOW(), 0, 1) ASC,
    promoted_until DESC,
    created_at DESC
LIMIT 10;
