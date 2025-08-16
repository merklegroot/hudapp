import { hostname, platform, release, type, totalmem, freemem, networkInterfaces } from 'os';
import { exec } from 'child_process';
import { promisify } from 'util';
import { readFile } from 'fs/promises';
import { detectPlatform, platformType } from './detectPlatform';

const execAsync = promisify(exec);

export interface DiskInfo {
  mount: string;
  total: string;
  used: string;
  available: string;
  usedPercent: number;
  filesystem: string;
}

export interface PhysicalDisk {
  device: string;
  size: string;
  model: string;
  type: string;
}

export interface TopProcess {
  pid: string;
  name: string;
  memoryUsage: string;
  memoryPercent: number;
  memoryAbsolute: string;
}

export interface GPUInfo {
  name: string;
  bus: string;
  revision: string;
  driver: string;
  index: number;
  // Optional fields for nvidia-smi when available
  memoryTotal?: string;
  memoryUsed?: string;
  memoryFree?: string;
  utilization?: number;
  temperature?: number;
}

export interface MachineInfo {
  hostname: string;
  localIP: string;
  machineModel: string;
  cpuInfo: string;
  kernelVersion: string;
  osName: string;
  totalRAM: string;
  freeRAM: string;
  usedRAM: string;
  disks: DiskInfo[];
  physicalDisks: PhysicalDisk[];
  topProcesses: TopProcess[];
  gpus: GPUInfo[];
}

function formatBytes(bytes: number): string {
  const sizes = ['Bytes', 'KiB', 'MiB', 'GiB', 'TiB'];

  if (bytes === 0) return '0 Bytes';
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
}

function getLocalIPAddress(): string {
  const interfaces = networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    const nets = interfaces[name];

    if (nets) {
      for (const net of nets) {
        // Skip over non-IPv4 and internal addresses

        if (net.family === 'IPv4' && !net.internal) {
          return net.address;
        }
      }
    }
  }
  return 'Unknown';
}

async function getMachineModel(): Promise<string> {
  try {
    const currentPlatform = detectPlatform();

    if (currentPlatform === platformType.linux) {
      // Try to get machine model from /sys filesystem (no sudo required)
      try {
        const productName = (await readFile('/sys/class/dmi/id/product_name', 'utf8')).trim();

        if (productName && productName !== 'To be filled by O.E.M.' && productName !== 'System Product Name') {
          return productName;
        }
      } catch (e) {
        // Continue to fallback methods if file doesn't exist or can't be read
      }
      
      // Try alternative sys paths
      try {
        const boardName = (await readFile('/sys/class/dmi/id/board_name', 'utf8')).trim();

        if (boardName && boardName !== 'To be filled by O.E.M.' && boardName !== 'Default string') {
          return boardName;
        }
      } catch (e) {
        // Continue to fallback methods
      }
      
      // Fallback: try dmidecode without sudo (will likely fail, but worth trying)
      try {
        const { stdout: dmiInfo } = await execAsync('dmidecode -s system-product-name 2>/dev/null');

        if (dmiInfo.trim() && !dmiInfo.includes('Permission denied')) {
          return dmiInfo.trim();
        }
      } catch (e) {
        // Expected to fail without sudo
      }
      
      return 'Unknown';
    }

    if (currentPlatform === platformType.mac) {
      const { stdout: model } = await execAsync('system_profiler SPHardwareDataType | grep "Model Name" | cut -d: -f2');
      return model.trim() || 'Unknown';
    }

    if (currentPlatform === platformType.windows) {
      const { stdout: model } = await execAsync('wmic computersystem get model /value | findstr Model=');
      return model.replace('Model=', '').trim() || 'Unknown';
    }
    return 'Unknown';
  } catch (error) {
    return 'Unknown';
  }
}

async function getCPUInfo(): Promise<string> {
  try {
    const currentPlatform = detectPlatform();

    if (currentPlatform === platformType.linux) {
      const { stdout: cpuInfo } = await execAsync('cat /proc/cpuinfo | grep "model name" | head -1 | cut -d: -f2');
      return cpuInfo.trim() || 'Unknown';
    }

    if (currentPlatform === platformType.mac) {
      const { stdout: cpuInfo } = await execAsync('system_profiler SPHardwareDataType | grep "Processor Name" | cut -d: -f2');
      return cpuInfo.trim() || 'Unknown';
    }

    if (currentPlatform === platformType.windows) {
      const { stdout: cpuInfo } = await execAsync('wmic cpu get name /value | findstr Name=');
      return cpuInfo.replace('Name=', '').trim() || 'Unknown';
    }
    return 'Unknown';
  } catch (error) {
    return 'Unknown';
  }
}

async function getDiskInfo(): Promise<DiskInfo[]> {
  try {
    const currentPlatform = detectPlatform();
    if (currentPlatform === platformType.linux || currentPlatform === platformType.mac) {
      // Use df command to get disk usage
      const { stdout: dfOutput } = await execAsync('df -h --output=source,target,size,used,avail,pcent 2>/dev/null || df -h');
      const lines = dfOutput.split('\n').slice(1); // Skip header
      
      const diskInfo: DiskInfo[] = [];
      
      for (const line of lines) {
        const parts = line.trim().split(/\s+/);
        if (parts.length >= 6 && !parts[0].includes('tmpfs') && !parts[0].includes('devtmpfs') && parts[1] !== 'none') {
          // Filter out virtual filesystems
          if (parts[1].startsWith('/') || parts[1] === '/') {
            const usedPercentStr = parts[5].replace('%', '');
            const usedPercent = parseInt(usedPercentStr) || 0;
            
            diskInfo.push({
              mount: parts[1],
              total: parts[2],
              used: parts[3],
              available: parts[4],
              usedPercent,
              filesystem: parts[0]
            });
          }
        }
      }
      
      return diskInfo.length > 0 ? diskInfo : [{
        mount: '/',
        total: 'Unknown',
        used: 'Unknown', 
        available: 'Unknown',
        usedPercent: 0,
        filesystem: 'Unknown'
      }];
    }
    if (currentPlatform === platformType.windows) {
      // Use wmic for Windows
      const { stdout: wmicOutput } = await execAsync('wmic logicaldisk get size,freespace,caption /format:csv');
      const lines = wmicOutput.split('\n').slice(1); // Skip header
      
      const diskInfo: DiskInfo[] = [];
      
      for (const line of lines) {
        const parts = line.split(',');

        if (parts.length >= 4 && parts[1] && parts[2] && parts[3]) {
          const caption = parts[1].trim();
          const freeSpace = parseInt(parts[2]) || 0;
          const totalSpace = parseInt(parts[3]) || 0;
          const usedSpace = totalSpace - freeSpace;
          const usedPercent = totalSpace > 0 ? Math.round((usedSpace / totalSpace) * 100) : 0;
          
          diskInfo.push({
            mount: caption,
            total: formatBytes(totalSpace),
            used: formatBytes(usedSpace),
            available: formatBytes(freeSpace),
            usedPercent,
            filesystem: 'NTFS'
          });
        }
      }
      
      return diskInfo.length > 0 ? diskInfo : [{
        mount: 'C:',
        total: 'Unknown',
        used: 'Unknown',
        available: 'Unknown', 
        usedPercent: 0,
        filesystem: 'Unknown'
      }];
    }
    
    return [{
      mount: '/',
      total: 'Unknown',
      used: 'Unknown',
      available: 'Unknown',
      usedPercent: 0,
      filesystem: 'Unknown'
    }];
  } catch (error) {
    console.error('Error getting disk info:', error);
    return [{
      mount: '/',
      total: 'Unknown',
      used: 'Unknown',
      available: 'Unknown',
      usedPercent: 0,
      filesystem: 'Unknown'
    }];
  }
}

async function getPhysicalDisks(): Promise<PhysicalDisk[]> {
  try {
    const currentPlatform = detectPlatform();

    if (currentPlatform === platformType.linux) {
      // Use lsblk to get physical disk information
      const { stdout: lsblkOutput } = await execAsync('lsblk -d -o NAME,SIZE,MODEL,ROTA -n 2>/dev/null || echo ""');
      const lines = lsblkOutput.split('\n').filter(line => line.trim());
      
      const physicalDisks: PhysicalDisk[] = [];
      
      for (const line of lines) {
        const parts = line.trim().split(/\s+/);

        if (parts.length >= 3 && !parts[0].includes('loop') && !parts[0].includes('ram')) {
          const device = parts[0];
          const size = parts[1];
          const model = parts.slice(2, -1).join(' ') || 'Unknown';
          const isRotational = parts[parts.length - 1] === '1';
          const type = isRotational ? 'HDD' : 'SSD';
          
          physicalDisks.push({
            device: `/dev/${device}`,
            size,
            model: model.trim() || 'Unknown',
            type
          });
        }
      }
      
      // Fallback: try using fdisk if lsblk fails

      if (physicalDisks.length === 0) {
        try {
          const { stdout: fdiskOutput } = await execAsync('fdisk -l 2>/dev/null | grep "Disk /dev/" | head -10');
          const fdiskLines = fdiskOutput.split('\n').filter(line => line.includes('Disk /dev/'));
          
          for (const line of fdiskLines) {
            const match = line.match(/Disk (\/dev\/\w+).*?(\d+(?:\.\d+)?\s*[KMGT]?B)/);

            if (match) {
              physicalDisks.push({
                device: match[1],
                size: match[2],
                model: 'Unknown',
                type: 'Unknown'
              });
            }
          }
        } catch (fdiskError) {
          // Ignore fdisk errors
        }
      }
      
      return physicalDisks;
    }

    if (currentPlatform === platformType.mac) {
      // Use diskutil for macOS
      const { stdout: diskutilOutput } = await execAsync('diskutil list physical 2>/dev/null || echo ""');
      const lines = diskutilOutput.split('\n');
      
      const physicalDisks: PhysicalDisk[] = [];
      
      for (const line of lines) {

        if (line.includes('/dev/disk') && line.includes('*')) {
          const parts = line.trim().split(/\s+/);
          const sizeIndex = parts.findIndex(part => part.includes('B'));

          if (sizeIndex > 0) {
            const device = parts[0].replace('*', '');
            const size = parts[sizeIndex];
            const model = parts.slice(sizeIndex + 1).join(' ') || 'Unknown';
            
            physicalDisks.push({
              device,
              size,
              model: model.trim() || 'Unknown',
              type: 'Unknown'
            });
          }
        }
      }
      
      return physicalDisks;
    }

    if (currentPlatform === platformType.windows) {
      // Use wmic for Windows physical disk info
      const { stdout: wmicOutput } = await execAsync('wmic diskdrive get size,model,caption /format:csv 2>/dev/null || echo ""');
      const lines = wmicOutput.split('\n').slice(1); // Skip header
      
      const physicalDisks: PhysicalDisk[] = [];
      
      for (const line of lines) {
        const parts = line.split(',');

        if (parts.length >= 4 && parts[1] && parts[2] && parts[3]) {
          const caption = parts[1].trim();
          const model = parts[2].trim() || 'Unknown';
          const sizeBytes = parseInt(parts[3]) || 0;
          const size = formatBytes(sizeBytes);
          
          physicalDisks.push({
            device: caption,
            size,
            model,
            type: 'Unknown'
          });
        }
      }
      
      return physicalDisks;
    }
    
    return [];
  } catch (error) {
    console.error('Error getting physical disk info:', error);
    return [];
  }
}

async function getTopProcesses(): Promise<TopProcess[]> {
  try {
    const totalMemoryBytes = totalmem();
    const currentPlatform = detectPlatform();
    
    if (currentPlatform === platformType.linux) {
      // Use ps command to get top processes by memory usage
      const { stdout: psOutput } = await execAsync('ps aux --sort=-%mem --no-headers | head -3');
      const lines = psOutput.split('\n').filter(line => line.trim());
      
      const processes: TopProcess[] = [];
      
      for (const line of lines) {
        const parts = line.trim().split(/\s+/);
        if (parts.length >= 11) {
          const pid = parts[1];
          const memPercent = parseFloat(parts[3]) || 0;
          const command = parts.slice(10).join(' ');
          // Extract just the process name (first part of command)
          const processName = command.split(' ')[0].split('/').pop() || command;
          
          // Calculate absolute memory usage
          const memoryBytes = (memPercent / 100) * totalMemoryBytes;
          const memoryAbsolute = formatBytes(memoryBytes);
          
          processes.push({
            pid,
            name: processName.length > 30 ? processName.substring(0, 30) + '...' : processName,
            memoryUsage: `${memPercent.toFixed(1)}%`,
            memoryPercent: Math.round(memPercent * 100) / 100,
            memoryAbsolute
          });
        }
      }
      
      return processes;
    }
    if (currentPlatform === platformType.mac) {
      // Use ps command for macOS
      const { stdout: psOutput } = await execAsync('ps aux -r | head -4 | tail -3');
      const lines = psOutput.split('\n').filter(line => line.trim());
      
      const processes: TopProcess[] = [];
      
      for (const line of lines) {
        const parts = line.trim().split(/\s+/);
        if (parts.length >= 11) {
          const pid = parts[1];
          const memPercent = parseFloat(parts[3]) || 0;
          const command = parts.slice(10).join(' ');
          const processName = command.split(' ')[0].split('/').pop() || command;
          
          // Calculate absolute memory usage
          const memoryBytes = (memPercent / 100) * totalMemoryBytes;
          const memoryAbsolute = formatBytes(memoryBytes);
          
          processes.push({
            pid,
            name: processName.length > 30 ? processName.substring(0, 30) + '...' : processName,
            memoryUsage: `${memPercent.toFixed(1)}%`,
            memoryPercent: Math.round(memPercent * 100) / 100,
            memoryAbsolute
          });
        }
      }
      
      return processes;
    }
    if (currentPlatform === platformType.windows) {
      // Use wmic for Windows
      const { stdout: wmicOutput } = await execAsync('wmic process get Name,ProcessId,WorkingSetSize /format:csv | sort /r /+4 | head -4 | tail -3');
      const lines = wmicOutput.split('\n').filter(line => line.trim() && line.includes(','));
      
      const processes: TopProcess[] = [];
      
      for (const line of lines) {
        const parts = line.split(',');
        if (parts.length >= 4 && parts[1] && parts[2] && parts[3]) {
          const name = parts[1].trim();
          const pid = parts[2].trim();
          const workingSetBytes = parseInt(parts[3]) || 0;
          const memoryAbsolute = formatBytes(workingSetBytes);
          const memPercent = totalMemoryBytes > 0 ? (workingSetBytes / totalMemoryBytes) * 100 : 0;
          
          processes.push({
            pid,
            name: name.length > 30 ? name.substring(0, 30) + '...' : name,
            memoryUsage: `${memPercent.toFixed(1)}%`,
            memoryPercent: Math.round(memPercent * 100) / 100,
            memoryAbsolute
          });
        }
      }
      
      return processes;
    }
    
    return [];
  } catch (error) {
    console.error('Error getting top processes:', error);
    return [];
  }
}

async function getGPUInfo(): Promise<GPUInfo[]> {
  try {
    const currentPlatform = detectPlatform();
    
    if (currentPlatform === platformType.linux) {
      // Try nvidia-smi first for NVIDIA GPUs
      try {
        const { stdout: nvidiaOutput } = await execAsync('nvidia-smi --query-gpu=index,name,memory.total,memory.used,memory.free,utilization.gpu,temperature.gpu,driver_version --format=csv,noheader,nounits 2>/dev/null');
        
        if (nvidiaOutput.trim()) {
          const lines = nvidiaOutput.split('\n').filter(line => line.trim());
          const gpus: GPUInfo[] = [];
          
          for (const line of lines) {
            const parts = line.split(',').map(part => part.trim());
            if (parts.length >= 7) {
              const memoryTotalMB = parseInt(parts[2]) || 0;
              const memoryUsedMB = parseInt(parts[3]) || 0;
              const memoryFreeMB = parseInt(parts[4]) || 0;
              
              gpus.push({
                index: parseInt(parts[0]) || 0,
                name: parts[1] || 'Unknown GPU',
                bus: 'Unknown',
                revision: 'Unknown',
                driver: parts[7] || 'Unknown',
                memoryTotal: formatBytes(memoryTotalMB * 1024 * 1024),
                memoryUsed: formatBytes(memoryUsedMB * 1024 * 1024),
                memoryFree: formatBytes(memoryFreeMB * 1024 * 1024),
                utilization: parseInt(parts[5]) || 0,
                temperature: parseInt(parts[6]) || 0
              });
            }
          }
          
          if (gpus.length > 0) {
            return gpus;
          }
        }
      } catch (e) {
        // nvidia-smi not available or failed, continue to lspci
      }
      
      // Fallback to lspci for general GPU detection
      try {
        const { stdout: lspciOutput } = await execAsync('lspci -v | grep -A 20 -i "vga\\|3d\\|display" 2>/dev/null');
        const sections = lspciOutput.split('\n\n').filter(section => section.trim());
        const gpus: GPUInfo[] = [];
        
        for (let i = 0; i < sections.length; i++) {
          const section = sections[i];
          const lines = section.split('\n');
          
          if (lines.length > 0) {
            const firstLine = lines[0];
            
            // Parse bus ID and device info from first line
            // Format: "01:00.0 VGA compatible controller: NVIDIA Corporation GA107M [GeForce RTX 3050 Ti Mobile] (rev a1)"
            const busMatch = firstLine.match(/^([0-9a-f]{2}:[0-9a-f]{2}\.[0-9a-f])/i);
            const deviceMatch = firstLine.match(/(?:VGA compatible controller|3D controller|Display controller):\s*(.+)/i);
            const revMatch = firstLine.match(/\(rev\s+([a-f0-9]+)\)/i);
            
            const busId = busMatch ? busMatch[1] : 'Unknown';
            let deviceName = deviceMatch ? deviceMatch[1].trim() : 'Unknown GPU';
            const revision = revMatch ? revMatch[1] : 'Unknown';
            
            // Remove revision info from device name if it's included
            deviceName = deviceName.replace(/\s*\(rev\s+[a-f0-9]+\)$/i, '');
            
            // Try to find driver info in the section
            let driver = 'Unknown';
            for (const line of lines) {
              const driverMatch = line.match(/Kernel driver in use:\s*(.+)/i);
              if (driverMatch) {
                driver = driverMatch[1].trim();
                break;
              }
            }
            
            gpus.push({
              index: i,
              name: deviceName,
              bus: busId,
              revision: revision,
              driver: driver
            });
          }
        }
        
        return gpus;
      } catch (e) {
        // lspci also failed
      }
    }
    
    if (currentPlatform === platformType.mac) {
      try {
        const { stdout: gpuOutput } = await execAsync('system_profiler SPDisplaysDataType -json 2>/dev/null');
        const data = JSON.parse(gpuOutput);
        const displays = data?.SPDisplaysDataType || [];
        const gpus: GPUInfo[] = [];
        
        for (let i = 0; i < displays.length; i++) {
          const display = displays[i];
          const name = display._name || display.sppci_model || 'Unknown GPU';
          const vramSize = display.sppci_vram || display.spdisplays_vram || '0';
          
          // Convert VRAM size (often in format like "8 GB" or "8192 MB")
          let memoryTotalBytes = 0;
          if (typeof vramSize === 'string') {
            const match = vramSize.match(/(\d+)\s*(GB|MB|GiB|MiB)/i);
            if (match) {
              const size = parseInt(match[1]);
              const unit = match[2].toUpperCase();
              if (unit.includes('G')) {
                memoryTotalBytes = size * 1024 * 1024 * 1024;
              } else if (unit.includes('M')) {
                memoryTotalBytes = size * 1024 * 1024;
              }
            }
          }
          
          gpus.push({
            index: i,
            name: name,
            bus: 'Unknown',
            revision: 'Unknown',
            driver: 'Unknown',
            ...(memoryTotalBytes > 0 && { memoryTotal: formatBytes(memoryTotalBytes) })
          });
        }
        
        return gpus;
      } catch (e) {
        // JSON parsing or command failed
      }
    }
    
    if (currentPlatform === platformType.windows) {
      try {
        const { stdout: wmicOutput } = await execAsync('wmic path win32_VideoController get Name,AdapterRAM,DriverVersion /format:csv 2>/dev/null');
        const lines = wmicOutput.split('\n').slice(1).filter(line => line.trim() && line.includes(','));
        const gpus: GPUInfo[] = [];
        
        for (let i = 0; i < lines.length; i++) {
          const parts = lines[i].split(',');
          if (parts.length >= 4 && parts[1] && parts[2]) {
            const adapterRAM = parseInt(parts[1]) || 0;
            const driverVersion = parts[2].trim() || 'Unknown';
            const name = parts[3].trim() || 'Unknown GPU';
            
            gpus.push({
              index: i,
              name: name,
              bus: 'Unknown',
              revision: 'Unknown',
              driver: driverVersion,
              ...(adapterRAM > 0 && { memoryTotal: formatBytes(adapterRAM) })
            });
          }
        }
        
        return gpus;
      } catch (e) {
        // wmic failed
      }
    }
    
    return [];
  } catch (error) {
    console.error('Error getting GPU info:', error);
    return [];
  }
}

async function getOSName(): Promise<string> {
  try {
    const currentPlatform = detectPlatform();

    if (currentPlatform === platformType.linux) {
      // Try to read from /etc/os-release for detailed OS information
      try {
        const osRelease = await readFile('/etc/os-release', 'utf8');
        const lines = osRelease.split('\n');
        
        let prettyName = '';
        let versionInfo = '';
        
        for (const line of lines) {

          if (line.startsWith('PRETTY_NAME=')) {
            prettyName = line.split('=')[1].replace(/"/g, '');
          } else if (line.startsWith('VERSION=')) {
            versionInfo = line.split('=')[1].replace(/"/g, '');
          }
        }
        
        // Check if this is Kubuntu by checking hostname or other indicators
        const currentHostname = hostname().toLowerCase();
        const isKubuntu = currentHostname.includes('kubuntu');
        

        if (isKubuntu && prettyName && versionInfo) {
          // Format as "Kubuntu 25.04 (Ubuntu 25.04 "Plucky")"
          const version = prettyName.split(' ')[1] || '';
          // Extract codename from version info - e.g., "25.04 (Plucky Puffin)" -> "Plucky"
          const codenamePart = versionInfo.match(/\(([^)]+)\)/);
          const codename = codenamePart ? codenamePart[1].split(' ')[0] : '';
          return `Kubuntu ${version} (Ubuntu ${version} "${codename}")`;
        }

        if (prettyName && versionInfo) {
          // Use the full version info for other Ubuntu variants
          return `${prettyName} (${versionInfo})`;
        }

        if (prettyName) {
          return prettyName;
        }
      } catch (e) {
        // Fall back to basic detection if /etc/os-release is not available
      }
    }
    
    // Fallback to basic OS detection
    return `${type()} ${release()}`;
  } catch (error) {
    return 'Unknown OS';
  }
}

async function getMachineInfo(): Promise<MachineInfo> {
  try {
    const machineHostname = hostname();
    const osName = await getOSName();
    const kernelVersion = release();
    const machineModel = await getMachineModel();
    const cpuInfo = await getCPUInfo();
    const localIP = getLocalIPAddress();
    const totalRAM = formatBytes(totalmem());
    const freeRAM = formatBytes(freemem());
    const usedRAM = formatBytes(totalmem() - freemem());
    const diskInfo = await getDiskInfo();
    const physicalDisks = await getPhysicalDisks();
    const topProcesses = await getTopProcesses();
    const gpus = await getGPUInfo();

    return {
      hostname: machineHostname,
      localIP,
      machineModel,
      cpuInfo,
      kernelVersion,
      osName,
      totalRAM,
      freeRAM,
      usedRAM,
      disks: diskInfo,
      physicalDisks,
      topProcesses,
      gpus
    };
  } catch (error) {
    console.error('Error getting system information:', error);
    return {
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
      topProcesses: [],
      gpus: []
    };
  }
}


export const machineInfoWorkflow = {
  getMachineInfo
};
