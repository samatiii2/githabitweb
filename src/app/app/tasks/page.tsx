'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useT } from '@/lib/i18n/provider'
import { useTasksStore, type SmartView, type SortBy, type GroupBy } from '@/lib/store/tasks-store'
import { TaskDetailSheet } from '@/components/tasks/task-detail-sheet'
import { TaskInlineForm } from '@/components/tasks/task-inline-form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { DropdownMenu, DropdownMenuContent, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuTrigger, DropdownMenuLabel, DropdownMenuSeparator } from '@/components/ui/dropdown-menu'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Popover, PopoverContent, PopoverAnchor } from '@/components/ui/popover'
import { COLORS } from '@/lib/constants'
import {
  Plus, Search, Trash2, Clock, Columns3, List, Inbox, CalendarDays,
  CalendarRange, ListChecks, CheckCircle2, FolderOpen, Tag, ArrowUpDown,
  Group, AlertCircle, ArrowRightCircle, Calendar as CalendarIcon,
  Circle, Flag, ChevronLeft, ChevronRight, ChevronDown, Pencil, SlidersHorizontal, X
} from 'lucide-react'
import type { Task, TaskProject } from '@/lib/types/database'
import { DynamicIcon } from '@/components/dynamic-icon'
import { cn } from '@/lib/utils'
import { PRIORITY_LABELS } from '@/lib/constants'

const PROJECT_ICONS = [
  'folder', 'briefcase', 'home', 'heart', 'star', 'book', 'code', 'globe',
  'music', 'camera', 'gamepad-2', 'shopping-cart', 'users', 'graduation-cap',
  'plane', 'car', 'dumbbell', 'utensils', 'palette', 'zap', 'rocket',
  'building', 'landmark', 'wallet', 'gift', 'phone', 'tv', 'monitor',
  'lightbulb', 'target', 'flag', 'megaphone', 'hammer', 'wrench',
]
import { getTasksForDate, recurrenceLabel } from '@/lib/utils/recurrence'
import { format, parseISO, isToday as _isToday, isTomorrow as _isTomorrow, startOfDay, addDays, addMonths, subMonths, differenceInCalendarDays, startOfMonth, endOfMonth, eachDayOfInterval, getDay } from 'date-fns'

// ─── Date helpers that handle both "YYYY-MM-DD" and ISO strings ──────
function parseDueDate(d: string): Date {
  // If it's just a date string "2026-01-25", add T12:00 to avoid UTC midnight issues
  if (d.length === 10) return new Date(d + 'T12:00:00')
  return new Date(d)
}

function isDueToday(d: string): boolean {
  const date = parseDueDate(d)
  return _isToday(date)
}

function isDueTomorrow(d: string): boolean {
  const date = parseDueDate(d)
  return _isTomorrow(date)
}

function isDueOverdue(d: string): boolean {
  const date = parseDueDate(d)
  const today = startOfDay(new Date())
  return date < today
}

function isDueInNextDays(d: string, days: number): boolean {
  const date = parseDueDate(d)
  const today = startOfDay(new Date())
  const future = addDays(today, days)
  return date >= today && date <= future
}

function isDueThisWeek(d: string): boolean {
  return isDueInNextDays(d, 7) && !isDueToday(d) && !isDueTomorrow(d)
}

function formatDueDate(d: string): string {
  return format(parseDueDate(d), 'MMM d')
}

// ─── Main page ────────────────────────────────────────────
export default function TasksPage() {
  const t = useT()
  const store = useTasksStore()

  // ─── Smart view configuration ─────────────────────────────
  const SMART_VIEWS = useMemo(() => [
    { id: 'inbox' as SmartView, label: t('tasks.inbox'), icon: Inbox, desc: t('tasks.inboxDesc') },
    { id: 'today' as SmartView, label: t('tasks.todayView'), icon: CalendarDays, desc: t('tasks.todayDesc') },
    { id: 'upcoming' as SmartView, label: t('tasks.upcoming'), icon: CalendarRange, desc: t('tasks.upcomingDesc') },
    { id: 'all' as SmartView, label: t('tasks.allTasks'), icon: ListChecks, desc: t('tasks.allDesc') },
    { id: 'completed' as SmartView, label: t('tasks.completedView'), icon: CheckCircle2, desc: t('tasks.completedDesc') },
  ], [t])

  const SORT_OPTIONS: { value: SortBy; label: string }[] = useMemo(() => [
    { value: 'priority', label: t('tasks.sortPriority') },
    { value: 'due_date', label: t('tasks.sortDueDate') },
    { value: 'created_at', label: t('tasks.sortCreated') },
    { value: 'title', label: t('tasks.sortAlphabetical') },
  ], [t])

  const GROUP_OPTIONS: { value: GroupBy; label: string }[] = useMemo(() => [
    { value: 'none', label: t('tasks.noGrouping') },
    { value: 'status', label: t('tasks.byStatus') },
    { value: 'priority', label: t('tasks.byPriority') },
    { value: 'due_date', label: t('tasks.byDueDate') },
  ], [t])
  const {
    tasks, projects, labels, loading,
    smartView, viewMode, searchQuery, sortBy, sortDirection, groupBy, priorityFilter,
    selectedProjectId, selectedLabelId, selectedTaskId,
    setSmartView, setViewMode, setSearchQuery, setSortBy, setSortDirection, setGroupBy,
    setPriorityFilter, setSelectedProjectId, setSelectedLabelId, setSelectedTaskId,
    fetchAll, createTask, updateTask, toggleTask, deleteTask, getSubtasks, getLabelsForTask,
    createProject, updateProject, deleteProject, createLabel,
  } = store

  const [showInlineForm, setShowInlineForm] = useState(false)
  const [calendarMonth, setCalendarMonth] = useState(new Date())
  const [selectedCalendarDay, setSelectedCalendarDay] = useState<string | null>(null)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const [recentlyCompleted, setRecentlyCompleted] = useState<Set<string>>(new Set())

  // Board drag-and-drop
  const [dragTaskId, setDragTaskId] = useState<string | null>(null)
  const [dragOverCol, setDragOverCol] = useState<string | null>(null)

  // Create project/label dialogs
  const [createProjectOpen, setCreateProjectOpen] = useState(false)
  const [newProjectName, setNewProjectName] = useState('')
  const [newProjectColor, setNewProjectColor] = useState('#3DD68C')
  const [newProjectIcon, setNewProjectIcon] = useState('folder')

  // Edit project dialog
  const [editProjectOpen, setEditProjectOpen] = useState(false)
  const [editProjectId, setEditProjectId] = useState<string | null>(null)
  const [editProjectName, setEditProjectName] = useState('')
  const [editProjectColor, setEditProjectColor] = useState('#3DD68C')
  const [editProjectIcon, setEditProjectIcon] = useState('folder')

  const [createLabelOpen, setCreateLabelOpen] = useState(false)
  const [newLabelName, setNewLabelName] = useState('')
  const [newLabelColor, setNewLabelColor] = useState('#60a5fa')

  useEffect(() => { fetchAll() }, [fetchAll])

  const handleToggleWithDelay = useCallback((taskId: string) => {
    const task = tasks.find(t => t.id === taskId)
    if (!task) return
    if (!task.is_completed) {
      setRecentlyCompleted(prev => new Set(prev).add(taskId))
      toggleTask(taskId)
      setTimeout(() => {
        setRecentlyCompleted(prev => {
          const next = new Set(prev)
          next.delete(taskId)
          return next
        })
      }, 900)
    } else {
      toggleTask(taskId)
    }
  }, [tasks, toggleTask])

  const parentTasks = useMemo(() => tasks.filter(t => !t.parent_task_id), [tasks])

  // ─── Filtering ──────────────────────────────────────────
  const filteredTasks = useMemo(() => {
    let result = parentTasks

    // Smart view filter — keep recently completed tasks visible
    switch (smartView) {
      case 'today':
        result = result.filter(t => recentlyCompleted.has(t.id) || (!t.is_completed && t.due_date && (
          isDueToday(t.due_date) || isDueOverdue(t.due_date)
        )))
        break
      case 'upcoming':
        result = result.filter(t => recentlyCompleted.has(t.id) || (!t.is_completed && t.due_date && isDueInNextDays(t.due_date, 7)))
        break
      case 'completed':
        result = result.filter(t => t.is_completed)
        break
      case 'inbox':
        result = result.filter(t => recentlyCompleted.has(t.id) || !t.is_completed)
        break
      case 'all':
        // Show everything
        break
    }

    // Project filter
    if (selectedProjectId) {
      const taskIds = new Set(store.projectLinks.filter(l => l.project_id === selectedProjectId).map(l => l.task_id))
      result = result.filter(t => taskIds.has(t.id))
    }

    // Label filter
    if (selectedLabelId) {
      const taskIds = new Set(store.labelLinks.filter(l => l.label_id === selectedLabelId).map(l => l.task_id))
      result = result.filter(t => taskIds.has(t.id))
    }

    // Priority filter
    if (priorityFilter.length > 0) {
      result = result.filter(t => priorityFilter.includes(t.priority))
    }

    // Search
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      result = result.filter(t => t.title.toLowerCase().includes(q))
    }

    return result
  }, [parentTasks, smartView, selectedProjectId, selectedLabelId, priorityFilter, searchQuery, store.projectLinks, store.labelLinks, recentlyCompleted])

  // ─── Sorting ────────────────────────────────────────────
  const sortedTasks = useMemo(() => {
    const sorted = [...filteredTasks]
    const dir = sortDirection === 'asc' ? 1 : -1
    sorted.sort((a, b) => {
      switch (sortBy) {
        case 'priority': return (a.priority - b.priority) * dir
        case 'due_date': {
          if (!a.due_date && !b.due_date) return 0
          if (!a.due_date) return 1
          if (!b.due_date) return -1
          return (parseDueDate(a.due_date).getTime() - parseDueDate(b.due_date).getTime()) * dir
        }
        case 'title': return a.title.localeCompare(b.title) * dir
        case 'created_at':
        default: return (new Date(b.created_at).getTime() - new Date(a.created_at).getTime()) * dir
      }
    })
    return sorted
  }, [filteredTasks, sortBy, sortDirection])

  // ─── Grouping ───────────────────────────────────────────
  const groupedTasks = useMemo((): { key: string; label: string; tasks: Task[]; color?: string; order: number }[] => {
    if (groupBy === 'none') return [{ key: 'all', label: '', tasks: sortedTasks, order: 0 }]

    const groups: Record<string, { key: string; label: string; tasks: Task[]; color?: string; order: number }> = {}

    for (const task of sortedTasks) {
      let key: string, label: string, color: string | undefined, order: number

      switch (groupBy) {
        case 'status':
          key = task.status
          label = { todo: t('tasks.statusTodo'), doing: t('tasks.statusDoing'), done: t('tasks.statusDone') }[task.status]
          color = { todo: '#71717a', doing: '#60a5fa', done: '#3DD68C' }[task.status]
          order = { todo: 0, doing: 1, done: 2 }[task.status]
          break
        case 'priority':
          key = `p${task.priority}`
          label = PRIORITY_LABELS[task.priority].label
          color = PRIORITY_LABELS[task.priority].color
          order = task.priority
          break
        case 'due_date':
          if (!task.due_date) { key = 'no-date'; label = t('tasks.noDate'); order = 99 }
          else if (isDueOverdue(task.due_date)) { key = 'overdue'; label = t('tasks.overdue'); color = '#ef4444'; order = 0 }
          else if (isDueToday(task.due_date)) { key = 'today'; label = t('tasks.todayView'); color = '#3DD68C'; order = 1 }
          else if (isDueTomorrow(task.due_date)) { key = 'tomorrow'; label = t('tasks.tomorrow'); color = '#60a5fa'; order = 2 }
          else if (isDueThisWeek(task.due_date)) { key = 'this-week'; label = t('tasks.thisWeek'); color = '#a78bfa'; order = 3 }
          else { key = 'later'; label = t('tasks.later'); color = '#fbbf24'; order = 4 }
          break
        default:
          key = 'all'; label = ''; order = 0
      }

      if (!groups[key]) groups[key] = { key, label, tasks: [], color, order }
      groups[key].tasks.push(task)
    }

    return Object.values(groups).sort((a, b) => a.order - b.order)
  }, [sortedTasks, groupBy])

  // ─── Board columns ──────────────────────────────────────
  const boardColumns = useMemo(() => [
    { title: t('tasks.statusTodo'), status: 'todo' as const, tasks: sortedTasks.filter(tk => tk.status === 'todo'), color: '#71717a', icon: Circle },
    { title: t('tasks.statusDoing'), status: 'doing' as const, tasks: sortedTasks.filter(tk => tk.status === 'doing'), color: '#60a5fa', icon: ArrowRightCircle },
    { title: t('tasks.statusDone'), status: 'done' as const, tasks: sortedTasks.filter(tk => tk.status === 'done'), color: '#3DD68C', icon: CheckCircle2 },
  ], [sortedTasks, t])

  // ─── Inline form submit ─────────────────────────────────
  const handleInlineCreate = async (data: {
    title: string
    note: string | null
    due_date: string | null
    priority: number
    recurrence: string
    recurrence_rule?: any
    projectId?: string | null
  }) => {
    const task = await createTask({
      title: data.title,
      note: data.note,
      due_date: data.due_date,
      priority: data.priority,
      recurrence: data.recurrence as any,
      recurrence_rule: data.recurrence_rule ?? null,
    })
    // Link to project if selected
    if (task && data.projectId) {
      await store.addProjectToTask(task.id, data.projectId)
    }
  }

  const handleCreateProject = async () => {
    if (!newProjectName.trim()) return
    await createProject({ name: newProjectName.trim(), icon_name: newProjectIcon, color_hex: newProjectColor })
    setNewProjectName(''); setNewProjectColor('#3DD68C'); setNewProjectIcon('folder')
    setCreateProjectOpen(false)
  }

  const handleCreateLabel = async () => {
    if (!newLabelName.trim()) return
    await createLabel({ name: newLabelName.trim(), color_hex: newLabelColor })
    setNewLabelName(''); setNewLabelColor('#60a5fa')
    setCreateLabelOpen(false)
  }

  const openEditProject = (project: { id: string; name: string; icon_name: string; color_hex: string }) => {
    setEditProjectId(project.id)
    setEditProjectName(project.name)
    setEditProjectIcon(project.icon_name)
    setEditProjectColor(project.color_hex)
    setEditProjectOpen(true)
  }

  const handleSaveProject = async () => {
    if (!editProjectId || !editProjectName.trim()) return
    await updateProject(editProjectId, { name: editProjectName.trim(), icon_name: editProjectIcon, color_hex: editProjectColor })
    setEditProjectOpen(false)
    setEditProjectId(null)
  }

  // ─── Stats ──────────────────────────────────────────────
  const todayCount = parentTasks.filter(t => !t.is_completed && t.due_date && (isDueToday(t.due_date) || isDueOverdue(t.due_date))).length
  const upcomingCount = parentTasks.filter(t => !t.is_completed && t.due_date && isDueInNextDays(t.due_date, 7)).length
  const activeCount = parentTasks.filter(t => !t.is_completed).length
  const completedCount = parentTasks.filter(t => t.is_completed).length

  if (loading) return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="shimmer h-8 w-36 rounded-lg" />
      <div className="space-y-3">
        {[1,2,3,4].map(i => <div key={i} className="shimmer h-14 rounded-xl" />)}
      </div>
    </div>
  )

  // Determine the current view label + description
  const currentView = SMART_VIEWS.find(v => v.id === smartView)
  const currentViewLabel = selectedProjectId
    ? projects.find(p => p.id === selectedProjectId)?.name ?? t('tasks.projects')
    : selectedLabelId
      ? labels.find(l => l.id === selectedLabelId)?.name ?? t('tasks.labelsNav')
      : currentView?.label ?? t('tasks.tasks')
  const currentViewDesc = selectedProjectId
    ? t('tasks.tasksInProject', { count: filteredTasks.length })
    : selectedLabelId
      ? t('tasks.tasksWithLabel', { count: filteredTasks.length })
      : currentView?.desc ?? ''

  // Smart view empty state messages
  const emptyMessage = (() => {
    if (searchQuery) return { title: t('common.noResults'), desc: t('tasks.noResultsDesc') }
    if (selectedProjectId) return { title: t('tasks.noProjectTasks'), desc: t('tasks.noProjectTasksDesc') }
    if (selectedLabelId) return { title: t('tasks.noLabelTasks'), desc: t('tasks.noLabelTasksDesc') }
    switch (smartView) {
      case 'today': return { title: t('tasks.noDueToday'), desc: t('tasks.noDueTodayDesc') }
      case 'upcoming': return { title: t('tasks.noUpcoming'), desc: t('tasks.noUpcomingDesc') }
      case 'completed': return { title: t('tasks.noCompleted'), desc: t('tasks.noCompletedDesc') }
      case 'all': return { title: t('tasks.noTasksYet'), desc: t('tasks.noTasksYetDesc') }
      default: return { title: t('tasks.noActiveTasks'), desc: t('tasks.noActiveTasksDesc') }
    }
  })()

  return (
    <div className="flex h-[calc(100vh-52px-56px)] lg:h-screen overflow-hidden">
      {/* ═══ LEFT: Navigation Sidebar ═══ */}
      <aside className="hidden lg:flex flex-col border-r border-border bg-sidebar shrink-0 w-[220px] overflow-y-auto">
        {/* Smart views */}
        <div className="px-3 pt-4 pb-2">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground px-2 mb-2">{t('tasks.views')}</p>
          <div className="space-y-0.5">
            {SMART_VIEWS.map(view => {
              const Icon = view.icon
              const active = smartView === view.id && !selectedProjectId && !selectedLabelId
              const count = view.id === 'today' ? todayCount
                : view.id === 'upcoming' ? upcomingCount
                : view.id === 'inbox' ? activeCount
                : view.id === 'completed' ? completedCount
                : parentTasks.length
              return (
                <button
                  key={view.id}
                  onClick={() => setSmartView(view.id)}
                  className={cn(
                    'flex items-center gap-2.5 w-full px-2.5 py-1.5 rounded-lg text-[13px] font-medium transition-all',
                    active ? 'bg-primary/8 text-primary' : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                  )}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="flex-1 text-left truncate">{view.label}</span>
                  {count > 0 && (
                    <span className={cn(
                      'text-[10px] min-w-[20px] text-center px-1.5 py-0.5 rounded-full',
                      active ? 'bg-primary/20 text-primary' : 'bg-secondary text-muted-foreground'
                    )}>
                      {count}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* Projects */}
        <div className="px-3 pt-3 pb-2">
          <div className="flex items-center justify-between px-2 mb-2">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{t('tasks.projects')}</p>
            <button onClick={() => setCreateProjectOpen(true)} className="text-muted-foreground hover:text-foreground transition-colors">
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="space-y-0.5">
            {projects.map(p => {
              const count = store.projectLinks.filter(l => l.project_id === p.id).length
              const active = selectedProjectId === p.id
              return (
                <div key={p.id} className="group/proj relative flex items-center">
                  <button
                    onClick={() => setSelectedProjectId(active ? null : p.id)}
                    className={cn(
                      'flex items-center gap-2.5 w-full px-2.5 py-1.5 rounded-lg text-[13px] font-medium transition-all',
                      active ? 'bg-accent text-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                    )}
                  >
                    <DynamicIcon name={p.icon_name} className="w-4 h-4 shrink-0" style={{ color: p.color_hex }} />
                    <span className="flex-1 text-left truncate">{p.name}</span>
                    {count > 0 && <span className="text-[10px] text-muted-foreground group-hover/proj:hidden">{count}</span>}
                  </button>
                  <div className="absolute right-1 flex items-center gap-0.5 opacity-0 group-hover/proj:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => { e.stopPropagation(); openEditProject(p) }}
                      className="text-muted-foreground hover:text-foreground p-0.5 rounded hover:bg-secondary transition-colors"
                    >
                      <Pencil className="w-3 h-3" />
                    </button>
                    <button
                      onClick={async (e) => { e.stopPropagation(); if (selectedProjectId === p.id) setSelectedProjectId(null); await deleteProject(p.id) }}
                      className="text-muted-foreground hover:text-destructive p-0.5 rounded hover:bg-destructive/10 transition-colors"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              )
            })}
            {projects.length === 0 && (
              <button onClick={() => setCreateProjectOpen(true)} className="text-[11px] text-muted-foreground hover:text-foreground px-2.5 py-1 transition-colors">
                + {t('tasks.createProject')}
              </button>
            )}
          </div>
        </div>

        {/* Labels */}
        <div className="px-3 pt-3 pb-4">
          <div className="flex items-center justify-between px-2 mb-2">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{t('tasks.labelsNav')}</p>
            <button onClick={() => setCreateLabelOpen(true)} className="text-muted-foreground hover:text-foreground transition-colors">
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="space-y-0.5">
            {labels.map(l => {
              const active = selectedLabelId === l.id
              return (
                <button
                  key={l.id}
                  onClick={() => setSelectedLabelId(active ? null : l.id)}
                  className={cn(
                    'flex items-center gap-2.5 w-full px-2.5 py-1.5 rounded-lg text-[13px] font-medium transition-all',
                    active ? 'bg-accent text-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                  )}
                >
                  <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: l.color_hex }} />
                  <span className="flex-1 text-left truncate">{l.name}</span>
                </button>
              )
            })}
            {labels.length === 0 && (
              <button onClick={() => setCreateLabelOpen(true)} className="text-[11px] text-muted-foreground hover:text-foreground px-2.5 py-1 transition-colors">
                + {t('tasks.createLabel')}
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* ═══ CENTER: Task List / Board ═══ */}
      <div className={cn('flex-1 flex flex-col min-w-0 overflow-hidden', selectedTaskId && 'hidden lg:flex')}>
        {/* Header */}
        <div className="px-4 lg:px-6 pt-4 lg:pt-6 pb-3 space-y-3 shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl lg:text-2xl font-bold tracking-tight">{currentViewLabel}</h1>
              <p className="text-xs text-muted-foreground mt-0.5">{currentViewDesc}</p>
            </div>
{/* Add task button removed — inline card below serves the same purpose */}
          </div>

          {/* Mobile: project dropdown + smart view tabs + label filter */}
          <div className="lg:hidden space-y-2">
            {/* Row 1: Project dropdown (priority) + smart views + labels */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              {/* Project select — like priority filter */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className={cn(
                    'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all shrink-0',
                    selectedProjectId ? 'ring-1 shadow-sm' : 'bg-secondary text-muted-foreground'
                  )}
                  style={selectedProjectId ? (() => {
                    const p = projects.find(p => p.id === selectedProjectId)
                    return p ? { backgroundColor: `${p.color_hex}15`, color: p.color_hex, boxShadow: `0 0 0 1px ${p.color_hex}30` } : undefined
                  })() : undefined}
                  >
                    <FolderOpen className="w-3 h-3" />
                    {selectedProjectId
                      ? projects.find(p => p.id === selectedProjectId)?.name ?? t('tasks.projects')
                      : t('tasks.projects')}
                    <ChevronDown className="w-3 h-3 opacity-60" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-52">
                  <DropdownMenuLabel className="text-[10px] uppercase tracking-wider">{t('tasks.projects')}</DropdownMenuLabel>
                  {projects.map(p => {
                    const active = selectedProjectId === p.id
                    return (
                      <div key={p.id} className="group/cat flex items-center">
                        <button
                          onClick={() => {
                            if (active) { setSelectedProjectId(null) }
                            else { setSelectedProjectId(p.id); setSelectedLabelId(null); setSmartView('all') }
                          }}
                          className="flex items-center gap-2.5 flex-1 min-w-0 px-2 py-1.5 text-xs hover:bg-accent rounded transition-colors"
                        >
                          <div className={cn('w-3.5 h-3.5 rounded border flex items-center justify-center shrink-0', active ? 'bg-primary border-primary' : 'border-border')}>
                            {active && <span className="text-[8px] text-primary-foreground font-bold">✓</span>}
                          </div>
                          <DynamicIcon name={p.icon_name} className="w-3.5 h-3.5 shrink-0" style={{ color: p.color_hex }} />
                          <span className="truncate">{p.name}</span>
                        </button>
                        <div className="flex items-center gap-0.5 opacity-100 lg:opacity-0 lg:group-hover/cat:opacity-100 transition-opacity shrink-0 pr-1">
                          <button
                            onClick={(e) => { e.stopPropagation(); openEditProject(p) }}
                            className="p-1 rounded hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                          >
                            <Pencil className="w-3 h-3" />
                          </button>
                          <button
                            onClick={async (e) => { e.stopPropagation(); if (selectedProjectId === p.id) setSelectedProjectId(null); await deleteProject(p.id) }}
                            className="p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    )
                  })}
                  {selectedProjectId && (
                    <>
                      <DropdownMenuSeparator />
                      <button
                        onClick={() => setSelectedProjectId(null)}
                        className="w-full px-2 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-accent rounded transition-colors"
                      >
                        {t('common.clear')}
                      </button>
                    </>
                  )}
                  {projects.length === 0 && (
                    <p className="px-2 py-2 text-xs text-muted-foreground">{t('tasks.noProjectsCreated')}</p>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Smart views */}
              {SMART_VIEWS.map(view => {
                const active = smartView === view.id && !selectedProjectId && !selectedLabelId
                return (
                  <button
                    key={view.id}
                    onClick={() => { setSmartView(view.id); setSelectedProjectId(null); setSelectedLabelId(null) }}
                    className={cn(
                      'px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all shrink-0',
                      active ? 'bg-primary/10 text-primary ring-1 ring-primary/20' : 'bg-secondary text-muted-foreground'
                    )}
                  >
                    {view.label}
                  </button>
                )
              })}

              {/* Labels filter */}
              {labels.length > 0 && (
                <button
                  onClick={() => setMobileSidebarOpen(true)}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all shrink-0',
                    selectedLabelId ? 'bg-primary/10 text-primary ring-1 ring-primary/20' : 'bg-secondary text-muted-foreground'
                  )}
                >
                  <Tag className="w-3 h-3" />
                  {selectedLabelId ? labels.find(l => l.id === selectedLabelId)?.name : t('tasks.labelsNav')}
                </button>
              )}
            </div>
          </div>

          {/* Toolbar: Search + Sort + Group + View + Priority */}
          <div className="flex items-center gap-2 overflow-x-auto">
            <div className="relative flex-1 min-w-[140px] max-w-xs">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <Input
                placeholder={t('tasks.search')}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-8 bg-secondary/50 border-0 focus-visible:ring-1 focus-visible:ring-primary/30 h-8 text-xs"
              />
            </div>

            {/* Sort */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs text-muted-foreground hover:text-foreground hover:bg-accent transition-all">
                  <ArrowUpDown className="w-3.5 h-3.5" />
                  <span>{t('tasks.sort')}: <span className="text-foreground font-medium">{SORT_OPTIONS.find(o => o.value === sortBy)?.label}</span></span>
                  <span className="text-[10px] opacity-60">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-40">
                <DropdownMenuLabel className="text-[10px]">{t('tasks.sortBy')}</DropdownMenuLabel>
                <DropdownMenuRadioGroup value={sortBy} onValueChange={v => setSortBy(v as SortBy)}>
                  {SORT_OPTIONS.map(o => (
                    <DropdownMenuRadioItem key={o.value} value={o.value} className="text-xs">{o.label}</DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
                <DropdownMenuSeparator />
                <DropdownMenuRadioGroup value={sortDirection} onValueChange={v => setSortDirection(v as 'asc' | 'desc')}>
                  <DropdownMenuRadioItem value="asc" className="text-xs">{t('tasks.ascending')} ↑</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="desc" className="text-xs">{t('tasks.descending')} ↓</DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Group */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className={cn(
                  'flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs transition-all',
                  groupBy !== 'none' ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                )}>
                  <Group className="w-3.5 h-3.5" />
                  <span>{t('tasks.groupLabel')}: <span className="font-medium">{groupBy === 'none' ? t('tasks.groupOff') : GROUP_OPTIONS.find(o => o.value === groupBy)?.label}</span></span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-40">
                <DropdownMenuRadioGroup value={groupBy} onValueChange={v => setGroupBy(v as GroupBy)}>
                  {GROUP_OPTIONS.map(o => (
                    <DropdownMenuRadioItem key={o.value} value={o.value} className="text-xs">{o.label}</DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Priority filter */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className={cn(
                  'flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs transition-all',
                  priorityFilter.length > 0 ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                )}>
                  <Flag className="w-3.5 h-3.5" /> {t('tasks.priorityLabel')}
                  {priorityFilter.length > 0 && <span className="ml-0.5">({priorityFilter.length})</span>}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-36">
                {[1,2,3,4].map(p => (
                  <button
                    key={p}
                    onClick={() => {
                      const next = priorityFilter.includes(p) ? priorityFilter.filter(x => x !== p) : [...priorityFilter, p]
                      setPriorityFilter(next)
                    }}
                    className="flex items-center gap-2 w-full px-2 py-1.5 text-xs hover:bg-accent rounded transition-colors"
                  >
                    <div className={cn('w-3.5 h-3.5 rounded border flex items-center justify-center', priorityFilter.includes(p) ? 'bg-primary border-primary' : 'border-border')}>
                      {priorityFilter.includes(p) && <span className="text-[8px] text-primary-foreground font-bold">✓</span>}
                    </div>
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: PRIORITY_LABELS[p].color }} />
                    {PRIORITY_LABELS[p].label}
                  </button>
                ))}
                {priorityFilter.length > 0 && (
                  <>
                    <div className="border-t border-border my-1" />
                    <button onClick={() => setPriorityFilter([])} className="w-full px-2 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-accent rounded transition-colors">
                      {t('common.clear')}
                    </button>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* View mode */}
            <div className="flex items-center bg-secondary/80 rounded-lg p-0.5 border border-border/50 ml-auto">
              {([
                { m: 'list' as const, i: List },
                { m: 'board' as const, i: Columns3 },
                { m: 'calendar' as const, i: CalendarIcon },
              ]).map(({ m, i: Icon }) => (
                <button
                  key={m}
                  onClick={() => setViewMode(m)}
                  className={cn(
                    'p-1.5 rounded-md transition-all',
                    viewMode === m ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  <Icon className="w-3.5 h-3.5" />
                </button>
              ))}
            </div>
          </div>

          {/* Inline task creation form — Todoist-style */}
          {showInlineForm ? (
            <TaskInlineForm
              projects={projects}
              defaultDueDate={smartView === 'today' ? format(new Date(), 'yyyy-MM-dd') : null}
              onSubmit={handleInlineCreate}
              onCancel={() => setShowInlineForm(false)}
            />
          ) : (
            <button
              onClick={() => setShowInlineForm(true)}
              className="w-full flex items-center gap-3 px-4 py-4 rounded-xl border-2 border-dashed border-primary/20 hover:border-primary/50 bg-primary/[0.03] hover:bg-primary/[0.06] text-muted-foreground hover:text-primary transition-all group text-sm"
            >
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors shrink-0">
                <Plus className="w-4.5 h-4.5 text-primary" />
              </div>
              <div className="text-left">
                <p className="font-medium text-foreground group-hover:text-primary transition-colors">{t('tasks.addTask')}</p>
                <p className="text-[11px] text-muted-foreground">{t('tasks.addTaskHint') || 'Click to create a new task'}</p>
              </div>
            </button>
          )}
        </div>

        {/* ─── List view ─── */}
        {viewMode === 'list' && (
          <div className="flex-1 overflow-y-auto px-4 lg:px-6 pb-6">
            {groupedTasks.map(group => (
              <div key={group.key} className="mb-4">
                {group.label && (
                  <div className="flex items-center gap-2 mb-2 px-1">
                    {group.color && <div className="w-2 h-2 rounded-full" style={{ backgroundColor: group.color }} />}
                    <h3 className="text-xs font-semibold uppercase tracking-wider" style={{ color: group.color }}>{group.label}</h3>
                    <span className="text-[10px] text-muted-foreground">({group.tasks.length})</span>
                  </div>
                )}
                {group.tasks.length > 0 && (
                  <div className="card-elevated rounded-xl divide-y divide-border overflow-hidden">
                    {group.tasks.map(task => (
                      <TaskRow
                        key={task.id}
                        task={task}
                        subtaskCount={getSubtasks(task.id).length}
                        subtaskDone={getSubtasks(task.id).filter(s => s.is_completed).length}
                        labels={getLabelsForTask(task.id)}
                        isSelected={selectedTaskId === task.id}
                        isJustCompleted={recentlyCompleted.has(task.id)}
                        onToggle={() => handleToggleWithDelay(task.id)}
                        onSelect={() => setSelectedTaskId(task.id)}
                        onDelete={() => deleteTask(task.id)}
                      />
                    ))}
                  </div>
                )}
              </div>
            ))}

            {filteredTasks.length === 0 && (
              <div className="text-center py-20 space-y-3">
                <div className="w-16 h-16 rounded-2xl bg-card border border-border flex items-center justify-center mx-auto">
                  {smartView === 'today' ? <CalendarDays className="w-8 h-8 text-muted-foreground/30" /> :
                   smartView === 'upcoming' ? <CalendarRange className="w-8 h-8 text-muted-foreground/30" /> :
                   smartView === 'completed' ? <CheckCircle2 className="w-8 h-8 text-muted-foreground/30" /> :
                   <Inbox className="w-8 h-8 text-muted-foreground/30" />}
                </div>
                <p className="font-medium text-sm">{emptyMessage.title}</p>
                <p className="text-xs text-muted-foreground max-w-xs mx-auto">{emptyMessage.desc}</p>
              </div>
            )}
          </div>
        )}

        {/* ─── Board view ─── */}
        {viewMode === 'board' && (
          <div className="flex-1 overflow-x-auto px-4 lg:px-6 pb-6">
            {/* Desktop: side-by-side columns with drag-and-drop */}
            <div className="hidden lg:flex gap-4 h-full min-w-[700px]">
              {boardColumns.map(col => {
                const Icon = col.icon
                const isOver = dragOverCol === col.status && dragTaskId !== null
                return (
                  <div key={col.status} className="flex-1 flex flex-col min-w-[220px]">
                    <div className="flex items-center gap-2 px-1 mb-3">
                      <Icon className="w-4 h-4" style={{ color: col.color }} />
                      <h3 className="text-xs font-semibold uppercase tracking-wider">{col.title}</h3>
                      <span className="text-[10px] text-muted-foreground bg-secondary px-1.5 py-0.5 rounded-full">{col.tasks.length}</span>
                    </div>
                    <div
                      className={cn(
                        'flex-1 rounded-xl border-2 border-dashed p-2 space-y-2 overflow-y-auto transition-all duration-200',
                        isOver
                          ? 'border-primary/50 bg-primary/5 scale-[1.01]'
                          : 'border-border/50 bg-secondary/20'
                      )}
                      onDragOver={(e) => {
                        e.preventDefault()
                        e.dataTransfer.dropEffect = 'move'
                        setDragOverCol(col.status)
                      }}
                      onDragEnter={(e) => {
                        e.preventDefault()
                        setDragOverCol(col.status)
                      }}
                      onDragLeave={(e) => {
                        if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                          setDragOverCol(null)
                        }
                      }}
                      onDrop={async (e) => {
                        e.preventDefault()
                        setDragOverCol(null)
                        const taskId = e.dataTransfer.getData('text/plain') || dragTaskId
                        if (!taskId) return
                        const task = tasks.find(t => t.id === taskId)
                        if (!task || task.status === col.status) { setDragTaskId(null); return }
                        const isCompleted = col.status === 'done'
                        await updateTask(taskId, {
                          status: col.status,
                          is_completed: isCompleted,
                          completed_at: isCompleted ? new Date().toISOString() : null,
                        })
                        setDragTaskId(null)
                      }}
                    >
                      {col.tasks.map(task => {
                        const isDragging = dragTaskId === task.id
                        return (
                          <div
                            key={task.id}
                            draggable
                            onDragStart={(e) => {
                              setDragTaskId(task.id)
                              e.dataTransfer.setData('text/plain', task.id)
                              e.dataTransfer.effectAllowed = 'move'
                              const el = e.currentTarget
                              requestAnimationFrame(() => el.classList.add('opacity-40'))
                            }}
                            onDragEnd={(e) => {
                              e.currentTarget.classList.remove('opacity-40')
                              setDragTaskId(null)
                              setDragOverCol(null)
                            }}
                            onClick={() => setSelectedTaskId(task.id)}
                            className={cn(
                              'w-full text-left card-elevated rounded-lg p-3 space-y-2 transition-all cursor-grab active:cursor-grabbing select-none',
                              selectedTaskId === task.id && 'ring-1 ring-primary/30',
                              isDragging && 'opacity-40 scale-95'
                            )}
                          >
                            <p className="text-sm font-medium leading-snug">{task.title}</p>
                            <div className="flex items-center gap-2 flex-wrap">
                              <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: PRIORITY_LABELS[task.priority].color }} />
                              {task.due_date && (
                                <span className={cn(
                                  'text-[10px] flex items-center gap-1',
                                  isDueOverdue(task.due_date) ? 'text-red-400' : 'text-muted-foreground'
                                )}>
                                  <Clock className="w-2.5 h-2.5" /> {formatDueDate(task.due_date)}
                                </span>
                              )}
                              {task.recurrence !== 'none' && (
                                <span className="text-[9px] text-muted-foreground">🔄</span>
                              )}
                            </div>
                            {getLabelsForTask(task.id).length > 0 && (
                              <div className="flex gap-1 flex-wrap">
                                {getLabelsForTask(task.id).map(l => (
                                  <span key={l.id} className="text-[9px] px-1.5 py-0.5 rounded-full" style={{ backgroundColor: `${l.color_hex}12`, color: l.color_hex }}>
                                    {l.name}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        )
                      })}
                      {col.tasks.length === 0 && (
                        <div className={cn(
                          'flex flex-col items-center justify-center h-20 rounded-lg border border-dashed transition-colors',
                          isOver ? 'border-primary/40 bg-primary/5 text-primary' : 'border-transparent text-muted-foreground'
                        )}>
                          <span className="text-[11px]">
                            {isOver ? t('tasks.dropHere') : t('tasks.noTasks')}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Mobile: stacked columns with status-change buttons */}
            <div className="lg:hidden space-y-5">
              {boardColumns.map(col => {
                const Icon = col.icon
                return (
                  <div key={col.status}>
                    <div className="flex items-center gap-2 px-1 mb-2 sticky top-0 z-10 bg-background/95 backdrop-blur-sm py-1">
                      <Icon className="w-4 h-4" style={{ color: col.color }} />
                      <h3 className="text-xs font-semibold uppercase tracking-wider">{col.title}</h3>
                      <span className="text-[10px] text-muted-foreground bg-secondary px-1.5 py-0.5 rounded-full">{col.tasks.length}</span>
                    </div>
                    <div className="rounded-xl border border-dashed border-border/50 bg-secondary/20 p-2 space-y-2">
                      {col.tasks.map(task => {
                        const statusOptions = (['todo', 'doing', 'done'] as const).filter(s => s !== col.status)
                        return (
                          <div
                            key={task.id}
                            className={cn(
                              'w-full text-left card-elevated rounded-lg p-3 space-y-2 transition-all',
                              selectedTaskId === task.id && 'ring-1 ring-primary/30'
                            )}
                          >
                            <div className="flex items-start gap-2" onClick={() => setSelectedTaskId(task.id)}>
                              <div className="flex-1 min-w-0 space-y-1.5">
                                <p className="text-sm font-medium leading-snug">{task.title}</p>
                                <div className="flex items-center gap-2 flex-wrap">
                                  <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: PRIORITY_LABELS[task.priority].color }} />
                                  {task.due_date && (
                                    <span className={cn(
                                      'text-[10px] flex items-center gap-1',
                                      isDueOverdue(task.due_date) ? 'text-red-400' : 'text-muted-foreground'
                                    )}>
                                      <Clock className="w-2.5 h-2.5" /> {formatDueDate(task.due_date)}
                                    </span>
                                  )}
                                  {task.recurrence !== 'none' && (
                                    <span className="text-[9px] text-muted-foreground">🔄</span>
                                  )}
                                </div>
                                {getLabelsForTask(task.id).length > 0 && (
                                  <div className="flex gap-1 flex-wrap">
                                    {getLabelsForTask(task.id).map(l => (
                                      <span key={l.id} className="text-[9px] px-1.5 py-0.5 rounded-full" style={{ backgroundColor: `${l.color_hex}12`, color: l.color_hex }}>
                                        {l.name}
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                            {/* Mobile status-change buttons */}
                            <div className="flex gap-1.5 pt-1 border-t border-border/30 mt-1">
                              {statusOptions.map(targetStatus => {
                                const cfg = boardColumns.find(c => c.status === targetStatus)!
                                const TargetIcon = cfg.icon
                                return (
                                  <button
                                    key={targetStatus}
                                    onClick={async (e) => {
                                      e.stopPropagation()
                                      const isCompleted = targetStatus === 'done'
                                      await updateTask(task.id, {
                                        status: targetStatus,
                                        is_completed: isCompleted,
                                        completed_at: isCompleted ? new Date().toISOString() : null,
                                      })
                                    }}
                                    className="flex-1 inline-flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-md text-[10px] font-medium bg-secondary/60 hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                                  >
                                    <TargetIcon className="w-3 h-3" style={{ color: cfg.color }} />
                                    {cfg.title}
                                  </button>
                                )
                              })}
                            </div>
                          </div>
                        )
                      })}
                      {col.tasks.length === 0 && (
                        <div className="flex items-center justify-center h-16 text-[11px] text-muted-foreground">
                          {t('tasks.noTasks')}
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* ─── Calendar view ─── */}
        {viewMode === 'calendar' && (
          <CalendarView
            tasks={filteredTasks}
            month={calendarMonth}
            setMonth={setCalendarMonth}
            selectedDay={selectedCalendarDay}
            onSelectDay={setSelectedCalendarDay}
            onSelectTask={setSelectedTaskId}
            selectedTaskId={selectedTaskId}
            getLabelsForTask={getLabelsForTask}
            onCreateTask={handleInlineCreate}
            projects={projects}
          />
        )}
      </div>

      {/* ═══ RIGHT: Task Detail Panel ═══ */}
      {selectedTaskId && (
        <>
          {/* Desktop: inline panel */}
          <div className="hidden lg:block border-l border-border bg-background shrink-0 w-[380px] h-full overflow-hidden">
            <TaskDetailSheet taskId={selectedTaskId} onClose={() => setSelectedTaskId(null)} />
          </div>
          {/* Mobile: overlay */}
          <div className="lg:hidden fixed inset-0 z-50 bg-background h-[100dvh]">
            <TaskDetailSheet taskId={selectedTaskId} onClose={() => setSelectedTaskId(null)} />
          </div>
        </>
      )}


      {/* ═══ Create Project Dialog ═══ */}
      <Dialog open={createProjectOpen} onOpenChange={setCreateProjectOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>{t('tasks.createProjectTitle')}</DialogTitle></DialogHeader>
          <div className="space-y-4 pt-2">
            {/* Preview */}
            <div className="flex items-center gap-3 p-3 rounded-xl bg-secondary/50">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: `${newProjectColor}15` }}>
                <DynamicIcon name={newProjectIcon} className="w-5 h-5" style={{ color: newProjectColor }} />
              </div>
              <span className="font-semibold text-sm">{newProjectName || t('tasks.projectName')}</span>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t('tasks.nameLabel')}</Label>
              <Input placeholder={t('tasks.projectNamePlaceholder')} value={newProjectName} onChange={e => setNewProjectName(e.target.value)} autoFocus className="bg-secondary/50 border-0 h-10" />
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t('tasks.iconLabel')}</Label>
              <div className="grid grid-cols-8 gap-1.5 max-h-[140px] overflow-y-auto p-1">
                {PROJECT_ICONS.map(icon => (
                  <button key={icon} onClick={() => setNewProjectIcon(icon)}
                    className={cn(
                      'aspect-square rounded-lg flex items-center justify-center transition-all',
                      newProjectIcon === icon
                        ? 'ring-2 scale-110'
                        : 'bg-secondary/40 hover:bg-secondary text-muted-foreground hover:text-foreground'
                    )}
                    style={newProjectIcon === icon ? { backgroundColor: `${newProjectColor}15`, color: newProjectColor, boxShadow: `0 0 0 2px ${newProjectColor}60` } : undefined}
                  >
                    <DynamicIcon name={icon} className="w-4 h-4" style={newProjectIcon === icon ? { color: newProjectColor } : undefined} />
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t('tasks.colorLabel')}</Label>
              <div className="flex flex-wrap gap-2">
                {COLORS.map(c => (
                  <button key={c} onClick={() => setNewProjectColor(c)}
                    className={cn('w-7 h-7 rounded-full transition-all', newProjectColor === c && 'ring-2 ring-foreground ring-offset-2 ring-offset-background scale-110')}
                    style={{ backgroundColor: c }} />
                ))}
              </div>
            </div>

            <Button onClick={handleCreateProject} disabled={!newProjectName.trim()} className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-semibold h-10">
              {t('tasks.createProjectTitle')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ═══ Create Label Dialog ═══ */}
      <Dialog open={createLabelOpen} onOpenChange={setCreateLabelOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>{t('tasks.createLabelTitle')}</DialogTitle></DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t('tasks.nameLabel')}</Label>
              <Input placeholder={t('tasks.labelNamePlaceholder')} value={newLabelName} onChange={e => setNewLabelName(e.target.value)} autoFocus className="bg-secondary/50 border-0 h-10" />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t('tasks.colorLabel')}</Label>
              <div className="flex flex-wrap gap-2">
                {COLORS.map(c => (
                  <button key={c} onClick={() => setNewLabelColor(c)}
                    className={cn('w-7 h-7 rounded-full transition-all', newLabelColor === c && 'ring-2 ring-foreground ring-offset-2 ring-offset-background scale-110')}
                    style={{ backgroundColor: c }} />
                ))}
              </div>
            </div>
            <Button onClick={handleCreateLabel} disabled={!newLabelName.trim()} className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-semibold h-10">
              {t('tasks.createLabelTitle')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ═══ Edit Project Dialog ═══ */}
      <Dialog open={editProjectOpen} onOpenChange={setEditProjectOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>{t('tasks.editProject')}</DialogTitle></DialogHeader>
          <div className="space-y-4 pt-2">
            {/* Preview */}
            <div className="flex items-center gap-3 p-3 rounded-xl bg-secondary/50">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: `${editProjectColor}15` }}>
                <DynamicIcon name={editProjectIcon} className="w-5 h-5" style={{ color: editProjectColor }} />
              </div>
              <span className="font-semibold text-sm">{editProjectName || t('tasks.projectName')}</span>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t('tasks.nameLabel')}</Label>
              <Input placeholder={t('tasks.projectNamePlaceholder')} value={editProjectName} onChange={e => setEditProjectName(e.target.value)} autoFocus className="bg-secondary/50 border-0 h-10" />
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t('tasks.iconLabel')}</Label>
              <div className="grid grid-cols-8 gap-1.5 max-h-[140px] overflow-y-auto p-1">
                {PROJECT_ICONS.map(icon => (
                  <button key={icon} onClick={() => setEditProjectIcon(icon)}
                    className={cn(
                      'aspect-square rounded-lg flex items-center justify-center transition-all',
                      editProjectIcon === icon
                        ? 'ring-2 scale-110'
                        : 'bg-secondary/40 hover:bg-secondary text-muted-foreground hover:text-foreground'
                    )}
                    style={editProjectIcon === icon ? { backgroundColor: `${editProjectColor}15`, color: editProjectColor, boxShadow: `0 0 0 2px ${editProjectColor}60` } : undefined}
                  >
                    <DynamicIcon name={icon} className="w-4 h-4" style={editProjectIcon === icon ? { color: editProjectColor } : undefined} />
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t('tasks.colorLabel')}</Label>
              <div className="flex flex-wrap gap-2">
                {COLORS.map(c => (
                  <button key={c} onClick={() => setEditProjectColor(c)}
                    className={cn('w-7 h-7 rounded-full transition-all', editProjectColor === c && 'ring-2 ring-foreground ring-offset-2 ring-offset-background scale-110')}
                    style={{ backgroundColor: c }} />
                ))}
              </div>
            </div>

            <Button onClick={handleSaveProject} disabled={!editProjectName.trim()} className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-semibold h-10">
              {t('common.saveChanges')}
            </Button>

            <div className="pt-2 border-t border-border">
              <Button
                variant="ghost"
                onClick={async () => {
                  if (editProjectId) {
                    if (selectedProjectId === editProjectId) setSelectedProjectId(null)
                    await deleteProject(editProjectId)
                    setEditProjectOpen(false)
                  }
                }}
                className="w-full text-destructive hover:text-destructive hover:bg-destructive/10 gap-2 text-sm"
              >
                <Trash2 className="w-4 h-4" /> {t('tasks.deleteProject')}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ═══ Mobile Sidebar Drawer ═══ */}
      {mobileSidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileSidebarOpen(false)} />
          {/* Panel */}
          <div className="absolute bottom-0 left-0 right-0 bg-background rounded-t-2xl border-t border-border max-h-[80vh] overflow-y-auto animate-in slide-in-from-bottom duration-200">
            {/* Handle bar */}
            <div className="flex items-center justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full bg-border" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3">
              <h2 className="text-base font-bold">{t('tasks.projects')} & {t('tasks.labelsNav')}</h2>
              <button onClick={() => setMobileSidebarOpen(false)} className="p-1.5 rounded-lg hover:bg-accent text-muted-foreground">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Smart Views */}
            <div className="px-4 pb-3">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground px-1 mb-2">{t('tasks.views')}</p>
              <div className="space-y-0.5">
                {SMART_VIEWS.map(view => {
                  const Icon = view.icon
                  const active = smartView === view.id && !selectedProjectId && !selectedLabelId
                  const count = view.id === 'today' ? todayCount
                    : view.id === 'upcoming' ? upcomingCount
                    : view.id === 'inbox' ? activeCount
                    : view.id === 'completed' ? completedCount
                    : parentTasks.length
                  return (
                    <button
                      key={view.id}
                      onClick={() => { setSmartView(view.id); setSelectedProjectId(null); setSelectedLabelId(null); setMobileSidebarOpen(false) }}
                      className={cn(
                        'flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium transition-all',
                        active ? 'bg-primary/8 text-primary' : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                      )}
                    >
                      <Icon className="w-4.5 h-4.5 shrink-0" />
                      <span className="flex-1 text-left">{view.label}</span>
                      <span className="text-xs text-muted-foreground">{view.desc}</span>
                      {count > 0 && (
                        <span className={cn(
                          'text-[10px] min-w-[22px] text-center px-1.5 py-0.5 rounded-full',
                          active ? 'bg-primary/20 text-primary' : 'bg-secondary text-muted-foreground'
                        )}>
                          {count}
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="mx-4 border-t border-border" />

            {/* Projects */}
            <div className="px-4 py-3">
              <div className="flex items-center justify-between px-1 mb-2">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{t('tasks.projects')}</p>
                <button onClick={() => { setCreateProjectOpen(true); setMobileSidebarOpen(false) }} className="text-primary text-xs font-medium">
                  + {t('common.create')}
                </button>
              </div>
              <div className="space-y-0.5">
                {projects.map(p => {
                  const count = store.projectLinks.filter(l => l.project_id === p.id).length
                  const active = selectedProjectId === p.id
                  return (
                    <div key={p.id} className="flex items-center">
                      <button
                        onClick={() => { setSelectedProjectId(active ? null : p.id); setSelectedLabelId(null); if (!active) setSmartView('all'); setMobileSidebarOpen(false) }}
                        className={cn(
                          'flex items-center gap-3 flex-1 min-w-0 px-3 py-2.5 rounded-xl text-sm font-medium transition-all',
                          active ? 'bg-accent text-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                        )}
                      >
                        <DynamicIcon name={p.icon_name} className="w-4.5 h-4.5 shrink-0" style={{ color: p.color_hex }} />
                        <span className="flex-1 text-left truncate">{p.name}</span>
                        {count > 0 && <span className="text-[10px] text-muted-foreground bg-secondary px-1.5 py-0.5 rounded-full">{count}</span>}
                      </button>
                      <div className="flex items-center gap-1 shrink-0 pr-2">
                        <button
                          onClick={(e) => { e.stopPropagation(); openEditProject(p); setMobileSidebarOpen(false) }}
                          className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={async (e) => { e.stopPropagation(); if (selectedProjectId === p.id) setSelectedProjectId(null); await deleteProject(p.id) }}
                          className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  )
                })}
                {projects.length === 0 && (
                  <p className="text-xs text-muted-foreground px-3 py-2">{t('tasks.noProjectsCreated')}</p>
                )}
              </div>
            </div>

            <div className="mx-4 border-t border-border" />

            {/* Labels */}
            <div className="px-4 py-3 pb-8">
              <div className="flex items-center justify-between px-1 mb-2">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{t('tasks.labelsNav')}</p>
                <button onClick={() => { setCreateLabelOpen(true); setMobileSidebarOpen(false) }} className="text-primary text-xs font-medium">
                  + {t('common.create')}
                </button>
              </div>
              <div className="space-y-0.5">
                {labels.map(l => {
                  const active = selectedLabelId === l.id
                  return (
                    <button
                      key={l.id}
                      onClick={() => { setSelectedLabelId(active ? null : l.id); setSelectedProjectId(null); setMobileSidebarOpen(false) }}
                      className={cn(
                        'flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium transition-all',
                        active ? 'bg-accent text-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                      )}
                    >
                      <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: l.color_hex }} />
                      <span className="flex-1 text-left truncate">{l.name}</span>
                    </button>
                  )
                })}
                {labels.length === 0 && (
                  <p className="text-xs text-muted-foreground px-3 py-2">{t('tasks.noLabelsCreated')}</p>
                )}
              </div>
            </div>

            {/* Clear filters button */}
            {(selectedProjectId || selectedLabelId) && (
              <div className="px-4 pb-6">
                <button
                  onClick={() => { setSelectedProjectId(null); setSelectedLabelId(null); setMobileSidebarOpen(false) }}
                  className="w-full py-2.5 rounded-xl text-sm font-medium text-destructive bg-destructive/10 hover:bg-destructive/15 transition-colors"
                >
                  {t('common.clear')} filters
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Calendar View Component ──────────────────────────────
function CalendarView({
  tasks, month, setMonth, selectedDay, onSelectDay, onSelectTask, selectedTaskId, getLabelsForTask,
  onCreateTask, projects,
}: {
  tasks: Task[]
  month: Date
  setMonth: (d: Date) => void
  selectedDay: string | null
  onSelectDay: (d: string | null) => void
  onSelectTask: (id: string) => void
  selectedTaskId: string | null
  getLabelsForTask: (id: string) => { id: string; name: string; color_hex: string }[]
  onCreateTask: (data: { title: string; note: string | null; due_date: string | null; priority: number; recurrence: string; recurrence_rule?: any; projectId?: string | null }) => Promise<void>
  projects: TaskProject[]
}) {
  const t = useT()
  const gridRef = useRef<HTMLDivElement>(null)
  const [popover, setPopover] = useState<{ dateStr: string; x: number; y: number; w: number; h: number } | null>(null)
  const popoverOpen = !!popover

  const WEEKDAY_HEADERS = useMemo(() => [
    t('tasks.weekMon'), t('tasks.weekTue'), t('tasks.weekWed'), t('tasks.weekThu'),
    t('tasks.weekFri'), t('tasks.weekSat'), t('tasks.weekSun'),
  ], [t])
  const todayStr = format(new Date(), 'yyyy-MM-dd')
  const mStart = startOfMonth(month)
  const mEnd = endOfMonth(month)
  const days = eachDayOfInterval({ start: mStart, end: mEnd })
  const startPadding = (getDay(mStart) + 6) % 7 // Mon = 0

  // Compute tasks per day for the whole month
  const tasksByDay = useMemo(() => {
    const map = new Map<string, Task[]>()
    for (const day of days) {
      const dateStr = format(day, 'yyyy-MM-dd')
      const dayTasks = getTasksForDate(tasks, day)
      if (dayTasks.length > 0) map.set(dateStr, dayTasks)
    }
    return map
  }, [tasks, days])

  const selectedDayTasks = selectedDay ? (tasksByDay.get(selectedDay) || []) : []

  const handleAddForDay = (dateStr: string, e: React.MouseEvent) => {
    e.stopPropagation()
    const cellEl = (e.currentTarget as HTMLElement).closest('[data-day-cell]') as HTMLElement | null
    if (!cellEl || !gridRef.current) return
    const gridRect = gridRef.current.getBoundingClientRect()
    const cellRect = cellEl.getBoundingClientRect()
    setPopover({
      dateStr,
      x: cellRect.left - gridRect.left,
      y: cellRect.top - gridRect.top,
      w: cellRect.width,
      h: cellRect.height,
    })
    onSelectDay(dateStr)
  }

  return (
    <div className="flex-1 overflow-y-auto px-4 lg:px-6 pb-6">
      {/* Month navigation */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => setMonth(subMonths(month, 1))}
          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <div className="text-center">
          <h2 className="text-lg font-bold">{format(month, 'MMMM yyyy')}</h2>
          <button
            onClick={() => { setMonth(new Date()); onSelectDay(todayStr) }}
            className="text-[10px] text-primary hover:underline font-medium"
          >
            {t('tasks.todayView')}
          </button>
        </div>
        <button
          onClick={() => setMonth(addMonths(month, 1))}
          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-1 mb-1">
        {WEEKDAY_HEADERS.map(d => (
          <div key={d} className="text-center text-[10px] font-semibold text-muted-foreground py-1">
            {d}
          </div>
        ))}
      </div>

      {/* Calendar grid (relative for popover anchor) */}
      <div ref={gridRef} className="grid grid-cols-7 gap-1 relative">
        {/* Padding */}
        {Array.from({ length: startPadding }).map((_, i) => (
          <div key={`pad-${i}`} className="min-h-[80px] lg:min-h-[100px]" />
        ))}

        {/* Day cells */}
        {days.map(day => {
          const dateStr = format(day, 'yyyy-MM-dd')
          const isToday = dateStr === todayStr
          const isSelected = dateStr === selectedDay
          const dayTasks = tasksByDay.get(dateStr) || []
          const isWeekend = getDay(day) === 0 || getDay(day) === 6

          return (
            <div
              key={dateStr}
              data-day-cell={dateStr}
              onClick={() => onSelectDay(isSelected ? null : dateStr)}
              className={cn(
                'min-h-[80px] lg:min-h-[100px] rounded-lg p-1.5 text-left transition-all border cursor-pointer group/day relative',
                isSelected
                  ? 'border-primary/40 bg-primary/5'
                  : isToday
                    ? 'border-primary/20 bg-card'
                    : 'border-transparent hover:bg-card hover:border-border/50',
                isWeekend && !isSelected && !isToday && 'bg-secondary/20'
              )}
            >
              <div className="flex items-center justify-between">
                <span className={cn(
                  'inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-semibold',
                  isToday && 'bg-primary text-primary-foreground',
                  !isToday && 'text-muted-foreground'
                )}>
                  {day.getDate()}
                </span>
                <button
                  onClick={(e) => handleAddForDay(dateStr, e)}
                  className="w-5 h-5 rounded-md flex items-center justify-center opacity-60 lg:opacity-0 lg:group-hover/day:opacity-100 transition-opacity text-muted-foreground hover:text-primary hover:bg-primary/10"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Task indicators */}
              <div className="mt-0.5 space-y-0.5">
                {dayTasks.slice(0, 3).map(task => (
                  <div
                    key={task.id}
                    className="flex items-center gap-1 px-1 py-0.5 rounded text-[9px] font-medium truncate"
                    style={{ backgroundColor: `${PRIORITY_LABELS[task.priority].color}15`, color: PRIORITY_LABELS[task.priority].color }}
                  >
                    <div className="w-1 h-1 rounded-full shrink-0" style={{ backgroundColor: PRIORITY_LABELS[task.priority].color }} />
                    <span className="truncate">{task.title}</span>
                  </div>
                ))}
                {dayTasks.length > 3 && (
                  <span className="text-[9px] text-muted-foreground px-1">{t('tasks.moreCount', { count: dayTasks.length - 3 })}</span>
                )}
              </div>
            </div>
          )
        })}

        {/* Floating popover for task creation */}
        <Popover open={popoverOpen} onOpenChange={(open) => { if (!open) setPopover(null) }}>
          <PopoverAnchor asChild>
            <div
              className="absolute pointer-events-none"
              style={{
                left: popover ? popover.x : 0,
                top: popover ? popover.y : 0,
                width: popover ? popover.w : 0,
                height: popover ? popover.h : 0,
              }}
            />
          </PopoverAnchor>
          {popover && (
            <PopoverContent
              className="w-[min(340px,calc(100vw-2rem))] p-0 shadow-xl border-border"
              side="bottom"
              align="center"
              sideOffset={6}
              collisionPadding={12}
              onOpenAutoFocus={e => e.preventDefault()}
            >
              <CalendarTaskPopoverForm
                dateStr={popover.dateStr}
                projects={projects}
                onSubmit={async (data) => {
                  await onCreateTask(data)
                  setPopover(null)
                }}
                onCancel={() => setPopover(null)}
              />
            </PopoverContent>
          )}
        </Popover>
      </div>

      {/* Selected day detail panel */}
      {selectedDay && (
        <div className="mt-4 card-elevated rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-border flex items-center justify-between">
            <h3 className="text-sm font-semibold">
              {format(new Date(selectedDay + 'T12:00:00'), 'EEEE, MMMM d')}
            </h3>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">
                {t('tasks.taskCount', { count: selectedDayTasks.length })}
              </span>
              <button
                onClick={(e) => {
                  const cell = gridRef.current?.querySelector(`[data-day-cell="${selectedDay}"]`) as HTMLElement | null
                  if (cell && gridRef.current) {
                    const gridRect = gridRef.current.getBoundingClientRect()
                    const cellRect = cell.getBoundingClientRect()
                    setPopover({
                      dateStr: selectedDay,
                      x: cellRect.left - gridRect.left,
                      y: cellRect.top - gridRect.top,
                      w: cellRect.width,
                      h: cellRect.height,
                    })
                  }
                }}
                className="w-6 h-6 rounded-md flex items-center justify-center text-primary hover:bg-primary/10 transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {selectedDayTasks.length > 0 ? (
            <div className="divide-y divide-border">
              {selectedDayTasks.map(task => (
                <button
                  key={task.id}
                  onClick={() => onSelectTask(task.id)}
                  className={cn(
                    'w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-accent/30 transition-colors',
                    selectedTaskId === task.id && 'bg-primary/5'
                  )}
                >
                  <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: PRIORITY_LABELS[task.priority].color }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{task.title}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      {task.recurrence !== 'none' && (
                        <span className="text-[9px] text-purple-400 bg-purple-400/10 px-1.5 py-0.5 rounded">
                          🔄 {recurrenceLabel(task.recurrence, task.recurrence_rule as any)}
                        </span>
                      )}
                      {getLabelsForTask(task.id).map(l => (
                        <span key={l.id} className="text-[9px] px-1.5 py-0.5 rounded-full" style={{ backgroundColor: `${l.color_hex}12`, color: l.color_hex }}>
                          {l.name}
                        </span>
                      ))}
                    </div>
                  </div>
                  <Flag className="w-3 h-3 shrink-0" style={{ color: PRIORITY_LABELS[task.priority].color }} />
                </button>
              ))}
            </div>
          ) : (
            <div className="px-4 py-8 text-center">
              <p className="text-xs text-muted-foreground mb-2">{t('tasks.noTasksForDay')}</p>
              <button
                onClick={() => {
                  const cell = gridRef.current?.querySelector(`[data-day-cell="${selectedDay}"]`) as HTMLElement | null
                  if (cell && gridRef.current) {
                    const gridRect = gridRef.current.getBoundingClientRect()
                    const cellRect = cell.getBoundingClientRect()
                    setPopover({
                      dateStr: selectedDay,
                      x: cellRect.left - gridRect.left,
                      y: cellRect.top - gridRect.top,
                      w: cellRect.width,
                      h: cellRect.height,
                    })
                  }
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-primary bg-primary/5 hover:bg-primary/10 transition-colors border border-dashed border-primary/20"
              >
                <Plus className="w-3.5 h-3.5" /> {t('tasks.addTask')}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ─── Compact popover form for creating a task from the calendar ──────
function CalendarTaskPopoverForm({
  dateStr, projects, onSubmit, onCancel,
}: {
  dateStr: string
  projects: TaskProject[]
  onSubmit: (data: { title: string; note: string | null; due_date: string | null; priority: number; recurrence: string; recurrence_rule?: any; projectId?: string | null }) => Promise<void>
  onCancel: () => void
}) {
  const t = useT()
  const [title, setTitle] = useState('')
  const [note, setNote] = useState('')
  const [priority, setPriority] = useState(4)
  const [projectId, setProjectId] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    requestAnimationFrame(() => inputRef.current?.focus())
  }, [])

  const handleSubmit = async () => {
    if (!title.trim() || submitting) return
    setSubmitting(true)
    try {
      await onSubmit({
        title: title.trim(),
        note: note.trim() || null,
        due_date: dateStr,
        priority,
        recurrence: 'none',
        projectId,
      })
      setTitle('')
      setNote('')
      setPriority(4)
      setProjectId(null)
      requestAnimationFrame(() => inputRef.current?.focus())
    } finally {
      setSubmitting(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit() }
    if (e.key === 'Escape') onCancel()
  }

  const dateLabel = format(new Date(dateStr + 'T12:00:00'), 'EEE, MMM d')
  const selectedProject = projects.find(p => p.id === projectId)

  return (
    <div>
      {/* Header */}
      <div className="px-3.5 pt-3 pb-2 flex items-center gap-2 border-b border-border">
        <div className="w-6 h-6 rounded-md bg-primary/10 flex items-center justify-center">
          <CalendarDays className="w-3.5 h-3.5 text-primary" />
        </div>
        <span className="text-xs font-semibold text-foreground">{dateLabel}</span>
      </div>

      {/* Input */}
      <div className="px-3.5 pt-3 pb-1.5">
        <input
          ref={inputRef}
          value={title}
          onChange={e => setTitle(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={t('tasks.addTask')}
          className="w-full bg-transparent text-sm font-medium placeholder:text-muted-foreground/50 outline-none"
        />
        <input
          value={note}
          onChange={e => setNote(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Description"
          className="w-full bg-transparent text-xs text-muted-foreground placeholder:text-muted-foreground/30 outline-none mt-1.5"
        />
      </div>

      {/* Toolbar: Priority + Category */}
      <div className="px-3 py-2 flex items-center gap-1.5 flex-wrap">
        {/* Priority chips */}
        {([1, 2, 3, 4] as const).map(p => (
          <button
            key={p}
            onClick={() => setPriority(p)}
            className={cn(
              'inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-medium transition-all border',
              priority === p
                ? 'border-current/30 shadow-sm'
                : 'border-transparent hover:bg-secondary text-muted-foreground'
            )}
            style={priority === p ? { color: PRIORITY_LABELS[p].color, backgroundColor: `${PRIORITY_LABELS[p].color}15` } : undefined}
          >
            <Flag className="w-3 h-3" style={{ color: PRIORITY_LABELS[p].color }} />
            {p < 4 ? `P${p}` : '-'}
          </button>
        ))}

        <div className="w-px h-4 bg-border mx-0.5" />

        {/* Category selector */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className={cn(
                'inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-medium transition-all border',
                selectedProject
                  ? 'border-current/20'
                  : 'border-transparent hover:bg-secondary text-muted-foreground'
              )}
              style={selectedProject ? { color: selectedProject.color_hex, backgroundColor: `${selectedProject.color_hex}15` } : undefined}
            >
              {selectedProject ? (
                <>
                  <DynamicIcon name={selectedProject.icon_name} className="w-3 h-3" />
                  <span className="truncate max-w-[80px]">{selectedProject.name}</span>
                </>
              ) : (
                <>
                  <FolderOpen className="w-3 h-3" />
                  {t('tasks.addToProject')}
                </>
              )}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-44">
            <button
              onClick={() => setProjectId(null)}
              className={cn('w-full flex items-center gap-2 px-2 py-1.5 text-xs rounded hover:bg-accent transition-colors', !projectId && 'bg-accent')}
            >
              <Inbox className="w-3.5 h-3.5 text-blue-400" />
              <span>{t('tasks.inboxProject')}</span>
            </button>
            {projects.map(p => (
              <button
                key={p.id}
                onClick={() => setProjectId(p.id)}
                className={cn('w-full flex items-center gap-2 px-2 py-1.5 text-xs rounded hover:bg-accent transition-colors', projectId === p.id && 'bg-accent')}
              >
                <DynamicIcon name={p.icon_name} className="w-3.5 h-3.5" style={{ color: p.color_hex }} />
                <span className="truncate">{p.name}</span>
              </button>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Actions */}
      <div className="px-3 py-2.5 flex items-center justify-end gap-2 border-t border-border bg-secondary/20">
        <button
          onClick={onCancel}
          className="px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground rounded-md hover:bg-secondary transition-colors"
        >
          {t('common.cancel')}
        </button>
        <button
          onClick={handleSubmit}
          disabled={!title.trim() || submitting}
          className="px-4 py-1.5 text-xs font-semibold rounded-md bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-40 transition-colors"
        >
          {t('tasks.addTask')}
        </button>
      </div>
    </div>
  )
}

// ─── Task Row Component ───────────────────────────────────
function TaskRow({
  task, subtaskCount, subtaskDone, labels, isSelected, isJustCompleted, onToggle, onSelect, onDelete
}: {
  task: Task
  subtaskCount: number
  subtaskDone: number
  labels: { id: string; name: string; color_hex: string }[]
  isSelected: boolean
  isJustCompleted?: boolean
  onToggle: () => void
  onSelect: () => void
  onDelete: () => void
}) {
  const t = useT()
  const isOverdue = task.due_date && isDueOverdue(task.due_date) && !task.is_completed

  return (
    <div
      className={cn(
        'flex items-start gap-3 px-4 py-3 hover:bg-accent/30 transition-all duration-500 group cursor-pointer',
        isSelected && 'bg-primary/5 border-l-2 border-l-primary',
        isJustCompleted && 'bg-emerald-500/5 opacity-60'
      )}
      onClick={onSelect}
    >
      <button onClick={(e) => { e.stopPropagation(); onToggle() }} className="mt-0.5 shrink-0">
        <div className={cn(
          'w-[18px] h-[18px] rounded-full border-2 flex items-center justify-center transition-all duration-300',
          task.is_completed
            ? 'border-emerald-500 bg-emerald-500 shadow-sm shadow-emerald-500/30 scale-110'
            : 'border-border hover:border-muted-foreground'
        )}>
          {task.is_completed && (
            <svg className="w-2.5 h-2.5 text-white animate-in zoom-in-50 duration-200" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 6.5L5 9.5L10 3" />
            </svg>
          )}
        </div>
      </button>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className={cn(
            'text-sm font-medium leading-snug truncate transition-all duration-300',
            task.is_completed && 'line-through text-muted-foreground'
          )}>{task.title}</p>
          <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: PRIORITY_LABELS[task.priority].color }} />
        </div>

        <div className="flex items-center gap-2 mt-1 flex-wrap">
          {task.due_date && (
            <span className={cn('text-[10px] flex items-center gap-1', isOverdue ? 'text-red-400' : isDueToday(task.due_date) ? 'text-primary' : 'text-muted-foreground')}>
              <Clock className="w-3 h-3" />
              {isOverdue && <AlertCircle className="w-2.5 h-2.5" />}
              {isDueToday(task.due_date) ? t('tasks.todayView') : isDueTomorrow(task.due_date) ? t('tasks.tomorrow') : formatDueDate(task.due_date)}
            </span>
          )}
          {task.recurrence !== 'none' && (
            <span className="text-[10px] text-muted-foreground bg-secondary px-1.5 py-0.5 rounded">🔄 {recurrenceLabel(task.recurrence, task.recurrence_rule as any)}</span>
          )}
          {subtaskCount > 0 && (
            <span className="text-[10px] text-muted-foreground flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> {subtaskDone}/{subtaskCount}
            </span>
          )}
          {labels.map(l => (
            <span key={l.id} className="text-[9px] px-1.5 py-0.5 rounded-full" style={{ backgroundColor: `${l.color_hex}12`, color: l.color_hex }}>
              {l.name}
            </span>
          ))}
        </div>
      </div>

      <button
        onClick={(e) => { e.stopPropagation(); onDelete() }}
        className="opacity-60 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive shrink-0 mt-0.5"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  )
}
