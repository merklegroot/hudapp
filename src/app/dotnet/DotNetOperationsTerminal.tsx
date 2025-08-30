'use client';

import { useEffect, useRef, useState, useImperativeHandle, forwardRef } from 'react';

export interface StatusTerminalRef {
  startInstallation: (version: string) => void;
}

interface DotNetOperationsTerminalProps {
  onDetectionComplete?: () => void;
  onInstallStart?: () => void;
  onInstallComplete?: () => void;
  className?: string;
  version?: string;
}

const DotNetOperationsTerminal = forwardRef<StatusTerminalRef, DotNetOperationsTerminalProps>(({ 
  onDetectionComplete, 
  onInstallStart, 
  onInstallComplete
}, ref) => {
  const terminalRef = useRef<HTMLDivElement>(null);
  const xtermRef = useRef<any>(null);
  const fitAddonRef = useRef<any>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isDetecting, setIsDetecting] = useState(true);
  const [isInstalling, setIsInstalling] = useState(false);
  const [currentOperation, setCurrentOperation] = useState<'detection' | 'installation' | 'idle'>('detection');

  // Expose methods to parent component
  useImperativeHandle(ref, () => ({
    startInstallation: (installVersion: string) => {
      if (xtermRef.current && isLoaded && !isInstalling) {
        startInstallationProcess(installVersion);
      }
    }
  }));

  // Helper function to normalize content for terminal display
  const normalizeTerminalContent = (content: string): string => {
    // Ensure all line endings are \r\n for proper terminal display
    return content
      .replace(/\r\n/g, '\n')  // First normalize to \n
      .replace(/\r/g, '\n')    // Convert any standalone \r to \n
      .replace(/\n/g, '\r\n'); // Convert all \n to \r\n
  };

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

        // CSS is imported globally in globals.css

        // Create terminal instance
        terminal = new Terminal({
          cursorBlink: false,
          fontSize: 13,
          fontFamily: 'Consolas, "Courier New", monospace',
          theme: {
            background: '#1a1a1a',
            foreground: '#ffffff',
            cursor: '#ffffff',
            selectionBackground: '#ffffff40',
          },
          rows: 15,
          cols: 100,
          disableStdin: true,
          convertEol: true,  // Convert \n to \r\n automatically
          scrollback: 1000,  // Keep more history
          wordSeparator: ' ()[]{}\'"`',  // Define word boundaries for wrapping
          allowProposedApi: true,  // Enable proposed APIs for better line handling
        });

        // Create fit addon
        fitAddon = new FitAddon();
        terminal.loadAddon(fitAddon);

        // Open terminal
        terminal.open(terminalRef.current);
        
        // Wait a bit for the terminal to render, then fit
        setTimeout(() => {
          fitAddon.fit();
          // Force a reflow to ensure proper sizing
          terminal.refresh(0, terminal.rows - 1);
        }, 100);

        // Store refs
        xtermRef.current = terminal;
        fitAddonRef.current = fitAddon;

        setIsLoaded(true);

        // Start detection process
        startDetection(terminal);

        // Handle resize
        const handleResize = () => {
          if (fitAddon && terminal) {
            setTimeout(() => {
              fitAddon.fit();
              // Refresh terminal to ensure proper rendering after resize
              terminal.refresh(0, terminal.rows - 1);
            }, 50);
          }
        };

        window.addEventListener('resize', handleResize);

        // Return cleanup function
        return () => {
          window.removeEventListener('resize', handleResize);
          if (terminal) {
            terminal.dispose();
          }
        };
      } catch (error) {
        console.error('Failed to initialize status terminal:', error);
      }
    };

    initializeTerminal();

    return () => {
      if (terminal) {
        terminal.dispose();
      }
    };
  }, []);

  const startDetection = async (terminal: any) => {
    if (!terminal) return;

    terminal.writeln('\x1b[36m.NET Detection Status\x1b[0m');
    terminal.writeln('\x1b[90m' + '='.repeat(50) + '\x1b[0m');
    terminal.writeln('');

    try {
      terminal.writeln('\x1b[33m→\x1b[0m Starting .NET detection...');
      
      const response = await fetch('/api/dotnet');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      terminal.writeln('\x1b[33m→\x1b[0m Checking if dotnet is in PATH... ' + (data.inPath ? '\x1b[32m✓\x1b[0m' : '\x1b[31m✗\x1b[0m'));
      
      if (data.detectedPath) {
        terminal.writeln(`\x1b[33m→\x1b[0m Found .NET installation at: ${data.detectedPath} \x1b[32m✓\x1b[0m`);
      }
      
      if (data.isInstalled) {
        terminal.writeln(`\x1b[33m→\x1b[0m .NET is installed \x1b[32m✓\x1b[0m`);
        
        if (data.sdks && data.sdks.length > 0) {
          terminal.writeln(`\x1b[33m→\x1b[0m Found ${data.sdks.length} SDK(s) \x1b[32m✓\x1b[0m`);
          data.sdks.forEach((sdk: string) => {
            terminal.writeln(`  \x1b[90m• ${sdk}\x1b[0m`);
          });
        } else {
          terminal.writeln('\x1b[33m→\x1b[0m No SDKs found \x1b[31m✗\x1b[0m');
        }
        
        if (data.runtimes && data.runtimes.length > 0) {
          terminal.writeln(`\x1b[33m→\x1b[0m Found ${data.runtimes.length} runtime(s) \x1b[32m✓\x1b[0m`);
          data.runtimes.forEach((runtime: string) => {
            terminal.writeln(`  \x1b[90m• ${runtime}\x1b[0m`);
          });
        } else {
          terminal.writeln('\x1b[33m→\x1b[0m No runtimes found \x1b[31m✗\x1b[0m');
        }
      } else {
        terminal.writeln('\x1b[33m→\x1b[0m .NET is not installed \x1b[31m✗\x1b[0m');
      }

      if (data.error) {
        terminal.writeln(`\x1b[31mError: ${data.error}\x1b[0m`);
      }

      terminal.writeln('');
      terminal.writeln('\x1b[32m✓ Detection completed successfully!\x1b[0m');
      
    } catch (error) {
      terminal.writeln('');
      terminal.writeln(`\x1b[31m✗ Detection failed: ${error}\x1b[0m`);
    }
    
    terminal.writeln('');
    terminal.writeln('\x1b[36m' + '='.repeat(50) + '\x1b[0m');
    terminal.writeln('\x1b[32mTerminal ready for additional operations.\x1b[0m');
    terminal.writeln('\x1b[90mUse the installation buttons above to install .NET versions.\x1b[0m');
    terminal.writeln('');
    
    setIsDetecting(false);
    setCurrentOperation('idle');
    
    onDetectionComplete?.();
  };

  const startInstallationProcess = async (installVersion: string) => {
    const terminal = xtermRef.current;
    if (!terminal || isInstalling) return;

    setIsInstalling(true);
    setCurrentOperation('installation');
    onInstallStart?.();

    terminal.writeln('\x1b[36m' + '='.repeat(50) + '\x1b[0m');
    terminal.writeln(`\x1b[33mStarting .NET SDK ${installVersion} installation...\x1b[0m`);
    terminal.writeln('');

    try {
      const response = await fetch('/api/dotnet/install', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'install', version: installVersion }),
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
                      const content = normalizeTerminalContent(data.content || '');
                      terminal.write(content);
                    } else if (data.type === 'error') {
                      const content = normalizeTerminalContent(data.content || '');
                      terminal.write(`\x1b[31m${content}\x1b[0m`);
                    } else if (data.type === 'success') {
                      const content = normalizeTerminalContent(data.content || '');
                      terminal.write(`\x1b[32m${content}\x1b[0m`);
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
        terminal.writeln('');
        terminal.writeln('\x1b[36m' + '='.repeat(50) + '\x1b[0m');
        terminal.writeln('\x1b[32mTerminal ready for additional operations.\x1b[0m');
        terminal.writeln('');
      }
      onInstallComplete?.();

    } catch (error) {
      console.error('Installation error:', error);
      if (terminal) {
        terminal.writeln('');
        terminal.writeln(`\x1b[31mInstallation failed: ${error}\x1b[0m`);
        terminal.writeln('');
        terminal.writeln('\x1b[36m' + '='.repeat(50) + '\x1b[0m');
        terminal.writeln('\x1b[32mTerminal ready for additional operations.\x1b[0m');
        terminal.writeln('');
      }
    } finally {
      setIsInstalling(false);
      setCurrentOperation('idle');
    }
  };

  return (
    <div className={`terminal-container`}>
      <div className="bg-gray-800 text-white p-2 text-sm font-medium flex justify-between items-center">
        <span>Operations Terminal</span>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${
            !isLoaded ? 'bg-gray-500' : 
            isDetecting ? 'bg-yellow-500' : 
            isInstalling ? 'bg-blue-500' : 
            'bg-green-500'
          }`}></div>
          <span className="text-xs">
            {!isLoaded ? 'Initializing...' : 
             isDetecting ? 'Detecting...' : 
             isInstalling ? 'Installing...' : 
             'Ready'}
          </span>
        </div>
      </div>
      <div
        ref={terminalRef} 
        className="w-full bg-black relative"
        style={{ height: '300px' }}
      >
        {!isLoaded && (
          <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-sm">
            Loading status terminal...
          </div>
        )}
      </div>
    </div>
  );
});

DotNetOperationsTerminal.displayName = 'DotNetOperationsTerminal';

export default DotNetOperationsTerminal;
