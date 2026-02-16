import type { HabitEntry } from '@/lib/types/database'
import { format, startOfDay, subDays, addDays, eachDayOfInterval, startOfYear, endOfYear, getDay, differenceInDays, startOfWeek, isSameDay } from 'date-fns'

/**
 * Calculate streak: consecutive completed days (skipped days don't break it but don't add)
 */
export function calculateStreak(entries: HabitEntry[]): number {
  const completedDates = new Set(
    entries.filter(e => e.status === 'completed').map(e => e.date)
  )
  const skippedDates = new Set(
    entries.filter(e => e.status === 'skipped').map(e => e.date)
  )

  let streak = 0
  let currentDate = startOfDay(new Date())

  // Check if today is completed or skipped
  const todayStr = format(currentDate, 'yyyy-MM-dd')
  if (!completedDates.has(todayStr) && !skippedDates.has(todayStr)) {
    // Not done today — check from yesterday
    currentDate = subDays(currentDate, 1)
  }

  while (true) {
    const dateStr = format(currentDate, 'yyyy-MM-dd')
    if (completedDates.has(dateStr)) {
      streak++
      currentDate = subDays(currentDate, 1)
    } else if (skippedDates.has(dateStr)) {
      // Skip doesn't break streak, but doesn't add
      currentDate = subDays(currentDate, 1)
    } else {
      break
    }
  }

  return streak
}

/**
 * Calculate best streak ever
 */
export function calculateBestStreak(entries: HabitEntry[]): number {
  if (entries.length === 0) return 0

  const completedDates = new Set(
    entries.filter(e => e.status === 'completed').map(e => e.date)
  )
  const skippedDates = new Set(
    entries.filter(e => e.status === 'skipped').map(e => e.date)
  )

  const allDates = entries.map(e => new Date(e.date)).sort((a, b) => a.getTime() - b.getTime())
  const firstDate = allDates[0]
  const lastDate = allDates[allDates.length - 1]

  let bestStreak = 0
  let currentStreak = 0
  let day = startOfDay(firstDate)
  const end = startOfDay(lastDate)

  while (day <= end) {
    const dateStr = format(day, 'yyyy-MM-dd')
    if (completedDates.has(dateStr)) {
      currentStreak++
      bestStreak = Math.max(bestStreak, currentStreak)
    } else if (skippedDates.has(dateStr)) {
      // Doesn't break or add
    } else {
      currentStreak = 0
    }
    day = addDays(day, 1)
  }

  return bestStreak
}

/**
 * Total completed entries
 */
export function calculateTotal(entries: HabitEntry[]): number {
  return entries.filter(e => e.status === 'completed').length
}

/**
 * Completion rate (completed / (completed + missed))
 * Skipped days are excluded from denominator
 */
export function calculateRate(entries: HabitEntry[]): number {
  const completed = entries.filter(e => e.status === 'completed').length
  const total = entries.length
  if (total === 0) return 0
  return Math.round((completed / total) * 100)
}

/**
 * Generate heatmap data for a full year
 */
export interface HeatmapDay {
  date: Date
  dateStr: string
  status: 'completed' | 'skipped' | 'none' | 'future'
  value?: number | null
}

export function generateYearHeatmapData(entries: HabitEntry[], year?: number): HeatmapDay[] {
  const now = new Date()
  const y = year ?? now.getFullYear()
  const start = startOfYear(new Date(y, 0, 1))
  const end = endOfYear(new Date(y, 0, 1))
  const today = startOfDay(now)

  const entryMap = new Map<string, { status: string; value: number | null }>()
  entries.forEach(e => entryMap.set(e.date, { status: e.status, value: e.value }))

  const days = eachDayOfInterval({ start, end })
  return days.map(date => {
    const dateStr = format(date, 'yyyy-MM-dd')
    const isFuture = date > today
    const entry = entryMap.get(dateStr)
    const status = isFuture ? 'future' : (entry?.status as 'completed' | 'skipped') ?? 'none'
    return { date, dateStr, status, value: entry?.value ?? null }
  })
}

/**
 * Calculate numeric stats for entries with values
 */
export function calculateNumericStats(entries: HabitEntry[], targetValue: number | null) {
  const withValues = entries.filter(e => e.status === 'completed' && e.value != null)
  if (withValues.length === 0) return null

  const values = withValues.map(e => e.value!)
  const avg = values.reduce((a, b) => a + b, 0) / values.length
  const min = Math.min(...values)
  const max = Math.max(...values)
  const onTarget = targetValue ? values.filter(v => v >= targetValue).length : values.length

  return {
    avg: Math.round(avg * 10) / 10,
    min: Math.round(min * 10) / 10,
    max: Math.round(max * 10) / 10,
    onTarget,
    total: withValues.length,
    onTargetPct: Math.round((onTarget / withValues.length) * 100),
  }
}

/**
 * Get the last N days
 */
export function getLastNDays(n: number): Date[] {
  const today = startOfDay(new Date())
  return Array.from({ length: n }, (_, i) => subDays(today, n - 1 - i))
}

/**
 * Today's date string
 */
export function todayStr(): string {
  return format(new Date(), 'yyyy-MM-dd')
}
