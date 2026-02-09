'use client'

import { useEffect, useMemo, useState } from 'react'
import { useHabitsStore } from '@/lib/store/habits-store'
import { HabitHeatmapCard } from '@/components/habits/habit-heatmap-card'
import { HabitGridCard } from '@/components/habits/habit-grid-card'
import { HabitListRow } from '@/components/habits/habit-list-row'
import { CreateHabitDialog } from '@/components/habits/create-habit-dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, LayoutGrid, List, Grid3X3, Search, Folder } from 'lucide-react'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'

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

  // Check if all habits done today for confetti
  const allDoneToday = useMemo(() => {
    if (filteredHabits.length === 0) return false
    return filteredHabits.every(h => isCompletedToday(h.id))
  }, [filteredHabits, entries])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse text-muted-foreground">Loading habits...</div>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Habits</h1>
          <p className="text-sm text-muted-foreground">
            {filteredHabits.length} habit{filteredHabits.length !== 1 ? 's' : ''}
            {selectedGroupId ? ' in group' : ''}
          </p>
        </div>
        <Button
          onClick={() => setCreateOpen(true)}
          className="bg-[#3DD68C] text-black hover:bg-[#3DD68C]/90 gap-2"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">New habit</span>
        </Button>
      </div>

      {/* Search + View mode + Group filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search habits..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex items-center gap-2">
          {/* Group filter */}
          <div className="flex items-center gap-1 overflow-x-auto">
            <Button
              variant={selectedGroupId === null ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedGroupId(null)}
              className={cn(
                'text-xs h-8 shrink-0',
                selectedGroupId === null && 'bg-[#3DD68C] text-black hover:bg-[#3DD68C]/90'
              )}
            >
              All
            </Button>
            {groups.map(g => (
              <Button
                key={g.id}
                variant={selectedGroupId === g.id ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedGroupId(g.id)}
                className={cn(
                  'text-xs h-8 shrink-0',
                  selectedGroupId === g.id && 'text-black'
                )}
                style={selectedGroupId === g.id ? { backgroundColor: g.color_hex } : undefined}
              >
                {g.name}
              </Button>
            ))}
          </div>

          {/* View mode */}
          <div className="flex items-center bg-secondary rounded-lg p-0.5 ml-auto shrink-0">
            {([
              { mode: 'heatmap' as const, icon: Grid3X3 },
              { mode: 'grid' as const, icon: LayoutGrid },
              { mode: 'list' as const, icon: List },
            ]).map(({ mode, icon: Icon }) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={cn(
                  'p-1.5 rounded-md transition-colors',
                  viewMode === mode ? 'bg-card text-foreground' : 'text-muted-foreground hover:text-foreground'
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
        <div className="text-center py-20 space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-card flex items-center justify-center mx-auto">
            <Grid3X3 className="w-8 h-8 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground">
            {searchQuery ? 'No habits match your search' : 'No habits yet. Create your first one!'}
          </p>
          {!searchQuery && (
            <Button onClick={() => setCreateOpen(true)} variant="outline" className="gap-2">
              <Plus className="w-4 h-4" /> Create habit
            </Button>
          )}
        </div>
      )}

      {/* Heatmap view */}
      {viewMode === 'heatmap' && filteredHabits.length > 0 && (
        <div className="space-y-3">
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
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
        <div className="bg-card rounded-xl border border-border divide-y divide-border">
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
