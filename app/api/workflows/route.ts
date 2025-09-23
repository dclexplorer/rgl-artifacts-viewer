import { NextRequest, NextResponse } from 'next/server'
import { fetchWorkflowRuns } from '@/lib/github'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const owner = searchParams.get('owner') || 'decentraland'
    const repo = searchParams.get('repo') || 'godot-explorer'
    const branch = searchParams.get('branch') || undefined
    const page = parseInt(searchParams.get('page') || '1')
    
    const workflows = await fetchWorkflowRuns(owner, repo, branch, page)
    
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