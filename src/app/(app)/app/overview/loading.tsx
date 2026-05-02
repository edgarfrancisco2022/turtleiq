export default function OverviewLoading() {
  return (
    <div className="max-w-4xl mx-auto px-4 md:px-8 py-10 space-y-10 animate-pulse">
      {/* Study section */}
      <div>
        <div className="h-3 w-20 bg-gray-200 rounded mb-4" />
        <div className="grid grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-gray-50 border border-gray-100 rounded-xl p-4 space-y-2">
              <div className="h-2.5 w-16 bg-gray-200 rounded" />
              <div className="h-6 w-10 bg-gray-200 rounded" />
            </div>
          ))}
        </div>
      </div>

      {/* Inventory section */}
      <div>
        <div className="h-3 w-20 bg-gray-200 rounded mb-4" />
        <div className="h-2.5 w-full bg-gray-100 rounded-full mb-4" />
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-3 py-1.5">
              <div className="h-3 w-3 bg-gray-200 rounded" />
              <div className="h-3 flex-1 bg-gray-100 rounded" />
              <div className="h-3 w-8 bg-gray-100 rounded" />
            </div>
          ))}
        </div>
      </div>

      {/* Catalog section */}
      <div>
        <div className="h-3 w-24 bg-gray-200 rounded mb-4" />
        <div className="flex flex-wrap gap-2">
          {[...Array(7)].map((_, i) => (
            <div key={i} className="h-6 w-20 bg-gray-100 rounded-full" />
          ))}
        </div>
      </div>
    </div>
  )
}
