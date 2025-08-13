class CocktailService {
  constructor(hardwareManager) {
    this.hardwareManager = hardwareManager;
    this.currentPreparation = null;
    this.isPreparating = false;
  }

  async prepareCocktail(cocktailId, ingredients) {
    if (this.isPreparating) {
      throw new Error('Another cocktail is already being prepared');
    }

    this.isPreparating = true;
    this.currentPreparation = {
      cocktailId,
      ingredients,
      currentStep: 0,
      totalSteps: Object.keys(ingredients).length,
      startTime: Date.now(),
      targetWeight: 0,
      currentIngredient: null
    };

    console.log(`🍹 Starting preparation of ${cocktailId}`);

    try {
      // Tare the scale first
      await this.hardwareManager.tareScale();
      await this.hardwareManager.sleep(1000);

      // Convert ingredients object to array for sequential processing
      const ingredientList = Object.entries(ingredients).map(([ingredient, amount]) => ({
        ingredient,
        amount,
        relayId: this.getRelayIdForIngredient(ingredient)
      }));

      // Pour each ingredient sequentially
      for (let i = 0; i < ingredientList.length; i++) {
        if (!this.isPreparating) {
          throw new Error('Preparation cancelled');
        }

        const { ingredient, amount, relayId } = ingredientList[i];
        this.currentPreparation.currentStep = i;
        this.currentPreparation.currentIngredient = ingredient;
        this.currentPreparation.targetWeight += amount;

        console.log(`🥤 Pouring ${ingredient}: ${amount}ml (relay ${relayId})`);

        await this.pourIngredient(relayId, amount);
      }

      console.log(`✅ Cocktail ${cocktailId} prepared successfully`);
      
      const result = {
        success: true,
        cocktailId,
        totalVolume: Object.values(ingredients).reduce((sum, amount) => sum + amount, 0),
        preparationTime: Date.now() - this.currentPreparation.startTime
      };

      this.currentPreparation = null;
      this.isPreparating = false;

      return result;

    } catch (error) {
      console.error(`❌ Failed to prepare ${cocktailId}:`, error);
      await this.stopPreparation();
      throw error;
    }
  }

  async pourIngredient(relayId, targetAmount) {
    const startWeight = this.hardwareManager.currentWeight;
    const targetWeight = startWeight + targetAmount;
    
    // Start pumping
    await this.hardwareManager.setRelay(relayId, true);
    
    // Monitor weight until target is reached
    while (this.isPreparating && this.hardwareManager.currentWeight < targetWeight) {
      await this.hardwareManager.sleep(50);
    }
    
    // Stop pumping
    await this.hardwareManager.setRelay(relayId, false);
    
    const actualAmount = this.hardwareManager.currentWeight - startWeight;
    console.log(`📊 Poured ${actualAmount.toFixed(1)}ml (target: ${targetAmount}ml)`);
  }

  async stopPreparation() {
    if (this.isPreparating) {
      console.log('🛑 Stopping cocktail preparation...');
      this.isPreparating = false;
      await this.hardwareManager.allRelaysOff();
      this.currentPreparation = null;
    }
  }

  getRelayIdForIngredient(ingredient) {
    // This mapping should match your physical setup
    // You may need to adjust these based on which ingredient is connected to which pump
    const ingredientToRelayMap = {
      'vodka': 0,
      'white_rum': 1,
      'white_wine': 2,
      'orange_liqueur': 3,
      'lemon_juice': 4,
      'elderflower_syrup': 5,
      'passion_fruit_juice': 6,
      'soda': 7
    };

    const relayId = ingredientToRelayMap[ingredient];
    if (relayId === undefined) {
      throw new Error(`No relay mapping found for ingredient: ${ingredient}`);
    }

    return relayId;
  }

  getCurrentPreparation() {
    return this.currentPreparation;
  }

  isCurrentlyPreparating() {
    return this.isPreparating;
  }
}

module.exports = CocktailService;