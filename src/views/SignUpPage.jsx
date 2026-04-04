import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'

export default function SignUpPage() {
  const [name, setName]         = useState('')
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const signUp   = useAuthStore(s => s.signUp)
  const navigate = useNavigate()

  function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return }
    const result = signUp(email, name, password)
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
          <h1 className="text-xl font-bold text-gray-900 mb-6">Create account</h1>

          {error && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2 mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Name</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                required
                autoFocus
                autoComplete="name"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                required
                autoComplete="email"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                required
                autoComplete="new-password"
              />
              <p className="text-xs text-gray-400 mt-1">At least 6 characters</p>
            </div>
            <button
              type="submit"
              className="w-full bg-gray-900 text-white rounded-lg py-2.5 text-sm font-medium hover:bg-gray-700 transition-colors mt-2"
            >
              Create account
            </button>
          </form>

          <div className="mt-5 pt-5 border-t border-gray-100 space-y-2">
            <button disabled className="w-full border border-gray-100 text-gray-300 rounded-lg py-2 text-xs cursor-not-allowed">
              Sign up with Google · not available in demo
            </button>
            <button disabled className="w-full border border-gray-100 text-gray-300 rounded-lg py-2 text-xs cursor-not-allowed">
              Sign up with Facebook · not available in demo
            </button>
          </div>

          <p className="mt-5 text-center text-xs text-gray-500">
            Already have an account?{' '}
            <Link to="/sign-in" className="text-indigo-600 hover:underline font-medium">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
