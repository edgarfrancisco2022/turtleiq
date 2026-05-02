import { Suspense } from 'react'
import ResetPasswordForm from './ResetPasswordForm'
import Logo from '@/components/ui/Logo'

export default function ResetPasswordPage() {
  return (
    <div className="w-full max-w-sm">
      <div className="text-center mb-8">
        <a
          href="/"
          className="inline-flex items-center gap-2 text-gray-900 hover:opacity-75 transition-opacity"
        >
          <Logo variant="auth" />
        </a>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
        <h1 className="text-xl font-bold text-gray-900 mb-2">Set new password</h1>
        <p className="text-sm text-gray-500 mb-6">Choose a strong password for your account.</p>

        <Suspense>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  )
}
