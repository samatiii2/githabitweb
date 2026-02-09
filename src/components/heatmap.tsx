'use client'

import { useMemo } from 'react'
import { format, startOfYear, getDay, addDays, startOfDay } from 'date-fns'
import type { HabitEntry } from '@/lib/types/database'
import { generateYearHeatmapData, type HeatmapDay } from '@/lib/utils/stats'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

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
  cellSize = 12,
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
    if (day.status === 'future') return 'rgba(255,255,255,0.03)'
    return 'rgba(255,255,255,0.04)'
  }

  const labelOffset = showDayLabels ? 28 : 0
  const svgWidth = labelOffset + weeks.length * (cellSize + gap)
  const monthLabelHeight = showMonthLabels ? 18 : 0
  const svgHeight = monthLabelHeight + 7 * (cellSize + gap)
  const rx = rounded ? cellSize / 2 : 2.5

  return (
    <TooltipProvider delayDuration={100}>
      <svg width="100%" viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="overflow-visible">
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
                    stroke={isToday ? 'rgba(255,255,255,0.4)' : 'none'}
                    strokeWidth={isToday ? 1 : 0}
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
                ? 'rgba(255,255,255,0.02)'
                : 'rgba(255,255,255,0.04)'
          return (
            <rect
              key={day.dateStr}
              x={x} y={y}
              width={cellSize} height={cellSize}
              rx={2}
              fill={fill}
              stroke={isToday ? 'rgba(255,255,255,0.3)' : 'none'}
              strokeWidth={isToday ? 0.5 : 0}
            />
          )
        })
      )}
    </svg>
  )
}
