# Netlify Preview Deployments Setup

This document explains how to set up automatic Netlify preview deployments for pull requests.

## Overview

The project now includes:
- ✅ **GitHub Action** (`.github/workflows/netlify-preview.yml`) for automated deployments
- ✅ **Netlify CLI** installed as dev dependency
- ✅ **Configuration** (`netlify.toml`) with build settings and security headers
- ✅ **PR Comments** with preview links automatically posted

## Required GitHub Secrets

To enable preview deployments, you need to add these secrets to your GitHub repository:

### 1. NETLIFY_AUTH_TOKEN

**How to get it:**
1. Go to [Netlify](https://app.netlify.com/) and log in
2. Click on your avatar → **User settings**
3. Go to **Applications** tab
4. Under **Personal access tokens**, click **New access token**
5. Give it a name like "GitHub Actions"
6. Copy the generated token

**Add to GitHub:**
1. Go to your GitHub repo → **Settings** → **Secrets and variables** → **Actions**
2. Click **New repository secret**
3. Name: `NETLIFY_AUTH_TOKEN`
4. Value: The token you copied from Netlify

### 2. NETLIFY_SITE_ID

**How to get it:**
1. Go to your site in Netlify dashboard
2. Go to **Site settings** → **General**
3. Under **Site details**, copy the **API ID**

**Add to GitHub:**
1. Same process as above
2. Name: `NETLIFY_SITE_ID`
3. Value: The API ID from Netlify

### 3. NETLIFY_SITE_NAME (Optional but recommended)

**How to get it:**
1. In Netlify dashboard, your site name is shown in the URL
2. It's usually something like `amazing-euler-123456`
3. You can also find it under **Site settings** → **General** → **Site name**

**Add to GitHub:**
1. Same process as above
2. Name: `NETLIFY_SITE_NAME`
3. Value: Your site name

## How It Works

### When a PR is opened/updated:
1. **GitHub Action triggers** on PR events (opened, synchronize, reopened)
2. **Builds the project** using `npm run build`
3. **Deploys to Netlify** as a preview with alias `pr-{number}`
4. **Posts comment** on PR with preview URL
5. **Updates comment** on subsequent pushes to the same PR

### Preview URL Format:
```
https://pr-{PR_NUMBER}--{SITE_NAME}.netlify.app
```

Example: `https://pr-19--client-portal-webler.netlify.app`

## Features

### ✅ Automatic Deployment
- Triggers on every PR to `main` branch
- Updates preview on every new commit to PR
- Cleans up old deployments automatically

### ✅ PR Integration
- Posts comment with preview link
- Updates same comment (no spam)
- Shows commit SHA and deployment logs link

### ✅ Security & Performance
- Security headers configured in `netlify.toml`
- Asset caching for performance
- Proper 404 handling

### ✅ Build Optimization
- Uses Node.js 20 for builds
- Caches npm dependencies
- Fast deployment with Astro static output

## Testing the Setup

1. **Add the secrets** to your GitHub repository (see above)
2. **Open a test PR** to `main` branch
3. **Check the Actions tab** in GitHub to see the workflow running
4. **Look for the comment** on your PR with the preview link
5. **Push another commit** to see the preview update

## Troubleshooting

### Common Issues:

**❌ "Invalid credentials" error**
- Check that `NETLIFY_AUTH_TOKEN` is correct
- Make sure the token has the right permissions

**❌ "Site not found" error**
- Verify `NETLIFY_SITE_ID` matches your site's API ID
- Check that the site exists in your Netlify account

**❌ Build fails**
- Check the GitHub Actions logs
- Ensure all dependencies are in `package.json`
- Verify build command works locally with `npm run build`

**❌ Preview URL not working**
- Wait a few minutes for DNS propagation
- Check Netlify dashboard for deployment status
- Verify the site is not password-protected

### Logs and Monitoring:

- **GitHub Actions logs**: GitHub repo → Actions tab → Click on workflow run
- **Netlify deployment logs**: Netlify dashboard → Site → Deploys
- **Build output**: Available in both GitHub Actions and Netlify logs

## Manual Commands (for testing)

If you need to test Netlify CLI locally:

```bash
# Login to Netlify
npx netlify login

# Build and deploy preview manually
npm run build
npx netlify deploy --dir=dist

# Deploy to production (only for testing)
npx netlify deploy --dir=dist --prod
```

## Benefits

### 🚀 **Faster Review Process**
- Reviewers can see live preview immediately
- No need to pull branch and run locally
- Test on real URLs with proper hosting

### 🛡️ **Safety**
- Preview deployments are isolated
- Won't affect production site
- Easy to test breaking changes

### ⚡ **Efficiency**
- Automatic deployment on every commit
- No manual steps required
- Consistent preview environment

### 📱 **Mobile Testing**
- Easy to test on mobile devices
- Share preview links with stakeholders
- Test across different networks/devices

## Configuration Files

### `.github/workflows/netlify-preview.yml`
- GitHub Action workflow
- Handles build and deployment
- Posts PR comments

### `netlify.toml`
- Netlify configuration
- Build settings and redirects
- Security and caching headers

### `package.json`
- Added `netlify-cli` as dev dependency
- Build scripts for Astro

## Next Steps

After setup is complete:
1. **Test with a PR** to verify everything works
2. **Customize the workflow** if needed (e.g., add tests before deploy)
3. **Set up branch protection** rules to require preview deployment success
4. **Monitor usage** and adjust as needed

## Advanced Configuration

### Custom Preview Domains
You can configure custom domains for previews in Netlify:
1. Go to **Site settings** → **Domain management**
2. Add custom domain for previews
3. Update workflow if needed

### Integration with Tests
You can extend the workflow to run tests before deployment:

```yaml
- name: Run tests
  run: npm test

- name: Run linting
  run: npm run lint
```

### Slack/Discord Notifications
Add notifications to your team chat when previews are ready:

```yaml
- name: Notify team
  uses: 8398a7/action-slack@v3
  with:
    status: success
    text: Preview ready for PR #${{ github.event.number }}
```