import { useState, useRef, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'

export default function CreatableMultiSelect({
  label,
  required = false,
  options = [],
  selected = [],
  onChange,
  placeholder = 'Select or type to create...',
}) {
  const [input, setInput] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0, width: 0 })

  const triggerRef   = useRef(null)
  const dropdownRef  = useRef(null)

  const filtered = options.filter(
    opt =>
      opt.toLowerCase().includes(input.toLowerCase()) &&
      !selected.includes(opt)
  )

  const canCreate =
    input.trim().length > 0 &&
    !options.find(o => o.toLowerCase() === input.trim().toLowerCase()) &&
    !selected.includes(input.trim())

  const hasItems = filtered.length > 0 || canCreate

  // Compute dropdown position from trigger rect
  const updatePos = useCallback(() => {
    if (!triggerRef.current) return
    const r = triggerRef.current.getBoundingClientRect()
    setDropdownPos({ top: r.bottom + 4, left: r.left, width: r.width })
  }, [])

  useEffect(() => {
    if (!isOpen) return
    updatePos()
    window.addEventListener('scroll', updatePos, true)
    window.addEventListener('resize', updatePos)
    return () => {
      window.removeEventListener('scroll', updatePos, true)
      window.removeEventListener('resize', updatePos)
    }
  }, [isOpen, updatePos])

  // Close on outside click (trigger box OR fixed dropdown)
  useEffect(() => {
    function handleClickOutside(e) {
      const inTrigger  = triggerRef.current?.contains(e.target)
      const inDropdown = dropdownRef.current?.contains(e.target)
      if (!inTrigger && !inDropdown) setIsOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  function open() {
    updatePos()
    setIsOpen(true)
    triggerRef.current?.querySelector('input')?.focus()
  }

  function add(value) {
    onChange([...selected, value])
    setInput('')
    setIsOpen(false)
  }

  function remove(value) {
    onChange(selected.filter(s => s !== value))
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') {
      e.preventDefault()
      if (filtered.length > 0 && filtered[0].toLowerCase() === input.toLowerCase()) {
        add(filtered[0])
      } else if (canCreate) {
        add(input.trim())
      } else if (filtered.length > 0) {
        add(filtered[0])
      }
    }
    if (e.key === 'Backspace' && !input && selected.length > 0) {
      remove(selected[selected.length - 1])
    }
    if (e.key === 'Escape') {
      setIsOpen(false)
    }
  }

  const dropdown = isOpen && hasItems
    ? createPortal(
        <ul
          ref={dropdownRef}
          style={{ top: dropdownPos.top, left: dropdownPos.left, width: dropdownPos.width }}
          className="fixed bg-white border border-gray-100 rounded-lg shadow-xl z-[9999] max-h-44 overflow-y-auto py-1"
        >
          {filtered.map(opt => (
            <li
              key={opt}
              onMouseDown={e => { e.preventDefault(); add(opt) }}
              className="px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer"
            >
              {opt}
            </li>
          ))}
          {canCreate && (
            <li
              onMouseDown={e => { e.preventDefault(); add(input.trim()) }}
              className="px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50/60 cursor-pointer font-medium"
            >
              + Create &ldquo;{input.trim()}&rdquo;
            </li>
          )}
        </ul>,
        document.body
      )
    : null

  return (
    <div>
      <label className="block text-xs font-medium text-gray-700 mb-1">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>

      {/* Trigger / input box */}
      <div
        ref={triggerRef}
        className={`min-h-[34px] border rounded-md px-2 py-1 flex flex-wrap gap-1 items-center cursor-text transition-colors bg-white ${
          isOpen ? 'border-blue-500' : 'border-gray-300 hover:border-gray-400'
        }`}
        onClick={open}
      >
        {selected.map(s => (
          <span
            key={s}
            className="flex items-center gap-1 bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full"
          >
            {s}
            <button
              type="button"
              onClick={e => { e.stopPropagation(); remove(s) }}
              className="text-blue-400 hover:text-blue-700 leading-none transition-colors"
              aria-label={`Remove ${s}`}
            >
              <svg viewBox="0 0 10 10" fill="none" className="w-2 h-2" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M2 2l6 6M8 2L2 8" />
              </svg>
            </button>
          </span>
        ))}
        <input
          type="text"
          value={input}
          onChange={e => { setInput(e.target.value); setIsOpen(true) }}
          onFocus={open}
          onKeyDown={handleKeyDown}
          placeholder={selected.length === 0 ? placeholder : ''}
          className="flex-1 min-w-[100px] text-sm outline-none bg-transparent py-0.5 text-gray-800 placeholder:text-gray-400"
        />
      </div>

      {dropdown}
    </div>
  )
}
