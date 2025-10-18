/**
 * Astro API Route: GitHub Workflow Trigger
 *
 * Receives form data from the frontend and triggers the GitHub Actions workflow
 * for website generation in the base-template repository.
 */

import type { APIRoute } from 'astro';
import { config } from 'dotenv';

// Load environment variables
config();

export const prerender = false;

// Types for form data
interface GenerateWebsiteRequest {
  businessName: string;
  description: string;
  industry: string;
  targetAudience: string;
  services: string[];
  email: string;
  phone?: string;
  domain?: string;
  logoUrl?: string;
}

// Generate unique client ID
const generateClientId = (businessName: string): string => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substr(2, 6);
  const cleanName = businessName
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .substr(0, 10);

  return `${cleanName}-${timestamp}-${random}`;
};

// Validate form data
const validateFormData = (data: any): string[] => {
  const errors: string[] = [];

  if (!data.businessName || data.businessName.trim().length < 2) {
    errors.push('Business name is required and must be at least 2 characters');
  }

  if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.push('Valid email address is required');
  }

  if (!data.industry || data.industry.trim().length < 2) {
    errors.push('Industry is required');
  }

  if (!data.services || !Array.isArray(data.services) || data.services.length === 0) {
    errors.push('At least one service must be specified');
  }

  return errors;
};

// CORS headers for all responses
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json'
};

// Transform form data for GitHub workflow (max 10 properties for GitHub API)
const transformForGitHub = (data: GenerateWebsiteRequest, clientId: string) => {
  return {
    business_name: data.businessName,
    business_description: data.description || '',
    industry: data.industry,
    target_audience: data.targetAudience || '',
    services: data.services.join(','),
    contact_info: `email=${data.email}${data.phone ? `,phone=${data.phone}` : ''}`,
    client_name: clientId,
    metadata: JSON.stringify({
      website_domain: data.domain || '',
      logo_url: data.logoUrl || '',
      custom_colors: ''
    }),
    webhook_url: `${import.meta.env.SITE}/api/webhooks/github-status`
  };
};

export const POST: APIRoute = async ({ request }) => {
  try {
    console.log('=== API Generate - Starting ===');

    // Get GitHub token from environment variables
    const githubToken = process.env.GITHUB_TOKEN || import.meta.env.GITHUB_TOKEN;
    console.log('GitHub Token available:', !!githubToken);
    console.log('GitHub Token length:', githubToken?.length || 0);

    if (!githubToken) {
      console.error('GitHub token not found in environment variables');
      return new Response(JSON.stringify({
        success: false,
        error: 'GitHub token configuration missing',
        details: 'Server configuration error - GitHub token not available'
      }), {
        status: 500,
        headers: corsHeaders
      });
    }

    // Parse request body
    const formData: GenerateWebsiteRequest = await request.json();
    console.log('Form data received:', {
      businessName: formData.businessName,
      email: formData.email,
      servicesCount: formData.services?.length
    });

    // Validate form data
    const validationErrors = validateFormData(formData);
    if (validationErrors.length > 0) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Validation failed',
        details: validationErrors
      }), {
        status: 400,
        headers: corsHeaders
      });
    }

    // Generate unique client ID
    const clientId = generateClientId(formData.businessName);

    // Transform data for GitHub workflow
    const workflowPayload = transformForGitHub(formData, clientId);
    console.log('Workflow payload prepared:', {
      client_name: workflowPayload.client_name,
      business_name: workflowPayload.business_name
    });

    // Trigger GitHub workflow via repository dispatch
    console.log('About to make GitHub API call...');
    console.log('Using token:', githubToken.substring(0, 10) + '...');

    const githubResponse = await fetch(
      'https://api.github.com/repos/WebAsAService/base-template/dispatches',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${githubToken}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
          'User-Agent': 'Webler-Client-Portal/1.0'
        },
        body: JSON.stringify({
          event_type: 'generate-client-site',
          client_payload: workflowPayload
        })
      }
    );

    console.log('GitHub API response received:', {
      status: githubResponse.status,
      statusText: githubResponse.statusText,
      ok: githubResponse.ok
    });

    if (!githubResponse.ok) {
      const errorText = await githubResponse.text();
      console.error('GitHub API Error:', {
        status: githubResponse.status,
        statusText: githubResponse.statusText,
        body: errorText
      });

      return new Response(JSON.stringify({
        success: false,
        error: 'Failed to trigger website generation',
        details: `GitHub API returned ${githubResponse.status}: ${githubResponse.statusText}`
      }), {
        status: 500,
        headers: corsHeaders
      });
    }

    // Success response
    return new Response(JSON.stringify({
      success: true,
      clientId,
      message: 'Website generation started successfully',
      estimatedTime: 300, // 5 minutes estimated
      statusUrl: `/api/status/${clientId}`
    }), {
      status: 200,
      headers: corsHeaders
    });

  } catch (error) {
    console.error('API Error:', error);

    return new Response(JSON.stringify({
      success: false,
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error occurred'
    }), {
      status: 500,
      headers: corsHeaders
    });
  }
};

// Handle preflight requests for CORS
export const OPTIONS: APIRoute = async () => {
  return new Response(null, {
    status: 200,
    headers: corsHeaders
  });
};