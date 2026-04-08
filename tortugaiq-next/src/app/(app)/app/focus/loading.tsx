export default function FocusLoading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 animate-pulse">
      {/* Card placeholder */}
      <div className="w-full max-w-xl bg-zinc-800/60 rounded-xl p-8 space-y-4">
        <div className="h-6 w-48 bg-zinc-700 rounded mx-auto" />
        <div className="h-3 w-full bg-zinc-700 rounded" />
        <div className="h-3 w-4/5 bg-zinc-700 rounded" />
        <div className="h-3 w-3/5 bg-zinc-700 rounded" />
      </div>
      {/* Navigation buttons */}
      <div className="flex gap-4">
        <div className="h-9 w-20 bg-zinc-700 rounded-md" />
        <div className="h-9 w-20 bg-zinc-700 rounded-md" />
      </div>
    </div>
  )
}
