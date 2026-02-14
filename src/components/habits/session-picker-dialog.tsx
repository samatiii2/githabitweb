'use client'

import { useMemo } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { DynamicIcon } from '@/components/dynamic-icon'
import { cn } from '@/lib/utils'
import { CheckCircle2 } from 'lucide-react'
import { startOfWeek, endOfWeek, format } from 'date-fns'
import type { Habit, HabitEntry, HabitSession } from '@/lib/types/database'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  habit: Habit
  entries: HabitEntry[]
  date: string // "YYYY-MM-DD" — the date being toggled
  onSelectSession: (sessionId: string) => void
}

export function SessionPickerDialog({ open, onOpenChange, habit, entries, date, onSelectSession }: Props) {
  const sessions = (habit.sessions as HabitSession[]) ?? []

  // Get the week boundaries (Mon–Sun) for the target date
  const weekStart = startOfWeek(new Date(date + 'T12:00:00'), { weekStartsOn: 1 })
  const weekEnd = endOfWeek(new Date(date + 'T12:00:00'), { weekStartsOn: 1 })
  const weekLabel = `${format(weekStart, 'MMM d')} – ${format(weekEnd, 'MMM d')}`

  // Find which sessions are already completed this week
  const completedSessionMap = useMemo(() => {
    const map = new Map<string, { date: string }>()
    const wStart = format(weekStart, 'yyyy-MM-dd')
    const wEnd = format(weekEnd, 'yyyy-MM-dd')

    for (const entry of entries) {
      if (
        entry.habit_id === habit.id &&
        entry.status === 'completed' &&
        entry.session_id &&
        entry.date >= wStart &&
        entry.date <= wEnd
      ) {
        map.set(entry.session_id, { date: entry.date })
      }
    }
    return map
  }, [entries, habit.id, weekStart, weekEnd])

  const completedCount = completedSessionMap.size
  const totalSessions = sessions.length
  const allDone = completedCount >= totalSessions

  const handleSelect = (sessionId: string) => {
    onSelectSession(sessionId)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
              style={{ backgroundColor: `${habit.color_hex}15` }}
            >
              <DynamicIcon name={habit.icon_name} className="w-4 h-4" style={{ color: habit.color_hex }} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">{habit.title}</p>
              <p className="text-[10px] text-muted-foreground font-normal">{weekLabel}</p>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3 pt-1">
          {/* Progress */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Weekly progress</span>
              <span className="font-semibold" style={{ color: allDone ? habit.color_hex : undefined }}>
                {completedCount}/{totalSessions}
              </span>
            </div>
            <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${totalSessions > 0 ? (completedCount / totalSessions) * 100 : 0}%`,
                  backgroundColor: habit.color_hex,
                }}
              />
            </div>
          </div>

          {/* Session list */}
          <div className="space-y-1.5">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              {allDone ? 'All sessions completed this week!' : 'What did you do today?'}
            </p>
            <div className="space-y-1">
              {sessions.map((session, idx) => {
                const completed = completedSessionMap.get(session.id)
                const isDone = !!completed
                return (
                  <button
                    key={session.id}
                    onClick={() => !isDone && handleSelect(session.id)}
                    disabled={isDone}
                    className={cn(
                      'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all',
                      isDone
                        ? 'bg-secondary/40 cursor-default'
                        : 'hover:bg-secondary/80 hover:scale-[1.01] active:scale-[0.99] cursor-pointer border border-border hover:border-border/80'
                    )}
                  >
                    {/* Number / check */}
                    <div
                      className={cn(
                        'w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs font-bold transition-all',
                        isDone ? 'shadow-sm' : ''
                      )}
                      style={{
                        backgroundColor: isDone ? habit.color_hex : `${habit.color_hex}12`,
                        color: isDone ? 'var(--icon-on-color)' : habit.color_hex,
                      }}
                    >
                      {isDone ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                    </div>

                    {/* Label */}
                    <div className="flex-1 min-w-0">
                      <p className={cn(
                        'text-sm font-medium',
                        isDone && 'line-through text-muted-foreground'
                      )}>
                        {session.label}
                      </p>
                      {isDone && completed && (
                        <p className="text-[10px] text-muted-foreground mt-0.5">
                          Done on {format(new Date(completed.date + 'T12:00:00'), 'EEEE')}
                        </p>
                      )}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* All done message */}
          {allDone && (
            <div className="text-center py-2">
              <p className="text-sm font-medium" style={{ color: habit.color_hex }}>
                🎉 Week complete!
              </p>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                All sessions done. You can still log an extra entry.
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
