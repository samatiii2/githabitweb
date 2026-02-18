-- ============================================================
-- giHabit Web - Supabase Database Migrations
-- Run these in the Supabase SQL Editor to update an existing database.
-- Each migration is idempotent (safe to run multiple times).
-- ============================================================


-- ════════════════════════════════════════════════════════════
-- Migration 001: Add recurrence support to tasks
-- Added: recurrence, recurrence_rule columns
-- Date: 2026-01
-- ════════════════════════════════════════════════════════════

DO $$ BEGIN
  -- Update recurrence check constraint to support all types
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'tasks' AND column_name = 'recurrence'
  ) THEN
    -- Column exists, just ensure the constraint is up to date
    ALTER TABLE public.tasks DROP CONSTRAINT IF EXISTS tasks_recurrence_check;
    ALTER TABLE public.tasks ADD CONSTRAINT tasks_recurrence_check
      CHECK (recurrence IN ('none', 'daily', 'weekdays', 'weekends', 'weekly', 'monthly', 'yearly', 'custom'));
  ELSE
    ALTER TABLE public.tasks ADD COLUMN recurrence text NOT NULL DEFAULT 'none'
      CHECK (recurrence IN ('none', 'daily', 'weekdays', 'weekends', 'weekly', 'monthly', 'yearly', 'custom'));
  END IF;
END $$;

ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS recurrence_rule jsonb;


-- ════════════════════════════════════════════════════════════
-- Migration 002: Add icon_name to task_projects
-- Added: icon_name column for project icons
-- Date: 2026-01
-- ════════════════════════════════════════════════════════════

ALTER TABLE public.task_projects ADD COLUMN IF NOT EXISTS icon_name text NOT NULL DEFAULT 'folder';


-- ════════════════════════════════════════════════════════════
-- Migration 003: Add sessions to habits, session_id to entries
-- Added: habits.sessions (jsonb), habit_entries.session_id (text)
-- Purpose: Session-based weekly habits (e.g., Gym 4x/week with
--          named sessions like "Chest+Cardio", "Legs", etc.)
-- Date: 2026-01
-- ════════════════════════════════════════════════════════════

ALTER TABLE public.habits ADD COLUMN IF NOT EXISTS sessions jsonb;
ALTER TABLE public.habit_entries ADD COLUMN IF NOT EXISTS session_id text;


-- ════════════════════════════════════════════════════════════
-- Migration 004: Harden RLS policies on junction tables
-- Fixed: task_project_links, task_label_links, task_project_sections
-- Purpose: Add WITH CHECK clauses and dual ownership checks
--          to prevent cross-user data linking
-- Date: 2026-01
-- ════════════════════════════════════════════════════════════

-- task_project_sections: add WITH CHECK
DROP POLICY IF EXISTS "Users manage own sections" ON public.task_project_sections;
CREATE POLICY "Users manage own sections" ON public.task_project_sections
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.task_projects WHERE id = project_id AND user_id = auth.uid())
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM public.task_projects WHERE id = project_id AND user_id = auth.uid())
  );

-- task_project_links: add dual ownership (task + project) and WITH CHECK
DROP POLICY IF EXISTS "Users manage own links" ON public.task_project_links;
CREATE POLICY "Users manage own links" ON public.task_project_links
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.tasks WHERE id = task_id AND user_id = auth.uid())
    AND EXISTS (SELECT 1 FROM public.task_projects WHERE id = project_id AND user_id = auth.uid())
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM public.tasks WHERE id = task_id AND user_id = auth.uid())
    AND EXISTS (SELECT 1 FROM public.task_projects WHERE id = project_id AND user_id = auth.uid())
  );

-- task_label_links: add dual ownership (task + label) and WITH CHECK
DROP POLICY IF EXISTS "Users manage own label links" ON public.task_label_links;
CREATE POLICY "Users manage own label links" ON public.task_label_links
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.tasks WHERE id = task_id AND user_id = auth.uid())
    AND EXISTS (SELECT 1 FROM public.task_labels WHERE id = label_id AND user_id = auth.uid())
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM public.tasks WHERE id = task_id AND user_id = auth.uid())
    AND EXISTS (SELECT 1 FROM public.task_labels WHERE id = label_id AND user_id = auth.uid())
  );


-- ════════════════════════════════════════════════════════════
-- Migration 005: Add 'options' tracking type to habits
-- Added: habits.options (jsonb), habit_entries.option_id (text)
-- Purpose: Custom multi-choice tracking (e.g., "no sugar", "medium",
--          "treated myself") where each option maps to a color
-- Date: 2026-01
-- ════════════════════════════════════════════════════════════

-- Add options column to habits
ALTER TABLE public.habits ADD COLUMN IF NOT EXISTS options jsonb;

-- Add option_id column to habit_entries
ALTER TABLE public.habit_entries ADD COLUMN IF NOT EXISTS option_id text;

-- Update tracking_type constraint to include 'options'
ALTER TABLE public.habits DROP CONSTRAINT IF EXISTS habits_tracking_type_check;
ALTER TABLE public.habits ADD CONSTRAINT habits_tracking_type_check
  CHECK (tracking_type IN ('boolean', 'numeric', 'timer', 'options'));
