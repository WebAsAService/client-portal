/**
 * TanStack Query Provider
 *
 * Configures and provides TanStack Query for the entire application.
 * Replaces WebSocket-based real-time updates with HTTP polling.
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import type { ReactNode } from 'react';

interface QueryProviderProps {
  children: ReactNode;
}

// Create query client configuration
const createQueryClient = () => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Cache data for 5 minutes by default
        staleTime: parseInt(import.meta.env.PUBLIC_QUERY_STALE_TIME || '300000'),
        // Keep cache for 10 minutes
        gcTime: parseInt(import.meta.env.PUBLIC_QUERY_CACHE_TIME || '600000'),
        // Retry failed requests 3 times
        retry: parseInt(import.meta.env.PUBLIC_MAX_RETRY_ATTEMPTS || '3'),
        // Exponential backoff for retries
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
        // Don't refetch on window focus in development
        refetchOnWindowFocus: import.meta.env.MODE === 'production',
        // Don't refetch on reconnect in development
        refetchOnReconnect: import.meta.env.MODE === 'production',
      },
      mutations: {
        // Retry mutations once
        retry: 1,
        // Use same retry delay as queries
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      },
    },
  });
};

export const QueryProvider = ({ children }: QueryProviderProps) => {
  // Create query client instance (stable across re-renders)
  const [queryClient] = useState(() => createQueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* Dev tools can be added back later if needed */}
    </QueryClientProvider>
  );
};

// Export query client instance for imperative use
export { createQueryClient };