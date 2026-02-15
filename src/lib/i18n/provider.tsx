'use client'

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react'
import { type Locale, type TranslationDict, DEFAULT_LOCALE, isLocale, translate, LOCALE_META } from '.'
import en from './en'
import fr from './fr'
import es from './es'
import ar from './ar'

const DICTIONARIES: Record<Locale, TranslationDict> = { en, fr, es, ar }

const STORAGE_KEY = 'gihabit-locale'

interface LocaleCtx {
  locale: Locale
  setLocale: (l: Locale) => void
  t: (key: string, params?: Record<string, string | number>) => string
  dir: 'ltr' | 'rtl'
}

const Ctx = createContext<LocaleCtx>({
  locale: DEFAULT_LOCALE,
  setLocale: () => {},
  t: (k) => k,
  dir: 'ltr',
})

function getSavedLocale(): Locale {
  if (typeof window === 'undefined') return DEFAULT_LOCALE
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved && isLocale(saved)) return saved
  } catch { /* noop */ }
  return DEFAULT_LOCALE
}

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(DEFAULT_LOCALE)
  const [mounted, setMounted] = useState(false)

  // Hydrate from localStorage after mount
  useEffect(() => {
    setLocaleState(getSavedLocale())
    setMounted(true)
  }, [])

  // Update html lang + dir when locale changes
  useEffect(() => {
    if (!mounted) return
    const meta = LOCALE_META[locale]
    document.documentElement.lang = locale
    document.documentElement.dir = meta.dir
  }, [locale, mounted])

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l)
    try { localStorage.setItem(STORAGE_KEY, l) } catch { /* noop */ }
  }, [])

  const t = useCallback(
    (key: string, params?: Record<string, string | number>) => {
      // Fall back to English if key missing in current locale
      const dict = DICTIONARIES[locale]
      let val = translate(dict, key, params)
      if (val === key && locale !== 'en') {
        val = translate(DICTIONARIES.en, key, params)
      }
      return val
    },
    [locale],
  )

  const dir = LOCALE_META[locale].dir

  return <Ctx.Provider value={{ locale, setLocale, t, dir }}>{children}</Ctx.Provider>
}

export function useLocale() {
  return useContext(Ctx)
}

/** Shorthand: returns just the t() function */
export function useT() {
  return useContext(Ctx).t
}
