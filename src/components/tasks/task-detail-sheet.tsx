'use client'

import { useState, useEffect, useRef } from 'react'
import { useTasksStore } from '@/lib/store/tasks-store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { PRIORITY_LABELS } from '@/lib/constants'
import {
  X, Trash2, Plus, Calendar, Flag, RefreshCw, Tag, FolderOpen,
  CheckCircle2, Circle, Clock, ArrowRightCircle, ListTodo,
  ChevronLeft
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import type { Task, RecurrenceRule, RecurrenceType } from '@/lib/types/database'
import { RecurrencePicker } from '@/components/tasks/recurrence-picker'

interface Props {
  taskId: string
  onClose: () => void
}

const STATUS_OPTIONS = [
  { value: 'todo', label: 'To Do', icon: Circle, color: '#71717a' },
  { value: 'doing', label: 'In Progress', icon: ArrowRightCircle, color: '#60a5fa' },
  { value: 'done', label: 'Done', icon: CheckCircle2, color: '#3DD68C' },
] as const

// Parse due date safely: "2026-01-25" or full ISO
function toDueDateString(d: string | null | undefined): string {
  if (!d) return ''
  if (d.length >= 10) return d.substring(0, 10) // "YYYY-MM-DD"
  return d
}

export function TaskDetailSheet({ taskId, onClose }: Props) {
  const {
    tasks, labels, projects, updateTask, deleteTask, toggleTask,
    createTask, getLabelsForTask, getProjectsForTask, getSubtasks,
    addLabelToTask, removeLabelFromTask, addProjectToTask, removeProjectFromTask,
  } = useTasksStore()

  const task = tasks.find(t => t.id === taskId)
  const subtasks = getSubtasks(taskId)
  const taskLabels = getLabelsForTask(taskId)
  const taskProjects = getProjectsForTask(taskId)

  const [title, setTitle] = useState('')
  const [note, setNote] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [priority, setPriority] = useState(4)
  const [status, setStatus] = useState<'todo' | 'doing' | 'done'>('todo')
  const [recurrence, setRecurrence] = useState<RecurrenceType>('none')
  const [recurrenceRule, setRecurrenceRule] = useState<RecurrenceRule | null>(null)
  const [newSubtask, setNewSubtask] = useState('')
  const [showLabelPicker, setShowLabelPicker] = useState(false)
  const [showProjectPicker, setShowProjectPicker] = useState(false)

  const titleRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (task) {
      setTitle(task.title)
      setNote(task.note ?? '')
      setDueDate(toDueDateString(task.due_date))
      setPriority(task.priority)
      setStatus(task.status)
      setRecurrence(task.recurrence)
      setRecurrenceRule(task.recurrence_rule as RecurrenceRule | null)
      setShowLabelPicker(false)
      setShowProjectPicker(false)
    }
  }, [task])

  if (!task) return null

  const saveField = (field: string, value: unknown) => {
    updateTask(taskId, { [field]: value })
  }

  const handleAddSubtask = async () => {
    if (!newSubtask.trim()) return
    await createTask({
      title: newSubtask.trim(),
      parent_task_id: taskId,
      priority: task.priority,
    })
    setNewSubtask('')
  }

  const handleDelete = async () => {
    await deleteTask(taskId)
    onClose()
  }

  const handleDueDateChange = (value: string) => {
    setDueDate(value)
    // Store as "YYYY-MM-DD" string (no time component avoids timezone issues)
    saveField('due_date', value || null)
  }

  const handleClearDueDate = () => {
    setDueDate('')
    saveField('due_date', null)
  }

  const assignedLabelIds = new Set(taskLabels.map(l => l.id))
  const assignedProjectIds = new Set(taskProjects.map(p => p.id))
  const unassignedLabels = labels.filter(l => !assignedLabelIds.has(l.id))
  const unassignedProjects = projects.filter(p => !assignedProjectIds.has(p.id))

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-border shrink-0">
        <div className="flex items-center gap-2">
          {/* Mobile back button */}
          <button onClick={onClose} className="lg:hidden text-muted-foreground hover:text-foreground transition-colors p-1 rounded-md hover:bg-accent mr-1">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => toggleTask(taskId)}
            className="shrink-0"
          >
            <div className={cn(
              'w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all',
              task.is_completed
                ? 'border-[#3DD68C] bg-[#3DD68C]'
                : 'border-border hover:border-muted-foreground'
            )}>
              {task.is_completed && <span className="text-black text-[10px] font-bold">✓</span>}
            </div>
          </button>
          <span className="text-xs text-muted-foreground">
            {task.is_completed ? 'Completed' : STATUS_OPTIONS.find(s => s.value === task.status)?.label}
          </span>
        </div>
        <button onClick={onClose} className="hidden lg:block text-muted-foreground hover:text-foreground transition-colors p-1 rounded-md hover:bg-accent">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Scrollable content */}
      <ScrollArea className="flex-1">
        <div className="px-5 py-4 space-y-5">
          {/* Title */}
          <input
            ref={titleRef}
            value={title}
            onChange={e => setTitle(e.target.value)}
            onBlur={() => title.trim() && title !== task.title && saveField('title', title.trim())}
            onKeyDown={e => e.key === 'Enter' && (e.target as HTMLInputElement).blur()}
            className="text-lg font-semibold bg-transparent w-full outline-none placeholder:text-muted-foreground"
            placeholder="Task title"
          />

          {/* Status */}
          <div className="space-y-2">
            <Label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Status</Label>
            <div className="flex gap-1.5">
              {STATUS_OPTIONS.map(opt => {
                const Icon = opt.icon
                const active = status === opt.value
                return (
                  <button
                    key={opt.value}
                    onClick={() => {
                      setStatus(opt.value)
                      saveField('status', opt.value)
                      if (opt.value === 'done') {
                        saveField('is_completed', true)
                        saveField('completed_at', new Date().toISOString())
                      } else {
                        saveField('is_completed', false)
                        saveField('completed_at', null)
                      }
                    }}
                    className={cn(
                      'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
                      active ? 'ring-1' : 'bg-secondary/50 text-muted-foreground hover:text-foreground'
                    )}
                    style={active ? {
                      backgroundColor: `${opt.color}12`,
                      color: opt.color,
                      boxShadow: `0 0 0 1px ${opt.color}30`,
                    } : undefined}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {opt.label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Priority */}
          <div className="space-y-2">
            <Label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Flag className="w-3 h-3" /> Priority
            </Label>
            <div className="flex gap-1">
              {[1, 2, 3, 4].map(p => (
                <button
                  key={p}
                  onClick={() => { setPriority(p); saveField('priority', p) }}
                  className={cn(
                    'flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all',
                    priority === p ? 'ring-1' : 'bg-secondary/50 text-muted-foreground hover:text-foreground'
                  )}
                  style={priority === p ? {
                    backgroundColor: `${PRIORITY_LABELS[p].color}12`,
                    color: PRIORITY_LABELS[p].color,
                    boxShadow: `0 0 0 1px ${PRIORITY_LABELS[p].color}30`,
                  } : undefined}
                >
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: PRIORITY_LABELS[p].color }} />
                  {PRIORITY_LABELS[p].label}
                </button>
              ))}
            </div>
          </div>

          {/* Due date */}
          <div className="space-y-2">
            <Label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Calendar className="w-3 h-3" /> Due date
            </Label>
            <div className="flex items-center gap-2">
              <Input
                type="date"
                value={dueDate}
                onChange={e => handleDueDateChange(e.target.value)}
                className="bg-secondary/50 border-0 h-8 text-xs flex-1 [color-scheme:dark]"
              />
              {dueDate && (
                <button
                  onClick={handleClearDueDate}
                  className="text-xs text-muted-foreground hover:text-destructive transition-colors px-2 py-1 rounded hover:bg-accent"
                >
                  Clear
                </button>
              )}
            </div>
            {/* Quick date buttons */}
            <div className="flex gap-1.5 flex-wrap">
              {[
                { label: 'Today', days: 0 },
                { label: 'Tomorrow', days: 1 },
                { label: 'In 3 days', days: 3 },
                { label: 'Next week', days: 7 },
              ].map(({ label, days }) => {
                const date = new Date()
                date.setDate(date.getDate() + days)
                const dateStr = format(date, 'yyyy-MM-dd')
                const isActive = dueDate === dateStr
                return (
                  <button
                    key={label}
                    onClick={() => handleDueDateChange(dateStr)}
                    className={cn(
                      'px-2 py-1 rounded-md text-[10px] font-medium transition-all',
                      isActive ? 'bg-[#3DD68C]/10 text-[#3DD68C] ring-1 ring-[#3DD68C]/20' : 'bg-secondary/50 text-muted-foreground hover:text-foreground'
                    )}
                  >
                    {label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Recurrence */}
          <div className="space-y-2">
            <Label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <RefreshCw className="w-3 h-3" /> Recurrence
            </Label>
            <RecurrencePicker
              recurrence={recurrence}
              recurrenceRule={recurrenceRule}
              onChange={(r, rule) => {
                setRecurrence(r)
                setRecurrenceRule(rule)
                saveField('recurrence', r)
                saveField('recurrence_rule', rule)
              }}
              variant="full"
            />
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Notes</Label>
            <Textarea
              value={note}
              onChange={e => setNote(e.target.value)}
              onBlur={() => note !== (task.note ?? '') && saveField('note', note || null)}
              placeholder="Add notes, details, links..."
              rows={4}
              className="bg-secondary/50 border-0 resize-none text-sm"
            />
          </div>

          {/* Subtasks */}
          <div className="space-y-2">
            <Label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <ListTodo className="w-3 h-3" /> Subtasks
              {subtasks.length > 0 && (
                <span className="text-[10px] bg-secondary px-1.5 py-0.5 rounded-full ml-1">
                  {subtasks.filter(s => s.is_completed).length}/{subtasks.length}
                </span>
              )}
            </Label>

            {/* Progress bar */}
            {subtasks.length > 0 && (
              <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#3DD68C] transition-all duration-300 rounded-full"
                  style={{ width: `${(subtasks.filter(s => s.is_completed).length / subtasks.length) * 100}%` }}
                />
              </div>
            )}

            {/* Subtask list */}
            {subtasks.length > 0 && (
              <div className="space-y-0.5">
                {subtasks.map(st => (
                  <div key={st.id} className="flex items-center gap-2 py-1.5 px-2 rounded-lg hover:bg-accent/30 group transition-colors">
                    <button onClick={() => toggleTask(st.id)} className="shrink-0">
                      <div className={cn(
                        'w-4 h-4 rounded-full border-[1.5px] flex items-center justify-center transition-all',
                        st.is_completed ? 'border-[#3DD68C] bg-[#3DD68C]' : 'border-border hover:border-muted-foreground'
                      )}>
                        {st.is_completed && <span className="text-black text-[8px] font-bold">✓</span>}
                      </div>
                    </button>
                    <span className={cn('text-sm flex-1', st.is_completed && 'line-through text-muted-foreground')}>{st.title}</span>
                    <button
                      onClick={() => deleteTask(st.id)}
                      className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Add subtask */}
            <div className="flex gap-2">
              <Input
                value={newSubtask}
                onChange={e => setNewSubtask(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAddSubtask()}
                placeholder="Add subtask..."
                className="bg-secondary/50 border-0 h-8 text-xs"
              />
              <Button variant="ghost" size="icon" onClick={handleAddSubtask} disabled={!newSubtask.trim()} className="h-8 w-8 shrink-0">
                <Plus className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>

          {/* Labels */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Tag className="w-3 h-3" /> Labels
              </Label>
              {unassignedLabels.length > 0 && (
                <button
                  onClick={() => setShowLabelPicker(!showLabelPicker)}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {taskLabels.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {taskLabels.map(label => (
                  <span key={label.id}
                    className="text-[10px] px-2 py-0.5 rounded-full font-medium flex items-center gap-1 cursor-pointer hover:opacity-80 transition-opacity"
                    style={{ backgroundColor: `${label.color_hex}12`, color: label.color_hex }}
                    onClick={() => removeLabelFromTask(taskId, label.id)}
                    title="Click to remove"
                  >
                    {label.name}
                    <X className="w-2.5 h-2.5" />
                  </span>
                ))}
              </div>
            )}

            {showLabelPicker && unassignedLabels.length > 0 && (
              <div className="flex flex-wrap gap-1.5 p-2 rounded-lg bg-secondary/30 border border-border">
                {unassignedLabels.map(label => (
                  <button key={label.id}
                    onClick={() => { addLabelToTask(taskId, label.id); setShowLabelPicker(false) }}
                    className="text-[10px] px-2 py-1 rounded-full font-medium transition-all hover:scale-105"
                    style={{ backgroundColor: `${label.color_hex}12`, color: label.color_hex }}>
                    + {label.name}
                  </button>
                ))}
              </div>
            )}

            {labels.length === 0 && (
              <p className="text-[11px] text-muted-foreground">No labels created. Create labels from the sidebar.</p>
            )}
          </div>

          {/* Projects */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <FolderOpen className="w-3 h-3" /> Projects
              </Label>
              {unassignedProjects.length > 0 && (
                <button
                  onClick={() => setShowProjectPicker(!showProjectPicker)}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {taskProjects.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {taskProjects.map(project => (
                  <span key={project.id}
                    className="text-[10px] px-2 py-0.5 rounded-full font-medium flex items-center gap-1 cursor-pointer hover:opacity-80 transition-opacity"
                    style={{ backgroundColor: `${project.color_hex}12`, color: project.color_hex }}
                    onClick={() => removeProjectFromTask(taskId, project.id)}
                    title="Click to remove"
                  >
                    {project.name}
                    <X className="w-2.5 h-2.5" />
                  </span>
                ))}
              </div>
            )}

            {showProjectPicker && unassignedProjects.length > 0 && (
              <div className="flex flex-wrap gap-1.5 p-2 rounded-lg bg-secondary/30 border border-border">
                {unassignedProjects.map(project => (
                  <button key={project.id}
                    onClick={() => { addProjectToTask(taskId, project.id); setShowProjectPicker(false) }}
                    className="text-[10px] px-2 py-1 rounded-full font-medium transition-all hover:scale-105"
                    style={{ backgroundColor: `${project.color_hex}12`, color: project.color_hex }}>
                    + {project.name}
                  </button>
                ))}
              </div>
            )}

            {projects.length === 0 && (
              <p className="text-[11px] text-muted-foreground">No projects created. Create projects from the sidebar.</p>
            )}
          </div>

          {/* Meta info */}
          <div className="space-y-1 text-[11px] text-muted-foreground pt-2 border-t border-border">
            <p>Created {format(new Date(task.created_at), 'MMM d, yyyy')}</p>
            {task.completed_at && <p>Completed {format(new Date(task.completed_at), 'MMM d, yyyy')}</p>}
          </div>

          {/* Delete */}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" className="w-full text-destructive hover:text-destructive hover:bg-destructive/10 gap-2 text-xs">
                <Trash2 className="w-3.5 h-3.5" /> Delete task
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete task?</AlertDialogTitle>
                <AlertDialogDescription>This will permanently delete this task and all subtasks.</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} className="bg-destructive text-white hover:bg-destructive/90">Delete</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </ScrollArea>
    </div>
  )
}
