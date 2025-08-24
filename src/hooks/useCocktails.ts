import { useState, useEffect } from 'react';
import { Cocktail } from '../components/PotionMaster';

export interface IngredientConfig {
  alcoholic: string[];
  nonAlcoholic: string[];
  external: string[];
  enabled: {
    [ingredient: string]: boolean;
  };
}

export const useCocktails = () => {
  const [cocktails, setCocktails] = useState<Cocktail[]>([]);
  const [ingredientConfig, setIngredientConfig] = useState<IngredientConfig>({
    alcoholic: [],
    nonAlcoholic: [],
    external: [],
    enabled: {}
  });

  useEffect(() => {
    // Load cocktails and ingredient configuration from static files
    Promise.all([
      fetch('/data/cocktails.json').then(res => res.json()),
      fetch('/data/ingredient_category.json').then(res => res.json())
    ])
    .then(([cocktailsData, categoriesData]) => {
      setCocktails(cocktailsData);
      
      // Initialize ingredient config
      const config: IngredientConfig = {
        alcoholic: categoriesData.alcoholic_ingredients || [],
        nonAlcoholic: categoriesData.non_alcoholic_ingredients || [],
        external: categoriesData.external_ingredients || [],
        enabled: {}
      };

      // Load saved configuration or set defaults
      const savedConfig = localStorage.getItem('potionmaster-ingredients');
      if (savedConfig) {
        const parsed = JSON.parse(savedConfig);
        config.enabled = parsed.enabled || {};
      } else {
        // Default: enable first 4 of each category
        config.alcoholic.slice(0, 4).forEach(ing => config.enabled[ing] = true);
        config.nonAlcoholic.slice(0, 4).forEach(ing => config.enabled[ing] = true);
      }

      setIngredientConfig(config);
    })
    .catch(error => {
      console.error('Failed to load cocktail data:', error);
      // Fallback data
      setCocktails([]);
    });
  }, []);

  const updateIngredientConfig = (newConfig: IngredientConfig) => {
    setIngredientConfig(newConfig);
    localStorage.setItem('potionmaster-ingredients', JSON.stringify(newConfig));
  };

  // Filter cocktails based on enabled ingredients
  const availableCocktails = cocktails.filter(cocktail => {
    return Object.keys(cocktail.ingredients).every(ingredient => 
      ingredientConfig.enabled[ingredient] === true
    );
  });

  return {
    cocktails,
    availableCocktails,
    ingredientConfig,
    updateIngredientConfig
  };
};