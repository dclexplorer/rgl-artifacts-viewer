# GitHub Artifacts Viewer

A Vercel app for viewing and downloading GitHub Actions artifacts from Decentraland repositories. Perfect for Product Managers to access and test build artifacts.

## Features

- 📦 View workflow runs and their artifacts
- 🔀 Filter by open Pull Requests or branches
- 🔗 Direct links to view PRs on GitHub
- 🌿 Main branch highlighted separately
- 📅 Shows builds from the last 30 days
- ⬇️ Direct download links for artifacts
- 🔄 Real-time status updates
- 🏷️ Multi-project support (ready for expansion)

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Vercel account (for deployment)
- **GitHub Personal Access Token** (required for downloading artifacts)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd rgl-artifacts-viewer
```

2. Install dependencies:
```bash
npm install
```

3. **Required: Set up GitHub token for artifact downloads**:
```bash
cp .env.example .env.local
```

Edit `.env.local` and add your GitHub token:
```
GITHUB_TOKEN=your_github_token_here
```

To create a GitHub token:
- Go to https://github.com/settings/tokens
- Click "Generate new token (classic)"
- Give it a name (e.g., "Artifacts Viewer")
- Select scopes: `repo` (for private repos) or `public_repo` (for public repos only)
- Generate and copy the token

4. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## Deployment to Vercel

### Option 1: Deploy via Vercel CLI

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Deploy:
```bash
vercel
```

### Option 2: Deploy via GitHub

1. Push your code to GitHub
2. Import the project in [Vercel Dashboard](https://vercel.com/new)
3. Configure environment variables (optional):
   - `GITHUB_TOKEN`: Personal access token for higher rate limits

## Configuration

### Environment Variables

- `GITHUB_TOKEN` (**required for downloads**): GitHub Personal Access Token
  - Required for downloading artifacts from GitHub Actions
  - Without token: Can view workflows but cannot download artifacts
  - With token: Full functionality including downloads
  - For public repos: Use `public_repo` scope
  - For private repos: Use `repo` scope
  - Also increases API rate limits (60 → 5000 requests/hour)

### Adding New Projects

To add new repositories, edit `lib/github.ts`:

```typescript
export const REPOSITORIES: GitHubRepository[] = [
  { owner: 'decentraland', repo: 'godot-explorer', displayName: 'Godot Explorer' },
  // Add new repositories here
  { owner: 'decentraland', repo: 'new-repo', displayName: 'New Repository' }
]
```

## Architecture

- **Framework**: Next.js 15 with TypeScript
- **API**: Vercel Functions for GitHub API integration
- **Styling**: Tailwind CSS
- **Deployment**: Vercel Platform

### API Endpoints

- `/api/workflows` - List workflow runs
- `/api/artifacts/[runId]` - Get artifacts for a workflow run
- `/api/download/[artifactId]` - Generate download URLs
- `/api/branches` - List repository branches

## Features Details

### Pull Request & Branch Filtering
- Filter by open Pull Requests to see PR-specific builds
- Direct links to view PRs on GitHub
- Filter by specific branch or view all workflow runs
- "main" branch highlighted with special MAIN badge
- Shows PR numbers in workflow run listings when applicable

### Artifact Management
- View all artifacts from workflow runs
- File size and creation time display
- Expiration warnings
- Direct download with progress indication

### Performance
- API response caching
- Pagination for large result sets
- Optimized for public repository access

## License

MIT# rgl-artifacts-viewer
# rgl-artifacts-viewer
# rgl-artifacts-viewer
