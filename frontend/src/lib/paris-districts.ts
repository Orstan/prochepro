/**
 * Paris Districts (Arrondissements) and Suburbs Data
 * Complete structure for location-based filtering in Paris area
 */

export interface District {
  code: string;
  name: string;
  shortName: string;
  zone: ParisZone;
  postalCodes: string[];
  landmarks?: string[];
}

export interface Suburb {
  code: string;
  name: string;
  department: string;
  postalCode: string;
  zone: SuburbZone;
}

export type ParisZone = 
  | "centre"      // 1-4
  | "rive_droite" // 8, 9, 10, 17, 18, 19
  | "rive_gauche" // 5, 6, 7, 13, 14, 15
  | "est"         // 11, 12, 20
  | "ouest";      // 16

export type SuburbZone = 
  | "hauts_de_seine"      // 92
  | "seine_saint_denis"   // 93
  | "val_de_marne"        // 94
  | "seine_et_marne"      // 77
  | "yvelines"            // 78
  | "essonne"             // 91
  | "val_doise";          // 95

export const PARIS_ZONES: { key: ParisZone; label: string; icon: string }[] = [
  { key: "centre", label: "Paris Centre", icon: "🏛️" },
  { key: "rive_droite", label: "Rive Droite", icon: "🌆" },
  { key: "rive_gauche", label: "Rive Gauche", icon: "🎭" },
  { key: "est", label: "Paris Est", icon: "🌳" },
  { key: "ouest", label: "Paris Ouest", icon: "🏰" },
];

export const SUBURB_ZONES: { key: SuburbZone; label: string; department: string }[] = [
  { key: "hauts_de_seine", label: "Hauts-de-Seine", department: "92" },
  { key: "seine_saint_denis", label: "Seine-Saint-Denis", department: "93" },
  { key: "val_de_marne", label: "Val-de-Marne", department: "94" },
  { key: "seine_et_marne", label: "Seine-et-Marne", department: "77" },
  { key: "yvelines", label: "Yvelines", department: "78" },
  { key: "essonne", label: "Essonne", department: "91" },
  { key: "val_doise", label: "Val-d'Oise", department: "95" },
];

export const PARIS_DISTRICTS: District[] = [
  // Centre (1-4)
  {
    code: "75001",
    name: "1er arrondissement",
    shortName: "1er",
    zone: "centre",
    postalCodes: ["75001"],
    landmarks: ["Louvre", "Les Halles", "Palais Royal", "Tuileries"],
  },
  {
    code: "75002",
    name: "2ème arrondissement",
    shortName: "2ème",
    zone: "centre",
    postalCodes: ["75002"],
    landmarks: ["Bourse", "Sentier", "Grands Boulevards"],
  },
  {
    code: "75003",
    name: "3ème arrondissement",
    shortName: "3ème",
    zone: "centre",
    postalCodes: ["75003"],
    landmarks: ["Marais Nord", "Temple", "Arts et Métiers"],
  },
  {
    code: "75004",
    name: "4ème arrondissement",
    shortName: "4ème",
    zone: "centre",
    postalCodes: ["75004"],
    landmarks: ["Marais", "Notre-Dame", "Île de la Cité", "Hôtel de Ville"],
  },
  // Rive Gauche (5, 6, 7, 13, 14, 15)
  {
    code: "75005",
    name: "5ème arrondissement",
    shortName: "5ème",
    zone: "rive_gauche",
    postalCodes: ["75005"],
    landmarks: ["Quartier Latin", "Panthéon", "Jardin des Plantes"],
  },
  {
    code: "75006",
    name: "6ème arrondissement",
    shortName: "6ème",
    zone: "rive_gauche",
    postalCodes: ["75006"],
    landmarks: ["Saint-Germain-des-Prés", "Luxembourg", "Odéon"],
  },
  {
    code: "75007",
    name: "7ème arrondissement",
    shortName: "7ème",
    zone: "rive_gauche",
    postalCodes: ["75007"],
    landmarks: ["Tour Eiffel", "Invalides", "Musée d'Orsay"],
  },
  {
    code: "75013",
    name: "13ème arrondissement",
    shortName: "13ème",
    zone: "rive_gauche",
    postalCodes: ["75013"],
    landmarks: ["Bibliothèque", "Chinatown", "Butte-aux-Cailles"],
  },
  {
    code: "75014",
    name: "14ème arrondissement",
    shortName: "14ème",
    zone: "rive_gauche",
    postalCodes: ["75014"],
    landmarks: ["Montparnasse", "Denfert-Rochereau", "Alésia"],
  },
  {
    code: "75015",
    name: "15ème arrondissement",
    shortName: "15ème",
    zone: "rive_gauche",
    postalCodes: ["75015"],
    landmarks: ["Vaugirard", "Convention", "Porte de Versailles"],
  },
  // Rive Droite (8, 9, 10, 17, 18, 19)
  {
    code: "75008",
    name: "8ème arrondissement",
    shortName: "8ème",
    zone: "rive_droite",
    postalCodes: ["75008"],
    landmarks: ["Champs-Élysées", "Madeleine", "Arc de Triomphe"],
  },
  {
    code: "75009",
    name: "9ème arrondissement",
    shortName: "9ème",
    zone: "rive_droite",
    postalCodes: ["75009"],
    landmarks: ["Opéra", "Grands Magasins", "Pigalle Sud"],
  },
  {
    code: "75010",
    name: "10ème arrondissement",
    shortName: "10ème",
    zone: "rive_droite",
    postalCodes: ["75010"],
    landmarks: ["Gare du Nord", "Gare de l'Est", "Canal Saint-Martin"],
  },
  {
    code: "75017",
    name: "17ème arrondissement",
    shortName: "17ème",
    zone: "rive_droite",
    postalCodes: ["75017"],
    landmarks: ["Batignolles", "Ternes", "Épinettes"],
  },
  {
    code: "75018",
    name: "18ème arrondissement",
    shortName: "18ème",
    zone: "rive_droite",
    postalCodes: ["75018"],
    landmarks: ["Montmartre", "Sacré-Cœur", "Pigalle", "Barbès"],
  },
  {
    code: "75019",
    name: "19ème arrondissement",
    shortName: "19ème",
    zone: "rive_droite",
    postalCodes: ["75019"],
    landmarks: ["Buttes-Chaumont", "La Villette", "Belleville Nord"],
  },
  // Est (11, 12, 20)
  {
    code: "75011",
    name: "11ème arrondissement",
    shortName: "11ème",
    zone: "est",
    postalCodes: ["75011"],
    landmarks: ["Bastille", "Oberkampf", "République"],
  },
  {
    code: "75012",
    name: "12ème arrondissement",
    shortName: "12ème",
    zone: "est",
    postalCodes: ["75012"],
    landmarks: ["Gare de Lyon", "Bercy", "Nation", "Bois de Vincennes"],
  },
  {
    code: "75020",
    name: "20ème arrondissement",
    shortName: "20ème",
    zone: "est",
    postalCodes: ["75020"],
    landmarks: ["Belleville", "Ménilmontant", "Père Lachaise", "Gambetta"],
  },
  // Ouest (16)
  {
    code: "75016",
    name: "16ème arrondissement",
    shortName: "16ème",
    zone: "ouest",
    postalCodes: ["75016", "75116"],
    landmarks: ["Trocadéro", "Passy", "Auteuil", "Bois de Boulogne"],
  },
];

export const PARIS_SUBURBS: Suburb[] = [
  // Hauts-de-Seine (92)
  { code: "92100", name: "Boulogne-Billancourt", department: "92", postalCode: "92100", zone: "hauts_de_seine" },
  { code: "92200", name: "Neuilly-sur-Seine", department: "92", postalCode: "92200", zone: "hauts_de_seine" },
  { code: "92300", name: "Levallois-Perret", department: "92", postalCode: "92300", zone: "hauts_de_seine" },
  { code: "92130", name: "Issy-les-Moulineaux", department: "92", postalCode: "92130", zone: "hauts_de_seine" },
  { code: "92400", name: "Courbevoie", department: "92", postalCode: "92400", zone: "hauts_de_seine" },
  { code: "92000", name: "Nanterre", department: "92", postalCode: "92000", zone: "hauts_de_seine" },
  { code: "92800", name: "Puteaux", department: "92", postalCode: "92800", zone: "hauts_de_seine" },
  { code: "92110", name: "Clichy", department: "92", postalCode: "92110", zone: "hauts_de_seine" },
  { code: "92120", name: "Montrouge", department: "92", postalCode: "92120", zone: "hauts_de_seine" },
  { code: "92170", name: "Vanves", department: "92", postalCode: "92170", zone: "hauts_de_seine" },
  { code: "92240", name: "Malakoff", department: "92", postalCode: "92240", zone: "hauts_de_seine" },
  { code: "92140", name: "Clamart", department: "92", postalCode: "92140", zone: "hauts_de_seine" },
  { code: "92150", name: "Suresnes", department: "92", postalCode: "92150", zone: "hauts_de_seine" },
  { code: "92500", name: "Rueil-Malmaison", department: "92", postalCode: "92500", zone: "hauts_de_seine" },
  { code: "92600", name: "Asnières-sur-Seine", department: "92", postalCode: "92600", zone: "hauts_de_seine" },
  
  // Seine-Saint-Denis (93)
  { code: "93100", name: "Montreuil", department: "93", postalCode: "93100", zone: "seine_saint_denis" },
  { code: "93200", name: "Saint-Denis", department: "93", postalCode: "93200", zone: "seine_saint_denis" },
  { code: "93300", name: "Aubervilliers", department: "93", postalCode: "93300", zone: "seine_saint_denis" },
  { code: "93400", name: "Saint-Ouen", department: "93", postalCode: "93400", zone: "seine_saint_denis" },
  { code: "93500", name: "Pantin", department: "93", postalCode: "93500", zone: "seine_saint_denis" },
  { code: "93170", name: "Bagnolet", department: "93", postalCode: "93170", zone: "seine_saint_denis" },
  { code: "93310", name: "Le Pré-Saint-Gervais", department: "93", postalCode: "93310", zone: "seine_saint_denis" },
  { code: "93260", name: "Les Lilas", department: "93", postalCode: "93260", zone: "seine_saint_denis" },
  { code: "93110", name: "Rosny-sous-Bois", department: "93", postalCode: "93110", zone: "seine_saint_denis" },
  { code: "93000", name: "Bobigny", department: "93", postalCode: "93000", zone: "seine_saint_denis" },
  { code: "93700", name: "Drancy", department: "93", postalCode: "93700", zone: "seine_saint_denis" },
  { code: "93600", name: "Aulnay-sous-Bois", department: "93", postalCode: "93600", zone: "seine_saint_denis" },
  
  // Val-de-Marne (94)
  { code: "94200", name: "Ivry-sur-Seine", department: "94", postalCode: "94200", zone: "val_de_marne" },
  { code: "94800", name: "Villejuif", department: "94", postalCode: "94800", zone: "val_de_marne" },
  { code: "94270", name: "Le Kremlin-Bicêtre", department: "94", postalCode: "94270", zone: "val_de_marne" },
  { code: "94250", name: "Gentilly", department: "94", postalCode: "94250", zone: "val_de_marne" },
  { code: "94220", name: "Charenton-le-Pont", department: "94", postalCode: "94220", zone: "val_de_marne" },
  { code: "94160", name: "Saint-Mandé", department: "94", postalCode: "94160", zone: "val_de_marne" },
  { code: "94300", name: "Vincennes", department: "94", postalCode: "94300", zone: "val_de_marne" },
  { code: "94130", name: "Nogent-sur-Marne", department: "94", postalCode: "94130", zone: "val_de_marne" },
  { code: "94100", name: "Saint-Maur-des-Fossés", department: "94", postalCode: "94100", zone: "val_de_marne" },
  { code: "94000", name: "Créteil", department: "94", postalCode: "94000", zone: "val_de_marne" },
  { code: "94400", name: "Vitry-sur-Seine", department: "94", postalCode: "94400", zone: "val_de_marne" },
  { code: "94700", name: "Maisons-Alfort", department: "94", postalCode: "94700", zone: "val_de_marne" },
  { code: "94500", name: "Champigny-sur-Marne", department: "94", postalCode: "94500", zone: "val_de_marne" },
  
  // Seine-et-Marne (77) - Major cities
  { code: "77000", name: "Melun", department: "77", postalCode: "77000", zone: "seine_et_marne" },
  { code: "77100", name: "Meaux", department: "77", postalCode: "77100", zone: "seine_et_marne" },
  { code: "77400", name: "Lagny-sur-Marne", department: "77", postalCode: "77400", zone: "seine_et_marne" },
  { code: "77500", name: "Chelles", department: "77", postalCode: "77500", zone: "seine_et_marne" },
  { code: "77600", name: "Bussy-Saint-Georges", department: "77", postalCode: "77600", zone: "seine_et_marne" },
  { code: "77700", name: "Serris", department: "77", postalCode: "77700", zone: "seine_et_marne" },
  { code: "77200", name: "Torcy", department: "77", postalCode: "77200", zone: "seine_et_marne" },
  { code: "77300", name: "Fontainebleau", department: "77", postalCode: "77300", zone: "seine_et_marne" },
  { code: "77380", name: "Combs-la-Ville", department: "77", postalCode: "77380", zone: "seine_et_marne" },
  { code: "77330", name: "Ozoir-la-Ferrière", department: "77", postalCode: "77330", zone: "seine_et_marne" },
  { code: "77340", name: "Pontault-Combault", department: "77", postalCode: "77340", zone: "seine_et_marne" },
  { code: "77176", name: "Savigny-le-Temple", department: "77", postalCode: "77176", zone: "seine_et_marne" },
  { code: "77186", name: "Noisiel", department: "77", postalCode: "77186", zone: "seine_et_marne" },
  { code: "77190", name: "Dammarie-les-Lys", department: "77", postalCode: "77190", zone: "seine_et_marne" },
  { code: "77140", name: "Nemours", department: "77", postalCode: "77140", zone: "seine_et_marne" },
  
  // Yvelines (78) - Major cities
  { code: "78000", name: "Versailles", department: "78", postalCode: "78000", zone: "yvelines" },
  { code: "78100", name: "Saint-Germain-en-Laye", department: "78", postalCode: "78100", zone: "yvelines" },
  { code: "78200", name: "Mantes-la-Jolie", department: "78", postalCode: "78200", zone: "yvelines" },
  { code: "78300", name: "Poissy", department: "78", postalCode: "78300", zone: "yvelines" },
  { code: "78500", name: "Sartrouville", department: "78", postalCode: "78500", zone: "yvelines" },
  { code: "78130", name: "Les Mureaux", department: "78", postalCode: "78130", zone: "yvelines" },
  { code: "78150", name: "Le Chesnay-Rocquencourt", department: "78", postalCode: "78150", zone: "yvelines" },
  { code: "78180", name: "Montigny-le-Bretonneux", department: "78", postalCode: "78180", zone: "yvelines" },
  { code: "78190", name: "Trappes", department: "78", postalCode: "78190", zone: "yvelines" },
  { code: "78400", name: "Chatou", department: "78", postalCode: "78400", zone: "yvelines" },
  { code: "78230", name: "Le Pecq", department: "78", postalCode: "78230", zone: "yvelines" },
  { code: "78600", name: "Maisons-Laffitte", department: "78", postalCode: "78600", zone: "yvelines" },
  { code: "78700", name: "Conflans-Sainte-Honorine", department: "78", postalCode: "78700", zone: "yvelines" },
  { code: "78800", name: "Houilles", department: "78", postalCode: "78800", zone: "yvelines" },
  { code: "78140", name: "Vélizy-Villacoublay", department: "78", postalCode: "78140", zone: "yvelines" },
  
  // Essonne (91) - Major cities
  { code: "91000", name: "Évry-Courcouronnes", department: "91", postalCode: "91000", zone: "essonne" },
  { code: "91100", name: "Corbeil-Essonnes", department: "91", postalCode: "91100", zone: "essonne" },
  { code: "91200", name: "Athis-Mons", department: "91", postalCode: "91200", zone: "essonne" },
  { code: "91300", name: "Massy", department: "91", postalCode: "91300", zone: "essonne" },
  { code: "91400", name: "Orsay", department: "91", postalCode: "91400", zone: "essonne" },
  { code: "91120", name: "Palaiseau", department: "91", postalCode: "91120", zone: "essonne" },
  { code: "91150", name: "Étampes", department: "91", postalCode: "91150", zone: "essonne" },
  { code: "91160", name: "Longjumeau", department: "91", postalCode: "91160", zone: "essonne" },
  { code: "91170", name: "Viry-Châtillon", department: "91", postalCode: "91170", zone: "essonne" },
  { code: "91240", name: "Saint-Michel-sur-Orge", department: "91", postalCode: "91240", zone: "essonne" },
  { code: "91260", name: "Juvisy-sur-Orge", department: "91", postalCode: "91260", zone: "essonne" },
  { code: "91270", name: "Vigneux-sur-Seine", department: "91", postalCode: "91270", zone: "essonne" },
  { code: "91350", name: "Grigny", department: "91", postalCode: "91350", zone: "essonne" },
  { code: "91700", name: "Sainte-Geneviève-des-Bois", department: "91", postalCode: "91700", zone: "essonne" },
  { code: "91380", name: "Chilly-Mazarin", department: "91", postalCode: "91380", zone: "essonne" },
  
  // Val-d'Oise (95) - Major cities
  { code: "95000", name: "Cergy", department: "95", postalCode: "95000", zone: "val_doise" },
  { code: "95100", name: "Argenteuil", department: "95", postalCode: "95100", zone: "val_doise" },
  { code: "95200", name: "Sarcelles", department: "95", postalCode: "95200", zone: "val_doise" },
  { code: "95500", name: "Gonesse", department: "95", postalCode: "95500", zone: "val_doise" },
  { code: "95600", name: "Eaubonne", department: "95", postalCode: "95600", zone: "val_doise" },
  { code: "95110", name: "Sannois", department: "95", postalCode: "95110", zone: "val_doise" },
  { code: "95120", name: "Ermont", department: "95", postalCode: "95120", zone: "val_doise" },
  { code: "95130", name: "Franconville", department: "95", postalCode: "95130", zone: "val_doise" },
  { code: "95150", name: "Taverny", department: "95", postalCode: "95150", zone: "val_doise" },
  { code: "95190", name: "Goussainville", department: "95", postalCode: "95190", zone: "val_doise" },
  { code: "95210", name: "Saint-Gratien", department: "95", postalCode: "95210", zone: "val_doise" },
  { code: "95220", name: "Herblay-sur-Seine", department: "95", postalCode: "95220", zone: "val_doise" },
  { code: "95230", name: "Soisy-sous-Montmorency", department: "95", postalCode: "95230", zone: "val_doise" },
  { code: "95240", name: "Cormeilles-en-Parisis", department: "95", postalCode: "95240", zone: "val_doise" },
  { code: "95250", name: "Beauchamp", department: "95", postalCode: "95250", zone: "val_doise" },
];

// Helper functions
export function getDistrictByCode(code: string): District | undefined {
  return PARIS_DISTRICTS.find((d) => d.code === code);
}

export function getDistrictsByZone(zone: ParisZone): District[] {
  return PARIS_DISTRICTS.filter((d) => d.zone === zone);
}

export function getSuburbsByZone(zone: SuburbZone): Suburb[] {
  return PARIS_SUBURBS.filter((s) => s.zone === zone);
}

export function getZoneLabel(zone: ParisZone | SuburbZone): string {
  const parisZone = PARIS_ZONES.find((z) => z.key === zone);
  if (parisZone) return parisZone.label;
  
  const suburbZone = SUBURB_ZONES.find((z) => z.key === zone);
  if (suburbZone) return suburbZone.label;
  
  return zone;
}

export function getAllLocations(): { code: string; name: string; type: "district" | "suburb"; zone: string }[] {
  const districts = PARIS_DISTRICTS.map((d) => ({
    code: d.code,
    name: `Paris ${d.shortName}`,
    type: "district" as const,
    zone: d.zone,
  }));
  
  const suburbs = PARIS_SUBURBS.map((s) => ({
    code: s.code,
    name: s.name,
    type: "suburb" as const,
    zone: s.zone,
  }));
  
  return [...districts, ...suburbs];
}

export function searchLocations(query: string): { code: string; name: string; type: "district" | "suburb"; zone: string }[] {
  const q = query.toLowerCase().trim();
  if (!q) return [];
  
  const results: { code: string; name: string; type: "district" | "suburb"; zone: string }[] = [];
  
  // Search districts
  for (const d of PARIS_DISTRICTS) {
    if (
      d.name.toLowerCase().includes(q) ||
      d.shortName.toLowerCase().includes(q) ||
      d.code.includes(q) ||
      d.landmarks?.some((l) => l.toLowerCase().includes(q))
    ) {
      results.push({
        code: d.code,
        name: `Paris ${d.shortName}`,
        type: "district",
        zone: d.zone,
      });
    }
  }
  
  // Search suburbs
  for (const s of PARIS_SUBURBS) {
    if (
      s.name.toLowerCase().includes(q) ||
      s.code.includes(q) ||
      s.postalCode.includes(q)
    ) {
      results.push({
        code: s.code,
        name: s.name,
        type: "suburb",
        zone: s.zone,
      });
    }
  }
  
  return results.slice(0, 10);
}

// Format location for display
export function formatLocation(code: string): string {
  const district = getDistrictByCode(code);
  if (district) {
    return `Paris ${district.shortName}`;
  }
  
  const suburb = PARIS_SUBURBS.find((s) => s.code === code);
  if (suburb) {
    return suburb.name;
  }
  
  return code;
}

// Get location details
export function getLocationDetails(code: string): { name: string; zone: string; landmarks?: string[] } | null {
  const district = getDistrictByCode(code);
  if (district) {
    return {
      name: `Paris ${district.shortName} - ${district.name}`,
      zone: getZoneLabel(district.zone),
      landmarks: district.landmarks,
    };
  }
  
  const suburb = PARIS_SUBURBS.find((s) => s.code === code);
  if (suburb) {
    return {
      name: suburb.name,
      zone: getZoneLabel(suburb.zone),
    };
  }
  
  return null;
}
