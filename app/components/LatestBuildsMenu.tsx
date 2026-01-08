'use client'

import { useState, useEffect } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { CheckCircle, XCircle, Clock, PlayCircle, AlertCircle, GitBranch, Rocket, Download } from 'lucide-react'
import type { WorkflowRun, Artifact } from '@/lib/github'

interface LatestBuildsMenuProps {
  owner: string
  repo: string
  onSelectBranch: (branch: string) => void
  selectedBranch: string | null
}

interface BranchBuild {
  branch: string
  label: string
  run: WorkflowRun | null
  apkArtifact: Artifact | null
  loading: boolean
  color: string
  bgColor: string
  borderColor: string
  buttonColor: string
}

export default function LatestBuildsMenu({ owner, repo, onSelectBranch, selectedBranch }: LatestBuildsMenuProps) {
  const [builds, setBuilds] = useState<BranchBuild[]>([
    {
      branch: 'release',
      label: 'Release (Release Candidate)',
      run: null,
      apkArtifact: null,
      loading: true,
      color: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
      borderColor: 'border-purple-200 dark:border-purple-800',
      buttonColor: 'bg-purple-500 hover:bg-purple-600'
    },
    {
      branch: 'main',
      label: 'Main (Staging)',
      run: null,
      apkArtifact: null,
      loading: true,
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      borderColor: 'border-green-200 dark:border-green-800',
      buttonColor: 'bg-green-500 hover:bg-green-600'
    }
  ])
  const [downloading, setDownloading] = useState<string | null>(null)

  useEffect(() => {
    fetchLatestBuilds()
  }, [owner, repo])

  const fetchLatestBuilds = async () => {
    const branches = ['release', 'main']

    const updatedBuilds = await Promise.all(
      branches.map(async (branch) => {
        const existingBuild = builds.find(b => b.branch === branch)!
        try {
          // Fetch latest workflow runs
          const workflowUrl = `/api/workflows?owner=${owner}&repo=${repo}&branch=${branch}&page=1`
          const workflowResponse = await fetch(workflowUrl)
          const workflowData = await workflowResponse.json()
          const workflows: WorkflowRun[] = workflowData.workflows || []
          const latestRun = workflows.length > 0 ? workflows[0] : null

          // Find the latest completed run that has AndroidAPK artifact
          let apkArtifact: Artifact | null = null
          const completedRuns = workflows.filter((w: WorkflowRun) => w.status === 'completed')

          // Check each completed run for AndroidAPK artifact (most recent first)
          for (const run of completedRuns) {
            try {
              const artifactsUrl = `/api/artifacts/${run.id}?owner=${owner}&repo=${repo}`
              const artifactsResponse = await fetch(artifactsUrl)
              const artifactsData = await artifactsResponse.json()
              const artifacts = artifactsData.artifacts || []
              // Find AndroidAPK artifact that is not expired
              const apk = artifacts.find((a: Artifact) => a.name === 'AndroidAPK')
              if (apk && apk.expires_at) {
                const expiresAt = new Date(apk.expires_at)
                if (expiresAt > new Date()) {
                  apkArtifact = apk
                  break // Found a valid APK, stop searching
                }
              }
            } catch (error) {
              console.error(`Error fetching artifacts for run ${run.id}:`, error)
            }
          }

          return {
            ...existingBuild,
            run: latestRun,
            apkArtifact,
            loading: false
          }
        } catch (error) {
          console.error(`Error fetching ${branch} build:`, error)
          return {
            ...existingBuild,
            run: null,
            apkArtifact: null,
            loading: false
          }
        }
      })
    )

    setBuilds(updatedBuilds)
  }

  const handleDownloadAPK = async (artifact: Artifact, branch: string) => {
    setDownloading(branch)
    try {
      const response = await fetch(`/api/download/${artifact.id}?owner=${owner}&repo=${repo}`)
      const data = await response.json()

      if (!response.ok) {
        if (data.error?.includes('token')) {
          alert('GitHub authentication required to download artifacts.')
        } else {
          alert(`Download failed: ${data.error || 'Unknown error'}`)
        }
        return
      }

      if (data.downloadUrl) {
        window.open(data.downloadUrl, '_blank')
      }
    } catch (error) {
      console.error('Error downloading APK:', error)
      alert('Failed to download APK. Please try again.')
    } finally {
      setDownloading(null)
    }
  }

  const getStatusIcon = (status: string, conclusion: string | null) => {
    if (status === 'completed') {
      switch (conclusion) {
        case 'success':
          return <CheckCircle className="w-4 h-4 text-green-500" />
        case 'failure':
          return <XCircle className="w-4 h-4 text-red-500" />
        case 'cancelled':
          return <AlertCircle className="w-4 h-4 text-gray-500" />
        default:
          return <AlertCircle className="w-4 h-4 text-yellow-500" />
      }
    } else if (status === 'in_progress') {
      return <PlayCircle className="w-4 h-4 text-blue-500 animate-pulse" />
    } else {
      return <Clock className="w-4 h-4 text-gray-500" />
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }

  return (
    <div className="flex flex-wrap gap-4">
      {builds.map((build) => {
        const isSelected = selectedBranch === build.branch
        const isDownloading = downloading === build.branch

        return (
          <div
            key={build.branch}
            className={`flex flex-col rounded-lg border overflow-hidden ${build.borderColor} ${
              isSelected ? 'ring-2 ring-offset-2 ring-blue-500' : ''
            }`}
          >
            {/* Clickable header */}
            <button
              onClick={() => onSelectBranch(build.branch)}
              className={`flex items-center gap-3 px-4 py-3 transition-all ${build.bgColor} hover:opacity-80`}
            >
              <div className="flex items-center gap-2">
                {build.branch === 'release' ? (
                  <Rocket className={`w-5 h-5 ${build.color}`} />
                ) : (
                  <GitBranch className={`w-5 h-5 ${build.color}`} />
                )}
                <span className={`font-semibold ${build.color}`}>{build.label}</span>
              </div>

              {build.loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400"></div>
              ) : build.run ? (
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  {getStatusIcon(build.run.status, build.run.conclusion)}
                  <span className="font-mono text-xs">{build.run.head_sha.substring(0, 7)}</span>
                  <span className="text-xs">
                    {formatDistanceToNow(new Date(build.run.created_at), { addSuffix: true })}
                  </span>
                </div>
              ) : (
                <span className="text-xs text-gray-500">No builds</span>
              )}
            </button>

            {/* APK Download button */}
            {build.apkArtifact && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleDownloadAPK(build.apkArtifact!, build.branch)
                }}
                disabled={isDownloading}
                className={`flex items-center justify-center gap-2 px-4 py-2 text-sm text-white ${build.buttonColor} disabled:opacity-50 transition-colors`}
              >
                {isDownloading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Downloading...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    Download Latest APK
                    <span className="text-xs opacity-75">({formatFileSize(build.apkArtifact.size_in_bytes)})</span>
                  </>
                )}
              </button>
            )}
          </div>
        )
      })}
    </div>
  )
}
