'use server'

import { AuthError } from 'next-auth'
import { signIn } from '@/auth'
import { signUpWithCredentials } from '@/actions/auth'

export async function signUpAction(
  _prevState: { error: string },
  formData: FormData
): Promise<{ error: string }> {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const result = await signUpWithCredentials({
    email,
    name: formData.get('name') as string,
    password,
  })

  if (result.error) {
    return { error: result.error }
  }

  try {
    await signIn('credentials', { email, password, redirectTo: '/app' })
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: 'Account created but sign-in failed. Please sign in manually.' }
    }
    throw error // re-throw NEXT_REDIRECT
  }
  return { error: '' }
}
