'use client'

import Link from 'next/link'
import type { Habit, HabitEntry } from '@/lib/types/database'
import { HabitToggleButton } from './habit-toggle-button'
import { HabitTagPills } from './habit-tag-pills'
import { DynamicIcon } from '@/components/dynamic-icon'
import { getLastNDays } from '@/lib/utils/stats'
import { format } from 'date-fns'

interface Props {
  habit: Habit
  entries: HabitEntry[]
  isCompletedToday: boolean
  isSkippedToday: boolean
  onToggle: () => void
}

export function HabitListRow({ habit, entries, isCompletedToday, isSkippedToday, onToggle }: Props) {
  const lastDays = getLastNDays(5)
  const todayStr = format(new Date(), 'yyyy-MM-dd')

  return (
    <div className="flex items-center gap-3 px-4 py-3 hover:bg-secondary/30 transition-colors">
      <div
        className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
        style={{ backgroundColor: `${habit.color_hex}15` }}
      >
        <DynamicIcon name={habit.icon_name} className="w-4 h-4" style={{ color: habit.color_hex }} />
      </div>

      <Link href={`/app/habits/${habit.id}`} className="flex-1 min-w-0">
        <p className="font-medium text-sm truncate">{habit.title}</p>
        <HabitTagPills tags={habit.tags as string[]} colorHex={habit.color_hex} max={2} compact />
      </Link>

      {/* Last 5 days */}
      <div className="flex items-center gap-1.5 shrink-0">
        {lastDays.map(day => {
          const dateStr = format(day, 'yyyy-MM-dd')
          const isToday = dateStr === todayStr
          const entry = entries.find(e => e.date === dateStr)
          const completed = entry?.status === 'completed'
          const skipped = entry?.status === 'skipped'

          if (isToday) {
            return (
              <HabitToggleButton
                key={dateStr}
                colorHex={habit.color_hex}
                isCompleted={isCompletedToday}
                isSkipped={isSkippedToday}
                onClick={onToggle}
                size="sm"
              />
            )
          }

          return (
            <div
              key={dateStr}
              className="w-7 h-7 rounded-md flex items-center justify-center text-[9px] font-bold"
              style={{
                backgroundColor: completed
                  ? habit.color_hex
                  : skipped
                    ? '#FF9F5A'
                    : `${habit.color_hex}15`,
                color: completed || skipped ? '#fff' : `${habit.color_hex}60`,
              }}
            >
              {skipped && !completed ? '⏸' : ''}
            </div>
          )
        })}
      </div>
    </div>
  )
}
