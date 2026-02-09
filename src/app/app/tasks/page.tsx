'use client'

import { useEffect, useMemo, useState } from 'react'
import { useTasksStore, type SmartView, type SortBy, type GroupBy } from '@/lib/store/tasks-store'
import { TaskDetailSheet } from '@/components/tasks/task-detail-sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DropdownMenu, DropdownMenuContent, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuTrigger, DropdownMenuLabel, DropdownMenuSeparator } from '@/components/ui/dropdown-menu'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { COLORS } from '@/lib/constants'
import {
  Plus, Search, Trash2, Clock, Columns3, List, Inbox, CalendarDays,
  CalendarRange, ListChecks, CheckCircle2, FolderOpen, Tag, ArrowUpDown,
  Group, AlertCircle, ArrowRightCircle,
  Circle, Flag
} from 'lucide-react'
import type { Task } from '@/lib/types/database'
import { cn } from '@/lib/utils'
import { PRIORITY_LABELS } from '@/lib/constants'
import { format, parseISO, isToday as _isToday, isTomorrow as _isTomorrow, startOfDay, addDays, differenceInCalendarDays } from 'date-fns'

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

// ─── Smart view configuration ─────────────────────────────
const SMART_VIEWS = [
  { id: 'inbox' as SmartView, label: 'Inbox', icon: Inbox, desc: 'Active tasks' },
  { id: 'today' as SmartView, label: 'Today', icon: CalendarDays, desc: 'Due today + overdue' },
  { id: 'upcoming' as SmartView, label: 'Upcoming', icon: CalendarRange, desc: 'Next 7 days' },
  { id: 'all' as SmartView, label: 'All tasks', icon: ListChecks, desc: 'Everything' },
  { id: 'completed' as SmartView, label: 'Completed', icon: CheckCircle2, desc: 'Done tasks' },
]

const SORT_OPTIONS: { value: SortBy; label: string }[] = [
  { value: 'priority', label: 'Priority' },
  { value: 'due_date', label: 'Due date' },
  { value: 'created_at', label: 'Created' },
  { value: 'title', label: 'Alphabetical' },
]

const GROUP_OPTIONS: { value: GroupBy; label: string }[] = [
  { value: 'none', label: 'No grouping' },
  { value: 'status', label: 'By status' },
  { value: 'priority', label: 'By priority' },
  { value: 'due_date', label: 'By due date' },
]

// ─── Main page ────────────────────────────────────────────
export default function TasksPage() {
  const store = useTasksStore()
  const {
    tasks, projects, labels, loading,
    smartView, viewMode, searchQuery, sortBy, sortDirection, groupBy, priorityFilter,
    selectedProjectId, selectedLabelId, selectedTaskId,
    setSmartView, setViewMode, setSearchQuery, setSortBy, setSortDirection, setGroupBy,
    setPriorityFilter, setSelectedProjectId, setSelectedLabelId, setSelectedTaskId,
    fetchAll, createTask, toggleTask, deleteTask, getSubtasks, getLabelsForTask,
    createProject, createLabel,
  } = store

  const [createOpen, setCreateOpen] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newNote, setNewNote] = useState('')
  const [newPriority, setNewPriority] = useState(4)
  const [newDueDate, setNewDueDate] = useState('')
  const [newRecurrence, setNewRecurrence] = useState<'none' | 'daily' | 'weekly' | 'monthly'>('none')
  const [quickAddValue, setQuickAddValue] = useState('')

  // Create project/label dialogs
  const [createProjectOpen, setCreateProjectOpen] = useState(false)
  const [newProjectName, setNewProjectName] = useState('')
  const [newProjectColor, setNewProjectColor] = useState('#3DD68C')

  const [createLabelOpen, setCreateLabelOpen] = useState(false)
  const [newLabelName, setNewLabelName] = useState('')
  const [newLabelColor, setNewLabelColor] = useState('#60a5fa')

  useEffect(() => { fetchAll() }, [fetchAll])

  const parentTasks = useMemo(() => tasks.filter(t => !t.parent_task_id), [tasks])

  // ─── Filtering ──────────────────────────────────────────
  const filteredTasks = useMemo(() => {
    let result = parentTasks

    // Smart view filter
    switch (smartView) {
      case 'today':
        result = result.filter(t => !t.is_completed && t.due_date && (
          isDueToday(t.due_date) || isDueOverdue(t.due_date)
        ))
        break
      case 'upcoming':
        result = result.filter(t => !t.is_completed && t.due_date && isDueInNextDays(t.due_date, 7))
        break
      case 'completed':
        result = result.filter(t => t.is_completed)
        break
      case 'inbox':
        result = result.filter(t => !t.is_completed)
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
  }, [parentTasks, smartView, selectedProjectId, selectedLabelId, priorityFilter, searchQuery, store.projectLinks, store.labelLinks])

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
          label = { todo: 'To Do', doing: 'In Progress', done: 'Done' }[task.status]
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
          if (!task.due_date) { key = 'no-date'; label = 'No date'; order = 99 }
          else if (isDueOverdue(task.due_date)) { key = 'overdue'; label = 'Overdue'; color = '#ef4444'; order = 0 }
          else if (isDueToday(task.due_date)) { key = 'today'; label = 'Today'; color = '#3DD68C'; order = 1 }
          else if (isDueTomorrow(task.due_date)) { key = 'tomorrow'; label = 'Tomorrow'; color = '#60a5fa'; order = 2 }
          else if (isDueThisWeek(task.due_date)) { key = 'this-week'; label = 'This week'; color = '#a78bfa'; order = 3 }
          else { key = 'later'; label = 'Later'; color = '#fbbf24'; order = 4 }
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
    { title: 'To Do', status: 'todo' as const, tasks: sortedTasks.filter(t => t.status === 'todo'), color: '#71717a', icon: Circle },
    { title: 'In Progress', status: 'doing' as const, tasks: sortedTasks.filter(t => t.status === 'doing'), color: '#60a5fa', icon: ArrowRightCircle },
    { title: 'Done', status: 'done' as const, tasks: sortedTasks.filter(t => t.status === 'done'), color: '#3DD68C', icon: CheckCircle2 },
  ], [sortedTasks])

  // ─── Quick add ──────────────────────────────────────────
  const handleQuickAdd = async () => {
    if (!quickAddValue.trim()) return
    const todayStr = format(new Date(), 'yyyy-MM-dd')
    await createTask({
      title: quickAddValue.trim(),
      due_date: smartView === 'today' ? todayStr : null,
    })
    setQuickAddValue('')
  }

  const handleCreate = async () => {
    if (!newTitle.trim()) return
    await createTask({
      title: newTitle.trim(),
      note: newNote || null,
      priority: newPriority,
      due_date: newDueDate || null,
      recurrence: newRecurrence,
    })
    setNewTitle(''); setNewNote(''); setNewPriority(4); setNewDueDate(''); setNewRecurrence('none')
    setCreateOpen(false)
  }

  const handleCreateProject = async () => {
    if (!newProjectName.trim()) return
    await createProject({ name: newProjectName.trim(), icon_name: 'folder', color_hex: newProjectColor })
    setNewProjectName(''); setNewProjectColor('#3DD68C')
    setCreateProjectOpen(false)
  }

  const handleCreateLabel = async () => {
    if (!newLabelName.trim()) return
    await createLabel({ name: newLabelName.trim(), color_hex: newLabelColor })
    setNewLabelName(''); setNewLabelColor('#60a5fa')
    setCreateLabelOpen(false)
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
    ? projects.find(p => p.id === selectedProjectId)?.name ?? 'Project'
    : selectedLabelId
      ? labels.find(l => l.id === selectedLabelId)?.name ?? 'Label'
      : currentView?.label ?? 'Tasks'
  const currentViewDesc = selectedProjectId
    ? `${filteredTasks.length} tasks in project`
    : selectedLabelId
      ? `${filteredTasks.length} tasks with label`
      : currentView?.desc ?? ''

  // Smart view empty state messages
  const emptyMessage = (() => {
    if (searchQuery) return { title: 'No results', desc: 'Try a different search term.' }
    if (selectedProjectId) return { title: 'No tasks in this project', desc: 'Assign tasks to this project from the task detail panel.' }
    if (selectedLabelId) return { title: 'No tasks with this label', desc: 'Assign labels to tasks from the task detail panel.' }
    switch (smartView) {
      case 'today': return { title: 'Nothing due today', desc: 'Tasks due today or overdue will appear here. Create a task with today\'s date.' }
      case 'upcoming': return { title: 'Nothing upcoming', desc: 'Tasks due in the next 7 days will appear here.' }
      case 'completed': return { title: 'No completed tasks', desc: 'Completed tasks will appear here.' }
      case 'all': return { title: 'No tasks yet', desc: 'Create your first task to get started.' }
      default: return { title: 'No active tasks', desc: 'Create a task with the quick add bar above or the "New task" button.' }
    }
  })()

  return (
    <div className="flex h-[calc(100vh-52px)] lg:h-screen overflow-hidden">
      {/* ═══ LEFT: Navigation Sidebar ═══ */}
      <aside className="hidden md:flex flex-col border-r border-border bg-sidebar shrink-0 w-[220px] overflow-y-auto">
        {/* Smart views */}
        <div className="px-3 pt-4 pb-2">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground px-2 mb-2">Views</p>
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
                    active ? 'bg-[#3DD68C]/8 text-[#3DD68C]' : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                  )}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="flex-1 text-left truncate">{view.label}</span>
                  {count > 0 && (
                    <span className={cn(
                      'text-[10px] min-w-[20px] text-center px-1.5 py-0.5 rounded-full',
                      active ? 'bg-[#3DD68C]/20 text-[#3DD68C]' : 'bg-secondary text-muted-foreground'
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
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Projects</p>
            <button onClick={() => setCreateProjectOpen(true)} className="text-muted-foreground hover:text-foreground transition-colors">
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="space-y-0.5">
            {projects.map(p => {
              const count = store.projectLinks.filter(l => l.project_id === p.id).length
              const active = selectedProjectId === p.id
              return (
                <button
                  key={p.id}
                  onClick={() => setSelectedProjectId(active ? null : p.id)}
                  className={cn(
                    'flex items-center gap-2.5 w-full px-2.5 py-1.5 rounded-lg text-[13px] font-medium transition-all',
                    active ? 'bg-accent text-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                  )}
                >
                  <div className="w-3 h-3 rounded-sm shrink-0" style={{ backgroundColor: p.color_hex }} />
                  <span className="flex-1 text-left truncate">{p.name}</span>
                  {count > 0 && <span className="text-[10px] text-muted-foreground">{count}</span>}
                </button>
              )
            })}
            {projects.length === 0 && (
              <button onClick={() => setCreateProjectOpen(true)} className="text-[11px] text-muted-foreground hover:text-foreground px-2.5 py-1 transition-colors">
                + Create a project
              </button>
            )}
          </div>
        </div>

        {/* Labels */}
        <div className="px-3 pt-3 pb-4">
          <div className="flex items-center justify-between px-2 mb-2">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Labels</p>
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
                + Create a label
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* ═══ CENTER: Task List / Board ═══ */}
      <div className={cn('flex-1 flex flex-col min-w-0 overflow-hidden', selectedTaskId && 'hidden lg:flex')}>
        {/* Header */}
        <div className="px-4 md:px-6 pt-4 md:pt-6 pb-3 space-y-3 shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl lg:text-2xl font-bold tracking-tight">{currentViewLabel}</h1>
              <p className="text-xs text-muted-foreground mt-0.5">{currentViewDesc}</p>
            </div>
            <Button
              onClick={() => setCreateOpen(true)}
              className="bg-[#3DD68C] text-black hover:bg-[#3DD68C]/90 gap-1.5 font-semibold text-xs h-8 shadow-lg shadow-[#3DD68C]/10"
            >
              <Plus className="w-3.5 h-3.5" /> New task
            </Button>
          </div>

          {/* Mobile smart view tabs */}
          <div className="md:hidden flex items-center gap-1 overflow-x-auto pb-1">
            {SMART_VIEWS.map(view => {
              const active = smartView === view.id && !selectedProjectId && !selectedLabelId
              return (
                <button
                  key={view.id}
                  onClick={() => setSmartView(view.id)}
                  className={cn(
                    'px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all shrink-0',
                    active ? 'bg-[#3DD68C]/10 text-[#3DD68C] ring-1 ring-[#3DD68C]/20' : 'bg-secondary text-muted-foreground'
                  )}
                >
                  {view.label}
                </button>
              )
            })}
          </div>

          {/* Toolbar: Search + Sort + Group + View + Priority */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative flex-1 min-w-[140px] max-w-xs">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <Input
                placeholder="Search..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-8 bg-secondary/50 border-0 focus-visible:ring-1 focus-visible:ring-[#3DD68C]/30 h-8 text-xs"
              />
            </div>

            {/* Sort */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs text-muted-foreground hover:text-foreground hover:bg-accent transition-all">
                  <ArrowUpDown className="w-3.5 h-3.5" /> Sort
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-40">
                <DropdownMenuLabel className="text-[10px]">Sort by</DropdownMenuLabel>
                <DropdownMenuRadioGroup value={sortBy} onValueChange={v => setSortBy(v as SortBy)}>
                  {SORT_OPTIONS.map(o => (
                    <DropdownMenuRadioItem key={o.value} value={o.value} className="text-xs">{o.label}</DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
                <DropdownMenuSeparator />
                <DropdownMenuRadioGroup value={sortDirection} onValueChange={v => setSortDirection(v as 'asc' | 'desc')}>
                  <DropdownMenuRadioItem value="asc" className="text-xs">Ascending</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="desc" className="text-xs">Descending</DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Group */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className={cn(
                  'flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs transition-all',
                  groupBy !== 'none' ? 'bg-[#3DD68C]/10 text-[#3DD68C]' : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                )}>
                  <Group className="w-3.5 h-3.5" /> Group
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
                  priorityFilter.length > 0 ? 'bg-[#3DD68C]/10 text-[#3DD68C]' : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                )}>
                  <Flag className="w-3.5 h-3.5" /> Priority
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
                    <div className={cn('w-3.5 h-3.5 rounded border flex items-center justify-center', priorityFilter.includes(p) ? 'bg-[#3DD68C] border-[#3DD68C]' : 'border-border')}>
                      {priorityFilter.includes(p) && <span className="text-[8px] text-black font-bold">✓</span>}
                    </div>
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: PRIORITY_LABELS[p].color }} />
                    {PRIORITY_LABELS[p].label}
                  </button>
                ))}
                {priorityFilter.length > 0 && (
                  <>
                    <div className="border-t border-border my-1" />
                    <button onClick={() => setPriorityFilter([])} className="w-full px-2 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-accent rounded transition-colors">
                      Clear
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

          {/* Quick add bar */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Plus className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <Input
                value={quickAddValue}
                onChange={e => setQuickAddValue(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleQuickAdd()}
                placeholder={smartView === 'today' ? 'Quick add task for today... press Enter' : 'Quick add task... press Enter'}
                className="pl-8 bg-secondary/30 border border-dashed border-border focus-visible:border-solid focus-visible:ring-1 focus-visible:ring-[#3DD68C]/30 h-9 text-sm"
              />
            </div>
          </div>
        </div>

        {/* ─── List view ─── */}
        {viewMode === 'list' && (
          <div className="flex-1 overflow-y-auto px-4 md:px-6 pb-6">
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
                        onToggle={() => toggleTask(task.id)}
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
          <div className="flex-1 overflow-x-auto px-4 md:px-6 pb-6">
            <div className="flex gap-4 h-full min-w-[700px]">
              {boardColumns.map(col => {
                const Icon = col.icon
                return (
                  <div key={col.status} className="flex-1 flex flex-col min-w-[220px]">
                    <div className="flex items-center gap-2 px-1 mb-3">
                      <Icon className="w-4 h-4" style={{ color: col.color }} />
                      <h3 className="text-xs font-semibold uppercase tracking-wider">{col.title}</h3>
                      <span className="text-[10px] text-muted-foreground bg-secondary px-1.5 py-0.5 rounded-full">{col.tasks.length}</span>
                    </div>
                    <div className="flex-1 bg-secondary/20 rounded-xl border border-dashed border-border/50 p-2 space-y-2 overflow-y-auto">
                      {col.tasks.map(task => (
                        <button
                          key={task.id}
                          onClick={() => setSelectedTaskId(task.id)}
                          className={cn(
                            'w-full text-left card-elevated rounded-lg p-3 space-y-2 transition-all hover:scale-[1.01]',
                            selectedTaskId === task.id && 'ring-1 ring-[#3DD68C]/30'
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
                        </button>
                      ))}
                      {col.tasks.length === 0 && (
                        <div className="flex items-center justify-center h-16 text-[11px] text-muted-foreground">
                          No tasks
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* ═══ RIGHT: Task Detail Panel ═══ */}
      {selectedTaskId && (
        <>
          {/* Desktop: inline panel */}
          <div className="hidden lg:block border-l border-border bg-background shrink-0 w-[380px] overflow-hidden">
            <TaskDetailSheet taskId={selectedTaskId} onClose={() => setSelectedTaskId(null)} />
          </div>
          {/* Mobile: overlay */}
          <div className="lg:hidden fixed inset-0 z-50 bg-background">
            <TaskDetailSheet taskId={selectedTaskId} onClose={() => setSelectedTaskId(null)} />
          </div>
        </>
      )}

      {/* ═══ Create Task Sheet ═══ */}
      <Sheet open={createOpen} onOpenChange={setCreateOpen}>
        <SheetContent className="w-full sm:max-w-md p-0 bg-background border-l border-border">
          <SheetHeader className="px-6 py-4 border-b border-border">
            <SheetTitle className="flex items-center gap-2 text-base">
              <Plus className="w-4 h-4 text-[#3DD68C]" /> New task
            </SheetTitle>
          </SheetHeader>
          <div className="px-6 py-5 space-y-5">
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Title</Label>
              <Input placeholder="What needs to be done?" value={newTitle} onChange={e => setNewTitle(e.target.value)} autoFocus className="bg-secondary/50 border-0 h-10" />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Note</Label>
              <Textarea placeholder="Add details..." value={newNote} onChange={e => setNewNote(e.target.value)} rows={3} className="bg-secondary/50 border-0 resize-none" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Due date</Label>
                <Input type="date" value={newDueDate} onChange={e => setNewDueDate(e.target.value)} className="bg-secondary/50 border-0 h-9 [color-scheme:dark]" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Priority</Label>
                <Select value={String(newPriority)} onValueChange={v => setNewPriority(Number(v))}>
                  <SelectTrigger className="bg-secondary/50 border-0 h-9"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {[1,2,3,4].map(p => (
                      <SelectItem key={p} value={String(p)}>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: PRIORITY_LABELS[p].color }} />
                          {PRIORITY_LABELS[p].label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Recurrence</Label>
              <Select value={newRecurrence} onValueChange={(v) => setNewRecurrence(v as typeof newRecurrence)}>
                <SelectTrigger className="bg-secondary/50 border-0 h-9"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleCreate} disabled={!newTitle.trim()} className="w-full bg-[#3DD68C] text-black hover:bg-[#3DD68C]/90 font-semibold h-10 mt-2">
              Create task
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      {/* ═══ Create Project Dialog ═══ */}
      <Dialog open={createProjectOpen} onOpenChange={setCreateProjectOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Create project</DialogTitle></DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Name</Label>
              <Input placeholder="e.g. Work, Personal..." value={newProjectName} onChange={e => setNewProjectName(e.target.value)} autoFocus className="bg-secondary/50 border-0 h-10" />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Color</Label>
              <div className="flex flex-wrap gap-2">
                {COLORS.map(c => (
                  <button key={c} onClick={() => setNewProjectColor(c)}
                    className={cn('w-7 h-7 rounded-full transition-all', newProjectColor === c && 'ring-2 ring-white ring-offset-2 ring-offset-background scale-110')}
                    style={{ backgroundColor: c }} />
                ))}
              </div>
            </div>
            <Button onClick={handleCreateProject} disabled={!newProjectName.trim()} className="w-full bg-[#3DD68C] text-black hover:bg-[#3DD68C]/90 font-semibold h-10">
              Create project
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ═══ Create Label Dialog ═══ */}
      <Dialog open={createLabelOpen} onOpenChange={setCreateLabelOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Create label</DialogTitle></DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Name</Label>
              <Input placeholder="e.g. Urgent, Design, Bug..." value={newLabelName} onChange={e => setNewLabelName(e.target.value)} autoFocus className="bg-secondary/50 border-0 h-10" />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Color</Label>
              <div className="flex flex-wrap gap-2">
                {COLORS.map(c => (
                  <button key={c} onClick={() => setNewLabelColor(c)}
                    className={cn('w-7 h-7 rounded-full transition-all', newLabelColor === c && 'ring-2 ring-white ring-offset-2 ring-offset-background scale-110')}
                    style={{ backgroundColor: c }} />
                ))}
              </div>
            </div>
            <Button onClick={handleCreateLabel} disabled={!newLabelName.trim()} className="w-full bg-[#3DD68C] text-black hover:bg-[#3DD68C]/90 font-semibold h-10">
              Create label
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// ─── Task Row Component ───────────────────────────────────
function TaskRow({
  task, subtaskCount, subtaskDone, labels, isSelected, onToggle, onSelect, onDelete
}: {
  task: Task
  subtaskCount: number
  subtaskDone: number
  labels: { id: string; name: string; color_hex: string }[]
  isSelected: boolean
  onToggle: () => void
  onSelect: () => void
  onDelete: () => void
}) {
  const isOverdue = task.due_date && isDueOverdue(task.due_date) && !task.is_completed

  return (
    <div
      className={cn(
        'flex items-start gap-3 px-4 py-3 hover:bg-accent/30 transition-colors group cursor-pointer',
        isSelected && 'bg-[#3DD68C]/5 border-l-2 border-l-[#3DD68C]'
      )}
      onClick={onSelect}
    >
      <button onClick={(e) => { e.stopPropagation(); onToggle() }} className="mt-0.5 shrink-0">
        <div className={cn(
          'w-[18px] h-[18px] rounded-full border-2 flex items-center justify-center transition-all',
          task.is_completed
            ? 'border-[#3DD68C] bg-[#3DD68C] shadow-sm shadow-[#3DD68C]/20'
            : 'border-border hover:border-muted-foreground'
        )}>
          {task.is_completed && <span className="text-black text-[9px] font-bold">✓</span>}
        </div>
      </button>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className={cn('text-sm font-medium leading-snug truncate', task.is_completed && 'line-through text-muted-foreground')}>{task.title}</p>
          <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: PRIORITY_LABELS[task.priority].color }} />
        </div>

        <div className="flex items-center gap-2 mt-1 flex-wrap">
          {task.due_date && (
            <span className={cn('text-[10px] flex items-center gap-1', isOverdue ? 'text-red-400' : isDueToday(task.due_date) ? 'text-[#3DD68C]' : 'text-muted-foreground')}>
              <Clock className="w-3 h-3" />
              {isOverdue && <AlertCircle className="w-2.5 h-2.5" />}
              {isDueToday(task.due_date) ? 'Today' : isDueTomorrow(task.due_date) ? 'Tomorrow' : formatDueDate(task.due_date)}
            </span>
          )}
          {task.recurrence !== 'none' && (
            <span className="text-[10px] text-muted-foreground bg-secondary px-1.5 py-0.5 rounded">🔄 {task.recurrence}</span>
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
        className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive shrink-0 mt-0.5"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  )
}
