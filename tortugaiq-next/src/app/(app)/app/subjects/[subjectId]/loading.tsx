export default function SubjectLoading() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-6 animate-pulse">
      {/* Subject name + back link */}
      <div className="flex items-center gap-3 mb-6">
        <div className="h-4 w-4 bg-zinc-700 rounded" />
        <div className="h-5 w-40 bg-zinc-700 rounded" />
      </div>

      {/* Filter bar placeholder */}
      <div className="h-9 w-full bg-zinc-800 rounded-md mb-4" />

      {/* Concept rows */}
      <div className="space-y-px">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="flex items-center gap-3 px-3 py-3 bg-zinc-800/40 rounded">
            <div className="h-4 flex-1 bg-zinc-700 rounded" />
            <div className="h-4 w-16 bg-zinc-700 rounded" />
            <div className="h-4 w-8 bg-zinc-700 rounded" />
          </div>
        ))}
      </div>
    </div>
  )
}
