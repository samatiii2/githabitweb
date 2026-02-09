'use client'

import Link from 'next/link'
import type { Habit, HabitEntry } from '@/lib/types/database'
import { HabitToggleButton } from './habit-toggle-button'
import { HabitTagPills } from './habit-tag-pills'
import { DynamicIcon } from '@/components/dynamic-icon'
import { getLastNDays, calculateStreak } from '@/lib/utils/stats'
import { format } from 'date-fns'
import { useMemo } from 'react'
import { ChevronRight, Flame } from 'lucide-react'

interface Props {
  habit: Habit
  entries: HabitEntry[]
  isCompletedToday: boolean
  isSkippedToday: boolean
  onToggle: () => void
}

export function HabitListRow({ habit, entries, isCompletedToday, isSkippedToday, onToggle }: Props) {
  const lastDays = getLastNDays(7)
  const todayStr = format(new Date(), 'yyyy-MM-dd')
  const streak = useMemo(() => calculateStreak(entries), [entries])

  return (
    <div className="flex items-center gap-4 px-4 py-3 hover:bg-accent/50 transition-colors group">
      {/* Toggle */}
      <HabitToggleButton
        colorHex={habit.color_hex}
        isCompleted={isCompletedToday}
        isSkipped={isSkippedToday}
        onClick={onToggle}
      />

      {/* Icon */}
      <div
        className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
        style={{ backgroundColor: `${habit.color_hex}10` }}
      >
        <DynamicIcon name={habit.icon_name} className="w-4 h-4" style={{ color: habit.color_hex }} />
      </div>

      {/* Info */}
      <Link href={`/app/habits/${habit.id}`} className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-medium text-sm truncate">{habit.title}</p>
          {streak > 0 && (
            <span className="flex items-center gap-1 text-[11px] text-orange-400 shrink-0">
              <Flame className="w-3 h-3" />{streak}
            </span>
          )}
        </div>
        <HabitTagPills tags={habit.tags as string[]} colorHex={habit.color_hex} max={3} compact />
      </Link>

      {/* Last 7 days mini dots */}
      <div className="hidden md:flex items-center gap-1 shrink-0">
        {lastDays.map(day => {
          const dateStr = format(day, 'yyyy-MM-dd')
          const entry = entries.find(e => e.date === dateStr)
          const completed = entry?.status === 'completed'
          const skipped = entry?.status === 'skipped'
          const isToday = dateStr === todayStr

          return (
            <div
              key={dateStr}
              className="w-5 h-5 rounded flex items-center justify-center text-[8px] font-bold"
              title={format(day, 'EEE, MMM d')}
              style={{
                backgroundColor: completed
                  ? habit.color_hex
                  : skipped
                    ? '#f59e0b'
                    : 'rgba(255,255,255,0.04)',
                color: completed || skipped ? '#fff' : 'rgba(255,255,255,0.2)',
                outline: isToday ? '1px solid rgba(255,255,255,0.2)' : 'none',
              }}
            >
              {skipped && !completed ? '⏸' : ''}
            </div>
          )
        })}
      </div>

      {/* Arrow */}
      <Link href={`/app/habits/${habit.id}`} className="shrink-0">
        <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
      </Link>
    </div>
  )
}
