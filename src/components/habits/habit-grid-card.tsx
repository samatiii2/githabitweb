'use client'

import Link from 'next/link'
import type { Habit, HabitEntry } from '@/lib/types/database'
import { CompactHeatmap } from '@/components/heatmap'
import { HabitToggleButton } from './habit-toggle-button'
import { HabitTagPills } from './habit-tag-pills'
import { DynamicIcon } from '@/components/dynamic-icon'
import { format } from 'date-fns'

interface Props {
  habit: Habit
  entries: HabitEntry[]
  isCompletedToday: boolean
  isSkippedToday: boolean
  onToggle: () => void
}

export function HabitGridCard({ habit, entries, isCompletedToday, isSkippedToday, onToggle }: Props) {
  return (
    <div className="bg-card rounded-xl border border-border p-4 space-y-2 hover:border-white/10 transition-colors">
      <div className="flex items-center gap-2">
        <DynamicIcon
          name={habit.icon_name}
          className="w-4 h-4 shrink-0"
          style={{ color: habit.color_hex }}
        />
        <Link href={`/app/habits/${habit.id}`} className="flex-1 min-w-0">
          <p className="font-semibold text-sm truncate">{habit.title}</p>
        </Link>
        <HabitToggleButton
          colorHex={habit.color_hex}
          isCompleted={isCompletedToday}
          isSkipped={isSkippedToday}
          onClick={onToggle}
          size="sm"
        />
      </div>

      <HabitTagPills tags={habit.tags as string[]} colorHex={habit.color_hex} max={2} />

      <p className="text-xs text-muted-foreground">
        {format(new Date(), 'MMMM yyyy')}
      </p>

      <CompactHeatmap entries={entries} colorHex={habit.color_hex} />
    </div>
  )
}
