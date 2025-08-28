# PotionMaster Backend API Documentation

## Base URL
- Development: `http://localhost:3000`
- Production: Configure via environment

## Data Endpoints

### GET /data/cocktails.json
Returns all available cocktails with their ingredients and mixing ratios.

**Response:**
```json
[
  {
    "id": "white_wine_spritz",
    "ingredients": {
      "white_wine": 100,
      "soda": 100
    }
  },
  {
    "id": "vodka_tonic_lite", 
    "ingredients": {
      "vodka": 40
    },
    "post_add": "tonic_water"
  }
]
```

### GET /data/cocktail_name_mapping.json  
Returns cocktail names in different languages.

**Response:**
```json
{
  "white_wine_spritz": {
    "de": "Weißwein Spritz",
    "en": "White Wine Spritz", 
    "hogwarts": "Hufflepuff Fizz"
  }
}
```

### GET /data/ingredient_mapping.json
Returns ingredient names in different languages.

**Response:**
```json
{
  "vodka": {
    "de": "Wodka",
    "en": "Vodka",
    "hogwarts": "Essenz des Nordens"
  }
}
```

### GET /data/ingredient_category.json
Returns ingredient categorization.

**Response:**
```json
{
  "alcoholic_ingredients": ["vodka", "white_rum", "white_wine"],
  "non_alcoholic_ingredients": ["lemon_juice", "elderflower_syrup"],
  "external_ingredients": ["tonic_water", "coca_cola"]
}
```

### GET /data/interface_language.json
Returns UI text translations.

**Response:**
```json
{
  "en": {
    "confirm_title": "Confirm Your Order",
    "glass_instruction": "Please place your glass on the marked spot now."
  },
  "de": {
    "confirm_title": "Bestätige deine Bestellung",
    "glass_instruction": "Bitte stelle jetzt das Glas auf den markierten Punkt."
  }
}
```

## Hardware Control Endpoints

### GET /api/hardware/status
Returns current hardware status including scales and relay states.

**Response:**
```json
{
  "scales": {
    "scale1": { "weight": 0, "stable": true },
    "scale2": { "weight": 15.5, "stable": false }
  },
  "relays": {
    "relay1": false,
    "relay2": true
  },
  "status": "ready"
}
```

### POST /api/hardware/tare
Tares all connected scales.

**Request Body:**
```json
{
  "scaleId": "scale1" // Optional: specific scale, omit for all
}
```

### POST /api/hardware/relay/:relayId/:action
Controls individual relays.

**Parameters:**
- `relayId`: Relay identifier (relay1, relay2, etc.)
- `action`: "on" or "off"

### POST /api/hardware/clean
Initiates cleaning cycle for all dispensers.

**Request Body:**
```json
{
  "duration": 5000, // Optional: cleaning duration in ms
  "relays": ["relay1", "relay2"] // Optional: specific relays
}
```

## Cocktail Preparation Endpoints

### POST /api/cocktails/prepare
Starts cocktail preparation process.

**Request Body:**
```json
{
  "cocktailId": "white_wine_spritz",
  "ingredients": {
    "white_wine": 100,
    "soda": 100
  }
}
```

**Response:**
```json
{
  "success": true,
  "preparationId": "prep_123456",
  "estimatedTime": 45000
}
```

### POST /api/cocktails/stop
Stops current preparation process.

**Request Body:**
```json
{
  "preparationId": "prep_123456" // Optional
}
```

## Real-time Communication

### GET /api/events (SSE)
Server-Sent Events stream for real-time updates.

**Event Types:**
- `hardware_status`: Hardware state changes
- `preparation_progress`: Cocktail preparation updates
- `error`: Error notifications

**Example Events:**
```
event: hardware_status
data: {"scales": {"scale1": {"weight": 25.3, "stable": true}}}

event: preparation_progress  
data: {"progress": 45, "currentStep": "dispensing_vodka", "timeRemaining": 20000}

event: error
data: {"message": "Scale communication error", "code": "SCALE_ERROR"}
```

### GET /api/sse
Alternative SSE endpoint.

### GET /api/hardware/stream  
Hardware-specific SSE stream.

## Static Assets

### GET /cocktails/{cocktail_id}.png
Returns cocktail images.

**Example:** `/cocktails/white_wine_spritz.png`

## Health Check

### GET /api/health
Returns server health status.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T12:00:00Z",
  "hardware": "connected"
}
```

## Error Responses

All endpoints return standard HTTP status codes:
- `200`: Success
- `400`: Bad Request
- `404`: Not Found  
- `500`: Internal Server Error

**Error Response Format:**
```json
{
  "error": true,
  "message": "Error description",
  "code": "ERROR_CODE"
}
```