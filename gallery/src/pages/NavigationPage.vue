<script setup lang="ts">
/**
 * Navigation and structure catalogue: tabs, menu, dropdown, context menu,
 * breadcrumb, divider, card, toolbar, nav.
 */
import { computed, ref } from 'vue'
import {
  JinAlert,
  JinBadge,
  JinBreadcrumb,
  JinButton,
  JinCard,
  JinContextMenu,
  JinDivider,
  JinDropdown,
  JinIcon,
  JinMenu,
  JinNav,
  JinSelect,
  JinSwitch,
  JinTabs,
  JinTag,
  JinTextField,
  JinToolbar,
  JinTooltip,
  type MenuEntry,
  type NavItem,
  type TabItem,
} from 'jin-ui'
import { DemoPage, DemoSection } from '../demo/DemoSection'

defineProps<{ section?: string | null }>()

// ------------------------------------------------------------------- tabs
const tab = ref<string | null>('overview')
const verticalTab = ref<string | null>('a')
const manualTab = ref<string | null>('one')
const nestedTab = ref<string | null>('files')

const tabs: TabItem[] = [
  { value: 'overview', label: 'Overview' },
  { value: 'activity', label: 'Activity', badge: '3' },
  { value: 'settings', label: 'Settings' },
  { value: 'archived', label: 'Archived', disabled: true },
]

const manyTabs: TabItem[] = [
  { value: 'a', label: 'Alpha' },
  { value: 'b', label: 'Beta' },
  { value: 'c', label: 'Gamma' },
  { value: 'd', label: 'Delta' },
]

const manualTabs: TabItem[] = [
  { value: 'one', label: 'First' },
  { value: 'two', label: 'Second' },
]

const nestedTabs: TabItem[] = [
  { value: 'files', label: 'Files' },
  { value: 'history', label: 'History' },
]

// ------------------------------------------------------------------- menu
const menuItems: MenuEntry[] = [
  { id: 'new', label: 'New item', shortcut: 'Ctrl+N' },
  { id: 'open', label: 'Open…', shortcut: 'Ctrl+O' },
  { id: 'recent', label: 'Open recent', items: [
    { id: 'r1', label: 'notes.md' },
    { id: 'r2', label: 'report.csv' },
    { id: 'sep-inner', type: 'separator' },
    { id: 'r-clear', label: 'Clear the list', danger: true },
  ] },
  { id: 'sep-1', type: 'separator' },
  { id: 'view', label: 'Show sidebar', checked: true },
  { id: 'wrap', label: 'Word wrap', checked: false },
  { id: 'sep-2', type: 'separator' },
  { id: 'group-export', type: 'label', label: 'Export' },
  { id: 'export-pdf', label: 'As PDF', keywords: 'print document' },
  { id: 'export-csv', label: 'As CSV', keywords: 'spreadsheet comma' },
  { id: 'sep-3', type: 'separator' },
  { id: 'duplicate', label: 'Duplicate', disabled: true },
  { id: 'delete', label: 'Delete', danger: true },
]

const menuEvents = ref<string[]>([])

function onMenuSelect(entry: MenuEntry): void {
  menuEvents.value = [`selected “${entry.label}”`, ...menuEvents.value].slice(0, 5)
}

// --------------------------------------------------------------- dropdown
const dropdownValue = ref<string | null>('fold')
const dropdownItems: MenuEntry[] = [
  { id: 'fold', label: 'Folded', checked: dropdownValue.value === 'fold' },
  { id: 'normal', label: 'Normal', checked: dropdownValue.value === 'normal' },
  { id: 'hide', label: 'Hidden', checked: dropdownValue.value === 'hide' },
  { id: 'sep', type: 'separator' },
  { id: 'configure', label: 'Configure…' },
]

const dropdownItemsReactive = computed<MenuEntry[]>(() =>
  dropdownItems.map((item) =>
    item.checked === undefined ? item : { ...item, checked: item.id === dropdownValue.value },
  ),
)

function onDropdownSelect(entry: MenuEntry): void {
  if (['fold', 'normal', 'hide'].includes(entry.id)) {
    dropdownValue.value = entry.id
    return
  }
  menuEvents.value = [`dropdown: “${entry.label}”`, ...menuEvents.value].slice(0, 5)
}

// ----------------------------------------------------------- context menu
const contextItems: MenuEntry[] = [
  { id: 'rename', label: 'Rename', shortcut: 'F2' },
  { id: 'duplicate', label: 'Duplicate', shortcut: 'Ctrl+D' },
  { id: 'sep', type: 'separator' },
  { id: 'reveal', label: 'Reveal in file manager' },
  { id: 'sep-2', type: 'separator' },
  { id: 'remove', label: 'Remove', danger: true },
]

// -------------------------------------------------------------- breadcrumb
const crumbs = [
  { label: 'Home', onClick: () => undefined },
  { label: 'Collections', onClick: () => undefined },
  { label: 'Field notes', onClick: () => undefined },
  { label: 'Current entry', current: true },
]

const crumbsWithHref = [
  { label: 'Projects', href: '#projects' },
  { label: 'Alpha', href: '#alpha' },
  { label: 'Details' },
]

// -------------------------------------------------------------------- nav
const navItems: NavItem[] = [
  { id: 'home', label: 'Home', icon: 'home' },
  { id: 'files', label: 'Files', icon: 'folder', badge: '12' },
  { id: 'search', label: 'Search', icon: 'search' },
  {
    id: 'settings',
    label: 'Settings',
    icon: 'settings',
    items: [
      { id: 'appearance', label: 'Appearance' },
      { id: 'shortcuts', label: 'Shortcuts' },
    ],
  },
  { id: 'trash', label: 'Trash', icon: 'trash', disabled: true },
]
const navCurrent = ref('files')

// ---------------------------------------------------------------- toolbar
const toolbarLast = ref('')
const bold = ref(true)
const italic = ref(false)

function toolbarAction(name: string): void {
  toolbarLast.value = name
}

// ------------------------------------------------------------------- card
const cardClicks = ref(0)
</script>

<template>
  <DemoPage
    title="Navigation & structure"
    lead="The controls that give a page a shape: tabs, menus, breadcrumbs, dividers, cards and toolbars. All of them share the same roving-tabindex kernel, so arrow-key behaviour is identical everywhere."
  >
    <DemoSection
      title="Tabs"
      note="Horizontal and vertical, automatic and manual activation, disabled tabs, badges, and a slot for fully custom tab content. The tab list is one tab stop; arrows move within it."
      stacked
    >
      <JinTabs v-model="tab" :items="tabs" aria-label="Section tabs">
        <template #overview>
          <p class="gallery-muted">Panel content is projected per tab value, so it stays where the application puts it.</p>
        </template>
        <template #activity>
          <p class="gallery-muted">Three unread items — the badge is drawn and announced.</p>
        </template>
        <template #settings>
          <p class="gallery-muted">Settings panel.</p>
        </template>
      </JinTabs>

      <JinDivider spaced />

      <div class="gallery-grid gallery-grid--two">
        <div>
          <p class="gallery-muted" style="margin-bottom: var(--jin-space-2)">Vertical</p>
          <JinTabs v-model="verticalTab" :items="manyTabs" orientation="vertical" aria-label="Vertical tabs">
            <template #default="{ item }">
              <p class="gallery-muted">Content for {{ item.label }}.</p>
            </template>
          </JinTabs>
        </div>

        <div>
          <p class="gallery-muted" style="margin-bottom: var(--jin-space-2)">
            Manual activation — arrows move focus, Enter or Space selects
          </p>
          <JinTabs v-model="manualTab" :items="manualTabs" activation="manual" aria-label="Manual tabs">
            <template #default="{ item }">
              <p class="gallery-muted">Selected: {{ item.label }}</p>
            </template>
          </JinTabs>
        </div>

        <div>
          <p class="gallery-muted" style="margin-bottom: var(--jin-space-2)">Growing to fill the list</p>
          <JinTabs v-model="nestedTab" :items="nestedTabs" :grow="true" aria-label="Growing tabs">
            <template #default="{ item }">
              <p class="gallery-muted">{{ item.label }}</p>
            </template>
          </JinTabs>
        </div>

        <div>
          <p class="gallery-muted" style="margin-bottom: var(--jin-space-2)">Custom tab content through the slot</p>
          <JinTabs v-model="tab" :items="tabs" aria-label="Custom tabs">
            <template #tab="{ item }">
              <JinIcon :name="item.value === 'overview' ? 'home' : item.value === 'activity' ? 'bell' : 'settings'" />
              <span>{{ item.label }}</span>
              <JinTag v-if="item.badge" :label="item.badge" />
            </template>
          </JinTabs>
        </div>
      </div>
    </DemoSection>

    <DemoSection
      title="Menu"
      note="One flat, keyboard-driven list. Submenus are rows whose children appear when the branch is open — the same component drives the dropdown and the context menu below, and both get the same arrow, Home/End, type-ahead and Escape behaviour."
      stacked
    >
      <div class="gallery-grid gallery-grid--two">
        <div>
          <p class="gallery-muted" style="margin-bottom: var(--jin-space-2)">
            Inline menu — try ArrowRight on “Open recent”, then Escape
          </p>
          <JinMenu :items="menuItems" aria-label="Demo menu" @select="onMenuSelect" />
        </div>

        <div class="gallery-grid">
          <JinAlert
            tone="info"
            title="Keyboard model"
            description="Down/Up move, Right opens a submenu, Left closes it, Home and End jump, Escape closes the deepest thing first, and typing jumps to a matching label."
          />
          <JinAlert
            v-if="menuEvents.length > 0"
            tone="neutral"
            title="Events"
            :description="menuEvents.join(' · ')"
          />
          <JinAlert
            tone="warning"
            title="Disabled and dangerous rows"
            description="Disabled rows are skipped by every navigation key. Danger rows are coloured and are given a tinted background when active, so the state is visible as well as coloured."
          />
        </div>
      </div>
    </DemoSection>

    <DemoSection
      title="Dropdown"
      note="A menu behind a trigger. Enter, Space or ArrowDown opens it and moves focus to the first item; Escape closes it and focus returns to the trigger."
    >
      <JinDropdown :items="dropdownItemsReactive" aria-label="Display state" @select="onDropdownSelect">
        <template #trigger>
          <JinButton variant="secondary">
            <template #icon><JinIcon name="filter" /></template>
            Display: {{ dropdownValue }}
          </JinButton>
        </template>
      </JinDropdown>

      <JinDropdown
        :items="[
          { id: 'copy', label: 'Copy', shortcut: 'Ctrl+C' },
          { id: 'cut', label: 'Cut', shortcut: 'Ctrl+X' },
          { id: 'paste', label: 'Paste', shortcut: 'Ctrl+V', disabled: true },
        ]"
        aria-label="More actions"
        @select="onMenuSelect"
      >
        <template #trigger>
          <JinButton variant="ghost" icon label="More actions">
            <template #icon><JinIcon name="menu" /></template>
          </JinButton>
        </template>
      </JinDropdown>

      <span class="gallery-muted">A dropdown with nothing but an icon and an accessible name.</span>
    </DemoSection>

    <DemoSection
      title="Context menu"
      note="Right-click the area below, or focus it and press Shift+F10 — a context menu that ignores the keyboard is unusable. The menu is clamped into the viewport when the pointer is near an edge."
      stacked
    >
      <JinContextMenu :items="contextItems" aria-label="Item actions" @select="onMenuSelect">
        <div
          style="
            padding: var(--jin-space-6);
            border: var(--jin-border-width) var(--jin-border-style) var(--jin-border-color-strong);
            border-radius: var(--jin-radius-md);
            text-align: center;
          "
        >
          <JinIcon name="file" :size="1.6" />
          <p style="margin: var(--jin-space-2) 0 0">Right-click here</p>
          <p class="gallery-muted" style="margin: 0">Tab to it and press Shift+F10 for the keyboard route</p>
        </div>
      </JinContextMenu>

      <JinAlert
        v-if="menuEvents.length > 0"
        tone="neutral"
        :title="menuEvents[0]"
      />
    </DemoSection>

    <DemoSection
      title="Breadcrumb"
      note="A real navigation landmark with an ordered list. The final item is marked aria-current, and separators are decorative."
      stacked
    >
      <JinBreadcrumb :items="crumbs" />
      <JinBreadcrumb :items="crumbsWithHref" />
      <JinBreadcrumb :items="crumbs.slice(0, 2)" aria-label="Short trail">
        <template #separator>›</template>
      </JinBreadcrumb>
      <JinBreadcrumb
        :items="[
          { label: 'A very long first segment that should wrap rather than overflow its container gracefully' },
          { label: 'And a second one equally long to force the issue' },
          { label: 'Leaf', current: true },
        ]"
      />
    </DemoSection>

    <DemoSection
      title="Divider"
      note="A structural rule: horizontal, vertical, spaced, and a labelled variant for separating groups inside a form."
      stacked
    >
      <div style="display: flex; flex-direction: column; gap: var(--jin-space-3); width: 100%">
        <p>Above</p>
        <JinDivider />
        <p>Below a plain rule</p>
        <JinDivider spaced />
        <p>Spaced rule has margin</p>
        <JinDivider label="Or" />
        <p>Grouped content after a labelled rule</p>
        <div style="display: flex; align-items: center; height: 48px">
          <span>Left</span>
          <JinDivider orientation="vertical" />
          <span>Middle</span>
          <JinDivider orientation="vertical" spaced />
          <span>Right</span>
        </div>
      </div>
    </DemoSection>

    <DemoSection
      title="Card"
      note="A surface container. The interactive variant is a real focusable surface with Enter and Space activation, not a div with a click handler."
      stacked
    >
      <div class="gallery-grid gallery-grid--two">
        <JinCard title="Base card" description="Default elevation for a panel sitting on the page.">
          <p class="gallery-muted">Card body content.</p>
          <template #footer>
            <JinButton size="sm" variant="ghost">Cancel</JinButton>
            <JinButton size="sm" variant="primary">Save</JinButton>
          </template>
        </JinCard>

        <JinCard title="Raised card" description="For content that should read as floating." elevation="raised">
          <p class="gallery-muted">A higher elevation level from the same token set.</p>
        </JinCard>

        <JinCard title="Flat card" description="No shadow at all — brutalism renders every card this way." elevation="flat">
          <p class="gallery-muted">The difference is a token, not a variant-specific stylesheet.</p>
        </JinCard>

        <JinCard
          title="Interactive card"
          description="Tab to me and press Enter."
          interactive
          @activate="cardClicks += 1"
        >
          <p class="gallery-muted">Activated {{ cardClicks }} time{{ cardClicks === 1 ? '' : 's' }}.</p>
        </JinCard>

        <JinCard>
          <template #header>
            <p class="gallery-muted">A fully custom header via the slot</p>
          </template>
          <p class="gallery-muted">Body.</p>
        </JinCard>
      </div>
    </DemoSection>

    <DemoSection
      title="Toolbar"
      note="A horizontal action strip that is a single tab stop: arrows move between its controls, so a long toolbar does not become a Tab marathon. The last action is reported below."
    >
      <JinToolbar aria-label="Editor toolbar">
        <JinTooltip content="Bold" placement="top">
          <JinButton
            :variant="bold ? 'primary' : 'ghost'"
            size="sm"
            icon
            label="Bold"
            @click="bold = !bold; toolbarAction('bold')"
          >
            <template #icon><span style="font-weight: 800">B</span></template>
          </JinButton>
        </JinTooltip>
        <JinTooltip content="Italic" placement="top">
          <JinButton
            :variant="italic ? 'primary' : 'ghost'"
            size="sm"
            icon
            label="Italic"
            @click="italic = !italic; toolbarAction('italic')"
          >
            <template #icon><span style="font-style: italic">I</span></template>
          </JinButton>
        </JinTooltip>
        <JinDivider orientation="vertical" />
        <JinButton size="sm" variant="ghost" @click="toolbarAction('link')">
          <template #icon><JinIcon name="link" /></template>
          Link
        </JinButton>
        <JinButton size="sm" variant="ghost" @click="toolbarAction('copy')">
          <template #icon><JinIcon name="copy" /></template>
          Copy
        </JinButton>
        <JinButton size="sm" variant="ghost" disabled>
          <template #icon><JinIcon name="trash" /></template>
          Delete
        </JinButton>
        <span class="jin-toolbar__spacer" />
        <JinTooltip content="Export" placement="top">
          <JinButton size="sm" variant="ghost" icon label="Export" @click="toolbarAction('export')">
            <template #icon><JinIcon name="download" /></template>
          </JinButton>
        </JinTooltip>
      </JinToolbar>

      <span v-if="toolbarLast" class="gallery-muted">Last action: {{ toolbarLast }}</span>

      <JinToolbar quiet aria-label="Quiet toolbar">
        <JinBadge tone="info" label="quiet variant" />
        <JinButton size="sm" variant="ghost">No surface</JinButton>
        <JinSwitch size="sm" label="Inline switch" />
      </JinToolbar>
    </DemoSection>

    <DemoSection
      title="Nav"
      note="A navigation landmark for a sidebar. Nested items render as an indented sub-list; the current item carries aria-current so screen readers can announce it."
      stacked
      :plain="false"
    >
      <div class="gallery-grid gallery-grid--two">
        <JinNav :items="navItems" :current="navCurrent" aria-label="Demo navigation" @select="(item) => (navCurrent = item.id)" />

        <div class="gallery-grid">
          <JinAlert
            tone="info"
            title="Presentational by design"
            description="Nav renders labels, icons and badges and reports activation. It does not know what a route is, so it works the same in a Tauri window, a router app and a plain page."
          />
          <JinAlert
            v-if="navCurrent"
            tone="neutral"
            :title="`Current item: ${navCurrent}`"
          />
        </div>
      </div>
    </DemoSection>

    <DemoSection
      title="Structure composes"
      note="These controls are meant to be combined. A card with a toolbar and tabs, inside a two-column layout, is the shape most application screens end up taking."
      stacked
    >
      <JinCard title="Composed panel" description="Toolbar, tabs and content in one card.">
        <div class="gallery-grid">
          <JinToolbar quiet aria-label="Panel toolbar">
            <JinTextField size="sm" placeholder="Filter rows…" clearable style="max-width: 240px" />
            <span class="jin-toolbar__spacer" />
            <JinButton size="sm" variant="ghost" icon label="Refresh">
              <template #icon><JinIcon name="refresh" /></template>
            </JinButton>
            <JinButton size="sm" variant="primary">Add row</JinButton>
          </JinToolbar>

          <JinDivider />

          <JinTabs v-model="tab" :items="tabs.slice(0, 3)" aria-label="Panel tabs">
            <template #default="{ item }">
              <JinAlert tone="neutral" :title="`${item.label} panel`" description="Each tab can hold anything." />
            </template>
          </JinTabs>
        </div>
      </JinCard>

      <JinDivider label="Layout helpers" />

      <div class="gallery-grid gallery-grid--three">
        <JinCard title="Column stack" description="Vertical rhythm from space tokens.">
          <div class="jin-stack">
            <JinBadge tone="success" label="step 1" />
            <JinBadge tone="info" label="step 2" />
            <JinBadge tone="neutral" label="step 3" />
          </div>
        </JinCard>

        <JinCard title="Row cluster" description="Wraps when space runs out.">
          <div class="jin-cluster">
            <JinTag label="one" removable />
            <JinTag label="two" removable />
            <JinTag label="three" removable />
            <JinTag label="four" removable />
          </div>
        </JinCard>

        <JinCard title="Selection" description="A tiny select in a card header.">
          <JinSelect
            :options="[
              { value: 'a', label: 'Option A' },
              { value: 'b', label: 'Option B' },
            ]"
            model-value="a"
            size="sm"
          />
        </JinCard>
      </div>
    </DemoSection>
  </DemoPage>
</template>
