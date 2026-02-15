'use client'

import Link from 'next/link'
import {
  Flame, ArrowRight, Sparkles, Shield, Globe, Smartphone,
  CheckCircle2, CalendarDays, Target, TrendingUp, Repeat,
  FolderKanban, ListChecks, Timer, BarChart3, Dumbbell, BookOpen, Droplets,
  Zap, Clock, Tag, Star
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useT } from '@/lib/i18n/provider'
import { LanguageSwitcher } from '@/components/language-switcher'

/* ───────── Tiny reusable atoms ───────── */

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold tracking-wide">
      {children}
    </span>
  )
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-bold uppercase tracking-[0.15em] text-primary mb-3">{children}</p>
  )
}

/* ───────── Heatmap visual (static, decorative) ───────── */

function seededVal(week: number, day: number) {
  const x = Math.sin(week * 127.1 + day * 311.7) * 43758.5453
  return x - Math.floor(x)
}

function DemoHeatmap() {
  return (
    <div className="flex gap-[3px] overflow-hidden">
      {Array.from({ length: 40 }, (_, w) => (
        <div key={w} className="flex flex-col gap-[3px]">
          {Array.from({ length: 7 }, (_, d) => {
            const r = seededVal(w, d)
            const opacity = r > 0.65 ? 1 : r > 0.35 ? 0.4 : 0.08
            return (
              <div
                key={d}
                className="w-[11px] h-[11px] lg:w-[14px] lg:h-[14px] rounded-[3px]"
                style={{ backgroundColor: `rgba(61,214,140,${opacity})` }}
              />
            )
          })}
        </div>
      ))}
    </div>
  )
}

/* ───────── Fake mini-task list for visual ───────── */

const DEMO_TASKS = [
  { title: 'Review Q1 marketing plan', done: true, priority: 1, project: 'Marketing', color: '#f97316' },
  { title: 'Design new onboarding flow', done: true, priority: 2, project: 'Product', color: '#60a5fa' },
  { title: 'Prepare investor deck slides', done: false, priority: 1, project: 'Business', color: '#a78bfa' },
  { title: 'Weekly team standup notes', done: false, priority: 3, project: 'Marketing', color: '#f97316' },
  { title: 'Fix login page responsive bug', done: false, priority: 2, project: 'Product', color: '#60a5fa' },
]

function DemoTaskList() {
  return (
    <div className="space-y-1">
      {DEMO_TASKS.map((task, i) => (
        <div key={i} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-accent/50 transition-colors group">
          <div className={`w-[18px] h-[18px] rounded-full border-2 flex items-center justify-center shrink-0 ${task.done ? 'border-primary bg-primary' : 'border-border group-hover:border-muted-foreground'}`}>
            {task.done && <span className="text-primary-foreground text-[9px] font-bold">✓</span>}
          </div>
          <span className={`text-sm flex-1 ${task.done ? 'line-through text-muted-foreground' : 'text-foreground'}`}>{task.title}</span>
          <span className="text-[10px] font-medium px-2 py-0.5 rounded-full" style={{ backgroundColor: `${task.color}15`, color: task.color }}>
            {task.project}
          </span>
        </div>
      ))}
    </div>
  )
}

/* ───────── Main Page ───────── */

export default function LandingPage() {
  const t = useT()

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* ━━━ Header ━━━ */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-background/80 backdrop-blur-xl border-b border-border/50 z-50">
        <div className="max-w-6xl mx-auto h-full flex items-center justify-between px-6">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Flame className="w-4 h-4 text-primary" />
            </div>
            <span className="font-bold text-base tracking-tight">giHabit</span>
          </div>
          <div className="flex items-center gap-2">
            <LanguageSwitcher compact />
            <Link href="/login">
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">{t('landing.signIn')}</Button>
            </Link>
            <Link href="/signup">
              <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold shadow-lg shadow-primary/10">
                {t('landing.getStarted')}
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* ━━━ Hero ━━━ */}
      <section className="relative pt-28 pb-20 lg:pt-40 lg:pb-32 px-6">
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center relative">
          <Badge><Sparkles className="w-3.5 h-3.5" /> {t('landing.badge')}</Badge>

          <h1 className="mt-6 text-4xl sm:text-5xl lg:text-[3.5rem] font-extrabold leading-[1.08] tracking-tight">
            {t('landing.heroTitle')}
            <br />
            <span className="bg-gradient-to-r from-primary via-emerald-400 to-teal-400 bg-clip-text text-transparent">
              {t('landing.heroTitleHighlight')}
            </span>
          </h1>

          <p className="mt-5 text-base lg:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            {t('landing.heroDesc')}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-8">
            <Link href="/signup">
              <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2 font-semibold shadow-xl shadow-primary/20 h-12 px-7 text-[15px]">
                {t('landing.startFree')} <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <a href="#features">
              <Button variant="outline" size="lg" className="h-12 px-7 text-[15px] gap-2 border-border/60 text-muted-foreground hover:text-foreground">
                {t('landing.seeHow')}
              </Button>
            </a>
          </div>

          <div className="mt-12 flex items-center justify-center gap-8 sm:gap-12 text-center">
            {[
              { value: '10K+', label: t('landing.statHabits') },
              { value: '94%', label: t('landing.statRate') },
              { value: '4.9/5', label: t('landing.statSatisfaction') },
            ].map(s => (
              <div key={s.label}>
                <p className="text-xl sm:text-2xl font-bold text-foreground">{s.value}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ━━━ Product Showcase — Habits ━━━ */}
      <section id="features" className="pb-20 lg:pb-32 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <SectionLabel>{t('landing.habitSection')}</SectionLabel>
            <h2 className="text-3xl lg:text-4xl font-bold tracking-tight">
              {t('landing.habitTitle')}
            </h2>
            <p className="text-muted-foreground mt-3 max-w-xl mx-auto">
              {t('landing.habitDesc')}
            </p>
          </div>

          <div className="card-elevated rounded-2xl p-6 lg:p-8 relative overflow-hidden max-w-4xl mx-auto">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-emerald-500/3 pointer-events-none" />
            <div className="relative">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Flame className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold">Meditation</p>
                    <p className="text-xs text-muted-foreground">{t('habits.daily')} &middot; 243 {t('landing.days')} {t('habits.streak')}</p>
                  </div>
                </div>
                <div className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground">
                  <span>{t('common.less')}</span>
                  {[0.08, 0.25, 0.5, 0.75, 1].map((o, i) => (
                    <div key={i} className="w-3 h-3 rounded-[2px]" style={{ backgroundColor: `rgba(61,214,140,${o})` }} />
                  ))}
                  <span>{t('common.more')}</span>
                </div>
              </div>

              <DemoHeatmap />

              <div className="grid grid-cols-4 gap-4 mt-6 pt-5 border-t border-border/50">
                {[
                  { label: t('landing.currentStreak'), value: `243 ${t('landing.days')}`, icon: Zap, color: '#f97316' },
                  { label: t('landing.bestStreak'), value: `243 ${t('landing.days')}`, icon: Star, color: '#eab308' },
                  { label: t('landing.totalCheckins'), value: '1,247', icon: Target, color: 'var(--primary)' },
                  { label: t('landing.completionRate'), value: '94%', icon: TrendingUp, color: '#60a5fa' },
                ].map(stat => (
                  <div key={stat.label} className="text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <stat.icon className="w-3.5 h-3.5 hidden sm:block" style={{ color: stat.color }} />
                      <p className="text-base sm:text-lg font-bold" style={{ color: stat.color }}>{stat.value}</p>
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-0.5 uppercase tracking-wider">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 mt-10">
            {[
              { icon: CheckCircle2, text: t('landing.pillDaily') },
              { icon: Timer, text: t('landing.pillTimer') },
              { icon: BarChart3, text: t('landing.pillNumeric') },
              { icon: Dumbbell, text: t('landing.pillSessions') },
              { icon: CalendarDays, text: t('landing.pillMonthly') },
              { icon: Repeat, text: t('landing.pillStreaks') },
            ].map(pill => (
              <div key={pill.text} className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-secondary/70 text-sm text-muted-foreground">
                <pill.icon className="w-3.5 h-3.5 text-primary" />
                {pill.text}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ━━━ Product Showcase — Tasks ━━━ */}
      <section className="pb-20 lg:pb-32 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div>
              <SectionLabel>{t('landing.taskSection')}</SectionLabel>
              <h2 className="text-3xl lg:text-4xl font-bold tracking-tight">
                {t('landing.taskTitle')} <br className="hidden sm:block" />
                <span className="text-primary">{t('landing.taskTitleHighlight')}</span>
              </h2>
              <p className="text-muted-foreground mt-4 leading-relaxed">
                {t('landing.taskDesc')}
              </p>

              <div className="mt-8 space-y-4">
                {[
                  { icon: FolderKanban, title: t('landing.taskProjects'), desc: t('landing.taskProjectsDesc') },
                  { icon: ListChecks, title: t('landing.taskSubtasks'), desc: t('landing.taskSubtasksDesc') },
                  { icon: Repeat, title: t('landing.taskRecurring'), desc: t('landing.taskRecurringDesc') },
                  { icon: CalendarDays, title: t('landing.taskCalendar'), desc: t('landing.taskCalendarDesc') },
                ].map(f => (
                  <div key={f.title} className="flex gap-3.5">
                    <div className="w-9 h-9 rounded-lg bg-primary/8 flex items-center justify-center shrink-0 mt-0.5">
                      <f.icon className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{f.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{f.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="card-elevated rounded-2xl p-5 lg:p-6 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/3 via-transparent to-violet-500/3 pointer-events-none" />
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-sm">{t('landing.todaysTasks')}</h3>
                    <span className="text-[10px] font-medium text-muted-foreground bg-secondary rounded-full px-2 py-0.5">
                      5 {t('landing.tasks')}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="text-[10px] text-primary font-medium bg-primary/10 rounded-full px-2 py-0.5">
                      2 {t('landing.doneCount')}
                    </div>
                  </div>
                </div>

                <DemoTaskList />

                <div className="flex items-center gap-2 mt-4 pt-3 border-t border-border/50">
                  {[
                    { icon: Tag, label: t('landing.labels') },
                    { icon: FolderKanban, label: t('landing.projects') },
                    { icon: Clock, label: t('common.dueDate') },
                  ].map(btn => (
                    <div key={btn.label} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-secondary/70 text-[11px] text-muted-foreground">
                      <btn.icon className="w-3 h-3" />
                      {btn.label}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ━━━ How it works ━━━ */}
      <section className="pb-20 lg:pb-32 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <SectionLabel>{t('landing.howSection')}</SectionLabel>
            <h2 className="text-3xl lg:text-4xl font-bold tracking-tight">
              {t('landing.howTitle')}
            </h2>
          </div>

          <div className="grid sm:grid-cols-3 gap-8">
            {[
              { step: '1', title: t('landing.step1Title'), desc: t('landing.step1Desc'), icon: Flame },
              { step: '2', title: t('landing.step2Title'), desc: t('landing.step2Desc'), icon: CheckCircle2 },
              { step: '3', title: t('landing.step3Title'), desc: t('landing.step3Desc'), icon: TrendingUp },
            ].map(item => (
              <div key={item.step} className="text-center relative">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4 relative">
                  <item.icon className="w-6 h-6 text-primary" />
                  <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center shadow-lg">
                    {item.step}
                  </span>
                </div>
                <h3 className="font-semibold text-base">{item.title}</h3>
                <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ━━━ Feature grid ━━━ */}
      <section className="pb-20 lg:pb-32 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <SectionLabel>{t('landing.featuresSection')}</SectionLabel>
            <h2 className="text-3xl lg:text-4xl font-bold tracking-tight">
              {t('landing.featuresTitle')}
            </h2>
            <p className="text-muted-foreground mt-3 max-w-lg mx-auto">
              {t('landing.featuresDesc')}
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { icon: Flame, color: '#3DD68C', title: t('landing.featHeatmaps'), desc: t('landing.featHeatmapsDesc') },
              { icon: ListChecks, color: '#60a5fa', title: t('landing.featTaskMgr'), desc: t('landing.featTaskMgrDesc') },
              { icon: Dumbbell, color: '#f97316', title: t('landing.featSessions'), desc: t('landing.featSessionsDesc') },
              { icon: Repeat, color: '#a78bfa', title: t('landing.featRecurring'), desc: t('landing.featRecurringDesc') },
              { icon: Target, color: '#eab308', title: t('landing.featStreaks'), desc: t('landing.featStreaksDesc') },
              { icon: CalendarDays, color: '#ec4899', title: t('landing.featCalendar'), desc: t('landing.featCalendarDesc') },
              { icon: BarChart3, color: '#14b8a6', title: t('landing.featStats'), desc: t('landing.featStatsDesc') },
              { icon: BookOpen, color: '#8b5cf6', title: t('landing.featChallenges'), desc: t('landing.featChallengesDesc') },
              { icon: Droplets, color: '#06b6d4', title: t('landing.featTypes'), desc: t('landing.featTypesDesc') },
            ].map(f => (
              <div key={f.title} className="card-elevated rounded-2xl p-6 space-y-3 hover:scale-[1.015] transition-all duration-200">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${f.color}12` }}>
                  <f.icon className="w-5 h-5" style={{ color: f.color }} />
                </div>
                <h3 className="font-semibold">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ━━━ Trust signals ━━━ */}
      <section className="pb-20 lg:pb-32 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="grid sm:grid-cols-3 gap-8">
            {[
              { icon: Globe, title: t('landing.trustDevice'), desc: t('landing.trustDeviceDesc') },
              { icon: Shield, title: t('landing.trustPrivacy'), desc: t('landing.trustPrivacyDesc') },
              { icon: Smartphone, title: t('landing.trustInstall'), desc: t('landing.trustInstallDesc') },
            ].map(item => (
              <div key={item.title} className="text-center space-y-3">
                <div className="w-14 h-14 rounded-2xl bg-secondary flex items-center justify-center mx-auto">
                  <item.icon className="w-6 h-6 text-muted-foreground" />
                </div>
                <h4 className="font-semibold">{item.title}</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ━━━ Final CTA ━━━ */}
      <section className="pb-20 lg:pb-32 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="card-elevated rounded-3xl p-10 lg:p-14 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/8 via-transparent to-emerald-500/5 pointer-events-none" />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-primary/5 rounded-full blur-[80px] pointer-events-none" />

            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
                <Flame className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight">
                {t('landing.ctaTitle')}
              </h2>
              <p className="text-muted-foreground mt-3 max-w-lg mx-auto">
                {t('landing.ctaDesc')}
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-8">
                <Link href="/signup">
                  <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2 font-semibold shadow-xl shadow-primary/20 h-12 px-7 text-[15px]">
                    {t('landing.ctaButton')} <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
              <p className="text-xs text-muted-foreground mt-4">{t('landing.ctaNoCC')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ━━━ Footer ━━━ */}
      <footer className="border-t border-border/50 py-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Flame className="w-3.5 h-3.5 text-primary" />
            <span className="text-xs">giHabit &copy; {new Date().getFullYear()}. {t('landing.footerRights')}</span>
          </div>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span>{t('landing.footerTagline')}</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
