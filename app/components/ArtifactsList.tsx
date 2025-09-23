'use client'

import { useState, useEffect } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { Download, FileArchive, ExternalLink } from 'lucide-react'
import type { Artifact } from '@/lib/github'

interface ArtifactsListProps {
  owner: string
  repo: string
  runId: number
  commitSha?: string
}

export default function ArtifactsList({ owner, repo, runId, commitSha }: ArtifactsListProps) {
  const [artifacts, setArtifacts] = useState<Artifact[]>([])
  const [loading, setLoading] = useState(false)
  const [downloading, setDownloading] = useState<number | null>(null)

  useEffect(() => {
    fetchArtifacts()
  }, [owner, repo, runId])

  const fetchArtifacts = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/artifacts/${runId}?owner=${owner}&repo=${repo}`)
      const data = await response.json()
      setArtifacts(data.artifacts || [])
    } catch (error) {
      console.error('Error fetching artifacts:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }

  const handleDownload = async (artifactId: number, artifactName: string) => {
    setDownloading(artifactId)
    try {
      const response = await fetch(`/api/download/${artifactId}?owner=${owner}&repo=${repo}`)
      const data = await response.json()
      
      if (!response.ok) {
        // Show specific error message
        if (data.error?.includes('token')) {
          alert('GitHub authentication required!\n\nTo download artifacts, you need to set up a GitHub Personal Access Token.\n\n1. Create a token at: https://github.com/settings/tokens\n2. Add it to your .env.local file as GITHUB_TOKEN\n3. Restart the server')
        } else {
          alert(`Download failed: ${data.error || 'Unknown error'}`)
        }
        return
      }
      
      if (data.downloadUrl) {
        // Open download URL in new tab since direct download might be blocked by CORS
        window.open(data.downloadUrl, '_blank')
      }
    } catch (error) {
      console.error('Error downloading artifact:', error)
      alert('Failed to download artifact. Please try again.')
    } finally {
      setDownloading(null)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  // Check if this is Bevy Explorer and add the Web artifact
  const isBevyExplorer = owner === 'decentraland' && repo === 'bevy-explorer'
  const hasWebArtifact = isBevyExplorer && commitSha
  
  if (artifacts.length === 0 && !hasWebArtifact) {
    return (
      <div className="text-center text-gray-500 dark:text-gray-400 py-4">
        No artifacts found for this workflow run.
      </div>
    )
  }

  const totalArtifactsCount = hasWebArtifact ? artifacts.length + 1 : artifacts.length

  return (
    <div className="space-y-3">
      <h4 className="font-medium text-sm text-gray-700 dark:text-gray-300">
        Available Artifacts ({totalArtifactsCount})
      </h4>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {/* Special Web artifact for Bevy Explorer */}
        {hasWebArtifact && (
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 hover:shadow-md transition-shadow">
            <div className="flex items-start gap-3">
              <ExternalLink className="w-5 h-5 text-gray-500 mt-1" />
              <div className="flex-1 min-w-0">
                <h5 className="font-medium text-sm" title="Web Deployment">
                  Web
                </h5>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  <div>Live deployment</div>
                  <div className="text-blue-600 dark:text-blue-400">
                    Opens in browser
                  </div>
                </div>
              </div>
            </div>
            <a
              href={`https://bevy-web.kuruk.net/${commitSha}/index.html?systemScene=https://dclexplorer.github.io/bevy-ui-scene/BevyUiScene`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 w-full flex items-center justify-center gap-2 px-3 py-1.5 text-sm bg-green-500 text-white rounded hover:bg-green-600"
            >
              <ExternalLink className="w-4 h-4" />
              Open Web
            </a>
          </div>
        )}
        
        {artifacts.map((artifact) => (
          <div
            key={artifact.id}
            className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start gap-3">
              <FileArchive className="w-5 h-5 text-gray-500 mt-1" />
              <div className="flex-1 min-w-0">
                <h5 className="font-medium text-sm truncate" title={artifact.name}>
                  {artifact.name}
                </h5>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  <div>{formatFileSize(artifact.size_in_bytes)}</div>
                  <div>
                    Created {formatDistanceToNow(new Date(artifact.created_at), { addSuffix: true })}
                  </div>
                  {artifact.expires_at && (
                    <div className="text-yellow-600 dark:text-yellow-500">
                      Expires {formatDistanceToNow(new Date(artifact.expires_at), { addSuffix: true })}
                    </div>
                  )}
                </div>
              </div>
            </div>
            <button
              onClick={() => handleDownload(artifact.id, artifact.name)}
              disabled={downloading === artifact.id}
              className="mt-3 w-full flex items-center justify-center gap-2 px-3 py-1.5 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {downloading === artifact.id ? (
                <>
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                  Downloading...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  Download
                </>
              )}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}