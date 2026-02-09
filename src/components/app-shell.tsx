'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/lib/auth/auth-context'
import {
  Flame, CheckSquare, Trophy, Settings, LogOut, Menu, X,
  ChevronLeft, LayoutDashboard
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useState } from 'react'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  { href: '/app', label: 'Habits', icon: LayoutDashboard, description: 'Track daily habits' },
  { href: '/app/tasks', label: 'Tasks', icon: CheckSquare, description: 'Manage your tasks' },
  { href: '/app/challenges', label: 'Challenges', icon: Trophy, description: 'Start a challenge' },
  { href: '/app/settings', label: 'Settings', icon: Settings, description: 'App settings' },
]

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { user, signOut, loading } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#3DD68C]/10 flex items-center justify-center">
            <Flame className="w-5 h-5 text-[#3DD68C] animate-pulse" />
          </div>
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  const isActive = (href: string) => {
    if (href === '/app') return pathname === '/app' || pathname.startsWith('/app/habits')
    return pathname.startsWith(href)
  }

  const sidebarWidth = sidebarCollapsed ? 'w-[68px]' : 'w-[260px]'
  const mainMargin = sidebarCollapsed ? 'lg:ml-[68px]' : 'lg:ml-[260px]'

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          'hidden lg:flex flex-col fixed inset-y-0 left-0 z-40 border-r border-sidebar-border bg-sidebar transition-all duration-200',
          sidebarWidth
        )}
      >
        {/* Logo */}
        <div className={cn(
          'flex items-center h-14 border-b border-sidebar-border shrink-0',
          sidebarCollapsed ? 'justify-center px-2' : 'px-5'
        )}>
          <div className="w-8 h-8 rounded-lg bg-[#3DD68C]/10 flex items-center justify-center shrink-0">
            <Flame className="w-4 h-4 text-[#3DD68C]" />
          </div>
          {!sidebarCollapsed && (
            <span className="font-bold text-[15px] ml-3 tracking-tight">GitHabit</span>
          )}
          {!sidebarCollapsed && (
            <button
              onClick={() => setSidebarCollapsed(true)}
              className="ml-auto text-muted-foreground hover:text-foreground transition-colors p-1 rounded-md hover:bg-accent"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav className={cn('flex-1 py-3', sidebarCollapsed ? 'px-2' : 'px-3')}>
          <div className="space-y-0.5">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon
              const active = isActive(item.href)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  title={sidebarCollapsed ? item.label : undefined}
                  className={cn(
                    'flex items-center gap-3 rounded-lg text-[13px] font-medium transition-all relative group',
                    sidebarCollapsed ? 'justify-center p-2.5' : 'px-3 py-2',
                    active
                      ? 'bg-[#3DD68C]/8 text-[#3DD68C]'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                  )}
                >
                  {active && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-[#3DD68C] rounded-r-full" />
                  )}
                  <Icon className={cn('shrink-0', sidebarCollapsed ? 'w-5 h-5' : 'w-[18px] h-[18px]')} />
                  {!sidebarCollapsed && item.label}
                </Link>
              )
            })}
          </div>
        </nav>

        {/* Expand button when collapsed */}
        {sidebarCollapsed && (
          <div className="px-2 py-2">
            <button
              onClick={() => setSidebarCollapsed(false)}
              className="w-full flex items-center justify-center p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            >
              <Menu className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* User section */}
        <div className={cn(
          'border-t border-sidebar-border shrink-0',
          sidebarCollapsed ? 'p-2' : 'p-3'
        )}>
          {!sidebarCollapsed ? (
            <div className="space-y-1">
              <div className="flex items-center gap-2.5 px-2 py-1.5">
                <div className="w-7 h-7 rounded-full bg-[#3DD68C]/10 flex items-center justify-center text-[11px] font-bold text-[#3DD68C] shrink-0">
                  {user?.email?.[0]?.toUpperCase() ?? '?'}
                </div>
                <span className="text-[12px] text-muted-foreground truncate flex-1">{user?.email ?? ''}</span>
              </div>
              <button
                onClick={signOut}
                className="flex items-center gap-2.5 w-full px-2 py-1.5 text-[12px] text-muted-foreground hover:text-foreground rounded-lg hover:bg-accent transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                Sign out
              </button>
            </div>
          ) : (
            <button
              onClick={signOut}
              title="Sign out"
              className="w-full flex items-center justify-center p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </aside>

      {/* Mobile header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 h-13 bg-background/90 backdrop-blur-xl border-b border-border z-40 flex items-center justify-between px-4">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-[#3DD68C]/10 flex items-center justify-center">
            <Flame className="w-3.5 h-3.5 text-[#3DD68C]" />
          </div>
          <span className="font-semibold text-sm">GitHabit</span>
        </div>
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
        </Button>
      </header>

      {/* Mobile dropdown */}
      {mobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 z-30 bg-background/80 backdrop-blur-sm pt-13"
          onClick={() => setMobileMenuOpen(false)}
        >
          <div
            className="bg-card border-b border-border p-3 space-y-0.5 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon
              const active = isActive(item.href)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                    active
                      ? 'bg-[#3DD68C]/8 text-[#3DD68C]'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  <Icon className="w-[18px] h-[18px]" />
                  <div>
                    <p>{item.label}</p>
                    <p className="text-[11px] text-muted-foreground font-normal">{item.description}</p>
                  </div>
                </Link>
              )
            })}
            <div className="pt-2 border-t border-border mt-2">
              <button
                onClick={signOut}
                className="flex items-center gap-3 w-full px-3 py-2.5 text-sm text-muted-foreground hover:text-foreground rounded-lg transition-colors"
              >
                <LogOut className="w-[18px] h-[18px]" />
                Sign out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile bottom nav */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-background/90 backdrop-blur-xl border-t border-border z-40 safe-area-bottom">
        <div className="flex items-center justify-around h-14 px-2">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon
            const active = isActive(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex flex-col items-center gap-0.5 py-1 px-4 rounded-lg transition-colors',
                  active ? 'text-[#3DD68C]' : 'text-muted-foreground'
                )}
              >
                <Icon className="w-5 h-5" />
                <span className="text-[10px] font-medium">{item.label}</span>
              </Link>
            )
          })}
        </div>
      </nav>

      {/* Main content */}
      <main className={cn(
        'min-h-screen transition-all duration-200',
        mainMargin,
        'pt-13 lg:pt-0',
        'pb-20 lg:pb-0'
      )}>
        <div className="page-enter">
          {children}
        </div>
      </main>
    </div>
  )
}
