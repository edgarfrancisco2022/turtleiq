export default function OverviewLoading() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-8 animate-pulse">
      {/* Section header */}
      <div className="h-3 w-24 bg-zinc-700 rounded" />

      {/* Stat cards row */}
      <div className="grid grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-zinc-800/60 rounded-lg p-4 space-y-2">
            <div className="h-2.5 w-16 bg-zinc-700 rounded" />
            <div className="h-6 w-10 bg-zinc-700 rounded" />
          </div>
        ))}
      </div>

      {/* Section header */}
      <div className="h-3 w-20 bg-zinc-700 rounded" />

      {/* State distribution bar */}
      <div className="h-3 w-full bg-zinc-700 rounded-full" />

      {/* Row list */}
      <div className="space-y-2">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center gap-3 py-2">
            <div className="h-4 w-4 bg-zinc-700 rounded" />
            <div className="h-3 flex-1 bg-zinc-700 rounded" />
            <div className="h-3 w-12 bg-zinc-700 rounded" />
          </div>
        ))}
      </div>

      {/* Section header */}
      <div className="h-3 w-28 bg-zinc-700 rounded" />

      {/* Catalog chips */}
      <div className="flex flex-wrap gap-2">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="h-6 w-20 bg-zinc-700 rounded-full" />
        ))}
      </div>
    </div>
  )
}
