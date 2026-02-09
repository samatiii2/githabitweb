'use client'

import { useAuth } from '@/lib/auth/auth-context'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { LogOut, User, Info, Download, Shield, ExternalLink } from 'lucide-react'

export default function SettingsPage() {
  const { user, signOut } = useAuth()

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage your account and preferences</p>
      </div>

      {/* Account */}
      <div className="card-elevated rounded-xl overflow-hidden">
        <div className="p-5 space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-[#3DD68C]/10 flex items-center justify-center text-xl font-bold text-[#3DD68C]">
              {user?.email?.[0]?.toUpperCase() ?? '?'}
            </div>
            <div className="flex-1">
              <p className="font-semibold text-lg">Your Account</p>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
            </div>
          </div>
        </div>
        <Separator />
        <div className="p-4">
          <Button variant="ghost" onClick={signOut}
            className="w-full justify-start gap-3 text-destructive hover:text-destructive hover:bg-destructive/10 h-10">
            <LogOut className="w-4 h-4" /> Sign out
          </Button>
        </div>
      </div>

      {/* App Info */}
      <div className="card-elevated rounded-xl overflow-hidden">
        <div className="p-5">
          <div className="flex items-center gap-3 mb-4">
            <Info className="w-5 h-5 text-muted-foreground" />
            <span className="font-semibold">About GitHabit</span>
          </div>
          <div className="space-y-3 text-sm text-muted-foreground">
            <div className="flex items-center justify-between">
              <span>Version</span>
              <span className="font-mono text-xs bg-secondary px-2 py-0.5 rounded">1.0.0 (Web)</span>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <span>Built with</span>
              <span className="text-xs">Next.js + Supabase + Tailwind CSS</span>
            </div>
            <Separator />
            <p className="text-xs leading-relaxed">
              Track your habits with a beautiful GitHub-style heatmap. Manage tasks, start challenges, and build consistency.
            </p>
          </div>
        </div>
      </div>

      {/* Export */}
      <div className="card-elevated rounded-xl overflow-hidden opacity-60">
        <div className="p-5">
          <div className="flex items-center gap-3 mb-2">
            <Download className="w-5 h-5 text-muted-foreground" />
            <span className="font-semibold">Export Data</span>
          </div>
          <p className="text-sm text-muted-foreground">Coming soon — export your data as JSON or CSV.</p>
        </div>
      </div>

      {/* Privacy */}
      <div className="card-elevated rounded-xl overflow-hidden opacity-60">
        <div className="p-5">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="w-5 h-5 text-muted-foreground" />
            <span className="font-semibold">Privacy & Security</span>
          </div>
          <p className="text-sm text-muted-foreground">Your data is stored securely and never shared with third parties.</p>
        </div>
      </div>
    </div>
  )
}
