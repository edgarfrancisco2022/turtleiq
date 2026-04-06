export default function HomeView({ onNewConcept }) {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center p-8">
      <div className="text-6xl mb-5">🔍🐢</div>
      <h1 className="text-3xl font-bold text-gray-900 mb-3">Welcome to TortugaIQ</h1>
      <p className="text-gray-500 max-w-sm mb-8 leading-relaxed">
        Build your personal knowledge base. Create concepts, add notes, and organize your learning.
      </p>
      <button
        onClick={onNewConcept}
        className="bg-blue-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-blue-700 transition-colors"
      >
        + New Concept
      </button>
    </div>
  )
}
