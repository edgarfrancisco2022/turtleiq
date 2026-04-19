import Link from 'next/link'
import { notFound } from 'next/navigation'
import Logo from '@/components/ui/Logo'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import { getPost, getAllPosts, formatPostDate } from '@/lib/posts'
import 'katex/dist/katex.min.css'

export async function generateStaticParams() {
  return getAllPosts().map((post) => ({ slug: post.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = getPost(slug)
  if (!post) return {}
  return { title: `${post.title} — TortugaIQ` }
}

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = getPost(slug)

  if (!post) notFound()

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

      {/* Post content */}
      <main className="max-w-3xl mx-auto px-6 py-16 flex-1 w-full">
        <Link
          href="/notes"
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
