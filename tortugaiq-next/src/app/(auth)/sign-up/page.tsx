'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { signUpAction } from './actions'

export default function SignUpPage() {
  const [state, formAction, pending] = useActionState(signUpAction, { error: '' })

  return (
    <div className="w-full max-w-sm">
      <div className="text-center mb-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-gray-900 hover:opacity-75 transition-opacity"
        >
          <span className="text-3xl leading-none">🔍🐢</span>
          <span className="font-bold text-xl tracking-tight">TortugaIQ</span>
        </Link>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
        <h1 className="text-xl font-bold text-gray-900 mb-6">Create account</h1>

        {state.error && (
          <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2 mb-4">
            {state.error}
          </div>
        )}

        <form action={formAction} className="space-y-4">
          <div>
            <label className="text-xs font-medium text-gray-600 mb-1 block" htmlFor="name">
              Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              required
              autoFocus
              autoComplete="name"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 mb-1 block" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              required
              autoComplete="email"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 mb-1 block" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              required
              autoComplete="new-password"
              minLength={8}
            />
            <p className="text-xs text-gray-400 mt-1">At least 8 characters</p>
          </div>
          <button
            type="submit"
            disabled={pending}
            className="w-full bg-gray-900 text-white rounded-lg py-2.5 text-sm font-medium hover:bg-gray-700 transition-colors mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {pending ? 'Creating account…' : 'Create account'}
          </button>
        </form>

        <p className="mt-5 text-center text-xs text-gray-500">
          Already have an account?{' '}
          <Link href="/sign-in" className="text-blue-600 hover:underline font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
