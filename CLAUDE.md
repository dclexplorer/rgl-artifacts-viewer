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
- **LatestBuildsMenu**: Quick access buttons for release and main branches at top
- **PRSelector**: Filters by open PRs or branches, includes "View PR" link
- **WorkflowRunList**: Displays runs with embedded PR links
- **ArtifactsList**: Shows downloadable artifacts for workflow runs

### Special Behaviors

#### Quick Access Menu
The top of the page shows quick access buttons for:
- **Release branch**: Purple styling, shows latest release build status
- **Main branch**: Green styling, shows latest main build status

Clicking these buttons filters the workflow list to that branch.

#### Authentication
- GitHub token is **required** for artifact downloads (even from public repos - GitHub API limitation)
- Without token: Can view workflows but cannot download
- Token setup via environment variable `GITHUB_TOKEN`

## Repository Configuration

Currently configured for **Godot Explorer** only. Edit `/lib/github.ts` to modify:

```typescript
export const REPOSITORIES: GitHubRepository[] = [
  {
    owner: 'decentraland',
    repo: 'godot-explorer',
    displayName: 'Godot Explorer',
    excludedWorkflows: ['ios build']  // Per-repo workflow filtering
  }
]
```

### Filtering Workflows

#### Global Exclusions
To hide certain workflows globally (e.g., maintenance workflows), edit `/lib/github.ts`:
```typescript
export const EXCLUDED_WORKFLOWS = [
  'sync branch deletion',  // Case-insensitive partial match
]
```

#### Per-Repository Filtering
Each repository can have its own workflow filters:
- `excludedWorkflows`: Array of workflow name patterns to hide
- `includedWorkflows`: Array of workflow name patterns to show (excludes all others)

The filter performs case-insensitive partial matching on workflow names.

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

- **Branch badges**: Main branch (green MAIN badge), Release branch (purple RELEASE badge)
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