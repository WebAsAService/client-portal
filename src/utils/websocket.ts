/**
 * WebSocket Configuration and Utilities
 *
 * Centralized WebSocket configuration, event constants, and utility functions
 * for consistent WebSocket usage across the application.
 */

// WebSocket Server Configuration
export const SOCKET_CONFIG = {
  // Socket URL based on environment
  URL: import.meta.env.PUBLIC_API_URL ||
       (import.meta.env.MODE === 'development' ? 'http://localhost:3001' : 'wss://api.webler.io'),

  // Connection options
  OPTIONS: {
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    maxReconnectionAttempts: 5,
    timeout: 20000,
    forceNew: true
  }
} as const;

// WebSocket Event Constants
export const SOCKET_EVENTS = {
  // Connection Events
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  CONNECT_ERROR: 'connect_error',
  RECONNECT: 'reconnect',
  RECONNECT_ERROR: 'reconnect_error',
  RECONNECTING: 'reconnecting',
  RECONNECT_FAILED: 'reconnect_failed',

  // Client → Server Events
  JOIN_GENERATION: 'join-generation',
  LEAVE_GENERATION: 'leave-generation',
  REQUEST_STATUS: 'request-status',
  START_GENERATION: 'start-generation',

  // Server → Client Events
  GENERATION_UPDATE: 'generation-update',
  GENERATION_COMPLETE: 'generation-complete',
  GENERATION_ERROR: 'generation-error',
  STATUS_UPDATE: 'status-update',

  // Room Management
  JOIN_ROOM: 'join-room',
  LEAVE_ROOM: 'leave-room',
  ROOM_JOINED: 'room-joined',
  ROOM_LEFT: 'room-left',
} as const;

// Generation Step Types
export type GenerationStep = 'uploadLogo' | 'analyzeLogo' | 'generateTheme' | 'createRepo' | 'deployPreview';
export type StepStatus = 'pending' | 'in-progress' | 'completed' | 'failed';
export type GenerationStatus = 'starting' | 'in-progress' | 'completed' | 'error';

// WebSocket Event Payload Types
export interface GenerationUpdatePayload {
  clientId: string;
  status: GenerationStatus;
  progress: number;
  message: string;
  currentStep: GenerationStep;
  steps: Record<GenerationStep, StepStatus>;
  estimatedTimeRemaining?: number;
  error?: string;
}

export interface GenerationCompletePayload {
  clientId: string;
  previewUrl: string;
  generatedAt: string;
  message: string;
}

export interface GenerationErrorPayload {
  clientId: string;
  error: string;
  message: string;
  retryable: boolean;
  errorCode?: string;
}

export interface JoinGenerationPayload {
  clientId: string;
  businessName?: string;
  metadata?: Record<string, any>;
}

export interface StatusRequestPayload {
  clientId: string;
}

// Connection State Interface
export interface ConnectionState {
  isConnected: boolean;
  isConnecting: boolean;
  isReconnecting: boolean;
  error: string | null;
  retryCount: number;
  lastConnected: Date | null;
  lastError: Date | null;
}

// WebSocket Hook Options
export interface WebSocketOptions {
  url?: string;
  autoConnect?: boolean;
  reconnection?: boolean;
  reconnectionAttempts?: number;
  reconnectionDelay?: number;
  timeout?: number;
  debug?: boolean;
}

// Room Management
export interface Room {
  id: string;
  type: 'generation' | 'status' | 'admin';
  metadata?: Record<string, any>;
}

/**
 * Utility Functions
 */

/**
 * Creates a room ID for generation tracking
 */
export const createGenerationRoomId = (clientId: string): string => {
  return `generation:${clientId}`;
};

/**
 * Creates a unique client ID for new sessions
 */
export const createClientId = (): string => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 9);
  return `client-${timestamp}-${random}`;
};

/**
 * Validates client ID format
 */
export const isValidClientId = (clientId: string): boolean => {
  const clientIdRegex = /^client-\d+-[a-z0-9]{7}$/;
  return clientIdRegex.test(clientId);
};

/**
 * Calculates reconnection delay with exponential backoff
 */
export const calculateReconnectionDelay = (attempt: number, baseDelay: number = 1000): number => {
  const maxDelay = 30000; // 30 seconds max
  const delay = Math.min(baseDelay * Math.pow(2, attempt), maxDelay);
  // Add jitter to prevent thundering herd
  return delay + Math.random() * 1000;
};

/**
 * Formats error messages for user display
 */
export const formatSocketError = (error: any): string => {
  if (typeof error === 'string') return error;
  if (error?.message) return error.message;
  if (error?.description) return error.description;
  if (error?.type === 'TransportError') return 'Connection failed - please check your internet connection';
  if (error?.type === 'TimeoutError') return 'Connection timed out - please try again';
  return 'An unexpected connection error occurred';
};

/**
 * Checks if the error is recoverable
 */
export const isRecoverableError = (error: any): boolean => {
  if (!error) return false;
  const unrecoverableTypes = ['ParseError', 'UnauthorizedError', 'ForbiddenError'];
  return !unrecoverableTypes.includes(error.type);
};

/**
 * Progress calculation utilities
 */
export const STEP_WEIGHTS: Record<GenerationStep, number> = {
  uploadLogo: 20,
  analyzeLogo: 20,
  generateTheme: 30,
  createRepo: 15,
  deployPreview: 15
};

/**
 * Calculates overall progress based on step completion
 */
export const calculateProgress = (steps: Record<GenerationStep, StepStatus>): number => {
  let totalProgress = 0;

  Object.entries(steps).forEach(([step, status]) => {
    const weight = STEP_WEIGHTS[step as GenerationStep];
    if (status === 'completed') {
      totalProgress += weight;
    } else if (status === 'in-progress') {
      totalProgress += weight * 0.5; // Half credit for in-progress
    }
  });

  return Math.min(totalProgress, 100);
};

/**
 * Gets the next step in the generation process
 */
export const getNextStep = (currentStep: GenerationStep): GenerationStep | null => {
  const stepOrder: GenerationStep[] = ['uploadLogo', 'analyzeLogo', 'generateTheme', 'createRepo', 'deployPreview'];
  const currentIndex = stepOrder.indexOf(currentStep);
  return currentIndex < stepOrder.length - 1 ? stepOrder[currentIndex + 1] : null;
};

/**
 * Estimates remaining time based on current progress
 */
export const estimateRemainingTime = (progress: number, startTime: Date): number => {
  if (progress <= 0) return 300; // Default 5 minutes

  const elapsed = Date.now() - startTime.getTime();
  const totalEstimated = (elapsed / progress) * 100;
  const remaining = Math.max(0, totalEstimated - elapsed);

  return Math.round(remaining / 1000); // Return in seconds
};

/**
 * Event type guards for type safety
 */
export const isGenerationUpdate = (data: any): data is GenerationUpdatePayload => {
  return data && typeof data.clientId === 'string' && typeof data.progress === 'number';
};

export const isGenerationComplete = (data: any): data is GenerationCompletePayload => {
  return data && typeof data.clientId === 'string' && typeof data.previewUrl === 'string';
};

export const isGenerationError = (data: any): data is GenerationErrorPayload => {
  return data && typeof data.clientId === 'string' && typeof data.error === 'string';
};

/**
 * Debug logging utilities
 */
export const createLogger = (prefix: string, debug: boolean = false) => {
  return {
    log: (message: string, ...args: any[]) => {
      if (debug) console.log(`[${prefix}] ${message}`, ...args);
    },
    warn: (message: string, ...args: any[]) => {
      if (debug) console.warn(`[${prefix}] ${message}`, ...args);
    },
    error: (message: string, ...args: any[]) => {
      if (debug) console.error(`[${prefix}] ${message}`, ...args);
    }
  };
};