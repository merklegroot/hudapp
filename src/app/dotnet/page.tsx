'use client';

import { useState, useEffect, useRef } from 'react';
import { SiLinux, SiApple } from 'react-icons/si';
import { DiWindows } from 'react-icons/di';
import { FaCopy, FaCheck } from 'react-icons/fa';
import DotNetOperationsTerminal, { StatusTerminalRef } from './DotNetOperationsTerminal';
import { DotNetInfo } from '@/app/types/DotNetInfo';
import { BSDIcon } from '../components/Icons/BsdIcon';

// Custom BSD Icon Component

// Copy Button Component
interface CopyButtonProps {
  text: string;
  className?: string;
}

const CopyButton = ({ text, className = "" }: CopyButtonProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className={`inline-flex items-center gap-1 px-2 py-1 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors ${className}`}
      title={copied ? "Copied!" : "Copy to clipboard"}
    >
      {copied ? <FaCheck className="w-3 h-3" /> : <FaCopy className="w-3 h-3" />}
      {copied ? "Copied!" : "Copy"}
    </button>
  );
};


export default function Dotnet() {
  const statusTerminalRef = useRef<StatusTerminalRef>(null);
  const [dotnetInfo, setDotnetInfo] = useState<DotNetInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedVersion, setSelectedVersion] = useState('8.0');
  const [addingToPath, setAddingToPath] = useState(false);
  const [pathAddError, setPathAddError] = useState<string | null>(null);
  const [pathAddSuccess, setPathAddSuccess] = useState(false);
  const [pathAddResult, setPathAddResult] = useState<{
    backupPath?: string;
    profilePath?: string;
    message?: string;
  } | null>(null);

  const fetchDotnetInfo = (showLoading = true) => {
    if (showLoading) {
      setLoading(true);
    }
    fetch('/api/dotnet')
      .then(response => response.json() as Promise<DotNetInfo>)
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

  const handleDetectionComplete = () => {
    // Terminal stays open, just mark detection as complete
    // The terminal will show it's ready for additional operations
  };

  useEffect(() => {
    fetchDotnetInfo();
  }, []);

  const handleInstallStart = () => {
    // Terminal is already persistent - no action needed
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
    setPathAddResult(null);
    
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

      const result = await response.json();
      setPathAddSuccess(true);
      setPathAddResult(result);
      
      // Refresh dotnet info to check if PATH was successfully updated
      setTimeout(() => {
        fetchDotnetInfo(false);
      }, 2000);
    } catch (error) {
      console.error('Error adding to PATH:', error);
      setPathAddError(error instanceof Error ? error.message : 'Failed to add to PATH');
    } finally {
      setAddingToPath(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] p-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <h1 className="text-4xl font-bold">.NET</h1>
          </div>
          
          <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
            <DotNetOperationsTerminal 
              ref={statusTerminalRef}
              onDetectionComplete={handleDetectionComplete}
              className="w-full"
            />
          </div>
        </div>
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
        <div className="flex items-center gap-3 mb-8">
          <h1 className="text-4xl font-bold">.NET</h1>
        </div>
        
        {/* Persistent Terminal - Always visible */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
          <DotNetOperationsTerminal 
            ref={statusTerminalRef}
            onDetectionComplete={handleDetectionComplete}
            onInstallStart={handleInstallStart}
            onInstallComplete={handleInstallComplete}
            className="w-full"
          />
        </div>
        
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
                  <div className="ml-4 flex items-center gap-3">
                    <select
                      value={selectedVersion}
                      onChange={(e) => setSelectedVersion(e.target.value)}
                      className="px-3 py-2 bg-white border border-gray-300 rounded text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="7.0">.NET 7</option>
                      <option value="8.0">.NET 8 LTS</option>
                      <option value="9.0">.NET 9</option>
                    </select>
                    <button
                      onClick={() => statusTerminalRef.current?.startInstallation(selectedVersion)}
                      className="px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                    >
                      Install .NET SDK {selectedVersion}
                    </button>
                  </div>
              </div>
            </div>

            {/* Installation Instructions */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-blue-800 mb-3">Installation Information</h3>
              <div className="text-sm text-blue-700 space-y-2">
                <p>This will install .NET SDK {selectedVersion} using the official Microsoft installation script.</p>
                <p>The installation process will:</p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>Download the latest .NET SDK {selectedVersion} from Microsoft</li>
                  <li>Install it to <code className="bg-blue-100 px-1 rounded">~/.dotnet</code></li>
                  <li>Set up the necessary environment variables</li>
                </ul>
                <p className="font-medium">You may be prompted for your password during installation.</p>
                {selectedVersion === '7.0' && (
                  <div className="mt-3 p-2 bg-orange-100 rounded">
                    <p className="text-orange-800 font-medium">⚠️ .NET 7 reached end of support on May 14, 2024</p>
                    <p className="text-orange-700 text-xs mt-1">Consider using .NET 8 LTS for new projects</p>
                  </div>
                )}
                {selectedVersion === '8.0' && (
                  <div className="mt-3 p-2 bg-green-100 rounded">
                    <p className="text-green-800 font-medium">✓ .NET 8 is a Long Term Support (LTS) release</p>
                  </div>
                )}
                {selectedVersion === '9.0' && (
                  <div className="mt-3 p-2 bg-blue-100 rounded">
                    <p className="text-blue-800 font-medium">ℹ .NET 9 is the latest Standard Term Support (STS) release</p>
                  </div>
                )}
              </div>
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
                    <BsdIcon className="w-5 h-5" />
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
                    <div className="flex items-center mb-2">
                      <svg className="h-4 w-4 text-green-400 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-sm font-medium text-green-800">Successfully added .NET to PATH!</span>
                    </div>
                    {pathAddResult && (
                      <div className="text-xs text-green-700 space-y-1">
                        {pathAddResult.profilePath && (
                          <p><strong>Profile modified:</strong> {pathAddResult.profilePath}</p>
                        )}
                        {pathAddResult.backupPath && (
                          <p><strong>Backup created:</strong> {pathAddResult.backupPath}</p>
                        )}
                        <p className="mt-2 font-medium">Please restart your terminal or run: <code className="bg-green-200 px-1 rounded">source {pathAddResult.profilePath?.split('/').pop()}</code></p>
                      </div>
                    )}
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
                  <p>To use dotnet from the command line, you need to add it to your PATH. You can try the automatic option above, or choose one of the options below:</p>
                  
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-blue-800 mb-2">Option 1: One-command automatic setup (with backup)</h4>
                      <p className="mb-2 text-xs">This command will automatically detect your shell profile, create a backup, and add .NET to your PATH:</p>
                      <div className="p-3 bg-blue-100 rounded-lg relative">
                        <code className="text-sm font-mono text-blue-900 block pr-16 whitespace-pre-wrap break-all">
                          {`PROFILE_FILE=$([ -f ~/.zshrc ] && echo ~/.zshrc || [ -f ~/.bashrc ] && echo ~/.bashrc || echo ~/.profile) && cp "$PROFILE_FILE" "$PROFILE_FILE.backup.$(date +%Y%m%d_%H%M%S)" && echo -e "\\n# [hudapp_begin add_dotnet_to_path]\\n# Add .NET to the PATH\\nif [ -d \\"${dotnetInfo.detectedPath}\\" ] ; then\\n    PATH=\\"${dotnetInfo.detectedPath}:$PATH\\"\\nfi\\n# [hudapp_end add_dotnet_to_path]\\n" >> "$PROFILE_FILE" && echo "Backup created: $PROFILE_FILE.backup.$(date +%Y%m%d_%H%M%S)" && echo "Added .NET to $PROFILE_FILE. Please restart your terminal or run: source $PROFILE_FILE"`}
                        </code>
                        <CopyButton 
                          text={`PROFILE_FILE=$([ -f ~/.zshrc ] && echo ~/.zshrc || [ -f ~/.bashrc ] && echo ~/.bashrc || echo ~/.profile) && cp "$PROFILE_FILE" "$PROFILE_FILE.backup.$(date +%Y%m%d_%H%M%S)" && echo -e "\\n# [hudapp_begin add_dotnet_to_path]\\n# Add .NET to the PATH\\nif [ -d \\"${dotnetInfo.detectedPath}\\" ] ; then\\n    PATH=\\"${dotnetInfo.detectedPath}:$PATH\\"\\nfi\\n# [hudapp_end add_dotnet_to_path]\\n" >> "$PROFILE_FILE" && echo "Backup created: $PROFILE_FILE.backup.$(date +%Y%m%d_%H%M%S)" && echo "Added .NET to $PROFILE_FILE. Please restart your terminal or run: source $PROFILE_FILE"`}
                          className="absolute top-2 right-2"
                        />
                      </div>
                      <div className="mt-2 space-y-1">
                        <p className="text-xs text-blue-600">This command will:</p>
                        <ul className="text-xs text-blue-600 list-disc list-inside ml-2 space-y-0.5">
                          <li>Automatically choose ~/.zshrc, ~/.bashrc, or ~/.profile (in that order)</li>
                          <li>Create a timestamped backup (e.g., ~/.bashrc.backup.20241220_143052)</li>
                          <li>Add the PATH configuration safely</li>
                          <li>Show you exactly what was done</li>
                        </ul>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium text-blue-800 mb-2">Option 2: Temporary (current session only)</h4>
                      <div className="p-3 bg-blue-100 rounded-lg relative">
                        <code className="text-sm font-mono text-blue-900 block pr-16">
                          export PATH=$PATH:{dotnetInfo.detectedPath}
                        </code>
                        <CopyButton 
                          text={`export PATH=$PATH:${dotnetInfo.detectedPath}`}
                          className="absolute top-2 right-2"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-blue-800 mb-2">Option 3: Manual permanent setup</h4>
                      <p className="mb-2">Add the following lines to your shell profile file (<code className="bg-blue-100 px-1 rounded">~/.bashrc</code>, <code className="bg-blue-100 px-1 rounded">~/.zshrc</code>, or <code className="bg-blue-100 px-1 rounded">~/.profile</code>):</p>
                      
                      <div className="space-y-3">
                        {/* Method 1: Simple PATH addition with conditional check */}
                        <div>
                          <h5 className="text-sm font-medium text-blue-800 mb-1">Method 1: Simple PATH addition (recommended)</h5>
                          <div className="p-3 bg-blue-100 rounded-lg relative">
                            <code className="text-sm font-mono text-blue-900 block whitespace-pre pr-16">
{`# [hudapp_begin add_dotnet_to_path]
# Add .NET to the PATH
if [ -d "${dotnetInfo.detectedPath}" ] ; then
    PATH="${dotnetInfo.detectedPath}:$PATH"
fi
# [hudapp_end add_dotnet_to_path]
`}
                            </code>
                            <CopyButton 
                              text={`# [hudapp_begin add_dotnet_to_path]\n# Add .NET to the PATH\nif [ -d "${dotnetInfo.detectedPath}" ] ; then\n    PATH="${dotnetInfo.detectedPath}:$PATH"\nfi\n# [hudapp_end add_dotnet_to_path]\n`}
                              className="absolute top-2 right-2"
                            />
                          </div>
                        </div>
                        
                        {/* Method 2: With DOTNET_ROOT */}
                        <div>
                          <h5 className="text-sm font-medium text-blue-800 mb-1">Method 2: With DOTNET_ROOT environment variable</h5>
                          <div className="p-3 bg-blue-100 rounded-lg space-y-1 relative">
                            <code className="text-sm font-mono text-blue-900 block pr-16 whitespace-pre">
{`# [hudapp_begin add_dotnet_to_path]
# Add .NET to the PATH
export DOTNET_ROOT=${dotnetInfo.detectedPath}
export PATH=$PATH:$DOTNET_ROOT:$DOTNET_ROOT/tools
# [hudapp_end add_dotnet_to_path]
`}
                            </code>
                            <CopyButton 
                              text={`# [hudapp_begin add_dotnet_to_path]\n# Add .NET to the PATH\nexport DOTNET_ROOT=${dotnetInfo.detectedPath}\nexport PATH=$PATH:$DOTNET_ROOT:$DOTNET_ROOT/tools\n# [hudapp_end add_dotnet_to_path]\n`}
                              className="absolute top-2 right-2"
                            />
                          </div>
                        </div>
                      </div>
                      
                      <p className="mt-2 text-xs">After adding these lines, restart your terminal or run <code className="bg-blue-100 px-1 rounded">source ~/.bashrc</code> (or your shell profile file).</p>
                    </div>
                  </div>
                  
                  <div className="mt-4 p-3 bg-blue-100 rounded-lg relative">
                    <p className="font-medium text-blue-800 mb-1">Verify the setup:</p>
                    <code className="text-sm font-mono text-blue-900 block pr-16">dotnet --version</code>
                    <CopyButton 
                      text="dotnet --version"
                      className="absolute top-2 right-2"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Additional Installation Section */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-blue-800 mb-3">Install Additional .NET Versions</h3>
              <div className="text-sm text-blue-700 mb-4">
                <p>You can install multiple .NET versions side by side. This is useful for maintaining compatibility with different projects.</p>
              </div>
              
              {/* Available Versions */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="bg-white p-4 rounded-lg border">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-gray-800">.NET 7</h4>
                    {dotnetInfo.sdks.some(sdk => sdk.includes('7.')) ? (
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">Installed</span>
                    ) : (
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">Not Installed</span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mb-2">End of Support - Legacy projects only</p>
                  <div className="mb-3 p-2 bg-orange-50 border border-orange-200 rounded text-xs text-orange-800">
                    ⚠️ Support ended May 2024
                  </div>
                  <button
                    onClick={() => statusTerminalRef.current?.startInstallation('7.0')}
                    disabled={dotnetInfo.sdks.some(sdk => sdk.includes('7.'))}
                    className="w-full px-3 py-2 bg-orange-600 text-white text-sm rounded hover:bg-orange-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                  >
                    {dotnetInfo.sdks.some(sdk => sdk.includes('7.')) ? 'Already Installed' : 'Install .NET 7'}
                  </button>
                </div>
                
                <div className="bg-white p-4 rounded-lg border">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-gray-800">.NET 8 LTS</h4>
                    {dotnetInfo.sdks.some(sdk => sdk.includes('8.')) ? (
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">Installed</span>
                    ) : (
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">Not Installed</span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mb-3">Long Term Support (LTS) - Recommended for production</p>
                  <button
                    onClick={() => statusTerminalRef.current?.startInstallation('8.0')}
                    disabled={dotnetInfo.sdks.some(sdk => sdk.includes('8.'))}
                    className="w-full px-3 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                  >
                    {dotnetInfo.sdks.some(sdk => sdk.includes('8.')) ? 'Already Installed' : 'Install .NET 8'}
                  </button>
                </div>
                
                <div className="bg-white p-4 rounded-lg border">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-gray-800">.NET 9</h4>
                    {dotnetInfo.sdks.some(sdk => sdk.includes('9.')) ? (
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">Installed</span>
                    ) : (
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">Not Installed</span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mb-3">Standard Term Support (STS) - Latest features</p>
                  <button
                    onClick={() => statusTerminalRef.current?.startInstallation('9.0')}
                    disabled={dotnetInfo.sdks.some(sdk => sdk.includes('9.'))}
                    className="w-full px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                  >
                    {dotnetInfo.sdks.some(sdk => sdk.includes('9.')) ? 'Already Installed' : 'Install .NET 9'}
                  </button>
                </div>
              </div>

            </div>

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
