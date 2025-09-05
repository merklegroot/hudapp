import { DotNetVersionControl } from '../components/DotNetVersionControl';



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
