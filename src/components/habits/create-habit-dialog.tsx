'use client'

import { useState } from 'react'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import { COLORS, HABIT_ICONS } from '@/lib/constants'
import { DynamicIcon } from '@/components/dynamic-icon'
import { useHabitsStore } from '@/lib/store/habits-store'
import { Plus, X, Sparkles, Dumbbell } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useT } from '@/lib/i18n/provider'
import type { HabitSession } from '@/lib/types/database'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateHabitDialog({ open, onOpenChange }: Props) {
  const t = useT()
  const { createHabit, groups } = useHabitsStore()
  const [title, setTitle] = useState('')
  const [iconName, setIconName] = useState('zap')
  const [colorHex, setColorHex] = useState('#3DD68C')
  const [frequency, setFrequency] = useState<'daily' | 'weekly'>('daily')
  const [weeklyTarget, setWeeklyTarget] = useState(3)
  const [trackingType, setTrackingType] = useState<'boolean' | 'numeric' | 'timer'>('boolean')
  const [targetValue, setTargetValue] = useState('')
  const [unit, setUnit] = useState('')
  const [targetMinutes, setTargetMinutes] = useState(25)
  const [groupId, setGroupId] = useState<string | null>(null)
  const [tags, setTags] = useState<string[]>([])
  const [newTag, setNewTag] = useState('')
  const [sessions, setSessions] = useState<HabitSession[]>([])
  const [newSessionLabel, setNewSessionLabel] = useState('')
  const [saving, setSaving] = useState(false)

  const addTag = () => {
    const v = newTag.trim()
    if (v && !tags.includes(v)) {
      setTags([...tags, v])
      setNewTag('')
    }
  }

  const addSession = () => {
    const label = newSessionLabel.trim()
    if (!label) return
    setSessions([...sessions, { id: `s${Date.now()}_${Math.random().toString(36).slice(2, 6)}`, label }])
    setNewSessionLabel('')
  }

  const removeSession = (id: string) => {
    setSessions(sessions.filter(s => s.id !== id))
  }

  const reset = () => {
    setTitle(''); setIconName('zap'); setColorHex('#3DD68C')
    setFrequency('daily'); setWeeklyTarget(3)
    setTrackingType('boolean'); setTargetValue(''); setUnit('')
    setTargetMinutes(25); setGroupId(null); setTags([]); setNewTag('')
    setSessions([]); setNewSessionLabel('')
  }

  const handleSubmit = async () => {
    if (!title.trim()) return
    setSaving(true)
    await createHabit({
      title: title.trim(),
      icon_name: iconName,
      color_hex: colorHex,
      frequency,
      tracking_type: trackingType,
      group_id: groupId,
      weekly_target: frequency === 'weekly' ? weeklyTarget : null,
      target_value: trackingType === 'numeric' ? Number(targetValue) || null : null,
      unit: trackingType === 'numeric' ? unit || null : null,
      target_minutes: trackingType === 'timer' ? targetMinutes : null,
      tags,
      sessions: frequency === 'weekly' && sessions.length > 0 ? sessions : null,
      is_archived: false,
      sort_order: 0,
    })
    setSaving(false)
    reset()
    onOpenChange(false)
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg p-0 bg-background border-l border-border">
        <SheetHeader className="px-6 py-4 border-b border-border">
          <SheetTitle className="flex items-center gap-2 text-base">
            <Sparkles className="w-4 h-4 text-primary" />
            {t('habits.newHabit')}
          </SheetTitle>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-130px)]">
          <div className="px-6 py-5 space-y-6">
            {/* Preview */}
            <div className="flex items-center gap-3 p-4 rounded-xl bg-card border border-border">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                style={{ backgroundColor: `${colorHex}15` }}
              >
                <DynamicIcon name={iconName} className="w-6 h-6" style={{ color: colorHex }} />
              </div>
              <div className="flex-1">
                <p className="font-semibold" style={{ color: title ? undefined : 'var(--muted-foreground)' }}>
                  {title || t('habits.habitName')}
                </p>
                <p className="text-xs text-muted-foreground">
                  {frequency === 'daily' ? 'Daily' : `${weeklyTarget}x/week`} · {trackingType === 'boolean' ? t('habits.yesNo') : trackingType}
                </p>
              </div>
            </div>

            {/* Name */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t('habits.habitName')}</Label>
              <Input
                placeholder={t('habits.habitNamePlaceholder')}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                autoFocus
                className="bg-secondary/50 border-0 focus-visible:ring-1 focus-visible:ring-primary/30 h-10"
              />
            </div>

            {/* Frequency */}
            <div className="space-y-3">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t('habits.frequency')}</Label>
              <div className="grid grid-cols-2 gap-2">
                {(['daily', 'weekly'] as const).map(f => (
                  <button
                    key={f}
                    onClick={() => setFrequency(f)}
                    className={cn(
                      'py-2.5 rounded-lg text-sm font-medium border transition-all',
                      frequency === f
                        ? 'border-transparent shadow-sm'
                        : 'border-border bg-transparent text-muted-foreground hover:text-foreground hover:border-border/80'
                    )}
                    style={frequency === f ? { backgroundColor: `${colorHex}12`, color: colorHex, boxShadow: `0 0 0 1px ${colorHex}30` } : undefined}
                  >
                    {f === 'daily' ? t('habits.daily') : t('habits.weekly')}
                  </button>
                ))}
              </div>
              {frequency === 'weekly' && (
                <>
                  <div className="flex items-center gap-2 pt-1">
                    <span className="text-xs text-muted-foreground shrink-0">{t('habits.daysPerWeek')}:</span>
                    <div className="flex items-center gap-1.5">
                      {[1,2,3,4,5,6,7].map(n => (
                        <button
                          key={n}
                          onClick={() => setWeeklyTarget(n)}
                          className={cn(
                            'w-8 h-8 rounded-full text-xs font-bold transition-all',
                            weeklyTarget === n ? 'text-[var(--icon-on-color)] shadow-sm' : 'bg-secondary text-muted-foreground hover:text-foreground'
                          )}
                          style={weeklyTarget === n ? { backgroundColor: colorHex } : undefined}
                        >
                          {n}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Sessions (optional) */}
                  {weeklyTarget > 1 && (
                    <div className="mt-3 space-y-2 p-3 rounded-xl bg-card border border-border">
                      <div className="flex items-center gap-2">
                        <Dumbbell className="w-3.5 h-3.5 text-muted-foreground" />
                        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          {t('habits.sessionsOptional')}
                        </span>
                      </div>
                      <p className="text-[11px] text-muted-foreground leading-relaxed">
                        {t('habits.sessionsDesc')}
                      </p>
                      {sessions.length > 0 && (
                        <div className="space-y-1">
                          {sessions.map((s, i) => (
                            <div key={s.id} className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-secondary/50">
                              <span className="text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                                style={{ backgroundColor: `${colorHex}15`, color: colorHex }}>
                                {i + 1}
                              </span>
                              <span className="text-xs font-medium flex-1">{s.label}</span>
                              <button onClick={() => removeSession(s.id)} className="text-muted-foreground hover:text-destructive transition-colors">
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                      {sessions.length < weeklyTarget && (
                        <div className="flex gap-2">
                          <Input
                            placeholder={t('habits.sessionPlaceholder', { n: sessions.length + 1 })}
                            value={newSessionLabel}
                            onChange={e => setNewSessionLabel(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addSession())}
                            className="bg-secondary/50 border-0 h-8 text-xs"
                          />
                          <Button variant="ghost" size="icon" onClick={addSession} disabled={!newSessionLabel.trim()} className="h-8 w-8 shrink-0">
                            <Plus className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      )}
                      {sessions.length >= weeklyTarget && (
                        <p className="text-[10px] text-muted-foreground text-center py-1">
                          {t('habits.allSessionsDefined', { count: weeklyTarget })}
                        </p>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Tracking type */}
            <div className="space-y-3">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t('habits.trackingType')}</Label>
              <div className="grid grid-cols-3 gap-2">
                {([
                  { value: 'boolean', label: t('habits.yesNo'), desc: t('habits.yesNoDesc') },
                  { value: 'numeric', label: t('habits.number'), desc: t('habits.numberDesc') },
                  { value: 'timer', label: t('habits.timer'), desc: t('habits.timerDesc') },
                ] as const).map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => setTrackingType(opt.value)}
                    className={cn(
                      'py-3 rounded-lg text-center border transition-all',
                      trackingType === opt.value
                        ? 'border-transparent'
                        : 'border-border text-muted-foreground hover:text-foreground'
                    )}
                    style={trackingType === opt.value ? { backgroundColor: `${colorHex}12`, color: colorHex, boxShadow: `0 0 0 1px ${colorHex}30` } : undefined}
                  >
                    <p className="text-sm font-medium">{opt.label}</p>
                    <p className="text-[10px] opacity-60 mt-0.5">{opt.desc}</p>
                  </button>
                ))}
              </div>
              {trackingType === 'numeric' && (
                <div className="flex gap-2 pt-1">
                  <Input
                    placeholder={t('habits.targetPlaceholder')}
                    value={targetValue}
                    onChange={e => setTargetValue(e.target.value)}
                    type="number"
                    className="bg-secondary/50 border-0 h-9"
                  />
                  <Input
                    placeholder={t('habits.unitPlaceholder')}
                    value={unit}
                    onChange={e => setUnit(e.target.value)}
                    className="w-28 bg-secondary/50 border-0 h-9"
                  />
                </div>
              )}
              {trackingType === 'timer' && (
                <div className="flex items-center gap-3 pt-1">
                  <span className="text-sm text-muted-foreground whitespace-nowrap">{targetMinutes} {t('habits.min')}</span>
                  <input
                    type="range"
                    min={5} max={120} step={5}
                    value={targetMinutes}
                    onChange={e => setTargetMinutes(Number(e.target.value))}
                    className="flex-1"
                    style={{ accentColor: colorHex }}
                  />
                </div>
              )}
            </div>

            {/* Tags */}
            <div className="space-y-3">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t('habits.tagsOptional')}</Label>
              <div className="flex gap-2">
                <Input
                  placeholder={t('habits.tagPlaceholder')}
                  value={newTag}
                  onChange={e => setNewTag(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  className="bg-secondary/50 border-0 h-9"
                />
                <Button variant="ghost" size="icon" onClick={addTag} disabled={!newTag.trim()} className="h-9 w-9 shrink-0">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {tags.map((tag, i) => (
                    <span
                      key={i}
                      className="text-xs px-2.5 py-1 rounded-full flex items-center gap-1.5 font-medium"
                      style={{ backgroundColor: `${colorHex}12`, color: colorHex }}
                    >
                      {tag}
                      <button onClick={() => setTags(tags.filter((_, j) => j !== i))} className="hover:opacity-70">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Group */}
            {groups.length > 0 && (
              <div className="space-y-3">
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t('habits.group')}</Label>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setGroupId(null)}
                    className={cn(
                      'px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
                      !groupId ? 'bg-secondary ring-1 ring-border text-foreground' : 'bg-secondary/50 text-muted-foreground hover:text-foreground'
                    )}
                  >
                    {t('common.none')}
                  </button>
                  {groups.map(g => (
                    <button
                      key={g.id}
                      onClick={() => setGroupId(g.id)}
                      className={cn(
                        'px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
                        groupId === g.id ? 'text-[var(--icon-on-color)]' : 'bg-secondary/50 text-muted-foreground hover:text-foreground'
                      )}
                      style={groupId === g.id ? { backgroundColor: g.color_hex } : undefined}
                    >
                      {g.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Icon */}
            <div className="space-y-3">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Icon</Label>
              <div className="grid grid-cols-8 gap-1.5">
                {HABIT_ICONS.map(icon => (
                  <button
                    key={icon}
                    onClick={() => setIconName(icon)}
                    className={cn(
                      'aspect-square rounded-lg flex items-center justify-center transition-all',
                      iconName === icon
                        ? 'ring-2 scale-110'
                        : 'bg-secondary/40 hover:bg-secondary text-muted-foreground hover:text-foreground'
                    )}
                    style={iconName === icon ? {
                      backgroundColor: `${colorHex}15`,
                      color: colorHex,
                      boxShadow: `0 0 0 2px ${colorHex}60`,
                    } : undefined}
                  >
                    <DynamicIcon name={icon} className="w-4 h-4" style={iconName === icon ? { color: colorHex } : undefined} />
                  </button>
                ))}
              </div>
            </div>

            {/* Color */}
            <div className="space-y-3">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Color</Label>
              <div className="flex flex-wrap gap-2">
                {COLORS.map(c => (
                  <button
                    key={c}
                    onClick={() => setColorHex(c)}
                    className={cn(
                      'w-8 h-8 rounded-full transition-all',
                      colorHex === c && 'ring-2 ring-foreground ring-offset-2 ring-offset-background scale-110'
                    )}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 px-6 py-4 border-t border-border bg-background">
          <Button
            onClick={handleSubmit}
            disabled={!title.trim() || saving}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-semibold h-10"
          >
            {saving ? t('common.creating') : t('habits.createHabit')}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
