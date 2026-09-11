<script setup lang="ts">
/**
 * The Gallery shell.
 *
 * Requirement 1 is that the Gallery is built from the library's own components:
 * the navigation, the two switchers, the dropdown, the modals, the tooltips and
 * every message on this page come from `jin-ui`. Where a native element would
 * have been easier, the library component is used on purpose — this is the
 * strongest test the library has.
 */
import { computed, onMounted, ref } from 'vue'
import {
  JinAlert,
  JinBadge,
  JinButton,
  JinDivider,
  JinDrawer,
  JinDropdown,
  JinIcon,
  JinNav,
  JinNotificationRegion,
  JinPopconfirm,
  JinSelect,
  JinSwitch,
  JinToastRegion,
  JinToolbar,
  JinTooltip,
  useNotifications,
  useTheme,
  useToasts,
  type MenuEntry,
  type NavItem,
} from 'jin-ui'
import { AVAILABLE_STYLES } from './host/preferences'
import { getCapabilities } from './host/capabilities'
import TokenPanel from './panels/TokenPanel.vue'
import { PAGES } from './pages/registry'

const theme = useTheme()
const toasts = useToasts()
const notifications = useNotifications()
const capabilities = getCapabilities()

// The top nav lists pages only. A page's sections appear in the section list
// below it, so they are not repeated as nested rows here.
const navItems = computed<NavItem[]>(() => [
  { id: 'tokens', label: 'Design tokens', icon: 'sparkle', badge: 'live' },
  ...PAGES.map<NavItem>((page) => ({
    id: page.id,
    label: page.label,
    icon: page.icon,
  })),
])

const current = ref<string>('tokens')
const currentPage = computed(() => PAGES.find((page) => page.id === current.value) ?? null)
// Which section of the current page is highlighted, if any.
const activeChild = ref<string | null>(null)

function selectItem(item: { id: string }): void {
  activeChild.value = null
  current.value = item.id
}

function selectChild(pageId: string, childId: string): void {
  current.value = pageId
  activeChild.value = childId
}

const styleOptions = AVAILABLE_STYLES.map((entry) => ({ value: entry.id, label: entry.label }))
const styleNote = computed(() => AVAILABLE_STYLES.find((entry) => entry.id === theme.style.value)?.note ?? '')

const aboutOpen = ref(false)
const shortcutsOpen = ref(false)
const compactMode = ref(false)

const headerMenu = computed<MenuEntry[]>(() => [
  { id: 'about', label: 'About Jin (锦)', keywords: 'info version' },
  { id: 'shortcuts', label: 'Keyboard model', shortcut: '?' },
  { id: 'sep-1', type: 'separator' },
  { id: 'tokens', label: 'Design tokens', disabled: current.value === 'tokens' },
  { id: 'theme-toggle', label: theme.mode.value === 'dark' ? 'Switch to light' : 'Switch to dark' },
  { id: 'sep-2', type: 'separator' },
  { id: 'reset-demo', label: 'Reset demo state', danger: true },
])

function onHeaderMenu(entry: MenuEntry): void {
  switch (entry.id) {
    case 'about':
      aboutOpen.value = true
      return
    case 'shortcuts':
      shortcutsOpen.value = true
      return
    case 'tokens':
      current.value = 'tokens'
      return
    case 'theme-toggle':
      theme.toggleMode()
      return
    case 'reset-demo':
      resetDemo()
      return
  }
}

function resetDemo(): void {
  toasts.clear()
  notifications.clear()
  theme.setStyle('jin')
  theme.setMode('dark')
  toasts.push({ tone: 'success', title: 'Demo state reset', description: 'Style, mode and messages are back to defaults.' })
}

const shortcuts = [
  { keys: 'Tab / Shift+Tab', what: 'Move between controls' },
  { keys: '← → ↑ ↓', what: 'Move inside a group (tabs, menu, tree, radio, toolbar)' },
  { keys: 'Home / End', what: 'Jump to the first or last item of a group' },
  { keys: 'Enter / Space', what: 'Activate the focused control' },
  { keys: 'Esc', what: 'Close the topmost overlay; focus returns to its trigger' },
  { keys: 'Type-ahead', what: 'Jump to an item by typing its first letters' },
  { keys: 'Shift+F10 / Menu', what: 'Open a context menu from the keyboard' },
  { keys: 'Tab', what: 'Inside an open dialog, Tab cycles within it' },
]

function announceStyle(): void {
  const label = AVAILABLE_STYLES.find((entry) => entry.id === theme.style.value)?.label ?? theme.style.value
  toasts.push({ tone: 'info', title: `${label} · ${theme.mode.value}`, duration: 2200 })
}

const portalHint = computed(() =>
  capabilities.isDesktop ? 'Native folder picker available' : 'Browser: folder picker unavailable',
)

onMounted(() => {
  if (!capabilities.isDesktop) return
  toasts.push({
    tone: 'neutral',
    title: 'Running in the desktop shell',
    description: portalHint.value,
    duration: 3500,
  })
})
</script>

<template>
  <div class="gallery-root">
    <div class="gallery-shell">
      <header class="gallery-header">
        <div class="gallery-brand">
          <span class="gallery-brand__name">Jin · 锦</span>
          <span class="gallery-brand__sub">component gallery</span>
        </div>

        <div class="gallery-header__spacer" />

        <div class="gallery-header__controls">
          <div class="gallery-control">
            <span class="gallery-control__label">Style</span>
            <JinSelect
              :model-value="theme.style.value"
              :options="styleOptions"
              size="sm"
              :block="false"
              aria-label="Visual style"
              @update:model-value="(value: string | null) => { theme.setStyle(value ?? 'jin'); announceStyle() }"
            />
          </div>

          <div class="gallery-control">
            <span class="gallery-control__label">Mode</span>
            <JinSwitch
              :model-value="theme.mode.value === 'dark'"
              size="sm"
              aria-label="Dark mode"
              @update:model-value="(value: boolean) => { theme.setMode(value ? 'dark' : 'light'); announceStyle() }"
            />
          </div>

          <JinTooltip content="Reset style, mode and messages" placement="bottom">
            <JinButton variant="ghost" size="sm" icon label="Reset demo" @click="resetDemo">
              <template #icon><JinIcon name="refresh" /></template>
            </JinButton>
          </JinTooltip>

          <JinDropdown :items="headerMenu" aria-label="Gallery menu" @select="onHeaderMenu">
            <template #trigger>
              <JinButton variant="secondary" size="sm">
                <template #icon><JinIcon name="menu" /></template>
                Menu
              </JinButton>
            </template>
          </JinDropdown>
        </div>
      </header>

      <aside class="gallery-sidebar">
        <JinNav :items="navItems" :current="current" aria-label="Gallery sections" @select="selectItem" />

        <template v-if="currentPage?.children">
          <JinDivider spaced />
          <p class="gallery-sidebar__group-title">{{ currentPage.label }} sections</p>
          <JinNav
            :items="currentPage.children.map((child) => ({ id: child.id, label: child.label }))"
            :current="activeChild"
            :aria-label="`${currentPage.label} sections`"
            @select="(item) => selectChild(currentPage!.id, item.id)"
          />
        </template>
      </aside>

      <main class="gallery-main">
        <TokenPanel v-if="current === 'tokens'" />
        <component
          :is="currentPage!.component"
          v-else-if="currentPage"
          :key="currentPage.id"
          :section="activeChild"
        />
      </main>
    </div>

    <!-- Both regions are part of the page, not of any single control. -->
    <JinToastRegion />
    <JinNotificationRegion />

    <JinDrawer v-model="aboutOpen" title="About Jin (锦)" side="right" size="md">
      <div class="gallery-grid">
        <p>
          Jin is a token-driven Vue 3 control library. Its name is the Chinese word for
          <em>brocade</em>: a fabric woven from many small repeated units, which is what a
          component set is, and it is dyed in many colourways, which is what a style system is.
        </p>
        <p>
          The library knows about structure, interaction, accessibility and state machines. Anything
          that needs a business noun to describe goes through props, slots or injection — the
          controls in this gallery carry no domain vocabulary at all.
        </p>
        <JinDivider label="Contract" />
        <ul class="gallery-mono">
          <li>Tokens: <code>--jin-*</code> · classes: <code>jin-*</code> · components: <code>Jin*</code></li>
          <li>Style axis: <code>data-jin-style</code> · mode axis: <code>data-jin-mode</code></li>
          <li>One portal container, six z-index layers</li>
        </ul>
      </div>
    </JinDrawer>

    <JinDrawer v-model="shortcutsOpen" title="Keyboard model" side="right" size="lg">
      <div class="gallery-grid">
        <JinAlert
          tone="info"
          title="Every control is reachable without a mouse"
          description="The table below is not aspirational — each row is implemented by the shared kernel modules and covered by the unit tests."
        />
        <div class="gallery-grid">
          <div v-for="entry in shortcuts" :key="entry.keys" class="gallery-list-row">
            <span class="gallery-mono" style="min-width: 160px">{{ entry.keys }}</span>
            <span class="gallery-muted">{{ entry.what }}</span>
          </div>
        </div>
        <JinDivider label="Focus" />
        <p>
          Overlays trap focus while open and return it to the element that opened them when they
          close. The focus ring comes from <code>--jin-focus-ring-*</code>, which every theme
          declares explicitly so a style change can never remove keyboard focus.
        </p>
      </div>
    </JinDrawer>
  </div>
</template>
