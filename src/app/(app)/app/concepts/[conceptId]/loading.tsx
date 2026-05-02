export default function ConceptLoading() {
  return (
    <div className="max-w-3xl mx-auto px-4 md:px-8 py-10 animate-pulse">
      {/* Top bar: back + edit */}
      <div className="flex items-center justify-between mb-6">
        <div className="h-4 w-10 bg-gray-200 rounded" />
        <div className="h-4 w-8 bg-gray-200 rounded" />
      </div>

      {/* Title */}
      <div className="h-8 w-64 bg-gray-200 rounded mb-6" />

      {/* Metadata box */}
      <div className="bg-gray-50 border border-gray-100 rounded-xl p-5 mb-3 space-y-3">
        <div className="flex gap-3">
          <div className="h-3 w-14 bg-gray-200 rounded" />
          <div className="flex gap-1.5">
            <div className="h-5 w-20 bg-gray-200 rounded-full" />
            <div className="h-5 w-16 bg-gray-200 rounded-full" />
          </div>
        </div>
        <div className="flex gap-3">
          <div className="h-3 w-14 bg-gray-200 rounded" />
          <div className="h-5 w-24 bg-gray-200 rounded-full" />
        </div>
        <div className="flex gap-3">
          <div className="h-3 w-14 bg-gray-200 rounded" />
          <div className="h-5 w-14 bg-gray-200 rounded-full" />
        </div>
        <div className="pt-3 border-t border-gray-100 flex gap-4">
          <div className="h-5 w-28 bg-gray-200 rounded" />
          <div className="h-5 w-20 bg-gray-200 rounded" />
          <div className="h-5 w-16 bg-gray-200 rounded" />
        </div>
      </div>

      {/* Shortcuts hint */}
      <div className="h-4 w-48 bg-gray-100 rounded mb-8" />

      {/* MVK section */}
      <div className="mb-8 bg-blue-50 border border-blue-100 rounded-xl p-4 space-y-2">
        <div className="h-3 w-32 bg-blue-100 rounded mb-3" />
        <div className="h-3 w-full bg-blue-100 rounded" />
        <div className="h-3 w-4/5 bg-blue-100 rounded" />
      </div>

      {/* Notes section */}
      <div className="mb-8 space-y-2">
        <div className="h-3 w-10 bg-gray-200 rounded mb-3" />
        <div className="h-3 w-full bg-gray-100 rounded" />
        <div className="h-3 w-3/4 bg-gray-100 rounded" />
        <div className="h-3 w-5/6 bg-gray-100 rounded" />
      </div>

      {/* References section */}
      <div className="space-y-2">
        <div className="h-3 w-16 bg-gray-200 rounded mb-3" />
        <div className="h-3 w-full bg-gray-100 rounded" />
        <div className="h-3 w-2/3 bg-gray-100 rounded" />
      </div>
    </div>
  )
}
