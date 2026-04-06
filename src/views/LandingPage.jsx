import { Link } from 'react-router-dom'

const IDEAS = [
  'Learning systems work well at a small scale, but become unmaintainable as they grow over time.',
  'As the system grows, it becomes more difficult to organize, review, and retain knowledge.',
  'TortugaIQ is built around the concept as the basic unit of knowledge.',
  'Each concept has a minimal representation, or "Minimum Viable Knowledge (MVK)", which is the smallest amount of information worth remembering.',
  'Concept names act as triggers for those representations.',
  'Metadata such as subjects, topics, and tags make organization, filtering, and review easier.',
  'Simple Markdown notes instead of a complex editor.',
  'Quick reviews, even across hundreds of concepts.',
  'Retention through clear concept identity and simple representation rather than complex schemas or learning techniques.',
  'A personal knowledge library designed to remain maintainable as it grows.',
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* Top nav */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-xl leading-none">🔍🐢</span>
            <span className="font-bold text-gray-900 text-sm tracking-tight">TortugaIQ</span>
          </Link>
          <div className="flex items-center gap-5">
            <Link to="/notes" className="text-sm text-gray-500 hover:text-gray-800 transition-colors">Notes</Link>
            <Link to="/sign-in" className="text-sm text-gray-500 hover:text-gray-800 transition-colors">Sign in</Link>
            <Link
              to="/sign-up"
              className="text-sm bg-gray-900 text-white px-4 py-1.5 rounded-lg hover:bg-gray-700 transition-colors font-medium"
            >
              Sign up
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 py-24 grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-5 leading-tight">
            Hi, I'm Edgar Perez.
          </h1>
          <p className="text-lg text-gray-500 leading-relaxed">
            I like to think about learning, systems, and intelligence — and how to slowly improve over time 🐢
          </p>
        </div>

        <div className="flex flex-col items-center text-center">
          <span className="text-5xl mb-4 leading-none">🔍🐢</span>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">TortugaIQ</h2>
          <p className="text-gray-500 mb-8 leading-relaxed max-w-sm">
            I built a long-term learning system based on simple concepts, intuitive organization, and quick review.
          </p>
          <div className="flex flex-col gap-2.5 w-full max-w-xs">
            <Link
              to="/sign-in"
              className="flex items-center justify-center gap-2 text-sm text-gray-600 hover:text-blue-600 transition-colors py-2 border border-gray-200 rounded-xl hover:border-blue-300"
            >
              → Sign in
            </Link>
            <Link
              to="/sign-up"
              className="flex items-center justify-center gap-2 text-sm bg-gray-900 text-white py-2 rounded-xl hover:bg-gray-700 transition-colors font-medium"
            >
              → Sign up
            </Link>
          </div>
        </div>
      </section>

      {/* The idea */}
      <section id="notes" className="bg-gray-50 border-t border-gray-100 py-20">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-lg font-bold text-gray-900 mb-8">The idea</h2>
          <ul className="space-y-4">
            {IDEAS.map((idea, i) => (
              <li key={i} className="flex items-start gap-4 text-gray-600 text-sm leading-relaxed">
                <span className="text-gray-300 mt-0.5 flex-shrink-0">—</span>
                <span>{idea}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-8">
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between text-xs text-gray-400">
          <span>🔍🐢 TortugaIQ</span>
          <div className="flex items-center gap-4">
            <Link to="/notes" className="hover:text-gray-600 transition-colors">Notes</Link>
            <Link to="/sign-in" className="hover:text-gray-600 transition-colors">Sign in</Link>
            <Link to="/sign-up" className="hover:text-gray-600 transition-colors">Sign up</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
