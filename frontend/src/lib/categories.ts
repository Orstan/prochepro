// Legacy categories fallback for profile/edit page
// Main app uses categoriesApi.ts with API

export const SERVICE_CATEGORIES = [
  { key: "construction", label: "Construction" },
  { key: "roof_facade", label: "Toit & façade" },
  { key: "plumbing_heating", label: "Plomberie & chauffage" },
  { key: "electricity", label: "Électricité" },
  { key: "carpentry_joinery", label: "Menuiserie & ébénisterie" },
  { key: "painting_decoration", label: "Peinture & décoration" },
  { key: "flooring", label: "Sol & revêtements" },
  { key: "locksmith", label: "Serrurerie" },
  { key: "glazing", label: "Vitrerie & miroiterie" },
  { key: "insulation", label: "Isolation" },
  { key: "garden_exterior", label: "Jardin & extérieur" },
  { key: "pool", label: "Piscine" },
  { key: "moving", label: "Déménagement" },
  { key: "cleaning", label: "Nettoyage" },
  { key: "appliance_repair", label: "Réparation électroménager" },
  { key: "computer_tech", label: "Informatique & high-tech" },
  { key: "vehicle", label: "Véhicule" },
  { key: "wellbeing", label: "Bien-être & beauté" },
  { key: "events", label: "Événements" },
  { key: "lessons", label: "Cours & formation" },
  { key: "pets", label: "Animaux" },
  { key: "childcare", label: "Garde d'enfants" },
  { key: "administrative", label: "Administratif" },
  { key: "legal", label: "Juridique" },
  { key: "photo_video", label: "Photo & vidéo" },
  { key: "translation", label: "Traduction" },
  { key: "web_design", label: "Web & design" },
  { key: "other", label: "Autre" },
];

const subcategoriesMap: Record<string, string[]> = {
  construction: ["Maçonnerie", "Charpente", "Couverture", "Terrasse", "Extension", "Rénovation complète"],
  roof_facade: ["Toiture", "Façade", "Gouttières", "Étanchéité", "Ravalement"],
  plumbing_heating: ["Plomberie générale", "Chauffage", "Climatisation", "Chauffe-eau", "Radiateurs"],
  electricity: ["Installation électrique", "Dépannage électrique", "Tableau électrique", "Éclairage", "Domotique"],
  carpentry_joinery: ["Menuiserie intérieure", "Menuiserie extérieure", "Portes", "Fenêtres", "Placards"],
  painting_decoration: ["Peinture intérieure", "Peinture extérieure", "Papier peint", "Enduit décoratif"],
  flooring: ["Parquet", "Carrelage", "Moquette", "Vinyl", "Béton ciré"],
  locksmith: ["Ouverture de porte", "Changement de serrure", "Blindage de porte", "Clés"],
  glazing: ["Vitres", "Double vitrage", "Miroirs", "Vérandas"],
  insulation: ["Isolation thermique", "Isolation phonique", "Combles", "Murs"],
  garden_exterior: ["Jardinage", "Élagage", "Clôture", "Portail", "Allée"],
  pool: ["Construction piscine", "Entretien piscine", "Réparation piscine"],
  moving: ["Déménagement complet", "Aide au déménagement", "Transport de meubles"],
  cleaning: ["Ménage régulier", "Ménage ponctuel", "Nettoyage après travaux", "Vitrerie"],
  appliance_repair: ["Lave-linge", "Lave-vaisselle", "Réfrigérateur", "Four"],
  computer_tech: ["Dépannage informatique", "Installation", "Formation", "Récupération de données"],
  vehicle: ["Mécanique auto", "Carrosserie", "Entretien moto", "Diagnostic"],
  wellbeing: ["Coiffure", "Esthétique", "Massage", "Coaching sportif"],
  events: ["Organisation mariage", "Animation", "Traiteur", "Décoration"],
  lessons: ["Soutien scolaire", "Musique", "Sport", "Langues"],
  pets: ["Garde d'animaux", "Toilettage", "Promenade", "Éducation"],
  childcare: ["Garde à domicile", "Nounou", "Baby-sitting ponctuel"],
  administrative: ["Secrétariat", "Comptabilité", "Déclarations"],
  legal: ["Conseil juridique", "Rédaction de contrats", "Médiation"],
  photo_video: ["Photographie", "Vidéo", "Montage", "Drone"],
  translation: ["Traduction de documents", "Interprétariat"],
  web_design: ["Création de site web", "Graphisme", "SEO", "Maintenance"],
  other: ["Service non listé"],
};

export function getSubcategoriesByKey(key: string): string[] {
  return subcategoriesMap[key] || [];
}

export function getCategoryByKey(key: string) {
  return SERVICE_CATEGORIES.find(cat => cat.key === key);
}
