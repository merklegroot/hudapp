import { NextRequest } from 'next/server';
import { SSEEventData, SSECloseEvent } from '../types/sse';
import { SpawnResult } from '../types/SpawnResult';

type workflowType = (dataCallback?: (data: string) => void) => Promise<SpawnResult>;

type ParsedDataProcessor = (output: string, success: boolean, stderr?: string) => any;

interface SSEFactoryOptions {
  workflow: workflowType;
  parseData?: ParsedDataProcessor;
  customCommands?: string[];
  customMessages?: {
    executing?: string;
    completed?: string;
    error?: string;
  };
}

export function sseTerminalHandlerFactory(options: workflowType | SSEFactoryOptions) {
  // Support both old signature (workflow function) and new signature (options object)
  const workflow = typeof options === 'function' ? options : options.workflow;
  const parseData = typeof options === 'object' ? options.parseData : undefined;
  const customCommands = typeof options === 'object' ? options.customCommands : undefined;
  const customMessages = typeof options === 'object' ? options.customMessages : undefined;

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
                  const executingMessage = customMessages?.executing || `Executing: ${actualCommand}`;
                  eventData = {
                    isRunning: true,
                    stageDisplayText: `🔹 ${trimmedLine}`,
                    message: executingMessage,
                    timestamp: new Date().toISOString(),
                    type: 'command',
                    command: actualCommand
                  };
                } else if (isCompleted) {
                  const completedMessage = customMessages?.completed || 'Process completed successfully!';
                  eventData = {
                    isRunning: false,
                    stageDisplayText: '✅ Completed',
                    message: completedMessage,
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

            // Add parsed data if parser is provided
            if (parseData && !isClosed) {
              try {
                const parsedResult = parseData(result.stdout || '', result.success, result.stderr);
                const parsedEventData: SSEEventData = {
                  isRunning: true,
                  stageDisplayText: result.success ? '📋 Processing results' : '⚠️ Processing errors',
                  message: result.success ? 'Processing command output' : 'Processing error output',
                  timestamp: new Date().toISOString(),
                  type: 'output',
                  output: result.stdout || result.stderr || '',
                  parsedData: parsedResult
                };
                const sseData = `data: ${JSON.stringify(parsedEventData)}\n\n`;
                controller.enqueue(new TextEncoder().encode(sseData));
              } catch (parseError) {
                console.error('Error parsing result:', parseError);
              }
            }

            if (!result.success) {
              console.error('Script execution failed:', result.stderr);
              // Send error event
              const errorMessage = customMessages?.error || 'Script execution failed';
              const errorData: SSEEventData = {
                isRunning: false,
                stageDisplayText: '❌ Error',
                message: errorMessage,
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