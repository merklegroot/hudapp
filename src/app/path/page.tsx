'use client';

import { useState, useEffect } from 'react';

interface PathData {
  paths: string[];
}

export default function Path() {
  const [pathData, setPathData] = useState<PathData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isNoticeExpanded, setIsNoticeExpanded] = useState(false);

  const fetchPathData = (method?: string) => {
    setLoading(true);
    setError(null);

    const url = method ? `/api/path?method=${method}` : '/api/path';

    fetch(url)
      .then(response => response.json())
      .then(data => {
        if (data.error) {
          setError(data.error);
        } else {
          setPathData(data);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching PATH information:', err);
        setError('Failed to fetch PATH information');
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchPathData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] p-8 flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading PATH information...</div>
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

  if (!pathData) {
    return (
      <div className="min-h-[calc(100vh-4rem)] p-8 flex items-center justify-center">
        <div className="text-xl text-gray-600">No PATH information available</div>
      </div>
    );
  }



  return (
    <div className="min-h-[calc(100vh-4rem)] p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">PATH Environment Variable</h1>

        {/* Information Notice */}
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3 flex-1">
              <button
                onClick={() => setIsNoticeExpanded(!isNoticeExpanded)}
                className="flex items-center justify-between w-full text-left hover:text-blue-800 transition-colors"
              >
                <p className="text-sm text-blue-700 font-medium">
                  Did I just see a terminal window open? {isNoticeExpanded ? '(Click to collapse)' : '(Click to expand)'}
                </p>
                <svg
                  className={`h-4 w-4 text-blue-600 transition-transform ${isNoticeExpanded ? 'rotate-180' : ''}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {isNoticeExpanded && (
                <div className="mt-3 space-y-3">
                  <p className="text-sm text-blue-700">
                    You sure did.
                  </p>

                  <p className="text-sm text-blue-700">
                    This is necessary to accurately retrieve your system's PATH environment variable from a fresh shell session,
                    ensuring we show the actual PATH your terminal uses rather than the limited PATH available to this web application.
                  </p>

                  <p className="text-sm text-blue-700">
                    You're welcome to inspect the source code to see exactly what this application is doing.
                  </p>

                  <p className="text-sm text-blue-700">
                    There's likely a better way to do this and I'm happy to accept PRs.
                  </p>

                  <p className="text-sm text-blue-700">
                    Source code:{' '}
                    <a
                      href="https://github.com/merklegroot/hudapp"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline hover:text-blue-800 font-medium"
                    >
                      https://github.com/merklegroot/hudapp
                    </a>
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {pathData.paths.map((path, index) => (
            <div key={index} className="flex items-start justify-between">
              <div className="flex items-start space-x-3 flex-1">
                <span className="text-2xl mt-1">📁</span>
                <div className="flex-1 min-w-0">
                  <p className="text-lg font-mono text-gray-900 break-all">{path}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
