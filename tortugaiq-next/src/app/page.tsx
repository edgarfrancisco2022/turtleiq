import Link from 'next/link'
import { Check } from 'lucide-react'
import FeaturesSection from '@/components/landing/FeaturesSection'
import IdeaSection from '@/components/landing/IdeaSection'
import Logo from '@/components/ui/Logo'
import GuestLink from '@/components/landing/GuestLink'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* Top nav */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Logo />
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
        <div className="max-w-6xl mx-auto px-6 py-24">

          {/* Main hero content */}
          <div className="flex flex-col gap-8">

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
                  'Build your own library of concepts',
                  'Choose what to review, without hidden algorithms',
                  'Flexible organization, without rigid decks or nested complexity',
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
            <p className="mt-2">
              <GuestLink />
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
          <Logo variant="footer" />
          <div className="flex items-center gap-4">
            <Link href="/notes" className="hover:text-gray-600 transition-colors">Notes</Link>
            <Link href="/privacy" className="hover:text-gray-600 transition-colors">Privacy</Link>
            <Link href="/sign-in" className="hover:text-gray-600 transition-colors">Sign in</Link>
            <Link href="/sign-up" className="hover:text-gray-600 transition-colors">Sign up</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
