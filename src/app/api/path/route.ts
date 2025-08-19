import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import { pathWorkflow } from '../../workflows/pathWorkflow';

interface PathData {
  paths: string[];
}

interface PathErrorResponse {
  error: string;
}

type PathResponse = PathData | PathErrorResponse;

export async function GET(request: NextRequest): Promise<NextResponse<PathResponse>> {
  try {
    const pathData: PathData = await pathWorkflow.getPathInfo();
    
    return NextResponse.json<PathData>(pathData);

  } catch (error) {
    console.error('Error fetching PATH information:', error);
    return NextResponse.json<PathErrorResponse>({ 
      error: 'Failed to fetch PATH information' 
    }, { status: 500 });
  }
}
