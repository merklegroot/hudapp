import { NextResponse } from 'next/server';
import { getGpuInfos } from '@/app/workflows/getGpuInfos';
import { gpuInfo } from '@/app/workflows/models';

export async function GET(): Promise<NextResponse<gpuInfo[]>> {
  try {
    const gpuData = await getGpuInfos();
    return NextResponse.json<gpuInfo[]>(gpuData);
  } catch (error) {
    console.error('Error getting GPU information:', error);
    return NextResponse.json<gpuInfo[]>([], { status: 500 });
  }
}
