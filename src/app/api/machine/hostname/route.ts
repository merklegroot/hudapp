import { NextResponse } from 'next/server';
import { machineInfoWorkflow } from '@/app/workflows';
import { machineInfo } from '@/app/workflows/models';

export async function GET(): Promise<NextResponse<machineInfo>> {
  try {
    const machineInfoData = await machineInfoWorkflow.getMachineInfo();
    return NextResponse.json<machineInfo>(machineInfoData);
  } catch (error) {
    console.error('Error getting system information:', error);
    const fallbackResponse: machineInfo = {
      hostname: 'Unknown Machine',
      localIP: 'Unknown',
      machineModel: 'Unknown',
      cpuInfo: 'Unknown',
      kernelVersion: 'Unknown', 
      osName: 'Unknown',
      totalRAM: 'Unknown',
      freeRAM: 'Unknown',
      usedRAM: 'Unknown',
      disks: [],
      physicalDisks: [],
      topProcesses: []
    };
    return NextResponse.json<machineInfo>(fallbackResponse, { status: 500 });
  }
}
