'use client';

import { 
  SiLinux,
  SiFreebsd,
  SiOpenbsd,
  SiMacos,
  SiOracle
} from 'react-icons/si';
import { FaTerminal, FaServer, FaQuestion, FaCog } from 'react-icons/fa';
import { DiWindows } from 'react-icons/di';

interface KernelIconProps {
  kernelVersion: string;
  className?: string;
}



export default function KernelIcon({ kernelVersion, className = "w-6 h-6" }: KernelIconProps) {
  const versionLower = kernelVersion.toLowerCase();

  // Linux kernel detection
  if (versionLower.includes('linux') || 
      versionLower.match(/^\d+\.\d+\.\d+/) || // Standard Linux kernel version pattern (e.g., "5.15.0")
      versionLower.includes('ubuntu') || 
      versionLower.includes('generic') ||
      versionLower.includes('arch') ||
      versionLower.includes('fedora') ||
      versionLower.includes('suse') ||
      versionLower.includes('debian')) {
    return <SiLinux className={`${className} text-yellow-500`} />;
  }
  
  // Darwin (macOS) kernel detection
  if (versionLower.includes('darwin') || 
      versionLower.includes('macos') || 
      versionLower.includes('osx') ||
      versionLower.match(/^\d+\.\d+\.\d+$/) && !versionLower.includes('linux')) {
    return <SiMacos className={`${className} text-gray-600`} />;
  }
  
  // FreeBSD specific detection
  if (versionLower.includes('freebsd')) {
    return <SiFreebsd className={`${className} text-red-600`} />;
  }
  
  // OpenBSD specific detection
  if (versionLower.includes('openbsd')) {
    return <SiOpenbsd className={`${className} text-yellow-600`} />;
  }
  
  // Generic BSD kernel detection (NetBSD, DragonflyBSD, etc.)
  if (versionLower.includes('bsd') || 
      versionLower.includes('netbsd') ||
      versionLower.includes('dragonfly')) {
    return <SiFreebsd className={`${className} text-red-600`} />;
  }
  
  // Windows NT kernel detection
  if (versionLower.includes('nt ') || 
      versionLower.includes('windows') || 
      versionLower.includes('microsoft') ||
      versionLower.match(/^\d+\.\d+\.\d+\.\d+$/)) { // Windows version pattern (e.g., "10.0.19041.1234")
    return <DiWindows className={`${className} text-blue-600`} />;
  }
  
  // Solaris/SunOS kernel detection
  if (versionLower.includes('sunos') || 
      versionLower.includes('solaris') ||
      versionLower.includes('illumos')) {
    return <SiOracle className={`${className} text-orange-500`} />;
  }
  
  // AIX kernel detection
  if (versionLower.includes('aix')) {
    return <FaServer className={`${className} text-blue-700`} />;
  }
  
  // QNX kernel detection
  if (versionLower.includes('qnx')) {
    return <FaCog className={`${className} text-purple-600`} />;
  }
  
  // Generic Unix-like systems
  if (versionLower.includes('unix') || 
      versionLower.includes('posix')) {
    return <FaTerminal className={`${className} text-gray-700`} />;
  }
  
  // Real-time or embedded kernels
  if (versionLower.includes('rt') || 
      versionLower.includes('realtime') || 
      versionLower.includes('embedded')) {
    return <FaCog className={`${className} text-green-600`} />;
  }
  
  // Unknown kernel fallback
  return <FaQuestion className={`${className} text-gray-500`} />;
}
