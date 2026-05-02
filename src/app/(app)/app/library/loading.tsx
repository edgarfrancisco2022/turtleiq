export default function LibraryLoading() {
  return (
    <div className="max-w-3xl mx-auto px-4 md:px-8 py-10 animate-pulse">
      {/* Header */}
      <div className="flex items-baseline justify-between mb-4">
        <div className="h-7 w-24 bg-gray-200 rounded" />
        <div className="h-4 w-12 bg-gray-100 rounded" />
      </div>

      {/* Search input */}
      <div className="h-8 w-full bg-gray-100 border border-gray-200 rounded mb-4" />

      {/* Filter bar */}
      <div className="h-8 w-full bg-gray-100 border border-gray-200 rounded mb-2" />

      {/* Shortcuts hint */}
      <div className="h-4 w-56 bg-gray-100 rounded mb-4" />

      {/* Concept rows */}
      <div className="space-y-1.5">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="border border-gray-200 rounded-md px-4 py-2 flex items-center gap-3"
            style={{ opacity: 1 - i * 0.07 }}
          >
            <div className="flex-1 space-y-1.5">
              <div className="h-3.5 w-2/5 bg-gray-200 rounded" />
              <div className="h-3 w-1/4 bg-gray-100 rounded-full" />
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <div className="h-5 w-16 bg-gray-100 rounded" />
              <div className="h-5 w-12 bg-gray-100 rounded" />
              <div className="h-5 w-10 bg-gray-100 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
