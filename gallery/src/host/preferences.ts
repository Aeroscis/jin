/**
 * Preference persistence. This belongs to the host application — the library
 * deliberately never touches localStorage.
 */
import type { JinMode } from '@aeroscis/jin'

const STYLE_KEY = 'jin-gallery.style'
const MODE_KEY = 'jin-gallery.mode'

export const AVAILABLE_STYLES = [
  {
    id: 'jin',
    label: 'Jin · 锦',
    note: 'The house style: a limited palette on a warp/weft grid, gold thread for boundaries and focus, silk sheen instead of drop shadows.',
  },
  {
    id: 'dimensional-layering',
    label: 'Dimensional Layering',
    note: 'Soft depth with four elevation levels and generous radii. The plain modern baseline.',
  },
  {
    id: 'brutalism',
    label: 'Brutalism',
    note: 'Zero radius, no shadows, no motion, thick visible borders. The token-contract stress test.',
  },
] as const

export interface Preferences {
  defaultStyle?: string
  defaultMode?: JinMode
}

export function loadPreferences(): Preferences {
  if (typeof localStorage === 'undefined') return {}
  const style = localStorage.getItem(STYLE_KEY)
  const mode = localStorage.getItem(MODE_KEY)
  const preferences: Preferences = {}
  if (style && AVAILABLE_STYLES.some((entry) => entry.id === style)) preferences.defaultStyle = style
  if (mode === 'light' || mode === 'dark') preferences.defaultMode = mode
  return preferences
}

export function savePreferences(snapshot: { style: string; mode: JinMode }): void {
  if (typeof localStorage === 'undefined') return
  try {
    localStorage.setItem(STYLE_KEY, snapshot.style)
    localStorage.setItem(MODE_KEY, snapshot.mode)
  } catch {
    // A gallery that cannot persist a preference still works; say nothing.
  }
}
