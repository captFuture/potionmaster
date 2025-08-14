import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Cocktail } from './PotionMaster';
import { Language } from '../hooks/useLanguage';

interface CocktailGridProps {
  cocktails: Cocktail[];
  language: Language;
  onCocktailSelect: (cocktail: Cocktail) => void;
}

export const CocktailGrid: React.FC<CocktailGridProps> = ({ 
  cocktails, 
  language, 
  onCocktailSelect 
}) => {
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 9;
  const totalPages = Math.ceil(cocktails.length / itemsPerPage);
  
  const currentCocktails = cocktails.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage
  );

  const [cocktailNames, setCocktailNames] = useState<Record<string, any>>({});

  React.useEffect(() => {
    // Load cocktail names for current language
    import('../../data/cocktail_name_mapping.json')
      .then(module => setCocktailNames(module.default))
      .catch(console.error);
  }, [language]);

  const getCocktailName = (cocktailId: string) => {
    return cocktailNames[cocktailId]?.[language] || cocktailId;
  };

  return (
    <div className="h-full flex flex-col">
      {/* Navigation */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center mb-4">
          <Button
            variant="outline"
            onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
            disabled={currentPage === 0}
            className="touch-button"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          
          <div className="text-sm text-muted-foreground">
            {currentPage + 1} / {totalPages}
          </div>
          
          <Button
            variant="outline"
            onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
            disabled={currentPage === totalPages - 1}
            className="touch-button"
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
      )}

      {/* Cocktail Grid */}
      <div className="flex-1 grid grid-cols-3 gap-4">
        {currentCocktails.map((cocktail) => (
          <Card
            key={cocktail.id}
            className="touch-card glass-card cursor-pointer transition-all duration-200 hover:scale-105 magical-float"
            onClick={() => onCocktailSelect(cocktail)}
          >
            <div className="p-4 h-full flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 bg-gradient-primary rounded-full mb-3 flex items-center justify-center magical-glow">
                <span className="text-2xl">🍹</span>
              </div>
              <h3 className="text-sm font-medium leading-tight">
                {getCocktailName(cocktail.id)}
              </h3>
            </div>
          </Card>
        ))}
        
        {/* Empty slots to maintain grid */}
        {Array.from({ length: itemsPerPage - currentCocktails.length }).map((_, index) => (
          <div key={`empty-${index}`} className="touch-card opacity-30">
            <div className="p-4 h-full border-2 border-dashed border-muted-foreground/30 rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  );
};