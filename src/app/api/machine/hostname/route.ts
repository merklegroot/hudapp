import { NextResponse } from 'next/server';
import { hostname, platform, release, type, totalmem, freemem, networkInterfaces } from 'os';
import { execSync } from 'child_process';
import { statSync } from 'fs';

function formatBytes(bytes: number): string {
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
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
      // Try to get model from /proc/cpuinfo
      const cpuInfo = execSync('cat /proc/cpuinfo | grep "model name" | head -1 | cut -d: -f2', { encoding: 'utf8' });
      if (cpuInfo.trim()) {
        return cpuInfo.trim();
      }
      // Fallback to DMI info
      const dmiInfo = execSync('dmidecode -s system-product-name 2>/dev/null || echo "Unknown"', { encoding: 'utf8' });
      return dmiInfo.trim() || 'Unknown';
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

interface DiskInfo {
  mount: string;
  total: string;
  used: string;
  available: string;
  usedPercent: number;
  filesystem: string;
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

export async function GET() {
  try {
    const machineHostname = hostname();
    const osName = `${type()} ${release()}`;
    const kernelVersion = release();
    const machineModel = getMachineModel();
    const localIP = getLocalIPAddress();
    const totalRAM = formatBytes(totalmem());
    const freeRAM = formatBytes(freemem());
    const usedRAM = formatBytes(totalmem() - freemem());
    const diskInfo = getDiskInfo();

    return NextResponse.json({
      hostname: machineHostname,
      localIP,
      machineModel,
      kernelVersion,
      osName,
      totalRAM,
      freeRAM,
      usedRAM,
      disks: diskInfo
    });
  } catch (error) {
    console.error('Error getting system information:', error);
    return NextResponse.json({ 
      hostname: 'Unknown Machine',
      localIP: 'Unknown',
      machineModel: 'Unknown',
      kernelVersion: 'Unknown', 
      osName: 'Unknown',
      totalRAM: 'Unknown',
      freeRAM: 'Unknown',
      usedRAM: 'Unknown',
      disks: []
    }, { status: 500 });
  }
}
