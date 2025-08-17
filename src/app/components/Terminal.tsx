'use client';

import { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';

interface TerminalProps {
  onInstallStart?: () => void;
  onInstallComplete?: () => void;
  className?: string;
}

export default function Terminal({ onInstallStart, onInstallComplete, className = '' }: TerminalProps) {
  const terminalRef = useRef<HTMLDivElement>(null);
  const xtermRef = useRef<any>(null);
  const fitAddonRef = useRef<any>(null);
  const eventSourceRef = useRef<EventSource | null>(null);
  const [isInstalling, setIsInstalling] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    let terminal: any = null;
    let fitAddon: any = null;

    const initializeTerminal = async () => {
      if (!terminalRef.current || typeof window === 'undefined') return;

      try {
        // Dynamically import XTerm modules
        const [{ Terminal }, { FitAddon }] = await Promise.all([
          import('@xterm/xterm'),
          import('@xterm/addon-fit')
        ]);

        // Import CSS dynamically
        await import('@xterm/xterm/css/xterm.css');

        // Create terminal instance
        terminal = new Terminal({
          cursorBlink: true,
          fontSize: 14,
          fontFamily: 'Consolas, "Courier New", monospace',
          theme: {
            background: '#1a1a1a',
            foreground: '#ffffff',
            cursor: '#ffffff',
            selection: '#ffffff40',
          },
          rows: 25,
          cols: 100,
          disableStdin: true, // Disable input since we're just showing output
        });

        // Create fit addon
        fitAddon = new FitAddon();
        terminal.loadAddon(fitAddon);

        // Open terminal
        terminal.open(terminalRef.current);
        fitAddon.fit();

        // Store refs
        xtermRef.current = terminal;
        fitAddonRef.current = fitAddon;

        // Welcome message
        terminal.writeln('\x1b[32m.NET SDK Installation Terminal\x1b[0m');
        terminal.writeln('Click "Install .NET SDK 8" to begin installation.');
        terminal.writeln('');

        setIsLoaded(true);

        // Handle resize
        const handleResize = () => {
          if (fitAddon) {
            fitAddon.fit();
          }
        };

        window.addEventListener('resize', handleResize);

        // Return cleanup function
        return () => {
          window.removeEventListener('resize', handleResize);
          if (eventSourceRef.current) {
            eventSourceRef.current.close();
          }
          if (terminal) {
            terminal.dispose();
          }
        };
      } catch (error) {
        console.error('Failed to initialize terminal:', error);
      }
    };

    initializeTerminal();

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
      if (terminal) {
        terminal.dispose();
      }
    };
  }, []);

  const startInstallation = async () => {
    if (!xtermRef.current || isInstalling || !isLoaded) return;

    setIsInstalling(true);
    onInstallStart?.();

    const terminal = xtermRef.current;
    if (!terminal) {
      setIsInstalling(false);
      return;
    }

    terminal.clear();
    terminal.writeln('\x1b[33mStarting .NET SDK 8 installation...\x1b[0m');
    terminal.writeln('');

    try {
      const response = await fetch('/api/dotnet/install', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'install' }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No response body');
      }

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        
        // Split by double newlines to separate SSE events
        const events = buffer.split('\n\n');
        buffer = events.pop() || ''; // Keep the last incomplete event in buffer

        for (const event of events) {
          if (!event || typeof event !== 'string') continue;
          
          const lines = event.split('\n');
          if (!Array.isArray(lines)) continue;
          
          for (const line of lines) {
            if (!line || typeof line !== 'string') continue;
            
            if (line.startsWith('data: ')) {
              const jsonData = line.slice(6).trim();
              if (jsonData && terminal) {
                try {
                  const data = JSON.parse(jsonData);
                  
                  if (data && typeof data === 'object') {
                    if (data.type === 'output') {
                      terminal.write(data.content || '');
                    } else if (data.type === 'error') {
                      terminal.write(`\x1b[31m${data.content || ''}\x1b[0m`);
                    } else if (data.type === 'success') {
                      terminal.write(`\x1b[32m${data.content || ''}\x1b[0m`);
                    }
                  }
                } catch (e) {
                  console.error('Error parsing SSE data:', e, 'Raw data:', jsonData);
                  // If JSON parse fails, just write the raw content as plain text
                  if (jsonData && jsonData.length > 0 && terminal) {
                    terminal.write(jsonData + '\r\n');
                  }
                }
              }
            }
          }
        }
      }

      if (terminal) {
        terminal.writeln('');
        terminal.writeln('\x1b[32mInstallation process completed!\x1b[0m');
        terminal.writeln('\x1b[36mRefreshing .NET information...\x1b[0m');
      }
      onInstallComplete?.();

    } catch (error) {
      console.error('Installation error:', error);
      if (terminal) {
        terminal.writeln('');
        terminal.writeln(`\x1b[31mInstallation failed: ${error}\x1b[0m`);
      }
    } finally {
      setIsInstalling(false);
    }
  };

  return (
    <div className={`terminal-container ${className}`}>
      <div className="bg-gray-800 text-white p-2 text-sm font-medium flex justify-between items-center">
        <span>.NET Installation Terminal</span>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${!isLoaded ? 'bg-gray-500' : isInstalling ? 'bg-yellow-500' : 'bg-green-500'}`}></div>
          <span className="text-xs">
            {!isLoaded ? 'Loading...' : isInstalling ? 'Installing...' : 'Ready'}
          </span>
        </div>
      </div>
      <div 
        ref={terminalRef} 
        className="w-full bg-black flex items-center justify-center"
        style={{ height: '400px' }}
      >
        {!isLoaded && (
          <div className="text-gray-400 text-sm">
            Loading terminal...
          </div>
        )}
      </div>
      <div className="bg-gray-700 p-2 flex gap-2">
        <button
          onClick={startInstallation}
          disabled={!isLoaded || isInstalling}
          className="px-4 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700 disabled:bg-gray-500 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {isInstalling && (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          )}
          {!isLoaded ? 'Loading Terminal...' : isInstalling ? 'Installing .NET SDK 8...' : 'Install .NET SDK 8'}
        </button>
        {isInstalling && (
          <div className="flex items-center text-yellow-300 text-sm">
            <span>Installation in progress. This may take several minutes...</span>
          </div>
        )}
      </div>
    </div>
  );
}
