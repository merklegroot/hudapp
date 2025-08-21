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
        if (data.stage === 'completed') {
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

  const getStageColor = (stage: SSEEventData['stage']) => {
    switch (stage) {
      case 'starting':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      default:
        // All interim steps use the same color
        return 'bg-gray-100 text-gray-800';
    }
  };



  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">Server-Sent Events Demo</h2>
      <p className="text-gray-600 mb-6">
        This demonstrates a long-running process using Server-Sent Events (SSE) for real-time updates.
      </p>

      {/* Controls */}
      <div className="flex gap-4 mb-6">
        <button
          onClick={startLongRunningProcess}
          disabled={isConnected}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            isConnected
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {isConnected ? 'Process Running...' : 'Start Long Running Process'}
        </button>

        <button
          onClick={stopProcess}
          disabled={!isConnected}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            !isConnected
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-red-600 text-white hover:bg-red-700'
          }`}
        >
          Stop Process
        </button>
      </div>



      {/* Connection Status */}
      <div className="mb-4">
        <div className="flex items-center gap-2">
          <div
            className={`w-3 h-3 rounded-full ${
              isConnected ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
            }`}
          ></div>
          <span className="text-sm font-medium">
            {isConnected ? 'Connected to SSE stream' : 'Disconnected'}
          </span>
        </div>
      </div>

      {/* Events Log */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-3">Process Events</h3>
        {events.length === 0 ? (
          <p className="text-gray-500 italic">No events yet. Start a process to see real-time updates.</p>
        ) : (
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {events.map((event, index) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${getStageColor(event.stage)}`}
                    >
                      {event.stage.toUpperCase()}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(event.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="text-gray-800">{event.message}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
