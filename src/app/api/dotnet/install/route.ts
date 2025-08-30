import { NextRequest, NextResponse } from 'next/server';
import { spawn } from 'child_process';

export async function POST(request: NextRequest) {
  try {
    const { action, version = '8.0' } = await request.json();
    
    if (action === 'install') {
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
            sendMessage('output', `Starting .NET SDK ${version} installation...\r\n`);

            // Download the installation script
            const downloadProcess = spawn('wget', [
              'https://dot.net/v1/dotnet-install.sh',
              '-O',
              'dotnet-install.sh'
            ]);

            downloadProcess.stdout.on('data', (data) => {
              sendMessage('output', data.toString());
            });

            downloadProcess.stderr.on('data', (data) => {
              sendMessage('output', data.toString());
            });

            downloadProcess.on('close', (code) => {
              if (code === 0) {
                sendMessage('output', 'Download completed. Making script executable...\r\n');

                // Make script executable
                const chmodProcess = spawn('chmod', ['+x', './dotnet-install.sh']);
                
                chmodProcess.on('close', (chmodCode) => {
                  if (chmodCode === 0) {
                    sendMessage('output', `Starting .NET SDK ${version} installation...\r\n`);

                    // Run the installation script
                    const installProcess = spawn('./dotnet-install.sh', ['--channel', version], {
                      env: { ...process.env, DOTNET_ROOT: `${process.env.HOME}/.dotnet` }
                    });

                    installProcess.stdout.on('data', (data) => {
                      sendMessage('output', data.toString());
                    });

                    installProcess.stderr.on('data', (data) => {
                      sendMessage('output', data.toString());
                    });

                    installProcess.on('close', (installCode) => {
                      if (installCode === 0) {
                        sendMessage('success', `.NET SDK ${version} installation completed successfully!\r\n`);
                        sendMessage('output', 'Setting up environment variables...\r\n');
                        sendMessage('output', 'Add the following to your ~/.bashrc or ~/.profile:\r\n');
                        sendMessage('output', 'export DOTNET_ROOT=$HOME/.dotnet\r\n');
                        sendMessage('output', 'export PATH=$PATH:$DOTNET_ROOT:$DOTNET_ROOT/tools\r\n');
                      } else {
                        sendMessage('error', `Installation failed with exit code: ${installCode}\r\n`);
                      }
                      
                      // Clean up the downloaded script
                      spawn('rm', ['-f', 'dotnet-install.sh']);
                      controller.close();
                    });
                  } else {
                    sendMessage('error', `Failed to make script executable. Exit code: ${chmodCode}\r\n`);
                    controller.close();
                  }
                });
              } else {
                sendMessage('error', `Failed to download installation script. Exit code: ${code}\r\n`);
                controller.close();
              }
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
    console.error('Installation error:', error);
    return NextResponse.json({ error: 'Installation failed' }, { status: 500 });
  }
}
