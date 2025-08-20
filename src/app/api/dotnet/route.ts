import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import { existsSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';
import { dotnetDetectionWorkflow } from '@/app/workflows';

const execAsync = promisify(exec);

interface DotnetInfo {
  isInstalled: boolean;
  sdks: string[];
  runtimes: string[];
  inPath: boolean;
  detectedPath?: string;
  error?: string;
}

// Common dotnet installation paths
const COMMON_DOTNET_PATHS = [
  join(homedir(), '.dotnet'),
  '/usr/share/dotnet',
  '/opt/dotnet',
  '/usr/local/share/dotnet',
  '/snap/dotnet-sdk/current'
];

async function findDotnetInstallation(): Promise<{ path?: string; inPath: boolean; freshShellSdks?: string[]; freshShellRuntimes?: string[] }> {
  // First check if dotnet is in PATH using fresh shell (like PATH detection)
  try {
    const freshShellResult = await dotnetDetectionWorkflow.detectDotnetWithFallback();
    if (freshShellResult.inPath) {
      return { 
        inPath: true,
        freshShellSdks: freshShellResult.sdks,
        freshShellRuntimes: freshShellResult.runtimes
      };
    }
  } catch (error) {
    console.log('Fresh shell detection failed, falling back to current process detection:', error);
  }

  // Fallback: check in current process environment
  try {
    await execAsync('dotnet --version');
    return { inPath: true };
  } catch (error) {
    // Not in PATH, check common installation locations
    for (const dotnetPath of COMMON_DOTNET_PATHS) {
      const dotnetExecutable = join(dotnetPath, 'dotnet');
      if (existsSync(dotnetExecutable)) {
        return { path: dotnetPath, inPath: false };
      }
    }
    return { inPath: false };
  }
}

async function getDotnetInfo(dotnetPath?: string): Promise<{ sdks: string[]; runtimes: string[] }> {
  const dotnetCommand = dotnetPath ? join(dotnetPath, 'dotnet') : 'dotnet';
  
  const [sdkResult, runtimeResult] = await Promise.all([
    execAsync(`${dotnetCommand} --list-sdks`).catch(() => ({ stdout: '', stderr: 'Failed to list SDKs' })),
    execAsync(`${dotnetCommand} --list-runtimes`).catch(() => ({ stdout: '', stderr: 'Failed to list runtimes' }))
  ]);

  const sdks = sdkResult.stdout
    .split('\n')
    .filter(line => line.trim())
    .map(line => line.trim());

  const runtimes = runtimeResult.stdout
    .split('\n')
    .filter(line => line.trim())
    .map(line => line.trim());

  return { sdks, runtimes };
}

export async function GET(): Promise<NextResponse<DotnetInfo>> {
  try {
    const { path: detectedPath, inPath, freshShellSdks, freshShellRuntimes } = await findDotnetInstallation();
    
    if (!inPath && !detectedPath) {
      return NextResponse.json({
        isInstalled: false,
        sdks: [],
        runtimes: [],
        inPath: false,
        error: 'dotnet is not installed'
      });
    }

    try {
      // Use fresh shell results if available, otherwise fall back to current process detection
      let sdks: string[] = [];
      let runtimes: string[] = [];
      
      if (freshShellSdks && freshShellRuntimes) {
        // Use results from fresh shell (more accurate after profile changes)
        sdks = freshShellSdks;
        runtimes = freshShellRuntimes;
        console.log('Using fresh shell dotnet detection results');
      } else {
        // Fall back to current process detection
        const dotnetInfo = await getDotnetInfo(detectedPath);
        sdks = dotnetInfo.sdks;
        runtimes = dotnetInfo.runtimes;
        console.log('Using current process dotnet detection results');
      }
      
      return NextResponse.json({
        isInstalled: true,
        sdks,
        runtimes,
        inPath,
        detectedPath: detectedPath || undefined
      });
    } catch (error) {
      return NextResponse.json({
        isInstalled: true,
        sdks: [],
        runtimes: [],
        inPath,
        detectedPath: detectedPath || undefined,
        error: 'Failed to get dotnet information'
      });
    }

  } catch (error) {
    console.error('Error checking dotnet installation:', error);
    return NextResponse.json({
      isInstalled: false,
      sdks: [],
      runtimes: [],
      inPath: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    });
  }
}
