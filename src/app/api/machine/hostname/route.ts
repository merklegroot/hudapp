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
      cpuDetailed: {
        model: 'Unknown',
        cores: 0,
        threads: 0,
        architecture: 'Unknown',
        frequency: 'Unknown',
        currentFrequency: 'Unknown',
        maxFrequency: 'Unknown',
        minFrequency: 'Unknown',
        cache: 'Unknown',
        vendor: 'Unknown',
        family: 'Unknown',
        stepping: 'Unknown',
        instructionSets: {
          sse: false,
          sse2: false,
          sse3: false,
          ssse3: false,
          sse4_1: false,
          sse4_2: false,
          avx: false,
          avx2: false,
          avx512: false,
          aes: false,
          sha: false,
          fma: false,
          mmx: false
        }
      },
      kernelVersion: 'Unknown', 
      osName: 'Unknown',
      osType: 'Unknown',
      virtualization: 'Unknown',
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
