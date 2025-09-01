import { SSEEventData } from './sse';

/**
 * Response type for Server-Sent Events API routes
 * Returns a streaming response with text/event-stream content type
 * that emits SSEEventData objects as the stream progresses
 * 
 * The response contains:
 * - Content-Type: text/event-stream
 * - Cache-Control: no-cache  
 * - Connection: keep-alive
 * - CORS headers for cross-origin access
 * - ReadableStream body with SSEEventData events
 */
export type SSEStreamingResponse = Response;

/**
 * Type for the data structure streamed in SSE responses
 * Each event in the stream contains SSEEventData
 */
export type SSEStreamData = SSEEventData;
