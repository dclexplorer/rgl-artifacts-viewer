# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

GitHub Artifacts Viewer - A Vercel app for viewing and downloading GitHub Actions artifacts from Decentraland repositories, designed for Product Managers to access and test build artifacts.

## Commands

```bash
# Development
npm run dev          # Start development server on http://localhost:3000

# Build
npm run build        # Build production bundle
npm run start        # Start production server

# Linting
npm run lint         # Run ESLint
```

## Architecture

### Tech Stack
- **Framework**: Next.js 15 with App Router and TypeScript
- **API**: Vercel Functions (serverless)
- **Styling**: Tailwind CSS with dark mode support
- **Deployment**: Vercel Platform

### Key Design Patterns

#### API Layer (`/app/api/`)
All GitHub API calls are proxied through Vercel Functions to:
- Avoid CORS issues
- Handle authentication centrally
- Implement caching headers
- Transform responses

Routes follow Next.js 15 conventions with `Promise<params>` for dynamic routes.

#### Component Architecture
- **Client Components** (`'use client'`): All interactive UI components
- **ProjectTabs**: Repository switcher using button tabs (not dropdown)
- **PRSelector**: Filters by open PRs or branches, includes "View PR" link
- **WorkflowRunList**: Displays runs with embedded PR links
- **ArtifactsList**: Shows artifacts with special handling for Bevy Explorer

### Special Behaviors

#### Bevy Explorer Web Artifact
When viewing Bevy Explorer builds, a special "Web" artifact is automatically added that:
- Links to `https://bevy-web.kuruk.net/{commitSha}/index.html?systemScene=https://dclexplorer.github.io/bevy-ui-scene/BevyUiScene`
- Shows even when no other artifacts exist
- Uses green "Open Web" button instead of blue "Download"

#### Authentication
- GitHub token is **required** for artifact downloads (even from public repos - GitHub API limitation)
- Without token: Can view workflows but cannot download
- Token setup via environment variable `GITHUB_TOKEN`

## Repository Configuration

### Adding New Repositories
Edit `/lib/github.ts`:
```typescript
export const REPOSITORIES: GitHubRepository[] = [
  { owner: 'decentraland', repo: 'godot-explorer', displayName: 'Godot Explorer' },
  { owner: 'decentraland', repo: 'bevy-explorer', displayName: 'Bevy Explorer' },
  // Add new repos here
]
```

### Environment Variables
- `GITHUB_TOKEN`: Personal Access Token (required for downloads)
  - Public repos: `public_repo` scope
  - Private repos: `repo` scope

## API Endpoints

- `/api/workflows` - List workflow runs (30-day filter built-in)
- `/api/pulls` - List open pull requests
- `/api/artifacts/[runId]` - Get artifacts for a workflow run
- `/api/download/[artifactId]` - Generate temporary download URL
- `/api/branches` - List repository branches

All endpoints support caching headers and handle GitHub API rate limiting.

## UI/UX Conventions

- **MAIN label**: Main branch is highlighted with green badge
- **PR filtering**: Shows only open PRs, includes draft indicator
- **Workflow status icons**: Animated for in-progress builds
- **Download behavior**: Opens in new tab to avoid CORS issues
- **Date filtering**: Automatically filters builds > 30 days old

## Performance Optimizations

- API responses cached: workflows (60s), branches (1hr), artifacts (5min)
- Pagination: 30 items per page for workflow runs
- Text truncation: Long PR titles use CSS truncate
- Responsive layout: Mobile-first with Tailwind breakpoints

## Common Issues & Solutions

1. **"GitHub token required" error**: Add token to `.env.local` or Vercel environment variables
2. **Vercel deployment fails**: Ensure no `env` section in vercel.json (use dashboard for env vars)
3. **Long PR titles overflow**: Already handled with `truncate` and `min-w-0` classes
4. **No artifacts showing**: Check if builds are within 30-day window