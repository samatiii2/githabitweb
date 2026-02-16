'use client'

import { useState } from 'react'
import { HABIT_TEMPLATES, CATEGORIES, type HabitTemplate } from '@/lib/data/challenges'
import { useHabitsStore } from '@/lib/store/habits-store'
import { useT } from '@/lib/i18n/provider'
import { DynamicIcon } from '@/components/dynamic-icon'
import { cn } from '@/lib/utils'
import { Check, Plus, Clock, Hash, ToggleLeft } from 'lucide-react'

export default function TemplatesPage() {
  const { createHabit } = useHabitsStore()
  const t = useT()
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set())
  const [loadingId, setLoadingId] = useState<string | null>(null)

  const filtered = selectedCategory
    ? HABIT_TEMPLATES.filter(h => h.category === selectedCategory)
    : HABIT_TEMPLATES

  const handleAdd = async (template: HabitTemplate) => {
    if (addedIds.has(template.id) || loadingId) return
    setLoadingId(template.id)
    await createHabit({
      title: template.title,
      icon_name: template.iconName,
      color_hex: template.colorHex,
      frequency: template.frequency,
      tracking_type: template.trackingType,
      target_value: template.targetValue ?? null,
      unit: template.unit ?? null,
      target_minutes: template.targetMinutes ?? null,
      weekly_target: template.frequency === 'weekly' ? 5 : null,
      group_id: null,
      tags: [],
      sessions: null,
      is_archived: false,
      sort_order: 0,
    })
    setAddedIds(prev => new Set(prev).add(template.id))
    setLoadingId(null)
  }

  const trackingLabel = (t: HabitTemplate) => {
    if (t.trackingType === 'timer') return `${t.targetMinutes} min`
    if (t.trackingType === 'numeric') return `${t.targetValue} ${t.unit}`
    return t.frequency === 'weekly' ? 'Hebdo' : 'Oui/Non'
  }

  const TrackingIcon = ({ type }: { type: string }) => {
    if (type === 'timer') return <Clock className="w-3 h-3" />
    if (type === 'numeric') return <Hash className="w-3 h-3" />
    return <ToggleLeft className="w-3 h-3" />
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">{t('challenges.title')}</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {t('challenges.subtitle', { count: filtered.length })}
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
          {t('challenges.all')}
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

      {/* Template grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {filtered.map(template => {
          const isAdded = addedIds.has(template.id)
          const isLoading = loadingId === template.id

          return (
            <button
              key={template.id}
              onClick={() => handleAdd(template)}
              disabled={isAdded || isLoading}
              className={cn(
                'card-elevated rounded-xl p-4 text-left transition-all duration-200 group',
                isAdded
                  ? 'opacity-60 cursor-default'
                  : 'hover:scale-[1.02] active:scale-[0.98] cursor-pointer'
              )}
            >
              <div className="flex items-start gap-3">
                {/* Icon */}
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105"
                  style={{ backgroundColor: `${template.colorHex}15` }}
                >
                  <DynamicIcon name={template.iconName} className="w-5 h-5" style={{ color: template.colorHex }} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm leading-snug truncate">{template.title}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-2 leading-relaxed">
                    {template.description}
                  </p>
                </div>

                {/* Add / Added indicator */}
                <div
                  className={cn(
                    'w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-all',
                    isAdded
                      ? ''
                      : 'group-hover:scale-110'
                  )}
                  style={{
                    backgroundColor: isAdded ? `${template.colorHex}20` : `${template.colorHex}10`,
                    color: template.colorHex,
                  }}
                >
                  {isAdded ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                </div>
              </div>

              {/* Footer — tracking type badge */}
              <div className="mt-2.5 flex items-center gap-1.5">
                <span
                  className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full"
                  style={{ backgroundColor: `${template.colorHex}10`, color: template.colorHex }}
                >
                  <TrackingIcon type={template.trackingType} />
                  {trackingLabel(template)}
                </span>
                <span className="text-[10px] text-muted-foreground">
                  {template.category}
                </span>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
