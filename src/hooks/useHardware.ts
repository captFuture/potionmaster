import { useState, useEffect, useRef } from 'react';
import { ConnectionStatus } from '../components/Header';
import { BACKEND_BASE } from '../lib/api';

export const useHardware = () => {
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({
    wifi: false,
    scale: false,
    relay: false
  });
  const [scaleWeight, setScaleWeight] = useState(0);
  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    // Initialize SSE connection for real-time hardware data (uses named events)
    const sseUrl = `${BACKEND_BASE}/api/events`;
    const eventSource = new EventSource(sseUrl);
    eventSourceRef.current = eventSource;

    eventSource.onopen = () => {
      console.log('Hardware SSE connected');
    };

    const onHardwareStatus = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);
        // data is { connected, weight, relayStates, isPouring }
        setConnectionStatus({
          wifi: true,
          scale: typeof data.weight === 'number',
          relay: Array.isArray(data.relayStates),
        });
        if (typeof data.weight === 'number') {
          setScaleWeight(data.weight);
        }
      } catch (error) {
        console.error('Failed to parse hardware_status:', error);
      }
    };

    const onWeightUpdate = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);
        if (typeof data.weight === 'number') {
          setScaleWeight(data.weight);
        }
      } catch (error) {
        console.error('Failed to parse weight_update:', error);
      }
    };

    eventSource.addEventListener('hardware_status', onHardwareStatus as EventListener);
    eventSource.addEventListener('weight_update', onWeightUpdate as EventListener);
    eventSource.addEventListener('connected', () => {
      console.log('SSE: connected');
    });

    eventSource.onerror = (error) => {
      console.error('Hardware SSE error:', error);
      setConnectionStatus(prev => ({ ...prev, wifi: false, scale: false, relay: false }));
    };

    // Check initial status
    fetch(`${BACKEND_BASE}/api/hardware/status`)
      .then(res => res.json())
      .then(data => {
        setConnectionStatus({
          wifi: true,
          scale: typeof data?.weight === 'number',
          relay: Array.isArray(data?.relayStates),
        });
        if (typeof data?.weight === 'number') {
          setScaleWeight(data.weight);
        }
      })
      .catch(() => setConnectionStatus({ wifi: false, scale: false, relay: false }));

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, []);

  const tareScale = async () => {
    try {
      const response = await fetch(`${BACKEND_BASE}/api/hardware/tare`, { method: 'POST' });
      if (!response.ok) {
        throw new Error('Failed to tare scale');
      }
    } catch (error) {
      console.error('Tare failed:', error);
    }
  };

  const activateRelay = async (channel: number, duration?: number) => {
    try {
      const response = await fetch(`${BACKEND_BASE}/api/hardware/relay/${channel}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ state: true })
      });
      if (!response.ok) {
        throw new Error('Failed to activate relay');
      }
      if (typeof duration === 'number' && duration > 0) {
        setTimeout(() => {
          fetch(`${BACKEND_BASE}/api/hardware/relay/${channel}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ state: false })
          }).catch(() => {});
        }, duration);
      }
    } catch (error) {
      console.error('Relay activation failed:', error);
    }
  };

  const deactivateRelay = async (channel: number) => {
    try {
      const response = await fetch(`${BACKEND_BASE}/api/hardware/relay/${channel}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ state: false })
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