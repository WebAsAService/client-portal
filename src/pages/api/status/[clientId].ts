/**
 * Astro API Route: Status Endpoint
 *
 * Provides generation status for a specific client ID.
 * Used by ProgressTracker for polling updates.
 */

import type { APIRoute } from 'astro';

export const prerender = false;

// Re-export the GET handler from the webhook endpoint
// This allows for cleaner URLs like /api/status/client-123
export const GET: APIRoute = async ({ params }) => {
  try {
    const clientId = params.clientId;

    if (!clientId) {
      return new Response(JSON.stringify({
        error: 'Client ID is required'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Forward to the webhook handler's GET method
    const baseUrl = import.meta.env.SITE || 'http://localhost:4321';
    const url = new URL('/api/webhooks/github-status', baseUrl);
    url.searchParams.set('clientId', clientId);

    // Create a new request to forward to the webhook handler
    const response = await fetch(url.toString());
    const data = await response.text();

    return new Response(data, {
      status: response.status,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Access-Control-Allow-Origin': '*'
      }
    });

  } catch (error) {
    console.error('Status endpoint error:', error);
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
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  });
};