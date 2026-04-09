'use client'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html>
      <body className="min-h-screen flex items-center justify-center bg-gray-950 text-gray-100 p-8">
        <div className="text-center max-w-md">
          <p className="text-4xl mb-4">⚠</p>
          <h2 className="text-lg font-semibold mb-2">Application error</h2>
          <p className="text-sm text-gray-400 mb-2">
            {error.message || 'An unexpected error occurred.'}
          </p>
          {error.digest && (
            <p className="text-xs text-gray-500 font-mono mb-6">digest: {error.digest}</p>
          )}
          <button
            onClick={reset}
            className="px-4 py-2 text-sm rounded-md bg-zinc-700 hover:bg-zinc-600 transition-colors"
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  )
}
