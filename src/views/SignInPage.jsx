import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'

export default function SignInPage() {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const signIn   = useAuthStore(s => s.signIn)
  const navigate = useNavigate()

  function handleSubmit(e) {
    e.preventDefault()
    setError('')
    const result = signIn(email, password)
    if (result.error) setError(result.error)
    else navigate('/app')
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 text-gray-900 hover:opacity-75 transition-opacity">
            <span className="text-3xl leading-none">🔍🐢</span>
            <span className="font-bold text-xl tracking-tight">TortugaIQ</span>
          </Link>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
          <h1 className="text-xl font-bold text-gray-900 mb-6">Sign in</h1>

          {error && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2 mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                required
                autoFocus
                autoComplete="email"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                required
                autoComplete="current-password"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-gray-900 text-white rounded-lg py-2.5 text-sm font-medium hover:bg-gray-700 transition-colors mt-2"
            >
              Sign in
            </button>
          </form>

          <div className="mt-5 pt-5 border-t border-gray-100 space-y-2">
            <button disabled className="w-full border border-gray-100 text-gray-300 rounded-lg py-2 text-xs cursor-not-allowed">
              Sign in with Google · not available in demo
            </button>
            <button disabled className="w-full border border-gray-100 text-gray-300 rounded-lg py-2 text-xs cursor-not-allowed">
              Sign in with Facebook · not available in demo
            </button>
          </div>

          <p className="mt-5 text-center text-xs text-gray-500">
            Don't have an account?{' '}
            <Link to="/sign-up" className="text-blue-600 hover:underline font-medium">Sign up</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
