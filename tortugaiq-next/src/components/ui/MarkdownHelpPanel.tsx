'use client'

import { createPortal } from 'react-dom'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'

// Mirrors the remarkMark plugin in MarkdownEditor so previews match actual rendering
function remarkMark() {
  return (tree: any) => {
    function processNode(node: any) {
      if (!node.children) return
      const newChildren: any[] = []
      for (const child of node.children) {
        if (child.type === 'text' && child.value.includes('==')) {
          const parts = child.value.split(/(==[^=\n]+?==)/)
          for (const part of parts) {
            if (part.startsWith('==') && part.endsWith('==') && part.length > 4) {
              newChildren.push({
                type: 'mark',
                data: { hName: 'mark' },
                children: [{ type: 'text', value: part.slice(2, -2) }],
              })
            } else if (part) {
              newChildren.push({ type: 'text', value: part })
            }
          }
        } else {
          processNode(child)
          newChildren.push(child)
        }
      }
      node.children = newChildren
    }
    processNode(tree)
  }
}

const MD_PLUGINS = {
  remark: [remarkGfm, remarkMath, remarkMark],
  rehype: [rehypeKatex],
}

const EQ = () => <span style={{ fontFamily: 'Courier New, Courier, monospace' }}>==</span>

const HELP_SECTIONS = [
  {
    title: 'Basics',
    items: [
      { label: 'Heading', example: '# H1\n## H2\n### H3' },
      { label: 'Bold', example: '**bold text**' },
      { label: 'Italic', example: '*italicized text*' },
      {
        label: 'Highlight',
        example: '==very important words==',
        renderExample: () => <><EQ />very important words<EQ /></>,
      },
      { label: 'Blockquote', example: '> blockquote' },
      { label: 'Ordered List', example: '1. First item\n2. Second item\n3. Third item' },
      { label: 'Unordered List', example: '- First item\n- Second item\n- Third item' },
      { label: 'Task List', example: '- [x] Done\n- [ ] Not done' },
      { label: 'Horizontal Rule', example: '---' },
      { label: 'Link', example: '[title](https://example.com)' },
      { label: 'Image', example: '![quadratic graph](https://upload.wikimedia.org/wikipedia/commons/7/74/Quadratic-function.svg)' },
    ],
  },
  {
    title: 'Code',
    items: [
      { label: 'Inline Code', example: '`inline code`' },
      { label: 'Block Code', example: '```javascript\nconst x = 1;\nconsole.log(x);\n```' },
    ],
  },
  {
    title: 'Math',
    items: [
      { label: 'Inline Math', example: '$x^2$' },
      { label: 'Block Math', example: '$$\n\\int_0^1 x^2 \\, dx\n$$' },
    ],
  },
]

export default function MarkdownHelpPanel({ onClose }: { onClose: () => void }) {
  return createPortal(
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/20" onClick={onClose} />

      <div className="relative w-full sm:w-80 h-full bg-white border-l border-gray-200 shadow-2xl flex flex-col">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 flex-shrink-0">
          <span className="text-sm font-semibold text-gray-900">Markdown Help</span>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-0.5 rounded"
            aria-label="Close"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <p className="px-4 pt-3 pb-1 text-xs text-gray-400 italic flex-shrink-0">
          Markdown is simple, portable, and works naturally with AI tools.
        </p>

        <div className="flex-1 overflow-y-auto overscroll-none px-4 pb-4">
          {HELP_SECTIONS.map((section) => (
            <div key={section.title} className="mt-4">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                {section.title}
              </p>
              <div className="flex flex-col gap-3">
                {section.items.map((item) => (
                  <div key={item.label}>
                    <p className="text-xs font-medium text-gray-700 mb-1">{item.label}</p>
                    <pre className="bg-gray-50 border border-gray-100 rounded-t-md text-xs font-mono p-2 whitespace-pre-wrap break-all leading-relaxed text-gray-600 m-0">
                      {'renderExample' in item && item.renderExample
                        ? item.renderExample()
                        : item.example}
                    </pre>
                    <div className="
                      border border-t-0 border-gray-100 rounded-b-md px-3 py-2 overflow-hidden
                      prose prose-sm prose-neutral max-w-none
                      [&>*:first-child]:mt-0 [&>*:last-child]:mb-0
                      [&_p]:my-0.5
                      [&_h1]:mt-0 [&_h1]:mb-0.5
                      [&_h2]:mt-0 [&_h2]:mb-0.5
                      [&_h3]:mt-0 [&_h3]:mb-0.5
                      [&_ul]:my-0.5 [&_ol]:my-0.5 [&_li]:my-0
                      [&_blockquote]:my-0.5
                      [&_pre]:my-0
                      [&_hr]:my-1
                      [&_.katex-display]:my-0
                      [&_img]:max-h-14 [&_img]:w-auto
                    ">
                      <ReactMarkdown
                        remarkPlugins={MD_PLUGINS.remark}
                        rehypePlugins={MD_PLUGINS.rehype}
                        components={{
                          a: ({ href, children }) => (
                            <a href={href} target="_blank" rel="noopener noreferrer">{children}</a>
                          ),
                        }}
                      >
                        {item.example}
                      </ReactMarkdown>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="px-4 py-3 border-t border-gray-100 flex-shrink-0">
          <a
            href="https://www.markdownguide.org/cheat-sheet/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-blue-600 hover:text-blue-800 font-medium transition-colors"
          >
            Open full Markdown guide →
          </a>
        </div>
      </div>
    </div>,
    document.body
  )
}
