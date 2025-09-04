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
      </div>
      {isEndOfSupport && (
        <>
          <p className="text-sm text-gray-600 mb-2">End of Support - Legacy projects only</p>
          <div className="mb-3 p-2 bg-orange-50 border border-orange-200 rounded text-xs text-orange-800">
            ⚠️ Support ended {endOfSupportDate}
          </div>
        </>
      )}
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

          <DotNetVersionControl
            baseVersion="7.0"
            sdkVersionsInstalled={['7.0.100']}
            runtimeVersionsInstalled={['7.0.100']}
            isEndOfSupport={true}
            endOfSupportDate="May 2024" />
        </div>
      </div>
    </div>
  );
}
