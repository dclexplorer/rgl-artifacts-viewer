'use client'

import { useState, useEffect } from 'react'
import { ChevronDown } from 'lucide-react'

interface BranchSelectorProps {
  selectedBranch: string | null
  onSelect: (branch: string | null) => void
  owner: string
  repo: string
}

export default function BranchSelector({ selectedBranch, onSelect, owner, repo }: BranchSelectorProps) {
  const [branches, setBranches] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    fetchBranches()
  }, [owner, repo])

  const fetchBranches = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/branches?owner=${owner}&repo=${repo}`)
      const data = await response.json()
      setBranches(data.branches || [])
    } catch (error) {
      console.error('Error fetching branches:', error)
    } finally {
      setLoading(false)
    }
  }

  const displayValue = selectedBranch || 'All branches'
  const isMain = selectedBranch === 'main'

  return (
    <div className="relative mb-6">
      <label className="block text-sm font-medium mb-2">
        Branch
      </label>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full px-3 py-2 border rounded-md flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 ${
          isMain ? 'border-green-500 bg-green-50 dark:bg-green-900/20' : 'border-gray-300 dark:border-gray-700'
        }`}
      >
        <span className="flex items-center gap-2">
          {displayValue}
          {isMain && (
            <span className="text-xs bg-green-500 text-white px-2 py-1 rounded">MAIN</span>
          )}
        </span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      
      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md shadow-lg max-h-60 overflow-auto">
          <button
            onClick={() => {
              onSelect(null)
              setIsOpen(false)
            }}
            className="w-full px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            All branches
          </button>
          {branches.map((branch) => (
            <button
              key={branch}
              onClick={() => {
                onSelect(branch)
                setIsOpen(false)
              }}
              className={`w-full px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-between ${
                branch === 'main' ? 'bg-green-50 dark:bg-green-900/20' : ''
              }`}
            >
              <span>{branch}</span>
              {branch === 'main' && (
                <span className="text-xs bg-green-500 text-white px-2 py-1 rounded">MAIN</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}