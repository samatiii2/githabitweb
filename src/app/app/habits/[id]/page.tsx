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
import { ArrowLeft, Settings, Flame, Trophy, CheckCircle, BarChart3, Calendar as CalendarIcon, Grid3X3 } from 'lucide-react'
import { calculateStreak, calculateBestStreak, calculateTotal, calculateRate, todayStr } from '@/lib/utils/stats'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, addMonths, subMonths } from 'date-fns'
import { cn } from '@/lib/utils'

export default function HabitDetailPage() {
  const params = useParams()
  const router = useRouter()
  const habitId = params.id as string
  const { habits, entries, fetchHabits, fetchEntries, toggleEntry } = useHabitsStore()
  const [editOpen, setEditOpen] = useState(false)
  const [calMonth, setCalMonth] = useState(new Date())
  const [activeTab, setActiveTab] = useState<'heatmap' | 'calendar'>('heatmap')

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
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center space-y-3">
          <p className="text-muted-foreground">Habit not found</p>
          <Button variant="ghost" size="sm" onClick={() => router.push('/app')}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Go back
          </Button>
        </div>
      </div>
    )
  }

  const monthStart = startOfMonth(calMonth)
  const monthEnd = endOfMonth(calMonth)
  const calDays = eachDayOfInterval({ start: monthStart, end: monthEnd })
  const startDayOfWeek = (getDay(monthStart) + 6) % 7

  const stats = [
    { icon: Flame, label: 'Current Streak', value: streak, suffix: ' days', color: '#f97316', bg: '#f9731610' },
    { icon: Trophy, label: 'Best Streak', value: bestStreak, suffix: ' days', color: '#eab308', bg: '#eab30810' },
    { icon: CheckCircle, label: 'Total Done', value: total, suffix: '', color: '#3DD68C', bg: '#3DD68C10' },
    { icon: BarChart3, label: 'Success Rate', value: rate, suffix: '%', color: '#60a5fa', bg: '#60a5fa10' },
  ]

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Navigation */}
      <div className="flex items-center justify-between mb-6">
        <Button variant="ghost" size="sm" onClick={() => router.push('/app')} className="gap-2 text-muted-foreground hover:text-foreground -ml-2">
          <ArrowLeft className="w-4 h-4" /> Back to habits
        </Button>
        <Button variant="outline" size="sm" onClick={() => setEditOpen(true)} className="gap-2 text-sm">
          <Settings className="w-3.5 h-3.5" /> Edit
        </Button>
      </div>

      {/* Two-column layout on desktop */}
      <div className="grid lg:grid-cols-[1fr,1.2fr] gap-6 lg:gap-8">
        {/* Left column: Info + Stats */}
        <div className="space-y-6">
          {/* Header card */}
          <div className="card-elevated rounded-2xl p-6">
            <div className="flex items-start gap-4">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center shrink-0"
                style={{ backgroundColor: `${habit.color_hex}12` }}
              >
                <DynamicIcon name={habit.icon_name} className="w-8 h-8" style={{ color: habit.color_hex }} />
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-xl lg:text-2xl font-bold truncate">{habit.title}</h1>
                <p className="text-sm text-muted-foreground mt-1">
                  {habit.frequency === 'daily' ? 'Every day' : `${habit.weekly_target}x per week`} · {habit.tracking_type === 'boolean' ? 'Yes/No' : habit.tracking_type}
                </p>
                <div className="mt-2">
                  <HabitTagPills tags={habit.tags as string[]} colorHex={habit.color_hex} />
                </div>
              </div>
            </div>

            {/* Today's toggle */}
            <div className="mt-5 flex items-center gap-3 p-3 rounded-xl bg-secondary/50">
              <HabitToggleButton
                colorHex={habit.color_hex}
                isCompleted={isCompletedToday}
                isSkipped={isSkippedToday}
                onClick={() => toggleEntry(habitId, today)}
              />
              <div className="flex-1">
                <p className="text-sm font-medium">
                  {isCompletedToday ? 'Completed today!' : isSkippedToday ? 'Skipped today' : 'Not done yet'}
                </p>
                <p className="text-[11px] text-muted-foreground">
                  {isCompletedToday ? 'Great job! Keep going.' : 'Tap to mark as done.'}
                </p>
              </div>
            </div>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 gap-3">
            {stats.map(s => (
              <div key={s.label} className="card-elevated rounded-xl p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: s.bg }}>
                    <s.icon className="w-4 h-4" style={{ color: s.color }} />
                  </div>
                </div>
                <p className="text-2xl font-bold tracking-tight">{s.value}{s.suffix}</p>
                <p className="text-[11px] text-muted-foreground uppercase tracking-wider font-medium">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Right column: Heatmap + Calendar */}
        <div className="space-y-4">
          {/* Tab switcher */}
          <div className="flex items-center bg-secondary/80 rounded-lg p-0.5 border border-border/50 w-fit">
            <button
              onClick={() => setActiveTab('heatmap')}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all',
                activeTab === 'heatmap' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Grid3X3 className="w-4 h-4" /> Year view
            </button>
            <button
              onClick={() => setActiveTab('calendar')}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all',
                activeTab === 'calendar' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <CalendarIcon className="w-4 h-4" /> Calendar
            </button>
          </div>

          {/* Year heatmap */}
          {activeTab === 'heatmap' && (
            <div className="card-elevated rounded-2xl p-5 lg:p-6 space-y-4">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                {new Date().getFullYear()} Contribution Map
              </h3>
              <Heatmap
                entries={habitEntries}
                colorHex={habit.color_hex}
                showMonthLabels
                showDayLabels
                cellSize={14}
                gap={3}
              />
              {/* Legend */}
              <div className="flex items-center gap-5 text-xs text-muted-foreground pt-2 border-t border-border">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: habit.color_hex }} />
                  Completed
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-sm bg-amber-500" />
                  Skipped
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-sm bg-white/5" />
                  Missed
                </div>
              </div>
            </div>
          )}

          {/* Calendar */}
          {activeTab === 'calendar' && (
            <div className="card-elevated rounded-2xl p-5 lg:p-6 space-y-5">
              {/* Month nav */}
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setCalMonth(subMonths(calMonth, 1))}
                  className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
                >
                  ←
                </button>
                <p className="font-semibold text-sm">{format(calMonth, 'MMMM yyyy')}</p>
                <button
                  onClick={() => setCalMonth(addMonths(calMonth, 1))}
                  className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
                >
                  →
                </button>
              </div>

              {/* Day labels */}
              <div className="grid grid-cols-7 gap-2 text-center">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => (
                  <span key={d} className="text-[11px] text-muted-foreground font-medium py-1">{d}</span>
                ))}
              </div>

              {/* Calendar grid */}
              <div className="grid grid-cols-7 gap-2">
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
                      className={cn(
                        'aspect-square rounded-xl flex items-center justify-center text-sm font-medium transition-all hover:scale-105 relative',
                        isToday && 'ring-2 ring-white/20'
                      )}
                      style={{
                        backgroundColor: completed
                          ? habit.color_hex
                          : skipped
                            ? '#f59e0b'
                            : 'rgba(255,255,255,0.03)',
                        color: completed || skipped ? '#fff' : 'rgba(255,255,255,0.5)',
                      }}
                    >
                      {day.getDate()}
                    </button>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      <EditHabitDialog habit={habit} open={editOpen} onOpenChange={setEditOpen} />
    </div>
  )
}
