
import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Snowflake } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Cocktail } from './PotionMaster';
import { Language } from '../hooks/useLanguage';
import { IngredientConfig } from '../hooks/useCocktails';

interface CocktailGridProps {
  cocktails: Cocktail[];
  language: Language;
  onCocktailSelect: (cocktail: Cocktail) => void;
  ingredientConfig: IngredientConfig;
}

export const CocktailGrid: React.FC<CocktailGridProps> = ({ 
  cocktails, 
  language, 
  onCocktailSelect,
  ingredientConfig
}) => {
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 6; // 2x3 grid for better visibility
  const totalPages = Math.ceil(cocktails.length / itemsPerPage);
  
  const currentCocktails = cocktails.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage
  );

  const [cocktailNames, setCocktailNames] = useState<Record<string, any>>({});
  const [ingredientNames, setIngredientNames] = useState<Record<string, any>>({});

  React.useEffect(() => {
    // Load cocktail names and ingredient names for current language
    Promise.all([
      fetch('/data/cocktail_name_mapping.json').then(res => res.json()),
      fetch('/data/ingredient_mapping.json').then(res => res.json())
    ])
    .then(([cocktails, ingredients]) => {
      setCocktailNames(cocktails);
      setIngredientNames(ingredients);
    })
    .catch(console.error);
  }, [language]);

  const getCocktailName = (cocktailId: string) => {
    return cocktailNames[cocktailId]?.[language] || cocktailId;
  };

  const getIngredientName = (ingredientId: string) => {
    return ingredientNames[ingredientId]?.[language] || ingredientId;
  };

  const isExternalIngredient = (ingredient: string) => {
    return ingredientConfig.external.includes(ingredient);
  };

  return (
    <div className="h-full flex flex-col px-2 sm:px-4">
      {/* Cocktail Grid with integrated pagination */}
      <div className="flex-1 flex items-center justify-between gap-2 sm:gap-4">
        {/* Left pagination button */}
        {totalPages > 1 && (
          <Button
            variant="outline"
            onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
            disabled={currentPage === 0}
            className="touch-button shrink-0 w-12 h-12 rounded-full p-0"
            size="sm"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
        )}

        {/* Responsive Cocktail Grid */}
        <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 max-w-6xl mx-auto">
          {currentCocktails.map((cocktail) => (
            <Card
              key={cocktail.id}
              className="aspect-[4/5] touch-card cursor-pointer transition-all duration-300 hover:scale-105 relative overflow-hidden bg-card/80 backdrop-blur-sm border-2 border-border hover:border-primary"
              onClick={() => onCocktailSelect(cocktail)}
              style={{
                backgroundImage: `url(/cocktails/${cocktail.id}.png)`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat'
              }}
            >
              {/* Dark overlay for text readability */}
              <div className="absolute inset-0 bg-black/60 backdrop-blur-[1px]" />
              
              {/* Content */}
              <div className="relative z-10 p-3 h-full flex flex-col">
                {/* Cocktail name at top */}
                <h3 className="text-sm font-semibold text-white mb-3 leading-tight">
                  {getCocktailName(cocktail.id)}
                </h3>
                
                {/* Ingredients list */}
                <div className="flex-1 space-y-1">
                  {Object.entries(cocktail.ingredients).map(([ingredient, amount]) => (
                    <div key={ingredient} className="flex items-center justify-between text-xs text-white/90">
                      <div className="flex items-center gap-1">
                        {isExternalIngredient(ingredient) && (
                          <Snowflake className="h-3 w-3 text-blue-300" />
                        )}
                        <span className="truncate">{getIngredientName(ingredient)}</span>
                      </div>
                      <span className="text-white/70 ml-2">{amount}ml</span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          ))}
          
          {/* Empty slots to maintain grid */}
          {Array.from({ length: itemsPerPage - currentCocktails.length }).map((_, index) => (
            <div key={`empty-${index}`} className="aspect-[4/5] touch-card opacity-30">
              <div className="h-full border-2 border-dashed border-muted-foreground/30 rounded-lg bg-card/20" />
            </div>
          ))}
        </div>

        {/* Right pagination button */}
        {totalPages > 1 && (
          <Button
            variant="outline"
            onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
            disabled={currentPage === totalPages - 1}
            className="touch-button shrink-0 w-12 h-12 rounded-full p-0"
            size="sm"
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        )}
      </div>
      
      {/* Page dots indicator */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-4 pb-2">
          {Array.from({ length: totalPages }).map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentPage(index)}
              className={`w-2 h-2 rounded-full transition-all duration-200 ${
                index === currentPage 
                  ? 'bg-primary scale-125' 
                  : 'bg-muted-foreground/40 hover:bg-muted-foreground/60'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
};
