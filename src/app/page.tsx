'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { motion, useInView, useScroll, useTransform } from 'framer-motion'
import {
  Flame, ArrowRight, Sparkles, Shield, Globe, Smartphone,
  CheckCircle2, CalendarDays, Target, TrendingUp, Repeat,
  FolderKanban, ListChecks, Timer, BarChart3, Dumbbell,
  Zap, Clock, Tag, Star, Layout, KanbanSquare,
  MonitorSmartphone, Quote, Trophy, Check, Inbox, Search,
  Settings, FolderOpen, Eye, ChevronDown,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useT } from '@/lib/i18n/provider'
import { LanguageSwitcher } from '@/components/language-switcher'

/* ───────── Scroll-triggered wrapper ───────── */

function FadeIn({ children, className = '', delay = 0, direction = 'up' }: {
  children: React.ReactNode; className?: string; delay?: number; direction?: 'up' | 'down' | 'left' | 'right'
}) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  const dirs = { up: { y: 40 }, down: { y: -40 }, left: { x: 40 }, right: { x: -40 } }
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, ...dirs[direction] }}
      animate={inView ? { opacity: 1, x: 0, y: 0 } : {}}
      transition={{ duration: 0.7, delay, ease: [0.25, 0.4, 0.25, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

function StaggerChildren({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={inView ? 'visible' : 'hidden'}
      variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.12 } } }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

const staggerItem = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' as const } },
}

/* ───────── Atoms ───────── */

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold tracking-wide">
      {children}
    </span>
  )
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p className="text-xs font-bold uppercase tracking-[0.15em] text-primary mb-3">{children}</p>
}

/* ───────── Seeded random ───────── */

function sv(w: number, d: number) {
  const x = Math.sin(w * 127.1 + d * 311.7) * 43758.5453
  return x - Math.floor(x)
}

/* ───────── Browser Frame (polished) ───────── */

function BrowserFrame({ children, url = 'app.gihabit.com/dashboard', glow = '' }: { children: React.ReactNode; url?: string; glow?: string }) {
  return (
    <div className="relative group">
      {glow && <div className={`absolute -inset-3 rounded-2xl blur-2xl opacity-40 group-hover:opacity-60 transition-opacity duration-700 ${glow}`} />}
      <div className="relative rounded-2xl border border-border/50 bg-card overflow-hidden shadow-[0_20px_70px_-15px_rgba(0,0,0,0.2)] dark:shadow-[0_20px_70px_-15px_rgba(0,0,0,0.5)]">
        <div className="h-10 bg-gradient-to-b from-muted/80 to-muted/40 border-b border-border/40 flex items-center px-4 gap-3">
          <div className="flex gap-2">
            <div className="w-3 h-3 rounded-full bg-[#FF5F57] shadow-inner" />
            <div className="w-3 h-3 rounded-full bg-[#FEBC2E] shadow-inner" />
            <div className="w-3 h-3 rounded-full bg-[#28C840] shadow-inner" />
          </div>
          <div className="flex-1 mx-2">
            <div className="bg-background/60 backdrop-blur-sm rounded-lg h-6 flex items-center px-3 text-[11px] text-muted-foreground/50 font-medium">
              <span className="mr-1.5 text-green-500/50">&#9679;</span> {url}
            </div>
          </div>
        </div>
        <div className="bg-background">{children}</div>
      </div>
    </div>
  )
}

/* ───────── Phone Mockup (polished) ───────── */

function PhoneMockup({ children, glow = '' }: { children: React.ReactNode; glow?: string }) {
  return (
    <div className="relative group">
      {glow && <div className={`absolute -inset-3 rounded-[32px] blur-2xl opacity-30 group-hover:opacity-50 transition-opacity duration-700 ${glow}`} />}
      <div className="relative w-[210px] lg:w-[240px] rounded-[32px] border-[4px] border-foreground/8 bg-card overflow-hidden shadow-[0_25px_80px_-15px_rgba(0,0,0,0.25)] dark:shadow-[0_25px_80px_-15px_rgba(0,0,0,0.6)]">
        <div className="h-7 bg-background flex items-center justify-center relative">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-5 bg-foreground/5 rounded-b-2xl" />
        </div>
        <div className="bg-background min-h-[280px]">{children}</div>
        <div className="h-5 bg-background flex items-center justify-center">
          <div className="w-28 h-1 rounded-full bg-foreground/10" />
        </div>
      </div>
    </div>
  )
}

/* ───────── SVG Mini Heatmap (matches real app) ───────── */

function SvgMiniHeatmap({ color, offset = 0, weeks = 52, cellSize = 5, gap = 2 }: { color: string; offset?: number; weeks?: number; cellSize?: number; gap?: number }) {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const monthW = (weeks / 12) * (cellSize + gap)
  const w = weeks * (cellSize + gap)
  const monthLabelH = cellSize > 3 ? 10 : 0
  const h = monthLabelH + 7 * (cellSize + gap)
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-auto overflow-visible" preserveAspectRatio="xMinYMin meet">
      {cellSize > 3 && months.map((m, i) => (
        <text key={m} x={i * monthW} y={8} fontSize={Math.max(4, cellSize * 0.9)} fontWeight={500} className="fill-muted-foreground/40">{m}</text>
      ))}
      {Array.from({ length: weeks }, (_, wk) =>
        Array.from({ length: 7 }, (_, d) => {
          const r = sv(wk + offset, d)
          const opacity = r > 0.6 ? 1 : r > 0.3 ? 0.35 : 0.04
          return <rect key={`${wk}-${d}`} x={wk * (cellSize + gap)} y={monthLabelH + d * (cellSize + gap)} width={cellSize} height={cellSize} rx={cellSize > 4 ? 2 : 1} fill={color} opacity={opacity} />
        })
      )}
    </svg>
  )
}

/* ───────── Mini Dashboard (pixel-matched to real app) ───────── */

const DASH_HABITS = [
  { name: 'Meditation', icon: '🧘', color: '#3DD68C', streak: 45, total: 120, offset: 0 },
  { name: 'Read 30min', icon: '📚', color: '#B084FF', streak: 12, total: 89, offset: 5 },
  { name: 'Sleep 8h', icon: '😴', color: '#f97316', streak: 7, total: 34, offset: 10 },
  { name: 'No sugar', icon: '🍎', color: '#A78BFA', streak: 21, total: 56, offset: 15 },
  { name: 'Exercise', icon: '💪', color: '#64B5F6', streak: 30, total: 98, offset: 20 },
  { name: 'Journaling', icon: '✍️', color: '#F48FB1', streak: 8, total: 42, offset: 25 },
]

function MiniDashboard() {
  return (
    <div className="flex h-[520px] lg:h-[600px]">
      {/* ── Sidebar with text labels ── */}
      <div className="w-[70px] lg:w-[85px] border-r border-border/30 bg-muted/5 flex flex-col py-3 px-2 shrink-0">
        <div className="flex items-center gap-1 mb-4 px-0.5">
          <div className="w-5 h-5 rounded-md bg-primary/15 flex items-center justify-center"><Flame className="w-3 h-3 text-primary" /></div>
          <span className="text-[8px] lg:text-[9px] font-bold hidden lg:block">giHabit</span>
        </div>
        <div className="space-y-0.5">
          <div className="flex items-center gap-1.5 px-1.5 py-1.5 rounded-lg bg-primary/10">
            <Layout className="w-3 h-3 text-primary shrink-0" />
            <span className="text-[7px] lg:text-[8px] font-semibold text-primary truncate">Habits</span>
          </div>
          <div className="flex items-center gap-1.5 px-1.5 py-1.5 rounded-lg">
            <ListChecks className="w-3 h-3 text-muted-foreground/50 shrink-0" />
            <span className="text-[7px] lg:text-[8px] text-muted-foreground/50 truncate">Tasks</span>
          </div>
          <div className="flex items-center gap-1.5 px-1.5 py-1.5 rounded-lg">
            <Settings className="w-3 h-3 text-muted-foreground/50 shrink-0" />
            <span className="text-[7px] lg:text-[8px] text-muted-foreground/50 truncate">Settings</span>
          </div>
        </div>
        <div className="mt-auto">
          <div className="flex items-center gap-1 bg-secondary/40 rounded-lg px-1 py-1">
            <div className="w-3 h-3 rounded-full bg-muted-foreground/10" />
            <div className="w-3 h-3 rounded-full bg-muted-foreground/10" />
          </div>
        </div>
      </div>

      {/* ── Main content ── */}
      <div className="flex-1 p-3 lg:p-5 overflow-hidden">
        {/* Header row */}
        <div className="flex items-start justify-between mb-1.5">
          <div>
            <p className="text-sm lg:text-lg font-bold leading-tight">Good morning ✨</p>
            <p className="text-[7px] lg:text-[9px] text-muted-foreground mt-0.5">Friday, February 20, 2026</p>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-6 px-2 rounded-lg border border-amber-500/40 bg-amber-500/5 text-[7px] lg:text-[8px] font-semibold text-amber-500 flex items-center gap-1"><Trophy className="w-3 h-3" />Challenges</div>
            <div className="h-6 px-2 rounded-lg bg-primary text-[7px] lg:text-[8px] font-semibold text-primary-foreground flex items-center gap-0.5">+ New habit</div>
          </div>
        </div>

        {/* Show statistics toggle */}
        <div className="flex items-center gap-1.5 mb-2 text-[7px] lg:text-[8px] text-muted-foreground">
          <ChevronDown className="w-2.5 h-2.5" />
          <span>Show statistics</span>
          <span className="text-muted-foreground/40">— 0/7 today · 0%</span>
        </div>

        {/* Search + filters row */}
        <div className="flex items-center gap-2 mb-3">
          <div className="flex-1 h-6 rounded-lg bg-secondary/50 flex items-center px-2 gap-1.5 max-w-[180px]">
            <Search className="w-3 h-3 text-muted-foreground/40" />
            <span className="text-[8px] text-muted-foreground/40">Search habits...</span>
          </div>
          <div className="h-6 px-2 rounded-lg bg-secondary/50 flex items-center gap-1 text-[8px] text-muted-foreground">
            <FolderOpen className="w-3 h-3" />
            <span>Categories</span>
            <ChevronDown className="w-2.5 h-2.5" />
          </div>
          <div className="flex items-center bg-secondary/80 rounded-lg p-0.5 border border-border/50 ml-auto">
            <div className="h-5 px-2 rounded-md bg-card shadow-sm text-[7px] lg:text-[8px] font-semibold flex items-center gap-1"><Layout className="w-2.5 h-2.5" />Year</div>
            <div className="h-5 px-2 text-[7px] lg:text-[8px] text-muted-foreground flex items-center gap-1"><CalendarDays className="w-2.5 h-2.5" />Month</div>
            <div className="h-5 px-2 text-[7px] lg:text-[8px] text-muted-foreground flex items-center gap-1"><ListChecks className="w-2.5 h-2.5" />List</div>
          </div>
        </div>

        {/* Habits grid — 2 columns, 3 rows */}
        <div className="grid grid-cols-2 gap-2.5">
          {DASH_HABITS.map(h => (
            <div key={h.name} className="rounded-xl border border-border/40 bg-card/30 p-2.5 lg:p-3">
              {/* Card header: icon + name + stats + check-in btn */}
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 lg:w-7 lg:h-7 rounded-xl flex items-center justify-center text-[10px] lg:text-xs" style={{ backgroundColor: `${h.color}20` }}>{h.icon}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-[9px] lg:text-[11px] font-bold truncate" style={{ color: h.color }}>{h.name}</p>
                  <div className="flex items-center gap-2 text-[6px] lg:text-[7px] text-muted-foreground">
                    <span className="flex items-center gap-0.5"><Zap className="w-2 h-2 lg:w-2.5 lg:h-2.5 text-orange-500" />{h.streak}d streak</span>
                    <span className="flex items-center gap-0.5"><Eye className="w-2 h-2 lg:w-2.5 lg:h-2.5" />{h.total} total</span>
                  </div>
                </div>
                <div className="w-3.5 h-3.5 lg:w-4 lg:h-4 rounded shrink-0 border-[1.5px]" style={{ borderColor: h.color, backgroundColor: `${h.color}15` }} />
              </div>
              {/* Full year heatmap spanning card width */}
              <SvgMiniHeatmap color={h.color} offset={h.offset} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ───────── Mini Mobile Dashboard ───────── */

function MiniMobileDash() {
  const mobileHabits = [
    { name: 'Meditation', icon: '🧘', color: '#3DD68C', streak: 45, total: 120, offset: 0 },
    { name: 'Sleep 8h', icon: '😴', color: '#f97316', streak: 7, total: 34, offset: 10 },
    { name: 'Exercise', icon: '💪', color: '#64B5F6', streak: 30, total: 98, offset: 20 },
  ]
  return (
    <div className="p-2.5 space-y-1.5">
      <div className="flex items-center justify-between mb-0.5">
        <div>
          <p className="text-[9px] font-bold">Good morning ✨</p>
          <p className="text-[5px] text-muted-foreground">Friday, February 20, 2026</p>
        </div>
        <div className="flex items-center gap-1">
          <div className="h-4 px-1 rounded border border-amber-500/30 text-[5px] font-medium text-amber-500 flex items-center gap-0.5"><Trophy className="w-2 h-2" />Challenges</div>
          <div className="h-4 px-1 rounded bg-primary text-[5px] font-semibold text-primary-foreground flex items-center">+ New</div>
        </div>
      </div>
      <div className="flex items-center gap-1 mb-0.5">
        <div className="flex-1 h-4 rounded bg-secondary/50 flex items-center px-1 gap-0.5">
          <Search className="w-2 h-2 text-muted-foreground/40" />
          <span className="text-[5px] text-muted-foreground/40">Search...</span>
        </div>
        <div className="flex items-center bg-secondary/80 rounded p-0.5 border border-border/50">
          <div className="h-3 px-1 rounded bg-card shadow-sm text-[5px] font-medium">Year</div>
          <div className="h-3 px-1 text-[5px] text-muted-foreground">Month</div>
        </div>
      </div>
      {mobileHabits.map(h => (
        <div key={h.name} className="rounded-lg border border-border/40 bg-card/30 p-1.5">
          <div className="flex items-center gap-1 mb-1">
            <div className="w-4 h-4 rounded-md flex items-center justify-center text-[7px]" style={{ backgroundColor: `${h.color}20` }}>{h.icon}</div>
            <div className="flex-1 min-w-0">
              <p className="text-[7px] font-bold truncate" style={{ color: h.color }}>{h.name}</p>
              <p className="text-[5px] text-muted-foreground flex items-center gap-1"><Zap className="w-1.5 h-1.5 text-orange-500" />{h.streak}d streak &middot; {h.total} total</p>
            </div>
            <div className="w-3.5 h-3.5 rounded-sm border-[1.5px] shrink-0" style={{ borderColor: h.color, backgroundColor: `${h.color}15` }} />
          </div>
          <SvgMiniHeatmap color={h.color} offset={h.offset} weeks={26} cellSize={2} gap={1} />
        </div>
      ))}
    </div>
  )
}

/* ───────── Animated Heatmap (wave fill) ───────── */

function InteractiveHeatmapCard({ visible, t }: { visible: boolean; t: (k: string) => string }) {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const dayLabels = ['Mon', '', 'Wed', '', 'Fri', '', '']
  const weeks = 52
  const cs = 14
  const g = 3
  const labelOff = 28
  const monthH = 18
  const svgW = labelOff + weeks * (cs + g)
  const svgH = monthH + 7 * (cs + g)

  const HABITS_DEMO = [
    { name: 'Meditation', icon: '🧘', color: '#3DD68C' },
    { name: 'Exercise', icon: '💪', color: '#64B5F6' },
    { name: 'Read 30min', icon: '📚', color: '#B084FF' },
  ]

  const [activeHabit, setActiveHabit] = useState(0)
  const [clicked, setClicked] = useState<Set<string>>(new Set())
  const [pulse, setPulse] = useState<string | null>(null)
  const [streak, setStreak] = useState(45)
  const [total, setTotal] = useState(120)

  const h = HABITS_DEMO[activeHabit]

  const toggleCell = (key: string) => {
    setClicked(prev => {
      const next = new Set(prev)
      if (next.has(key)) { next.delete(key); setStreak(s => s - 1); setTotal(s => s - 1) }
      else { next.add(key); setStreak(s => s + 1); setTotal(s => s + 1) }
      return next
    })
    setPulse(key)
    setTimeout(() => setPulse(null), 400)
  }

  const switchHabit = (i: number) => {
    setActiveHabit(i)
    setClicked(new Set())
    setStreak([45, 30, 12][i])
    setTotal([120, 98, 89][i])
  }

  return (
    <div className="card-elevated rounded-2xl p-5 lg:p-8 relative overflow-hidden max-w-4xl mx-auto">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-emerald-500/3 pointer-events-none" />
      <div className="relative">
        {/* Header: habit switcher + legend */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            {HABITS_DEMO.map((hb, i) => (
              <button key={hb.name} onClick={() => switchHabit(i)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all duration-300 ${i === activeHabit ? 'bg-card shadow-md border border-border/50 scale-105' : 'hover:bg-secondary/50 opacity-50 hover:opacity-80'}`}>
                <div className="w-7 h-7 rounded-lg flex items-center justify-center text-sm" style={{ backgroundColor: `${hb.color}20` }}>{hb.icon}</div>
                <div className="hidden sm:block text-left">
                  <p className="text-xs font-semibold" style={{ color: i === activeHabit ? hb.color : undefined }}>{hb.name}</p>
                  <p className="text-[10px] text-muted-foreground">{t('habits.daily')}</p>
                </div>
              </button>
            ))}
          </div>
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground">
            <span>{t('common.less')}</span>
            {[0.06, 0.25, 0.5, 0.75, 1].map((o, i) => <div key={i} className="w-3 h-3 rounded-[2px] transition-colors duration-300" style={{ backgroundColor: h.color, opacity: o }} />)}
            <span>{t('common.more')}</span>
          </div>
        </div>

        {/* Heatmap SVG — clickable cells */}
        <svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full max-w-[900px] mx-auto h-auto overflow-visible cursor-pointer select-none">
          {months.map((m, i) => (
            <text key={m} x={labelOff + i * (weeks / 12) * (cs + g)} y={12} fontSize={10} fontWeight={500} className="fill-muted-foreground/50" style={{ transition: 'opacity 0.5s', transitionDelay: `${i * 40}ms`, opacity: visible ? 1 : 0 }}>{m}</text>
          ))}
          {dayLabels.map((l, i) => l && (
            <text key={i} x={0} y={monthH + i * (cs + g) + cs * 0.75} fontSize={9} fontWeight={500} className="fill-muted-foreground/50" style={{ transition: 'opacity 0.5s', opacity: visible ? 1 : 0 }}>{l}</text>
          ))}
          {Array.from({ length: weeks }, (_, wk) =>
            Array.from({ length: 7 }, (_, d) => {
              const key = `${wk}-${d}`
              const r = sv(wk, d)
              const baseOp = r > 0.65 ? 1 : r > 0.35 ? 0.4 : 0.04
              const isClicked = clicked.has(key)
              const finalOp = isClicked ? 1 : baseOp
              const isPulsing = pulse === key
              return (
                <rect
                  key={key}
                  x={labelOff + wk * (cs + g)}
                  y={monthH + d * (cs + g)}
                  width={cs}
                  height={cs}
                  rx={2.5}
                  fill={h.color}
                  opacity={visible ? finalOp : 0.04}
                  onClick={() => toggleCell(key)}
                  className="cursor-pointer hover:opacity-80"
                  style={{
                    transition: isPulsing ? 'transform 0.3s, opacity 0.3s' : 'fill 0.4s ease, opacity 0.5s ease',
                    transitionDelay: visible && !isClicked && !isPulsing ? `${(wk * 7 + d) * 4}ms` : '0ms',
                    filter: isPulsing ? `drop-shadow(0 0 6px ${h.color})` : 'none',
                  }}
                />
              )
            })
          )}
        </svg>

        {/* Hint */}
        <p className="text-center text-[10px] text-muted-foreground/40 mt-2 animate-pulse">← Click on cells to check in!</p>

        {/* Stats row */}
        <div className="grid grid-cols-4 gap-4 mt-5 pt-4 border-t border-border/50">
          {[
            { label: t('landing.currentStreak'), val: streak, suffix: ` ${t('landing.days')}`, icon: Zap, color: '#f97316' },
            { label: t('landing.bestStreak'), val: streak, suffix: ` ${t('landing.days')}`, icon: Star, color: '#eab308' },
            { label: t('landing.totalCheckins'), val: total, suffix: '', icon: Target, color: h.color },
            { label: t('landing.completionRate'), val: Math.min(99, Math.round(total / 365 * 100)), suffix: '%', icon: TrendingUp, color: '#60a5fa' },
          ].map(stat => (
            <div key={stat.label} className="text-center">
              <div className="flex items-center justify-center gap-1.5">
                <stat.icon className="w-3.5 h-3.5 hidden sm:block" style={{ color: stat.color }} />
                <p className="text-base sm:text-lg font-bold transition-all duration-300" style={{ color: stat.color }}>{visible ? stat.val.toLocaleString() : 0}{stat.suffix}</p>
              </div>
              <p className="text-[10px] text-muted-foreground mt-0.5 uppercase tracking-wider">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ───────── Interactive Task List ───────── */

const TASKS_INIT = [
  { title: 'Review Q1 marketing plan', done: true, project: 'Marketing', color: '#f97316' },
  { title: 'Design new onboarding flow', done: true, project: 'Product', color: '#60a5fa' },
  { title: 'Prepare investor deck slides', done: false, project: 'Business', color: '#a78bfa' },
  { title: 'Weekly team standup notes', done: false, project: 'Marketing', color: '#f97316' },
  { title: 'Fix login page responsive bug', done: false, project: 'Product', color: '#60a5fa' },
]

function InteractiveTaskList({ t }: { t: (k: string) => string }) {
  const [tasks, setTasks] = useState(TASKS_INIT)
  const [pulse, setPulse] = useState<number | null>(null)
  const done = tasks.filter(x => x.done).length

  const toggle = (i: number) => {
    setTasks(p => p.map((x, j) => j === i ? { ...x, done: !x.done } : x))
    setPulse(i); setTimeout(() => setPulse(null), 600)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-sm">{t('landing.todaysTasks')}</h3>
          <span className="text-[10px] font-medium text-muted-foreground bg-secondary rounded-full px-2 py-0.5">{tasks.length} {t('landing.tasks')}</span>
        </div>
        <div className="text-[10px] text-primary font-medium bg-primary/10 rounded-full px-2 py-0.5">{done} {t('landing.doneCount')}</div>
      </div>
      <div className="space-y-1">
        {tasks.map((tk, i) => (
          <button key={i} onClick={() => toggle(i)} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-accent/50 transition-all text-left group">
            <div className={`w-[20px] h-[20px] rounded-full border-2 flex items-center justify-center shrink-0 transition-all duration-500 ${tk.done ? 'border-primary bg-primary scale-110' : 'border-border group-hover:border-primary/50'} ${pulse === i ? 'ring-[6px] ring-primary/15 scale-125' : ''}`}>
              {tk.done && <Check className="w-3 h-3 text-primary-foreground" strokeWidth={3} />}
            </div>
            <span className={`text-sm flex-1 transition-all duration-500 ${tk.done ? 'line-through text-muted-foreground/60' : 'text-foreground'}`}>{tk.title}</span>
            <span className="text-[10px] font-medium px-2.5 py-0.5 rounded-full" style={{ backgroundColor: `${tk.color}12`, color: tk.color }}>{tk.project}</span>
          </button>
        ))}
      </div>
      <p className="text-center text-[10px] text-muted-foreground/40 mt-3">{t('landing.tryClicking')}</p>
    </div>
  )
}

/* ───────── Mini Tasks List (matches real app screenshot) ───────── */

function MiniTasksList() {
  const sidebarViews = [
    { name: 'Inbox', icon: Inbox, count: 9, active: true, color: '#3DD68C' },
    { name: 'Today', icon: Star, count: 1, active: false },
    { name: 'Upcoming', icon: CalendarDays, count: 1, active: false },
    { name: 'All tasks', icon: ListChecks, count: 24, active: false },
    { name: 'Completed', icon: CheckCircle2, count: 15, active: false },
  ]
  const categories = [
    { name: 'Sport', count: 1 },
    { name: 'Work', count: 7 },
    { name: 'Personal', count: 13 },
  ]
  const taskGroups = [
    { label: 'OVERDUE', color: '#ef4444', count: 1, tasks: [
      { title: 'Finish quarterly report', pri: '#ef4444', date: 'Feb 19' },
    ] },
    { label: 'TOMORROW', color: '#60a5fa', count: 1, tasks: [
      { title: 'Book dentist appointment', pri: '#f59e0b', date: 'Tomorrow' },
    ] },
    { label: 'NO DATE', color: '#6b7280', count: 4, tasks: [
      { title: 'Research new project ideas', pri: '#ef4444', date: '' },
      { title: 'Review marketing strategy', pri: '#f59e0b', date: '' },
      { title: 'Plan weekend workout routine', pri: '#22c55e', date: '' },
      { title: 'Update portfolio website', pri: '#60a5fa', date: '' },
    ] },
  ]
  return (
    <div className="flex h-[420px] lg:h-[480px]">
      {/* Left sidebar with views/categories */}
      <div className="w-[52px] lg:w-[60px] border-r border-border/30 bg-muted/10 flex flex-col items-center py-3 shrink-0">
        <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center mb-3"><Flame className="w-3.5 h-3.5 text-primary" /></div>
        <div className="space-y-1.5 flex flex-col items-center">
          <div className="w-8 h-7 rounded-lg flex items-center justify-center"><Layout className="w-3 h-3 text-muted-foreground/40" /></div>
          <div className="w-8 h-7 rounded-lg bg-primary/8 flex items-center justify-center"><ListChecks className="w-3 h-3 text-primary" /></div>
          <div className="w-8 h-7 rounded-lg flex items-center justify-center"><Settings className="w-3 h-3 text-muted-foreground/40" /></div>
        </div>
      </div>

      {/* Tasks sidebar */}
      <div className="w-[100px] lg:w-[120px] border-r border-border/30 bg-muted/5 py-2.5 px-1.5 lg:px-2 shrink-0 overflow-hidden">
        <p className="text-[6px] font-semibold text-muted-foreground/50 uppercase tracking-wider mb-1.5 px-1">Views</p>
        {sidebarViews.map(v => (
          <div key={v.name} className={`flex items-center gap-1 px-1.5 py-1 rounded-md text-[7px] lg:text-[8px] mb-0.5 ${v.active ? 'bg-primary/8 text-primary font-semibold' : 'text-muted-foreground'}`}>
            <v.icon className="w-2.5 h-2.5 shrink-0" />
            <span className="flex-1 truncate">{v.name}</span>
            <span className={`text-[6px] min-w-[14px] text-center px-1 py-0.5 rounded-full ${v.active ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground'}`}>{v.count}</span>
          </div>
        ))}
        <p className="text-[6px] font-semibold text-muted-foreground/50 uppercase tracking-wider mt-2 mb-1.5 px-1 flex items-center justify-between">Categories <span className="text-primary">+</span></p>
        {categories.map(c => (
          <div key={c.name} className="flex items-center gap-1 px-1.5 py-1 rounded-md text-[7px] lg:text-[8px] text-muted-foreground mb-0.5">
            <FolderOpen className="w-2.5 h-2.5 shrink-0" />
            <span className="flex-1 truncate">{c.name}</span>
            <span className="text-[6px] text-muted-foreground/50">{c.count}</span>
          </div>
        ))}
        <p className="text-[6px] font-semibold text-muted-foreground/50 uppercase tracking-wider mt-2 mb-1 px-1 flex items-center justify-between">Labels <span className="text-primary">+</span></p>
      </div>

      {/* Main task list */}
      <div className="flex-1 p-3 lg:p-4 overflow-hidden">
        <div className="mb-2">
          <p className="text-[11px] lg:text-sm font-bold">Inbox</p>
          <p className="text-[7px] text-muted-foreground">Active tasks</p>
        </div>
        <div className="flex items-center gap-1.5 mb-2.5">
          <div className="flex-1 h-5 rounded-md bg-secondary/50 flex items-center px-1.5 gap-1">
            <Search className="w-2.5 h-2.5 text-muted-foreground/40" />
            <span className="text-[7px] text-muted-foreground/40">Search...</span>
          </div>
          <div className="h-5 px-1.5 rounded-md bg-secondary/50 flex items-center text-[6px] text-muted-foreground">Sort: Created</div>
          <div className="h-5 px-1.5 rounded-md bg-primary/10 text-primary flex items-center text-[6px] font-medium">Group: By due date</div>
          <div className="flex items-center bg-secondary/80 rounded-md p-0.5 border border-border/50">
            <div className="h-4 px-1 rounded bg-card shadow-sm text-[6px] font-medium flex items-center"><ListChecks className="w-2 h-2" /></div>
            <div className="h-4 px-1 text-[6px] text-muted-foreground flex items-center"><KanbanSquare className="w-2 h-2" /></div>
          </div>
        </div>

        {/* Add task card */}
        <div className="rounded-xl bg-primary/5 border border-primary/20 p-2 mb-2.5 flex items-center gap-2">
          <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center"><span className="text-[10px] text-primary font-bold">+</span></div>
          <div>
            <p className="text-[8px] font-semibold">Add task</p>
            <p className="text-[6px] text-muted-foreground">Click to create a new task</p>
          </div>
        </div>

        {/* Task groups */}
        <div className="space-y-2 overflow-hidden">
          {taskGroups.map(g => (
            <div key={g.label}>
              <div className="flex items-center gap-1.5 mb-1">
                <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: g.color }} />
                <span className="text-[7px] font-bold uppercase tracking-wider" style={{ color: g.color }}>{g.label}</span>
                <span className="text-[6px] text-muted-foreground/50">({g.count})</span>
              </div>
              <div className="rounded-lg border border-border/30 divide-y divide-border/20 overflow-hidden">
                {g.tasks.map(task => (
                  <div key={task.title} className="flex items-center gap-2 px-2 py-1.5">
                    <div className="w-3.5 h-3.5 rounded-full border-[1.5px] border-border shrink-0" />
                    <span className="text-[7px] lg:text-[8px] font-medium flex-1 truncate">{task.title}</span>
                    <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: task.pri }} />
                    {task.date && <span className="text-[6px] text-muted-foreground/50">{task.date}</span>}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ───────── App Preview Tabs ───────── */

function PreviewTabs({ t }: { t: (k: string) => string }) {
  const [tab, setTab] = useState(0)
  const tabs = [
    { label: t('landing.tabDashboard'), icon: Layout },
    { label: t('landing.tabTasks'), icon: ListChecks },
    { label: t('landing.tabMobile'), icon: MonitorSmartphone },
  ]

  return (
    <div>
      <div className="flex items-center justify-center gap-2 mb-10 flex-wrap">
        {tabs.map((tb, i) => (
          <button key={i} onClick={() => setTab(i)} className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-semibold transition-all duration-300 ${tab === i ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25 scale-105' : 'bg-secondary/60 text-muted-foreground hover:text-foreground hover:bg-secondary'}`}>
            <tb.icon className="w-4 h-4" />
            <span className="hidden sm:inline">{tb.label}</span>
          </button>
        ))}
      </div>
      <div className="max-w-5xl mx-auto">
        {tab === 0 && <motion.div key="tab0" initial={{ opacity: 0, y: 20, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.4, ease: 'easeOut' }}><BrowserFrame glow="bg-primary/20"><MiniDashboard /></BrowserFrame></motion.div>}
        {tab === 1 && <motion.div key="tab1" initial={{ opacity: 0, y: 20, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.4, ease: 'easeOut' }}><BrowserFrame url="app.gihabit.com/tasks" glow="bg-blue-500/20"><MiniTasksList /></BrowserFrame></motion.div>}
        {tab === 2 && <motion.div key="tab2" initial={{ opacity: 0, y: 20, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.4, ease: 'easeOut' }} className="flex justify-center"><PhoneMockup glow="bg-primary/20"><MiniMobileDash /></PhoneMockup></motion.div>}
      </div>
    </div>
  )
}

/* ───────── Mini Feature Illustrations ───────── */

function IllustHeatmap() {
  return (
    <div className="mt-3">
      <SvgMiniHeatmap color="#3DD68C" offset={3} weeks={14} cellSize={6} gap={2} />
      <div className="flex items-center gap-1 mt-1 text-[6px] text-muted-foreground/40">
        <span>Less</span>
        {[0.06, 0.25, 0.5, 0.75, 1].map((o, i) => <div key={i} className="w-[5px] h-[5px] rounded-[1px]" style={{ backgroundColor: '#3DD68C', opacity: o }} />)}
        <span>More</span>
      </div>
    </div>
  )
}

function IllustTasks() {
  return (
    <div className="space-y-1.5 mt-3">
      {[true, true, false].map((done, i) => (
        <div key={i} className="flex items-center gap-2">
          <div className={`w-3.5 h-3.5 rounded-full border-[1.5px] shrink-0 flex items-center justify-center ${done ? 'bg-primary border-primary' : 'border-border'}`}>
            {done && <Check className="w-2 h-2 text-primary-foreground" strokeWidth={3} />}
          </div>
          <div className={`h-1.5 rounded-full ${done ? 'bg-muted-foreground/15' : 'bg-foreground/12'}`} style={{ width: `${55 + i * 18}%` }} />
        </div>
      ))}
    </div>
  )
}

function IllustTimer() {
  return (
    <div className="flex items-center justify-center mt-3">
      <div className="w-16 h-16 rounded-full border-[3px] border-primary/20 flex items-center justify-center relative">
        <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 40 40">
          <circle cx="20" cy="20" r="17" fill="none" stroke="hsl(var(--primary))" strokeWidth="3" strokeDasharray="107" strokeDashoffset="35" strokeLinecap="round" />
        </svg>
        <span className="text-[10px] font-bold text-primary">12:30</span>
      </div>
    </div>
  )
}

function IllustStreak() {
  return (
    <div className="flex items-end gap-1 mt-3 h-12">
      {[3, 5, 4, 7, 6, 9, 10].map((h, i) => (
        <div key={i} className="flex-1 rounded-t transition-all" style={{ height: `${h * 10}%`, backgroundColor: i === 6 ? 'hsl(var(--primary))' : 'hsl(var(--primary) / 0.15)' }} />
      ))}
    </div>
  )
}

function IllustCalendar() {
  return (
    <div className="mt-3">
      <div className="grid grid-cols-7 gap-[2px] mb-1">
        {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => <div key={i} className="text-center text-[5px] font-semibold text-muted-foreground/40">{d}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-[2px]">
        {Array.from({ length: 28 }, (_, i) => {
          const r = sv(i + 1, 5)
          const hasTask = r > 0.7
          return (
            <div key={i} className={`aspect-square rounded-[2px] relative ${i === 14 ? 'ring-1 ring-primary/40' : ''}`} style={{ backgroundColor: 'hsl(var(--muted-foreground) / 0.04)' }}>
              {hasTask && <div className="absolute bottom-[1px] left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary" />}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function IllustChallenges() {
  return (
    <div className="flex items-center gap-3 mt-3">
      <div className="w-11 h-11 rounded-xl bg-amber-500/10 flex items-center justify-center shrink-0">
        <Trophy className="w-5 h-5 text-amber-500" />
      </div>
      <div className="flex-1 space-y-1.5">
        <div className="h-1.5 rounded-full bg-amber-500/40 w-3/4" />
        <div className="h-1 rounded-full bg-muted-foreground/8 w-1/2" />
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════
   MAIN LANDING PAGE
   ═══════════════════════════════════════════ */

export default function LandingPage() {
  const t = useT()

  const heatmapRef = useRef(null)
  const heatmapVisible = useInView(heatmapRef, { once: true, margin: '-80px' })

  const heroRef = useRef(null)
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] })
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 120])
  const heroScale = useTransform(scrollYProgress, [0, 1], [1, 0.92])
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0])

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* ━━━ Header ━━━ */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-background/80 backdrop-blur-xl border-b border-border/50 z-50">
        <div className="max-w-6xl mx-auto h-full flex items-center justify-between px-6">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center"><Flame className="w-4 h-4 text-primary" /></div>
            <span className="font-bold text-base tracking-tight">giHabit</span>
          </div>
          <div className="flex items-center gap-2">
            <LanguageSwitcher compact />
            <Link href="/login"><Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">{t('landing.signIn')}</Button></Link>
            <Link href="/signup"><Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold shadow-lg shadow-primary/10">{t('landing.getStarted')}</Button></Link>
          </div>
        </div>
      </header>

      {/* ━━━ Hero ━━━ */}
      <section ref={heroRef} className="relative pt-28 pb-8 lg:pt-40 lg:pb-14 px-6">
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="max-w-4xl mx-auto text-center relative"
        >
          <Badge><Sparkles className="w-3.5 h-3.5" /> {t('landing.badge')}</Badge>
          <h1 className="mt-6 text-4xl sm:text-5xl lg:text-[3.5rem] font-extrabold leading-[1.08] tracking-tight">
            {t('landing.heroTitle')}<br />
            <span className="bg-gradient-to-r from-primary via-emerald-400 to-teal-400 bg-clip-text text-transparent">{t('landing.heroTitleHighlight')}</span>
          </h1>
          <p className="mt-5 text-base lg:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">{t('landing.heroDesc')}</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-8">
            <Link href="/signup"><Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2 font-semibold shadow-xl shadow-primary/20 h-12 px-7 text-[15px]">{t('landing.startFree')} <ArrowRight className="w-4 h-4" /></Button></Link>
            <a href="#features"><Button variant="outline" size="lg" className="h-12 px-7 text-[15px] gap-2 border-border/60 text-muted-foreground hover:text-foreground">{t('landing.seeHow')}</Button></a>
          </div>
          <div className="mt-10 flex items-center justify-center gap-8 sm:gap-12 text-center">
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
        </motion.div>
      </section>

      {/* ━━━ Hero — App Preview (parallax + floating) ━━━ */}
      <section className="px-6 pb-24 lg:pb-32">
        <motion.div
          style={{ y: heroY, scale: heroScale, opacity: heroOpacity }}
          className="max-w-5xl mx-auto"
        >
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.4, ease: [0.25, 0.4, 0.25, 1] }}
          >
            <div className="flex items-end justify-center gap-6 lg:gap-10">
              <div className="flex-1 max-w-4xl">
                <BrowserFrame glow="bg-gradient-to-br from-primary/30 to-emerald-500/20">
                  <MiniDashboard />
                </BrowserFrame>
              </div>
              <motion.div
                className="hidden lg:block shrink-0 -mb-6"
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              >
                <PhoneMockup glow="bg-gradient-to-br from-blue-500/25 to-violet-500/20">
                  <MiniMobileDash />
                </PhoneMockup>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* ━━━ Product Showcase — Habits (Animated Heatmap) ━━━ */}
      <section id="features" className="pb-20 lg:pb-32 px-6" ref={heatmapRef}>
        <div className="max-w-6xl mx-auto">
          <FadeIn className="text-center mb-14">
            <SectionLabel>{t('landing.habitSection')}</SectionLabel>
            <h2 className="text-3xl lg:text-4xl font-bold tracking-tight">{t('landing.habitTitle')}</h2>
            <p className="text-muted-foreground mt-3 max-w-xl mx-auto">{t('landing.habitDesc')}</p>
          </FadeIn>

          <FadeIn delay={0.2}>
            <InteractiveHeatmapCard visible={heatmapVisible} t={t} />
          </FadeIn>

          <FadeIn delay={0.3}>
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
                  <pill.icon className="w-3.5 h-3.5 text-primary" />{pill.text}
                </div>
              ))}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ━━━ Product Showcase — Tasks (Interactive) ━━━ */}
      <section className="pb-20 lg:pb-32 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <FadeIn direction="right">
              <SectionLabel>{t('landing.taskSection')}</SectionLabel>
              <h2 className="text-3xl lg:text-4xl font-bold tracking-tight">
                {t('landing.taskTitle')} <br className="hidden sm:block" />
                <span className="text-primary">{t('landing.taskTitleHighlight')}</span>
              </h2>
              <p className="text-muted-foreground mt-4 leading-relaxed">{t('landing.taskDesc')}</p>
              <div className="mt-8 space-y-4">
                {[
                  { icon: FolderKanban, title: t('landing.taskProjects'), desc: t('landing.taskProjectsDesc') },
                  { icon: ListChecks, title: t('landing.taskSubtasks'), desc: t('landing.taskSubtasksDesc') },
                  { icon: Repeat, title: t('landing.taskRecurring'), desc: t('landing.taskRecurringDesc') },
                  { icon: CalendarDays, title: t('landing.taskCalendar'), desc: t('landing.taskCalendarDesc') },
                ].map(f => (
                  <div key={f.title} className="flex gap-3.5">
                    <div className="w-9 h-9 rounded-lg bg-primary/8 flex items-center justify-center shrink-0 mt-0.5"><f.icon className="w-4 h-4 text-primary" /></div>
                    <div><p className="font-semibold text-sm">{f.title}</p><p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{f.desc}</p></div>
                  </div>
                ))}
              </div>
            </FadeIn>

            <FadeIn direction="left">
              <div className="card-elevated rounded-2xl p-5 lg:p-6 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/3 via-transparent to-violet-500/3 pointer-events-none" />
                <div className="relative">
                  <InteractiveTaskList t={t} />
                  <div className="flex items-center gap-2 mt-4 pt-3 border-t border-border/50">
                    {[
                      { icon: Tag, label: t('landing.labels') },
                      { icon: FolderKanban, label: t('landing.projects') },
                      { icon: Clock, label: t('common.dueDate') },
                    ].map(btn => (
                      <div key={btn.label} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-secondary/70 text-[11px] text-muted-foreground">
                        <btn.icon className="w-3 h-3" />{btn.label}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ━━━ How it works ━━━ */}
      <section className="pb-20 lg:pb-32 px-6">
        <div className="max-w-4xl mx-auto">
          <FadeIn className="text-center mb-14">
            <SectionLabel>{t('landing.howSection')}</SectionLabel>
            <h2 className="text-3xl lg:text-4xl font-bold tracking-tight">{t('landing.howTitle')}</h2>
          </FadeIn>
          <StaggerChildren className="grid sm:grid-cols-3 gap-8">
            {[
              { step: '1', title: t('landing.step1Title'), desc: t('landing.step1Desc'), icon: Flame },
              { step: '2', title: t('landing.step2Title'), desc: t('landing.step2Desc'), icon: CheckCircle2 },
              { step: '3', title: t('landing.step3Title'), desc: t('landing.step3Desc'), icon: TrendingUp },
            ].map(item => (
              <motion.div key={item.step} variants={staggerItem} className="text-center relative">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4 relative">
                  <item.icon className="w-6 h-6 text-primary" />
                  <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center shadow-lg">{item.step}</span>
                </div>
                <h3 className="font-semibold text-base">{item.title}</h3>
                <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </StaggerChildren>
        </div>
      </section>

      {/* ━━━ Discover the App — Multi-view Tabs ━━━ */}
      <section className="pb-20 lg:pb-32 px-6">
        <div className="max-w-6xl mx-auto">
          <FadeIn className="text-center mb-14">
            <SectionLabel>{t('landing.discoverSection')}</SectionLabel>
            <h2 className="text-3xl lg:text-4xl font-bold tracking-tight">{t('landing.discoverTitle')}</h2>
            <p className="text-muted-foreground mt-3 max-w-xl mx-auto">{t('landing.discoverDesc')}</p>
          </FadeIn>
          <FadeIn delay={0.15}>
            <PreviewTabs t={t} />
          </FadeIn>
        </div>
      </section>

      {/* ━━━ Feature grid ━━━ */}
      <section className="pb-20 lg:pb-32 px-6">
        <div className="max-w-6xl mx-auto">
          <FadeIn className="text-center mb-14">
            <SectionLabel>{t('landing.featuresSection')}</SectionLabel>
            <h2 className="text-3xl lg:text-4xl font-bold tracking-tight">{t('landing.featuresTitle')}</h2>
            <p className="text-muted-foreground mt-3 max-w-lg mx-auto">{t('landing.featuresDesc')}</p>
          </FadeIn>
          <StaggerChildren className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: Flame, color: '#3DD68C', title: t('landing.featHeatmaps'), desc: t('landing.featHeatmapsDesc'), illust: <IllustHeatmap /> },
              { icon: ListChecks, color: '#60a5fa', title: t('landing.featTaskMgr'), desc: t('landing.featTaskMgrDesc'), illust: <IllustTasks /> },
              { icon: Timer, color: '#f97316', title: t('landing.featSessions'), desc: t('landing.featSessionsDesc'), illust: <IllustTimer /> },
              { icon: Target, color: '#eab308', title: t('landing.featStreaks'), desc: t('landing.featStreaksDesc'), illust: <IllustStreak /> },
              { icon: CalendarDays, color: '#ec4899', title: t('landing.featCalendar'), desc: t('landing.featCalendarDesc'), illust: <IllustCalendar /> },
              { icon: Trophy, color: '#8b5cf6', title: t('landing.featChallenges'), desc: t('landing.featChallengesDesc'), illust: <IllustChallenges /> },
            ].map(f => (
              <motion.div key={f.title} variants={staggerItem} className="card-elevated rounded-2xl p-6 hover:scale-[1.02] hover:shadow-lg transition-all duration-300">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${f.color}12` }}>
                    <f.icon className="w-5 h-5" style={{ color: f.color }} />
                  </div>
                  <h3 className="font-semibold">{f.title}</h3>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
                {f.illust}
              </motion.div>
            ))}
          </StaggerChildren>
        </div>
      </section>

      {/* ━━━ Testimonials ━━━ */}
      <section className="pb-20 lg:pb-32 px-6">
        <div className="max-w-5xl mx-auto">
          <FadeIn className="text-center mb-14">
            <SectionLabel>{t('landing.testimonialSection')}</SectionLabel>
            <h2 className="text-3xl lg:text-4xl font-bold tracking-tight">{t('landing.testimonialTitle')}</h2>
          </FadeIn>
          <StaggerChildren className="grid sm:grid-cols-3 gap-6">
            {[
              { quote: t('landing.testimonial1'), name: 'Sarah M.', role: t('landing.testimonial1Role'), color: '#B084FF' },
              { quote: t('landing.testimonial2'), name: 'Karim B.', role: t('landing.testimonial2Role'), color: '#3DD68C' },
              { quote: t('landing.testimonial3'), name: 'Laura D.', role: t('landing.testimonial3Role'), color: '#64B5F6' },
            ].map((item, i) => (
              <motion.div key={i} variants={staggerItem} className="card-elevated rounded-2xl p-6 relative hover:scale-[1.02] transition-transform duration-300">
                <Quote className="w-8 h-8 mb-3 opacity-10" style={{ color: item.color }} />
                <p className="text-sm text-foreground/80 leading-relaxed italic">&ldquo;{item.quote}&rdquo;</p>
                <div className="mt-5 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg" style={{ backgroundColor: item.color }}>{item.name[0]}</div>
                  <div><p className="text-sm font-semibold">{item.name}</p><p className="text-[11px] text-muted-foreground">{item.role}</p></div>
                </div>
              </motion.div>
            ))}
          </StaggerChildren>
        </div>
      </section>

      {/* ━━━ Trust signals ━━━ */}
      <section className="pb-20 lg:pb-32 px-6">
        <div className="max-w-4xl mx-auto">
          <StaggerChildren className="grid sm:grid-cols-3 gap-8">
            {[
              { icon: Globe, title: t('landing.trustDevice'), desc: t('landing.trustDeviceDesc') },
              { icon: Shield, title: t('landing.trustPrivacy'), desc: t('landing.trustPrivacyDesc') },
              { icon: Smartphone, title: t('landing.trustInstall'), desc: t('landing.trustInstallDesc') },
            ].map(item => (
              <motion.div key={item.title} variants={staggerItem} className="text-center space-y-3">
                <div className="w-14 h-14 rounded-2xl bg-secondary flex items-center justify-center mx-auto"><item.icon className="w-6 h-6 text-muted-foreground" /></div>
                <h4 className="font-semibold">{item.title}</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </StaggerChildren>
        </div>
      </section>

      {/* ━━━ Final CTA ━━━ */}
      <FadeIn className="pb-20 lg:pb-32 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="card-elevated rounded-3xl p-10 lg:p-14 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/8 via-transparent to-emerald-500/5 pointer-events-none" />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-primary/5 rounded-full blur-[80px] pointer-events-none" />
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6"><Flame className="w-8 h-8 text-primary" /></div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight">{t('landing.ctaTitle')}</h2>
              <p className="text-muted-foreground mt-3 max-w-lg mx-auto">{t('landing.ctaDesc')}</p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-8">
                <Link href="/signup"><Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2 font-semibold shadow-xl shadow-primary/20 h-12 px-7 text-[15px]">{t('landing.ctaButton')} <ArrowRight className="w-4 h-4" /></Button></Link>
              </div>
              <p className="text-xs text-muted-foreground mt-4">{t('landing.ctaNoCC')}</p>
            </div>
          </div>
        </div>
      </FadeIn>

      {/* ━━━ Footer ━━━ */}
      <footer className="border-t border-border/50 py-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Flame className="w-3.5 h-3.5 text-primary" />
            <span className="text-xs">giHabit &copy; {new Date().getFullYear()}. {t('landing.footerRights')}</span>
          </div>
          <div className="flex items-center gap-4 text-xs text-muted-foreground"><span>{t('landing.footerTagline')}</span></div>
        </div>
      </footer>
    </div>
  )
}
