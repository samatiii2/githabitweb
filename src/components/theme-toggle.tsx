'use client'

import { useTheme } from 'next-themes'
import { Sun, Moon } from 'lucide-react'
import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

interface ThemeToggleProps {
  collapsed?: boolean
}

export function ThemeToggle({ collapsed }: ThemeToggleProps) {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  if (!mounted) {
    return collapsed ? (
      <div className="w-full flex items-center justify-center p-2">
        <div className="w-5 h-5" />
      </div>
    ) : (
      <div className="flex items-center gap-1 bg-secondary rounded-lg p-0.5 h-8" />
    )
  }

  if (collapsed) {
    const isDark = theme === 'dark'
    const Icon = isDark ? Moon : Sun
    return (
      <button
        onClick={() => setTheme(isDark ? 'light' : 'dark')}
        title={isDark ? 'Dark mode' : 'Light mode'}
        className="w-full flex items-center justify-center p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
      >
        <Icon className="w-4 h-4" />
      </button>
    )
  }

  return (
    <div className="flex items-center gap-1 bg-secondary rounded-lg p-0.5">
      {([
        { value: 'light', icon: Sun, label: 'Light' },
        { value: 'dark', icon: Moon, label: 'Dark' },
      ] as const).map(({ value, icon: Icon, label }) => (
        <button
          key={value}
          onClick={() => setTheme(value)}
          title={label}
          className={cn(
            'flex-1 flex items-center justify-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium transition-all',
            theme === value
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          <Icon className="w-3 h-3" />
          {label}
        </button>
      ))}
    </div>
  )
}

/** Compact icon-only toggle for headers/toolbars */
export function ThemeToggleIcon() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  if (!mounted) return <div className="w-8 h-8" />

  const isDark = theme === 'dark'
  const Icon = isDark ? Moon : Sun

  return (
    <button
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className="w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
    >
      <Icon className="w-4 h-4" />
    </button>
  )
}
