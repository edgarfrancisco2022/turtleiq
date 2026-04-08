export default function ConceptLoading() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-6 animate-pulse">
      {/* Back + concept name */}
      <div className="flex items-center gap-3">
        <div className="h-4 w-4 bg-zinc-700 rounded" />
        <div className="h-6 w-56 bg-zinc-700 rounded" />
      </div>

      {/* Metadata row */}
      <div className="flex gap-2">
        <div className="h-5 w-20 bg-zinc-700 rounded-full" />
        <div className="h-5 w-16 bg-zinc-700 rounded-full" />
        <div className="h-5 w-14 bg-zinc-700 rounded-full" />
      </div>

      {/* MVK section (blue tint) */}
      <div className="bg-blue-950/30 border border-blue-900/40 rounded-lg p-4 space-y-2">
        <div className="h-3 w-10 bg-blue-800/50 rounded" />
        <div className="h-3 w-full bg-blue-800/30 rounded" />
        <div className="h-3 w-4/5 bg-blue-800/30 rounded" />
      </div>

      {/* Notes section */}
      <div className="space-y-2">
        <div className="h-3 w-12 bg-zinc-700 rounded" />
        <div className="h-32 w-full bg-zinc-800/60 rounded-lg" />
      </div>

      {/* References section */}
      <div className="space-y-2">
        <div className="h-3 w-20 bg-zinc-700 rounded" />
        <div className="h-20 w-full bg-zinc-800/60 rounded-lg" />
      </div>
    </div>
  )
}
