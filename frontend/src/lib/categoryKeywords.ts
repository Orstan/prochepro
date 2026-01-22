import { ServiceCategory } from './categoriesApi';

export interface CategoryKeywords {
  [categoryKey: string]: {
    keywords: string[];
    subcategories: {
      [subcategoryKey: string]: string[];
    };
  };
}

// Ключові слова для категорій та підкатегорій
export const categoryKeywords: CategoryKeywords = {
  // Електрика
  'electricite': {
    keywords: ['électricien', 'électricité', 'électrique', 'prise', 'ampoule', 'lumière', 'installation électrique', 'tableau électrique', 'disjoncteur', 'interrupteur', 'court-circuit', 'courant', 'electrique', 'electricien', 'electricite', 'lampe', 'fil', 'cable', 'cablage'],
    subcategories: {
      'installation-electrique': ['installation', 'câblage', 'circuit', 'nouveau', 'poser', 'installer'],
      'depannage-electrique': ['dépannage', 'réparation', 'panne', 'problème', 'ne fonctionne pas', 'réparer'],
      'eclairage': ['éclairage', 'lumière', 'lampe', 'ampoule', 'spot', 'led', 'lustre', 'applique'],
      'tableau-electrique': ['tableau', 'disjoncteur', 'fusible', 'compteur', 'différentiel']
    }
  },
  
  // Сантехніка
  'plomberie': {
    keywords: ['plombier', 'plomberie', 'fuite', 'eau', 'robinet', 'tuyau', 'évier', 'lavabo', 'toilette', 'douche', 'baignoire', 'chauffe-eau'],
    subcategories: {
      'reparation-fuite': ['fuite', 'goutte', 'réparer', 'colmater', 'étanchéité'],
      'installation-plomberie': ['installation', 'poser', 'nouveau', 'installer', 'remplacer'],
      'debouchage': ['déboucher', 'bouchon', 'canalisation', 'évacuation', 'écoulement', 'bouché'],
      'chauffe-eau': ['chauffe-eau', 'eau chaude', 'ballon', 'cumulus', 'chaudière']
    }
  },
  
  // Ремонт
  'renovation': {
    keywords: ['rénovation', 'rénover', 'travaux', 'refaire', 'amélioration', 'modernisation', 'restauration', 'rafraîchir', 'aménagement'],
    subcategories: {
      'peinture': ['peinture', 'peindre', 'repeindre', 'mur', 'plafond', 'couleur'],
      'sol': ['sol', 'parquet', 'carrelage', 'lino', 'moquette', 'stratifié', 'pose'],
      'cloison': ['cloison', 'mur', 'placo', 'plâtre', 'séparation'],
      'renovation-complete': ['complète', 'totale', 'entière', 'appartement', 'maison', 'pièce']
    }
  },
  
  // Прибирання
  'menage': {
    keywords: ['ménage', 'nettoyage', 'nettoyer', 'propre', 'entretien', 'propreté', 'laver', 'aspirateur', 'poussière'],
    subcategories: {
      'menage-regulier': ['régulier', 'hebdomadaire', 'quotidien', 'routine', 'récurrent'],
      'grand-menage': ['grand ménage', 'profond', 'complet', 'printemps', 'intensif'],
      'nettoyage-vitres': ['vitre', 'fenêtre', 'baie vitrée', 'miroir', 'verre'],
      'nettoyage-apres-travaux': ['après travaux', 'chantier', 'poussière', 'fin de travaux', 'post-rénovation']
    }
  },
  
  // Переїзд
  'demenagement': {
    keywords: ['déménagement', 'déménager', 'transport', 'carton', 'emballage', 'déplacer', 'meubles', 'camion', 'montage', 'meuble', 'monter', 'assemblage', 'ikea', 'kit', 'demenagement', 'demenager', 'assembler', 'livraison', 'installer'],
    subcategories: {
      'aide-demenagement': ['aide', 'assistance', 'main d\'œuvre', 'porter', 'manutention'],
      'transport-meubles': ['transport', 'meubles', 'meuble', 'déplacer', 'livraison'],
      'emballage': ['emballage', 'emballer', 'carton', 'protection', 'scotch'],
      'montage-meubles': ['montage', 'monter', 'assemblage', 'ikea', 'meuble en kit']
    }
  },
  
  // Садівництво
  'jardinage': {
    keywords: ['jardinage', 'jardin', 'plante', 'pelouse', 'tonte', 'haie', 'taille', 'arbre', 'fleur', 'potager'],
    subcategories: {
      'tonte-pelouse': ['tonte', 'pelouse', 'gazon', 'herbe', 'tondre'],
      'taille-haie': ['taille', 'haie', 'arbuste', 'buisson', 'tailler'],
      'entretien-jardin': ['entretien', 'désherbage', 'binage', 'arrosage', 'nettoyage'],
      'plantation': ['plantation', 'planter', 'semis', 'potager', 'massif']
    }
  },
  
  // Інформатика
  'informatique': {
    keywords: ['informatique', 'ordinateur', 'pc', 'computer', 'laptop', 'windows', 'mac', 'logiciel', 'virus', 'internet', 'wifi', 'réseau'],
    subcategories: {
      'depannage-informatique': ['dépannage', 'problème', 'panne', 'réparer', 'bug', 'erreur'],
      'installation-logiciel': ['installation', 'logiciel', 'programme', 'software', 'installer', 'configurer'],
      'reseau-wifi': ['réseau', 'wifi', 'internet', 'box', 'routeur', 'connexion'],
      'recuperation-donnees': ['récupération', 'données', 'data', 'fichier', 'perdu', 'sauvegarde']
    }
  },
  
  // Догляд за дітьми
  'garde-enfants': {
    keywords: ['garde d\'enfants', 'baby-sitting', 'nounou', 'enfant', 'bébé', 'garderie', 'babysitter'],
    subcategories: {
      'garde-ponctuelle': ['ponctuelle', 'occasionnelle', 'soirée', 'weekend', 'sortie'],
      'garde-reguliere': ['régulière', 'quotidienne', 'hebdomadaire', 'après l\'école', 'récurrente'],
      'sortie-ecole': ['sortie d\'école', 'chercher', 'école', 'accompagnement', 'trajet'],
      'aide-devoirs': ['devoirs', 'aide', 'soutien scolaire', 'leçons', 'accompagnement scolaire']
    }
  },
  
  // Репетиторство
  'cours-particuliers': {
    keywords: ['cours particuliers', 'professeur', 'enseignant', 'tuteur', 'soutien scolaire', 'leçon', 'apprentissage'],
    subcategories: {
      'mathematiques': ['mathématiques', 'maths', 'algèbre', 'géométrie', 'calcul'],
      'langues': ['langue', 'français', 'anglais', 'espagnol', 'allemand', 'italien'],
      'sciences': ['sciences', 'physique', 'chimie', 'biologie', 'svt'],
      'musique': ['musique', 'instrument', 'piano', 'guitare', 'violon', 'chant']
    }
  },
  
  // Ремонт побутової техніки
  'reparation-electromenager': {
    keywords: ['réparation électroménager', 'appareil', 'machine à laver', 'lave-vaisselle', 'frigo', 'four', 'réfrigérateur', 'congélateur'],
    subcategories: {
      'lave-linge': ['lave-linge', 'machine à laver', 'lessive', 'lavage'],
      'refrigerateur': ['réfrigérateur', 'frigo', 'frigidaire', 'froid', 'congélateur'],
      'lave-vaisselle': ['lave-vaisselle', 'vaisselle', 'plats'],
      'four-cuisiniere': ['four', 'cuisinière', 'plaque', 'cuisson', 'induction']
    }
  }
};

/**
 * Синхронізує ключі категорій з API з нашими ключовими словами
 * @param apiCategories Категорії з API
 * @returns Карта відповідності ключів
 */
export function syncCategoryKeys(apiCategories: ServiceCategory[]): Map<string, string> {
  const keyMap = new Map<string, string>();
  
  // Для кожної категорії з API
  apiCategories.forEach(apiCategory => {
    // Шукаємо відповідність в наших ключових словах
    const normalizedApiName = apiCategory.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    
    // Спочатку перевіряємо точні збіги ключів
    if (categoryKeywords[apiCategory.key]) {
      keyMap.set(apiCategory.key, apiCategory.key);
    } else {
      // Якщо немає точного збігу, шукаємо по назві
      Object.keys(categoryKeywords).forEach(keywordKey => {
        // Перевіряємо ключові слова для кожної категорії
        const keywords = categoryKeywords[keywordKey].keywords;
        for (const keyword of keywords) {
          const normalizedKeyword = keyword.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
          if (normalizedApiName.includes(normalizedKeyword) || normalizedKeyword.includes(normalizedApiName)) {
            keyMap.set(apiCategory.key, keywordKey);
            break;
          }
        }
      });
    }
  });
  
  return keyMap;
}

/**
 * Аналізує заголовок і повертає відповідні категорії та підкатегорії
 * @param title Заголовок для аналізу
 * @param allCategories Всі доступні категорії
 * @returns Масив відповідних категорій та підкатегорій
 */
export function analyzeTitle(title: string, allCategories: ServiceCategory[]): {
  categories: { key: string; name: string; score: number }[];
  subcategories: { categoryKey: string; key: string; name: string; score: number }[];
} {
  // Нормалізуємо заголовок (видаляємо діакритичні знаки і переводимо в нижній регістр)
  const normalizedTitle = title.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  
  const result = {
    categories: [] as { key: string; name: string; score: number }[],
    subcategories: [] as { categoryKey: string; key: string; name: string; score: number }[]
  };

  // Аналіз для кожної категорії
  Object.entries(categoryKeywords).forEach(([categoryKey, category]) => {
    let categoryScore = 0;
    let matchedKeywords: string[] = [];
    
    // Підрахунок балів для категорії з пріоритетами
    category.keywords.forEach(keyword => {
      const normalizedKeyword = keyword.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      
      // Перевірка різних типів збігів з пріоритетами
      if (normalizedKeyword.startsWith(normalizedTitle)) {
        // Ключове слово починається з введеного тексту - найвищий пріоритет
        categoryScore += 5;
        matchedKeywords.push(keyword);
      } else if (normalizedTitle.startsWith(normalizedKeyword)) {
        // Введений текст починається з ключового слова
        categoryScore += 4;
        matchedKeywords.push(keyword);
      } else if (normalizedKeyword.includes(normalizedTitle)) {
        // Введений текст міститься в ключовому слові
        categoryScore += 3;
        matchedKeywords.push(keyword);
      } else if (normalizedTitle.includes(normalizedKeyword)) {
        // Ключове слово міститься у введеному тексті
        categoryScore += 2;
        matchedKeywords.push(keyword);
      }
    });
    
    // Якщо є збіги для категорії
    if (categoryScore > 0) {
      
      // Спочатку шукаємо по точному ключу
      let categoryObj = allCategories.find(c => c.key === categoryKey);
      
      // Якщо не знайдено, шукаємо по ключовим словам в назві
      if (!categoryObj) {
        categoryObj = allCategories.find(c => {
          const normalizedName = c.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
          return category.keywords.some(kw => {
            const normalizedKw = kw.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
            return normalizedName.includes(normalizedKw) || normalizedKw.includes(normalizedName);
          });
        });
      }
      
      if (categoryObj) {
        result.categories.push({
          key: categoryObj.key,
          name: categoryObj.name,
          score: categoryScore
        });
      }
      
      // Аналіз підкатегорій
      Object.entries(category.subcategories).forEach(([subcategoryKey, keywords]) => {
        let subcategoryScore = 0;
        let matchedSubKeywords: string[] = [];
        
        keywords.forEach(keyword => {
          const normalizedKeyword = keyword.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
          
          // Перевірка різних типів збігів
          if (normalizedKeyword.startsWith(normalizedTitle)) {
            // Ключове слово починається з введеного тексту - найвищий пріоритет
            subcategoryScore += 5;
            matchedSubKeywords.push(keyword);
          } else if (normalizedTitle.startsWith(normalizedKeyword)) {
            // Введений текст починається з ключового слова
            subcategoryScore += 4;
            matchedSubKeywords.push(keyword);
          } else if (normalizedKeyword.includes(normalizedTitle)) {
            // Введений текст міститься в ключовому слові
            subcategoryScore += 3;
            matchedSubKeywords.push(keyword);
          } else if (normalizedTitle.includes(normalizedKeyword)) {
            // Ключове слово міститься у введеному тексті
            subcategoryScore += 2;
            matchedSubKeywords.push(keyword);
          }
        });
        
        if (subcategoryScore > 0) {
          
          const subcategoryObj = categoryObj?.subcategories.find(s => s.key === subcategoryKey);
          if (subcategoryObj) {
            result.subcategories.push({
              categoryKey,
              key: subcategoryKey,
              name: subcategoryObj.name,
              score: subcategoryScore
            });
          }
        }
      });
    }
  });
  
  // Сортування результатів за балами
  result.categories.sort((a, b) => b.score - a.score);
  result.subcategories.sort((a, b) => b.score - a.score);
  
  return result;
}
