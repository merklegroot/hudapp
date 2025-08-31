import { NextResponse } from 'next/server';
import { detectCPUFeatures, getBasicCPUInfo } from '../../../utils/cpuFeatures';

export async function GET() {
  try {
    const basicInfo = getBasicCPUInfo();
    const features = detectCPUFeatures();
    
    return NextResponse.json({
      success: true,
      data: {
        basic: basicInfo,
        features: features
      }
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to detect CPU features'
      },
      { status: 500 }
    );
  }
}