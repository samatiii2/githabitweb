'use client'

import { useEffect, useMemo, useState } from 'react'
import { useHabitsStore } from '@/lib/store/habits-store'
import { HabitHeatmapCard } from '@/components/habits/habit-heatmap-card'
import { HabitGridCard } from '@/components/habits/habit-grid-card'
import { HabitListRow } from '@/components/habits/habit-list-row'
import { CreateHabitDialog } from '@/components/habits/create-habit-dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { Plus, LayoutGrid, List, Grid3X3, Search, Flame, Target, TrendingUp, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { calculateStreak } from '@/lib/utils/stats'

export default function DashboardPage() {
  const {
    habits, entries, groups, loading,
    viewMode, setViewMode,
    selectedGroupId, setSelectedGroupId,
    searchQuery, setSearchQuery,
    fetchHabits, fetchEntries, fetchGroups,
    toggleEntry
  } = useHabitsStore()

  const [createOpen, setCreateOpen] = useState(false)

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
        {/* Shimmer loading */}
        <div className="shimmer h-8 w-48 rounded-lg" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <div key={i} className="shimmer h-24 rounded-xl" />)}
        </div>
        <div className="space-y-3">
          {[1,2,3].map(i => <div key={i} className="shimmer h-32 rounded-xl" />)}
        </div>
      </div>
    )
  }

  const greeting = (() => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 17) return 'Good afternoon'
    return 'Good evening'
  })()

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">{greeting}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {format(new Date(), 'EEEE, MMMM d, yyyy')}
          </p>
        </div>
        <Button
          onClick={() => setCreateOpen(true)}
          className="bg-[#3DD68C] text-black hover:bg-[#3DD68C]/90 gap-2 font-semibold shadow-lg shadow-[#3DD68C]/10"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">New habit</span>
        </Button>
      </div>

      {/* Stats Cards */}
      {filteredHabits.length > 0 && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
          <div className="card-elevated rounded-xl p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Today</span>
              <Target className="w-4 h-4 text-[#3DD68C]" />
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold">{completedToday}</span>
              <span className="text-sm text-muted-foreground">/ {filteredHabits.length}</span>
            </div>
            <Progress value={completionPercent} className="h-1.5" />
          </div>

          <div className="card-elevated rounded-xl p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Completion</span>
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
              <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Best Streak</span>
              <Flame className="w-4 h-4 text-orange-400" />
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold">{bestStreak}</span>
              <span className="text-sm text-muted-foreground">days</span>
            </div>
          </div>

          <div className="card-elevated rounded-xl p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Habits</span>
              <Sparkles className="w-4 h-4 text-purple-400" />
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold">{filteredHabits.length}</span>
              <span className="text-sm text-muted-foreground">active</span>
            </div>
          </div>
        </div>
      )}

      {/* Search + View mode + Group filter */}
      <div className="flex flex-col md:flex-row gap-3 items-start md:items-center">
        <div className="relative flex-1 w-full md:max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search habits..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-secondary/50 border-0 focus-visible:ring-1 focus-visible:ring-[#3DD68C]/30 h-9"
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
                  ? 'bg-[#3DD68C]/10 text-[#3DD68C] ring-1 ring-[#3DD68C]/20'
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
              { mode: 'heatmap' as const, icon: Grid3X3, label: 'Heatmap' },
              { mode: 'grid' as const, icon: LayoutGrid, label: 'Grid' },
              { mode: 'list' as const, icon: List, label: 'List' },
            ]).map(({ mode, icon: Icon, label }) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                title={label}
                className={cn(
                  'p-1.5 rounded-md transition-all',
                  viewMode === mode
                    ? 'bg-card text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <Icon className="w-4 h-4" />
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
              {searchQuery ? 'No habits match your search' : 'No habits yet'}
            </p>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto">
              {searchQuery
                ? 'Try a different search term.'
                : 'Create your first habit to start tracking your daily progress and building consistency.'
              }
            </p>
          </div>
          {!searchQuery && (
            <Button
              onClick={() => setCreateOpen(true)}
              className="bg-[#3DD68C] text-black hover:bg-[#3DD68C]/90 gap-2 mt-2"
            >
              <Plus className="w-4 h-4" /> Create first habit
            </Button>
          )}
        </div>
      )}

      {/* Heatmap view */}
      {viewMode === 'heatmap' && filteredHabits.length > 0 && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          {filteredHabits.map(habit => (
            <HabitHeatmapCard
              key={habit.id}
              habit={habit}
              entries={entriesForHabit(habit.id)}
              isCompletedToday={isCompletedToday(habit.id)}
              isSkippedToday={isSkippedToday(habit.id)}
              onToggle={() => toggleEntry(habit.id, todayDate)}
            />
          ))}
        </div>
      )}

      {/* Grid view */}
      {viewMode === 'grid' && filteredHabits.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredHabits.map(habit => (
            <HabitGridCard
              key={habit.id}
              habit={habit}
              entries={entriesForHabit(habit.id)}
              isCompletedToday={isCompletedToday(habit.id)}
              isSkippedToday={isSkippedToday(habit.id)}
              onToggle={() => toggleEntry(habit.id, todayDate)}
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
              isCompletedToday={isCompletedToday(habit.id)}
              isSkippedToday={isSkippedToday(habit.id)}
              onToggle={() => toggleEntry(habit.id, todayDate)}
            />
          ))}
        </div>
      )}

      <CreateHabitDialog open={createOpen} onOpenChange={setCreateOpen} />
    </div>
  )
}
