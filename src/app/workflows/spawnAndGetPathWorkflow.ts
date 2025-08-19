
import { spawn } from 'child_process';
import { promisify } from 'util';

/** Opens a new console/terminal instance and gets the actual user PATH */
async function execute(): Promise<string> {
  return new Promise((resolve, reject) => {
    // Detect the platform and use appropriate terminal/shell
    const isWindows = process.platform === 'win32';
    
    let command: string;
    let args: string[];
    
    if (isWindows) {
      // Windows: Use cmd.exe or PowerShell
      command = 'cmd';
      args = ['/c', 'echo %PATH%'];
    } else {
      // Unix-like systems: Use bash with login shell to get full user environment
      command = 'bash';
      args = ['-l', '-c', 'echo $PATH'];
    }
    
    console.log(`Spawning terminal: ${command} ${args.join(' ')}`);
    
    // Spawn the process
    const child = spawn(command, args, {
      stdio: ['pipe', 'pipe', 'pipe'],
      env: {}, // Start with empty environment to get clean user environment
      shell: false,
      detached: false
    });
    
    let stdout = '';
    let stderr = '';
    
    // Collect stdout data
    child.stdout?.on('data', (data) => {
      stdout += data.toString();
    });
    
    // Collect stderr data
    child.stderr?.on('data', (data) => {
      stderr += data.toString();
    });
    
    // Handle process completion
    child.on('close', (code) => {
      if (code === 0) {
        const path = stdout.trim();
        console.log(`Terminal PATH result: ${path.substring(0, 100)}...`);
        resolve(path);
      } else {
        console.error(`Terminal process exited with code ${code}`);
        console.error(`stderr: ${stderr}`);
        reject(new Error(`Terminal process failed with code ${code}: ${stderr}`));
      }
    });
    
    // Handle process errors
    child.on('error', (error) => {
      console.error('Failed to spawn terminal process:', error);
      reject(error);
    });
    
    // Set a timeout to prevent hanging
    const timeout = setTimeout(() => {
      console.log('Terminal process timeout, killing...');
      child.kill('SIGKILL');
      reject(new Error('Terminal process timed out'));
    }, 10000); // 10 second timeout
    
    // Clear timeout when process completes
    child.on('close', () => {
      clearTimeout(timeout);
    });
  });
}

/** Alternative method using different terminal approaches */
async function executeWithFallback(): Promise<string> {
  const methods = [
    // Method 1: Direct bash login shell
    () => execute(),
    
    // Method 2: Use su to get fresh user environment
    () => new Promise<string>((resolve, reject) => {
      const user = process.env.USER || 'goose';
      const child = spawn('su', ['-', user, '-c', 'echo $PATH'], {
        stdio: ['pipe', 'pipe', 'pipe']
      });
      
      let stdout = '';
      child.stdout?.on('data', (data) => stdout += data.toString());
      child.on('close', (code) => {
        if (code === 0) resolve(stdout.trim());
        else reject(new Error(`su command failed with code ${code}`));
      });
      child.on('error', reject);
    }),
    
    // Method 3: Use env -i for clean environment
    () => new Promise<string>((resolve, reject) => {
      const child = spawn('env', ['-i', 'bash', '-l', '-c', 'echo $PATH'], {
        stdio: ['pipe', 'pipe', 'pipe']
      });
      
      let stdout = '';
      child.stdout?.on('data', (data) => stdout += data.toString());
      child.on('close', (code) => {
        if (code === 0) resolve(stdout.trim());
        else reject(new Error(`env command failed with code ${code}`));
      });
      child.on('error', reject);
    })
  ];
  
  // Try each method until one succeeds
  for (let i = 0; i < methods.length; i++) {
    try {
      console.log(`Trying terminal method ${i + 1}...`);
      const result = await methods[i]();
      if (result && result.length > 0) {
        console.log(`Terminal method ${i + 1} succeeded`);
        return result;
      }
    } catch (error) {
      console.log(`Terminal method ${i + 1} failed:`, error);
      if (i === methods.length - 1) {
        throw error; // Re-throw if it's the last method
      }
    }
  }
  
  throw new Error('All terminal methods failed');
}

export const spawnAndGetPathWorkflow = {
  execute,
  executeWithFallback
};