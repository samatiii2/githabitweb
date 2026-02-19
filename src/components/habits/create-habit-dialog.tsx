'use client'

import { useState } from 'react'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
// ScrollArea replaced with native overflow-y-auto for better mobile scroll support
import { COLORS, HABIT_ICONS } from '@/lib/constants'
import { DynamicIcon } from '@/components/dynamic-icon'
import { useHabitsStore } from '@/lib/store/habits-store'
import { Plus, X, Sparkles, Dumbbell, FolderOpen, ListChecks } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useT } from '@/lib/i18n/provider'
import type { HabitSession, HabitOption } from '@/lib/types/database'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateHabitDialog({ open, onOpenChange }: Props) {
  const t = useT()
  const { createHabit, groups, createGroup } = useHabitsStore()
  const [title, setTitle] = useState('')
  const [iconName, setIconName] = useState('zap')
  const [colorHex, setColorHex] = useState('#3DD68C')
  const [frequency, setFrequency] = useState<'daily' | 'weekly'>('daily')
  const [weeklyTarget, setWeeklyTarget] = useState(3)
  const [trackingType, setTrackingType] = useState<'boolean' | 'numeric' | 'timer' | 'options'>('boolean')
  const [targetValue, setTargetValue] = useState('')
  const [unit, setUnit] = useState('')
  const [targetMinutes, setTargetMinutes] = useState(25)
  const [groupId, setGroupId] = useState<string | null>(null)
  const [sessions, setSessions] = useState<HabitSession[]>([])
  const [newSessionLabel, setNewSessionLabel] = useState('')
  const [saving, setSaving] = useState(false)
  const [showNewCategory, setShowNewCategory] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState('')
  const [habitOptions, setHabitOptions] = useState<HabitOption[]>([])
  const [newOptionLabel, setNewOptionLabel] = useState('')
  const [newOptionColor, setNewOptionColor] = useState('#10b981')

  const addSession = () => {
    const label = newSessionLabel.trim()
    if (!label) return
    setSessions([...sessions, { id: `s${Date.now()}_${Math.random().toString(36).slice(2, 6)}`, label }])
    setNewSessionLabel('')
  }

  const removeSession = (id: string) => {
    setSessions(sessions.filter(s => s.id !== id))
  }

  const addOption = () => {
    const label = newOptionLabel.trim()
    if (!label) return
    setHabitOptions([...habitOptions, { id: `opt${Date.now()}_${Math.random().toString(36).slice(2, 6)}`, label, color: newOptionColor }])
    setNewOptionLabel('')
  }

  const removeOption = (id: string) => {
    setHabitOptions(habitOptions.filter(o => o.id !== id))
  }

  const reset = () => {
    setTitle(''); setIconName('zap'); setColorHex('#3DD68C')
    setFrequency('daily'); setWeeklyTarget(3)
    setTrackingType('boolean'); setTargetValue(''); setUnit('')
    setTargetMinutes(25); setGroupId(null)
    setSessions([]); setNewSessionLabel('')
    setHabitOptions([]); setNewOptionLabel(''); setNewOptionColor('#10b981')
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
      tags: [],
      sessions: frequency === 'weekly' && sessions.length > 0 ? sessions : null,
      options: trackingType === 'options' && habitOptions.length > 0 ? habitOptions : null,
      is_archived: false,
      sort_order: 0,
    })
    setSaving(false)
    reset()
    onOpenChange(false)
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg p-0 gap-0 bg-background border-l border-border" showCloseButton={false}>
        <SheetHeader className="px-6 py-4 border-b border-border shrink-0">
          <SheetTitle className="flex items-center gap-2 text-base">
            <Sparkles className="w-4 h-4 text-primary" />
            {t('habits.newHabit')}
          </SheetTitle>
        </SheetHeader>

        <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain">
          <div className="px-6 py-5 space-y-6 pb-6">
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
                  {frequency === 'daily' ? 'Daily' : `${weeklyTarget}x/week`} · {trackingType === 'boolean' ? t('habits.yesNo') : trackingType === 'options' ? t('habits.options') : trackingType}
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
              <div className="grid grid-cols-4 gap-2">
                {([
                  { value: 'boolean' as const, label: t('habits.yesNo'), desc: t('habits.yesNoDesc') },
                  { value: 'numeric' as const, label: t('habits.number'), desc: t('habits.numberDesc') },
                  { value: 'timer' as const, label: t('habits.timer'), desc: t('habits.timerDesc') },
                  { value: 'options' as const, label: t('habits.options'), desc: t('habits.optionsDesc') },
                ]).map(opt => (
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
              {trackingType === 'options' && (
                <div className="space-y-2 p-3 rounded-xl bg-card border border-border">
                  <div className="flex items-center gap-2">
                    <ListChecks className="w-3.5 h-3.5 text-muted-foreground" />
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      {t('habits.optionsLabel')}
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    {t('habits.optionsHint')}
                  </p>
                  {habitOptions.length > 0 && (
                    <div className="space-y-1">
                      {habitOptions.map((o, i) => (
                        <div key={o.id} className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-secondary/50">
                          <div className="w-5 h-5 rounded-md shrink-0" style={{ backgroundColor: o.color }} />
                          <span className="text-xs font-medium flex-1">{o.label}</span>
                          <button onClick={() => removeOption(o.id)} className="text-muted-foreground hover:text-destructive transition-colors">
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="flex gap-2 items-center">
                    <div className="relative shrink-0">
                      <div className="w-8 h-8 rounded-lg border border-border overflow-hidden cursor-pointer" style={{ backgroundColor: newOptionColor }}>
                        <input
                          type="color"
                          value={newOptionColor}
                          onChange={e => setNewOptionColor(e.target.value)}
                          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                        />
                      </div>
                    </div>
                    <Input
                      placeholder={t('habits.optionPlaceholder')}
                      value={newOptionLabel}
                      onChange={e => setNewOptionLabel(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addOption())}
                      className="bg-secondary/50 border-0 h-8 text-xs flex-1"
                    />
                    <Button variant="ghost" size="icon" onClick={addOption} disabled={!newOptionLabel.trim()} className="h-8 w-8 shrink-0">
                      <Plus className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Category */}
            <div className="space-y-3">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t('habits.category')}</Label>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setGroupId(null)}
                  className={cn(
                    'px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
                    !groupId ? 'bg-secondary ring-1 ring-border text-foreground' : 'bg-secondary/50 text-muted-foreground hover:text-foreground'
                  )}
                >
                  {t('habits.noCategory')}
                </button>
                {groups.map(g => (
                  <button
                    key={g.id}
                    onClick={() => setGroupId(g.id)}
                    className={cn(
                      'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
                      groupId === g.id ? 'ring-1 shadow-sm' : 'bg-secondary/50 text-muted-foreground hover:text-foreground'
                    )}
                    style={groupId === g.id ? { backgroundColor: `${g.color_hex}15`, color: g.color_hex, boxShadow: `0 0 0 1px ${g.color_hex}30` } : undefined}
                  >
                    <DynamicIcon name={g.icon_name} className="w-3 h-3" style={{ color: groupId === g.id ? g.color_hex : undefined }} />
                    {g.name}
                  </button>
                ))}
                {!showNewCategory && (
                  <button
                    onClick={() => setShowNewCategory(true)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-primary bg-primary/5 hover:bg-primary/10 transition-all border border-dashed border-primary/20"
                  >
                    <Plus className="w-3 h-3" /> {t('habits.createCategory')}
                  </button>
                )}
              </div>
              {showNewCategory && (
                <div className="flex gap-2">
                  <Input
                    placeholder={t('habits.categoryNamePlaceholder')}
                    value={newCategoryName}
                    onChange={e => setNewCategoryName(e.target.value)}
                    onKeyDown={async e => {
                      if (e.key === 'Enter' && newCategoryName.trim()) {
                        e.preventDefault()
                        await createGroup({ name: newCategoryName.trim(), icon_name: 'folder', color_hex: colorHex })
                        setNewCategoryName('')
                        setShowNewCategory(false)
                      }
                    }}
                    autoFocus
                    className="bg-secondary/50 border-0 h-8 text-xs flex-1"
                  />
                  <Button
                    variant="ghost" size="icon"
                    onClick={async () => {
                      if (newCategoryName.trim()) {
                        await createGroup({ name: newCategoryName.trim(), icon_name: 'folder', color_hex: colorHex })
                        setNewCategoryName('')
                        setShowNewCategory(false)
                      }
                    }}
                    disabled={!newCategoryName.trim()}
                    className="h-8 w-8 shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </Button>
                  <Button
                    variant="ghost" size="icon"
                    onClick={() => { setShowNewCategory(false); setNewCategoryName('') }}
                    className="h-8 w-8 shrink-0 text-muted-foreground"
                  >
                    <X className="w-3.5 h-3.5" />
                  </Button>
                </div>
              )}
            </div>

            {/* Icon */}
            <div className="space-y-3">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Icon</Label>
              <div className="grid grid-cols-8 gap-1.5 max-h-[180px] overflow-y-auto p-0.5">
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
              <div className="flex flex-wrap gap-1.5">
                {COLORS.map(c => (
                  <button
                    key={c}
                    onClick={() => setColorHex(c)}
                    className={cn(
                      'w-7 h-7 rounded-full transition-all',
                      colorHex === c && 'ring-2 ring-foreground ring-offset-2 ring-offset-background scale-110'
                    )}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border bg-background shrink-0">
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
