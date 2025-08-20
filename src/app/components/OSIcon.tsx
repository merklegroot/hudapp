'use client';

import { 
  SiUbuntu, 
  SiDebian, 
  SiRedhat, 
  SiFedora, 
  SiArchlinux, 
  SiLinux, 
  SiMacos, 
  SiFreebsd,
  SiCentos,
  SiOpensuse,
  SiKubuntu,
  SiElementary,
  SiLinuxmint,
  SiGentoo,
  SiKalilinux
} from 'react-icons/si';
import { FaApple, FaQuestion } from 'react-icons/fa';
import { DiWindows } from 'react-icons/di';

interface OSIconProps {
  osName: string;
  className?: string;
}

export default function OSIcon({ osName, className = "w-6 h-6" }: OSIconProps) {
  const osLower = osName.toLowerCase();

  // Specific distribution detection (check more specific variants first)
  if (osLower.includes('kubuntu')) {
    return <SiKubuntu className={`${className} text-blue-600`} />;
  }
  
  if (osLower.includes('ubuntu')) {
    return <SiUbuntu className={`${className} text-orange-500`} />;
  }
  
  if (osLower.includes('debian')) {
    return <SiDebian className={`${className} text-red-600`} />;
  }
  
  if (osLower.includes('red hat') || osLower.includes('redhat') || osLower.includes('rhel')) {
    return <SiRedhat className={`${className} text-red-600`} />;
  }
  
  if (osLower.includes('fedora')) {
    return <SiFedora className={`${className} text-blue-600`} />;
  }
  
  if (osLower.includes('centos')) {
    return <SiCentos className={`${className} text-purple-600`} />;
  }
  
  if (osLower.includes('arch')) {
    return <SiArchlinux className={`${className} text-blue-500`} />;
  }
  
  if (osLower.includes('suse') || osLower.includes('opensuse')) {
    return <SiOpensuse className={`${className} text-green-600`} />;
  }
  
  if (osLower.includes('elementary')) {
    return <SiElementary className={`${className} text-blue-500`} />;
  }
  
  if (osLower.includes('mint') || osLower.includes('linux mint')) {
    return <SiLinuxmint className={`${className} text-green-600`} />;
  }
  
  if (osLower.includes('gentoo')) {
    return <SiGentoo className={`${className} text-purple-600`} />;
  }
  
  if (osLower.includes('kali')) {
    return <SiKalilinux className={`${className} text-blue-600`} />;
  }
  
  if (osLower.includes('pop') || osLower.includes('pop_os') || osLower.includes('pop!_os')) {
    return <SiLinux className={`${className} text-orange-500`} />;
  }
  
  // Generic OS family detection
  if (osLower.includes('macos') || osLower.includes('mac os') || osLower.includes('darwin')) {
    return <SiMacos className={`${className} text-gray-600`} />;
  }
  
  if (osLower.includes('windows')) {
    return <DiWindows className={`${className} text-blue-600`} />;
  }
  
  if (osLower.includes('freebsd')) {
    return <SiFreebsd className={`${className} text-red-600`} />;
  }
  
  if (osLower.includes('linux')) {
    return <SiLinux className={`${className} text-gray-700`} />;
  }
  
  // Fallback icons for broader categories
  if (osLower.includes('bsd')) {
    return <FaApple className={`${className} text-gray-600`} />;
  }
  
  // Unknown OS fallback
  return <FaQuestion className={`${className} text-gray-500`} />;
}
