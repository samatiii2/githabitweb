import { create } from 'zustand'
import { createClient } from '@/lib/supabase/client'
import type { Habit, HabitEntry, HabitGroup } from '@/lib/types/database'

interface HabitsState {
  habits: Habit[]
  entries: HabitEntry[]
  groups: HabitGroup[]
  loading: boolean
  viewMode: 'heatmap' | 'month' | 'grid' | 'list'
  selectedGroupId: string | null
  searchQuery: string

  setViewMode: (mode: 'heatmap' | 'month' | 'grid' | 'list') => void
  setSelectedGroupId: (id: string | null) => void
  setSearchQuery: (q: string) => void

  fetchHabits: () => Promise<void>
  fetchEntries: () => Promise<void>
  fetchGroups: () => Promise<void>

  createHabit: (data: Omit<Habit, 'id' | 'user_id' | 'created_at'>) => Promise<Habit | null>
  updateHabit: (id: string, data: Partial<Habit>) => Promise<void>
  deleteHabit: (id: string) => Promise<void>

  toggleEntry: (habitId: string, date: string) => Promise<void>
  upsertEntry: (entry: Partial<HabitEntry> & { habit_id: string; date: string }) => Promise<void>
  deleteEntry: (habitId: string, date: string) => Promise<void>

  createGroup: (data: { name: string; icon_name: string; color_hex: string }) => Promise<void>
  updateGroup: (id: string, data: Partial<HabitGroup>) => Promise<void>
  deleteGroup: (id: string) => Promise<void>
}

export const useHabitsStore = create<HabitsState>((set, get) => ({
  habits: [],
  entries: [],
  groups: [],
  loading: true,
  viewMode: 'heatmap',
  selectedGroupId: null,
  searchQuery: '',

  setViewMode: (mode) => set({ viewMode: mode }),
  setSelectedGroupId: (id) => set({ selectedGroupId: id }),
  setSearchQuery: (q) => set({ searchQuery: q }),

  fetchHabits: async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from('habits')
      .select('*')
      .order('sort_order', { ascending: true })
    set({ habits: data ?? [], loading: false })
  },

  fetchEntries: async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from('habit_entries')
      .select('*')
      .order('date', { ascending: false })
    set({ entries: data ?? [] })
  },

  fetchGroups: async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from('habit_groups')
      .select('*')
      .order('sort_order', { ascending: true })
    set({ groups: data ?? [] })
  },

  createHabit: async (data) => {
    const supabase = createClient()
    const { data: newHabit } = await supabase
      .from('habits')
      .insert(data)
      .select()
      .single()
    if (newHabit) {
      set((s) => ({ habits: [...s.habits, newHabit] }))
    }
    return newHabit
  },

  updateHabit: async (id, data) => {
    const supabase = createClient()
    await supabase.from('habits').update(data).eq('id', id)
    set((s) => ({
      habits: s.habits.map((h) => (h.id === id ? { ...h, ...data } : h)),
    }))
  },

  deleteHabit: async (id) => {
    const supabase = createClient()
    await supabase.from('habits').delete().eq('id', id)
    set((s) => ({
      habits: s.habits.filter((h) => h.id !== id),
      entries: s.entries.filter((e) => e.habit_id !== id),
    }))
  },

  toggleEntry: async (habitId, date) => {
    const { entries } = get()
    const existing = entries.find((e) => e.habit_id === habitId && e.date === date)

    if (!existing) {
      // No entry -> completed
      await get().upsertEntry({ habit_id: habitId, date, status: 'completed' })
    } else if (existing.status === 'completed') {
      // completed -> skipped
      await get().upsertEntry({ habit_id: habitId, date, status: 'skipped' })
    } else {
      // skipped -> delete
      await get().deleteEntry(habitId, date)
    }
  },

  upsertEntry: async (entry) => {
    const supabase = createClient()
    const { data: upserted } = await supabase
      .from('habit_entries')
      .upsert(
        { ...entry, date: entry.date },
        { onConflict: 'habit_id,date' }
      )
      .select()
      .single()

    if (upserted) {
      set((s) => ({
        entries: [
          ...s.entries.filter((e) => !(e.habit_id === entry.habit_id && e.date === entry.date)),
          upserted,
        ],
      }))
    }
  },

  deleteEntry: async (habitId, date) => {
    const supabase = createClient()
    await supabase
      .from('habit_entries')
      .delete()
      .eq('habit_id', habitId)
      .eq('date', date)
    set((s) => ({
      entries: s.entries.filter((e) => !(e.habit_id === habitId && e.date === date)),
    }))
  },

  createGroup: async (data) => {
    const supabase = createClient()
    const { data: newGroup } = await supabase.from('habit_groups').insert(data).select().single()
    if (newGroup) set((s) => ({ groups: [...s.groups, newGroup] }))
  },

  updateGroup: async (id, data) => {
    const supabase = createClient()
    await supabase.from('habit_groups').update(data).eq('id', id)
    set((s) => ({
      groups: s.groups.map((g) => (g.id === id ? { ...g, ...data } : g)),
    }))
  },

  deleteGroup: async (id) => {
    const supabase = createClient()
    await supabase.from('habit_groups').delete().eq('id', id)
    set((s) => ({
      groups: s.groups.filter((g) => g.id !== id),
    }))
  },
}))
