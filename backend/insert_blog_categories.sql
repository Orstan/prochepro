-- Копіюємо категорії сервісів в категорії блогу
INSERT INTO blog_categories (name, slug, icon, sort_order, created_at, updated_at)
SELECT 
    name,
    `key` as slug,
    icon,
    `order` as sort_order,
    NOW() as created_at,
    NOW() as updated_at
FROM service_categories
ON DUPLICATE KEY UPDATE 
    name = VALUES(name),
    icon = VALUES(icon),
    sort_order = VALUES(sort_order);
