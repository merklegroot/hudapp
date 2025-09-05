'use client';

import { 
  SiDocker,
  SiKubernetes,
  SiVmware,
  SiVirtualbox,
  SiOracle
} from 'react-icons/si';
import { 
  FaServer, 
  FaQuestion, 
  FaCubes,
  FaDesktop,
  FaCloud
} from 'react-icons/fa';
import { HiDesktopComputer } from 'react-icons/hi';

interface VirtualizationIconProps {
  virtualization: string;
  className?: string;
}

export default function VirtualizationIcon({ virtualization, className = "w-6 h-6" }: VirtualizationIconProps) {
  const virtLower = virtualization.toLowerCase();

  // Docker Container
  if (virtLower.includes('docker')) {
    return <SiDocker className={`${className} text-blue-500`} />;
  }
  
  // Kubernetes/Container orchestration
  if (virtLower.includes('kubernetes') || virtLower.includes('k8s') || 
      virtLower.includes('containerd') || virtLower.includes('crio') || 
      virtLower.includes('podman')) {
    return <SiKubernetes className={`${className} text-blue-600`} />;
  }
  
  // VMware
  if (virtLower.includes('vmware')) {
    return <SiVmware className={`${className} text-green-600`} />;
  }
  
  // VirtualBox
  if (virtLower.includes('virtualbox')) {
    return <SiVirtualbox className={`${className} text-blue-700`} />;
  }
  
  // Microsoft/Hyper-V
  if (virtLower.includes('microsoft') || virtLower.includes('hyper-v') || 
      virtLower.includes('wsl')) {
    return <FaServer className={`${className} text-blue-600`} />;
  }
  
  // QEMU
  if (virtLower.includes('qemu')) {
    return <FaServer className={`${className} text-purple-600`} />;
  }
  
  // KVM (often uses QEMU)
  if (virtLower.includes('kvm')) {
    return <FaServer className={`${className} text-purple-500`} />;
  }
  
  // Xen
  if (virtLower.includes('xen')) {
    return <FaServer className={`${className} text-orange-600`} />;
  }
  
  // Parallels
  if (virtLower.includes('parallels')) {
    return <FaServer className={`${className} text-blue-500`} />;
  }
  
  // Oracle VM
  if (virtLower.includes('oracle')) {
    return <SiOracle className={`${className} text-red-600`} />;
  }
  
  // Generic containers
  if (virtLower.includes('container') || virtLower.includes('lxc') || 
      virtLower.includes('openvz') || virtLower.includes('systemd-nspawn')) {
    return <FaCubes className={`${className} text-cyan-600`} />;
  }
  
  // Generic virtual machines
  if (virtLower.includes('virtual machine') || virtLower.includes('vm') || 
      virtLower.includes('bhyve')) {
    return <FaServer className={`${className} text-indigo-600`} />;
  }
  
  // Cloud environments
  if (virtLower.includes('cloud') || virtLower.includes('aws') || 
      virtLower.includes('azure') || virtLower.includes('gcp') || 
      virtLower.includes('digital ocean') || virtLower.includes('linode')) {
    return <FaCloud className={`${className} text-sky-500`} />;
  }
  
  // Physical hardware
  if (virtLower.includes('physical') || virtLower.includes('hardware') || 
      virtLower.includes('bare metal')) {
    return <HiDesktopComputer className={`${className} text-gray-700`} />;
  }
  
  // Unknown virtualization
  return <FaQuestion className={`${className} text-gray-500`} />;
}
