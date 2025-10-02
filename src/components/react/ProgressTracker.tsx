import React, { useState, useEffect, useCallback } from 'react';
import { io, type Socket } from 'socket.io-client';
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

interface ProgressState {
  clientId: string;
  status: 'starting' | 'in-progress' | 'completed' | 'error';
  progress: number;
  message: string;
  currentStep: string;
  steps: {
    uploadLogo: 'pending' | 'in-progress' | 'completed' | 'failed';
    analyzeLogo: 'pending' | 'in-progress' | 'completed' | 'failed';
    generateTheme: 'pending' | 'in-progress' | 'completed' | 'failed';
    createRepo: 'pending' | 'in-progress' | 'completed' | 'failed';
    deployPreview: 'pending' | 'in-progress' | 'completed' | 'failed';
  };
  previewUrl?: string;
  error?: string;
  estimatedTimeRemaining?: number;
}

interface ProgressTrackerProps {
  clientId: string;
  onComplete?: (previewUrl: string) => void;
  onError?: (error: string) => void;
}

export default function ProgressTracker({
  clientId,
  onComplete,
  onError
}: ProgressTrackerProps) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [progressState, setProgressState] = useState<ProgressState>({
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
  });
  const [isReconnecting, setIsReconnecting] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  // Define the progress steps
  const steps: ProgressStep[] = [
    {
      id: 'uploadLogo',
      name: 'Uploading',
      description: 'Uploading and optimizing your logo...',
      icon: Upload,
      status: progressState.steps.uploadLogo
    },
    {
      id: 'analyzeLogo',
      name: 'Analyzing',
      description: 'AI analyzing your logo colors...',
      icon: Brain,
      status: progressState.steps.analyzeLogo
    },
    {
      id: 'generateTheme',
      name: 'Generating',
      description: 'Generating custom theme and content...',
      icon: Wand2,
      status: progressState.steps.generateTheme
    },
    {
      id: 'createRepo',
      name: 'Creating',
      description: 'Creating your website repository...',
      icon: FolderGit2,
      status: progressState.steps.createRepo
    },
    {
      id: 'deployPreview',
      name: 'Deploying',
      description: 'Deploying preview website...',
      icon: Rocket,
      status: progressState.steps.deployPreview
    }
  ];

  // Initialize WebSocket connection
  const initializeSocket = useCallback(() => {
    try {
      setConnectionError(null);
      setIsReconnecting(true);

      // For development, use localhost. In production, use the actual server URL
      const socketUrl = process.env.NODE_ENV === 'development'
        ? 'http://localhost:3001'
        : 'wss://api.webler.io';

      const newSocket = io(socketUrl, {
        autoConnect: true,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        timeout: 20000
      });

      // Connection event handlers
      newSocket.on('connect', () => {
        console.log('✅ WebSocket connected');
        setIsConnected(true);
        setIsReconnecting(false);
        setConnectionError(null);

        // Join the generation room for this client
        newSocket.emit('join-generation', { clientId });
      });

      newSocket.on('disconnect', () => {
        console.log('❌ WebSocket disconnected');
        setIsConnected(false);
      });

      newSocket.on('connect_error', (error) => {
        console.error('WebSocket connection error:', error);
        setConnectionError('Unable to connect to progress server');
        setIsReconnecting(false);
      });

      // Progress update handlers
      newSocket.on('generation-update', (data: Partial<ProgressState>) => {
        console.log('📊 Progress update:', data);
        setProgressState(prev => ({ ...prev, ...data }));
      });

      newSocket.on('generation-complete', (data: { previewUrl: string }) => {
        console.log('🎉 Generation complete:', data);
        setProgressState(prev => ({
          ...prev,
          status: 'completed',
          progress: 100,
          message: '🎉 Your website is ready!',
          previewUrl: data.previewUrl
        }));
        onComplete?.(data.previewUrl);
      });

      newSocket.on('generation-error', (data: { error: string }) => {
        console.error('❌ Generation error:', data);
        setProgressState(prev => ({
          ...prev,
          status: 'error',
          error: data.error,
          message: 'An error occurred during generation'
        }));
        onError?.(data.error);
      });

      setSocket(newSocket);

    } catch (error) {
      console.error('Failed to initialize socket:', error);
      setConnectionError('Failed to initialize connection');
      setIsReconnecting(false);
    }
  }, [clientId, onComplete, onError]);

  // Initialize socket on mount
  useEffect(() => {
    initializeSocket();

    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [initializeSocket]);

  // Fallback polling when WebSocket is not available
  useEffect(() => {
    if (!isConnected && !isReconnecting && connectionError) {
      console.log('🔄 Falling back to polling...');

      const pollInterval = setInterval(async () => {
        try {
          // Simulate polling - in real implementation, this would be an HTTP endpoint
          const response = await fetch(`/api/generation-status/${clientId}`);
          if (response.ok) {
            const data = await response.json();
            setProgressState(prev => ({ ...prev, ...data }));
          }
        } catch (error) {
          console.error('Polling error:', error);
        }
      }, 2000);

      return () => clearInterval(pollInterval);
    }
  }, [isConnected, isReconnecting, connectionError, clientId]);

  // Retry connection
  const handleRetry = useCallback(() => {
    if (socket) {
      socket.disconnect();
    }
    initializeSocket();
  }, [socket, initializeSocket]);

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
    if (progressState.status === 'error') return 'bg-red-500';
    if (progressState.status === 'completed') return 'bg-green-500';
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
          {isConnected ? (
            <div className="flex items-center text-green-600 text-sm">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
              Live updates active
            </div>
          ) : connectionError ? (
            <div className="flex items-center text-orange-600 text-sm">
              <WifiOff className="w-4 h-4 mr-2" />
              Using fallback mode
            </div>
          ) : (
            <div className="flex items-center text-blue-600 text-sm">
              <div className="w-2 h-2 bg-blue-500 rounded-full mr-2 animate-pulse"></div>
              Connecting...
            </div>
          )}
        </div>
      </div>

      {/* Current Status Message */}
      <div className="text-center mb-6">
        <p className="text-lg font-medium text-gray-700 mb-2">
          {progressState.message}
        </p>
        {progressState.estimatedTimeRemaining && progressState.status === 'in-progress' && (
          <p className="text-sm text-gray-500">
            Estimated time remaining: {formatTimeRemaining(progressState.estimatedTimeRemaining)}
          </p>
        )}
      </div>

      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Progress</span>
          <span className="text-sm font-medium text-gray-700">
            {Math.round(progressState.progress)}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className={`h-3 rounded-full transition-all duration-500 ease-out ${getProgressColor()}`}
            style={{ width: `${progressState.progress}%` }}
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
      {progressState.status === 'error' && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-red-500 mr-3" />
            <div className="flex-grow">
              <h3 className="font-medium text-red-800">Generation Failed</h3>
              <p className="text-sm text-red-600 mt-1">
                {progressState.error || 'An unexpected error occurred during website generation.'}
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
      {progressState.status === 'completed' && progressState.previewUrl && (
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
            href={progressState.previewUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
          >
            <ExternalLink className="w-5 h-5 mr-2" />
            View Your Website
          </a>
        </div>
      )}

      {/* Connection Issues */}
      {connectionError && !isReconnecting && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <WifiOff className="w-5 h-5 text-orange-500 mr-3" />
              <div>
                <h3 className="font-medium text-orange-800">Connection Issue</h3>
                <p className="text-sm text-orange-600">
                  {connectionError}. Updates may be delayed.
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