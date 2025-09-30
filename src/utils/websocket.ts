export const SOCKET_URL = import.meta.env.PUBLIC_API_URL || 'http://localhost:3000';

export const SOCKET_EVENTS = {
  // Client → Server
  JOIN_GENERATION: 'join-generation',
  REQUEST_STATUS: 'request-status',

  // Server → Client
  GENERATION_UPDATE: 'generation-update',
  GENERATION_COMPLETE: 'generation-complete',
  GENERATION_ERROR: 'generation-error',
  CONNECTION_ERROR: 'connect_error',
  DISCONNECT: 'disconnect',
} as const;

export interface GenerationUpdate {
  clientId: string;
  status: string;
  progress: number;
  message: string;
  steps: Record<string, string>;
}