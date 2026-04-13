export default function FocusLoading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 animate-pulse">
      {/* Card */}
      <div className="w-full max-w-xl bg-gray-50 border border-gray-100 rounded-xl p-8 space-y-3">
        <div className="h-5 w-48 bg-gray-200 rounded mx-auto" />
        <div className="h-3 w-full bg-gray-100 rounded" />
        <div className="h-3 w-4/5 bg-gray-100 rounded" />
        <div className="h-3 w-3/5 bg-gray-100 rounded" />
      </div>
      {/* Nav buttons */}
      <div className="flex gap-3">
        <div className="h-8 w-20 bg-gray-100 border border-gray-200 rounded-md" />
        <div className="h-8 w-20 bg-gray-100 border border-gray-200 rounded-md" />
      </div>
    </div>
  )
}
