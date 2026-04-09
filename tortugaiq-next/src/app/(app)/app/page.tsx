'use client'

import { useConceptForm } from '@/components/providers/ConceptFormProvider'

export default function HomePage() {
  const { openConceptForm } = useConceptForm()

  return (
    <div className="flex flex-col items-center justify-center h-full text-center p-8">
      <div className="text-6xl mb-5">🔍🐢</div>
      <h1 className="text-3xl font-bold text-gray-900 mb-3">Welcome to TortugaIQ</h1>
      <p className="text-gray-500 max-w-sm mb-6 leading-relaxed">
        Built for long-term learning. Create concepts, add notes, and organize your learning.
      </p>
      <button
        onClick={() => openConceptForm()}
        className="bg-blue-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-blue-700 transition-colors"
      >
        + New Concept
      </button>
      <div className="mt-6 bg-blue-50 border border-blue-100 rounded-xl px-5 py-3 max-w-sm">
        <p className="text-blue-900 text-sm italic leading-relaxed">
          Try giving each concept a simple <strong className="font-semibold not-italic">MVK</strong>.
        </p>
      </div>
    </div>
  )
}
