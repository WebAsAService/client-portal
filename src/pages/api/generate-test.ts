import type { APIRoute } from 'astro';

export const prerender = false;

export const GET: APIRoute = async ({ request }) => {
  console.log('=== Test Generate API - GET Starting ===');

  return new Response(JSON.stringify({
    success: true,
    message: 'Test GET API endpoint is working',
    timestamp: new Date().toISOString()
  }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    }
  });
};

export const OPTIONS: APIRoute = async () => {
  console.log('=== Test Generate API - OPTIONS Starting ===');

  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    }
  });
};

export const POST: APIRoute = async ({ request }) => {
  console.log('=== Test Generate API - POST Starting ===');

  return new Response(JSON.stringify({
    success: true,
    message: 'Test POST API endpoint is working',
    timestamp: new Date().toISOString()
  }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    }
  });
};