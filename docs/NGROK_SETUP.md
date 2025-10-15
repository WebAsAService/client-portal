# Development Webhook Testing with ngrok

## Quick Setup Guide

### 1. Install ngrok
```bash
# Option 1: Using npm (recommended)
npm install -g ngrok

# Option 2: Using brew (macOS)
brew install ngrok

# Option 3: Download from https://ngrok.com/download
```

### 2. Start Your Development Server
```bash
# Terminal 1: Start Astro development server
npm run dev
# Server runs on http://localhost:4321
```

### 3. Expose Local Server with ngrok
```bash
# Terminal 2: Expose local server
ngrok http 4321

# You'll see output like:
# Forwarding https://abc123.ngrok.io -> http://localhost:4321
```

### 4. Update Base-Template Repository Secret
1. Copy your ngrok URL (e.g., `https://abc123.ngrok.io`)
2. Go to: https://github.com/WebAsAService/base-template/settings/secrets/actions
3. Update or create secret:
   - **Name**: `STATUS_WEBHOOK_URL_DEV`
   - **Value**: `https://abc123.ngrok.io/api/webhooks/github-status`

### 5. Test Webhook Connection
```bash
# Test your ngrok webhook URL
curl -X POST "https://abc123.ngrok.io/api/webhooks/github-status" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "test",
    "client_name": "ngrok-test",
    "message": "Testing ngrok webhook connection",
    "timestamp": "'$(date -u +"%Y-%m-%dT%H:%M:%SZ")'"
  }'
```

## Development Workflow

### Complete Testing Flow
1. **Start Local Environment**:
   ```bash
   npm run dev  # Terminal 1
   ngrok http 4321  # Terminal 2
   ```

2. **Update Repository Secret** with your ngrok URL

3. **Test GitHub Token**:
   ```bash
   node test-github-token.js YOUR_GITHUB_TOKEN
   ```

4. **Test Form Submission**:
   - Navigate to `http://localhost:4321`
   - Fill out the website generator form
   - Submit and monitor logs

5. **Monitor Webhook Requests**:
   - Watch ngrok terminal for incoming webhook requests
   - Check Astro dev server logs for webhook processing
   - Verify status updates in browser network tab

### Expected Flow
```
1. Form Submission → /api/generate
2. GitHub API Call → Repository Dispatch
3. GitHub Actions Starts → Sends webhook to ngrok URL
4. Webhook Received → /api/webhooks/github-status
5. Status Stored → Available via /api/status/[clientId]
6. Frontend Polls → Real-time progress updates
```

## Troubleshooting

### ngrok Issues
- **URL Changes**: ngrok free tier generates new URLs on restart
- **Timeout**: ngrok free tier has session limits
- **HTTPS Required**: GitHub webhooks require HTTPS (ngrok provides this)

### Common Problems
1. **Webhook 404**: Check ngrok URL is correct in repository secret
2. **Connection Refused**: Ensure local dev server is running on port 4321
3. **CORS Errors**: Webhook handler includes proper CORS headers
4. **Authentication**: Verify GitHub token has correct permissions

### Debug Commands
```bash
# Check ngrok tunnel status
curl -H "Host: abc123.ngrok.io" http://localhost:4040/api/tunnels

# Test local webhook directly
curl -X POST "http://localhost:4321/api/webhooks/github-status" \
  -H "Content-Type: application/json" \
  -d '{"status":"test","client_name":"local-test","message":"Local test"}'

# Test through ngrok
curl -X POST "https://abc123.ngrok.io/api/webhooks/github-status" \
  -H "Content-Type: application/json" \
  -d '{"status":"test","client_name":"ngrok-test","message":"Ngrok test"}'
```

## Production Alternative

### For Production Testing
Instead of ngrok, use your actual production domain:
- Deploy to staging/production environment
- Use real domain for webhook URL
- Test with production GitHub token
- Monitor with production logging

### Environment Switching
```bash
# Development with ngrok
STATUS_WEBHOOK_URL=https://abc123.ngrok.io/api/webhooks/github-status

# Production
STATUS_WEBHOOK_URL=https://yoursite.com/api/webhooks/github-status
```