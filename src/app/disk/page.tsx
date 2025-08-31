'use client';

import { useState, useEffect } from 'react';
import { machineInfo } from '../workflows/models';

export default function Disk() {
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
        <div className="text-xl text-gray-600">Loading disk information...</div>
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
        <div className="text-xl text-gray-600">No disk information available</div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Disk Information</h1>
        
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