interface GitHubRepository {
  owner: string
  repo: string
  displayName: string
}

export const REPOSITORIES: GitHubRepository[] = [
  { owner: 'decentraland', repo: 'godot-explorer', displayName: 'Godot Explorer' },
  { owner: 'decentraland', repo: 'bevy-explorer', displayName: 'Bevy Explorer' }
]

export interface WorkflowRun {
  id: number
  name: string
  head_branch: string
  head_sha: string
  status: string
  conclusion: string | null
  workflow_id: number
  check_suite_id: number
  created_at: string
  updated_at: string
  run_number: number
  event: string
  display_title: string
  repository: {
    full_name: string
  }
  pull_requests?: Array<{
    number: number
    url: string
  }>
}

export interface PullRequest {
  id: number
  number: number
  title: string
  state: string
  html_url: string
  user: {
    login: string
    avatar_url: string
  }
  created_at: string
  updated_at: string
  head: {
    ref: string
    sha: string
  }
  base: {
    ref: string
  }
  draft: boolean
}

export interface Artifact {
  id: number
  name: string
  size_in_bytes: number
  created_at: string
  expires_at: string
  archive_download_url: string
  workflow_run?: {
    id: number
    repository_id: number
    head_branch: string
  }
}

const GITHUB_API_BASE = 'https://api.github.com'
const GITHUB_TOKEN = process.env.GITHUB_TOKEN

export async function fetchWorkflowRuns(
  owner: string, 
  repo: string, 
  branch?: string,
  page: number = 1,
  perPage: number = 30
) {
  const url = new URL(`${GITHUB_API_BASE}/repos/${owner}/${repo}/actions/runs`)
  
  url.searchParams.append('per_page', perPage.toString())
  url.searchParams.append('page', page.toString())
  
  if (branch) {
    url.searchParams.append('branch', branch)
  }
  
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  url.searchParams.append('created', `>=${thirtyDaysAgo.toISOString()}`)
  
  const headers: HeadersInit = {
    'Accept': 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28'
  }
  
  if (GITHUB_TOKEN) {
    headers['Authorization'] = `Bearer ${GITHUB_TOKEN}`
  }
  
  const response = await fetch(url.toString(), { headers })
  
  if (!response.ok) {
    throw new Error(`GitHub API error: ${response.status}`)
  }
  
  const data = await response.json()
  return data.workflow_runs as WorkflowRun[]
}

export async function fetchArtifacts(
  owner: string,
  repo: string,
  runId: number
) {
  const url = `${GITHUB_API_BASE}/repos/${owner}/${repo}/actions/runs/${runId}/artifacts`
  
  const headers: HeadersInit = {
    'Accept': 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28'
  }
  
  if (GITHUB_TOKEN) {
    headers['Authorization'] = `Bearer ${GITHUB_TOKEN}`
  }
  
  const response = await fetch(url, { headers })
  
  if (!response.ok) {
    throw new Error(`GitHub API error: ${response.status}`)
  }
  
  const data = await response.json()
  return data.artifacts as Artifact[]
}

export async function getArtifactDownloadUrl(
  owner: string,
  repo: string,
  artifactId: number
): Promise<string> {
  const url = `${GITHUB_API_BASE}/repos/${owner}/${repo}/actions/artifacts/${artifactId}/zip`
  
  const headers: HeadersInit = {
    'Accept': 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28'
  }
  
  if (GITHUB_TOKEN) {
    headers['Authorization'] = `Bearer ${GITHUB_TOKEN}`
  }
  
  // For artifact downloads, GitHub requires authentication
  if (!GITHUB_TOKEN) {
    throw new Error('GitHub token is required to download artifacts. Please set GITHUB_TOKEN environment variable.')
  }
  
  const response = await fetch(url, {
    headers,
    redirect: 'manual'
  })
  
  // GitHub returns a 302 redirect with the download URL in the Location header
  if (response.status === 302) {
    const location = response.headers.get('location')
    if (location) {
      return location
    }
  }
  
  // If we get a 403, it's likely a permissions issue
  if (response.status === 403) {
    throw new Error('Access denied. Make sure your GitHub token has the required permissions.')
  }
  
  // If we get a 404, the artifact might not exist or be expired
  if (response.status === 404) {
    throw new Error('Artifact not found. It may have been deleted or expired.')
  }
  
  throw new Error(`Failed to get download URL. Status: ${response.status}`)
}

export async function fetchBranches(owner: string, repo: string) {
  const url = `${GITHUB_API_BASE}/repos/${owner}/${repo}/branches`
  
  const headers: HeadersInit = {
    'Accept': 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28'
  }
  
  if (GITHUB_TOKEN) {
    headers['Authorization'] = `Bearer ${GITHUB_TOKEN}`
  }
  
  const response = await fetch(url, { headers })
  
  if (!response.ok) {
    throw new Error(`GitHub API error: ${response.status}`)
  }
  
  const branches = await response.json()
  return branches.map((b: any) => b.name) as string[]
}

export async function fetchOpenPullRequests(
  owner: string,
  repo: string
): Promise<PullRequest[]> {
  const url = `${GITHUB_API_BASE}/repos/${owner}/${repo}/pulls?state=open&per_page=100`
  
  const headers: HeadersInit = {
    'Accept': 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28'
  }
  
  if (GITHUB_TOKEN) {
    headers['Authorization'] = `Bearer ${GITHUB_TOKEN}`
  }
  
  const response = await fetch(url, { headers })
  
  if (!response.ok) {
    throw new Error(`GitHub API error: ${response.status}`)
  }
  
  return await response.json() as PullRequest[]
}