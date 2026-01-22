-- Заповнення категорій та підкатегорій з головної сторінки

-- Очищаємо старі дані
TRUNCATE TABLE service_subcategories;
TRUNCATE TABLE service_categories;

-- Категорії
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

-- Підкатегорії для Construction
INSERT INTO service_subcategories (category_id, `key`, name, `order`, is_active, created_at, updated_at) VALUES
(1, 'foundation', 'Fondations', 1, 1, NOW(), NOW()),
(1, 'masonry', 'Maçonnerie', 2, 1, NOW(), NOW()),
(1, 'concrete', 'Béton', 3, 1, NOW(), NOW()),
(1, 'structural', 'Structure', 4, 1, NOW(), NOW()),
(1, 'demolition', 'Démolition', 5, 1, NOW(), NOW()),
(1, 'excavation', 'Terrassement', 6, 1, NOW(), NOW()),
(1, 'reinforcement', 'Ferraillage', 7, 1, NOW(), NOW()),
(1, 'formwork', 'Coffrage', 8, 1, NOW(), NOW()),
(1, 'waterproofing', 'Étanchéité', 9, 1, NOW(), NOW()),
(1, 'drainage_system', 'Système de drainage', 10, 1, NOW(), NOW()),
(1, 'retaining_wall', 'Mur de soutènement', 11, 1, NOW(), NOW()),
(1, 'concrete_slab', 'Dalle béton', 12, 1, NOW(), NOW()),
(1, 'foundation_repair', 'Réparation fondations', 13, 1, NOW(), NOW()),
(1, 'underpinning', 'Reprise en sous-œuvre', 14, 1, NOW(), NOW()),
(1, 'basement_construction', 'Construction sous-sol', 15, 1, NOW(), NOW()),
(1, 'structural_assessment', 'Diagnostic structure', 16, 1, NOW(), NOW()),
(1, 'load_bearing', 'Mur porteur', 17, 1, NOW(), NOW()),
(1, 'concrete_pumping', 'Pompage béton', 18, 1, NOW(), NOW()),
(1, 'site_preparation', 'Préparation terrain', 19, 1, NOW(), NOW()),
(1, 'grading', 'Nivellement', 20, 1, NOW(), NOW());

-- Підкатегорії для Toit & façade
INSERT INTO service_subcategories (category_id, `key`, name, `order`, is_active, created_at, updated_at) VALUES
(2, 'roofing', 'Couverture', 1, 1, NOW(), NOW()),
(2, 'facade_work', 'Ravalement', 2, 1, NOW(), NOW()),
(2, 'insulation_roof', 'Isolation toiture', 3, 1, NOW(), NOW()),
(2, 'gutters', 'Gouttières', 4, 1, NOW(), NOW()),
(2, 'zinc_work', 'Zinguerie', 5, 1, NOW(), NOW()),
(2, 'roof_repair', 'Réparation toiture', 6, 1, NOW(), NOW()),
(2, 'tile_roof', 'Toiture tuiles', 7, 1, NOW(), NOW()),
(2, 'slate_roof', 'Toiture ardoise', 8, 1, NOW(), NOW()),
(2, 'flat_roof', 'Toiture terrasse', 9, 1, NOW(), NOW()),
(2, 'metal_roof', 'Toiture métallique', 10, 1, NOW(), NOW()),
(2, 'roof_insulation', 'Isolation combles', 11, 1, NOW(), NOW()),
(2, 'chimney_work', 'Travaux cheminée', 12, 1, NOW(), NOW()),
(2, 'skylight', 'Pose velux', 13, 1, NOW(), NOW()),
(2, 'facade_cleaning', 'Nettoyage façade', 14, 1, NOW(), NOW()),
(2, 'facade_painting', 'Peinture façade', 15, 1, NOW(), NOW()),
(2, 'facade_insulation', 'Isolation façade', 16, 1, NOW(), NOW()),
(2, 'rendering', 'Enduit façade', 17, 1, NOW(), NOW()),
(2, 'cladding', 'Bardage', 18, 1, NOW(), NOW()),
(2, 'downspout', 'Descente pluviale', 19, 1, NOW(), NOW()),
(2, 'roof_waterproofing', 'Étanchéité toit', 20, 1, NOW(), NOW());

-- Garages & portails
INSERT INTO service_subcategories (category_id, `key`, name, `order`, is_active, created_at, updated_at) VALUES
(3, 'garage_door', 'Porte de garage', 1, 1, NOW(), NOW()),
(3, 'gate_install', 'Installation portail', 2, 1, NOW(), NOW()),
(3, 'fence', 'Clôture', 3, 1, NOW(), NOW()),
(3, 'gate_repair', 'Réparation portail', 4, 1, NOW(), NOW()),
(3, 'automation', 'Automatisation', 5, 1, NOW(), NOW()),
(3, 'sectional_door', 'Porte sectionnelle', 6, 1, NOW(), NOW()),
(3, 'rolling_door', 'Porte enroulable', 7, 1, NOW(), NOW()),
(3, 'swing_gate', 'Portail battant', 8, 1, NOW(), NOW()),
(3, 'sliding_gate', 'Portail coulissant', 9, 1, NOW(), NOW()),
(3, 'electric_gate', 'Portail électrique', 10, 1, NOW(), NOW()),
(3, 'intercom', 'Interphone', 11, 1, NOW(), NOW()),
(3, 'access_control', 'Contrôle d\'accès', 12, 1, NOW(), NOW()),
(3, 'wood_fence', 'Clôture bois', 13, 1, NOW(), NOW()),
(3, 'metal_fence', 'Clôture métal', 14, 1, NOW(), NOW()),
(3, 'pvc_fence', 'Clôture PVC', 15, 1, NOW(), NOW()),
(3, 'hedge_fence', 'Clôture végétale', 16, 1, NOW(), NOW()),
(3, 'gate_motor', 'Motorisation portail', 17, 1, NOW(), NOW()),
(3, 'remote_control', 'Télécommande', 18, 1, NOW(), NOW());

-- Extérieur
INSERT INTO service_subcategories (category_id, `key`, name, `order`, is_active, created_at, updated_at) VALUES
(4, 'terrace', 'Terrasse', 1, 1, NOW(), NOW()),
(4, 'paving', 'Pavage', 2, 1, NOW(), NOW()),
(4, 'pool', 'Piscine', 3, 1, NOW(), NOW()),
(4, 'outdoor_lighting', 'Éclairage extérieur', 4, 1, NOW(), NOW()),
(4, 'drainage', 'Drainage', 5, 1, NOW(), NOW()),
(4, 'wood_deck', 'Terrasse bois', 6, 1, NOW(), NOW()),
(4, 'composite_deck', 'Terrasse composite', 7, 1, NOW(), NOW()),
(4, 'stone_patio', 'Terrasse pierre', 8, 1, NOW(), NOW()),
(4, 'tile_patio', 'Terrasse carrelage', 9, 1, NOW(), NOW()),
(4, 'pergola', 'Pergola', 10, 1, NOW(), NOW()),
(4, 'awning', 'Store banne', 11, 1, NOW(), NOW()),
(4, 'pool_installation', 'Installation piscine', 12, 1, NOW(), NOW()),
(4, 'pool_maintenance', 'Entretien piscine', 13, 1, NOW(), NOW()),
(4, 'pool_liner', 'Liner piscine', 14, 1, NOW(), NOW()),
(4, 'pool_heating', 'Chauffage piscine', 15, 1, NOW(), NOW()),
(4, 'outdoor_kitchen', 'Cuisine extérieure', 16, 1, NOW(), NOW()),
(4, 'garden_shed', 'Abri jardin', 17, 1, NOW(), NOW()),
(4, 'carport', 'Carport', 18, 1, NOW(), NOW()),
(4, 'pathway', 'Allée', 19, 1, NOW(), NOW()),
(4, 'retaining_wall_outdoor', 'Muret', 20, 1, NOW(), NOW());

-- Murs & plafonds
INSERT INTO service_subcategories (category_id, `key`, name, `order`, is_active, created_at, updated_at) VALUES
(5, 'drywall', 'Placo', 1, 1, NOW(), NOW()),
(5, 'plastering', 'Plâtrerie', 2, 1, NOW(), NOW()),
(5, 'painting', 'Peinture', 3, 1, NOW(), NOW()),
(5, 'wallpaper', 'Papier peint', 4, 1, NOW(), NOW()),
(5, 'ceiling_work', 'Faux plafond', 5, 1, NOW(), NOW()),
(5, 'wall_partition', 'Cloison', 6, 1, NOW(), NOW()),
(5, 'acoustic_insulation', 'Isolation phonique', 7, 1, NOW(), NOW()),
(5, 'thermal_insulation', 'Isolation thermique', 8, 1, NOW(), NOW()),
(5, 'wall_repair', 'Réparation mur', 9, 1, NOW(), NOW()),
(5, 'crack_repair', 'Réparation fissures', 10, 1, NOW(), NOW()),
(5, 'molding', 'Moulures', 11, 1, NOW(), NOW()),
(5, 'cornice', 'Corniches', 12, 1, NOW(), NOW()),
(5, 'wall_covering', 'Revêtement mural', 13, 1, NOW(), NOW()),
(5, 'textured_coating', 'Enduit décoratif', 14, 1, NOW(), NOW()),
(5, 'venetian_plaster', 'Stuc vénitien', 15, 1, NOW(), NOW()),
(5, 'suspended_ceiling', 'Plafond suspendu', 16, 1, NOW(), NOW()),
(5, 'acoustic_ceiling', 'Plafond acoustique', 17, 1, NOW(), NOW()),
(5, 'ceiling_painting', 'Peinture plafond', 18, 1, NOW(), NOW()),
(5, 'wall_smoothing', 'Lissage murs', 19, 1, NOW(), NOW());

-- Électricien
INSERT INTO service_subcategories (category_id, `key`, name, `order`, is_active, created_at, updated_at) VALUES
(6, 'wiring', 'Installation électrique', 1, 1, NOW(), NOW()),
(6, 'panel_upgrade', 'Tableau électrique', 2, 1, NOW(), NOW()),
(6, 'lighting', 'Éclairage', 3, 1, NOW(), NOW()),
(6, 'outlets', 'Prises & interrupteurs', 4, 1, NOW(), NOW()),
(6, 'electric_repair', 'Dépannage électrique', 5, 1, NOW(), NOW()),
(6, 'rewiring', 'Remise aux normes', 6, 1, NOW(), NOW()),
(6, 'circuit_breaker', 'Disjoncteur', 7, 1, NOW(), NOW()),
(6, 'smoke_detector', 'Détecteur fumée', 8, 1, NOW(), NOW()),
(6, 'electric_heating', 'Chauffage électrique', 9, 1, NOW(), NOW()),
(6, 'water_heater_electric', 'Chauffe-eau électrique', 10, 1, NOW(), NOW()),
(6, 'ceiling_light', 'Plafonnier', 11, 1, NOW(), NOW()),
(6, 'led_installation', 'Installation LED', 12, 1, NOW(), NOW()),
(6, 'dimmer', 'Variateur', 13, 1, NOW(), NOW()),
(6, 'outdoor_lighting_install', 'Éclairage extérieur', 14, 1, NOW(), NOW()),
(6, 'security_lighting', 'Éclairage sécurité', 15, 1, NOW(), NOW()),
(6, 'doorbell', 'Sonnette', 16, 1, NOW(), NOW()),
(6, 'electric_gate_install', 'Portail électrique', 17, 1, NOW(), NOW()),
(6, 'ev_charger', 'Borne recharge', 18, 1, NOW(), NOW()),
(6, 'solar_panels', 'Panneaux solaires', 19, 1, NOW(), NOW()),
(6, 'home_automation', 'Domotique', 20, 1, NOW(), NOW());

-- Plombier
INSERT INTO service_subcategories (category_id, `key`, name, `order`, is_active, created_at, updated_at) VALUES
(7, 'pipe_install', 'Installation tuyauterie', 1, 1, NOW(), NOW()),
(7, 'leak_repair', 'Réparation fuite', 2, 1, NOW(), NOW()),
(7, 'bathroom', 'Salle de bain', 3, 1, NOW(), NOW()),
(7, 'heating', 'Chauffage', 4, 1, NOW(), NOW()),
(7, 'drain_cleaning', 'Débouchage', 5, 1, NOW(), NOW()),
(7, 'toilet_install', 'Installation WC', 6, 1, NOW(), NOW()),
(7, 'sink_install', 'Installation lavabo', 7, 1, NOW(), NOW()),
(7, 'shower_install', 'Installation douche', 8, 1, NOW(), NOW()),
(7, 'bathtub_install', 'Installation baignoire', 9, 1, NOW(), NOW()),
(7, 'faucet_repair', 'Réparation robinet', 10, 1, NOW(), NOW()),
(7, 'water_heater', 'Chauffe-eau', 11, 1, NOW(), NOW()),
(7, 'boiler', 'Chaudière', 12, 1, NOW(), NOW()),
(7, 'radiator', 'Radiateur', 13, 1, NOW(), NOW()),
(7, 'underfloor_heating', 'Chauffage sol', 14, 1, NOW(), NOW()),
(7, 'pipe_replacement', 'Remplacement tuyaux', 15, 1, NOW(), NOW()),
(7, 'sewer_line', 'Canalisation', 16, 1, NOW(), NOW()),
(7, 'water_softener', 'Adoucisseur eau', 17, 1, NOW(), NOW()),
(7, 'water_filter', 'Filtre eau', 18, 1, NOW(), NOW()),
(7, 'sump_pump', 'Pompe relevage', 19, 1, NOW(), NOW()),
(7, 'gas_installation', 'Installation gaz', 20, 1, NOW(), NOW());

-- Peintre + решта категорій будуть в наступному повідомленні через ліміт
