// @ts-check
import { defineConfig } from 'astro/config';

import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import netlify from '@astrojs/netlify';
import node from '@astrojs/node';

// Use node adapter for development to avoid Netlify POST issues
const isDev = process.env.NODE_ENV !== 'production';

// https://astro.build/config
export default defineConfig({
  site: process.env.DEPLOY_PRIME_URL || process.env.URL || 'http://localhost:4321',
  output: 'server', // Server-side rendering for API routes
  adapter: isDev ? node({ mode: 'standalone' }) : netlify(),
  integrations: [react()],

  vite: {
    plugins: [tailwindcss()],
    server: {
      host: true, // Allow external connections
      allowedHosts: [
        'localhost',
        '127.0.0.1',
        '.ts.net', // Allow all Tailscale domains
        '.tailscale.io', // Alternative Tailscale domains
        '.ngrok.io', // Also support ngrok domains
        '.ngrok.app', // New ngrok domains
        '.ngrok-free.app' // Free ngrok domains
      ]
    },
    optimizeDeps: {
      exclude: ['@vite/client', '@vite/env'], // Add these to the exclude array
    }
  }
});