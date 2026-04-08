import fs from 'fs'
import path from 'path'

export interface Post {
  slug: string
  title: string
  date: string
  content: string
}

/**
 * Parse a simple YAML-like frontmatter block.
 * Supports single-line key: value pairs only.
 */
function parseFrontmatter(raw: string): { data: Record<string, string>; content: string } {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)/)
  if (!match) return { data: {}, content: raw.trim() }

  const data: Record<string, string> = {}
  match[1].split('\n').forEach((line) => {
    const colon = line.indexOf(':')
    if (colon === -1) return
    const key = line.slice(0, colon).trim()
    const value = line.slice(colon + 1).trim()
    if (key) data[key] = value
  })

  return { data, content: match[2].trim() }
}

/**
 * Derive URL slug from filename.
 * '2026-04-03-my-post.md' → 'my-post'
 */
function fileToSlug(filename: string): string {
  return filename.replace(/\.md$/, '').replace(/^\d{4}-\d{2}-\d{2}-/, '')
}

const postsDir = path.join(process.cwd(), 'src', 'posts')

/**
 * All posts sorted newest first.
 * Each post: { slug, title, date, content }
 */
export function getAllPosts(): Post[] {
  const files = fs.readdirSync(postsDir).filter((f) => f.endsWith('.md'))

  return files
    .map((filename) => {
      const raw = fs.readFileSync(path.join(postsDir, filename), 'utf-8')
      const { data, content } = parseFrontmatter(raw)
      return {
        slug: fileToSlug(filename),
        title: data.title || fileToSlug(filename),
        date: data.date || '',
        content,
      }
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

/** Find a single post by slug, or null if not found. */
export function getPost(slug: string): Post | null {
  return getAllPosts().find((p) => p.slug === slug) ?? null
}

/** Format an ISO date string for display, e.g. "April 3, 2026". */
export function formatPostDate(dateStr: string): string {
  if (!dateStr) return ''
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
}
