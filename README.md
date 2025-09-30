# Webler Client Portal

AI-powered website generation platform client portal built with Astro, React, and TypeScript.

## Overview

The Webler Client Portal is a modern web application that allows service businesses to generate professional websites through an AI-powered conversational interface. Built with Astro for optimal performance and React islands for interactive components.

## Features

- 🚀 **Landing Page** - SEO-optimized marketing page with conversion focus
- 📝 **Interactive Form** - Conversational chat-style website generation form
- ⚡ **Real-time Progress** - WebSocket-powered progress tracking during generation
- 🎨 **Preview & Activation** - Website preview with subscription flow
- 📱 **Mobile Responsive** - Optimized for all devices

## Tech Stack

- **Frontend Framework**: [Astro](https://astro.build/) with React islands
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Type Safety**: TypeScript
- **Real-time**: Socket.io
- **Icons**: Lucide React

## Project Structure

```text
client-portal/
├── public/
│   └── images/
├── src/
│   ├── components/
│   │   ├── astro/           # Astro components
│   │   │   ├── Header.astro
│   │   │   └── Footer.astro
│   │   └── react/           # React island components
│   ├── layouts/
│   │   └── Layout.astro     # Main layout with SEO
│   ├── pages/
│   │   └── index.astro      # Landing page
│   ├── styles/
│   │   └── global.css       # Global styles
│   └── utils/
│       ├── api.ts           # API client utilities
│       └── websocket.ts     # WebSocket configuration
├── astro.config.mjs
├── package.json
└── tsconfig.json
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Installation

1. Clone the repository:
```sh
git clone https://github.com/WebAsAService/client-portal.git
cd client-portal
```

2. Install dependencies:
```sh
npm install
```

3. Start the development server:
```sh
npm run dev
```

4. Open your browser and visit `http://localhost:4321`

## Development

### Commands

| Command                   | Action                                           |
| :------------------------ | :----------------------------------------------- |
| `npm install`             | Installs dependencies                            |
| `npm run dev`             | Starts local dev server at `localhost:4321`      |
| `npm run build`           | Build your production site to `./dist/`          |
| `npm run preview`         | Preview your build locally, before deploying     |
| `npm run astro ...`       | Run CLI commands like `astro add`, `astro check` |
| `npm run astro -- --help` | Get help using the Astro CLI                     |

### Environment Variables

Create a `.env` file based on `.env.example`:

```bash
# API Configuration
PUBLIC_API_URL=http://localhost:3000
PUBLIC_SOCKET_URL=http://localhost:3000

# Feature Flags
PUBLIC_ENABLE_ANALYTICS=false
PUBLIC_ENABLE_FEEDBACK=true

# Application
PUBLIC_APP_NAME=Webler
PUBLIC_APP_URL=http://localhost:4321
```

## Architecture

### Astro with React Islands

This project uses Astro's islands architecture:
- **Static content** (landing page, headers, footers) use Astro components for optimal performance
- **Interactive features** (forms, progress tracking) use React islands for dynamic functionality

### Data Flow

1. **User Input** → Conversational form collects business details
2. **WebSocket Connection** → Real-time progress updates during generation
3. **API Integration** → RESTful API for website generation requests
4. **Preview & Conversion** → Generated website preview with subscription flow

## Deployment

### Production Build

```sh
npm run build
```

The built site will be in `./dist/` ready for deployment to any static hosting provider.

### Environment Setup

For production deployment, configure these environment variables:
- `PUBLIC_API_URL` - Backend API URL
- `PUBLIC_SOCKET_URL` - WebSocket server URL

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for development guidelines and standards.

## License

This project is proprietary software owned by WebAsAService.
