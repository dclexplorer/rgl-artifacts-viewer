'use client'

import { useState } from 'react'
import { RefreshCw, GitBranch, Package, GitPullRequest } from 'lucide-react'
import ProjectTabs from './components/ProjectTabs'
import PRSelector from './components/PRSelector'
import WorkflowRunList from './components/WorkflowRunList'
import GitHubTokenWarning from './components/GitHubTokenWarning'
import { REPOSITORIES } from '@/lib/github'
import type { PullRequest } from '@/lib/github'

export default function Home() {
  const [selectedProject, setSelectedProject] = useState({
    owner: REPOSITORIES[0].owner,
    repo: REPOSITORIES[0].repo
  })
  const [selectedBranch, setSelectedBranch] = useState<string | null>(null)
  const [selectedPR, setSelectedPR] = useState<PullRequest | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  const handleProjectChange = (owner: string, repo: string) => {
    setSelectedProject({ owner, repo })
    setSelectedBranch(null)
    setSelectedPR(null)
  }

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1)
  }

  const currentRepo = REPOSITORIES.find(
    r => r.owner === selectedProject.owner && r.repo === selectedProject.repo
  )

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <header className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Package className="w-8 h-8 text-blue-500" />
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                GitHub Artifacts Viewer
              </h1>
            </div>
            <button
              onClick={handleRefresh}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            View and download GitHub Actions artifacts from your builds. Showing builds from the last 30 days.
          </p>
          <GitHubTokenWarning />
        </header>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
          <ProjectTabs
            selected={selectedProject}
            onSelect={handleProjectChange}
          />
          <div className="mt-6">
            <PRSelector
              selectedPR={selectedPR}
              selectedBranch={selectedBranch}
              onSelectPR={setSelectedPR}
              onSelectBranch={setSelectedBranch}
              owner={selectedProject.owner}
              repo={selectedProject.repo}
            />
          </div>
          
          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="flex items-start gap-2">
              {selectedPR ? <GitPullRequest className="w-4 h-4 text-blue-500 mt-0.5" /> : <GitBranch className="w-4 h-4 text-blue-500 mt-0.5" />}
              <div className="text-sm">
                <p className="text-blue-900 dark:text-blue-100">
                  Currently viewing: <strong>{currentRepo?.displayName}</strong>
                  {selectedPR && (
                    <>
                      {' '}• PR #{selectedPR.number}: <strong>{selectedPR.title}</strong>
                    </>
                  )}
                  {!selectedPR && selectedBranch && (
                    <>
                      {' '}• Branch: <strong>{selectedBranch}</strong>
                      {selectedBranch === 'main' && (
                        <span className="ml-2 text-xs bg-green-500 text-white px-2 py-0.5 rounded">MAIN</span>
                      )}
                    </>
                  )}
                  {!selectedPR && !selectedBranch && ' • All workflow runs'}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
            Recent Workflow Runs
          </h2>
          <WorkflowRunList
            key={refreshKey}
            owner={selectedProject.owner}
            repo={selectedProject.repo}
            branch={selectedBranch}
          />
        </div>
      </div>
    </main>
  )
}