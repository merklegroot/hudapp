import { NextRequest, NextResponse } from 'next/server';
import { spawn } from 'child_process';

export async function POST(request: NextRequest) {
  try {
    const { action } = await request.json();
    
    if (action === 'run') {
      return new Response(
        new ReadableStream({
          start(controller) {
            const encoder = new TextEncoder();
            
            const sendMessage = (type: string, content: string) => {
              try {
                const message = JSON.stringify({ type, content });
                controller.enqueue(encoder.encode(`data: ${message}\n\n`));
              } catch (error) {
                console.error('Error sending message:', error);
                // Fallback: send raw content without JSON wrapper
                controller.enqueue(encoder.encode(`data: ${content}\n\n`));
              }
            };
            
            // Send initial message
            sendMessage('output', 'Running fastfetch...\r\n\r\n');

            // Check if fastfetch is available
            const fastfetchProcess = spawn('fastfetch', [], {
              stdio: ['ignore', 'pipe', 'pipe']
            });

            fastfetchProcess.stdout.on('data', (data) => {
              sendMessage('output', data.toString());
            });

            fastfetchProcess.stderr.on('data', (data) => {
              sendMessage('output', data.toString());
            });

            fastfetchProcess.on('close', (code) => {
              if (code === 0) {
                sendMessage('success', '\r\nFastfetch completed successfully!\r\n');
              } else {
                sendMessage('error', `\r\nFastfetch failed with exit code: ${code}\r\n`);
                sendMessage('error', 'Make sure fastfetch is installed on your system.\r\n');
                sendMessage('error', 'You can install it with: sudo apt install fastfetch\r\n');
              }
              controller.close();
            });

            fastfetchProcess.on('error', (error) => {
              sendMessage('error', `Error running fastfetch: ${error.message}\r\n`);
              sendMessage('error', 'Make sure fastfetch is installed on your system.\r\n');
              sendMessage('error', 'You can install it with: sudo apt install fastfetch\r\n');
              controller.close();
            });
          },
        }),
        {
          headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST',
            'Access-Control-Allow-Headers': 'Content-Type',
          },
        }
      );
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Fastfetch error:', error);
    return NextResponse.json({ error: 'Fastfetch execution failed' }, { status: 500 });
  }
}

