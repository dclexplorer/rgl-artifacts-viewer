import { NextRequest, NextResponse } from 'next/server'
import { fetchWorkflowRuns, EXCLUDED_WORKFLOWS, getRepositoryConfig, type WorkflowRun } from '@/lib/github'

function shouldExcludeWorkflow(
  workflow: WorkflowRun,
  owner: string,
  repo: string
): boolean {
  const repoConfig = getRepositoryConfig(owner, repo)

  // Priority 1: Filter by workflow ID (most reliable)
  if (repoConfig?.allowedWorkflowIds && repoConfig.allowedWorkflowIds.length > 0) {
    if (!repoConfig.allowedWorkflowIds.includes(workflow.workflow_id)) {
      return true
    }
  }

  const lowerName = workflow.name.toLowerCase()

  // Priority 2: Check global exclusions by name
  const globalExcluded = EXCLUDED_WORKFLOWS.some(excluded =>
    lowerName.includes(excluded.toLowerCase())
  )
  if (globalExcluded) return true

  // Priority 3: Check per-repo name-based configuration
  if (repoConfig) {
    // If includedWorkflows is set, only include those
    if (repoConfig.includedWorkflows && repoConfig.includedWorkflows.length > 0) {
      const isIncluded = repoConfig.includedWorkflows.some(included =>
        lowerName.includes(included.toLowerCase())
      )
      if (!isIncluded) return true
    }

    // Check repo-specific exclusions
    if (repoConfig.excludedWorkflows && repoConfig.excludedWorkflows.length > 0) {
      const isExcluded = repoConfig.excludedWorkflows.some(excluded =>
        lowerName.includes(excluded.toLowerCase())
      )
      if (isExcluded) return true
    }
  }

  return false
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const owner = searchParams.get('owner') || 'decentraland'
    const repo = searchParams.get('repo') || 'godot-explorer'
    const branch = searchParams.get('branch') || undefined
    const page = parseInt(searchParams.get('page') || '1')

    const allWorkflows = await fetchWorkflowRuns(owner, repo, branch, page)

    // Filter out excluded workflows
    const workflows = allWorkflows.filter(workflow =>
      !shouldExcludeWorkflow(workflow, owner, repo)
    )

    return NextResponse.json({ workflows }, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120'
      }
    })
  } catch (error) {
    console.error('Error fetching workflows:', error)
    return NextResponse.json(
      { error: 'Failed to fetch workflows' },
      { status: 500 }
    )
  }
}