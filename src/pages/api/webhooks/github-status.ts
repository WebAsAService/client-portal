/**
 * Astro API Route: GitHub Webhook Handler
 *
 * Receives status updates from GitHub Actions workflow and stores them
 * for the ProgressTracker component to poll.
 */

import type { APIRoute } from 'astro';
import crypto from 'crypto';

// Types for status updates
interface GitHubStatusUpdate {
  status: 'started' | 'logo_processed' | 'logo_skipped' | 'content_generated' | 'completed' | 'failed';
  client_name: string;
  message: string;
  timestamp: string;
  pr_url?: string;
  preview_url?: string;
  error?: string;
}

interface GenerationStatus {
  clientId: string;
  status: 'starting' | 'in-progress' | 'completed' | 'error';
  progress: number;
  currentStep: string;
  message: string;
  previewUrl?: string;
  repositoryUrl?: string;
  error?: string;
  steps: {
    uploadLogo: 'pending' | 'in-progress' | 'completed' | 'failed';
    analyzeLogo: 'pending' | 'in-progress' | 'completed' | 'failed';
    generateTheme: 'pending' | 'in-progress' | 'completed' | 'failed';
    createRepo: 'pending' | 'in-progress' | 'completed' | 'failed';
    deployPreview: 'pending' | 'in-progress' | 'completed' | 'failed';
  };
  estimatedTimeRemaining?: number;
  updatedAt: string;
}

// Simple in-memory storage (production would use database)
const statusStore = new Map<string, GenerationStatus>();

// Verify GitHub webhook signature (if configured)
const verifyGitHubSignature = (payload: string, signature: string, secret: string): boolean => {
  if (!secret || !signature) return true; // Skip verification if not configured

  const expectedSignature = 'sha256=' + crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');

  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
};

// Map GitHub status to our progress system
const mapGitHubStatus = (githubStatus: string): {
  status: GenerationStatus['status'];
  progress: number;
  currentStep: string;
  steps: GenerationStatus['steps'];
} => {
  const defaultSteps: GenerationStatus['steps'] = {
    uploadLogo: 'pending',
    analyzeLogo: 'pending',
    generateTheme: 'pending',
    createRepo: 'pending',
    deployPreview: 'pending'
  };

  switch (githubStatus) {
    case 'started':
      return {
        status: 'starting',
        progress: 10,
        currentStep: 'uploadLogo',
        steps: { ...defaultSteps, uploadLogo: 'in-progress' }
      };

    case 'logo_processed':
      return {
        status: 'in-progress',
        progress: 25,
        currentStep: 'analyzeLogo',
        steps: { ...defaultSteps, uploadLogo: 'completed', analyzeLogo: 'in-progress' }
      };

    case 'logo_skipped':
      return {
        status: 'in-progress',
        progress: 25,
        currentStep: 'generateTheme',
        steps: { ...defaultSteps, uploadLogo: 'completed', analyzeLogo: 'completed', generateTheme: 'in-progress' }
      };

    case 'content_generated':
      return {
        status: 'in-progress',
        progress: 60,
        currentStep: 'createRepo',
        steps: {
          ...defaultSteps,
          uploadLogo: 'completed',
          analyzeLogo: 'completed',
          generateTheme: 'completed',
          createRepo: 'in-progress'
        }
      };

    case 'completed':
      return {
        status: 'completed',
        progress: 100,
        currentStep: 'deployPreview',
        steps: {
          uploadLogo: 'completed',
          analyzeLogo: 'completed',
          generateTheme: 'completed',
          createRepo: 'completed',
          deployPreview: 'completed'
        }
      };

    case 'failed':
      return {
        status: 'error',
        progress: 0,
        currentStep: 'error',
        steps: defaultSteps
      };

    default:
      return {
        status: 'in-progress',
        progress: 50,
        currentStep: 'generateTheme',
        steps: { ...defaultSteps, generateTheme: 'in-progress' }
      };
  }
};

// Calculate estimated time remaining
const calculateTimeRemaining = (progress: number): number => {
  if (progress >= 100) return 0;

  // Base estimation: 5 minutes total
  const totalEstimatedTime = 300; // 5 minutes in seconds
  const remaining = ((100 - progress) / 100) * totalEstimatedTime;

  return Math.max(0, Math.round(remaining));
};

export const POST: APIRoute = async ({ request }) => {
  try {
    const payload = await request.text();
    const signature = request.headers.get('x-hub-signature-256') || '';

    // Verify webhook signature if secret is configured
    const webhookSecret = import.meta.env.GITHUB_WEBHOOK_SECRET;
    if (webhookSecret && !verifyGitHubSignature(payload, signature, webhookSecret)) {
      return new Response('Unauthorized', { status: 401 });
    }

    // Parse the status update
    const statusUpdate: GitHubStatusUpdate = JSON.parse(payload);

    // Map GitHub status to our format
    const mappedStatus = mapGitHubStatus(statusUpdate.status);

    // Create or update the generation status
    const generationStatus: GenerationStatus = {
      clientId: statusUpdate.client_name,
      status: mappedStatus.status,
      progress: mappedStatus.progress,
      currentStep: mappedStatus.currentStep,
      message: statusUpdate.message,
      previewUrl: statusUpdate.preview_url,
      repositoryUrl: statusUpdate.pr_url,
      error: statusUpdate.error,
      steps: mappedStatus.steps,
      estimatedTimeRemaining: calculateTimeRemaining(mappedStatus.progress),
      updatedAt: new Date().toISOString()
    };

    // Store the status update
    statusStore.set(statusUpdate.client_name, generationStatus);

    console.log('Status update received:', {
      clientId: statusUpdate.client_name,
      status: statusUpdate.status,
      progress: mappedStatus.progress
    });

    return new Response('OK', { status: 200 });

  } catch (error) {
    console.error('Webhook processing error:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
};

// Handle GET requests for status polling
export const GET: APIRoute = async ({ url }) => {
  try {
    const clientId = url.searchParams.get('clientId');

    if (!clientId) {
      return new Response(JSON.stringify({
        error: 'clientId parameter is required'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Get status from storage
    const status = statusStore.get(clientId);

    if (!status) {
      // Return default status if not found
      const defaultStatus: GenerationStatus = {
        clientId,
        status: 'starting',
        progress: 0,
        currentStep: 'uploadLogo',
        message: 'Initializing website generation...',
        steps: {
          uploadLogo: 'pending',
          analyzeLogo: 'pending',
          generateTheme: 'pending',
          createRepo: 'pending',
          deployPreview: 'pending'
        },
        estimatedTimeRemaining: 300,
        updatedAt: new Date().toISOString()
      };

      return new Response(JSON.stringify(defaultStatus), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify(status), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Status retrieval error:', error);
    return new Response(JSON.stringify({
      error: 'Internal server error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

// Handle preflight requests for CORS
export const OPTIONS: APIRoute = async () => {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, x-hub-signature-256'
    }
  });
};