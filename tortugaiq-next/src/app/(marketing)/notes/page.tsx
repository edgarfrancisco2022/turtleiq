import Link from 'next/link'
import { getAllPosts, formatPostDate } from '@/lib/posts'
import Logo from '@/components/ui/Logo'

export const metadata = { title: 'Notes — TortugaIQ' }

export default function NotesPage() {
  const posts = getAllPosts()

  return (
    <div className="min-h-screen bg-white text-gray-900 flex flex-col">
      {/* Nav */}
      <nav
        className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100"
        aria-label="Site navigation"
      >
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2" aria-label="TortugaIQ home">
            <Logo />
          </Link>
          <div className="flex items-center gap-5">
            <Link href="/sign-in" className="text-sm text-gray-500 hover:text-gray-800 transition-colors">
              Sign in
            </Link>
            <Link
              href="/sign-up"
              className="text-sm bg-gray-900 text-white px-4 py-1.5 rounded-lg hover:bg-gray-700 transition-colors font-medium"
            >
              Sign up
            </Link>
          </div>
        </div>
      </nav>

      {/* Post list */}
      <main className="max-w-3xl mx-auto px-6 py-16 flex-1 w-full">
        <h1 className="text-3xl font-bold text-gray-900 mb-10">Notes</h1>

        {posts.length === 0 ? (
          <p className="text-gray-400 text-sm">No posts yet.</p>
        ) : (
          <ol className="space-y-10" aria-label="Blog posts">
            {posts.map((post) => (
              <li key={post.slug}>
                <Link href={`/notes/${post.slug}`} className="group block">
                  <time dateTime={post.date} className="text-sm text-gray-400 block mb-2">
                    {formatPostDate(post.date)}
                  </time>
                  <span className="text-xl font-bold text-gray-900 group-hover:text-blue-700 transition-colors leading-snug">
                    {post.title}
                  </span>
                </Link>
              </li>
            ))}
          </ol>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-8">
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between text-xs text-gray-400">
          <Logo variant="footer" />
          <div className="flex items-center gap-4">
            <Link href="/sign-in" className="hover:text-gray-600 transition-colors">Sign in</Link>
            <Link href="/sign-up" className="hover:text-gray-600 transition-colors">Sign up</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
