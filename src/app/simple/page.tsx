'use client';

import { useState, useEffect } from 'react';

export default function SimplePage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('SimplePage: Starting fetch...');
    
    fetch('/api/machine/hostname')
      .then(response => {
        console.log('SimplePage: Response status:', response.status);
        return response.json();
      })
      .then(data => {
        console.log('SimplePage: Data received:', data);
        setData(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('SimplePage: Error:', err);
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
      <h1>Simple Test</h1>
      <p>Hostname: {data?.hostname}</p>
      <p>CPU Model: {data?.cpuDetailed?.model}</p>
      <p>Cores: {data?.cpuDetailed?.cores}</p>
      <p>Threads: {data?.cpuDetailed?.threads}</p>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}