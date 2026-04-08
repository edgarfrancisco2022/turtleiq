export default function LibraryLoading() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-6 animate-pulse">
      {/* Search bar */}
      <div className="h-9 w-full bg-zinc-800 rounded-md mb-4" />

      {/* Filter bar */}
      <div className="h-9 w-full bg-zinc-800 rounded-md mb-4" />

      {/* Concept rows */}
      <div className="space-y-px">
        {[...Array(10)].map((_, i) => (
          <div key={i} className="flex items-center gap-3 px-3 py-3 bg-zinc-800/40 rounded">
            <div className="h-4 flex-1 bg-zinc-700 rounded" />
            <div className="h-4 w-20 bg-zinc-700 rounded" />
            <div className="h-4 w-8 bg-zinc-700 rounded" />
          </div>
        ))}
      </div>
    </div>
  )
}
