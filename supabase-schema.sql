-- ============================================================
-- giHabit Web - Supabase Database Schema
-- Run this in the Supabase SQL Editor to set up your database
-- ============================================================

-- Enable UUID generation
create extension if not exists "uuid-ossp";

-- ── Habit Groups ──
create table public.habit_groups (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null default auth.uid(),
  name text not null,
  icon_name text not null default 'folder',
  color_hex text not null default '#3DD68C',
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);
alter table public.habit_groups enable row level security;
create policy "Users manage own groups" on public.habit_groups
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ── Habits ──
create table public.habits (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null default auth.uid(),
  title text not null,
  icon_name text not null default 'zap',
  color_hex text not null default '#3DD68C',
  frequency text not null default 'daily' check (frequency in ('daily', 'weekly')),
  tracking_type text not null default 'boolean' check (tracking_type in ('boolean', 'numeric', 'timer')),
  group_id uuid references public.habit_groups(id) on delete set null,
  weekly_target int,
  target_value double precision,
  unit text,
  target_minutes int,
  tags jsonb not null default '[]'::jsonb,
  is_archived boolean not null default false,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);
alter table public.habits enable row level security;
create policy "Users manage own habits" on public.habits
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ── Habit Entries ──
create table public.habit_entries (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null default auth.uid(),
  habit_id uuid references public.habits(id) on delete cascade not null,
  date date not null,
  value double precision,
  status text not null default 'completed' check (status in ('completed', 'skipped')),
  note text,
  created_at timestamptz not null default now(),
  unique(habit_id, date)
);
alter table public.habit_entries enable row level security;
create policy "Users manage own entries" on public.habit_entries
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ── Tasks ──
create table public.tasks (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null default auth.uid(),
  title text not null,
  icon_name text not null default 'check-circle',
  color_hex text not null default '#3DD68C',
  due_date timestamptz,
  parent_task_id uuid references public.tasks(id) on delete cascade,
  priority int not null default 4 check (priority between 1 and 4),
  status text not null default 'todo' check (status in ('todo', 'doing', 'done')),
  is_completed boolean not null default false,
  completed_at timestamptz,
  note text,
  voice_note_url text,
  recurrence text not null default 'none' check (recurrence in ('none', 'daily', 'weekdays', 'weekends', 'weekly', 'monthly', 'yearly', 'custom')),
  recurrence_rule jsonb,
  created_at timestamptz not null default now()
);
alter table public.tasks enable row level security;
create policy "Users manage own tasks" on public.tasks
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ── Task Projects ──
create table public.task_projects (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null default auth.uid(),
  name text not null,
  icon_name text not null default 'folder',
  color_hex text not null default '#5B9FFF',
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);
alter table public.task_projects enable row level security;
create policy "Users manage own projects" on public.task_projects
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ── Task Project Sections ──
create table public.task_project_sections (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid references public.task_projects(id) on delete cascade not null,
  name text not null,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);
alter table public.task_project_sections enable row level security;
create policy "Users manage own sections" on public.task_project_sections
  for all using (
    exists (select 1 from public.task_projects where id = project_id and user_id = auth.uid())
  );

-- ── Task Project Links ──
create table public.task_project_links (
  id uuid primary key default uuid_generate_v4(),
  task_id uuid references public.tasks(id) on delete cascade not null,
  project_id uuid references public.task_projects(id) on delete cascade not null,
  section_id uuid references public.task_project_sections(id) on delete set null,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);
alter table public.task_project_links enable row level security;
create policy "Users manage own links" on public.task_project_links
  for all using (
    exists (select 1 from public.tasks where id = task_id and user_id = auth.uid())
  );

-- ── Task Labels ──
create table public.task_labels (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null default auth.uid(),
  name text not null,
  color_hex text not null default '#B084FF',
  icon_name text,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);
alter table public.task_labels enable row level security;
create policy "Users manage own labels" on public.task_labels
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ── Task Label Links ──
create table public.task_label_links (
  id uuid primary key default uuid_generate_v4(),
  task_id uuid references public.tasks(id) on delete cascade not null,
  label_id uuid references public.task_labels(id) on delete cascade not null,
  created_at timestamptz not null default now()
);
alter table public.task_label_links enable row level security;
create policy "Users manage own label links" on public.task_label_links
  for all using (
    exists (select 1 from public.tasks where id = task_id and user_id = auth.uid())
  );

-- ── Task Saved Filters ──
create table public.task_saved_filters (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null default auth.uid(),
  name text not null,
  spec_json jsonb not null default '{}'::jsonb,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);
alter table public.task_saved_filters enable row level security;
create policy "Users manage own filters" on public.task_saved_filters
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ── Indexes for performance ──
create index idx_habits_user on public.habits(user_id);
create index idx_habit_entries_habit on public.habit_entries(habit_id);
create index idx_habit_entries_date on public.habit_entries(date);
create index idx_tasks_user on public.tasks(user_id);
create index idx_tasks_due_date on public.tasks(due_date);
create index idx_tasks_parent on public.tasks(parent_task_id);
create index idx_task_project_links_task on public.task_project_links(task_id);
create index idx_task_project_links_project on public.task_project_links(project_id);
create index idx_task_label_links_task on public.task_label_links(task_id);

-- ── Storage bucket for voice notes ──
insert into storage.buckets (id, name, public) values ('voice-notes', 'voice-notes', false);
create policy "Users upload own voice notes" on storage.objects
  for insert with check (bucket_id = 'voice-notes' and auth.uid()::text = (storage.foldername(name))[1]);
create policy "Users read own voice notes" on storage.objects
  for select using (bucket_id = 'voice-notes' and auth.uid()::text = (storage.foldername(name))[1]);
create policy "Users delete own voice notes" on storage.objects
  for delete using (bucket_id = 'voice-notes' and auth.uid()::text = (storage.foldername(name))[1]);
