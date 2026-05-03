import crypto from 'crypto'
import { NextRequest, NextResponse } from 'next/server'
import { lt, eq, and } from 'drizzle-orm'
import { db } from '@/db'
import { users } from '@/db/schema'

const GUEST_TTL_MS = 30 * 24 * 60 * 60 * 1000

export async function POST(req: NextRequest) {
  const incoming = req.headers.get('x-cron-secret') ?? ''
  const expected = process.env.CRON_SECRET ?? ''
  const incomingBuf = Buffer.from(incoming)
  const expectedBuf = Buffer.from(expected)
  const valid =
    incomingBuf.length === expectedBuf.length &&
    expectedBuf.length > 0 &&
    crypto.timingSafeEqual(incomingBuf, expectedBuf)
  if (!valid) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const cutoff = new Date(Date.now() - GUEST_TTL_MS)

  const deleted = await db
    .delete(users)
    .where(and(eq(users.isGuest, true), lt(users.createdAt, cutoff)))
    .returning({ id: users.id })

  return NextResponse.json({ deleted: deleted.length })
}
