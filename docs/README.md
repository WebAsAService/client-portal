# Client Portal Documentation

Complete setup and configuration guides for the Webler Client Portal direct GitHub integration.

## 📋 Setup Guides

### 🔑 [GitHub Setup](./GITHUB_SETUP.md)
- GitHub Personal Access Token creation
- Permission configuration
- Token testing and validation
- API integration overview

### 🌐 [Webhook Configuration](./WEBHOOK_SETUP.md)
- Repository secrets setup
- Workflow integration
- Security considerations
- Testing and troubleshooting

### 🚇 [Development Testing with ngrok](./NGROK_SETUP.md)
- Local webhook testing setup
- ngrok installation and configuration
- Development workflow
- Debugging and troubleshooting

### 🚀 [Production Deployment](./PRODUCTION_DEPLOYMENT.md)
- Platform-specific configurations (Vercel, Netlify, Railway)
- Environment variables setup
- Security and performance optimization
- Deployment checklist

### 📍 [URL Configuration](./URL_CONFIGURATION.md)
- Webhook URL clarification
- Repository roles and responsibilities
- Common configuration mistakes
- Architecture overview

## 🔧 Workflow Files

### [Updated Workflow](./updated-workflow.yml)
- Complete GitHub Actions workflow for base-template repository
- Webhook integration with client portal
- Status tracking and progress updates
- Compatible with client portal API format

## 🏗️ Architecture Overview

```
User Form Submission → Client Portal API → GitHub Workflow → Status Webhooks → Progress Updates
```

### Key Components

1. **Client Portal**: User interface and API endpoints
2. **Base Template**: GitHub Actions workflow for website generation
3. **Webhook System**: Real-time status communication
4. **Status Tracking**: Progress monitoring and user feedback

## 🚀 Quick Start

1. **Generate GitHub Token**: Follow [GitHub Setup](./GITHUB_SETUP.md)
2. **Configure Environment**: Update `.env.development` with your token
3. **Set up Webhooks**: Use [ngrok](./NGROK_SETUP.md) for development testing
4. **Deploy to Production**: Follow [Production Deployment](./PRODUCTION_DEPLOYMENT.md)
5. **Update Base Template**: Use the [Updated Workflow](./updated-workflow.yml)

## 🔗 Related Files

- `test-github-token.js` - Token validation script (project root)
- `.env.development` - Development environment configuration
- `.env.production` - Production environment template
- `src/pages/api/` - API endpoints for GitHub integration

## 🆘 Support

For issues or questions:
1. Check the troubleshooting sections in each guide
2. Review the [URL Configuration](./URL_CONFIGURATION.md) for common mistakes
3. Test webhook connectivity using provided curl commands
4. Verify GitHub token permissions with the test script