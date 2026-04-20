'use client'

import { useActionState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'
import Link from 'next/link'
import { signUpAction, signUpWithGoogle, signUpWithFacebook } from './actions'
import Logo from '@/components/ui/Logo'

export default function SignUpPage() {
  const router = useRouter()
  const [state, formAction, pending] = useActionState(signUpAction, { error: '' })

  useEffect(() => {
    if (!state.success || !state.email || !state.password) return

    signIn('credentials', {
      email: state.email,
      password: state.password,
      callbackUrl: '/app',
      redirect: true,
    })
  }, [state.success, state.email, state.password])

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
        <h1 className="text-xl font-bold text-gray-900 mb-6">Create account</h1>

        {/* OAuth providers */}
        <div className="space-y-2 mb-5">
          <form action={signUpWithGoogle}>
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 border border-gray-200 rounded-lg py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Sign up with Google
            </button>
          </form>
          <form action={signUpWithFacebook}>
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 border border-gray-200 rounded-lg py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" aria-hidden="true" fill="#1877F2">
                <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.97h-1.514c-1.491 0-1.956.93-1.956 1.874v2.25h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z" />
              </svg>
              Sign up with Facebook
            </button>
          </form>
        </div>

        <div className="relative mb-5">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-100" />
          </div>
          <div className="relative flex justify-center">
            <span className="bg-white px-2 text-xs text-gray-400">or</span>
          </div>
        </div>

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
            disabled={pending || !!state.success}
            className="w-full bg-gray-900 text-white rounded-lg py-2.5 text-sm font-medium hover:bg-gray-700 transition-colors mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {pending || state.success ? 'Creating account…' : 'Create account'}
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
