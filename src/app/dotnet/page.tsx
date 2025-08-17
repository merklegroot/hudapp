'use client';

import { useState, useEffect } from 'react';

interface DotnetInfo {
  isInstalled: boolean;
  sdks: string[];
  runtimes: string[];
  error?: string;
}

export default function Dotnet() {
  const [dotnetInfo, setDotnetInfo] = useState<DotnetInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/dotnet')
      .then(response => response.json() as Promise<DotnetInfo>)
      .then(data => {
        setDotnetInfo(data);
        setLoading(false);
      })
      .catch((err: Error) => {
        console.error('Error fetching dotnet info:', err);
        setError('Failed to fetch dotnet information');
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] p-8 flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading dotnet information...</div>
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

  if (!dotnetInfo) {
    return (
      <div className="min-h-[calc(100vh-4rem)] p-8 flex items-center justify-center">
        <div className="text-xl text-gray-600">No dotnet information available</div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">dotnet</h1>
        
        {!dotnetInfo.isInstalled ? (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">
                  dotnet is not installed
                </h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>The .NET SDK and runtime are not currently installed on this machine.</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* SDKs Section */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">Installed SDKs</h2>
              {dotnetInfo.sdks.length > 0 ? (
                <div className="space-y-2">
                  {dotnetInfo.sdks.map((sdk, index) => (
                    <div key={index} className="p-3 bg-gray-50 rounded-lg">
                      <code className="text-sm font-mono text-gray-900">{sdk}</code>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600">No SDKs found</p>
              )}
            </div>

            {/* Runtimes Section */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">Installed Runtimes</h2>
              {dotnetInfo.runtimes.length > 0 ? (
                <div className="space-y-2">
                  {dotnetInfo.runtimes.map((runtime, index) => (
                    <div key={index} className="p-3 bg-gray-50 rounded-lg">
                      <code className="text-sm font-mono text-gray-900">{runtime}</code>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600">No runtimes found</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
