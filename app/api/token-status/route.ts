import { NextResponse } from 'next/server'

const GITHUB_API_BASE = 'https://api.github.com'
const GITHUB_TOKEN = process.env.GITHUB_TOKEN

export async function GET() {
  try {
    // Check if token exists
    if (!GITHUB_TOKEN) {
      return NextResponse.json({
        status: 'missing',
        message: 'GitHub token is not configured. Artifact downloads will not work.'
      })
    }

    // Validate token by making a simple API call
    const response = await fetch(`${GITHUB_API_BASE}/user`, {
      headers: {
        'Accept': 'application/vnd.github+json',
        'Authorization': `Bearer ${GITHUB_TOKEN}`,
        'X-GitHub-Api-Version': '2022-11-28'
      }
    })

    if (response.status === 401) {
      return NextResponse.json({
        status: 'invalid',
        message: 'GitHub token is invalid or expired. Please update your token.'
      })
    }

    if (response.status === 403) {
      return NextResponse.json({
        status: 'forbidden',
        message: 'GitHub token does not have required permissions. Ensure it has "public_repo" or "repo" scope.'
      })
    }

    if (!response.ok) {
      return NextResponse.json({
        status: 'error',
        message: `GitHub API returned error: ${response.status}`
      })
    }

    // Token is valid
    return NextResponse.json({
      status: 'valid',
      message: 'GitHub token is configured and working.'
    })

  } catch (error: any) {
    console.error('Error validating GitHub token:', error)
    return NextResponse.json({
      status: 'error',
      message: 'Failed to validate GitHub token.'
    })
  }
}
