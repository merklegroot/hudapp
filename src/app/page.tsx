'use client';

import { useState, useEffect } from 'react';
import { machineInfo } from './workflows/models';
import OSIcon from './components/OSIcon';
import CPUIcon from './components/CPUIcon';
import MachineIcon from './components/MachineIcon';
import KernelIcon from './components/KernelIcon';

export default function Home() {
  const [machineInfo, setMachineInfo] = useState<machineInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('Home component mounted, fetching data...');
    
    fetch('/api/machine/hostname')
      .then(response => {
        console.log('API response status:', response.status);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        console.log('API data received:', data);
        setMachineInfo(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching machine info:', err);
        setError('Failed to fetch machine information');
        setLoading(false);
      });
  }, []);

  console.log('Render state:', { loading, error, machineInfo: !!machineInfo });

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] p-8 flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading machine information...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[calc(100vh-4rem)] p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-8">Machine Information</h1>
          
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            <strong>Error:</strong> {error}
          </div>
          
          {/* Show enhanced CPU information even when data fetching fails */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">CPU Details (Static)</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="text-sm font-medium text-gray-600 mb-1">Model</h3>
                <div className="flex items-center gap-2">
                  <CPUIcon cpuInfo="Intel(R) Xeon(R) Processor" className="w-6 h-6" />
                  <p className="text-lg font-semibold text-gray-900">Intel(R) Xeon(R) Processor</p>
                </div>
              </div>
              
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="text-sm font-medium text-gray-600 mb-1">Cores / Threads</h3>
                <p className="text-lg font-semibold text-gray-900">2 cores, 4 threads</p>
              </div>
              
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="text-sm font-medium text-gray-600 mb-1">Architecture</h3>
                <p className="text-lg font-semibold text-gray-900">x86_64</p>
              </div>
              
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="text-sm font-medium text-gray-600 mb-1">Frequency</h3>
                <p className="text-lg font-semibold text-gray-900">2400.00 MHz</p>
              </div>
              
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="text-sm font-medium text-gray-600 mb-1">Cache</h3>
                <p className="text-lg font-semibold text-gray-900">327680 KB</p>
              </div>
              
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="text-sm font-medium text-gray-600 mb-1">Vendor</h3>
                <p className="text-lg font-semibold text-gray-900">GenuineIntel</p>
              </div>
              
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="text-sm font-medium text-gray-600 mb-1">Family</h3>
                <p className="text-lg font-semibold text-gray-900">6</p>
              </div>
              
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="text-sm font-medium text-gray-600 mb-1">Stepping</h3>
                <p className="text-lg font-semibold text-gray-900">2</p>
              </div>
            </div>
          </div>
        </div>
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

        {/* CPU Information */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">CPU Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="text-sm font-medium text-gray-600 mb-1">Model</h3>
              <div className="flex items-center gap-2">
                <CPUIcon cpuInfo={machineInfo.cpuDetailed.model} className="w-6 h-6" />
                <p className="text-lg font-semibold text-gray-900">{machineInfo.cpuDetailed.model}</p>
              </div>
            </div>
            
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="text-sm font-medium text-gray-600 mb-1">Cores / Threads</h3>
              <p className="text-lg font-semibold text-gray-900">
                {machineInfo.cpuDetailed.cores} cores, {machineInfo.cpuDetailed.threads} threads
              </p>
            </div>
            
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="text-sm font-medium text-gray-600 mb-1">Architecture</h3>
              <p className="text-lg font-semibold text-gray-900">{machineInfo.cpuDetailed.architecture}</p>
            </div>
            
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="text-sm font-medium text-gray-600 mb-1">Frequency</h3>
              <div className="space-y-1">
                <p className="text-lg font-semibold text-gray-900">
                  Current: <span className="text-blue-600">{machineInfo.cpuDetailed.currentFrequency}</span>
                </p>
                <p className="text-sm text-gray-600">
                  Max: {machineInfo.cpuDetailed.maxFrequency} | Min: {machineInfo.cpuDetailed.minFrequency}
                </p>
              </div>
            </div>
            
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="text-sm font-medium text-gray-600 mb-1">Cache</h3>
              <p className="text-lg font-semibold text-gray-900">{machineInfo.cpuDetailed.cache}</p>
            </div>
            
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="text-sm font-medium text-gray-600 mb-1">Vendor</h3>
              <p className="text-lg font-semibold text-gray-900">{machineInfo.cpuDetailed.vendor}</p>
            </div>
            
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="text-sm font-medium text-gray-600 mb-1">Family</h3>
              <p className="text-lg font-semibold text-gray-900">{machineInfo.cpuDetailed.family}</p>
            </div>
            
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="text-sm font-medium text-gray-600 mb-1">Stepping</h3>
              <p className="text-lg font-semibold text-gray-900">{machineInfo.cpuDetailed.stepping}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
