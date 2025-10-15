# GitHub Integration Setup

This document explains how to set up the direct GitHub integration for the Webler Client Portal.

## Overview

The client portal now triggers GitHub Actions workflows directly from the Astro frontend, eliminating the need for a separate backend service for basic functionality.

## Architecture

```
┌─────────────────┐    API Routes    ┌─────────────────┐
│ Astro Frontend  │ ────────────────▶│ GitHub Actions  │
│ (Client Portal) │                  │ (base-template) │
└─────────────────┘                  └─────────────────┘
        │                                     │
        │ Status Polling                      │ Webhooks
        │                                     │
        └◀────────────────────────────────────┘
```

## Setup Instructions

### 1. GitHub Personal Access Token

1. Go to GitHub Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Click "Generate new token (classic)"
3. Select the following scopes:
   - `repo` (Full control of private repositories)
   - `workflow` (Update GitHub Action workflows)
4. Copy the generated token

### 2. Environment Variables

Update your `.env.development` file:

```bash
# GitHub Integration
GITHUB_TOKEN=ghp_your_actual_github_token_here
GITHUB_WEBHOOK_SECRET=optional_webhook_secret_for_verification
```

**Security Note**: The `GITHUB_TOKEN` is server-side only and not exposed to the client.

### 3. Webhook URL Configuration

The GitHub Actions workflow needs to send status updates back to your application.

**For Development:**
- Use a tool like ngrok to expose your local server: `ngrok http 4321`
- Update the webhook URL in the base-template workflow

**For Production:**
- The webhook URL will be your deployed site: `https://yoursite.com/api/webhooks/github-status`

### 4. Base Template Workflow Update

Update the `STATUS_WEBHOOK_URL` secret in the base-template repository:

1. Go to the base-template repository settings
2. Navigate to Secrets and variables → Actions
3. Update or create `STATUS_WEBHOOK_URL`:
   - Development: `https://your-ngrok-url.ngrok.io/api/webhooks/github-status`
   - Production: `https://yoursite.com/api/webhooks/github-status`

## API Endpoints

### POST /api/generate
Triggers website generation workflow.

**Request:**
```json
{
  "businessName": "Acme Corp",
  "description": "Professional consulting services",
  "industry": "Technology",
  "services": ["consulting", "development"],
  "targetAudience": "Startups and SMEs",
  "email": "contact@acme.com",
  "phone": "+1234567890",
  "domain": "acme.com"
}
```

**Response:**
```json
{
  "success": true,
  "clientId": "acme-corp-1696789123-abc123",
  "message": "Website generation started successfully",
  "estimatedTime": 300
}
```

### GET /api/status/:clientId
Polls generation status.

**Response:**
```json
{
  "clientId": "acme-corp-1696789123-abc123",
  "status": "in-progress",
  "progress": 45,
  "currentStep": "generateTheme",
  "message": "AI content and theme generated",
  "steps": {
    "uploadLogo": "completed",
    "analyzeLogo": "completed",
    "generateTheme": "in-progress",
    "createRepo": "pending",
    "deployPreview": "pending"
  },
  "estimatedTimeRemaining": 180
}
```

### POST /api/webhooks/github-status
Receives status updates from GitHub Actions.

## Testing

### 1. Start Development Server
```bash
npm run dev
```

### 2. Test Form Submission
1. Navigate to `http://localhost:4321`
2. Fill out the generator form
3. Submit and verify:
   - API call is made to `/api/generate`
   - GitHub Actions workflow is triggered
   - Progress tracking begins

### 3. Test Webhook (with ngrok)
1. Install ngrok: `npm install -g ngrok`
2. Expose local server: `ngrok http 4321`
3. Update base-template `STATUS_WEBHOOK_URL` with ngrok URL
4. Trigger a generation and verify webhook updates are received

## Development Workflow

1. **Form Changes**: Update `GeneratorForm.tsx` for UI changes
2. **API Changes**: Modify `/api/generate.ts` for business logic
3. **Status Handling**: Update `/api/webhooks/github-status.ts` for new status types
4. **Progress UI**: Modify `ProgressTracker.tsx` for display changes

## Production Deployment

### Environment Variables (Production)
```bash
GITHUB_TOKEN=ghp_production_token_here
GITHUB_WEBHOOK_SECRET=secure_webhook_secret
```

### Webhook URL (Production)
Update base-template repository secret:
```
STATUS_WEBHOOK_URL=https://yourproductiondomain.com/api/webhooks/github-status
```

## Security Considerations

1. **GitHub Token**: Server-side only, never exposed to client
2. **Webhook Verification**: Optional signature verification for webhook security
3. **Rate Limiting**: Consider implementing rate limiting on API endpoints
4. **Input Validation**: All form inputs are validated before GitHub API calls

## Troubleshooting

### Common Issues

1. **401 Unauthorized**: Check GitHub token permissions and validity
2. **Webhook Not Received**: Verify ngrok URL and base-template webhook configuration
3. **Form Submission Fails**: Check browser network tab for API errors
4. **Status Not Updating**: Verify webhook endpoint is receiving requests

### Debugging

Enable debug mode in `.env.development`:
```bash
PUBLIC_ENABLE_DEBUG=true
```

Check browser console and server logs for detailed error information.

## Migration Path

This implementation provides a direct integration path while preserving the ability to migrate to a full RedwoodJS SaaS backend later:

1. **Current**: Astro → GitHub Actions (direct)
2. **Future**: Astro → RedwoodJS → GitHub Actions (full SaaS platform)

The API interfaces are designed to be compatible with the future RedwoodJS implementation.