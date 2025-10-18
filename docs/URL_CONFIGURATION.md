# URL Configuration Guide

## Repository Webhook Configuration

### Base-Template Repository Secrets
Location: `https://github.com/WebAsAService/base-template/settings/secrets/actions`

#### Development Secret
- **Name**: `STATUS_WEBHOOK_URL_DEV`
- **Value**: `https://abc123.ngrok.io/api/webhooks/github-status`
- **Points to**: Your local client-portal via ngrok

#### Production Secret
- **Name**: `STATUS_WEBHOOK_URL`
- **Value**: `https://your-client-portal-domain.com/api/webhooks/github-status`
- **Points to**: Your deployed client-portal

## URL Examples by Deployment Platform

### Vercel Deployment
```bash
# Client Portal on Vercel
STATUS_WEBHOOK_URL=https://webler-client-portal.vercel.app/api/webhooks/github-status
```

### Netlify Deployment
```bash
# Client Portal on Netlify
STATUS_WEBHOOK_URL=https://webler-client-portal.netlify.app/api/webhooks/github-status
```

### Custom Domain
```bash
# Client Portal with custom domain
STATUS_WEBHOOK_URL=https://portal.webler.com/api/webhooks/github-status
```

### Railway Deployment
```bash
# Client Portal on Railway
STATUS_WEBHOOK_URL=https://webler-client-portal.up.railway.app/api/webhooks/github-status
```

## Testing URLs

### Development Testing
```bash
# Start ngrok
ngrok http 4321

# Use the HTTPS URL in base-template secret
# Example: https://abc123.ngrok.io/api/webhooks/github-status
```

### Production Testing
```bash
# Test webhook endpoint directly
curl -X POST "https://your-client-portal-domain.com/api/webhooks/github-status" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "test",
    "client_id": "test-client-123",
    "client_name": "Test Business",
    "message": "Testing webhook connection",
    "timestamp": "'$(date -u +%Y-%m-%dT%H:%M:%SZ)'"
  }'
```

## Common Mistakes to Avoid

### ❌ WRONG: Base-Template URL
```bash
# DON'T USE - This is the generated website URL
STATUS_WEBHOOK_URL=https://business-name.netlify.app/api/webhooks/github-status
```

### ❌ WRONG: GitHub Pages URL
```bash
# DON'T USE - This is a static site
STATUS_WEBHOOK_URL=https://webasaservice.github.io/base-template/api/webhooks/github-status
```

### ✅ CORRECT: Client Portal URL
```bash
# USE THIS - Points to your Astro client portal
STATUS_WEBHOOK_URL=https://your-client-portal.vercel.app/api/webhooks/github-status
```

## Architecture Overview

```
┌─────────────────────┐
│   USER BROWSER      │
│                     │
│ webler.com          │ ← Main landing page
│ portal.webler.com   │ ← Client portal (webhook target)
└─────────────────────┘
           │
           │ form submit
           ▼
┌─────────────────────┐
│  CLIENT PORTAL      │
│                     │
│ /api/generate       │ ← Triggers workflow
│ /api/webhooks/...   │ ← Receives status updates
│ /api/status/[id]    │ ← Status polling
└─────────────────────┘
           │
           │ repository dispatch
           ▼
┌─────────────────────┐
│  BASE TEMPLATE      │
│                     │
│ GitHub Actions      │ ← Generates websites
│ Workflow            │ ← Sends webhooks back
└─────────────────────┘
           │
           │ generates
           ▼
┌─────────────────────┐
│  CLIENT WEBSITES    │
│                     │
│ business1.com       │ ← Generated sites
│ business2.netlify   │ ← Deployed separately
└─────────────────────┘
```

## Environment Variables Summary

### Client Portal (.env files)
```bash
# Your client portal domain (where webhooks are received)
PUBLIC_API_URL=https://portal.webler.com
PUBLIC_APP_URL=https://portal.webler.com

# GitHub token for triggering workflows
GITHUB_TOKEN=ghp_your_token_here

# Secret for webhook verification
GITHUB_WEBHOOK_SECRET=your_webhook_secret
```

### Base Template (Repository Secrets)
```bash
# URL where base-template sends status updates
STATUS_WEBHOOK_URL=https://portal.webler.com/api/webhooks/github-status

# Optional: Webhook signature verification
WEBHOOK_SECRET=your_webhook_secret

# API key for AI generation
ANTHROPIC_API_KEY=your_claude_key
```