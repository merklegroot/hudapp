'use client';

import { useState, useEffect, useRef } from 'react';
import { SiLinux, SiApple } from 'react-icons/si';
import { DiWindows } from 'react-icons/di';
import { FaCopy, FaCheck } from 'react-icons/fa';
import PythonOperationsTerminal, { StatusTerminalRef } from './PythonOperationsTerminal';
import { BsdIcon } from '../components/Icons/BsdIcon';

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

interface PythonInfo {
  isInstalled: boolean;
  version?: string;
  pipVersion?: string;
  packages: string[];
  inPath: boolean;
  detectedPath?: string;
  pythonExecutable?: string;
  python2Info?: {
    available: boolean;
    version?: string;
    path?: string;
  };
  pipInfo?: {
    pip3Available: boolean;
    pip3Version?: string;
    pip3Path?: string;
    pipAvailable: boolean;
    pipVersion?: string;
    pipPath?: string;
  };
  allFoundPaths?: string[];
  error?: string;
}

export default function Python() {
  const statusTerminalRef = useRef<StatusTerminalRef>(null);
  const [pythonInfo, setPythonInfo] = useState<PythonInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedVersion, setSelectedVersion] = useState('3.12');
  const [userDistro, setUserDistro] = useState<string>('unknown');

  const fetchPythonInfo = (showLoading = true) => {
    if (showLoading) {
      setLoading(true);
    }
    fetch('/api/python')
      .then(response => response.json() as Promise<PythonInfo>)
      .then(data => {
        setPythonInfo(data);
        setLoading(false);
      })
      .catch((err: Error) => {
        console.error('Error fetching Python info:', err);
        setError('Failed to fetch Python information');
        setLoading(false);
      });
  };

  const detectUserDistribution = async () => {
    try {
      const response = await fetch('/api/python', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'detect-distro' })
      });
      
      if (response.ok) {
        const data = await response.json();
        setUserDistro(data.distro || 'unknown');
      }
    } catch (error) {
      console.error('Failed to detect distribution:', error);
      // Keep default 'unknown'
    }
  };

  const getPipInstallCommand = (distro: string): { command: string; description: string } => {
    const distroLower = distro.toLowerCase();
    
    if (distroLower.includes('ubuntu') || distroLower.includes('debian')) {
      return {
        command: 'sudo apt update && sudo apt install -y python3-pip',
        description: 'Ubuntu/Debian (apt package manager)'
      };
    } else if (distroLower.includes('fedora') || distroLower.includes('rhel') || distroLower.includes('centos')) {
      return {
        command: 'sudo dnf install -y python3-pip',
        description: 'Fedora/RHEL/CentOS (dnf package manager)'
      };
    } else if (distroLower.includes('arch')) {
      return {
        command: 'sudo pacman -S --noconfirm python-pip',
        description: 'Arch Linux (pacman package manager)'
      };
    } else if (distroLower.includes('opensuse')) {
      return {
        command: 'sudo zypper install -y python3-pip',
        description: 'openSUSE (zypper package manager)'
      };
    } else {
      return {
        command: 'curl -s https://bootstrap.pypa.io/get-pip.py | python3 -',
        description: 'Generic (get-pip.py script)'
      };
    }
  };

  const handleDetectionComplete = () => {
    // Terminal stays open, just mark detection as complete
    // The terminal will show it's ready for additional operations
  };

  useEffect(() => {
    fetchPythonInfo();
    detectUserDistribution();
  }, []);

  const handleInstallStart = () => {
    // Terminal is already persistent - no action needed
  };

  const handleInstallComplete = () => {
    // Refresh Python info after installation without showing loading state
    // Keep terminal visible and don't trigger loading state
    setTimeout(() => {
      fetchPythonInfo(false);
    }, 2000);
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] p-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <h1 className="text-4xl font-bold">Python</h1>
            </div>
            <div className="flex items-center gap-4">
              <a
                href="https://www.python.org"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.25 5.5a.75.75 0 00-.75.75v8.5c0 .414.336.75.75.75h8.5a.75.75 0 00.75-.75v-4a.75.75 0 011.5 0v4A2.25 2.25 0 0112.75 17h-8.5A2.25 2.25 0 012 14.75v-8.5A2.25 2.25 0 014.25 4h5a.75.75 0 010 1.5h-5z" clipRule="evenodd" />
                  <path fillRule="evenodd" d="M6.194 12.753a.75.75 0 001.06.053L16.5 4.44v2.81a.75.75 0 001.5 0v-4.5a.75.75 0 00-.75-.75h-4.5a.75.75 0 000 1.5h2.553l-9.056 8.194a.75.75 0 00-.053 1.06z" clipRule="evenodd" />
                </svg>
                Official Python Website
              </a>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
            <PythonOperationsTerminal 
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

  if (!pythonInfo) {
    return (
      <div className="min-h-[calc(100vh-4rem)] p-8 flex items-center justify-center">
        <div className="text-xl text-gray-600">No Python information available</div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <h1 className="text-4xl font-bold">Python</h1>
          </div>
          <div className="flex items-center gap-4">
            <a
              href="https://www.python.org"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.25 5.5a.75.75 0 00-.75.75v8.5c0 .414.336.75.75.75h8.5a.75.75 0 00.75-.75v-4a.75.75 0 011.5 0v4A2.25 2.25 0 0112.75 17h-8.5A2.25 2.25 0 012 14.75v-8.5A2.25 2.25 0 014.25 4h5a.75.75 0 010 1.5h-5z" clipRule="evenodd" />
                <path fillRule="evenodd" d="M6.194 12.753a.75.75 0 001.06.053L16.5 4.44v2.81a.75.75 0 001.5 0v-4.5a.75.75 0 00-.75-.75h-4.5a.75.75 0 000 1.5h2.553l-9.056 8.194a.75.75 0 00-.053 1.06z" clipRule="evenodd" />
              </svg>
              Official Python Website
            </a>
          </div>
        </div>
        
        {/* Persistent Terminal - Always visible */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
          <PythonOperationsTerminal 
            ref={statusTerminalRef}
            onDetectionComplete={handleDetectionComplete}
            onInstallStart={handleInstallStart}
            onInstallComplete={handleInstallComplete}
            className="w-full"
          />
        </div>
        
        {!pythonInfo.isInstalled ? (
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
                      Python is not installed
                    </h3>
                    <div className="mt-2 text-sm text-yellow-700">
                      <p>Python is not currently installed on this machine.</p>
                    </div>
                  </div>
                </div>
                <div className="ml-4 flex items-center gap-3">
                  <select
                    value={selectedVersion}
                    onChange={(e) => setSelectedVersion(e.target.value)}
                    className="px-3 py-2 bg-white border border-gray-300 rounded text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="3.10">Python 3.10</option>
                    <option value="3.11">Python 3.11</option>
                    <option value="3.12">Python 3.12 LTS</option>
                    <option value="3.13">Python 3.13</option>
                  </select>
                  <button
                    onClick={() => statusTerminalRef.current?.startInstallation(selectedVersion)}
                    className="px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                  >
                    Install Python {selectedVersion}
                  </button>
                </div>
              </div>
            </div>

            {/* Installation Instructions */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-blue-800 mb-3">Installation Information</h3>
              <div className="text-sm text-blue-700 space-y-2">
                <p>This will install Python {selectedVersion} using your system&apos;s package manager or pyenv.</p>
                <p>The installation process will:</p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>Detect your Linux distribution</li>
                  <li>Use the appropriate package manager (apt, dnf, pacman, zypper)</li>
                  <li>Install Python, pip, and development tools</li>
                  <li>Fall back to pyenv if package manager is unavailable</li>
                </ul>
                <p className="font-medium">You may be prompted for your password during installation.</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Installation Status */}
            {pythonInfo.inPath ? (
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
                        Python is installed and ready to use!
                      </h3>
                      <div className="mt-2 text-sm text-green-700">
                        <p>You can now create and run Python applications on this machine.</p>
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
                        Python is installed but not in PATH
                      </h3>
                      <div className="mt-2 text-sm text-yellow-700">
                        <p>
                          Python is installed at <code className="bg-yellow-100 px-1 rounded font-mono">{pythonInfo.detectedPath}</code> 
                          but is not accessible from the command line.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Python Version and Pip Info */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">Python Installation Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                {pythonInfo.version && (
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h3 className="text-sm font-medium text-gray-600 mb-1">Python Version</h3>
                    <code className="text-lg font-mono text-gray-900">{pythonInfo.version}</code>
                  </div>
                )}
                {pythonInfo.pipVersion && (
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h3 className="text-sm font-medium text-gray-600 mb-1">pip Version</h3>
                    <code className="text-sm font-mono text-gray-900">{pythonInfo.pipVersion}</code>
                  </div>
                )}
              </div>
            </div>

            {/* Python Installation Locations */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">Python Installation Locations</h2>
              
              {/* Current Active Installation */}
              {pythonInfo.pythonExecutable && (
                <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <h3 className="text-lg font-semibold text-green-800 mb-2">Current Python Installation</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <code className="text-sm font-mono text-green-900">{pythonInfo.pythonExecutable}</code>
                      <span className="text-xs text-green-600">Active executable</span>
                    </div>
                    {pythonInfo.detectedPath && pythonInfo.detectedPath !== pythonInfo.pythonExecutable && (
                      <div className="flex justify-between items-center">
                        <code className="text-sm font-mono text-green-900">{pythonInfo.detectedPath}</code>
                        <span className="text-xs text-green-600">Installation directory</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              {/* All Found Installations */}
              {pythonInfo.allFoundPaths && pythonInfo.allFoundPaths.length > 0 && (
                <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h3 className="text-lg font-semibold text-blue-800 mb-2">
                    All Found Python Installations ({pythonInfo.allFoundPaths.length})
                  </h3>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {pythonInfo.allFoundPaths.map((path, index) => (
                      <div key={index} className="flex justify-between items-center">
                        <code className="text-sm font-mono text-blue-900">{path}</code>
                        <span className="text-xs text-blue-600">
                          {path === pythonInfo.pythonExecutable ? 'Active' : 'Available'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Python 2 / Legacy Python Status */}
              <div className="mb-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Legacy Python Command Status</h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <code className="text-sm font-mono text-gray-900">python</code>
                      {pythonInfo.python2Info?.available ? (
                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">Available</span>
                      ) : (
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">Not Available</span>
                      )}
                    </div>
                    <span className="text-xs text-gray-500">
                      {pythonInfo.python2Info?.available ? 'Command exists' : 'Command not found'}
                    </span>
                  </div>
                  
                  {pythonInfo.python2Info?.available && (
                    <>
                      {pythonInfo.python2Info.version && (
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-700">Version:</span>
                          <code className="text-sm font-mono text-gray-900">{pythonInfo.python2Info.version}</code>
                        </div>
                      )}
                      {pythonInfo.python2Info.path && (
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-700">Path:</span>
                          <code className="text-sm font-mono text-gray-900">{pythonInfo.python2Info.path}</code>
                        </div>
                      )}
                    </>
                  )}
                  
                  <div className="mt-2 p-2 bg-blue-50 rounded text-xs text-blue-700">
                    <p><strong>Note:</strong> The <code>python</code> command behavior varies by system:</p>
                    <ul className="list-disc list-inside mt-1 space-y-0.5">
                      <li>Some systems have no <code>python</code> command (Python 3 only via <code>python3</code>)</li>
                      <li>Some systems map <code>python</code> to Python 3</li>
                      <li>Older systems may have <code>python</code> pointing to Python 2.x</li>
                      <li>Use <code>python3</code> explicitly to ensure Python 3</li>
                    </ul>
                  </div>
                </div>
              </div>
              
              {/* Pip Commands Status */}
              <div className="mb-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Package Manager Commands Status</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  {/* pip3 status */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <code className="text-sm font-mono text-gray-900">pip3</code>
                        {pythonInfo.pipInfo?.pip3Available ? (
                          <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">Available</span>
                        ) : (
                          <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">Not Available</span>
                        )}
                      </div>
                      <span className="text-xs text-gray-500">Python 3 package manager</span>
                    </div>
                    
                    {pythonInfo.pipInfo?.pip3Available && (
                      <div className="space-y-1 text-sm">
                        {pythonInfo.pipInfo.pip3Version && (
                          <div className="flex justify-between items-center">
                            <span className="text-gray-700">Version:</span>
                            <code className="text-xs font-mono text-gray-900 max-w-[200px] truncate">{pythonInfo.pipInfo.pip3Version}</code>
                          </div>
                        )}
                        {pythonInfo.pipInfo.pip3Path && (
                          <div className="flex justify-between items-center">
                            <span className="text-gray-700">Path:</span>
                            <code className="text-xs font-mono text-gray-900">{pythonInfo.pipInfo.pip3Path}</code>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* pip status */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <code className="text-sm font-mono text-gray-900">pip</code>
                        {pythonInfo.pipInfo?.pipAvailable ? (
                          <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">Available</span>
                        ) : (
                          <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">Not Available</span>
                        )}
                      </div>
                      <span className="text-xs text-gray-500">Generic package manager</span>
                    </div>
                    
                    {pythonInfo.pipInfo?.pipAvailable && (
                      <div className="space-y-1 text-sm">
                        {pythonInfo.pipInfo.pipVersion && (
                          <div className="flex justify-between items-center">
                            <span className="text-gray-700">Version:</span>
                            <code className="text-xs font-mono text-gray-900 max-w-[200px] truncate">{pythonInfo.pipInfo.pipVersion}</code>
                          </div>
                        )}
                        {pythonInfo.pipInfo.pipPath && (
                          <div className="flex justify-between items-center">
                            <span className="text-gray-700">Path:</span>
                            <code className="text-xs font-mono text-gray-900">{pythonInfo.pipInfo.pipPath}</code>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Show pip installation option if pip is not available */}
                {(!pythonInfo.pipInfo?.pip3Available || !pythonInfo.pipInfo?.pipAvailable) && (
                  <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="mb-3">
                      <h4 className="text-sm font-medium text-yellow-800 mb-2">Install Package Manager</h4>
                      <p className="text-sm text-yellow-700 mb-3">
                        pip is the standard package manager for Python. It allows you to install and manage Python packages from PyPI.
                        Since pip installation requires sudo privileges, please run the following command in your terminal:
                      </p>
                    </div>
                    
                    {/* Command for detected distribution */}
                    <div className="mb-3">
                      <div className="flex items-center justify-between mb-2">
                        <h5 className="text-xs font-medium text-yellow-800">
                          {userDistro !== 'unknown' ? `For ${getPipInstallCommand(userDistro).description}:` : 'Recommended command:'}
                        </h5>
                      </div>
                      <div className="flex items-center gap-2 p-2 bg-gray-800 rounded text-white font-mono text-sm">
                        <code className="flex-1">{getPipInstallCommand(userDistro).command}</code>
                        <CopyButton text={getPipInstallCommand(userDistro).command} className="bg-yellow-600 hover:bg-yellow-700" />
                      </div>
                    </div>
                    
                    {/* Alternative commands for other distributions */}
                    <details className="mb-2">
                      <summary className="text-xs text-yellow-700 cursor-pointer hover:text-yellow-800">
                        Show commands for other distributions
                      </summary>
                      <div className="mt-2 space-y-2">
                        {['ubuntu', 'fedora', 'arch', 'opensuse', 'unknown'].map((distro) => {
                          const { command, description } = getPipInstallCommand(distro);
                          if (distro === userDistro.toLowerCase()) return null;
                          
                          return (
                            <div key={distro} className="text-xs">
                              <div className="text-yellow-700 mb-1">{description}:</div>
                              <div className="flex items-center gap-2 p-2 bg-gray-800 rounded text-white font-mono">
                                <code className="flex-1 text-xs">{command}</code>
                                <CopyButton text={command} className="bg-yellow-600 hover:bg-yellow-700 text-xs px-1 py-0.5" />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </details>
                    
                    <div className="text-xs text-yellow-600">
                      <p><strong>After installation, you will have:</strong></p>
                      <ul className="list-disc list-inside ml-2 mt-1">
                        <li><code>python3-pip</code> package via system package manager</li>
                        <li>Both <code>pip3</code> and <code>pip</code> commands available</li>
                        <li>Ability to install Python packages with <code>pip3 install package_name</code></li>
                      </ul>
                    </div>
                  </div>
                )}
                
                <div className="mt-3 p-2 bg-blue-50 rounded text-xs text-blue-700">
                  <p><strong>Note:</strong> Package manager command behavior:</p>
                  <ul className="list-disc list-inside mt-1 space-y-0.5">
                    <li><code>pip3</code> is explicitly for Python 3 packages (recommended)</li>
                    <li><code>pip</code> may point to Python 2 or 3 depending on system configuration</li>
                    <li>Use <code>pip3</code> to ensure Python 3 compatibility</li>
                    <li>Some systems only provide <code>pip3</code> and no generic <code>pip</code> command</li>
                  </ul>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <SiLinux className="w-5 h-5 text-yellow-500" />
                    <h3 className="text-lg font-medium text-gray-700">Linux</h3>
                  </div>
                  <div className="space-y-2">
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex justify-between items-center">
                        <code className="text-sm font-mono text-gray-900">/usr/bin/python3</code>
                        <span className="text-xs text-gray-500">System Python (package manager)</span>
                      </div>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex justify-between items-center">
                        <code className="text-sm font-mono text-gray-900">/usr/local/bin/python3</code>
                        <span className="text-xs text-gray-500">Custom compiled installation</span>
                      </div>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex justify-between items-center">
                        <code className="text-sm font-mono text-gray-900">~/.pyenv/versions/*/bin/python</code>
                        <span className="text-xs text-gray-500">pyenv managed versions</span>
                      </div>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex justify-between items-center">
                        <code className="text-sm font-mono text-gray-900">~/.local/bin/python3</code>
                        <span className="text-xs text-gray-500">User-local installation</span>
                      </div>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex justify-between items-center">
                        <code className="text-sm font-mono text-gray-900">/snap/python3/current/bin/python3</code>
                        <span className="text-xs text-gray-500">Snap package installation</span>
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
                        <code className="text-sm font-mono text-gray-900">C:\Python3X\python.exe</code>
                        <span className="text-xs text-gray-500">Default installation (X = version)</span>
                      </div>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex justify-between items-center">
                        <code className="text-sm font-mono text-gray-900">%USERPROFILE%\AppData\Local\Programs\Python\Python3X\python.exe</code>
                        <span className="text-xs text-gray-500">User-specific installation</span>
                      </div>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex justify-between items-center">
                        <code className="text-sm font-mono text-gray-900">C:\Program Files\Python3X\python.exe</code>
                        <span className="text-xs text-gray-500">System-wide installation</span>
                      </div>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex justify-between items-center">
                        <code className="text-sm font-mono text-gray-900">%USERPROFILE%\.pyenv\pyenv-win\versions\*\python.exe</code>
                        <span className="text-xs text-gray-500">pyenv-win managed versions</span>
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
                        <code className="text-sm font-mono text-gray-900">/usr/bin/python3</code>
                        <span className="text-xs text-gray-500">System Python (Xcode tools)</span>
                      </div>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex justify-between items-center">
                        <code className="text-sm font-mono text-gray-900">/usr/local/bin/python3</code>
                        <span className="text-xs text-gray-500">Homebrew installation</span>
                      </div>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex justify-between items-center">
                        <code className="text-sm font-mono text-gray-900">/opt/homebrew/bin/python3</code>
                        <span className="text-xs text-gray-500">Apple Silicon Homebrew</span>
                      </div>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex justify-between items-center">
                        <code className="text-sm font-mono text-gray-900">~/.pyenv/versions/*/bin/python</code>
                        <span className="text-xs text-gray-500">pyenv managed versions</span>
                      </div>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex justify-between items-center">
                        <code className="text-sm font-mono text-gray-900">/Library/Frameworks/Python.framework/Versions/*/bin/python3</code>
                        <span className="text-xs text-gray-500">Official Python.org installer</span>
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
                        <code className="text-sm font-mono text-gray-900">/usr/local/bin/python3</code>
                        <span className="text-xs text-gray-500">Ports/pkgsrc installation</span>
                      </div>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex justify-between items-center">
                        <code className="text-sm font-mono text-gray-900">/usr/pkg/bin/python3</code>
                        <span className="text-xs text-gray-500">NetBSD pkgsrc</span>
                      </div>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex justify-between items-center">
                        <code className="text-sm font-mono text-gray-900">~/.pyenv/versions/*/bin/python</code>
                        <span className="text-xs text-gray-500">pyenv managed versions</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="text-sm font-medium text-blue-800 mb-2">Environment Variables</h4>
                  <div className="text-sm text-blue-700 space-y-1">
                    <p><code className="bg-blue-100 px-1 rounded">PYTHONPATH</code> - Additional module search paths</p>
                    <p><code className="bg-blue-100 px-1 rounded">PYTHONHOME</code> - Python installation directory</p>
                    <p><code className="bg-blue-100 px-1 rounded">PATH</code> - Should include Python executable directory</p>
                    <p>Use <code className="bg-blue-100 px-1 rounded">python3 -c &quot;import sys; print(sys.executable)&quot;</code> to find current Python path</p>
                    <p>Use <code className="bg-blue-100 px-1 rounded">which python3</code> or <code className="bg-blue-100 px-1 rounded">whereis python3</code> to locate installations</p>
                    <div className="mt-3 pt-3 border-t border-blue-200">
                      <p className="font-medium text-blue-800 mb-2">Helpful Resources:</p>
                      <div className="flex flex-wrap gap-2">
                        <a 
                          href="https://docs.python.org/3/using/index.html" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 hover:bg-blue-200 text-blue-800 text-xs rounded transition-colors"
                        >
                          Setup Guide
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4.25 5.5a.75.75 0 00-.75.75v8.5c0 .414.336.75.75.75h8.5a.75.75 0 00.75-.75v-4a.75.75 0 011.5 0v4A2.25 2.25 0 0112.75 17h-8.5A2.25 2.25 0 012 14.75v-8.5A2.25 2.25 0 014.25 4h5a.75.75 0 010 1.5h-5z" clipRule="evenodd" />
                            <path fillRule="evenodd" d="M6.194 12.753a.75.75 0 001.06.053L16.5 4.44v2.81a.75.75 0 001.5 0v-4.5a.75.75 0 00-.75-.75h-4.5a.75.75 0 000 1.5h2.553l-9.056 8.194a.75.75 0 00-.053 1.06z" clipRule="evenodd" />
                          </svg>
                        </a>
                        <a 
                          href="https://pypi.org" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 hover:bg-blue-200 text-blue-800 text-xs rounded transition-colors"
                        >
                          PyPI Packages
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4.25 5.5a.75.75 0 00-.75.75v8.5c0 .414.336.75.75.75h8.5a.75.75 0 00.75-.75v-4a.75.75 0 011.5 0v4A2.25 2.25 0 0112.75 17h-8.5A2.25 2.25 0 012 14.75v-8.5A2.25 2.25 0 014.25 4h5a.75.75 0 010 1.5h-5z" clipRule="evenodd" />
                            <path fillRule="evenodd" d="M6.194 12.753a.75.75 0 001.06.053L16.5 4.44v2.81a.75.75 0 001.5 0v-4.5a.75.75 0 00-.75-.75h-4.5a.75.75 0 000 1.5h2.553l-9.056 8.194a.75.75 0 00-.053 1.06z" clipRule="evenodd" />
                          </svg>
                        </a>
                        <a 
                          href="https://docs.python.org/3/tutorial/venv.html" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 hover:bg-blue-200 text-blue-800 text-xs rounded transition-colors"
                        >
                          Virtual Environments
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4.25 5.5a.75.75 0 00-.75.75v8.5c0 .414.336.75.75.75h8.5a.75.75 0 00.75-.75v-4a.75.75 0 011.5 0v4A2.25 2.25 0 0112.75 17h-8.5A2.25 2.25 0 012 14.75v-8.5A2.25 2.25 0 014.25 4h5a.75.75 0 010 1.5h-5z" clipRule="evenodd" />
                            <path fillRule="evenodd" d="M6.194 12.753a.75.75 0 001.06.053L16.5 4.44v2.81a.75.75 0 001.5 0v-4.5a.75.75 0 00-.75-.75h-4.5a.75.75 0 000 1.5h2.553l-9.056 8.194a.75.75 0 00-.053 1.06z" clipRule="evenodd" />
                          </svg>
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Installed Packages */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">Installed Packages</h2>
              {pythonInfo.packages.length > 0 ? (
                <div className="space-y-2">
                  <p className="text-sm text-gray-600 mb-3">
                    Showing {pythonInfo.packages.length} installed packages:
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 max-h-96 overflow-y-auto">
                    {pythonInfo.packages.map((pkg, index) => (
                      <div key={index} className="p-2 bg-gray-50 rounded text-sm font-mono">
                        {pkg}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-gray-600">No packages found or unable to list packages</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
