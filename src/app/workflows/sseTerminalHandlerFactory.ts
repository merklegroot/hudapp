import { NextRequest } from 'next/server';
import { SSEEventData, SSECloseEvent } from '../types/sse';
import { SpawnResult } from '../types/SpawnResult';

type workflowType = (dataCallback?: (data: string) => void) => Promise<SpawnResult>;

export function sseTerminalHandlerFactory(workflow: workflowType) {

  return async function GET(request: NextRequest) {
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
        const safeClose = () => {
          if (isClosed) {
            return; // Guard clause - early return if already closed
          }

          isClosed = true;
          try {
            controller.close();
          } catch (error) {
            console.log('Controller already closed by cancel()');
          }
        };

        // Get the path to the shell script

        // Use the workflow to execute the script
        const executeScript = async () => {
          try {

            const dataCallback = (data: string) => {

              if (isClosed) return;

              console.log('Data received:', data);

              // Process each line of data as it comes in
              const lines = data.split('\n').filter((line: string) => line.trim());

              for (const line of lines) {

                if (isClosed) break;

                const trimmedLine = line.trim();

                if (!trimmedLine) continue;

                const isCompleted = trimmedLine === 'Completed';
                const isCommand = trimmedLine.startsWith('$ ');

                // Create event data with clear distinction between command and output
                let eventData: SSEEventData;

                if (isCommand) {
                  const actualCommand = trimmedLine.substring(2); // Remove '$ ' prefix
                  eventData = {
                    isRunning: true,
                    stageDisplayText: `🔹 ${trimmedLine}`,
                    message: `Executing: ${actualCommand}`,
                    timestamp: new Date().toISOString(),
                    type: 'command',
                    command: actualCommand
                  };
                } else if (isCompleted) {
                  eventData = {
                    isRunning: false,
                    stageDisplayText: '✅ Completed',
                    message: 'Process completed successfully!',
                    timestamp: new Date().toISOString(),
                    type: 'status'
                  };
                } else {
                  eventData = {
                    isRunning: true,
                    stageDisplayText: `📤 ${trimmedLine}`,
                    message: trimmedLine,
                    timestamp: new Date().toISOString(),
                    type: 'output',
                    output: trimmedLine
                  };
                }

                const sseData = `data: ${JSON.stringify(eventData)}\n\n`;

                try {
                  controller.enqueue(new TextEncoder().encode(sseData));
                } catch (error) {
                  console.log('Controller already closed, stopping stream');
                  return;
                }
              }
            };

            const result = await workflow(dataCallback);

            if (!result.success) {
              console.error('Script execution failed:', result.stderr);
              // Send error event
              const errorData: SSEEventData = {
                isRunning: false,
                stageDisplayText: '❌ Error',
                message: 'Script execution failed',
                timestamp: new Date().toISOString(),
                type: 'error',
                output: result.stderr || 'Unknown error'
              };
              const sseData = `data: ${JSON.stringify(errorData)}\n\n`;
              controller.enqueue(new TextEncoder().encode(sseData));
            }

            // Send final close event

            if (!isClosed) {
              try {
                const closeData: SSECloseEvent = { message: "Stream completed" };
                const closeEvent = `event: close\ndata: ${JSON.stringify(closeData)}\n\n`;
                controller.enqueue(new TextEncoder().encode(closeEvent));
              } catch (error) {
                console.log('Controller already closed, skipping close event');
              }

              setTimeout(safeClose, 100);
            }
          } catch (error) {
            console.error('Script workflow error:', error);
            safeClose();
          }
        };

        // Start the script execution
        executeScript();
      },
      cancel() {
        console.log('SSE connection cancelled');
        isClosed = true;
      }
    });

    return new Response(stream, { headers });
  }
}