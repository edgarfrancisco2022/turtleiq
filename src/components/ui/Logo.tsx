import { Library } from 'lucide-react'

type LogoVariant = 'nav' | 'sidebar' | 'auth' | 'footer' | 'decorative' | 'error'

interface LogoProps {
  variant?: LogoVariant
}

export default function Logo({ variant = 'nav' }: LogoProps) {
  if (variant === 'decorative') {
    return <Library className="w-16 h-16 text-teal-500" strokeWidth={1.5} />
  }

  if (variant === 'error') {
    return <Library className="w-10 h-10 text-teal-600" strokeWidth={1.5} />
  }

  if (variant === 'footer') {
    return (
      <span className="flex items-center gap-1.5">
        <Library className="w-3.5 h-3.5 text-teal-700" strokeWidth={1.75} />
        <span className="font-medium tracking-tight">
          <span className="text-gray-900">Tortuga</span>
          <span className="text-teal-700">IQ</span>
        </span>
      </span>
    )
  }

  if (variant === 'sidebar') {
    return (
      <span className="flex items-center gap-2">
        <Library className="w-5 h-5 text-teal-400" strokeWidth={1.75} />
        <span className="font-semibold text-[15px] tracking-tight">
          <span className="text-white">Tortuga</span>
          <span className="text-teal-400">IQ</span>
        </span>
      </span>
    )
  }

  if (variant === 'auth') {
    return (
      <span className="flex items-center gap-2.5">
        <Library className="w-8 h-8 text-teal-700" strokeWidth={1.5} />
        <span className="font-semibold text-2xl tracking-tight">
          <span className="text-gray-900">Tortuga</span>
          <span className="text-teal-700">IQ</span>
        </span>
      </span>
    )
  }

  // default: 'nav'
  return (
    <span className="flex items-center gap-2">
      <Library className="w-5 h-5 text-teal-700" strokeWidth={1.75} />
      <span className="font-semibold text-[15px] tracking-tight">
        <span className="text-gray-900">Tortuga</span>
        <span className="text-teal-700">IQ</span>
      </span>
    </span>
  )
}
