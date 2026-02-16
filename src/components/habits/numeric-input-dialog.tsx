'use client'

import { useState, useEffect, useRef, useCallback, useMemo, type ReactNode } from 'react'
import { Popover, PopoverContent, PopoverAnchor } from '@/components/ui/popover'
import { DynamicIcon } from '@/components/dynamic-icon'
import { useT } from '@/lib/i18n/provider'
import { cn } from '@/lib/utils'
import { Minus, Plus, Check, CheckCircle2, ChevronLeft } from 'lucide-react'
import { startOfWeek, endOfWeek, format } from 'date-fns'
import type { Habit, HabitEntry, HabitSession } from '@/lib/types/database'

/* ------------------------------------------------------------------ */
/*  Unified HabitInputPopover                                          */
/*  Wraps any trigger (toggle button, calendar cell).                  */
/*  Combines session picker + numeric input in one attached popover.   */
/*                                                                     */
/*  Flow:                                                              */
/*    Sessions only  → session list → select → done                    */
/*    Numeric only   → numeric input → confirm → done                  */
/*    Sessions+Num   → session list → select → numeric input → done    */
/*    Boolean        → passthrough (no popover)                        */
/* ------------------------------------------------------------------ */

interface Props {
  children: ReactNode
  habit: Habit
  date: string
  entries: HabitEntry[]
  hasEntry: boolean
  onPassthrough: () => void
  onSubmit: (opts: { sessionId?: string; value?: number }) => void
}

export function NumericInputPopover({
  children, habit, date, entries, hasEntry,
  onPassthrough, onSubmit,
}: Props) {
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState<'sessions' | 'numeric'>('sessions')
  const [pickedSession, setPickedSession] = useState<{ id: string; label: string } | null>(null)

  const sessions = (habit.sessions as HabitSession[]) ?? []
  const hasSessions = sessions.length > 0
  const isNumeric = habit.tracking_type === 'numeric'
  const needsPopover = !hasEntry && (hasSessions || isNumeric)

  // Reset step when popover opens
  useEffect(() => {
    if (open) {
      setPickedSession(null)
      setStep(hasSessions ? 'sessions' : 'numeric')
    }
  }, [open, hasSessions])

  const handleCapture = useCallback((e: React.MouseEvent) => {
    if (needsPopover) {
      e.stopPropagation()
      e.preventDefault()
      setOpen(true)
    }
  }, [needsPopover])

  const handleSelectSession = useCallback((session: { id: string; label: string }) => {
    if (isNumeric) {
      setPickedSession(session)
      setStep('numeric')
    } else {
      onSubmit({ sessionId: session.id })
      setOpen(false)
    }
  }, [isNumeric, onSubmit])

  const handleNumericConfirm = useCallback((value: number) => {
    onSubmit({ sessionId: pickedSession?.id, value })
    setOpen(false)
  }, [pickedSession, onSubmit])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverAnchor asChild>
        <div className="inline-flex" onClickCapture={handleCapture}>
          {children}
        </div>
      </PopoverAnchor>
      <PopoverContent
        className="w-[280px] p-0 shadow-xl border-border"
        side="bottom"
        align="center"
        sideOffset={8}
        collisionPadding={16}
        onOpenAutoFocus={e => e.preventDefault()}
      >
        {/* Header — always visible */}
        <PopoverHeader habit={habit} date={date} />

        {step === 'sessions' && (
          <SessionStep
            habit={habit}
            entries={entries}
            date={date}
            onSelect={handleSelectSession}
          />
        )}

        {step === 'numeric' && (
          <NumericStep
            habit={habit}
            sessionLabel={pickedSession?.label}
            onSubmit={handleNumericConfirm}
            onBack={hasSessions ? () => { setStep('sessions'); setPickedSession(null) } : undefined}
          />
        )}
      </PopoverContent>
    </Popover>
  )
}

/* ------------------------------------------------------------------ */
/*  Standalone content — for custom Popover instances (e.g. SVG cells) */
/* ------------------------------------------------------------------ */

interface ContentProps {
  habit: Habit
  date: string
  entries: HabitEntry[]
  onSubmit: (opts: { sessionId?: string; value?: number }) => void
  onClose: () => void
}

export function HabitInputPopoverContent({ habit, date, entries, onSubmit, onClose }: ContentProps) {
  const sessions = (habit.sessions as HabitSession[]) ?? []
  const hasSessions = sessions.length > 0
  const isNumeric = habit.tracking_type === 'numeric'

  const [step, setStep] = useState<'sessions' | 'numeric'>(hasSessions ? 'sessions' : 'numeric')
  const [pickedSession, setPickedSession] = useState<{ id: string; label: string } | null>(null)

  useEffect(() => {
    setPickedSession(null)
    setStep(hasSessions ? 'sessions' : 'numeric')
  }, [date, hasSessions])

  const handleSelectSession = useCallback((session: { id: string; label: string }) => {
    if (isNumeric) {
      setPickedSession(session)
      setStep('numeric')
    } else {
      onSubmit({ sessionId: session.id })
      onClose()
    }
  }, [isNumeric, onSubmit, onClose])

  const handleNumericConfirm = useCallback((value: number) => {
    onSubmit({ sessionId: pickedSession?.id, value })
    onClose()
  }, [pickedSession, onSubmit, onClose])

  return (
    <>
      <PopoverHeader habit={habit} date={date} />
      {step === 'sessions' && (
        <SessionStep habit={habit} entries={entries} date={date} onSelect={handleSelectSession} />
      )}
      {step === 'numeric' && (
        <NumericStep
          habit={habit}
          sessionLabel={pickedSession?.label}
          onSubmit={handleNumericConfirm}
          onBack={hasSessions ? () => { setStep('sessions'); setPickedSession(null) } : undefined}
        />
      )}
    </>
  )
}

/* ------------------------------------------------------------------ */
/*  Header                                                             */
/* ------------------------------------------------------------------ */

function PopoverHeader({ habit, date }: { habit: Habit; date: string }) {
  const weekStart = startOfWeek(new Date(date + 'T12:00:00'), { weekStartsOn: 1 })
  const weekEnd = endOfWeek(new Date(date + 'T12:00:00'), { weekStartsOn: 1 })
  const weekLabel = `${format(weekStart, 'MMM d')} – ${format(weekEnd, 'MMM d')}`

  return (
    <div className="flex items-center gap-2.5 px-4 pt-3 pb-2 border-b border-border/50">
      <div
        className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
        style={{ backgroundColor: `${habit.color_hex}15` }}
      >
        <DynamicIcon name={habit.icon_name} className="w-3.5 h-3.5" style={{ color: habit.color_hex }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold truncate">{habit.title}</p>
        <p className="text-[10px] text-muted-foreground">{weekLabel}</p>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Session Step                                                       */
/* ------------------------------------------------------------------ */

function SessionStep({ habit, entries, date, onSelect }: {
  habit: Habit
  entries: HabitEntry[]
  date: string
  onSelect: (session: { id: string; label: string }) => void
}) {
  const t = useT()
  const sessions = (habit.sessions as HabitSession[]) ?? []
  const weekStart = startOfWeek(new Date(date + 'T12:00:00'), { weekStartsOn: 1 })
  const weekEnd = endOfWeek(new Date(date + 'T12:00:00'), { weekStartsOn: 1 })

  const completedSessionMap = useMemo(() => {
    const map = new Map<string, { date: string }>()
    const wStart = format(weekStart, 'yyyy-MM-dd')
    const wEnd = format(weekEnd, 'yyyy-MM-dd')
    for (const entry of entries) {
      if (entry.habit_id === habit.id && entry.status === 'completed' && entry.session_id && entry.date >= wStart && entry.date <= wEnd) {
        map.set(entry.session_id, { date: entry.date })
      }
    }
    return map
  }, [entries, habit.id, weekStart, weekEnd])

  const completedCount = completedSessionMap.size
  const totalSessions = sessions.length
  const allDone = completedCount >= totalSessions

  return (
    <div className="px-3 py-2.5 space-y-2">
      {/* Progress bar */}
      <div className="space-y-1">
        <div className="flex items-center justify-between text-[10px]">
          <span className="text-muted-foreground">{t('habits.weeklyProgress')}</span>
          <span className="font-semibold" style={{ color: allDone ? habit.color_hex : undefined }}>
            {completedCount}/{totalSessions}
          </span>
        </div>
        <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${totalSessions > 0 ? (completedCount / totalSessions) * 100 : 0}%`,
              backgroundColor: habit.color_hex,
            }}
          />
        </div>
      </div>

      {/* Session list */}
      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        {allDone ? t('habits.allSessionsCompleted') : t('habits.whatDidYouDo')}
      </p>
      <div className="space-y-1 max-h-[200px] overflow-y-auto">
        {sessions.map((session, idx) => {
          const completed = completedSessionMap.get(session.id)
          const isDone = !!completed
          return (
            <button
              key={session.id}
              onClick={() => !isDone && onSelect(session)}
              disabled={isDone}
              className={cn(
                'w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-left transition-all',
                isDone
                  ? 'bg-secondary/40 cursor-default'
                  : 'hover:bg-secondary/80 active:scale-[0.98] cursor-pointer border border-border hover:border-border/80'
              )}
            >
              <div
                className={cn('w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-[10px] font-bold')}
                style={{
                  backgroundColor: isDone ? habit.color_hex : `${habit.color_hex}12`,
                  color: isDone ? 'var(--icon-on-color)' : habit.color_hex,
                }}
              >
                {isDone ? <CheckCircle2 className="w-3.5 h-3.5" /> : idx + 1}
              </div>
              <div className="flex-1 min-w-0">
                <p className={cn('text-xs font-medium', isDone && 'line-through text-muted-foreground')}>
                  {session.label}
                </p>
                {isDone && completed && (
                  <p className="text-[9px] text-muted-foreground">
                    {t('habits.doneOn', { day: format(new Date(completed.date + 'T12:00:00'), 'EEEE') })}
                  </p>
                )}
              </div>
            </button>
          )
        })}
      </div>

      {allDone && (
        <p className="text-[10px] text-center font-medium py-1" style={{ color: habit.color_hex }}>
          {t('habits.weekComplete')}
        </p>
      )}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Numeric Step                                                       */
/* ------------------------------------------------------------------ */

function NumericStep({ habit, sessionLabel, onSubmit, onBack }: {
  habit: Habit
  sessionLabel?: string | null
  onSubmit: (value: number) => void
  onBack?: () => void
}) {
  const t = useT()
  const target = habit.target_value ?? 0
  const unit = habit.unit ?? ''
  const [value, setValue] = useState<string>(target > 0 ? target.toString() : '')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setValue(target > 0 ? target.toString() : '')
    const timer = setTimeout(() => { inputRef.current?.focus(); inputRef.current?.select() }, 80)
    return () => clearTimeout(timer)
  }, [target])

  const numValue = parseFloat(value) || 0
  const pct = target > 0 ? (numValue / target) * 100 : 100
  const isOnTarget = pct >= 100
  const isClose = pct >= 75 && pct < 100
  const isBelowTarget = pct < 75 && numValue > 0
  const step = target >= 100 ? 10 : target >= 10 ? 1 : 0.5

  const handleSubmit = () => { if (numValue > 0) onSubmit(numValue) }

  return (
    <div>
      {/* Back button + session label */}
      {(onBack || sessionLabel) && (
        <div className="flex items-center gap-2 px-4 pt-2 pb-1">
          {onBack && (
            <button onClick={onBack} className="p-0.5 rounded hover:bg-secondary transition-colors">
              <ChevronLeft className="w-3.5 h-3.5 text-muted-foreground" />
            </button>
          )}
          {sessionLabel && (
            <span className="text-[10px] text-muted-foreground font-medium truncate">{sessionLabel}</span>
          )}
          {!sessionLabel && target > 0 && (
            <span className="text-[10px] text-muted-foreground">
              {t('habits.target')}: {target} {unit}
            </span>
          )}
        </div>
      )}

      {/* Target info when no back/session */}
      {!onBack && !sessionLabel && target > 0 && (
        <div className="px-4 pt-2">
          <p className="text-[10px] text-muted-foreground">
            {t('habits.target')}: {target} {unit}
          </p>
        </div>
      )}

      {/* Input row */}
      <div className="flex items-center justify-center gap-2 px-4 py-3">
        <button
          onClick={() => setValue(Math.max(0, Math.round((numValue - step) * 100) / 100).toString())}
          disabled={numValue <= 0}
          className="w-9 h-9 rounded-lg bg-secondary hover:bg-secondary/80 flex items-center justify-center transition-colors disabled:opacity-30 shrink-0"
        >
          <Minus className="w-3.5 h-3.5" />
        </button>

        <div className="relative flex-1 max-w-[130px]">
          <input
            ref={inputRef}
            type="number"
            inputMode="decimal"
            value={value}
            onChange={e => setValue(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            className={cn(
              'w-full h-11 text-center text-xl font-bold rounded-lg border-2 bg-transparent outline-none transition-colors',
              '[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none',
              isOnTarget
                ? 'border-emerald-500/50 text-emerald-600 dark:text-emerald-400'
                : isClose
                  ? 'border-amber-500/50 text-amber-600 dark:text-amber-400'
                  : isBelowTarget
                    ? 'border-orange-500/50 text-orange-600 dark:text-orange-400'
                    : 'border-border text-foreground'
            )}
          />
          {unit && (
            <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground font-medium">
              {unit}
            </span>
          )}
        </div>

        <button
          onClick={() => setValue((Math.round((numValue + step) * 100) / 100).toString())}
          className="w-9 h-9 rounded-lg bg-secondary hover:bg-secondary/80 flex items-center justify-center transition-colors shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Progress + confirm */}
      <div className="px-4 pb-3.5 space-y-2.5">
        {target > 0 && (
          <div className="space-y-1">
            <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{
                  width: `${Math.min(pct, 100)}%`,
                  backgroundColor: isOnTarget ? '#10b981' : isClose ? '#f59e0b' : isBelowTarget ? '#f97316' : habit.color_hex,
                }}
              />
            </div>
            <p className={cn(
              'text-[10px] text-center font-medium',
              isOnTarget ? 'text-emerald-500' : isClose ? 'text-amber-500' : 'text-muted-foreground'
            )}>
              {numValue > 0
                ? isOnTarget ? t('habits.targetReached') : t('habits.percentOfTarget', { pct: Math.round(pct) })
                : t('habits.enterYourValue')
              }
            </p>
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={numValue <= 0}
          className="w-full h-9 rounded-lg text-xs font-semibold text-white flex items-center justify-center gap-1.5 transition-colors disabled:opacity-40"
          style={{ backgroundColor: habit.color_hex }}
        >
          <Check className="w-3.5 h-3.5" />
          {t('common.confirm')}
        </button>
      </div>
    </div>
  )
}
