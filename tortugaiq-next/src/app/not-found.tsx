'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function NotFound() {
  const pathname = usePathname()

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-md text-center">
        {/* Large 404 number */}
        <p className="text-[120px] font-black leading-none tracking-tighter text-gray-100 select-none">
          404
        </p>

        {/* Icon + heading */}
        <div className="-mt-4 mb-4">
          <span className="text-4xl">🔍🐢</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Page not found</h1>
        <p className="text-sm text-gray-500 mb-1">
          The path{' '}
          <code className="text-xs bg-gray-100 text-gray-700 px-1.5 py-0.5 rounded font-mono">
            {pathname}
          </code>{' '}
          doesn&apos;t exist.
        </p>
        <p className="text-sm text-gray-400 mb-8">
          It may have been moved, deleted, or you may have mistyped the URL.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 bg-gray-900 text-white text-sm font-medium px-5 py-2.5 rounded-xl hover:bg-gray-700 transition-colors"
          >
            ← Back to home
          </Link>
          <Link
            href="/app"
            className="inline-flex items-center justify-center gap-2 border border-gray-200 text-gray-700 text-sm font-medium px-5 py-2.5 rounded-xl hover:border-blue-300 hover:text-blue-700 transition-colors bg-white"
          >
            Go to app
          </Link>
        </div>
      </div>
    </div>
  )
}
