'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { SiLinux, SiApple } from 'react-icons/si';
import { DiWindows } from 'react-icons/di';

// Custom BSD Icon Component
interface BSDIconProps {
  className?: string;
}

const BSDIcon = ({ className = "w-5 h-5" }: BSDIconProps) => (
  <svg
    viewBox="0 0 24 24"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle cx="12" cy="12" r="11" stroke="#000000" strokeWidth="1" fill="none" />
    <text
      x="12"
      y="16"
      textAnchor="middle"
      fontSize="8"
      fontWeight="900"
      fill="#ef4444"
      fontFamily="Arial, sans-serif"
    >
      BSD
    </text>
  </svg>
);

// Dynamically import Terminal to prevent SSR issues
const Terminal = dynamic(() => import('../components/Terminal'), {
  ssr: false,
  loading: () => (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="bg-gray-800 text-white p-2 text-sm font-medium flex justify-between items-center">
        <span>.NET Installation Terminal</span>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-gray-500"></div>
          <span className="text-xs">Loading...</span>
        </div>
      </div>
      <div className="w-full bg-black flex items-center justify-center" style={{ height: '400px' }}>
        <div className="text-gray-400 text-sm">Loading terminal component...</div>
      </div>
      <div className="bg-gray-700 p-2">
        <button
          disabled
          className="px-4 py-2 bg-gray-500 text-white text-sm rounded cursor-not-allowed"
        >
          Loading Terminal...
        </button>
      </div>
    </div>
  )
});

interface DotnetInfo {
  isInstalled: boolean;
  sdks: string[];
  runtimes: string[];
  inPath: boolean;
  detectedPath?: string;
  error?: string;
}

export default function Dotnet() {
  const [dotnetInfo, setDotnetInfo] = useState<DotnetInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showTerminal, setShowTerminal] = useState(false);
  const [addingToPath, setAddingToPath] = useState(false);
  const [pathAddError, setPathAddError] = useState<string | null>(null);
  const [pathAddSuccess, setPathAddSuccess] = useState(false);

  const fetchDotnetInfo = (showLoading = true) => {
    if (showLoading) {
      setLoading(true);
    }
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
  };

  useEffect(() => {
    fetchDotnetInfo();
  }, []);

  const handleInstallStart = () => {
    setShowTerminal(true);
  };

  const handleInstallComplete = () => {
    // Refresh dotnet info after installation without showing loading state
    // Keep terminal visible and don't trigger loading state
    setTimeout(() => {
      fetchDotnetInfo(false);
    }, 2000);
  };

  const handleAddToPath = async () => {
    if (!dotnetInfo?.detectedPath) return;
    
    setAddingToPath(true);
    setPathAddError(null);
    setPathAddSuccess(false);
    
    try {
      const response = await fetch('/api/dotnet/add-to-path', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ dotnetPath: dotnetInfo.detectedPath }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add to PATH');
      }

      setPathAddSuccess(true);
      // Refresh dotnet info to check if PATH was successfully updated
      setTimeout(() => {
        fetchDotnetInfo(false);
      }, 1000);
    } catch (error) {
      console.error('Error adding to PATH:', error);
      setPathAddError(error instanceof Error ? error.message : 'Failed to add to PATH');
    } finally {
      setAddingToPath(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] p-8 flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading .NET information...</div>
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
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">.NET</h1>
        
        {!dotnetInfo.isInstalled ? (
          <div className="space-y-6">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
              <div className="flex items-center justify-between">
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
                <button
                  onClick={() => setShowTerminal(!showTerminal)}
                  className="ml-4 px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                >
                  {showTerminal ? 'Hide Installation Terminal' : 'Install .NET SDK 8'}
                </button>
              </div>
            </div>

            {/* Installation Instructions */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-blue-800 mb-3">Installation Information</h3>
              <div className="text-sm text-blue-700 space-y-2">
                <p>This will install .NET SDK 8 using the official Microsoft installation script.</p>
                <p>The installation process will:</p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>Download the latest .NET SDK 8 from Microsoft</li>
                  <li>Install it to <code className="bg-blue-100 px-1 rounded">~/.dotnet</code></li>
                  <li>Set up the necessary environment variables</li>
                </ul>
                <p className="font-medium">You may be prompted for your password during installation.</p>
              </div>
            </div>

            {/* Terminal Section */}
            {showTerminal && (
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <Terminal 
                  onInstallStart={handleInstallStart}
                  onInstallComplete={handleInstallComplete}
                  className="w-full"
                />
              </div>
            )}

            {/* Common Installation Locations */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">Common .NET Installation Locations</h2>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <SiLinux className="w-5 h-5 text-yellow-500" />
                    <h3 className="text-lg font-medium text-gray-700">Linux</h3>
                  </div>
                  <div className="space-y-2">
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex justify-between items-center">
                        <code className="text-sm font-mono text-gray-900">~/.dotnet/</code>
                        <span className="text-xs text-gray-500">User installation (recommended)</span>
                      </div>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex justify-between items-center">
                        <code className="text-sm font-mono text-gray-900">/usr/share/dotnet/</code>
                        <span className="text-xs text-gray-500">System-wide installation</span>
                      </div>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex justify-between items-center">
                        <code className="text-sm font-mono text-gray-900">/opt/dotnet/</code>
                        <span className="text-xs text-gray-500">Alternative system location</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <DiWindows className="w-5 h-5 text-blue-600" />
                    <h3 className="text-lg font-medium text-gray-700">Windows</h3>
                  </div>
                  <div className="space-y-2">
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex justify-between items-center">
                        <code className="text-sm font-mono text-gray-900">C:\Program Files\dotnet\</code>
                        <span className="text-xs text-gray-500">Default system installation</span>
                      </div>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex justify-between items-center">
                        <code className="text-sm font-mono text-gray-900">C:\Program Files (x86)\dotnet\</code>
                        <span className="text-xs text-gray-500">32-bit installation</span>
                      </div>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex justify-between items-center">
                        <code className="text-sm font-mono text-gray-900">%USERPROFILE%\.dotnet\</code>
                        <span className="text-xs text-gray-500">User-specific installation</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <SiApple className="w-5 h-5 text-gray-600" />
                    <h3 className="text-lg font-medium text-gray-700">macOS</h3>
                  </div>
                  <div className="space-y-2">
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex justify-between items-center">
                        <code className="text-sm font-mono text-gray-900">/usr/local/share/dotnet/</code>
                        <span className="text-xs text-gray-500">Default installation</span>
                      </div>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex justify-between items-center">
                        <code className="text-sm font-mono text-gray-900">~/.dotnet/</code>
                        <span className="text-xs text-gray-500">User installation</span>
                      </div>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex justify-between items-center">
                        <code className="text-sm font-mono text-gray-900">/Applications/Visual Studio.app/Contents/MacOS/dotnet/</code>
                        <span className="text-xs text-gray-500">Visual Studio for Mac</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <BSDIcon className="w-5 h-5" />
                    <h3 className="text-lg font-medium text-gray-700">BSD Systems (FreeBSD, OpenBSD, NetBSD)</h3>
                  </div>
                  <div className="space-y-2">
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex justify-between items-center">
                        <code className="text-sm font-mono text-gray-900">~/.dotnet/</code>
                        <span className="text-xs text-gray-500">User installation (recommended)</span>
                      </div>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex justify-between items-center">
                        <code className="text-sm font-mono text-gray-900">/usr/local/share/dotnet/</code>
                        <span className="text-xs text-gray-500">System-wide installation</span>
                      </div>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex justify-between items-center">
                        <code className="text-sm font-mono text-gray-900">/opt/dotnet/</code>
                        <span className="text-xs text-gray-500">Alternative system location</span>
                      </div>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex justify-between items-center">
                        <code className="text-sm font-mono text-gray-900">/usr/pkg/share/dotnet/</code>
                        <span className="text-xs text-gray-500">NetBSD pkgsrc installation</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="text-sm font-medium text-blue-800 mb-2">Environment Variables</h4>
                  <div className="text-sm text-blue-700 space-y-1">
                    <p><code className="bg-blue-100 px-1 rounded">DOTNET_ROOT</code> - Points to the .NET installation directory</p>
                    <p><code className="bg-blue-100 px-1 rounded">PATH</code> - Should include the .NET installation directory</p>
                    <p>Use <code className="bg-blue-100 px-1 rounded">dotnet --info</code> to see the current installation paths</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Installation Status */}
            {dotnetInfo.inPath ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-green-800">
                        .NET is installed and ready to use!
                      </h3>
                      <div className="mt-2 text-sm text-green-700">
                        <p>You can now create and run .NET applications on this machine.</p>
                      </div>
                    </div>
                  </div>
                  {showTerminal && (
                    <button
                      onClick={() => setShowTerminal(false)}
                      className="ml-4 px-3 py-1 bg-gray-600 text-white text-sm rounded hover:bg-gray-700 transition-colors"
                    >
                      Hide Terminal
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-yellow-800">
                        .NET is installed but not in PATH
                      </h3>
                      <div className="mt-2 text-sm text-yellow-700">
                        <p>
                          .NET is installed at <code className="bg-yellow-100 px-1 rounded font-mono">{dotnetInfo.detectedPath}</code> 
                          but is not accessible from the command line.
                        </p>
                      </div>
                    </div>
                  </div>
                  {showTerminal && (
                    <button
                      onClick={() => setShowTerminal(false)}
                      className="ml-4 px-3 py-1 bg-gray-600 text-white text-sm rounded hover:bg-gray-700 transition-colors"
                    >
                      Hide Terminal
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* PATH Setup Instructions - Show when dotnet is not in PATH */}
            {!dotnetInfo.inPath && dotnetInfo.detectedPath && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-blue-800">Setup PATH to Access dotnet</h3>
                  <button
                    onClick={handleAddToPath}
                    disabled={addingToPath}
                    className="px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {addingToPath ? (
                      <>
                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Adding to PATH...
                      </>
                    ) : (
                      'Add to PATH Automatically'
                    )}
                  </button>
                </div>

                {/* Success Message */}
                {pathAddSuccess && (
                  <div className="mb-4 p-3 bg-green-100 border border-green-200 rounded-lg">
                    <div className="flex items-center">
                      <svg className="h-4 w-4 text-green-400 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-sm font-medium text-green-800">Successfully attempted to add dotnet to PATH!</span>
                    </div>
                    <p className="text-xs text-green-700 mt-1">Please restart your terminal or refresh this page to verify the changes.</p>
                  </div>
                )}

                {/* Error Message */}
                {pathAddError && (
                  <div className="mb-4 p-3 bg-red-100 border border-red-200 rounded-lg">
                    <div className="flex items-center">
                      <svg className="h-4 w-4 text-red-400 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                      <span className="text-sm font-medium text-red-800">Failed to add to PATH</span>
                    </div>
                    <p className="text-xs text-red-700 mt-1">{pathAddError}</p>
                  </div>
                )}

                <div className="text-sm text-blue-700 space-y-3">
                  <p>To use dotnet from the command line, you need to add it to your PATH. You can try the automatic option above, or choose one of the manual options below:</p>
                  
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-blue-800 mb-2">Option 1: Temporary (current session only)</h4>
                      <div className="p-3 bg-blue-100 rounded-lg">
                        <code className="text-sm font-mono text-blue-900 block">
                          export PATH=$PATH:{dotnetInfo.detectedPath}
                        </code>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-blue-800 mb-2">Option 2: Permanent (recommended)</h4>
                      <p className="mb-2">Add the following lines to your shell profile file (<code className="bg-blue-100 px-1 rounded">~/.bashrc</code>, <code className="bg-blue-100 px-1 rounded">~/.zshrc</code>, or <code className="bg-blue-100 px-1 rounded">~/.profile</code>):</p>
                      <div className="p-3 bg-blue-100 rounded-lg space-y-1">
                        <code className="text-sm font-mono text-blue-900 block">
                          export DOTNET_ROOT={dotnetInfo.detectedPath}
                        </code>
                        <code className="text-sm font-mono text-blue-900 block">
                          export PATH=$PATH:$DOTNET_ROOT:$DOTNET_ROOT/tools
                        </code>
                      </div>
                      <p className="mt-2 text-xs">After adding these lines, restart your terminal or run <code className="bg-blue-100 px-1 rounded">source ~/.bashrc</code> (or your shell profile file).</p>
                    </div>
                  </div>
                  
                  <div className="mt-4 p-3 bg-blue-100 rounded-lg">
                    <p className="font-medium text-blue-800 mb-1">Verify the setup:</p>
                    <code className="text-sm font-mono text-blue-900">dotnet --version</code>
                  </div>
                </div>
              </div>
            )}

            {/* Terminal Section - Show if requested */}
            {showTerminal && (
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <Terminal 
                  onInstallStart={handleInstallStart}
                  onInstallComplete={handleInstallComplete}
                  className="w-full"
                />
              </div>
            )}

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

            {/* Common Installation Locations */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">Common .NET Installation Locations</h2>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <SiLinux className="w-5 h-5 text-yellow-500" />
                    <h3 className="text-lg font-medium text-gray-700">Linux</h3>
                  </div>
                  <div className="space-y-2">
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex justify-between items-center">
                        <code className="text-sm font-mono text-gray-900">~/.dotnet/</code>
                        <span className="text-xs text-gray-500">User installation (recommended)</span>
                      </div>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex justify-between items-center">
                        <code className="text-sm font-mono text-gray-900">/usr/share/dotnet/</code>
                        <span className="text-xs text-gray-500">System-wide installation</span>
                      </div>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex justify-between items-center">
                        <code className="text-sm font-mono text-gray-900">/opt/dotnet/</code>
                        <span className="text-xs text-gray-500">Alternative system location</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <DiWindows className="w-5 h-5 text-blue-600" />
                    <h3 className="text-lg font-medium text-gray-700">Windows</h3>
                  </div>
                  <div className="space-y-2">
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex justify-between items-center">
                        <code className="text-sm font-mono text-gray-900">C:\Program Files\dotnet\</code>
                        <span className="text-xs text-gray-500">Default system installation</span>
                      </div>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex justify-between items-center">
                        <code className="text-sm font-mono text-gray-900">C:\Program Files (x86)\dotnet\</code>
                        <span className="text-xs text-gray-500">32-bit installation</span>
                      </div>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex justify-between items-center">
                        <code className="text-sm font-mono text-gray-900">%USERPROFILE%\.dotnet\</code>
                        <span className="text-xs text-gray-500">User-specific installation</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <SiApple className="w-5 h-5 text-gray-600" />
                    <h3 className="text-lg font-medium text-gray-700">macOS</h3>
                  </div>
                  <div className="space-y-2">
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex justify-between items-center">
                        <code className="text-sm font-mono text-gray-900">/usr/local/share/dotnet/</code>
                        <span className="text-xs text-gray-500">Default installation</span>
                      </div>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex justify-between items-center">
                        <code className="text-sm font-mono text-gray-900">~/.dotnet/</code>
                        <span className="text-xs text-gray-500">User installation</span>
                      </div>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex justify-between items-center">
                        <code className="text-sm font-mono text-gray-900">/Applications/Visual Studio.app/Contents/MacOS/dotnet/</code>
                        <span className="text-xs text-gray-500">Visual Studio for Mac</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <BSDIcon className="w-5 h-5" />
                    <h3 className="text-lg font-medium text-gray-700">BSD Systems (FreeBSD, OpenBSD, NetBSD)</h3>
                  </div>
                  <div className="space-y-2">
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex justify-between items-center">
                        <code className="text-sm font-mono text-gray-900">~/.dotnet/</code>
                        <span className="text-xs text-gray-500">User installation (recommended)</span>
                      </div>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex justify-between items-center">
                        <code className="text-sm font-mono text-gray-900">/usr/local/share/dotnet/</code>
                        <span className="text-xs text-gray-500">System-wide installation</span>
                      </div>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex justify-between items-center">
                        <code className="text-sm font-mono text-gray-900">/opt/dotnet/</code>
                        <span className="text-xs text-gray-500">Alternative system location</span>
                      </div>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex justify-between items-center">
                        <code className="text-sm font-mono text-gray-900">/usr/pkg/share/dotnet/</code>
                        <span className="text-xs text-gray-500">NetBSD pkgsrc installation</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="text-sm font-medium text-blue-800 mb-2">Environment Variables</h4>
                  <div className="text-sm text-blue-700 space-y-1">
                    <p><code className="bg-blue-100 px-1 rounded">DOTNET_ROOT</code> - Points to the .NET installation directory</p>
                    <p><code className="bg-blue-100 px-1 rounded">PATH</code> - Should include the .NET installation directory</p>
                    <p>Use <code className="bg-blue-100 px-1 rounded">dotnet --info</code> to see the current installation paths</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
