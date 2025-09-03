'use client';

import SseTerminal from './SseTerminal/SseTerminal';

interface DotNetInstallation {
  path: string;
  version?: string;
  type: 'path' | 'directory';
  sdks: string[];
  runtimes: string[];
}

interface ParsedDotNetData {
  dotnetDetected: boolean;
  totalInstallations: number;
  totalSdks: number;
  totalRuntimes: number;
  inPath: boolean;
  pathInstallation: string | null;
  installations: DotNetInstallation[];
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

      {/* Summary Stats */}
      {parsedData.dotnetDetected && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="text-2xl font-bold text-blue-800">{parsedData.totalInstallations}</div>
            <div className="text-sm text-blue-600">Installations</div>
          </div>
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <div className="text-2xl font-bold text-orange-800">{parsedData.totalSdks}</div>
            <div className="text-sm text-orange-600">SDKs</div>
          </div>
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <div className="text-2xl font-bold text-purple-800">{parsedData.totalRuntimes}</div>
            <div className="text-sm text-purple-600">Runtimes</div>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="text-2xl font-bold text-green-800">{parsedData.inPath ? 'Yes' : 'No'}</div>
            <div className="text-sm text-green-600">In PATH</div>
          </div>
        </div>
      )}

      {/* Installation Details */}
      {parsedData.installations.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800">Installation Details</h3>
          
          {parsedData.installations.map((installation, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    installation.type === 'path' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {installation.type === 'path' ? 'PATH' : 'Directory'}
                  </span>
                  {installation.version && (
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      v{installation.version}
                    </span>
                  )}
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <span>{installation.sdks.length} SDK{installation.sdks.length !== 1 ? 's' : ''}</span>
                  <span>•</span>
                  <span>{installation.runtimes.length} Runtime{installation.runtimes.length !== 1 ? 's' : ''}</span>
                </div>
              </div>
              
              <div className="font-mono text-sm text-gray-700 bg-gray-50 p-2 rounded mb-3">
                {installation.path}
              </div>

              {/* SDKs */}
              {installation.sdks.length > 0 && (
                <div className="mb-3">
                  <h5 className="text-sm font-medium text-gray-700 mb-2">SDKs:</h5>
                  <div className="space-y-1">
                    {installation.sdks.map((sdk, sdkIndex) => (
                      <div key={sdkIndex} className="text-sm text-gray-600 bg-orange-50 px-2 py-1 rounded">
                        {sdk}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Runtimes */}
              {installation.runtimes.length > 0 && (
                <div>
                  <h5 className="text-sm font-medium text-gray-700 mb-2">Runtimes:</h5>
                  <div className="space-y-1">
                    {installation.runtimes.map((runtime, runtimeIndex) => (
                      <div key={runtimeIndex} className="text-sm text-gray-600 bg-purple-50 px-2 py-1 rounded">
                        {runtime}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* PATH Status */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-medium text-gray-800 mb-2">PATH Status</h4>
        <div className="flex items-center space-x-2">
          <span className={`w-3 h-3 rounded-full ${parsedData.inPath ? 'bg-green-400' : 'bg-red-400'}`}></span>
          <span className="text-sm text-gray-600">
            {parsedData.inPath 
              ? `dotnet command is available in PATH (${parsedData.pathInstallation})`
              : 'dotnet command is not available in PATH'
            }
          </span>
        </div>
        
        {!parsedData.inPath && parsedData.installations.length > 0 && (
          <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded">
            <p className="text-sm text-yellow-800">
              <strong>Tip:</strong> .NET is installed but not in your PATH. You may need to add one of the installation directories to your PATH environment variable.
            </p>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <SseTerminal
      url="/api/debug/dotnet"
      terminalTitle=".NET Comprehensive Scan Terminal"
      startButtonLabel="Scan for .NET"
      stopButtonLabel="Stop Scan"
      autoCloseTimeoutMs={15000}
      autoStart={true}
      renderResults={renderDotNetResults}
    />
  );
}