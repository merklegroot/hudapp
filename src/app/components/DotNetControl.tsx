'use client';

import SseTerminal from './SseTerminal/SseTerminal';
import { DotNetVersionControl } from './DotNetVersionControl';

interface SdkInfo {
  version: string;
  path: string;
}

interface RuntimeInfo {
  version: string;
  path: string;
  package: string;
}

interface DotNetInstallation {
  path: string;
  version?: string;
  type: 'path' | 'directory';
  sdks: SdkInfo[];
  runtimes: RuntimeInfo[];
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

function InstallationSummary({ parsedData }: { parsedData: ParsedDotNetData }) {
  return (
    <div className={`border rounded-lg p-4 mb-6 ${parsedData.dotnetDetected
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
  );
}

function InstallationDetails({ parsedData }: { parsedData: ParsedDotNetData }) {
  // Always show all major versions (6, 7, 8, 9)
  const allMajorVersions = ['6', '7', '8', '9'];

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-800">Installation Details</h3>

      {/* Version Controls - Side by Side */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {allMajorVersions.map((majorVersion) => {
          // Filter SDKs and runtimes from ALL installations for this specific major version
          const filteredSdks = parsedData.installations.flatMap(inst => 
            inst.sdks.filter(sdk => sdk.version.startsWith(`${majorVersion}.`))
          );
          const filteredRuntimes = parsedData.installations.flatMap(inst => 
            inst.runtimes.filter(runtime => runtime.version.startsWith(`${majorVersion}.`))
          );
          
          // Remove duplicates by version for SDKs and by package+version for runtimes
          const uniqueSdks = filteredSdks.filter((sdk, index, self) => 
            index === self.findIndex(s => s.version === sdk.version)
          );
          const uniqueRuntimes = filteredRuntimes.filter((runtime, index, self) => 
            index === self.findIndex(r => r.package === runtime.package && r.version === runtime.version)
          );

          return (
            <div key={majorVersion}>
              <DotNetVersionControl
                baseVersion={majorVersion}
                sdkVersionsInstalled={uniqueSdks}
                runtimeVersionsInstalled={uniqueRuntimes}
              />
            </div>
          );
        })}
      </div>

      {/* Installation paths - Show all installations */}
      {parsedData.installations.length > 0 && (
        <div className="space-y-4">
          <h4 className="text-md font-medium text-gray-800">Installation Paths</h4>
          {parsedData.installations.map((installation, index) => (
            <div key={index} className="space-y-2">
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${installation.type === 'path'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-blue-100 text-blue-800'
                  }`}>
                  {installation.type === 'path' ? 'PATH' : 'Directory'}
                </span>
                {installation.version && (
                  <span className="text-xs text-gray-500">v{installation.version}</span>
                )}
              </div>
              <div className="font-mono text-sm text-gray-700 bg-gray-50 p-2 rounded">
                {installation.path}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function PathStatus({ parsedData }: { parsedData: ParsedDotNetData }) {
  return (
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
  );
}

export function DotNetControl() {
  const renderDotNetResults = (parsedData: ParsedDotNetData) => (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">.NET Detection Results</h2>

      <InstallationSummary parsedData={parsedData} />
      <InstallationDetails parsedData={parsedData} />
      <PathStatus parsedData={parsedData} />
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