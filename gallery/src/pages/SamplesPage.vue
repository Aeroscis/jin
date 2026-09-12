<script setup lang="ts">
/**
 * Application samples.
 *
 * Isolated controls prove a component works. These four screens prove the set
 * works together: a list/detail layout, a form page, a flow that crosses a
 * modal and a drawer, and the state pages. This is the only way to judge the
 * overall feel, and it is the acceptance surface for "both applications look
 * consistent".
 *
 * The domain here is deliberately generic — a file workspace — because the
 * library must never see a real one.
 */
import { computed, ref } from 'vue'
import {
  JinAlert,
  JinBadge,
  JinBreadcrumb,
  JinButton,
  JinCard,
  JinCheckbox,
  JinDetailList,
  JinDivider,
  JinDrawer,
  JinDropdown,
  JinField,
  JinIcon,
  JinModal,
  JinNav,
  JinProgress,
  JinRadioGroup,
  JinResult,
  JinSearchField,
  JinSelect,
  JinSkeleton,
  JinSwitch,
  JinTabs,
  JinTag,
  JinTextField,
  JinToolbar,
  JinTooltip,
  JinTree,
  type DetailItem,
  type MenuEntry,
  type NavItem,
  type TabItem,
  type TreeNode,
} from '@aeroscis/jin'
import { DemoPage, DemoSection } from '../demo/DemoSection'

defineProps<{ section?: string | null }>()

/* ============================================================ list & detail */

interface Entry {
  id: string
  title: string
  kind: 'document' | 'spreadsheet' | 'image' | 'archive'
  owner: string
  updated: string
  size: string
  state: 'ready' | 'processing' | 'blocked'
  tags: string[]
}

const entries = ref<Entry[]>([
  { id: 'e1', title: 'Quarterly report', kind: 'document', owner: 'Operations', updated: '2 minutes ago', size: '2.4 MB', state: 'ready', tags: ['finance', 'shared'] },
  { id: 'e2', title: 'Inventory snapshot', kind: 'spreadsheet', owner: 'Warehouse', updated: '1 hour ago', size: '880 KB', state: 'processing', tags: ['stock'] },
  { id: 'e3', title: 'Floor plan', kind: 'image', owner: 'Facilities', updated: 'Yesterday', size: '6.1 MB', state: 'ready', tags: ['layout', 'archive'] },
  { id: 'e4', title: 'Legacy export', kind: 'archive', owner: '—', updated: '3 weeks ago', size: '44 MB', state: 'blocked', tags: ['legacy'] },
  { id: 'e5', title: 'A title long enough to need truncation in the list column', kind: 'document', owner: 'Operations', updated: 'Last month', size: '12 KB', state: 'ready', tags: ['notes'] },
])

const selectedId = ref<string | null>('e1')
const query = ref('')
const listLoading = ref(false)
const detailTab = ref<string | null>('properties')

const filtered = computed(() => {
  const needle = query.value.trim().toLowerCase()
  if (!needle) return entries.value
  return entries.value.filter(
    (entry) => entry.title.toLowerCase().includes(needle) || entry.owner.toLowerCase().includes(needle),
  )
})

const selected = computed(() => entries.value.find((entry) => entry.id === selectedId.value) ?? null)

const detailItems = computed<DetailItem[]>(() => {
  const entry = selected.value
  if (!entry) return []
  return [
    { key: 'kind', label: 'Kind', value: entry.kind },
    { key: 'owner', label: 'Owner', value: entry.owner },
    { key: 'size', label: 'Size', value: entry.size },
    { key: 'updated', label: 'Last updated', value: entry.updated },
    { key: 'state', label: 'State', value: entry.state },
    { key: 'tags', label: 'Tags', value: entry.tags.join(', ') },
    { key: 'path', label: 'Path', value: `/workspace/${entry.id}/${entry.title.replace(/\s+/g, '-').toLowerCase()}` },
  ]
})

const listDetailTabs: TabItem[] = [
  { value: 'properties', label: 'Properties' },
  { value: 'activity', label: 'Activity', badge: '4' },
  { value: 'access', label: 'Access' },
]

const rowMenu: MenuEntry[] = [
  { id: 'open', label: 'Open' },
  { id: 'duplicate', label: 'Duplicate' },
  { id: 'sep', type: 'separator' },
  { id: 'remove', label: 'Remove', danger: true },
]

const listNav: NavItem[] = [
  { id: 'all', label: 'All entries', icon: 'database', badge: String(entries.value.length) },
  { id: 'ready', label: 'Ready', icon: 'check' },
  { id: 'processing', label: 'Processing', icon: 'clock', badge: '1' },
  { id: 'blocked', label: 'Blocked', icon: 'lock', badge: '1' },
  { id: 'archive', label: 'Archive', icon: 'file', disabled: true },
]
const listFilter = ref('all')

const shown = computed(() => {
  if (listFilter.value === 'all') return filtered.value
  return filtered.value.filter((entry) => entry.state === listFilter.value)
})

function simulateRefresh(): void {
  listLoading.value = true
  setTimeout(() => {
    listLoading.value = false
    entries.value = entries.value.map((entry) => ({ ...entry, updated: 'just now' }))
  }, 1200)
}

const rowMenuTarget = ref<Entry | null>(null)
const rowMenuOpen = ref(false)

function onRowMenu(entry: Entry): void {
  // Opens the row menu anchored to the pointer through the popover used by
  // dropdown; the sample only records the intent.
  rowMenuTarget.value = entry
  rowMenuOpen.value = true
}

/* ================================================================ form page */

const form = ref({
  name: 'Quarterly report',
  kind: 'document',
  owner: 'operations',
  retention: '90',
  notes: 'Imported from the finance export.',
  notify: true,
  review: false,
  visibility: 'team',
})

const formErrors = ref<Record<string, string>>({})
const formSaved = ref(false)

const kindOptions = [
  { value: 'document', label: 'Document' },
  { value: 'spreadsheet', label: 'Spreadsheet' },
  { value: 'image', label: 'Image' },
  { value: 'archive', label: 'Archive' },
]

const retentionOptions = [
  { value: '30', label: '30 days' },
  { value: '90', label: '90 days' },
  { value: '365', label: 'One year' },
  { value: '0', label: 'Keep indefinitely' },
]

const visibilityOptions = [
  { value: 'private', label: 'Only me', hint: 'Nobody else can see this entry' },
  { value: 'team', label: 'My team', hint: 'Everyone in the team can read it' },
  { value: 'org', label: 'Whole organisation', hint: 'Readable by anyone in the account' },
]

function validate(): boolean {
  const next: Record<string, string> = {}
  if (!form.value.name.trim()) next['name'] = 'A name is required.'
  else if (form.value.name.length > 60) next['name'] = 'Keep it under 60 characters.'
  if (!form.value.owner.trim()) next['owner'] = 'An owner is required.'
  formErrors.value = next
  return Object.keys(next).length === 0
}

function saveForm(): void {
  if (!validate()) {
    formSaved.value = false
    return
  }
  formSaved.value = true
}

function resetForm(): void {
  form.value = {
    name: '',
    kind: 'document',
    owner: '',
    retention: '90',
    notes: '',
    notify: false,
    review: false,
    visibility: 'team',
  }
  formErrors.value = {}
  formSaved.value = false
}

/* ============================================================= flow screen */

type Step = 'idle' | 'review' | 'options' | 'running' | 'done'
const step = ref<Step>('idle')
const reviewOpen = ref(false)
const optionsOpen = ref(false)
const progress = ref(0)
const flowOptions = ref({ verbose: true, failFast: false, notify: true })
// No log buffer: the flow visualises its own state instead.

function startFlow(): void {
  step.value = 'review'
  reviewOpen.value = true
}

function confirmReview(): void {
  reviewOpen.value = false
  step.value = 'options'
  optionsOpen.value = true
}

function confirmOptions(): void {
  optionsOpen.value = false
  step.value = 'running'
  progress.value = 0
  const timer = setInterval(() => {
    progress.value = Math.min(100, progress.value + 7)
    if (progress.value >= 100) {
      clearInterval(timer)
      step.value = 'done'
    }
  }, 120)
}

function resetFlow(): void {
  step.value = 'idle'
  progress.value = 0

}

const flowLabel = computed(() => {
  switch (step.value) {
    case 'idle':
      return 'Three steps: review, options, run. Two of them are overlays.'
    case 'review':
      return 'Step 1 of 3 — review the selection.'
    case 'options':
      return 'Step 2 of 3 — choose how it runs.'
    case 'running':
      return 'Step 3 of 3 — running.'
    case 'done':
      return 'Finished. Focus returned to the trigger each time an overlay closed.'
  }
})

/**
 * A tiny application-level stepper. A stepper is not in the library's component
 * list and does not need to be — ten lines built from tokens is exactly what the
 * contract expects a host application to do for a one-off screen element.
 */
const flowSteps = ['review', 'options', 'running', 'done'] as const
const stepIndex = computed(() => flowSteps.indexOf(step.value as (typeof flowSteps)[number]))

function flowStepStyle(index: number): Record<string, string> {
  const current = stepIndex.value
  const state = current === -1 ? 'todo' : index < current ? 'done' : index === current ? 'current' : 'todo'
  return {
    padding: 'var(--jin-space-1) var(--jin-space-3)',
    borderRadius: 'var(--jin-radius-full)',
    border: 'var(--jin-border-width) var(--jin-border-style) var(--jin-border-color)',
    background:
      state === 'current'
        ? 'color-mix(in srgb, var(--jin-accent) 16%, transparent)'
        : state === 'done'
          ? 'var(--jin-success-bg)'
          : 'transparent',
    color: state === 'current' ? 'var(--jin-accent)' : 'var(--jin-text-muted)',
    fontSize: 'var(--jin-font-size-sm)',
  }
}

/* =========================================================== state screens */

const stateNodes: TreeNode[] = [
  { id: 'empty-folder', label: 'Empty folder', children: [] },
  { id: 'broken', label: 'Branch that fails to load', hasChildren: true },
]
function stateLoad(): Promise<TreeNode[]> {
  return new Promise((_, reject) => setTimeout(() => reject(new Error('Unavailable')), 600))
}
</script>

<template>
  <DemoPage
    title="Application samples"
    lead="Four screens built only from library components. They exist to answer the question isolated controls cannot: does the set hold together as an interface?"
  >
    <!-- =================================================== list & detail -->
    <DemoSection
      id="list-detail"
      title="List and detail"
      note="A three-region workspace: navigation, a filterable list, and a properties panel. Every control is from the library — the search field, the nav, the toolbar, the tabs, the detail list, the dropdown and the messages."
      stacked
    >
      <div class="gallery-app-frame">
        <div class="gallery-app-frame__chrome">
          <JinBreadcrumb
            :items="[
              { label: 'Workspace', onClick: () => undefined },
              { label: 'Entries', current: true },
            ]"
          />
          <span style="flex: 1 1 auto" />
          <JinTooltip content="Reload the list" placement="bottom">
            <JinButton size="sm" variant="ghost" icon label="Reload" :loading="listLoading" @click="simulateRefresh">
              <template #icon><JinIcon name="refresh" /></template>
            </JinButton>
          </JinTooltip>
          <JinButton size="sm" variant="primary">
            <template #icon><JinIcon name="plus" /></template>
            New entry
          </JinButton>
        </div>

        <div class="gallery-app-frame__body">
          <div class="gallery-app-frame__col gallery-app-frame__col--alt">
            <JinNav :items="listNav" :current="listFilter" aria-label="Entry filters" @select="(item) => (listFilter = item.id)" />
            <JinDivider spaced />
            <JinCard title="Storage" elevation="flat">
              <JinProgress :value="68" label="68% of quota" size="sm" />
            </JinCard>
          </div>

          <div class="gallery-app-frame__col">
            <div class="jin-stack">
              <JinSearchField v-model="query" placeholder="Search entries…" />

              <div v-if="listLoading" class="jin-stack">
                <JinSkeleton v-for="row in 4" :key="row" variant="rect" height="52px" />
              </div>

              <div v-else-if="shown.length === 0" class="jin-stack">
                <JinResult status="empty" title="Nothing here" description="No entries match this filter.">
                  <template #actions>
                    <JinButton size="sm" variant="primary" @click="query = ''; listFilter = 'all'">Clear the filter</JinButton>
                  </template>
                </JinResult>
              </div>

              <div v-else class="jin-stack">
                <div
                  v-for="entry in shown"
                  :key="entry.id"
                  class="gallery-list-row"
                  :class="{ 'gallery-list-row--selected': entry.id === selectedId }"
                  role="button"
                  tabindex="0"
                  @click="selectedId = entry.id"
                  @keydown.enter="selectedId = entry.id"
                  @keydown.space.prevent="selectedId = entry.id"
                >
                  <JinIcon
                    :name="entry.kind === 'image' ? 'star' : entry.kind === 'archive' ? 'folder' : 'file'"
                    :size="1.2"
                  />
                  <span class="gallery-list-row__main">
                    <span class="gallery-list-row__title">{{ entry.title }}</span>
                    <span class="gallery-list-row__meta">{{ entry.owner }} · {{ entry.updated }} · {{ entry.size }}</span>
                  </span>
                  <JinBadge
                    :tone="entry.state === 'ready' ? 'success' : entry.state === 'processing' ? 'warning' : 'danger'"
                    :label="entry.state"
                  />
                  <JinDropdown :items="rowMenu" aria-label="Row actions" @select="() => onRowMenu(entry)">
                    <template #trigger>
                      <JinButton size="sm" variant="ghost" icon label="Row actions">
                        <template #icon><JinIcon name="menu" /></template>
                      </JinButton>
                    </template>
                  </JinDropdown>
                </div>
              </div>
            </div>
          </div>

          <div class="gallery-app-frame__col gallery-app-frame__col--aside">
            <template v-if="selected">
              <div class="jin-stack">
                <div>
                  <p style="margin: 0; font-size: var(--jin-font-size-lg); font-weight: var(--jin-font-weight-bold)">
                    {{ selected.title }}
                  </p>
                  <p class="gallery-muted" style="margin: var(--jin-space-1) 0 0">
                    {{ selected.kind }} · {{ selected.size }}
                  </p>
                </div>

                <div class="jin-cluster">
                  <JinTag v-for="tag in selected.tags" :key="tag" :label="tag" removable />
                </div>

                <JinDivider />

                <JinTabs v-model="detailTab" :items="listDetailTabs" aria-label="Entry details">
                  <template #properties>
                    <JinDetailList :items="detailItems" :bordered="false" compact>
                      <template #value="{ item }">
                        <JinBadge
                          v-if="item.key === 'state'"
                          :tone="String(item.value) === 'ready' ? 'success' : String(item.value) === 'processing' ? 'warning' : 'danger'"
                          :label="String(item.value)"
                        />
                        <span v-else :class="{ 'gallery-mono': item.key === 'path' }">{{ item.value }}</span>
                      </template>
                    </JinDetailList>
                  </template>
                  <template #activity>
                    <div class="jin-stack">
                      <JinAlert tone="info" title="Imported" description="From the finance export, 2 minutes ago." />
                      <JinAlert tone="neutral" title="Tags updated" description="Added “shared”." />
                    </div>
                  </template>
                  <template #access>
                    <JinAlert
                      tone="warning"
                      title="Two people have access"
                      description="The owner and the operations group."
                    />
                  </template>
                </JinTabs>
              </div>
            </template>

            <JinResult v-else status="empty" description="Select an entry to see its properties." />
          </div>
        </div>
      </div>

      <JinModal v-model="rowMenuOpen" title="Row action" :description="rowMenuTarget ? `Chosen from “${rowMenuTarget.title}”.` : ''">
        <p class="gallery-muted">
          In a real application this would be the confirmation for the chosen row action. The point is
          that the menu, the dialog and the message all come from the same library.
        </p>
        <template #footer>
          <JinButton @click="rowMenuOpen = false">Close</JinButton>
        </template>
      </JinModal>
    </DemoSection>

    <!-- ========================================================= form page -->
    <DemoSection
      id="form"
      title="Form page"
      note="A single-column form with validation that produces real errors, hints that explain consequences, and a required marker that is announced rather than merely drawn."
      stacked
    >
      <div class="gallery-app-frame">
        <div class="gallery-app-frame__chrome">
          <span style="font-weight: var(--jin-font-weight-medium)">Entry details</span>
          <span style="flex: 1 1 auto" />
          <JinBadge v-if="formSaved" tone="success" label="saved" />
        </div>

        <div class="gallery-app-frame__body gallery-app-frame__body--form">
          <JinCard class="gallery-form-card" title="Entry" description="Press Save with an empty name to see the validation path.">
            <form class="jin-stack" style="gap: var(--jin-space-4)" @submit.prevent="saveForm">
              <JinField label="Name" :error="formErrors.name" hint="Shown wherever this entry appears." required>
                <JinTextField v-model="form.name" placeholder="Entry name" clearable :maxlength="60" show-count />
              </JinField>

              <JinField label="Owner" :error="formErrors.owner" required>
                <JinTextField v-model="form.owner" placeholder="Team or person" />
              </JinField>

              <JinField label="Kind">
                <JinSelect v-model="form.kind" :options="kindOptions" />
              </JinField>

              <JinField label="Retention" hint="After this period the entry is archived automatically.">
                <JinSelect v-model="form.retention" :options="retentionOptions" />
              </JinField>

              <JinField label="Visibility" :optional="true">
                <JinRadioGroup v-model="form.visibility" :options="visibilityOptions" />
              </JinField>

              <JinField label="Notes" :optional="true">
                <JinTextField v-model="form.notes" multiline autosize :rows="3" :max-rows="6" placeholder="Anything worth remembering" />
              </JinField>

              <JinDivider />

              <div class="jin-stack" style="gap: var(--jin-space-2)">
                <JinCheckbox v-model="form.notify" label="Notify watchers" hint="Sends one message when the entry changes." />
                <JinCheckbox v-model="form.review" label="Require review before publishing" />
                <JinSwitch v-model="form.notify" label="Also notify on deletion" />
              </div>

              <div style="display: flex; gap: var(--jin-space-2)">
                <JinButton type="submit" variant="primary">Save</JinButton>
                <JinButton type="button" variant="ghost" @click="resetForm">Reset</JinButton>
              </div>
            </form>
          </JinCard>

          <JinAlert
            v-if="formSaved"
            tone="success"
            title="Saved"
            description="The form passed validation and reported success."
          />
          <JinAlert
            v-else-if="Object.keys(formErrors).length > 0"
            tone="danger"
            title="Please fix the fields above"
            :description="Object.values(formErrors).join(' ')"
          />
        </div>
      </div>
    </DemoSection>

    <!-- ====================================================== flow screen -->
    <DemoSection
      id="flow"
      title="A flow that crosses a modal and a drawer"
      note="Review in a modal, configure in a drawer, run behind a progress bar. Focus returns to the triggering button after each overlay closes, so the keyboard user never loses their place."
      stacked
    >
      <div class="gallery-app-frame">
        <div class="gallery-app-frame__chrome">
          <span style="font-weight: var(--jin-font-weight-medium)">Maintenance</span>
          <span style="flex: 1 1 auto" />
          <JinBadge
            :tone="step === 'done' ? 'success' : step === 'running' ? 'warning' : 'neutral'"
            :label="step"
          />
        </div>

        <div style="padding: var(--jin-space-6); display: grid; place-items: center; min-height: 260px">
          <div class="jin-stack" style="max-width: 560px; width: 100%; align-items: flex-start">
            <JinAlert tone="info" title="What this screen shows" :description="flowLabel" />

            <div class="gallery-flow-steps">
              <span v-for="(entry, index) in flowSteps" :key="entry" class="jin-cluster" :style="flowStepStyle(index)">
                <span aria-hidden="true">{{ stepIndex > index ? '✓' : index + 1 }}</span>
                <span>{{ entry }}</span>
              </span>
            </div>

            <div v-if="step === 'running'" style="width: 100%">
              <JinProgress :value="progress" label="Running the job" />
            </div>

            <div v-if="step === 'done'" style="width: 100%">
              <JinResult status="success" title="Maintenance finished" description="Nothing needed attention."
                :style="{ padding: 0 }">
                <template #actions>
                  <JinButton variant="primary" size="sm" @click="resetFlow">Run again</JinButton>
                </template>
              </JinResult>
            </div>

            <div v-if="step === 'idle'" style="display: flex; gap: var(--jin-space-2)">
              <JinButton variant="primary" @click="startFlow">
                <template #icon><JinIcon name="play" /></template>
                Start maintenance
              </JinButton>
              <JinButton variant="ghost" @click="resetFlow">Reset</JinButton>
            </div>
          </div>
        </div>
      </div>
    </DemoSection>

    <JinModal
      v-model="reviewOpen"
      title="Step 1 — review what will be touched"
      description="This dialog is optional to read but hard to skip: the focus trap makes sure it is seen."
      size="md"
    >
      <div class="jin-stack">
        <JinAlert
          tone="warning"
          title="4 entries will be archived"
          description="Archived entries stay readable but leave every list and search result."
        />
        <JinDetailList
          :items="[
            { key: 'scope', label: 'Scope', value: 'Entries last opened more than a year ago' },
            { key: 'count', label: 'Entries', value: '4' },
            { key: 'reversible', label: 'Reversible', value: 'Yes, for 30 days' },
          ]"
        />
      </div>

      <template #footer>
        <JinButton variant="ghost" @click="reviewOpen = false; step = 'idle'">Cancel</JinButton>
        <JinButton variant="primary" @click="confirmReview">Continue</JinButton>
      </template>
    </JinModal>

    <JinDrawer
      v-model="optionsOpen"
      title="Step 2 — how should it run?"
      description="A drawer, because these options are a side quest rather than the main decision."
      side="right"
      size="md"
    >
      <div class="jin-stack">
        <JinSwitch v-model="flowOptions.verbose" label="Detailed output" />
        <JinSwitch v-model="flowOptions.failFast" label="Stop at the first problem" />
        <JinSwitch v-model="flowOptions.notify" label="Send a notification when it finishes" />
        <JinDivider />
        <JinAlert
          tone="info"
          title="Escape or the scrim closes this drawer"
          description="Closing without confirming leaves the flow where it was, and focus goes back to the Continue button."
        />
      </div>

      <template #footer>
        <JinButton variant="ghost" @click="optionsOpen = false; step = 'review'">Back</JinButton>
        <JinButton variant="primary" @click="confirmOptions">Run maintenance</JinButton>
      </template>
    </JinDrawer>

    <!-- ==================================================== state screens -->
    <DemoSection
      id="states"
      title="Empty, error and loading"
      note="The three states every screen eventually needs. They are not afterthoughts: the empty state offers the action that fills it, the error state says what to do next, and the loading state holds the final layout."
      stacked
    >
      <div class="gallery-grid gallery-grid--two">
        <JinCard title="Empty" description="Say what would be here, and offer the way to create it.">
          <JinResult status="empty" title="No entries yet" description="Entries appear here once something is imported.">
            <template #actions>
              <JinButton variant="primary" size="sm">Import a file</JinButton>
              <JinButton variant="ghost" size="sm">Create one manually</JinButton>
            </template>
          </JinResult>
        </JinCard>

        <JinCard title="Error" description="Say what failed and what to do. Never a bare code.">
          <JinResult
            status="danger"
            title="The service is not responding"
            description="It may be starting up. Retrying usually works within a few seconds."
          >
            <template #actions>
              <JinButton variant="primary" size="sm">
                <template #icon><JinIcon name="refresh" /></template>
                Retry
              </JinButton>
              <JinButton variant="ghost" size="sm">View the log</JinButton>
            </template>
          </JinResult>
        </JinCard>

        <JinCard title="Loading" description="Hold the shape of the content that is coming.">
          <div class="jin-stack">
            <div style="display: flex; gap: var(--jin-space-3); align-items: center">
              <JinSkeleton variant="circle" width="40px" height="40px" />
              <div style="flex: 1 1 auto; display: grid; gap: var(--jin-space-2)">
                <JinSkeleton variant="text" width="40%" />
                <JinSkeleton variant="text" width="70%" />
              </div>
            </div>
            <JinSkeleton variant="rect" height="80px" />
            <div style="display: grid; gap: var(--jin-space-2)">
              <JinSkeleton variant="text" width="100%" />
              <JinSkeleton variant="text" width="85%" />
            </div>
          </div>
        </JinCard>

        <JinCard title="Partial failure" description="One region can fail while the rest of the page works.">
          <div class="jin-stack">
            <JinAlert
              tone="danger"
              title="One branch could not load"
              description="The rest of the list is usable. Retrying the failed branch is safe."
            />
            <JinTree :nodes="stateNodes" :load="stateLoad" aria-label="Partially loaded tree" />
          </div>
        </JinCard>
      </div>
    </DemoSection>

    <!-- ============================================================== RTL -->
    <DemoSection
      id="rtl"
      title="Right-to-left and long text"
      note="The same screen with direction flipped. Layout comes from logical properties where it matters, horizontal arrow keys swap meaning, and long strings truncate instead of breaking the layout."
      stacked
    >
      <div class="gallery-grid gallery-grid--two">
        <JinCard title="RTL form" description="Labels, fields and the toolbar mirror without a second stylesheet.">
          <div class="gallery-rtl">
            <div class="jin-stack">
              <JinField label="اسم الإدخال" hint="يظهر هذا الاسم في كل القوائم." required>
                <JinTextField model-value="تقرير ربع سنوي" clearable />
              </JinField>
              <JinField label="النوع">
                <JinSelect :options="kindOptions" model-value="document" />
              </JinField>
              <JinToolbar aria-label="شريط الأدوات">
                <JinButton size="sm" variant="ghost">حفظ</JinButton>
                <JinButton size="sm" variant="ghost">إلغاء</JinButton>
                <span class="jin-toolbar__spacer" />
                <JinButton size="sm" variant="primary">إرسال</JinButton>
              </JinToolbar>
              <JinAlert tone="info" title="الاتجاه معكوس" description="مفاتيح الأسهم الأفقية تتبع الاتجاه." />
            </div>
          </div>
        </JinCard>

        <JinCard title="Long content" description="Truncation, wrapping and the counter.">
          <div class="jin-stack">
            <JinField label="A label long enough to wrap onto a second line and keep going">
              <JinTextField
                model-value="A value long enough that the input has to truncate it rather than push its own clear button out of the visible field"
                clearable
              />
            </JinField>
            <JinDetailList
              :items="[
                { key: 'a', label: 'A field label that is itself rather long', value: 'and a value that is even longer, wrapping across lines instead of overflowing its column' },
                { key: 'b', label: 'Short', value: 'short' },
              ]"
            />
            <JinTag label="a tag label that will not fit in narrow columns" />
            <JinAlert
              tone="warning"
              title="A title that keeps going well past the point where a single line would have ended, to show wrapping"
              description="And a description after it."
            />
          </div>
        </JinCard>
      </div>
    </DemoSection>
  </DemoPage>
</template>
