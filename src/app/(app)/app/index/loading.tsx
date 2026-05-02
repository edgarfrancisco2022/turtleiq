export default function IndexLoading() {
  return (
    <div className="max-w-5xl mx-auto px-4 md:px-8 py-10 animate-pulse">
      {/* Search row */}
      <div className="h-8 w-full bg-gray-100 border border-gray-200 rounded mb-8" />

      {/* Letter groups */}
      {[12, 8, 10].map((count, g) => (
        <div key={g} className="mb-8">
          <div className="h-3 w-3 bg-gray-200 rounded mb-3" />
          <div className="flex flex-wrap gap-2">
            {[...Array(count)].map((_, i) => (
              <div
                key={i}
                className="h-7 bg-gray-100 border border-gray-200 rounded-full"
                style={{ width: `${60 + ((i * 17) % 60)}px` }}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
