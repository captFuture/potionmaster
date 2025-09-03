import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowLeft, RotateCcw } from "lucide-react";
import { usePumpConfig } from '../hooks/usePumpConfig';
import { useCocktails } from '../hooks/useCocktails';
import { useToast } from '../hooks/use-toast';

interface PumpConfigPanelProps {
  onBack: () => void;
}

export const PumpConfigPanel: React.FC<PumpConfigPanelProps> = ({ onBack }) => {
  const { ingredientConfig } = useCocktails();
  const { pumpConfig, updatePumpConfig, resetToDefaults } = usePumpConfig(ingredientConfig);
  const { toast } = useToast();

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
          <div className="space-y-4">
            {pumpConfig.map((pump) => (
              <Card key={pump.pumpId} className="bg-card/50 border-border">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold">
                        {pump.pumpId}
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">Pump {pump.pumpId}</h3>
                        <p className="text-sm text-muted-foreground">Relay Channel {pump.relayChannel}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Label htmlFor={`pump-${pump.pumpId}-enabled`} className="text-sm">
                        Enabled
                      </Label>
                      <Switch
                        id={`pump-${pump.pumpId}-enabled`}
                        checked={pump.enabled}
                        onCheckedChange={(enabled) => handleEnabledToggle(pump.pumpId, enabled)}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`pump-${pump.pumpId}-liquid`} className="text-sm font-medium">
                      Liquid
                    </Label>
                    <Input
                      id={`pump-${pump.pumpId}-liquid`}
                      value={pump.liquid}
                      onChange={(e) => handleLiquidChange(pump.pumpId, e.target.value)}
                      placeholder="Enter liquid name"
                      disabled={!pump.enabled}
                      className="bg-background"
                    />
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