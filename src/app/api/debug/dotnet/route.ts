import { NextRequest } from 'next/server';
import { SSEStreamingResponse } from '@/app/types/SSEResponse';
import { SSEEventData } from '@/app/types/sse';
import { spawnAndGetDataWorkflow } from '../../../workflows/spawnAndGetDataWorkflow';
import { sseTerminalHandlerFactory } from '../../../workflows/sseTerminalHandlerFactory';
import { existsSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';

// Common .NET installation paths to scan
const COMMON_DOTNET_PATHS = [
  join(homedir(), '.dotnet'),
  '/usr/share/dotnet',
  '/opt/dotnet',
  '/usr/local/share/dotnet',
  '/snap/dotnet-sdk/current',
  '/snap/dotnet-runtime/current',
  '/usr/local/bin',
  '/opt/microsoft/dotnet',
  '/var/lib/snapd/snap/dotnet-sdk/current',
  '/var/lib/snapd/snap/dotnet-runtime/current'
];

// Create a comprehensive .NET scanning workflow
const comprehensiveDotnetScanWorkflow = async (dataCallback?: (data: string) => void) => {
  let allOutput = '';
  
  // Step 1: Check PATH
  if (dataCallback) {
    dataCallback('$ which dotnet\n');
  }

  const pathResult = await spawnAndGetDataWorkflow.execute({
    command: 'bash',
    args: ['-c', 'which dotnet'],
    timeout: 10000
  });

  if (dataCallback) {
    if (pathResult.success && pathResult.stdout.trim()) {
      dataCallback(pathResult.stdout + '\n');
      allOutput += `PATH: ${pathResult.stdout.trim()}\n`;
    } else {
      dataCallback('.NET not found in PATH\n');
      allOutput += 'PATH: not found\n';
    }
  }

  // Step 2: Check common installation directories
  if (dataCallback) {
    dataCallback('$ Scanning common .NET installation directories...\n');
  }

  const foundInstallations: string[] = [];
  
  for (const dotnetPath of COMMON_DOTNET_PATHS) {
    const dotnetExecutable = join(dotnetPath, 'dotnet');
    
    if (existsSync(dotnetExecutable)) {
      foundInstallations.push(dotnetPath);
      
      if (dataCallback) {
        dataCallback(`Found: ${dotnetPath}\n`);
      }
      allOutput += `FOUND: ${dotnetPath}\n`;
      
      // Try to get version info for this installation
      try {
        const versionResult = await spawnAndGetDataWorkflow.execute({
          command: dotnetExecutable,
          args: ['--version'],
          timeout: 5000
        });
        
        if (versionResult.success && versionResult.stdout.trim()) {
          const version = versionResult.stdout.trim();
          if (dataCallback) {
            dataCallback(`  Version: ${version}\n`);
          }
          allOutput += `  VERSION: ${version}\n`;
        }
      } catch (error) {
        if (dataCallback) {
          dataCallback(`  Version check failed\n`);
        }
        allOutput += `  VERSION: check failed\n`;
      }

      // Get SDKs for this installation
      try {
        if (dataCallback) {
          dataCallback(`  Checking SDKs...\n`);
        }
        const sdkResult = await spawnAndGetDataWorkflow.execute({
          command: dotnetExecutable,
          args: ['--list-sdks'],
          timeout: 5000
        });
        
        if (sdkResult.success && sdkResult.stdout.trim()) {
          const sdkLines = sdkResult.stdout.trim().split('\n').filter(line => line.trim());
          if (dataCallback) {
            dataCallback(`  Found ${sdkLines.length} SDK(s)\n`);
          }
          allOutput += `  SDKS: ${sdkLines.length}\n`;
          sdkLines.forEach(sdk => {
            allOutput += `    SDK: ${sdk.trim()}\n`;
          });
        } else {
          if (dataCallback) {
            dataCallback(`  No SDKs found\n`);
          }
          allOutput += `  SDKS: 0\n`;
        }
      } catch (error) {
        if (dataCallback) {
          dataCallback(`  SDK check failed\n`);
        }
        allOutput += `  SDKS: check failed\n`;
      }

      // Get Runtimes for this installation
      try {
        if (dataCallback) {
          dataCallback(`  Checking Runtimes...\n`);
        }
        const runtimeResult = await spawnAndGetDataWorkflow.execute({
          command: dotnetExecutable,
          args: ['--list-runtimes'],
          timeout: 5000
        });
        
        if (runtimeResult.success && runtimeResult.stdout.trim()) {
          const runtimeLines = runtimeResult.stdout.trim().split('\n').filter(line => line.trim());
          if (dataCallback) {
            dataCallback(`  Found ${runtimeLines.length} Runtime(s)\n`);
          }
          allOutput += `  RUNTIMES: ${runtimeLines.length}\n`;
          runtimeLines.forEach(runtime => {
            allOutput += `    RUNTIME: ${runtime.trim()}\n`;
          });
        } else {
          if (dataCallback) {
            dataCallback(`  No Runtimes found\n`);
          }
          allOutput += `  RUNTIMES: 0\n`;
        }
      } catch (error) {
        if (dataCallback) {
          dataCallback(`  Runtime check failed\n`);
        }
        allOutput += `  RUNTIMES: check failed\n`;
      }
    } else {
      if (dataCallback) {
        dataCallback(`Not found: ${dotnetPath}\n`);
      }
      allOutput += `NOT_FOUND: ${dotnetPath}\n`;
    }
  }

  if (dataCallback) {
    dataCallback('Completed\n');
  }

  return {
    success: true,
    stdout: allOutput,
    stderr: '',
    exitCode: 0
  };
};

// Enhanced parser function for comprehensive .NET detection
const parseComprehensiveDotnetResult = (output: string, success: boolean, stderr?: string) => {
  const lines = output.split('\n').filter(line => line.trim());
  
  const installations: Array<{
    path: string;
    version?: string;
    type: 'path' | 'directory';
    sdks: string[];
    runtimes: string[];
  }> = [];
  
  let pathInstallation: string | null = null;
  let currentInstallation: any = null;
  
  // Parse the output
  for (const line of lines) {
    if (line.startsWith('PATH: ')) {
      const path = line.substring(6);
      if (path !== 'not found') {
        pathInstallation = path;
        currentInstallation = {
          path: path,
          type: 'path',
          sdks: [],
          runtimes: []
        };
        installations.push(currentInstallation);
      }
    } else if (line.startsWith('FOUND: ')) {
      const path = line.substring(7);
      currentInstallation = {
        path: path,
        type: 'directory',
        sdks: [],
        runtimes: []
      };
      installations.push(currentInstallation);
    } else if (line.startsWith('  VERSION: ')) {
      const version = line.substring(11);
      if (currentInstallation) {
        currentInstallation.version = version;
      }
    } else if (line.startsWith('    SDK: ')) {
      const sdk = line.substring(8);
      if (currentInstallation) {
        currentInstallation.sdks.push(sdk);
      }
    } else if (line.startsWith('    RUNTIME: ')) {
      const runtime = line.substring(12);
      if (currentInstallation) {
        currentInstallation.runtimes.push(runtime);
      }
    }
  }
  
  // Parse SDK and Runtime strings into structured objects
  interface SdkInfo {
    version: string;
    path: string;
  }

  interface RuntimeInfo {
    version: string;
    path: string;
    package: string;
  }

  interface InstallationInfo {
    path: string;
    version?: string;
    type: 'path' | 'directory';
    sdks: SdkInfo[];
    runtimes: RuntimeInfo[];
  }

  // Helper function to parse SDK string: "7.0.410 [/home/goose/.dotnet/sdk]"
  function parseSdkString(sdkString: string): SdkInfo {
    const trimmed = sdkString.trim();
    const match = trimmed.match(/^(.+?)\s+\[(.+)\]$/);
    if (match) {
      return {
        version: match[1],
        path: match[2]
      };
    }
    // Fallback if format is unexpected
    return {
      version: trimmed,
      path: ''
    };
  }

  // Helper function to parse Runtime string: "Microsoft.AspNetCore.App 7.0.20 [/home/goose/.dotnet/shared/Microsoft.AspNetCore.App]"
  function parseRuntimeString(runtimeString: string): RuntimeInfo {
    const trimmed = runtimeString.trim();
    const match = trimmed.match(/^(.+?)\s+(.+?)\s+\[(.+)\]$/);
    if (match) {
      return {
        package: match[1],
        version: match[2],
        path: match[3]
      };
    }
    // Fallback if format is unexpected
    return {
      package: trimmed,
      version: '',
      path: ''
    };
  }

  // Deduplicate installations that point to the same physical location
  // This handles cases where PATH points to an executable in a directory that's also scanned
  const deduplicatedInstallations: InstallationInfo[] = [];
  
  for (const installation of installations) {
    // Check if this installation is already represented by another one
    const existingIndex = deduplicatedInstallations.findIndex(existing => {
      // If one is the executable and the other is its parent directory, they're the same installation
      const existingDir = existing.path.endsWith('/dotnet') ? existing.path.replace('/dotnet', '') : existing.path;
      const currentDir = installation.path.endsWith('/dotnet') ? installation.path.replace('/dotnet', '') : installation.path;
      
      return existingDir === currentDir;
    });
    
    // Parse SDK and runtime strings into structured objects
    const parsedSdks = installation.sdks.map(parseSdkString);
    const parsedRuntimes = installation.runtimes.map(parseRuntimeString);
    
    if (existingIndex === -1) {
      // New installation - add it with parsed data
      let installationPath = installation.path;
      let installationType = installation.type;
      
      // If this is a PATH installation (executable), prefer the directory path for consistency
      if (installation.type === 'path' && installation.path.endsWith('/dotnet')) {
        installationPath = installation.path.replace('/dotnet', '');
        installationType = 'directory'; // Mark as directory since we're using the directory path
      }
      
      deduplicatedInstallations.push({
        path: installationPath,
        version: installation.version,
        type: installationType,
        sdks: parsedSdks,
        runtimes: parsedRuntimes
      });
    } else {
      // Merge with existing installation - combine SDKs and runtimes
      const existing = deduplicatedInstallations[existingIndex];
      
      // Merge SDKs (deduplicate by version)
      const existingSdkVersions = new Set(existing.sdks.map(sdk => sdk.version));
      const newSdks = parsedSdks.filter(sdk => !existingSdkVersions.has(sdk.version));
      existing.sdks = [...existing.sdks, ...newSdks];
      
      // Merge Runtimes (deduplicate by package + version)
      const existingRuntimeKeys = new Set(existing.runtimes.map(rt => `${rt.package}:${rt.version}`));
      const newRuntimes = parsedRuntimes.filter(rt => !existingRuntimeKeys.has(`${rt.package}:${rt.version}`));
      existing.runtimes = [...existing.runtimes, ...newRuntimes];
      
      // Use the version from whichever installation has it
      if (installation.version && !existing.version) {
        existing.version = installation.version;
      }
      
      // Prefer directory type over path type
      if (installation.type === 'directory' && existing.type === 'path') {
        existing.type = 'directory';
      }
    }
  }
  
  const totalFound = deduplicatedInstallations.length;
  const inPath = pathInstallation !== null;
  const totalSdks = deduplicatedInstallations.reduce((sum, inst) => sum + inst.sdks.length, 0);
  const totalRuntimes = deduplicatedInstallations.reduce((sum, inst) => sum + inst.runtimes.length, 0);
  
  return {
    dotnetDetected: totalFound > 0,
    totalInstallations: totalFound,
    totalSdks: totalSdks,
    totalRuntimes: totalRuntimes,
    inPath: inPath,
    pathInstallation: pathInstallation,
    installations: deduplicatedInstallations,
    status: totalFound > 0 ? 'found' : 'not_found',
    message: totalFound > 0 
      ? `Found ${totalFound} .NET installation${totalFound > 1 ? 's' : ''} with ${totalSdks} SDK${totalSdks !== 1 ? 's' : ''} and ${totalRuntimes} Runtime${totalRuntimes !== 1 ? 's' : ''}${inPath ? ' (in PATH)' : ' (not in PATH)'}`
      : '.NET is not installed in any common locations'
  };
};

// Use the enhanced factory with comprehensive scanning
export const GET = sseTerminalHandlerFactory({
  workflow: comprehensiveDotnetScanWorkflow,
  parseData: parseComprehensiveDotnetResult,
  customMessages: {
    executing: 'Scanning for .NET installations...',
    completed: '.NET scan completed',
    error: 'Failed to scan for .NET installations'
  }
}) as (request: NextRequest) => Promise<SSEStreamingResponse<SSEEventData>>;