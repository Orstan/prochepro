// Paris arrondissements (20 districts)
export const PARIS_ARRONDISSEMENTS = [
  "Paris 1er", "Paris 2ème", "Paris 3ème", "Paris 4ème", "Paris 5ème",
  "Paris 6ème", "Paris 7ème", "Paris 8ème", "Paris 9ème", "Paris 10ème",
  "Paris 11ème", "Paris 12ème", "Paris 13ème", "Paris 14ème", "Paris 15ème",
  "Paris 16ème", "Paris 17ème", "Paris 18ème", "Paris 19ème", "Paris 20ème",
];

// Active regions (Paris/Île-de-France only for now)
export const FRENCH_REGIONS = [
  {
    name: "Paris",
    cities: ["Paris", ...PARIS_ARRONDISSEMENTS],
  },
  {
    name: "Île-de-France",
    cities: ["Boulogne-Billancourt", "Saint-Denis", "Argenteuil", "Montreuil", "Nanterre", "Créteil", "Versailles", "Vitry-sur-Seine", "Colombes", "Asnières-sur-Seine", "Courbevoie", "Aubervilliers", "Drancy", "Noisy-le-Grand", "Pantin", "Neuilly-sur-Seine", "Bondy", "Ivry-sur-Seine", "Clichy"],
  },
  // Expansion prévue - autres régions à activer plus tard
  /*
  {
    name: "Auvergne-Rhône-Alpes",
    cities: ["Lyon", "Grenoble", "Saint-Étienne", "Villeurbanne", "Clermont-Ferrand", "Annecy", "Valence", "Chambéry", "Vénissieux", "Bourg-en-Bresse"],
  },
  {
    name: "Provence-Alpes-Côte d'Azur",
    cities: ["Marseille", "Nice", "Toulon", "Aix-en-Provence", "Avignon", "Cannes", "Antibes", "La Seyne-sur-Mer", "Hyères", "Fréjus"],
  },
  {
    name: "Occitanie",
    cities: ["Toulouse", "Montpellier", "Nîmes", "Perpignan", "Béziers", "Narbonne", "Carcassonne", "Albi", "Tarbes", "Sète"],
  },
  {
    name: "Nouvelle-Aquitaine",
    cities: ["Bordeaux", "Limoges", "Poitiers", "La Rochelle", "Pau", "Mérignac", "Pessac", "Bayonne", "Angoulême", "Niort"],
  },
  {
    name: "Hauts-de-France",
    cities: ["Lille", "Amiens", "Roubaix", "Tourcoing", "Dunkerque", "Calais", "Valenciennes", "Boulogne-sur-Mer", "Arras", "Lens"],
  },
  {
    name: "Grand Est",
    cities: ["Strasbourg", "Reims", "Metz", "Mulhouse", "Nancy", "Colmar", "Troyes", "Charleville-Mézières", "Épinal", "Thionville"],
  },
  {
    name: "Pays de la Loire",
    cities: ["Nantes", "Angers", "Le Mans", "Saint-Nazaire", "La Roche-sur-Yon", "Cholet", "Laval", "Saumur", "Saint-Herblain", "Rezé"],
  },
  {
    name: "Bretagne",
    cities: ["Rennes", "Brest", "Quimper", "Lorient", "Vannes", "Saint-Malo", "Saint-Brieuc", "Lanester", "Fougères", "Concarneau"],
  },
  {
    name: "Normandie",
    cities: ["Le Havre", "Rouen", "Caen", "Cherbourg-en-Cotentin", "Évreux", "Dieppe", "Alençon", "Lisieux", "Sotteville-lès-Rouen", "Saint-Lô"],
  },
  {
    name: "Bourgogne-Franche-Comté",
    cities: ["Dijon", "Besançon", "Belfort", "Chalon-sur-Saône", "Auxerre", "Nevers", "Mâcon", "Sens", "Le Creusot", "Montbéliard"],
  },
  {
    name: "Centre-Val de Loire",
    cities: ["Tours", "Orléans", "Bourges", "Blois", "Chartres", "Châteauroux", "Joué-lès-Tours", "Dreux", "Vierzon", "Montargis"],
  },
  {
    name: "Corse",
    cities: ["Ajaccio", "Bastia", "Porto-Vecchio", "Corte", "Calvi", "Propriano", "Bonifacio", "Sartène", "Ghisonaccia", "Île-Rousse"],
  },
  */
];

// Flat list of all cities
export const ALL_CITIES = FRENCH_REGIONS.flatMap(r => r.cities).sort();

// Cities with their regions
export const CITIES_WITH_REGIONS = FRENCH_REGIONS.flatMap(r => 
  r.cities.map(city => ({ city, region: r.name }))
);

// Popular cities for quick access (Île-de-France only for now)
export const POPULAR_CITIES = [
  "Paris", "Paris 15ème", "Paris 18ème", "Paris 11ème",
  "Boulogne-Billancourt", "Saint-Denis", "Versailles", "Neuilly-sur-Seine"
];

// Search cities function
export function searchCities(query: string, limit = 10): { city: string; region: string }[] {
  if (!query.trim()) return [];
  
  const q = query.toLowerCase();
  return CITIES_WITH_REGIONS
    .filter(c => c.city.toLowerCase().includes(q))
    .slice(0, limit);
}
