'use client'

import { useEffect, useMemo, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useHabitsStore } from '@/lib/store/habits-store'
import { useT } from '@/lib/i18n/provider'
import { Heatmap, MonthlyHeatmap } from '@/components/heatmap'
import { HabitToggleButton } from '@/components/habits/habit-toggle-button'
import { DynamicIcon } from '@/components/dynamic-icon'
import { EditHabitDialog } from '@/components/habits/edit-habit-dialog'
import { NumericInputPopover } from '@/components/habits/numeric-input-dialog'
import { Button } from '@/components/ui/button'
import {
  ArrowLeft, Settings, Flame, Trophy, CheckCircle, BarChart3,
  Grid3X3, CalendarDays, ChevronDown, ChevronUp
} from 'lucide-react'
import { calculateStreak, calculateBestStreak, calculateTotal, calculateRate, calculateNumericStats, todayStr } from '@/lib/utils/stats'
import { cn } from '@/lib/utils'

export default function HabitDetailPage() {
  const params = useParams()
  const router = useRouter()
  const habitId = params.id as string
  const { habits, entries, fetchHabits, fetchEntries, toggleEntry, upsertEntry } = useHabitsStore()
  const t = useT()
  const [editOpen, setEditOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<'year' | 'month'>('year')
  const [showStats, setShowStats] = useState(false)

  // Simple toggle for boolean habits or cycling existing entries
  const handleToggle = (date: string) => {
    toggleEntry(habitId, date)
  }

  // Unified submit from the popover
  const handlePopoverSubmit = (date: string, opts: { sessionId?: string; value?: number }) => {
    upsertEntry({
      habit_id: habitId,
      date,
      status: 'completed',
      value: opts.value ?? null,
      session_id: opts.sessionId ?? null,
    })
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
  const numericStats = useMemo(() =>
    habit ? calculateNumericStats(habitEntries, habit.target_value) : null,
    [habitEntries, habit]
  )

  if (!habit) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center space-y-3">
          <p className="text-muted-foreground">Habit not found</p>
          <Button variant="ghost" size="sm" onClick={() => router.push('/app')}>
            <ArrowLeft className="w-4 h-4 mr-2" /> {t('common.back')}
          </Button>
        </div>
      </div>
    )
  }

  const stats = [
    { icon: Flame, label: t('habits.currentStreak'), value: streak, suffix: ' days', color: '#f97316', bg: '#f9731610' },
    { icon: Trophy, label: t('habits.bestStreak'), value: bestStreak, suffix: ' days', color: '#eab308', bg: '#eab30810' },
    { icon: CheckCircle, label: t('habits.totalDone'), value: total, suffix: '', color: '#3DD68C', bg: '#3DD68C10' },
    { icon: BarChart3, label: t('habits.successRate'), value: rate, suffix: '%', color: '#60a5fa', bg: '#60a5fa10' },
  ]

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto">
      {/* Navigation */}
      <div className="flex items-center justify-between mb-6">
        <Button variant="ghost" size="sm" onClick={() => router.push('/app')} className="gap-2 text-muted-foreground hover:text-foreground -ml-2">
          <ArrowLeft className="w-4 h-4" /> {t('common.back')}
        </Button>
        <Button variant="outline" size="sm" onClick={() => setEditOpen(true)} className="gap-2 text-sm">
          <Settings className="w-3.5 h-3.5" /> {t('common.edit')}
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
              {habit.frequency === 'daily' ? t('habits.daily') : t('habits.weeklyTargetLong', { count: habit.weekly_target ?? 1 })} · {habit.tracking_type === 'boolean' ? t('habits.yesNo') : habit.tracking_type}
            </p>
          </div>
        </div>

        {/* Today's toggle */}
        <div className="mt-4 flex items-center gap-3 p-3 rounded-xl bg-secondary/50">
          <NumericInputPopover
            habit={habit}
            date={today}
            entries={entries}
            hasEntry={isCompletedToday || isSkippedToday}
            onPassthrough={() => handleToggle(today)}
            onSubmit={(opts) => handlePopoverSubmit(today, opts)}
          >
            <HabitToggleButton
              colorHex={habit.color_hex}
              isCompleted={isCompletedToday}
              isSkipped={isSkippedToday}
              onClick={() => handleToggle(today)}
            />
          </NumericInputPopover>
          <div className="flex-1">
            <p className="text-sm font-medium">
              {isCompletedToday ? t('habits.completedToday') : isSkippedToday ? t('habits.skippedToday') : t('habits.notDoneYet')}
            </p>
            <p className="text-[11px] text-muted-foreground">
              {(() => {
                if (isCompletedToday) {
                  const todayEntry = habitEntries.find(e => e.date === today && e.status === 'completed')
                  const parts: string[] = []
                  const sessions = (habit.sessions as { id: string; label: string }[]) ?? []
                  if (todayEntry?.session_id && sessions.length > 0) {
                    const session = sessions.find(s => s.id === todayEntry.session_id)
                    if (session) parts.push(session.label)
                  }
                  if (todayEntry?.value != null && habit.tracking_type === 'numeric') {
                    parts.push(`${todayEntry.value} ${habit.unit ?? ''}`.trim())
                  }
                  return parts.length > 0 ? parts.join(' · ') : t('habits.greatJob')
                }
                return habit.sessions && (habit.sessions as any[]).length > 0
                  ? t('habits.tapSession')
                  : habit.tracking_type === 'numeric'
                    ? t('habits.enterYourValue')
                    : t('habits.tapDone')
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
          {showStats ? t('habits.hideStats') : t('habits.showStats')}
        </button>

        {showStats && (
          <div className="space-y-3 mt-2 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
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

            {/* Numeric-specific stats */}
            {habit.tracking_type === 'numeric' && numericStats && (
              <div className="card-elevated rounded-xl p-4">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                  {t('habits.numericStats')} — {habit.unit ?? ''}
                </p>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <p className="text-xl font-bold" style={{ color: habit.color_hex }}>{numericStats.avg}</p>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{t('habits.avgValue')}</p>
                  </div>
                  <div>
                    <p className="text-xl font-bold">{numericStats.min} – {numericStats.max}</p>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{t('habits.minValue')} / {t('habits.maxValue')}</p>
                  </div>
                  <div>
                    <p className="text-xl font-bold text-emerald-500">{numericStats.onTargetPct}%</p>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{t('habits.daysOnTarget')}</p>
                  </div>
                  <div>
                    <p className="text-xl font-bold">{numericStats.total}</p>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{t('habits.totalDone')}</p>
                  </div>
                </div>
              </div>
            )}
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
            {t('habits.contributionMap', { year: new Date().getFullYear() })}
          </h3>
          <Heatmap
            entries={habitEntries}
            colorHex={habit.color_hex}
            showMonthLabels
            showDayLabels
            cellSize={16}
            gap={3}
            onToggle={(dateStr) => handleToggle(dateStr)}
            targetValue={habit.target_value}
            trackingType={habit.tracking_type}
            unit={habit.unit}
            habit={habit}
            allEntries={entries}
            onPopoverSubmit={(date, opts) => handlePopoverSubmit(date, opts)}
          />
          {/* Legend */}
          <div className="flex items-center gap-4 flex-wrap text-xs text-muted-foreground pt-2 border-t border-border">
            {habit.tracking_type === 'numeric' && habit.target_value ? (
              <>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: habit.color_hex }} />
                  100%+
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: habit.color_hex, opacity: 0.7 }} />
                  75%
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: habit.color_hex, opacity: 0.4 }} />
                  50%
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: habit.color_hex, opacity: 0.2 }} />
                  &lt;50%
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: habit.color_hex }} />
                {t('habits.entryCompleted')}
              </div>
            )}
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-sm bg-amber-500" />
              {t('habits.entrySkipped')}
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-sm bg-foreground/5" />
              {t('habits.entryMissed')}
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
            targetValue={habit.target_value}
            trackingType={habit.tracking_type}
            unit={habit.unit}
            habit={habit}
            onPopoverSubmit={(date, opts) => handlePopoverSubmit(date, opts)}
          />
          {/* Legend */}
          <div className="flex items-center gap-4 flex-wrap text-xs text-muted-foreground pt-4 mt-4 border-t border-border">
            {habit.tracking_type === 'numeric' && habit.target_value ? (
              <>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: habit.color_hex }} />
                  100%+
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: habit.color_hex, opacity: 0.7 }} />
                  75%
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: habit.color_hex, opacity: 0.4 }} />
                  50%
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: habit.color_hex, opacity: 0.2 }} />
                  &lt;50%
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: habit.color_hex }} />
                {t('habits.entryCompleted')}
              </div>
            )}
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-sm bg-amber-500" />
              {t('habits.entrySkipped')}
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-sm bg-foreground/5" />
              {t('habits.entryMissed')}
            </div>
          </div>
        </div>
      )}

      <EditHabitDialog habit={habit} open={editOpen} onOpenChange={setEditOpen} />



    </div>
  )
}
