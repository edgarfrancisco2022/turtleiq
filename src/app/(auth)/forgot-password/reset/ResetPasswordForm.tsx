'use client'

import { useActionState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { resetPasswordAction } from './actions'

export default function ResetPasswordForm() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token') ?? ''

  const [state, formAction, pending] = useActionState(resetPasswordAction, { error: '' })

  if (!token) {
    return (
      <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-3">
        This reset link is invalid or has expired.{' '}
        <Link href="/forgot-password" className="text-blue-600 hover:underline font-medium">
          Request a new one
        </Link>
        .
      </div>
    )
  }

  return (
    <>
      {state.error && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2 mb-4">
          {state.error}
        </div>
      )}

      <form action={formAction} className="space-y-4">
        <input type="hidden" name="token" value={token} />

        <div>
          <label className="text-xs font-medium text-gray-600 mb-1 block" htmlFor="newPassword">
            New password
          </label>
          <input
            id="newPassword"
            name="newPassword"
            type="password"
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            required
            autoFocus
            autoComplete="new-password"
            minLength={8}
          />
          <p className="text-xs text-gray-400 mt-1">At least 8 characters</p>
        </div>

        <button
          type="submit"
          disabled={pending}
          className="w-full bg-gray-900 text-white rounded-lg py-2.5 text-sm font-medium hover:bg-gray-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {pending ? 'Saving…' : 'Set new password'}
        </button>
      </form>

      <p className="mt-5 text-center text-xs text-gray-500">
        <Link href="/sign-in" className="text-blue-600 hover:underline font-medium">
          Back to sign in
        </Link>
      </p>
    </>
  )
}
