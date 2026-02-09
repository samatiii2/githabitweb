'use client'

import Link from 'next/link'
import type { Habit, HabitEntry } from '@/lib/types/database'
import { Heatmap } from '@/components/heatmap'
import { HabitToggleButton } from './habit-toggle-button'
import { HabitTagPills } from './habit-tag-pills'
import { DynamicIcon } from '@/components/dynamic-icon'

interface Props {
  habit: Habit
  entries: HabitEntry[]
  isCompletedToday: boolean
  isSkippedToday: boolean
  onToggle: () => void
}

export function HabitHeatmapCard({ habit, entries, isCompletedToday, isSkippedToday, onToggle }: Props) {
  return (
    <div className="bg-card rounded-xl border border-border p-4 space-y-3 hover:border-white/10 transition-colors">
      <div className="flex items-center gap-3">
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
          style={{ backgroundColor: `${habit.color_hex}15` }}
        >
          <DynamicIcon name={habit.icon_name} className="w-4 h-4" style={{ color: habit.color_hex }} />
        </div>

        <Link href={`/app/habits/${habit.id}`} className="flex-1 min-w-0">
          <p className="font-semibold truncate">{habit.title}</p>
        </Link>

        <HabitToggleButton
          colorHex={habit.color_hex}
          isCompleted={isCompletedToday}
          isSkipped={isSkippedToday}
          onClick={onToggle}
        />
      </div>

      <HabitTagPills tags={habit.tags as string[]} colorHex={habit.color_hex} />

      <Heatmap entries={entries} colorHex={habit.color_hex} cellSize={10} gap={2} showMonthLabels showDayLabels={false} />
    </div>
  )
}
