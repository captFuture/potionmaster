import React, { useState, useEffect } from 'react';
import { Header } from './Header';
import { Footer } from './Footer';
import { CocktailGrid } from './CocktailGrid';
import { CocktailDetail } from './CocktailDetail';
import { SettingsPanel } from './SettingsPanel';
import { PumpConfigPanel } from './PumpConfigPanel';
import { DebugPanel } from './DebugPanel';
import { PreparationView } from './PreparationView';
import { Screensaver } from './Screensaver';
import { useLanguage } from '../hooks/useLanguage';
import { useCocktails } from '../hooks/useCocktails';
import { useHardware } from '../hooks/useHardware';
import { useToast } from '../hooks/use-toast';

export type ViewMode = 'home' | 'detail' | 'settings' | 'pumpconfig' | 'debug' | 'preparing' | 'screensaver';

export interface Cocktail {
  id: string;
  ingredients: Record<string, number>;
  post_add?: string;
}

export const PotionMaster: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewMode>('home');
  const [selectedCocktail, setSelectedCocktail] = useState<Cocktail | null>(null);
  const [debugTouchCount, setDebugTouchCount] = useState(0);
  const [screensaverTimer, setScreensaverTimer] = useState<NodeJS.Timeout | null>(null);
  
  const { language, setLanguage, translations } = useLanguage();
  const { availableCocktails, ingredientConfig, updateIngredientConfig } = useCocktails();
  const { connectionStatus, scaleWeight, tareScale } = useHardware();
  const { toast } = useToast();

  // Remove conflicting theme override - theme is now handled by useTheme hook only

  // Screensaver logic
  const resetScreensaverTimer = () => {
    if (screensaverTimer) {
      clearTimeout(screensaverTimer);
    }
    // Don't activate screensaver when preparing cocktails, in settings, or debug mode
    if (currentView !== 'screensaver' && currentView !== 'preparing' && currentView !== 'settings' && currentView !== 'debug') {
      const timer = setTimeout(() => {
        setCurrentView('screensaver');
      }, 60000); // 60 seconds
      setScreensaverTimer(timer);
    }
  };

  useEffect(() => {
    resetScreensaverTimer();
    return () => {
      if (screensaverTimer) {
        clearTimeout(screensaverTimer);
      }
    };
  }, [currentView]);

  // Debug panel access (5 touches in bottom right corner)
  const handleDebugTouch = () => {
    const newCount = debugTouchCount + 1;
    setDebugTouchCount(newCount);
    
    if (newCount >= 2) {
      const remaining = 5 - newCount;
      if (remaining > 0) {
        toast({
          title: `Debug Access`,
          description: `${remaining} more touches needed`,
          duration: 1000,
        });
      }
    }
    
    if (newCount >= 5) {
      setCurrentView('debug');
      setDebugTouchCount(0);
      toast({
        title: "Debug Panel Activated",
        description: "Hardware test mode enabled",
      });
    }
    
    // Reset counter after 3 seconds
    setTimeout(() => setDebugTouchCount(0), 3000);
  };

  const handleCocktailSelect = (cocktail: Cocktail) => {
    setSelectedCocktail(cocktail);
    setCurrentView('detail');
  };

  const handleStartPreparation = () => {
    setCurrentView('preparing');
  };

  const handleBackToHome = () => {
    setCurrentView('home');
    setSelectedCocktail(null);
    resetScreensaverTimer();
  };

  const handleScreensaverTouch = () => {
    setCurrentView('home');
    resetScreensaverTimer();
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'screensaver':
        return <Screensaver onTouch={handleScreensaverTouch} />;
      
      case 'settings':
        return (
          <SettingsPanel
            language={language}
            onLanguageChange={setLanguage}
            ingredientConfig={ingredientConfig}
            onIngredientConfigChange={updateIngredientConfig}
            onBack={handleBackToHome}
            onNavigateToPumpConfig={() => setCurrentView('pumpconfig')}
          />
        );
      
      case 'pumpconfig':
        return (
          <PumpConfigPanel
            onBack={() => setCurrentView('settings')}
          />
        );
      
      case 'debug':
        return (
          <DebugPanel
            connectionStatus={connectionStatus}
            onBack={() => setCurrentView('settings')}
          />
        );
      
      case 'detail':
        return (
          <CocktailDetail
            cocktail={selectedCocktail!}
            language={language}
            onBack={handleBackToHome}
            onStartPreparation={handleStartPreparation}
          />
        );
      
      case 'preparing':
        return (
          <PreparationView
            cocktail={selectedCocktail!}
            language={language}
            translations={translations}
            onComplete={handleBackToHome}
            onError={handleBackToHome}
          />
        );
      
      default:
        return (
          <CocktailGrid
            cocktails={availableCocktails}
            language={language}
            onCocktailSelect={handleCocktailSelect}
            ingredientConfig={ingredientConfig}
          />
        );
    }
  };

  return (
    <div className="min-h-screen w-full  text-foreground overflow-hidden touch-optimized">
      {currentView !== 'screensaver' && (
        <>
          <Header
            connectionStatus={connectionStatus}
            onSettingsClick={() => setCurrentView('settings')}
          />
          
          <main className="flex-1 p-2 sm:p-4 content-area">
            {renderCurrentView()}
          </main>
          
          <Footer
            scaleWeight={scaleWeight}
            onTareScale={tareScale}
            onDebugTouch={handleDebugTouch}
          />
        </>
      )}
      
      {currentView === 'screensaver' && renderCurrentView()}
    </div>
  );
};