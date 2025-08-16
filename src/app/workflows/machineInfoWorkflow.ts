import { hostname, release, type, totalmem, freemem, networkInterfaces } from 'os';
import { exec } from 'child_process';
import { promisify } from 'util';
import { readFile } from 'fs/promises';
import { detectPlatform, platformType } from './detectPlatform';
import { getGpuInfos } from './getGpuInfos';
import { gpuInfo, diskInfo, physicalDisk, topProcess, machineInfo } from './models';
import { formatBytes } from './formatBytes';

const execAsync = promisify(exec);

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

async function getDiskInfo(): Promise<diskInfo[]> {
  try {
    const currentPlatform = detectPlatform();
    if (currentPlatform === platformType.linux || currentPlatform === platformType.mac) {
      // Use df command to get disk usage
      const { stdout: dfOutput } = await execAsync('df -h --output=source,target,size,used,avail,pcent 2>/dev/null || df -h');
      const lines = dfOutput.split('\n').slice(1); // Skip header
      
      const diskInfo: diskInfo[] = [];
      
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
      
      const diskInfo: diskInfo[] = [];
      
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

async function getPhysicalDisks(): Promise<physicalDisk[]> {
  try {
    const currentPlatform = detectPlatform();

    if (currentPlatform === platformType.linux) {
      // Use lsblk to get physical disk information
      const { stdout: lsblkOutput } = await execAsync('lsblk -d -o NAME,SIZE,MODEL,ROTA -n 2>/dev/null || echo ""');
      const lines = lsblkOutput.split('\n').filter(line => line.trim());
      
      const physicalDisks: physicalDisk[] = [];
      
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
      
      const physicalDisks: physicalDisk[] = [];
      
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
      
      const physicalDisks: physicalDisk[] = [];
      
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

async function getTopProcesses(): Promise<topProcess[]> {
  try {
    const totalMemoryBytes = totalmem();
    const currentPlatform = detectPlatform();
    
    if (currentPlatform === platformType.linux) {
      // Use ps command to get top processes by memory usage
      const { stdout: psOutput } = await execAsync('ps aux --sort=-%mem --no-headers | head -3');
      const lines = psOutput.split('\n').filter(line => line.trim());
      
      const processes: topProcess[] = [];
      
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
      
      const processes: topProcess[] = [];
      
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
      
      const processes: topProcess[] = [];
      
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

async function getMachineInfo(): Promise<machineInfo> {
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
    const gpus = await getGpuInfos();

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
