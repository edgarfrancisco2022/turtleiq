'use client'

import { createPortal } from 'react-dom'

const HELP_SECTIONS = [
  {
    title: 'Basics',
    items: [
      { label: 'Heading', example: '# H1\n## H2\n### H3' },
      { label: 'Bold', example: '**bold text**' },
      { label: 'Italic', example: '*italicized text*' },
      { label: 'Highlight', example: '==very important words==' },
      { label: 'Blockquote', example: '> blockquote' },
      { label: 'Ordered List', example: '1. First item\n2. Second item\n3. Third item' },
      { label: 'Unordered List', example: '- First item\n- Second item\n- Third item' },
      { label: 'Task List', example: '- [x] Done\n- [ ] Not done' },
      { label: 'Code', example: '`inline code`' },
      { label: 'Horizontal Rule', example: '---' },
      { label: 'Link', example: '[title](https://example.com)' },
      { label: 'Image', example: '![alt text](image.jpg)' },
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
                    <pre className="bg-gray-50 border border-gray-100 rounded-md text-xs font-mono p-2 whitespace-pre-wrap leading-relaxed text-gray-700 m-0">
                      {item.example}
                    </pre>
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
