# GitHabit Web

A web version of GitHabit — habit tracker with GitHub-style heatmap visualization.

## Tech Stack

- **Next.js 16** (App Router)
- **Tailwind CSS** + **shadcn/ui**
- **Supabase** (PostgreSQL, Auth, Storage)
- **Zustand** (state management)
- **Framer Motion** (animations)
- **Lucide React** (icons)

## Getting Started

### 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a free project
2. Go to **SQL Editor** and run the contents of `supabase-schema.sql` to create all tables
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

- **Habits**: Create, edit, delete. Boolean, numeric, and timer tracking.
- **Heatmap**: Full year GitHub-style visualization.
- **3 Display Modes**: Heatmap, Grid, List.
- **Tags**: Colored pill chips on habits.
- **Groups**: Organize habits by context.
- **Statistics**: Streak, best streak, total, completion rate.
- **Tasks**: CRUD with priorities (P1-P4), subtasks, recurring tasks.
- **Task Views**: Inbox (list), Board (Kanban), Calendar.
- **Projects & Labels**: Multi-assignment for tasks.
- **36 Challenges**: Predefined templates across 6 categories.
- **Search**: Quick search across habits and tasks.
- **Authentication**: Email/password via Supabase Auth.
- **Responsive**: Desktop sidebar + mobile bottom tabs.
- **Dark Theme**: Neon dark theme matching the iOS app.

## Deployment

Deploy to Vercel for free:

```bash
npx vercel
```

Or connect your GitHub repo to Vercel for automatic deployments.
