'use server'

import { redirect } from 'next/navigation'
import { resetPassword } from '@/actions/auth'

export async function resetPasswordAction(
  _prevState: { error: string },
  formData: FormData
): Promise<{ error: string }> {
  const result = await resetPassword({
    token: formData.get('token') as string,
    newPassword: formData.get('newPassword') as string,
  })

  if (result.error) {
    return { error: result.error }
  }

  redirect('/sign-in?reset=success')
}
