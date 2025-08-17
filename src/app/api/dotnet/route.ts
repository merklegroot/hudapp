import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

interface DotnetInfo {
  isInstalled: boolean;
  sdks: string[];
  runtimes: string[];
  error?: string;
}

export async function GET(): Promise<NextResponse<DotnetInfo>> {
  try {
    // Check if dotnet is installed by running 'dotnet --version'
    try {
      await execAsync('dotnet --version');
    } catch (error) {
      // dotnet is not installed
      return NextResponse.json({
        isInstalled: false,
        sdks: [],
        runtimes: [],
        error: 'dotnet is not installed'
      });
    }

    // If we get here, dotnet is installed, so get SDK and runtime info
    const [sdkResult, runtimeResult] = await Promise.all([
      execAsync('dotnet --list-sdks').catch(() => ({ stdout: '', stderr: 'Failed to list SDKs' })),
      execAsync('dotnet --list-runtimes').catch(() => ({ stdout: '', stderr: 'Failed to list runtimes' }))
    ]);

    const sdks = sdkResult.stdout
      .split('\n')
      .filter(line => line.trim())
      .map(line => line.trim());

    const runtimes = runtimeResult.stdout
      .split('\n')
      .filter(line => line.trim())
      .map(line => line.trim());

    return NextResponse.json({
      isInstalled: true,
      sdks,
      runtimes
    });

  } catch (error) {
    console.error('Error checking dotnet installation:', error);
    return NextResponse.json({
      isInstalled: false,
      sdks: [],
      runtimes: [],
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    });
  }
}
