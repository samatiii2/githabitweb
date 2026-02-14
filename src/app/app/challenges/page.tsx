'use client'

import { useState } from 'react'
import { CHALLENGES, CATEGORIES, type ChallengeTemplate } from '@/lib/data/challenges'
import { useHabitsStore } from '@/lib/store/habits-store'
import { DynamicIcon } from '@/components/dynamic-icon'
import { Button } from '@/components/ui/button'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { cn } from '@/lib/utils'
import { Check, Trophy, Clock, Zap } from 'lucide-react'

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
        sessions: null,
        is_archived: false,
        sort_order: 0,
      })
    }
    setStartedIds(prev => new Set(prev).add(challenge.id))
    setConfirmChallenge(null)
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">Challenges</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {filtered.length} challenges to boost your habits
        </p>
      </div>

      {/* Category filter */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setSelectedCategory(null)}
          className={cn(
            'px-3 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap',
            !selectedCategory
              ? 'bg-primary/10 text-primary ring-1 ring-primary/20'
              : 'bg-secondary text-muted-foreground hover:text-foreground'
          )}
        >
          All
        </button>
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={cn(
              'px-3 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap',
              selectedCategory === cat
                ? 'bg-primary/10 text-primary ring-1 ring-primary/20'
                : 'bg-secondary text-muted-foreground hover:text-foreground'
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Challenge grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(challenge => {
          const started = startedIds.has(challenge.id)
          return (
            <div key={challenge.id} className="card-elevated rounded-xl p-5 transition-all duration-200 hover:scale-[1.01]">
              {/* Header */}
              <div className="flex items-start gap-3 mb-3">
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                  style={{ backgroundColor: `${challenge.colorHex}12` }}
                >
                  <DynamicIcon name={challenge.iconName} className="w-5 h-5" style={{ color: challenge.colorHex }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm leading-snug">{challenge.name}</p>
                  <div className="flex items-center gap-2 mt-1 text-[11px] text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {challenge.durationDays}d
                    </span>
                    <span className="flex items-center gap-1">
                      <Zap className="w-3 h-3" /> {challenge.habits.length} habit{challenge.habits.length > 1 ? 's' : ''}
                    </span>
                  </div>
                </div>
              </div>

              {/* Description */}
              <p className="text-xs text-muted-foreground leading-relaxed mb-3 line-clamp-2">{challenge.description}</p>

              {/* Habit pills */}
              <div className="flex flex-wrap gap-1 mb-4">
                {challenge.habits.map((h, i) => (
                  <span key={i} className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                    style={{ backgroundColor: `${h.colorHex}10`, color: h.colorHex }}>
                    {h.title}
                  </span>
                ))}
              </div>

              {/* Action */}
              {started ? (
                <div className="flex items-center gap-2 py-2 px-3 rounded-lg bg-primary/8 text-primary text-sm font-medium">
                  <Check className="w-4 h-4" /> Started
                </div>
              ) : (
                <Button
                  size="sm"
                  onClick={() => setConfirmChallenge(challenge)}
                  className="w-full text-xs font-semibold h-9"
                  style={{ backgroundColor: challenge.colorHex, color: 'var(--icon-on-color)' }}
                >
                  <Trophy className="w-3.5 h-3.5 mr-1.5" /> Start challenge
                </Button>
              )}
            </div>
          )
        })}
      </div>

      <AlertDialog open={!!confirmChallenge} onOpenChange={() => setConfirmChallenge(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Start challenge?</AlertDialogTitle>
            <AlertDialogDescription>
              {confirmChallenge && (
                <>
                  <strong>{confirmChallenge.name}</strong> will create {confirmChallenge.habits.length} habit{confirmChallenge.habits.length > 1 ? 's' : ''} to track for {confirmChallenge.durationDays} days.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => confirmChallenge && handleStart(confirmChallenge)}
              className="bg-primary text-primary-foreground hover:bg-primary/90">
              Start
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
