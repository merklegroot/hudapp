'use client';

import { useState, useEffect } from 'react';

interface ProfileFile {
  path: string;
  description: string;
  exists: boolean;
  isMainProfile?: boolean;
}

interface ProfileInfo {
  platform: string;
  platformType: number;
  distroInfo?: string;
  distroFamily?: string;
  profileFiles?: ProfileFile[];
  profileInstructions: {
    title: string;
    description: string;
    methods: {
      name: string;
      description: string;
      steps: string[];
    }[];
  };
}

export default function Profile() {
  const [profileInfo, setProfileInfo] = useState<ProfileInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedMethod, setExpandedMethod] = useState<number | null>(null);

  useEffect(() => {
    fetch('/api/profile')
      .then(response => response.json())
      .then(data => {
        setProfileInfo(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching profile information:', err);
        setError('Failed to fetch profile information');
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] p-8 flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading profile information...</div>
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

  if (!profileInfo) {
    return (
      <div className="min-h-[calc(100vh-4rem)] p-8 flex items-center justify-center">
        <div className="text-xl text-gray-600">No profile information available</div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Profile</h1>
        
        {/* Platform Detection */}
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-8">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-blue-700">
                <span className="font-medium">Detected Operating System:</span> {profileInfo.platform}
                {profileInfo.distroInfo && (
                  <span className="block mt-1">
                    <span className="font-medium">Distribution:</span> {profileInfo.distroInfo}
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Linux Profile Files */}
        {profileInfo.profileFiles && profileInfo.profileFiles.length > 0 && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Your Profile Files</h2>
            <p className="text-gray-600 mb-6">
              Based on your distribution ({profileInfo.distroInfo}), these are the most likely locations for your profile files:
            </p>
            
            <div className="space-y-3">
              {profileInfo.profileFiles.map((file, index) => (
                <div key={index} className={`border rounded-lg p-4 ${file.exists ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50'}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <code className="text-sm font-mono text-gray-900 bg-gray-100 px-2 py-1 rounded">
                          {file.path}
                        </code>
                        {file.isMainProfile && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            Primary
                          </span>
                        )}
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          file.exists 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {file.exists ? '✓ Exists' : '✗ Does not exist'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-2">{file.description}</p>
                      {file.exists && (
                        <p className="text-xs text-green-700 mt-1">
                          You can edit this file to customize your profile.
                        </p>
                      )}
                      {!file.exists && (
                        <p className="text-xs text-gray-600 mt-1">
                          You can create this file if you need it for your customizations.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Non-Linux Profile Instructions */}
        {(!profileInfo.profileFiles || profileInfo.profileFiles.length === 0) && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              {profileInfo.profileInstructions.title}
            </h2>
            
            <p className="text-gray-600 mb-6">
              {profileInfo.profileInstructions.description}
            </p>

            <div className="space-y-4">
              {profileInfo.profileInstructions.methods.map((method, index) => (
                <div key={index} className="border border-gray-200 rounded-lg">
                  <button
                    onClick={() => setExpandedMethod(expandedMethod === index ? null : index)}
                    className="w-full px-6 py-4 text-left hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">{method.name}</h3>
                        <p className="text-sm text-gray-600 mt-1">{method.description}</p>
                      </div>
                      <svg
                        className={`h-5 w-5 text-gray-400 transition-transform ${
                          expandedMethod === index ? 'rotate-180' : ''
                        }`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </button>
                  
                  {expandedMethod === index && (
                    <div className="px-6 pb-4">
                      <div className="border-t border-gray-200 pt-4">
                        <h4 className="text-sm font-medium text-gray-900 mb-3">Steps:</h4>
                        <ol className="list-decimal list-inside space-y-2">
                          {method.steps.map((step, stepIndex) => (
                            <li key={stepIndex} className="text-sm text-gray-700 leading-relaxed">
                              {step}
                            </li>
                          ))}
                        </ol>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Warning Notice */}
            <div className="mt-8 bg-yellow-50 border-l-4 border-yellow-400 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-yellow-700">
                    <span className="font-medium">Important:</span> Always be careful when modifying system settings or user accounts. 
                    Make sure you have appropriate permissions and consider backing up your system before making significant changes.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
