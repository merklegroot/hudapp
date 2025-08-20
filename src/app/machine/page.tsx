'use client';

import { useState, useEffect } from 'react';
import { machineInfo } from '../workflows/models';
import OSIcon from '../components/OSIcon';
import CPUIcon from '../components/CPUIcon';

export default function Machine() {
  const [machineInfo, setMachineInfo] = useState<machineInfo | null>(null);
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
                <div className="flex items-center gap-2">
                  {item.label === 'Operating System' && (
                    <OSIcon osName={item.value} className="w-6 h-6" />
                  )}
                  {item.label === 'CPU' && (
                    <CPUIcon cpuInfo={item.value} className="w-6 h-6" />
                  )}
                  <p className="text-lg font-semibold text-gray-900">{item.value}</p>
                </div>
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
