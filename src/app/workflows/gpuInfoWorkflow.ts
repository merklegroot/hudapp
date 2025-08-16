import { gpu } from "./models";
import { detectPlatform, platformType } from "./detectPlatform";
import { formatBytes } from "./formatBytes";
import { promisify } from "util";
import { exec } from "child_process";
import { gpuParser } from "./gpuParser";
import { gpuInfo } from "./models";

const execAsync = promisify(exec);

async function getGpusFromLspci(): Promise<gpu[]> {
  try {
    const { stdout: lspciOutput } = await execAsync('lspci -v | grep -A 20 -i "vga\\|3d\\|display" 2>/dev/null');
    
    return gpuParser.parseLspciOutput(lspciOutput);
  }
  catch(error) {
    return [];
  }
}

async function getGpusFromNvidiaSmi(): Promise<gpu[]> {
  try {
    const { stdout: nvidiaOutput } = await execAsync('nvidia-smi --query-gpu=index,name,memory.total,memory.used,memory.free,utilization.gpu,temperature.gpu,driver_version --format=csv,noheader,nounits 2>/dev/null');
      
    if (!nvidiaOutput.trim()) {
      return [];
    }

    const lines = nvidiaOutput.split('\n').filter(line => line.trim());
      
    const gpus: gpu[] = [];
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

async function getLinuxGpuInfos(): Promise<gpu[]> {
  const gpusFromNvidia = await getGpusFromNvidiaSmi();
  if (gpusFromNvidia.length > 0)
    return gpusFromNvidia;
  
  return await getGpusFromLspci();
}

async function getGpus(): Promise<gpu[]> {
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
          const gpus: gpu[] = [];
          
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
          const gpus: gpu[] = [];
          
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



async function execute(): Promise<gpuInfo> {
  const gpus = await getGpus();

  return {
    gpus
  };
}

export const gpuInfoWorkflow = {
  execute
}