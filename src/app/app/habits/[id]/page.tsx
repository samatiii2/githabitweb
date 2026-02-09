'use client'

import { useEffect, useMemo, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useHabitsStore } from '@/lib/store/habits-store'
import { Heatmap } from '@/components/heatmap'
import { HabitToggleButton } from '@/components/habits/habit-toggle-button'
import { HabitTagPills } from '@/components/habits/habit-tag-pills'
import { DynamicIcon } from '@/components/dynamic-icon'
import { EditHabitDialog } from '@/components/habits/edit-habit-dialog'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ArrowLeft, Settings, Flame, Trophy, CheckCircle, BarChart3 } from 'lucide-react'
import { calculateStreak, calculateBestStreak, calculateTotal, calculateRate, todayStr } from '@/lib/utils/stats'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, addMonths, subMonths } from 'date-fns'

export default function HabitDetailPage() {
  const params = useParams()
  const router = useRouter()
  const habitId = params.id as string
  const { habits, entries, fetchHabits, fetchEntries, toggleEntry } = useHabitsStore()
  const [editOpen, setEditOpen] = useState(false)
  const [calMonth, setCalMonth] = useState(new Date())

  useEffect(() => {
    if (habits.length === 0) fetchHabits()
    if (entries.length === 0) fetchEntries()
  }, [habits.length, entries.length, fetchHabits, fetchEntries])

  const habit = habits.find(h => h.id === habitId)
  const habitEntries = useMemo(() => entries.filter(e => e.habit_id === habitId), [entries, habitId])
  const today = todayStr()

  const isCompletedToday = habitEntries.some(e => e.date === today && e.status === 'completed')
  const isSkippedToday = habitEntries.some(e => e.date === today && e.status === 'skipped')

  const streak = useMemo(() => calculateStreak(habitEntries), [habitEntries])
  const bestStreak = useMemo(() => calculateBestStreak(habitEntries), [habitEntries])
  const total = useMemo(() => calculateTotal(habitEntries), [habitEntries])
  const rate = useMemo(() => calculateRate(habitEntries), [habitEntries])

  if (!habit) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Habit not found</p>
      </div>
    )
  }

  // Calendar grid
  const monthStart = startOfMonth(calMonth)
  const monthEnd = endOfMonth(calMonth)
  const calDays = eachDayOfInterval({ start: monthStart, end: monthEnd })
  const startDayOfWeek = (getDay(monthStart) + 6) % 7 // Monday=0

  const stats = [
    { icon: Flame, label: 'Streak', value: streak, suffix: 'd', color: '#FF9F5A' },
    { icon: Trophy, label: 'Best', value: bestStreak, suffix: 'd', color: '#FFEB3B' },
    { icon: CheckCircle, label: 'Total', value: total, suffix: '', color: '#3DD68C' },
    { icon: BarChart3, label: 'Rate', value: rate, suffix: '%', color: '#5B9FFF' },
  ]

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-6 space-y-6">
      {/* Back + Edit */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={() => router.push('/app')} className="gap-2">
          <ArrowLeft className="w-4 h-4" /> Back
        </Button>
        <Button variant="ghost" size="sm" onClick={() => setEditOpen(true)} className="gap-2">
          <Settings className="w-4 h-4" /> Edit
        </Button>
      </div>

      {/* Header */}
      <div className="flex items-center gap-4">
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0"
          style={{ backgroundColor: `${habit.color_hex}15` }}
        >
          <DynamicIcon name={habit.icon_name} className="w-7 h-7" style={{ color: habit.color_hex }} />
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-bold truncate">{habit.title}</h1>
          <HabitTagPills tags={habit.tags as string[]} colorHex={habit.color_hex} />
          {(!habit.tags || (habit.tags as string[]).length === 0) && (
            <p className="text-sm text-muted-foreground">
              {habit.frequency === 'daily' ? 'Daily' : `${habit.weekly_target}x/week`} &middot; {habit.tracking_type}
            </p>
          )}
        </div>
        <HabitToggleButton
          colorHex={habit.color_hex}
          isCompleted={isCompletedToday}
          isSkipped={isSkippedToday}
          onClick={() => toggleEntry(habitId, today)}
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        {stats.map(s => (
          <div key={s.label} className="bg-card rounded-xl border border-border p-3 text-center space-y-1">
            <s.icon className="w-5 h-5 mx-auto" style={{ color: s.color }} />
            <p className="text-xl font-bold">{s.value}{s.suffix}</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Tabs: Year / Calendar */}
      <Tabs defaultValue="year">
        <TabsList className="w-full">
          <TabsTrigger value="year" className="flex-1">Year</TabsTrigger>
          <TabsTrigger value="calendar" className="flex-1">Calendar</TabsTrigger>
        </TabsList>

        <TabsContent value="year" className="mt-4">
          <div className="bg-card rounded-xl border border-border p-4">
            <Heatmap
              entries={habitEntries}
              colorHex={habit.color_hex}
              showMonthLabels
              showDayLabels
              cellSize={13}
              gap={3}
            />
            {/* Legend */}
            <div className="flex items-center gap-4 mt-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: habit.color_hex }} />
                Completed
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-sm bg-[#FF9F5A]" />
                Skipped
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: `${habit.color_hex}26` }} />
                Missed
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="calendar" className="mt-4">
          <div className="bg-card rounded-xl border border-border p-4 space-y-4">
            {/* Month nav */}
            <div className="flex items-center justify-between">
              <Button variant="ghost" size="sm" onClick={() => setCalMonth(subMonths(calMonth, 1))}>
                ←
              </Button>
              <p className="font-semibold">{format(calMonth, 'MMMM yyyy')}</p>
              <Button variant="ghost" size="sm" onClick={() => setCalMonth(addMonths(calMonth, 1))}>
                →
              </Button>
            </div>

            {/* Day labels */}
            <div className="grid grid-cols-7 gap-1.5 text-center">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => (
                <span key={d} className="text-[10px] text-muted-foreground font-medium">{d}</span>
              ))}
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-1.5">
              {/* Empty cells for padding */}
              {Array.from({ length: startDayOfWeek }).map((_, i) => (
                <div key={`pad-${i}`} />
              ))}

              {calDays.map(day => {
                const dateStr = format(day, 'yyyy-MM-dd')
                const entry = habitEntries.find(e => e.date === dateStr)
                const isToday = dateStr === today
                const completed = entry?.status === 'completed'
                const skipped = entry?.status === 'skipped'

                return (
                  <button
                    key={dateStr}
                    onClick={() => toggleEntry(habitId, dateStr)}
                    className="aspect-square rounded-lg flex items-center justify-center text-xs font-medium transition-all hover:scale-105"
                    style={{
                      backgroundColor: completed
                        ? habit.color_hex
                        : skipped
                          ? '#FF9F5A'
                          : `${habit.color_hex}12`,
                      color: completed || skipped ? '#fff' : 'inherit',
                      outline: isToday ? '2px solid #FF5252' : 'none',
                      outlineOffset: '1px',
                    }}
                  >
                    {day.getDate()}
                  </button>
                )
              })}
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <EditHabitDialog habit={habit} open={editOpen} onOpenChange={setEditOpen} />
    </div>
  )
}
