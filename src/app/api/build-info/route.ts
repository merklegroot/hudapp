import { NextResponse } from 'next/server';
import { getBuildInfo, BuildInfo } from '@/utils/buildInfo';

export async function GET(): Promise<NextResponse<BuildInfo>> {
  const buildInfo = getBuildInfo();
  
  return NextResponse.json(buildInfo);
}