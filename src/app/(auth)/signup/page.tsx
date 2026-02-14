'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Flame, ArrowLeft, CheckCircle } from 'lucide-react'

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const router = useRouter()

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }

    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.signUp({ email, password })
    if (error) {
      // Sanitize error messages to avoid leaking auth internals
      const msg = error.message?.toLowerCase()
      if (msg?.includes('already registered') || msg?.includes('already exists')) {
        setError('An account with this email already exists')
      } else if (msg?.includes('rate') || msg?.includes('limit')) {
        setError('Too many attempts. Please try again later.')
      } else if (msg?.includes('valid') || msg?.includes('email')) {
        setError('Please provide a valid email address')
      } else {
        setError('Something went wrong. Please try again.')
      }
      setLoading(false)
    } else {
      setSuccess(true)
      setTimeout(() => router.push('/app'), 1000)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="w-full max-w-sm text-center space-y-5">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
            <CheckCircle className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Account created!</h1>
          <p className="text-muted-foreground text-sm">Redirecting you to the app...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex">
      {/* Left panel - branding (desktop only) */}
      <div className="hidden lg:flex lg:w-1/2 bg-card items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />
        <div className="relative text-center space-y-6 px-12">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
            <Flame className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-3xl font-bold tracking-tight">giHabit</h2>
          <p className="text-muted-foreground max-w-sm">
            Join thousands building better habits. Track progress, complete challenges, and stay consistent.
          </p>
          {/* Decorative heatmap */}
          <div className="flex gap-[2px] justify-center opacity-30 mt-8">
            {Array.from({ length: 20 }, (_, w) => (
              <div key={w} className="flex flex-col gap-[2px]">
                {Array.from({ length: 7 }, (_, d) => (
                  <div key={d} className="w-2 h-2 rounded-[1px]"
                    style={{ backgroundColor: `rgba(61,214,140,${Math.random() > 0.5 ? 0.6 : 0.1})` }} />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel - form */}
      <div className="flex-1 flex items-center justify-center px-6">
        <div className="w-full max-w-sm space-y-8">
          <div>
            <Link href="/" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground mb-8 transition-colors">
              <ArrowLeft className="w-3.5 h-3.5" /> Back to home
            </Link>
            <div className="lg:hidden flex items-center gap-2.5 mb-6">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Flame className="w-4 h-4 text-primary" />
              </div>
              <span className="font-bold text-sm">giHabit</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight">Create your account</h1>
            <p className="text-muted-foreground text-sm mt-1">Start building better habits today</p>
          </div>

          <form onSubmit={handleSignup} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-secondary/50 border-0 focus-visible:ring-1 focus-visible:ring-primary/30 h-10"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-secondary/50 border-0 focus-visible:ring-1 focus-visible:ring-primary/30 h-10"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Confirm password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="bg-secondary/50 border-0 focus-visible:ring-1 focus-visible:ring-primary/30 h-10"
              />
            </div>

            {error && (
              <p className="text-sm text-destructive bg-destructive/10 rounded-lg px-3 py-2">{error}</p>
            )}

            <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-semibold h-10" disabled={loading}>
              {loading ? 'Creating account...' : 'Create account'}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link href="/login" className="text-primary hover:underline font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
