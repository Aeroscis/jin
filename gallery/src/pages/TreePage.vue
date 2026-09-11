<script setup lang="ts">
/**
 * Tree catalogue — the component with the strictest contract.
 *
 * Every section here corresponds to a clause of that contract: nesting and
 * aria, selection modes, lazy loading with an inline indicator on the loading
 * row, the failure semantics (roll back, report, never swallow), the two
 * decoration routes (generic tone and the #item slot), and keyboard navigation.
 */
import { computed, ref } from 'vue'
import {
  JinAlert,
  JinBadge,
  JinButton,
  JinIcon,
  JinTag,
  JinTextField,
  JinTree,
  type TreeNode,
} from 'jin-ui'
import { DemoPage, DemoSection } from '../demo/DemoSection'

defineProps<{ section?: string | null }>()

// ------------------------------------------------------------------ basics
const basicNodes: TreeNode[] = [
  {
    id: 'src',
    label: 'src',
    children: [
      { id: 'components', label: 'components', children: [
        { id: 'button', label: 'Button.vue' },
        { id: 'dialog', label: 'Dialog.vue' },
      ] },
      { id: 'styles', label: 'styles', children: [{ id: 'tokens', label: 'tokens.css' }] },
      { id: 'main', label: 'main.ts' },
    ],
  },
  { id: 'tests', label: 'tests', children: [{ id: 'unit', label: 'unit.spec.ts' }] },
  { id: 'readme', label: 'README.md' },
]

const expandedBasic = ref<string[]>(['src', 'components'])
const selectedBasic = ref<string | null>('button')

// --------------------------------------------------------------- selection
const multiNodes: TreeNode[] = [
  { id: 'g1', label: 'Group one', children: [
    { id: 'i1', label: 'Item one' },
    { id: 'i2', label: 'Item two' },
    { id: 'i3', label: 'Item three', disabled: true },
  ] },
  { id: 'g2', label: 'Group two', children: [
    { id: 'i4', label: 'Item four' },
  ] },
]
const selectedMany = ref<string[]>(['i1'])
const noSelection = ref<string | null>(null)

// ------------------------------------------------------------ lazy loading
/** A fake remote: each branch resolves after a short delay. */
const lazyNodes: TreeNode[] = [
  { id: 'root-a', label: 'Remote node A', hasChildren: true },
  { id: 'root-b', label: 'Remote node B', hasChildren: true },
  { id: 'leaf', label: 'A plain leaf' },
]

const lazyExpanded = ref<string[]>([])
const lazyLog = ref<string[]>([])

function loadChildren(node: TreeNode): Promise<TreeNode[]> {
  lazyLog.value = [`load started for ${node.id}`, ...lazyLog.value].slice(0, 5)
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        { id: `${node.id}-1`, label: 'Fetched child 1', children: [{ id: `${node.id}-1a`, label: 'Deeper' }] },
        { id: `${node.id}-2`, label: 'Fetched child 2' },
      ])
    }, 900)
  })
}

// ---------------------------------------------------------------- failure
/** Fails on the first attempt and succeeds on the retry. */
const failingNodes: TreeNode[] = [
  { id: 'flaky', label: 'Flaky branch (fails once)', hasChildren: true },
  { id: 'always', label: 'Always fails', hasChildren: true },
]

const failureLog = ref<{ node: string; error: string }[]>([])
const attempts = ref<Record<string, number>>({})

function loadUnreliable(node: TreeNode): Promise<TreeNode[]> {
  const attempt = (attempts.value[node.id] ?? 0) + 1
  attempts.value = { ...attempts.value, [node.id]: attempt }

  if (node.id === 'always' || attempt === 1) {
    return new Promise((_, reject) => {
      setTimeout(() => reject(new Error(`Request failed (attempt ${attempt})`)), 700)
    })
  }
  return new Promise((resolve) => {
    setTimeout(() => resolve([{ id: `${node.id}-ok`, label: `Loaded on attempt ${attempt}` }]), 500)
  })
}

function onLoadError(payload: { node: TreeNode; error: unknown }): void {
  const message = payload.error instanceof Error ? payload.error.message : String(payload.error)
  failureLog.value = [
    { node: payload.node.label ?? payload.node.id, error: message },
    ...failureLog.value,
  ].slice(0, 5)
}

// ------------------------------------------------------------------- tone
const toneNodes: TreeNode[] = [
  { id: 't-normal', label: 'default tone', tone: 'default' },
  { id: 't-muted', label: 'muted tone', tone: 'muted' },
  { id: 't-warning', label: 'warning tone', tone: 'warning' },
  { id: 't-danger', label: 'danger tone', tone: 'danger' },
  { id: 't-icon', label: 'with a generic icon name', icon: 'database' },
]

/**
 * The slot route: the application renders its own badge. Note what the markup
 * contains — the library supplies `node`, `depth`, `expanded`, `loading` and
 * `failed`, and the application decides what any of it means.
 */
const slotNodes: TreeNode[] = [
  { id: 's1', label: 'records', data: { badge: '12', state: 'ok' } },
  { id: 's2', label: 'drafts', data: { badge: '3', state: 'attention' } },
  { id: 's3', label: 'legacy', data: { badge: '—', state: 'muted' } },
  { id: 's4', label: 'restricted', data: { badge: '!', state: 'blocked' } },
]

function nodeState(node: TreeNode): string {
  return (node.data as { state?: string } | undefined)?.state ?? 'ok'
}

function nodeBadge(node: TreeNode): string {
  return (node.data as { badge?: string } | undefined)?.badge ?? ''
}

function stateTone(state: string): 'neutral' | 'accent' | 'success' | 'warning' | 'danger' {
  if (state === 'ok') return 'success'
  if (state === 'attention') return 'warning'
  if (state === 'blocked') return 'danger'
  return 'neutral'
}

/** Turns an application state into one of the library's generic icon names. */
function stateIcon(state: string): 'check' | 'warning' | 'lock' | 'file' {
  if (state === 'ok') return 'check'
  if (state === 'attention') return 'warning'
  if (state === 'blocked') return 'lock'
  return 'file'
}

// ---------------------------------------------------------------- keyboard
const filter = ref('')
const filterableNodes = computed<TreeNode[]>(() => {
  const needle = filter.value.trim().toLowerCase()
  const all: TreeNode[] = [
    { id: 'k1', label: 'alpha', children: [{ id: 'k1a', label: 'alpha child' }] },
    { id: 'k2', label: 'beta' },
    { id: 'k3', label: 'gamma', children: [{ id: 'k3a', label: 'gamma child' }] },
    { id: 'k4', label: 'delta' },
  ]
  if (!needle) return all
  return all.filter((node) => (node.label ?? '').toLowerCase().includes(needle))
})

const keyboardLog = ref<string[]>([])

function onActivate(node: TreeNode): void {
  keyboardLog.value = [`activated ${node.label ?? node.id}`, ...keyboardLog.value].slice(0, 5)
}

function onToggle(node: TreeNode, expanded: boolean): void {
  keyboardLog.value = [`${expanded ? 'expanded' : 'collapsed'} ${node.label ?? node.id}`, ...keyboardLog.value].slice(0, 5)
}
</script>

<template>
  <DemoPage
    title="Tree"
    lead="The most demanding control in the set. The library owns nesting, expansion, selection, keyboard navigation, the aria attributes, the inline loading state and the failure contract. The application owns what a node means."
  >
    <!-- ------------------------------------------------------------ basics -->
    <DemoSection
      id="basic"
      title="Nesting, expansion and aria"
      note="The rows expose aria-level, aria-setsize and aria-posinset, so a screen reader can announce “3 of 5, level 2” without the application computing anything. Expansion is a v-model, and clicking a row selects it."
      stacked
    >
      <div class="gallery-grid gallery-grid--two">
        <JinTree
          v-model:expanded="expandedBasic"
          v-model:selected="selectedBasic"
          :nodes="basicNodes"
          aria-label="Project files"
        />
        <div class="gallery-grid">
          <JinAlert tone="neutral" title="Selection" :description="`selected: ${selectedBasic ?? 'nothing'}`" />
          <JinAlert tone="neutral" title="Expansion" :description="`expanded: ${expandedBasic.join(', ') || 'nothing'}`" />
          <JinAlert
            tone="info"
            title="Controlled or uncontrolled"
            description="Pass the v-models to own the state, or omit them and let the tree keep it internally."
          />
          <p class="gallery-muted">
            The tree itself renders no domain vocabulary: nodes have an id, a label, optional children
            and a generic tone. Everything else arrives through slots.
          </p>
        </div>
      </div>
    </DemoSection>

    <!-- --------------------------------------------------------- selection -->
    <DemoSection
      id="selection"
      title="Selection modes"
      note="Single, multiple, or none. A multiple tree sets aria-multiselectable and reports the whole selection through update:selectedMany."
      stacked
    >
      <div class="gallery-grid gallery-grid--two">
        <div>
          <p class="gallery-muted" style="margin-bottom: var(--jin-space-2)">Multiple</p>
          <JinTree
            :nodes="multiNodes"
            selection-mode="multiple"
            :expanded="['g1', 'g2']"
            aria-label="Multiple selection"
            @update:selected-many="(value: string[]) => (selectedMany = value)"
          />
          <p class="gallery-muted" style="margin-top: var(--jin-space-2)">
            selected: {{ selectedMany.join(', ') || 'nothing' }}
          </p>
        </div>

        <div>
          <p class="gallery-muted" style="margin-bottom: var(--jin-space-2)">Selection disabled</p>
          <JinTree
            :nodes="multiNodes"
            selection-mode="none"
            :expanded="['g1']"
            aria-label="No selection"
            @activate="onActivate"
          />
          <p class="gallery-muted" style="margin-top: var(--jin-space-2)">
            Rows are still activatable — the application decides what that means.
          </p>
        </div>
      </div>

      <JinAlert
        tone="warning"
        title="Disabled rows"
        description="The third row of the first group is disabled: it is skipped by every navigation key, is not selectable, and is marked aria-disabled."
      />
    </DemoSection>

    <!-- ------------------------------------------------------ lazy loading -->
    <DemoSection
      id="lazy"
      title="Lazy loading"
      note="A branch with hasChildren and no children is fetched through `load` the first time it expands. The indicator appears inside the row that is loading, not in a global corner."
      stacked
    >
      <div class="gallery-grid gallery-grid--two">
        <JinTree
          :nodes="lazyNodes"
          :load="loadChildren"
          aria-label="Lazily loaded tree"
          @toggle="onToggle"
        />
        <div class="gallery-grid">
          <JinAlert
            tone="info"
            title="How the state machine works"
            description="Expand → loading flag on that row → resolve → children stored and the row stays open. The loader is called once per branch; expanding again does not refetch."
          />
          <JinAlert v-if="lazyLog.length > 0" tone="neutral" title="Loader activity" :description="lazyLog.join(' · ')" />
          <p class="gallery-muted">
            Programmatic expansion also triggers the load, so setting the expanded list from code does
            not leave an empty branch on screen.
          </p>
        </div>
      </div>
    </DemoSection>

    <!-- ---------------------------------------------------- failure/retry -->
    <DemoSection
      id="failure"
      title="Failure and retry"
      note="When `load` rejects, the library does three things and nothing else: it returns the row to “not loaded”, it emits load-error with the node and the error so the application can roll back its own state, and it never swallows the failure. The row shows an inline failure marker with a retry control."
      stacked
    >
      <div class="gallery-grid gallery-grid--two">
        <JinTree
          :nodes="failingNodes"
          :load="loadUnreliable"
          aria-label="Unreliable loader"
          loading-label="Fetching…"
          @load-error="onLoadError"
        />

        <div class="gallery-grid">
          <JinAlert
            tone="warning"
            title="Try it"
            description="Expand “Flaky branch” — the first attempt fails and the row collapses with a marker. Press the retry control: the second attempt succeeds. “Always fails” demonstrates the permanent case."
          />
          <JinAlert
            v-if="failureLog.length > 0"
            tone="danger"
            title="load-error reports received"
            :description="failureLog.map((entry) => `${entry.node}: ${entry.error}`).join(' · ')"
          />
          <p class="gallery-muted">
            The application is free to ignore these events and the tree still behaves correctly — but
            it cannot miss them, because the row returns to a retryable state either way.
          </p>
        </div>
      </div>
    </DemoSection>

    <!-- ------------------------------------------------- slots and tone  -->
    <DemoSection
      id="slots"
      title="Decoration: the two routes"
      note="A generic tone prop for the common cases, and a scoped #item slot for everything else. Both are shown here; neither asks the library to understand what is being displayed."
      stacked
    >
      <div class="gallery-grid gallery-grid--two">
        <div>
          <p class="gallery-muted" style="margin-bottom: var(--jin-space-2)">Route one — the tone prop</p>
          <JinTree :nodes="toneNodes" aria-label="Tones" />
          <p class="gallery-muted" style="margin-top: var(--jin-space-2)">
            The library translates default / muted / warning / danger into colour. It never asks why.
          </p>
        </div>

        <div>
          <p class="gallery-muted" style="margin-bottom: var(--jin-space-2)">Route two — the #item slot</p>
          <JinTree :nodes="slotNodes" aria-label="Custom rows">
            <template #item="{ node, selected, loading }">
              <span
                style="
                  display: flex;
                  align-items: center;
                  gap: var(--jin-space-2);
                  flex: 1 1 auto;
                  min-width: 0;
                "
              >
                <JinIcon :name="stateIcon(nodeState(node))" />
                <span style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap">{{ node.label }}</span>
                <JinBadge :tone="stateTone(nodeState(node))" :label="nodeBadge(node)" dot />
                <JinTag v-if="selected" label="selected" tone="accent" />
                <span v-if="loading" class="gallery-muted">…</span>
              </span>
            </template>
          </JinTree>
          <p class="gallery-muted" style="margin-top: var(--jin-space-2)">
            The slot receives node, row, depth, expanded, loading, failed and selected. The application
            renders whatever its domain needs.
          </p>
        </div>
      </div>
    </DemoSection>

    <!-- ------------------------------------------------------- keyboard  -->
    <DemoSection
      id="keyboard"
      title="Keyboard navigation"
      note="Tab to the tree once, then: Up/Down move, Right expands or steps into a branch, Left collapses or moves to the parent, Home and End jump, * expands every loaded branch, and typing jumps to a matching label. Focus stays on the tree — one tab stop, not one per row."
      stacked
    >
      <div class="gallery-grid gallery-grid--two">
        <div class="gallery-grid">
          <JinTextField v-model="filter" placeholder="Filter root nodes (re-renders the tree)" clearable />
          <JinTree :nodes="filterableNodes" aria-label="Keyboard demo" @activate="onActivate" @toggle="onToggle" />
        </div>

        <div class="gallery-grid">
          <JinAlert
            tone="info"
            title="Why roving tabindex"
            description="A tree with 500 rows and a tabindex on every row would make Tab unusable. The tree owns exactly one tab stop and moves focus with the arrow keys, which is what the ARIA authoring practices require."
          />
          <JinAlert v-if="keyboardLog.length > 0" tone="neutral" title="Events" :description="keyboardLog.join(' · ')" />
          <p class="gallery-muted">
            The filter above rebuilds the node list. If the active row disappears the tree falls back to
            the first usable row instead of losing focus.
          </p>
        </div>
      </div>
    </DemoSection>

    <DemoSection
      title="The boundary, stated plainly"
      note="The library provides structure, interaction, accessibility and the state machine. Everything needing a business noun arrives through props, slots or injection."
      stacked
    >
      <div class="gallery-grid gallery-grid--two">
        <JinAlert
          tone="success"
          title="In the library"
          description="Nesting and rendering, expansion state, selection, roving-tabindex keyboard navigation, aria-level/setsize/posinset/expanded/selected, the per-row loading indicator, and the load → success | failure transitions."
        />
        <JinAlert
          tone="danger"
          title="In the application"
          description="What a node represents, where children come from, why a load failed, what a badge says, what a colour means, and every string the user reads."
        />
      </div>
      <JinButton variant="secondary" @click="() => (failureLog = [])">
        <template #icon><JinIcon name="refresh" /></template>
        Clear the error log
      </JinButton>
    </DemoSection>
  </DemoPage>
</template>
