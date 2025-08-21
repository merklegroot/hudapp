'use client';

import { useState, useRef } from 'react';
import { SSEEventData } from '../types/sse';

export default function SSEDemo() {
  const [events, setEvents] = useState<SSEEventData[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const eventSourceRef = useRef<EventSource | null>(null);

  const startLongRunningProcess = () => {
    // Clear previous events
    setEvents([]);
    setIsConnected(true);

    // Close existing connection if any
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    // Create new EventSource connection
    const eventSource = new EventSource('/api/debug/long-running');
    eventSourceRef.current = eventSource;

    eventSource.onmessage = (event) => {
      try {
        const data: SSEEventData = JSON.parse(event.data);
        setEvents(prev => [...prev, data]);

        // If we've reached completion, prepare to close the connection
        if (!data.isRunning) {
          setTimeout(() => {
            setIsConnected(false);
            if (eventSourceRef.current) {
              eventSourceRef.current.close();
            }
          }, 500); // Give a small delay for better UX
        }
      } catch (error) {
        console.error('Error parsing SSE data:', error);
      }
    };

    eventSource.onopen = () => {
      console.log('SSE connection opened');
    };

    eventSource.onerror = (error) => {
      console.error('SSE connection error:', error);
      console.error('EventSource readyState:', eventSource.readyState);
      console.error('EventSource url:', eventSource.url);

      // Only set disconnected if it's actually an error, not just the end of stream
      if (eventSource.readyState === EventSource.CLOSED) {
        console.log('EventSource closed normally');
      } else {
        console.error('EventSource error occurred');
        setIsConnected(false);
        eventSource.close();
      }
    };

    eventSource.addEventListener('close', (event) => {
      console.log('SSE close event received:', event);
      setIsConnected(false);
      eventSource.close();
    });

    // Auto-close after process completion (safety measure)
    setTimeout(() => {
      if (eventSourceRef.current && eventSourceRef.current.readyState !== EventSource.CLOSED) {
        eventSourceRef.current.close();
        setIsConnected(false);
      }
    }, 6000); // Increased to 6 seconds for 10 stages × 500ms + buffer
  };

  const stopProcess = () => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      setIsConnected(false);
    }
  };

  const getStageColor = (event: SSEEventData) => {
    return event.isRunning
      ? 'bg-gray-100 text-gray-800'
      : 'bg-green-100 text-green-800';
  };

  return (
    <div className="bg-gray-900 rounded-lg shadow-md p-6 font-mono">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-400">Events Terminal</h2>
        
        {/* Connection Status */}
        <div className="flex items-center gap-2">
          <div
            className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400 animate-pulse' : 'bg-red-400'
              }`}
          ></div>
          <span className="text-sm text-gray-300 font-mono">
            [{isConnected ? 'CONNECTED' : 'DISCONNECTED'}]
          </span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex gap-4 mb-6">
        <button
          onClick={startLongRunningProcess}
          disabled={isConnected}
          className={`px-4 py-2 rounded font-medium transition-colors ${isConnected
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
            : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
        >
          {isConnected ? 'Process Running...' : 'Start'}
        </button>

        <button
          onClick={stopProcess}
          disabled={!isConnected}
          className={`px-4 py-2 rounded font-medium transition-colors ${!isConnected
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
            : 'bg-red-600 text-white hover:bg-red-700'
            }`}
        >
          Stop
        </button>
      </div>

      <div>
        <div className="bg-black rounded border border-gray-600 p-4 min-h-64 max-h-64 overflow-y-auto">
          {events.length === 0 ? (
            <p className="text-gray-500 font-mono text-sm">Waiting for process to start...</p>
          ) : (
            <div className="space-y-1">
              {events.map((event, index) => (
                <div key={index} className="font-mono text-sm">
                  <span className="text-gray-500">
                    [{new Date(event.timestamp).toLocaleTimeString()}]
                  </span>
                  <span className={`ml-2 ${event.isRunning ? 'text-yellow-400' : 'text-green-400'}`}>
                    [{event.stageDisplayText}]
                  </span>
                  <span className="text-gray-300 ml-2">{event.message}</span>
                </div>
              ))}
              {isConnected && (
                <div className="flex items-center mt-2">
                  <span className="text-green-400 animate-pulse">█</span>
                  <span className="text-gray-500 ml-1 font-mono text-sm">process running...</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
