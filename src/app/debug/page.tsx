import SseTerminal from '../components/SseTerminal/SseTerminal';

interface DotNetVersionControlProps {
  baseVersion: string;
  sdkVersionsInstalled: string[];
  runtimeVersionsInstalled: string[];
  isEndOfSupport: boolean;
  endOfSupportDate: string;
}

function DotNetVersionControl({ baseVersion, sdkVersionsInstalled, runtimeVersionsInstalled, isEndOfSupport, endOfSupportDate: endOfSupportDate }: DotNetVersionControlProps) {
  return (
    <div className="bg-white p-4 rounded-lg border">
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-semibold text-gray-800">.NET {baseVersion}</h4>
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <span>{sdkVersionsInstalled.length} SDK{sdkVersionsInstalled.length !== 1 ? 's' : ''}</span>
          <span>•</span>
          <span>{runtimeVersionsInstalled.length} Runtime{runtimeVersionsInstalled.length !== 1 ? 's' : ''}</span>
        </div>
      </div>
      
      {isEndOfSupport && (
        <>
          <p className="text-sm text-gray-600 mb-2">End of Support - Legacy projects only</p>
          <div className="mb-3 p-2 bg-orange-50 border border-orange-200 rounded text-xs text-orange-800">
            ⚠️ Support ended {endOfSupportDate}
          </div>
        </>
      )}

      {/* SDKs and Runtimes Section - Side by Side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* SDKs Section - Left */}
        {sdkVersionsInstalled.length > 0 && (
          <div>
            <h5 className="text-sm font-medium text-gray-700 mb-2">SDKs:</h5>
            <div className="space-y-1">
              {sdkVersionsInstalled.map((sdk, index) => (
                <div key={index} className="text-sm text-gray-600 bg-orange-50 px-2 py-1 rounded">
                  {sdk}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Runtimes Section - Right */}
        {runtimeVersionsInstalled.length > 0 && (
          <div>
            <h5 className="text-sm font-medium text-gray-700 mb-2">Runtimes:</h5>
            <div className="space-y-1">
              {runtimeVersionsInstalled.map((runtime, index) => (
                <div key={index} className="text-sm text-gray-600 bg-purple-50 px-2 py-1 rounded">
                  {runtime}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function Debug() {
  return (
    <div className="min-h-[calc(100vh-4rem)] p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Debug</h1>

        <div className="space-y-8">
          {/* <SseTerminal 
            url="/api/debug/long-running"
            terminalTitle="Debug Events Terminal"
            startButtonLabel="Start Debug Process"
            stopButtonLabel="Stop Debug"
          />*/}

          <div className="space-y-4">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Installed .NET Versions</h2>
            
            <DotNetVersionControl
              baseVersion="7.0"
              sdkVersionsInstalled={['7.0.100', '7.0.101', '7.0.102']}
              runtimeVersionsInstalled={['Microsoft.NETCore.App 7.0.0', 'Microsoft.AspNetCore.App 7.0.0']}
              isEndOfSupport={true}
              endOfSupportDate="May 2024" />

            <DotNetVersionControl
              baseVersion="8.0"
              sdkVersionsInstalled={['8.0.100', '8.0.101', '8.0.200', '8.0.201']}
              runtimeVersionsInstalled={['Microsoft.NETCore.App 8.0.0', 'Microsoft.AspNetCore.App 8.0.0', 'Microsoft.WindowsDesktop.App 8.0.0']}
              isEndOfSupport={false}
              endOfSupportDate="" />

            <DotNetVersionControl
              baseVersion="9.0"
              sdkVersionsInstalled={['9.0.100']}
              runtimeVersionsInstalled={['Microsoft.NETCore.App 9.0.0', 'Microsoft.AspNetCore.App 9.0.0']}
              isEndOfSupport={false}
              endOfSupportDate="" />
          </div>
        </div>
      </div>
    </div>
  );
}
