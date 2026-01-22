-- Заповнення всіх 28 категорій та підкатегорій

-- Вимикаємо foreign key checks
SET FOREIGN_KEY_CHECKS = 0;

-- Очищаємо таблиці
TRUNCATE TABLE service_subcategories;
TRUNCATE TABLE service_categories;

-- Вмикаємо foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- Вставляємо всі 28 категорій
INSERT INTO service_categories (id, `key`, name, icon, color, `order`, is_active, created_at, updated_at) VALUES
(1, 'construction', 'Construction', '🏗️', 'bg-gradient-to-br from-slate-100 to-gray-100', 1, 1, NOW(), NOW()),
(2, 'roof_facade', 'Toit & façade', '🏡', 'bg-gradient-to-br from-red-100 to-orange-100', 2, 1, NOW(), NOW()),
(3, 'garage_gates', 'Garages & portails', '🚧', 'bg-gradient-to-br from-zinc-100 to-slate-100', 3, 1, NOW(), NOW()),
(4, 'outdoor', 'Extérieur', '🌳', 'bg-gradient-to-br from-green-100 to-emerald-100', 4, 1, NOW(), NOW()),
(5, 'walls_ceiling', 'Murs & plafonds', '🧱', 'bg-gradient-to-br from-amber-100 to-yellow-100', 5, 1, NOW(), NOW()),
(6, 'electrician', 'Électricien', '⚡', 'bg-gradient-to-br from-yellow-100 to-amber-100', 6, 1, NOW(), NOW()),
(7, 'plumber', 'Plombier', '🚰', 'bg-gradient-to-br from-blue-100 to-cyan-100', 7, 1, NOW(), NOW()),
(8, 'painter', 'Peintre', '🎨', 'bg-gradient-to-br from-pink-100 to-rose-100', 8, 1, NOW(), NOW()),
(9, 'furniture', 'Meubles', '🛋️', 'bg-gradient-to-br from-brown-100 to-amber-100', 9, 1, NOW(), NOW()),
(10, 'automotive', 'Automobile', '🚗', 'bg-gradient-to-br from-red-100 to-pink-100', 10, 1, NOW(), NOW()),
(11, 'garden', 'Jardin', '🌿', 'bg-gradient-to-br from-lime-100 to-green-100', 11, 1, NOW(), NOW()),
(12, 'events', 'Événements', '🎉', 'bg-gradient-to-br from-purple-100 to-pink-100', 12, 1, NOW(), NOW()),
(13, 'projects', 'Projets', '📝', 'bg-gradient-to-br from-indigo-100 to-blue-100', 13, 1, NOW(), NOW()),
(14, 'cleaning', 'Nettoyage', '🧹', 'bg-gradient-to-br from-cyan-100 to-sky-100', 14, 1, NOW(), NOW()),
(15, 'education', 'Formation', '📚', 'bg-gradient-to-br from-blue-100 to-indigo-100', 15, 1, NOW(), NOW()),
(16, 'transport', 'Transport', '🚚', 'bg-gradient-to-br from-orange-100 to-amber-100', 16, 1, NOW(), NOW()),
(17, 'business', 'Entreprises', '🏢', 'bg-gradient-to-br from-slate-100 to-zinc-100', 17, 1, NOW(), NOW()),
(18, 'installation_repair', 'Réparation', '🛠️', 'bg-gradient-to-br from-gray-100 to-slate-100', 18, 1, NOW(), NOW()),
(19, 'financial', 'Finance', '💰', 'bg-gradient-to-br from-green-100 to-emerald-100', 19, 1, NOW(), NOW()),
(20, 'legal', 'Juridique', '⚖️', 'bg-gradient-to-br from-blue-100 to-cyan-100', 20, 1, NOW(), NOW()),
(21, 'remote', 'À distance', '💻', 'bg-gradient-to-br from-purple-100 to-violet-100', 21, 1, NOW(), NOW()),
(22, 'health_beauty', 'Beauté & bien-être', '💅', 'bg-gradient-to-br from-pink-100 to-fuchsia-100', 22, 1, NOW(), NOW()),
(23, 'childcare', 'Garde d\'enfants', '👶', 'bg-gradient-to-br from-yellow-100 to-orange-100', 23, 1, NOW(), NOW()),
(24, 'pets', 'Animaux', '🐾', 'bg-gradient-to-br from-lime-100 to-emerald-100', 24, 1, NOW(), NOW()),
(25, 'elderly_care', 'Aide aux seniors', '🧓', 'bg-gradient-to-br from-teal-100 to-cyan-100', 25, 1, NOW(), NOW()),
(26, 'it_web', 'Informatique & web', '💻', 'bg-gradient-to-br from-blue-100 to-indigo-100', 26, 1, NOW(), NOW()),
(27, 'delivery', 'Livraison', '📦', 'bg-gradient-to-br from-orange-100 to-red-100', 27, 1, NOW(), NOW()),
(28, 'other', 'Autre', '📋', 'bg-gradient-to-br from-gray-100 to-slate-100', 28, 1, NOW(), NOW());
