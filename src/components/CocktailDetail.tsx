import React, { useState, useEffect } from 'react';
import { ArrowLeft, Clock } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Cocktail } from './PotionMaster';
import { Language } from '../hooks/useLanguage';

interface CocktailDetailProps {
  cocktail: Cocktail;
  language: Language;
  translations: any;
  onBack: () => void;
  onStartPreparation: () => void;
}

export const CocktailDetail: React.FC<CocktailDetailProps> = ({
  cocktail,
  language,
  translations,
  onBack,
  onStartPreparation
}) => {
  const [cocktailNames, setCocktailNames] = useState<Record<string, any>>({});
  const [ingredientNames, setIngredientNames] = useState<Record<string, any>>({});

  useEffect(() => {
    Promise.all([
      fetch('/api/cocktails/names').then(res => res.json()),
      fetch('/api/ingredients/names').then(res => res.json())
    ])
    .then(([names, ingredients]) => {
      setCocktailNames(names);
      setIngredientNames(ingredients);
    })
    .catch(console.error);
  }, [language]);

  const getCocktailName = (id: string) => cocktailNames[id]?.[language] || id;
  const getIngredientName = (id: string) => ingredientNames[id]?.[language] || id;

  const totalVolume = Object.values(cocktail.ingredients).reduce((sum, amount) => sum + amount, 0);
  const estimatedTime = Math.ceil(totalVolume / 50) * 3; // Rough estimate

  const t = (key: string) => translations[key]?.[language] || key;

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center mb-6">
        <Button variant="ghost" onClick={onBack} className="mr-4">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold">{getCocktailName(cocktail.id)}</h1>
      </div>

      <div className="flex-1 grid grid-cols-2 gap-6">
        {/* Cocktail Image */}
        <Card className="glass-card magical-float">
          <div className="p-6 h-full flex flex-col items-center justify-center">
            <div className="w-32 h-32 bg-gradient-primary rounded-full mb-4 flex items-center justify-center magical-glow">
              <span className="text-6xl">🍹</span>
            </div>
            <div className="text-center">
              <h2 className="text-xl font-semibold mb-2">{getCocktailName(cocktail.id)}</h2>
              <div className="flex items-center text-muted-foreground text-sm">
                <Clock className="h-4 w-4 mr-1" />
                {t('estimated_time').replace('{seconds}', estimatedTime.toString())}
              </div>
            </div>
          </div>
        </Card>

        {/* Ingredients & Instructions */}
        <Card className="glass-card">
          <div className="p-6 h-full flex flex-col">
            <h3 className="text-lg font-semibold mb-4">{t('ingredients_label')}</h3>
            
            <div className="flex-1 space-y-3">
              {Object.entries(cocktail.ingredients).map(([ingredient, amount]) => (
                <div key={ingredient} className="flex justify-between items-center py-2 border-b border-border/30">
                  <span className="text-sm">{getIngredientName(ingredient)}</span>
                  <span className="text-sm font-mono text-muted-foreground">{amount}ml</span>
                </div>
              ))}
              
              {cocktail.post_add && (
                <div className="mt-4 p-3 bg-warning/10 rounded-lg border border-warning/20">
                  <div className="text-sm font-medium text-warning">{t('manual_add_label')}</div>
                  <div className="text-sm text-muted-foreground mt-1">
                    {getIngredientName(cocktail.post_add)}
                  </div>
                </div>
              )}
            </div>

            <div className="mt-4 text-sm text-muted-foreground">
              {t('total_volume').replace('{total}', totalVolume.toString())}
            </div>
          </div>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="mt-6 flex space-x-4">
        <Button variant="outline" onClick={onBack} className="flex-1 touch-button">
          {t('cancel')}
        </Button>
        <Button onClick={onStartPreparation} className="flex-1 touch-button">
          {t('start_preparing')}
        </Button>
      </div>

      {/* Glass Instruction */}
      <div className="mt-4 p-4 bg-primary/10 rounded-lg border border-primary/20">
        <div className="text-sm text-center text-primary">
          {t('glass_instruction')}
        </div>
      </div>
    </div>
  );
};