'use client';

import { useState, useRef, useEffect } from 'react';
import { SSEEventData } from '../../types/sse';
import { SseLine } from './SseLine';

interface SseTerminalProps {
  url: string;
  terminalTitle?: string;
  startButtonLabel?: string;
  stopButtonLabel?: string;
  autoCloseTimeoutMs?: number;
  autoStart?: boolean;
  onParsedData?: (parsedData: any) => void;
  renderResults?: (parsedData: any) => React.ReactNode;
}

export default function SseTerminal({
  url,
  terminalTitle = "Events Terminal",
  startButtonLabel = "Start",
  stopButtonLabel = "Stop",
  autoCloseTimeoutMs = 6000,
  autoStart = false,
  onParsedData,
  renderResults
}: SseTerminalProps) {
  const [events, setEvents] = useState<SSEEventData[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [parsedData, setParsedData] = useState<any>(null);
  const eventSourceRef = useRef<EventSource | null>(null);
  const terminalRef = useRef<HTMLDivElement | null>(null);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);

  // Auto-scroll to bottom when new events arrive
  useEffect(() => {
    if (shouldAutoScroll && terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [events, shouldAutoScroll]);

  // Auto-start if enabled
  useEffect(() => {
    if (autoStart) {
      startProcess();
    }
  }, [autoStart]);

  // Handle scroll events to detect manual scrolling
  const handleScroll = () => {
    if (terminalRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = terminalRef.current;
      const isAtBottom = scrollTop + clientHeight >= scrollHeight - 5; // 5px threshold
      setShouldAutoScroll(isAtBottom);
    }
  };

  const startProcess = () => {
    // Clear previous events and parsed data
    setEvents([]);
    setParsedData(null);
    setIsConnected(true);
    setShouldAutoScroll(true); // Reset auto-scroll when starting new process

    // Close existing connection if any
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    // Create new EventSource connection using the provided URL
    const eventSource = new EventSource(url);
    eventSourceRef.current = eventSource;

    eventSource.onmessage = (event) => {
      try {
        const data: SSEEventData = JSON.parse(event.data);
        setEvents(prev => [...prev, data]);

        // Check if this event contains parsed data
        if (data.parsedData) {
          setParsedData(data.parsedData);
          if (onParsedData) {
            onParsedData(data.parsedData);
          }
        }

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
    }, autoCloseTimeoutMs);
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
          <h2 className="text-lg font-semibold text-gray-300">{terminalTitle}</h2>
          
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
            {stopButtonLabel}
          </button>

          <button
            onClick={startProcess}
            disabled={isConnected}
            className={`px-4 py-1.5 rounded font-medium transition-colors ${isConnected
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
          >
            {isConnected ? 'Process Running...' : startButtonLabel}
          </button>
        </div>
      </div>

      {/* Results Section */}
      {parsedData && renderResults && (
        <div>
          {renderResults(parsedData)}
        </div>
      )}
    </div>
  );
}
