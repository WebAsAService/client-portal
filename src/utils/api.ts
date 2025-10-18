/**
 * HTTP API Client Utility
 *
 * Centralized API client for all HTTP requests to the backend API.
 * Integrates with GitHub Actions workflow for website generation.
 */

// API Configuration - Use PUBLIC_API_URL for consistent API endpoint
const API_BASE_URL = import.meta.env.PUBLIC_API_URL || import.meta.env.SITE || window?.location?.origin || 'http://localhost:4321';

// Request Types
export interface GenerateWebsiteRequest {
  businessName: string;
  description: string;
  industry: string;
  services: string[];
  targetAudience: string;
  email: string;
  phone?: string;
  website?: string;
  logoUrl?: string;
  logoFile?: File;
  metadata?: Record<string, any>;
}

export interface GenerateWebsiteResponse {
  success: boolean;
  clientId: string;
  message: string;
  workflowId?: string;
  estimatedTime?: number;
}

export interface GenerationStatus {
  clientId: string;
  status: 'starting' | 'in-progress' | 'completed' | 'error';
  progress: number;
  message: string;
  currentStep: string;
  steps: Record<string, 'pending' | 'in-progress' | 'completed' | 'failed'>;
  previewUrl?: string;
  repositoryUrl?: string;
  workflowRunId?: string;
  estimatedTimeRemaining?: number;
  error?: string;
  generatedAt?: string;
}

export interface ApiError {
  message: string;
  code?: string;
  status?: number;
  details?: Record<string, any>;
}

// Custom Error Class
export class ApiClientError extends Error {
  public status?: number;
  public code?: string;
  public details?: Record<string, any>;

  constructor(message: string, status?: number, code?: string, details?: Record<string, any>) {
    super(message);
    this.name = 'ApiClientError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

// Utility Functions
const handleResponse = async <T>(response: Response): Promise<T> => {
  if (!response.ok) {
    let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
    let errorDetails;

    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorMessage;
      errorDetails = errorData.details;
    } catch {
      // If response is not JSON, use status text
    }

    throw new ApiClientError(
      errorMessage,
      response.status,
      response.status.toString(),
      errorDetails
    );
  }

  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return response.json();
  }

  // Return empty object for non-JSON responses
  return {} as T;
};

const createFormData = (data: GenerateWebsiteRequest): FormData => {
  const formData = new FormData();

  // Add all fields to form data
  formData.append('businessName', data.businessName);
  formData.append('description', data.description);
  formData.append('industry', data.industry);
  formData.append('services', JSON.stringify(data.services));
  formData.append('targetAudience', data.targetAudience);
  formData.append('email', data.email);

  if (data.phone) formData.append('phone', data.phone);
  if (data.website) formData.append('website', data.website);
  if (data.logoUrl) formData.append('logoUrl', data.logoUrl);
  if (data.logoFile) formData.append('logo', data.logoFile);
  if (data.metadata) formData.append('metadata', JSON.stringify(data.metadata));

  return formData;
};

// Convert file to base64 (alternative to FormData)
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        // Remove data:image/type;base64, prefix
        const base64 = reader.result.split(',')[1];
        resolve(base64);
      } else {
        reject(new Error('Failed to convert file to base64'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
  });
};

// API Client
export const api = {
  /**
   * Generate website by triggering GitHub Actions workflow
   */
  generateWebsite: async (data: GenerateWebsiteRequest): Promise<GenerateWebsiteResponse> => {
    try {
      // Send JSON instead of FormData for Astro API route
      const response = await fetch(`${API_BASE_URL}/api/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          businessName: data.businessName,
          description: data.description,
          industry: data.industry,
          services: data.services,
          targetAudience: data.targetAudience,
          email: data.email,
          phone: data.phone,
          domain: data.website,
          logoUrl: data.logoUrl,
        }),
      });

      return handleResponse<GenerateWebsiteResponse>(response);
    } catch (error) {
      if (error instanceof ApiClientError) {
        throw error;
      }
      throw new ApiClientError(
        error instanceof Error ? error.message : 'Unknown error occurred',
        undefined,
        'NETWORK_ERROR'
      );
    }
  },

  /**
   * Get generation status by client ID
   */
  getStatus: async (clientId: string): Promise<GenerationStatus> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/status/${clientId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      return handleResponse<GenerationStatus>(response);
    } catch (error) {
      if (error instanceof ApiClientError) {
        throw error;
      }
      throw new ApiClientError(
        error instanceof Error ? error.message : 'Failed to get status',
        undefined,
        'NETWORK_ERROR'
      );
    }
  },

  /**
   * Health check to verify API connectivity (simplified for Astro)
   */
  healthCheck: async (): Promise<boolean> => {
    try {
      // Simple check - try to fetch the status endpoint without params
      const response = await fetch(`${API_BASE_URL}/api/webhooks/github-status`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        // Short timeout for health checks
        signal: AbortSignal.timeout(5000),
      });

      // Any response (even 400) means the API is up
      return response.status < 500;
    } catch (error) {
      console.warn('API health check failed:', error);
      return false;
    }
  },

  /**
   * Cancel generation (if supported by backend)
   */
  cancelGeneration: async (clientId: string): Promise<void> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/generate/${clientId}/cancel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      await handleResponse<void>(response);
    } catch (error) {
      if (error instanceof ApiClientError) {
        throw error;
      }
      throw new ApiClientError(
        error instanceof Error ? error.message : 'Failed to cancel generation',
        undefined,
        'NETWORK_ERROR'
      );
    }
  },

  /**
   * Get client history (if supported by backend)
   */
  getClientHistory: async (email: string): Promise<GenerationStatus[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/history?email=${encodeURIComponent(email)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      return handleResponse<GenerationStatus[]>(response);
    } catch (error) {
      if (error instanceof ApiClientError) {
        throw error;
      }
      throw new ApiClientError(
        error instanceof Error ? error.message : 'Failed to get client history',
        undefined,
        'NETWORK_ERROR'
      );
    }
  },
};

// Export types and utilities
export type { GenerateWebsiteRequest, GenerateWebsiteResponse, GenerationStatus, ApiError };