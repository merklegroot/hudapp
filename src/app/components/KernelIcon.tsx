'use client';

import { 
  SiLinux,
  SiFreebsd,
  SiMacos
} from 'react-icons/si';
import { FaTerminal, FaServer, FaQuestion, FaCog } from 'react-icons/fa';
import { DiWindows } from 'react-icons/di';

interface KernelIconProps {
  kernelVersion: string;
  className?: string;
}

// Custom SVG Component for kernel-specific icons
interface CustomSVGProps {
  path: string;
  viewBox?: string;
  className?: string;
  fill?: string;
}

const CustomSVG = ({ path, viewBox = "0 0 24 24", className = "w-6 h-6", fill = "currentColor" }: CustomSVGProps) => (
  <svg
    viewBox={viewBox}
    className={className}
    fill={fill}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d={path} />
  </svg>
);

// Custom kernel SVG paths
const KernelLogos = {
  // Simplified Tux (Linux penguin) inspired icon
  TUX: "M12 2c-2 0-4 1-4 3v2c0 1 1 2 2 2h4c1 0 2-1 2-2V5c0-2-2-3-4-3zm-2 4c-.5 0-1-.5-1-1s.5-1 1-1 1 .5 1 1-.5 1-1 1zm4 0c-.5 0-1-.5-1-1s.5-1 1-1 1 .5 1 1-.5 1-1 1zM8 10c-1 0-2 1-2 2v6c0 2 2 4 4 4h4c2 0 4-2 4-4v-6c0-1-1-2-2-2H8z",
  
  // BSD Daemon inspired icon
  BSD_DAEMON: "M12 2l-2 2v2l-2 2v2h2v2l2 2h4l2-2v-2h2v-2l-2-2V4l-2-2h-4zm0 2h4v2l2 2v2h-2v2l-2 2h-4l-2-2v-2H6V8l2-2V4h4zm-1 4c-.5 0-1 .5-1 1s.5 1 1 1 1-.5 1-1-.5-1-1-1zm2 0c-.5 0-1 .5-1 1s.5 1 1 1 1-.5 1-1-.5-1-1-1z",
  
  // Windows NT kernel symbol
  NT_KERNEL: "M4 4h16v16H4V4zm2 2v12h12V6H6zm2 2h8v2H8V8zm0 4h6v2H8v-2z"
};

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
    return <CustomSVG path={KernelLogos.TUX} className={`${className} text-yellow-500`} />;
  }
  
  // Darwin (macOS) kernel detection
  if (versionLower.includes('darwin') || 
      versionLower.includes('macos') || 
      versionLower.includes('osx') ||
      versionLower.match(/^\d+\.\d+\.\d+$/) && !versionLower.includes('linux')) {
    return <SiMacos className={`${className} text-gray-600`} />;
  }
  
  // BSD kernel detection
  if (versionLower.includes('bsd') || 
      versionLower.includes('freebsd') || 
      versionLower.includes('openbsd') || 
      versionLower.includes('netbsd') ||
      versionLower.includes('dragonfly')) {
    return <CustomSVG path={KernelLogos.BSD_DAEMON} className={`${className} text-red-600`} />;
  }
  
  // FreeBSD specific (has react-icon)
  if (versionLower.includes('freebsd')) {
    return <SiFreebsd className={`${className} text-red-600`} />;
  }
  
  // Windows NT kernel detection
  if (versionLower.includes('nt ') || 
      versionLower.includes('windows') || 
      versionLower.includes('microsoft') ||
      versionLower.match(/^\d+\.\d+\.\d+\.\d+$/)) { // Windows version pattern (e.g., "10.0.19041.1234")
    return <CustomSVG path={KernelLogos.NT_KERNEL} className={`${className} text-blue-600`} />;
  }
  
  // Solaris/SunOS kernel detection
  if (versionLower.includes('sunos') || 
      versionLower.includes('solaris') ||
      versionLower.includes('illumos')) {
    return <FaServer className={`${className} text-orange-500`} />;
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
