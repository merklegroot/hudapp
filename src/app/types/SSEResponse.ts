import { SSEEventData } from './sse';
import { SpawnResult } from './SpawnResult';

/**
 * Response type for Server-Sent Events API routes that stream SSEEventData objects
 * 
 * CONSUMER USAGE:
 * const eventSource = new EventSource('/api/debug/path');
 * eventSource.onmessage = (event) => {
 *   const data: SSEEventData = JSON.parse(event.data);
 *   // data contains: { isRunning, stageDisplayText, message, timestamp }
 * };
 * 
 * STREAMED DATA STRUCTURE (SSEEventData):
 * {
 *   isRunning: boolean;        // Whether the command is still executing
 *   stageDisplayText: string;  // Formatted text for terminal display (with emojis)
 *   message: string;          // Raw command output or status message
 *   timestamp: string;        // ISO timestamp of when this event occurred
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
