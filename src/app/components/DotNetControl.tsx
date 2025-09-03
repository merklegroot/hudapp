'use client';

import SseTerminal from './SseTerminal/SseTerminal';

export function DotNetControl() {
  return (
    <SseTerminal
      url="/api/debug/dotnet"
      terminalTitle="Debug Events Terminal"
      startButtonLabel="Start Debug Process"
      stopButtonLabel="Stop Debug"
    />
  );
}