'use client';

import { useState, useEffect } from 'react';
import { gpuInfo } from '../workflows/models/gpuInfo';
import GpuSection from '../components/GpuSection';

export default function GPU() {
  const [gpuInfo, setGpuInfo] = useState<gpuInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/gpu')
      .then(response => response.json() as Promise<gpuInfo>)
      .then(data => {
        setGpuInfo(data);
        setLoading(false);
      })
      .catch((err: Error) => {
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

  if (!gpuInfo) {
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
        <GpuSection gpuInfo={gpuInfo} />
      </div>
    </div>
  );
}
