import { NextResponse } from 'next/server';
import { hostname } from 'os';

export async function GET() {
  try {
    const machineHostname = hostname();
    return NextResponse.json({ hostname: machineHostname });
  } catch (error) {
    console.error('Error getting hostname:', error);
    return NextResponse.json({ hostname: 'Unknown Machine' }, { status: 500 });
  }
}
