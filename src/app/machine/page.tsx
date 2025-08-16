'use client';

import { useState, useEffect } from 'react';

export default function Machine() {
  const [machineName, setMachineName] = useState<string>('');

  useEffect(() => {
    // Get actual machine hostname from system
    fetch('/api/machine/hostname')
      .then(response => response.json())
      .then(data => setMachineName(data.hostname))
      .catch(() => {
        // Fallback: try to get from navigator or use a default
        setMachineName(navigator.userAgent.includes('Linux') ? 'Linux Machine' : 
                      navigator.userAgent.includes('Windows') ? 'Windows Machine' :
                      navigator.userAgent.includes('Mac') ? 'Mac Machine' : 'Unknown Machine');
      });
  }, []);

  return (
    <div className="min-h-[calc(100vh-4rem)] p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Machine Information</h1>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-700 mb-2">Machine Name</h2>
            <p className="text-2xl font-bold text-gray-900">{machineName}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
