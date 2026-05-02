import { Lightbulb, Check } from 'lucide-react'

// ─── Keyword highlight helper ─────────────────────────────────────────────────

function K({ children }: { children: React.ReactNode }) {
  return <span className="text-blue-800 font-medium">{children}</span>
}

// ─── Bullet content ───────────────────────────────────────────────────────────

const GROUP_1: React.ReactNode[] = [
  <><K>Learning systems</K> work well at a small scale, but become <K>unmaintainable</K> as they grow over time.</>,
  <>As the <K>system</K> grows, it becomes more difficult to <K>organize</K>, <K>review</K>, and <K>retain</K> knowledge.</>,
  <><K>TortugaIQ</K> is built around the <K>concept</K> as the <K>basic unit of knowledge</K>.</>,
  <>Each concept has a minimal <K>representation</K>, or <K>&ldquo;Minimum Viable Knowledge (MVK)&rdquo;</K>, which is the smallest amount of information worth remembering.</>,
]

const GROUP_2: React.ReactNode[] = [
  <>A clearly defined <K>concept name</K> gives the mind a stable <K>reference point</K></>,
  <>A well-thought-out <K>MVK</K> reduces the idea to a <K>highly compressed</K>, usable, and <K>memorable representation</K></>,
  <>This makes the <K>link</K> between the <K>concept</K> and its <K>representation</K> much easier to form from the start</>,
  <>That <K>pairing</K> alone can already create surprisingly <K>strong initial memories</K></>,
  <>The <K>concept name</K> can then act as a reliable <K>trigger</K> for recalling and reinforcing the <K>MVK</K></>,
  <>Later review strengthens the <K>link</K>, but the <K>structure</K> already works from the beginning</>,
  <>This <K>structure</K> also supports <K>easy</K>, <K>targeted review</K>, regardless of the size of the <K>knowledge base</K></>,
]

// ─── Component ────────────────────────────────────────────────────────────────

export default function IdeaSection() {
  return (
    <section id="the-idea" className="bg-blue-50/25 border-t border-gray-100 py-20">
      <div className="max-w-3xl mx-auto px-6">

        {/* Header */}
        <div className="flex items-center gap-2 mb-4">
          <Lightbulb className="w-4 h-4 text-blue-600" strokeWidth={2} />
          <span className="text-xs font-mono tracking-widest uppercase text-blue-600 opacity-70">
            The idea
          </span>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-10 leading-tight">
          A simple system for <span className="text-blue-700">long-term learning</span>
        </h2>

        {/* Group 1 */}
        <ul className="space-y-4 mb-8">
          {GROUP_1.map((item, i) => (
            <li key={i} className="flex items-start gap-4 text-gray-600 text-sm leading-relaxed">
              <span className="text-gray-300 mt-0.5 flex-shrink-0">—</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>

        {/* Group 2 — card container */}
        <div className="rounded-2xl bg-blue-50/50 border border-blue-200 shadow-sm p-8">
          <ul className="space-y-4">
            {GROUP_2.map((item, i) => (
              <li key={i} className="flex items-start gap-3 text-gray-600 text-sm leading-relaxed">
                <Check className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" strokeWidth={2.5} />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

      </div>
    </section>
  )
}
