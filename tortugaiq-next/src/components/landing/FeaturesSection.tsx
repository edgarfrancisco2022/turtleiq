'use client'

import { useState } from 'react'
import Image from 'next/image'
import {
  PenLine,
  Layers2,
  LayoutList,
  Target,
  Zap,
  FolderOpen,
  Clock,
  BarChart2,
  Check,
} from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────

interface Bullet {
  text: React.ReactNode
  imageIndex?: number // only used for multi-image subsections
}

interface SubsectionConfig {
  step: string
  heading: React.ReactNode
  bullets: Bullet[]
  images: string[] // filenames inside /landing-features/
  bg: string
  border: string
  accentText: string
  accentBorder: string
  accentIcon: string
  screenshotBg: string
  Icon: React.ElementType
  layout: 'text-left' | 'text-right'
}

// ─── Keyword highlight helper ─────────────────────────────────────────────────

function K({ children, cls }: { children: React.ReactNode; cls: string }) {
  return <span className={`${cls} font-semibold`}>{children}</span>
}

// ─── Natural image dimensions for correct aspect ratios ──────────────────────

const IMAGE_DIMS: Record<string, [number, number]> = {
  'concept-modal.png':  [1003,  770],
  'concept-view.png':   [1523, 1176],
  'focus-view.png':     [1585, 1178],
  'index-view.png':     [2058, 1172],
  'library-view.png':   [2060, 1174],
  'markdown-notes.png': [1501, 1178],
  'mvk.png':            [1460,  480],
  'overview-view.png':  [1370, 1192],
  'session-view.png':   [2056, 1260],
  'subject-view.png':   [2058, 1174],
}

// ─── Screenshot card ──────────────────────────────────────────────────────────

function ScreenshotCard({
  src,
  alt,
  screenshotBg,
  border,
}: {
  src: string
  alt: string
  screenshotBg: string
  border: string
}) {
  const [w, h] = IMAGE_DIMS[src] ?? [1600, 1000]
  const isWide = w / h > 2
  return (
    <div className={`w-full rounded-2xl ${screenshotBg} border ${border} shadow-lg ${isWide ? 'px-6 py-10' : 'p-6'}`}>
      <div className="rounded-xl overflow-hidden shadow-sm">
        <Image
          src={`/landing-features/${src}`}
          alt={alt}
          width={w}
          height={h}
          className="w-full h-auto block"
          sizes="(max-width: 1024px) 100vw, 50vw"
        />
      </div>
    </div>
  )
}

// ─── Standard subsection (single image) ──────────────────────────────────────

function StandardSubsection({ cfg }: { cfg: SubsectionConfig }) {
  const textCol = (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-2">
        <cfg.Icon className={`w-4 h-4 ${cfg.accentText}`} strokeWidth={2} />
        <span className={`text-xs font-mono tracking-widest uppercase ${cfg.accentText} opacity-70`}>
          {cfg.step}
        </span>
      </div>
      <h3 className="text-2xl font-bold text-gray-900 leading-snug">{cfg.heading}</h3>
      <ul className="flex flex-col gap-4">
        {cfg.bullets.map((b, i) => (
          <li key={i} className="flex items-start gap-3 text-sm text-gray-600 leading-relaxed">
            <Check className={`w-4 h-4 ${cfg.accentIcon} mt-0.5 flex-shrink-0`} strokeWidth={2.5} />
            <span>{b.text}</span>
          </li>
        ))}
      </ul>
    </div>
  )

  const imageCol = (
    <ScreenshotCard
      src={cfg.images[0]}
      alt={cfg.heading?.toString() ?? cfg.step}
      screenshotBg={cfg.screenshotBg}
      border={cfg.border}
    />
  )

  return (
    <section className={`${cfg.bg} border-t border-gray-100`}>
      <div className="max-w-6xl mx-auto px-6 py-20 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        {cfg.layout === 'text-left' ? (
          <>
            {textCol}
            {imageCol}
          </>
        ) : (
          <>
            <div className="order-2 lg:order-1">{imageCol}</div>
            <div className="order-1 lg:order-2">{textCol}</div>
          </>
        )}
      </div>
    </section>
  )
}

// ─── Multi-image subsection (subsection 2: "Build each concept") ──────────────

function MultiImageSubsection({ cfg }: { cfg: SubsectionConfig }) {
  const [active, setActive] = useState(0)

  const textCol = (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-2">
        <cfg.Icon className={`w-4 h-4 ${cfg.accentText}`} strokeWidth={2} />
        <span className={`text-xs font-mono tracking-widest uppercase ${cfg.accentText} opacity-70`}>
          {cfg.step}
        </span>
      </div>
      <h3 className="text-2xl font-bold text-gray-900 leading-snug">{cfg.heading}</h3>
      <ul className="flex flex-col gap-3">
        {cfg.bullets.map((b, i) => (
          <li
            key={i}
            onMouseEnter={() => setActive(i)}
            className={`flex items-start gap-3 text-sm leading-relaxed cursor-pointer px-3 py-2 rounded-lg transition-colors duration-200 border ${
              active === i
                ? `${cfg.screenshotBg} ${cfg.border} text-gray-800`
                : `border-transparent text-gray-500 hover:bg-teal-50/30 hover:text-gray-700`
            }`}
          >
            <Check
              className={`w-4 h-4 mt-0.5 flex-shrink-0 transition-colors duration-200 ${
                active === i ? cfg.accentIcon : 'text-gray-300'
              }`}
              strokeWidth={2.5}
            />
            <span>{b.text}</span>
          </li>
        ))}
      </ul>
    </div>
  )

  // Determine which image to show based on active bullet
  const activeImageIndex = cfg.bullets[active]?.imageIndex ?? 0

  const imageCol = (
    <div className="grid">
      {cfg.images.map((img, i) => (
        <div
          key={img}
          style={{ gridArea: '1 / 1' }}
          className={`flex items-center transition-opacity duration-300 ease-in-out ${
            i === activeImageIndex ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        >
          <ScreenshotCard
            src={img}
            alt={`${cfg.step} screenshot ${i + 1}`}
            screenshotBg={cfg.screenshotBg}
            border={cfg.border}
          />
        </div>
      ))}
    </div>
  )

  return (
    <section className={`${cfg.bg} border-t border-gray-100`}>
      <div className="max-w-6xl mx-auto px-6 py-20 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        {cfg.layout === 'text-left' ? (
          <>
            {textCol}
            {imageCol}
          </>
        ) : (
          <>
            <div className="order-2 lg:order-1">{imageCol}</div>
            <div className="order-1 lg:order-2">{textCol}</div>
          </>
        )}
      </div>
    </section>
  )
}

// ─── Section data ─────────────────────────────────────────────────────────────

const SUBSECTIONS: (SubsectionConfig & { multi?: boolean })[] = [
  {
    step: '01',
    heading: (
      <>
        Create <K cls="text-sky-700">concepts</K>
      </>
    ),
    bullets: [
      {
        text: (
          <>
            Create new <K cls="text-sky-700">concepts</K> with simple, flexible{' '}
            <K cls="text-sky-700">metadata</K>
          </>
        ),
      },
      {
        text: (
          <>
            Add <K cls="text-sky-700">subjects</K>, <K cls="text-sky-700">topics</K>, and{' '}
            <K cls="text-sky-700">tags</K> to keep your knowledge organized from the start
          </>
        ),
      },
    ],
    images: ['concept-modal.png'],
    bg: 'bg-sky-50/50',
    border: 'border-sky-200',
    accentText: 'text-sky-700',
    accentBorder: 'border-sky-400',
    accentIcon: 'text-sky-500',
    screenshotBg: 'bg-sky-100/80',
    Icon: PenLine,
    layout: 'text-left',
  },
  {
    step: '02',
    heading: (
      <>
        Build each <K cls="text-teal-700">concept</K>
      </>
    ),
    bullets: [
      {
        text: (
          <>
            Update concept <K cls="text-teal-700">status</K> for targeted{' '}
            <K cls="text-teal-700">review</K> and <K cls="text-teal-700">statistics</K>
          </>
        ),
        imageIndex: 0,
      },
      {
        text: (
          <>
            Add a compact <K cls="text-teal-700">MVK</K> for quick reviews and better{' '}
            <K cls="text-teal-700">retention</K>
          </>
        ),
        imageIndex: 1,
      },
      {
        text: (
          <>
            Write structured notes with <K cls="text-teal-700">Markdown</K> — a simple, portable,
            and <K cls="text-teal-700">AI-friendly</K> format
          </>
        ),
        imageIndex: 2,
      },
    ],
    images: ['concept-view.png', 'mvk.png', 'markdown-notes.png'],
    bg: 'bg-teal-50/50',
    border: 'border-teal-200',
    accentText: 'text-teal-700',
    accentBorder: 'border-teal-400',
    accentIcon: 'text-teal-500',
    screenshotBg: 'bg-teal-100/80',
    Icon: Layers2,
    layout: 'text-right',
    multi: true,
  },
  {
    step: '03',
    heading: (
      <>
        Organize and review your <K cls="text-emerald-700">library</K>
      </>
    ),
    bullets: [
      {
        text: (
          <>
            <K cls="text-emerald-700">Organize</K> your concepts with{' '}
            <K cls="text-emerald-700">search</K>, <K cls="text-emerald-700">sorting</K>, and{' '}
            <K cls="text-emerald-700">filtering</K> — keeping your library{' '}
            <K cls="text-emerald-700">maintainable</K> as it grows
          </>
        ),
      },
      {
        text: (
          <>
            <K cls="text-emerald-700">Review</K> concepts directly from the{' '}
            <K cls="text-emerald-700">Library</K> while updating their status
          </>
        ),
      },
    ],
    images: ['library-view.png'],
    bg: 'bg-emerald-50/50',
    border: 'border-emerald-200',
    accentText: 'text-emerald-700',
    accentBorder: 'border-emerald-400',
    accentIcon: 'text-emerald-500',
    screenshotBg: 'bg-emerald-100/80',
    Icon: LayoutList,
    layout: 'text-left',
  },
  {
    step: '04',
    heading: (
      <>
        Review one concept <K cls="text-amber-700">at a time</K>
      </>
    ),
    bullets: [
      {
        text: (
          <>
            Use <K cls="text-amber-700">Focus</K> mode for more in-depth review
          </>
        ),
      },
      {
        text: (
          <>
            Show or hide <K cls="text-amber-700">MVK</K>, <K cls="text-amber-700">notes</K>, and{' '}
            <K cls="text-amber-700">references</K> as needed
          </>
        ),
      },
    ],
    images: ['focus-view.png'],
    bg: 'bg-amber-50/50',
    border: 'border-amber-200',
    accentText: 'text-amber-700',
    accentBorder: 'border-amber-400',
    accentIcon: 'text-amber-500',
    screenshotBg: 'bg-amber-100/80',
    Icon: Target,
    layout: 'text-right',
  },
  {
    step: '05',
    heading: (
      <>
        Skim concepts at <K cls="text-orange-700">high speed</K>
      </>
    ),
    bullets: [
      {
        text: (
          <>
            Use <K cls="text-orange-700">Index</K> mode for ultra-fast review across many concepts
          </>
        ),
      },
      {
        text: (
          <>
            Move quickly through your knowledge with <K cls="text-orange-700">minimal friction</K>
          </>
        ),
      },
    ],
    images: ['index-view.png'],
    bg: 'bg-orange-50/50',
    border: 'border-orange-200',
    accentText: 'text-orange-700',
    accentBorder: 'border-orange-400',
    accentIcon: 'text-orange-500',
    screenshotBg: 'bg-orange-100/80',
    Icon: Zap,
    layout: 'text-left',
  },
  {
    step: '06',
    heading: (
      <>
        Review by <K cls="text-sky-700">subject</K>
      </>
    ),
    bullets: [
      {
        text: (
          <>
            Open a <K cls="text-sky-700">subject</K> and review all related concepts in one place
          </>
        ),
      },
      {
        text: (
          <>
            Create your own <K cls="text-sky-700">concept order</K> so concepts build on each other more intuitively
          </>
        ),
      },
    ],
    images: ['subject-view.png'],
    bg: 'bg-sky-50/40',
    border: 'border-sky-200',
    accentText: 'text-sky-700',
    accentBorder: 'border-sky-400',
    accentIcon: 'text-sky-500',
    screenshotBg: 'bg-sky-100/80',
    Icon: FolderOpen,
    layout: 'text-right',
  },
  {
    step: '07',
    heading: (
      <>
        Log <K cls="text-slate-600">study sessions</K>
      </>
    ),
    bullets: [
      {
        text: (
          <>
            Keep track of your <K cls="text-slate-600">study time</K> and build consistency
          </>
        ),
      },
      {
        text: (
          <>
            Log <K cls="text-slate-600">study sessions</K> by subject and keep a{' '}
            <K cls="text-slate-600">history</K> of your efforts
          </>
        ),
      },
    ],
    images: ['session-view.png'],
    bg: 'bg-slate-100/60',
    border: 'border-slate-200',
    accentText: 'text-slate-600',
    accentBorder: 'border-slate-400',
    accentIcon: 'text-slate-500',
    screenshotBg: 'bg-slate-200/60',
    Icon: Clock,
    layout: 'text-left',
  },
  {
    step: '08',
    heading: (
      <>
        Track your <K cls="text-teal-700">progress</K>
      </>
    ),
    bullets: [
      {
        text: (
          <>
            View study <K cls="text-teal-700">activity</K>, concept{' '}
            <K cls="text-teal-700">inventory</K>, and metadata{' '}
            <K cls="text-teal-700">catalogue</K> in one place
          </>
        ),
      },
      {
        text: (
          <>
            Keep meaningful <K cls="text-teal-700">statistics</K> that support{' '}
            <K cls="text-teal-700">long-term learning</K>
          </>
        ),
      },
    ],
    images: ['overview-view.png'],
    bg: 'bg-teal-50/40',
    border: 'border-teal-200',
    accentText: 'text-teal-700',
    accentBorder: 'border-teal-400',
    accentIcon: 'text-teal-500',
    screenshotBg: 'bg-teal-100/80',
    Icon: BarChart2,
    layout: 'text-right',
  },
]

// ─── Main export ──────────────────────────────────────────────────────────────

export default function FeaturesSection() {
  return (
    <>
      {SUBSECTIONS.map((cfg) =>
        cfg.multi ? (
          <MultiImageSubsection key={cfg.step} cfg={cfg} />
        ) : (
          <StandardSubsection key={cfg.step} cfg={cfg} />
        )
      )}
    </>
  )
}
