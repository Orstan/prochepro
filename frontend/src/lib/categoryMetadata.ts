// Динамічна генерація SEO metadata для категорій та підкатегорій

interface CategoryMeta {
  title: string;
  description: string;
  keywords: string[];
}

// Генератор SEO metadata для категорій
export function generateCategoryMetadata(
  categoryKey: string,
  categoryName: string,
  subcategoryKey?: string,
  subcategoryName?: string
): CategoryMeta {
  const baseKeywords = [
    'services à domicile France',
    'prestataires de confiance',
    'professionnels vérifiés',
    'annonces services',
    'paiement sécurisé',
  ];

  if (subcategoryKey && subcategoryName) {
    // Meta pour підкатегорії
    return {
      title: `${subcategoryName} à domicile | Trouvez un professionnel vérifié`,
      description: `Trouvez un professionnel pour ${subcategoryName.toLowerCase()} près de chez vous. Comparez les offres, consultez les avis clients et réservez en toute confiance. Paiement sécurisé et prestataires vérifiés avec pièce d'identité.`,
      keywords: [
        ...baseKeywords,
        subcategoryName.toLowerCase(),
        `${subcategoryName.toLowerCase()} à domicile`,
        `trouver ${subcategoryName.toLowerCase()}`,
        categoryName.toLowerCase(),
      ],
    };
  }

  // Meta для категорії
  const categoryDescriptions: Record<string, string> = {
    construction: 'Trouvez des professionnels qualifiés pour tous vos travaux de construction : maçonnerie, charpente, fondations, terrassement. Devis gratuits et prestataires vérifiés.',
    roof_facade: 'Experts en couverture, toiture et ravalement de façade. Réparation, installation et entretien par des artisans certifiés.',
    garage_gates: 'Installation et réparation de portes de garage, portails, clôtures. Motorisation et automatisation par des spécialistes.',
    outdoor: 'Aménagement extérieur : terrasses, pavage, piscines, éclairage. Créez votre espace de vie idéal.',
    plumbing_heating: 'Plombiers et chauffagistes professionnels pour dépannage, installation et entretien. Intervention rapide 7j/7.',
    electricity: 'Électriciens qualifiés pour tous travaux électriques : installation, dépannage, mise aux normes.',
    carpentry_joinery: 'Menuisiers et ébénistes pour portes, fenêtres, placards sur mesure. Travail artisanal de qualité.',
    painting_decoration: 'Peintres en bâtiment et décorateurs pour intérieur et extérieur. Finitions soignées garanties.',
    flooring: 'Spécialistes en revêtements de sol : parquet, carrelage, moquette, vinyle. Pose professionnelle.',
    locksmith: 'Serruriers disponibles pour ouverture de porte, changement de serrure, blindage. Intervention rapide.',
    glazing: 'Vitriers professionnels : double vitrage, miroirs, vérandas. Dépannage et installation.',
    insulation: 'Experts en isolation thermique et phonique : combles, murs, sols. Économisez sur vos factures.',
    garden_exterior: 'Jardiniers et paysagistes pour entretien de jardin, élagage, plantation, clôtures.',
    pool: 'Construction, entretien et réparation de piscines par des professionnels certifiés.',
    moving: 'Services de déménagement : portage, transport, montage de meubles. Devis personnalisés.',
    cleaning: 'Ménage à domicile régulier ou ponctuel. Personnel qualifié et produits écologiques.',
    appliance_repair: 'Réparation électroménager : lave-linge, réfrigérateur, four. Dépannage à domicile.',
    computer_tech: 'Dépannage informatique et high-tech : réparation PC, installation, formation.',
    vehicle: 'Mécaniciens et carrossiers pour entretien et réparation auto et moto.',
    wellbeing: 'Services bien-être et beauté à domicile : coiffure, massage, coaching sportif.',
    events: 'Organisation d\'événements : mariages, anniversaires, animations. Prestataires expérimentés.',
    lessons: 'Cours particuliers et formation : soutien scolaire, langues, musique, sport.',
    pets: 'Services pour animaux : garde, toilettage, promenade, éducation canine.',
    childcare: 'Garde d\'enfants fiable : baby-sitting, nounou, sortie d\'école.',
    administrative: 'Aide administrative : secrétariat, comptabilité, déclarations fiscales.',
    legal: 'Services juridiques : conseil, rédaction de contrats, médiation.',
    photo_video: 'Photographes et vidéastes professionnels : événements, portraits, drone.',
    translation: 'Services de traduction et d\'interprétariat pour tous documents.',
    web_design: 'Création de sites web, graphisme, SEO, maintenance. Solutions digitales sur mesure.',
    other: 'Autres services à domicile. Trouvez le professionnel dont vous avez besoin.',
  };

  return {
    title: `${categoryName} | Services professionnels à domicile`,
    description: categoryDescriptions[categoryKey] || `Trouvez des professionnels qualifiés en ${categoryName.toLowerCase()} près de chez vous. Comparez les offres, consultez les avis et réservez en toute sécurité.`,
    keywords: [
      ...baseKeywords,
      categoryName.toLowerCase(),
      `${categoryName.toLowerCase()} à domicile`,
      `services ${categoryName.toLowerCase()}`,
      `professionnels ${categoryName.toLowerCase()}`,
    ],
  };
}

// SEO metadata pour міста
export function generateCityMetadata(cityName: string): CategoryMeta {
  return {
    title: `Services à domicile ${cityName} | Professionnels vérifiés`,
    description: `Trouvez les meilleurs prestataires de services à ${cityName}. Ménage, bricolage, jardinage, déménagement et plus. Paiement sécurisé et profils vérifiés.`,
    keywords: [
      `services à domicile ${cityName}`,
      `prestataires ${cityName}`,
      `aide à domicile ${cityName}`,
      `professionnels ${cityName}`,
      'services entre particuliers',
    ],
  };
}
