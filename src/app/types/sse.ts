export interface SSEEventData {
  isRunning: boolean;
  stageDisplayText: string;
  message: string;
  timestamp: string;
  type: 'command' | 'output' | 'status' | 'error';
  command?: string; // The actual command being executed (when type is 'command')
  output?: string;  // The terminal output (when type is 'output')
}

export interface SSECloseEvent {
  message: string;
}
