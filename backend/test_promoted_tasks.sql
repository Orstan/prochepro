-- SQL для тестування функції ТОП-оголошення
-- Встановлюємо promoted_until для 5 випадкових оголошень на 7 днів

UPDATE tasks 
SET promoted_until = DATE_ADD(NOW(), INTERVAL 7 DAY)
WHERE status = 'published'
ORDER BY RAND()
LIMIT 5;

-- Перевірити які оголошення стали ТОП:
SELECT id, title, status, promoted_until, created_at
FROM tasks
WHERE promoted_until IS NOT NULL
  AND promoted_until > NOW()
ORDER BY promoted_until DESC;

-- Скинути ТОП статус (якщо потрібно):
-- UPDATE tasks SET promoted_until = NULL WHERE promoted_until IS NOT NULL;
