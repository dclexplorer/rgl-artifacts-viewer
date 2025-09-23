'use client'

import { Package } from 'lucide-react'
import { REPOSITORIES } from '@/lib/github'

interface ProjectTabsProps {
  selected: { owner: string; repo: string }
  onSelect: (owner: string, repo: string) => void
}

export default function ProjectTabs({ selected, onSelect }: ProjectTabsProps) {
  return (
    <div className="mb-6">
      <label className="block text-sm font-medium mb-3 text-gray-700 dark:text-gray-300">
        Project
      </label>
      <div className="flex flex-wrap gap-2">
        {REPOSITORIES.map((repository) => {
          const isSelected = selected.owner === repository.owner && selected.repo === repository.repo
          return (
            <button
              key={`${repository.owner}/${repository.repo}`}
              onClick={() => onSelect(repository.owner, repository.repo)}
              className={`
                px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2
                ${isSelected 
                  ? 'bg-blue-500 text-white shadow-md' 
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750'
                }
              `}
            >
              <Package className="w-4 h-4" />
              {repository.displayName}
            </button>
          )
        })}
      </div>
    </div>
  )
}