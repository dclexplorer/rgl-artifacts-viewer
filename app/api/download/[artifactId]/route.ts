import { NextRequest, NextResponse } from 'next/server'
import { getArtifactDownloadUrl } from '@/lib/github'

export async function GET(
  request: NextRequest,
  { params }: { params: { artifactId: string } }
) {
  try {
    const searchParams = request.nextUrl.searchParams
    const owner = searchParams.get('owner') || 'decentraland'
    const repo = searchParams.get('repo') || 'godot-explorer'
    const artifactId = parseInt(params.artifactId)
    
    if (isNaN(artifactId)) {
      return NextResponse.json(
        { error: 'Invalid artifact ID' },
        { status: 400 }
      )
    }
    
    const downloadUrl = await getArtifactDownloadUrl(owner, repo, artifactId)
    
    return NextResponse.json({ downloadUrl })
  } catch (error: any) {
    console.error('Error getting download URL:', error)
    
    // Return more specific error messages
    const errorMessage = error.message || 'Failed to get download URL'
    const statusCode = errorMessage.includes('token') ? 401 : 
                      errorMessage.includes('Access denied') ? 403 :
                      errorMessage.includes('not found') ? 404 : 500
    
    return NextResponse.json(
      { error: errorMessage },
      { status: statusCode }
    )
  }
}