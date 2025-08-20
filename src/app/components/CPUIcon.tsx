'use client';

import { 
  SiAmd, 
  SiIntel,
  SiArm,
  SiQualcomm
} from 'react-icons/si';
import { FaMicrochip, FaQuestion } from 'react-icons/fa';

interface CPUIconProps {
  cpuInfo: string;
  className?: string;
}

export default function CPUIcon({ cpuInfo, className = "w-6 h-6" }: CPUIconProps) {
  const cpuLower = cpuInfo.toLowerCase();

  // Intel CPU detection
  if (cpuLower.includes('intel') || cpuLower.includes('core i') || 
      cpuLower.includes('xeon') || cpuLower.includes('pentium') || 
      cpuLower.includes('celeron') || cpuLower.includes('atom')) {
    return <SiIntel className={`${className} text-blue-600`} />;
  }
  
  // AMD CPU detection
  if (cpuLower.includes('amd') || cpuLower.includes('ryzen') || 
      cpuLower.includes('threadripper') || cpuLower.includes('epyc') || 
      cpuLower.includes('athlon') || cpuLower.includes('fx-') ||
      cpuLower.includes('a4-') || cpuLower.includes('a6-') || 
      cpuLower.includes('a8-') || cpuLower.includes('a10-') || 
      cpuLower.includes('a12-')) {
    return <SiAmd className={`${className} text-red-600`} />;
  }
  
  // ARM CPU detection
  if (cpuLower.includes('arm') || cpuLower.includes('cortex') || 
      cpuLower.includes('apple m1') || cpuLower.includes('apple m2') || 
      cpuLower.includes('apple m3') || cpuLower.includes('apple m4') ||
      cpuLower.includes('snapdragon') || cpuLower.includes('exynos') ||
      cpuLower.includes('kirin') || cpuLower.includes('mediatek') ||
      cpuLower.includes('allwinner') || cpuLower.includes('rockchip') ||
      cpuLower.includes('broadcom') || cpuLower.includes('raspberry pi')) {
    return <SiArm className={`${className} text-green-600`} />;
  }
  
  // Qualcomm (often ARM-based but distinct brand)
  if (cpuLower.includes('qualcomm')) {
    return <SiQualcomm className={`${className} text-purple-600`} />;
  }
  
  // RISC-V detection
  if (cpuLower.includes('risc') || cpuLower.includes('riscv') || 
      cpuLower.includes('risc-v') || cpuLower.includes('sifive')) {
    return <FaMicrochip className={`${className} text-orange-600`} />;
  }
  
  // PowerPC detection
  if (cpuLower.includes('powerpc') || cpuLower.includes('ppc') || 
      cpuLower.includes('power') || cpuLower.includes('cell')) {
    return <FaMicrochip className={`${className} text-purple-500`} />;
  }
  
  // SPARC detection
  if (cpuLower.includes('sparc') || cpuLower.includes('ultrasparc')) {
    return <FaMicrochip className={`${className} text-yellow-600`} />;
  }
  
  // MIPS detection
  if (cpuLower.includes('mips')) {
    return <FaMicrochip className={`${className} text-blue-500`} />;
  }
  
  // Generic CPU fallback
  if (cpuLower.includes('cpu') || cpuLower.includes('processor')) {
    return <FaMicrochip className={`${className} text-gray-600`} />;
  }
  
  // Unknown CPU fallback
  return <FaQuestion className={`${className} text-gray-500`} />;
}
