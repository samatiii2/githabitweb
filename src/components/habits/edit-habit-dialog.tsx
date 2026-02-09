'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { COLORS, HABIT_ICONS } from '@/lib/constants'
import { DynamicIcon } from '@/components/dynamic-icon'
import { useHabitsStore } from '@/lib/store/habits-store'
import { useRouter } from 'next/navigation'
import { Plus, X, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Habit } from '@/lib/types/database'

interface Props {
  habit: Habit
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EditHabitDialog({ habit, open, onOpenChange }: Props) {
  const { updateHabit, deleteHabit, groups } = useHabitsStore()
  const router = useRouter()
  const [title, setTitle] = useState(habit.title)
  const [iconName, setIconName] = useState(habit.icon_name)
  const [colorHex, setColorHex] = useState(habit.color_hex)
  const [frequency, setFrequency] = useState(habit.frequency)
  const [weeklyTarget, setWeeklyTarget] = useState(habit.weekly_target ?? 3)
  const [trackingType, setTrackingType] = useState(habit.tracking_type)
  const [targetValue, setTargetValue] = useState(habit.target_value?.toString() ?? '')
  const [unit, setUnit] = useState(habit.unit ?? '')
  const [targetMinutes, setTargetMinutes] = useState(habit.target_minutes ?? 25)
  const [groupId, setGroupId] = useState(habit.group_id)
  const [tags, setTags] = useState<string[]>((habit.tags as string[]) ?? [])
  const [newTag, setNewTag] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (open) {
      setTitle(habit.title); setIconName(habit.icon_name); setColorHex(habit.color_hex)
      setFrequency(habit.frequency); setWeeklyTarget(habit.weekly_target ?? 3)
      setTrackingType(habit.tracking_type); setTargetValue(habit.target_value?.toString() ?? '')
      setUnit(habit.unit ?? ''); setTargetMinutes(habit.target_minutes ?? 25)
      setGroupId(habit.group_id); setTags((habit.tags as string[]) ?? [])
    }
  }, [open, habit])

  const addTag = () => {
    const t = newTag.trim()
    if (t && !tags.includes(t)) { setTags([...tags, t]); setNewTag('') }
  }

  const handleSave = async () => {
    if (!title.trim()) return
    setSaving(true)
    await updateHabit(habit.id, {
      title: title.trim(), icon_name: iconName, color_hex: colorHex,
      frequency, tracking_type: trackingType, group_id: groupId,
      weekly_target: frequency === 'weekly' ? weeklyTarget : null,
      target_value: trackingType === 'numeric' ? Number(targetValue) || null : null,
      unit: trackingType === 'numeric' ? unit || null : null,
      target_minutes: trackingType === 'timer' ? targetMinutes : null,
      tags,
    })
    setSaving(false)
    onOpenChange(false)
  }

  const handleDelete = async () => {
    await deleteHabit(habit.id)
    onOpenChange(false)
    router.push('/app')
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit habit</DialogTitle>
        </DialogHeader>
        <div className="space-y-5 pt-2">
          <div className="space-y-2">
            <Label>Name</Label>
            <Input value={title} onChange={e => setTitle(e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label>Frequency</Label>
            <div className="grid grid-cols-2 gap-2">
              {(['daily', 'weekly'] as const).map(f => (
                <button key={f} onClick={() => setFrequency(f)}
                  className={cn('py-2 rounded-lg text-sm font-medium border transition-colors',
                    frequency === f ? 'border-[var(--c)] bg-[var(--c)]/10 text-[var(--c)]' : 'border-border text-muted-foreground'
                  )} style={{ '--c': colorHex } as React.CSSProperties}>
                  {f === 'daily' ? 'Daily' : 'Weekly'}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Tracking type</Label>
            <div className="grid grid-cols-3 gap-2">
              {(['boolean', 'numeric', 'timer'] as const).map(t => (
                <button key={t} onClick={() => setTrackingType(t)}
                  className={cn('py-2 rounded-lg text-sm font-medium border transition-colors capitalize',
                    trackingType === t ? 'border-[var(--c)] bg-[var(--c)]/10 text-[var(--c)]' : 'border-border text-muted-foreground'
                  )} style={{ '--c': colorHex } as React.CSSProperties}>
                  {t === 'boolean' ? 'Yes/No' : t}
                </button>
              ))}
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label>Tags</Label>
            <div className="flex gap-2">
              <Input placeholder="Add tag" value={newTag} onChange={e => setNewTag(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTag())} />
              <Button variant="outline" size="icon" onClick={addTag} disabled={!newTag.trim()}><Plus className="w-4 h-4" /></Button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {tags.map((tag, i) => (
                  <span key={i} className="text-xs px-2 py-1 rounded-full flex items-center gap-1 font-medium" style={{ backgroundColor: `${colorHex}15`, color: colorHex }}>
                    {tag}
                    <button onClick={() => setTags(tags.filter((_, j) => j !== i))}><X className="w-3 h-3" /></button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Icon */}
          <div className="space-y-2">
            <Label>Icon</Label>
            <div className="grid grid-cols-7 gap-1.5">
              {HABIT_ICONS.map(icon => (
                <button key={icon} onClick={() => setIconName(icon)}
                  className={cn('w-9 h-9 rounded-lg flex items-center justify-center transition-colors',
                    iconName === icon ? 'ring-2' : 'bg-secondary/50 hover:bg-secondary'
                   )} style={iconName === icon ? { backgroundColor: `${colorHex}20`, outlineColor: colorHex } : undefined}>
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
                <button key={c} onClick={() => setColorHex(c)} className={cn('w-8 h-8 rounded-full transition-all', colorHex === c && 'ring-2 ring-white ring-offset-2 ring-offset-background')} style={{ backgroundColor: c }} />
              ))}
            </div>
          </div>

          <Button onClick={handleSave} disabled={!title.trim() || saving} className="w-full bg-[#3DD68C] text-black hover:bg-[#3DD68C]/90">
            {saving ? 'Saving...' : 'Save changes'}
          </Button>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" className="w-full text-destructive border-destructive/20 hover:bg-destructive/10 gap-2">
                <Trash2 className="w-4 h-4" /> Delete habit
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete habit?</AlertDialogTitle>
                <AlertDialogDescription>This will permanently delete this habit and all its data. This action cannot be undone.</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} className="bg-destructive text-white hover:bg-destructive/90">Delete</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </DialogContent>
    </Dialog>
  )
}
