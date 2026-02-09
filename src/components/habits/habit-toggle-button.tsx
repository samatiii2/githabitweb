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

  return (
    <button
      onClick={(e) => { e.preventDefault(); e.stopPropagation(); onClick() }}
      className={cn(
        dim,
        'rounded-lg flex items-center justify-center shrink-0 transition-all duration-200 active:scale-90',
        isCompleted
          ? 'shadow-lg'
          : isSkipped
            ? ''
            : 'border-2 hover:border-opacity-60'
      )}
      style={{
        backgroundColor: isCompleted ? colorHex : isSkipped ? '#f59e0b' : 'transparent',
        borderColor: !isCompleted && !isSkipped ? `${colorHex}40` : undefined,
        boxShadow: isCompleted ? `0 0 12px ${colorHex}30` : undefined,
      }}
    >
      {isCompleted ? (
        <Check className={iconSize} style={{ color: '#fff' }} strokeWidth={3} />
      ) : isSkipped ? (
        <Pause className={iconSize} style={{ color: '#fff' }} strokeWidth={3} />
      ) : (
        <div
          className={cn(size === 'sm' ? 'w-2 h-2' : 'w-2.5 h-2.5', 'rounded-full')}
          style={{ backgroundColor: `${colorHex}30` }}
        />
      )}
    </button>
  )
}
