import { NextRequest } from 'next/server';
import { stepCounterWorkflow } from '../../../workflows/stepCounterWorkflow';
import { sseTerminalHandlerFactory } from '../../../workflows/sseTerminalHandlerFactory';
import { SSEStreamingResponse } from '@/app/types/SSEResponse';

const handler = sseTerminalHandlerFactory(stepCounterWorkflow.execute);

export async function GET(request: NextRequest): Promise<SSEStreamingResponse> {
  return handler(request);
}
