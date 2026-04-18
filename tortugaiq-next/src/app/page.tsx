import Link from 'next/link'
import FeaturesSection from '@/components/landing/FeaturesSection'
import IdeaSection from '@/components/landing/IdeaSection'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* Top nav */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl leading-none">🔍🐢</span>
            <span className="font-bold text-gray-900 text-sm tracking-tight">TortugaIQ</span>
          </Link>
          <div className="flex items-center gap-5">
            <Link href="/notes" className="text-sm text-gray-500 hover:text-gray-800 transition-colors">Notes</Link>
            <Link href="/sign-in" className="text-sm text-gray-500 hover:text-gray-800 transition-colors">Sign in</Link>
            <Link
              href="/sign-up"
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
            Hi, I&apos;m Edgar Perez.
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
              href="/sign-in"
              className="flex items-center justify-center gap-2 text-sm text-gray-600 hover:text-blue-600 transition-colors py-2 border border-gray-200 rounded-xl hover:border-blue-300"
            >
              → Sign in
            </Link>
            <Link
              href="/sign-up"
              className="flex items-center justify-center gap-2 text-sm bg-gray-900 text-white py-2 rounded-xl hover:bg-gray-700 transition-colors font-medium"
            >
              → Sign up
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <FeaturesSection />

      {/* The idea */}
      <IdeaSection />

      {/* Footer */}
      <footer className="border-t border-gray-100 py-8">
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between text-xs text-gray-400">
          <span>🔍🐢 TortugaIQ</span>
          <div className="flex items-center gap-4">
            <Link href="/notes" className="hover:text-gray-600 transition-colors">Notes</Link>
            <Link href="/sign-in" className="hover:text-gray-600 transition-colors">Sign in</Link>
            <Link href="/sign-up" className="hover:text-gray-600 transition-colors">Sign up</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
