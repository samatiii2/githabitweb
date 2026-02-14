import Link from 'next/link'
import { Flame, CheckCircle, BarChart3, Zap, ArrowRight, Sparkles, Shield, Globe, Smartphone } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-background/80 backdrop-blur-xl border-b border-border z-50">
        <div className="max-w-6xl mx-auto h-full flex items-center justify-between px-6">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Flame className="w-4 h-4 text-primary" />
            </div>
            <span className="font-bold text-base tracking-tight">giHabit</span>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/login">
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">Sign in</Button>
            </Link>
            <Link href="/signup">
              <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold shadow-lg shadow-primary/10">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="pt-28 pb-16 lg:pt-36 lg:pb-24 px-6">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/8 text-primary text-xs font-semibold tracking-wide uppercase">
            <Sparkles className="w-3.5 h-3.5" />
            Free · No app store required
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.1] tracking-tight">
            Build better habits,
            <br />
            <span className="bg-gradient-to-r from-primary to-emerald-400 bg-clip-text text-transparent">
              one day at a time
            </span>
          </h1>
          <p className="text-base lg:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Track your habits with a beautiful GitHub-style heatmap. Manage tasks, take on challenges,
            and watch your consistency grow. Works on any device.
          </p>
          <div className="flex items-center justify-center gap-3 pt-2">
            <Link href="/signup">
              <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2 font-semibold shadow-xl shadow-primary/15 h-12 px-6">
                Start for free <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Heatmap demo */}
      <section className="pb-16 lg:pb-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="card-elevated rounded-2xl p-6 lg:p-8 relative overflow-hidden">
            {/* Subtle gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />

            <div className="relative">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Flame className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold">Meditation</p>
                  <p className="text-xs text-muted-foreground">Daily · 243 day streak</p>
                </div>
              </div>

              {/* Simulated heatmap */}
              <div className="flex gap-[3px] overflow-hidden">
                {Array.from({ length: 52 }, (_, weekIdx) => (
                  <div key={weekIdx} className="flex flex-col gap-[3px]">
                    {Array.from({ length: 7 }, (_, dayIdx) => {
                      const r = Math.random()
                      const opacity = r > 0.7 ? '1' : r > 0.4 ? '0.4' : '0.06'
                      return (
                        <div
                          key={dayIdx}
                          className="w-[10px] h-[10px] lg:w-[13px] lg:h-[13px] rounded-[2.5px]"
                          style={{ backgroundColor: `rgba(61,214,140,${opacity})` }}
                        />
                      )
                    })}
                  </div>
                ))}
              </div>

              {/* Stats row */}
              <div className="flex items-center gap-6 mt-5 pt-4 border-t border-border">
                {[
                  { label: 'Current Streak', value: '243d', color: '#f97316' },
                  { label: 'Best Streak', value: '243d', color: '#eab308' },
                  { label: 'Total', value: '1,247', color: 'var(--primary)' },
                  { label: 'Rate', value: '94%', color: '#60a5fa' },
                ].map(stat => (
                  <div key={stat.label} className="text-center">
                    <p className="text-lg font-bold" style={{ color: stat.color }}>{stat.value}</p>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="pb-16 lg:pb-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold tracking-tight">Everything you need to stay consistent</h2>
            <p className="text-muted-foreground mt-3 max-w-xl mx-auto">
              A complete toolkit for building habits and managing tasks, designed for focus and simplicity.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {[
              {
                icon: Flame,
                color: 'var(--primary)',
                title: 'Habit Tracking',
                desc: 'Boolean, numeric, or timer tracking. Daily or weekly frequency. Beautiful GitHub-style heatmap visualization.',
              },
              {
                icon: CheckCircle,
                color: '#60a5fa',
                title: 'Task Management',
                desc: 'Priorities, projects, labels, subtasks, Kanban boards, and recurring tasks. Everything organized.',
              },
              {
                icon: BarChart3,
                color: '#a78bfa',
                title: 'Statistics & Insights',
                desc: 'Streaks, completion rates, and records. Track your progress over time with detailed analytics.',
              },
            ].map((feature) => (
              <div key={feature.title} className="card-elevated rounded-2xl p-6 lg:p-7 space-y-4 hover:scale-[1.01] transition-all">
                <div
                  className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center",
                    feature.color === 'var(--primary)' ? "bg-primary/10" : ""
                  )}
                  style={feature.color !== 'var(--primary)' ? { backgroundColor: `${feature.color}10` } : undefined}
                >
                  <feature.icon className={cn("w-6 h-6", feature.color === 'var(--primary)' ? "text-primary" : "")} style={feature.color !== 'var(--primary)' ? { color: feature.color } : undefined} />
                </div>
                <h3 className="text-lg font-semibold">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust signals */}
      <section className="pb-16 lg:pb-24 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="grid sm:grid-cols-3 gap-6">
            {[
              { icon: Globe, title: 'Works everywhere', desc: 'Desktop, tablet, or phone. Access from any browser.' },
              { icon: Shield, title: 'Secure & private', desc: 'Your data is encrypted and never shared with third parties.' },
              { icon: Smartphone, title: 'Install as app', desc: 'Add to your home screen for a native app experience.' },
            ].map(item => (
              <div key={item.title} className="text-center space-y-3">
                <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center mx-auto">
                  <item.icon className="w-5 h-5 text-muted-foreground" />
                </div>
                <h4 className="font-semibold text-sm">{item.title}</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="pb-16 lg:pb-24 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <div className="card-elevated rounded-2xl p-8 lg:p-12 space-y-5 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
            <div className="relative">
              <h2 className="text-2xl lg:text-3xl font-bold tracking-tight">Ready to build better habits?</h2>
              <p className="text-muted-foreground mt-2">Join for free. No credit card required.</p>
              <Link href="/signup">
                <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2 font-semibold mt-6 shadow-xl shadow-primary/15 h-12 px-6">
                  Create free account <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Flame className="w-3.5 h-3.5 text-primary" />
            <span className="text-xs">giHabit &copy; {new Date().getFullYear()}</span>
          </div>
          <div className="text-xs text-muted-foreground">
            Built with Next.js + Supabase
          </div>
        </div>
      </footer>
    </div>
  )
}
