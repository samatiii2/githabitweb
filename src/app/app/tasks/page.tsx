'use client'

import { useEffect, useMemo, useState } from 'react'
import { useTasksStore } from '@/lib/store/tasks-store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, Search, Trash2, Calendar, List, Columns3, Clock, ArrowUpRight, Inbox, FolderOpen, AlertCircle, CheckCircle2 } from 'lucide-react'
import type { Task } from '@/lib/types/database'
import { cn } from '@/lib/utils'
import { PRIORITY_LABELS } from '@/lib/constants'
import { format, isToday, isTomorrow, isThisWeek, isBefore, startOfDay } from 'date-fns'

export default function TasksPage() {
  const {
    tasks, projects, labels, loading, activeTab, viewMode, searchQuery,
    setActiveTab, setViewMode, setSearchQuery,
    fetchAll, createTask, toggleTask, deleteTask,
  } = useTasksStore()
  const [createOpen, setCreateOpen] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newNote, setNewNote] = useState('')
  const [newPriority, setNewPriority] = useState(4)
  const [newDueDate, setNewDueDate] = useState('')
  const [newRecurrence, setNewRecurrence] = useState<'none' | 'daily' | 'weekly' | 'monthly'>('none')

  useEffect(() => { fetchAll() }, [fetchAll])

  const today = startOfDay(new Date())
  const parentTasks = useMemo(() => tasks.filter(t => !t.parent_task_id), [tasks])

  const filteredTasks = useMemo(() => {
    let result = parentTasks
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      result = result.filter(t => t.title.toLowerCase().includes(q))
    }
    return result
  }, [parentTasks, searchQuery])

  const sections = useMemo(() => {
    const overdue = filteredTasks.filter(t => !t.is_completed && t.due_date && isBefore(new Date(t.due_date), today))
    const todayTasks = filteredTasks.filter(t => !t.is_completed && t.due_date && isToday(new Date(t.due_date)))
    const tomorrow = filteredTasks.filter(t => !t.is_completed && t.due_date && isTomorrow(new Date(t.due_date)))
    const thisWeek = filteredTasks.filter(t => !t.is_completed && t.due_date && isThisWeek(new Date(t.due_date)) && !isToday(new Date(t.due_date)) && !isTomorrow(new Date(t.due_date)) && !isBefore(new Date(t.due_date), today))
    const later = filteredTasks.filter(t => !t.is_completed && t.due_date && !isThisWeek(new Date(t.due_date)) && !isBefore(new Date(t.due_date), today))
    const noDue = filteredTasks.filter(t => !t.is_completed && !t.due_date)
    const done = filteredTasks.filter(t => t.is_completed)
    return [
      { title: 'Overdue', tasks: overdue, icon: AlertCircle, color: '#ef4444' },
      { title: 'Today', tasks: todayTasks, icon: ArrowUpRight, color: '#3DD68C' },
      { title: 'Tomorrow', tasks: tomorrow, icon: Clock, color: '#60a5fa' },
      { title: 'This week', tasks: thisWeek, icon: Calendar, color: '#a78bfa' },
      { title: 'Later', tasks: later, icon: Calendar, color: '#fbbf24' },
      { title: 'No date', tasks: noDue, icon: Inbox, color: '#71717a' },
      { title: 'Completed', tasks: done, icon: CheckCircle2, color: '#71717a' },
    ].filter(s => s.tasks.length > 0)
  }, [filteredTasks, today])

  const boardColumns = useMemo(() => [
    { title: 'To Do', status: 'todo' as const, tasks: filteredTasks.filter(t => t.status === 'todo'), color: '#71717a' },
    { title: 'In Progress', status: 'doing' as const, tasks: filteredTasks.filter(t => t.status === 'doing'), color: '#60a5fa' },
    { title: 'Done', status: 'done' as const, tasks: filteredTasks.filter(t => t.status === 'done'), color: '#3DD68C' },
  ], [filteredTasks])

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

  const subtasksFor = (taskId: string) => tasks.filter(t => t.parent_task_id === taskId)

  // Stats
  const totalTasks = parentTasks.filter(t => !t.is_completed).length
  const completedToday = parentTasks.filter(t => t.is_completed && t.completed_at && isToday(new Date(t.completed_at))).length

  if (loading) return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="shimmer h-8 w-36 rounded-lg" />
      <div className="space-y-3">
        {[1,2,3,4].map(i => <div key={i} className="shimmer h-16 rounded-xl" />)}
      </div>
    </div>
  )

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">Tasks</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {totalTasks} active · {completedToday} completed today
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)} className="bg-[#3DD68C] text-black hover:bg-[#3DD68C]/90 gap-2 font-semibold shadow-lg shadow-[#3DD68C]/10">
          <Plus className="w-4 h-4" /> <span className="hidden sm:inline">New task</span>
        </Button>
      </div>

      {/* Search + Tabs + View mode */}
      <div className="flex flex-col md:flex-row gap-3 items-start md:items-center">
        <div className="relative flex-1 w-full md:max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="pl-9 bg-secondary/50 border-0 focus-visible:ring-1 focus-visible:ring-[#3DD68C]/30 h-9"
          />
        </div>

        <div className="flex items-center gap-3">
          {/* Tab pills */}
          <div className="flex items-center bg-secondary/80 rounded-lg p-0.5 border border-border/50">
            {[
              { value: 'inbox' as const, icon: Inbox, label: 'Inbox' },
              { value: 'projects' as const, icon: FolderOpen, label: 'Projects' },
            ].map(tab => (
              <button
                key={tab.value}
                onClick={() => setActiveTab(tab.value)}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all',
                  activeTab === tab.value
                    ? 'bg-card text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <tab.icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            ))}
          </div>

          {/* View mode */}
          {activeTab === 'inbox' && (
            <div className="flex items-center bg-secondary/80 rounded-lg p-0.5 border border-border/50">
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
                  <Icon className="w-4 h-4" />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Inbox - List view */}
      {activeTab === 'inbox' && viewMode === 'list' && (
        <div className="space-y-5">
          {sections.map(section => {
            const SectionIcon = section.icon
            return (
              <div key={section.title}>
                <div className="flex items-center gap-2 mb-2 px-1">
                  <SectionIcon className="w-4 h-4" style={{ color: section.color }} />
                  <h3 className="text-sm font-semibold" style={{ color: section.color }}>{section.title}</h3>
                  <span className="text-xs text-muted-foreground">({section.tasks.length})</span>
                </div>
                <div className="card-elevated rounded-xl divide-y divide-border overflow-hidden">
                  {section.tasks.map(task => (
                    <TaskRow key={task.id} task={task} subtasks={subtasksFor(task.id)} onToggle={() => toggleTask(task.id)} onDelete={() => deleteTask(task.id)} />
                  ))}
                </div>
              </div>
            )
          })}
          {sections.length === 0 && (
            <div className="text-center py-24 space-y-3">
              <div className="w-16 h-16 rounded-2xl bg-card border border-border flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8 text-muted-foreground/50" />
              </div>
              <p className="font-semibold">All clear!</p>
              <p className="text-sm text-muted-foreground">No tasks yet. Create one to get started.</p>
            </div>
          )}
        </div>
      )}

      {/* Inbox - Board view */}
      {activeTab === 'inbox' && viewMode === 'board' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {boardColumns.map(col => (
            <div key={col.status} className="space-y-3">
              <div className="flex items-center gap-2 px-1">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: col.color }} />
                <h3 className="text-sm font-semibold">{col.title}</h3>
                <span className="text-xs text-muted-foreground bg-secondary px-1.5 py-0.5 rounded-full">{col.tasks.length}</span>
              </div>
              <div className="bg-secondary/30 rounded-xl border border-border/50 p-2 min-h-[300px] space-y-2">
                {col.tasks.map(task => (
                  <div key={task.id} className="card-elevated rounded-lg p-3.5 space-y-2 hover:scale-[1.01] transition-all cursor-pointer">
                    <p className="text-sm font-medium leading-snug">{task.title}</p>
                    <div className="flex items-center gap-2">
                      {task.due_date && (
                        <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {format(new Date(task.due_date), 'MMM d')}
                        </span>
                      )}
                      <div
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ backgroundColor: PRIORITY_LABELS[task.priority].color }}
                        title={PRIORITY_LABELS[task.priority].label}
                      />
                    </div>
                    {task.recurrence !== 'none' && (
                      <span className="text-[10px] text-muted-foreground">🔄 {task.recurrence}</span>
                    )}
                  </div>
                ))}
                {col.tasks.length === 0 && (
                  <div className="flex items-center justify-center h-20 text-xs text-muted-foreground">
                    No tasks
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Inbox - Calendar view (removed, only list and board) */}
      {activeTab === 'inbox' && viewMode === 'calendar' && (
        <div className="text-center py-20 text-muted-foreground space-y-3">
          <Calendar className="w-12 h-12 mx-auto opacity-30" />
          <p className="text-sm">Calendar view coming soon</p>
        </div>
      )}

      {/* Projects tab */}
      {activeTab === 'projects' && (
        <div className="space-y-3">
          {projects.length === 0 && (
            <div className="text-center py-24 space-y-3">
              <div className="w-16 h-16 rounded-2xl bg-card border border-border flex items-center justify-center mx-auto">
                <FolderOpen className="w-8 h-8 text-muted-foreground/50" />
              </div>
              <p className="font-semibold">No projects yet</p>
              <p className="text-sm text-muted-foreground">Create a project to organize your tasks.</p>
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map(p => {
              const projectTasks = tasks.filter(t => {
                const links = useTasksStore.getState().projectLinks
                return links.some(l => l.task_id === t.id && l.project_id === p.id)
              })
              return (
                <div key={p.id} className="card-elevated rounded-xl p-5 space-y-3 hover:scale-[1.01] transition-all">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: `${p.color_hex}12` }}>
                      <FolderOpen className="w-5 h-5" style={{ color: p.color_hex }} />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-sm">{p.name}</p>
                      <p className="text-xs text-muted-foreground">{projectTasks.length} tasks</p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Create Task Sheet */}
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
              <Input placeholder="What needs to be done?" value={newTitle} onChange={e => setNewTitle(e.target.value)} autoFocus
                className="bg-secondary/50 border-0 h-10" />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Note</Label>
              <Textarea placeholder="Add details..." value={newNote} onChange={e => setNewNote(e.target.value)} rows={3}
                className="bg-secondary/50 border-0 resize-none" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Due date</Label>
                <Input type="date" value={newDueDate} onChange={e => setNewDueDate(e.target.value)} className="bg-secondary/50 border-0 h-9" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Priority</Label>
                <Select value={String(newPriority)} onValueChange={v => setNewPriority(Number(v))}>
                  <SelectTrigger className="bg-secondary/50 border-0 h-9">
                    <SelectValue />
                  </SelectTrigger>
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
            <Button onClick={handleCreate} disabled={!newTitle.trim()}
              className="w-full bg-[#3DD68C] text-black hover:bg-[#3DD68C]/90 font-semibold h-10 mt-4">
              Create task
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}

function TaskRow({ task, subtasks, onToggle, onDelete }: { task: Task; subtasks: Task[]; onToggle: () => void; onDelete: () => void }) {
  return (
    <div className="flex items-start gap-3 px-4 py-3 hover:bg-accent/30 transition-colors group">
      <button onClick={onToggle} className="mt-0.5 shrink-0">
        <div className={cn(
          'w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all',
          task.is_completed
            ? 'border-[#3DD68C] bg-[#3DD68C] shadow-sm shadow-[#3DD68C]/20'
            : 'border-border hover:border-muted-foreground'
        )}>
          {task.is_completed && <span className="text-black text-[10px] font-bold">✓</span>}
        </div>
      </button>
      <div className="flex-1 min-w-0">
        <p className={cn('text-sm font-medium leading-snug', task.is_completed && 'line-through text-muted-foreground')}>{task.title}</p>
        <div className="flex items-center gap-2 mt-1 flex-wrap">
          {task.due_date && (
            <span className={cn(
              'text-[11px] flex items-center gap-1',
              isBefore(new Date(task.due_date), startOfDay(new Date())) && !task.is_completed ? 'text-red-400' : 'text-muted-foreground'
            )}>
              <Clock className="w-3 h-3" /> {format(new Date(task.due_date), 'MMM d')}
            </span>
          )}
          <div
            className="w-1.5 h-1.5 rounded-full shrink-0"
            style={{ backgroundColor: PRIORITY_LABELS[task.priority].color }}
            title={PRIORITY_LABELS[task.priority].label}
          />
          {task.recurrence !== 'none' && (
            <span className="text-[10px] text-muted-foreground bg-secondary px-1.5 py-0.5 rounded">🔄 {task.recurrence}</span>
          )}
        </div>
        {subtasks.length > 0 && (
          <div className="mt-2 pl-3 border-l-2 border-border space-y-1">
            {subtasks.map(st => (
              <p key={st.id} className={cn('text-xs', st.is_completed && 'line-through text-muted-foreground')}>
                {st.is_completed ? '✓ ' : '○ '}{st.title}
              </p>
            ))}
          </div>
        )}
      </div>
      <button onClick={onDelete} className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive shrink-0 mt-0.5">
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  )
}
