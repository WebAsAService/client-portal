/**
 * API Demo Component
 *
 * Demonstrates the HTTP + TanStack Query approach for website generation.
 * Replaces WebSocket real-time updates with polling-based status tracking.
 */

import { useState } from 'react';
import { QueryProvider } from '../../providers/QueryProvider';
import {
  useApiHealth,
  useGenerationWorkflow,
  type GenerateWebsiteRequest
} from '../../hooks/useApiClient';

// Demo form component
const GenerationDemo = () => {
  const [formData, setFormData] = useState<Partial<GenerateWebsiteRequest>>({
    businessName: 'Acme Consulting LLC',
    description: 'Professional consulting services for modern businesses',
    industry: 'Business Consulting',
    services: ['Strategy Consulting', 'Business Analysis', 'Process Optimization'],
    targetAudience: 'Small to medium businesses looking to optimize operations',
    email: 'demo@acme-consulting.com',
    phone: '+1 (555) 123-4567',
    website: 'https://acme-consulting.com',
  });

  const { data: isApiHealthy, isLoading: isCheckingHealth } = useApiHealth();

  const {
    isGenerating,
    statusData,
    isPolling,
    startGeneration,
    cancelGeneration,
    reset,
    isCompleted,
    hasError,
    progress,
    isCancelling,
    generationError,
    statusError
  } = useGenerationWorkflow({
    onComplete: (data) => {
      console.log('Generation completed:', data);
      alert(`🎉 Website generated successfully! Preview: ${data.previewUrl || 'Available soon'}`);
    },
    onError: (error) => {
      console.error('Generation error:', error);
      alert(`❌ Generation failed: ${error.message}`);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.businessName || !formData.email) {
      alert('Please fill in required fields');
      return;
    }

    startGeneration(formData as GenerateWebsiteRequest);
  };

  const handleReset = () => {
    reset();
    setFormData({
      ...formData,
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* API Health Status */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">API Health Status</h2>
        <div className="flex items-center space-x-3">
          <div className={`w-3 h-3 rounded-full ${
            isCheckingHealth ? 'bg-yellow-500 animate-pulse' :
            isApiHealthy ? 'bg-green-500' : 'bg-red-500'
          }`} />
          <span className="text-sm">
            {isCheckingHealth ? 'Checking...' :
             isApiHealthy ? 'API is healthy' : 'API is unavailable'}
          </span>
        </div>
      </div>

      {/* Generation Form */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">HTTP + TanStack Query Demo</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Business Name *
              </label>
              <input
                type="text"
                value={formData.businessName}
                onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email *
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
            />
          </div>

          <div className="flex space-x-4">
            <button
              type="submit"
              disabled={isGenerating || !isApiHealthy}
              className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGenerating ? 'Generating...' : 'Generate Website'}
            </button>

            {(isGenerating || isCompleted || hasError) && (
              <button
                type="button"
                onClick={statusData && !isCompleted ? cancelGeneration : handleReset}
                disabled={isCancelling}
                className="bg-gray-600 text-white px-6 py-2 rounded-md hover:bg-gray-700 disabled:opacity-50"
              >
                {isCancelling ? 'Cancelling...' :
                 statusData && !isCompleted ? 'Cancel' : 'Reset'}
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Status Display */}
      {statusData && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Generation Status</h2>

          {/* Progress Bar */}
          <div className="mb-4">
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>Progress</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Status Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium">Status:</span>
              <span className={`ml-2 px-2 py-1 rounded text-xs ${
                statusData.status === 'completed' ? 'bg-green-100 text-green-800' :
                statusData.status === 'error' ? 'bg-red-100 text-red-800' :
                statusData.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {statusData.status}
              </span>
              {isPolling && <span className="ml-2 text-gray-500">(polling...)</span>}
            </div>

            <div>
              <span className="font-medium">Client ID:</span>
              <span className="ml-2 font-mono text-xs">{statusData.clientId}</span>
            </div>
          </div>

          <div className="mt-4">
            <span className="font-medium">Message:</span>
            <p className="text-gray-700 mt-1">{statusData.message}</p>
          </div>

          {/* Steps */}
          {statusData.steps && (
            <div className="mt-4">
              <span className="font-medium">Steps:</span>
              <div className="mt-2 space-y-2">
                {Object.entries(statusData.steps).map(([step, stepStatus]) => (
                  <div key={step} className="flex items-center space-x-3">
                    <div className={`w-2 h-2 rounded-full ${
                      stepStatus === 'completed' ? 'bg-green-500' :
                      stepStatus === 'in-progress' ? 'bg-blue-500 animate-pulse' :
                      stepStatus === 'failed' ? 'bg-red-500' : 'bg-gray-300'
                    }`} />
                    <span className="text-sm capitalize">{step.replace(/([A-Z])/g, ' $1')}</span>
                    <span className={`text-xs px-2 py-1 rounded ${
                      stepStatus === 'completed' ? 'bg-green-100 text-green-800' :
                      stepStatus === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                      stepStatus === 'failed' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {stepStatus}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Preview URL */}
          {statusData.previewUrl && (
            <div className="mt-4 p-4 bg-green-50 rounded-lg">
              <span className="font-medium text-green-800">Preview Ready:</span>
              <a
                href={statusData.previewUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-2 text-blue-600 hover:underline"
              >
                {statusData.previewUrl}
              </a>
            </div>
          )}
        </div>
      )}

      {/* Error Display */}
      {(generationError || statusError) && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-red-800 font-medium">Error</h3>
          <p className="text-red-700 mt-1">
            {generationError?.message || statusError?.message || 'An unknown error occurred'}
          </p>
        </div>
      )}

      {/* Technical Notes */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-blue-900 font-medium mb-2">Architecture Notes</h3>
        <ul className="text-blue-800 text-sm space-y-1">
          <li>• <strong>HTTP-Based:</strong> Uses REST API instead of WebSocket connections</li>
          <li>• <strong>Polling:</strong> Automatically polls for status updates every 5 seconds</li>
          <li>• <strong>GitHub Actions:</strong> Backend triggers GitHub workflow for actual generation</li>
          <li>• <strong>TanStack Query:</strong> Provides caching, retry logic, and loading states</li>
          <li>• <strong>Error Handling:</strong> Automatic retry with exponential backoff</li>
          <li>• <strong>Real-time Feel:</strong> Polling creates smooth progress updates</li>
        </ul>
      </div>
    </div>
  );
};

// Main component with provider
export default function ApiDemo() {
  return (
    <QueryProvider>
      <GenerationDemo />
    </QueryProvider>
  );
}