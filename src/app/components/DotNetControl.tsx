'use client';

import SseTerminal from './SseTerminal/SseTerminal';

interface ParsedDotNetData {
  dotnetDetected: boolean;
  dotnetPath: string | null;
  status: 'found' | 'not_found' | 'error';
  message: string;
}

export function DotNetControl() {
  const renderDotNetResults = (parsedData: ParsedDotNetData) => (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">.NET Detection Results</h2>
      
      {/* Status Summary */}
      <div className={`border rounded-lg p-4 mb-6 ${
        parsedData.dotnetDetected 
          ? 'bg-green-50 border-green-200' 
          : 'bg-red-50 border-red-200'
      }`}>
        <div className="flex items-center space-x-3">
          <span className="text-2xl">
            {parsedData.dotnetDetected ? '✅' : '❌'}
          </span>
          <div>
            <h3 className="text-lg font-medium text-gray-800">
              {parsedData.dotnetDetected ? '.NET Detected' : '.NET Not Found'}
            </h3>
            <p className="text-gray-600">{parsedData.message}</p>
          </div>
        </div>
      </div>

      {/* Details */}
      <div className="space-y-3">
        <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
          <span className="font-medium text-gray-700">Status:</span>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            parsedData.status === 'found' 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            {parsedData.status === 'found' ? 'Found' : 'Not Found'}
          </span>
        </div>

        {parsedData.dotnetPath && (
          <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
            <span className="font-medium text-gray-700">Installation Path:</span>
            <span className="font-mono text-gray-900 bg-gray-100 px-2 py-1 rounded">
              {parsedData.dotnetPath}
            </span>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <SseTerminal
      url="/api/debug/dotnet"
      terminalTitle=".NET Detection Terminal"
      startButtonLabel="Detect .NET"
      stopButtonLabel="Stop Detection"
      autoCloseTimeoutMs={6000}
      autoStart={true}
      renderResults={renderDotNetResults}
    />
  );
}