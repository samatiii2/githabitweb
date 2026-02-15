'use client'

import { useState, useRef, useEffect } from 'react'
import { useLocale } from '@/lib/i18n/provider'
import { LOCALES, LOCALE_META } from '@/lib/i18n'
import { Languages } from 'lucide-react'

interface Props {
  /** Compact mode shows a small button that opens a dropdown */
  compact?: boolean
  className?: string
}

export function LanguageSwitcher({ compact, className }: Props) {
  const { locale, setLocale } = useLocale()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  // Close on click outside
  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  if (compact) {
    return (
      <div className={`relative ${className ?? ''}`} ref={ref}>
        <button
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          onClick={() => setOpen(o => !o)}
          title="Change language"
        >
          <Languages className="w-3.5 h-3.5" />
          <span className="uppercase font-medium">{locale}</span>
        </button>

        {open && (
          <div className="absolute top-full right-0 mt-1.5 w-44 bg-popover border border-border rounded-xl shadow-xl py-1.5 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
            {LOCALES.map((l) => {
              const meta = LOCALE_META[l]
              const isActive = l === locale
              return (
                <button
                  key={l}
                  onClick={() => { setLocale(l); setOpen(false) }}
                  className={`w-full flex items-center gap-2.5 px-3.5 py-2 text-sm transition-colors ${
                    isActive
                      ? 'text-primary bg-primary/5 font-medium'
                      : 'text-foreground hover:bg-accent'
                  }`}
                >
                  <span className="text-base">{meta.flag}</span>
                  <span>{meta.label}</span>
                  {isActive && <span className="ml-auto text-primary text-xs">✓</span>}
                </button>
              )
            })}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className={`flex flex-wrap gap-2 ${className ?? ''}`}>
      {LOCALES.map((l) => {
        const meta = LOCALE_META[l]
        const isActive = l === locale
        return (
          <button
            key={l}
            onClick={() => setLocale(l)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
              isActive
                ? 'bg-primary/10 text-primary ring-1 ring-primary/20'
                : 'bg-secondary/50 text-muted-foreground hover:bg-secondary hover:text-foreground'
            }`}
          >
            <span className="text-base">{meta.flag}</span>
            <span>{meta.label}</span>
          </button>
        )
      })}
    </div>
  )
}
