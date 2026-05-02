import { neon } from '@neondatabase/serverless'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))

const DATABASE_URL = process.env.DATABASE_URL
if (!DATABASE_URL) {
  console.error('DATABASE_URL is required')
  process.exit(1)
}

const sql = neon(DATABASE_URL)

const migrationPath = join(__dirname, '../src/db/migrations/0000_perpetual_madrox.sql')
const migrationSql = readFileSync(migrationPath, 'utf-8')

// Split on drizzle breakpoints and filter empty statements
const statements = migrationSql
  .split('--> statement-breakpoint')
  .map(s => s.trim())
  .filter(Boolean)

console.log(`Applying ${statements.length} statements...`)

for (let i = 0; i < statements.length; i++) {
  const stmt = statements[i]
  try {
    await sql.query(stmt)
    console.log(`[${i + 1}/${statements.length}] OK`)
  } catch (err) {
    if (err.message?.includes('already exists')) {
      console.log(`[${i + 1}/${statements.length}] SKIP (already exists)`)
    } else {
      console.error(`[${i + 1}/${statements.length}] FAILED: ${err.message}`)
      console.error('Statement:', stmt.slice(0, 100))
      process.exit(1)
    }
  }
}

console.log('Done.')
