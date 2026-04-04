import { useState, useRef, useEffect } from 'react'

export const STATES = ['NEW', 'LEARNING', 'REVIEWING', 'MEMORIZING', 'STORED']
export const PRIORITIES = ['LOW', 'MEDIUM', 'HIGH']

export const STATE_STYLES = {
  NEW:        'bg-slate-100 text-slate-700',
  LEARNING:   'bg-blue-50 text-blue-700',
  REVIEWING:  'bg-amber-50 text-amber-700',
  MEMORIZING: 'bg-purple-50 text-purple-700',
  STORED:     'bg-emerald-50 text-emerald-700',
}

export const PRIORITY_STYLES = {
  LOW:    'bg-slate-100 text-slate-700',
  MEDIUM: 'bg-amber-50 text-amber-600',
  HIGH:   'bg-rose-50 text-rose-600',
}

const ChevronIcon = () => (
  <svg className="w-2.5 h-2.5 flex-shrink-0" viewBox="0 0 10 7" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 1.5l4 4 4-4" />
  </svg>
)

function useClickOutside(ref, handler, enabled) {
  useEffect(() => {
    if (!enabled) return
    function onDown(e) {
      if (ref.current && !ref.current.contains(e.target)) handler()
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [ref, handler, enabled])
}

let _dpCounter = 0
function useStableId() {
  const ref = useRef(null)
  if (!ref.current) ref.current = `dp-${++_dpCounter}`
  return ref.current
}

function DropdownPill({ options, value, onChange, styleMap, alignRight = false }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const id = useStableId()

  useClickOutside(ref, () => setOpen(false), open)

  // Close when another dropdown opens
  useEffect(() => {
    function onOtherOpen(e) {
      if (e.detail?.id !== id) setOpen(false)
    }
    window.addEventListener('tiq:dropdown', onOtherOpen)
    return () => window.removeEventListener('tiq:dropdown', onOtherOpen)
  }, [id])

  function handleToggle(e) {
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
        onMouseDown={e => e.stopPropagation()}
        onClick={handleToggle}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`${value || options[0]}, change value`}
        className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full transition-opacity hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-1 ${styleMap[value] || styleMap[options[0]]}`}
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
            {options.map(opt => (
              <button
                key={opt}
                type="button"
                role="option"
                aria-selected={value === opt}
                onMouseDown={e => { e.preventDefault(); e.stopPropagation() }}
                onClick={e => { e.stopPropagation(); e.preventDefault(); onChange(opt); setOpen(false) }}
                className={`flex items-center gap-2 w-full px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${styleMap[opt]} ${value === opt ? 'ring-1 ring-current ring-inset' : 'opacity-70 hover:opacity-100'}`}
              >
                <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${value === opt ? 'bg-current' : 'opacity-0'}`} aria-hidden="true" />
                {opt}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export function StateSelector({ value = 'NEW', onChange }) {
  return (
    <DropdownPill
      options={STATES}
      value={value ?? 'NEW'}
      onChange={onChange}
      styleMap={STATE_STYLES}
    />
  )
}

export function PriorityBadge({ value = 'MEDIUM', onChange }) {
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

export function ReviewCounter({ count = 0, onIncrement, onDecrement }) {
  const n = count ?? 0
  return (
    <div className="flex items-center gap-0.5">
      <button
        type="button"
        onMouseDown={e => e.stopPropagation()}
        onClick={e => { e.stopPropagation(); e.preventDefault(); if (n > 0) onDecrement?.() }}
        disabled={n === 0}
        className="w-5 h-5 flex items-center justify-center text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors text-sm font-bold leading-none disabled:opacity-25 disabled:pointer-events-none"
        title="Decrement review count"
      >
        −
      </button>
      <span className="text-xs text-gray-500 tabular-nums min-w-[1.25rem] text-center">{n}</span>
      <button
        type="button"
        onMouseDown={e => e.stopPropagation()}
        onClick={e => { e.stopPropagation(); e.preventDefault(); onIncrement() }}
        className="w-5 h-5 flex items-center justify-center text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors text-sm font-bold leading-none"
        title="Increment review count"
      >
        +
      </button>
    </div>
  )
}

export function PinButton({ pinned, onToggle }) {
  return (
    <button
      type="button"
      onMouseDown={e => e.stopPropagation()}
      onClick={e => { e.stopPropagation(); e.preventDefault(); onToggle() }}
      className={`text-base leading-none transition-colors focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-1 rounded ${pinned ? 'text-amber-400' : 'text-gray-300 hover:text-amber-300'}`}
      aria-label={pinned ? 'Unpin concept' : 'Pin concept'}
      aria-pressed={pinned}
    >
      <span aria-hidden="true">★</span>
    </button>
  )
}
