'use client'

import { useState, useEffect } from 'react'
import { ChevronDown, GitPullRequest, ExternalLink } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import type { PullRequest } from '@/lib/github'

interface PRSelectorProps {
  selectedPR: PullRequest | null
  selectedBranch: string | null
  onSelectPR: (pr: PullRequest | null) => void
  onSelectBranch: (branch: string | null) => void
  owner: string
  repo: string
}

export default function PRSelector({ 
  selectedPR, 
  selectedBranch,
  onSelectPR, 
  onSelectBranch,
  owner, 
  repo 
}: PRSelectorProps) {
  const [pullRequests, setPullRequests] = useState<PullRequest[]>([])
  const [loading, setLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    fetchPullRequests()
  }, [owner, repo])

  const fetchPullRequests = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/pulls?owner=${owner}&repo=${repo}`)
      const data = await response.json()
      setPullRequests(data.pulls || [])
    } catch (error) {
      console.error('Error fetching pull requests:', error)
    } finally {
      setLoading(false)
    }
  }

  const displayValue = selectedPR 
    ? `PR #${selectedPR.number}: ${selectedPR.title}` 
    : selectedBranch 
      ? selectedBranch === 'main' ? 'Main branch' : selectedBranch
      : 'All workflow runs'

  return (
    <div className="relative mb-6">
      <label className="block text-sm font-medium mb-2">
        Filter by Pull Request or Branch
      </label>
      <div className="flex gap-2">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`flex-1 px-3 py-2 border rounded-md flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 ${
            selectedBranch === 'main' ? 'border-green-500 bg-green-50 dark:bg-green-900/20' : 'border-gray-300 dark:border-gray-700'
          }`}
        >
          <span className="flex items-center gap-2 truncate">
            {selectedPR && <GitPullRequest className="w-4 h-4" />}
            <span className="truncate">{displayValue}</span>
            {selectedBranch === 'main' && (
              <span className="text-xs bg-green-500 text-white px-2 py-1 rounded">MAIN</span>
            )}
          </span>
          <ChevronDown className={`w-4 h-4 transition-transform flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
        </button>
        
        {selectedPR && (
          <a
            href={selectedPR.html_url}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
            title="Open PR on GitHub"
          >
            <ExternalLink className="w-4 h-4" />
            View PR
          </a>
        )}
      </div>
      
      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md shadow-lg max-h-96 overflow-auto">
          <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
            <button
              onClick={() => {
                onSelectPR(null)
                onSelectBranch(null)
                setIsOpen(false)
              }}
              className="w-full px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 font-medium"
            >
              All workflow runs
            </button>
            <button
              onClick={() => {
                onSelectPR(null)
                onSelectBranch('main')
                setIsOpen(false)
              }}
              className="w-full px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-between bg-green-50 dark:bg-green-900/20"
            >
              <span>Main branch</span>
              <span className="text-xs bg-green-500 text-white px-2 py-1 rounded">MAIN</span>
            </button>
          </div>
          
          {pullRequests.length > 0 && (
            <>
              <div className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider bg-gray-50 dark:bg-gray-900">
                Open Pull Requests ({pullRequests.length})
              </div>
              {pullRequests.map((pr) => (
                <button
                  key={pr.id}
                  onClick={() => {
                    onSelectPR(pr)
                    onSelectBranch(pr.head.ref)
                    setIsOpen(false)
                  }}
                  className="w-full px-3 py-3 text-left hover:bg-gray-100 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-800"
                >
                  <div className="flex items-start gap-2">
                    <GitPullRequest className="w-4 h-4 mt-0.5 text-gray-500" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">#{pr.number}</span>
                        {pr.draft && (
                          <span className="text-xs bg-gray-500 text-white px-1.5 py-0.5 rounded">DRAFT</span>
                        )}
                      </div>
                      <div className="text-sm truncate">{pr.title}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        <span>{pr.head.ref}</span>
                        <span className="mx-1">→</span>
                        <span>{pr.base.ref}</span>
                        <span className="mx-2">•</span>
                        <span>by {pr.user.login}</span>
                        <span className="mx-2">•</span>
                        <span>{formatDistanceToNow(new Date(pr.created_at), { addSuffix: true })}</span>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </>
          )}
          
          {loading && (
            <div className="px-3 py-4 text-center text-gray-500">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500 mx-auto"></div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}