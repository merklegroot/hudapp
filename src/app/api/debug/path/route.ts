import { NextRequest } from 'next/server';
import { SSEStreamingResponse } from '@/app/types/SSEResponse';
import { SSEEventData, SSECloseEvent } from '@/app/types/sse';
import { spawnAndGetDataWorkflow } from '@/app/workflows/spawnAndGetDataWorkflow';

function parsePath(pathString: string): string[] {
  return pathString.split(':').filter(path => path.trim().length > 0);
}

export async function GET(request: NextRequest): Promise<SSEStreamingResponse<SSEEventData>> {
  const headers = new Headers({
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Cache-Control',
  });

  let isClosed = false;

  const stream = new ReadableStream({
    start(controller) {
      const safeClose = () => {
        if (isClosed) return;
        isClosed = true;
        try {
          controller.close();
        } catch (error) {
          console.log('Controller already closed by cancel()');
        }
      };

      const sendEvent = (eventData: SSEEventData) => {
        if (isClosed) return;
        const sseData = `data: ${JSON.stringify(eventData)}\n\n`;
        try {
          controller.enqueue(new TextEncoder().encode(sseData));
        } catch (error) {
          console.log('Controller already closed, stopping stream');
        }
      };

      const executePathCommand = async () => {
        try {
          const command = 'echo $PATH';
          
          // Send command event
          sendEvent({
            isRunning: true,
            stageDisplayText: `🔹 $ ${command}`,
            message: `Executing: ${command}`,
            timestamp: new Date().toISOString(),
            type: 'command',
            command: command
          });

          const result = await spawnAndGetDataWorkflow.execute({
            command: 'bash',
            args: ['-c', command],
            timeout: 15000
          });

          if (result.success && result.stdout) {
            const pathOutput = result.stdout.trim();
            
            // Send raw output event
            sendEvent({
              isRunning: true,
              stageDisplayText: `📤 ${pathOutput}`,
              message: pathOutput,
              timestamp: new Date().toISOString(),
              type: 'output',
              output: pathOutput
            });

            // Parse the PATH and send parsed data event
            const parsedPaths = parsePath(pathOutput);
            sendEvent({
              isRunning: true,
              stageDisplayText: `📊 Parsed ${parsedPaths.length} PATH directories`,
              message: `Found ${parsedPaths.length} directories in PATH`,
              timestamp: new Date().toISOString(),
              type: 'output',
              output: pathOutput,
              parsedData: {
                paths: parsedPaths,
                totalCount: parsedPaths.length,
                pathString: pathOutput
              }
            });
          } else {
            // Send error event
            sendEvent({
              isRunning: false,
              stageDisplayText: '❌ Error',
              message: 'Failed to get PATH',
              timestamp: new Date().toISOString(),
              type: 'error',
              output: result.stderr || 'Unknown error'
            });
          }

          // Send completion status
          sendEvent({
            isRunning: false,
            stageDisplayText: '✅ Completed',
            message: 'PATH parsing completed successfully!',
            timestamp: new Date().toISOString(),
            type: 'status'
          });

          // Send close event
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
          console.error('PATH command error:', error);
          sendEvent({
            isRunning: false,
            stageDisplayText: '❌ Error',
            message: 'PATH command failed',
            timestamp: new Date().toISOString(),
            type: 'error',
            output: error instanceof Error ? error.message : 'Unknown error'
          });
          safeClose();
        }
      };

      executePathCommand();
    },
    cancel() {
      console.log('SSE connection cancelled');
      isClosed = true;
    }
  });

  return new Response(stream, { headers });
}
