import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, RotateCcw } from "lucide-react";
import { usePumpConfig } from '../hooks/usePumpConfig';
import { useCocktails } from '../hooks/useCocktails';
import { useToast } from '../hooks/use-toast';
import { useLanguage } from '../hooks/useLanguage';

interface PumpConfigPanelProps {
  onBack: () => void;
}

export const PumpConfigPanel: React.FC<PumpConfigPanelProps> = ({ onBack }) => {
  const { ingredientConfig } = useCocktails();
  const { pumpConfig, updatePumpConfig, resetToDefaults } = usePumpConfig(ingredientConfig);
  const { toast } = useToast();
  const { language } = useLanguage();
  const [ingredientMapping, setIngredientMapping] = useState<Record<string, Record<string, string>>>({});

  useEffect(() => {
    // Load ingredient mapping for translations
    fetch('/data/ingredient_mapping.json')
      .then(response => response.json())
      .then(data => setIngredientMapping(data))
      .catch(error => console.error('Failed to load ingredient mapping:', error));
  }, []);

  const getTranslatedIngredientName = (ingredient: string) => {
    return ingredientMapping[ingredient]?.[language] || ingredient;
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

  const handleReset = () => {
    resetToDefaults();
    toast({
      title: "Reset Complete",
      description: "Pump configuration has been reset to defaults.",
    });
  };

  return (
    <Card className="h-full glass-card">
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onBack}
            className="text-foreground hover:bg-primary/10"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <CardTitle className="text-2xl font-bold text-foreground">
            Pump Configuration
          </CardTitle>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleReset}
          className="flex items-center gap-2"
        >
          <RotateCcw className="h-4 w-4" />
          Reset
        </Button>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[calc(100vh-12rem)]">
          <div className="grid grid-cols-3 gap-4">
            {pumpConfig.map((pump) => (
              <Card key={pump.pumpId} className="bg-card/50 border-border">
                <CardContent className="p-3">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm">
                          {pump.pumpId}
                        </div>
                        <div>
                          <h3 className="font-semibold text-foreground text-sm">Pump {pump.pumpId}</h3>
                          <p className="text-xs text-muted-foreground">Ch {pump.relayChannel}</p>
                        </div>
                      </div>
                      <Switch
                        id={`pump-${pump.pumpId}-enabled`}
                        checked={pump.enabled}
                        onCheckedChange={(enabled) => handleEnabledToggle(pump.pumpId, enabled)}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor={`pump-${pump.pumpId}-liquid`} className="text-xs font-medium">
                        Liquid
                      </Label>
                      <Select
                        value={pump.liquid}
                        onValueChange={(liquid) => handleLiquidChange(pump.pumpId, liquid)}
                        disabled={!pump.enabled}
                      >
                        <SelectTrigger className="bg-background text-sm h-8">
                          <SelectValue placeholder="Select liquid" />
                        </SelectTrigger>
                        <SelectContent className="bg-background border border-border z-50">
                          {getAvailableIngredients().map((ingredient) => (
                            <SelectItem key={ingredient} value={ingredient}>
                              {getTranslatedIngredientName(ingredient)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};