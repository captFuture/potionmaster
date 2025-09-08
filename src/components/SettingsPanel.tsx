
import React, { useState } from 'react';
import { X, Languages, Beaker, Wine, Coffee, ExternalLink, Power, Type, Palette, Settings } from 'lucide-react';
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
import { usePumpConfig } from '../hooks/usePumpConfig';
import { Switch } from './ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

interface SettingsPanelProps {
  language: Language;
  onLanguageChange: (language: Language) => void;
  ingredientConfig: IngredientConfig;
  onIngredientConfigChange: (config: IngredientConfig) => void;
  onBack: () => void;
  onNavigateToPumpConfig: () => void;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  language,
  onLanguageChange,
  ingredientConfig,
  onIngredientConfigChange,
  onBack,
  onNavigateToPumpConfig
}) => {
  const [activeTab, setActiveTab] = useState<'language' | 'theme' | 'ingredients' | 'pumps' | 'system'>('language');
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
    { code: 'hufflepuff', name: 'Hufflepuff' },
    { code: 'retro-arcade', name: 'Retro Arcade' },
    { code: 'retro-console', name: 'Retro Console' }
  ];

  const toggleIngredient = (ingredient: string) => {
    const newConfig = { ...ingredientConfig };
    const isCurrentlyEnabled = newConfig.enabled[ingredient];

    if (isCurrentlyEnabled) {
      newConfig.enabled[ingredient] = false;
    } else {
      newConfig.enabled[ingredient] = true;
    }

    onIngredientConfigChange(newConfig);
  };

  const getEnabledCount = () => {
    return Object.values(ingredientConfig.enabled).filter(enabled => enabled).length;
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

  // Inline pump configuration component
  const PumpConfigurationInline: React.FC<{
    ingredientConfig: IngredientConfig;
    language: Language;
    ingredientNames: Record<string, any>;
  }> = ({ ingredientConfig, language, ingredientNames }) => {
    const { pumpConfig, updatePumpConfig, resetToDefaults } = usePumpConfig(ingredientConfig);

    const getTranslatedIngredientName = (ingredient: string) => {
      return ingredientNames[ingredient]?.[language] || ingredient;
    };

    const getAvailableIngredients = () => {
      if (!ingredientConfig) return [];
      return Object.entries(ingredientConfig.enabled)
        .filter(([_, enabled]) => enabled)
        .map(([ingredient, _]) => ingredient);
    };

    const handleLiquidChange = (pumpId: number, liquid: string) => {
      updatePumpConfig(pumpId, { liquid });
    };

    const handleEnabledToggle = (pumpId: number, enabled: boolean) => {
      updatePumpConfig(pumpId, { enabled });
    };

    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold">Pump Configuration</h3>
          <Button
            variant="outline"
            size="sm"
            onClick={resetToDefaults}
            className="text-xs"
          >
            Reset
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">Configure which liquids are connected to each pump.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {pumpConfig.map((pump) => (
            <div key={pump.pumpId} className="p-3 bg-card/50 rounded-lg border border-border">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-xs">
                      {pump.pumpId}
                    </div>
                    <span className="text-sm font-medium">Pump {pump.pumpId}</span>
                  </div>
                  <Switch
                    checked={pump.enabled}
                    onCheckedChange={(enabled) => handleEnabledToggle(pump.pumpId, enabled)}
                  />
                </div>
                <Select
                  value={pump.liquid}
                  onValueChange={(liquid) => handleLiquidChange(pump.pumpId, liquid)}
                  disabled={!pump.enabled}
                >
                  <SelectTrigger className="text-xs h-8">
                    <SelectValue placeholder="Select liquid" />
                  </SelectTrigger>
                  <SelectContent>
                    {getAvailableIngredients().map((ingredient) => (
                      <SelectItem key={ingredient} value={ingredient}>
                        {getTranslatedIngredientName(ingredient)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
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
            variant={activeTab === 'pumps' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('pumps')}
            className="flex-1 rounded-none touch-button text-xs sm:text-sm"
          >
            <Settings className="h-4 w-4 mr-1" />
            Pumps
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
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {themes.map(({ code, name }) => (
                    <Button
                      key={code}
                      variant={theme === code ? 'default' : 'outline'}
                      onClick={() => changeTheme(code)}
                      className="touch-button text-xs px-2 py-1 h-8 transition-all duration-200 active:scale-95 active:bg-primary/20"
                    >
                      {name}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'ingredients' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-semibold">Available Ingredients</h3>
                  <Badge variant="secondary">{getEnabledCount()} enabled</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Select which ingredients you have available. Up to 8 can be connected to pumps, others will be added externally.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {ingredientConfig.ingredients.map(ingredient => (
                    <Button
                      key={ingredient}
                      variant={ingredientConfig.enabled[ingredient] ? 'default' : 'outline'}
                      onClick={() => toggleIngredient(ingredient)}
                      className="touch-button justify-start h-12"
                    >
                      {getIngredientName(ingredient)}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'pumps' && (
              <PumpConfigurationInline 
                ingredientConfig={ingredientConfig}
                language={language}
                ingredientNames={ingredientNames}
              />
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
