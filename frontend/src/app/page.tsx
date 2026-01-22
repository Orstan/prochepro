"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import CityAutocomplete from "@/components/CityAutocomplete";
import UserAvatar from "@/components/UserAvatar";
import VideoTestimonialCard from "@/components/VideoTestimonialCard";
import LiveStatistics from "@/components/LiveStatistics";
import ResponseTimeIndicator from "@/components/ResponseTimeIndicator";
import { API_BASE_URL } from "@/lib/api";

interface TopPrestataire {
  id: number;
  name: string;
  avatar?: string;
  city?: string;
  bio?: string;
  skills: string[];
  company_name?: string;
  is_verified: boolean;
  average_rating: number | null;
  reviews_count: number;
}

interface LatestTask {
  id: number;
  title: string;
  description?: string | null;
  category?: string | null;
  city?: string | null;
  budget_min?: number | null;
  budget_max?: number | null;
  images?: string[] | null;
  created_at: string;
}

interface VideoTestimonial {
  id: number;
  cloudinary_public_id: string;
  name: string;
  role: string | null;
  text: string | null;
  duration: number | null;
  thumbnail_url: string | null;
  is_active: boolean;
  sort_order: number;
}

interface ServiceCategory {
  key: string;
  name: string;
  icon: string;
  color: string;
  subcategories: {
    key: string;
    name: string;
  }[];
}

const categoriesWithSubs = [
  {
    key: "construction",
    name: "Construction",
    icon: "🏗️",
    color: "bg-gradient-to-br from-slate-100 to-gray-100",
    subcategories: [
      { key: "foundation", name: "Fondations" },
      { key: "masonry", name: "Maçonnerie" },
      { key: "concrete", name: "Béton" },
      { key: "structural", name: "Structure" },
      { key: "demolition", name: "Démolition" },
      { key: "excavation", name: "Terrassement" },
      { key: "reinforcement", name: "Ferraillage" },
      { key: "formwork", name: "Coffrage" },
      { key: "waterproofing", name: "Étanchéité" },
      { key: "drainage_system", name: "Système de drainage" },
      { key: "retaining_wall", name: "Mur de soutènement" },
      { key: "concrete_slab", name: "Dalle béton" },
      { key: "foundation_repair", name: "Réparation fondations" },
      { key: "underpinning", name: "Reprise en sous-œuvre" },
      { key: "basement_construction", name: "Construction sous-sol" },
      { key: "structural_assessment", name: "Diagnostic structure" },
      { key: "load_bearing", name: "Mur porteur" },
      { key: "concrete_pumping", name: "Pompage béton" },
      { key: "site_preparation", name: "Préparation terrain" },
      { key: "grading", name: "Nivellement" },
    ],
  },
  {
    key: "roof_facade",
    name: "Toit & façade",
    icon: "🏡",
    color: "bg-gradient-to-br from-red-100 to-orange-100",
    subcategories: [
      { key: "roofing", name: "Couverture" },
      { key: "facade_work", name: "Ravalement" },
      { key: "insulation_roof", name: "Isolation toiture" },
      { key: "gutters", name: "Gouttières" },
      { key: "zinc_work", name: "Zinguerie" },
      { key: "roof_repair", name: "Réparation toiture" },
      { key: "tile_roof", name: "Toiture tuiles" },
      { key: "slate_roof", name: "Toiture ardoise" },
      { key: "flat_roof", name: "Toiture terrasse" },
      { key: "metal_roof", name: "Toiture métallique" },
      { key: "roof_insulation", name: "Isolation combles" },
      { key: "chimney_work", name: "Travaux cheminée" },
      { key: "skylight", name: "Pose velux" },
      { key: "facade_cleaning", name: "Nettoyage façade" },
      { key: "facade_painting", name: "Peinture façade" },
      { key: "facade_insulation", name: "Isolation façade" },
      { key: "rendering", name: "Enduit façade" },
      { key: "cladding", name: "Bardage" },
      { key: "downspout", name: "Descente pluviale" },
      { key: "roof_waterproofing", name: "Étanchéité toit" },
    ],
  },
  {
    key: "garage_gates",
    name: "Garages & portails",
    icon: "🚧",
    color: "bg-gradient-to-br from-zinc-100 to-slate-100",
    subcategories: [
      { key: "garage_door", name: "Porte de garage" },
      { key: "gate_install", name: "Installation portail" },
      { key: "fence", name: "Clôture" },
      { key: "gate_repair", name: "Réparation portail" },
      { key: "automation", name: "Automatisation" },
      { key: "sectional_door", name: "Porte sectionnelle" },
      { key: "rolling_door", name: "Porte enroulable" },
      { key: "swing_gate", name: "Portail battant" },
      { key: "sliding_gate", name: "Portail coulissant" },
      { key: "electric_gate", name: "Portail électrique" },
      { key: "intercom", name: "Interphone" },
      { key: "access_control", name: "Contrôle d'accès" },
      { key: "wood_fence", name: "Clôture bois" },
      { key: "metal_fence", name: "Clôture métal" },
      { key: "pvc_fence", name: "Clôture PVC" },
      { key: "hedge_fence", name: "Clôture végétale" },
      { key: "gate_motor", name: "Motorisation portail" },
      { key: "remote_control", name: "Télécommande" },
    ],
  },
  {
    key: "outdoor",
    name: "Extérieur",
    icon: "🌳",
    color: "bg-gradient-to-br from-green-100 to-emerald-100",
    subcategories: [
      { key: "terrace", name: "Terrasse" },
      { key: "paving", name: "Pavage" },
      { key: "pool", name: "Piscine" },
      { key: "outdoor_lighting", name: "Éclairage extérieur" },
      { key: "drainage", name: "Drainage" },
      { key: "wood_deck", name: "Terrasse bois" },
      { key: "composite_deck", name: "Terrasse composite" },
      { key: "stone_patio", name: "Terrasse pierre" },
      { key: "tile_patio", name: "Terrasse carrelage" },
      { key: "pergola", name: "Pergola" },
      { key: "awning", name: "Store banne" },
      { key: "pool_installation", name: "Installation piscine" },
      { key: "pool_maintenance", name: "Entretien piscine" },
      { key: "pool_liner", name: "Liner piscine" },
      { key: "pool_heating", name: "Chauffage piscine" },
      { key: "outdoor_kitchen", name: "Cuisine extérieure" },
      { key: "garden_shed", name: "Abri jardin" },
      { key: "carport", name: "Carport" },
      { key: "pathway", name: "Allée" },
      { key: "retaining_wall_outdoor", name: "Muret" },
    ],
  },
  {
    key: "walls_ceiling",
    name: "Murs & plafonds",
    icon: "🧱",
    color: "bg-gradient-to-br from-amber-100 to-yellow-100",
    subcategories: [
      { key: "drywall", name: "Placo" },
      { key: "plastering", name: "Plâtrerie" },
      { key: "painting", name: "Peinture" },
      { key: "wallpaper", name: "Papier peint" },
      { key: "ceiling_work", name: "Faux plafond" },
      { key: "wall_partition", name: "Cloison" },
      { key: "acoustic_insulation", name: "Isolation phonique" },
      { key: "thermal_insulation", name: "Isolation thermique" },
      { key: "wall_repair", name: "Réparation mur" },
      { key: "crack_repair", name: "Réparation fissures" },
      { key: "molding", name: "Moulures" },
      { key: "cornice", name: "Corniches" },
      { key: "wall_covering", name: "Revêtement mural" },
      { key: "textured_coating", name: "Enduit décoratif" },
      { key: "venetian_plaster", name: "Stuc vénitien" },
      { key: "suspended_ceiling", name: "Plafond suspendu" },
      { key: "acoustic_ceiling", name: "Plafond acoustique" },
      { key: "ceiling_painting", name: "Peinture plafond" },
      { key: "wall_smoothing", name: "Lissage murs" },
    ],
  },
  {
    key: "electrician",
    name: "Électricien",
    icon: "⚡",
    color: "bg-gradient-to-br from-yellow-100 to-amber-100",
    subcategories: [
      { key: "wiring", name: "Installation électrique" },
      { key: "panel_upgrade", name: "Tableau électrique" },
      { key: "lighting", name: "Éclairage" },
      { key: "outlets", name: "Prises & interrupteurs" },
      { key: "electric_repair", name: "Dépannage électrique" },
      { key: "rewiring", name: "Remise aux normes" },
      { key: "circuit_breaker", name: "Disjoncteur" },
      { key: "smoke_detector", name: "Détecteur fumée" },
      { key: "electric_heating", name: "Chauffage électrique" },
      { key: "water_heater_electric", name: "Chauffe-eau électrique" },
      { key: "ceiling_light", name: "Plafonnier" },
      { key: "led_installation", name: "Installation LED" },
      { key: "dimmer", name: "Variateur" },
      { key: "outdoor_lighting_install", name: "Éclairage extérieur" },
      { key: "security_lighting", name: "Éclairage sécurité" },
      { key: "doorbell", name: "Sonnette" },
      { key: "electric_gate_install", name: "Portail électrique" },
      { key: "ev_charger", name: "Borne recharge" },
      { key: "solar_panels", name: "Panneaux solaires" },
      { key: "home_automation", name: "Domotique" },
    ],
  },
  {
    key: "plumbing",
    name: "Plombier",
    icon: "🚰",
    color: "bg-gradient-to-br from-blue-100 to-cyan-100",
    subcategories: [
      { key: "pipe_install", name: "Installation tuyauterie" },
      { key: "leak_repair", name: "Réparation fuite" },
      { key: "bathroom", name: "Salle de bain" },
      { key: "heating", name: "Chauffage" },
      { key: "drain_cleaning", name: "Débouchage" },
      { key: "toilet_install", name: "Installation WC" },
      { key: "sink_install", name: "Installation lavabo" },
      { key: "shower_install", name: "Installation douche" },
      { key: "bathtub_install", name: "Installation baignoire" },
      { key: "faucet_repair", name: "Réparation robinet" },
      { key: "water_heater", name: "Chauffe-eau" },
      { key: "boiler", name: "Chaudière" },
      { key: "radiator", name: "Radiateur" },
      { key: "underfloor_heating", name: "Chauffage sol" },
      { key: "pipe_replacement", name: "Remplacement tuyaux" },
      { key: "sewer_line", name: "Canalisation" },
      { key: "water_softener", name: "Adoucisseur eau" },
      { key: "water_filter", name: "Filtre eau" },
      { key: "sump_pump", name: "Pompe relevage" },
      { key: "gas_installation", name: "Installation gaz" },
    ],
  },
  {
    key: "painter",
    name: "Peintre",
    icon: "🎨",
    color: "bg-gradient-to-br from-pink-100 to-rose-100",
    subcategories: [
      { key: "interior_paint", name: "Peinture intérieure" },
      { key: "exterior_paint", name: "Peinture extérieure" },
      { key: "decorative", name: "Peinture décorative" },
      { key: "spray_paint", name: "Peinture au pistolet" },
      { key: "wood_stain", name: "Lasure bois" },
      { key: "ceiling_paint", name: "Peinture plafond" },
      { key: "wall_paint", name: "Peinture murs" },
      { key: "door_paint", name: "Peinture portes" },
      { key: "window_paint", name: "Peinture fenêtres" },
      { key: "radiator_paint", name: "Peinture radiateurs" },
      { key: "floor_paint", name: "Peinture sol" },
      { key: "epoxy_paint", name: "Peinture époxy" },
      { key: "anti_mold", name: "Peinture anti-moisissure" },
      { key: "wallpaper_removal", name: "Dépose papier peint" },
      { key: "wall_preparation", name: "Préparation murs" },
      { key: "sanding", name: "Ponçage" },
      { key: "varnish", name: "Vernis" },
      { key: "lacquer", name: "Laque" },
      { key: "color_consultation", name: "Conseil couleur" },
    ],
  },
  {
    key: "furniture",
    name: "Meubles",
    icon: "🛋️",
    color: "bg-gradient-to-br from-brown-100 to-amber-100",
    subcategories: [
      { key: "assembly", name: "Montage meubles" },
      { key: "custom_furniture", name: "Meubles sur mesure" },
      { key: "furniture_repair", name: "Réparation meubles" },
      { key: "kitchen_install", name: "Installation cuisine" },
      { key: "upholstery", name: "Tapisserie" },
      { key: "ikea_assembly", name: "Montage IKEA" },
      { key: "wardrobe_install", name: "Installation armoire" },
      { key: "shelving", name: "Étagères" },
      { key: "bookcase", name: "Bibliothèque" },
      { key: "desk_assembly", name: "Montage bureau" },
      { key: "bed_assembly", name: "Montage lit" },
      { key: "dresser_assembly", name: "Montage commode" },
      { key: "furniture_restoration", name: "Restauration meubles" },
      { key: "furniture_refinishing", name: "Rénovation meubles" },
      { key: "chair_repair", name: "Réparation chaise" },
      { key: "table_repair", name: "Réparation table" },
      { key: "cabinet_making", name: "Ébénisterie" },
      { key: "closet_organizer", name: "Dressing" },
      { key: "furniture_moving", name: "Déplacement meubles" },
    ],
  },
  {
    key: "automotive",
    name: "Automobile",
    icon: "🚗",
    color: "bg-gradient-to-br from-red-100 to-pink-100",
    subcategories: [
      { key: "car_repair", name: "Réparation auto" },
      { key: "maintenance", name: "Entretien" },
      { key: "body_work", name: "Carrosserie" },
      { key: "detailing", name: "Nettoyage auto" },
      { key: "tire_service", name: "Pneus" },
      { key: "oil_change", name: "Vidange" },
      { key: "brake_repair", name: "Freins" },
      { key: "engine_repair", name: "Moteur" },
      { key: "transmission", name: "Transmission" },
      { key: "battery", name: "Batterie" },
      { key: "air_conditioning", name: "Climatisation" },
      { key: "exhaust", name: "Échappement" },
      { key: "suspension", name: "Suspension" },
      { key: "wheel_alignment", name: "Parallélisme" },
      { key: "windshield", name: "Pare-brise" },
      { key: "car_diagnostic", name: "Diagnostic" },
      { key: "car_wash", name: "Lavage auto" },
      { key: "waxing", name: "Lustrage" },
      { key: "interior_cleaning", name: "Nettoyage intérieur" },
    ],
  },
  {
    key: "garden",
    name: "Jardin",
    icon: "�",
    color: "bg-gradient-to-br from-lime-100 to-green-100",
    subcategories: [
      { key: "lawn_mowing", name: "Tonte pelouse" },
      { key: "tree_pruning", name: "Élagage" },
      { key: "landscaping", name: "Aménagement paysager" },
      { key: "hedge_trimming", name: "Taille haies" },
      { key: "garden_maintenance", name: "Entretien jardin" },
      { key: "tree_removal", name: "Abattage arbre" },
      { key: "stump_removal", name: "Dessouchage" },
      { key: "lawn_care", name: "Entretien pelouse" },
      { key: "fertilization", name: "Fertilisation" },
      { key: "weed_control", name: "Désherbage" },
      { key: "irrigation", name: "Arrosage automatique" },
      { key: "garden_design", name: "Conception jardin" },
      { key: "planting", name: "Plantation" },
      { key: "mulching", name: "Paillage" },
      { key: "leaf_removal", name: "Ramassage feuilles" },
      { key: "garden_cleanup", name: "Nettoyage jardin" },
      { key: "vegetable_garden", name: "Potager" },
      { key: "flower_bed", name: "Massif fleurs" },
      { key: "garden_lighting", name: "Éclairage jardin" },
    ],
  },
  {
    key: "events",
    name: "Événements",
    icon: "🎉",
    color: "bg-gradient-to-br from-purple-100 to-pink-100",
    subcategories: [
      { key: "wedding", name: "Mariage" },
      { key: "birthday", name: "Anniversaire" },
      { key: "catering", name: "Traiteur" },
      { key: "dj_music", name: "DJ & Musique" },
      { key: "decoration", name: "Décoration événement" },
      { key: "event_planning", name: "Organisation événement" },
      { key: "photographer", name: "Photographe" },
      { key: "videographer", name: "Vidéaste" },
      { key: "florist", name: "Fleuriste" },
      { key: "wedding_planner", name: "Wedding planner" },
      { key: "venue_rental", name: "Location salle" },
      { key: "tent_rental", name: "Location chapiteau" },
      { key: "furniture_rental", name: "Location mobilier" },
      { key: "lighting_rental", name: "Location éclairage" },
      { key: "sound_system", name: "Sonorisation" },
      { key: "entertainment", name: "Animation" },
      { key: "magician", name: "Magicien" },
      { key: "clown", name: "Clown" },
      { key: "face_painting", name: "Maquillage enfants" },
    ],
  },
  {
    key: "projects",
    name: "Projets",
    icon: "📝",
    color: "bg-gradient-to-br from-indigo-100 to-blue-100",
    subcategories: [
      { key: "renovation", name: "Rénovation" },
      { key: "extension", name: "Extension" },
      { key: "conversion", name: "Aménagement combles" },
      { key: "bathroom_reno", name: "Rénovation salle de bain" },
      { key: "kitchen_reno", name: "Rénovation cuisine" },
      { key: "home_renovation", name: "Rénovation maison" },
      { key: "apartment_renovation", name: "Rénovation appartement" },
      { key: "basement_finishing", name: "Aménagement sous-sol" },
      { key: "attic_conversion", name: "Aménagement grenier" },
      { key: "garage_conversion", name: "Aménagement garage" },
      { key: "room_addition", name: "Ajout pièce" },
      { key: "second_floor", name: "Surélévation" },
      { key: "balcony", name: "Balcon" },
      { key: "veranda", name: "Véranda" },
      { key: "conservatory", name: "Jardin d'hiver" },
      { key: "home_theater", name: "Home cinéma" },
      { key: "wine_cellar", name: "Cave à vin" },
      { key: "sauna", name: "Sauna" },
      { key: "accessibility", name: "Accessibilité PMR" },
    ],
  },
  {
    key: "cleaning",
    name: "Nettoyage",
    icon: "🧹",
    color: "bg-gradient-to-br from-cyan-100 to-sky-100",
    subcategories: [
      { key: "house_cleaning", name: "Ménage maison" },
      { key: "deep_cleaning", name: "Grand nettoyage" },
      { key: "window_cleaning", name: "Nettoyage vitres" },
      { key: "carpet_cleaning", name: "Nettoyage tapis" },
      { key: "move_cleaning", name: "Nettoyage fin de bail" },
      { key: "regular_cleaning", name: "Ménage régulier" },
      { key: "office_cleaning", name: "Nettoyage bureau" },
      { key: "after_party", name: "Nettoyage après fête" },
      { key: "spring_cleaning", name: "Nettoyage printemps" },
      { key: "upholstery_cleaning", name: "Nettoyage canapé" },
      { key: "mattress_cleaning", name: "Nettoyage matelas" },
      { key: "oven_cleaning", name: "Nettoyage four" },
      { key: "fridge_cleaning", name: "Nettoyage frigo" },
      { key: "pressure_washing", name: "Nettoyage haute pression" },
      { key: "gutter_cleaning", name: "Nettoyage gouttières" },
      { key: "chimney_sweep", name: "Ramonage" },
      { key: "disinfection", name: "Désinfection" },
      { key: "mold_removal", name: "Traitement moisissures" },
      { key: "ironing", name: "Repassage" },
    ],
  },
  {
    key: "education",
    name: "Formation",
    icon: "📚",
    color: "bg-gradient-to-br from-blue-100 to-indigo-100",
    subcategories: [
      { key: "tutoring", name: "Cours particuliers" },
      { key: "language", name: "Cours de langue" },
      { key: "music_lessons", name: "Cours de musique" },
      { key: "sports_coaching", name: "Coaching sportif" },
      { key: "art_lessons", name: "Cours d'art" },
      { key: "math_tutoring", name: "Cours maths" },
      { key: "french_tutoring", name: "Cours français" },
      { key: "english_lessons", name: "Cours anglais" },
      { key: "spanish_lessons", name: "Cours espagnol" },
      { key: "german_lessons", name: "Cours allemand" },
      { key: "piano_lessons", name: "Cours piano" },
      { key: "guitar_lessons", name: "Cours guitare" },
      { key: "violin_lessons", name: "Cours violon" },
      { key: "singing_lessons", name: "Cours chant" },
      { key: "dance_lessons", name: "Cours danse" },
      { key: "yoga", name: "Yoga" },
      { key: "pilates", name: "Pilates" },
      { key: "personal_trainer", name: "Coach personnel" },
      { key: "nutrition", name: "Nutrition" },
    ],
  },
  {
    key: "transport",
    name: "Transport",
    icon: "🚚",
    color: "bg-gradient-to-br from-orange-100 to-amber-100",
    subcategories: [
      { key: "moving", name: "Déménagement" },
      { key: "delivery", name: "Livraison" },
      { key: "courier", name: "Coursier" },
      { key: "furniture_transport", name: "Transport meubles" },
      { key: "waste_removal", name: "Évacuation déchets" },
      { key: "moving_company", name: "Déménageur" },
      { key: "packing", name: "Emballage" },
      { key: "storage", name: "Garde-meuble" },
      { key: "piano_moving", name: "Déménagement piano" },
      { key: "office_moving", name: "Déménagement bureau" },
      { key: "international_moving", name: "Déménagement international" },
      { key: "junk_removal", name: "Débarras" },
      { key: "recycling", name: "Recyclage" },
      { key: "bulky_waste", name: "Encombrants" },
      { key: "green_waste", name: "Déchets verts" },
      { key: "construction_debris", name: "Gravats" },
      { key: "appliance_removal", name: "Enlèvement électroménager" },
      { key: "furniture_disposal", name: "Enlèvement meubles" },
    ],
  },
  {
    key: "business",
    name: "Entreprises",
    icon: "🏢",
    color: "bg-gradient-to-br from-slate-100 to-zinc-100",
    subcategories: [
      { key: "accounting", name: "Comptabilité" },
      { key: "consulting", name: "Conseil" },
      { key: "marketing", name: "Marketing" },
      { key: "hr", name: "Ressources humaines" },
      { key: "admin", name: "Administration" },
      { key: "bookkeeping_business", name: "Tenue comptable" },
      { key: "tax_filing", name: "Déclarations fiscales" },
      { key: "payroll", name: "Paie" },
      { key: "business_plan", name: "Business plan" },
      { key: "strategy", name: "Stratégie" },
      { key: "digital_marketing", name: "Marketing digital" },
      { key: "social_media", name: "Réseaux sociaux" },
      { key: "seo_services", name: "SEO" },
      { key: "advertising", name: "Publicité" },
      { key: "branding", name: "Image de marque" },
      { key: "recruitment", name: "Recrutement" },
      { key: "training", name: "Formation" },
      { key: "legal_services", name: "Services juridiques" },
      { key: "insurance_services", name: "Assurances" },
    ],
  },
  {
    key: "installation_repair",
    name: "Réparation",
    icon: "🛠️",
    color: "bg-gradient-to-br from-gray-100 to-slate-100",
    subcategories: [
      { key: "appliance_repair", name: "Électroménager" },
      { key: "computer_repair", name: "Informatique" },
      { key: "phone_repair", name: "Téléphone" },
      { key: "watch_repair", name: "Horlogerie" },
      { key: "shoe_repair", name: "Cordonnerie" },
      { key: "washing_machine", name: "Lave-linge" },
      { key: "dishwasher", name: "Lave-vaisselle" },
      { key: "refrigerator", name: "Réfrigérateur" },
      { key: "oven_repair", name: "Four" },
      { key: "microwave", name: "Micro-ondes" },
      { key: "dryer", name: "Sèche-linge" },
      { key: "laptop_repair", name: "Ordinateur portable" },
      { key: "desktop_repair", name: "PC bureau" },
      { key: "tablet_repair", name: "Tablette" },
      { key: "screen_repair", name: "Écran" },
      { key: "data_recovery", name: "Récupération données" },
      { key: "virus_removal", name: "Suppression virus" },
      { key: "jewelry_repair", name: "Bijouterie" },
      { key: "leather_repair", name: "Maroquinerie" },
    ],
  },
  {
    key: "financial",
    name: "Finance",
    icon: "💰",
    color: "bg-gradient-to-br from-green-100 to-emerald-100",
    subcategories: [
      { key: "tax_prep", name: "Déclaration impôts" },
      { key: "bookkeeping", name: "Tenue de livres" },
      { key: "financial_advice", name: "Conseil financier" },
      { key: "insurance", name: "Assurance" },
      { key: "investment", name: "Investissement" },
      { key: "tax_planning", name: "Planification fiscale" },
      { key: "wealth_management", name: "Gestion patrimoine" },
      { key: "retirement_planning", name: "Retraite" },
      { key: "mortgage_broker", name: "Courtier crédit" },
      { key: "loan_advisor", name: "Conseil prêt" },
      { key: "financial_planning", name: "Planification financière" },
      { key: "estate_planning", name: "Succession" },
      { key: "life_insurance", name: "Assurance vie" },
      { key: "home_insurance", name: "Assurance habitation" },
      { key: "car_insurance", name: "Assurance auto" },
      { key: "health_insurance", name: "Mutuelle" },
      { key: "stock_trading", name: "Bourse" },
      { key: "crypto", name: "Cryptomonnaie" },
    ],
  },
  {
    key: "legal",
    name: "Juridique",
    icon: "⚖️",
    color: "bg-gradient-to-br from-blue-100 to-cyan-100",
    subcategories: [
      { key: "contracts", name: "Contrats" },
      { key: "legal_advice", name: "Conseil juridique" },
      { key: "notary", name: "Notaire" },
      { key: "translation", name: "Traduction juridique" },
      { key: "mediation", name: "Médiation" },
      { key: "lawyer", name: "Avocat" },
      { key: "divorce", name: "Divorce" },
      { key: "family_law", name: "Droit famille" },
      { key: "real_estate_law", name: "Droit immobilier" },
      { key: "business_law", name: "Droit affaires" },
      { key: "labor_law", name: "Droit travail" },
      { key: "immigration", name: "Immigration" },
      { key: "will", name: "Testament" },
      { key: "power_attorney", name: "Procuration" },
      { key: "trademark", name: "Marque" },
      { key: "patent", name: "Brevet" },
      { key: "copyright", name: "Droit auteur" },
      { key: "litigation", name: "Contentieux" },
    ],
  },
  {
    key: "remote",
    name: "À distance",
    icon: "�",
    color: "bg-gradient-to-br from-purple-100 to-violet-100",
    subcategories: [
      { key: "web_dev", name: "Développement web" },
      { key: "graphic_design", name: "Design graphique" },
      { key: "writing", name: "Rédaction" },
      { key: "virtual_assistant", name: "Assistant virtuel" },
      { key: "data_entry", name: "Saisie de données" },
      { key: "web_design", name: "Design web" },
      { key: "app_development", name: "Développement app" },
      { key: "wordpress", name: "WordPress" },
      { key: "shopify", name: "Shopify" },
      { key: "logo_design", name: "Logo" },
      { key: "branding_design", name: "Identité visuelle" },
      { key: "illustration", name: "Illustration" },
      { key: "video_editing", name: "Montage vidéo" },
      { key: "animation", name: "Animation" },
      { key: "copywriting", name: "Copywriting" },
      { key: "translation_service", name: "Traduction" },
      { key: "proofreading", name: "Relecture" },
      { key: "transcription", name: "Transcription" },
      { key: "voiceover", name: "Voix off" },
    ],
  },
  {
    key: "health_beauty",
    name: "Beauté & bien-être",
    icon: "💅",
    color: "bg-gradient-to-br from-pink-100 to-fuchsia-100",
    subcategories: [
      { key: "hairdressing", name: "Coiffure" },
      { key: "massage", name: "Massage" },
      { key: "manicure", name: "Manucure" },
      { key: "makeup", name: "Maquillage" },
      { key: "personal_training", name: "Coach personnel" },
      { key: "haircut", name: "Coupe cheveux" },
      { key: "coloring", name: "Coloration" },
      { key: "highlights", name: "Mèches" },
      { key: "hair_treatment", name: "Soin cheveux" },
      { key: "braiding", name: "Tresses" },
      { key: "barber", name: "Barbier" },
      { key: "pedicure", name: "Pédicure" },
      { key: "nail_art", name: "Nail art" },
      { key: "waxing", name: "Épilation" },
      { key: "facial", name: "Soin visage" },
      { key: "spa", name: "Spa" },
      { key: "aromatherapy", name: "Aromathérapie" },
      { key: "reflexology", name: "Réflexologie" },
      { key: "makeup_artist", name: "Maquilleur professionnel" },
    ],
  },
  {
    key: "childcare",
    name: "Garde d'enfants",
    icon: "👶",
    color: "bg-gradient-to-br from-yellow-100 to-orange-100",
    subcategories: [
      { key: "babysitting", name: "Baby-sitting" },
      { key: "nanny", name: "Nounou" },
      { key: "after_school", name: "Garde périscolaire" },
      { key: "tutoring_kids", name: "Aide aux devoirs" },
      { key: "activities", name: "Activités enfants" },
      { key: "daycare", name: "Crèche" },
      { key: "night_nanny", name: "Garde nuit" },
      { key: "newborn_care", name: "Garde bébé" },
      { key: "toddler_care", name: "Garde bambin" },
      { key: "school_pickup", name: "Sortie école" },
      { key: "homework_help", name: "Devoirs" },
      { key: "reading_tutor", name: "Lecture" },
      { key: "crafts", name: "Bricolage" },
      { key: "outdoor_play", name: "Jeux extérieur" },
      { key: "swimming_lessons", name: "Natation" },
      { key: "music_kids", name: "Éveil musical" },
      { key: "storytelling", name: "Contes" },
      { key: "cooking_kids", name: "Cuisine enfants" },
    ],
  },
  {
    key: "pets",
    name: "Animaux",
    icon: "�",
    color: "bg-gradient-to-br from-lime-100 to-emerald-100",
    subcategories: [
      { key: "dog_walking", name: "Promenade chien" },
      { key: "pet_sitting", name: "Garde animaux" },
      { key: "grooming", name: "Toilettage" },
      { key: "pet_training", name: "Dressage" },
      { key: "vet_transport", name: "Transport vétérinaire" },
      { key: "dog_sitting", name: "Garde chien" },
      { key: "cat_sitting", name: "Garde chat" },
      { key: "pet_boarding", name: "Pension animaux" },
      { key: "dog_training", name: "Éducation canine" },
      { key: "puppy_training", name: "Éducation chiot" },
      { key: "behavior_training", name: "Comportementaliste" },
      { key: "dog_grooming", name: "Toilettage chien" },
      { key: "cat_grooming", name: "Toilettage chat" },
      { key: "nail_trimming", name: "Coupe griffes" },
      { key: "pet_photography", name: "Photo animaux" },
      { key: "aquarium_maintenance", name: "Entretien aquarium" },
      { key: "horse_care", name: "Soins chevaux" },
      { key: "farm_sitting", name: "Garde ferme" },
    ],
  },
  {
    key: "elderly_care",
    name: "Aide aux seniors",
    icon: "🧓",
    color: "bg-gradient-to-br from-teal-100 to-cyan-100",
    subcategories: [
      { key: "companion", name: "Compagnie" },
      { key: "home_help", name: "Aide à domicile" },
      { key: "shopping", name: "Courses" },
      { key: "medical_transport", name: "Transport médical" },
      { key: "meal_prep", name: "Préparation repas" },
      { key: "personal_care", name: "Soins personnels" },
      { key: "medication_reminder", name: "Rappel médicaments" },
      { key: "doctor_appointment", name: "Rendez-vous médical" },
      { key: "light_housekeeping", name: "Ménage léger" },
      { key: "laundry_help", name: "Aide lessive" },
      { key: "meal_delivery", name: "Livraison repas" },
      { key: "grocery_shopping", name: "Courses alimentaires" },
      { key: "errands", name: "Commissions" },
      { key: "reading_companion", name: "Lecture" },
      { key: "games_companion", name: "Jeux" },
      { key: "walking_companion", name: "Promenade" },
      { key: "respite_care", name: "Répit aidant" },
      { key: "night_care", name: "Garde nuit" },
    ],
  },
  {
    key: "it_web",
    name: "Informatique & web",
    icon: "💻",
    color: "bg-gradient-to-br from-blue-100 to-indigo-100",
    subcategories: [
      { key: "website", name: "Création site web" },
      { key: "seo", name: "Référencement SEO" },
      { key: "it_support", name: "Support informatique" },
      { key: "network", name: "Réseau" },
      { key: "cybersecurity", name: "Cybersécurité" },
      { key: "web_hosting", name: "Hébergement web" },
      { key: "domain_registration", name: "Nom de domaine" },
      { key: "email_setup", name: "Configuration email" },
      { key: "ecommerce", name: "E-commerce" },
      { key: "cms", name: "CMS" },
      { key: "database", name: "Base de données" },
      { key: "api_development", name: "Développement API" },
      { key: "mobile_app", name: "Application mobile" },
      { key: "software_development", name: "Développement logiciel" },
      { key: "cloud_services", name: "Services cloud" },
      { key: "backup", name: "Sauvegarde" },
      { key: "server_management", name: "Gestion serveur" },
      { key: "vpn", name: "VPN" },
      { key: "firewall", name: "Pare-feu" },
    ],
  },
  {
    key: "delivery",
    name: "Livraison",
    icon: "📦",
    color: "bg-gradient-to-br from-orange-100 to-red-100",
    subcategories: [
      { key: "food_delivery", name: "Livraison repas" },
      { key: "grocery", name: "Courses" },
      { key: "package", name: "Colis" },
      { key: "pharmacy", name: "Pharmacie" },
      { key: "express", name: "Livraison express" },
      { key: "restaurant_delivery", name: "Livraison restaurant" },
      { key: "fast_food", name: "Fast-food" },
      { key: "pizza_delivery", name: "Livraison pizza" },
      { key: "sushi_delivery", name: "Livraison sushi" },
      { key: "bakery_delivery", name: "Livraison boulangerie" },
      { key: "supermarket", name: "Supermarché" },
      { key: "organic_delivery", name: "Livraison bio" },
      { key: "wine_delivery", name: "Livraison vin" },
      { key: "flowers_delivery", name: "Livraison fleurs" },
      { key: "gift_delivery", name: "Livraison cadeaux" },
      { key: "document_delivery", name: "Livraison documents" },
      { key: "same_day", name: "Livraison jour même" },
      { key: "overnight", name: "Livraison nuit" },
    ],
  },
  {
    key: "other",
    name: "Autre",
    icon: "📋",
    color: "bg-gradient-to-br from-gray-100 to-slate-100",
    subcategories: [
      { key: "photography", name: "Photographie" },
      { key: "video", name: "Vidéo" },
      { key: "printing", name: "Impression" },
      { key: "locksmith", name: "Serrurier" },
      { key: "misc", name: "Services divers" },
      { key: "portrait_photography", name: "Portrait" },
      { key: "wedding_photography", name: "Mariage photo" },
      { key: "event_photography", name: "Événement photo" },
      { key: "product_photography", name: "Photo produit" },
      { key: "real_estate_photography", name: "Photo immobilier" },
      { key: "drone_photography", name: "Photo drone" },
      { key: "video_production", name: "Production vidéo" },
      { key: "wedding_video", name: "Vidéo mariage" },
      { key: "corporate_video", name: "Vidéo corporate" },
      { key: "printing_services", name: "Imprimerie" },
      { key: "business_cards", name: "Cartes visite" },
      { key: "flyers", name: "Flyers" },
      { key: "banners", name: "Bannières" },
      { key: "emergency_locksmith", name: "Serrurier urgence" },
      { key: "key_cutting", name: "Reproduction clés" },
      { key: "lock_installation", name: "Installation serrure" },
      { key: "safe_opening", name: "Ouverture coffre" },
    ],
  },
];

const popularCities = [
  {
    name: "Paris",
    region: "Île-de-France",
    tasksLabel: "Disponible maintenant",
    active: true,
  },
  // Prochainement disponibles - expansion prévue
  /*
  {
    name: "Lyon",
    region: "Auvergne-Rhône-Alpes",
    tasksLabel: "Bientôt disponible",
    active: false,
  },
  {
    name: "Marseille",
    region: "Provence-Alpes-Côte d'Azur",
    tasksLabel: "Bientôt disponible",
    active: false,
  },
  {
    name: "Toulouse",
    region: "Occitanie",
    tasksLabel: "Bientôt disponible",
    active: false,
  },
  {
    name: "Bordeaux",
    region: "Nouvelle-Aquitaine",
    tasksLabel: "Bientôt disponible",
    active: false,
  },
  {
    name: "Lille",
    region: "Hauts-de-France",
    tasksLabel: "Bientôt disponible",
    active: false,
  },
  */
];

const popularTasks = [
  {
    title: "Montage d'un meuble IKEA",
    city: "Paris, Île-de-France",
    budget: "50€ - 80€",
  },
  {
    title: "Nettoyage d'un appartement 2 pièces",
    city: "Paris, Île-de-France",
    budget: "60€ - 90€",
  },
  {
    title: "Création d'un site vitrine simple",
    city: "Paris / À distance",
    budget: "300€ - 500€",
  },
  {
    title: "Réparation d'une fuite d'eau",
    city: "Paris, Île-de-France",
    budget: "80€ - 150€",
  },
  {
    title: "Cours de mathématiques niveau lycée",
    city: "Paris / À distance",
    budget: "25€ - 40€/h",
  },
  {
    title: "Déménagement studio 30m²",
    city: "Paris, Île-de-France",
    budget: "200€ - 350€",
  },
  {
    title: "Garde de chat pendant vacances",
    city: "Paris, Île-de-France",
    budget: "15€ - 25€/jour",
  },
  {
    title: "Installation d'une prise électrique",
    city: "Paris, Île-de-France",
    budget: "60€ - 100€",
  },
  {
    title: "Tonte de pelouse 100m²",
    city: "Banlieue parisienne",
    budget: "40€ - 60€",
  },
];

// Category name mapping for display
const categoryNames: Record<string, string> = {
  construction: "Construction",
  roof_facade: "Toit & façade",
  garage_gates: "Garages",
  installations: "Installations",
  outdoor: "Extérieur",
  floors: "Sols",
  walls_ceiling: "Murs",
  electrician: "Électricien",
  plumbing: "Plombier",
  painter: "Peintre",
  furniture: "Meubles",
  automotive: "Automobile",
  garden: "Jardin",
  events: "Événements",
  projects: "Projets",
  renovation: "Rénovation",
  cleaning: "Nettoyage",
  education: "Formation",
  transport: "Transport",
  business: "Entreprises",
  installation_repair: "Réparation",
  financial: "Finance",
  legal: "Juridique",
  remote: "À distance",
  health_beauty: "Beauté",
  childcare: "Enfants",
  pets: "Animaux",
  elderly_care: "Seniors",
  it_web: "Informatique",
  delivery: "Livraison",
  moving: "Déménagement",
  other: "Autre",
};

// Category icons for display
const categoryIcons: Record<string, string> = {
  construction: "🏗️",
  roof_facade: "🏡",
  garage_gates: "🚧",
  installations: "⚙️",
  outdoor: "🌳",
  floors: "🧱",
  walls_ceiling: "🧱",
  electrician: "⚡",
  plumbing: "🚰",
  painter: "🎨",
  furniture: "🛋️",
  automotive: "🚗",
  garden: "🌿",
  events: "🎉",
  projects: "📝",
  renovation: "🏠",
  cleaning: "🧹",
  education: "📚",
  transport: "🚚",
  business: "🏢",
  installation_repair: "🛠️",
  financial: "💰",
  legal: "⚖️",
  remote: "💻",
  health_beauty: "💅",
  childcare: "👶",
  pets: "🐾",
  elderly_care: "🧓",
  it_web: "💻",
  delivery: "📦",
  moving: "📦",
  other: "📋",
};

export default function Home() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [topPrestataires, setTopPrestataires] = useState<TopPrestataire[]>([]);
  const [latestTasks, setLatestTasks] = useState<LatestTask[]>([]);
  const [videoTestimonials, setVideoTestimonials] = useState<VideoTestimonial[]>([]);
  const [currentUser, setCurrentUser] = useState<{ id: number; role: string } | null>(null);
  const [taskCounts, setTaskCounts] = useState<Record<string, number>>({});
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [visibleTaskIndex, setVisibleTaskIndex] = useState(0);
  const [heroTask, setHeroTask] = useState("");
  const [heroCity, setHeroCity] = useState("");
  const [loading, setLoading] = useState(true);
  const [faqSearch, setFaqSearch] = useState("");
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [showScrollHint, setShowScrollHint] = useState(true);
  const [scrollPosition, setScrollPosition] = useState(0);

  // Animate popular tasks carousel
  useEffect(() => {
    const interval = setInterval(() => {
      setVisibleTaskIndex((prev) => (prev + 1) % popularTasks.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("prochepro_user");
      if (!raw) {
        setCurrentUser(null);
        return;
      }
      const parsed = JSON.parse(raw) as { id: number; role: string; name?: string; city?: string };
      if (parsed?.id && parsed?.role) {
        setCurrentUser({ id: parsed.id, role: parsed.role });
      }

      // Підставляємо місто користувача у поле пошуку, якщо воно є
      if (parsed?.city) {
        setHeroCity(parsed.city);
      }
    } catch {
      setCurrentUser(null);
    }
  }, []);

  useEffect(() => {
    async function fetchTopPrestataires() {
      try {
        const res = await fetch(`${API_BASE_URL}/api/prestataires/top?limit=3`);
        if (res.ok) {
          const data = await res.json();
          setTopPrestataires(data);
        }
      } catch {
        // ignore
      }
    }
    fetchTopPrestataires();
  }, []);

  // Завантажуємо категорії з API
  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await fetch(`${API_BASE_URL}/api/service-categories`);
        if (res.ok) {
          const data = await res.json();
          setCategories(data);
        } else {
          // Якщо API недоступний, використовуємо hardcoded категорії
          setCategories(categoriesWithSubs);
        }
      } catch {
        // Fallback на hardcoded категорії
        setCategories(categoriesWithSubs);
      }
    }
    fetchCategories();
  }, []);

  // Завантажуємо статистику завдань по категоріях/підкатегоріях
  useEffect(() => {
    async function fetchTaskCounts() {
      try {
        const res = await fetch(`${API_BASE_URL}/api/tasks/counts-by-category`);
        if (res.ok) {
          const data = await res.json();
          setTaskCounts(data);
        }
      } catch {
        // Ігноруємо помилки - лічильники необов'язкові
      }
    }
    fetchTaskCounts();
  }, []);

  // Автоматично сортуємо категорії по кількості завдань (динамічно)
  const sortedCategories = useMemo(() => {
    if (categories.length === 0 || Object.keys(taskCounts).length === 0) {
      return categories;
    }
    
    return [...categories].sort((a, b) => {
      // Підраховуємо загальну кількість завдань для кожної категорії
      const totalA = a.subcategories.reduce((sum, sub) => sum + (taskCounts[sub.key] || 0), 0);
      const totalB = b.subcategories.reduce((sum, sub) => sum + (taskCounts[sub.key] || 0), 0);
      
      // Сортуємо по спадаючій (більше завдань = вище в списку)
      return totalB - totalA;
    });
  }, [categories, taskCounts]);

  // Fetch latest tasks with auto-refresh
  useEffect(() => {
    async function fetchLatestTasks() {
      try {
        const res = await fetch(`${API_BASE_URL}/api/tasks?status=published&per_page=6&sort=-created_at`);
        if (res.ok) {
          const data = await res.json();
          setLatestTasks(data?.data ?? data ?? []);
        }
      } catch {
        // ignore
      }
    }
    fetchLatestTasks();
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchLatestTasks, 30000);
    return () => clearInterval(interval);
  }, []);

  // Fetch video testimonials
  useEffect(() => {
    async function fetchVideoTestimonials() {
      try {
        const res = await fetch(`${API_BASE_URL}/api/testimonials?limit=3`);
        if (res.ok) {
          const data = await res.json();
          setVideoTestimonials(data ?? []);
        }
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    }
    fetchVideoTestimonials();
  }, []);

  return (
    <>
      <main className="mx-auto max-w-full">
        {/* Hero + search */}
       <section className="relative grid gap-10 md:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] md:items-center overflow-hidden mt-[-40px] md:mt-[-64px] w-screen left-[calc(-50vw+50%)] md:w-full md:left-0 md:min-h-[600px]">
          {/* Background Image */}
          <div className="absolute inset-0 z-0">
            <Image
              src="/France-Paris-12.jpg"
              alt="Paris background"
              fill
              className="object-cover opacity-80"
              priority
            />
          </div>
          
          <div className="relative z-10 px-6 py-8 md:py-12">
            <h1 className="text-3xl font-semibold tracking-tight text-[#0F172A] md:text-4xl lg:text-5xl text-center md:text-left" style={{textShadow: '2px 2px 4px rgba(255, 255, 255, 0.9), -1px -1px 2px rgba(255, 255, 255, 0.9)'}}>
              Service de commande de services en ligne à Paris
            </h1>
            <div className="mt-6 rounded-2xl bg-transparent p-0">
              <form
                className="flex flex-col gap-3 md:flex-row md:items-end"
                onSubmit={(e) => {
                  e.preventDefault();

                  const query: Record<string, string> = {};
                  const trimmedTask = heroTask.trim();

                  if (trimmedTask) {
                    query.q = trimmedTask;
                  }

                  const search = new URLSearchParams(query).toString();
                  
                  // Логіка перенаправлення залежно від ролі
                  let target: string;
                  if (currentUser?.role === 'client') {
                    // Клієнт шукає виконавців
                    target = search
                      ? `/prestataires?${search}`
                      : "/prestataires";
                  } else {
                    // Виконавець або гість шукають оголошення
                    target = search
                      ? `/tasks/browse?${search}`
                      : "/tasks/browse";
                  }

                  router.push(target);
                }}
              >
                <div className="flex-1">
                  <input
                    type="text"
                    value={heroTask}
                    onChange={(e) => setHeroTask(e.target.value)}
                    placeholder={
                      currentUser?.role === 'client'
                        ? "Ex: Plombier, électricien, peintre..."
                        : "Ex: Montage meuble, ménage, plomberie..."
                    }
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-[#1E88E5] focus:ring-1 focus:ring-[#1E88E5]"
                  />
                </div>
                <button className="inline-flex items-center justify-center rounded-full bg-[#1E88E5] px-5 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-[#1565C0]">
                  {currentUser?.role === 'client'
                    ? "Trouver un prestataire"
                    : "Trouver une annonce"}
                </button>
              </form>
              <div className="mt-3 text-center">
                <a
                  href="#how-it-works"
                  onClick={(e) => {
                    e.preventDefault();
                    const element = document.getElementById('how-it-works');
                    if (element) {
                      const offset = 80;
                      const elementPosition = element.getBoundingClientRect().top;
                      const offsetPosition = elementPosition + window.pageYOffset - offset;
                      window.scrollTo({
                        top: offsetPosition,
                        behavior: 'smooth'
                      });
                    }
                  }}
                  className="inline-block px-3 py-1.5 rounded-lg bg-white/90 backdrop-blur-sm text-xs text-sky-600 hover:text-sky-700 hover:bg-white transition-colors shadow-sm"
                >
                  Comment ça marche?
                </a>
              </div>
            </div>

            {/* Security Block */}
            <div className="mt-6">
              <div className="flex items-center justify-center gap-2 mb-3">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 text-xs">🔒</span>
                <span className="text-sm md:text-sm font-semibold text-slate-800">Votre sécurité, notre priorité</span>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-3 md:gap-4">
                <div className="flex items-center gap-1.5 rounded-lg bg-white/90 backdrop-blur-sm px-3 py-1.5 shadow-sm">
                  <span className="text-base">💳</span>
                  <span className="text-[10px] md:text-xs font-medium text-slate-700">Paiement sécurisé</span>
                </div>
                <div className="flex items-center gap-1.5 rounded-lg bg-white/90 backdrop-blur-sm px-3 py-1.5 shadow-sm">
                  <span className="text-base">🪪</span>
                  <span className="text-[10px] md:text-xs font-medium text-slate-700">Profils vérifiés</span>
                </div>
                <div className="flex items-center gap-1.5 rounded-lg bg-white/90 backdrop-blur-sm px-3 py-1.5 shadow-sm">
                  <span className="text-base">💬</span>
                  <span className="text-[10px] md:text-xs font-medium text-slate-700">Support 24/7</span>
                </div>
              </div>
            </div>
          </div>

          <div className="relative hidden h-full md:flex items-center justify-center px-6 py-8 md:py-12">
            {/* Hero illustration */}
            <div className="relative">
              <div className="absolute -inset-4 rounded-full bg-gradient-to-br from-[#1E88E5]/20 via-[#29B6F6]/20 to-[#66BB6A]/20 blur-2xl" />
              <div className="relative rounded-3xl bg-transparent p-6">
                <div className="flex items-center gap-4 mb-4">
                  <Image
                    src="/logo.png"
                    alt="ProchePro"
                    width={48}
                    height={48}
                    className="h-12 w-12"
                  />
                  <div>
                    <h2 className="text-lg font-semibold text-[#0F172A]">ProchePro</h2>
                    <p className="text-xs text-slate-900 font-semibold">Marketplace de services</p>
                  </div>
                </div>

                <div className="space-y-2">
                  {[0, 1, 2].map((offset) => {
                    const taskIndex = (visibleTaskIndex + offset) % popularTasks.length;
                    const task = popularTasks[taskIndex];
                    const isFirst = offset === 0;
                    return (
                      <div
                        key={`${taskIndex}-${offset}`}
                        className={`rounded-xl border px-4 py-3 transition-all duration-500 ${
                          isFirst
                            ? "border-[#1E88E5] bg-[#E3F2FD]/50 shadow-sm" 
                            : "border-slate-100 bg-slate-50"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className={`h-2 w-2 rounded-full transition-colors duration-500 ${isFirst ? "bg-[#1E88E5]" : "bg-slate-300"}`} />
                          <span className="text-sm font-medium text-[#0F172A] truncate">{task.title}</span>
                        </div>
                        <div className="mt-1.5 flex items-center justify-between text-xs">
                          <span className="text-slate-500">{task.city}</span>
                          <span className="font-semibold text-[#1E88E5]">{task.budget}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-4 flex items-center justify-between rounded-xl bg-gradient-to-r from-emerald-50 to-cyan-50 px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">✓</span>
                    <span className="text-xs font-medium text-slate-700">+1 000 annonces/mois</span>
                  </div>
                  <div className="flex -space-x-2">
                    <div className="h-7 w-7 rounded-full bg-blue-200 ring-2 ring-white" />
                    <div className="h-7 w-7 rounded-full bg-emerald-200 ring-2 ring-white" />
                    <div className="h-7 w-7 rounded-full bg-violet-200 ring-2 ring-white" />
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-[10px] font-medium text-slate-600 ring-2 ring-white">+99</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Live Statistics */}
          <div className="relative z-10 px-6 pb-4 md:col-span-2 flex justify-center">
            <LiveStatistics className="justify-center" />
          </div>
          
          {/* CTA для створення оголошення - для гостей та клієнтів - в самому низу hero */}
          {(!currentUser || currentUser.role === 'client') && (
            <div className="relative z-10 flex justify-center px-6 pb-6 md:pb-12 md:col-span-2">
              <Link
                href="/tasks/new"
                className="group relative inline-flex items-center justify-center gap-2 md:gap-3 rounded-2xl bg-gradient-to-r from-blue-600 to-emerald-600 px-6 py-3 md:px-8 md:py-4 text-sm md:text-base font-bold text-white shadow-[0_4px_20px_rgba(6,182,212,0.4)] opacity-100 transition-all duration-300 hover:scale-105 hover:shadow-[0_6px_30px_rgba(6,182,212,0.6)] hover:from-blue-700 hover:to-emerald-700"
              >
                <div className="absolute inset-0 rounded-2xl bg-white opacity-0 group-hover:opacity-20 transition-opacity"></div>
                <svg className="h-5 w-5 md:h-6 md:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                </svg>
                <span>Publier une annonce</span>
                <div className="flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-white"></span>
                  <span className="h-1.5 w-1.5 rounded-full bg-white"></span>
                  <span className="h-1.5 w-1.5 rounded-full bg-white"></span>
                </div>
              </Link>
            </div>
          )}
        </section>

        {/* Sections removed: Latest Tasks and Top Prestataires */}
        {false && topPrestataires.length > 0 && (
          <section className="mt-16">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold tracking-tight text-[#0F172A] md:text-2xl">
                  Nos meilleurs prestataires
                </h2>
                <p className="mt-1 text-sm text-slate-600">
                  Les professionnels les mieux notés par notre communauté
                </p>
              </div>
              <Link
                href="/prestataires"
                className="group inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 px-3 py-1.5 text-xs font-medium text-white shadow-md transition-all hover:shadow-lg hover:from-emerald-600 hover:to-teal-700 whitespace-nowrap shrink-0 md:px-4 md:py-2 md:text-sm md:gap-2"
              >
                <span>Voir tous</span>
                <svg className="w-4 h-4 transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
            
            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {topPrestataires.map((prestataire) => (
                <Link
                  key={prestataire.id}
                  href={`/prestataires/${prestataire.id}`}
                  className="group relative overflow-hidden rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100 transition-all hover:-translate-y-1 hover:shadow-xl hover:ring-sky-200"
                >
                  {/* Verified badge */}
                  {prestataire.is_verified && (
                    <div className="absolute top-3 right-3">
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Vérifié
                      </span>
                    </div>
                  )}
                  
                  <div className="flex items-start gap-4">
                    <div className="relative">
                      <UserAvatar avatar={prestataire.avatar} name={prestataire.name} size="lg" />
                      {/* Rating badge */}
                      {prestataire.average_rating && (
                        <div className="absolute -bottom-1 -right-1 flex items-center gap-0.5 rounded-full bg-amber-400 px-1.5 py-0.5 text-xs font-bold text-white shadow-sm">
                          <span>★</span>
                          <span>{prestataire.average_rating}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-slate-900 group-hover:text-sky-600 transition-colors truncate">
                        {prestataire.company_name || prestataire.name}
                      </h3>
                      {prestataire.company_name && (
                        <p className="text-xs text-slate-500 truncate">{prestataire.name}</p>
                      )}
                      {prestataire.city && (
                        <p className="mt-0.5 text-xs text-slate-500 flex items-center gap-1">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          {prestataire.city}
                        </p>
                      )}
                      <p className="mt-1 text-xs text-slate-400">
                        {prestataire.reviews_count} avis
                      </p>
                    </div>
                  </div>
                  
                  {/* Bio */}
                  {prestataire.bio && (
                    <p className="mt-3 text-sm text-slate-600 line-clamp-2">
                      {prestataire.bio}
                    </p>
                  )}
                  
                  {/* Skills */}
                  {prestataire.skills.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {prestataire.skills.map((skill, i) => (
                        <span
                          key={i}
                          className="inline-block rounded-full bg-sky-50 px-2.5 py-0.5 text-xs font-medium text-sky-700"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  )}
                  
                  {/* CTA */}
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-xs text-slate-400">Voir le profil</span>
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-sky-50 text-sky-600 transition-all group-hover:bg-sky-500 group-hover:text-white">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Categories with Subcategories */}
        <section id="categories" className="mt-0 px-6 py-8 md:py-12">
          {/* Categories Grid with Subcategories */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
            {sortedCategories.map((category) => {
              const getCategoryUrl = () => {
                return `/tasks/browse?category=${category.key}`;
              };

              const isExpanded = expandedCategories.has(category.key);
              const visibleSubs = isExpanded ? category.subcategories : category.subcategories.slice(0, 5);
              const hasMore = category.subcategories.length > 5;

              const toggleExpand = () => {
                setExpandedCategories(prev => {
                  const newSet = new Set(prev);
                  if (newSet.has(category.key)) {
                    // Згортаємо поточну категорію
                    newSet.delete(category.key);
                  } else {
                    // Згортаємо всі інші категорії та розкриваємо тільки поточну
                    newSet.clear();
                    newSet.add(category.key);
                  }
                  return newSet;
                });
              };

              return (
                <div
                  key={category.key}
                  className="group rounded-xl bg-white p-3 md:p-4 shadow-sm ring-1 ring-slate-100 transition-all hover:shadow-md hover:ring-sky-200"
                >
                  {/* Category Header */}
                  <Link
                    href={getCategoryUrl()}
                    className="flex items-center gap-1.5 md:gap-2 mb-2 md:mb-3 group/header"
                  >
                    <span className={`flex h-8 w-8 md:h-10 md:w-10 items-center justify-center rounded-lg ${category.color} text-lg md:text-xl transition-all group-hover/header:scale-105 shrink-0`}>
                      {category.icon}
                    </span>
                    <h3 className="flex-1 font-semibold text-xs md:text-sm text-slate-900 group-hover/header:text-sky-600 transition-colors leading-tight">
                      {category.name}
                    </h3>
                    {(() => {
                      const categoryTotal = category.subcategories.reduce((sum, sub) => {
                        return sum + (taskCounts[sub.key] || 0);
                      }, 0);
                      if (categoryTotal > 0) {
                        return (
                          <span className="text-[10px] md:text-xs font-semibold text-sky-600 bg-sky-50 px-1.5 py-0.5 rounded-full shrink-0">
                            {categoryTotal}
                          </span>
                        );
                      }
                      return null;
                    })()}
                  </Link>

                  {/* Subcategories List */}
                  <div className="space-y-0.5">
                    {visibleSubs.map((sub) => {
                      const getSubcategoryUrl = () => {
                        return `/tasks/browse?category=${category.key}&subcategory=${sub.key}`;
                      };
                      
                      const count = taskCounts[sub.key] || 0;
                      return (
                        <Link
                          key={sub.key}
                          href={getSubcategoryUrl()}
                          className="flex items-center justify-between px-1.5 md:px-2 py-1 md:py-1.5 rounded text-[12px] md:text-xs text-slate-600 hover:bg-sky-50 hover:text-sky-700 transition-colors leading-tight"
                        >
                          <span>{sub.name}</span>
                          {count > 0 && (
                            <span className="text-[10px] font-semibold text-slate-400 group-hover:text-sky-600">
                              {count}
                            </span>
                          )}
                        </Link>
                      );
                    })}
                  </div>

                  {/* Show More/Less Button */}
                  {hasMore && (
                    <button
                      type="button"
                      onClick={toggleExpand}
                      className="mt-1.5 md:mt-2 w-full flex items-center justify-center gap-1 text-[10px] md:text-xs text-slate-400 hover:text-sky-600 font-medium transition-colors"
                    >
                      <span>{isExpanded ? 'Afficher moins' : 'Afficher plus'}</span>
                      <svg 
                        className={`w-2.5 h-2.5 md:w-3 md:h-3 transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  )}
                </div>
              );
            })}
          </div>
          
          {/* Quick stats */}
          <div className="mt-8 flex flex-wrap justify-center gap-6 md:gap-12 text-center">
            <div>
              <div className="text-2xl md:text-3xl font-bold text-sky-600">{categories.length}</div>
              <div className="text-xs text-slate-500">Catégories</div>
            </div>
            <div>
              <div className="text-2xl md:text-3xl font-bold text-sky-600">
                {categories.reduce((sum, cat) => sum + cat.subcategories.length, 0)}
              </div>
              <div className="text-xs text-slate-500">Sous-catégories</div>
            </div>
            <div>
              <div className="text-2xl md:text-3xl font-bold text-sky-600">100%</div>
              <div className="text-xs text-slate-500">Gratuit</div>
            </div>
          </div>
        </section>

        {/* Popular cities - REMOVED */}
        {/* <section className="mt-12">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-xl font-semibold tracking-tight text-[#0F172A] md:text-2xl">
              Grandes villes de France
            </h2>
            <Link
              href="/cities"
              className="group inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-600 px-3 py-1.5 text-xs font-medium text-white shadow-md transition-all hover:shadow-lg hover:from-amber-600 hover:to-orange-700 whitespace-nowrap shrink-0 md:px-4 md:py-2 md:text-sm md:gap-2"
            >
              <span>Toutes les villes</span>
              <svg className="w-4 h-4 transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
          <p className="mt-2 text-sm text-slate-600">
            Nous démarrons à Paris ! D&apos;autres villes seront bientôt disponibles.
          </p>

          <div className="mt-6 flex flex-col items-center gap-6">
            <button
              type="button"
              onClick={() => router.push(`/tasks/browse?city=${encodeURIComponent("Paris")}`)}
              className="relative overflow-hidden rounded-3xl shadow-xl ring-1 ring-slate-200 transition hover:-translate-y-1 hover:shadow-2xl w-full max-w-2xl group"
            >
              <div 
                className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                style={{ backgroundImage: "url('/paris.jpg')" }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
              
              <div className="relative z-10 flex flex-col items-center gap-3 p-8 md:p-12 text-center">
                <span className="inline-flex items-center gap-2 rounded-full bg-emerald-500 px-4 py-1.5 text-xs font-semibold text-white shadow-lg">
                  <span className="h-2 w-2 rounded-full bg-white animate-pulse" />
                  Disponible maintenant
                </span>
                <h3 className="text-3xl md:text-4xl font-bold text-white drop-shadow-lg">
                  Paris
                </h3>
                <p className="text-lg text-white/90 drop-shadow">
                  Île-de-France
                </p>
                <p className="mt-2 text-sm text-white/80 max-w-md">
                  Trouvez des prestataires de confiance dans la capitale et sa région
                </p>
                <span className="mt-4 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-900 shadow-lg transition group-hover:bg-[#1E88E5] group-hover:text-white">
                  Explorer les annonces à Paris
                  <svg className="h-4 w-4 transition group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </span>
              </div>
            </button>

            <div className="rounded-2xl bg-gradient-to-r from-slate-50 to-slate-100 border border-slate-200 p-5 text-center w-full max-w-2xl">
              <div className="flex items-center justify-center gap-2 text-slate-700 mb-2">
                <svg className="h-5 w-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="font-semibold">Prochainement</span>
              </div>
              <p className="text-sm text-slate-600">
                <span className="font-medium">Lyon, Marseille, Toulouse, Bordeaux, Lille</span> et d&apos;autres grandes villes arrivent bientôt !
              </p>
              <p className="text-xs text-slate-500 mt-2">
                Inscrivez-vous pour être informé du lancement dans votre ville.
              </p>
            </div>
          </div>
        </section> */}

        {/* How it works */}
        <section id="how-it-works" className="mt-16 rounded-3xl bg-gradient-to-br from-[#1E88E5] to-[#1565C0] p-8 md:p-10 text-white">
          {currentUser?.role === 'prestataire' ? (
            <>
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold md:text-3xl">
                  Développez votre activité avec ProchePro
                </h2>
                <p className="mt-2 text-white/80 max-w-2xl mx-auto">
                  Trouvez des chantiers près de chez vous et travaillez en toute sérénité.
                </p>
              </div>
              <div className="grid gap-6 md:grid-cols-4">
                <div className="rounded-2xl bg-white/10 backdrop-blur-sm p-6">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-3xl">
                    🛠️
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Créez votre profil professionnel</h3>
                  <p className="text-sm text-white/80">
                    Inscrivez-vous gratuitement et mettez en avant vos compétences. Un profil complet avec vos photos de réalisations et vos certifications attire 3 fois plus de clients.
                  </p>
                </div>
                <div className="rounded-2xl bg-white/10 backdrop-blur-sm p-6">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-3xl">
                    📲
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Recevez des missions qui vous correspondent</h3>
                  <p className="text-sm text-white/80">
                    Plus besoin de chercher des clients ! Recevez des notifications dès qu&apos;une annonce est publiée dans votre zone d&apos;intervention. Proposez vos tarifs en un clic.
                  </p>
                </div>
                <div className="rounded-2xl bg-white/10 backdrop-blur-sm p-6">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-3xl">
                    💳
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Garantie de paiement à 100%</h3>
                  <p className="text-sm text-white/80">
                    Fini les impayés ! Avant de commencer votre mission, le client dépose les fonds sur ProchePro. L&apos;argent vous est réservé et versé automatiquement dès que la mission est validée.
                  </p>
                </div>
                <div className="rounded-2xl bg-white/10 backdrop-blur-sm p-6">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-3xl">
                    🏆
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Gérez votre réputation</h3>
                  <p className="text-sm text-white/80">
                    Accumulez des avis positifs et grimpez dans les résultats de recherche. Plus vous travaillez bien, plus vous devenez un prestataire &quot;Top Pro&quot; avec une visibilité prioritaire.
                  </p>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold md:text-3xl">
                  Comment ça marche sur ProchePro ?
                </h2>
                <p className="mt-2 text-white/80 max-w-2xl mx-auto">
                  Trouvez un prestataire de confiance en moins de 2 minutes.
                </p>
              </div>
              <div className="grid gap-6 md:grid-cols-4">
                <div className="rounded-2xl bg-white/10 backdrop-blur-sm p-6">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-3xl">
                    📝
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Publiez votre besoin gratuitement</h3>
                  <p className="text-sm text-white/80">
                    Décrivez le service dont vous avez besoin : une fuite d&apos;eau à réparer, un montage de meuble ou du ménage. Ajoutez des photos et précisez votre budget. C&apos;est simple, rapide et sans engagement.
                  </p>
                </div>
                <div className="rounded-2xl bg-white/10 backdrop-blur-sm p-6">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-3xl">
                    💬
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Comparez les offres en temps réel</h3>
                  <p className="text-sm text-white/80">
                    Des prestataires qualifiés et proches de chez vous vous envoient leurs propositions. Consultez leurs profils, vérifiez leurs avis certifiés et discutez via notre messagerie sécurisée pour affiner les détails.
                  </p>
                </div>
                <div className="rounded-2xl bg-white/10 backdrop-blur-sm p-6">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-3xl">
                    🔒
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Réservez avec la Protection ProchePro</h3>
                  <p className="text-sm text-white/80">
                    Une fois votre choix fait, validez la mission. Votre paiement est consigné en toute sécurité par notre plateforme : l&apos;argent est bloqué et ne sera versé au prestataire que lorsque vous aurez confirmé que le travail est bien terminé.
                  </p>
                </div>
                <div className="rounded-2xl bg-white/10 backdrop-blur-sm p-6">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-3xl">
                    ⭐
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Notez et partagez votre expérience</h3>
                  <p className="text-sm text-white/80">
                    Une fois la prestation effectuée, évaluez votre professionnel. Votre avis aide la communauté ProchePro à maintenir un haut niveau de qualité et de confiance.
                  </p>
                </div>
              </div>
            </>
          )}
        </section>

        {/* Why Choose Us - Comparison Table */}
        <section className="mt-16">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold md:text-3xl text-slate-900 mb-3">
              Pourquoi nous choisir ?
            </h2>
            <p className="text-slate-600 max-w-2xl mx-auto">
              Comparez ProchePro avec les autres plateformes et découvrez la différence.
            </p>
          </div>

          {/* Mobile scroll hint */}
          {showScrollHint && (
            <div className="md:hidden text-center mb-3 animate-bounce">
              <p className="text-sm text-[#1E88E5] font-medium">
                👆 Swipez pour comparer →
              </p>
            </div>
          )}
          
          <div className="relative">
            {/* Scroll gradient overlay - only on mobile */}
            {showScrollHint && (
              <div className="md:hidden absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-white via-white/80 to-transparent pointer-events-none z-10 flex items-center justify-end pr-2">
                <span className="text-2xl text-[#1E88E5] animate-pulse">⟫</span>
              </div>
            )}

            <div 
              className="overflow-x-auto snap-x snap-mandatory scroll-smooth md:snap-none"
              onScroll={(e) => {
                const target = e.target as HTMLDivElement;
                setScrollPosition(target.scrollLeft);
                if (target.scrollLeft > 10 && showScrollHint) {
                  setShowScrollHint(false);
                }
              }}
            >
              <div className="inline-block min-w-full align-middle">
                <div className="overflow-hidden rounded-2xl border border-slate-200 shadow-xl">
                  <table className="min-w-full divide-y divide-slate-200">
                  <thead>
                    <tr className="bg-gradient-to-r from-slate-50 to-slate-100">
                      <th className="px-6 py-4 text-left text-sm font-bold text-slate-700">
                        Caractéristiques
                      </th>
                      <th className="px-6 py-4 text-center text-sm font-bold text-[#1E88E5] bg-blue-50/50">
                        <div className="flex items-center justify-center gap-2">
                          <span>ProchePro</span>
                          <span className="text-xl">🔵</span>
                        </div>
                      </th>
                      <th className="px-6 py-4 text-center text-sm font-bold text-slate-700">
                        AlloVoisins
                      </th>
                      <th className="px-6 py-4 text-center text-sm font-bold text-slate-700">
                        Wecasa / TaskRabbit
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white">
                    <tr className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-slate-900">
                        Frais de mise en relation
                      </td>
                      <td className="px-6 py-4 text-center bg-emerald-50/30">
                        <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-700">
                          <span className="text-lg">✅</span>
                          Gratuit pour publier
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="text-sm text-slate-600">Abonnement payant requis</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="text-sm text-slate-600">Commission élevée (jusqu&apos;à 25%)</span>
                      </td>
                    </tr>
                    <tr className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-slate-900">
                        Paiement Sécurisé (Escrow)
                      </td>
                      <td className="px-6 py-4 text-center bg-emerald-50/30">
                        <div className="flex flex-col items-center gap-1">
                          <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-700">
                            <span className="text-lg">✅</span>
                            Oui
                          </span>
                          <span className="text-xs text-slate-500">(Fonds bloqués)</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex items-center gap-1.5 text-sm font-medium text-red-600">
                          <span className="text-lg">❌</span>
                          Souvent de main à main
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-700">
                          <span className="text-lg">✅</span>
                          Oui
                        </span>
                      </td>
                    </tr>
                    <tr className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-slate-900">
                        Choix du prestataire
                      </td>
                      <td className="px-6 py-4 text-center bg-emerald-50/30">
                        <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-700">
                          <span className="text-lg">✅</span>
                          Libre & Transparent
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="text-sm text-slate-600">Limité par l&apos;abonnement</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="text-sm text-slate-600">Attribué par algorithme</span>
                      </td>
                    </tr>
                    <tr className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-slate-900">
                        Vérification des profils
                      </td>
                      <td className="px-6 py-4 text-center bg-emerald-50/30">
                        <div className="flex flex-col items-center gap-1">
                          <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-700">
                            <span className="text-lg">✅</span>
                            100% Vérifiés
                          </span>
                          <span className="text-xs text-slate-500">(ID check)</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="text-sm text-slate-600">Optionnel</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-700">
                          <span className="text-lg">✅</span>
                          Oui
                        </span>
                      </td>
                    </tr>
                    <tr className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-slate-900">
                        Support Client
                      </td>
                      <td className="px-6 py-4 text-center bg-emerald-50/30">
                        <div className="flex flex-col items-center gap-1">
                          <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-700">
                            <span className="text-lg">✅</span>
                            Réactif & Local
                          </span>
                          <span className="text-xs text-slate-500">(France)</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="text-sm text-slate-600">Automatisé</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="text-sm text-slate-600">International</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            </div>

            {/* Scroll position dots - mobile only */}
            <div className="md:hidden flex justify-center gap-2 mt-4">
              <div className={`h-2 w-2 rounded-full transition-all ${scrollPosition < 100 ? 'bg-[#1E88E5] w-4' : 'bg-slate-300'}`}></div>
              <div className={`h-2 w-2 rounded-full transition-all ${scrollPosition >= 100 && scrollPosition < 250 ? 'bg-[#1E88E5] w-4' : 'bg-slate-300'}`}></div>
              <div className={`h-2 w-2 rounded-full transition-all ${scrollPosition >= 250 ? 'bg-[#1E88E5] w-4' : 'bg-slate-300'}`}></div>
            </div>
          </div>

          <div className="mt-8 text-center">
            <Link
              href="/auth/register"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#1E88E5] to-[#1565C0] px-8 py-4 text-base font-semibold text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
            >
              <span>Rejoignez ProchePro gratuitement</span>
              <span className="text-xl">→</span>
            </Link>
          </div>
        </section>

        {/* Trust & Security */}
        <section className="mt-16">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center gap-2 mb-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-xl">🛡️</span>
              <h3 className="text-2xl font-bold text-slate-800 md:text-3xl">
                Votre sécurité, notre priorité
              </h3>
            </div>
            <p className="text-slate-600 max-w-xl mx-auto">
              Chaque détail est pensé pour vous offrir une expérience en toute confiance.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="group rounded-2xl bg-white/90 backdrop-blur-sm p-6 text-center shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className="inline-flex items-center justify-center h-12 w-12 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-500 text-white text-xl mb-3 shadow-md shadow-emerald-200 group-hover:scale-110 transition-transform">
                ✓
              </div>
              <div className="text-sm font-semibold text-slate-800">Prestataires vérifiés</div>
              <div className="text-xs text-slate-500 mt-2 leading-relaxed">
                Chaque prestataire doit vérifier son identité avant de pouvoir accepter des missions.
              </div>
            </div>
            <div className="group rounded-2xl bg-white/90 backdrop-blur-sm p-6 text-center shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className="inline-flex items-center justify-center h-12 w-12 rounded-xl bg-gradient-to-br from-blue-400 to-blue-500 text-white text-xl mb-3 shadow-md shadow-blue-200 group-hover:scale-110 transition-transform">
                🔒
              </div>
              <div className="text-sm font-semibold text-slate-800">Paiement sécurisé</div>
              <div className="text-xs text-slate-500 mt-2 leading-relaxed">
                Votre argent est bloqué jusqu&apos;à la fin de la mission. Vous payez uniquement si satisfait.
              </div>
            </div>
            <div className="group rounded-2xl bg-white/90 backdrop-blur-sm p-6 text-center shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className="inline-flex items-center justify-center h-12 w-12 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 text-white text-xl mb-3 shadow-md shadow-amber-200 group-hover:scale-110 transition-transform">
                ⭐
              </div>
              <div className="text-sm font-semibold text-slate-800">Avis authentiques</div>
              <div className="text-xs text-slate-500 mt-2 leading-relaxed">
                Seuls les clients ayant terminé une mission peuvent laisser un avis. Transparence garantie.
              </div>
            </div>
            <div className="group rounded-2xl bg-white/90 backdrop-blur-sm p-6 text-center shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className="inline-flex items-center justify-center h-12 w-12 rounded-xl bg-gradient-to-br from-violet-400 to-purple-500 text-white text-xl mb-3 shadow-md shadow-violet-200 group-hover:scale-110 transition-transform">
                💬
              </div>
              <div className="text-sm font-semibold text-slate-800">Support réactif</div>
              <div className="text-xs text-slate-500 mt-2 leading-relaxed">
                Une équipe française à votre écoute en cas de question ou de litige.
              </div>
            </div>
          </div>
        </section>

        {/* Community Call */}
        <section className="mt-10 relative overflow-hidden">
          {/* Decorative background elements */}
          <div className="absolute top-0 left-1/4 w-64 h-64 bg-sky-200 rounded-full blur-3xl opacity-30"></div>
          <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-violet-200 rounded-full blur-3xl opacity-30"></div>
          
          <div className="relative rounded-3xl bg-gradient-to-br from-sky-50 via-white to-violet-50 p-6 md:p-8 ring-1 ring-slate-200 shadow-lg">
            <div className="text-center max-w-2xl mx-auto">
              {/* Animated rocket icon */}
              <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-gradient-to-br from-sky-400 to-blue-500 text-2xl mb-4 shadow-lg shadow-sky-300/50 hover:scale-110 transition-transform">
                🚀
              </div>
              <h3 className="text-xl font-bold bg-gradient-to-r from-sky-600 via-blue-600 to-violet-600 bg-clip-text text-transparent md:text-2xl">
                Aidez-nous à grandir ensemble !
              </h3>
              <p className="mt-3 text-slate-600 text-sm leading-relaxed max-w-lg mx-auto">
                Plus nous sommes nombreux, plus vite vous trouverez un prestataire — et plus les professionnels auront de missions !
              </p>
              <div className="mt-5 flex flex-wrap justify-center gap-3">
                <div className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-sky-500 to-sky-600 px-4 py-2.5 text-sm font-medium text-white shadow-md shadow-sky-200 hover:shadow-lg hover:-translate-y-0.5 transition-all">
                  <span className="group-hover:scale-110 transition-transform">👥</span> Invitez vos amis
                </div>
                <div className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 px-4 py-2.5 text-sm font-medium text-white shadow-md shadow-emerald-200 hover:shadow-lg hover:-translate-y-0.5 transition-all">
                  <span className="group-hover:scale-110 transition-transform">📝</span> Publiez une annonce
                </div>
                <div className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-2.5 text-sm font-medium text-white shadow-md shadow-amber-200 hover:shadow-lg hover:-translate-y-0.5 transition-all">
                  <span className="group-hover:scale-110 transition-transform">⭐</span> Laissez un avis
                </div>
              </div>
              <p className="mt-5 text-sm text-slate-500">
                Merci de faire partie de l&apos;aventure ProchePro ! 💙
              </p>
            </div>
          </div>
        </section>

        {/* Tax Reports Info for Prestataires */}
        {currentUser?.role === 'prestataire' && (
          <section className="mt-16">
            <div className="rounded-3xl bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-50 border-2 border-sky-200 p-8 md:p-12 shadow-lg">
              <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="flex items-center justify-center w-24 h-24 rounded-2xl bg-sky-500 text-white shrink-0">
                  <svg className="w-14 h-14" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div className="flex-1 text-center md:text-left">
                  <div className="inline-flex items-center gap-2 rounded-full bg-sky-100 px-4 py-1.5 text-sm font-medium text-sky-700 mb-3">
                    <span>🇫🇷</span>
                    <span>Nouveau pour les prestataires</span>
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-3">
                    Attestations Fiscales URSSAF
                  </h2>
                  <p className="text-slate-700 leading-relaxed mb-4">
                    Générez automatiquement vos récapitulatifs annuels de revenus avec détails des commissions et missions. 
                    Simplifiez vos déclarations fiscales avec des documents PDF professionnels prêts à l'emploi.
                  </p>
                  <Link
                    href="/profile/tax-reports"
                    className="inline-flex items-center gap-2 rounded-full bg-sky-500 px-6 py-3 text-sm font-semibold text-white shadow-lg hover:bg-sky-600 hover:shadow-xl hover:-translate-y-0.5 transition-all"
                  >
                    <span>Accéder aux attestations</span>
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </Link>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Video Testimonials */}
        {videoTestimonials.length > 0 && (
          <section className="mt-16">
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 rounded-full bg-amber-100 px-4 py-1.5 text-sm font-medium text-amber-700 mb-3">
                <span>📹</span>
                <span>Témoignages vidéo</span>
              </div>
              <h2 className="text-2xl font-bold text-slate-900 md:text-3xl">
                Ils témoignent en vidéo
              </h2>
              <p className="mt-3 text-slate-600 max-w-2xl mx-auto">
                Découvrez les avis authentiques de nos utilisateurs en vidéo
              </p>
            </div>

            {/* Mobile: 1 video, Desktop: 3 videos */}
            {videoTestimonials.length > 0 ? (
              <div className="max-w-5xl mx-auto">
                {/* Mobile View - Single Video Carousel */}
              <div className="md:hidden flex justify-center items-center w-full">
                <VideoTestimonialCard
                  testimonial={videoTestimonials[0]}
                  autoplay={false}
                  showText={false}
                />
              </div>
                
                {/* Desktop View - 3 Videos Grid */}
                <div className="hidden md:grid md:grid-cols-3 gap-4">
                  {videoTestimonials.slice(0, 3).map((testimonial) => (
                    <VideoTestimonialCard
                      key={testimonial.id}
                      testimonial={testimonial}
                      autoplay={false}
                      showText={false}
                    />
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-slate-500">Aucun témoignage vidéo pour le moment</p>
              </div>
            )}

            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/profile/add-testimonial"
                className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-amber-500 to-orange-600 px-6 py-3 text-sm font-semibold text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <span>Partagez votre témoignage</span>
              </Link>
              <Link
                href="/testimonials"
                className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-sky-500 to-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all"
              >
                <span>Voir tous les témoignages</span>
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
          </section>
        )}

        {/* FAQ Section */}
        <section className="mt-16">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold md:text-3xl text-slate-900 mb-3">
              Questions fréquentes
            </h2>
            <p className="text-slate-600 max-w-2xl mx-auto mb-6">
              {currentUser?.role === 'prestataire' 
                ? "Tout ce que vous devez savoir pour développer votre activité sur ProchePro."
                : "Trouvez rapidement des réponses à vos questions."}
            </p>
            
            {/* Search Bar */}
            <div className="max-w-xl mx-auto mb-8">
              <div className="relative">
                <input
                  type="text"
                  value={faqSearch}
                  onChange={(e) => setFaqSearch(e.target.value)}
                  placeholder="Rechercher une question... (ex: paiement, remboursement)"
                  className="w-full px-5 py-3 pl-12 rounded-full border border-slate-300 focus:border-[#1E88E5] focus:ring-2 focus:ring-[#1E88E5]/20 outline-none transition-all"
                />
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl">🔍</span>
              </div>
            </div>
          </div>

          <div className="max-w-4xl mx-auto">
            {currentUser?.role === 'prestataire' ? (
              /* FAQ pour Prestataires */
              <div className="space-y-3">
                {[
                  {
                    q: "Comment suis-je assuré d'être payé ?",
                    a: "Grâce au système de paiement sécurisé, le client dépose les fonds sur le compte de la plateforme avant le début de votre travail. Vous les recevrez automatiquement après la validation de la mission.",
                    keywords: "payé paiement argent garantie sécurité"
                  },
                  {
                    q: "Quels documents dois-je fournir pour être 'Vérifié' ?",
                    a: "Vous devez télécharger une copie de votre pièce d'identité (CNI/Passeport) et, si vous êtes professionnel, un extrait Kbis ou votre numéro SIRET.",
                    keywords: "documents vérification vérifié identité kbis siret professionnel"
                  },
                  {
                    q: "Quelle est la commission de ProchePro ?",
                    a: "Paiements en ligne : vos 3 premières missions sont sans commission (0%), puis 10% à partir de la 4ème (vous recevez 90%). Paiements en espèces : 15% de commission dès la 1ère mission (vous recevez 85%). Les paiements en ligne sont plus avantageux !",
                    keywords: "commission frais tarif prix abonnement coût pourcentage espèces carte"
                  },
                  {
                    q: "Comment déclarer mes revenus ProchePro ?",
                    a: "ProchePro vous aide avec vos déclarations URSSAF ! Accédez à 'Attestations Fiscales' dans votre profil pour générer automatiquement vos récapitulatifs annuels de revenus avec détails des commissions et missions. Ces documents facilitent grandement votre déclaration fiscale.",
                    keywords: "revenus déclaration impôts fiscale taxes urssaf attestation"
                  }
                ].filter(item => {
                  if (!faqSearch) return true;
                  const searchLower = faqSearch.toLowerCase();
                  return item.q.toLowerCase().includes(searchLower) || 
                         item.a.toLowerCase().includes(searchLower) ||
                         item.keywords.toLowerCase().includes(searchLower);
                }).map((faq, index) => (
                  <div key={index} className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                    <button
                      onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                      className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-slate-50 transition-colors"
                    >
                      <span className="font-semibold text-slate-900 pr-4">{faq.q}</span>
                      <span className={`text-2xl text-[#1E88E5] transition-transform duration-300 flex-shrink-0 ${
                        expandedFaq === index ? 'rotate-180' : ''
                      }`}>▼</span>
                    </button>
                    {expandedFaq === index && (
                      <div className="px-6 pb-4 text-slate-600 leading-relaxed border-t border-slate-100 pt-4">
                        {faq.a}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              /* FAQ pour Clients */
              <div className="space-y-3">
                {[
                  {
                    q: "Est-ce que l'inscription est payante ?",
                    a: "Non, la publication d'annonces est totalement gratuite. Vous ne payez que pour le service choisi.",
                    keywords: "inscription gratuit payant prix publier annonce"
                  },
                  {
                    q: "Que se passe-t-il si le prestataire ne vient pas ?",
                    a: "Vos fonds sont sécurisés par le système ProchePro. Si le service n'a pas été fourni, nous vous remboursons 100% du montant.",
                    keywords: "prestataire absent remboursement garantie sécurité argent"
                  },
                  {
                    q: "Puis-je bénéficier du crédit d'impôt (CESU) ?",
                    a: "Oui, pour de nombreux services (ménage, garde d'enfants), vous pouvez bénéficier d'une déduction fiscale de 50%. Nos artisans certifiés fourniront les documents nécessaires.",
                    keywords: "crédit impôt cesu déduction fiscale taxes ménage garde enfants"
                  },
                  {
                    q: "Comment choisir le meilleur prestataire ?",
                    a: "Orientez-vous vers le badge 'Profil Vérifié', le nombre de missions réalisées et les avis vidéo authentiques d'autres clients.",
                    keywords: "choisir prestataire vérifié avis missions profil"
                  }
                ].filter(item => {
                  if (!faqSearch) return true;
                  const searchLower = faqSearch.toLowerCase();
                  return item.q.toLowerCase().includes(searchLower) || 
                         item.a.toLowerCase().includes(searchLower) ||
                         item.keywords.toLowerCase().includes(searchLower);
                }).map((faq, index) => (
                  <div key={index} className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                    <button
                      onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                      className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-slate-50 transition-colors"
                    >
                      <span className="font-semibold text-slate-900 pr-4">{faq.q}</span>
                      <span className={`text-2xl text-[#1E88E5] transition-transform duration-300 flex-shrink-0 ${
                        expandedFaq === index ? 'rotate-180' : ''
                      }`}>▼</span>
                    </button>
                    {expandedFaq === index && (
                      <div className="px-6 pb-4 text-slate-600 leading-relaxed border-t border-slate-100 pt-4">
                        {faq.a}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
            
            {/* No results message */}
            {faqSearch && (
              (currentUser?.role === 'prestataire' ? [
                {q: "Comment suis-je assuré d'être payé ?", a: "", keywords: "payé paiement argent garantie sécurité"},
                {q: "Quels documents dois-je fournir pour être 'Vérifié' ?", a: "", keywords: "documents vérification vérifié identité kbis siret professionnel"},
                {q: "Quelle est la commission de ProchePro ?", a: "", keywords: "commission frais tarif prix abonnement coût pourcentage"},
                {q: "Comment déclarer mes revenus ProchePro ?", a: "", keywords: "revenus déclaration impôts fiscale taxes"}
              ] : [
                {q: "Est-ce que l'inscription est payante ?", a: "", keywords: "inscription gratuit payant prix publier annonce"},
                {q: "Que se passe-t-il si le prestataire ne vient pas ?", a: "", keywords: "prestataire absent remboursement garantie sécurité argent"},
                {q: "Puis-je bénéficier du crédit d'impôt (CESU) ?", a: "", keywords: "crédit impôt cesu déduction fiscale taxes ménage garde enfants"},
                {q: "Comment choisir le meilleur prestataire ?", a: "", keywords: "choisir prestataire vérifié avis missions profil"}
              ]).filter(item => {
                const searchLower = faqSearch.toLowerCase();
                return item.q.toLowerCase().includes(searchLower) || 
                       item.a.toLowerCase().includes(searchLower) ||
                       item.keywords.toLowerCase().includes(searchLower);
              }).length === 0 && (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🔍</div>
                  <p className="text-slate-600">Aucun résultat trouvé pour &quot;{faqSearch}&quot;</p>
                  <button
                    onClick={() => setFaqSearch("")}
                    className="mt-4 text-[#1E88E5] hover:underline font-medium"
                  >
                    Effacer la recherche
                  </button>
                </div>
              )
            )}

            <div className="mt-8 text-center p-6 bg-gradient-to-r from-blue-50 to-sky-50 rounded-2xl">
              <p className="text-slate-700 mb-3">
                Vous ne trouvez pas la réponse à votre question ?
              </p>
              <Link
                href="/how-it-works"
                className="inline-flex items-center gap-2 text-[#1E88E5] hover:text-[#1565C0] font-semibold transition-colors"
              >
                <span>Contactez notre support</span>
                <span className="text-lg">→</span>
              </Link>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="mt-16 rounded-3xl bg-gradient-to-r from-violet-500 to-purple-600 p-8 md:p-12 text-center text-white">
          <h2 className="text-2xl font-bold md:text-3xl">
            Prêt à commencer ?
          </h2>
          <p className="mt-3 text-white/80 max-w-xl mx-auto">
            Rejoignez des milliers d&apos;utilisateurs qui font confiance à ProchePro pour leurs services du quotidien.
          </p>
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/tasks/new"
              className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-semibold text-violet-600 shadow-lg hover:bg-slate-100 transition-colors"
            >
              Demander un service gratuitement
            </Link>
            <Link
              href="/auth/register"
              className="inline-flex items-center justify-center rounded-full bg-white/20 px-6 py-3 text-sm font-semibold text-white hover:bg-white/30 transition-colors"
            >
              Commencer à gagner de l&apos;argent
            </Link>
          </div>
        </section>
      </main>
    </>
  );
}
