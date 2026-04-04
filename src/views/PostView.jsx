import { Link, useParams, Navigate } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import { getPost, formatPostDate } from '../utils/posts'

export default function PostView() {
  const { slug } = useParams()
  const post = getPost(slug)

  if (!post) return <Navigate to="/notes" replace />

  return (
    <div className="min-h-screen bg-white text-gray-900 flex flex-col">
      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100" aria-label="Site navigation">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2" aria-label="TortugaIQ home">
            <span className="text-xl leading-none" aria-hidden="true">🔍🐢</span>
            <span className="font-bold text-gray-900 text-sm tracking-tight">TortugaIQ</span>
          </Link>
          <div className="flex items-center gap-5">
            <Link to="/sign-in" className="text-sm text-gray-500 hover:text-gray-800 transition-colors">Sign in</Link>
            <Link
              to="/sign-up"
              className="text-sm bg-gray-900 text-white px-4 py-1.5 rounded-lg hover:bg-gray-700 transition-colors font-medium"
            >
              Sign up
            </Link>
          </div>
        </div>
      </nav>

      {/* Post content */}
      <main className="max-w-3xl mx-auto px-6 py-16 flex-1 w-full">
        <Link
          to="/notes"
          className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 transition-colors mb-12"
          aria-label="Back to all notes"
        >
          ← Notes
        </Link>

        <article>
          <header className="mb-10">
            <time dateTime={post.date} className="text-sm text-gray-400 block mb-3">
              {formatPostDate(post.date)}
            </time>
            <h1 className="text-3xl font-bold text-gray-900 leading-tight">{post.title}</h1>
          </header>

          <div className="prose prose-neutral prose-p:leading-relaxed prose-p:text-gray-700 prose-headings:text-gray-900 max-w-none">
            <ReactMarkdown
              remarkPlugins={[remarkGfm, remarkMath]}
              rehypePlugins={[rehypeKatex]}
            >
              {post.content}
            </ReactMarkdown>
          </div>
        </article>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-8">
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between text-xs text-gray-400">
          <span aria-hidden="true">🔍🐢</span>
          <div className="flex items-center gap-4">
            <Link to="/sign-in" className="hover:text-gray-600 transition-colors">Sign in</Link>
            <Link to="/sign-up" className="hover:text-gray-600 transition-colors">Sign up</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
