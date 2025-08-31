'use client';

import { useState, useEffect } from 'react';
import { machineInfo } from '../workflows/models';
import OSIcon from '../components/OSIcon';
import CPUIcon from '../components/CPUIcon';
import MachineIcon from '../components/MachineIcon';
import KernelIcon from '../components/KernelIcon';

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
                  {item.label === 'Machine Model' && (
                    <MachineIcon machineModel={item.value} className="w-6 h-6" />
                  )}
                  {item.label === 'Kernel Version' && (
                    <KernelIcon kernelVersion={item.value} className="w-6 h-6" />
                  )}
                  <p className="text-lg font-semibold text-gray-900">{item.value}</p>
                </div>
              </div>
            ))}
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


      </div>
    </div>
  );
}
