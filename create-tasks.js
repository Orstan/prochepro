const fetch = require('node-fetch');

const API_BASE_URL = 'https://api.prochepro.fr';
const CLIENT_ID = 2; // Змініть на потрібний ID клієнта

// Париж - райони та зони
const PARIS_DISTRICTS = [
  { code: '75001', name: 'Paris 1er', zone: 'center' },
  { code: '75002', name: 'Paris 2ème', zone: 'center' },
  { code: '75003', name: 'Paris 3ème', zone: 'center' },
  { code: '75004', name: 'Paris 4ème', zone: 'center' },
  { code: '75005', name: 'Paris 5ème', zone: 'left_bank' },
  { code: '75006', name: 'Paris 6ème', zone: 'left_bank' },
  { code: '75007', name: 'Paris 7ème', zone: 'left_bank' },
  { code: '75008', name: 'Paris 8ème', zone: 'right_bank' },
  { code: '75009', name: 'Paris 9ème', zone: 'right_bank' },
  { code: '75010', name: 'Paris 10ème', zone: 'northeast' },
  { code: '75011', name: 'Paris 11ème', zone: 'northeast' },
  { code: '75012', name: 'Paris 12ème', zone: 'east' },
  { code: '75013', name: 'Paris 13ème', zone: 'left_bank' },
  { code: '75014', name: 'Paris 14ème', zone: 'left_bank' },
  { code: '75015', name: 'Paris 15ème', zone: 'southwest' },
  { code: '75016', name: 'Paris 16ème', zone: 'west' },
  { code: '75017', name: 'Paris 17ème', zone: 'northwest' },
  { code: '75018', name: 'Paris 18ème', zone: 'north' },
  { code: '75019', name: 'Paris 19ème', zone: 'northeast' },
  { code: '75020', name: 'Paris 20ème', zone: 'east' },
];

// 50 різних оголошень по різних категоріях та підкатегоріях
const TASKS = [
  // Construction
  { category: 'construction', subcategory: 'masonry', title: 'Rénovation mur en pierre', description: 'Besoin de rénover un mur en pierre dans une maison ancienne. Le mur fait environ 3 mètres de long et 2,5 mètres de haut.', budget_min: 800, budget_max: 1500 },
  { category: 'construction', subcategory: 'concrete', title: 'Coulage dalle béton garage', description: 'Je souhaite faire couler une dalle en béton pour mon garage de 25m². Le terrain est déjà préparé.', budget_min: 1200, budget_max: 2000 },
  { category: 'construction', subcategory: 'foundation_repair', title: 'Réparation fissures fondation', description: 'Plusieurs fissures sont apparues sur les fondations de ma maison. Diagnostic et réparation nécessaires.', budget_min: 1500, budget_max: 3000 },
  
  // Roof & Facade
  { category: 'roof_facade', subcategory: 'tile_roof', title: 'Remplacement tuiles toit', description: 'Une dizaine de tuiles sont cassées sur mon toit après une tempête. Remplacement urgent nécessaire.', budget_min: 300, budget_max: 600 },
  { category: 'roof_facade', subcategory: 'facade_cleaning', title: 'Nettoyage façade immeuble', description: 'Nettoyage de la façade d\'un immeuble de 3 étages. Surface d\'environ 150m².', budget_min: 1000, budget_max: 2000 },
  { category: 'roof_facade', subcategory: 'gutters', title: 'Installation gouttières', description: 'Installation de gouttières en zinc sur une maison individuelle, environ 20 mètres linéaires.', budget_min: 600, budget_max: 1200 },
  
  // Plumber
  { category: 'plumber', subcategory: 'leak_repair', title: 'Réparation fuite urgente', description: 'Fuite d\'eau importante sous l\'évier de la cuisine. Intervention rapide nécessaire.', budget_min: 100, budget_max: 250 },
  { category: 'plumber', subcategory: 'bathroom', title: 'Rénovation complète salle de bain', description: 'Rénovation complète d\'une salle de bain : plomberie, baignoire, douche, lavabo. Surface de 6m².', budget_min: 3000, budget_max: 6000 },
  { category: 'plumber', subcategory: 'water_heater', title: 'Installation chauffe-eau électrique', description: 'Installation d\'un nouveau chauffe-eau électrique de 200L. Le chauffe-eau est déjà acheté.', budget_min: 300, budget_max: 500 },
  { category: 'plumber', subcategory: 'drain_cleaning', title: 'Débouchage canalisation', description: 'Canalisation bouchée dans la cuisine, l\'eau ne s\'écoule plus du tout.', budget_min: 80, budget_max: 150 },
  
  // Electrician
  { category: 'electrician', subcategory: 'panel_upgrade', title: 'Mise à jour tableau électrique', description: 'Remplacement d\'un vieux tableau électrique par un nouveau conforme aux normes actuelles.', budget_min: 800, budget_max: 1500 },
  { category: 'electrician', subcategory: 'lighting', title: 'Installation éclairage LED salon', description: 'Installation de spots LED encastrés dans le plafond du salon (environ 12 spots).', budget_min: 400, budget_max: 800 },
  { category: 'electrician', subcategory: 'outlets', title: 'Ajout prises électriques', description: 'Installation de 6 nouvelles prises électriques dans différentes pièces de l\'appartement.', budget_min: 200, budget_max: 400 },
  { category: 'electrician', subcategory: 'ev_charger', title: 'Installation borne recharge voiture', description: 'Installation d\'une borne de recharge pour voiture électrique dans garage individuel.', budget_min: 800, budget_max: 1500 },
  
  // Painter
  { category: 'painter', subcategory: 'interior_paint', title: 'Peinture appartement 3 pièces', description: 'Peinture complète d\'un appartement de 3 pièces (50m²). Fourniture de la peinture incluse.', budget_min: 1500, budget_max: 2500 },
  { category: 'painter', subcategory: 'exterior_paint', title: 'Peinture façade maison', description: 'Peinture extérieure d\'une maison individuelle, surface d\'environ 80m².', budget_min: 2000, budget_max: 3500 },
  { category: 'painter', subcategory: 'wallpaper', title: 'Pose papier peint chambre', description: 'Pose de papier peint dans une chambre de 12m². Le papier peint est déjà acheté.', budget_min: 200, budget_max: 400 },
  
  // Furniture
  { category: 'furniture', subcategory: 'assembly', title: 'Montage meubles IKEA', description: 'Montage de plusieurs meubles IKEA : armoire PAX, commode MALM et bibliothèque BILLY.', budget_min: 100, budget_max: 200 },
  { category: 'furniture', subcategory: 'kitchen_install', title: 'Installation cuisine équipée', description: 'Installation complète d\'une cuisine équipée de 8m². Les meubles sont déjà livrés.', budget_min: 800, budget_max: 1500 },
  { category: 'furniture', subcategory: 'custom_furniture', title: 'Fabrication bibliothèque sur mesure', description: 'Fabrication d\'une bibliothèque sur mesure en bois massif, 2m de large sur 2,5m de haut.', budget_min: 1000, budget_max: 2000 },
  
  // Cleaning
  { category: 'cleaning', subcategory: 'house_cleaning', title: 'Ménage complet appartement', description: 'Grand nettoyage d\'un appartement de 60m² : sols, vitres, cuisine, salle de bain.', budget_min: 80, budget_max: 150 },
  { category: 'cleaning', subcategory: 'move_cleaning', title: 'Nettoyage fin de bail', description: 'Nettoyage complet pour état des lieux de sortie, appartement 2 pièces de 45m².', budget_min: 150, budget_max: 250 },
  { category: 'cleaning', subcategory: 'window_cleaning', title: 'Nettoyage vitres immeuble', description: 'Nettoyage des vitres extérieures d\'un appartement au 3ème étage, 8 grandes fenêtres.', budget_min: 80, budget_max: 150 },
  { category: 'cleaning', subcategory: 'carpet_cleaning', title: 'Nettoyage tapis et moquette', description: 'Nettoyage professionnel d\'un grand tapis de salon (3m x 4m) et moquette d\'une chambre (12m²).', budget_min: 120, budget_max: 200 },
  
  // Garden
  { category: 'garden', subcategory: 'lawn_mowing', title: 'Tonte pelouse régulière', description: 'Tonte de pelouse toutes les 2 semaines, jardin de 150m². Contrat pour la saison.', budget_min: 30, budget_max: 50 },
  { category: 'garden', subcategory: 'tree_pruning', title: 'Élagage arbres fruitiers', description: 'Élagage de 4 arbres fruitiers (pommiers et poiriers) dans un jardin privé.', budget_min: 200, budget_max: 400 },
  { category: 'garden', subcategory: 'landscaping', title: 'Aménagement jardin paysager', description: 'Création d\'un jardin paysager avec plantation, allées et terrasse. Surface de 80m².', budget_min: 3000, budget_max: 6000 },
  { category: 'garden', subcategory: 'hedge_trimming', title: 'Taille haies de jardin', description: 'Taille de haies sur 30 mètres linéaires, hauteur de 2 mètres.', budget_min: 100, budget_max: 200 },
  
  // Transport
  { category: 'transport', subcategory: 'moving', title: 'Déménagement appartement 2 pièces', description: 'Déménagement d\'un appartement de 2 pièces du 3ème étage sans ascenseur vers rez-de-chaussée.', budget_min: 300, budget_max: 600 },
  { category: 'transport', subcategory: 'furniture_transport', title: 'Transport canapé', description: 'Transport d\'un grand canapé d\'angle d\'un magasin vers mon appartement (10km).', budget_min: 80, budget_max: 150 },
  { category: 'transport', subcategory: 'junk_removal', title: 'Débarras cave et grenier', description: 'Débarras complet d\'une cave et d\'un grenier, environ 15m³ de meubles et objets divers.', budget_min: 200, budget_max: 400 },
  
  // IT & Web
  { category: 'it_web', subcategory: 'website', title: 'Création site vitrine entreprise', description: 'Création d\'un site vitrine de 5 pages pour une petite entreprise, design moderne et responsive.', budget_min: 800, budget_max: 1500 },
  { category: 'it_web', subcategory: 'seo', title: 'Optimisation SEO site web', description: 'Optimisation SEO complète d\'un site e-commerce existant pour améliorer le référencement Google.', budget_min: 500, budget_max: 1000 },
  { category: 'it_web', subcategory: 'it_support', title: 'Dépannage informatique à domicile', description: 'Ordinateur très lent, besoin de nettoyage, optimisation et suppression de virus.', budget_min: 60, budget_max: 120 },
  
  // Events
  { category: 'events', subcategory: 'catering', title: 'Traiteur anniversaire 30 personnes', description: 'Service traiteur pour un anniversaire à domicile, cocktail et buffet pour 30 personnes.', budget_min: 600, budget_max: 1200 },
  { category: 'events', subcategory: 'photographer', title: 'Photographe mariage', description: 'Photographe professionnel pour un mariage, journée complète avec retouches et album photo.', budget_min: 1000, budget_max: 2000 },
  { category: 'events', subcategory: 'dj_music', title: 'DJ pour soirée privée', description: 'DJ pour animer une soirée privée d\'anniversaire, 5h de prestation avec sono.', budget_min: 400, budget_max: 800 },
  
  // Education
  { category: 'education', subcategory: 'math_tutoring', title: 'Cours maths niveau lycée', description: 'Cours particuliers de mathématiques pour élève de Terminale, préparation bac. 2h par semaine.', budget_min: 25, budget_max: 40 },
  { category: 'education', subcategory: 'english_lessons', title: 'Cours anglais conversation', description: 'Cours d\'anglais conversationnel pour améliorer mon niveau, 1h par semaine.', budget_min: 20, budget_max: 35 },
  { category: 'education', subcategory: 'guitar_lessons', title: 'Cours guitare débutant', description: 'Cours de guitare pour débutant adulte, à domicile, 1h par semaine.', budget_min: 25, budget_max: 40 },
  
  // Health & Beauty
  { category: 'health_beauty', subcategory: 'hairdressing', title: 'Coiffure à domicile', description: 'Coupe et brushing pour femme cheveux longs, service à domicile.', budget_min: 40, budget_max: 70 },
  { category: 'health_beauty', subcategory: 'massage', title: 'Massage relaxant 1h', description: 'Massage relaxant d\'une heure à domicile, pour soulager les tensions du dos.', budget_min: 60, budget_max: 100 },
  { category: 'health_beauty', subcategory: 'personal_training', title: 'Coach sportif personnel', description: 'Séances de coaching sportif personnalisé à domicile, 2 fois par semaine.', budget_min: 40, budget_max: 70 },
  
  // Childcare
  { category: 'childcare', subcategory: 'babysitting', title: 'Baby-sitting soirée', description: 'Garde de 2 enfants (4 et 7 ans) pour une soirée, de 19h à minuit.', budget_min: 40, budget_max: 70 },
  { category: 'childcare', subcategory: 'after_school', title: 'Garde périscolaire', description: 'Garde d\'un enfant de 8 ans après l\'école, du lundi au vendredi de 16h30 à 19h.', budget_min: 300, budget_max: 500 },
  { category: 'childcare', subcategory: 'homework_help', title: 'Aide aux devoirs primaire', description: 'Aide aux devoirs pour enfant en CM2, tous les soirs après l\'école pendant 1h.', budget_min: 15, budget_max: 25 },
  
  // Pets
  { category: 'pets', subcategory: 'dog_walking', title: 'Promenade chien quotidienne', description: 'Promenade quotidienne d\'un labrador, 1h par jour, du lundi au vendredi.', budget_min: 15, budget_max: 25 },
  { category: 'pets', subcategory: 'pet_sitting', title: 'Garde chat pendant vacances', description: 'Garde de 2 chats à domicile pendant 2 semaines de vacances, visite quotidienne.', budget_min: 200, budget_max: 350 },
  { category: 'pets', subcategory: 'grooming', title: 'Toilettage chien', description: 'Toilettage complet d\'un caniche : bain, coupe, ongles.', budget_min: 40, budget_max: 70 },
  
  // Other
  { category: 'other', subcategory: 'locksmith', title: 'Changement serrure porte', description: 'Remplacement d\'une serrure 3 points sur porte d\'entrée, serrure à acheter.', budget_min: 200, budget_max: 400 },
  { category: 'other', subcategory: 'photography', title: 'Shooting photo professionnel', description: 'Séance photo professionnelle pour portraits LinkedIn et CV, 1h avec retouches.', budget_min: 100, budget_max: 200 },
];

function getRandomDistrict() {
  return PARIS_DISTRICTS[Math.floor(Math.random() * PARIS_DISTRICTS.length)];
}

function getRandomLocationType() {
  return Math.random() > 0.3 ? 'on_site' : 'remote';
}

async function createTask(taskData, index) {
  const district = getRandomDistrict();
  
  const payload = {
    client_id: CLIENT_ID,
    title: taskData.title,
    description: taskData.description,
    budget_min: taskData.budget_min,
    budget_max: taskData.budget_max,
    location_type: getRandomLocationType(),
    category: taskData.category,
    subcategory: taskData.subcategory,
    city: 'Paris',
    district_code: district.code,
    district_name: district.name,
    zone: district.zone,
  };

  try {
    const response = await fetch(`${API_BASE_URL}/api/tasks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      const result = await response.json();
      console.log(`✅ [${index + 1}/50] Créé: ${taskData.title} (ID: ${result.id})`);
      return { success: true, id: result.id };
    } else {
      const error = await response.text();
      console.error(`❌ [${index + 1}/50] Erreur: ${taskData.title}`);
      console.error(`   Détails: ${error}`);
      return { success: false, error };
    }
  } catch (error) {
    console.error(`❌ [${index + 1}/50] Exception: ${taskData.title}`);
    console.error(`   ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function main() {
  console.log('🚀 Création de 50 annonces pour Paris...\n');
  console.log(`📍 API: ${API_BASE_URL}`);
  console.log(`👤 Client ID: ${CLIENT_ID}\n`);
  
  const results = {
    success: 0,
    failed: 0,
    ids: [],
  };

  for (let i = 0; i < TASKS.length; i++) {
    const result = await createTask(TASKS[i], i);
    
    if (result.success) {
      results.success++;
      results.ids.push(result.id);
    } else {
      results.failed++;
    }
    
    // Petite pause entre les requêtes
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  console.log('\n' + '='.repeat(50));
  console.log('📊 RÉSULTATS:');
  console.log(`   ✅ Succès: ${results.success}`);
  console.log(`   ❌ Échecs: ${results.failed}`);
  console.log('='.repeat(50));
  
  if (results.ids.length > 0) {
    console.log('\n🎉 IDs des annonces créées:');
    console.log(results.ids.join(', '));
  }
}

main().catch(console.error);
