import { NextResponse } from 'next/server';
import { gpuInfo } from '@/app/workflows/models/gpuInfo';
import { gpuInfoWorkflow } from '@/app/workflows/gpuInfoWorkflow';

export async function GET(): Promise<NextResponse<gpuInfo>> {
  try {
    const gpuInfo = await gpuInfoWorkflow.execute();
    return NextResponse.json(gpuInfo);
  } catch (error) {
    console.error('Error getting GPU information:', error);
    return NextResponse.json<gpuInfo>({ gpus: [] }, { status: 500 });
  }
}
