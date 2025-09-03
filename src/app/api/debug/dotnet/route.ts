import { NextRequest } from 'next/server';
import { SSEStreamingResponse } from '@/app/types/SSEResponse';
import { SSEEventData } from '@/app/types/sse';
import { spawnAndGetDataWorkflow } from '../../../workflows/spawnAndGetDataWorkflow';
import { sseTerminalHandlerFactory } from '../../../workflows/sseTerminalHandlerFactory';

// Create a simple workflow wrapper for .NET detection
const dotnetDetectionWorkflow = async (dataCallback?: (data: string) => void) => {
  // Send command output to simulate terminal behavior
  if (dataCallback) {
    dataCallback('$ which dotnet\n');
  }

  const result = await spawnAndGetDataWorkflow.execute({
    command: 'bash',
    args: ['-c', 'which dotnet'],
    timeout: 15000
  });

  // Send output through callback for terminal display
  if (dataCallback) {
    if (result.success && result.stdout.trim()) {
      dataCallback(result.stdout + '\n');
    } else {
      dataCallback('.NET not found in PATH\n');
    }
    dataCallback('Completed\n');
  }

  return result;
};

// Parser function to extract .NET detection information
const parseDotnetResult = (output: string, success: boolean, stderr?: string) => {
  const trimmedOutput = output.trim();
  const dotnetDetected = success && trimmedOutput.length > 0 && !trimmedOutput.includes('not found');
  
  if (dotnetDetected) {
    // Extract the actual path (first line that looks like a path)
    const lines = trimmedOutput.split('\n');
    const dotnetPath = lines.find(line => line.trim().startsWith('/') && line.includes('dotnet')) || trimmedOutput;
    
    return {
      dotnetDetected: true,
      dotnetPath: dotnetPath.trim(),
      status: 'found',
      message: `.NET installation found at ${dotnetPath.trim()}`
    };
  }

  return {
    dotnetDetected: false,
    dotnetPath: null,
    status: 'not_found',
    message: '.NET is not installed or not in PATH'
  };
};

// Use the enhanced factory with custom parsing
export const GET = sseTerminalHandlerFactory({
  workflow: dotnetDetectionWorkflow,
  parseData: parseDotnetResult,
  customMessages: {
    executing: 'Detecting .NET installation...',
    completed: '.NET detection completed',
    error: 'Failed to detect .NET'
  }
}) as (request: NextRequest) => Promise<SSEStreamingResponse<SSEEventData>>;