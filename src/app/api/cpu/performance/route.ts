import { NextRequest, NextResponse } from 'next/server';
import { cpuPerformanceLookup, CPUPerformanceLookupResult } from '../../../workflows/cpuPerformanceLookup';

interface CPUPerformanceResponse {
  success: boolean;
  data?: CPUPerformanceLookupResult;
  error?: string;
}

interface CPUComparisonResponse {
  success: boolean;
  data?: {
    current: any;
    better: any[];
    worse: any[];
    similar: any[];
  };
  error?: string;
}

export async function GET(request: NextRequest): Promise<NextResponse<CPUPerformanceResponse>> {
  try {
    const { searchParams } = new URL(request.url);
    const model = searchParams.get('model');
    const cores = searchParams.get('cores');
    const threads = searchParams.get('threads');
    const frequency = searchParams.get('frequency');

    if (!model) {
      return NextResponse.json({
        success: false,
        error: 'CPU model is required'
      }, { status: 400 });
    }

    const result = await cpuPerformanceLookup.lookupCPUPerformance(
      model,
      cores ? parseInt(cores) : undefined,
      threads ? parseInt(threads) : undefined,
      frequency || undefined
    );

    return NextResponse.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('Error in CPU performance lookup:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to lookup CPU performance'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest): Promise<NextResponse<CPUComparisonResponse>> {
  try {
    const body = await request.json();
    const { model, cores, threads, frequency } = body;

    if (!model) {
      return NextResponse.json({
        success: false,
        error: 'CPU model is required'
      }, { status: 400 });
    }

    const comparison = await cpuPerformanceLookup.getCPUPerformanceComparison(
      model,
      cores,
      threads,
      frequency
    );

    return NextResponse.json({
      success: true,
      data: comparison
    });

  } catch (error) {
    console.error('Error in CPU performance comparison:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get CPU performance comparison'
    }, { status: 500 });
  }
}
