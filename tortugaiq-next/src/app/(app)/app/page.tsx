'use client'

import { useConceptForm } from '@/components/providers/ConceptFormProvider'

export default function HomePage() {
  const { openConceptForm } = useConceptForm()

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight mb-2">
          Welcome to TortugaIQ
        </h1>
        <p className="text-gray-500 text-sm leading-relaxed">
          Your personal knowledge base for long-term learning. Add concepts, organize them into
          subjects, and review them your way.
        </p>
      </div>

      <button
        onClick={() => openConceptForm()}
        className="inline-flex items-center gap-2 bg-blue-600 text-white rounded-lg px-4 py-2.5 text-sm font-medium hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        <svg
          viewBox="0 0 18 18"
          fill="none"
          className="w-4 h-4"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        >
          <line x1="9" y1="2" x2="9" y2="16" />
          <line x1="2" y1="9" x2="16" y2="9" />
        </svg>
        New Concept
      </button>

      <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <QuickLink
          href="/app/library"
          title="Library"
          description="Browse and search all your concepts"
          icon={
            <svg viewBox="0 0 18 18" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="1" y="3" width="3" height="12" rx="0.5" />
              <rect x="6" y="5" width="3" height="10" rx="0.5" />
              <path d="M11 14.5l2.5-9.5 3 .8-2.5 9.5-3-.8z" />
            </svg>
          }
        />
        <QuickLink
          href="/app/focus"
          title="Focus"
          description="Review concepts one at a time"
          icon={
            <svg viewBox="0 0 18 18" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="9" cy="9" r="7" />
              <circle cx="9" cy="9" r="3" />
            </svg>
          }
        />
        <QuickLink
          href="/app/index"
          title="Index"
          description="Navigate concepts alphabetically"
          icon={
            <svg viewBox="0 0 18 18" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="2" width="14" height="14" rx="1.5" />
              <line x1="6" y1="6" x2="12" y2="6" />
              <line x1="6" y1="9" x2="12" y2="9" />
              <line x1="6" y1="12" x2="10" y2="12" />
            </svg>
          }
        />
        <QuickLink
          href="/app/overview"
          title="Overview"
          description="View your learning stats"
          icon={
            <svg viewBox="0 0 18 18" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="2" width="6" height="6" rx="1" />
              <rect x="10" y="2" width="6" height="6" rx="1" />
              <rect x="2" y="10" width="6" height="6" rx="1" />
              <rect x="10" y="10" width="6" height="6" rx="1" />
            </svg>
          }
        />
      </div>
    </div>
  )
}

function QuickLink({
  href,
  title,
  description,
  icon,
}: {
  href: string
  title: string
  description: string
  icon: React.ReactNode
}) {
  return (
    <a
      href={href}
      className="flex items-start gap-3 p-4 rounded-xl border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-colors group"
    >
      <span className="text-gray-400 group-hover:text-gray-600 transition-colors mt-0.5">
        {icon}
      </span>
      <div>
        <div className="text-sm font-medium text-gray-900">{title}</div>
        <div className="text-xs text-gray-500 mt-0.5">{description}</div>
      </div>
    </a>
  )
}
