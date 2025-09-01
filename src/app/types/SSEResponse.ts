import { SSEEventData } from './sse';
import { SpawnResult } from './SpawnResult';

/**
 * Response type for Server-Sent Events API routes that stream SSEEventData objects
 * 
 * CONSUMER USAGE:
 * const eventSource = new EventSource('/api/debug/path');
 * eventSource.onmessage = (event) => {
 *   const data: SSEEventData = JSON.parse(event.data);
 *   switch (data.type) {
 *     case 'command':
 *       console.log('Executing command:', data.command);
 *       break;
 *     case 'output':
 *       console.log('Terminal output:', data.output);
 *       break;
 *     case 'status':
 *       console.log('Status update:', data.message);
 *       break;
 *     case 'error':
 *       console.error('Error:', data.output);
 *       break;
 *   }
 * };
 * 
 * STREAMED DATA STRUCTURE (SSEEventData):
 * {
 *   isRunning: boolean;        // Whether the command is still executing
 *   stageDisplayText: string;  // Formatted text for terminal display (with emojis)
 *   message: string;          // Human-readable description of what's happening
 *   timestamp: string;        // ISO timestamp of when this event occurred
 *   type: 'command' | 'output' | 'status' | 'error'; // Type of data being sent
 *   command?: string;         // The actual command being executed (when type is 'command')
 *   output?: string;          // The raw terminal output (when type is 'output' or 'error')
 * }
 * 
 * INTERNAL FLOW:
 * Command execution → SpawnResult → Real-time stdout streaming → SSEEventData events
 */
export type SSEStreamingResponse<T = SSEEventData> = Response;

/**
 * Type alias for the data structure that API consumers receive in each SSE event
 * Consumers parse this from event.data: JSON.parse(event.data) as SSEEventData
 */
export type SSEEventStreamData = SSEEventData;
