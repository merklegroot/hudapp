import { NextRequest } from 'next/server';
import { SSEEventData, SSECloseEvent } from '../../../types/sse';

export async function GET(request: NextRequest) {
  // Set up Server-Sent Events headers
  const headers = new Headers({
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Cache-Control',
  });

  // Create a readable stream for SSE
  let isClosed = false; // Move to shared scope
  
  const stream = new ReadableStream({
    start(controller) {
      const stages: Omit<SSEEventData, 'timestamp'>[] = [
        { isRunning: true, stageDisplayText: 'Starting', message: 'Process is starting...' },
        { isRunning: true, stageDisplayText: 'Step 1', message: 'Executing step 1...' },
        { isRunning: true, stageDisplayText: 'Step 2', message: 'Executing step 2...' },
        { isRunning: true, stageDisplayText: 'Step 3', message: 'Executing step 3...' },
        { isRunning: true, stageDisplayText: 'Step 4', message: 'Executing step 4...' },
        { isRunning: true, stageDisplayText: 'Step 5', message: 'Executing step 5...' },
        { isRunning: true, stageDisplayText: 'Step 6', message: 'Executing step 6...' },
        { isRunning: true, stageDisplayText: 'Step 7', message: 'Executing step 7...' },
        { isRunning: true, stageDisplayText: 'Step 8', message: 'Executing step 8...' },
        { isRunning: false, stageDisplayText: 'Completed', message: 'Process completed successfully!' }
      ];

      let currentStage = 0;

      const safeClose = () => {
        if (!isClosed) {
          isClosed = true;
          try {
            controller.close();
          } catch (error) {
            console.log('Controller already closed by cancel()');
          }
        }
      };

      const sendEvent = () => {
        if (currentStage < stages.length && !isClosed) {
          const data: SSEEventData = {
            isRunning: stages[currentStage].isRunning,
            stageDisplayText: stages[currentStage].stageDisplayText,
            message: stages[currentStage].message,
            timestamp: new Date().toISOString()
          };

          // Send the event in SSE format
          const eventData = `data: ${JSON.stringify(data)}\n\n`;
          
          try {
            controller.enqueue(new TextEncoder().encode(eventData));
          } catch (error) {
            console.log('Controller already closed, stopping stream');
            return;
          }

          currentStage++;

          if (currentStage < stages.length) {
            // Schedule next stage after 500ms
            setTimeout(sendEvent, 500);
          } else {
            // Send a final close event and then close the connection
            setTimeout(() => {
              if (!isClosed) {
                try {
                  const closeData: SSECloseEvent = { message: "Stream completed" };
                  const closeEvent = `event: close\ndata: ${JSON.stringify(closeData)}\n\n`;
                  controller.enqueue(new TextEncoder().encode(closeEvent));
                } catch (error) {
                  console.log('Controller already closed, skipping close event');
                }
                
                // Close after a brief delay
                setTimeout(safeClose, 100);
              }
            }, 500);
          }
        }
      };

      // Start the process
      sendEvent();
    },
    cancel() {
      console.log('SSE connection cancelled');
      isClosed = true;
    }
  });

  return new Response(stream, { headers });
}
