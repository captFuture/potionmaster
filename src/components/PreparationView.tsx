import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, StopCircle } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Progress } from './ui/progress';
import { Cocktail } from './PotionMaster';
import { Language } from '../hooks/useLanguage';
import { api } from '../lib/api';

interface PreparationViewProps {
  cocktail: Cocktail;
  language: Language;
  translations: any;
  onComplete: () => void;
  onError: () => void;
}

interface PreparationStep {
  ingredient: string;
  amount: number;
  completed: boolean;
}

export const PreparationView: React.FC<PreparationViewProps> = ({
  cocktail,
  language,
  translations,
  onComplete,
  onError
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isPouring, setIsPouring] = useState(false);
  const [steps, setSteps] = useState<PreparationStep[]>([]);
  const [ingredientNames, setIngredientNames] = useState<Record<string, any>>({});
  const [cocktailNames, setCocktailNames] = useState<Record<string, any>>({});
  const [preparationComplete, setPreparationComplete] = useState(false);
  const eventSourceRef = useRef<EventSource | null>(null);

  const t = (key: string) => translations[key]?.[language] || key;

  useEffect(() => {
    // Initialize preparation steps
    const preparationSteps = Object.entries(cocktail.ingredients).map(([ingredient, amount]) => ({
      ingredient,
      amount,
      completed: false
    }));
    setSteps(preparationSteps);

    // Load names from local data files
    Promise.all([
      fetch('/data/ingredient_mapping.json').then(res => res.json()),
      fetch('/data/cocktail_name_mapping.json').then(res => res.json())
    ])
    .then(([ingredients, cocktails]) => {
      setIngredientNames(ingredients);
      setCocktailNames(cocktails);
    })
    .catch(console.error);

    // Connect to SSE for real-time updates
    connectToSSE();

    // Start preparation
    startPreparation();

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, []);

  const getIngredientName = (id: string) => ingredientNames[id]?.[language] || id;
  const getCocktailName = (id: string) => cocktailNames[id]?.[language] || id;

  const getLiquidColor = (ingredient: string) => {
    const colors = {
      'vodka': '#c8d5e8',
      'white_wine': '#f4f2b8',
      'rum': '#d4a574',
      'tonic': '#e8f4f8',
      'cola': '#3d2b1f',
      'passion_syrup': '#ff6b35',
      'elderflower_syrup': '#f0e68c',
      'lemon_juice': '#fff44f',
      'bitter': '#8b4513',
      'blossom_syrup': '#ffb3d9'
    };
    return colors[ingredient] || 'hsl(var(--primary))';
  };

  const connectToSSE = () => {
    eventSourceRef.current = new EventSource(api('/api/sse'));
    
    eventSourceRef.current.addEventListener('preparation_update', (event) => {
      const data = JSON.parse(event.data);
      
      if (data.currentStep !== undefined) {
        setCurrentStep(data.currentStep);
      }
      
      if (data.progress !== undefined) {
        setProgress(data.progress);
      }
      
      if (data.steps) {
        setSteps(data.steps);
      }
      
      setIsPouring(data.isPouring || false);
    });

    eventSourceRef.current.addEventListener('preparation_complete', (event) => {
      const data = JSON.parse(event.data);
      setProgress(100);
      setSteps(prev => prev.map(s => ({ ...s, completed: true })));
      setPreparationComplete(true);
    });

    eventSourceRef.current.addEventListener('error', (event) => {
      console.error('SSE error:', event);
    });
  };

  const startPreparation = async () => {
    try {
      // Server handles tare and sequential pouring
      const response = await fetch(api('/api/cocktails/prepare'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cocktailId: cocktail.id, ingredients: cocktail.ingredients })
      });

      if (!response.ok) throw new Error('Preparation start failed');

      // Let SSE handle real-time updates instead of optimistic updates
    } catch (error) {
      console.error('Preparation failed:', error);
      onError();
    }
  };

  const pourNextIngredient = async () => {
    // Handled by backend now; kept for compatibility
    return;
  };

  const stopPreparation = async () => {
    try {
      await fetch(api('/api/cocktails/stop'), { method: 'POST' });
      onError();
    } catch (error) {
      console.error('Stop failed:', error);
      onError();
    }
  };

  const totalVolume = Object.values(cocktail.ingredients).reduce((sum, amount) => sum + amount, 0);

  if (preparationComplete) {
    return (
      <div className="h-full flex flex-col items-center justify-center">
        <Card className="glass-card magical-glow">
          <div className="p-8 text-center">
            <div className="w-24 h-24 bg-success/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-4xl">✅</span>
            </div>
            <h2 className="text-2xl font-bold text-success mb-4">
              {t('ready_to_serve_title')}
            </h2>
            <p className="text-lg mb-6">{getCocktailName(cocktail.id)}</p>
            
            {cocktail.post_add && (
              <div className="p-4 bg-warning/10 rounded-lg border border-warning/20 mb-6">
                <div className="font-medium text-warning mb-2">{t('almost_ready_title')}</div>
                <div className="text-sm">{t('please_add_manually')}</div>
                <div className="font-medium mt-1">{getIngredientName(cocktail.post_add)}</div>
              </div>
            )}
            
            <Button onClick={onComplete} className="touch-button">
              {t('complete_return')}
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">{t('preparing_title')}</h1>
        <Button variant="destructive" onClick={stopPreparation} className="touch-button">
          <StopCircle className="h-5 w-5 mr-2" />
          {t('stop_cancel')}
        </Button>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Progress Visualization */}
        <Card className="glass-card">
          <div className="p-4 sm:p-6 h-full flex flex-col items-center justify-center">
            <div className="relative w-24 h-36 sm:w-32 sm:h-48 mx-auto mb-4 sm:mb-6">
              {/* Glass Shape */}
              <div className="absolute inset-0 border-3 sm:border-4 border-primary bg-gradient-to-b from-transparent to-primary/10" style={{ clipPath: 'polygon(15% 0%, 85% 0%, 100% 100%, 0% 100%)' }}>
                {/* Liquid Fill */}
                <div 
                  className="absolute bottom-0 left-0 right-0 transition-all duration-300 progress-fill"
                  style={{ 
                    height: `${progress}%`,
                    backgroundColor: getLiquidColor(currentStep < steps.length ? steps[currentStep].ingredient : ''),
                    clipPath: 'polygon(15% 0%, 85% 0%, 100% 100%, 0% 100%)'
                  }}
                />
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-xl sm:text-2xl font-bold mb-2">{Math.round(progress)}%</div>
              <div className="text-xs sm:text-sm text-muted-foreground">{t('progress_label')}</div>
            </div>
          </div>
        </Card>

        {/* Current Step & Ingredients */}
        <Card className="glass-card">
          <div className="p-4 sm:p-6 h-full">
            <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">{getCocktailName(cocktail.id)}</h3>
            
            {currentStep < steps.length && (
              <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-primary/10 rounded-lg border border-primary/20">
                <div className="font-medium text-primary mb-1 text-xs sm:text-sm">{t('currently_serving')}</div>
                <div className="text-sm sm:text-lg">{getIngredientName(steps[currentStep].ingredient)}</div>
                <div className="text-xs sm:text-sm text-muted-foreground">{steps[currentStep].amount}ml</div>
              </div>
            )}

            {/* All Steps */}
            <div className="space-y-2 sm:space-y-3 max-h-48 sm:max-h-64 overflow-y-auto">
              {steps.map((step, index) => (
                <div 
                  key={step.ingredient}
                  className={`flex items-center justify-between p-2 sm:p-3 rounded-lg border transition-all ${
                    index === currentStep 
                      ? 'bg-primary/10 border-primary/20' 
                      : step.completed 
                        ? 'bg-success/10 border-success/20' 
                        : 'bg-muted/30 border-border'
                  }`}
                >
                  <div>
                    <div className="font-medium text-xs sm:text-sm">{getIngredientName(step.ingredient)}</div>
                    <div className="text-xs text-muted-foreground">{step.amount}ml</div>
                  </div>
                  <div className="text-lg sm:text-xl">
                    {step.completed ? '✅' : index === currentStep && isPouring ? '⏳' : '⏸️'}
                  </div>
                </div>
              ))}
            </div>

            {/* Progress Bar */}
            <div className="mt-4 sm:mt-6">
              <Progress value={progress} className="h-1 sm:h-2" />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>0ml</span>
                <span>{totalVolume}ml</span>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};