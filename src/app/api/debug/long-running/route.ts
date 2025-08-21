import { NextRequest } from 'next/server';

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
      const stages = [
        { stage: 'starting', message: 'Process is starting...' },
        { stage: 'step1', message: 'Executing step 1...' },
        { stage: 'step2', message: 'Executing step 2...' },
        { stage: 'step3', message: 'Executing step 3...' },
        { stage: 'step4', message: 'Executing step 4...' },
        { stage: 'step5', message: 'Executing step 5...' },
        { stage: 'step6', message: 'Executing step 6...' },
        { stage: 'step7', message: 'Executing step 7...' },
        { stage: 'step8', message: 'Executing step 8...' },
        { stage: 'completed', message: 'Process completed successfully!' }
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
          const data = {
            stage: stages[currentStage].stage,
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
                  const closeEvent = `event: close\ndata: {"message": "Stream completed"}\n\n`;
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
