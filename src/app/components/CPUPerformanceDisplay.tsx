'use client';

import { useState, useEffect } from 'react';
import { CPUPerformanceData } from '../workflows/cpuPerformanceLookup';

interface CPUPerformanceDisplayProps {
  cpuModel: string;
  cores?: number;
  threads?: number;
  frequency?: string;
}

interface PerformanceLookupResult {
  found: boolean;
  data?: CPUPerformanceData;
  suggestions?: string[];
  error?: string;
}

interface ComparisonData {
  current: CPUPerformanceData | null;
  better: CPUPerformanceData[];
  worse: CPUPerformanceData[];
  similar: CPUPerformanceData[];
}

export default function CPUPerformanceDisplay({ 
  cpuModel, 
  cores, 
  threads, 
  frequency 
}: CPUPerformanceDisplayProps) {
  const [performanceData, setPerformanceData] = useState<CPUPerformanceData | null>(null);
  const [comparisonData, setComparisonData] = useState<ComparisonData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showComparison, setShowComparison] = useState(false);

  useEffect(() => {
    const fetchPerformanceData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch performance data
        const params = new URLSearchParams({
          model: cpuModel,
          ...(cores && { cores: cores.toString() }),
          ...(threads && { threads: threads.toString() }),
          ...(frequency && { frequency })
        });

        const response = await fetch(`/api/cpu/performance?${params}`);
        const result: { success: boolean; data?: PerformanceLookupResult; error?: string } = await response.json();

        if (!result.success) {
          throw new Error(result.error || 'Failed to fetch performance data');
        }

        if (result.data?.found && result.data.data) {
          setPerformanceData(result.data.data);
        } else {
          setError('CPU performance data not found');
        }

        // Fetch comparison data
        const comparisonResponse = await fetch('/api/cpu/performance', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: cpuModel,
            cores,
            threads,
            frequency
          })
        });

        const comparisonResult: { success: boolean; data?: ComparisonData; error?: string } = await comparisonResponse.json();

        if (comparisonResult.success && comparisonResult.data) {
          setComparisonData(comparisonResult.data);
        }

      } catch (err) {
        console.error('Error fetching CPU performance data:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch performance data');
      } finally {
        setLoading(false);
      }
    };

    if (cpuModel) {
      fetchPerformanceData();
    }
  }, [cpuModel, cores, threads, frequency]);

  const getPerformanceColor = (rating: string) => {
    switch (rating) {
      case 'Excellent': return 'text-green-600 bg-green-50 border-green-200';
      case 'High': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'Above Average': return 'text-indigo-600 bg-indigo-50 border-indigo-200';
      case 'Average': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'Below Average': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'Low': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getPerformanceIcon = (rating: string) => {
    switch (rating) {
      case 'Excellent': return '🏆';
      case 'High': return '⭐';
      case 'Above Average': return '👍';
      case 'Average': return '👌';
      case 'Below Average': return '👎';
      case 'Low': return '⚠️';
      default: return '❓';
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Loading CPU performance data...</span>
        </div>
      </div>
    );
  }

  if (error || !performanceData) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-center py-8">
          <div className="text-red-500 text-4xl mb-4">⚠️</div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Performance Data Unavailable</h3>
          <p className="text-gray-600 mb-4">{error || 'No performance data found for this CPU'}</p>
          <div className="text-sm text-gray-500">
            <p>CPU Model: {cpuModel}</p>
            {cores && <p>Cores: {cores}</p>}
            {threads && <p>Threads: {threads}</p>}
            {frequency && <p>Frequency: {frequency}</p>}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">CPU Performance Rating</h2>
        <button
          onClick={() => setShowComparison(!showComparison)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          {showComparison ? 'Hide' : 'Show'} Comparison
        </button>
      </div>

      {/* Main Performance Card */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Performance Rating */}
        <div className={`p-6 rounded-lg border-2 ${getPerformanceColor(performanceData.performanceRating)}`}>
          <div className="flex items-center gap-3 mb-4">
            <span className="text-3xl">{getPerformanceIcon(performanceData.performanceRating)}</span>
            <div>
              <h3 className="text-xl font-bold">{performanceData.performanceRating}</h3>
              <p className="text-sm opacity-75">
                {performanceData.percentile}th percentile
              </p>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm font-medium">Performance Rating:</span>
              <span className="font-semibold">{performanceData.performanceRating}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium">Percentile:</span>
              <span className="font-semibold">{performanceData.percentile}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium">Data Source:</span>
              <span className="font-semibold capitalize">{performanceData.source}</span>
            </div>
          </div>
        </div>

        {/* Benchmark Scores */}
        <div className="p-6 bg-gray-50 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Benchmark Scores</h3>
          <div className="space-y-3">
            {performanceData.passmarkScore && (
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-600">PassMark:</span>
                <span className="font-semibold text-gray-900">{performanceData.passmarkScore.toLocaleString()}</span>
              </div>
            )}
            {performanceData.geekbenchSingle && (
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-600">Geekbench Single:</span>
                <span className="font-semibold text-gray-900">{performanceData.geekbenchSingle.toLocaleString()}</span>
              </div>
            )}
            {performanceData.geekbenchMulti && (
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-600">Geekbench Multi:</span>
                <span className="font-semibold text-gray-900">{performanceData.geekbenchMulti.toLocaleString()}</span>
              </div>
            )}
            {performanceData.cinebenchR23Single && (
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-600">Cinebench R23 Single:</span>
                <span className="font-semibold text-gray-900">{performanceData.cinebenchR23Single.toLocaleString()}</span>
              </div>
            )}
            {performanceData.cinebenchR23Multi && (
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-600">Cinebench R23 Multi:</span>
                <span className="font-semibold text-gray-900">{performanceData.cinebenchR23Multi.toLocaleString()}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Additional Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {performanceData.releaseYear && (
          <div className="p-4 bg-gray-50 rounded-lg">
            <h4 className="text-sm font-medium text-gray-600 mb-1">Release Year</h4>
            <p className="text-lg font-semibold text-gray-900">{performanceData.releaseYear}</p>
          </div>
        )}
        {performanceData.price && (
          <div className="p-4 bg-gray-50 rounded-lg">
            <h4 className="text-sm font-medium text-gray-600 mb-1">MSRP</h4>
            <p className="text-lg font-semibold text-gray-900">${performanceData.price}</p>
          </div>
        )}
        <div className="p-4 bg-gray-50 rounded-lg">
          <h4 className="text-sm font-medium text-gray-600 mb-1">Vendor</h4>
          <p className="text-lg font-semibold text-gray-900">{performanceData.vendor}</p>
        </div>
      </div>

      {/* Comparison Section */}
      {showComparison && comparisonData && (
        <div className="mt-6 space-y-6">
          <h3 className="text-xl font-semibold text-gray-800">Performance Comparison</h3>
          
          {/* Better Performance */}
          {comparisonData.better.length > 0 && (
            <div>
              <h4 className="text-lg font-medium text-green-700 mb-3">Better Performance CPUs</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {comparisonData.better.map((cpu, index) => (
                  <div key={index} className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="font-medium text-green-800">{cpu.model}</div>
                    <div className="text-sm text-green-600">
                      PassMark: {cpu.passmarkScore?.toLocaleString() || 'N/A'}
                    </div>
                    <div className="text-xs text-green-500">{cpu.performanceRating}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Similar Performance */}
          {comparisonData.similar.length > 0 && (
            <div>
              <h4 className="text-lg font-medium text-blue-700 mb-3">Similar Performance CPUs</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {comparisonData.similar.map((cpu, index) => (
                  <div key={index} className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="font-medium text-blue-800">{cpu.model}</div>
                    <div className="text-sm text-blue-600">
                      PassMark: {cpu.passmarkScore?.toLocaleString() || 'N/A'}
                    </div>
                    <div className="text-xs text-blue-500">{cpu.performanceRating}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Worse Performance */}
          {comparisonData.worse.length > 0 && (
            <div>
              <h4 className="text-lg font-medium text-orange-700 mb-3">Lower Performance CPUs</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {comparisonData.worse.map((cpu, index) => (
                  <div key={index} className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                    <div className="font-medium text-orange-800">{cpu.model}</div>
                    <div className="text-sm text-orange-600">
                      PassMark: {cpu.passmarkScore?.toLocaleString() || 'N/A'}
                    </div>
                    <div className="text-xs text-orange-500">{cpu.performanceRating}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Performance Bar */}
      <div className="mt-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-600">Performance Level</span>
          <span className="text-sm text-gray-500">{performanceData.percentile}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className={`h-3 rounded-full transition-all duration-500 ${
              performanceData.percentile >= 80 ? 'bg-green-500' :
              performanceData.percentile >= 60 ? 'bg-blue-500' :
              performanceData.percentile >= 40 ? 'bg-yellow-500' :
              performanceData.percentile >= 20 ? 'bg-orange-500' :
              'bg-red-500'
            }`}
            style={{ width: `${performanceData.percentile}%` }}
          ></div>
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>Low</span>
          <span>Average</span>
          <span>High</span>
          <span>Excellent</span>
        </div>
      </div>
    </div>
  );
}
