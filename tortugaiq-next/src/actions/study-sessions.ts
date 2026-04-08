'use server'

import { desc, eq } from 'drizzle-orm'
import { auth } from '@/auth'
import { db } from '@/db'
import { studySessions } from '@/db/schema'
import { addStudySessionSchema } from '@/lib/validations'
import type { StudySession, StudySessionInput } from '@/lib/types'

async function requireAuth(): Promise<string> {
  const session = await auth()
  if (!session?.user?.id) throw new Error('Unauthorized')
  return session.user.id
}

export async function getStudySessions(): Promise<StudySession[]> {
  const userId = await requireAuth()

  return db
    .select()
    .from(studySessions)
    .where(eq(studySessions.userId, userId))
    .orderBy(desc(studySessions.createdAt))
}

export async function addStudySession(input: StudySessionInput): Promise<StudySession> {
  const userId = await requireAuth()
  const parsed = addStudySessionSchema.parse(input)

  const [session] = await db
    .insert(studySessions)
    .values({
      userId,
      minutes: parsed.minutes,
      subjectId: parsed.subjectId ?? null,
    })
    .returning()

  return session
}
