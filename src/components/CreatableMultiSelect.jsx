import { useState, useRef, useEffect } from 'react'

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
  const containerRef = useRef(null)

  const filtered = options.filter(
    opt =>
      opt.toLowerCase().includes(input.toLowerCase()) &&
      !selected.includes(opt)
  )

  const canCreate =
    input.trim().length > 0 &&
    !options.find(o => o.toLowerCase() === input.trim().toLowerCase()) &&
    !selected.includes(input.trim())

  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

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

  return (
    <div ref={containerRef}>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>

      <div className="relative">
        {/* Input container */}
        <div
          className="min-h-[38px] border border-gray-300 rounded-lg px-2 py-1 flex flex-wrap gap-1 items-center cursor-text focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-transparent bg-white"
          onClick={() => {
            setIsOpen(true)
            containerRef.current?.querySelector('input')?.focus()
          }}
        >
          {selected.map(s => (
            <span
              key={s}
              className="flex items-center gap-1 bg-indigo-100 text-indigo-800 text-xs px-2 py-0.5 rounded-full"
            >
              {s}
              <button
                type="button"
                onClick={e => {
                  e.stopPropagation()
                  remove(s)
                }}
                className="text-indigo-500 hover:text-indigo-800 leading-none"
              >
                ×
              </button>
            </span>
          ))}
          <input
            type="text"
            value={input}
            onChange={e => {
              setInput(e.target.value)
              setIsOpen(true)
            }}
            onFocus={() => setIsOpen(true)}
            onKeyDown={handleKeyDown}
            placeholder={selected.length === 0 ? placeholder : ''}
            className="flex-1 min-w-[100px] text-sm outline-none bg-transparent py-0.5"
          />
        </div>

        {/* Dropdown */}
        {isOpen && (filtered.length > 0 || canCreate) && (
          <ul className="absolute left-0 right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-20 max-h-44 overflow-y-auto">
            {filtered.map(opt => (
              <li
                key={opt}
                onMouseDown={e => {
                  e.preventDefault()
                  add(opt)
                }}
                className="px-3 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 cursor-pointer"
              >
                {opt}
              </li>
            ))}
            {canCreate && (
              <li
                onMouseDown={e => {
                  e.preventDefault()
                  add(input.trim())
                }}
                className="px-3 py-2 text-sm text-indigo-600 hover:bg-indigo-50 cursor-pointer font-medium"
              >
                + Create &ldquo;{input.trim()}&rdquo;
              </li>
            )}
          </ul>
        )}
      </div>
    </div>
  )
}
