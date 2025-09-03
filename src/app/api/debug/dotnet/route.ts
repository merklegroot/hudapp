import { NextRequest } from 'next/server';
import { dotnetDetectionWorkflow } from '../../../workflows/dotnetDetectionWorkflow';
import { sseTerminalHandlerFactory } from '../../../workflows/sseTerminalHandlerFactory';
import { SSEStreamingResponse } from '@/app/types/SSEResponse';
import { SSEEventData } from '@/app/types/sse';
import { stepCounterWorkflow } from '../../../workflows/stepCounterWorkflow';

const handler = sseTerminalHandlerFactory(dotnetDetectionWorkflow.execute);

// const handler = sseTerminalHandlerFactory(stepCounterWorkflow.execute);

export async function GET(request: NextRequest): Promise<SSEStreamingResponse<SSEEventData>> {
  return handler(request);
}