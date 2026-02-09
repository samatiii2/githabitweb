'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/lib/auth/auth-context'
import { Flame, CheckSquare, Trophy, Settings, LogOut, Search, Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useState } from 'react'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  { href: '/app', label: 'Habits', icon: Flame },
  { href: '/app/tasks', label: 'Tasks', icon: CheckSquare },
  { href: '/app/challenges', label: 'Challenges', icon: Trophy },
  { href: '/app/settings', label: 'Settings', icon: Settings },
]

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { user, signOut, loading } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Flame className="w-8 h-8 text-[#3DD68C] animate-pulse" />
      </div>
    )
  }

  const isActive = (href: string) => {
    if (href === '/app') return pathname === '/app' || pathname.startsWith('/app/habits')
    return pathname.startsWith(href)
  }

  return (
    <div className="min-h-screen flex">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 border-r border-border bg-card fixed inset-y-0 left-0 z-30">
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 h-16 border-b border-border">
          <div className="w-9 h-9 rounded-xl bg-[#3DD68C]/10 flex items-center justify-center">
            <Flame className="w-5 h-5 text-[#3DD68C]" />
          </div>
          <span className="font-bold text-lg">GitHabit</span>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon
            const active = isActive(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors',
                  active
                    ? 'bg-[#3DD68C]/10 text-[#3DD68C]'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                )}
              >
                <Icon className="w-5 h-5" />
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* User */}
        <div className="px-3 py-4 border-t border-border">
          <div className="flex items-center gap-3 px-3 mb-2">
            <div className="w-8 h-8 rounded-full bg-[#3DD68C]/10 flex items-center justify-center text-xs font-bold text-[#3DD68C]">
              {user?.email?.[0]?.toUpperCase() ?? '?'}
            </div>
            <span className="text-sm text-muted-foreground truncate flex-1">{user?.email ?? ''}</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start gap-3 px-3 text-muted-foreground hover:text-foreground"
            onClick={signOut}
          >
            <LogOut className="w-4 h-4" />
            Sign out
          </Button>
        </div>
      </aside>

      {/* Mobile header */}
      <header className="md:hidden fixed top-0 left-0 right-0 h-14 bg-card/80 backdrop-blur-xl border-b border-border z-30 flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#3DD68C]/10 flex items-center justify-center">
            <Flame className="w-4 h-4 text-[#3DD68C]" />
          </div>
          <span className="font-bold">GitHabit</span>
        </div>
        <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(!sidebarOpen)}>
          {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </Button>
      </header>

      {/* Mobile dropdown menu */}
      {sidebarOpen && (
        <div className="md:hidden fixed inset-0 z-20 bg-background/90 backdrop-blur-sm pt-14" onClick={() => setSidebarOpen(false)}>
          <div className="bg-card border-b border-border p-4 space-y-1" onClick={(e) => e.stopPropagation()}>
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon
              const active = isActive(item.href)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    'flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-colors',
                    active
                      ? 'bg-[#3DD68C]/10 text-[#3DD68C]'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  <Icon className="w-5 h-5" />
                  {item.label}
                </Link>
              )
            })}
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start gap-3 px-3 py-3 text-muted-foreground"
              onClick={signOut}
            >
              <LogOut className="w-5 h-5" />
              Sign out
            </Button>
          </div>
        </div>
      )}

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-card/80 backdrop-blur-xl border-t border-border z-30 flex items-center justify-around px-2">
        {NAV_ITEMS.slice(0, 4).map((item) => {
          const Icon = item.icon
          const active = isActive(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center gap-0.5 py-1 px-3 rounded-lg transition-colors',
                active ? 'text-[#3DD68C]' : 'text-muted-foreground'
              )}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          )
        })}
      </nav>

      {/* Main content */}
      <main className="flex-1 md:ml-64 mt-14 md:mt-0 mb-16 md:mb-0">
        {children}
      </main>
    </div>
  )
}
