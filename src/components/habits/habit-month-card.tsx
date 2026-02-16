'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { format, addMonths, subMonths } from 'date-fns'
import type { Habit, HabitEntry } from '@/lib/types/database'
import { MiniMonthCalendar } from '@/components/heatmap'
import { HabitToggleButton } from './habit-toggle-button'
import { NumericInputPopover } from './numeric-input-dialog'
import { DynamicIcon } from '@/components/dynamic-icon'
import { calculateStreak } from '@/lib/utils/stats'
import { Flame, ChevronLeft, ChevronRight } from 'lucide-react'

interface Props {
  habit: Habit
  entries: HabitEntry[]
  allEntries?: HabitEntry[]
  isCompletedToday: boolean
  isSkippedToday: boolean
  onToggle: () => void
  onToggleDate: (dateStr: string) => void
  onSubmit: (opts: { sessionId?: string; value?: number }) => void
  onSubmitDate?: (date: string, opts: { sessionId?: string; value?: number }) => void
}

export function HabitMonthCard({ habit, entries, allEntries, isCompletedToday, isSkippedToday, onToggle, onToggleDate, onSubmit, onSubmitDate }: Props) {
  const streak = useMemo(() => calculateStreak(entries), [entries])
  const [month, setMonth] = useState(new Date())
  const todayDate = format(new Date(), 'yyyy-MM-dd')

  return (
    <div className="card-elevated rounded-xl p-3 transition-all duration-200 group hover:scale-[1.01]">
      {/* Compact header */}
      <div className="flex items-center gap-2 mb-2">
        <Link href={`/app/habits/${habit.id}`} className="flex items-center gap-2 flex-1 min-w-0">
          <div
            className="w-7 h-7 rounded-md flex items-center justify-center shrink-0"
            style={{ backgroundColor: `${habit.color_hex}12` }}
          >
            <DynamicIcon name={habit.icon_name} className="w-3.5 h-3.5" style={{ color: habit.color_hex }} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-xs truncate group-hover:text-primary transition-colors">{habit.title}</p>
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

      {/* Month nav — tiny inline */}
      <div className="flex items-center justify-between mb-1.5">
        <button
          onClick={() => setMonth(m => subMonths(m, 1))}
          className="w-4 h-4 flex items-center justify-center rounded hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="w-2.5 h-2.5" />
        </button>
        <span className="text-[9px] font-medium text-muted-foreground">{format(month, 'MMM yyyy')}</span>
        <button
          onClick={() => setMonth(m => addMonths(m, 1))}
          className="w-4 h-4 flex items-center justify-center rounded hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
        >
          <ChevronRight className="w-2.5 h-2.5" />
        </button>
      </div>

      {/* Month calendar */}
      <MiniMonthCalendar
        entries={entries}
        colorHex={habit.color_hex}
        month={month}
        onToggle={onToggleDate}
        habit={habit}
        allEntries={allEntries ?? entries}
        onPopoverSubmit={onSubmitDate}
      />
    </div>
  )
}
