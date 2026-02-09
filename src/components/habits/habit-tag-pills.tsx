'use client'

interface Props {
  tags: string[]
  colorHex: string
  max?: number
  compact?: boolean
}

export function HabitTagPills({ tags, colorHex, max, compact }: Props) {
  if (!tags || tags.length === 0) return null

  const visibleTags = max ? tags.slice(0, max) : tags
  const overflow = max ? Math.max(0, tags.length - max) : 0

  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      {visibleTags.map((tag) => (
        <span
          key={tag}
          className={
            compact
              ? 'text-[9px] px-1.5 py-0.5 rounded-full font-medium leading-none'
              : 'text-[10px] px-2 py-0.5 rounded-full font-medium leading-none'
          }
          style={{
            backgroundColor: `${colorHex}10`,
            color: colorHex,
          }}
        >
          {tag}
        </span>
      ))}
      {overflow > 0 && (
        <span className="text-[9px] text-muted-foreground">+{overflow}</span>
      )}
    </div>
  )
}
