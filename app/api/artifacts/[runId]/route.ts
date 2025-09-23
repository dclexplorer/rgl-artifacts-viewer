import { NextRequest, NextResponse } from 'next/server'
import { fetchArtifacts } from '@/lib/github'

export async function GET(
  request: NextRequest,
  { params }: { params: { runId: string } }
) {
  try {
    const searchParams = request.nextUrl.searchParams
    const owner = searchParams.get('owner') || 'decentraland'
    const repo = searchParams.get('repo') || 'godot-explorer'
    const runId = parseInt(params.runId)
    
    if (isNaN(runId)) {
      return NextResponse.json(
        { error: 'Invalid run ID' },
        { status: 400 }
      )
    }
    
    const artifacts = await fetchArtifacts(owner, repo, runId)
    
    return NextResponse.json({ artifacts }, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600'
      }
    })
  } catch (error) {
    console.error('Error fetching artifacts:', error)
    return NextResponse.json(
      { error: 'Failed to fetch artifacts' },
      { status: 500 }
    )
  }
}