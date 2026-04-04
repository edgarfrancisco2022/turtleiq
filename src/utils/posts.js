// Load all markdown posts as raw strings at build time.
// Files must be named YYYY-MM-DD-slug.md and live in src/posts/.
const rawModules = import.meta.glob('../posts/*.md', { as: 'raw', eager: true })

/**
 * Parse a simple YAML-like frontmatter block.
 * Supports single-line key: value pairs only.
 */
function parseFrontmatter(raw) {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)/)
  if (!match) return { data: {}, content: raw.trim() }

  const data = {}
  match[1].split('\n').forEach(line => {
    const colon = line.indexOf(':')
    if (colon === -1) return
    const key = line.slice(0, colon).trim()
    const value = line.slice(colon + 1).trim()
    if (key) data[key] = value
  })

  return { data, content: match[2].trim() }
}

/**
 * Derive URL slug from file path.
 * '../posts/2026-04-03-my-post.md' → 'my-post'
 */
function pathToSlug(path) {
  const base = path.split('/').pop().replace(/\.md$/, '')
  return base.replace(/^\d{4}-\d{2}-\d{2}-/, '')
}

/**
 * All posts sorted newest first.
 * Each post: { slug, title, date, content }
 */
export const allPosts = Object.entries(rawModules)
  .map(([path, raw]) => {
    const { data, content } = parseFrontmatter(raw)
    return {
      slug: pathToSlug(path),
      title: data.title || pathToSlug(path),
      date: data.date || '',
      content,
    }
  })
  .sort((a, b) => new Date(b.date) - new Date(a.date))

/** Find a single post by slug, or null if not found. */
export function getPost(slug) {
  return allPosts.find(p => p.slug === slug) ?? null
}

/** Format an ISO date string for display, e.g. "April 3, 2026". */
export function formatPostDate(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
}
