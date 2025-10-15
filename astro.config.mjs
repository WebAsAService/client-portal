// @ts-check
import { defineConfig } from 'astro/config';

import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import netlify from '@astrojs/netlify';

// https://astro.build/config
export default defineConfig({
  output: 'server', // Server-side rendering for API routes
  adapter: netlify(),
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
    }
  }
});