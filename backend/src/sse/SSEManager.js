class SSEManager {
  constructor(hardwareManager) {
    this.hardwareManager = hardwareManager;
    this.clients = new Set();
    this.startBroadcasting();
  }

  handleConnection(req, res) {
    // Set SSE headers
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control'
    });

    // Add client to set
    this.clients.add(res);
    console.log(`📡 SSE client connected (${this.clients.size} total)`);

    // Send initial data
    this.sendToClient(res, 'connected', { message: 'Connected to PotionMaster' });
    this.sendHardwareStatus(res);

    // Handle client disconnect
    req.on('close', () => {
      this.clients.delete(res);
      console.log(`📡 SSE client disconnected (${this.clients.size} remaining)`);
    });

    req.on('error', (error) => {
      console.error('SSE client error:', error);
      this.clients.delete(res);
    });
  }

  sendToClient(client, event, data) {
    try {
      client.write(`event: ${event}\n`);
      client.write(`data: ${JSON.stringify(data)}\n\n`);
    } catch (error) {
      console.error('Error sending to SSE client:', error);
      this.clients.delete(client);
    }
  }

  broadcast(event, data) {
    const disconnectedClients = [];
    
    this.clients.forEach(client => {
      try {
        this.sendToClient(client, event, data);
      } catch (error) {
        disconnectedClients.push(client);
      }
    });

    // Remove disconnected clients
    disconnectedClients.forEach(client => {
      this.clients.delete(client);
    });
  }

  sendHardwareStatus(client = null) {
    const status = this.hardwareManager.getStatus();
    
    if (client) {
      this.sendToClient(client, 'hardware_status', status);
    } else {
      this.broadcast('hardware_status', status);
    }
  }

  startBroadcasting() {
    // Broadcast hardware status every second
    setInterval(() => {
      if (this.clients.size > 0) {
        this.sendHardwareStatus();
      }
    }, 1000);

    // Broadcast weight updates more frequently during pouring
    setInterval(() => {
      if (this.clients.size > 0 && this.hardwareManager.getStatus().isPouring) {
        this.broadcast('weight_update', {
          weight: this.hardwareManager.currentWeight,
          timestamp: Date.now()
        });
      }
    }, 100);
  }

  broadcastPreparationUpdate(preparationData) {
    this.broadcast('preparation_update', preparationData);
  }

  broadcastPreparationComplete(result) {
    this.broadcast('preparation_complete', result);
  }

  broadcastError(error) {
    this.broadcast('error', {
      message: error.message,
      timestamp: Date.now()
    });
  }
}

module.exports = SSEManager;