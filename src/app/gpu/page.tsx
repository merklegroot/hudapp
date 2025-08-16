'use client';

import { useState, useEffect } from 'react';
import { machineInfo } from '../workflows/models';
import GpuSection from '../components/GpuSection';

export default function GPU() {
  const [machineInfo, setMachineInfo] = useState<machineInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/gpu')
      .then(response => response.json())
      .then(data => {
        // Create a minimal machineInfo object with just the GPU data
        setMachineInfo({ gpus: data } as machineInfo);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching GPU info:', err);
        setError('Failed to fetch GPU information');
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] p-8 flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading GPU information...</div>
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
        <div className="text-xl text-gray-600">No GPU information available</div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Graphics Cards</h1>
        
        {/* GPU Information */}
        <GpuSection gpus={machineInfo.gpus} />
      </div>
    </div>
  );
}
