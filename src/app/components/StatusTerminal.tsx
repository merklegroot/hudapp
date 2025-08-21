'use client';

import { useEffect, useRef, useState } from 'react';

interface StatusTerminalProps {
  onDetectionComplete?: () => void;
  className?: string;
}

export default function StatusTerminal({ onDetectionComplete, className = '' }: StatusTerminalProps) {
  const terminalRef = useRef<HTMLDivElement>(null);
  const xtermRef = useRef<any>(null);
  const fitAddonRef = useRef<any>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isDetecting, setIsDetecting] = useState(true);

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
          cursorBlink: false,
          fontSize: 13,
          fontFamily: 'Consolas, "Courier New", monospace',
          theme: {
            background: '#1a1a1a',
            foreground: '#ffffff',
            cursor: '#ffffff',
            selection: '#ffffff40',
          },
          rows: 15,
          cols: 100,
          disableStdin: true,
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

        setIsLoaded(true);

        // Start detection process
        startDetection(terminal);

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

    // Simulate the detection steps
    const steps = [
      { message: 'Checking if dotnet is in PATH...', delay: 500 },
      { message: 'Executing: dotnet --version', delay: 800 },
      { message: 'Checking common installation locations...', delay: 600 },
      { message: 'Scanning: ~/.dotnet/', delay: 400 },
      { message: 'Scanning: /usr/share/dotnet/', delay: 300 },
      { message: 'Scanning: /opt/dotnet/', delay: 300 },
      { message: 'Scanning: /usr/local/share/dotnet/', delay: 300 },
      { message: 'Gathering SDK information...', delay: 700 },
      { message: 'Executing: dotnet --list-sdks', delay: 600 },
      { message: 'Gathering runtime information...', delay: 600 },
      { message: 'Executing: dotnet --list-runtimes', delay: 500 },
      { message: 'Analyzing PATH configuration...', delay: 400 },
    ];

    for (const step of steps) {
      terminal.write('\x1b[33m→\x1b[0m ' + step.message);
      await new Promise(resolve => setTimeout(resolve, step.delay));
      terminal.writeln(' \x1b[32m✓\x1b[0m');
    }

    terminal.writeln('');
    terminal.writeln('\x1b[32m✓ Detection completed successfully!\x1b[0m');
    terminal.writeln('\x1b[90mLoading .NET status information...\x1b[0m');
    
    setIsDetecting(false);
    
    // Small delay before calling completion
    setTimeout(() => {
      onDetectionComplete?.();
    }, 500);
  };

  return (
    <div className={`terminal-container ${className}`}>
      <div className="bg-gray-800 text-white p-2 text-sm font-medium flex justify-between items-center">
        <span>.NET Detection Terminal</span>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${!isLoaded ? 'bg-gray-500' : isDetecting ? 'bg-yellow-500' : 'bg-green-500'}`}></div>
          <span className="text-xs">
            {!isLoaded ? 'Initializing...' : isDetecting ? 'Detecting...' : 'Complete'}
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
            Loading detection terminal...
          </div>
        )}
      </div>
    </div>
  );
}
