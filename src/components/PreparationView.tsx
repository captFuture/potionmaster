import React, { useState, useEffect } from 'react';
import { ArrowLeft, StopCircle } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Progress } from './ui/progress';
import { Cocktail } from './PotionMaster';
import { Language } from '../hooks/useLanguage';

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

  const t = (key: string) => translations[key]?.[language] || key;

  useEffect(() => {
    // Initialize preparation steps
    const preparationSteps = Object.entries(cocktail.ingredients).map(([ingredient, amount]) => ({
      ingredient,
      amount,
      completed: false
    }));
    setSteps(preparationSteps);

    // Load names
    Promise.all([
      fetch('/api/ingredients/names').then(res => res.json()),
      fetch('/api/cocktails/names').then(res => res.json())
    ])
    .then(([ingredients, cocktails]) => {
      setIngredientNames(ingredients);
      setCocktailNames(cocktails);
    })
    .catch(console.error);

    // Start preparation
    startPreparation();
  }, []);

  const getIngredientName = (id: string) => ingredientNames[id]?.[language] || id;
  const getCocktailName = (id: string) => cocktailNames[id]?.[language] || id;

  const startPreparation = async () => {
    try {
      // Tare scale first
      await fetch('http://localhost:3000/api/hardware/scale/tare', { method: 'POST' });
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Start pouring sequence
      await pourNextIngredient();
    } catch (error) {
      console.error('Preparation failed:', error);
      onError();
    }
  };

  const pourNextIngredient = async () => {
    if (currentStep >= steps.length) {
      setPreparationComplete(true);
      setTimeout(() => onComplete(), 3000);
      return;
    }

    const step = steps[currentStep];
    setIsPouring(true);
    
    try {
      // Start pouring
      const response = await fetch('http://localhost:3000/api/hardware/pour-ingredient', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ingredient: step.ingredient,
          amount: step.amount
        })
      });

      if (!response.ok) {
        throw new Error('Pouring failed');
      }

      // Mark step as completed
      setSteps(prev => prev.map((s, i) => 
        i === currentStep ? { ...s, completed: true } : s
      ));
      
      setCurrentStep(prev => prev + 1);
      setProgress(((currentStep + 1) / steps.length) * 100);
      setIsPouring(false);

      // Continue to next ingredient after a short delay
      setTimeout(() => pourNextIngredient(), 500);

    } catch (error) {
      console.error('Pour ingredient failed:', error);
      setIsPouring(false);
      onError();
    }
  };

  const stopPreparation = async () => {
    try {
      await fetch('http://localhost:3000/api/hardware/stop-pouring', { method: 'POST' });
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

      <div className="flex-1 grid grid-cols-2 gap-6">
        {/* Progress Visualization */}
        <Card className="glass-card">
          <div className="p-6 h-full flex flex-col items-center justify-center">
            <div className="relative w-32 h-48 mx-auto mb-6">
              {/* Glass Shape */}
              <div className="absolute inset-0 border-4 border-primary rounded-b-full rounded-t-lg bg-gradient-to-b from-transparent to-primary/10">
                {/* Liquid Fill */}
                <div 
                  className="absolute bottom-0 left-0 right-0 bg-gradient-primary rounded-b-full transition-all duration-1000 progress-fill"
                  style={{ height: `${progress}%` }}
                />
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold mb-2">{Math.round(progress)}%</div>
              <div className="text-sm text-muted-foreground">{t('progress_label')}</div>
            </div>
          </div>
        </Card>

        {/* Current Step & Ingredients */}
        <Card className="glass-card">
          <div className="p-6 h-full">
            <h3 className="text-lg font-semibold mb-4">{getCocktailName(cocktail.id)}</h3>
            
            {currentStep < steps.length && (
              <div className="mb-6 p-4 bg-primary/10 rounded-lg border border-primary/20">
                <div className="font-medium text-primary mb-1">{t('currently_serving')}</div>
                <div className="text-lg">{getIngredientName(steps[currentStep].ingredient)}</div>
                <div className="text-sm text-muted-foreground">{steps[currentStep].amount}ml</div>
              </div>
            )}

            {/* All Steps */}
            <div className="space-y-3">
              {steps.map((step, index) => (
                <div 
                  key={step.ingredient}
                  className={`flex items-center justify-between p-3 rounded-lg border transition-all ${
                    index === currentStep 
                      ? 'bg-primary/10 border-primary/20' 
                      : step.completed 
                        ? 'bg-success/10 border-success/20' 
                        : 'bg-muted/30 border-border'
                  }`}
                >
                  <div>
                    <div className="font-medium">{getIngredientName(step.ingredient)}</div>
                    <div className="text-sm text-muted-foreground">{step.amount}ml</div>
                  </div>
                  <div className="text-xl">
                    {step.completed ? '✅' : index === currentStep && isPouring ? '⏳' : '⏸️'}
                  </div>
                </div>
              ))}
            </div>

            {/* Progress Bar */}
            <div className="mt-6">
              <Progress value={progress} className="h-2" />
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