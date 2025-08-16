import { NextResponse } from 'next/server';
import { hostname, platform, release, type, totalmem, freemem, networkInterfaces } from 'os';
import { execSync } from 'child_process';
import { statSync, readFileSync } from 'fs';

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

function getMachineModel(): string {
  try {
    if (platform() === 'linux') {
      // Try to get machine model from /sys filesystem (no sudo required)
      try {
        const productName = readFileSync('/sys/class/dmi/id/product_name', 'utf8').trim();
        if (productName && productName !== 'To be filled by O.E.M.' && productName !== 'System Product Name') {
          return productName;
        }
      } catch (e) {
        // Continue to fallback methods if file doesn't exist or can't be read
      }
      
      // Try alternative sys paths
      try {
        const boardName = readFileSync('/sys/class/dmi/id/board_name', 'utf8').trim();
        if (boardName && boardName !== 'To be filled by O.E.M.' && boardName !== 'Default string') {
          return boardName;
        }
      } catch (e) {
        // Continue to fallback methods
      }
      
      // Fallback: try dmidecode without sudo (will likely fail, but worth trying)
      try {
        const dmiInfo = execSync('dmidecode -s system-product-name 2>/dev/null', { encoding: 'utf8' });
        if (dmiInfo.trim() && !dmiInfo.includes('Permission denied')) {
          return dmiInfo.trim();
        }
      } catch (e) {
        // Expected to fail without sudo
      }
      
      return 'Unknown';
    } else if (platform() === 'darwin') {
      const model = execSync('system_profiler SPHardwareDataType | grep "Model Name" | cut -d: -f2', { encoding: 'utf8' });
      return model.trim() || 'Unknown';
    } else if (platform() === 'win32') {
      const model = execSync('wmic computersystem get model /value | findstr Model=', { encoding: 'utf8' });
      return model.replace('Model=', '').trim() || 'Unknown';
    }
    return 'Unknown';
  } catch (error) {
    return 'Unknown';
  }
}

function getCPUInfo(): string {
  try {
    if (platform() === 'linux') {
      const cpuInfo = execSync('cat /proc/cpuinfo | grep "model name" | head -1 | cut -d: -f2', { encoding: 'utf8' });
      return cpuInfo.trim() || 'Unknown';
    } else if (platform() === 'darwin') {
      const cpuInfo = execSync('system_profiler SPHardwareDataType | grep "Processor Name" | cut -d: -f2', { encoding: 'utf8' });
      return cpuInfo.trim() || 'Unknown';
    } else if (platform() === 'win32') {
      const cpuInfo = execSync('wmic cpu get name /value | findstr Name=', { encoding: 'utf8' });
      return cpuInfo.replace('Name=', '').trim() || 'Unknown';
    }
    return 'Unknown';
  } catch (error) {
    return 'Unknown';
  }
}

interface DiskInfo {
  mount: string;
  total: string;
  used: string;
  available: string;
  usedPercent: number;
  filesystem: string;
}

interface PhysicalDisk {
  device: string;
  size: string;
  model: string;
  type: string;
}

interface TopProcess {
  pid: string;
  name: string;
  memoryUsage: string;
  memoryPercent: number;
  memoryAbsolute: string;
}

function getDiskInfo(): DiskInfo[] {
  try {
    if (platform() === 'linux' || platform() === 'darwin') {
      // Use df command to get disk usage
      const dfOutput = execSync('df -h --output=source,target,size,used,avail,pcent 2>/dev/null || df -h', { encoding: 'utf8' });
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
      
    } else if (platform() === 'win32') {
      // Use wmic for Windows
      const wmicOutput = execSync('wmic logicaldisk get size,freespace,caption /format:csv', { encoding: 'utf8' });
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

function getPhysicalDisks(): PhysicalDisk[] {
  try {
    if (platform() === 'linux') {
      // Use lsblk to get physical disk information
      const lsblkOutput = execSync('lsblk -d -o NAME,SIZE,MODEL,ROTA -n 2>/dev/null || echo ""', { encoding: 'utf8' });
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
          const fdiskOutput = execSync('fdisk -l 2>/dev/null | grep "Disk /dev/" | head -10', { encoding: 'utf8' });
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
      
    } else if (platform() === 'darwin') {
      // Use diskutil for macOS
      const diskutilOutput = execSync('diskutil list physical 2>/dev/null || echo ""', { encoding: 'utf8' });
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
      
    } else if (platform() === 'win32') {
      // Use wmic for Windows physical disk info
      const wmicOutput = execSync('wmic diskdrive get size,model,caption /format:csv 2>/dev/null || echo ""', { encoding: 'utf8' });
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

function getTopProcesses(): TopProcess[] {
  try {
    const totalMemoryBytes = totalmem();
    
    if (platform() === 'linux') {
      // Use ps command to get top processes by memory usage
      const psOutput = execSync('ps aux --sort=-%mem --no-headers | head -3', { encoding: 'utf8' });
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
      
    } else if (platform() === 'darwin') {
      // Use ps command for macOS
      const psOutput = execSync('ps aux -r | head -4 | tail -3', { encoding: 'utf8' });
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
      
    } else if (platform() === 'win32') {
      // Use wmic for Windows
      const wmicOutput = execSync('wmic process get Name,ProcessId,WorkingSetSize /format:csv | sort /r /+4 | head -4 | tail -3', { encoding: 'utf8' });
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

export async function GET() {
  try {
    const machineHostname = hostname();
    const osName = `${type()} ${release()}`;
    const kernelVersion = release();
    const machineModel = getMachineModel();
    const cpuInfo = getCPUInfo();
    const localIP = getLocalIPAddress();
    const totalRAM = formatBytes(totalmem());
    const freeRAM = formatBytes(freemem());
    const usedRAM = formatBytes(totalmem() - freemem());
    const diskInfo = getDiskInfo();
    const physicalDisks = getPhysicalDisks();
    const topProcesses = getTopProcesses();

    return NextResponse.json({
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
      topProcesses
    });
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
