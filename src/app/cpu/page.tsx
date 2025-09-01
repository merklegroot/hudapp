import CPUFeaturesDisplay from '../../components/CPUFeaturesDisplay';

export default function CPUPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            CPU Features & Instructions
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Detailed information about your CPU capabilities and supported instruction sets
          </p>
        </div>
        
        <CPUFeaturesDisplay />
      </div>
    </div>
  );
}