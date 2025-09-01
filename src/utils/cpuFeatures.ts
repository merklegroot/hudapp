import { cpus, endianness } from 'os';
import { readFileSync, existsSync } from 'fs';

export interface CPUFeatures {
  // Basic CPU info
  architecture: string;
  platform: string;
  cores: number;
  
  // x86/x64 specific features
  sse: boolean;
  sse2: boolean;
  sse3: boolean;
  ssse3: boolean;
  sse4_1: boolean;
  sse4_2: boolean;
  avx: boolean;
  avx2: boolean;
  avx512: boolean;
  
  // ARM specific features
  neon: boolean;
  
  // Other features
  fma: boolean;
  aes: boolean;
  sha: boolean;
  
  // Raw flags string
  flags: string;
}

export function detectCPUFeatures(): CPUFeatures {
  const features: CPUFeatures = {
    architecture: process.arch,
    platform: process.platform,
    cores: cpus().length,
    sse: false,
    sse2: false,
    sse3: false,
    ssse3: false,
    sse4_1: false,
    sse4_2: false,
    avx: false,
    avx2: false,
    avx512: false,
    neon: false,
    fma: false,
    aes: false,
    sha: false,
    flags: ''
  };

  // Try to get CPU flags from /proc/cpuinfo on Linux
  if (process.platform === 'linux') {
    try {
      const cpuInfo = readFileSync('/proc/cpuinfo', 'utf8');
      const lines = cpuInfo.split('\n');
      
      for (const line of lines) {
        if (line.startsWith('flags')) {
          const flags = line.split(':')[1].trim().split(' ');
          features.flags = flags.join(' ');
          
          // Check for various CPU features
          features.sse = flags.includes('sse');
          features.sse2 = flags.includes('sse2');
          features.sse3 = flags.includes('sse3');
          features.ssse3 = flags.includes('ssse3');
          features.sse4_1 = flags.includes('sse4_1');
          features.sse4_2 = flags.includes('sse4_2');
          features.avx = flags.includes('avx');
          features.avx2 = flags.includes('avx2');
          features.avx512 = flags.includes('avx512f') || flags.includes('avx512');
          features.fma = flags.includes('fma');
          features.aes = flags.includes('aes');
          features.sha = flags.includes('sha_ni');
          break;
        }
      }
    } catch (error) {
      console.warn('Could not read /proc/cpuinfo:', error);
    }
  }
  
  // For other platforms or as fallback, try to detect features
  if (process.platform === 'win32') {
    // Windows detection would go here
    // For now, we'll use a basic approach
    features.sse = true; // Most modern CPUs support SSE
    features.sse2 = true; // Most modern CPUs support SSE2
  }
  
  // ARM detection
  if (process.arch === 'arm64' || process.arch === 'arm') {
    try {
      if (existsSync('/proc/cpuinfo')) {
        const cpuInfo = readFileSync('/proc/cpuinfo', 'utf8');
        if (cpuInfo.includes('neon')) {
          features.neon = true;
        }
      }
    } catch (error) {
      console.warn('Could not detect ARM features:', error);
    }
  }

  return features;
}

// Alternative method using Node.js built-ins
export function getBasicCPUInfo() {
  const cpusData = cpus();
  
  return {
    model: cpusData[0]?.model || 'Unknown',
    architecture: process.arch,
    platform: process.platform,
    cores: cpusData.length,
    speed: cpusData[0]?.speed || 'Unknown',
    endianness: endianness()
  };
}