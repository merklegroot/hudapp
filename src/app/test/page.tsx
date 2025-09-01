'use client';

import { useState, useEffect } from 'react';

export default function TestPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/machine/hostname')
      .then(response => response.json())
      .then(data => {
        console.log('API Response:', data);
        setData(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching data:', err);
        setError('Failed to fetch data');
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!data) {
    return <div>No data</div>;
  }

  return (
    <div>
      <h1>Test Page</h1>
      <pre>{JSON.stringify(data, null, 2)}</pre>
      
      {data.cpuDetailed && (
        <div>
          <h2>CPU Details:</h2>
          <p>Model: {data.cpuDetailed.model}</p>
          <p>Cores: {data.cpuDetailed.cores}</p>
          <p>Threads: {data.cpuDetailed.threads}</p>
          <p>Architecture: {data.cpuDetailed.architecture}</p>
          <p>Frequency: {data.cpuDetailed.frequency}</p>
          <p>Current Frequency: {data.cpuDetailed.currentFrequency}</p>
          <p>Max Frequency: {data.cpuDetailed.maxFrequency}</p>
          <p>Min Frequency: {data.cpuDetailed.minFrequency}</p>
          <p>Cache: {data.cpuDetailed.cache}</p>
          <p>Vendor: {data.cpuDetailed.vendor}</p>
          <p>Family: {data.cpuDetailed.family}</p>
          <p>Stepping: {data.cpuDetailed.stepping}</p>
          
          <h3>Instruction Sets:</h3>
          <p>SSE: {data.cpuDetailed.instructionSets.sse ? '✅' : '❌'}</p>
          <p>SSE2: {data.cpuDetailed.instructionSets.sse2 ? '✅' : '❌'}</p>
          <p>SSE3: {data.cpuDetailed.instructionSets.sse3 ? '✅' : '❌'}</p>
          <p>SSSE3: {data.cpuDetailed.instructionSets.ssse3 ? '✅' : '❌'}</p>
          <p>SSE4.1: {data.cpuDetailed.instructionSets.sse4_1 ? '✅' : '❌'}</p>
          <p>SSE4.2: {data.cpuDetailed.instructionSets.sse4_2 ? '✅' : '❌'}</p>
          <p>AVX: {data.cpuDetailed.instructionSets.avx ? '✅' : '❌'}</p>
          <p>AVX2: {data.cpuDetailed.instructionSets.avx2 ? '✅' : '❌'}</p>
          <p>AVX-512: {data.cpuDetailed.instructionSets.avx512 ? '✅' : '❌'}</p>
          <p>AES: {data.cpuDetailed.instructionSets.aes ? '✅' : '❌'}</p>
          <p>SHA: {data.cpuDetailed.instructionSets.sha ? '✅' : '❌'}</p>
          <p>FMA: {data.cpuDetailed.instructionSets.fma ? '✅' : '❌'}</p>
          <p>MMX: {data.cpuDetailed.instructionSets.mmx ? '✅' : '❌'}</p>
        </div>
      )}
    </div>
  );
}