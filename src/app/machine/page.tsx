'use client';

import { useState, useEffect } from 'react';

interface DiskInfo {
  mount: string;
  total: string;
  used: string;
  available: string;
  usedPercent: number;
  filesystem: string;
}

interface PhysicalDisk {
  device: string;
  size: string;
  model: string;
  type: string;
}

interface TopProcess {
  pid: string;
  name: string;
  memoryUsage: string;
  memoryPercent: number;
  memoryAbsolute: string;
}

interface GPUInfo {
  name: string;
  memoryTotal: string;
  memoryUsed: string;
  memoryFree: string;
  utilization: number;
  temperature: number;
  driver: string;
  index: number;
}

interface MachineInfo {
  hostname: string;
  localIP: string;
  machineModel: string;
  cpuInfo: string;
  kernelVersion: string;
  osName: string;
  totalRAM: string;
  freeRAM: string;
  usedRAM: string;
  disks: DiskInfo[];
  physicalDisks: PhysicalDisk[];
  topProcesses: TopProcess[];
  gpus: GPUInfo[];
}

export default function Machine() {
  const [machineInfo, setMachineInfo] = useState<MachineInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/machine/hostname')
      .then(response => response.json())
      .then(data => {
        setMachineInfo(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching machine info:', err);
        setError('Failed to fetch machine information');
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] p-8 flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading machine information...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[calc(100vh-4rem)] p-8 flex items-center justify-center">
        <div className="text-xl text-red-600">{error}</div>
      </div>
    );
  }

  if (!machineInfo) {
    return (
      <div className="min-h-[calc(100vh-4rem)] p-8 flex items-center justify-center">
        <div className="text-xl text-gray-600">No machine information available</div>
      </div>
    );
  }

  const infoItems = [
    { label: 'Machine Name', value: machineInfo.hostname },
    { label: 'Local IP Address', value: machineInfo.localIP },
    { label: 'Machine Model', value: machineInfo.machineModel },
    { label: 'CPU', value: machineInfo.cpuInfo },
    { label: 'Operating System', value: machineInfo.osName },
    { label: 'Kernel Version', value: machineInfo.kernelVersion },
  ];

  const memoryItems = [
    { label: 'Total RAM', value: machineInfo.totalRAM },
    { label: 'Free RAM', value: machineInfo.freeRAM },
    { label: 'Used RAM', value: machineInfo.usedRAM },
  ];

  // Calculate RAM usage percentage
  const calculateRAMUsage = () => {
    // Extract numeric values from formatted strings (e.g., "8.5 GiB" -> 8.5)
    const totalStr = machineInfo.totalRAM.split(' ')[0];
    const freeStr = machineInfo.freeRAM.split(' ')[0];
    const total = parseFloat(totalStr) || 0;
    const free = parseFloat(freeStr) || 0;
    const used = total - free;
    const usedPercent = total > 0 ? Math.round((used / total) * 100) : 0;
    return usedPercent;
  };

  const ramUsagePercent = calculateRAMUsage();

  return (
    <div className="min-h-[calc(100vh-4rem)] p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Machine Information</h1>
        
        {/* System Information */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">System Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {infoItems.map((item, index) => (
              <div key={index} className="p-4 bg-gray-50 rounded-lg">
                <h3 className="text-sm font-medium text-gray-600 mb-1">{item.label}</h3>
                <p className="text-lg font-semibold text-gray-900">{item.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Memory Information */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Memory Usage</h2>
          
          {/* RAM Usage Bar */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-semibold text-gray-900">RAM Usage</h3>
              <span className="text-sm text-gray-600">{ramUsagePercent}% used</span>
            </div>
            
            <div className="w-full bg-gray-200 rounded-full h-4 mb-3">
              <div 
                className={`h-4 rounded-full ${
                  ramUsagePercent > 90 ? 'bg-red-500' : 
                  ramUsagePercent > 75 ? 'bg-yellow-500' : 'bg-green-500'
                }`}
                style={{ width: `${ramUsagePercent}%` }}
              ></div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {memoryItems.map((item, index) => (
              <div key={index} className="p-4 bg-gray-50 rounded-lg">
                <h3 className="text-sm font-medium text-gray-600 mb-1">{item.label}</h3>
                <p className="text-lg font-semibold text-gray-900">{item.value}</p>
              </div>
            ))}
          </div>

          {/* Top Processes */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Top RAM Consuming Processes</h3>
            {machineInfo.topProcesses && machineInfo.topProcesses.length > 0 ? (
              <div className="space-y-2">
                {machineInfo.topProcesses.map((process, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <span className="flex items-center justify-center w-6 h-6 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                        {index + 1}
                      </span>
                      <div>
                        <p className="font-medium text-gray-900">{process.name}</p>
                        <p className="text-xs text-gray-500">PID: {process.pid}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">{process.memoryAbsolute}</p>
                      <p className="text-sm text-gray-600">{process.memoryUsage}</p>
                      {process.memoryPercent > 0 && (
                        <div className="w-20 bg-gray-200 rounded-full h-2 mt-1">
                          <div 
                            className="bg-blue-500 h-2 rounded-full"
                            style={{ width: `${Math.min(process.memoryPercent * 2, 100)}%` }}
                          ></div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600">No process information available</p>
            )}
          </div>
        </div>

        {/* GPU Information */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Graphics Cards</h2>
          {machineInfo.gpus && machineInfo.gpus.length > 0 ? (
            <div className="space-y-4">
              {machineInfo.gpus.map((gpu, index) => (
                <div key={index} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-lg font-semibold text-gray-900">
                      GPU {gpu.index}: {gpu.name}
                    </h3>
                    <div className="flex gap-2">
                      {gpu.utilization > 0 && (
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          gpu.utilization > 80 ? 'bg-red-100 text-red-800' : 
                          gpu.utilization > 50 ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                        }`}>
                          {gpu.utilization}% usage
                        </span>
                      )}
                      {gpu.temperature > 0 && (
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          gpu.temperature > 80 ? 'bg-red-100 text-red-800' : 
                          gpu.temperature > 60 ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {gpu.temperature}°C
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {/* GPU Memory Usage Bar */}
                  {gpu.memoryTotal !== 'Unknown' && gpu.memoryUsed !== 'Unknown' && (
                    <div className="mb-3">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm text-gray-600">VRAM Usage</span>
                        <span className="text-sm text-gray-600">
                          {gpu.memoryUsed} / {gpu.memoryTotal}
                        </span>
                      </div>
                      
                      {(() => {
                        // Calculate memory usage percentage
                        const totalStr = gpu.memoryTotal.split(' ')[0];
                        const usedStr = gpu.memoryUsed.split(' ')[0];
                        const total = parseFloat(totalStr) || 0;
                        const used = parseFloat(usedStr) || 0;
                        const usedPercent = total > 0 ? Math.round((used / total) * 100) : 0;
                        
                        return (
                          <div className="w-full bg-gray-200 rounded-full h-3">
                            <div 
                              className={`h-3 rounded-full ${
                                usedPercent > 90 ? 'bg-red-500' : 
                                usedPercent > 75 ? 'bg-yellow-500' : 'bg-blue-500'
                              }`}
                              style={{ width: `${usedPercent}%` }}
                            ></div>
                          </div>
                        );
                      })()}
                    </div>
                  )}
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
                    <div>
                      <span className="text-gray-600">Total VRAM:</span>
                      <span className="ml-1 font-medium">{gpu.memoryTotal}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Used VRAM:</span>
                      <span className="ml-1 font-medium">{gpu.memoryUsed}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Free VRAM:</span>
                      <span className="ml-1 font-medium">{gpu.memoryFree}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Driver:</span>
                      <span className="ml-1 font-medium">{gpu.driver}</span>
                    </div>
                  </div>
                  
                  {/* Utilization Bar */}
                  {gpu.utilization > 0 && (
                    <div className="mt-3">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm text-gray-600">GPU Utilization</span>
                        <span className="text-sm text-gray-600">{gpu.utilization}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div 
                          className={`h-3 rounded-full ${
                            gpu.utilization > 90 ? 'bg-red-500' : 
                            gpu.utilization > 75 ? 'bg-yellow-500' : 'bg-green-500'
                          }`}
                          style={{ width: `${gpu.utilization}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600">No GPU information available</p>
          )}
        </div>

        {/* Physical Disks */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Physical Disks</h2>
          {machineInfo.physicalDisks && machineInfo.physicalDisks.length > 0 ? (
            <div className="space-y-4">
              {machineInfo.physicalDisks.map((disk, index) => (
                <div key={index} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{disk.device}</h3>
                    <div className="flex gap-2">
                      {disk.type !== 'Unknown' && (
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          disk.type === 'SSD' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {disk.type}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-gray-600">Size:</span>
                      <span className="ml-1 font-medium text-lg">{disk.size}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Model:</span>
                      <span className="ml-1 font-medium">{disk.model}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600">No physical disk information available</p>
          )}
        </div>

        {/* Disk Usage (Partitions/Mounts) */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Disk Usage (Partitions)</h2>
          {machineInfo.disks && machineInfo.disks.length > 0 ? (
            <div className="space-y-4">
              {machineInfo.disks.map((disk, index) => (
                <div key={index} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{disk.mount}</h3>
                    <span className="text-sm text-gray-600">{disk.filesystem}</span>
                  </div>
                  
                  {/* Usage bar */}
                  <div className="w-full bg-gray-200 rounded-full h-3 mb-3">
                    <div 
                      className={`h-3 rounded-full ${
                        disk.usedPercent > 90 ? 'bg-red-500' : 
                        disk.usedPercent > 75 ? 'bg-yellow-500' : 'bg-green-500'
                      }`}
                      style={{ width: `${disk.usedPercent}%` }}
                    ></div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                    <div>
                      <span className="text-gray-600">Total:</span>
                      <span className="ml-1 font-medium">{disk.total}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Used:</span>
                      <span className="ml-1 font-medium">{disk.used}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Available:</span>
                      <span className="ml-1 font-medium">{disk.available}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Usage:</span>
                      <span className="ml-1 font-medium">{disk.usedPercent}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600">No disk usage information available</p>
          )}
        </div>
      </div>
    </div>
  );
}
