'use client';

import { useState, useRef, useEffect } from 'react';
import { SSEEventData } from '../types/sse';

function SseLine({ event }: { event: SSEEventData }) {
  return (
    <div className="font-mono text-sm">
      <span className="text-gray-500">
        [{new Date(event.timestamp).toLocaleTimeString()}]
        <span className={event.isRunning ? 'text-yellow-400' : 'text-green-400'}>
          &nbsp;{event.stageDisplayText}
        </span>
      </span>
    </div>
  );
}

interface ParsedDotNetData {
  dotnetDetected: boolean;
  dotnetPath: string | null;
  status: 'found' | 'not_found' | 'error';
  message: string;
}

export function DotNetControl() {
  const [events, setEvents] = useState<SSEEventData[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [parsedDotNetData, setParsedDotNetData] = useState<ParsedDotNetData | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);
  const terminalRef = useRef<HTMLDivElement | null>(null);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);

  // Auto-scroll to bottom when new events arrive
  useEffect(() => {
    if (shouldAutoScroll && terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [events, shouldAutoScroll]);

  // Handle scroll events to detect manual scrolling
  const handleScroll = () => {
    if (terminalRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = terminalRef.current;
      const isAtBottom = scrollTop + clientHeight >= scrollHeight - 5; // 5px threshold
      setShouldAutoScroll(isAtBottom);
    }
  };

  // Auto-start the process when component mounts
  useEffect(() => {
    startProcess();
  }, []);

  const startProcess = () => {
    // Clear previous events and parsed data
    setEvents([]);
    setParsedDotNetData(null);
    setIsConnected(true);
    setShouldAutoScroll(true);

    // Close existing connection if any
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    // Create new EventSource connection
    const eventSource = new EventSource("/api/debug/dotnet");
    eventSourceRef.current = eventSource;

    eventSource.onmessage = (event) => {
      try {
        const data: SSEEventData = JSON.parse(event.data);
        setEvents(prev => [...prev, data]);

        // Check if this event contains parsed .NET data
        if (data.parsedData && ('dotnetDetected' in data.parsedData)) {
          setParsedDotNetData(data.parsedData as ParsedDotNetData);
        }

        // If we've reached completion, prepare to close the connection
        if (!data.isRunning) {
          setTimeout(() => {
            setIsConnected(false);
            if (eventSourceRef.current) {
              eventSourceRef.current.close();
            }
          }, 500);
        }
      } catch (error) {
        console.error('Error parsing SSE data:', error);
      }
    };

    eventSource.onopen = () => {
      console.log('SSE connection opened');
    };

    eventSource.onerror = (error) => {
      console.log('SSE connection event (may be normal closure):', error);
      
      // Only treat as error if it's not just the end of stream
      if (eventSource.readyState === EventSource.CLOSED) {
        console.log('EventSource closed normally');
        setIsConnected(false);
      } else if (eventSource.readyState === EventSource.CONNECTING) {
        console.log('EventSource reconnecting...');
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
    }, 6000);
  };

  const stopProcess = () => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      setIsConnected(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Terminal Section */}
      <div className="bg-gray-900 rounded-lg shadow-md font-mono">
        {/* Header */}
        <div className="flex justify-between items-center mb-3 px-3 py-1.5 bg-slate-700 rounded-t-lg">
          <h2 className="text-lg font-semibold text-gray-300">.NET Detection Terminal</h2>
          
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

        <div>
          <div 
            ref={terminalRef}
            onScroll={handleScroll}
            className="bg-black p-4 min-h-64 max-h-64 overflow-y-auto"
          >
            {events.length === 0 ? (
              <p className="text-gray-500 font-mono text-sm">Waiting for process to start...</p>
            ) : (
              <div className="space-y-1">
                {events.map((event, index) => (
                  <SseLine key={index} event={event} />
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

        {/* Controls */}
        <div className="flex justify-between px-3 py-3">
          <button
            onClick={stopProcess}
            disabled={!isConnected}
            className={`px-4 py-1.5 rounded font-medium transition-colors ${!isConnected
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-red-600 text-white hover:bg-red-700'
              }`}
          >
            Stop Detection
          </button>

          <button
            onClick={startProcess}
            disabled={isConnected}
            className={`px-4 py-1.5 rounded font-medium transition-colors ${isConnected
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
          >
            {isConnected ? 'Process Running...' : 'Detect .NET'}
          </button>
        </div>
      </div>

      {/* Parsed .NET Detection Results Section */}
      {parsedDotNetData && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">.NET Detection Results</h2>
          
          {/* Status Summary */}
          <div className={`border rounded-lg p-4 mb-6 ${
            parsedDotNetData.dotnetDetected 
              ? 'bg-green-50 border-green-200' 
              : 'bg-red-50 border-red-200'
          }`}>
            <div className="flex items-center space-x-3">
              <span className="text-2xl">
                {parsedDotNetData.dotnetDetected ? '✅' : '❌'}
              </span>
              <div>
                <h3 className="text-lg font-medium text-gray-800">
                  {parsedDotNetData.dotnetDetected ? '.NET Detected' : '.NET Not Found'}
                </h3>
                <p className="text-gray-600">{parsedDotNetData.message}</p>
              </div>
            </div>
          </div>

          {/* Details */}
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="font-medium text-gray-700">Status:</span>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                parsedDotNetData.status === 'found' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {parsedDotNetData.status === 'found' ? 'Found' : 'Not Found'}
              </span>
            </div>

            {parsedDotNetData.dotnetPath && (
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="font-medium text-gray-700">Installation Path:</span>
                <span className="font-mono text-gray-900 bg-gray-100 px-2 py-1 rounded">
                  {parsedDotNetData.dotnetPath}
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}