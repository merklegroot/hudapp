'use client';

import { useState, useEffect } from 'react';
import type { BuildInfo } from '@/utils/buildInfo';

export default function BuildInfo() {
  const [buildInfo, setBuildInfo] = useState<BuildInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [localizedBuildTime, setLocalizedBuildTime] = useState<string>('');

  useEffect(() => {
    fetch('/api/build-info')
      .then(res => res.json())
      .then(data => {
        setBuildInfo(data);
        // Convert ISO timestamp to user's local timezone with YYYY-mm-dd date format
        const buildDate = new Date(data.buildTime);
        const year = buildDate.getFullYear();
        const month = String(buildDate.getMonth() + 1).padStart(2, '0');
        const day = String(buildDate.getDate()).padStart(2, '0');
        const time = buildDate.toLocaleTimeString();
        const formattedBuildTime = `${year}-${month}-${day} ${time}`;
        setLocalizedBuildTime(formattedBuildTime);
        setLoading(false);
      })
      .catch(error => {
        console.error('Failed to fetch build info:', error);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="text-sm text-gray-400">
        Loading build info...
      </div>
    );
  }

  if (!buildInfo) {
    return (
      <div className="text-sm text-gray-400">
        Build info unavailable
      </div>
    );
  }

  return (
    <div className="text-sm text-gray-400 flex flex-col items-end">
      <div className="text-xs">
        Built: {localizedBuildTime}
      </div>
      <div className="text-xs">
        Commit:{' '}
        <a
          href={buildInfo.githubUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-400 hover:text-blue-300 underline transition-colors"
        >
          {buildInfo.commitShort}
        </a>
      </div>
    </div>
  );
}