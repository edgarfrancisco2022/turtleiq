export default function SessionsLoading() {
  return (
    <div className="max-w-3xl mx-auto px-4 md:px-8 py-10 animate-pulse">
      {/* Header */}
      <div className="flex items-baseline justify-between mb-6">
        <div className="h-7 w-24 bg-gray-200 rounded" />
        <div className="h-4 w-16 bg-gray-100 rounded" />
      </div>

      {/* Summary strip */}
      <div className="flex gap-3 mb-6">
        <div className="flex-1 h-16 bg-gray-100 border border-gray-200 rounded-lg" />
        <div className="flex-1 h-16 bg-gray-100 border border-gray-200 rounded-lg" />
      </div>

      {/* Sort/filter bar */}
      <div className="h-8 w-64 bg-gray-100 rounded mb-4" />

      {/* Session rows */}
      <div className="space-y-1.5">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="border border-gray-200 rounded-md px-4 py-3 flex items-center gap-3"
            style={{ opacity: 1 - i * 0.07 }}
          >
            <div className="h-5 w-20 bg-gray-100 rounded-full" />
            <div className="h-4 w-12 bg-gray-200 rounded" />
            <div className="h-4 w-24 bg-gray-100 rounded" />
          </div>
        ))}
      </div>
    </div>
  )
}
