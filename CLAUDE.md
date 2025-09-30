# Webler Client Portal - Claude Code Guidelines

Project-specific guidelines and conventions for the Webler Client Portal development.

## Project Overview

The Webler Client Portal is an AI-powered website generation platform that allows service businesses to create professional websites through a conversational interface. Built with Astro, React, and TypeScript for optimal performance and developer experience.

## Architecture Principles

### Astro Islands Pattern
- **Static Components**: Use `.astro` components for non-interactive content (headers, footers, marketing pages)
- **React Islands**: Use React components only for interactive features (forms, progress tracking, real-time updates)
- **Performance First**: Minimize JavaScript bundle size by using Astro components when possible

### File Organization
```
src/
├── components/
│   ├── astro/          # Static Astro components
│   └── react/          # Interactive React islands
├── layouts/            # Page layouts with SEO
├── pages/              # Route-based pages
├── styles/             # Global and component styles
└── utils/              # Shared utilities
```

## Development Standards

### TypeScript
- **Strict Mode**: Always use TypeScript strict configuration
- **Interface Definitions**: Define interfaces for all props and API responses
- **Type Exports**: Export types from dedicated files when shared

### Component Guidelines

#### Astro Components
- Use `.astro` extension for static content
- Include frontmatter for any logic or imports
- Follow semantic HTML structure
- Include proper ARIA labels for accessibility

#### React Components
- Use TypeScript with proper prop interfaces
- Implement error boundaries for complex components
- Use React hooks for state management
- Follow React best practices (keys, effect dependencies)

### Styling
- **Tailwind CSS**: Primary styling framework
- **Utility-First**: Use Tailwind utility classes
- **Responsive Design**: Mobile-first approach with `sm:`, `md:`, `lg:` breakpoints
- **Custom Styles**: Use `src/styles/global.css` for custom CSS only when necessary

### SEO Requirements
- **Meta Tags**: All pages must include title, description, keywords
- **OpenGraph**: Include OG tags for social media sharing
- **Schema.org**: Add structured data for rich snippets
- **Performance**: Target Lighthouse scores of 95+ across all metrics

## Code Conventions

### Naming
- **Files**: kebab-case for all files (`header-component.astro`)
- **Components**: PascalCase for React components (`GeneratorForm.tsx`)
- **Variables**: camelCase for JavaScript/TypeScript
- **CSS Classes**: Use Tailwind utilities, avoid custom classes when possible

### Import Organization
```typescript
// 1. External libraries
import { useState } from 'react';
import { io } from 'socket.io-client';

// 2. Internal utilities
import { api } from '../utils/api';

// 3. Internal components
import Layout from '../layouts/Layout.astro';
```

### Error Handling
- **API Calls**: Always include try-catch blocks
- **User Feedback**: Provide clear error messages
- **Graceful Degradation**: Ensure functionality continues with fallbacks

### Performance Optimization
- **Image Optimization**: Use Astro's image optimization features
- **Code Splitting**: Lazy load React components when appropriate
- **Bundle Analysis**: Monitor bundle sizes and optimize imports

## Business Context

### Target Audience
- Service business owners (consultants, agencies, freelancers)
- Non-technical users who need professional websites
- Time-constrained professionals seeking quick solutions

### Value Proposition
- **Speed**: Website preview in minutes
- **Quality**: AI + human polish combination
- **Convenience**: Full-service approach (hosting, updates, maintenance)
- **Pricing**: Transparent subscription model ($99/month)

### Conversion Focus
- **Clear CTAs**: Every section should have clear next steps
- **Social Proof**: Include testimonials, example websites, trust indicators
- **Objection Handling**: Address common concerns in FAQ and copy
- **Friction Reduction**: Minimize steps in the generation process

## Content Guidelines

### Tone and Voice
- **Professional but Approachable**: Expert but not intimidating
- **Clear and Direct**: Avoid jargon, explain technical concepts simply
- **Confident**: Assert the value proposition clearly
- **Helpful**: Focus on solving user problems

### Copy Requirements
- **Headlines**: Action-oriented and benefit-focused
- **Descriptions**: Clear value propositions under 200 characters
- **CTAs**: Specific action verbs ("Start with Webler" not "Learn More")
- **Benefits**: Focus on outcomes, not features

## API Integration

### Endpoints
- **Generation API**: `POST /api/generate` - Start website generation
- **Status API**: `GET /api/status/:clientId` - Check generation progress
- **Health Check**: `GET /health` - API availability

### WebSocket Events
- **Client Events**: `join-generation`, `request-status`
- **Server Events**: `generation-update`, `generation-complete`, `generation-error`

### Error Handling
- **Network Errors**: Implement retry logic with exponential backoff
- **Timeout Handling**: Set appropriate timeouts for long-running operations
- **User Communication**: Provide clear status updates and error messages

## Testing Strategy

### Performance Testing
- **Lighthouse Audits**: Target 95+ scores for Performance, Accessibility, Best Practices, SEO
- **Load Times**: <1.5s First Contentful Paint, <3s Time to Interactive
- **Bundle Sizes**: Monitor and optimize JavaScript bundle sizes

### Cross-Browser Testing
- **Primary**: Chrome, Firefox, Safari, Edge
- **Mobile**: iOS Safari, Chrome Mobile
- **Responsive**: Test all breakpoints (320px to 1920px)

### User Experience Testing
- **Conversion Funnel**: Test complete user journey from landing to preview
- **Form Validation**: Ensure all validation messages are clear
- **Error States**: Test all error scenarios and recovery paths

## Deployment Considerations

### Environment Variables
- **Development**: Local API endpoints
- **Production**: Production API URLs with HTTPS
- **Feature Flags**: Enable/disable features based on environment

### Build Optimization
- **Static Generation**: Pre-render all possible static content
- **Image Optimization**: Compress and optimize all images
- **CSS Purging**: Remove unused CSS classes

### Monitoring
- **Performance**: Monitor Core Web Vitals
- **Errors**: Track JavaScript errors and API failures
- **Analytics**: Track conversion funnel and user behavior

## Security Guidelines

### Data Handling
- **User Input**: Validate and sanitize all user inputs
- **File Uploads**: Validate file types, sizes, and scan for malware
- **API Keys**: Never expose API keys in client-side code

### Privacy
- **Data Collection**: Only collect necessary user data
- **GDPR Compliance**: Implement proper consent mechanisms
- **Data Retention**: Follow data retention policies

## Git Workflow

### Branch Naming
- **Features**: `feature/issue-number-description` (e.g., `feature/2-seo-landing-page`)
- **Bugfixes**: `fix/issue-number-description`
- **Hotfixes**: `hotfix/description`

### Commit Messages
- Follow conventional commits format
- Include issue references
- Add Claude Code attribution for AI-generated commits

### Pull Requests
- **Title**: Clear description matching GitHub issue
- **Description**: Include what changed, why, and testing performed
- **Reviews**: Always request review from project maintainer
- **Testing**: Ensure all acceptance criteria are met

## Best Practices Summary

1. **Performance First**: Optimize for speed and Core Web Vitals
2. **User-Centric**: Design every interaction for conversion
3. **Accessibility**: Ensure all users can navigate and use the platform
4. **Type Safety**: Use TypeScript strictly throughout
5. **Error Resilience**: Handle all error states gracefully
6. **SEO Optimized**: Structure content for search engine visibility
7. **Mobile Responsive**: Design mobile-first with progressive enhancement
8. **Test Thoroughly**: Validate functionality across browsers and devices

---

**Project**: Webler Client Portal
**Tech Stack**: Astro + React + TypeScript + Tailwind CSS
**Target**: Service business professionals
**Goal**: Convert visitors to website generation subscribers