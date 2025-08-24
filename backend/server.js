#!/usr/bin/env node

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs');

const HardwareManager = require('./src/hardware/HardwareManager');
const CocktailService = require('./src/services/CocktailService');
const SSEManager = require('./src/sse/SSEManager');

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize managers
const hardwareManager = new HardwareManager();
const cocktailService = new CocktailService(hardwareManager);
const sseManager = new SSEManager(hardwareManager);

// Middleware
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: false
}));
app.use(cors({
  origin: ['http://localhost', 'http://localhost:80', 'http://127.0.0.1', 'http://127.0.0.1:80'],
  credentials: true
}));
app.use(morgan('combined'));
app.use(express.json());

// Static files for JSON data
app.use('/api/data', express.static(path.join(__dirname, '../data')));

// SSE endpoint
app.get('/api/events', sseManager.handleConnection.bind(sseManager));
// Legacy alias for compatibility with older clients
app.get('/api/hardware/stream', sseManager.handleConnection.bind(sseManager));

// Hardware API endpoints
app.get('/api/hardware/status', (req, res) => {
  try {
    const status = hardwareManager.getStatus();
    res.json(status);
  } catch (error) {
    console.error('Hardware status error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/hardware/tare', async (req, res) => {
  try {
    await hardwareManager.tareScale();
    res.json({ success: true, message: 'Scale tared successfully' });
  } catch (error) {
    console.error('Tare error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/hardware/relay/:id', async (req, res) => {
  try {
    const relayId = parseInt(req.params.id);
    const { state } = req.body;
    
    if (relayId < 0 || relayId > 7) {
      return res.status(400).json({ error: 'Invalid relay ID. Must be 0-7.' });
    }
    
    await hardwareManager.setRelay(relayId, state);
    res.json({ success: true, relay: relayId, state });
  } catch (error) {
    console.error('Relay control error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/hardware/cleaning-cycle', async (req, res) => {
  try {
    await hardwareManager.startCleaningCycle();
    res.json({ success: true, message: 'Cleaning cycle started' });
  } catch (error) {
    console.error('Cleaning cycle error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Cocktail preparation endpoints
app.post('/api/cocktails/prepare', async (req, res) => {
  try {
    const { cocktailId, ingredients } = req.body;
    
    if (!cocktailId || !ingredients) {
      return res.status(400).json({ error: 'Missing cocktailId or ingredients' });
    }
    
    const result = await cocktailService.prepareCocktail(cocktailId, ingredients);
    res.json(result);
  } catch (error) {
    console.error('Cocktail preparation error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/cocktails/stop', async (req, res) => {
  try {
    await cocktailService.stopPreparation();
    res.json({ success: true, message: 'Preparation stopped' });
  } catch (error) {
    console.error('Stop preparation error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Data endpoints for cocktails and ingredients
app.get('/api/cocktails', (req, res) => {
  try {
    const dataPath = path.join(__dirname, '../data/cocktails.json');
    const cocktails = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    res.json(cocktails);
  } catch (error) {
    console.error('Error loading cocktails:', error);
    res.status(500).json({ error: 'Failed to load cocktails' });
  }
});

app.get('/api/ingredients/categories', (req, res) => {
  try {
    const dataPath = path.join(__dirname, '../data/ingredient_category.json');
    const categories = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    res.json(categories);
  } catch (error) {
    console.error('Error loading ingredient categories:', error);
    res.status(500).json({ error: 'Failed to load ingredient categories' });
  }
});

app.get('/api/ingredients/names', (req, res) => {
  try {
    const dataPath = path.join(__dirname, '../data/ingredient_mapping.json');
    const names = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    res.json(names);
  } catch (error) {
    console.error('Error loading ingredient names:', error);
    res.status(500).json({ error: 'Failed to load ingredient names' });
  }
});

app.get('/api/cocktails/names', (req, res) => {
  try {
    const dataPath = path.join(__dirname, '../data/cocktail_name_mapping.json');
    const names = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    res.json(names);
  } catch (error) {
    console.error('Error loading cocktail names:', error);
    res.status(500).json({ error: 'Failed to load cocktail names' });
  }
});

app.get('/api/interface/language', (req, res) => {
  try {
    const dataPath = path.join(__dirname, '../data/interface_language.json');
    const language = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    res.json(language);
  } catch (error) {
    console.error('Error loading interface language:', error);
    res.status(500).json({ error: 'Failed to load interface language' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    hardware: hardwareManager.getStatus()
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({ error: 'Internal server error' });
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down gracefully...');
  try {
    await hardwareManager.shutdown();
    console.log('✅ Hardware shutdown complete');
  } catch (error) {
    console.error('❌ Error during shutdown:', error);
  }
  process.exit(0);
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 PotionMaster Backend running on port ${PORT}`);
  console.log(`📡 Hardware status: ${hardwareManager.getStatus().connected ? 'Connected' : 'Disconnected'}`);
});