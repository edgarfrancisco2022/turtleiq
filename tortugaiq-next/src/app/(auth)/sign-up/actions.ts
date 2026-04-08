'use server'

import { redirect } from 'next/navigation'
import { signUpWithCredentials } from '@/actions/auth'

export async function signUpAction(
  _prevState: { error: string },
  formData: FormData
): Promise<{ error: string }> {
  const result = await signUpWithCredentials({
    email: formData.get('email') as string,
    name: formData.get('name') as string,
    password: formData.get('password') as string,
  })

  if (result.error) {
    return { error: result.error }
  }

  redirect('/app')
}
