'use client'

import { useState, useEffect } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { CheckCircle, XCircle, Clock, PlayCircle, AlertCircle, GitBranch, Rocket } from 'lucide-react'
import type { WorkflowRun } from '@/lib/github'

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
  loading: boolean
  color: string
  bgColor: string
  borderColor: string
}

export default function LatestBuildsMenu({ owner, repo, onSelectBranch, selectedBranch }: LatestBuildsMenuProps) {
  const [builds, setBuilds] = useState<BranchBuild[]>([
    {
      branch: 'release',
      label: 'Release',
      run: null,
      loading: true,
      color: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 dark:hover:bg-purple-900/30',
      borderColor: 'border-purple-200 dark:border-purple-800'
    },
    {
      branch: 'main',
      label: 'Main',
      run: null,
      loading: true,
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30',
      borderColor: 'border-green-200 dark:border-green-800'
    }
  ])

  useEffect(() => {
    fetchLatestBuilds()
  }, [owner, repo])

  const fetchLatestBuilds = async () => {
    const branches = ['release', 'main']

    const updatedBuilds = await Promise.all(
      branches.map(async (branch) => {
        const existingBuild = builds.find(b => b.branch === branch)!
        try {
          const url = `/api/workflows?owner=${owner}&repo=${repo}&branch=${branch}&page=1`
          const response = await fetch(url)
          const data = await response.json()
          const workflows = data.workflows || []
          return {
            ...existingBuild,
            run: workflows.length > 0 ? workflows[0] : null,
            loading: false
          }
        } catch (error) {
          console.error(`Error fetching ${branch} build:`, error)
          return {
            ...existingBuild,
            run: null,
            loading: false
          }
        }
      })
    )

    setBuilds(updatedBuilds)
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

  return (
    <div className="flex flex-wrap gap-3 mb-4">
      {builds.map((build) => {
        const isSelected = selectedBranch === build.branch

        return (
          <button
            key={build.branch}
            onClick={() => onSelectBranch(build.branch)}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg border transition-all ${
              build.bgColor
            } ${build.borderColor} ${
              isSelected ? 'ring-2 ring-offset-2 ring-blue-500' : ''
            }`}
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
        )
      })}
    </div>
  )
}
