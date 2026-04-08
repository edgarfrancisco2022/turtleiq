'use client'

import { useState, useRef, useEffect } from 'react'
import type { ConceptState, ConceptPriority } from '@/lib/types'

export const STATES: ConceptState[] = ['NEW', 'LEARNING', 'REVIEWING', 'MEMORIZING', 'STORED']
export const PRIORITIES: ConceptPriority[] = ['LOW', 'MEDIUM', 'HIGH']

export const STATE_STYLES: Record<ConceptState, string> = {
  NEW: 'bg-slate-100 text-slate-700',
  LEARNING: 'bg-blue-50 text-blue-700',
  REVIEWING: 'bg-amber-50 text-amber-700',
  MEMORIZING: 'bg-teal-50 text-teal-700',
  STORED: 'bg-emerald-50 text-emerald-700',
}

export const PRIORITY_STYLES: Record<ConceptPriority, string> = {
  LOW: 'bg-slate-100 text-slate-700',
  MEDIUM: 'bg-amber-50 text-amber-600',
  HIGH: 'bg-red-50 text-red-600',
}

const ChevronIcon = () => (
  <svg
    className="w-2.5 h-2.5 flex-shrink-0"
    viewBox="0 0 10 7"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M1 1.5l4 4 4-4" />
  </svg>
)

function useClickOutside(
  ref: React.RefObject<HTMLElement | null>,
  handler: () => void,
  enabled: boolean
) {
  useEffect(() => {
    if (!enabled) return
    function onDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) handler()
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [ref, handler, enabled])
}

let _dpCounter = 0
function useStableId() {
  const ref = useRef<string | null>(null)
  if (!ref.current) ref.current = `dp-${++_dpCounter}`
  return ref.current
}

interface DropdownPillProps<T extends string> {
  options: T[]
  value: T
  onChange: (value: T) => void
  styleMap: Record<T, string>
  alignRight?: boolean
}

function DropdownPill<T extends string>({
  options,
  value,
  onChange,
  styleMap,
  alignRight = false,
}: DropdownPillProps<T>) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const id = useStableId()

  useClickOutside(ref, () => setOpen(false), open)

  useEffect(() => {
    function onOtherOpen(e: Event) {
      if ((e as CustomEvent).detail?.id !== id) setOpen(false)
    }
    window.addEventListener('tiq:dropdown', onOtherOpen)
    return () => window.removeEventListener('tiq:dropdown', onOtherOpen)
  }, [id])

  function handleToggle(e: React.MouseEvent) {
    e.stopPropagation()
    e.preventDefault()
    const next = !open
    if (next) window.dispatchEvent(new CustomEvent('tiq:dropdown', { detail: { id } }))
    setOpen(next)
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onMouseDown={(e) => e.stopPropagation()}
        onClick={handleToggle}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`${value || options[0]}, change value`}
        className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full transition-opacity hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-1 ${styleMap[value] || styleMap[options[0]]}`}
      >
        {value || options[0]}
        <ChevronIcon aria-hidden="true" />
      </button>

      {open && (
        <div
          role="listbox"
          aria-label="Select an option"
          className={`absolute z-50 top-full mt-1.5 ${alignRight ? 'right-0' : 'left-0'} bg-white border border-gray-200 rounded-xl shadow-xl py-1.5 min-w-[148px]`}
        >
          <div className="flex flex-col gap-0.5 px-1.5">
            {options.map((opt) => (
              <button
                key={opt}
                type="button"
                role="option"
                aria-selected={value === opt}
                onMouseDown={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                }}
                onClick={(e) => {
                  e.stopPropagation()
                  e.preventDefault()
                  onChange(opt)
                  setOpen(false)
                }}
                className={`flex items-center gap-2 w-full px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${styleMap[opt]} ${value === opt ? 'ring-1 ring-current ring-inset' : 'opacity-70 hover:opacity-100'}`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${value === opt ? 'bg-current' : 'opacity-0'}`}
                  aria-hidden="true"
                />
                {opt}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export function StateSelector({
  value = 'NEW',
  onChange,
}: {
  value?: ConceptState
  onChange: (v: ConceptState) => void
}) {
  return (
    <DropdownPill
      options={STATES}
      value={value ?? 'NEW'}
      onChange={onChange}
      styleMap={STATE_STYLES}
    />
  )
}

export function PriorityBadge({
  value = 'MEDIUM',
  onChange,
}: {
  value?: ConceptPriority
  onChange: (v: ConceptPriority) => void
}) {
  return (
    <DropdownPill
      options={PRIORITIES}
      value={value ?? 'MEDIUM'}
      onChange={onChange}
      styleMap={PRIORITY_STYLES}
      alignRight
    />
  )
}

export function ReviewCounter({
  count = 0,
  onIncrement,
  onDecrement,
}: {
  count?: number
  onIncrement: () => void
  onDecrement?: () => void
}) {
  const n = count ?? 0
  return (
    <div className="flex items-center gap-0.5">
      <button
        type="button"
        onMouseDown={(e) => e.stopPropagation()}
        onClick={(e) => {
          e.stopPropagation()
          e.preventDefault()
          if (n > 0) onDecrement?.()
        }}
        disabled={n === 0}
        className="w-5 h-5 flex items-center justify-center text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors text-sm font-bold leading-none disabled:opacity-25 disabled:pointer-events-none"
        title="Decrement review count"
      >
        −
      </button>
      <span className="text-xs text-gray-500 tabular-nums min-w-[1.25rem] text-center">{n}</span>
      <button
        type="button"
        onMouseDown={(e) => e.stopPropagation()}
        onClick={(e) => {
          e.stopPropagation()
          e.preventDefault()
          onIncrement()
        }}
        className="w-5 h-5 flex items-center justify-center text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors text-sm font-bold leading-none"
        title="Increment review count"
      >
        +
      </button>
    </div>
  )
}

export function PinIcon({ size = 12, className = '' }: { size?: number; className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="currentColor"
      width={size}
      height={size}
      className={className}
      aria-hidden="true"
    >
      <path d="M4.146.146A.5.5 0 0 1 4.5 0h7a.5.5 0 0 1 .5.5c0 .68-.34 1.197-.756 1.564-.159.14-.32.251-.476.34l.3 2.521c.498.28 1.096.71 1.565 1.43C13.566 7.163 14 8.296 14 9.5a.5.5 0 0 1-.5.5h-4v4.5c0 .276-.224 1.5-.5 1.5s-.5-1.224-.5-1.5V10h-4a.5.5 0 0 1-.5-.5c0-1.204.434-2.337.865-3.06.47-.719 1.067-1.149 1.565-1.43l.298-2.52a3.4 3.4 0 0 1-.476-.34C2.34 1.697 2 1.18 2 .5a.5.5 0 0 1 .146-.354z" />
    </svg>
  )
}

export function PinButton({
  pinned,
  onToggle,
}: {
  pinned: boolean
  onToggle: () => void
}) {
  return (
    <button
      type="button"
      onMouseDown={(e) => e.stopPropagation()}
      onClick={(e) => {
        e.stopPropagation()
        e.preventDefault()
        onToggle()
      }}
      title={pinned ? 'Unpin concept' : 'Pin concept'}
      className={`inline-flex items-center justify-center transition-colors focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-1 rounded ${pinned ? 'text-amber-400' : 'text-gray-300 hover:text-amber-300'}`}
      aria-label={pinned ? 'Unpin concept' : 'Pin concept'}
      aria-pressed={pinned}
    >
      <PinIcon size={14} />
    </button>
  )
}
