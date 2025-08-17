'use client';

import { useState, useEffect } from 'react';

interface PathInfo {
  path: string;
  exists: boolean;
  isDirectory: boolean;
  readable: boolean;
  executableCount?: number;
}

interface PathData {
  pathVariable: string;
  totalPaths: number;
  paths: PathInfo[];
  shell: string;
  user: string;
  workingDirectory: string;
  existingPaths: number;
  readablePaths: number;
  source: string;
  debug?: {
    serverPath: string;
    methods: any;
    selectedMethod: string;
  };
}

export default function Path() {
  const [pathData, setPathData] = useState<PathData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  const getStatusIcon = (pathInfo: PathInfo) => {
    if (!pathInfo.exists) return '❌';
    if (!pathInfo.readable) return '🔒';
    if (!pathInfo.isDirectory) return '📄';
    return '📁';
  };

  const getStatusText = (pathInfo: PathInfo) => {
    if (!pathInfo.exists) return 'Does not exist';
    if (!pathInfo.readable) return 'Not readable';
    if (!pathInfo.isDirectory) return 'Not a directory';
    return 'Available';
  };

  const getStatusColor = (pathInfo: PathInfo) => {
    if (!pathInfo.exists) return 'text-red-600 bg-red-50';
    if (!pathInfo.readable) return 'text-yellow-600 bg-yellow-50';
    if (!pathInfo.isDirectory) return 'text-orange-600 bg-orange-50';
    return 'text-green-600 bg-green-50';
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">PATH Environment Variable</h1>
        
        {/* User Environment Info */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">User Environment</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h3 className="text-sm font-medium text-gray-600 mb-1">User</h3>
              <p className="text-xl font-semibold text-blue-800">{pathData.user}</p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <h3 className="text-sm font-medium text-gray-600 mb-1">Shell</h3>
              <p className="text-xl font-semibold text-green-800">{pathData.shell}</p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <h3 className="text-sm font-medium text-gray-600 mb-1">Working Directory</h3>
              <p className="text-lg font-mono text-purple-800 break-all">{pathData.workingDirectory}</p>
            </div>
          </div>
        </div>

        {/* Summary Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-md p-4">
            <h3 className="text-sm font-medium text-gray-600 mb-1">Total Paths</h3>
            <p className="text-2xl font-bold text-blue-600">{pathData.totalPaths}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4">
            <h3 className="text-sm font-medium text-gray-600 mb-1">Existing Paths</h3>
            <p className="text-2xl font-bold text-green-600">{pathData.existingPaths}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4">
            <h3 className="text-sm font-medium text-gray-600 mb-1">Readable Paths</h3>
            <p className="text-2xl font-bold text-purple-600">{pathData.readablePaths}</p>
          </div>
        </div>

        {/* PATH Directories List */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">PATH Directories</h2>
          <p className="text-gray-600 mb-6">
            Below are all directories in your PATH environment variable, along with their status and executable count.
          </p>
          
          <div className="space-y-3">
            {pathData.paths.map((pathInfo, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    <span className="text-2xl mt-1">{getStatusIcon(pathInfo)}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="text-sm font-medium text-gray-500">#{index + 1}</span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(pathInfo)}`}>
                          {getStatusText(pathInfo)}
                        </span>
                      </div>
                      <p className="text-lg font-mono text-gray-900 break-all">{pathInfo.path}</p>
                      {pathInfo.exists && pathInfo.isDirectory && pathInfo.readable && (
                        <div className="mt-2 flex items-center space-x-4 text-sm text-gray-600">
                          <span>
                            🔧 {pathInfo.executableCount || 0} executable{(pathInfo.executableCount || 0) !== 1 ? 's' : ''}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Debug Information */}
        {pathData.debug && (
          <div className="bg-white rounded-lg shadow-md p-6 mt-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Debug Information</h2>
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
                Selected Method: {pathData.debug.selectedMethod}
              </span>
              <button
                onClick={() => fetchPathData()}
                className="px-3 py-1 bg-gray-600 text-white text-xs rounded hover:bg-gray-700 transition-colors"
              >
                🔄 Auto Select
              </button>
            </div>
            
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Try Different Methods:</h3>
              <div className="flex flex-wrap gap-2">
                {Object.keys(pathData.debug.methods).map((method) => (
                  <button
                    key={method}
                    onClick={() => fetchPathData(method)}
                    disabled={loading || (typeof pathData.debug.methods[method] === 'string' && pathData.debug.methods[method].startsWith('Error'))}
                    className={`px-3 py-1 text-xs rounded transition-colors ${
                      pathData.pathVariable === pathData.debug.methods[method]
                        ? 'bg-green-600 text-white'
                        : typeof pathData.debug.methods[method] === 'string' && pathData.debug.methods[method].startsWith('Error')
                        ? 'bg-red-100 text-red-600 cursor-not-allowed'
                        : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                    }`}
                  >
                    {method.replace('_', ' ')} 
                    {pathData.pathVariable === pathData.debug.methods[method] && ' ✓'}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Server PATH (Next.js process)</h3>
                <div className="bg-red-50 rounded-lg p-3 overflow-x-auto">
                  <code className="text-sm font-mono text-red-800 whitespace-pre-wrap break-all">
                    {pathData.debug.serverPath}
                  </code>
                </div>
              </div>
              
              {Object.entries(pathData.debug.methods).map(([method, path]) => (
                <div key={method}>
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">
                    {method.replace('_', ' ')} method
                    {pathData.pathVariable === path && (
                      <span className="ml-2 inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800">
                        ← Currently Used
                      </span>
                    )}
                  </h3>
                  <div className={`rounded-lg p-3 overflow-x-auto ${
                    typeof path === 'string' && path.startsWith('Error') 
                      ? 'bg-red-50' 
                      : pathData.pathVariable === path 
                      ? 'bg-green-50' 
                      : 'bg-gray-50'
                  }`}>
                    <code className={`text-sm font-mono whitespace-pre-wrap break-all ${
                      typeof path === 'string' && path.startsWith('Error') 
                        ? 'text-red-800' 
                        : pathData.pathVariable === path 
                        ? 'text-green-800' 
                        : 'text-gray-800'
                    }`}>
                      {typeof path === 'string' ? path : JSON.stringify(path)}
                    </code>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Raw PATH Variable */}
        <div className="bg-white rounded-lg shadow-md p-6 mt-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Current PATH Variable</h2>
          <div className="mb-4">
            <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800">
              ✓ From: {pathData.debug?.selectedMethod || 'user login shell'}
            </span>
          </div>
          <div className="bg-gray-100 rounded-lg p-4 overflow-x-auto">
            <code className="text-sm font-mono text-gray-800 whitespace-pre-wrap break-all">
              {pathData.pathVariable}
            </code>
          </div>
        </div>
      </div>
    </div>
  );
}
