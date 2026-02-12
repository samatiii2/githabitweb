'use client'

import { useState } from 'react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Repeat, ChevronDown, Calendar as CalendarIcon, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { recurrenceLabel } from '@/lib/utils/recurrence'
import type { RecurrenceRule, RecurrenceType } from '@/lib/types/database'

// ─── Types ───────────────────────────────────────────────
interface RecurrencePickerProps {
  recurrence: RecurrenceType
  recurrenceRule: RecurrenceRule | null
  onChange: (recurrence: RecurrenceType, rule: RecurrenceRule | null) => void
  /** Render as a compact toolbar button (default) or full-width button */
  variant?: 'toolbar' | 'full'
}

// ─── Presets ─────────────────────────────────────────────
const PRESETS: { value: RecurrenceType; label: string; desc: string }[] = [
  { value: 'none', label: 'No repeat', desc: '' },
  { value: 'daily', label: 'Daily', desc: 'Every day' },
  { value: 'weekdays', label: 'Weekdays', desc: 'Mon to Fri' },
  { value: 'weekends', label: 'Weekends', desc: 'Sat & Sun' },
  { value: 'weekly', label: 'Weekly', desc: 'Same day each week' },
  { value: 'monthly', label: 'Monthly', desc: 'Same date each month' },
  { value: 'yearly', label: 'Yearly', desc: 'Same date each year' },
]

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const DAY_LETTERS = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

// ─── Component ───────────────────────────────────────────
export function RecurrencePicker({ recurrence, recurrenceRule, onChange, variant = 'toolbar' }: RecurrencePickerProps) {
  const [open, setOpen] = useState(false)
  const [showCustom, setShowCustom] = useState(recurrence === 'custom')
  const [customMode, setCustomMode] = useState<'dow' | 'dom'>('dow')

  // Local state for custom editing
  const [interval, setInterval] = useState(recurrenceRule?.interval || 1)
  const [daysOfWeek, setDaysOfWeek] = useState<number[]>(recurrenceRule?.days_of_week || [])
  const [daysOfMonth, setDaysOfMonth] = useState<number[]>(recurrenceRule?.days_of_month || [])
  const [startDate, setStartDate] = useState(recurrenceRule?.start_date || '')
  const [endDate, setEndDate] = useState(recurrenceRule?.end_date || '')

  const label = recurrenceLabel(recurrence, recurrenceRule)
  const isActive = recurrence !== 'none'

  const handlePreset = (value: RecurrenceType) => {
    if (value === 'custom') {
      setShowCustom(true)
      return
    }
    setShowCustom(false)
    // For presets that support interval, keep existing interval or reset
    const rule: RecurrenceRule | null = (recurrenceRule?.start_date || recurrenceRule?.end_date)
      ? { start_date: recurrenceRule?.start_date, end_date: recurrenceRule?.end_date }
      : null
    onChange(value, rule)
    if (value === 'none') setOpen(false)
  }

  const handleIntervalChange = (rec: RecurrenceType, newInterval: number) => {
    const rule: RecurrenceRule = {
      ...recurrenceRule,
      interval: newInterval > 1 ? newInterval : undefined,
    }
    onChange(rec, Object.keys(rule).length > 0 ? rule : null)
  }

  const toggleDayOfWeek = (day: number) => {
    const next = daysOfWeek.includes(day)
      ? daysOfWeek.filter(d => d !== day)
      : [...daysOfWeek, day].sort()
    setDaysOfWeek(next)
  }

  const toggleDayOfMonth = (day: number) => {
    const next = daysOfMonth.includes(day)
      ? daysOfMonth.filter(d => d !== day)
      : [...daysOfMonth, day].sort((a, b) => a - b)
    setDaysOfMonth(next)
  }

  const applyCustom = () => {
    const rule: RecurrenceRule = {}
    if (customMode === 'dow' && daysOfWeek.length > 0) {
      rule.days_of_week = daysOfWeek
    }
    if (customMode === 'dom' && daysOfMonth.length > 0) {
      rule.days_of_month = daysOfMonth
    }
    if (interval > 1) rule.interval = interval
    if (startDate) rule.start_date = startDate
    if (endDate) rule.end_date = endDate
    onChange('custom', rule)
    setOpen(false)
  }

  // Apply interval for preset recurrences
  const handleSetInterval = () => {
    if (recurrence === 'none' || recurrence === 'custom') return
    handleIntervalChange(recurrence, interval)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        {variant === 'toolbar' ? (
          <button
            type="button"
            className={cn(
              'inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium transition-colors border',
              isActive
                ? 'border-purple-500/30 bg-purple-500/10 text-purple-400 hover:bg-purple-500/20'
                : 'border-border hover:bg-secondary text-muted-foreground hover:text-foreground'
            )}
          >
            <Repeat className="w-3.5 h-3.5" />
            {isActive ? label : 'Repeat'}
          </button>
        ) : (
          <button
            type="button"
            className={cn(
              'w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors',
              isActive
                ? 'bg-purple-500/10 text-purple-400'
                : 'bg-secondary/50 text-muted-foreground hover:text-foreground'
            )}
          >
            <Repeat className="w-3.5 h-3.5" />
            <span className="flex-1 text-left">{label}</span>
            <ChevronDown className="w-3 h-3 opacity-50" />
          </button>
        )}
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0" align="start" sideOffset={8}>
        {!showCustom ? (
          <>
            {/* Presets */}
            <div className="p-2 space-y-0.5">
              {PRESETS.map(p => (
                <button
                  key={p.value}
                  onClick={() => handlePreset(p.value)}
                  className={cn(
                    'w-full flex items-center gap-3 px-2.5 py-2 rounded-md transition-colors text-left',
                    recurrence === p.value ? 'bg-secondary' : 'hover:bg-secondary'
                  )}
                >
                  <span className="text-sm font-medium flex-1">{p.label}</span>
                  {p.desc && <span className="text-[10px] text-muted-foreground">{p.desc}</span>}
                  {recurrence === p.value && <div className="w-1.5 h-1.5 rounded-full bg-[#3DD68C]" />}
                </button>
              ))}
            </div>

            <div className="border-t border-border" />

            {/* Interval for current preset */}
            {recurrence !== 'none' && recurrence !== 'custom' && (
              <div className="p-3 space-y-2">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Interval</p>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Every</span>
                  <Input
                    type="number"
                    min={1}
                    max={99}
                    value={interval}
                    onChange={e => setInterval(Math.max(1, parseInt(e.target.value) || 1))}
                    onBlur={handleSetInterval}
                    className="w-16 h-7 text-xs text-center bg-secondary/50 border-0"
                  />
                  <span className="text-xs text-muted-foreground">
                    {{
                      daily: interval === 1 ? 'day' : 'days',
                      weekdays: 'weekdays',
                      weekends: 'weekends',
                      weekly: interval === 1 ? 'week' : 'weeks',
                      monthly: interval === 1 ? 'month' : 'months',
                      yearly: interval === 1 ? 'year' : 'years',
                    }[recurrence]}
                  </span>
                </div>
              </div>
            )}

            <div className="border-t border-border" />

            {/* Custom option */}
            <div className="p-2">
              <button
                onClick={() => setShowCustom(true)}
                className="w-full flex items-center gap-2 px-2.5 py-2 rounded-md hover:bg-secondary transition-colors text-left"
              >
                <CalendarIcon className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium flex-1">Custom...</span>
              </button>
            </div>

            {/* Date range */}
            <div className="border-t border-border" />
            <div className="p-3 space-y-2">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Date range (optional)</p>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[9px] text-muted-foreground">From</label>
                  <Input
                    type="date"
                    value={startDate}
                    onChange={e => {
                      setStartDate(e.target.value)
                      const rule: RecurrenceRule = { ...recurrenceRule, start_date: e.target.value || undefined }
                      if (!rule.start_date) delete rule.start_date
                      onChange(recurrence, Object.keys(rule).length > 0 ? rule : null)
                    }}
                    className="h-7 text-[10px] bg-secondary/50 border-0 [color-scheme:dark]"
                  />
                </div>
                <div>
                  <label className="text-[9px] text-muted-foreground">To</label>
                  <Input
                    type="date"
                    value={endDate}
                    onChange={e => {
                      setEndDate(e.target.value)
                      const rule: RecurrenceRule = { ...recurrenceRule, end_date: e.target.value || undefined }
                      if (!rule.end_date) delete rule.end_date
                      onChange(recurrence, Object.keys(rule).length > 0 ? rule : null)
                    }}
                    className="h-7 text-[10px] bg-secondary/50 border-0 [color-scheme:dark]"
                  />
                </div>
              </div>
            </div>
          </>
        ) : (
          /* ─── Custom mode ─── */
          <div className="p-3 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold">Custom recurrence</p>
              <button onClick={() => setShowCustom(false)} className="text-muted-foreground hover:text-foreground">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Mode toggle */}
            <div className="flex bg-secondary/80 rounded-lg p-0.5 border border-border/50">
              <button
                onClick={() => setCustomMode('dow')}
                className={cn(
                  'flex-1 py-1.5 text-xs font-medium rounded-md transition-all',
                  customMode === 'dow' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'
                )}
              >
                Days of week
              </button>
              <button
                onClick={() => setCustomMode('dom')}
                className={cn(
                  'flex-1 py-1.5 text-xs font-medium rounded-md transition-all',
                  customMode === 'dom' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'
                )}
              >
                Days of month
              </button>
            </div>

            {/* Interval */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Every</span>
              <Input
                type="number"
                min={1}
                max={99}
                value={interval}
                onChange={e => setInterval(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-14 h-7 text-xs text-center bg-secondary/50 border-0"
              />
              <span className="text-xs text-muted-foreground">
                {customMode === 'dow' ? (interval === 1 ? 'week' : 'weeks') : (interval === 1 ? 'month' : 'months')}
              </span>
            </div>

            {/* Day of week selector */}
            {customMode === 'dow' && (
              <div className="flex gap-1">
                {DAY_LETTERS.map((letter, i) => (
                  <button
                    key={i}
                    onClick={() => toggleDayOfWeek(i)}
                    className={cn(
                      'flex-1 aspect-square rounded-lg text-xs font-semibold transition-all flex items-center justify-center',
                      daysOfWeek.includes(i)
                        ? 'bg-[#3DD68C] text-black'
                        : 'bg-secondary/50 text-muted-foreground hover:bg-secondary'
                    )}
                  >
                    {letter}
                  </button>
                ))}
              </div>
            )}

            {/* Day of month selector */}
            {customMode === 'dom' && (
              <div className="grid grid-cols-7 gap-1 max-h-[180px] overflow-y-auto">
                {Array.from({ length: 31 }, (_, i) => i + 1).map(d => (
                  <button
                    key={d}
                    onClick={() => toggleDayOfMonth(d)}
                    className={cn(
                      'w-full aspect-square rounded-md text-[11px] font-medium transition-all flex items-center justify-center',
                      daysOfMonth.includes(d)
                        ? 'bg-[#3DD68C] text-black'
                        : 'bg-secondary/50 text-muted-foreground hover:bg-secondary'
                    )}
                  >
                    {d}
                  </button>
                ))}
              </div>
            )}

            {/* Date range */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[9px] text-muted-foreground">From</label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={e => setStartDate(e.target.value)}
                  className="h-7 text-[10px] bg-secondary/50 border-0 [color-scheme:dark]"
                />
              </div>
              <div>
                <label className="text-[9px] text-muted-foreground">To</label>
                <Input
                  type="date"
                  value={endDate}
                  onChange={e => setEndDate(e.target.value)}
                  className="h-7 text-[10px] bg-secondary/50 border-0 [color-scheme:dark]"
                />
              </div>
            </div>

            {/* Apply */}
            <Button
              onClick={applyCustom}
              disabled={(customMode === 'dow' && daysOfWeek.length === 0) || (customMode === 'dom' && daysOfMonth.length === 0)}
              className="w-full bg-[#3DD68C] text-black hover:bg-[#3DD68C]/90 font-semibold text-xs h-8"
            >
              Apply
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}
