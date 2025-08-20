'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import FastfetchTerminal to prevent SSR issues
const FastfetchTerminal = dynamic(() => import('../components/FastfetchTerminal'), {
  ssr: false,
  loading: () => (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="bg-gray-800 text-white p-2 text-sm font-medium flex justify-between items-center">
        <span>Fastfetch Terminal</span>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-gray-500"></div>
          <span className="text-xs">Loading...</span>
        </div>
      </div>
      <div className="w-full bg-black flex items-center justify-center" style={{ height: '400px' }}>
        <div className="text-gray-400 text-sm">Loading terminal component...</div>
      </div>
      <div className="bg-gray-700 p-2">
        <button
          disabled
          className="px-4 py-2 bg-gray-500 text-white text-sm rounded cursor-not-allowed"
        >
          Loading Terminal...
        </button>
      </div>
    </div>
  )
});

export default function Utils() {
  const [showTerminal, setShowTerminal] = useState(false);

  const handleRunStart = () => {
    setShowTerminal(true);
  };

  const handleRunComplete = () => {
    // Keep terminal visible after run completes
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Utils</h1>
        
        <div className="space-y-6">
          {/* Fastfetch Section */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-2xl font-semibold text-gray-800 mb-2">System Information</h2>
                <p className="text-gray-600">
                  Run fastfetch to display detailed system information including OS, kernel, CPU, GPU, memory, and more.
                </p>
              </div>
              <button
                onClick={() => setShowTerminal(!showTerminal)}
                className="px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
              >
                {showTerminal ? 'Hide Terminal' : 'Show Fastfetch Terminal'}
              </button>
            </div>

            {/* Information about fastfetch */}
            <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-4">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-blue-700">
                    <strong>About Fastfetch:</strong> A fast system information tool that displays your system configuration 
                    in a clean, organized format. It shows details about your OS, kernel, CPU, GPU, memory, disk usage, and more.
                  </p>
                  <p className="text-sm text-blue-700 mt-2">
                    If fastfetch is not installed, you can install it with: <code className="bg-blue-100 px-1 rounded">sudo apt install fastfetch</code>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Terminal Section */}
          {showTerminal && (
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <FastfetchTerminal 
                onRunStart={handleRunStart}
                onRunComplete={handleRunComplete}
                className="w-full"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
