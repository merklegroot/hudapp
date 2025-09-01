import { NextRequest } from 'next/server';
import { stepCounterWorkflow } from '../../../workflows/stepCounterWorkflow';
import { sseTerminalHandlerFactory } from '../../../workflows/sseTerminalHandlerFactory';

const handler = sseTerminalHandlerFactory(stepCounterWorkflow.execute);

export async function GET(request: NextRequest) {
  return handler(request);
}
