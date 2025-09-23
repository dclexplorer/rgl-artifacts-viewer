'use client'

import { useState, useEffect } from 'react'
import { format, formatDistanceToNow } from 'date-fns'
import { CheckCircle, XCircle, Clock, PlayCircle, AlertCircle, Download, GitPullRequest, ExternalLink } from 'lucide-react'
import type { WorkflowRun } from '@/lib/github'
import ArtifactsList from './ArtifactsList'

interface WorkflowRunListProps {
  owner: string
  repo: string
  branch: string | null
}

export default function WorkflowRunList({ owner, repo, branch }: WorkflowRunListProps) {
  const [runs, setRuns] = useState<WorkflowRun[]>([])
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [expandedRun, setExpandedRun] = useState<number | null>(null)

  useEffect(() => {
    fetchRuns()
  }, [owner, repo, branch, page])

  const fetchRuns = async () => {
    setLoading(true)
    try {
      const url = `/api/workflows?owner=${owner}&repo=${repo}&page=${page}${branch ? `&branch=${branch}` : ''}`
      const response = await fetch(url)
      const data = await response.json()
      setRuns(data.workflows || [])
    } catch (error) {
      console.error('Error fetching workflow runs:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: string, conclusion: string | null) => {
    if (status === 'completed') {
      switch (conclusion) {
        case 'success':
          return <CheckCircle className="w-5 h-5 text-green-500" />
        case 'failure':
          return <XCircle className="w-5 h-5 text-red-500" />
        case 'cancelled':
          return <AlertCircle className="w-5 h-5 text-gray-500" />
        default:
          return <AlertCircle className="w-5 h-5 text-yellow-500" />
      }
    } else if (status === 'in_progress') {
      return <PlayCircle className="w-5 h-5 text-blue-500 animate-pulse" />
    } else {
      return <Clock className="w-5 h-5 text-gray-500" />
    }
  }

  const getStatusText = (status: string, conclusion: string | null) => {
    if (status === 'completed') {
      return conclusion || 'completed'
    }
    return status.replace('_', ' ')
  }

  if (loading && runs.length === 0) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {runs.map((run) => {
        const isMain = run.head_branch === 'main'
        const isExpanded = expandedRun === run.id
        
        return (
          <div
            key={run.id}
            className={`border rounded-lg overflow-hidden ${
              isMain 
                ? 'border-green-500 bg-green-50/50 dark:bg-green-900/10' 
                : 'border-gray-200 dark:border-gray-700'
            }`}
          >
            <div
              className="p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
              onClick={() => setExpandedRun(isExpanded ? null : run.id)}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  {getStatusIcon(run.status, run.conclusion)}
                  <div>
                    <h3 className="font-semibold text-lg flex items-center gap-2">
                      {run.display_title || run.name}
                      {isMain && (
                        <span className="text-xs bg-green-500 text-white px-2 py-1 rounded">MAIN</span>
                      )}
                    </h3>
                    <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      <span className="font-medium">{run.head_branch}</span>
                      {run.pull_requests && run.pull_requests.length > 0 && (
                        <>
                          <span className="mx-2">•</span>
                          <span className="inline-flex items-center gap-1">
                            <GitPullRequest className="w-3 h-3" />
                            {run.pull_requests.map((pr, index) => (
                              <span key={pr.number}>
                                {index > 0 && ', '}
                                <a 
                                  href={pr.url} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-blue-500 hover:underline"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  #{pr.number}
                                </a>
                              </span>
                            ))}
                          </span>
                        </>
                      )}
                      <span className="mx-2">•</span>
                      <span>#{run.run_number}</span>
                      <span className="mx-2">•</span>
                      <span>{run.event}</span>
                      <span className="mx-2">•</span>
                      <span className="capitalize">{getStatusText(run.status, run.conclusion)}</span>
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                      {formatDistanceToNow(new Date(run.created_at), { addSuffix: true })}
                      <span className="mx-2">•</span>
                      <span className="font-mono text-xs">{run.head_sha.substring(0, 7)}</span>
                    </div>
                  </div>
                </div>
                <button
                  className="flex items-center gap-2 px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                  onClick={(e) => {
                    e.stopPropagation()
                    setExpandedRun(isExpanded ? null : run.id)
                  }}
                >
                  <Download className="w-4 h-4" />
                  Artifacts
                </button>
              </div>
            </div>
            
            {isExpanded && (
              <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-800/50">
                <ArtifactsList owner={owner} repo={repo} runId={run.id} />
              </div>
            )}
          </div>
        )
      })}
      
      {runs.length > 0 && (
        <div className="flex justify-center gap-2 mt-6">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
            className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded disabled:opacity-50 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            Previous
          </button>
          <span className="px-4 py-2">Page {page}</span>
          <button
            onClick={() => setPage(page + 1)}
            disabled={runs.length < 30}
            className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded disabled:opacity-50 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            Next
          </button>
        </div>
      )}
    </div>
  )
}