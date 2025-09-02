import { NextRequest } from 'next/server';
import { SSEStreamingResponse } from '@/app/types/SSEResponse';
import { SSEEventData, SSECloseEvent } from '@/app/types/sse';
import { DotNetInfo } from '@/app/types/DotNetInfo';
import { spawn } from 'child_process';
import path from 'path';

function parseDotNetOutput(jsonOutput: string): DotNetInfo | null {
  try {
    return JSON.parse(jsonOutput) as DotNetInfo;
  } catch (error) {
    console.error('Failed to parse .NET detection output:', error);
    return null;
  }
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

      const executeDotNetDetection = async () => {
        try {
          // Get the absolute path to the script
          const scriptPath = path.join(process.cwd(), 'detect_dotnet.sh');
          
          const command = `${scriptPath} --pretty`;
          
          // Send command event
          sendEvent({
            isRunning: true,
            stageDisplayText: `🔹 $ ${command}`,
            message: `Executing: ${command}`,
            timestamp: new Date().toISOString(),
            type: 'command',
            command: command
          });

          // Execute the script with preserved environment using child_process directly
          const child = spawn('bash', ['-l', '-c', `${scriptPath} --pretty`], {
            stdio: ['pipe', 'pipe', 'pipe'],
            env: process.env, // Preserve the full Node.js environment
            shell: false
          });

          let stdout = '';
          let stderr = '';

          child.stdout?.on('data', (data) => {
            stdout += data.toString();
          });

          child.stderr?.on('data', (data) => {
            stderr += data.toString();
          });

          child.on('close', (code) => {
            if (code === 0 && stdout) {
              const dotnetOutput = stdout.trim();
              
              // Send raw output event
              sendEvent({
                isRunning: true,
                stageDisplayText: `📤 .NET Detection Output`,
                message: dotnetOutput,
                timestamp: new Date().toISOString(),
                type: 'output',
                output: dotnetOutput
              });

              // Parse the .NET detection data and send parsed data event
              const parsedDotNetInfo = parseDotNetOutput(dotnetOutput);
              
              if (parsedDotNetInfo) {
                const statusIcon = parsedDotNetInfo.isInstalled ? '✅' : '❌';
                const statusText = parsedDotNetInfo.isInstalled 
                  ? `Found .NET with ${parsedDotNetInfo.sdks.length} SDK(s) and ${parsedDotNetInfo.runtimes.length} runtime(s)`
                  : 'No .NET installation found';

                sendEvent({
                  isRunning: true,
                  stageDisplayText: `${statusIcon} ${statusText}`,
                  message: statusText,
                  timestamp: new Date().toISOString(),
                  type: 'output',
                  output: dotnetOutput,
                  parsedData: parsedDotNetInfo
                });
              } else {
                sendEvent({
                  isRunning: true,
                  stageDisplayText: '⚠️ Warning: Failed to parse .NET detection output',
                  message: 'Could not parse the .NET detection JSON output',
                  timestamp: new Date().toISOString(),
                  type: 'output',
                  output: dotnetOutput
                });
              }

              // Send completion status
              sendEvent({
                isRunning: false,
                stageDisplayText: '✅ Completed',
                message: '.NET detection completed successfully!',
                timestamp: new Date().toISOString(),
                type: 'status'
              });
            } else {
              // Send error event
              sendEvent({
                isRunning: false,
                stageDisplayText: '❌ Error',
                message: 'Failed to run .NET detection script',
                timestamp: new Date().toISOString(),
                type: 'error',
                output: stderr || 'Unknown error'
              });
            }

            // Send close event and finish
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
          });

          child.on('error', (error) => {
            sendEvent({
              isRunning: false,
              stageDisplayText: '❌ Error',
              message: 'Failed to spawn .NET detection script',
              timestamp: new Date().toISOString(),
              type: 'error',
              output: error.message
            });
            safeClose();
          });
        } catch (error) {
          console.error('.NET detection error:', error);
          sendEvent({
            isRunning: false,
            stageDisplayText: '❌ Error',
            message: '.NET detection script failed',
            timestamp: new Date().toISOString(),
            type: 'error',
            output: error instanceof Error ? error.message : 'Unknown error'
          });
          safeClose();
        }
      };

      executeDotNetDetection();
    },
    cancel() {
      console.log('SSE connection cancelled');
      isClosed = true;
    }
  });

  return new Response(stream, { headers });
}
