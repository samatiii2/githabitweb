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
