import { create } from 'zustand'
import { createClient } from '@/lib/supabase/client'
import type { Task, TaskProject, TaskLabel, TaskProjectLink, TaskLabelLink } from '@/lib/types/database'

interface TasksState {
  tasks: Task[]
  projects: TaskProject[]
  labels: TaskLabel[]
  projectLinks: TaskProjectLink[]
  labelLinks: TaskLabelLink[]
  loading: boolean
  activeTab: 'inbox' | 'projects'
  viewMode: 'list' | 'calendar' | 'board'
  searchQuery: string

  setActiveTab: (tab: 'inbox' | 'projects') => void
  setViewMode: (mode: 'list' | 'calendar' | 'board') => void
  setSearchQuery: (q: string) => void

  fetchAll: () => Promise<void>
  createTask: (data: Partial<Task>) => Promise<Task | null>
  updateTask: (id: string, data: Partial<Task>) => Promise<void>
  deleteTask: (id: string) => Promise<void>
  toggleTask: (id: string) => Promise<void>

  createProject: (data: { name: string; icon_name: string; color_hex: string }) => Promise<void>
  deleteProject: (id: string) => Promise<void>

  createLabel: (data: { name: string; color_hex: string }) => Promise<void>
}

export const useTasksStore = create<TasksState>((set, get) => ({
  tasks: [],
  projects: [],
  labels: [],
  projectLinks: [],
  labelLinks: [],
  loading: true,
  activeTab: 'inbox',
  viewMode: 'list',
  searchQuery: '',

  setActiveTab: (tab) => set({ activeTab: tab }),
  setViewMode: (mode) => set({ viewMode: mode }),
  setSearchQuery: (q) => set({ searchQuery: q }),

  fetchAll: async () => {
    const supabase = createClient()
    const [tasksRes, projectsRes, labelsRes, plRes, llRes] = await Promise.all([
      supabase.from('tasks').select('*').order('created_at', { ascending: false }),
      supabase.from('task_projects').select('*').order('sort_order'),
      supabase.from('task_labels').select('*').order('sort_order'),
      supabase.from('task_project_links').select('*'),
      supabase.from('task_label_links').select('*'),
    ])
    set({
      tasks: tasksRes.data ?? [],
      projects: projectsRes.data ?? [],
      labels: labelsRes.data ?? [],
      projectLinks: plRes.data ?? [],
      labelLinks: llRes.data ?? [],
      loading: false,
    })
  },

  createTask: async (data) => {
    const supabase = createClient()
    const { data: task } = await supabase.from('tasks').insert({
      title: data.title ?? 'New task',
      icon_name: data.icon_name ?? 'check-circle',
      color_hex: data.color_hex ?? '#3DD68C',
      due_date: data.due_date ?? null,
      priority: data.priority ?? 4,
      status: data.status ?? 'todo',
      is_completed: false,
      note: data.note ?? null,
      recurrence: data.recurrence ?? 'none',
      parent_task_id: data.parent_task_id ?? null,
      voice_note_url: null,
      completed_at: null,
    }).select().single()
    if (task) set(s => ({ tasks: [task, ...s.tasks] }))
    return task
  },

  updateTask: async (id, data) => {
    const supabase = createClient()
    await supabase.from('tasks').update(data).eq('id', id)
    set(s => ({ tasks: s.tasks.map(t => t.id === id ? { ...t, ...data } : t) }))
  },

  deleteTask: async (id) => {
    const supabase = createClient()
    await supabase.from('tasks').delete().eq('id', id)
    set(s => ({ tasks: s.tasks.filter(t => t.id !== id) }))
  },

  toggleTask: async (id) => {
    const task = get().tasks.find(t => t.id === id)
    if (!task) return
    const isCompleted = !task.is_completed
    const data: Partial<Task> = {
      is_completed: isCompleted,
      status: isCompleted ? 'done' : 'todo',
      completed_at: isCompleted ? new Date().toISOString() : null,
    }
    await get().updateTask(id, data)

    // Handle recurrence: create next task
    if (isCompleted && task.recurrence !== 'none' && task.due_date) {
      const dueDate = new Date(task.due_date)
      let nextDate: Date
      if (task.recurrence === 'daily') nextDate = new Date(dueDate.setDate(dueDate.getDate() + 1))
      else if (task.recurrence === 'weekly') nextDate = new Date(dueDate.setDate(dueDate.getDate() + 7))
      else nextDate = new Date(dueDate.setMonth(dueDate.getMonth() + 1))

      await get().createTask({
        title: task.title,
        icon_name: task.icon_name,
        color_hex: task.color_hex,
        priority: task.priority,
        recurrence: task.recurrence,
        due_date: nextDate.toISOString(),
        note: task.note,
      })
    }
  },

  createProject: async (data) => {
    const supabase = createClient()
    const { data: project } = await supabase.from('task_projects').insert({ ...data, sort_order: 0 }).select().single()
    if (project) set(s => ({ projects: [...s.projects, project] }))
  },

  deleteProject: async (id) => {
    const supabase = createClient()
    await supabase.from('task_projects').delete().eq('id', id)
    set(s => ({ projects: s.projects.filter(p => p.id !== id) }))
  },

  createLabel: async (data) => {
    const supabase = createClient()
    const { data: label } = await supabase.from('task_labels').insert({ ...data, sort_order: 0 }).select().single()
    if (label) set(s => ({ labels: [...s.labels, label] }))
  },
}))
