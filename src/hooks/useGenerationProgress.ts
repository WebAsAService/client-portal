/**
 * Generation Progress Hook
 *
 * A specialized React hook for tracking website generation progress using WebSocket.
 * Built on top of the base useWebSocket hook for consistent connection management.
 */

import { useEffect, useState, useCallback } from 'react';
import { useWebSocket } from './useWebSocket';
import {
  SOCKET_EVENTS,
  type GenerationStep,
  type StepStatus,
  type GenerationStatus,
  type GenerationUpdatePayload,
  type GenerationCompletePayload,
  type GenerationErrorPayload,
  type JoinGenerationPayload,
  createGenerationRoomId,
  isGenerationUpdate,
  isGenerationComplete,
  isGenerationError,
  calculateProgress,
  createLogger
} from '../utils/websocket';

// Generation progress state
export interface GenerationProgressState {
  clientId: string;
  status: GenerationStatus;
  progress: number;
  message: string;
  currentStep: GenerationStep;
  steps: Record<GenerationStep, StepStatus>;
  estimatedTimeRemaining?: number;
  error?: string;
  previewUrl?: string;
  generatedAt?: string;
}

// Hook options
export interface UseGenerationProgressOptions {
  clientId: string;
  businessName?: string;
  autoJoin?: boolean;
  debug?: boolean;
  onUpdate?: (data: GenerationUpdatePayload) => void;
  onComplete?: (data: GenerationCompletePayload) => void;
  onError?: (data: GenerationErrorPayload) => void;
}

// Hook return type
export interface UseGenerationProgressReturn {
  // Connection state
  isConnected: boolean;
  isConnecting: boolean;
  isReconnecting: boolean;
  connectionError: string | null;

  // Generation state
  progressState: GenerationProgressState;
  isGenerating: boolean;
  isCompleted: boolean;
  hasError: boolean;

  // Actions
  startGeneration: (metadata?: Record<string, any>) => void;
  requestStatus: () => void;
  retry: () => void;
  reset: () => void;
}

/**
 * Hook for managing generation progress with WebSocket
 */
export const useGenerationProgress = (options: UseGenerationProgressOptions): UseGenerationProgressReturn => {
  const {
    clientId,
    businessName,
    autoJoin = true,
    debug = false,
    onUpdate,
    onComplete,
    onError
  } = options;

  const logger = createLogger('useGenerationProgress', debug);

  // WebSocket connection
  const {
    isConnected,
    isConnecting,
    isReconnecting,
    error: connectionError,
    emit,
    on,
    off
  } = useWebSocket({
    debug,
    autoConnect: true,
    reconnection: true
  });

  // Initialize progress state
  const [progressState, setProgressState] = useState<GenerationProgressState>({
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

  // Update progress state helper
  const updateProgressState = useCallback((updates: Partial<GenerationProgressState>) => {
    setProgressState(prev => {
      const newState = { ...prev, ...updates };

      // Recalculate progress if steps were updated
      if (updates.steps) {
        newState.progress = calculateProgress(newState.steps);
      }

      logger.log('Progress state updated', { updates, newState });
      return newState;
    });
  }, [logger]);

  // Handle generation updates
  const handleGenerationUpdate = useCallback((data: any) => {
    if (!isGenerationUpdate(data) || data.clientId !== clientId) return;

    logger.log('Generation update received', { data });

    updateProgressState({
      status: data.status,
      progress: data.progress,
      message: data.message,
      currentStep: data.currentStep,
      steps: data.steps,
      estimatedTimeRemaining: data.estimatedTimeRemaining,
      error: data.error
    });

    // Call user callback
    onUpdate?.(data);
  }, [clientId, updateProgressState, onUpdate, logger]);

  // Handle generation completion
  const handleGenerationComplete = useCallback((data: any) => {
    if (!isGenerationComplete(data) || data.clientId !== clientId) return;

    logger.log('Generation completed', { data });

    updateProgressState({
      status: 'completed',
      progress: 100,
      message: '🎉 Your website is ready!',
      previewUrl: data.previewUrl,
      generatedAt: data.generatedAt
    });

    // Call user callback
    onComplete?.(data);
  }, [clientId, updateProgressState, onComplete, logger]);

  // Handle generation errors
  const handleGenerationError = useCallback((data: any) => {
    if (!isGenerationError(data) || data.clientId !== clientId) return;

    logger.error('Generation error received', { data });

    updateProgressState({
      status: 'error',
      message: data.message,
      error: data.error
    });

    // Call user callback
    onError?.(data);
  }, [clientId, updateProgressState, onError, logger]);

  // Start generation process
  const startGeneration = useCallback((metadata?: Record<string, any>) => {
    if (!isConnected) {
      logger.warn('Cannot start generation - not connected');
      return;
    }

    logger.log('Starting generation', { clientId, businessName, metadata });

    const payload: JoinGenerationPayload = {
      clientId,
      businessName,
      metadata
    };

    // Join generation room
    emit(SOCKET_EVENTS.JOIN_GENERATION, payload);

    // Reset state
    updateProgressState({
      status: 'starting',
      progress: 0,
      message: 'Starting website generation...',
      error: undefined,
      previewUrl: undefined,
      generatedAt: undefined
    });
  }, [isConnected, clientId, businessName, emit, updateProgressState, logger]);

  // Request current status
  const requestStatus = useCallback(() => {
    if (!isConnected) {
      logger.warn('Cannot request status - not connected');
      return;
    }

    logger.log('Requesting status', { clientId });
    emit(SOCKET_EVENTS.REQUEST_STATUS, { clientId });
  }, [isConnected, clientId, emit, logger]);

  // Retry generation
  const retry = useCallback(() => {
    logger.log('Retrying generation', { clientId });

    // Reset error state
    updateProgressState({
      status: 'starting',
      error: undefined,
      message: 'Retrying website generation...'
    });

    // Start generation again
    startGeneration();
  }, [clientId, updateProgressState, startGeneration, logger]);

  // Reset state
  const reset = useCallback(() => {
    logger.log('Resetting generation state', { clientId });

    setProgressState({
      clientId,
      status: 'starting',
      progress: 0,
      message: 'Ready to generate website...',
      currentStep: 'uploadLogo',
      steps: {
        uploadLogo: 'pending',
        analyzeLogo: 'pending',
        generateTheme: 'pending',
        createRepo: 'pending',
        deployPreview: 'pending'
      }
    });
  }, [clientId, logger]);

  // Set up event listeners
  useEffect(() => {
    logger.log('Setting up generation event listeners');

    // Add event listeners
    on(SOCKET_EVENTS.GENERATION_UPDATE, handleGenerationUpdate);
    on(SOCKET_EVENTS.GENERATION_COMPLETE, handleGenerationComplete);
    on(SOCKET_EVENTS.GENERATION_ERROR, handleGenerationError);

    return () => {
      logger.log('Cleaning up generation event listeners');

      // Remove event listeners
      off(SOCKET_EVENTS.GENERATION_UPDATE, handleGenerationUpdate);
      off(SOCKET_EVENTS.GENERATION_COMPLETE, handleGenerationComplete);
      off(SOCKET_EVENTS.GENERATION_ERROR, handleGenerationError);
    };
  }, [on, off, handleGenerationUpdate, handleGenerationComplete, handleGenerationError, logger]);

  // Auto-join generation room when connected
  useEffect(() => {
    if (isConnected && autoJoin && progressState.status === 'starting') {
      logger.log('Auto-joining generation room');
      startGeneration();
    }
  }, [isConnected, autoJoin, progressState.status, startGeneration, logger]);

  // Auto-request status when reconnected
  useEffect(() => {
    if (isConnected && !isConnecting && progressState.status === 'in-progress') {
      logger.log('Reconnected - requesting current status');
      requestStatus();
    }
  }, [isConnected, isConnecting, progressState.status, requestStatus, logger]);

  // Derived state
  const isGenerating = progressState.status === 'in-progress' || progressState.status === 'starting';
  const isCompleted = progressState.status === 'completed';
  const hasError = progressState.status === 'error';

  return {
    // Connection state
    isConnected,
    isConnecting,
    isReconnecting,
    connectionError,

    // Generation state
    progressState,
    isGenerating,
    isCompleted,
    hasError,

    // Actions
    startGeneration,
    requestStatus,
    retry,
    reset
  };
};