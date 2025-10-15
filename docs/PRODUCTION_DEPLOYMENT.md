# Production Deployment Configuration

## Platform-Specific Configurations

### Vercel Deployment

#### 1. Environment Variables
In Vercel Dashboard → Project Settings → Environment Variables:

```bash
# Required Variables
GITHUB_TOKEN=ghp_your_production_token_here
GITHUB_WEBHOOK_SECRET=your_secure_webhook_secret

# Public Variables
PUBLIC_API_URL=https://your-domain.vercel.app
PUBLIC_APP_URL=https://your-domain.vercel.app
PUBLIC_ENABLE_DEBUG=false
PUBLIC_ENABLE_ANALYTICS=true
PUBLIC_STATUS_POLL_INTERVAL=5000
```

#### 2. Vercel Configuration
Create `vercel.json`:
```json
{
  "framework": "astro",
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "installCommand": "npm install",
  "functions": {
    "src/pages/api/**/*.ts": {
      "runtime": "@vercel/node"
    }
  },
  "redirects": [
    {
      "source": "/api/(.*)",
      "destination": "/api/$1"
    }
  ]
}
```

### Netlify Deployment

#### 1. Environment Variables
In Netlify Dashboard → Site Settings → Environment Variables:

```bash
# Required Variables
GITHUB_TOKEN=ghp_your_production_token_here
GITHUB_WEBHOOK_SECRET=your_secure_webhook_secret

# Public Variables
PUBLIC_API_URL=https://your-site.netlify.app
PUBLIC_APP_URL=https://your-site.netlify.app
PUBLIC_ENABLE_DEBUG=false
PUBLIC_ENABLE_ANALYTICS=true
PUBLIC_STATUS_POLL_INTERVAL=5000
```

#### 2. Netlify Configuration
Create `netlify.toml`:
```toml
[build]
  command = "npm run build"
  publish = "dist"

[build.environment]
  NODE_VERSION = "18"

[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/:splat"
  status = 200

[functions]
  node_bundler = "esbuild"
```

### Railway Deployment

#### 1. Environment Variables
```bash
# Required Variables
GITHUB_TOKEN=ghp_your_production_token_here
GITHUB_WEBHOOK_SECRET=your_secure_webhook_secret
PORT=3000

# Public Variables
PUBLIC_API_URL=https://your-app.up.railway.app
PUBLIC_APP_URL=https://your-app.up.railway.app
PUBLIC_ENABLE_DEBUG=false
PUBLIC_ENABLE_ANALYTICS=true
PUBLIC_STATUS_POLL_INTERVAL=5000
```

#### 2. Railway Configuration
Create `railway.toml`:
```toml
[build]
  builder = "nixpacks"

[deploy]
  startCommand = "npm start"
  healthcheckPath = "/health"
  healthcheckTimeout = 300
  restartPolicyType = "on_failure"
```

## Security Configuration

### 1. Environment Variable Security
```bash
# Generate secure webhook secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Use this output as your GITHUB_WEBHOOK_SECRET
```

### 2. CORS Configuration
Already configured in webhook handler:
```javascript
{
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type'
}
```

### 3. Rate Limiting (Recommended)
Consider adding rate limiting middleware for production:
```javascript
// Example rate limiting logic
const requestCounts = new Map();
const RATE_LIMIT = 100; // requests per minute
const WINDOW_SIZE = 60000; // 1 minute

function rateLimitMiddleware(clientIp) {
  const now = Date.now();
  const windowStart = now - WINDOW_SIZE;

  if (!requestCounts.has(clientIp)) {
    requestCounts.set(clientIp, []);
  }

  const requests = requestCounts.get(clientIp)
    .filter(timestamp => timestamp > windowStart);

  if (requests.length >= RATE_LIMIT) {
    return false; // Rate limited
  }

  requests.push(now);
  requestCounts.set(clientIp, requests);
  return true; // Allowed
}
```

## Domain Configuration

### 1. Custom Domain Setup
For production with custom domain:

```bash
# Update environment variables
PUBLIC_API_URL=https://webler.yourcompany.com
PUBLIC_APP_URL=https://webler.yourcompany.com

# Update base-template repository secret
STATUS_WEBHOOK_URL=https://webler.yourcompany.com/api/webhooks/github-status
```

### 2. SSL Certificate
- Most platforms (Vercel, Netlify) provide automatic SSL
- Ensure HTTPS is enforced for webhook security
- GitHub requires HTTPS for webhook URLs

## Performance Optimization

### 1. Astro Build Configuration
Update `astro.config.mjs`:
```javascript
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import netlify from '@astrojs/netlify'; // or vercel(), node()

export default defineConfig({
  output: 'server', // Server-side rendering for API routes
  adapter: netlify(), // Required for server-rendered pages
  integrations: [react()],

  vite: {
    plugins: [tailwindcss()],
    // Performance optimizations
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom'],
            utils: ['@tanstack/react-query']
          }
        }
      }
    }
  }
});
```

**Required Dependencies:**
```bash
# For Netlify (current setup)
npm install @astrojs/netlify

# For Vercel
npm install @astrojs/vercel

# For Node.js/Railway
npm install @astrojs/node
```

**Important**: The `output: 'server'` mode is required because we use server-rendered API routes with `export const prerender = false;`.

### 2. Caching Strategy
```javascript
// Add to webhook handler for caching
{
  'Cache-Control': 'no-cache, no-store, must-revalidate',
  'Pragma': 'no-cache',
  'Expires': '0'
}

// Add to status endpoint for short caching
{
  'Cache-Control': 'public, max-age=30', // 30 seconds
  'Expires': new Date(Date.now() + 30000).toUTCString()
}
```

## Monitoring Setup

### 1. Health Check Endpoint
Create `src/pages/health.ts`:
```javascript
export const prerender = false;

export const GET = async () => {
  return new Response(JSON.stringify({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0'
  }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
};
```

### 2. Error Tracking
Consider integrating error tracking:
```bash
# Sentry
npm install @sentry/astro

# Or LogRocket
npm install logrocket
```

## Deployment Checklist

### Pre-Deployment
- [ ] GitHub token created with correct permissions
- [ ] Environment variables configured on platform
- [ ] Webhook secret generated and configured
- [ ] Domain/subdomain configured (if using custom domain)
- [ ] SSL certificate verified

### Post-Deployment
- [ ] Health check endpoint responding (`/health`)
- [ ] API endpoints accessible (`/api/generate`, `/api/status/test`)
- [ ] Webhook endpoint accessible (`/api/webhooks/github-status`)
- [ ] Base-template repository secret updated with production webhook URL
- [ ] End-to-end test completed
- [ ] Error monitoring configured

### Testing Commands
```bash
# Test health endpoint
curl https://your-domain.com/health

# Test webhook endpoint
curl -X POST "https://your-domain.com/api/webhooks/github-status" \
  -H "Content-Type: application/json" \
  -d '{"status":"test","client_name":"production-test","message":"Production test"}'

# Test GitHub token
node test-github-token.js YOUR_PRODUCTION_TOKEN
```

## Rollback Plan

### Emergency Rollback
1. **Revert to Previous Deployment**: Use platform's rollback feature
2. **Update Repository Secret**: Revert webhook URL to previous working version
3. **Monitor Logs**: Check for immediate issues
4. **Notify Users**: If service was disrupted

### Database/State Considerations
- Current implementation uses in-memory storage
- No persistent data to backup/restore
- Consider implementing persistent storage for production scale