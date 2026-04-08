export default function IndexLoading() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-6 animate-pulse">
      {/* Search / filter row */}
      <div className="h-9 w-full bg-zinc-800 rounded-md mb-6" />

      {/* Letter group */}
      <div className="mb-6">
        <div className="h-3 w-4 bg-zinc-700 rounded mb-3" />
        <div className="flex flex-wrap gap-2">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="h-7 w-24 bg-zinc-700 rounded-full" />
          ))}
        </div>
      </div>

      {/* Letter group */}
      <div className="mb-6">
        <div className="h-3 w-4 bg-zinc-700 rounded mb-3" />
        <div className="flex flex-wrap gap-2">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-7 w-28 bg-zinc-700 rounded-full" />
          ))}
        </div>
      </div>

      {/* Letter group */}
      <div>
        <div className="h-3 w-4 bg-zinc-700 rounded mb-3" />
        <div className="flex flex-wrap gap-2">
          {[...Array(15)].map((_, i) => (
            <div key={i} className="h-7 w-20 bg-zinc-700 rounded-full" />
          ))}
        </div>
      </div>
    </div>
  )
}
