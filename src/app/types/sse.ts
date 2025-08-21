export interface SSEEventData {
  isRunning: boolean;
  stageDisplayText: string;
  message: string;
  timestamp: string;
}

export interface SSECloseEvent {
  message: string;
}
