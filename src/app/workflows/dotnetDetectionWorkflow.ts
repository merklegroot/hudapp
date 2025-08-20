import { spawn, ChildProcess } from 'child_process';

interface DotnetDetectionResult {
  inPath: boolean;
  version?: string;
  sdks?: string[];
  runtimes?: string[];
}

/** Uses a fresh login shell to detect if dotnet is available (similar to spawnAndGetPathWorkflow) */
async function detectDotnetInFreshShell(): Promise<DotnetDetectionResult> {
  return new Promise((resolve) => {
    // Detect the platform and use appropriate terminal/shell
    const isWindows = process.platform === 'win32';
    
    let command: string;
    let args: string[];
    
    if (isWindows) {
      // Windows: Use cmd.exe or PowerShell
      command = 'cmd';
      args = ['/c', 'dotnet --version 2>nul && echo "---SEPARATOR---" && dotnet --list-sdks 2>nul && echo "---SEPARATOR---" && dotnet --list-runtimes 2>nul'];
    } else {
      // Unix-like systems: Use bash with login shell to get full user environment
      command = 'bash';
      args = ['-l', '-c', 'dotnet --version 2>/dev/null && echo "---SEPARATOR---" && dotnet --list-sdks 2>/dev/null && echo "---SEPARATOR---" && dotnet --list-runtimes 2>/dev/null'];
    }
    
    console.log(`Spawning terminal for dotnet detection: ${command} ${args.join(' ')}`);
    
    // Spawn the process
    const child: ChildProcess = spawn(command, args, {
      stdio: ['pipe', 'pipe', 'pipe'],
      env: process.env, // Use current environment instead of empty object
      shell: false,
      detached: false
    });
    
    let stdout = '';
    let stderr = '';
    
    // Collect stdout data
    child.stdout?.on('data', (data: Buffer) => {
      stdout += data.toString();
    });
    
    // Collect stderr data
    child.stderr?.on('data', (data: Buffer) => {
      stderr += data.toString();
    });
    
    // Handle process completion
    child.on('close', (code: number | null) => {
      if (code === 0 && stdout.trim()) {
        // Parse the output
        const parts = stdout.split('---SEPARATOR---');
        const version = parts[0]?.trim();
        const sdksOutput = parts[1]?.trim();
        const runtimesOutput = parts[2]?.trim();
        
        const sdks = sdksOutput
          ? sdksOutput.split('\n').filter(line => line.trim()).map(line => line.trim())
          : [];
          
        const runtimes = runtimesOutput
          ? runtimesOutput.split('\n').filter(line => line.trim()).map(line => line.trim())
          : [];
        
        console.log(`Fresh shell dotnet detection succeeded - version: ${version}`);
        resolve({
          inPath: true,
          version,
          sdks,
          runtimes
        });
      } else {
        // dotnet not found in PATH
        console.log(`Fresh shell dotnet detection failed - code: ${code}, stderr: ${stderr}`);
        resolve({
          inPath: false
        });
      }
    });
    
    // Handle process errors
    child.on('error', (error: Error) => {
      console.error('Failed to spawn terminal process for dotnet detection:', error);
      resolve({
        inPath: false
      });
    });
    
    // Set a timeout to prevent hanging
    const timeout = setTimeout(() => {
      console.log('Dotnet detection process timeout, killing...');
      child.kill('SIGKILL');
      resolve({
        inPath: false
      });
    }, 10000); // 10 second timeout
    
    // Clear timeout when process completes
    child.on('close', () => {
      clearTimeout(timeout);
    });
  });
}

/** Alternative method with fallback approaches */
async function detectDotnetWithFallback(): Promise<DotnetDetectionResult> {
  const methods = [
    // Method 1: Direct bash login shell
    () => detectDotnetInFreshShell(),
    
    // Method 2: Use su to get fresh user environment
    () => new Promise<DotnetDetectionResult>((resolve) => {
      const user = process.env.USER || 'goose';
      const child = spawn('su', ['-', user, '-c', 'dotnet --version 2>/dev/null'], {
        stdio: ['pipe', 'pipe', 'pipe']
      });
      
      let stdout = '';
      child.stdout?.on('data', (data) => stdout += data.toString());
      child.on('close', (code) => {
        if (code === 0 && stdout.trim()) {
          resolve({ inPath: true, version: stdout.trim() });
        } else {
          resolve({ inPath: false });
        }
      });
      child.on('error', () => resolve({ inPath: false }));
    }),
    
    // Method 3: Use env -i for clean environment
    () => new Promise<DotnetDetectionResult>((resolve) => {
      const child = spawn('env', ['-i', 'bash', '-l', '-c', 'dotnet --version 2>/dev/null'], {
        stdio: ['pipe', 'pipe', 'pipe']
      });
      
      let stdout = '';
      child.stdout?.on('data', (data) => stdout += data.toString());
      child.on('close', (code) => {
        if (code === 0 && stdout.trim()) {
          resolve({ inPath: true, version: stdout.trim() });
        } else {
          resolve({ inPath: false });
        }
      });
      child.on('error', () => resolve({ inPath: false }));
    })
  ];
  
  // Try each method until one succeeds or we find dotnet is not in PATH
  for (let i = 0; i < methods.length; i++) {
    try {
      console.log(`Trying dotnet detection method ${i + 1}...`);
      const result = await methods[i]();
      if (result.inPath) {
        console.log(`Dotnet detection method ${i + 1} succeeded`);
        return result;
      }
    } catch (error) {
      console.log(`Dotnet detection method ${i + 1} failed:`, error);
    }
  }
  
  // All methods failed or didn't find dotnet in PATH
  return { inPath: false };
}

export const dotnetDetectionWorkflow = {
  detectDotnetInFreshShell,
  detectDotnetWithFallback
};
