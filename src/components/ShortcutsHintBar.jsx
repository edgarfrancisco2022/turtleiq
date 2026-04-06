export default function ShortcutsHintBar({ items, className = 'mb-4' }) {
  return (
    <div className={`flex flex-wrap items-center gap-x-4 gap-y-1.5 ${className}`}>
      <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Shortcuts</span>
      {items.map(({ keyLabel, actionLabel }) => (
        <span key={keyLabel} className="flex items-center gap-1.5">
          <span className="inline-flex items-center px-1.5 py-0.5 rounded border border-gray-200 bg-gray-100 text-gray-500 text-xs font-mono leading-none">
            {keyLabel}
          </span>
          <span className="text-xs text-gray-400">{actionLabel}</span>
        </span>
      ))}
    </div>
  );
}
