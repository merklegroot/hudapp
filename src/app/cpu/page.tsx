'use client';

import { useState, useEffect } from 'react';
import { machineInfo } from '../workflows/models';
import CPUIcon from '../components/CPUIcon';
import CPUDetailField from '../components/CPUDetailField';
import CPUFeaturesDisplay from '../../components/CPUFeaturesDisplay';

export default function CPUPage() {
  const [machineInfo, setMachineInfo] = useState<machineInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('CPU page mounted, fetching data...');
    
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

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] p-8 flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading CPU information...</div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">CPU Information</h1>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            <strong>Error:</strong> {error}
          </div>
        )}

        {/* CPU Details Section */}
        {machineInfo && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">CPU Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <CPUDetailField
                value={machineInfo.cpuDetailed.model}
              />
              
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
        )}

        {/* CPU Instruction Sets */}
        {machineInfo && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">CPU Instruction Sets</h2>
            
            {/* SSE Family */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <h3 className="text-lg font-semibold text-green-700">SSE Family</h3>
                <span className="text-sm text-gray-600">— Streaming SIMD Extensions for multimedia</span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-3">
                <div className={`p-3 rounded-lg border-2 ${machineInfo.cpuDetailed.instructionSets.sse ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                  <div className="flex items-center gap-2">
                    {machineInfo.cpuDetailed.instructionSets.sse ? (
                      <div className="w-3 h-3 flex items-center justify-center">
                        <span className="text-green-600 text-xs font-bold">✓</span>
                      </div>
                    ) : (
                      <div className="w-3 h-3 flex items-center justify-center">
                        <span className="text-red-500 text-xs font-bold">✗</span>
                      </div>
                    )}
                    <span className="text-sm font-medium">SSE</span>
                  </div>
                </div>
                <div className={`p-3 rounded-lg border-2 ${machineInfo.cpuDetailed.instructionSets.sse2 ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                  <div className="flex items-center gap-2">
                    {machineInfo.cpuDetailed.instructionSets.sse2 ? (
                      <div className="w-3 h-3 flex items-center justify-center">
                        <span className="text-green-600 text-xs font-bold">✓</span>
                      </div>
                    ) : (
                      <div className="w-3 h-3 flex items-center justify-center">
                        <span className="text-red-500 text-xs font-bold">✗</span>
                      </div>
                    )}
                    <span className="text-sm font-medium">SSE2</span>
                  </div>
                </div>
                <div className={`p-3 rounded-lg border-2 ${machineInfo.cpuDetailed.instructionSets.sse3 ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                  <div className="flex items-center gap-2">
                    {machineInfo.cpuDetailed.instructionSets.sse3 ? (
                      <div className="w-3 h-3 flex items-center justify-center">
                        <span className="text-green-600 text-xs font-bold">✓</span>
                      </div>
                    ) : (
                      <div className="w-3 h-3 flex items-center justify-center">
                        <span className="text-red-500 text-xs font-bold">✗</span>
                      </div>
                    )}
                    <span className="text-sm font-medium">SSE3</span>
                  </div>
                </div>
                <div className={`p-3 rounded-lg border-2 ${machineInfo.cpuDetailed.instructionSets.ssse3 ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                  <div className="flex items-center gap-2">
                    {machineInfo.cpuDetailed.instructionSets.ssse3 ? (
                      <div className="w-3 h-3 flex items-center justify-center">
                        <span className="text-green-600 text-xs font-bold">✓</span>
                      </div>
                    ) : (
                      <div className="w-3 h-3 flex items-center justify-center">
                        <span className="text-red-500 text-xs font-bold">✗</span>
                      </div>
                    )}
                    <span className="text-sm font-medium">SSSE3</span>
                  </div>
                </div>
                <div className={`p-3 rounded-lg border-2 ${machineInfo.cpuDetailed.instructionSets.sse4_1 ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                  <div className="flex items-center gap-2">
                    {machineInfo.cpuDetailed.instructionSets.sse4_1 ? (
                      <div className="w-3 h-3 flex items-center justify-center">
                        <span className="text-green-600 text-xs font-bold">✓</span>
                      </div>
                    ) : (
                      <div className="w-3 h-3 flex items-center justify-center">
                        <span className="text-red-500 text-xs font-bold">✗</span>
                      </div>
                    )}
                    <span className="text-sm font-medium">SSE4.1</span>
                  </div>
                </div>
                <div className={`p-3 rounded-lg border-2 ${machineInfo.cpuDetailed.instructionSets.sse4_2 ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                  <div className="flex items-center gap-2">
                    {machineInfo.cpuDetailed.instructionSets.sse4_2 ? (
                      <div className="w-3 h-3 flex items-center justify-center">
                        <span className="text-green-600 text-xs font-bold">✓</span>
                      </div>
                    ) : (
                      <div className="w-3 h-3 flex items-center justify-center">
                        <span className="text-red-500 text-xs font-bold">✗</span>
                      </div>
                    )}
                    <span className="text-sm font-medium">SSE4.2</span>
                  </div>
                </div>
              </div>
              <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                <p className="text-sm text-green-800">
                  <span className="font-mono bg-green-100 px-2 py-1 rounded text-xs">addps xmm0, xmm1</span>
                  <span className="ml-2">— Add 4 packed single-precision floating point values</span>
                </p>
              </div>
            </div>

            {/* AVX Family */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <h3 className="text-lg font-semibold text-blue-700">AVX Family</h3>
                <span className="text-sm text-gray-600">— Advanced Vector Extensions for high-performance computing</span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-3">
                <div className={`p-3 rounded-lg border-2 ${machineInfo.cpuDetailed.instructionSets.avx ? 'bg-blue-50 border-blue-200' : 'bg-red-50 border-red-200'}`}>
                  <div className="flex items-center gap-2">
                    {machineInfo.cpuDetailed.instructionSets.avx ? (
                      <div className="w-3 h-3 flex items-center justify-center">
                        <span className="text-green-600 text-xs font-bold">✓</span>
                      </div>
                    ) : (
                      <div className="w-3 h-3 flex items-center justify-center">
                        <span className="text-red-500 text-xs font-bold">✗</span>
                      </div>
                    )}
                    <span className="text-sm font-medium">AVX</span>
                  </div>
                </div>
                <div className={`p-3 rounded-lg border-2 ${machineInfo.cpuDetailed.instructionSets.avx2 ? 'bg-blue-50 border-blue-200' : 'bg-red-50 border-red-200'}`}>
                  <div className="flex items-center gap-2">
                    {machineInfo.cpuDetailed.instructionSets.avx2 ? (
                      <div className="w-3 h-3 flex items-center justify-center">
                        <span className="text-green-600 text-xs font-bold">✓</span>
                      </div>
                    ) : (
                      <div className="w-3 h-3 flex items-center justify-center">
                        <span className="text-red-500 text-xs font-bold">✗</span>
                      </div>
                    )}
                    <span className="text-sm font-medium">AVX2</span>
                  </div>
                </div>
                <div className={`p-3 rounded-lg border-2 ${machineInfo.cpuDetailed.instructionSets.avx512 ? 'bg-blue-50 border-blue-200' : 'bg-red-50 border-red-200'}`}>
                  <div className="flex items-center gap-2">
                    {machineInfo.cpuDetailed.instructionSets.avx512 ? (
                      <div className="w-3 h-3 flex items-center justify-center">
                        <span className="text-green-600 text-xs font-bold">✓</span>
                      </div>
                    ) : (
                      <div className="w-3 h-3 flex items-center justify-center">
                        <span className="text-red-500 text-xs font-bold">✗</span>
                      </div>
                    )}
                    <span className="text-sm font-medium">AVX-512</span>
                  </div>
                </div>
              </div>
              <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-800">
                  <span className="font-mono bg-blue-100 px-2 py-1 rounded text-xs">vaddps ymm0, ymm1, ymm2</span>
                  <span className="ml-2">— Add 8 packed single-precision floating point values (256-bit)</span>
                </p>
              </div>
            </div>

            {/* Cryptographic Extensions */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <h3 className="text-lg font-semibold text-purple-700">Cryptographic Extensions</h3>
                <span className="text-sm text-gray-600">— Hardware-accelerated encryption and hashing</span>
              </div>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div className={`p-3 rounded-lg border-2 ${machineInfo.cpuDetailed.instructionSets.aes ? 'bg-purple-50 border-purple-200' : 'bg-red-50 border-red-200'}`}>
                  <div className="flex items-center gap-2">
                    {machineInfo.cpuDetailed.instructionSets.aes ? (
                      <div className="w-3 h-3 flex items-center justify-center">
                        <span className="text-green-600 text-xs font-bold">✓</span>
                      </div>
                    ) : (
                      <div className="w-3 h-3 flex items-center justify-center">
                        <span className="text-red-500 text-xs font-bold">✗</span>
                      </div>
                    )}
                    <span className="text-sm font-medium">AES</span>
                  </div>
                </div>
                <div className={`p-3 rounded-lg border-2 ${machineInfo.cpuDetailed.instructionSets.sha ? 'bg-purple-50 border-purple-200' : 'bg-red-50 border-red-200'}`}>
                  <div className="flex items-center gap-2">
                    {machineInfo.cpuDetailed.instructionSets.sha ? (
                      <div className="w-3 h-3 flex items-center justify-center">
                        <span className="text-green-600 text-xs font-bold">✓</span>
                      </div>
                    ) : (
                      <div className="w-3 h-3 flex items-center justify-center">
                        <span className="text-red-500 text-xs font-bold">✗</span>
                      </div>
                    )}
                    <span className="text-sm font-medium">SHA</span>
                  </div>
                </div>
              </div>
              <div className="bg-purple-50 p-3 rounded-lg border border-purple-200">
                <p className="text-sm text-purple-800">
                  <span className="font-mono bg-purple-100 px-2 py-1 rounded text-xs">aesenc xmm0, xmm1</span>
                  <span className="ml-2">— Perform one round of AES encryption</span>
                </p>
              </div>
            </div>

            {/* Mathematical Extensions */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <h3 className="text-lg font-semibold text-orange-700">Mathematical Extensions</h3>
                <span className="text-sm text-gray-600">— Enhanced mathematical operations</span>
              </div>
              <div className="grid grid-cols-1 gap-3 mb-3">
                <div className={`p-3 rounded-lg border-2 ${machineInfo.cpuDetailed.instructionSets.fma ? 'bg-orange-50 border-orange-200' : 'bg-red-50 border-red-200'}`}>
                  <div className="flex items-center gap-2">
                    {machineInfo.cpuDetailed.instructionSets.fma ? (
                      <div className="w-3 h-3 flex items-center justify-center">
                        <span className="text-green-600 text-xs font-bold">✓</span>
                      </div>
                    ) : (
                      <div className="w-3 h-3 flex items-center justify-center">
                        <span className="text-red-500 text-xs font-bold">✗</span>
                      </div>
                    )}
                    <span className="text-sm font-medium">FMA</span>
                  </div>
                </div>
              </div>
              <div className="bg-orange-50 p-3 rounded-lg border border-orange-200">
                <p className="text-sm text-orange-800">
                  <span className="font-mono bg-orange-100 px-2 py-1 rounded text-xs">vfmadd213ps xmm0, xmm1, xmm2</span>
                  <span className="ml-2">— Fused multiply-add: xmm0 = (xmm1 * xmm0) + xmm2</span>
                </p>
              </div>
            </div>

            {/* Legacy Extensions */}
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-4">
                <h3 className="text-lg font-semibold text-gray-700">Legacy Extensions</h3>
                <span className="text-sm text-gray-600">— Older multimedia instructions</span>
              </div>
              <div className="grid grid-cols-1 gap-3 mb-3">
                <div className={`p-3 rounded-lg border-2 ${machineInfo.cpuDetailed.instructionSets.mmx ? 'bg-gray-100 border-gray-300' : 'bg-red-50 border-red-200'}`}>
                  <div className="flex items-center gap-2">
                    {machineInfo.cpuDetailed.instructionSets.mmx ? (
                      <div className="w-3 h-3 flex items-center justify-center">
                        <span className="text-green-600 text-xs font-bold">✓</span>
                      </div>
                    ) : (
                      <div className="w-3 h-3 flex items-center justify-center">
                        <span className="text-red-500 text-xs font-bold">✗</span>
                      </div>
                    )}
                    <span className="text-sm font-medium">MMX</span>
                  </div>
                </div>
              </div>
              <div className="bg-gray-100 p-3 rounded-lg border border-gray-300">
                <p className="text-sm text-gray-700">
                  <span className="font-mono bg-gray-200 px-2 py-1 rounded text-xs">paddb mm0, mm1</span>
                  <span className="ml-2">— Add 8 packed bytes (64-bit MMX register)</span>
                </p>
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 bg-blue-500 rounded-full mt-0.5 flex-shrink-0"></div>
                <div>
                  <p className="text-sm text-blue-800 mb-2">
                    <strong>Understanding Instruction Sets:</strong> These specialized CPU instructions dramatically accelerate specific types of operations by processing multiple data elements simultaneously (SIMD - Single Instruction, Multiple Data).
                  </p>
                  <p className="text-xs text-blue-700">
                    <strong>Assembly Examples:</strong> The code snippets show actual x86-64 assembly instructions that compilers generate when optimizing code for these instruction sets.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Alternative CPU Features Display */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">Alternative CPU Feature Detection</h2>
          <CPUFeaturesDisplay />
        </div>
      </div>
    </div>
  );
}