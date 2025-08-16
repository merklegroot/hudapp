import { NextResponse } from 'next/server';
import { getMachineInfo, type MachineInfo } from '../machineInfoRepo';

export async function GET(): Promise<NextResponse<MachineInfo>> {
  try {
    const machineInfo = await getMachineInfo();
    return NextResponse.json<MachineInfo>(machineInfo);
  } catch (error) {
    console.error('Error getting system information:', error);
    const fallbackResponse: MachineInfo = {
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
    return NextResponse.json<MachineInfo>(fallbackResponse, { status: 500 });
  }
}
