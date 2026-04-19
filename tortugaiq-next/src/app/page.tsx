import Link from 'next/link'
import { Library, Check } from 'lucide-react'
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
      <section className="bg-teal-50 border-b border-teal-200">
        <div className="max-w-6xl mx-auto px-6 py-24 grid grid-cols-1 lg:grid-cols-[1fr_176px] gap-x-16 gap-y-10 items-end">

          {/* Main hero content */}
          <div className="flex flex-col gap-8">

            {/* TortugaIQ label */}
            <div className="flex items-center gap-2">
              <Library className="w-4 h-4 text-teal-700" strokeWidth={2} />
              <span className="text-xs font-mono tracking-widest uppercase text-teal-700">TortugaIQ</span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl font-bold text-gray-900 leading-tight tracking-tight max-w-2xl">
              A <span className="text-teal-700">long-term learning system</span> built on simple{' '}
              <span className="text-teal-700 font-normal">concepts</span>
            </h1>

            {/* Supporting text */}
            <p className="text-base text-gray-500 leading-relaxed max-w-lg">
              Intuitive organization. Quick review. Works at any scale.
            </p>

            {/* Benefit bullets */}
            <div className="rounded-2xl bg-white/80 border border-teal-200 shadow-sm p-6 max-w-xl">
              <ul className="flex flex-col gap-3.5">
                {[
                  'Build concepts with a name and a minimal core definition',
                  'Organize by subject, topic, and tag — no friction',
                  'Review quickly, grow your library without losing control',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2.5">
                    <Check className="w-3.5 h-3.5 text-teal-600 mt-0.5 shrink-0" strokeWidth={2.5} />
                    <span className="text-sm text-gray-600">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* CTAs */}
            <div className="flex items-center gap-3">
              <Link
                href="/sign-up"
                className="text-sm bg-gray-900 text-white px-5 py-2.5 rounded-xl hover:bg-gray-700 transition-colors font-medium"
              >
                Sign up
              </Link>
              <Link
                href="/sign-in"
                className="text-sm text-teal-700 border border-teal-300 bg-white/60 px-5 py-2.5 rounded-xl hover:bg-teal-100/60 hover:border-teal-400 transition-colors"
              >
                Sign in
              </Link>
            </div>

          </div>

          {/* Built by — bottom-right, de-emphasized */}
          <div className="hidden lg:flex flex-col gap-1 text-right self-end pb-0.5">
            <p className="text-xs font-mono tracking-widest text-gray-400 uppercase opacity-60">Built by</p>
            <p className="text-sm text-gray-500 font-medium mt-0.5">Edgar Perez</p>
            <p className="text-xs text-gray-400 leading-relaxed mt-1">
              I like to think about learning, systems, and intelligence.
            </p>
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
