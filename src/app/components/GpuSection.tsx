import { gpuInfo } from '../workflows/models';

interface GpuSectionProps {
  gpus: gpuInfo[];
}

export default function GpuSection({ gpus }: GpuSectionProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">Graphics Cards</h2>
      {gpus && gpus.length > 0 ? (
        <div className="space-y-4">
          {gpus.map((gpu, index) => (
            <div key={index} className="p-4 bg-gray-50 rounded-lg">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-lg font-semibold text-gray-900">
                  GPU {gpu.index}: {gpu.name}
                </h3>
                <div className="flex gap-2">
                  {gpu.utilization && gpu.utilization > 0 && (
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      gpu.utilization > 80 ? 'bg-red-100 text-red-800' : 
                      gpu.utilization > 50 ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                    }`}>
                      {gpu.utilization}% usage
                    </span>
                  )}
                  {gpu.temperature && gpu.temperature > 0 && (
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      gpu.temperature > 80 ? 'bg-red-100 text-red-800' : 
                      gpu.temperature > 60 ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {gpu.temperature}°C
                    </span>
                  )}
                </div>
              </div>
              
              <div className="text-sm">
                <div>
                  <span className="text-gray-600">Driver:</span>
                  <span className="ml-1 font-medium">{gpu.driver}</span>
                </div>
              </div>
              
              {/* Utilization Bar */}
              {gpu.utilization && gpu.utilization > 0 && (
                <div className="mt-3">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm text-gray-600">GPU Utilization</span>
                    <span className="text-sm text-gray-600">{gpu.utilization}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className={`h-3 rounded-full ${
                        (gpu.utilization || 0) > 90 ? 'bg-red-500' : 
                        (gpu.utilization || 0) > 75 ? 'bg-yellow-500' : 'bg-green-500'
                      }`}
                      style={{ width: `${gpu.utilization}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-600">No GPU information available</p>
      )}
    </div>
  );
}
