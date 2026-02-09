'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { COLORS, HABIT_ICONS } from '@/lib/constants'
import { DynamicIcon } from '@/components/dynamic-icon'
import { useHabitsStore } from '@/lib/store/habits-store'
import { Plus, X } from 'lucide-react'
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>New habit</DialogTitle>
        </DialogHeader>

        <div className="space-y-5 pt-2">
          {/* Title */}
          <div className="space-y-2">
            <Label>Name</Label>
            <Input
              placeholder="e.g. Meditation"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              autoFocus
            />
          </div>

          {/* Frequency */}
          <div className="space-y-2">
            <Label>Frequency</Label>
            <div className="grid grid-cols-2 gap-2">
              {(['daily', 'weekly'] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setFrequency(f)}
                  className={cn(
                    'py-2 rounded-lg text-sm font-medium border transition-colors',
                    frequency === f
                      ? 'border-[var(--accent-color)] bg-[var(--accent-color)]/10 text-[var(--accent-color)]'
                      : 'border-border text-muted-foreground hover:text-foreground'
                  )}
                  style={{ '--accent-color': colorHex } as React.CSSProperties}
                >
                  {f === 'daily' ? 'Daily' : 'Weekly'}
                </button>
              ))}
            </div>
            {frequency === 'weekly' && (
              <div className="flex items-center gap-2 pt-1">
                <span className="text-sm text-muted-foreground">Target:</span>
                {[1,2,3,4,5,6,7].map(n => (
                  <button
                    key={n}
                    onClick={() => setWeeklyTarget(n)}
                    className={cn(
                      'w-8 h-8 rounded-full text-sm font-bold transition-colors',
                      weeklyTarget === n ? 'text-black' : 'bg-secondary text-muted-foreground'
                    )}
                    style={weeklyTarget === n ? { backgroundColor: colorHex } : undefined}
                  >
                    {n}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Tracking type */}
          <div className="space-y-2">
            <Label>Tracking type</Label>
            <div className="grid grid-cols-3 gap-2">
              {([
                { value: 'boolean', label: 'Yes/No' },
                { value: 'numeric', label: 'Numeric' },
                { value: 'timer', label: 'Timer' },
              ] as const).map(t => (
                <button
                  key={t.value}
                  onClick={() => setTrackingType(t.value)}
                  className={cn(
                    'py-2 rounded-lg text-sm font-medium border transition-colors',
                    trackingType === t.value
                      ? 'border-[var(--accent-color)] bg-[var(--accent-color)]/10 text-[var(--accent-color)]'
                      : 'border-border text-muted-foreground hover:text-foreground'
                  )}
                  style={{ '--accent-color': colorHex } as React.CSSProperties}
                >
                  {t.label}
                </button>
              ))}
            </div>
            {trackingType === 'numeric' && (
              <div className="flex gap-2 pt-1">
                <Input placeholder="Target (e.g. 2000)" value={targetValue} onChange={e => setTargetValue(e.target.value)} type="number" />
                <Input placeholder="Unit (e.g. ml)" value={unit} onChange={e => setUnit(e.target.value)} className="w-24" />
              </div>
            )}
            {trackingType === 'timer' && (
              <div className="flex items-center gap-3 pt-1">
                <span className="text-sm text-muted-foreground">Target: {targetMinutes} min</span>
                <input
                  type="range"
                  min={5} max={120} step={5}
                  value={targetMinutes}
                  onChange={e => setTargetMinutes(Number(e.target.value))}
                  className="flex-1 accent-[var(--accent-color)]"
                  style={{ '--accent-color': colorHex } as React.CSSProperties}
                />
              </div>
            )}
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label>Tags (optional)</Label>
            <div className="flex gap-2">
              <Input
                placeholder="e.g. Drink 2L water"
                value={newTag}
                onChange={e => setNewTag(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTag())}
              />
              <Button variant="outline" size="icon" onClick={addTag} disabled={!newTag.trim()}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {tags.map((tag, i) => (
                  <span
                    key={i}
                    className="text-xs px-2 py-1 rounded-full flex items-center gap-1 font-medium"
                    style={{ backgroundColor: `${colorHex}15`, color: colorHex }}
                  >
                    {tag}
                    <button onClick={() => setTags(tags.filter((_, j) => j !== i))}>
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Group */}
          {groups.length > 0 && (
            <div className="space-y-2">
              <Label>Group</Label>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setGroupId(null)}
                  className={cn(
                    'px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors',
                    !groupId ? 'border-white/20 text-foreground bg-secondary' : 'border-border text-muted-foreground'
                  )}
                >
                  None
                </button>
                {groups.map(g => (
                  <button
                    key={g.id}
                    onClick={() => setGroupId(g.id)}
                    className={cn(
                      'px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors',
                      groupId === g.id ? 'text-black' : 'border-border text-muted-foreground'
                    )}
                    style={groupId === g.id ? { backgroundColor: g.color_hex, borderColor: g.color_hex } : undefined}
                  >
                    {g.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Icon */}
          <div className="space-y-2">
            <Label>Icon</Label>
            <div className="grid grid-cols-7 gap-1.5">
              {HABIT_ICONS.map(icon => (
                <button
                  key={icon}
                  onClick={() => setIconName(icon)}
                  className={cn(
                    'w-9 h-9 rounded-lg flex items-center justify-center transition-colors',
                    iconName === icon ? 'ring-2' : 'bg-secondary/50 hover:bg-secondary'
                  )}
                  style={iconName === icon ? { backgroundColor: `${colorHex}20`, color: colorHex, outlineColor: colorHex } : undefined}
                >
                  <DynamicIcon name={icon} className="w-4 h-4" style={iconName === icon ? { color: colorHex } : undefined} />
                </button>
              ))}
            </div>
          </div>

          {/* Color */}
          <div className="space-y-2">
            <Label>Color</Label>
            <div className="flex flex-wrap gap-2">
              {COLORS.map(c => (
                <button
                  key={c}
                  onClick={() => setColorHex(c)}
                  className={cn(
                    'w-8 h-8 rounded-full transition-all',
                    colorHex === c && 'ring-2 ring-white ring-offset-2 ring-offset-background'
                  )}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          {/* Submit */}
          <Button
            onClick={handleSubmit}
            disabled={!title.trim() || saving}
            className="w-full bg-[#3DD68C] text-black hover:bg-[#3DD68C]/90"
          >
            {saving ? 'Creating...' : 'Create habit'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
