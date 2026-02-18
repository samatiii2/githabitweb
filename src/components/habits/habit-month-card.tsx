'use client'

import Link from 'next/link'
import { format } from 'date-fns'
import type { Habit, HabitEntry } from '@/lib/types/database'
import { MonthlyHeatmap } from '@/components/heatmap'
import { HabitToggleButton } from './habit-toggle-button'
import { NumericInputPopover } from './numeric-input-dialog'
import { DynamicIcon } from '@/components/dynamic-icon'
import { calculateStreak } from '@/lib/utils/stats'
import { useMemo } from 'react'
import { Flame } from 'lucide-react'

interface Props {
  habit: Habit
  entries: HabitEntry[]
  allEntries?: HabitEntry[]
  isCompletedToday: boolean
  isSkippedToday: boolean
  onToggle: () => void
  onToggleDate: (dateStr: string) => void
  onSubmit: (opts: { sessionId?: string; value?: number; optionId?: string }) => void
  onSubmitDate?: (date: string, opts: { sessionId?: string; value?: number; optionId?: string }) => void
}

export function HabitMonthCard({ habit, entries, allEntries, isCompletedToday, isSkippedToday, onToggle, onToggleDate, onSubmit, onSubmitDate }: Props) {
  const streak = useMemo(() => calculateStreak(entries), [entries])
  const todayDate = format(new Date(), 'yyyy-MM-dd')

  return (
    <div className="card-elevated rounded-xl p-4 transition-all duration-200 group">
      {/* Header */}
      <div className="flex items-center gap-2.5 mb-3">
        <Link href={`/app/habits/${habit.id}`} className="flex items-center gap-2.5 flex-1 min-w-0">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
            style={{ backgroundColor: `${habit.color_hex}12` }}
          >
            <DynamicIcon name={habit.icon_name} className="w-4 h-4" style={{ color: habit.color_hex }} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm truncate group-hover:text-primary transition-colors">{habit.title}</p>
            <div className="flex items-center gap-1 mt-0.5">
              <Flame className="w-2.5 h-2.5 text-orange-400" />
              <span className="text-[10px] text-muted-foreground">{streak}d</span>
            </div>
          </div>
        </Link>
        <div onClick={(e) => e.preventDefault()}>
          <NumericInputPopover
            habit={habit}
            date={todayDate}
            entries={allEntries ?? entries}
            hasEntry={isCompletedToday || isSkippedToday}
            onPassthrough={onToggle}
            onSubmit={onSubmit}
          >
            <HabitToggleButton
              colorHex={habit.color_hex}
              isCompleted={isCompletedToday}
              isSkipped={isSkippedToday}
              onClick={onToggle}
              size="sm"
            />
          </NumericInputPopover>
        </div>
      </div>

      {/* Monthly calendar — full-sized, interactive cells */}
      <MonthlyHeatmap
        entries={entries}
        colorHex={habit.color_hex}
        onToggle={onToggleDate}
        targetValue={habit.target_value}
        trackingType={habit.tracking_type}
        unit={habit.unit}
        habit={habit}
        onPopoverSubmit={onSubmitDate}
      />
    </div>
  )
}
