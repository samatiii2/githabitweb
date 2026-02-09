'use client'

import * as LucideIcons from 'lucide-react'
import type { LucideProps } from 'lucide-react'

// Convert kebab-case or icon_name to PascalCase
function toPascalCase(name: string): string {
  return name
    .split(/[-_.]/)
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join('')
}

interface Props extends LucideProps {
  name: string
}

export function DynamicIcon({ name, ...props }: Props) {
  const pascalName = toPascalCase(name)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const Icon = (LucideIcons as any)[pascalName] as React.ComponentType<LucideProps> | undefined

  if (!Icon) {
    // Fallback
    return <LucideIcons.Zap {...props} />
  }

  return <Icon {...props} />
}
