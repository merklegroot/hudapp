import { gpuInfo } from "./models";
import { detectPlatform, platformType } from "./detectPlatform";
import { formatBytes } from "./formatBytes";
import { promisify } from "util";
import { exec } from "child_process";

const execAsync = promisify(exec);

async function getGpusFromLspci(): Promise<gpuInfo[]> {
  try {
    const { stdout: lspciOutput } = await execAsync('lspci -v | grep -A 20 -i "vga\\|3d\\|display" 2>/dev/null');
    const sections = lspciOutput.split('\n\n').filter(section => section.trim());
    const gpus: gpuInfo[] = [];
    
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
  }
  catch(error) {
    return [];
  }
}

async function getGpusFromNvidiaSmi(): Promise<gpuInfo[]> {
  try {
    const { stdout: nvidiaOutput } = await execAsync('nvidia-smi --query-gpu=index,name,memory.total,memory.used,memory.free,utilization.gpu,temperature.gpu,driver_version --format=csv,noheader,nounits 2>/dev/null');
      
    if (!nvidiaOutput.trim()) {
      return [];
    }

    const lines = nvidiaOutput.split('\n').filter(line => line.trim());
      
    const gpus: gpuInfo[] = [];
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
    
    return gpus;
  }
  catch(error) {
    return [];
  }
}

async function getLinuxGpuInfos(): Promise<gpuInfo[]> {
  const gpusFromNvidia = await getGpusFromNvidiaSmi();
  if (gpusFromNvidia.length > 0)
    return gpusFromNvidia;
  
  return await getGpusFromLspci();
}

export async function getGpuInfos(): Promise<gpuInfo[]> {
    try {
      const currentPlatform = detectPlatform();
      
      if (currentPlatform === platformType.linux) {
        return await getLinuxGpuInfos();
      }
      
      if (currentPlatform === platformType.mac) {
        try {
          const { stdout: gpuOutput } = await execAsync('system_profiler SPDisplaysDataType -json 2>/dev/null');
          const data = JSON.parse(gpuOutput);
          const displays = data?.SPDisplaysDataType || [];
          const gpus: gpuInfo[] = [];
          
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
          const gpus: gpuInfo[] = [];
          
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
  