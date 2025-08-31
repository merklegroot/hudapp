import { NextRequest, NextResponse } from 'next/server';
import { spawn } from 'child_process';

export async function POST(request: NextRequest) {
  try {
    const { action } = await request.json();
    
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
            sendMessage('output', `Installing pip (Python package manager)...\r\n`);
            sendMessage('output', `This will install python3-pip via your system package manager.\r\n\r\n`);

            // Detect distribution and use appropriate package manager
            const detectDistroProcess = spawn('bash', ['-c', 'cat /etc/os-release | grep ^ID= | cut -d= -f2 | tr -d \'"\'']);
            
            let distroOutput = '';
            detectDistroProcess.stdout.on('data', (data) => {
              distroOutput += data.toString();
            });

            detectDistroProcess.on('close', (code) => {
              const distro = distroOutput.trim().toLowerCase();
              sendMessage('output', `Detected distribution: ${distro}\r\n`);

              let installCommand: string;
              let installArgs: string[];

              // Choose installation method based on distribution
              if (distro.includes('ubuntu') || distro.includes('debian')) {
                sendMessage('output', 'Using apt package manager...\r\n');
                installCommand = 'sudo';
                installArgs = ['apt', 'update', '&&', 'sudo', 'apt', 'install', '-y', 'python3-pip'];
              } else if (distro.includes('fedora') || distro.includes('rhel') || distro.includes('centos')) {
                sendMessage('output', 'Using dnf package manager...\r\n');
                installCommand = 'sudo';
                installArgs = ['dnf', 'install', '-y', 'python3-pip'];
              } else if (distro.includes('arch')) {
                sendMessage('output', 'Using pacman package manager...\r\n');
                installCommand = 'sudo';
                installArgs = ['pacman', '-S', '--noconfirm', 'python-pip'];
              } else if (distro.includes('opensuse')) {
                sendMessage('output', 'Using zypper package manager...\r\n');
                installCommand = 'sudo';
                installArgs = ['zypper', 'install', '-y', 'python3-pip'];
              } else {
                // Fallback: try to install via get-pip.py
                sendMessage('output', 'Unknown distribution, attempting to install via get-pip.py...\r\n');
                installPipViaGetPip(controller, encoder, sendMessage);
                return;
              }

              // Run the package manager installation
              const installProcess = spawn('bash', ['-c', `${installCommand} ${installArgs.join(' ')}`], {
                env: { ...process.env }
              });

              installProcess.stdout.on('data', (data) => {
                sendMessage('output', data.toString());
              });

              installProcess.stderr.on('data', (data) => {
                sendMessage('output', data.toString());
              });

              installProcess.on('close', (installCode) => {
                if (installCode === 0) {
                  sendMessage('success', `pip installation completed successfully!\r\n`);
                  sendMessage('output', 'Verifying installation...\r\n');
                  
                  // Verify the installation
                  const verifyProcess = spawn('bash', ['-c', `pip3 --version && pip --version`]);
                  
                  verifyProcess.stdout.on('data', (data) => {
                    sendMessage('output', `Verification: ${data.toString()}`);
                  });
                  
                  verifyProcess.stderr.on('data', (data) => {
                    sendMessage('output', `Verification: ${data.toString()}`);
                  });
                  
                  verifyProcess.on('close', (verifyCode) => {
                    if (verifyCode === 0) {
                      sendMessage('success', 'pip installation verified successfully!\r\n');
                      sendMessage('output', 'You can now install Python packages with:\r\n');
                      sendMessage('output', `pip3 install package_name\r\n`);
                      sendMessage('output', `pip install package_name\r\n`);
                    } else {
                      sendMessage('error', 'Installation completed but verification had issues\r\n');
                      sendMessage('output', 'Try running: pip3 --version\r\n');
                    }
                    controller.close();
                  });
                } else {
                  sendMessage('error', `pip installation failed with exit code: ${installCode}\r\n`);
                  sendMessage('output', 'You may need to run this with appropriate permissions or check your package manager configuration.\r\n');
                  sendMessage('output', 'Manual installation: sudo apt install python3-pip\r\n');
                  controller.close();
                }
              });
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
    console.error('pip installation error:', error);
    return NextResponse.json({ error: 'pip installation failed' }, { status: 500 });
  }
}

function installPipViaGetPip(controller: ReadableStreamDefaultController, encoder: TextEncoder, sendMessage: (type: string, content: string) => void) {
  sendMessage('output', 'Downloading get-pip.py installation script...\r\n');
  
  // Install pip via get-pip.py
  const getPipProcess = spawn('bash', ['-c', `
    # Download get-pip.py
    curl -s https://bootstrap.pypa.io/get-pip.py -o get-pip.py
    
    # Install pip
    python3 get-pip.py --user
    
    # Clean up
    rm -f get-pip.py
    
    # Verify installation
    python3 -m pip --version
  `]);

  getPipProcess.stdout.on('data', (data) => {
    sendMessage('output', data.toString());
  });

  getPipProcess.stderr.on('data', (data) => {
    sendMessage('output', data.toString());
  });

  getPipProcess.on('close', (code) => {
    if (code === 0) {
      sendMessage('success', `pip installed successfully via get-pip.py!\r\n`);
      sendMessage('output', 'pip has been installed to your user directory.\r\n');
      sendMessage('output', 'You can now use: python3 -m pip install package_name\r\n');
      sendMessage('output', 'Add ~/.local/bin to your PATH to use pip3 directly.\r\n');
    } else {
      sendMessage('error', `get-pip.py installation failed with exit code: ${code}\r\n`);
      sendMessage('output', 'Please install pip manually:\r\n');
      sendMessage('output', 'wget https://bootstrap.pypa.io/get-pip.py\r\n');
      sendMessage('output', 'python3 get-pip.py --user\r\n');
    }
    controller.close();
  });
}
