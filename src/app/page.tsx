import Link from 'next/link'
import { Flame, CheckCircle, BarChart3, Zap, ArrowRight, Github } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-background/80 backdrop-blur-xl border-b border-border z-50">
        <div className="max-w-6xl mx-auto h-full flex items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#3DD68C]/10 flex items-center justify-center">
              <Flame className="w-5 h-5 text-[#3DD68C]" />
            </div>
            <span className="font-bold text-lg">GitHabit</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm">Sign in</Button>
            </Link>
            <Link href="/signup">
              <Button size="sm" className="bg-[#3DD68C] text-black hover:bg-[#3DD68C]/90">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#3DD68C]/10 text-[#3DD68C] text-sm font-medium">
            <Zap className="w-4 h-4" />
            Free &middot; No app store needed
          </div>
          <h1 className="text-5xl md:text-6xl font-bold leading-tight tracking-tight">
            Build better habits,{' '}
            <span className="text-[#3DD68C]">one day at a time</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Track your habits with a beautiful GitHub-style heatmap. Manage tasks, set challenges, 
            and watch your consistency grow. Works on any device.
          </p>
          <div className="flex items-center justify-center gap-4 pt-4">
            <Link href="/signup">
              <Button size="lg" className="bg-[#3DD68C] text-black hover:bg-[#3DD68C]/90 gap-2">
                Start for free <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Heatmap demo */}
      <section className="pb-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-card rounded-2xl border border-border p-6 md:p-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-[#3DD68C]/10 flex items-center justify-center">
                <Flame className="w-5 h-5 text-[#3DD68C]" />
              </div>
              <div>
                <p className="font-semibold">Meditation</p>
                <p className="text-xs text-muted-foreground">Daily &middot; 243 day streak</p>
              </div>
            </div>
            {/* Simulated heatmap */}
            <div className="flex gap-[3px] overflow-hidden">
              {Array.from({ length: 52 }, (_, weekIdx) => (
                <div key={weekIdx} className="flex flex-col gap-[3px]">
                  {Array.from({ length: 7 }, (_, dayIdx) => {
                    const r = Math.random()
                    const opacity = r > 0.7 ? '1' : r > 0.4 ? '0.5' : '0.12'
                    return (
                      <div
                        key={dayIdx}
                        className="w-[10px] h-[10px] md:w-3 md:h-3 rounded-[2px]"
                        style={{ backgroundColor: `rgba(61,214,140,${opacity})` }}
                      />
                    )
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="pb-20 px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Everything you need to stay consistent</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: Flame,
                color: '#3DD68C',
                title: 'Habit Tracking',
                desc: 'Boolean, numeric, or timer tracking. Daily or weekly frequency. Beautiful heatmap visualization.',
              },
              {
                icon: CheckCircle,
                color: '#5B9FFF',
                title: 'Task Management',
                desc: 'Priorities, projects, labels, subtasks, Kanban boards, calendar view, and recurring tasks.',
              },
              {
                icon: BarChart3,
                color: '#B084FF',
                title: 'Statistics & Insights',
                desc: 'Streaks, completion rates, records. Share your heatmap as an image. Confetti celebrations.',
              },
            ].map((feature) => (
              <div key={feature.title} className="bg-card rounded-2xl border border-border p-6 space-y-4">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: `${feature.color}15` }}
                >
                  <feature.icon className="w-6 h-6" style={{ color: feature.color }} />
                </div>
                <h3 className="text-lg font-semibold">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="pb-20 px-6">
        <div className="max-w-2xl mx-auto text-center bg-card rounded-2xl border border-border p-10 space-y-6">
          <h2 className="text-3xl font-bold">Ready to build better habits?</h2>
          <p className="text-muted-foreground">Join for free. No credit card required. Works on desktop and mobile.</p>
          <Link href="/signup">
            <Button size="lg" className="bg-[#3DD68C] text-black hover:bg-[#3DD68C]/90 gap-2">
              Create free account <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Flame className="w-4 h-4 text-[#3DD68C]" />
            GitHabit &copy; {new Date().getFullYear()}
          </div>
          <div className="text-sm text-muted-foreground">
            Built with Next.js + Supabase
          </div>
        </div>
      </footer>
    </div>
  )
}
