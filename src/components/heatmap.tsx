'use client'

import { useMemo } from 'react'
import { format, startOfYear, getDay, addDays, startOfDay, differenceInCalendarWeeks, startOfWeek } from 'date-fns'
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
}: HeatmapProps) {
  const days = useMemo(() => generateYearHeatmapData(entries, year), [entries, year])
  const todayStr = format(new Date(), 'yyyy-MM-dd')

  // Organize into weeks (columns)
  const weeks = useMemo(() => {
    const result: HeatmapDay[][] = []
    const y = year ?? new Date().getFullYear()
    const jan1 = startOfYear(new Date(y, 0, 1))
    // Adjust to Monday-based weeks (0=Mon, 6=Sun)
    const dayOfWeek = (getDay(jan1) + 6) % 7 // Convert Sunday=0 to Monday=0

    let currentWeek: HeatmapDay[] = []
    // Pad first week
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
    if (day.status === 'skipped') return '#FF9F5A'
    if (day.status === 'future') return `${colorHex}14`
    return `${colorHex}26`
  }

  const labelOffset = showDayLabels ? 30 : 0
  const svgWidth = labelOffset + weeks.length * (cellSize + gap)
  const svgHeight = (showMonthLabels ? 16 : 0) + 7 * (cellSize + gap)

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
              y={10}
              className="fill-muted-foreground"
              fontSize={9}
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
              y={(showMonthLabels ? 16 : 0) + i * (cellSize + gap) + cellSize - 2}
              className="fill-muted-foreground"
              fontSize={9}
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
            const y = (showMonthLabels ? 16 : 0) + dayIdx * (cellSize + gap)
            const isToday = day.dateStr === todayStr
            return (
              <Tooltip key={day.dateStr}>
                <TooltipTrigger asChild>
                  <rect
                    x={x}
                    y={y}
                    width={cellSize}
                    height={cellSize}
                    rx={2}
                    fill={getCellColor(day)}
                    stroke={isToday ? '#FF5252' : 'none'}
                    strokeWidth={isToday ? 1.5 : 0}
                    className="cursor-pointer transition-opacity hover:opacity-80"
                  />
                </TooltipTrigger>
                <TooltipContent side="top" className="text-xs">
                  <p>{format(day.date, 'MMM d, yyyy')}</p>
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
 * Compact inline heatmap (used in grid/list cards)
 */
export function CompactHeatmap({ entries, colorHex }: { entries: HabitEntry[]; colorHex: string }) {
  return <Heatmap entries={entries} colorHex={colorHex} cellSize={10} gap={2} showMonthLabels={false} />
}
