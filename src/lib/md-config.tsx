'use client'

import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import type { Components } from 'react-markdown'
import dynamic from 'next/dynamic'

// next/dynamic with ssr:false ensures MermaidDiagram never runs during SSR.
// Without this, react-markdown receives a server-side client-component reference
// it cannot resolve, and silently falls back to rendering a plain <code> block.
const MermaidDiagram = dynamic(
  () => import('@/components/ui/MermaidDiagram'),
  { ssr: false }
)

// Canonical definition — replaces local copies in MarkdownEditor, InlineEditor, MarkdownHelpPanel
export function remarkMark() {
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

export const MD_PLUGINS = {
  remark: [remarkGfm, remarkMath, remarkMark],
  rehype: [rehypeKatex],
}

// Shared ReactMarkdown components — intercepts ```mermaid fenced code blocks
export const mdComponents: Components = {
  code({ className, children }) {
    if (className?.includes('language-mermaid')) {
      return <MermaidDiagram chart={String(children).trimEnd()} />
    }
    return <code className={className}>{children}</code>
  },
}
