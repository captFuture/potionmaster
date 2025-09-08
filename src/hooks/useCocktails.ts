import { useState, useEffect } from 'react';
import { Cocktail } from '../components/PotionMaster';

export interface IngredientConfig {
  ingredients: string[];
  enabled: {
    [ingredient: string]: boolean;
  };
}

export const useCocktails = () => {
  const [cocktails, setCocktails] = useState<Cocktail[]>([]);
  const [ingredientConfig, setIngredientConfig] = useState<IngredientConfig>({
    ingredients: [],
    enabled: {}
  });

  useEffect(() => {
    // Load cocktails and extract ingredients from them
    fetch('/data/cocktails.json')
      .then(res => res.json())
      .then((cocktailsData) => {
        setCocktails(cocktailsData);
        
        // Extract all unique ingredients from cocktails
        const allIngredients = new Set<string>();
        cocktailsData.forEach((cocktail: any) => {
          Object.keys(cocktail.ingredients || {}).forEach(ingredient => {
            allIngredients.add(ingredient);
          });
          if (cocktail.post_add) {
            allIngredients.add(cocktail.post_add);
          }
        });
        
        const uniqueIngredients = Array.from(allIngredients);
        
        const config: IngredientConfig = {
          ingredients: uniqueIngredients,
          enabled: {}
        };

        // Load saved configuration or set defaults
        const savedConfig = localStorage.getItem('potionmaster-ingredients');
        if (savedConfig) {
          const parsed = JSON.parse(savedConfig);
          config.enabled = parsed.enabled || {};
        } else {
          // Default: enable first 8 ingredients
          config.ingredients.slice(0, 8).forEach(ing => config.enabled[ing] = true);
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
    // Check if all required ingredients are enabled
    const hasAllIngredients = Object.keys(cocktail.ingredients).every(ingredient => 
      ingredientConfig.enabled[ingredient] === true
    );
    
    // Check if post_add ingredient (if exists) is enabled
    const hasPostAdd = !cocktail.post_add || ingredientConfig.enabled[cocktail.post_add] === true;
    
    return hasAllIngredients && hasPostAdd;
  });

  return {
    cocktails,
    availableCocktails,
    ingredientConfig,
    updateIngredientConfig
  };
};