export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface RecurrenceRule {
  interval?: number          // every X days/weeks/months
  days_of_week?: number[]    // 0=Sun, 1=Mon, ..., 6=Sat
  days_of_month?: number[]   // e.g. [1, 15, 31]
  start_date?: string        // "YYYY-MM-DD"
  end_date?: string          // "YYYY-MM-DD"
}

export type RecurrenceType = 'none' | 'daily' | 'weekdays' | 'weekends' | 'weekly' | 'monthly' | 'yearly' | 'custom'

export interface HabitSession {
  id: string
  label: string
}

export interface HabitOption {
  id: string
  label: string
  color: string
}

export interface Database {
  public: {
    Tables: {
      habits: {
        Row: {
          id: string
          user_id: string
          title: string
          icon_name: string
          color_hex: string
          frequency: 'daily' | 'weekly'
          tracking_type: 'boolean' | 'numeric' | 'timer' | 'options'
          group_id: string | null
          weekly_target: number | null
          target_value: number | null
          unit: string | null
          target_minutes: number | null
          tags: string[]
          sessions: HabitSession[] | null
          options: HabitOption[] | null
          is_archived: boolean
          sort_order: number
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['habits']['Row'], 'id' | 'created_at' | 'user_id'> & {
          id?: string
          created_at?: string
          user_id?: string
        }
        Update: Partial<Database['public']['Tables']['habits']['Insert']>
      }
      habit_entries: {
        Row: {
          id: string
          user_id: string
          habit_id: string
          date: string
          value: number | null
          status: 'completed' | 'skipped'
          session_id: string | null
          option_id: string | null
          note: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['habit_entries']['Row'], 'id' | 'created_at' | 'user_id'> & {
          id?: string
          created_at?: string
          user_id?: string
        }
        Update: Partial<Database['public']['Tables']['habit_entries']['Insert']>
      }
      habit_groups: {
        Row: {
          id: string
          user_id: string
          name: string
          icon_name: string
          color_hex: string
          sort_order: number
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['habit_groups']['Row'], 'id' | 'created_at' | 'user_id'> & {
          id?: string
          created_at?: string
          user_id?: string
        }
        Update: Partial<Database['public']['Tables']['habit_groups']['Insert']>
      }
      tasks: {
        Row: {
          id: string
          user_id: string
          title: string
          icon_name: string
          color_hex: string
          due_date: string | null
          parent_task_id: string | null
          priority: number
          status: 'todo' | 'doing' | 'done'
          is_completed: boolean
          completed_at: string | null
          note: string | null
          voice_note_url: string | null
          recurrence: 'none' | 'daily' | 'weekdays' | 'weekends' | 'weekly' | 'monthly' | 'yearly' | 'custom'
          recurrence_rule: RecurrenceRule | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['tasks']['Row'], 'id' | 'created_at' | 'user_id'> & {
          id?: string
          created_at?: string
          user_id?: string
        }
        Update: Partial<Database['public']['Tables']['tasks']['Insert']>
      }
      task_projects: {
        Row: {
          id: string
          user_id: string
          name: string
          icon_name: string
          color_hex: string
          sort_order: number
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['task_projects']['Row'], 'id' | 'created_at' | 'user_id'> & {
          id?: string
          created_at?: string
          user_id?: string
        }
        Update: Partial<Database['public']['Tables']['task_projects']['Insert']>
      }
      task_project_links: {
        Row: {
          id: string
          task_id: string
          project_id: string
          section_id: string | null
          sort_order: number
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['task_project_links']['Row'], 'id' | 'created_at'> & {
          id?: string
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['task_project_links']['Insert']>
      }
      task_project_sections: {
        Row: {
          id: string
          project_id: string
          name: string
          sort_order: number
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['task_project_sections']['Row'], 'id' | 'created_at'> & {
          id?: string
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['task_project_sections']['Insert']>
      }
      task_labels: {
        Row: {
          id: string
          user_id: string
          name: string
          color_hex: string
          icon_name: string | null
          sort_order: number
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['task_labels']['Row'], 'id' | 'created_at' | 'user_id'> & {
          id?: string
          created_at?: string
          user_id?: string
        }
        Update: Partial<Database['public']['Tables']['task_labels']['Insert']>
      }
      task_label_links: {
        Row: {
          id: string
          task_id: string
          label_id: string
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['task_label_links']['Row'], 'id' | 'created_at'> & {
          id?: string
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['task_label_links']['Insert']>
      }
      task_saved_filters: {
        Row: {
          id: string
          user_id: string
          name: string
          spec_json: Json
          sort_order: number
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['task_saved_filters']['Row'], 'id' | 'created_at' | 'user_id'> & {
          id?: string
          created_at?: string
          user_id?: string
        }
        Update: Partial<Database['public']['Tables']['task_saved_filters']['Insert']>
      }
    }
  }
}

// Convenience type aliases
export type Habit = Database['public']['Tables']['habits']['Row']
export type HabitEntry = Database['public']['Tables']['habit_entries']['Row']
export type HabitGroup = Database['public']['Tables']['habit_groups']['Row']
export type Task = Database['public']['Tables']['tasks']['Row']
export type TaskProject = Database['public']['Tables']['task_projects']['Row']
export type TaskProjectLink = Database['public']['Tables']['task_project_links']['Row']
export type TaskProjectSection = Database['public']['Tables']['task_project_sections']['Row']
export type TaskLabel = Database['public']['Tables']['task_labels']['Row']
export type TaskLabelLink = Database['public']['Tables']['task_label_links']['Row']
export type TaskSavedFilter = Database['public']['Tables']['task_saved_filters']['Row']
