import { diskInfo } from './diskInfo';
import { physicalDisk } from './physicalDisk';
import { topProcess } from './topProcess';

export interface cpuDetailedInfo {
  model: string;
  cores: number;
  threads: number;
  architecture: string;
  frequency: string;
  cache: string;
  vendor: string;
  family: string;
  stepping: string;
}

export interface machineInfo {
  hostname: string;
  localIP: string;
  machineModel: string;
  cpuInfo: string;
  cpuDetailed: cpuDetailedInfo;
  kernelVersion: string;
  osName: string;
  totalRAM: string;
  freeRAM: string;
  usedRAM: string;
  disks: diskInfo[];
  physicalDisks: physicalDisk[];
  topProcesses: topProcess[];
}
