import { diskInfo } from './diskInfo';
import { physicalDisk } from './physicalDisk';
import { topProcess } from './topProcess';

export interface cpuInstructionSets {
  sse: boolean;
  sse2: boolean;
  sse3: boolean;
  ssse3: boolean;
  sse4_1: boolean;
  sse4_2: boolean;
  avx: boolean;
  avx2: boolean;
  avx512: boolean;
  aes: boolean;
  sha: boolean;
  fma: boolean;
  mmx: boolean;
}

export interface cpuDetailedInfo {
  model: string;
  cores: number;
  threads: number;
  architecture: string;
  frequency: string;
  currentFrequency: string;
  maxFrequency: string;
  minFrequency: string;
  cache: string;
  vendor: string;
  family: string;
  stepping: string;
  instructionSets: cpuInstructionSets;
}

export interface machineInfo {
  hostname: string;
  localIP: string;
  machineModel: string;
  cpuInfo: string;
  cpuDetailed: cpuDetailedInfo;
  kernelVersion: string;
  osName: string;
  osType: string;
  totalRAM: string;
  freeRAM: string;
  usedRAM: string;
  disks: diskInfo[];
  physicalDisks: physicalDisk[];
  topProcesses: topProcess[];
}
