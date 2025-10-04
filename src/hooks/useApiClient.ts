/**
 * API Client Hooks
 *
 * TanStack Query hooks for HTTP API interactions.
 * Replaces WebSocket-based real-time communication with polling-based updates.
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  api,
  type GenerateWebsiteRequest,
  type GenerateWebsiteResponse,
  type GenerationStatus,
  ApiClientError
} from '../utils/api';

// Query Keys
export const queryKeys = {
  health: ['api', 'health'] as const,
  status: (clientId: string) => ['generation', 'status', clientId] as const,
  history: (email: string) => ['generation', 'history', email] as const,
} as const;

/**
 * Hook for API health check
 */
export const useApiHealth = () => {
  return useQuery({
    queryKey: queryKeys.health,
    queryFn: api.healthCheck,
    // Check health every 30 seconds
    refetchInterval: 30000,
    // Don't fail the entire app if health check fails
    retry: false,
    // Keep previous data while refetching
    placeholderData: false,
  });
};

/**
 * Hook for generating website
 */
export const useGenerateWebsite = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: GenerateWebsiteRequest) => api.generateWebsite(data),
    onSuccess: (response: GenerateWebsiteResponse) => {
      // Invalidate health check to ensure API is responsive
      queryClient.invalidateQueries({ queryKey: queryKeys.health });

      // Start polling for status immediately
      if (response.clientId) {
        queryClient.setQueryData(queryKeys.status(response.clientId), {
          clientId: response.clientId,
          status: 'starting',
          progress: 0,
          message: 'Website generation started...',
          currentStep: 'initializing',
          steps: {
            uploadLogo: 'pending',
            analyzeLogo: 'pending',
            generateTheme: 'pending',
            createRepo: 'pending',
            deployPreview: 'pending',
          },
        } as GenerationStatus);
      }
    },
    onError: (error: ApiClientError) => {
      console.error('Website generation failed:', error);
    },
  });
};

/**
 * Hook for polling generation status
 */
export const useGenerationStatus = (
  clientId: string | null,
  options?: {
    enabled?: boolean;
    pollInterval?: number;
    onComplete?: (data: GenerationStatus) => void;
    onError?: (error: ApiClientError) => void;
  }
) => {
  const pollInterval = options?.pollInterval ||
    parseInt(import.meta.env.PUBLIC_STATUS_POLL_INTERVAL || '5000');

  return useQuery({
    queryKey: queryKeys.status(clientId || ''),
    queryFn: () => {
      if (!clientId) throw new Error('Client ID is required');
      return api.getStatus(clientId);
    },
    enabled: Boolean(clientId && options?.enabled !== false),
    refetchInterval: (data) => {
      // Stop polling if generation is complete or failed
      if (data?.status === 'completed' || data?.status === 'error') {
        return false;
      }
      return pollInterval;
    },
    // Keep polling in background
    refetchIntervalInBackground: true,
    // Retry on network errors but not on API errors
    retry: (failureCount, error) => {
      if (error instanceof ApiClientError && error.status && error.status >= 400 && error.status < 500) {
        return false; // Don't retry on client errors
      }
      return failureCount < 3;
    },
    // Update callbacks
    onSuccess: (data) => {
      if (data.status === 'completed' && options?.onComplete) {
        options.onComplete(data);
      }
    },
    onError: (error) => {
      if (options?.onError && error instanceof ApiClientError) {
        options.onError(error);
      }
    },
  });
};

/**
 * Hook for canceling generation
 */
export const useCancelGeneration = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (clientId: string) => api.cancelGeneration(clientId),
    onSuccess: (_, clientId) => {
      // Update the status to show cancellation
      queryClient.setQueryData(queryKeys.status(clientId), (old: GenerationStatus | undefined) => {
        if (!old) return old;
        return {
          ...old,
          status: 'error' as const,
          message: 'Generation cancelled by user',
          error: 'CANCELLED_BY_USER',
        };
      });

      // Stop polling for this client
      queryClient.invalidateQueries({ queryKey: queryKeys.status(clientId) });
    },
  });
};

/**
 * Hook for getting client history
 */
export const useClientHistory = (email: string | null, enabled = true) => {
  return useQuery({
    queryKey: queryKeys.history(email || ''),
    queryFn: () => {
      if (!email) throw new Error('Email is required');
      return api.getClientHistory(email);
    },
    enabled: Boolean(email && enabled),
    // Cache history for longer since it doesn't change often
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

/**
 * Hook for combined generation workflow
 * Handles the entire flow: generate → poll status → handle completion
 */
export const useGenerationWorkflow = (options?: {
  onComplete?: (data: GenerationStatus) => void;
  onError?: (error: ApiClientError) => void;
}) => {
  const generateMutation = useGenerateWebsite();
  const cancelMutation = useCancelGeneration();

  const statusQuery = useGenerationStatus(
    generateMutation.data?.clientId || null,
    {
      enabled: generateMutation.isSuccess,
      onComplete: options?.onComplete,
      onError: options?.onError,
    }
  );

  const startGeneration = (data: GenerateWebsiteRequest) => {
    return generateMutation.mutate(data);
  };

  const cancelGeneration = () => {
    if (generateMutation.data?.clientId) {
      return cancelMutation.mutate(generateMutation.data.clientId);
    }
  };

  const reset = () => {
    generateMutation.reset();
  };

  return {
    // Generation state
    isGenerating: generateMutation.isPending,
    generationData: generateMutation.data,
    generationError: generateMutation.error,

    // Status state
    statusData: statusQuery.data,
    statusError: statusQuery.error,
    isPolling: statusQuery.isFetching,

    // Actions
    startGeneration,
    cancelGeneration,
    reset,

    // Combined state
    isCompleted: statusQuery.data?.status === 'completed',
    hasError: generateMutation.isError || statusQuery.data?.status === 'error',
    progress: statusQuery.data?.progress || 0,

    // Cancellation state
    isCancelling: cancelMutation.isPending,
  };
};