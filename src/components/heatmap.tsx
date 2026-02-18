'use client'

import { useRef, useMemo, useState, useCallback } from 'react'
import { format, startOfYear, getDay, startOfDay, startOfMonth, endOfMonth, eachDayOfInterval, addMonths, subMonths } from 'date-fns'
import type { HabitEntry } from '@/lib/types/database'
import { generateYearHeatmapData, type HeatmapDay } from '@/lib/utils/stats'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { HabitInputPopoverContent } from '@/components/habits/numeric-input-dialog'
import { Popover, PopoverContent, PopoverAnchor } from '@/components/ui/popover'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Habit } from '@/lib/types/database'

interface HeatmapProps {
  entries: HabitEntry[]
  colorHex: string
  year?: number
  cellSize?: number
  gap?: number
  showMonthLabels?: boolean
  showDayLabels?: boolean
  rounded?: boolean
  onToggle?: (dateStr: string) => void
  targetValue?: number | null
  trackingType?: 'boolean' | 'numeric' | 'timer' | 'options'
  unit?: string | null
  habit?: Habit
  allEntries?: HabitEntry[]
  onPopoverSubmit?: (date: string, opts: { sessionId?: string; value?: number; optionId?: string }) => void
}

const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const DAY_LABELS = ['Mon', '', 'Wed', '', 'Fri', '', '']

// Convert hex color to rgba with given opacity
function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r},${g},${b},${alpha})`
}

// Get intensity opacity based on value vs target
function getIntensityOpacity(value: number | null | undefined, target: number | null | undefined): number {
  if (value == null || !target || target <= 0) return 1
  const pct = value / target
  if (pct >= 1) return 1
  if (pct >= 0.75) return 0.7
  if (pct >= 0.5) return 0.4
  return 0.2
}

export function Heatmap({
  entries,
  colorHex,
  year,
  cellSize = 14,
  gap = 3,
  showMonthLabels = true,
  showDayLabels = false,
  rounded = false,
  onToggle,
  targetValue,
  trackingType,
  unit,
  habit,
  allEntries,
  onPopoverSubmit,
}: HeatmapProps) {
  const days = useMemo(() => generateYearHeatmapData(entries, year), [entries, year])
  const todayStr = format(new Date(), 'yyyy-MM-dd')
  const containerRef = useRef<HTMLDivElement>(null)

  // Floating popover state for SVG cells
  const [popover, setPopover] = useState<{ dateStr: string; x: number; y: number } | null>(null)
  const popoverOpen = popover !== null

  const hasSessions = habit?.sessions && (habit.sessions as any[]).length > 0
  const isOptions = trackingType === 'options'
  const needsPopoverForHabit = habit && onPopoverSubmit && (trackingType === 'numeric' || hasSessions || isOptions)

  // Build option color map for fast lookup
  const optionColorMap = useMemo(() => {
    if (!isOptions || !habit?.options) return new Map<string, string>()
    return new Map((habit.options as { id: string; color: string }[]).map(o => [o.id, o.color]))
  }, [isOptions, habit?.options])

  const handleCellClick = useCallback((day: HeatmapDay, cellX: number, cellY: number) => {
    if (day.status === 'future') return
    const hasExistingEntry = day.status === 'completed' || day.status === 'skipped'
    if (!hasExistingEntry && needsPopoverForHabit) {
      setPopover({ dateStr: day.dateStr, x: cellX, y: cellY })
    } else {
      onToggle?.(day.dateStr)
    }
  }, [needsPopoverForHabit, onToggle])

  const weeks = useMemo(() => {
    const result: HeatmapDay[][] = []
    const y = year ?? new Date().getFullYear()
    const jan1 = startOfYear(new Date(y, 0, 1))
    const dayOfWeek = (getDay(jan1) + 6) % 7

    let currentWeek: HeatmapDay[] = []
    for (let i = 0; i < dayOfWeek; i++) {
      currentWeek.push({ date: new Date(0), dateStr: '', status: 'future' })
    }

    for (const day of days) {
      currentWeek.push(day)
      if (currentWeek.length === 7) {
        result.push(currentWeek)
        currentWeek = []
      }
    }
    if (currentWeek.length > 0) {
      while (currentWeek.length < 7) {
        currentWeek.push({ date: new Date(0), dateStr: '', status: 'future' })
      }
      result.push(currentWeek)
    }

    return result
  }, [days, year])

  const isNumeric = trackingType === 'numeric'

  const getCellColor = (day: HeatmapDay) => {
    if (!day.dateStr) return 'transparent'
    if (day.status === 'completed') {
      if (isOptions && day.optionId) {
        return optionColorMap.get(day.optionId) ?? colorHex
      }
      if (isNumeric && targetValue && targetValue > 0) {
        const opacity = getIntensityOpacity(day.value, targetValue)
        return hexToRgba(colorHex, opacity)
      }
      return colorHex
    }
    if (day.status === 'skipped') return '#f59e0b'
    if (day.status === 'future') return 'var(--heatmap-future)'
    return 'var(--heatmap-empty)'
  }

  const labelOffset = showDayLabels ? 28 : 0
  const svgWidth = labelOffset + weeks.length * (cellSize + gap)
  const monthLabelHeight = showMonthLabels ? 18 : 0
  const svgHeight = monthLabelHeight + 7 * (cellSize + gap)
  const rx = rounded ? cellSize / 2 : 2.5

  return (
    <TooltipProvider delayDuration={100}>
      <div className="w-full overflow-x-auto pb-2 -mb-2 relative" ref={containerRef}>
        <svg width={svgWidth} height={svgHeight} className="overflow-visible min-w-fit">
          {/* Month labels */}
          {showMonthLabels && weeks.map((week, weekIdx) => {
            const firstRealDay = week.find(d => d.dateStr)
            if (!firstRealDay) return null
            const month = firstRealDay.date.getMonth()
            const dayOfMonth = firstRealDay.date.getDate()
            if (dayOfMonth > 7) return null
            return (
              <text
                key={`month-${weekIdx}`}
                x={labelOffset + weekIdx * (cellSize + gap)}
                y={11}
                className="fill-muted-foreground"
                fontSize={10}
                fontWeight={500}
              >
                {MONTH_LABELS[month]}
              </text>
            )
          })}

          {/* Day labels */}
          {showDayLabels && DAY_LABELS.map((label, i) => (
            label ? (
              <text
                key={`day-${i}`}
                x={0}
                y={monthLabelHeight + i * (cellSize + gap) + cellSize - 2}
                className="fill-muted-foreground"
                fontSize={9}
                fontWeight={500}
              >
                {label}
              </text>
            ) : null
          ))}

          {/* Cells */}
          {weeks.map((week, weekIdx) =>
            week.map((day, dayIdx) => {
              if (!day.dateStr) return null
              const x = labelOffset + weekIdx * (cellSize + gap)
              const y = monthLabelHeight + dayIdx * (cellSize + gap)
              const isToday = day.dateStr === todayStr
              return (
                <Tooltip key={day.dateStr}>
                  <TooltipTrigger asChild>
                    <rect
                      x={x}
                      y={y}
                      width={cellSize}
                      height={cellSize}
                      rx={rx}
                      fill={getCellColor(day)}
                      stroke={isToday ? 'var(--heatmap-today-stroke)' : 'none'}
                      strokeWidth={isToday ? 1.5 : 0}
                      className={cn(
                        'transition-all duration-100 hover:brightness-125',
                        (onToggle || needsPopoverForHabit) && day.status !== 'future' ? 'cursor-pointer' : 'cursor-default'
                      )}
                      onClick={() => {
                        if (day.status === 'future') return
                        handleCellClick(day, x, y)
                      }}
                    />
                  </TooltipTrigger>
                  <TooltipContent side="top" className="text-xs bg-popover border-border">
                    <p className="font-medium">{format(day.date, 'EEEE, MMM d, yyyy')}</p>
                    <p className="capitalize text-muted-foreground">{day.status}</p>
                    {isNumeric && day.value != null && (
                      <p className="font-semibold" style={{ color: colorHex }}>
                        {day.value} {unit ?? ''}
                        {targetValue ? ` / ${targetValue}` : ''}
                      </p>
                    )}
                    {isOptions && day.optionId && (() => {
                      const opt = (habit?.options as { id: string; label: string; color: string }[])?.find(o => o.id === day.optionId)
                      return opt ? <p className="font-semibold" style={{ color: opt.color }}>{opt.label}</p> : null
                    })()}
                    {(onToggle || needsPopoverForHabit) && day.status !== 'future' && <p className="text-primary text-[10px] mt-0.5">Click to toggle</p>}
                  </TooltipContent>
                </Tooltip>
              )
            })
          )}
        </svg>

        {/* Floating popover for SVG cells */}
        {habit && onPopoverSubmit && (
          <Popover open={popoverOpen} onOpenChange={(open) => { if (!open) setPopover(null) }}>
            <PopoverAnchor asChild>
              <div
                className="absolute pointer-events-none"
                style={{
                  left: popover ? popover.x : 0,
                  top: popover ? popover.y : 0,
                  width: cellSize,
                  height: cellSize,
                }}
              />
            </PopoverAnchor>
            {popover && (
              <PopoverContent
                className="w-[280px] p-0 shadow-xl border-border"
                side="bottom"
                align="center"
                sideOffset={8}
                collisionPadding={16}
                onOpenAutoFocus={e => e.preventDefault()}
              >
                <HabitInputPopoverContent
                  habit={habit}
                  date={popover.dateStr}
                  entries={allEntries ?? entries}
                  onSubmit={(opts) => { onPopoverSubmit(popover.dateStr, opts); setPopover(null) }}
                  onClose={() => setPopover(null)}
                />
              </PopoverContent>
            )}
          </Popover>
        )}
      </div>
    </TooltipProvider>
  )
}

/**
 * Monthly Heatmap — shows a single month with large cells and navigation
 */
interface MonthlyHeatmapProps {
  entries: HabitEntry[]
  colorHex: string
  onToggle?: (dateStr: string) => void
  targetValue?: number | null
  trackingType?: 'boolean' | 'numeric' | 'timer' | 'options'
  unit?: string | null
  /** When provided, cells that need input get an inline popover */
  habit?: Habit
  onPopoverSubmit?: (date: string, opts: { sessionId?: string; value?: number; optionId?: string }) => void
}

const WEEKDAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

export function MonthlyHeatmap({ entries, colorHex, onToggle, targetValue, trackingType, unit, habit, onPopoverSubmit }: MonthlyHeatmapProps) {
  const [month, setMonth] = useState(new Date())
  const todayStr = format(new Date(), 'yyyy-MM-dd')
  const isNumeric = trackingType === 'numeric'
  const isOptions = trackingType === 'options'
  const gridRef = useRef<HTMLDivElement>(null)

  // Floating popover state (single shared popover, positioned at clicked cell)
  const [popover, setPopover] = useState<{ dateStr: string; x: number; y: number } | null>(null)
  const popoverOpen = popover !== null

  const hasSessions = habit?.sessions && (habit.sessions as any[]).length > 0
  const needsPopoverForHabit = habit && onPopoverSubmit && (isNumeric || hasSessions || isOptions)

  // Option color map for fast lookup
  const optionColorMap = useMemo(() => {
    if (!isOptions || !habit?.options) return new Map<string, string>()
    return new Map((habit.options as { id: string; color: string }[]).map(o => [o.id, o.color]))
  }, [isOptions, habit?.options])

  const entryMap = useMemo(() => {
    const map = new Map<string, { status: string; value: number | null; option_id: string | null }>()
    entries.forEach(e => map.set(e.date, { status: e.status, value: e.value, option_id: e.option_id }))
    return map
  }, [entries])

  const monthStart = startOfMonth(month)
  const monthEnd = endOfMonth(month)
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd })
  const startDayOfWeek = (getDay(monthStart) + 6) % 7
  const today = startOfDay(new Date())

  // Calculate stats for this month
  const monthCompleted = days.filter(d => entryMap.get(format(d, 'yyyy-MM-dd'))?.status === 'completed').length
  const monthPast = days.filter(d => d <= today).length
  const monthRate = monthPast > 0 ? Math.round((monthCompleted / monthPast) * 100) : 0

  const getCellColor = (dateStr: string, date: Date) => {
    const entry = entryMap.get(dateStr)
    if (date > today) return 'var(--heatmap-future)'
    if (entry?.status === 'completed') {
      if (isOptions && entry.option_id) {
        return optionColorMap.get(entry.option_id) ?? colorHex
      }
      if (isNumeric && targetValue && targetValue > 0) {
        return hexToRgba(colorHex, getIntensityOpacity(entry.value, targetValue))
      }
      return colorHex
    }
    if (entry?.status === 'skipped') return '#f59e0b'
    return 'var(--heatmap-empty)'
  }

  const handleCellClick = useCallback((dateStr: string, day: Date, cellEl: HTMLElement) => {
    if (day > today) return
    const entry = entryMap.get(dateStr)
    const hasExistingEntry = entry?.status === 'completed' || entry?.status === 'skipped'

    if (!hasExistingEntry && needsPopoverForHabit && gridRef.current) {
      const gridRect = gridRef.current.getBoundingClientRect()
      const cellRect = cellEl.getBoundingClientRect()
      setPopover({
        dateStr,
        x: cellRect.left - gridRect.left + cellRect.width / 2,
        y: cellRect.top - gridRect.top + cellRect.height,
      })
    } else {
      onToggle?.(dateStr)
    }
  }, [today, entryMap, needsPopoverForHabit, onToggle])

  return (
    <TooltipProvider delayDuration={100}>
    <div className="space-y-2">
      {/* Month navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setMonth(subMonths(month, 1))}
          className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <div className="text-center">
          <p className="font-semibold text-sm">{format(month, 'MMMM yyyy')}</p>
          <p className="text-[10px] text-muted-foreground">{monthCompleted}/{monthPast} completed · {monthRate}%</p>
        </div>
        <button
          onClick={() => setMonth(addMonths(month, 1))}
          className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Calendar grid — constrained width, square cells */}
      <div className="max-w-md mx-auto relative" ref={gridRef}>
        {/* Weekday headers */}
        <div className="grid grid-cols-7 gap-1.5 mb-1">
          {WEEKDAY_LABELS.map(d => (
            <div key={d} className="text-center text-[10px] text-muted-foreground/60 font-semibold">
              {d.substring(0, 2)}
            </div>
          ))}
        </div>

        {/* Day grid — square cells, no wrappers that break the grid */}
        <div className="grid grid-cols-7 gap-1.5">
          {/* Empty padding cells */}
          {Array.from({ length: startDayOfWeek }).map((_, i) => (
            <div key={`pad-${i}`} className="aspect-square" />
          ))}

          {/* Day cells — all rendered identically as direct grid children */}
          {days.map(day => {
            const dateStr = format(day, 'yyyy-MM-dd')
            const isToday = dateStr === todayStr
            const isFuture = day > today
            const entry = entryMap.get(dateStr)
            const completed = entry?.status === 'completed'
            const skipped = entry?.status === 'skipped'

            return (
              <Tooltip key={dateStr}>
                <TooltipTrigger asChild>
                  <button
                    onClick={(e) => handleCellClick(dateStr, day, e.currentTarget)}
                    disabled={isFuture}
                    className={cn(
                      'aspect-square rounded-md flex items-center justify-center transition-all',
                      !isFuture && 'hover:brightness-110 hover:scale-105 cursor-pointer active:scale-95',
                      isFuture && 'opacity-30 cursor-default',
                      isToday && 'ring-2 ring-foreground/30 ring-offset-1 ring-offset-background'
                    )}
                    style={{ backgroundColor: getCellColor(dateStr, day) }}
                  >
                    <span className={cn(
                      'text-[11px] font-semibold leading-none',
                      completed ? 'text-[var(--icon-on-color)]' : skipped ? 'text-[var(--icon-on-color)]' : isFuture ? 'text-[var(--heatmap-text-faint)]' : 'text-[var(--heatmap-text-dim)]'
                    )}>
                      {day.getDate()}
                    </span>
                  </button>
                </TooltipTrigger>
                {isNumeric && completed && entry?.value != null && (
                  <TooltipContent side="top" className="text-xs bg-popover border-border">
                    <p className="font-semibold" style={{ color: colorHex }}>
                      {entry.value} {unit ?? ''}
                      {targetValue ? ` / ${targetValue}` : ''}
                    </p>
                  </TooltipContent>
                )}
                {isOptions && completed && entry?.option_id && (() => {
                  const opt = (habit?.options as { id: string; label: string; color: string }[])?.find(o => o.id === entry.option_id)
                  return opt ? (
                    <TooltipContent side="top" className="text-xs bg-popover border-border">
                      <p className="font-semibold" style={{ color: opt.color }}>{opt.label}</p>
                    </TooltipContent>
                  ) : null
                })()}
              </Tooltip>
            )
          })}
        </div>

        {/* Single floating popover — anchored to clicked cell */}
        {habit && onPopoverSubmit && (
          <Popover open={popoverOpen} onOpenChange={(open) => { if (!open) setPopover(null) }}>
            <PopoverAnchor asChild>
              <div
                className="absolute pointer-events-none"
                style={{
                  left: popover ? popover.x : 0,
                  top: popover ? popover.y : 0,
                  width: 1,
                  height: 1,
                }}
              />
            </PopoverAnchor>
            {popover && (
              <PopoverContent
                className="w-[280px] p-0 shadow-xl border-border"
                side="bottom"
                align="center"
                sideOffset={8}
                collisionPadding={16}
                onOpenAutoFocus={e => e.preventDefault()}
              >
                <HabitInputPopoverContent
                  habit={habit}
                  date={popover.dateStr}
                  entries={entries}
                  onSubmit={(opts) => { onPopoverSubmit(popover.dateStr, opts); setPopover(null) }}
                  onClose={() => setPopover(null)}
                />
              </PopoverContent>
            )}
          </Popover>
        )}
      </div>
    </div>
    </TooltipProvider>
  )
}

/**
 * Compact inline heatmap for cards
 */
export function CompactHeatmap({ entries, colorHex }: { entries: HabitEntry[]; colorHex: string }) {
  return <Heatmap entries={entries} colorHex={colorHex} cellSize={9} gap={2} showMonthLabels={false} />
}

/**
 * Mini 7-week heatmap for small cards
 */
export function MiniHeatmap({ entries, colorHex }: { entries: HabitEntry[]; colorHex: string }) {
  const days = useMemo(() => generateYearHeatmapData(entries), [entries])
  const todayStr = format(new Date(), 'yyyy-MM-dd')

  // Only last 12 weeks
  const recentDays = days.slice(-84)

  const weeks: HeatmapDay[][] = []
  let currentWeek: HeatmapDay[] = []
  for (const day of recentDays) {
    currentWeek.push(day)
    if (currentWeek.length === 7) {
      weeks.push(currentWeek)
      currentWeek = []
    }
  }
  if (currentWeek.length > 0) {
    while (currentWeek.length < 7) currentWeek.push({ date: new Date(0), dateStr: '', status: 'future' })
    weeks.push(currentWeek)
  }

  const cellSize = 8
  const gap = 2
  const svgWidth = weeks.length * (cellSize + gap)
  const svgHeight = 7 * (cellSize + gap)

  return (
    <svg width="100%" viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="overflow-visible">
      {weeks.map((week, weekIdx) =>
        week.map((day, dayIdx) => {
          if (!day.dateStr) return null
          const x = weekIdx * (cellSize + gap)
          const y = dayIdx * (cellSize + gap)
          const isToday = day.dateStr === todayStr
          const fill = day.status === 'completed'
            ? colorHex
            : day.status === 'skipped'
              ? '#f59e0b'
              : day.status === 'future'
                ? 'var(--heatmap-future)'
                : 'var(--heatmap-empty)'
          return (
            <rect
              key={day.dateStr}
              x={x} y={y}
              width={cellSize} height={cellSize}
              rx={2}
              fill={fill}
              stroke={isToday ? 'var(--heatmap-today-stroke)' : 'none'}
              strokeWidth={isToday ? 0.5 : 0}
            />
          )
        })
      )}
    </svg>
  )
}

/**
 * Mini Month Calendar — SVG-based, same viewBox as MiniHeatmap (120×70)
 * Uses identical square cells (8×8, gap 2, rx 2) centered in the viewBox.
 * Supports floating popover for session/numeric habits on past cells.
 */
export function MiniMonthCalendar({ entries, colorHex, month, onToggle, habit, allEntries, onPopoverSubmit }: {
  entries: HabitEntry[]
  colorHex: string
  month: Date
  onToggle?: (dateStr: string) => void
  habit?: Habit
  allEntries?: HabitEntry[]
  onPopoverSubmit?: (date: string, opts: { sessionId?: string; value?: number; optionId?: string }) => void
}) {
  const todayStr = format(new Date(), 'yyyy-MM-dd')
  const today = startOfDay(new Date())
  const svgRef = useRef<HTMLDivElement>(null)

  const isOptions = habit?.tracking_type === 'options'
  const optionColorMap = useMemo(() => {
    if (!isOptions || !habit?.options) return new Map<string, string>()
    return new Map((habit.options as { id: string; color: string }[]).map(o => [o.id, o.color]))
  }, [isOptions, habit?.options])

  const entryMap = useMemo(() => {
    const map = new Map<string, { status: string; option_id: string | null }>()
    entries.forEach(e => map.set(e.date, { status: e.status, option_id: e.option_id }))
    return map
  }, [entries])

  const monthStart = startOfMonth(month)
  const monthEnd = endOfMonth(month)
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd })
  const startDayOfWeek = (getDay(monthStart) + 6) % 7

  const cellSize = 8
  const gapVal = 2
  const stepVal = cellSize + gapVal

  const cols = 7
  const totalRows = Math.ceil((startDayOfWeek + days.length) / 7)
  const svgW = cols * stepVal - gapVal
  const svgH = totalRows * stepVal - gapVal

  // Floating popover state
  const [popover, setPopover] = useState<{ dateStr: string; x: number; y: number } | null>(null)
  const popoverOpen = popover !== null

  const hasSessions = habit?.sessions && (habit.sessions as any[]).length > 0
  const isNumeric = habit?.tracking_type === 'numeric'
  const needsPopoverForHabit = habit && onPopoverSubmit && (isNumeric || hasSessions || isOptions)

  const handleCellClick = useCallback((dateStr: string, day: Date, svgX: number, svgY: number) => {
    if (day > today) return
    const entry = entryMap.get(dateStr)
    const hasExistingEntry = entry?.status === 'completed' || entry?.status === 'skipped'

    if (!hasExistingEntry && needsPopoverForHabit && svgRef.current) {
      const containerRect = svgRef.current.getBoundingClientRect()
      const svgEl = svgRef.current.querySelector('svg')
      if (!svgEl) return
      const svgRect = svgEl.getBoundingClientRect()
      const scaleX = svgRect.width / svgW
      const scaleY = svgRect.height / svgH
      const pixelX = svgX * scaleX
      const pixelY = svgY * scaleY
      setPopover({ dateStr, x: pixelX, y: pixelY })
    } else {
      onToggle?.(dateStr)
    }
  }, [today, entryMap, needsPopoverForHabit, onToggle, svgW, svgH])

  return (
    <div className="relative" ref={svgRef}>
      <svg width="100%" viewBox={`0 0 ${svgW} ${svgH}`} className="overflow-visible">
        {days.map((day, i) => {
          const pos = startDayOfWeek + i
          const col = pos % 7
          const row = Math.floor(pos / 7)
          const x = col * stepVal
          const y = row * stepVal
          const dateStr = format(day, 'yyyy-MM-dd')
          const isFuture = day > today
          const entry = entryMap.get(dateStr)
          const isToday = dateStr === todayStr

          const fill = entry?.status === 'completed'
            ? (isOptions && entry.option_id ? (optionColorMap.get(entry.option_id) ?? colorHex) : colorHex)
            : entry?.status === 'skipped'
              ? '#f59e0b'
              : isFuture
                ? 'var(--heatmap-future)'
                : 'var(--heatmap-empty)'

          return (
            <rect
              key={dateStr}
              x={x} y={y}
              width={cellSize} height={cellSize}
              rx={2}
              fill={fill}
              stroke={isToday ? 'var(--heatmap-today-stroke)' : 'none'}
              strokeWidth={isToday ? 0.5 : 0}
              onClick={() => handleCellClick(dateStr, day, x, y)}
              className={!isFuture ? 'cursor-pointer' : ''}
            />
          )
        })}
      </svg>

      {/* Floating popover */}
      {habit && onPopoverSubmit && (
        <Popover open={popoverOpen} onOpenChange={(open) => { if (!open) setPopover(null) }}>
          <PopoverAnchor asChild>
            <div
              className="absolute pointer-events-none"
              style={{
                left: popover ? popover.x : 0,
                top: popover ? popover.y : 0,
                width: 8,
                height: 8,
              }}
            />
          </PopoverAnchor>
          {popover && (
            <PopoverContent
              className="w-[280px] p-0 shadow-xl border-border"
              side="bottom"
              align="center"
              sideOffset={8}
              collisionPadding={16}
              onOpenAutoFocus={e => e.preventDefault()}
            >
              <HabitInputPopoverContent
                habit={habit}
                date={popover.dateStr}
                entries={allEntries ?? entries}
                onSubmit={(opts) => { onPopoverSubmit(popover.dateStr, opts); setPopover(null) }}
                onClose={() => setPopover(null)}
              />
            </PopoverContent>
          )}
        </Popover>
      )}
    </div>
  )
}
