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
import { Plus, X, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateHabitDialog({ open, onOpenChange }: Props) {
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
  const [saving, setSaving] = useState(false)

  const addTag = () => {
    const t = newTag.trim()
    if (t && !tags.includes(t)) {
      setTags([...tags, t])
      setNewTag('')
    }
  }

  const reset = () => {
    setTitle(''); setIconName('zap'); setColorHex('#3DD68C')
    setFrequency('daily'); setWeeklyTarget(3)
    setTrackingType('boolean'); setTargetValue(''); setUnit('')
    setTargetMinutes(25); setGroupId(null); setTags([]); setNewTag('')
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
            New habit
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
                  {title || 'Habit name'}
                </p>
                <p className="text-xs text-muted-foreground">
                  {frequency === 'daily' ? 'Daily' : `${weeklyTarget}x/week`} · {trackingType === 'boolean' ? 'Yes/No' : trackingType}
                </p>
              </div>
            </div>

            {/* Name */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Name</Label>
              <Input
                placeholder="e.g. Meditation, Read 30min, Workout..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                autoFocus
                className="bg-secondary/50 border-0 focus-visible:ring-1 focus-visible:ring-primary/30 h-10"
              />
            </div>

            {/* Frequency */}
            <div className="space-y-3">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Frequency</Label>
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
                    {f === 'daily' ? 'Every day' : 'Weekly'}
                  </button>
                ))}
              </div>
              {frequency === 'weekly' && (
                <div className="flex items-center gap-2 pt-1">
                  <span className="text-xs text-muted-foreground shrink-0">Days per week:</span>
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
              )}
            </div>

            {/* Tracking type */}
            <div className="space-y-3">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Tracking type</Label>
              <div className="grid grid-cols-3 gap-2">
                {([
                  { value: 'boolean', label: 'Yes / No', desc: 'Simple check' },
                  { value: 'numeric', label: 'Number', desc: 'Count a value' },
                  { value: 'timer', label: 'Timer', desc: 'Track duration' },
                ] as const).map(t => (
                  <button
                    key={t.value}
                    onClick={() => setTrackingType(t.value)}
                    className={cn(
                      'py-3 rounded-lg text-center border transition-all',
                      trackingType === t.value
                        ? 'border-transparent'
                        : 'border-border text-muted-foreground hover:text-foreground'
                    )}
                    style={trackingType === t.value ? { backgroundColor: `${colorHex}12`, color: colorHex, boxShadow: `0 0 0 1px ${colorHex}30` } : undefined}
                  >
                    <p className="text-sm font-medium">{t.label}</p>
                    <p className="text-[10px] opacity-60 mt-0.5">{t.desc}</p>
                  </button>
                ))}
              </div>
              {trackingType === 'numeric' && (
                <div className="flex gap-2 pt-1">
                  <Input
                    placeholder="Target (e.g. 2000)"
                    value={targetValue}
                    onChange={e => setTargetValue(e.target.value)}
                    type="number"
                    className="bg-secondary/50 border-0 h-9"
                  />
                  <Input
                    placeholder="Unit (e.g. ml)"
                    value={unit}
                    onChange={e => setUnit(e.target.value)}
                    className="w-28 bg-secondary/50 border-0 h-9"
                  />
                </div>
              )}
              {trackingType === 'timer' && (
                <div className="flex items-center gap-3 pt-1">
                  <span className="text-sm text-muted-foreground whitespace-nowrap">{targetMinutes} min</span>
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
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Tags (optional)</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="e.g. Morning routine, Health..."
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
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Group</Label>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setGroupId(null)}
                    className={cn(
                      'px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
                      !groupId ? 'bg-secondary ring-1 ring-border text-foreground' : 'bg-secondary/50 text-muted-foreground hover:text-foreground'
                    )}
                  >
                    None
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
            {saving ? 'Creating...' : 'Create habit'}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
