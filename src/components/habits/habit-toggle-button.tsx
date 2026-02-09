'use client'

import { Check, Pause } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Props {
  colorHex: string
  isCompleted: boolean
  isSkipped: boolean
  onClick: () => void
  size?: 'sm' | 'md'
}

export function HabitToggleButton({ colorHex, isCompleted, isSkipped, onClick, size = 'md' }: Props) {
  const dim = size === 'sm' ? 'w-7 h-7' : 'w-9 h-9'
  const iconSize = size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'

  const bg = isCompleted
    ? colorHex
    : isSkipped
      ? '#FF9F5A'
      : `${colorHex}20`

  const fg = isCompleted || isSkipped ? '#fff' : `${colorHex}50`

  return (
    <button
      onClick={(e) => { e.preventDefault(); e.stopPropagation(); onClick() }}
      className={cn(
        dim,
        'rounded-lg flex items-center justify-center shrink-0 transition-all active:scale-90',
      )}
      style={{ backgroundColor: bg }}
    >
      {isCompleted ? (
        <Check className={iconSize} style={{ color: fg }} strokeWidth={3} />
      ) : isSkipped ? (
        <Pause className={iconSize} style={{ color: fg }} strokeWidth={3} />
      ) : (
        <Check className={iconSize} style={{ color: fg }} strokeWidth={3} />
      )}
    </button>
  )
}
