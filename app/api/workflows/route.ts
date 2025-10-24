import { NextRequest, NextResponse } from 'next/server'
import { fetchWorkflowRuns, EXCLUDED_WORKFLOWS } from '@/lib/github'

function shouldExcludeWorkflow(workflowName: string): boolean {
  const lowerName = workflowName.toLowerCase()
  return EXCLUDED_WORKFLOWS.some(excluded =>
    lowerName.includes(excluded.toLowerCase())
  )
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
      !shouldExcludeWorkflow(workflow.name)
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