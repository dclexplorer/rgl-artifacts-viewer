import { NextRequest, NextResponse } from 'next/server'
import { fetchOpenPullRequests } from '@/lib/github'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const owner = searchParams.get('owner') || 'decentraland'
    const repo = searchParams.get('repo') || 'godot-explorer'
    
    const pulls = await fetchOpenPullRequests(owner, repo)
    
    return NextResponse.json({ pulls }, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120'
      }
    })
  } catch (error) {
    console.error('Error fetching pull requests:', error)
    return NextResponse.json(
      { error: 'Failed to fetch pull requests' },
      { status: 500 }
    )
  }
}