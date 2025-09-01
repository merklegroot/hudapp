import React from 'react';
import CPUIcon from './CPUIcon';

interface CPUDetailFieldProps {
  value: string;
  className?: string;
}

export default function CPUDetailField({ 
  value, 
  className = "" 
}: CPUDetailFieldProps) {
  return (
    <div className={`p-4 bg-gray-50 rounded-lg ${className}`}>
      <h3 className="text-sm font-medium text-gray-600 mb-1">CPU Model</h3>
      <div className="flex items-center gap-2">
        <CPUIcon cpuInfo={value} className="w-6 h-6" />
        <p className="text-lg font-semibold text-gray-900">{value}</p>
      </div>
    </div>
  );
}
