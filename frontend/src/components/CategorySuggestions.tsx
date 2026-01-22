import React, { useEffect, useState } from 'react';
import { ServiceCategory } from '@/lib/categoriesApi';
import { analyzeTitle, syncCategoryKeys } from '@/lib/categoryKeywords';

interface CategorySuggestionsProps {
  title: string;
  categories: ServiceCategory[];
  onSelectCategory: (categoryKey: string) => void;
  onSelectSubcategory: (subcategoryKey: string) => void;
  selectedCategory: string;
}

const CategorySuggestions: React.FC<CategorySuggestionsProps> = ({
  title,
  categories,
  onSelectCategory,
  onSelectSubcategory,
  selectedCategory
}) => {
  const [suggestedCategories, setSuggestedCategories] = useState<{ key: string; name: string; score: number }[]>([]);
  const [suggestedSubcategories, setSuggestedSubcategories] = useState<{ categoryKey: string; key: string; name: string; score: number }[]>([]);
  const [keyMap, setKeyMap] = useState<Map<string, string>>(new Map());

  // Синхронізація ключів категорій
  useEffect(() => {
    if (categories && categories.length > 0) {
      const newKeyMap = syncCategoryKeys(categories);
      setKeyMap(newKeyMap);
    }
  }, [categories]);

  // Аналіз заголовка при зміні
  useEffect(() => {
    if (title.length >= 1) {
      if (categories && categories.length > 0) {
        const results = analyzeTitle(title, categories);
        const mappedCategories = results.categories;
        
        const maxSuggestions = title.length <= 2 ? 5 : title.length <= 4 ? 4 : 3;
        setSuggestedCategories(mappedCategories.slice(0, maxSuggestions));
        setSuggestedSubcategories(results.subcategories.filter(sub => 
          selectedCategory ? sub.categoryKey === selectedCategory : true
        ).slice(0, 3));
      }
    } else {
      setSuggestedCategories([]);
      setSuggestedSubcategories([]);
    }
  }, [title, categories, selectedCategory, keyMap]);

  if (suggestedCategories.length === 0 && suggestedSubcategories.length === 0) {
    return null;
  }

  const styles = {
    container: {
      marginTop: '8px',
      padding: '8px',
      backgroundColor: '#f5f7fa',
      borderRadius: '6px',
      border: '1px solid #e2e8f0',
      boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    },
    label: {
      fontSize: '12px',
      color: '#64748b',
      marginBottom: '4px',
      fontWeight: 500,
    },
    list: {
      display: 'flex',
      flexWrap: 'wrap' as const,
      gap: '6px',
    },
    tag: {
      display: 'inline-block',
      padding: '4px 8px',
      backgroundColor: '#e0f2fe',
      color: '#0284c7',
      borderRadius: '4px',
      fontSize: '14px',
      cursor: 'pointer',
      transition: 'all 0.2s',
      border: '1px solid #bae6fd',
      fontWeight: 500,
    }
  };

  return (
    <div>
      {suggestedCategories.length > 0 && (
        <div style={styles.container}>
          <p style={styles.label}>Catégories suggérées:</p>
          <div style={styles.list}>
            {suggestedCategories.map(category => (
              <span
                key={category.key}
                style={styles.tag}
                onClick={() => onSelectCategory(category.key)}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = '#0284c7';
                  e.currentTarget.style.color = 'white';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = '#e0f2fe';
                  e.currentTarget.style.color = '#0284c7';
                }}
              >
                +{category.name}
              </span>
            ))}
          </div>
        </div>
      )}

      {suggestedSubcategories.length > 0 && selectedCategory && (
        <div style={styles.container}>
          <p style={styles.label}>Sous-catégories suggérées:</p>
          <div style={styles.list}>
            {suggestedSubcategories.map(subcategory => (
              <span
                key={subcategory.key}
                style={styles.tag}
                onClick={() => onSelectSubcategory(subcategory.key)}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = '#0284c7';
                  e.currentTarget.style.color = 'white';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = '#e0f2fe';
                  e.currentTarget.style.color = '#0284c7';
                }}
              >
                +{subcategory.name}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CategorySuggestions;
