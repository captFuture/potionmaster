import React, { useState } from 'react';
import { ArrowLeft, RotateCcw } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Switch } from './ui/switch';
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
  const [showCleaningCycle, setShowCleaningCycle] = useState(false);
  const [cleaningInProgress, setCleaningInProgress] = useState(false);
  const [ingredientNames, setIngredientNames] = useState<Record<string, any>>({});

  React.useEffect(() => {
    import('../../data/ingredient_mapping.json')
      .then(module => setIngredientNames(module.default))
      .catch(console.error);
  }, [language]);

  const getIngredientName = (id: string) => ingredientNames[id]?.[language] || id;

  const handleIngredientToggle = (ingredient: string, enabled: boolean) => {
    const newConfig = {
      ...ingredientConfig,
      enabled: {
        ...ingredientConfig.enabled,
        [ingredient]: enabled
      }
    };
    onIngredientConfigChange(newConfig);
  };

  const startCleaningCycle = async () => {
    setCleaningInProgress(true);
    try {
      const response = await fetch('http://localhost:3000/api/hardware/cleaning-cycle', {
        method: 'POST'
      });
      if (!response.ok) throw new Error('Cleaning cycle failed');
    } catch (error) {
      console.error('Cleaning cycle error:', error);
    } finally {
      setCleaningInProgress(false);
      setShowCleaningCycle(false);
    }
  };

  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
    { code: 'hogwarts', name: 'Hogwarts', flag: '🏰' }
  ] as const;

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center mb-6">
        <Button variant="ghost" onClick={onBack} className="mr-4">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold">Settings</h1>
      </div>

      <div className="flex-1 grid grid-cols-2 gap-6">
        {/* Language Selection */}
        <Card className="glass-card">
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4">Language / Sprache</h3>
            <div className="space-y-3">
              {languages.map((lang) => (
                <Button
                  key={lang.code}
                  variant={language === lang.code ? "default" : "outline"}
                  onClick={() => onLanguageChange(lang.code)}
                  className="w-full justify-start touch-button"
                >
                  <span className="mr-2">{lang.flag}</span>
                  {lang.name}
                </Button>
              ))}
            </div>
          </div>
        </Card>

        {/* Cleaning Cycle */}
        <Card className="glass-card">
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4">Maintenance</h3>
            {!showCleaningCycle ? (
              <Button
                variant="outline"
                onClick={() => setShowCleaningCycle(true)}
                className="w-full touch-button"
                disabled={cleaningInProgress}
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Start Cleaning Cycle
              </Button>
            ) : (
              <div className="space-y-4">
                <div className="p-4 bg-warning/10 rounded-lg border border-warning/20">
                  <div className="text-sm font-medium text-warning mb-2">⚠️ Preparation Required</div>
                  <div className="text-sm text-muted-foreground">
                    1. Disconnect all bottles<br/>
                    2. Place hoses in disinfectant water<br/>
                    3. Ensure collection area is ready
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => setShowCleaningCycle(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={startCleaningCycle}
                    disabled={cleaningInProgress}
                    className="flex-1"
                  >
                    {cleaningInProgress ? 'Cleaning...' : 'Start Cleaning'}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Ingredient Configuration */}
      <Card className="glass-card mt-6">
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">Active Ingredients Configuration</h3>
          
          <div className="grid grid-cols-3 gap-6">
            {/* Alcoholic Ingredients */}
            <div>
              <h4 className="font-medium mb-3 text-primary">Alcoholic (Max 4)</h4>
              <div className="space-y-2">
                {ingredientConfig.alcoholic.map((ingredient) => (
                  <div key={ingredient} className="flex items-center justify-between">
                    <span className="text-sm">{getIngredientName(ingredient)}</span>
                    <Switch
                      checked={ingredientConfig.enabled[ingredient] || false}
                      onCheckedChange={(checked) => handleIngredientToggle(ingredient, checked)}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Non-Alcoholic Ingredients */}
            <div>
              <h4 className="font-medium mb-3 text-secondary">Non-Alcoholic (Max 4)</h4>
              <div className="space-y-2">
                {ingredientConfig.nonAlcoholic.map((ingredient) => (
                  <div key={ingredient} className="flex items-center justify-between">
                    <span className="text-sm">{getIngredientName(ingredient)}</span>
                    <Switch
                      checked={ingredientConfig.enabled[ingredient] || false}
                      onCheckedChange={(checked) => handleIngredientToggle(ingredient, checked)}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* External Ingredients */}
            <div>
              <h4 className="font-medium mb-3 text-accent">External (Max 4)</h4>
              <div className="space-y-2">
                {ingredientConfig.external.map((ingredient) => {
                  const isUsedInOtherCategories = 
                    (ingredientConfig.alcoholic.includes(ingredient) && ingredientConfig.enabled[ingredient]) ||
                    (ingredientConfig.nonAlcoholic.includes(ingredient) && ingredientConfig.enabled[ingredient]);
                  
                  return (
                    <div key={ingredient} className="flex items-center justify-between">
                      <span className={`text-sm ${isUsedInOtherCategories ? 'text-muted-foreground' : ''}`}>
                        {getIngredientName(ingredient)}
                      </span>
                      <Switch
                        checked={ingredientConfig.enabled[`external_${ingredient}`] || false}
                        disabled={isUsedInOtherCategories}
                        onCheckedChange={(checked) => handleIngredientToggle(`external_${ingredient}`, checked)}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};