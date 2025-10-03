import React, { useState, useCallback } from 'react';
import { QueryProvider } from '../../providers/QueryProvider';
import { useGenerationStatus } from '../../hooks/useApiClient';
import PreviewReady from './PreviewReady';
import {
  Upload,
  Brain,
  Wand2,
  FolderGit2,
  Rocket,
  CheckCircle,
  AlertCircle,
  WifiOff,
  RotateCcw,
  ExternalLink
} from 'lucide-react';

// TypeScript interfaces
interface ProgressStep {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  status: 'pending' | 'in-progress' | 'completed' | 'failed';
}

// Import the interface from our API client
import type { GenerationStatus } from '../../utils/api';

interface ProgressTrackerProps {
  clientId: string;
  businessName?: string;
  showPreviewReady?: boolean;
  onComplete?: (previewUrl: string) => void;
  onError?: (error: string) => void;
}

// Internal component that uses the hook
function ProgressTrackerInternal({
  clientId,
  businessName,
  showPreviewReady = true,
  onComplete,
  onError
}: ProgressTrackerProps) {
  // Use our new HTTP + TanStack Query hook
  const { data: progressState, isLoading, error, isFetching } = useGenerationStatus(
    clientId,
    {
      onComplete: (data) => {
        onComplete?.(data.previewUrl || '');
      },
      onError: (err) => {
        onError?.(err.message);
      }
    }
  );

  // Default state when no data is available yet
  const defaultState: GenerationStatus = {
    clientId,
    status: 'starting',
    progress: 0,
    message: 'Initializing website generation...',
    currentStep: 'uploadLogo',
    steps: {
      uploadLogo: 'pending',
      analyzeLogo: 'pending',
      generateTheme: 'pending',
      createRepo: 'pending',
      deployPreview: 'pending'
    }
  };

  const currentState = progressState || defaultState;

  // Define the progress steps
  const steps: ProgressStep[] = [
    {
      id: 'uploadLogo',
      name: 'Uploading',
      description: 'Uploading and optimizing your logo...',
      icon: Upload,
      status: currentState.steps.uploadLogo
    },
    {
      id: 'analyzeLogo',
      name: 'Analyzing',
      description: 'AI analyzing your logo colors...',
      icon: Brain,
      status: currentState.steps.analyzeLogo
    },
    {
      id: 'generateTheme',
      name: 'Generating',
      description: 'Generating custom theme and content...',
      icon: Wand2,
      status: currentState.steps.generateTheme
    },
    {
      id: 'createRepo',
      name: 'Creating',
      description: 'Creating your website repository...',
      icon: FolderGit2,
      status: currentState.steps.createRepo
    },
    {
      id: 'deployPreview',
      name: 'Deploying',
      description: 'Deploying preview website...',
      icon: Rocket,
      status: currentState.steps.deployPreview
    }
  ];

  // Retry handler for HTTP approach
  const handleRetry = useCallback(() => {
    // In the HTTP approach, TanStack Query handles retries automatically
    // This could trigger a manual refetch if needed
    console.log('Retry triggered - TanStack Query will handle automatic retries');
  }, []);

  // Format time remaining
  const formatTimeRemaining = (seconds: number): string => {
    if (seconds < 60) {
      return `~${Math.ceil(seconds)} seconds`;
    }
    const minutes = Math.ceil(seconds / 60);
    return `~${minutes} minute${minutes > 1 ? 's' : ''}`;
  };

  // Get step icon with proper styling
  const getStepIcon = (step: ProgressStep) => {
    const IconComponent = step.icon;

    switch (step.status) {
      case 'completed':
        return <CheckCircle className="w-6 h-6 text-green-500" />;
      case 'failed':
        return <AlertCircle className="w-6 h-6 text-red-500" />;
      case 'in-progress':
        return <IconComponent className="w-6 h-6 text-blue-500 animate-pulse" />;
      default:
        return <IconComponent className="w-6 h-6 text-gray-400" />;
    }
  };

  // Get progress bar color
  const getProgressColor = () => {
    if (currentState.status === 'error') return 'bg-red-500';
    if (currentState.status === 'completed') return 'bg-green-500';
    return 'bg-blue-500';
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Generating Your Website
        </h2>

        {/* Connection Status */}
        <div className="flex items-center justify-center space-x-2 mb-4">
          {!error ? (
            <div className="flex items-center text-green-600 text-sm">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
              HTTP polling active
              {isFetching && <span className="ml-1">(updating...)</span>}
            </div>
          ) : (
            <div className="flex items-center text-orange-600 text-sm">
              <WifiOff className="w-4 h-4 mr-2" />
              Connection error
            </div>
          )}
        </div>
      </div>

      {/* Current Status Message */}
      <div className="text-center mb-6">
        <p className="text-lg font-medium text-gray-700 mb-2">
          {currentState.message}
        </p>
        {currentState.estimatedTimeRemaining && currentState.status === 'in-progress' && (
          <p className="text-sm text-gray-500">
            Estimated time remaining: {formatTimeRemaining(currentState.estimatedTimeRemaining)}
          </p>
        )}
      </div>

      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Progress</span>
          <span className="text-sm font-medium text-gray-700">
            {Math.round(currentState.progress)}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className={`h-3 rounded-full transition-all duration-500 ease-out ${getProgressColor()}`}
            style={{ width: `${currentState.progress}%` }}
          />
        </div>
      </div>

      {/* Steps */}
      <div className="space-y-4 mb-8">
        {steps.map((step, index) => (
          <div
            key={step.id}
            className={`flex items-center p-4 rounded-lg border transition-all duration-300 ${
              step.status === 'completed'
                ? 'bg-green-50 border-green-200'
                : step.status === 'in-progress'
                ? 'bg-blue-50 border-blue-200'
                : step.status === 'failed'
                ? 'bg-red-50 border-red-200'
                : 'bg-gray-50 border-gray-200'
            }`}
          >
            <div className="flex-shrink-0 mr-4">
              {getStepIcon(step)}
            </div>
            <div className="flex-grow">
              <h3 className="font-medium text-gray-900">{step.name}</h3>
              <p className="text-sm text-gray-600">{step.description}</p>
            </div>
            {step.status === 'in-progress' && (
              <div className="flex-shrink-0">
                <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Error State */}
      {(currentState.status === 'error' || error) && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-red-500 mr-3" />
            <div className="flex-grow">
              <h3 className="font-medium text-red-800">Generation Failed</h3>
              <p className="text-sm text-red-600 mt-1">
                {currentState.error || error?.message || 'An unexpected error occurred during website generation.'}
              </p>
            </div>
          </div>
          <div className="mt-4">
            <button
              onClick={handleRetry}
              className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Retry Generation
            </button>
          </div>
        </div>
      )}

      {/* Success State */}
      {currentState.status === 'completed' && currentState.previewUrl && (
        showPreviewReady ? (
          <PreviewReady
            clientId={clientId}
            previewUrl={currentState.previewUrl}
            businessName={businessName || 'Your Business'}
            generatedAt={new Date().toISOString()}
          />
        ) : (
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
            </div>
            <h3 className="text-xl font-bold text-green-800 mb-2">
              🎉 Your Website is Ready!
            </h3>
            <p className="text-green-700 mb-6">
              Your custom website has been generated and deployed successfully.
            </p>
            <a
              href={currentState.previewUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
            >
              <ExternalLink className="w-5 h-5 mr-2" />
              View Your Website
            </a>
          </div>
        )
      )}

      {/* Connection Issues */}
      {error && !isLoading && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <WifiOff className="w-5 h-5 text-orange-500 mr-3" />
              <div>
                <h3 className="font-medium text-orange-800">Connection Issue</h3>
                <p className="text-sm text-orange-600">
                  Unable to get status updates. TanStack Query will retry automatically.
                </p>
              </div>
            </div>
            <button
              onClick={handleRetry}
              className="px-3 py-1 text-sm bg-orange-600 text-white rounded hover:bg-orange-700 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Main component with QueryProvider wrapper
export default function ProgressTracker(props: ProgressTrackerProps) {
  return (
    <QueryProvider>
      <ProgressTrackerInternal {...props} />
    </QueryProvider>
  );
}