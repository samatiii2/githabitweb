'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import { useTasksStore } from '@/lib/store/tasks-store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar as CalendarWidget } from '@/components/ui/calendar'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { PRIORITY_LABELS } from '@/lib/constants'
import {
  X, Trash2, Plus, Calendar, Flag, RefreshCw, Tag, FolderOpen,
  CheckCircle2, Circle, ArrowRightCircle, ListTodo,
  ChevronLeft, CalendarDays, Sun, Sofa, ArrowRight,
  Pencil, Check
} from 'lucide-react'
import { DynamicIcon } from '@/components/dynamic-icon'
import { cn } from '@/lib/utils'
import { format, addDays, nextSaturday, startOfWeek, addWeeks } from 'date-fns'
import type { Task, RecurrenceRule, RecurrenceType } from '@/lib/types/database'
import { RecurrencePicker } from '@/components/tasks/recurrence-picker'
import { recurrenceLabel } from '@/lib/utils/recurrence'

interface Props {
  taskId: string
  onClose: () => void
}

const STATUS_OPTIONS = [
  { value: 'todo', label: 'To Do', icon: Circle, color: '#71717a' },
  { value: 'doing', label: 'In Progress', icon: ArrowRightCircle, color: '#60a5fa' },
  { value: 'done', label: 'Done', icon: CheckCircle2, color: '#3DD68C' },
] as const

function toDueDateString(d: string | null | undefined): string {
  if (!d) return ''
  if (d.length >= 10) return d.substring(0, 10)
  return d
}

// ─── Quick date helpers ─────────────────────────────────
function getQuickDates() {
  const today = new Date()
  const tomorrow = addDays(today, 1)
  const weekend = nextSaturday(today)
  const nextWeekStart = startOfWeek(addWeeks(today, 1), { weekStartsOn: 1 })
  return [
    { label: 'Today', date: today, icon: CalendarDays, sublabel: format(today, 'EEE'), color: 'text-emerald-400' },
    { label: 'Tomorrow', date: tomorrow, icon: Sun, sublabel: format(tomorrow, 'EEE'), color: 'text-amber-400' },
    { label: 'This weekend', date: weekend, icon: Sofa, sublabel: format(weekend, 'EEE'), color: 'text-blue-400' },
    { label: 'Next week', date: nextWeekStart, icon: ArrowRight, sublabel: format(nextWeekStart, 'EEE d MMM'), color: 'text-purple-400' },
  ]
}

// ─── Due Date Picker (calendar + quick dates) ───────────
function DueDatePicker({ value, onChange, onClear }: { value: string; onChange: (v: string) => void; onClear: () => void }) {
  const [open, setOpen] = useState(false)
  const quickDates = useMemo(() => getQuickDates(), [])
  const selectedDate = value ? new Date(value + 'T12:00:00') : undefined

  const handleSelect = (date: Date) => {
    onChange(format(date, 'yyyy-MM-dd'))
    setOpen(false)
  }

  return (
    <div className="space-y-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            className={cn(
              'w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors border text-left',
              value
                ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-500'
                : 'border-border bg-secondary/50 text-muted-foreground hover:text-foreground hover:bg-secondary'
            )}
          >
            <CalendarDays className="w-4 h-4 shrink-0" />
            <span className="flex-1">{value ? format(new Date(value + 'T12:00:00'), 'EEEE, MMM d, yyyy') : 'No due date'}</span>
            {value && (
              <button
                onClick={(e) => { e.stopPropagation(); onClear(); }}
                className="text-muted-foreground hover:text-destructive transition-colors p-0.5 rounded hover:bg-accent"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-[280px] p-0" align="start" sideOffset={8}>
          <div className="p-2 space-y-0.5">
            {quickDates.map(opt => (
              <button
                key={opt.label}
                onClick={() => handleSelect(opt.date)}
                className="w-full flex items-center gap-3 px-2.5 py-2 rounded-md hover:bg-secondary transition-colors text-left"
              >
                <opt.icon className={cn('w-4 h-4', opt.color)} />
                <span className="flex-1 text-sm font-medium">{opt.label}</span>
                <span className="text-xs text-muted-foreground">{opt.sublabel}</span>
              </button>
            ))}
          </div>
          <div className="border-t border-border" />
          <div className="p-1">
            <CalendarWidget
              mode="single"
              selected={selectedDate}
              onSelect={(d) => d && handleSelect(d)}
              defaultMonth={selectedDate || new Date()}
              numberOfMonths={1}
              weekStartsOn={1}
            />
          </div>
          {value && (
            <>
              <div className="border-t border-border" />
              <div className="p-2">
                <button
                  onClick={() => { onClear(); setOpen(false) }}
                  className="w-full flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-md text-xs text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
                >
                  <X className="w-3 h-3" /> Clear date
                </button>
              </div>
            </>
          )}
        </PopoverContent>
      </Popover>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════

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

  const [editMode, setEditMode] = useState(false)
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

  // Reset edit mode and sync state when task changes
  useEffect(() => {
    if (task) {
      setEditMode(false)
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
  }, [task?.id]) // eslint-disable-line react-hooks/exhaustive-deps

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

  const statusOpt = STATUS_OPTIONS.find(s => s.value === task.status)
  const StatusIcon = statusOpt?.icon ?? Circle
  const priorityInfo = PRIORITY_LABELS[task.priority]
  const recLabel = task.recurrence !== 'none' ? recurrenceLabel(task.recurrence, task.recurrence_rule as RecurrenceRule | null) : null

  // ─── SUMMARY VIEW (read-only) ─────────────────────────
  if (!editMode) {
    return (
      <div className="h-full flex flex-col bg-background">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-border shrink-0">
          <div className="flex items-center gap-2">
            <button onClick={onClose} className="lg:hidden text-muted-foreground hover:text-foreground transition-colors p-1 rounded-md hover:bg-accent mr-1">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button onClick={() => toggleTask(taskId)} className="shrink-0">
              <div className={cn(
                'w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all',
                task.is_completed ? 'border-primary bg-primary' : 'border-border hover:border-muted-foreground'
              )}>
                {task.is_completed && <span className="text-primary-foreground text-[10px] font-bold">✓</span>}
              </div>
            </button>
            <span className="text-xs text-muted-foreground">
              {task.is_completed ? 'Completed' : statusOpt?.label}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setEditMode(true)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            >
              <Pencil className="w-3.5 h-3.5" /> Edit
            </button>
            <button onClick={onClose} className="hidden lg:block text-muted-foreground hover:text-foreground transition-colors p-1 rounded-md hover:bg-accent">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Summary content */}
        <ScrollArea className="flex-1">
          <div className="px-5 py-4 space-y-4">
            {/* Title */}
            <h2 className={cn('text-lg font-semibold', task.is_completed && 'line-through text-muted-foreground')}>
              {task.title}
            </h2>

            {/* Status + Priority badges */}
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium"
                style={{ backgroundColor: `${statusOpt?.color}12`, color: statusOpt?.color }}
              >
                <StatusIcon className="w-3.5 h-3.5" />
                {statusOpt?.label}
              </span>
              {task.priority < 4 && (
                <span
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium"
                  style={{ backgroundColor: `${priorityInfo.color}12`, color: priorityInfo.color }}
                >
                  <Flag className="w-3 h-3" />
                  {priorityInfo.label}
                </span>
              )}
            </div>

            {/* Due date */}
            {task.due_date && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CalendarDays className="w-4 h-4 shrink-0" />
                <span>{format(new Date(toDueDateString(task.due_date) + 'T12:00:00'), 'EEEE, MMM d, yyyy')}</span>
              </div>
            )}

            {/* Recurrence */}
            {recLabel && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <RefreshCw className="w-4 h-4 shrink-0" />
                <span>{recLabel}</span>
              </div>
            )}

            {/* Description / Notes */}
            {task.note && (
              <div className="space-y-1.5">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Notes</p>
                <p className="text-sm text-foreground/80 whitespace-pre-wrap leading-relaxed">{task.note}</p>
              </div>
            )}

            {/* Projects + Labels */}
            {(taskProjects.length > 0 || taskLabels.length > 0) && (
              <div className="flex flex-wrap gap-1.5">
                {taskProjects.map(project => (
                  <span key={project.id}
                    className="text-[10px] px-2 py-0.5 rounded-full font-medium flex items-center gap-1.5"
                    style={{ backgroundColor: `${project.color_hex}12`, color: project.color_hex }}
                  >
                    <DynamicIcon name={project.icon_name} className="w-3 h-3" />
                    {project.name}
                  </span>
                ))}
                {taskLabels.map(label => (
                  <span key={label.id}
                    className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                    style={{ backgroundColor: `${label.color_hex}12`, color: label.color_hex }}
                  >
                    {label.name}
                  </span>
                ))}
              </div>
            )}

            {/* Subtasks */}
            {subtasks.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-1.5">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <ListTodo className="w-3 h-3" /> Subtasks
                  </p>
                  <span className="text-[10px] bg-secondary px-1.5 py-0.5 rounded-full">
                    {subtasks.filter(s => s.is_completed).length}/{subtasks.length}
                  </span>
                </div>
                <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all duration-300 rounded-full"
                    style={{ width: `${(subtasks.filter(s => s.is_completed).length / subtasks.length) * 100}%` }}
                  />
                </div>
                <div className="space-y-0.5">
                  {subtasks.map(st => (
                    <div key={st.id} className="flex items-center gap-2 py-1.5 px-2 rounded-lg hover:bg-accent/30 transition-colors">
                      <button onClick={() => toggleTask(st.id)} className="shrink-0">
                        <div className={cn(
                          'w-4 h-4 rounded-full border-[1.5px] flex items-center justify-center transition-all',
                          st.is_completed ? 'border-primary bg-primary' : 'border-border hover:border-muted-foreground'
                        )}>
                          {st.is_completed && <span className="text-primary-foreground text-[8px] font-bold">✓</span>}
                        </div>
                      </button>
                      <span className={cn('text-sm flex-1', st.is_completed && 'line-through text-muted-foreground')}>{st.title}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Meta */}
            <div className="space-y-1 text-[11px] text-muted-foreground pt-2 border-t border-border">
              <p>Created {format(new Date(task.created_at), 'MMM d, yyyy')}</p>
              {task.completed_at && <p>Completed {format(new Date(task.completed_at), 'MMM d, yyyy')}</p>}
            </div>
          </div>
        </ScrollArea>
      </div>
    )
  }

  // ─── EDIT VIEW ────────────────────────────────────────
  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-border shrink-0">
        <div className="flex items-center gap-2">
          <button onClick={onClose} className="lg:hidden text-muted-foreground hover:text-foreground transition-colors p-1 rounded-md hover:bg-accent mr-1">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button onClick={() => toggleTask(taskId)} className="shrink-0">
            <div className={cn(
              'w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all',
              task.is_completed ? 'border-primary bg-primary' : 'border-border hover:border-muted-foreground'
            )}>
              {task.is_completed && <span className="text-primary-foreground text-[10px] font-bold">✓</span>}
            </div>
          </button>
          <span className="text-xs font-medium text-primary">Editing</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setEditMode(false)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <Check className="w-3.5 h-3.5" /> Done
          </button>
          <button onClick={onClose} className="hidden lg:block text-muted-foreground hover:text-foreground transition-colors p-1 rounded-md hover:bg-accent">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Scrollable edit content */}
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
            <DueDatePicker
              value={dueDate}
              onChange={handleDueDateChange}
              onClear={handleClearDueDate}
            />
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
            {subtasks.length > 0 && (
              <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-300 rounded-full"
                  style={{ width: `${(subtasks.filter(s => s.is_completed).length / subtasks.length) * 100}%` }}
                />
              </div>
            )}
            {subtasks.length > 0 && (
              <div className="space-y-0.5">
                {subtasks.map(st => (
                  <div key={st.id} className="flex items-center gap-2 py-1.5 px-2 rounded-lg hover:bg-accent/30 group transition-colors">
                    <button onClick={() => toggleTask(st.id)} className="shrink-0">
                      <div className={cn(
                        'w-4 h-4 rounded-full border-[1.5px] flex items-center justify-center transition-all',
                        st.is_completed ? 'border-primary bg-primary' : 'border-border hover:border-muted-foreground'
                      )}>
                        {st.is_completed && <span className="text-primary-foreground text-[8px] font-bold">✓</span>}
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
                    className="text-[10px] px-2 py-0.5 rounded-full font-medium flex items-center gap-1.5 cursor-pointer hover:opacity-80 transition-opacity"
                    style={{ backgroundColor: `${project.color_hex}12`, color: project.color_hex }}
                    onClick={() => removeProjectFromTask(taskId, project.id)}
                    title="Click to remove"
                  >
                    <DynamicIcon name={project.icon_name} className="w-3 h-3" />
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
                    className="text-[10px] px-2 py-1 rounded-full font-medium flex items-center gap-1.5 transition-all hover:scale-105"
                    style={{ backgroundColor: `${project.color_hex}12`, color: project.color_hex }}>
                    <DynamicIcon name={project.icon_name} className="w-3 h-3" />
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
