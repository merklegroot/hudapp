import { diskInfo } from './diskInfo';
import { physicalDisk } from './physicalDisk';
import { topProcess } from './topProcess';
import { gpuInfo } from './gpuInfo';

export interface machineInfo {
  hostname: string;
  localIP: string;
  machineModel: string;
  cpuInfo: string;
  kernelVersion: string;
  osName: string;
  totalRAM: string;
  freeRAM: string;
  usedRAM: string;
  disks: diskInfo[];
  physicalDisks: physicalDisk[];
  topProcesses: topProcess[];
}
