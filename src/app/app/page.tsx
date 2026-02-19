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
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger, DropdownMenuLabel, DropdownMenuSeparator } from '@/components/ui/dropdown-menu'
import { DynamicIcon } from '@/components/dynamic-icon'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import {
  Plus, List, Grid3X3, CalendarDays, Search, Flame, Trophy, Check,
  Target, TrendingUp, Sparkles, ChevronDown, ChevronUp, FolderOpen, X, Pencil, Trash2
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { calculateStreak } from '@/lib/utils/stats'
import { HABIT_TEMPLATES, CATEGORIES, type HabitTemplate } from '@/lib/data/challenges'
import { useT } from '@/lib/i18n/provider'

export default function DashboardPage() {
  const {
    habits, entries, groups, loading,
    viewMode, setViewMode,
    selectedGroupId, setSelectedGroupId,
    searchQuery, setSearchQuery,
    fetchHabits, fetchEntries, fetchGroups,
    toggleEntry, upsertEntry, createHabit, createGroup, updateGroup, deleteGroup
  } = useHabitsStore()

  const t = useT()
  const [createOpen, setCreateOpen] = useState(false)
  const [showStats, setShowStats] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState('')
  const [showNewCategoryInput, setShowNewCategoryInput] = useState(false)
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null)
  const [editingGroupName, setEditingGroupName] = useState('')
  const [challengesOpen, setChallengesOpen] = useState(false)

  // Simple toggle for boolean habits or cycling existing entries
  const handleToggle = (habitId: string, date?: string) => {
    const targetDate = date ?? todayDate
    toggleEntry(habitId, targetDate)
  }

  // Unified submit from the popover (sessions, numeric, or both)
  const handlePopoverSubmit = (habitId: string, date: string, opts: { sessionId?: string; value?: number; optionId?: string }) => {
    upsertEntry({
      habit_id: habitId,
      date,
      status: 'completed',
      value: opts.value ?? null,
      session_id: opts.sessionId ?? null,
      option_id: opts.optionId ?? null,
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
    <div className="p-4 lg:p-8 max-w-[2000px] mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">{greeting} ✨</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {format(new Date(), 'EEEE, MMMM d, yyyy')}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setChallengesOpen(true)}
            className="gap-2 font-medium border-amber-500/30 text-amber-500 hover:bg-amber-500/10 hover:text-amber-400"
          >
            <Trophy className="w-4 h-4" />
            <span className="hidden sm:inline">{t('challenges.title')}</span>
          </Button>
          <Button
            onClick={() => setCreateOpen(true)}
            className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2 font-semibold shadow-lg shadow-primary/10"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">{t('habits.newHabit')}</span>
          </Button>
        </div>
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
          {/* Category filter dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all',
                selectedGroupId ? 'ring-1 shadow-sm' : 'bg-secondary text-muted-foreground hover:text-foreground'
              )}
              style={selectedGroupId ? (() => {
                const g = groups.find(g => g.id === selectedGroupId)
                return g ? { backgroundColor: `${g.color_hex}15`, color: g.color_hex, boxShadow: `0 0 0 1px ${g.color_hex}30` } : undefined
              })() : undefined}
              >
                <FolderOpen className="w-3 h-3" />
                {selectedGroupId
                  ? groups.find(g => g.id === selectedGroupId)?.name ?? t('habits.categories')
                  : t('habits.categories')}
                <ChevronDown className="w-3 h-3 opacity-60" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-52">
              <DropdownMenuLabel className="text-[10px] uppercase tracking-wider">{t('habits.categories')}</DropdownMenuLabel>

              {/* All categories */}
              <button
                onClick={() => setSelectedGroupId(null)}
                className="flex items-center gap-2.5 w-full px-2 py-1.5 text-xs hover:bg-accent rounded transition-colors"
              >
                <div className={cn('w-3.5 h-3.5 rounded border flex items-center justify-center', !selectedGroupId ? 'bg-primary border-primary' : 'border-border')}>
                  {!selectedGroupId && <span className="text-[8px] text-primary-foreground font-bold">✓</span>}
                </div>
                <span>{t('habits.allCategories')}</span>
              </button>

              {groups.map(g => {
                const active = selectedGroupId === g.id
                const isEditing = editingGroupId === g.id
                return isEditing ? (
                  <div key={g.id} className="px-2 py-1 space-y-1" onClick={e => e.stopPropagation()}>
                    <Input
                      value={editingGroupName}
                      onChange={e => setEditingGroupName(e.target.value)}
                      onKeyDown={async e => {
                        if (e.key === 'Enter' && editingGroupName.trim()) {
                          e.preventDefault()
                          await updateGroup(g.id, { name: editingGroupName.trim() })
                          setEditingGroupId(null)
                        }
                        if (e.key === 'Escape') setEditingGroupId(null)
                      }}
                      autoFocus
                      className="bg-secondary/50 border-0 h-7 text-xs"
                    />
                    <div className="flex gap-1">
                      <Button size="sm" onClick={async () => { if (editingGroupName.trim()) { await updateGroup(g.id, { name: editingGroupName.trim() }); setEditingGroupId(null) } }} disabled={!editingGroupName.trim()} className="h-6 text-[10px] flex-1">{t('common.save')}</Button>
                      <Button size="sm" variant="ghost" onClick={() => setEditingGroupId(null)} className="h-6 text-[10px] px-2"><X className="w-3 h-3" /></Button>
                    </div>
                  </div>
                ) : (
                  <div key={g.id} className="group/cat flex items-center">
                    <button
                      onClick={() => setSelectedGroupId(active ? null : g.id)}
                      className="flex items-center gap-2.5 flex-1 min-w-0 px-2 py-1.5 text-xs hover:bg-accent rounded transition-colors"
                    >
                      <div className={cn('w-3.5 h-3.5 rounded border flex items-center justify-center shrink-0', active ? 'bg-primary border-primary' : 'border-border')}>
                        {active && <span className="text-[8px] text-primary-foreground font-bold">✓</span>}
                      </div>
                      <DynamicIcon name={g.icon_name} className="w-3.5 h-3.5 shrink-0" style={{ color: g.color_hex }} />
                      <span className="truncate">{g.name}</span>
                    </button>
                    <div className="flex items-center gap-0.5 opacity-100 lg:opacity-0 lg:group-hover/cat:opacity-100 transition-opacity shrink-0 pr-1">
                      <button
                        onClick={(e) => { e.stopPropagation(); setEditingGroupId(g.id); setEditingGroupName(g.name) }}
                        className="p-1 rounded hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <Pencil className="w-3 h-3" />
                      </button>
                      <button
                        onClick={async (e) => { e.stopPropagation(); if (selectedGroupId === g.id) setSelectedGroupId(null); await deleteGroup(g.id) }}
                        className="p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                )
              })}

              {selectedGroupId && (
                <>
                  <DropdownMenuSeparator />
                  <button
                    onClick={() => setSelectedGroupId(null)}
                    className="w-full px-2 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-accent rounded transition-colors"
                  >
                    {t('common.clear')}
                  </button>
                </>
              )}

              <DropdownMenuSeparator />

              {/* Inline create */}
              {!showNewCategoryInput ? (
                <button
                  onClick={(e) => { e.preventDefault(); setShowNewCategoryInput(true) }}
                  className="flex items-center gap-2 w-full px-2 py-1.5 text-xs text-primary hover:bg-accent rounded transition-colors"
                >
                  <Plus className="w-3 h-3" /> {t('habits.createCategory')}
                </button>
              ) : (
                <div className="px-2 py-1.5 space-y-1.5" onClick={e => e.stopPropagation()}>
                  <Input
                    placeholder={t('habits.categoryNamePlaceholder')}
                    value={newCategoryName}
                    onChange={e => setNewCategoryName(e.target.value)}
                    onKeyDown={async e => {
                      if (e.key === 'Enter' && newCategoryName.trim()) {
                        e.preventDefault()
                        await createGroup({ name: newCategoryName.trim(), icon_name: 'folder', color_hex: '#3DD68C' })
                        setNewCategoryName('')
                        setShowNewCategoryInput(false)
                      }
                      if (e.key === 'Escape') {
                        setShowNewCategoryInput(false)
                        setNewCategoryName('')
                      }
                    }}
                    autoFocus
                    className="bg-secondary/50 border-0 h-7 text-xs"
                  />
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      onClick={async () => {
                        if (newCategoryName.trim()) {
                          await createGroup({ name: newCategoryName.trim(), icon_name: 'folder', color_hex: '#3DD68C' })
                          setNewCategoryName('')
                          setShowNewCategoryInput(false)
                        }
                      }}
                      disabled={!newCategoryName.trim()}
                      className="h-6 text-[10px] flex-1"
                    >
                      {t('common.create')}
                    </Button>
                    <Button
                      size="sm" variant="ghost"
                      onClick={() => { setShowNewCategoryInput(false); setNewCategoryName('') }}
                      className="h-6 text-[10px] px-2"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

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
        <div className="grid grid-cols-1 xl:grid-cols-2 min-[1920px]:grid-cols-3 gap-4">
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 min-[1920px]:grid-cols-5 min-[2400px]:grid-cols-6 gap-4">
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

      {/* Challenges Slide Panel */}
      <Sheet open={challengesOpen} onOpenChange={setChallengesOpen}>
        <SheetContent side="right" className="w-full sm:max-w-lg lg:max-w-xl p-0 overflow-y-auto">
          <SheetHeader className="px-5 pt-5 pb-0">
            <SheetTitle className="flex items-center gap-2 text-xl">
              <Trophy className="w-5 h-5 text-amber-500" />
              {t('challenges.title')}
            </SheetTitle>
            <p className="text-sm text-muted-foreground">{t('challenges.subtitle', { count: HABIT_TEMPLATES.length })}</p>
          </SheetHeader>
          <ChallengesPanel createHabit={createHabit} />
        </SheetContent>
      </Sheet>
    </div>
  )
}

// ─── Challenges Panel (embedded in sheet) ──────────────
function ChallengesPanel({ createHabit }: {
  createHabit: (data: any) => Promise<any>
}) {
  const t = useT()
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set())
  const [loadingId, setLoadingId] = useState<string | null>(null)

  const filtered = selectedCategory
    ? HABIT_TEMPLATES.filter(h => h.category === selectedCategory)
    : HABIT_TEMPLATES

  const handleAdd = async (template: HabitTemplate) => {
    if (addedIds.has(template.id) || loadingId) return
    setLoadingId(template.id)
    await createHabit({
      title: template.title,
      icon_name: template.iconName,
      color_hex: template.colorHex,
      frequency: template.frequency,
      tracking_type: template.trackingType,
      target_value: template.targetValue ?? null,
      unit: template.unit ?? null,
      target_minutes: template.targetMinutes ?? null,
      weekly_target: template.frequency === 'weekly' ? 5 : null,
      group_id: null,
      tags: [],
      sessions: null,
      options: null,
      is_archived: false,
      sort_order: 0,
    })
    setAddedIds(prev => new Set(prev).add(template.id))
    setLoadingId(null)
  }

  return (
    <div className="px-5 pb-6 space-y-4">
      {/* Category pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 sticky top-0 bg-background/95 backdrop-blur-sm pt-2 -mt-1 z-10">
        <button
          onClick={() => setSelectedCategory(null)}
          className={cn(
            'px-3 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap',
            !selectedCategory
              ? 'bg-primary/10 text-primary ring-1 ring-primary/20'
              : 'bg-secondary text-muted-foreground hover:text-foreground'
          )}
        >
          {t('challenges.all')}
        </button>
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={cn(
              'px-3 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap',
              selectedCategory === cat
                ? 'bg-primary/10 text-primary ring-1 ring-primary/20'
                : 'bg-secondary text-muted-foreground hover:text-foreground'
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Template grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {filtered.map(template => {
          const isAdded = addedIds.has(template.id)
          const isLoading = loadingId === template.id
          return (
            <button
              key={template.id}
              onClick={() => handleAdd(template)}
              disabled={isAdded || isLoading}
              className={cn(
                'card-elevated rounded-xl p-4 text-left transition-all duration-200 group',
                isAdded
                  ? 'opacity-60 cursor-default'
                  : 'hover:scale-[1.02] active:scale-[0.98] cursor-pointer'
              )}
            >
              <div className="flex items-start gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                  style={{ backgroundColor: `${template.colorHex}15` }}
                >
                  <DynamicIcon name={template.iconName} className="w-5 h-5" style={{ color: template.colorHex }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm leading-snug truncate">{template.title}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-2 leading-relaxed">
                    {template.description}
                  </p>
                </div>
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center shrink-0"
                  style={{
                    backgroundColor: isAdded ? `${template.colorHex}20` : `${template.colorHex}10`,
                    color: template.colorHex,
                  }}
                >
                  {isAdded ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                </div>
              </div>
              <div className="mt-2 flex items-center gap-1.5">
                <span
                  className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full"
                  style={{ backgroundColor: `${template.colorHex}10`, color: template.colorHex }}
                >
                  {template.trackingType === 'timer' ? `${template.targetMinutes} min`
                    : template.trackingType === 'numeric' ? `${template.targetValue} ${template.unit}`
                    : template.frequency === 'weekly' ? 'Hebdo' : 'Oui/Non'}
                </span>
                <span className="text-[10px] text-muted-foreground">{template.category}</span>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
