
import React, { useState } from 'react';
import { X, Languages, Beaker, Wine, Coffee, ExternalLink, Power, Type, Palette } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { ScrollArea } from './ui/scroll-area';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { useToast } from '../hooks/use-toast';
import { Language } from '../hooks/useLanguage';
import { IngredientConfig } from '../hooks/useCocktails';
import { useAppConfig } from '../hooks/useAppConfig';
import { useTheme, Theme } from '../hooks/useTheme';

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
  const [activeTab, setActiveTab] = useState<'language' | 'theme' | 'ingredients' | 'system'>('language');
  const [ingredientTab, setIngredientTab] = useState<'alcoholic' | 'nonAlcoholic' | 'external'>('alcoholic');
  const [ingredientNames, setIngredientNames] = useState<Record<string, any>>({});
  const { config, updateConfig, shutdown } = useAppConfig();
  const { theme, changeTheme } = useTheme();
  const { toast } = useToast();

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

  const themes: { code: Theme; name: string }[] = [
    { code: 'cappuccino', name: 'Cappuccino' },
    { code: 'summer', name: 'Summer' },
    { code: 'winter', name: 'Winter' },
    { code: 'gryffindor', name: 'Gryffindor' },
    { code: 'slytherin', name: 'Slytherin' },
    { code: 'ravenclaw', name: 'Ravenclaw' },
    { code: 'hufflepuff', name: 'Hufflepuff' }
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

  const handleShutdown = async () => {
    const success = await shutdown();
    if (success) {
      toast({
        title: "Shutdown Initiated",
        description: "System is shutting down gracefully...",
      });
    } else {
      toast({
        title: "Shutdown Failed",
        description: "Unable to initiate system shutdown",
        variant: "destructive",
      });
    }
  };

  return (
    <div className=" flex flex-col touch-optimized">
      <Card className=" glass-card flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-xl font-bold">Settings</h2>
          <Button variant="ghost" onClick={onBack} className="touch-button">
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Main Tabs */}
        <div className="flex border-b border-border">
          <Button
            variant={activeTab === 'language' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('language')}
            className="flex-1 rounded-none touch-button text-xs sm:text-sm"
          >
            <Languages className="h-4 w-4 mr-1" />
            Language
          </Button>
          <Button
            variant={activeTab === 'theme' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('theme')}
            className="flex-1 rounded-none touch-button text-xs sm:text-sm"
          >
            <Palette className="h-4 w-4 mr-1" />
            Theme
          </Button>
          <Button
            variant={activeTab === 'ingredients' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('ingredients')}
            className="flex-1 rounded-none touch-button text-xs sm:text-sm"
          >
            <Beaker className="h-4 w-4 mr-1" />
            Ingredients
          </Button>
          <Button
            variant={activeTab === 'system' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('system')}
            className="flex-1 rounded-none touch-button text-xs sm:text-sm"
          >
            <Type className="h-4 w-4 mr-1" />
            System
          </Button>
        </div>

        {/* Content with scroll area for touchscreen */}
        <ScrollArea className="flex-1">
          <div className="p-3 sm:p-4">
            {activeTab === 'language' && (
              <div className="space-y-3">
                <h3 className="text-base font-semibold">Choose Language</h3>
                <div className="grid gap-2">
                  {languages.map(({ code, name }) => (
                    <Button
                      key={code}
                      variant={language === code ? 'default' : 'outline'}
                      onClick={() => onLanguageChange(code)}
                      className="touch-button justify-start"
                    >
                      {name}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'theme' && (
              <div className="space-y-3">
                <h3 className="text-base font-semibold">Choose Theme</h3>
                <div className="grid gap-2">
                  {themes.map(({ code, name }) => (
                    <Button
                      key={code}
                      variant={theme === code ? 'default' : 'outline'}
                      onClick={() => changeTheme(code)}
                      className="touch-button justify-start"
                    >
                      {name}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'ingredients' && (
              <div className="space-y-4">
                <h3 className="text-base font-semibold">Ingredient Configuration</h3>
                
                <Tabs value={ingredientTab} onValueChange={(value) => setIngredientTab(value as any)} className="space-y-4">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="alcoholic" className="text-xs sm:text-sm">
                      <Wine className="h-4 w-4 mr-1" />
                      Alcoholic
                    </TabsTrigger>
                    <TabsTrigger value="nonAlcoholic" className="text-xs sm:text-sm">
                      <Coffee className="h-4 w-4 mr-1" />
                      Non-Alcoholic
                    </TabsTrigger>
                    <TabsTrigger value="external" className="text-xs sm:text-sm">
                      <ExternalLink className="h-4 w-4 mr-1" />
                      External
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="alcoholic" className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">Alcoholic Ingredients</h4>
                      <Badge variant="secondary">{getEnabledCount('alcoholic')}/4</Badge>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {ingredientConfig.alcoholic.map(ingredient => (
                        <Button
                          key={ingredient}
                          variant={ingredientConfig.enabled[ingredient] ? 'default' : 'outline'}
                          onClick={() => toggleIngredient(ingredient, 'alcoholic')}
                          className="touch-button justify-start h-12"
                          disabled={!ingredientConfig.enabled[ingredient] && getEnabledCount('alcoholic') >= 4}
                        >
                          {getIngredientName(ingredient)}
                        </Button>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="nonAlcoholic" className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">Non-Alcoholic Ingredients</h4>
                      <Badge variant="secondary">{getEnabledCount('nonAlcoholic')}/4</Badge>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {ingredientConfig.nonAlcoholic.map(ingredient => (
                        <Button
                          key={ingredient}
                          variant={ingredientConfig.enabled[ingredient] ? 'default' : 'outline'}
                          onClick={() => toggleIngredient(ingredient, 'nonAlcoholic')}
                          className="touch-button justify-start h-12"
                          disabled={!ingredientConfig.enabled[ingredient] && getEnabledCount('nonAlcoholic') >= 4}
                        >
                          {getIngredientName(ingredient)}
                        </Button>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="external" className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">External Ingredients</h4>
                      <Badge variant="secondary">{getEnabledCount('external')}/4</Badge>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {ingredientConfig.external.map(ingredient => {
                        const isDisabled = isIngredientDisabledInExternal(ingredient);
                        const isEnabled = ingredientConfig.enabled[ingredient];
                        
                        return (
                          <Button
                            key={ingredient}
                            variant={isEnabled ? 'default' : 'outline'}
                            onClick={() => toggleIngredient(ingredient, 'external')}
                            className="touch-button justify-start h-12"
                            disabled={isDisabled || (!isEnabled && getEnabledCount('external') >= 4)}
                          >
                            <span className="flex-1 text-left">{getIngredientName(ingredient)}</span>
                            {isDisabled && <Badge variant="destructive" className="ml-2 text-xs">Used</Badge>}
                          </Button>
                        );
                      })}
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            )}

            {activeTab === 'system' && (
              <div className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-base font-semibold">System Labels</h3>
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="primaryTitle">Primary Title</Label>
                      <Input
                        id="primaryTitle"
                        value={config.primaryTitle}
                        onChange={(e) => updateConfig({ primaryTitle: e.target.value })}
                        className="touch-button"
                        placeholder="Potion Master"
                      />
                    </div>
                    <div>
                      <Label htmlFor="secondaryTitle">Secondary Title</Label>
                      <Input
                        id="secondaryTitle"
                        value={config.secondaryTitle}
                        onChange={(e) => updateConfig({ secondaryTitle: e.target.value })}
                        className="touch-button"
                        placeholder="Mixmagic System"
                      />
                    </div>
                  </div>
                </div>

                <div className="border-t border-border pt-4">
                  <h3 className="text-base font-semibold mb-4">System Control</h3>
                  <Button
                    variant="destructive"
                    onClick={handleShutdown}
                    className="w-full touch-button"
                    size="lg"
                  >
                    <Power className="h-4 w-4 mr-2" />
                    Shutdown System
                  </Button>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </Card>
    </div>
  );
};
