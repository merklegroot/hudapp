import { NextRequest, NextResponse } from 'next/server';
import { spawn } from 'child_process';

export async function POST(request: NextRequest) {
  try {
    const { action, version = '3.12' } = await request.json();
    
    if (action === 'install') {
      // Handle pip installation separately
      if (version === 'pip') {
        // Forward to pip installation endpoint
        const pipResponse = await fetch(`${request.nextUrl.origin}/api/python/install-pip`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'install' })
        });
        
        if (!pipResponse.ok) {
          throw new Error('Failed to install pip');
        }
        
        // Stream the response back
        return new Response(pipResponse.body, {
          headers: pipResponse.headers
        });
      }
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
            sendMessage('output', `Starting Python ${version} installation...\r\n`);

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
                installArgs = ['apt', 'update', '&&', 'sudo', 'apt', 'install', '-y', `python${version}`, `python${version}-pip`, `python${version}-venv`, `python${version}-dev`];
              } else if (distro.includes('fedora') || distro.includes('rhel') || distro.includes('centos')) {
                sendMessage('output', 'Using dnf/yum package manager...\r\n');
                installCommand = 'sudo';
                installArgs = ['dnf', 'install', '-y', `python${version}`, `python${version}-pip`, `python${version}-devel`];
              } else if (distro.includes('arch')) {
                sendMessage('output', 'Using pacman package manager...\r\n');
                installCommand = 'sudo';
                installArgs = ['pacman', '-S', '--noconfirm', 'python', 'python-pip'];
              } else if (distro.includes('opensuse')) {
                sendMessage('output', 'Using zypper package manager...\r\n');
                installCommand = 'sudo';
                installArgs = ['zypper', 'install', '-y', `python${version.replace('.', '')}`, `python${version.replace('.', '')}-pip`];
              } else {
                // Fallback: try to build from source using pyenv
                sendMessage('output', 'Unknown distribution, attempting to install via pyenv...\r\n');
                installPythonViaSource(controller, encoder, sendMessage, version);
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
                  sendMessage('success', `Python ${version} installation completed successfully!\r\n`);
                  sendMessage('output', 'Verifying installation...\r\n');
                  
                  // Verify the installation
                  const verifyProcess = spawn('bash', ['-c', `python${version} --version && python${version} -m pip --version`]);
                  
                  verifyProcess.stdout.on('data', (data) => {
                    sendMessage('output', `Verification: ${data.toString()}`);
                  });
                  
                  verifyProcess.stderr.on('data', (data) => {
                    sendMessage('output', `Verification: ${data.toString()}`);
                  });
                  
                  verifyProcess.on('close', (verifyCode) => {
                    if (verifyCode === 0) {
                      sendMessage('success', 'Python installation verified successfully!\r\n');
                      sendMessage('output', 'You can now use Python with the following commands:\r\n');
                      sendMessage('output', `python${version} --version\r\n`);
                      sendMessage('output', `python${version} -m pip --version\r\n`);
                      sendMessage('output', `python${version} -m venv myenv  # Create virtual environment\r\n`);
                    } else {
                      sendMessage('error', 'Installation completed but verification failed\r\n');
                    }
                    controller.close();
                  });
                } else {
                  sendMessage('error', `Installation failed with exit code: ${installCode}\r\n`);
                  sendMessage('output', 'You may need to run this with appropriate permissions or check your package manager configuration.\r\n');
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
    console.error('Installation error:', error);
    return NextResponse.json({ error: 'Installation failed' }, { status: 500 });
  }
}

function installPythonViaSource(controller: ReadableStreamDefaultController, encoder: TextEncoder, sendMessage: (type: string, content: string) => void, version: string) {
  sendMessage('output', 'Installing pyenv (Python version manager)...\r\n');
  
  // Install pyenv and Python from source
  const pyenvInstallProcess = spawn('bash', ['-c', `
    # Install pyenv if not already installed
    if ! command -v pyenv &> /dev/null; then
      curl https://pyenv.run | bash
      export PATH="$HOME/.pyenv/bin:$PATH"
      eval "$(pyenv init --path)"
      eval "$(pyenv init -)"
    fi
    
    # Install Python version
    export PATH="$HOME/.pyenv/bin:$PATH"
    eval "$(pyenv init --path)"
    eval "$(pyenv init -)"
    
    pyenv install ${version}
    pyenv global ${version}
    
    # Verify installation
    python --version
    pip --version
  `]);

  pyenvInstallProcess.stdout.on('data', (data) => {
    sendMessage('output', data.toString());
  });

  pyenvInstallProcess.stderr.on('data', (data) => {
    sendMessage('output', data.toString());
  });

  pyenvInstallProcess.on('close', (code) => {
    if (code === 0) {
      sendMessage('success', `Python ${version} installed successfully via pyenv!\r\n`);
      sendMessage('output', 'Add the following to your ~/.bashrc or ~/.zshrc:\r\n');
      sendMessage('output', 'export PATH="$HOME/.pyenv/bin:$PATH"\r\n');
      sendMessage('output', 'eval "$(pyenv init --path)"\r\n');
      sendMessage('output', 'eval "$(pyenv init -)"\r\n');
    } else {
      sendMessage('error', `pyenv installation failed with exit code: ${code}\r\n`);
    }
    controller.close();
  });
}
