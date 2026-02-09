'use client'

import { useEffect, useMemo, useState } from 'react'
import { useTasksStore } from '@/lib/store/tasks-store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Plus, Search, Trash2, Calendar, List, Columns3, AlertTriangle, Clock } from 'lucide-react'
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

  // Sections for Inbox
  const sections = useMemo(() => {
    const overdue = filteredTasks.filter(t => !t.is_completed && t.due_date && isBefore(new Date(t.due_date), today))
    const todayTasks = filteredTasks.filter(t => !t.is_completed && t.due_date && isToday(new Date(t.due_date)))
    const tomorrow = filteredTasks.filter(t => !t.is_completed && t.due_date && isTomorrow(new Date(t.due_date)))
    const thisWeek = filteredTasks.filter(t => !t.is_completed && t.due_date && isThisWeek(new Date(t.due_date)) && !isToday(new Date(t.due_date)) && !isTomorrow(new Date(t.due_date)) && !isBefore(new Date(t.due_date), today))
    const later = filteredTasks.filter(t => !t.is_completed && t.due_date && !isThisWeek(new Date(t.due_date)) && !isBefore(new Date(t.due_date), today))
    const noDue = filteredTasks.filter(t => !t.is_completed && !t.due_date)
    const done = filteredTasks.filter(t => t.is_completed)
    return [
      { title: '⚠️ Overdue', tasks: overdue, color: '#FF5252' },
      { title: '📅 Today', tasks: todayTasks, color: '#3DD68C' },
      { title: '📆 Tomorrow', tasks: tomorrow, color: '#5B9FFF' },
      { title: '🗓️ This week', tasks: thisWeek, color: '#B084FF' },
      { title: '📋 Later', tasks: later, color: '#FF9F5A' },
      { title: '📥 No date', tasks: noDue, color: '#6B7280' },
      { title: '✅ Done', tasks: done, color: '#6B7280' },
    ].filter(s => s.tasks.length > 0)
  }, [filteredTasks, today])

  // Board columns
  const boardColumns = useMemo(() => [
    { title: 'To Do', status: 'todo' as const, tasks: filteredTasks.filter(t => t.status === 'todo') },
    { title: 'In Progress', status: 'doing' as const, tasks: filteredTasks.filter(t => t.status === 'doing') },
    { title: 'Done', status: 'done' as const, tasks: filteredTasks.filter(t => t.status === 'done') },
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

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-pulse text-muted-foreground">Loading tasks...</div></div>

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Tasks</h1>
        <Button onClick={() => setCreateOpen(true)} className="bg-[#3DD68C] text-black hover:bg-[#3DD68C]/90 gap-2">
          <Plus className="w-4 h-4" /> <span className="hidden sm:inline">New task</span>
        </Button>
      </div>

      {/* Search + Tabs + View mode */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search tasks..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-9" />
        </div>
        <div className="flex items-center gap-2">
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'inbox' | 'projects')}>
            <TabsList>
              <TabsTrigger value="inbox">Inbox</TabsTrigger>
              <TabsTrigger value="projects">Projects</TabsTrigger>
            </TabsList>
          </Tabs>
          {activeTab === 'inbox' && (
            <div className="flex items-center bg-secondary rounded-lg p-0.5 ml-auto">
              {([{ m: 'list' as const, i: List }, { m: 'calendar' as const, i: Calendar }, { m: 'board' as const, i: Columns3 }]).map(({ m, i: Icon }) => (
                <button key={m} onClick={() => setViewMode(m)} className={cn('p-1.5 rounded-md transition-colors', viewMode === m ? 'bg-card text-foreground' : 'text-muted-foreground hover:text-foreground')}>
                  <Icon className="w-4 h-4" />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Inbox - List view */}
      {activeTab === 'inbox' && viewMode === 'list' && (
        <div className="space-y-4">
          {sections.map(section => (
            <div key={section.title}>
              <h3 className="text-sm font-semibold text-muted-foreground mb-2">{section.title}</h3>
              <div className="bg-card rounded-xl border border-border divide-y divide-border">
                {section.tasks.map(task => (
                  <TaskRow key={task.id} task={task} subtasks={subtasksFor(task.id)} onToggle={() => toggleTask(task.id)} onDelete={() => deleteTask(task.id)} />
                ))}
              </div>
            </div>
          ))}
          {sections.length === 0 && (
            <div className="text-center py-16 text-muted-foreground">No tasks yet</div>
          )}
        </div>
      )}

      {/* Inbox - Board view */}
      {activeTab === 'inbox' && viewMode === 'board' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {boardColumns.map(col => (
            <div key={col.status} className="space-y-2">
              <h3 className="text-sm font-semibold text-muted-foreground">{col.title} ({col.tasks.length})</h3>
              <div className="bg-card/50 rounded-xl border border-border p-2 min-h-[200px] space-y-2">
                {col.tasks.map(task => (
                  <div key={task.id} className="bg-card rounded-lg border border-border p-3 space-y-1">
                    <p className="text-sm font-medium">{task.title}</p>
                    {task.due_date && <p className="text-xs text-muted-foreground">{format(new Date(task.due_date), 'MMM d')}</p>}
                    <Badge variant="outline" className="text-[10px]" style={{ borderColor: PRIORITY_LABELS[task.priority].color, color: PRIORITY_LABELS[task.priority].color }}>
                      {PRIORITY_LABELS[task.priority].label}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Inbox - Calendar view */}
      {activeTab === 'inbox' && viewMode === 'calendar' && (
        <div className="text-center py-16 text-muted-foreground">
          <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>Calendar view coming soon</p>
        </div>
      )}

      {/* Projects tab */}
      {activeTab === 'projects' && (
        <div className="space-y-3">
          {projects.length === 0 && <p className="text-center py-16 text-muted-foreground">No projects yet. Create one from the task creation form.</p>}
          {projects.map(p => (
            <div key={p.id} className="bg-card rounded-xl border border-border p-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${p.color_hex}15` }}>
                  <span style={{ color: p.color_hex }} className="text-lg">📁</span>
                </div>
                <div className="flex-1">
                  <p className="font-semibold">{p.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {tasks.filter(t => {
                      const links = useTasksStore.getState().projectLinks
                      return links.some(l => l.task_id === t.id && l.project_id === p.id)
                    }).length} tasks
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Task Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>New task</DialogTitle></DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input placeholder="Task title" value={newTitle} onChange={e => setNewTitle(e.target.value)} autoFocus />
            </div>
            <div className="space-y-2">
              <Label>Note</Label>
              <Textarea placeholder="Description (optional)" value={newNote} onChange={e => setNewNote(e.target.value)} rows={3} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Due date</Label>
                <Input type="date" value={newDueDate} onChange={e => setNewDueDate(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Priority</Label>
                <Select value={String(newPriority)} onValueChange={v => setNewPriority(Number(v))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {[1,2,3,4].map(p => (
                      <SelectItem key={p} value={String(p)}>
                        <span style={{ color: PRIORITY_LABELS[p].color }}>{PRIORITY_LABELS[p].label}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Recurrence</Label>
              <Select value={newRecurrence} onValueChange={(v) => setNewRecurrence(v as typeof newRecurrence)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleCreate} disabled={!newTitle.trim()} className="w-full bg-[#3DD68C] text-black hover:bg-[#3DD68C]/90">
              Create task
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Task row component
function TaskRow({ task, subtasks, onToggle, onDelete }: { task: Task; subtasks: Task[]; onToggle: () => void; onDelete: () => void }) {
  return (
    <div className="flex items-start gap-3 px-4 py-3 hover:bg-secondary/30 transition-colors group">
      <button onClick={onToggle} className="mt-0.5 shrink-0">
        <div className={cn(
          'w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors',
          task.is_completed ? 'border-[#3DD68C] bg-[#3DD68C]' : 'border-muted-foreground/30'
        )}>
          {task.is_completed && <span className="text-black text-[10px] font-bold">✓</span>}
        </div>
      </button>
      <div className="flex-1 min-w-0">
        <p className={cn('text-sm font-medium', task.is_completed && 'line-through text-muted-foreground')}>{task.title}</p>
        <div className="flex items-center gap-2 mt-0.5">
          {task.due_date && (
            <span className="text-[10px] text-muted-foreground flex items-center gap-1">
              <Clock className="w-3 h-3" /> {format(new Date(task.due_date), 'MMM d')}
            </span>
          )}
          <Badge variant="outline" className="text-[9px] px-1 py-0" style={{ borderColor: PRIORITY_LABELS[task.priority].color, color: PRIORITY_LABELS[task.priority].color }}>
            {PRIORITY_LABELS[task.priority].label}
          </Badge>
          {task.recurrence !== 'none' && (
            <Badge variant="outline" className="text-[9px] px-1 py-0">🔄 {task.recurrence}</Badge>
          )}
        </div>
        {subtasks.length > 0 && (
          <div className="mt-1 pl-2 border-l-2 border-border space-y-1">
            {subtasks.map(st => (
              <p key={st.id} className={cn('text-xs', st.is_completed && 'line-through text-muted-foreground')}>{st.title}</p>
            ))}
          </div>
        )}
      </div>
      <button onClick={onDelete} className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive shrink-0">
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  )
}
