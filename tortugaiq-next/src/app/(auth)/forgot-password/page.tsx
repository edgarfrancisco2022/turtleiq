'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { requestResetAction } from './actions'
import Logo from '@/components/ui/Logo'

export default function ForgotPasswordPage() {
  const [state, formAction, pending] = useActionState(requestResetAction, {
    error: '',
    success: false,
  })

  return (
    <div className="w-full max-w-sm">
      <div className="text-center mb-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-gray-900 hover:opacity-75 transition-opacity"
        >
          <Logo variant="auth" />
        </Link>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
        <h1 className="text-xl font-bold text-gray-900 mb-2">Reset password</h1>
        <p className="text-sm text-gray-500 mb-6">
          Enter your email and we&apos;ll send you a reset link.
        </p>

        {state.error && (
          <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2 mb-4">
            {state.error}
          </div>
        )}

        {state.success ? (
          <div className="text-sm text-green-700 bg-green-50 border border-green-100 rounded-lg px-3 py-3">
            If an account exists for that email, you&apos;ll receive a reset link shortly. Check
            your inbox.
          </div>
        ) : (
          <form action={formAction} className="space-y-4">
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
                autoFocus
                autoComplete="email"
              />
            </div>
            <button
              type="submit"
              disabled={pending}
              className="w-full bg-gray-900 text-white rounded-lg py-2.5 text-sm font-medium hover:bg-gray-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {pending ? 'Sending…' : 'Send reset link'}
            </button>
          </form>
        )}

        <p className="mt-5 text-center text-xs text-gray-500">
          <Link href="/sign-in" className="text-blue-600 hover:underline font-medium">
            Back to sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
