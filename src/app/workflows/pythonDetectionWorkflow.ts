import { spawnAndGetDataWorkflow } from './spawnAndGetDataWorkflow';

interface PythonDetectionResult {
  inPath: boolean;
  version?: string;
  pipVersion?: string;
  packages?: string[];
}

/** Uses a fresh login shell to detect if python is available (similar to dotnetDetectionWorkflow) */
async function detectPythonInFreshShell(): Promise<PythonDetectionResult> {
  // Detect the platform and use appropriate terminal/shell
  const isWindows = process.platform === 'win32';
  
  let command: string;
  let args: string[];
  
  if (isWindows) {
    // Windows: Use cmd.exe or PowerShell
    command = 'cmd';
    args = ['/c', 'python --version 2>nul && echo "---SEPARATOR---" && pip --version 2>nul && echo "---SEPARATOR---" && pip list --format=freeze 2>nul'];
  } else {
    // Unix-like systems: Use bash with login shell to get full user environment
    command = 'bash';
    args = ['-l', '-c', 'python3 --version 2>/dev/null || python --version 2>/dev/null && echo "---SEPARATOR---" && pip3 --version 2>/dev/null || pip --version 2>/dev/null && echo "---SEPARATOR---" && (pip3 list --format=freeze 2>/dev/null || pip list --format=freeze 2>/dev/null) | head -50'];
  }
  
  const result = await spawnAndGetDataWorkflow.execute({
    command,
    args,
    timeout: 15000
  });
  
  if (result.success && result.stdout.trim()) {
    // Parse the output
    const parts = result.stdout.split('---SEPARATOR---');
    const version = parts[0]?.trim();
    const pipVersion = parts[1]?.trim();
    const packagesOutput = parts[2]?.trim();
    
    const packages = packagesOutput
      ? packagesOutput.split('\n').filter(line => line.trim() && !line.includes('WARNING')).map(line => line.trim()).slice(0, 50)
      : [];
    
    console.log(`Fresh shell python detection succeeded - version: ${version}`);
    return {
      inPath: true,
      version,
      pipVersion,
      packages
    };
  } else {
    // python not found in PATH
    console.log(`Fresh shell python detection failed - code: ${result.exitCode}, stderr: ${result.stderr}`);
    return {
      inPath: false
    };
  }
}

/** Alternative method with fallback approaches */
async function detectPythonWithFallback(): Promise<PythonDetectionResult> {
  // Detect the platform and use appropriate terminal/shell
  const isWindows = process.platform === 'win32';
  
  let command: string;
  let args: string[];
  
  if (isWindows) {
    // Windows: Use cmd.exe or PowerShell
    command = 'cmd';
    args = ['/c', 'python --version 2>nul && echo "---SEPARATOR---" && pip --version 2>nul && echo "---SEPARATOR---" && pip list --format=freeze 2>nul'];
  } else {
    // Unix-like systems: Use bash with login shell to get full user environment
    command = 'bash';
    args = ['-l', '-c', 'python3 --version 2>/dev/null || python --version 2>/dev/null && echo "---SEPARATOR---" && pip3 --version 2>/dev/null || pip --version 2>/dev/null && echo "---SEPARATOR---" && (pip3 list --format=freeze 2>/dev/null || pip list --format=freeze 2>/dev/null) | head -50'];
  }
  
  const result = await spawnAndGetDataWorkflow.executeWithFallback({
    command,
    args,
    timeout: 15000
  });
  
  if (result.success && result.stdout.trim()) {
    // Parse the output
    const parts = result.stdout.split('---SEPARATOR---');
    const version = parts[0]?.trim();
    const pipVersion = parts[1]?.trim();
    const packagesOutput = parts[2]?.trim();
    
    const packages = packagesOutput
      ? packagesOutput.split('\n').filter(line => line.trim() && !line.includes('WARNING')).map(line => line.trim()).slice(0, 50)
      : [];
    
    console.log(`Fresh shell python detection with fallback succeeded - version: ${version}`);
    return {
      inPath: true,
      version,
      pipVersion,
      packages
    };
  } else {
    // All methods failed or didn't find python in PATH
    console.log(`All python detection methods failed: ${result.stderr}`);
    return { inPath: false };
  }
}

export const pythonDetectionWorkflow = {
  detectPythonInFreshShell,
  detectPythonWithFallback
};
