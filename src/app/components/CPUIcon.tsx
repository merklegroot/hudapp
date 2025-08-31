'use client';

import { 
  SiAmd, 
  SiIntel,
  SiArm,
  SiQualcomm
} from 'react-icons/si';
import { FaMicrochip, FaQuestion, FaServer } from 'react-icons/fa';
import { HiChip } from 'react-icons/hi';

interface CPUIconProps {
  cpuInfo: string;
  className?: string;
}

interface ProcessorIcons {
  manufacturer: React.ReactNode;
  type: React.ReactNode;
}

export default function CPUIcon({ cpuInfo, className = "w-6 h-6" }: CPUIconProps) {
  const cpuLower = cpuInfo.toLowerCase();

  const getProcessorIcons = (): ProcessorIcons => {
    // Intel CPU detection with specific types
    if (cpuLower.includes('intel')) {
      const manufacturer = <SiIntel className={`${className} text-blue-600`} />;
      
      let type;
      if (cpuLower.includes('xeon')) {
        type = <FaServer className={`${className} text-blue-700`} />;
      } else if (cpuLower.includes('core i')) {
        type = <HiChip className={`${className} text-blue-500`} />;
      } else if (cpuLower.includes('pentium')) {
        type = <FaMicrochip className={`${className} text-blue-400`} />;
      } else if (cpuLower.includes('celeron')) {
        type = <FaMicrochip className={`${className} text-blue-300`} />;
      } else if (cpuLower.includes('atom')) {
        type = <FaMicrochip className={`${className} text-blue-200`} />;
      } else {
        type = <HiChip className={`${className} text-blue-500`} />;
      }
      
      return { manufacturer, type };
    }
    
    // AMD CPU detection with specific types
    if (cpuLower.includes('amd')) {
      const manufacturer = <SiAmd className={`${className} text-red-600`} />;
      
      let type;
      if (cpuLower.includes('ryzen')) {
        type = <HiChip className={`${className} text-red-500`} />;
      } else if (cpuLower.includes('threadripper')) {
        type = <FaServer className={`${className} text-red-700`} />;
      } else if (cpuLower.includes('epyc')) {
        type = <FaServer className={`${className} text-red-800`} />;
      } else if (cpuLower.includes('athlon')) {
        type = <FaMicrochip className={`${className} text-red-400`} />;
      } else if (cpuLower.includes('fx-') || cpuLower.includes('a4-') || 
                 cpuLower.includes('a6-') || cpuLower.includes('a8-') || 
                 cpuLower.includes('a10-') || cpuLower.includes('a12-')) {
        type = <FaMicrochip className={`${className} text-red-300`} />;
      } else {
        type = <HiChip className={`${className} text-red-500`} />;
      }
      
      return { manufacturer, type };
    }
    
    // ARM CPU detection with specific types
    if (cpuLower.includes('arm') || cpuLower.includes('cortex') || 
        cpuLower.includes('apple m1') || cpuLower.includes('apple m2') || 
        cpuLower.includes('apple m3') || cpuLower.includes('apple m4') ||
        cpuLower.includes('snapdragon') || cpuLower.includes('exynos') ||
        cpuLower.includes('kirin') || cpuLower.includes('mediatek') ||
        cpuLower.includes('allwinner') || cpuLower.includes('rockchip') ||
        cpuLower.includes('broadcom') || cpuLower.includes('raspberry pi')) {
      
      let manufacturer;
      if (cpuLower.includes('apple m')) {
        manufacturer = <FaMicrochip className={`${className} text-gray-700`} />;
      } else if (cpuLower.includes('snapdragon')) {
        manufacturer = <SiQualcomm className={`${className} text-purple-600`} />;
      } else {
        manufacturer = <SiArm className={`${className} text-green-600`} />;
      }
      
      let type;
      if (cpuLower.includes('cortex')) {
        type = <HiChip className={`${className} text-green-500`} />;
      } else if (cpuLower.includes('apple m')) {
        type = <HiChip className={`${className} text-gray-500`} />;
      } else if (cpuLower.includes('snapdragon')) {
        type = <HiChip className={`${className} text-purple-500`} />;
      } else {
        type = <HiChip className={`${className} text-green-500`} />;
      }
      
      return { manufacturer, type };
    }
    
    // Qualcomm (often ARM-based but distinct brand)
    if (cpuLower.includes('qualcomm')) {
      const manufacturer = <SiQualcomm className={`${className} text-purple-600`} />;
      const type = <HiChip className={`${className} text-purple-500`} />;
      return { manufacturer, type };
    }
    
    // RISC-V detection
    if (cpuLower.includes('risc') || cpuLower.includes('riscv') || 
        cpuLower.includes('risc-v') || cpuLower.includes('sifive')) {
      const manufacturer = <FaMicrochip className={`${className} text-orange-600`} />;
      const type = <HiChip className={`${className} text-orange-500`} />;
      return { manufacturer, type };
    }
    
    // PowerPC detection
    if (cpuLower.includes('powerpc') || cpuLower.includes('ppc') || 
        cpuLower.includes('power') || cpuLower.includes('cell')) {
      const manufacturer = <FaMicrochip className={`${className} text-purple-500`} />;
      const type = <HiChip className={`${className} text-purple-400`} />;
      return { manufacturer, type };
    }
    
    // SPARC detection
    if (cpuLower.includes('sparc') || cpuLower.includes('ultrasparc')) {
      const manufacturer = <FaMicrochip className={`${className} text-yellow-600`} />;
      const type = <HiChip className={`${className} text-yellow-500`} />;
      return { manufacturer, type };
    }
    
    // MIPS detection
    if (cpuLower.includes('mips')) {
      const manufacturer = <FaMicrochip className={`${className} text-blue-500`} />;
      const type = <HiChip className={`${className} text-blue-400`} />;
      return { manufacturer, type };
    }
    
    // Generic CPU fallback
    if (cpuLower.includes('cpu') || cpuLower.includes('processor')) {
      const manufacturer = <FaMicrochip className={`${className} text-gray-600`} />;
      const type = <HiChip className={`${className} text-gray-500`} />;
      return { manufacturer, type };
    }
    
    // Unknown CPU fallback
    const manufacturer = <FaQuestion className={`${className} text-gray-500`} />;
    const type = <FaQuestion className={`${className} text-gray-400`} />;
    return { manufacturer, type };
  };

  const { manufacturer, type } = getProcessorIcons();

  return (
    <div className="flex items-center gap-1">
      {manufacturer}
      {type}
    </div>
  );
}
