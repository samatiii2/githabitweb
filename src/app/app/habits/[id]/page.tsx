'use client'

import { useEffect, useMemo, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useHabitsStore } from '@/lib/store/habits-store'
import { Heatmap, MonthlyHeatmap } from '@/components/heatmap'
import { HabitToggleButton } from '@/components/habits/habit-toggle-button'
import { HabitTagPills } from '@/components/habits/habit-tag-pills'
import { DynamicIcon } from '@/components/dynamic-icon'
import { EditHabitDialog } from '@/components/habits/edit-habit-dialog'
import { SessionPickerDialog } from '@/components/habits/session-picker-dialog'
import { Button } from '@/components/ui/button'
import {
  ArrowLeft, Settings, Flame, Trophy, CheckCircle, BarChart3,
  Grid3X3, CalendarDays, ChevronDown, ChevronUp
} from 'lucide-react'
import { calculateStreak, calculateBestStreak, calculateTotal, calculateRate, todayStr } from '@/lib/utils/stats'
import { cn } from '@/lib/utils'

export default function HabitDetailPage() {
  const params = useParams()
  const router = useRouter()
  const habitId = params.id as string
  const { habits, entries, fetchHabits, fetchEntries, toggleEntry, upsertEntry } = useHabitsStore()
  const [editOpen, setEditOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<'year' | 'month'>('year')
  const [showStats, setShowStats] = useState(false)
  const [sessionPickerDate, setSessionPickerDate] = useState<string | null>(null)

  // Smart toggle: if habit has sessions and no entry for the date, show picker
  const handleToggle = (date: string) => {
    const habit = habits.find(h => h.id === habitId)
    const dateEntry = entries.find(e => e.habit_id === habitId && e.date === date)

    if (habit?.sessions && (habit.sessions as any[]).length > 0 && !dateEntry) {
      setSessionPickerDate(date)
    } else {
      toggleEntry(habitId, date)
    }
  }

  const handleSelectSession = (sessionId: string) => {
    if (!sessionPickerDate) return
    upsertEntry({ habit_id: habitId, date: sessionPickerDate, status: 'completed', session_id: sessionId })
    setSessionPickerDate(null)
  }

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

  const stats = [
    { icon: Flame, label: 'Current Streak', value: streak, suffix: ' days', color: '#f97316', bg: '#f9731610' },
    { icon: Trophy, label: 'Best Streak', value: bestStreak, suffix: ' days', color: '#eab308', bg: '#eab30810' },
    { icon: CheckCircle, label: 'Total Done', value: total, suffix: '', color: '#3DD68C', bg: '#3DD68C10' },
    { icon: BarChart3, label: 'Success Rate', value: rate, suffix: '%', color: '#60a5fa', bg: '#60a5fa10' },
  ]

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto">
      {/* Navigation */}
      <div className="flex items-center justify-between mb-6">
        <Button variant="ghost" size="sm" onClick={() => router.push('/app')} className="gap-2 text-muted-foreground hover:text-foreground -ml-2">
          <ArrowLeft className="w-4 h-4" /> Back
        </Button>
        <Button variant="outline" size="sm" onClick={() => setEditOpen(true)} className="gap-2 text-sm">
          <Settings className="w-3.5 h-3.5" /> Edit
        </Button>
      </div>

      {/* Header: habit info + today toggle — always visible */}
      <div className="card-elevated rounded-2xl p-5 lg:p-6 mb-4">
        <div className="flex items-start gap-4">
          <div
            className="w-14 h-14 lg:w-16 lg:h-16 rounded-2xl flex items-center justify-center shrink-0"
            style={{ backgroundColor: `${habit.color_hex}12` }}
          >
            <DynamicIcon name={habit.icon_name} className="w-7 h-7 lg:w-8 lg:h-8" style={{ color: habit.color_hex }} />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-lg lg:text-2xl font-bold truncate">{habit.title}</h1>
            <p className="text-xs lg:text-sm text-muted-foreground mt-0.5">
              {habit.frequency === 'daily' ? 'Every day' : `${habit.weekly_target}x per week`} · {habit.tracking_type === 'boolean' ? 'Yes/No' : habit.tracking_type}
            </p>
            <div className="mt-2">
              <HabitTagPills tags={habit.tags as string[]} colorHex={habit.color_hex} />
            </div>
          </div>
        </div>

        {/* Today's toggle */}
        <div className="mt-4 flex items-center gap-3 p-3 rounded-xl bg-secondary/50">
          <HabitToggleButton
            colorHex={habit.color_hex}
            isCompleted={isCompletedToday}
            isSkipped={isSkippedToday}
            onClick={() => handleToggle(today)}
          />
          <div className="flex-1">
            <p className="text-sm font-medium">
              {isCompletedToday ? 'Completed today!' : isSkippedToday ? 'Skipped today' : 'Not done yet'}
            </p>
            <p className="text-[11px] text-muted-foreground">
              {(() => {
                if (isCompletedToday) {
                  const todayEntry = habitEntries.find(e => e.date === today && e.status === 'completed')
                  const sessions = (habit.sessions as { id: string; label: string }[]) ?? []
                  if (todayEntry?.session_id && sessions.length > 0) {
                    const session = sessions.find(s => s.id === todayEntry.session_id)
                    return session ? `Session: ${session.label}` : 'Great job! Keep going.'
                  }
                  return 'Great job! Keep going.'
                }
                return habit.sessions && (habit.sessions as any[]).length > 0
                  ? 'Tap to pick today\'s session.'
                  : 'Tap to mark as done.'
              })()}
            </p>
          </div>
          {/* Inline quick stats */}
          <div className="hidden sm:flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><Flame className="w-3 h-3 text-orange-400" />{streak}d</span>
            <span className="flex items-center gap-1"><Trophy className="w-3 h-3 text-yellow-400" />{bestStreak}d</span>
            <span className="flex items-center gap-1"><BarChart3 className="w-3 h-3 text-blue-400" />{rate}%</span>
          </div>
        </div>
      </div>

      {/* Stats — collapsible, hidden by default */}
      <div className="mb-4">
        <button
          onClick={() => setShowStats(!showStats)}
          className="flex items-center gap-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors px-1 py-1.5"
        >
          {showStats ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          {showStats ? 'Hide statistics' : 'Show statistics'}
        </button>

        {showStats && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-2 animate-in fade-in slide-in-from-top-2 duration-200">
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
        )}
      </div>

      {/* Tab switcher — Year / Month */}
      <div className="flex items-center bg-secondary/80 rounded-lg p-0.5 border border-border/50 w-fit mb-4">
        {([
          { id: 'year' as const, label: 'Year', icon: Grid3X3 },
          { id: 'month' as const, label: 'Month', icon: CalendarDays },
        ]).map(tab => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex items-center gap-1.5 px-3 lg:px-4 py-2 rounded-md text-xs lg:text-sm font-medium transition-all',
                activeTab === tab.id ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Icon className="w-3.5 h-3.5 lg:w-4 lg:h-4" /> {tab.label}
            </button>
          )
        })}
      </div>

      {/* ─── Year Heatmap ─── */}
      {activeTab === 'year' && (
        <div className="card-elevated rounded-2xl p-4 lg:p-6 space-y-4">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            {new Date().getFullYear()} Contribution Map
          </h3>
          <Heatmap
            entries={habitEntries}
            colorHex={habit.color_hex}
            showMonthLabels
            showDayLabels
            cellSize={16}
            gap={3}
            onToggle={(dateStr) => handleToggle(dateStr)}
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
              <div className="w-3 h-3 rounded-sm bg-foreground/5" />
              Missed
            </div>
          </div>
        </div>
      )}

      {/* ─── Monthly Heatmap ─── */}
      {activeTab === 'month' && (
        <div className="card-elevated rounded-2xl p-4 lg:p-6">
          <MonthlyHeatmap
            entries={habitEntries}
            colorHex={habit.color_hex}
            onToggle={(dateStr) => handleToggle(dateStr)}
          />
          {/* Legend */}
          <div className="flex items-center gap-5 text-xs text-muted-foreground pt-4 mt-4 border-t border-border">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: habit.color_hex }} />
              Completed
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-sm bg-amber-500" />
              Skipped
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-sm bg-foreground/5" />
              Missed
            </div>
          </div>
        </div>
      )}

      <EditHabitDialog habit={habit} open={editOpen} onOpenChange={setEditOpen} />

      {/* Session Picker Dialog */}
      {sessionPickerDate && habit && (
        <SessionPickerDialog
          open={true}
          onOpenChange={(open) => { if (!open) setSessionPickerDate(null) }}
          habit={habit}
          entries={entries}
          date={sessionPickerDate}
          onSelectSession={handleSelectSession}
        />
      )}
    </div>
  )
}
