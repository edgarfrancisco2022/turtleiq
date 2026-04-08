'use server'

import { requestPasswordReset } from '@/actions/auth'

export async function requestResetAction(
  _prevState: { error: string; success: boolean },
  formData: FormData
): Promise<{ error: string; success: boolean }> {
  const result = await requestPasswordReset({
    email: formData.get('email') as string,
  })

  if (result.error) {
    return { error: result.error, success: false }
  }

  return { error: '', success: true }
}
