import { useState, useEffect, useRef } from 'react';
import { ConnectionStatus } from '../components/Header';

export const useHardware = () => {
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({
    wifi: false,
    scale: false,
    relay: false
  });
  const [scaleWeight, setScaleWeight] = useState(0);
  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    // Initialize SSE connection for real-time hardware data
    const eventSource = new EventSource('http://localhost:3000/api/hardware/stream');
    eventSourceRef.current = eventSource;

    eventSource.onopen = () => {
      console.log('Hardware stream connected');
    };

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        if (data.type === 'status') {
          setConnectionStatus(data.status);
        } else if (data.type === 'scale') {
          setScaleWeight(data.weight);
        }
      } catch (error) {
        console.error('Failed to parse hardware data:', error);
      }
    };

    eventSource.onerror = (error) => {
      console.error('Hardware stream error:', error);
      setConnectionStatus(prev => ({ ...prev, scale: false, relay: false }));
    };

    // Check initial status
    fetch('http://localhost:3000/api/hardware/status')
      .then(res => res.json())
      .then(data => setConnectionStatus(data))
      .catch(() => setConnectionStatus({ wifi: false, scale: false, relay: false }));

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, []);

  const tareScale = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/hardware/scale/tare', {
        method: 'POST'
      });
      if (!response.ok) {
        throw new Error('Failed to tare scale');
      }
    } catch (error) {
      console.error('Tare failed:', error);
    }
  };

  const activateRelay = async (channel: number, duration?: number) => {
    try {
      const response = await fetch('http://localhost:3000/api/hardware/relay/activate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ channel, duration })
      });
      if (!response.ok) {
        throw new Error('Failed to activate relay');
      }
    } catch (error) {
      console.error('Relay activation failed:', error);
    }
  };

  const deactivateRelay = async (channel: number) => {
    try {
      const response = await fetch('http://localhost:3000/api/hardware/relay/deactivate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ channel })
      });
      if (!response.ok) {
        throw new Error('Failed to deactivate relay');
      }
    } catch (error) {
      console.error('Relay deactivation failed:', error);
    }
  };

  return {
    connectionStatus,
    scaleWeight,
    tareScale,
    activateRelay,
    deactivateRelay
  };
};