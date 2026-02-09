'use client'

import { useAuth } from '@/lib/auth/auth-context'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { LogOut, User, Palette, Bell, Download, Info } from 'lucide-react'

export default function SettingsPage() {
  const { user, signOut } = useAuth()

  return (
    <div className="max-w-2xl mx-auto p-4 md:p-6 space-y-6">
      <h1 className="text-2xl font-bold">Settings</h1>

      {/* Account */}
      <div className="bg-card rounded-xl border border-border p-5 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-[#3DD68C]/10 flex items-center justify-center text-lg font-bold text-[#3DD68C]">
            {user?.email?.[0]?.toUpperCase() ?? '?'}
          </div>
          <div>
            <p className="font-semibold">Account</p>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
          </div>
        </div>
        <Separator />
        <Button variant="outline" onClick={signOut} className="w-full gap-2 text-destructive border-destructive/20 hover:bg-destructive/10">
          <LogOut className="w-4 h-4" /> Sign out
        </Button>
      </div>

      {/* App info */}
      <div className="bg-card rounded-xl border border-border p-5 space-y-3">
        <div className="flex items-center gap-3">
          <Info className="w-5 h-5 text-muted-foreground" />
          <span className="font-medium">About</span>
        </div>
        <Separator />
        <div className="space-y-2 text-sm text-muted-foreground">
          <p>GitHabit v1.0.0 (Web)</p>
          <p>Built with Next.js + Supabase + Tailwind CSS</p>
          <p>Track your habits with a beautiful GitHub-style heatmap.</p>
        </div>
      </div>

      {/* Future sections */}
      <div className="bg-card rounded-xl border border-border p-5 space-y-3 opacity-50">
        <div className="flex items-center gap-3">
          <Download className="w-5 h-5 text-muted-foreground" />
          <span className="font-medium">Export Data</span>
        </div>
        <Separator />
        <p className="text-sm text-muted-foreground">Coming soon — export your data as JSON or CSV.</p>
      </div>
    </div>
  )
}
