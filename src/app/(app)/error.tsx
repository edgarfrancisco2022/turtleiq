'use client'

import { useEffect } from 'react'

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
      <p className="text-4xl mb-4 select-none">⚠</p>
      <h2 className="text-lg font-semibold text-gray-200 mb-2">Something went wrong</h2>
      <p className="text-sm text-gray-400 mb-6 max-w-sm">
        {error.message || 'An unexpected error occurred. Your data is safe.'}
      </p>
      <button
        onClick={reset}
        className="px-4 py-2 text-sm rounded-md bg-zinc-700 hover:bg-zinc-600 text-gray-200 transition-colors"
      >
        Try again
      </button>
    </div>
  )
}
