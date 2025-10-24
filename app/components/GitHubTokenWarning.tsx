'use client'

import { useState, useEffect } from 'react'
import { AlertTriangle, X } from 'lucide-react'

interface TokenStatus {
  status: 'valid' | 'missing' | 'invalid' | 'forbidden' | 'error' | 'loading'
  message: string
}

export default function GitHubTokenWarning() {
  const [tokenStatus, setTokenStatus] = useState<TokenStatus>({
    status: 'loading',
    message: ''
  })
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    async function checkTokenStatus() {
      try {
        const response = await fetch('/api/token-status')
        const data = await response.json()
        setTokenStatus(data)
      } catch (error) {
        console.error('Failed to check token status:', error)
        setTokenStatus({
          status: 'error',
          message: 'Failed to validate GitHub token.'
        })
      }
    }

    checkTokenStatus()
  }, [])

  // Don't show anything while loading or if token is valid
  if (tokenStatus.status === 'loading' || tokenStatus.status === 'valid') {
    return null
  }

  // Don't show if dismissed
  if (dismissed) {
    return null
  }

  const getWarningColor = () => {
    switch (tokenStatus.status) {
      case 'missing':
      case 'invalid':
      case 'forbidden':
        return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200'
      case 'error':
        return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-200'
      default:
        return 'bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-800 text-gray-800 dark:text-gray-200'
    }
  }

  return (
    <div className={`mt-4 p-4 border rounded-lg ${getWarningColor()} relative`}>
      <button
        onClick={() => setDismissed(true)}
        className="absolute top-3 right-3 text-current opacity-60 hover:opacity-100 transition-opacity"
        aria-label="Dismiss warning"
      >
        <X className="w-4 h-4" />
      </button>
      <div className="flex items-start gap-3 pr-8">
        <AlertTriangle className="w-5 h-5 mt-0.5 flex-shrink-0" />
        <div>
          <p className="font-semibold mb-1">GitHub Token Issue</p>
          <p className="text-sm">{tokenStatus.message}</p>
          <p className="text-sm mt-2">
            {tokenStatus.status === 'missing' && (
              <>Set the <code className="bg-black/10 dark:bg-white/10 px-1 py-0.5 rounded">GITHUB_TOKEN</code> environment variable to download artifacts.</>
            )}
            {tokenStatus.status === 'invalid' && (
              <>Generate a new token at <a href="https://github.com/settings/tokens" target="_blank" rel="noopener noreferrer" className="underline hover:no-underline">GitHub Settings</a>.</>
            )}
            {tokenStatus.status === 'forbidden' && (
              <>Update your token permissions at <a href="https://github.com/settings/tokens" target="_blank" rel="noopener noreferrer" className="underline hover:no-underline">GitHub Settings</a>.</>
            )}
          </p>
        </div>
      </div>
    </div>
  )
}
