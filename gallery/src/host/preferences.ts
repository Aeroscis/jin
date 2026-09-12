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
    id: 'glassmorphism',
    label: 'Glassmorphism',
    note: 'Translucent panels over a coloured ground, blurred by --jin-blur and edged with a 1px light line. The style that needs the depth tokens to be real.',
  },
  {
    id: 'neumorphism',
    label: 'Neumorphism',
    note: 'One material, extruded and pressed: a panel is the colour of the page, and only a light-and-shade pair of shadows says which way it faces.',
  },
  {
    id: 'flat-design',
    label: 'Flat Design',
    note: 'Solid colour on solid colour with a 1px line between: no gradient, no shadow, no blur. Depth removed on purpose rather than left unset.',
  },
  {
    id: 'claymorphism',
    label: 'Claymorphism',
    note: 'Chunky pastel clay: 3px rims, 20px radii, a matte gradient, and a solid offset under each panel that reads as thickness.',
  },
  {
    id: 'minimalism-and-swiss-style',
    label: 'Minimalism & Swiss Style',
    note: 'The grid and the type do the work: monochrome, zero radius, zero shadow, and one red as the only colour in the page.',
  },
  {
    id: 'neubrutalism',
    label: 'Neubrutalism',
    note: 'Brutalism with a hard offset shadow and a poster palette: 3px black outlines, 5px solid offsets, no gradients, no blur.',
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
