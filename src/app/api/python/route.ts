import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import { existsSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';
import { pythonDetectionWorkflow } from '@/app/workflows';

const execAsync = promisify(exec);

interface PythonInfo {
  isInstalled: boolean;
  version?: string;
  pipVersion?: string;
  packages: string[];
  inPath: boolean;
  detectedPath?: string;
  pythonExecutable?: string;
  python2Info?: {
    available: boolean;
    version?: string;
    path?: string;
  };
  pipInfo?: {
    pip3Available: boolean;
    pip3Version?: string;
    pip3Path?: string;
    pipAvailable: boolean;
    pipVersion?: string;
    pipPath?: string;
  };
  allFoundPaths?: string[];
  error?: string;
}

// Common Python installation paths
const COMMON_PYTHON_PATHS = [
  '/usr/bin/python3',
  '/usr/bin/python',
  '/usr/local/bin/python3',
  '/usr/local/bin/python',
  '/opt/python/bin/python3',
  join(homedir(), '.local/bin/python3'),
  join(homedir(), '.pyenv/shims/python3'),
  '/snap/python3/current/bin/python3',
  '/usr/bin/python3.13',
  '/usr/bin/python3.12',
  '/usr/bin/python3.11',
  '/usr/bin/python3.10',
  '/usr/bin/python3.9'
];

async function findPythonInstallation(): Promise<{ path?: string; executable?: string; inPath: boolean; freshShellVersion?: string; freshShellPipVersion?: string; freshShellPackages?: string[]; allFoundPaths?: string[] }> {
  // Always check for all available Python installations
  const foundPaths: string[] = [];
  for (const pythonPath of COMMON_PYTHON_PATHS) {
    if (existsSync(pythonPath)) {
      foundPaths.push(pythonPath);
    }
  }
  
  // First check if python is in PATH using fresh shell (like PATH detection)
  try {
    const freshShellResult = await pythonDetectionWorkflow.detectPythonWithFallback();
    if (freshShellResult.inPath) {
      return { 
        inPath: true,
        freshShellVersion: freshShellResult.version,
        freshShellPipVersion: freshShellResult.pipVersion,
        freshShellPackages: freshShellResult.packages,
        allFoundPaths: foundPaths
      };
    }
  } catch (error) {
    console.log('Fresh shell detection failed, falling back to current process detection:', error);
  }

  // Fallback: check in current process environment
  try {
    // Try python3 first, then python
    let pythonCmd = 'python3';
    try {
      await execAsync('python3 --version');
    } catch {
      await execAsync('python --version');
      pythonCmd = 'python';
    }
    return { inPath: true, executable: pythonCmd, allFoundPaths: foundPaths };
  } catch (error) {
    // Not in PATH, use first found installation if available
    const firstFoundPath = foundPaths[0];
    
    if (firstFoundPath) {
      return { 
        path: firstFoundPath, 
        executable: firstFoundPath, 
        inPath: false, 
        allFoundPaths: foundPaths 
      };
    }
    
    return { inPath: false, allFoundPaths: foundPaths };
  }
}

async function getPythonInfo(pythonExecutable?: string): Promise<{ version?: string; pipVersion?: string; packages: string[] }> {
  const pythonCommand = pythonExecutable || 'python3';
  
  try {
    // Get Python version
    const versionResult = await execAsync(`${pythonCommand} --version`).catch(() => ({ stdout: '', stderr: 'Failed to get version' }));
    const version = versionResult.stdout.trim();

    // Get pip version
    const pipCommand = pythonCommand === 'python3' ? 'pip3' : 'pip';
    const pipVersionResult = await execAsync(`${pipCommand} --version`).catch(() => ({ stdout: '', stderr: 'Failed to get pip version' }));
    const pipVersion = pipVersionResult.stdout.trim();

    // Get installed packages (limit to 50 to avoid huge responses)
    const packagesResult = await execAsync(`${pipCommand} list --format=freeze`).catch(() => ({ stdout: '', stderr: 'Failed to list packages' }));
    const packages = packagesResult.stdout
      .split('\n')
      .filter(line => line.trim() && !line.includes('WARNING'))
      .map(line => line.trim())
      .slice(0, 50); // Limit to first 50 packages

    return { version, pipVersion, packages };
  } catch (error) {
    console.error('Error getting Python info:', error);
    return { packages: [] };
  }
}

async function checkPython2(): Promise<{ available: boolean; version?: string; path?: string }> {
  try {
    // Try to run 'python --version' to see what it does
    const versionResult = await execAsync('python --version 2>&1');
    const version = versionResult.stdout.trim();
    
    // Check if we can find the path
    let path: string | undefined;
    try {
      const pathResult = await execAsync('which python');
      path = pathResult.stdout.trim();
    } catch {
      // which failed, but python command worked, so it exists somewhere
    }
    
    return {
      available: true,
      version: version || 'Unknown version',
      path
    };
  } catch (error) {
    // python command not available or failed
    return { available: false };
  }
}

async function checkPipCommands(): Promise<{
  pip3Available: boolean;
  pip3Version?: string;
  pip3Path?: string;
  pipAvailable: boolean;
  pipVersion?: string;
  pipPath?: string;
}> {
  const result = {
    pip3Available: false,
    pip3Version: undefined as string | undefined,
    pip3Path: undefined as string | undefined,
    pipAvailable: false,
    pipVersion: undefined as string | undefined,
    pipPath: undefined as string | undefined,
  };

  // Check pip3
  try {
    const pip3VersionResult = await execAsync('pip3 --version 2>&1');
    result.pip3Available = true;
    result.pip3Version = pip3VersionResult.stdout.trim();
    
    try {
      const pip3PathResult = await execAsync('which pip3');
      result.pip3Path = pip3PathResult.stdout.trim();
    } catch {
      // which failed, but pip3 command worked
    }
  } catch (error) {
    // pip3 command not available or failed
  }

  // Check pip
  try {
    const pipVersionResult = await execAsync('pip --version 2>&1');
    result.pipAvailable = true;
    result.pipVersion = pipVersionResult.stdout.trim();
    
    try {
      const pipPathResult = await execAsync('which pip');
      result.pipPath = pipPathResult.stdout.trim();
    } catch {
      // which failed, but pip command worked
    }
  } catch (error) {
    // pip command not available or failed
  }

  return result;
}

export async function GET(): Promise<NextResponse<PythonInfo>> {
  try {
    const { path: detectedPath, executable: pythonExecutable, inPath, freshShellVersion, freshShellPipVersion, freshShellPackages, allFoundPaths } = await findPythonInstallation();
    
    // Always check what 'python' command does (could be Python 2, Python 3, or nothing)
    const python2Info = await checkPython2();
    
    // Always check what pip and pip3 commands do
    const pipInfo = await checkPipCommands();
    
    if (!inPath && !detectedPath) {
      return NextResponse.json({
        isInstalled: false,
        packages: [],
        inPath: false,
        python2Info,
        pipInfo,
        allFoundPaths: allFoundPaths || [],
        error: 'Python is not installed'
      });
    }

    try {
      // Use fresh shell results if available, otherwise fall back to current process detection
      let version: string | undefined;
      let pipVersion: string | undefined;
      let packages: string[] = [];
      
      if (freshShellVersion && freshShellPackages) {
        // Use results from fresh shell (more accurate after profile changes)
        version = freshShellVersion;
        pipVersion = freshShellPipVersion;
        packages = freshShellPackages;
        console.log('Using fresh shell python detection results');
      } else {
        // Fall back to current process detection
        const pythonInfo = await getPythonInfo(pythonExecutable);
        version = pythonInfo.version;
        pipVersion = pythonInfo.pipVersion;
        packages = pythonInfo.packages;
        console.log('Using current process python detection results');
      }
      
      return NextResponse.json({
        isInstalled: true,
        version,
        pipVersion,
        packages,
        inPath,
        detectedPath: detectedPath || undefined,
        pythonExecutable: pythonExecutable || undefined,
        python2Info,
        pipInfo,
        allFoundPaths: allFoundPaths || []
      });
    } catch (error) {
      return NextResponse.json({
        isInstalled: true,
        packages: [],
        inPath,
        detectedPath: detectedPath || undefined,
        pythonExecutable: pythonExecutable || undefined,
        python2Info,
        pipInfo,
        allFoundPaths: allFoundPaths || [],
        error: 'Failed to get Python information'
      });
    }

  } catch (error) {
    console.error('Error checking Python installation:', error);
    return NextResponse.json({
      isInstalled: false,
      packages: [],
      inPath: false,
      python2Info: { available: false },
      pipInfo: { pip3Available: false, pipAvailable: false },
      allFoundPaths: [],
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { action } = await request.json();
    
    if (action === 'detect-distro') {
      try {
        // Detect Linux distribution
        const distroResult = await execAsync('cat /etc/os-release | grep ^ID= | cut -d= -f2 | tr -d \'"\'');
        const distro = distroResult.stdout.trim().toLowerCase();
        
        return NextResponse.json({ distro });
      } catch (error) {
        console.error('Failed to detect distribution:', error);
        return NextResponse.json({ distro: 'unknown' });
      }
    }
    
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json({ error: 'Request failed' }, { status: 500 });
  }
}
