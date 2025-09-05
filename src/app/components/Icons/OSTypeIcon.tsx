'use client';

import { 
  SiLinux, 
  SiMacos, 
  SiFreebsd,
  SiOpenbsd
} from 'react-icons/si';
import { FaApple, FaQuestion } from 'react-icons/fa';
import { DiWindows } from 'react-icons/di';

interface OSTypeIconProps {
  osType: string;
  className?: string;
}

export default function OSTypeIcon({ osType, className = "w-6 h-6" }: OSTypeIconProps) {
  const osTypeLower = osType.toLowerCase();

  // Windows
  if (osTypeLower === 'windows') {
    return <DiWindows className={`${className} text-blue-600`} />;
  }
  
  // macOS
  if (osTypeLower === 'macos' || osTypeLower === 'mac os') {
    return <SiMacos className={`${className} text-gray-600`} />;
  }
  
  // Linux
  if (osTypeLower === 'linux') {
    return <SiLinux className={`${className} text-gray-700`} />;
  }
  
  // BSD variants
  if (osTypeLower === 'freebsd') {
    return <SiFreebsd className={`${className} text-red-600`} />;
  }
  
  if (osTypeLower === 'openbsd') {
    return <SiOpenbsd className={`${className} text-red-600`} />;
  }
  
  if (osTypeLower === 'bsd') {
    return <FaApple className={`${className} text-gray-600`} />;
  }
  
  // Unknown OS fallback
  return <FaQuestion className={`${className} text-gray-500`} />;
}
