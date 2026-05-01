'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession, signIn } from 'next-auth/react'
import { createGuestUser } from '@/actions/auth'

const CREDS_KEY = 'tiq-guest-credentials'

function loadCreds(): { email: string; password: string } | null {
  try {
    const raw = localStorage.getItem(CREDS_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function saveCreds(email: string, password: string) {
  try { localStorage.setItem(CREDS_KEY, JSON.stringify({ email, password })) } catch {}
}

function clearCreds() {
  try { localStorage.removeItem(CREDS_KEY) } catch {}
}

export default function GuestLink({ label = 'Try as guest', hideForGuest = false }: { label?: string; hideForGuest?: boolean }) {
  // null = not yet read from localStorage; prevents flash of wrong label
  const [hasCreds, setHasCreds] = useState<boolean | null>(null)
  // tracks which flow is in progress so the label survives session re-renders
  const [loadingState, setLoadingState] = useState<null | 'creating' | 'resuming'>(null)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const { data: session, status } = useSession()

  useEffect(() => {
    setHasCreds(!!loadCreds())
  }, [])

  async function createNew() {
    setLoadingState('creating')
    setError(null)
    const result = await createGuestUser()
    if ('error' in result) {
      setError(result.error)
      setLoadingState(null)
      return
    }
    saveCreds(result.email, result.password)
    await signIn('credentials', {
      email: result.email,
      password: result.password,
      callbackUrl: '/app',
      redirect: true,
    })
  }

  async function resumeGuest() {
    setLoadingState('resuming')
    setError(null)
    const creds = loadCreds()
    if (!creds) {
      setHasCreds(false)
      await createNew()
      return
    }
    const result = await signIn('credentials', {
      email: creds.email,
      password: creds.password,
      redirect: false,
    })
    if (!result?.ok) {
      // Account expired/deleted — clear stale creds and create a new guest
      clearCreds()
      setHasCreds(false)
      await createNew()
      return
    }
    // Keep loadingState as 'resuming' until navigation completes
    router.push('/app')
  }

  // Real user signed in — hide entirely
  if (session?.user && !session.user.isGuest) return null

  // On pages where showing "Continue to demo" would be confusing (e.g. sign-up, sign-in), hide when guest is active
  if (hideForGuest && session?.user?.isGuest) return null

  // Guest session already active AND not mid sign-in — go straight to the app
  if (session?.user?.isGuest && !loadingState) {
    return (
      <button
        onClick={() => router.push('/app')}
        className="text-sm text-gray-500 hover:text-gray-700 underline underline-offset-2 transition-colors"
      >
        Continue to demo →
      </button>
    )
  }

  // Suppress rendering until localStorage is read and session status is known,
  // to avoid any flash of the wrong label
  if ((hasCreds === null || status === 'loading') && !loadingState) return null

  const isResume = hasCreds && status === 'unauthenticated'

  return (
    <span className="inline-flex flex-col items-start gap-1">
      <button
        onClick={isResume ? resumeGuest : createNew}
        disabled={!!loadingState}
        className="text-sm text-gray-500 hover:text-gray-700 underline underline-offset-2 transition-colors disabled:opacity-50 disabled:cursor-wait"
      >
        {loadingState === 'resuming'
          ? 'Signing in…'
          : loadingState === 'creating'
          ? 'Setting up demo…'
          : isResume
          ? 'Continue to demo →'
          : label}
      </button>
      {error && <span className="text-xs text-red-500">{error}</span>}
    </span>
  )
}
