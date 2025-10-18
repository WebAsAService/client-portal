# Development Webhook Testing with ngrok & Tailscale

Choose between ngrok or Tailscale for exposing your local development server to receive webhooks from GitHub Actions.

## Option 1: ngrok (Quick & Easy)

### Quick Setup Guide

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

---

## Option 2: Tailscale (Stable & Reliable)

Tailscale is an excellent alternative to ngrok, especially if you're having account issues or need a more stable connection.

### Advantages of Tailscale
- ✅ **More Stable**: No session timeouts or disconnections
- ✅ **Consistent URLs**: Your machine gets a stable Tailscale IP
- ✅ **No Account Limits**: Free tier is more generous
- ✅ **Better Performance**: Direct peer-to-peer connections
- ✅ **Persistent**: Works across reboots and network changes

### Setup Instructions

#### 1. Install Tailscale
```bash
# macOS (using brew)
brew install tailscale

# Or download from: https://tailscale.com/download/mac

# Linux (Ubuntu/Debian)
curl -fsSL https://tailscale.com/install.sh | sh

# Windows: Download from https://tailscale.com/download/windows
```

#### 2. Create Tailscale Account & Connect
```bash
# Start Tailscale (first time)
sudo tailscale up

# This will open a browser to authenticate with your Tailscale account
# Follow the instructions to connect your machine
```

#### 3. Get Your Tailscale IP
```bash
# Get your machine's Tailscale IP address
tailscale ip -4

# Example output: 100.101.102.103
```

#### 4. Test Local Access
```bash
# Start your development server
npm run dev  # Runs on localhost:4321

# Test access via Tailscale IP
curl http://YOUR_TAILSCALE_IP:4321/health
```

#### 5. Enable HTTPS with Tailscale Serve (Recommended)
For GitHub webhooks, you need HTTPS. Tailscale provides this easily:

```bash
# Enable Tailscale Serve for HTTPS (correct syntax)
tailscale serve 443 http://localhost:4321

# Alternative syntax (if above doesn't work)
tailscale serve https / http://localhost:4321

# Your app is now available at:
# https://YOUR-MACHINE-NAME.YOUR-TAILNET.ts.net
```

#### 6. Get Your HTTPS URL
```bash
# Check your Tailscale status to get the full URL
tailscale status

# Look for the "Tailscale Serve" section
# Example: https://your-machine.tailabc123.ts.net
```

### Complete Tailscale Testing Flow

#### 1. Start Local Environment
```bash
# Terminal 1: Start Astro development server
npm run dev

# Terminal 2: Enable Tailscale HTTPS serving
tailscale serve 443 http://localhost:4321
```

#### 2. Get Your Webhook URL
```bash
# Your webhook URL will be:
# https://your-machine.your-tailnet.ts.net/api/webhooks/github-status

# Test it works:
curl https://your-machine.your-tailnet.ts.net/health
```

#### 3. Update Base-Template Repository Secret
1. Go to: https://github.com/WebAsAService/base-template/settings/secrets/actions
2. Update or create secret:
   - **Name**: `STATUS_WEBHOOK_URL_DEV`
   - **Value**: `https://your-machine.your-tailnet.ts.net/api/webhooks/github-status`

#### 4. Test Webhook Connection
```bash
# Test your Tailscale webhook URL
curl -X POST "https://your-machine.your-tailnet.ts.net/api/webhooks/github-status" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "test",
    "client_name": "tailscale-test",
    "message": "Testing Tailscale webhook connection",
    "timestamp": "'$(date -u +"%Y-%m-%dT%H:%M:%SZ")'"
  }'
```

### Tailscale Development Workflow

#### Complete Testing Flow
1. **Start Local Environment**:
   ```bash
   npm run dev  # Terminal 1
   tailscale serve 443 http://localhost:4321  # Terminal 2
   ```

2. **Update Repository Secret** with your Tailscale HTTPS URL

3. **Test GitHub Token**:
   ```bash
   node test-github-token.js YOUR_GITHUB_TOKEN
   ```

4. **Test Form Submission**:
   - Navigate to your Tailscale URL: `https://your-machine.your-tailnet.ts.net`
   - Fill out the website generator form
   - Submit and monitor logs

5. **Monitor Webhook Requests**:
   - Check Astro dev server logs for webhook processing
   - Verify status updates in browser network tab

### Tailscale Troubleshooting

#### Common Issues
- **Connection Refused**: Ensure Tailscale serve is running and pointing to correct port
- **Invalid Argument Format**: Try different syntax options (see below)
- **HTTPS Required**: Always use Tailscale serve for GitHub webhooks
- **Machine Name Changes**: Use IP address if machine name is unstable

#### Tailscale Serve Syntax Variations
Different Tailscale versions may use different syntax:

```bash
# Option 1: Port-based (most common)
tailscale serve 443 http://localhost:4321

# Option 2: Path-based
tailscale serve https / http://localhost:4321

# Option 3: Full URL (older versions)
tailscale serve https://0.0.0.0:443 http://localhost:4321

# Option 4: Explicit port binding
tailscale serve --https=443 http://localhost:4321
```

**Try these in order until one works for your Tailscale version.**

#### Vite Host Configuration
If you get a "Blocked request" error about allowed hosts, you need to configure Vite to allow your Tailscale domain.

Add this to your `astro.config.mjs`:
```javascript
export default defineConfig({
  // ... other config
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
```

**After updating the config, restart your dev server**: `npm run dev`

#### Debug Commands
```bash
# Check Tailscale status
tailscale status

# Check what's being served
tailscale serve status

# Get your Tailscale IP
tailscale ip -4

# Test local webhook directly
curl -X POST "http://localhost:4321/api/webhooks/github-status" \
  -H "Content-Type: application/json" \
  -d '{"status":"test","client_name":"local-test","message":"Local test"}'

# Test through Tailscale
curl -X POST "https://your-machine.your-tailnet.ts.net/api/webhooks/github-status" \
  -H "Content-Type: application/json" \
  -d '{"status":"test","client_name":"tailscale-test","message":"Tailscale test"}'
```

#### Restart Tailscale Serve
```bash
# Stop serving
tailscale serve reset

# Start serving again
tailscale serve 443 http://localhost:4321
```

### Comparison: ngrok vs Tailscale

| Feature | ngrok | Tailscale |
|---------|--------|-----------|
| **Setup** | Quick install | Requires account setup |
| **Stability** | Session timeouts | Very stable |
| **URL Changes** | New URL on restart | Consistent URLs |
| **Free Tier** | Limited sessions | Generous limits |
| **Performance** | Good | Excellent |
| **HTTPS** | Automatic | Via `tailscale serve` |
| **Best For** | Quick testing | Long-term development |

## Recommendation

- **Use ngrok** if you need something quick and temporary
- **Use Tailscale** if you're doing ongoing development or having ngrok issues
- **For production**, always use your actual domain