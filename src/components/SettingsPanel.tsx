
import React, { useState } from 'react';
import { X, Languages, Beaker } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { ScrollArea } from './ui/scroll-area';
import { Badge } from './ui/badge';
import { Language } from '../hooks/useLanguage';
import { IngredientConfig } from '../hooks/useCocktails';

interface SettingsPanelProps {
  language: Language;
  onLanguageChange: (language: Language) => void;
  ingredientConfig: IngredientConfig;
  onIngredientConfigChange: (config: IngredientConfig) => void;
  onBack: () => void;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  language,
  onLanguageChange,
  ingredientConfig,
  onIngredientConfigChange,
  onBack
}) => {
  const [activeTab, setActiveTab] = useState<'language' | 'ingredients'>('language');
  const [ingredientNames, setIngredientNames] = useState<Record<string, any>>({});

  React.useEffect(() => {
    import('../../data/ingredient_mapping.json')
      .then(module => setIngredientNames(module.default))
      .catch(console.error);
  }, [language]);

  const getIngredientName = (ingredientId: string) => {
    return ingredientNames[ingredientId]?.[language] || ingredientId;
  };

  const languages: { code: Language; name: string }[] = [
    { code: 'en', name: 'English' },
    { code: 'de', name: 'Deutsch' },
    { code: 'hogwarts', name: 'Hogwarts' }
  ];

  const toggleIngredient = (ingredient: string, category: 'alcoholic' | 'nonAlcoholic' | 'external') => {
    const newConfig = { ...ingredientConfig };
    const isCurrentlyEnabled = newConfig.enabled[ingredient];

    if (category === 'external') {
      // For external ingredients, check if it's already enabled in alcoholic or non-alcoholic
      const isInAlcoholic = newConfig.alcoholic.includes(ingredient) && newConfig.enabled[ingredient];
      const isInNonAlcoholic = newConfig.nonAlcoholic.includes(ingredient) && newConfig.enabled[ingredient];
      
      if (isInAlcoholic || isInNonAlcoholic) {
        return; // Can't enable in external if already enabled in other categories
      }
    }

    if (isCurrentlyEnabled) {
      newConfig.enabled[ingredient] = false;
    } else {
      // Count enabled ingredients in the category
      const categoryIngredients = newConfig[category] || [];
      const enabledInCategory = categoryIngredients.filter(ing => newConfig.enabled[ing]);
      
      if (enabledInCategory.length < 4) {
        newConfig.enabled[ingredient] = true;
      }
    }

    onIngredientConfigChange(newConfig);
  };

  const getEnabledCount = (category: 'alcoholic' | 'nonAlcoholic' | 'external') => {
    const categoryIngredients = ingredientConfig[category] || [];
    return categoryIngredients.filter(ing => ingredientConfig.enabled[ing]).length;
  };

  const isIngredientDisabledInExternal = (ingredient: string) => {
    // Check if ingredient is enabled in alcoholic or non-alcoholic categories
    const isInAlcoholic = ingredientConfig.alcoholic.includes(ingredient) && ingredientConfig.enabled[ingredient];
    const isInNonAlcoholic = ingredientConfig.nonAlcoholic.includes(ingredient) && ingredientConfig.enabled[ingredient];
    return isInAlcoholic || isInNonAlcoholic;
  };

  return (
    <div className="h-full flex flex-col">
      <Card className="h-full glass-card flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-xl font-bold">Settings</h2>
          <Button variant="ghost" onClick={onBack} className="touch-button">
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border">
          <Button
            variant={activeTab === 'language' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('language')}
            className="flex-1 rounded-none touch-button"
          >
            <Languages className="h-5 w-5 mr-2" />
            Language
          </Button>
          <Button
            variant={activeTab === 'ingredients' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('ingredients')}
            className="flex-1 rounded-none touch-button"
          >
            <Beaker className="h-5 w-5 mr-2" />
            Ingredients
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 p-2 sm:p-3 overflow-hidden">
          {activeTab === 'language' && (
            <div className="space-y-2 sm:space-y-3 h-full">
              <h3 className="text-sm sm:text-base font-semibold mb-2 sm:mb-3">Choose Language</h3>
              <div className="grid gap-1 sm:gap-2">
                {languages.map(({ code, name }) => (
                  <Button
                    key={code}
                    variant={language === code ? 'default' : 'outline'}
                    onClick={() => onLanguageChange(code)}
                    className="touch-button justify-start text-xs sm:text-sm py-1 sm:py-2"
                  >
                    {name}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'ingredients' && (
            <div className="space-y-3 sm:space-y-4 h-full overflow-y-auto">
              <h3 className="text-sm sm:text-base font-semibold">Ingredient Configuration</h3>
              
              {/* Alcoholic Ingredients */}
              <div>
                <div className="flex items-center justify-between mb-1 sm:mb-2">
                  <h4 className="text-xs sm:text-sm font-medium">Alcoholic Ingredients</h4>
                  <Badge variant="secondary" className="text-xs">{getEnabledCount('alcoholic')}/4</Badge>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                  {ingredientConfig.alcoholic.map(ingredient => (
                    <Button
                      key={ingredient}
                      variant={ingredientConfig.enabled[ingredient] ? 'default' : 'outline'}
                      onClick={() => toggleIngredient(ingredient, 'alcoholic')}
                      className="touch-button justify-start text-xs py-1 h-7 sm:h-8"
                      disabled={!ingredientConfig.enabled[ingredient] && getEnabledCount('alcoholic') >= 4}
                    >
                      {getIngredientName(ingredient)}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Non-Alcoholic Ingredients */}
              <div>
                <div className="flex items-center justify-between mb-1 sm:mb-2">
                  <h4 className="text-xs sm:text-sm font-medium">Non-Alcoholic Ingredients</h4>
                  <Badge variant="secondary" className="text-xs">{getEnabledCount('nonAlcoholic')}/4</Badge>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                  {ingredientConfig.nonAlcoholic.map(ingredient => (
                    <Button
                      key={ingredient}
                      variant={ingredientConfig.enabled[ingredient] ? 'default' : 'outline'}
                      onClick={() => toggleIngredient(ingredient, 'nonAlcoholic')}
                      className="touch-button justify-start text-xs py-1 h-7 sm:h-8"
                      disabled={!ingredientConfig.enabled[ingredient] && getEnabledCount('nonAlcoholic') >= 4}
                    >
                      {getIngredientName(ingredient)}
                    </Button>
                  ))}
                </div>
              </div>

              {/* External Ingredients */}
              <div>
                <div className="flex items-center justify-between mb-1 sm:mb-2">
                  <h4 className="text-xs sm:text-sm font-medium">External Ingredients</h4>
                  <Badge variant="secondary" className="text-xs">{getEnabledCount('external')}/4</Badge>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                  {ingredientConfig.external.map(ingredient => {
                    const isDisabled = isIngredientDisabledInExternal(ingredient);
                    const isEnabled = ingredientConfig.enabled[ingredient];
                    
                    return (
                      <Button
                        key={ingredient}
                        variant={isEnabled ? 'default' : 'outline'}
                        onClick={() => toggleIngredient(ingredient, 'external')}
                        className="touch-button justify-start text-xs py-1 h-7 sm:h-8"
                        disabled={isDisabled || (!isEnabled && getEnabledCount('external') >= 4)}
                      >
                        {getIngredientName(ingredient)}
                        {isDisabled && <Badge variant="destructive" className="ml-1 text-xs px-1">Used</Badge>}
                      </Button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};
