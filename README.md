# giHabit Web

A modern habit tracker and task manager with GitHub-style heatmap visualizations, session-based workouts, and a Todoist-inspired task system.

**Live at [giHabit.com](https://gihabit.com)**

## Tech Stack

- **Next.js 16** (App Router, Server Components)
- **Tailwind CSS** + **shadcn/ui**
- **Supabase** (PostgreSQL, Auth, Storage, RLS)
- **Zustand** (state management)
- **Framer Motion** (animations)
- **Lucide React** (icons)
- **next-themes** (dark/light mode)
- **date-fns** (date utilities)
- **PWA** ready (manifest + icons)

## Getting Started

### 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a free project
2. Go to **SQL Editor** and run the contents of `sql/schema.sql` to create all tables
3. Go to **Settings > API** and copy your **Project URL** and **anon key**

### 2. Configure Environment

Edit `.env.local` and replace the placeholders:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### 3. Install & Run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Features

### Habits

- **Create, edit, delete** habits with custom icons, colors, and tags
- **Tracking types**: Boolean (yes/no), Numeric (count a value), Timer (duration)
- **Frequency**: Daily or Weekly (1-7 days per week)
- **Session-based habits**: For weekly habits, optionally name each session (e.g., Gym 4x/week with "Chest+Cardio", "Back+Biceps", "Legs", "Shoulders"). When checking in, a session picker shows what's left this week. Completed sessions are tracked until the week resets.
- **Groups**: Organize habits by context (Morning, Health, Work, etc.)
- **Tags**: Colored pill labels on each habit
- **Statistics**: Current streak, best streak, total completions, success rate — collapsible section

### Heatmap Visualizations

- **Yearly heatmap**: Full-year GitHub-style contribution map with clickable cells for toggling
- **Monthly view**: Compact per-month cards with square calendar cells, navigable, multiple cards per row
- **List view**: Compact rows with clickable 7-day mini cells for quick past-day entry
- **Habit detail page**: Yearly + Monthly tabs, both with clickable cells and session picker support
- **Responsive**: Horizontal scrolling on mobile for yearly view, adaptive cell sizing

### Tasks

- **Todoist-style inline creation**: Quick add bar with title, date picker, priority, project, and recurrence — all inline
- **Smart Views**: Inbox, Today, Upcoming (7 days), All tasks, Completed
- **Three view modes**: List (grouped), Board (Kanban columns), Calendar (month grid with task indicators)
- **Sort & Group**: Sort by priority / due date / created / alphabetical with direction toggle. Group by status / priority / due date (default) / none. Active values shown inline on buttons.
- **Priority system**: P1 (Urgent) through P4 (Normal) with colored indicators and filtering
- **Subtasks**: Nested tasks with progress bar
- **Recurrence engine**: Daily, weekdays, weekends, weekly, monthly, yearly, every X days/weeks, specific days of the week, date ranges
- **Calendar view**: Month grid showing tasks on their due dates, recurring tasks appear on all matching days, day detail popover
- **Task detail panel**: Read-only summary view (title, badges, date, recurrence, notes, tags, subtasks) with an "Edit" button to switch to full editing mode
- **Projects**: Assign tasks to projects with custom icons (34 options) and colors. Filter by project in sidebar. Edit project name/icon/color after creation.
- **Labels**: Multi-color labels assignable to tasks. Filter by label in sidebar.
- **Search**: Full-text search across task titles

### Themes

- **Dark mode**: Neon dark theme with elevated cards and subtle glows
- **Light mode**: Clean, professional light theme with proper contrast
- **Toggle**: Switch between dark and light from sidebar, header, or settings

### Other

- **Authentication**: Email/password via Supabase Auth (login + signup pages)
- **Responsive design**: Desktop sidebar layout + mobile bottom tabs with full-screen overlays
- **36 Challenges**: Predefined habit challenge templates across 6 categories
- **Landing page**: Marketing page with feature highlights
- **Settings page**: Theme selection, account info
- **PWA**: Installable as a Progressive Web App

## SQL Files

- `sql/schema.sql` — Complete database schema for a fresh Supabase project
- `sql/migrations.sql` — Incremental migrations for updating an existing database (idempotent, safe to re-run)

## Deployment

Deploy to Vercel:

```bash
npx vercel
```

Or connect your GitHub repo to Vercel for automatic deployments. Set the environment variables in the Vercel dashboard.

## Project Structure

```
web/
├── sql/                    # Database schema & migrations
├── public/                 # Static assets, manifest, icons
├── src/
│   ├── app/
│   │   ├── (auth)/         # Login & signup pages
│   │   ├── app/            # Main app pages
│   │   │   ├── page.tsx        # Habits dashboard
│   │   │   ├── habits/[id]/    # Habit detail page
│   │   │   ├── tasks/          # Task management
│   │   │   ├── challenges/     # Challenge templates
│   │   │   └── settings/       # User settings
│   │   ├── globals.css     # Theme variables & global styles
│   │   ├── layout.tsx      # Root layout with providers
│   │   └── page.tsx        # Landing page
│   ├── components/
│   │   ├── habits/         # Habit cards, toggle, dialogs, session picker
│   │   ├── tasks/          # Task detail, inline form, recurrence picker
│   │   ├── ui/             # shadcn/ui primitives
│   │   ├── app-shell.tsx   # Sidebar + header shell
│   │   ├── heatmap.tsx     # Yearly, Monthly, Mini heatmaps
│   │   ├── dynamic-icon.tsx
│   │   ├── theme-provider.tsx
│   │   └── theme-toggle.tsx
│   └── lib/
│       ├── store/          # Zustand stores (habits, tasks)
│       ├── supabase/       # Supabase client helpers
│       ├── types/          # TypeScript types (database.ts)
│       ├── utils/          # Stats, recurrence engine
│       └── constants.ts    # Colors, icons, priority labels
└── package.json
```
