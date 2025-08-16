import { NextResponse } from 'next/server';
import { hostname, platform, release, type, totalmem, freemem, networkInterfaces } from 'os';
import { execSync } from 'child_process';

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

    return NextResponse.json({
      hostname: machineHostname,
      localIP,
      machineModel,
      kernelVersion,
      osName,
      totalRAM,
      freeRAM,
      usedRAM
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
      usedRAM: 'Unknown'
    }, { status: 500 });
  }
}
