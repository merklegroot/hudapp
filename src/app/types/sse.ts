export interface SSEEventData {
  isRunning: boolean;
  stageDisplayText: string;
  message: string;
  timestamp: string;
  type: 'command' | 'output' | 'status' | 'error';
  command?: string; // The actual command being executed (when type is 'command')
  output?: string;  // The terminal output (when type is 'output')
  parsedData?: any; // Parsed/processed data from the output (e.g., parsed PATH array)
}

export interface SSECloseEvent {
  message: string;
}
