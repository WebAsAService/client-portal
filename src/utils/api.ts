const API_BASE_URL = import.meta.env.PUBLIC_API_URL || 'http://localhost:3000';

interface GenerateWebsiteRequest {
  businessName: string;
  service: string;
  targetAudience: string;
  industry: string;
  coreServices: string;
  email: string;
  phone?: string;
  domain?: string;
  logo: File;
  socketId: string;
}

interface GenerateWebsiteResponse {
  success: boolean;
  clientId: string;
  message: string;
}

interface GenerationStatus {
  clientId: string;
  status: string;
  progress: number;
  message: string;
  steps: Record<string, string>;
  previewUrl?: string;
  error?: string;
}

export const api = {
  generateWebsite: async (data: GenerateWebsiteRequest): Promise<GenerateWebsiteResponse> => {
    const formData = new FormData();
    formData.append('businessName', data.businessName);
    formData.append('service', data.service);
    formData.append('targetAudience', data.targetAudience);
    formData.append('industry', data.industry);
    formData.append('coreServices', data.coreServices);
    formData.append('email', data.email);
    formData.append('socketId', data.socketId);

    if (data.phone) formData.append('phone', data.phone);
    if (data.domain) formData.append('domain', data.domain);
    if (data.logo) formData.append('logo', data.logo);

    const response = await fetch(`${API_BASE_URL}/api/generate`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  },

  getStatus: async (clientId: string): Promise<GenerationStatus> => {
    const response = await fetch(`${API_BASE_URL}/api/status/${clientId}`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  },

  healthCheck: async (): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE_URL}/health`);
      return response.ok;
    } catch {
      return false;
    }
  },
};