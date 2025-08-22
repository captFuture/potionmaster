import { useState, useEffect } from 'react';

interface DataLoader {
  cocktailNames: Record<string, any>;
  ingredientNames: Record<string, any>;
  interfaceText: Record<string, any>;
  loading: boolean;
  error: string | null;
}

export const useDataLoader = (): DataLoader => {
  const [cocktailNames, setCocktailNames] = useState<Record<string, any>>({});
  const [ingredientNames, setIngredientNames] = useState<Record<string, any>>({});
  const [interfaceText, setInterfaceText] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        const [cocktailResponse, ingredientResponse, interfaceResponse] = await Promise.all([
          fetch('/data/cocktail_name_mapping.json'),
          fetch('/data/ingredient_mapping.json'),
          fetch('/data/interface_language.json'),
        ]);

        if (!cocktailResponse.ok || !ingredientResponse.ok || !interfaceResponse.ok) {
          throw new Error('Failed to load data files');
        }

        const [cocktailData, ingredientData, interfaceData] = await Promise.all([
          cocktailResponse.json(),
          ingredientResponse.json(),
          interfaceResponse.json(),
        ]);

        setCocktailNames(cocktailData);
        setIngredientNames(ingredientData);
        setInterfaceText(interfaceData);
        setError(null);
      } catch (err) {
        console.error('Error loading data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  return {
    cocktailNames,
    ingredientNames,
    interfaceText,
    loading,
    error,
  };
};