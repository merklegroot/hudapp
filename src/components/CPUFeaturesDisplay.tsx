'use client';

import React, { useState, useEffect } from 'react';
import { CPUFeatures, detectCPUFeatures, getBasicCPUInfo } from '../utils/cpuFeatures';

interface CPUInfo {
  model: string;
  architecture: string;
  platform: string;
  cores: number;
  speed: string | number;
  endianness: string;
}

export default function CPUFeaturesDisplay() {
  const [cpuFeatures, setCpuFeatures] = useState<CPUFeatures | null>(null);
  const [basicInfo, setBasicInfo] = useState<CPUInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const detectFeatures = async () => {
      try {
        setLoading(true);
        
        // Get basic CPU info
        const basic = getBasicCPUInfo();
        setBasicInfo(basic);
        
        // Get detailed CPU features
        const features = detectCPUFeatures();
        setCpuFeatures(features);
        
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to detect CPU features');
        setLoading(false);
      }
    };

    detectFeatures();
  }, []);

  const FeatureBadge = ({ supported, label }: { supported: boolean; label: string }) => (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
      supported 
        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' 
        : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
    }`}>
      {supported ? '✓' : '✗'} {label}
    </span>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Detecting CPU features...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800 dark:text-red-200">Error</h3>
            <div className="mt-2 text-sm text-red-700 dark:text-red-300">{error}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Basic CPU Information */}
      {basicInfo && (
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            CPU Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Model</dt>
              <dd className="mt-1 text-sm text-gray-900 dark:text-white">{basicInfo.model}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Architecture</dt>
              <dd className="mt-1 text-sm text-gray-900 dark:text-white">{basicInfo.architecture}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Platform</dt>
              <dd className="mt-1 text-sm text-gray-900 dark:text-white">{basicInfo.platform}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Cores</dt>
              <dd className="mt-1 text-sm text-gray-900 dark:text-white">{basicInfo.cores}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Speed</dt>
              <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                {typeof basicInfo.speed === 'number' ? `${basicInfo.speed} MHz` : basicInfo.speed}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Endianness</dt>
              <dd className="mt-1 text-sm text-gray-900 dark:text-white">{basicInfo.endianness}</dd>
            </div>
          </div>
        </div>
      )}

      {/* CPU Features */}
      {cpuFeatures && (
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Supported CPU Features
          </h2>
          
          {/* SSE Instructions */}
          <div className="mb-6">
            <h3 className="text-md font-medium text-gray-700 dark:text-gray-300 mb-3">SSE Instructions</h3>
            <div className="flex flex-wrap gap-2">
              <FeatureBadge supported={cpuFeatures.sse} label="SSE" />
              <FeatureBadge supported={cpuFeatures.sse2} label="SSE2" />
              <FeatureBadge supported={cpuFeatures.sse3} label="SSE3" />
              <FeatureBadge supported={cpuFeatures.ssse3} label="SSSE3" />
              <FeatureBadge supported={cpuFeatures.sse4_1} label="SSE4.1" />
              <FeatureBadge supported={cpuFeatures.sse4_2} label="SSE4.2" />
            </div>
          </div>

          {/* Advanced Vector Extensions */}
          <div className="mb-6">
            <h3 className="text-md font-medium text-gray-700 dark:text-gray-300 mb-3">Advanced Vector Extensions</h3>
            <div className="flex flex-wrap gap-2">
              <FeatureBadge supported={cpuFeatures.avx} label="AVX" />
              <FeatureBadge supported={cpuFeatures.avx2} label="AVX2" />
              <FeatureBadge supported={cpuFeatures.avx512} label="AVX-512" />
            </div>
          </div>

          {/* Other Features */}
          <div className="mb-6">
            <h3 className="text-md font-medium text-gray-700 dark:text-gray-300 mb-3">Other Features</h3>
            <div className="flex flex-wrap gap-2">
              <FeatureBadge supported={cpuFeatures.fma} label="FMA" />
              <FeatureBadge supported={cpuFeatures.aes} label="AES-NI" />
              <FeatureBadge supported={cpuFeatures.sha} label="SHA-NI" />
              <FeatureBadge supported={cpuFeatures.neon} label="NEON" />
            </div>
          </div>

          {/* Raw CPU Flags */}
          {cpuFeatures.flags && (
            <div>
              <h3 className="text-md font-medium text-gray-700 dark:text-gray-300 mb-3">CPU Flags</h3>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-md p-3">
                <code className="text-xs text-gray-800 dark:text-gray-200 break-all">
                  {cpuFeatures.flags}
                </code>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}