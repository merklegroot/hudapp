import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import { pathWorkflow } from '../../workflows/pathWorkflow';

export async function GET(request: NextRequest) {
  try {
    // Check if a specific method is requested
    const { searchParams } = new URL(request.url);
    const forceMethod = searchParams.get('method') || undefined;
    
    // Get path information using the workflow
    const pathData = await pathWorkflow.getPathInfo(forceMethod);
    
    return NextResponse.json(pathData);

  } catch (error) {
    console.error('Error fetching PATH information:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch PATH information' 
    }, { status: 500 });
  }
}
