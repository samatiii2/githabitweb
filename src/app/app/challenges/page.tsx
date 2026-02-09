'use client'

import { useState } from 'react'
import { CHALLENGES, CATEGORIES, type ChallengeTemplate } from '@/lib/data/challenges'
import { useHabitsStore } from '@/lib/store/habits-store'
import { DynamicIcon } from '@/components/dynamic-icon'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { cn } from '@/lib/utils'
import { Check } from 'lucide-react'

export default function ChallengesPage() {
  const { createHabit } = useHabitsStore()
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [confirmChallenge, setConfirmChallenge] = useState<ChallengeTemplate | null>(null)
  const [startedIds, setStartedIds] = useState<Set<string>>(new Set())

  const filtered = selectedCategory
    ? CHALLENGES.filter(c => c.category === selectedCategory)
    : CHALLENGES

  const handleStart = async (challenge: ChallengeTemplate) => {
    for (const h of challenge.habits) {
      await createHabit({
        title: h.title,
        icon_name: h.iconName,
        color_hex: h.colorHex,
        frequency: h.frequency,
        tracking_type: h.trackingType,
        target_value: h.targetValue ?? null,
        unit: h.unit ?? null,
        target_minutes: h.targetMinutes ?? null,
        weekly_target: h.frequency === 'weekly' ? 5 : null,
        group_id: null,
        tags: [],
        is_archived: false,
        sort_order: 0,
      })
    }
    setStartedIds(prev => new Set(prev).add(challenge.id))
    setConfirmChallenge(null)
  }

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Challenges</h1>
        <p className="text-sm text-muted-foreground">{filtered.length} challenges available</p>
      </div>

      {/* Category filter */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <Button
          variant={!selectedCategory ? 'default' : 'outline'}
          size="sm"
          onClick={() => setSelectedCategory(null)}
          className={cn('shrink-0 text-xs', !selectedCategory && 'bg-[#3DD68C] text-black hover:bg-[#3DD68C]/90')}
        >
          All
        </Button>
        {CATEGORIES.map(cat => (
          <Button
            key={cat}
            variant={selectedCategory === cat ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedCategory(cat)}
            className={cn('shrink-0 text-xs', selectedCategory === cat && 'bg-[#3DD68C] text-black hover:bg-[#3DD68C]/90')}
          >
            {cat}
          </Button>
        ))}
      </div>

      {/* Challenge cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map(challenge => {
          const started = startedIds.has(challenge.id)
          return (
            <div key={challenge.id} className="bg-card rounded-xl border border-border p-5 space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${challenge.colorHex}15` }}>
                  <DynamicIcon name={challenge.iconName} className="w-5 h-5" style={{ color: challenge.colorHex }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold">{challenge.name}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{challenge.durationDays} days</span>
                    <span>&middot;</span>
                    <span style={{ color: challenge.colorHex }}>{challenge.category}</span>
                  </div>
                </div>
                {started ? (
                  <div className="w-8 h-8 rounded-full bg-[#3DD68C]/20 flex items-center justify-center shrink-0">
                    <Check className="w-4 h-4 text-[#3DD68C]" />
                  </div>
                ) : (
                  <Button size="sm" onClick={() => setConfirmChallenge(challenge)} className="shrink-0 bg-[var(--c)] text-black hover:opacity-90 text-xs" style={{ '--c': challenge.colorHex } as React.CSSProperties}>
                    Start
                  </Button>
                )}
              </div>
              <p className="text-sm text-muted-foreground">{challenge.description}</p>
              <div className="flex flex-wrap gap-1.5">
                {challenge.habits.map((h, i) => (
                  <span key={i} className="text-[10px] px-2 py-0.5 rounded-full font-medium" style={{ backgroundColor: `${h.colorHex}15`, color: h.colorHex }}>
                    {h.title}
                  </span>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      <AlertDialog open={!!confirmChallenge} onOpenChange={() => setConfirmChallenge(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Start challenge?</AlertDialogTitle>
            <AlertDialogDescription>
              {confirmChallenge && `"${confirmChallenge.name}" will create ${confirmChallenge.habits.length} habit(s) for ${confirmChallenge.durationDays} days.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => confirmChallenge && handleStart(confirmChallenge)} className="bg-[#3DD68C] text-black hover:bg-[#3DD68C]/90">
              Start
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
