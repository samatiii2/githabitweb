import { differenceInCalendarDays, differenceInCalendarMonths, differenceInCalendarWeeks, differenceInCalendarYears, getDay, getDate, getMonth, startOfDay } from 'date-fns'
import type { Task, RecurrenceRule } from '@/lib/types/database'

/**
 * Determines if a recurring task should appear on a given date.
 * Non-recurring tasks match only their due_date.
 */
export function isTaskOnDate(task: Task, date: Date): boolean {
  const dateOnly = startOfDay(date)
  const rule = task.recurrence_rule as RecurrenceRule | null

  // Check date range from recurrence_rule
  if (rule?.start_date) {
    const start = new Date(rule.start_date + 'T00:00:00')
    if (dateOnly < startOfDay(start)) return false
  }
  if (rule?.end_date) {
    const end = new Date(rule.end_date + 'T00:00:00')
    if (dateOnly > startOfDay(end)) return false
  }

  // No recurrence — match only due_date
  if (task.recurrence === 'none') {
    if (!task.due_date) return false
    const due = parseDateStr(task.due_date)
    return startOfDay(due).getTime() === dateOnly.getTime()
  }

  // For recurring tasks, the anchor is due_date (or created_at)
  const anchorStr = task.due_date || task.created_at
  if (!anchorStr) return false
  const anchor = startOfDay(parseDateStr(anchorStr))

  // Don't show before the anchor date
  if (dateOnly < anchor) return false

  const interval = rule?.interval || 1
  const dayOfWeek = getDay(dateOnly) // 0=Sun .. 6=Sat

  switch (task.recurrence) {
    case 'daily': {
      if (interval === 1) return true
      const diff = differenceInCalendarDays(dateOnly, anchor)
      return diff % interval === 0
    }

    case 'weekdays': {
      // Mon-Fri (1-5)
      return dayOfWeek >= 1 && dayOfWeek <= 5
    }

    case 'weekends': {
      // Sat-Sun (0, 6)
      return dayOfWeek === 0 || dayOfWeek === 6
    }

    case 'weekly': {
      if (getDay(anchor) !== dayOfWeek) return false
      if (interval === 1) return true
      const diffWeeks = differenceInCalendarWeeks(dateOnly, anchor, { weekStartsOn: 1 })
      return diffWeeks % interval === 0
    }

    case 'monthly': {
      const anchorDom = getDate(anchor)
      const dateDom = getDate(dateOnly)
      // Handle months where anchor day doesn't exist (e.g., 31st in a 30-day month)
      if (dateDom !== anchorDom) {
        // If anchor is 31 and month has 30 days, match last day
        const lastDayOfMonth = new Date(dateOnly.getFullYear(), dateOnly.getMonth() + 1, 0).getDate()
        if (anchorDom > lastDayOfMonth && dateDom === lastDayOfMonth) {
          // OK, this is the closest match
        } else {
          return false
        }
      }
      if (interval === 1) return true
      const diffMonths = differenceInCalendarMonths(dateOnly, anchor)
      return diffMonths % interval === 0
    }

    case 'yearly': {
      if (getMonth(dateOnly) !== getMonth(anchor)) return false
      if (getDate(dateOnly) !== getDate(anchor)) return false
      if (interval === 1) return true
      const diffYears = differenceInCalendarYears(dateOnly, anchor)
      return diffYears % interval === 0
    }

    case 'custom': {
      if (!rule) return false
      // Custom: match specific days of week
      if (rule.days_of_week && rule.days_of_week.length > 0) {
        if (!rule.days_of_week.includes(dayOfWeek)) return false
        // If interval > 1, apply weekly interval
        if (interval > 1) {
          const diffWeeks = differenceInCalendarWeeks(dateOnly, anchor, { weekStartsOn: 1 })
          if (diffWeeks % interval !== 0) return false
        }
        return true
      }
      // Custom: match specific days of month
      if (rule.days_of_month && rule.days_of_month.length > 0) {
        const dom = getDate(dateOnly)
        return rule.days_of_month.includes(dom)
      }
      return false
    }

    default:
      return false
  }
}

/**
 * Get all tasks that should appear on a specific date.
 */
export function getTasksForDate(tasks: Task[], date: Date): Task[] {
  return tasks.filter(t => !t.is_completed && isTaskOnDate(t, date))
}

/**
 * Parse a date string safely, handling both ISO and "YYYY-MM-DD" formats.
 */
function parseDateStr(d: string): Date {
  if (d.length === 10) return new Date(d + 'T12:00:00')
  return new Date(d)
}

/**
 * Human-readable label for a recurrence setting.
 */
export function recurrenceLabel(recurrence: string, rule?: RecurrenceRule | null): string {
  const interval = rule?.interval || 1
  const plural = interval > 1

  switch (recurrence) {
    case 'none': return 'No repeat'
    case 'daily':
      return interval === 1 ? 'Every day' : `Every ${interval} days`
    case 'weekdays': return 'Weekdays (Mon-Fri)'
    case 'weekends': return 'Weekends (Sat-Sun)'
    case 'weekly':
      return interval === 1 ? 'Every week' : `Every ${interval} weeks`
    case 'monthly':
      return interval === 1 ? 'Every month' : `Every ${interval} months`
    case 'yearly':
      return interval === 1 ? 'Every year' : `Every ${interval} years`
    case 'custom': {
      if (!rule) return 'Custom'
      if (rule.days_of_week?.length) {
        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
        const days = rule.days_of_week.map(d => dayNames[d]).join(', ')
        return interval > 1 ? `Every ${interval} weeks on ${days}` : `Every ${days}`
      }
      if (rule.days_of_month?.length) {
        const suffix = (n: number) => {
          if (n >= 11 && n <= 13) return n + 'th'
          switch (n % 10) {
            case 1: return n + 'st'
            case 2: return n + 'nd'
            case 3: return n + 'rd'
            default: return n + 'th'
          }
        }
        const days = rule.days_of_month.map(suffix).join(', ')
        return `Every ${days} of the month`
      }
      return 'Custom'
    }
    default: return recurrence
  }
}
