'use client';

import { useState, useEffect } from 'react';
import { machineInfo } from './workflows/models';
import SystemDetailField from './components/SystemDetailField';
import OSTypeIcon from './components/Icons/OSTypeIcon';

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
          
          <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded mb-6">
            <strong>Info:</strong> Machine information is temporarily unavailable. Please try refreshing the page.
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
    { label: 'CPU Model', value: machineInfo.cpuDetailed.model },
    { label: 'Operating System', value: machineInfo.osName },
    { label: 'Kernel Version', value: machineInfo.kernelVersion },
  ];

  return (
    <div className="min-h-[calc(100vh-4rem)] p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Machine Information</h1>
        
        <div className="flex gap-8">
          {/* Left Panel - OS Type */}
          <div className="flex-shrink-0 w-80">
            <div className="bg-gray-50 rounded-lg p-8 text-center">
              <div className="flex flex-col items-center space-y-4">
                <OSTypeIcon osType={machineInfo.osType} className="w-24 h-24" />
                <div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">OS Type</h3>
                  <p className="text-3xl font-semibold text-gray-900">{machineInfo.osType}</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Right Panel - System Information */}
          <div className="flex-1">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">System Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {infoItems.map((item, index) => (
                  <SystemDetailField
                    key={index}
                    label={item.label}
                    value={item.value}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
