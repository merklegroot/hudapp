import { NextRequest } from 'next/server';
import { sseTerminalHandlerFactory } from '../../../workflows/sseTerminalHandlerFactory';
import { spawnAndGetDataWorkflow } from '@/app/workflows/spawnAndGetDataWorkflow';
import { SSEStreamingResponse } from '@/app/types/SSEResponse';
import { SSEEventData } from '@/app/types/sse';

function executeAndEchoFactory(command: string) {
  const args = ['-c', `echo '$ ${command}'; ${command}`];
  return (dataCallback?: (data: string) => void) => spawnAndGetDataWorkflow.execute({
    command: 'bash',
    args,
    timeout: 15000,
    dataCallback
  });
}

const execute = executeAndEchoFactory('echo $PATH');

const handler = sseTerminalHandlerFactory(execute);

export async function GET(request: NextRequest): Promise<SSEStreamingResponse<SSEEventData>> {
  return handler(request);
}
