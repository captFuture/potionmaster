
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
  const itemsPerPage = 6; // 2x3 grid for better visibility
  const totalPages = Math.ceil(cocktails.length / itemsPerPage);
  
  const currentCocktails = cocktails.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage
  );

  const [cocktailNames, setCocktailNames] = useState<Record<string, any>>({});

  React.useEffect(() => {
    // Load cocktail names for current language
    fetch('/data/cocktail_name_mapping.json')
      .then(res => res.json())
      .then(data => setCocktailNames(data))
      .catch(console.error);
  }, [language]);

  const getCocktailName = (cocktailId: string) => {
    return cocktailNames[cocktailId]?.[language] || cocktailId;
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
            className="touch-button shrink-0"
            size="sm"
          >
            <ChevronLeft className="h-4 w-4 sm:h-6 sm:w-6" />
          </Button>
        )}

        {/* Responsive Cocktail Grid */}
        <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-4 max-w-6xl mx-auto">
          {currentCocktails.map((cocktail) => (
            <Card
              key={cocktail.id}
              className="aspect-square touch-card glass-card cursor-pointer transition-all duration-200 hover:scale-105 magical-float relative overflow-hidden"
              onClick={() => onCocktailSelect(cocktail)}
          style={{
            backgroundImage: `url(/cocktails/${cocktail.id}.png)`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }}
            >
              {/* Overlay for better text readability */}
              <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px]" />
              <div className="relative z-10 p-2 sm:p-4 h-full flex flex-col items-center justify-center text-center">
                <div className="w-8 h-8 sm:w-12 sm:h-12 bg-white/20 backdrop-blur-sm rounded-full mb-2 sm:mb-3 flex items-center justify-center border border-white/30">
                  <span className="text-lg sm:text-xl">🍹</span>
                </div>
                <h3 className="text-xs sm:text-sm font-medium leading-tight text-white drop-shadow-lg">
                  {getCocktailName(cocktail.id)}
                </h3>
              </div>
            </Card>
          ))}
          
          {/* Empty slots to maintain grid */}
          {Array.from({ length: itemsPerPage - currentCocktails.length }).map((_, index) => (
            <div key={`empty-${index}`} className="aspect-square touch-card opacity-30">
              <div className="p-2 sm:p-4 h-full border-2 border-dashed border-muted-foreground/30 rounded-lg" />
            </div>
          ))}
        </div>

        {/* Right pagination button */}
        {totalPages > 1 && (
          <Button
            variant="outline"
            onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
            disabled={currentPage === totalPages - 1}
            className="touch-button shrink-0"
            size="sm"
          >
            <ChevronRight className="h-4 w-4 sm:h-6 sm:w-6" />
          </Button>
        )}
      </div>
    </div>
  );
};
