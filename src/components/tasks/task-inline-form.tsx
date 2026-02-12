'use client'

import { useState, useRef, useEffect, useMemo } from 'react'
import { format, addDays, nextSaturday, startOfWeek, addWeeks } from 'date-fns'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  CalendarDays, Flag, Bell, Inbox, Hash,
  FolderOpen, Sun, Sofa, ArrowRight, X, Clock,
  ChevronDown
} from 'lucide-react'
import { DynamicIcon } from '@/components/dynamic-icon'
import { cn } from '@/lib/utils'
import { PRIORITY_LABELS } from '@/lib/constants'
import { RecurrencePicker } from '@/components/tasks/recurrence-picker'
import type { TaskProject, RecurrenceRule, RecurrenceType } from '@/lib/types/database'

// ─── Types ───────────────────────────────────────────────
interface TaskInlineFormProps {
  projects: TaskProject[]
  onSubmit: (data: {
    title: string
    note: string | null
    due_date: string | null
    priority: number
    recurrence: RecurrenceType
    recurrence_rule: RecurrenceRule | null
    projectId?: string | null
  }) => Promise<void>
  onCancel: () => void
  defaultDueDate?: string | null
  autoFocus?: boolean
}

// ─── Quick date options ──────────────────────────────────
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

// ─── Date Picker Popover ─────────────────────────────────
function DatePickerPopover({
  value,
  onChange,
}: {
  value: string
  onChange: (v: string) => void
}) {
  const [open, setOpen] = useState(false)
  const quickDates = useMemo(() => getQuickDates(), [])
  const selectedDate = value ? new Date(value + 'T12:00:00') : undefined

  const handleSelect = (date: Date) => {
    onChange(format(date, 'yyyy-MM-dd'))
    setOpen(false)
  }

  const handleClear = () => {
    onChange('')
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            'inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium transition-colors border',
            value
              ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
              : 'border-border hover:bg-secondary text-muted-foreground hover:text-foreground'
          )}
        >
          <CalendarDays className="w-3.5 h-3.5" />
          {value ? format(new Date(value + 'T12:00:00'), 'MMM d') : 'Date'}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-[280px] p-0" align="start" sideOffset={8}>
        {/* Quick date options */}
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

        {/* Calendar */}
        <div className="p-1">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={(d) => d && handleSelect(d)}
            defaultMonth={selectedDate || new Date()}
            numberOfMonths={1}
            weekStartsOn={1}
          />
        </div>

        {/* Clear button */}
        {value && (
          <>
            <div className="border-t border-border" />
            <div className="p-2">
              <button
                onClick={handleClear}
                className="w-full flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-md text-xs text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
              >
                <X className="w-3 h-3" /> Clear date
              </button>
            </div>
          </>
        )}
      </PopoverContent>
    </Popover>
  )
}

// ─── Priority Picker Popover ─────────────────────────────
function PriorityPickerPopover({
  value,
  onChange,
}: {
  value: number
  onChange: (v: number) => void
}) {
  const [open, setOpen] = useState(false)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            'inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium transition-colors border',
            value < 4
              ? 'border-current/20 hover:opacity-80'
              : 'border-border hover:bg-secondary text-muted-foreground hover:text-foreground'
          )}
          style={value < 4 ? { color: PRIORITY_LABELS[value].color, backgroundColor: PRIORITY_LABELS[value].color + '15' } : undefined}
        >
          <Flag className="w-3.5 h-3.5" />
          {value < 4 ? PRIORITY_LABELS[value].label : 'Priority'}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-[180px] p-2" align="start" sideOffset={8}>
        <div className="space-y-0.5">
          {([1, 2, 3, 4] as const).map(p => (
            <button
              key={p}
              onClick={() => { onChange(p); setOpen(false) }}
              className={cn(
                'w-full flex items-center gap-2.5 px-2.5 py-2 rounded-md transition-colors text-left',
                value === p ? 'bg-secondary' : 'hover:bg-secondary'
              )}
            >
              <Flag className="w-4 h-4" style={{ color: PRIORITY_LABELS[p].color }} />
              <span className="text-sm font-medium flex-1">Priority {p}</span>
              {value === p && <div className="w-1.5 h-1.5 rounded-full bg-primary" />}
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  )
}

// ─── Project Picker Popover ──────────────────────────────
function ProjectPickerPopover({
  projects,
  selectedProjectId,
  onChange,
}: {
  projects: TaskProject[]
  selectedProjectId: string | null
  onChange: (id: string | null) => void
}) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')

  const filtered = useMemo(
    () => projects.filter(p => p.name.toLowerCase().includes(search.toLowerCase())),
    [projects, search]
  )

  const selected = projects.find(p => p.id === selectedProjectId)

  return (
    <Popover open={open} onOpenChange={(v) => { setOpen(v); if (!v) setSearch('') }}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors border border-border hover:bg-secondary text-muted-foreground hover:text-foreground"
        >
          {selected ? (
            <>
              <DynamicIcon name={selected.icon_name} className="w-3.5 h-3.5" style={{ color: selected.color_hex }} />
              {selected.name}
            </>
          ) : (
            <>
              <Inbox className="w-3.5 h-3.5" /> Inbox
            </>
          )}
          <ChevronDown className="w-3 h-3 opacity-50" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-[240px] p-0" align="start" sideOffset={8}>
        {/* Search */}
        <div className="p-2 border-b border-border">
          <Input
            placeholder="Type a project name"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="h-8 text-xs bg-transparent border-0 focus-visible:ring-0 px-2"
            autoFocus
          />
        </div>

        {/* Options */}
        <div className="p-1.5 max-h-[240px] overflow-y-auto">
          {/* Inbox */}
          <button
            onClick={() => { onChange(null); setOpen(false) }}
            className={cn(
              'w-full flex items-center gap-2.5 px-2.5 py-2 rounded-md transition-colors text-left',
              !selectedProjectId ? 'bg-secondary' : 'hover:bg-secondary'
            )}
          >
            <Inbox className="w-4 h-4 text-blue-400" />
            <span className="text-sm font-medium flex-1">Inbox</span>
            {!selectedProjectId && <div className="w-1.5 h-1.5 rounded-full bg-primary" />}
          </button>

          {/* Projects */}
          {filtered.length > 0 && (
            <div className="mt-1 pt-1 border-t border-border/50">
              <p className="px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60">My Projects</p>
              {filtered.map(p => (
                <button
                  key={p.id}
                  onClick={() => { onChange(p.id); setOpen(false) }}
                  className={cn(
                    'w-full flex items-center gap-2.5 px-2.5 py-2 rounded-md transition-colors text-left',
                    selectedProjectId === p.id ? 'bg-secondary' : 'hover:bg-secondary'
                  )}
                >
                  <DynamicIcon name={p.icon_name} className="w-4 h-4" style={{ color: p.color_hex }} />
                  <span className="text-sm flex-1 truncate">{p.name}</span>
                  {selectedProjectId === p.id && <div className="w-1.5 h-1.5 rounded-full bg-primary" />}
                </button>
              ))}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}

// ─── Main Inline Form ────────────────────────────────────
export function TaskInlineForm({
  projects,
  onSubmit,
  onCancel,
  defaultDueDate,
  autoFocus = true,
}: TaskInlineFormProps) {
  const [title, setTitle] = useState('')
  const [note, setNote] = useState('')
  const [dueDate, setDueDate] = useState(defaultDueDate || '')
  const [priority, setPriority] = useState(4)
  const [recurrence, setRecurrence] = useState<RecurrenceType>('none')
  const [recurrenceRule, setRecurrenceRule] = useState<RecurrenceRule | null>(null)
  const [projectId, setProjectId] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const titleRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (autoFocus) titleRef.current?.focus()
  }, [autoFocus])

  const handleSubmit = async () => {
    if (!title.trim() || submitting) return
    setSubmitting(true)
    try {
      await onSubmit({
        title: title.trim(),
        note: note.trim() || null,
        due_date: dueDate || null,
        priority,
        recurrence,
        recurrence_rule: recurrenceRule,
        projectId,
      })
      // Reset
      setTitle('')
      setNote('')
      setDueDate(defaultDueDate || '')
      setPriority(4)
      setRecurrence('none')
      setRecurrenceRule(null)
      setProjectId(null)
      titleRef.current?.focus()
    } finally {
      setSubmitting(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
    if (e.key === 'Escape') {
      onCancel()
    }
  }

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden shadow-lg shadow-black/10">
      {/* Title + Description */}
      <div className="px-4 pt-3.5 pb-1">
        <input
          ref={titleRef}
          value={title}
          onChange={e => setTitle(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Task name"
          className="w-full bg-transparent text-sm font-medium placeholder:text-muted-foreground/50 outline-none"
        />
        <input
          value={note}
          onChange={e => setNote(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Description"
          className="w-full bg-transparent text-xs text-muted-foreground placeholder:text-muted-foreground/30 outline-none mt-1"
        />
      </div>

      {/* Toolbar — Date, Priority, Reminders, More */}
      <div className="px-3 py-2 flex items-center gap-1.5 flex-wrap">
        <DatePickerPopover
          value={dueDate}
          onChange={setDueDate}
        />
        <PriorityPickerPopover
          value={priority}
          onChange={setPriority}
        />
        <RecurrencePicker
          recurrence={recurrence}
          recurrenceRule={recurrenceRule}
          onChange={(r, rule) => { setRecurrence(r); setRecurrenceRule(rule) }}
        />
        <button
          type="button"
          className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium transition-colors border border-border hover:bg-secondary text-muted-foreground hover:text-foreground"
        >
          <Bell className="w-3.5 h-3.5" /> Reminders
        </button>
      </div>

      {/* Bottom bar — Project picker + Cancel/Add */}
      <div className="px-3 py-2.5 flex items-center justify-between border-t border-border bg-secondary/20">
        <ProjectPickerPopover
          projects={projects}
          selectedProjectId={projectId}
          onChange={setProjectId}
        />

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onCancel}
            className="text-xs h-8 px-3 text-muted-foreground hover:text-foreground"
          >
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={handleSubmit}
            disabled={!title.trim() || submitting}
            className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold text-xs h-8 px-4"
          >
            Add task
          </Button>
        </div>
      </div>
    </div>
  )
}
