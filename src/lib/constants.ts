// Color palette — expanded
export const COLORS = [
  // Greens
  '#3DD68C', '#1DE9B6', '#69F0AE', '#4CAF50', '#00C853', '#2E7D32',
  // Blues
  '#5B9FFF', '#448AFF', '#00E5FF', '#40C4FF', '#2196F3', '#1565C0',
  // Purples
  '#B084FF', '#7C4DFF', '#E040FB', '#AB47BC', '#9C27B0', '#6A1B9A',
  // Pinks / Reds
  '#FF6B9D', '#FF80AB', '#FF5252', '#F44336', '#E91E63', '#C62828',
  // Oranges / Yellows
  '#FF9F5A', '#FFAB40', '#FFEB3B', '#FFC107', '#FF6D00', '#FF8F00',
  // Neutrals / Pastels
  '#ECEFF1', '#90A4AE', '#78909C', '#A1887F', '#8D6E63', '#607D8B',
  // Extra vivid
  '#00BFA5', '#64FFDA', '#FFFF00', '#F50057', '#D500F9', '#304FFE',
] as const

// Habit icon set — expanded
export const HABIT_ICONS = [
  // Fitness & Health
  'zap', 'flame', 'heart', 'dumbbell', 'bike', 'footprints',
  'apple', 'salad', 'pill', 'activity', 'timer', 'weight',
  // Mindfulness & Wellness
  'brain', 'sparkles', 'moon', 'sun', 'cloud', 'wind',
  'flower-2', 'tree-pine', 'leaf', 'droplets', 'bath', 'bed-double',
  // Learning & Productivity
  'book-open', 'pencil', 'graduation-cap', 'lightbulb', 'target',
  'trophy', 'medal', 'rocket', 'clock', 'calendar-check',
  // Creative & Hobbies
  'music', 'headphones', 'camera', 'paintbrush', 'palette',
  'gamepad-2', 'dice-5', 'guitar', 'drama', 'clapperboard',
  // Social & Communication
  'smile', 'laugh', 'heart-handshake', 'users', 'message-circle',
  'phone', 'video', 'globe', 'languages', 'hand-heart',
  // Tech & Work
  'laptop', 'code', 'terminal', 'database', 'briefcase',
  'wallet', 'credit-card', 'chart-bar', 'trending-up', 'boxes',
  // Lifestyle
  'coffee', 'utensils', 'wine', 'cigarette-off', 'glasses',
  'shirt', 'home', 'car', 'plane', 'map-pin',
  // Nature & Animals
  'dog', 'cat', 'bird', 'fish', 'bug',
  'mountain', 'waves', 'snowflake', 'rainbow', 'sunrise',
  // Symbols
  'star', 'bell', 'shield', 'compass', 'feather',
  'flag', 'bookmark', 'tag', 'key', 'eye',
  'check-circle', 'circle-dot', 'infinity', 'diamond', 'crown',
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
