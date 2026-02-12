'use client'

import Link from 'next/link'
import type { Habit, HabitEntry } from '@/lib/types/database'
import { MiniHeatmap } from '@/components/heatmap'
import { HabitToggleButton } from './habit-toggle-button'
import { HabitTagPills } from './habit-tag-pills'
import { DynamicIcon } from '@/components/dynamic-icon'
import { calculateStreak } from '@/lib/utils/stats'
import { useMemo } from 'react'
import { Flame } from 'lucide-react'

interface Props {
  habit: Habit
  entries: HabitEntry[]
  isCompletedToday: boolean
  isSkippedToday: boolean
  onToggle: () => void
}

export function HabitGridCard({ habit, entries, isCompletedToday, isSkippedToday, onToggle }: Props) {
  const streak = useMemo(() => calculateStreak(entries), [entries])

  return (
    <Link href={`/app/habits/${habit.id}`} className="block">
      <div className="card-elevated rounded-xl p-4 transition-all duration-200 group hover:scale-[1.01]">
        <div className="flex items-center gap-3 mb-3">
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
            style={{ backgroundColor: `${habit.color_hex}12` }}
          >
            <DynamicIcon name={habit.icon_name} className="w-4 h-4" style={{ color: habit.color_hex }} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm truncate group-hover:text-primary transition-colors">{habit.title}</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <Flame className="w-3 h-3 text-orange-400" />
              <span className="text-[11px] text-muted-foreground">{streak}d streak</span>
            </div>
          </div>
          <div onClick={(e) => e.preventDefault()}>
            <HabitToggleButton
              colorHex={habit.color_hex}
              isCompleted={isCompletedToday}
              isSkipped={isSkippedToday}
              onClick={onToggle}
              size="sm"
            />
          </div>
        </div>

        <HabitTagPills tags={habit.tags as string[]} colorHex={habit.color_hex} max={2} />

        <div className="mt-2">
          <MiniHeatmap entries={entries} colorHex={habit.color_hex} />
        </div>
      </div>
    </Link>
  )
}
