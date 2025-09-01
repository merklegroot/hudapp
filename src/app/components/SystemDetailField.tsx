import React from 'react';
import OSIcon from './OSIcon';
import MachineIcon from './MachineIcon';
import CPUIcon from './CPUIcon';
import KernelIcon from './KernelIcon';

interface SystemDetailFieldProps {
  label: string;
  value: string;
  className?: string;
}

export default function SystemDetailField({ label, value, className = "" }: SystemDetailFieldProps) {
  const renderIcon = () => {
    switch (label) {
      case 'Operating System':
        return <OSIcon osName={value} className="w-6 h-6" />;
      case 'Machine Model':
        return <MachineIcon machineModel={value} className="w-6 h-6" />;
      case 'CPU Model':
        return <CPUIcon cpuInfo={value} className="w-6 h-6" />;
      case 'Kernel Version':
        return <KernelIcon kernelVersion={value} className="w-6 h-6" />;
      default:
        return null;
    }
  };

  return (
    <div className={`p-4 bg-gray-50 rounded-lg ${className}`}>
      <h3 className="text-sm font-medium text-gray-600 mb-1">{label}</h3>
      <div className="flex items-center gap-2">
        {renderIcon()}
        <p className="text-lg font-semibold text-gray-900">{value}</p>
      </div>
    </div>
  );
}
