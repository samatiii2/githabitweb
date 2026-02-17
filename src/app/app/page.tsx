'use client'

import { useEffect, useMemo, useState } from 'react'
import { useHabitsStore } from '@/lib/store/habits-store'
import { HabitHeatmapCard } from '@/components/habits/habit-heatmap-card'
import { HabitListRow } from '@/components/habits/habit-list-row'
import { CreateHabitDialog } from '@/components/habits/create-habit-dialog'
import { HabitMonthCard } from '@/components/habits/habit-month-card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import {
  Plus, List, Grid3X3, CalendarDays, Search, Flame,
  Target, TrendingUp, Sparkles, ChevronDown, ChevronUp
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { calculateStreak } from '@/lib/utils/stats'
import { useT } from '@/lib/i18n/provider'

export default function DashboardPage() {
  const {
    habits, entries, groups, loading,
    viewMode, setViewMode,
    selectedGroupId, setSelectedGroupId,
    searchQuery, setSearchQuery,
    fetchHabits, fetchEntries, fetchGroups,
    toggleEntry, upsertEntry
  } = useHabitsStore()

  const t = useT()
  const [createOpen, setCreateOpen] = useState(false)
  const [showStats, setShowStats] = useState(false)

  // Simple toggle for boolean habits or cycling existing entries
  const handleToggle = (habitId: string, date?: string) => {
    const targetDate = date ?? todayDate
    toggleEntry(habitId, targetDate)
  }

  // Unified submit from the popover (sessions, numeric, or both)
  const handlePopoverSubmit = (habitId: string, date: string, opts: { sessionId?: string; value?: number }) => {
    upsertEntry({
      habit_id: habitId,
      date,
      status: 'completed',
      value: opts.value ?? null,
      session_id: opts.sessionId ?? null,
    })
  }

  useEffect(() => {
    fetchHabits()
    fetchEntries()
    fetchGroups()
  }, [fetchHabits, fetchEntries, fetchGroups])

  const todayDate = format(new Date(), 'yyyy-MM-dd')

  const filteredHabits = useMemo(() => {
    let result = habits.filter(h => !h.is_archived)
    if (selectedGroupId) result = result.filter(h => h.group_id === selectedGroupId)
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      result = result.filter(h => h.title.toLowerCase().includes(q))
    }
    return result
  }, [habits, selectedGroupId, searchQuery])

  const entriesForHabit = (habitId: string) =>
    entries.filter(e => e.habit_id === habitId)

  const isCompletedToday = (habitId: string) =>
    entries.some(e => e.habit_id === habitId && e.date === todayDate && e.status === 'completed')

  const isSkippedToday = (habitId: string) =>
    entries.some(e => e.habit_id === habitId && e.date === todayDate && e.status === 'skipped')

  // Stats
  const completedToday = useMemo(() =>
    filteredHabits.filter(h => isCompletedToday(h.id)).length
  , [filteredHabits, entries])

  const completionPercent = useMemo(() => {
    if (filteredHabits.length === 0) return 0
    return Math.round((completedToday / filteredHabits.length) * 100)
  }, [completedToday, filteredHabits.length])

  const bestStreak = useMemo(() => {
    if (filteredHabits.length === 0) return 0
    return Math.max(...filteredHabits.map(h => calculateStreak(entriesForHabit(h.id))))
  }, [filteredHabits, entries])

  if (loading) {
    return (
      <div className="p-6 lg:p-8 space-y-6">
        <div className="shimmer h-8 w-48 rounded-lg" />
        <div className="space-y-3">
          {[1,2,3].map(i => <div key={i} className="shimmer h-32 rounded-xl" />)}
        </div>
      </div>
    )
  }

  const greeting = (() => {
    const hour = new Date().getHours()
    if (hour < 12) return t('habits.goodMorning')
    if (hour < 17) return t('habits.goodAfternoon')
    return t('habits.goodEvening')
  })()

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">{greeting} ✨</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {format(new Date(), 'EEEE, MMMM d, yyyy')}
          </p>
        </div>
        <Button
          onClick={() => setCreateOpen(true)}
          className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2 font-semibold shadow-lg shadow-primary/10"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">{t('habits.newHabit')}</span>
        </Button>
      </div>

      {/* Stats — collapsible, hidden by default */}
      {filteredHabits.length > 0 && (
        <div>
          <button
            onClick={() => setShowStats(!showStats)}
            className="flex items-center gap-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors px-1 py-1"
          >
            {showStats ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            {showStats ? t('habits.hideStats') : t('habits.showStats')}
            {!showStats && (
              <span className="text-[10px] ml-1 opacity-60">
                — {completedToday}/{filteredHabits.length} {t('common.today').toLowerCase()} · {completionPercent}%
              </span>
            )}
          </button>

          {showStats && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 mt-2">
              <div className="card-elevated rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{t('common.today')}</span>
                  <Target className="w-4 h-4 text-primary" />
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold">{completedToday}</span>
                  <span className="text-sm text-muted-foreground">/ {filteredHabits.length}</span>
                </div>
                <Progress value={completionPercent} className="h-1.5" />
              </div>

              <div className="card-elevated rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{t('landing.completionRate')}</span>
                  <TrendingUp className="w-4 h-4 text-blue-400" />
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold">{completionPercent}</span>
                  <span className="text-sm text-muted-foreground">%</span>
                </div>
                <div className="h-1.5 rounded-full bg-secondary">
                  <div className="h-full rounded-full bg-blue-400 transition-all" style={{ width: `${completionPercent}%` }} />
                </div>
              </div>

              <div className="card-elevated rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{t('habits.bestStreak')}</span>
                  <Flame className="w-4 h-4 text-orange-400" />
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold">{bestStreak}</span>
                  <span className="text-sm text-muted-foreground">days</span>
                </div>
              </div>

              <div className="card-elevated rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{t('habits.habits')}</span>
                  <Sparkles className="w-4 h-4 text-purple-400" />
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold">{filteredHabits.length}</span>
                  <span className="text-sm text-muted-foreground">{t('habits.active')}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Search + View mode + Group filter */}
      <div className="flex flex-col lg:flex-row gap-3 items-start lg:items-center">
        <div className="relative flex-1 w-full lg:max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder={t('habits.searchHabits')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-secondary/50 border-0 focus-visible:ring-1 focus-visible:ring-primary/30 h-9"
          />
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Group filter pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto">
            <button
              onClick={() => setSelectedGroupId(null)}
              className={cn(
                'px-3 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap',
                selectedGroupId === null
                  ? 'bg-primary/10 text-primary ring-1 ring-primary/20'
                  : 'bg-secondary text-muted-foreground hover:text-foreground'
              )}
            >
              All
            </button>
            {groups.map(g => (
              <button
                key={g.id}
                onClick={() => setSelectedGroupId(g.id)}
                className={cn(
                  'px-3 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap',
                  selectedGroupId === g.id
                    ? 'ring-1'
                    : 'bg-secondary text-muted-foreground hover:text-foreground'
                )}
                style={selectedGroupId === g.id ? {
                  backgroundColor: `${g.color_hex}15`,
                  color: g.color_hex,
                  boxShadow: `0 0 0 1px ${g.color_hex}30`
                } : undefined}
              >
                {g.name}
              </button>
            ))}
          </div>

          {/* View mode - segmented control */}
          <div className="flex items-center bg-secondary/80 rounded-lg p-0.5 border border-border/50">
            {([
              { mode: 'heatmap' as const, icon: Grid3X3, label: t('habits.year') },
              { mode: 'month' as const, icon: CalendarDays, label: t('habits.month') },
              { mode: 'list' as const, icon: List, label: t('habits.list') },
            ]).map(({ mode, icon: Icon, label }) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                title={label}
                className={cn(
                  'flex items-center gap-1.5 px-2 py-1.5 rounded-md transition-all text-xs font-medium',
                  viewMode === mode
                    ? 'bg-card text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <Icon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Empty state */}
      {filteredHabits.length === 0 && (
        <div className="text-center py-24 space-y-4">
          <div className="w-20 h-20 rounded-2xl bg-card flex items-center justify-center mx-auto border border-border">
            <Sparkles className="w-9 h-9 text-muted-foreground/50" />
          </div>
          <div className="space-y-2">
            <p className="font-semibold text-lg">
              {searchQuery ? t('habits.noMatch') : t('habits.noHabitsTitle')}
            </p>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto">
              {searchQuery
                ? t('common.tryDifferentSearch')
                : t('habits.noHabitsDesc')
              }
            </p>
          </div>
          {!searchQuery && (
            <Button
              onClick={() => setCreateOpen(true)}
              className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2 mt-2"
            >
              <Plus className="w-4 h-4" /> {t('habits.createFirst')}
            </Button>
          )}
        </div>
      )}

      {/* Year Heatmap view */}
      {viewMode === 'heatmap' && filteredHabits.length > 0 && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          {filteredHabits.map(habit => (
            <HabitHeatmapCard
              key={habit.id}
              habit={habit}
              entries={entriesForHabit(habit.id)}
              allEntries={entries}
              isCompletedToday={isCompletedToday(habit.id)}
              isSkippedToday={isSkippedToday(habit.id)}
              onToggle={() => handleToggle(habit.id)}
              onToggleDate={(dateStr) => handleToggle(habit.id, dateStr)}
              onSubmit={(opts) => handlePopoverSubmit(habit.id, todayDate, opts)}
              onSubmitDate={(date, opts) => handlePopoverSubmit(habit.id, date, opts)}
            />
          ))}
        </div>
      )}

      {/* Month view — calendar cards with interactive cells */}
      {viewMode === 'month' && filteredHabits.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredHabits.map(habit => (
            <HabitMonthCard
              key={habit.id}
              habit={habit}
              entries={entriesForHabit(habit.id)}
              allEntries={entries}
              isCompletedToday={isCompletedToday(habit.id)}
              isSkippedToday={isSkippedToday(habit.id)}
              onToggle={() => handleToggle(habit.id)}
              onToggleDate={(dateStr) => handleToggle(habit.id, dateStr)}
              onSubmit={(opts) => handlePopoverSubmit(habit.id, todayDate, opts)}
              onSubmitDate={(date, opts) => handlePopoverSubmit(habit.id, date, opts)}
            />
          ))}
        </div>
      )}

      {/* List view */}
      {viewMode === 'list' && filteredHabits.length > 0 && (
        <div className="card-elevated rounded-xl divide-y divide-border overflow-hidden">
          {filteredHabits.map(habit => (
            <HabitListRow
              key={habit.id}
              habit={habit}
              entries={entriesForHabit(habit.id)}
              allEntries={entries}
              isCompletedToday={isCompletedToday(habit.id)}
              isSkippedToday={isSkippedToday(habit.id)}
              onToggle={() => handleToggle(habit.id)}
              onToggleDate={(dateStr) => handleToggle(habit.id, dateStr)}
              onSubmit={(opts) => handlePopoverSubmit(habit.id, todayDate, opts)}
              onSubmitDate={(date, opts) => handlePopoverSubmit(habit.id, date, opts)}
            />
          ))}
        </div>
      )}

      <CreateHabitDialog open={createOpen} onOpenChange={setCreateOpen} />



    </div>
  )
}
