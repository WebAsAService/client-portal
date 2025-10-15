# Webhook URL Configuration Guide

## Overview
The base-template repository needs to know where to send status updates during workflow execution.

## Repository Secrets Setup

### 1. Navigate to Base-Template Repository
Go to: https://github.com/WebAsAService/base-template/settings/secrets/actions

### 2. Add/Update Repository Secrets

#### Development Setup
- **Secret Name**: `STATUS_WEBHOOK_URL_DEV`
- **Secret Value**: `https://your-ngrok-url.ngrok.io/api/webhooks/github-status`

#### Production Setup
- **Secret Name**: `STATUS_WEBHOOK_URL`
- **Secret Value**: `https://your-production-domain.com/api/webhooks/github-status`

#### Webhook Security (Optional)
- **Secret Name**: `WEBHOOK_SECRET`
- **Secret Value**: Same as your `GITHUB_WEBHOOK_SECRET` environment variable

## Workflow Integration

### Update Workflow File
The base-template workflow needs to reference these secrets. Here's the required structure:

```yaml
name: Generate Client Site
on:
  repository_dispatch:
    types: [generate-client-site]

jobs:
  generate:
    runs-on: ubuntu-latest
    steps:
      - name: Notify Start
        run: |
          curl -X POST "${{ secrets.STATUS_WEBHOOK_URL }}" \
            -H "Content-Type: application/json" \
            -d '{
              "status": "started",
              "client_name": "${{ github.event.client_payload.businessName }}",
              "message": "Website generation started",
              "timestamp": "'$(date -u +"%Y-%m-%dT%H:%M:%SZ")'"
            }'

      # ... other workflow steps ...

      - name: Notify Completion
        run: |
          curl -X POST "${{ secrets.STATUS_WEBHOOK_URL }}" \
            -H "Content-Type: application/json" \
            -d '{
              "status": "completed",
              "client_name": "${{ github.event.client_payload.businessName }}",
              "message": "Website generation completed",
              "timestamp": "'$(date -u +"%Y-%m-%dT%H:%M:%SZ")'",
              "preview_url": "${{ steps.deploy.outputs.preview_url }}"
            }'
```

## Testing Webhook URL

### 1. Test Webhook Endpoint
```bash
# Test your webhook endpoint
curl -X POST "https://your-domain.com/api/webhooks/github-status" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "test",
    "client_name": "test-client",
    "message": "Testing webhook connection",
    "timestamp": "'$(date -u +"%Y-%m-%dT%H:%M:%SZ")'"
  }'
```

### 2. Expected Response
- **Success**: HTTP 200 with status update stored
- **Missing Data**: HTTP 400 with validation error
- **Server Error**: HTTP 500 with error details

## Security Considerations

### Webhook Verification (Recommended)
```javascript
// In your webhook handler
const crypto = require('crypto');

function verifyWebhookSignature(payload, signature, secret) {
  const hmac = crypto.createHmac('sha256', secret);
  const digest = 'sha256=' + hmac.update(payload, 'utf8').digest('hex');
  return crypto.timingSafeEqual(Buffer.from(digest), Buffer.from(signature));
}
```

### IP Allowlisting (Optional)
Consider restricting webhook access to GitHub's IP ranges:
- https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/about-githubs-ip-addresses

## Troubleshooting

### Common Issues
1. **404 Not Found**: Check webhook URL is correct and endpoint exists
2. **403 Forbidden**: Verify CORS headers and authentication
3. **500 Server Error**: Check server logs for detailed error information
4. **Timeout**: Ensure webhook endpoint responds within 10 seconds

### Debug Commands
```bash
# Check if webhook endpoint is accessible
curl -I "https://your-domain.com/api/webhooks/github-status"

# Test with verbose output
curl -v -X POST "https://your-domain.com/api/webhooks/github-status" \
  -H "Content-Type: application/json" \
  -d '{"status":"test","client_name":"debug","message":"Debug test"}'
```

## Monitoring

### Webhook Logs
Monitor your webhook endpoint logs for:
- Successful status updates (HTTP 200)
- Failed requests (HTTP 4xx/5xx)
- Processing time
- Error patterns

### GitHub Actions Logs
Check workflow execution logs for:
- Webhook curl command output
- HTTP response codes
- Network connectivity issues