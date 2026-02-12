import { create } from 'zustand'
import { createClient } from '@/lib/supabase/client'
import type { Task, TaskProject, TaskLabel, TaskProjectLink, TaskLabelLink } from '@/lib/types/database'

export type SmartView = 'inbox' | 'today' | 'upcoming' | 'all' | 'completed'
export type SortBy = 'priority' | 'due_date' | 'created_at' | 'title'
export type GroupBy = 'none' | 'status' | 'priority' | 'due_date'
export type ViewMode = 'list' | 'board' | 'calendar'

interface TasksState {
  tasks: Task[]
  projects: TaskProject[]
  labels: TaskLabel[]
  projectLinks: TaskProjectLink[]
  labelLinks: TaskLabelLink[]
  loading: boolean

  // View state
  smartView: SmartView
  viewMode: ViewMode
  searchQuery: string
  sortBy: SortBy
  sortDirection: 'asc' | 'desc'
  groupBy: GroupBy
  priorityFilter: number[]
  selectedProjectId: string | null
  selectedLabelId: string | null
  selectedTaskId: string | null

  // Setters
  setSmartView: (view: SmartView) => void
  setViewMode: (mode: ViewMode) => void
  setSearchQuery: (q: string) => void
  setSortBy: (sort: SortBy) => void
  setSortDirection: (dir: 'asc' | 'desc') => void
  setGroupBy: (group: GroupBy) => void
  setPriorityFilter: (priorities: number[]) => void
  setSelectedProjectId: (id: string | null) => void
  setSelectedLabelId: (id: string | null) => void
  setSelectedTaskId: (id: string | null) => void

  // Data actions
  fetchAll: () => Promise<void>
  createTask: (data: Partial<Task>) => Promise<Task | null>
  updateTask: (id: string, data: Partial<Task>) => Promise<void>
  deleteTask: (id: string) => Promise<void>
  toggleTask: (id: string) => Promise<void>

  createProject: (data: { name: string; icon_name: string; color_hex: string }) => Promise<void>
  deleteProject: (id: string) => Promise<void>

  createLabel: (data: { name: string; color_hex: string }) => Promise<void>
  deleteLabel: (id: string) => Promise<void>

  addLabelToTask: (taskId: string, labelId: string) => Promise<void>
  removeLabelFromTask: (taskId: string, labelId: string) => Promise<void>
  addProjectToTask: (taskId: string, projectId: string) => Promise<void>
  removeProjectFromTask: (taskId: string, projectId: string) => Promise<void>

  // Helpers
  getLabelsForTask: (taskId: string) => TaskLabel[]
  getProjectsForTask: (taskId: string) => TaskProject[]
  getSubtasks: (taskId: string) => Task[]
}

export const useTasksStore = create<TasksState>((set, get) => ({
  tasks: [],
  projects: [],
  labels: [],
  projectLinks: [],
  labelLinks: [],
  loading: true,

  smartView: 'inbox',
  viewMode: 'list',
  searchQuery: '',
  sortBy: 'created_at',
  sortDirection: 'desc',
  groupBy: 'none',
  priorityFilter: [],
  selectedProjectId: null,
  selectedLabelId: null,
  selectedTaskId: null,

  setSmartView: (view) => set({ smartView: view, selectedProjectId: null, selectedLabelId: null }),
  setViewMode: (mode) => set({ viewMode: mode }),
  setSearchQuery: (q) => set({ searchQuery: q }),
  setSortBy: (sort) => set({ sortBy: sort }),
  setSortDirection: (dir) => set({ sortDirection: dir }),
  setGroupBy: (group) => set({ groupBy: group }),
  setPriorityFilter: (priorities) => set({ priorityFilter: priorities }),
  setSelectedProjectId: (id) => set({
    selectedProjectId: id,
    selectedLabelId: null,
    ...(id ? { smartView: 'all' as SmartView } : {}),
  }),
  setSelectedLabelId: (id) => set({
    selectedLabelId: id,
    selectedProjectId: null,
    ...(id ? { smartView: 'all' as SmartView } : {}),
  }),
  setSelectedTaskId: (id) => set({ selectedTaskId: id }),

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
      recurrence_rule: data.recurrence_rule ?? null,
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
    set(s => ({
      tasks: s.tasks.filter(t => t.id !== id),
      selectedTaskId: s.selectedTaskId === id ? null : s.selectedTaskId,
    }))
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

    if (isCompleted && task.recurrence !== 'none' && task.due_date) {
      const dueDate = new Date(task.due_date)
      let nextDate: Date
      const interval = (task.recurrence_rule as any)?.interval || 1
      switch (task.recurrence) {
        case 'daily':
        case 'weekdays':
        case 'weekends':
        case 'custom':
          nextDate = new Date(dueDate.setDate(dueDate.getDate() + interval))
          break
        case 'weekly':
          nextDate = new Date(dueDate.setDate(dueDate.getDate() + 7 * interval))
          break
        case 'monthly':
          nextDate = new Date(dueDate.setMonth(dueDate.getMonth() + interval))
          break
        case 'yearly':
          nextDate = new Date(dueDate.setFullYear(dueDate.getFullYear() + interval))
          break
        default:
          nextDate = new Date(dueDate.setDate(dueDate.getDate() + 1))
      }

      await get().createTask({
        title: task.title,
        icon_name: task.icon_name,
        color_hex: task.color_hex,
        priority: task.priority,
        recurrence: task.recurrence,
        recurrence_rule: task.recurrence_rule,
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

  deleteLabel: async (id) => {
    const supabase = createClient()
    await supabase.from('task_labels').delete().eq('id', id)
    set(s => ({ labels: s.labels.filter(l => l.id !== id) }))
  },

  addLabelToTask: async (taskId, labelId) => {
    const supabase = createClient()
    const { data } = await supabase.from('task_label_links').insert({ task_id: taskId, label_id: labelId }).select().single()
    if (data) set(s => ({ labelLinks: [...s.labelLinks, data] }))
  },

  removeLabelFromTask: async (taskId, labelId) => {
    const supabase = createClient()
    await supabase.from('task_label_links').delete().eq('task_id', taskId).eq('label_id', labelId)
    set(s => ({ labelLinks: s.labelLinks.filter(l => !(l.task_id === taskId && l.label_id === labelId)) }))
  },

  addProjectToTask: async (taskId, projectId) => {
    const supabase = createClient()
    const { data } = await supabase.from('task_project_links').insert({ task_id: taskId, project_id: projectId, sort_order: 0 }).select().single()
    if (data) set(s => ({ projectLinks: [...s.projectLinks, data] }))
  },

  removeProjectFromTask: async (taskId, projectId) => {
    const supabase = createClient()
    await supabase.from('task_project_links').delete().eq('task_id', taskId).eq('project_id', projectId)
    set(s => ({ projectLinks: s.projectLinks.filter(l => !(l.task_id === taskId && l.project_id === projectId)) }))
  },

  getLabelsForTask: (taskId) => {
    const { labelLinks, labels } = get()
    const ids = labelLinks.filter(l => l.task_id === taskId).map(l => l.label_id)
    return labels.filter(l => ids.includes(l.id))
  },

  getProjectsForTask: (taskId) => {
    const { projectLinks, projects } = get()
    const ids = projectLinks.filter(l => l.task_id === taskId).map(l => l.project_id)
    return projects.filter(p => ids.includes(p.id))
  },

  getSubtasks: (taskId) => {
    return get().tasks.filter(t => t.parent_task_id === taskId)
  },
}))
