import React, { useState, useEffect } from 'react';
import { ArrowLeft, Clock } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Cocktail } from './PotionMaster';
import { Language } from '../hooks/useLanguage';
import cocktailNameMapping from '../../data/cocktail_name_mapping.json';
import ingredientMapping from '../../data/ingredient_mapping.json';
import interfaceLanguage from '../../data/interface_language.json';

interface CocktailDetailProps {
  cocktail: Cocktail;
  language: Language;
  onBack: () => void;
  onStartPreparation: () => void;
}

export const CocktailDetail: React.FC<CocktailDetailProps> = ({
  cocktail,
  language,
  onBack,
  onStartPreparation
}) => {
  const getCocktailName = (id: string) => cocktailNameMapping[id]?.[language] || id;
  const getIngredientName = (id: string) => ingredientMapping[id]?.[language] || id;

  const totalVolume = Object.values(cocktail.ingredients).reduce((sum, amount) => sum + amount, 0);
  const estimatedTime = Math.ceil(totalVolume / 50) * 3; // Rough estimate

  const t = (key: string) => interfaceLanguage[language]?.[key] || key;

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center mb-6">
        <Button variant="ghost" onClick={onBack} className="mr-4">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold">{getCocktailName(cocktail.id)}</h1>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Cocktail Image */}
        <Card 
          className="glass-card magical-float relative overflow-hidden"
          style={{
            backgroundImage: `url(/data/${cocktail.id}.png)`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }}
        >
          {/* Overlay for better text readability */}
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px]" />
          <div className="relative z-10 p-4 sm:p-6 h-full flex flex-col items-center justify-center">
            <div className="w-24 h-24 sm:w-32 sm:h-32 bg-white/20 backdrop-blur-sm rounded-full mb-3 sm:mb-4 flex items-center justify-center border border-white/30">
              <span className="text-4xl sm:text-6xl">🍹</span>
            </div>
            <div className="text-center">
              <h2 className="text-lg sm:text-xl font-semibold mb-2 text-white drop-shadow-lg">{getCocktailName(cocktail.id)}</h2>
              <div className="flex items-center justify-center text-white/80 text-xs sm:text-sm drop-shadow-lg">
                <Clock className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                {t('estimated_time').replace('{seconds}', estimatedTime.toString())}
              </div>
            </div>
          </div>
        </Card>

        {/* Ingredients & Instructions */}
        <Card className="glass-card">
          <div className="p-4 sm:p-6 h-full flex flex-col">
            <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">{t('ingredients_label')}</h3>
            
            <div className="flex-1 space-y-2 sm:space-y-3 overflow-y-auto">
              {Object.entries(cocktail.ingredients).map(([ingredient, amount]) => (
                <div key={ingredient} className="flex justify-between items-center py-1 sm:py-2 border-b border-border/30">
                  <span className="text-xs sm:text-sm">{getIngredientName(ingredient)}</span>
                  <span className="text-xs sm:text-sm font-mono text-muted-foreground">{amount}ml</span>
                </div>
              ))}
              
              {cocktail.post_add && (
                <div className="mt-3 sm:mt-4 p-2 sm:p-3 bg-warning/10 rounded-lg border border-warning/20">
                  <div className="text-xs sm:text-sm font-medium text-warning">{t('manual_add_label')}</div>
                  <div className="text-xs sm:text-sm text-muted-foreground mt-1">
                    {getIngredientName(cocktail.post_add)}
                  </div>
                </div>
              )}
            </div>

            <div className="mt-3 sm:mt-4 text-xs sm:text-sm text-muted-foreground">
              {t('total_volume').replace('{total}', totalVolume.toString())}
            </div>
          </div>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
        <Button variant="outline" onClick={onBack} className="flex-1 touch-button text-sm">
          {t('cancel')}
        </Button>
        <Button onClick={onStartPreparation} className="flex-1 touch-button text-sm">
          {t('start_preparing')}
        </Button>
      </div>

      {/* Glass Instruction */}
      <div className="mt-3 sm:mt-4 p-3 sm:p-4 bg-primary/10 rounded-lg border border-primary/20">
        <div className="text-xs sm:text-sm text-center text-primary">
          {t('glass_instruction')}
        </div>
      </div>
    </div>
  );
};