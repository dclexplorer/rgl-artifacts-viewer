'use client'

import { REPOSITORIES } from '@/lib/github'

interface ProjectSelectorProps {
  selected: { owner: string; repo: string }
  onSelect: (owner: string, repo: string) => void
}

export default function ProjectSelector({ selected, onSelect }: ProjectSelectorProps) {
  const currentRepo = REPOSITORIES.find(r => r.owner === selected.owner && r.repo === selected.repo)
  
  return (
    <div className="mb-6">
      <label htmlFor="project" className="block text-sm font-medium mb-2">
        Project
      </label>
      <select
        id="project"
        value={`${selected.owner}/${selected.repo}`}
        onChange={(e) => {
          const [owner, repo] = e.target.value.split('/')
          onSelect(owner, repo)
        }}
        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800"
      >
        {REPOSITORIES.map((repository) => (
          <option key={`${repository.owner}/${repository.repo}`} value={`${repository.owner}/${repository.repo}`}>
            {repository.displayName}
          </option>
        ))}
      </select>
    </div>
  )
}