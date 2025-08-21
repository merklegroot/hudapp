export interface SSEEventData {
  stage: 'starting' | 'step1' | 'step2' | 'step3' | 'step4' | 'step5' | 'step6' | 'step7' | 'step8' | 'completed';
  message: string;
  timestamp: string;
}

export interface SSECloseEvent {
  message: string;
}
