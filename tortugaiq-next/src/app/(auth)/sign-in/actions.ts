'use server'

import { AuthError } from 'next-auth'
import { signIn } from '@/auth'

export async function signInWithGoogle() {
  await signIn('google', { redirectTo: '/app' })
}

export async function signInWithFacebook() {
  await signIn('facebook', { redirectTo: '/app' })
}

export async function credentialsSignIn(
  _prevState: { error: string },
  formData: FormData
): Promise<{ error: string }> {
  try {
    await signIn('credentials', {
      email: formData.get('email'),
      password: formData.get('password'),
      redirectTo: '/app',
    })
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: 'Invalid email or password.' }
    }
    throw error // re-throw NEXT_REDIRECT so the redirect happens
  }
  return { error: '' }
}
