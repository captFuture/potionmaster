import { usePumpConfig } from './usePumpConfig';
import { IngredientConfig } from './useCocktails';

export const usePumpIngredients = (ingredientConfig: IngredientConfig) => {
  const { pumpConfig } = usePumpConfig(ingredientConfig);
  
  // Get ingredients that are connected to pumps
  const pumpIngredients = pumpConfig
    .filter(pump => pump.enabled && pump.liquid)
    .map(pump => pump.liquid);
    
  // Get ingredients that are enabled but not connected to pumps (external)
  const externalIngredients = Object.entries(ingredientConfig.enabled)
    .filter(([ingredient, enabled]) => enabled && !pumpIngredients.includes(ingredient))
    .map(([ingredient, _]) => ingredient);
    
  const isPumpIngredient = (ingredient: string) => {
    return pumpIngredients.includes(ingredient);
  };
  
  const isExternalIngredient = (ingredient: string) => {
    return externalIngredients.includes(ingredient);
  };
  
  return {
    pumpIngredients,
    externalIngredients,
    isPumpIngredient,
    isExternalIngredient
  };
};