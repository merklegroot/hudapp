
import { spawnAndGetDataWorkflow } from './spawnAndGetDataWorkflow';

/** Opens a new console/terminal instance and gets the actual user PATH */
async function execute(): Promise<string> {
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
  
  const result = await spawnAndGetDataWorkflow.execute({
    command,
    args,
    timeout: 10000
  });
  
  if (result.success && result.stdout) {
    console.log(`Terminal PATH result: ${result.stdout.substring(0, 100)}...`);
    return result.stdout;
  } else {
    const error = new Error(`Terminal process failed with code ${result.exitCode}: ${result.stderr}`);
    console.error('Failed to get PATH:', error);
    throw error;
  }
}

/** Alternative method using different terminal approaches */
async function executeWithFallback(): Promise<string> {
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
  
  const result = await spawnAndGetDataWorkflow.executeWithFallback({
    command,
    args,
    timeout: 10000
  });
  
  if (result.success && result.stdout) {
    console.log(`Terminal PATH result: ${result.stdout.substring(0, 100)}...`);
    return result.stdout;
  } else {
    const error = new Error(`All terminal methods failed: ${result.stderr}`);
    console.error('Failed to get PATH with fallback:', error);
    throw error;
  }
}

export const spawnAndGetPathWorkflow = {
  execute,
  executeWithFallback
};