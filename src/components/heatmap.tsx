'use client'

import { useMemo, useState } from 'react'
import { format, startOfYear, getDay, startOfDay, startOfMonth, endOfMonth, eachDayOfInterval, addMonths, subMonths } from 'date-fns'
import type { HabitEntry } from '@/lib/types/database'
import { generateYearHeatmapData, type HeatmapDay } from '@/lib/utils/stats'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface HeatmapProps {
  entries: HabitEntry[]
  colorHex: string
  year?: number
  cellSize?: number
  gap?: number
  showMonthLabels?: boolean
  showDayLabels?: boolean
  rounded?: boolean
}

const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const DAY_LABELS = ['Mon', '', 'Wed', '', 'Fri', '', '']

export function Heatmap({
  entries,
  colorHex,
  year,
  cellSize = 14,
  gap = 3,
  showMonthLabels = true,
  showDayLabels = false,
  rounded = false,
}: HeatmapProps) {
  const days = useMemo(() => generateYearHeatmapData(entries, year), [entries, year])
  const todayStr = format(new Date(), 'yyyy-MM-dd')

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

  const getCellColor = (day: HeatmapDay) => {
    if (!day.dateStr) return 'transparent'
    if (day.status === 'completed') return colorHex
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
      <div className="w-full overflow-x-auto pb-2 -mb-2">
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
                      className="cursor-pointer transition-all duration-100 hover:brightness-125"
                    />
                  </TooltipTrigger>
                  <TooltipContent side="top" className="text-xs bg-popover border-border">
                    <p className="font-medium">{format(day.date, 'EEEE, MMM d, yyyy')}</p>
                    <p className="capitalize text-muted-foreground">{day.status}</p>
                  </TooltipContent>
                </Tooltip>
              )
            })
          )}
        </svg>
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
}

const WEEKDAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

export function MonthlyHeatmap({ entries, colorHex, onToggle }: MonthlyHeatmapProps) {
  const [month, setMonth] = useState(new Date())
  const todayStr = format(new Date(), 'yyyy-MM-dd')

  const entryMap = useMemo(() => {
    const map = new Map<string, string>()
    entries.forEach(e => map.set(e.date, e.status))
    return map
  }, [entries])

  const monthStart = startOfMonth(month)
  const monthEnd = endOfMonth(month)
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd })
  const startDayOfWeek = (getDay(monthStart) + 6) % 7
  const today = startOfDay(new Date())

  // Calculate stats for this month
  const monthCompleted = days.filter(d => entryMap.get(format(d, 'yyyy-MM-dd')) === 'completed').length
  const monthSkipped = days.filter(d => entryMap.get(format(d, 'yyyy-MM-dd')) === 'skipped').length
  const monthPast = days.filter(d => d <= today).length
  const monthRate = monthPast > 0 ? Math.round((monthCompleted / monthPast) * 100) : 0

  const getCellColor = (dateStr: string, date: Date) => {
    const status = entryMap.get(dateStr)
    if (date > today) return 'var(--heatmap-future)'
    if (status === 'completed') return colorHex
    if (status === 'skipped') return '#f59e0b'
    return 'var(--heatmap-empty)'
  }

  return (
    <div className="space-y-1">
      {/* Month navigation — compact inline */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setMonth(subMonths(month, 1))}
          className="w-5 h-5 flex items-center justify-center rounded hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="w-3 h-3" />
        </button>
        <p className="font-medium text-[10px] text-muted-foreground">
          {format(month, 'MMM yyyy')} <span className="text-[8px] opacity-60">· {monthCompleted}/{monthPast} · {monthRate}%</span>
        </p>
        <button
          onClick={() => setMonth(addMonths(month, 1))}
          className="w-5 h-5 flex items-center justify-center rounded hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
        >
          <ChevronRight className="w-3 h-3" />
        </button>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-[2px]">
        {WEEKDAY_LABELS.map(d => (
          <div key={d} className="text-center text-[7px] text-muted-foreground/60 font-medium leading-none py-0.5">
            {d.charAt(0)}
          </div>
        ))}
      </div>

      {/* Day grid — fixed-height cells to match grid card size */}
      <div className="grid grid-cols-7 gap-[2px]">
        {/* Empty padding cells */}
        {Array.from({ length: startDayOfWeek }).map((_, i) => (
          <div key={`pad-${i}`} className="h-[14px]" />
        ))}

        {/* Day cells */}
        {days.map(day => {
          const dateStr = format(day, 'yyyy-MM-dd')
          const isToday = dateStr === todayStr
          const isFuture = day > today
          const status = entryMap.get(dateStr)
          const completed = status === 'completed'
          const skipped = status === 'skipped'

          return (
            <button
              key={dateStr}
              onClick={() => onToggle?.(dateStr)}
              disabled={isFuture}
              className={cn(
                'h-[14px] rounded-[3px] flex items-center justify-center transition-all',
                !isFuture && 'hover:brightness-125 cursor-pointer',
                isFuture && 'opacity-30 cursor-default',
                isToday && 'ring-1 ring-foreground/40'
              )}
              style={{ backgroundColor: getCellColor(dateStr, day) }}
            >
              <span className={cn(
                'text-[7px] font-medium leading-none',
                completed ? 'text-[var(--icon-on-color)]' : skipped ? 'text-[var(--icon-on-color)]' : isFuture ? 'text-[var(--heatmap-text-faint)]' : 'text-[var(--heatmap-text-dim)]'
              )}>
                {day.getDate()}
              </span>
            </button>
          )
        })}
      </div>
    </div>
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
 */
export function MiniMonthCalendar({ entries, colorHex, month, onToggle }: {
  entries: HabitEntry[]
  colorHex: string
  month: Date
  onToggle?: (dateStr: string) => void
}) {
  const todayStr = format(new Date(), 'yyyy-MM-dd')
  const today = startOfDay(new Date())

  const entryMap = useMemo(() => {
    const map = new Map<string, string>()
    entries.forEach(e => map.set(e.date, e.status))
    return map
  }, [entries])

  const monthStart = startOfMonth(month)
  const monthEnd = endOfMonth(month)
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd })
  const startDayOfWeek = (getDay(monthStart) + 6) % 7 // Monday = 0

  // Same square cell style as MiniHeatmap
  const cellSize = 8
  const gap = 2
  const step = cellSize + gap // 10

  // Tight viewBox — no extra padding, cells fill the card edge to edge
  const cols = 7
  const totalRows = Math.ceil((startDayOfWeek + days.length) / 7)
  const svgW = cols * step - gap   // 68
  const svgH = totalRows * step - gap // 48 or 58

  return (
    <svg width="100%" viewBox={`0 0 ${svgW} ${svgH}`} className="overflow-visible">
      {days.map((day, i) => {
        const pos = startDayOfWeek + i
        const col = pos % 7
        const row = Math.floor(pos / 7)
        const x = col * step
        const y = row * step
        const dateStr = format(day, 'yyyy-MM-dd')
        const isFuture = day > today
        const status = entryMap.get(dateStr)
        const isToday = dateStr === todayStr

        const fill = status === 'completed'
          ? colorHex
          : status === 'skipped'
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
            onClick={() => onToggle?.(dateStr)}
            className={!isFuture ? 'cursor-pointer' : ''}
          />
        )
      })}
    </svg>
  )
}
