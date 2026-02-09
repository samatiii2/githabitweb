// Neon color palette from the iOS app
export const COLORS = [
  '#3DD68C', '#5B9FFF', '#B084FF', '#FF6B9D', '#FF9F5A',
  '#00E5FF', '#FFEB3B', '#FF5252', '#1DE9B6', '#7C4DFF',
  '#FF80AB', '#FFAB40', '#69F0AE', '#448AFF', '#E040FB', '#ECEFF1',
] as const

// Icon mapping: SF Symbol name -> Lucide icon name
export const HABIT_ICONS = [
  'zap', 'flame', 'heart', 'book-open', 'running',
  'droplets', 'moon', 'sun', 'brain', 'dumbbell',
  'coffee', 'leaf', 'music', 'pencil', 'star',
  'bell', 'bike', 'pill', 'bed-double', 'sparkles',
  'camera', 'gamepad-2', 'paintbrush', 'laptop', 'headphones',
  'utensils', 'glasses', 'target', 'clock', 'trophy',
  'smile', 'eye', 'shield', 'compass', 'feather',
] as const

export const TASK_ICONS = [
  'check-circle', 'circle-check', 'star', 'flag',
  'bell', 'calendar', 'file-text', 'folder', 'inbox',
  'mail', 'phone', 'message-circle', 'shopping-cart',
  'credit-card', 'home', 'car', 'plane', 'gift',
  'heart', 'user', 'briefcase', 'archive', 'building',
  'shopping-bag', 'bookmark', 'tag', 'users', 'graduation-cap',
] as const

export const PRIORITY_LABELS: Record<number, { label: string; color: string }> = {
  1: { label: 'P1', color: '#FF5252' },
  2: { label: 'P2', color: '#FF9F5A' },
  3: { label: 'P3', color: '#5B9FFF' },
  4: { label: 'P4', color: '#6B7280' },
}
