import { NextResponse } from 'next/server';
import { getMachineInfo } from '../machineInfoRepo';

export async function GET() {
  try {
    const machineInfo = await getMachineInfo();
    return NextResponse.json(machineInfo);
  } catch (error) {
    console.error('Error getting system information:', error);
    return NextResponse.json({ 
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
    }, { status: 500 });
  }
}
