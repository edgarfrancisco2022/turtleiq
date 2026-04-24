'use client'

import { useEffect, useId, useState } from 'react'

interface Props {
  chart: string
}

export default function MermaidDiagram({ chart }: Props) {
  // useId produces stable per-instance IDs like ":r0:" — strip colons for valid DOM id
  const rawId = useId()
  const id = `mermaid-${rawId.replace(/:/g, '')}`
  const [svg, setSvg] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setSvg(null)
    setError(null)

    async function render() {
      try {
        // Dynamic import keeps mermaid out of the initial bundle
        const mermaid = (await import('mermaid')).default
        mermaid.initialize({
          startOnLoad: false,
          theme: 'neutral',
          suppressErrorRendering: true,
        })
        const result = await mermaid.render(id, chart)
        if (!cancelled) setSvg(result.svg)
      } catch (err) {
        if (!cancelled)
          setError(err instanceof Error ? err.message : 'Invalid diagram syntax')
      }
    }

    render()
    return () => { cancelled = true }
  }, [chart, id])

  if (error) {
    return (
      <div className="rounded border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600 font-mono">
        Mermaid error: {error}
      </div>
    )
  }
  if (!svg) {
    return <div className="h-16 rounded bg-gray-50 animate-pulse" />
  }
  return (
    <div
      className="overflow-x-auto my-2"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  )
}
