'use client'

import Link from 'next/link'
import { format } from 'date-fns'
import type { Habit, HabitEntry } from '@/lib/types/database'
import { Heatmap } from '@/components/heatmap'
import { HabitToggleButton } from './habit-toggle-button'
import { NumericInputPopover } from './numeric-input-dialog'
import { HabitTagPills } from './habit-tag-pills'
import { DynamicIcon } from '@/components/dynamic-icon'
import { calculateStreak, calculateTotal } from '@/lib/utils/stats'
import { useMemo } from 'react'
import { Flame, CheckCircle } from 'lucide-react'

interface Props {
  habit: Habit
  entries: HabitEntry[]
  isCompletedToday: boolean
  isSkippedToday: boolean
  onToggle: () => void
  onSubmit: (opts: { sessionId?: string; value?: number }) => void
}

export function HabitHeatmapCard({ habit, entries, isCompletedToday, isSkippedToday, onToggle, onSubmit }: Props) {
  const streak = useMemo(() => calculateStreak(entries), [entries])
  const total = useMemo(() => calculateTotal(entries), [entries])
  const todayDate = format(new Date(), 'yyyy-MM-dd')

  return (
    <div className="card-elevated rounded-xl p-5 transition-all duration-200 group">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105"
          style={{ backgroundColor: `${habit.color_hex}12` }}
        >
          <DynamicIcon name={habit.icon_name} className="w-5 h-5" style={{ color: habit.color_hex }} />
        </div>

        <Link href={`/app/habits/${habit.id}`} className="flex-1 min-w-0">
          <p className="font-semibold text-[15px] truncate group-hover:text-primary transition-colors">{habit.title}</p>
          <div className="flex items-center gap-3 mt-0.5">
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Flame className="w-3 h-3 text-orange-400" />
              {streak}d streak
            </span>
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <CheckCircle className="w-3 h-3 text-primary" />
              {total} total
            </span>
          </div>
        </Link>

        <NumericInputPopover
          habit={habit}
          date={todayDate}
          entries={entries}
          hasEntry={isCompletedToday || isSkippedToday}
          onPassthrough={onToggle}
          onSubmit={onSubmit}
        >
          <HabitToggleButton
            colorHex={habit.color_hex}
            isCompleted={isCompletedToday}
            isSkipped={isSkippedToday}
            onClick={onToggle}
          />
        </NumericInputPopover>
      </div>

      <HabitTagPills tags={habit.tags as string[]} colorHex={habit.color_hex} />

      {/* Heatmap */}
      <div className="mt-3">
        <Heatmap entries={entries} colorHex={habit.color_hex} cellSize={14} gap={2.5} showMonthLabels showDayLabels={false} />
      </div>
    </div>
  )
}
