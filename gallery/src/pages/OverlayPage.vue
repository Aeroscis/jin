<script setup lang="ts">
/**
 * Overlay catalogue: modal, drawer, popover, tooltip, popconfirm.
 *
 * Every demo opens the real control, so the focus trap, Escape handling and
 * focus return can be verified by hand. The status line under each group
 * reports what the control just told the application.
 */
import { computed, ref } from 'vue'
import {
  JinAlert,
  JinButton,
  JinDivider,
  JinDrawer,
  JinField,
  JinIcon,
  JinModal,
  JinPopconfirm,
  JinPopover,
  JinSelect,
  JinSwitch,
  JinTextField,
  JinTooltip,
} from 'jin-ui'
import { DemoPage, DemoSection } from '../demo/DemoSection'

defineProps<{ section?: string | null }>()

const log = ref<string[]>([])
function record(message: string): void {
  log.value = [`${new Date().toLocaleTimeString()} — ${message}`, ...log.value].slice(0, 6)
}

// ------------------------------------------------------------------- modal
const modalOpen = ref(false)
const modalSize = ref<'sm' | 'md' | 'lg' | 'xl' | 'full'>('md')
const modalBusy = ref(false)
const modalNoEsc = ref(false)
const modalNoOutside = ref(false)
const modalHideClose = ref(false)

const sizeOptions = [
  { value: 'sm', label: 'sm — 380px' },
  { value: 'md', label: 'md — 520px' },
  { value: 'lg', label: 'lg — 720px' },
  { value: 'xl', label: 'xl — 960px' },
  { value: 'full', label: 'full — the whole viewport' },
]

async function simulateSave(): Promise<void> {
  modalBusy.value = true
  await new Promise((resolve) => setTimeout(resolve, 1400))
  modalBusy.value = false
  modalOpen.value = false
  record('modal: save finished, dialog closed')
}

// ------------------------------------------------------------------ drawer
const drawerOpen = ref(false)
const drawerSide = ref<'left' | 'right' | 'top' | 'bottom'>('right')
const drawerSize = ref<'sm' | 'md' | 'lg' | 'xl'>('md')

const sideOptions = [
  { value: 'left', label: 'left' },
  { value: 'right', label: 'right' },
  { value: 'top', label: 'top' },
  { value: 'bottom', label: 'bottom' },
]
const drawerSizeOptions = [
  { value: 'sm', label: 'sm — 320px' },
  { value: 'md', label: 'md — 420px' },
  { value: 'lg', label: 'lg — 560px' },
  { value: 'xl', label: 'xl — 760px' },
]

// ------------------------------------------------------------------ popover
const popoverOpen = ref(false)
const popoverPlacement = ref<'bottom-start' | 'bottom' | 'right' | 'top-end'>('bottom-start')
const popoverPlacements = [
  { value: 'bottom-start', label: 'bottom-start' },
  { value: 'bottom', label: 'bottom' },
  { value: 'right', label: 'right' },
  { value: 'top-end', label: 'top-end' },
]

// ---------------------------------------------------------------- popconfirm
const confirmDanger = ref(false)
const confirmBasic = ref(false)
const popconfirmTone = computed(() => (confirmDanger.value ? 'danger' : 'neutral'))

// ------------------------------------------------------------------- misc
const nestedModal = ref(false)
const outerModal = ref(false)
</script>

<template>
  <DemoPage
    title="Overlays"
    lead="Everything that floats above the page shares one portal container, one positioning implementation and one dismissal implementation. That is why nested overlays close in the right order and why the z-indexes never fight."
  >
    <DemoSection
      title="Modal"
      note="Centred dialog. Focus moves inside on open, Tab cycles within it, Escape closes it, and focus returns to the button that opened it. Both Escape and scrim-click can be switched off independently."
      stacked
    >
      <div style="display: flex; flex-wrap: wrap; gap: var(--jin-space-4); align-items: flex-end">
        <JinSelect v-model="modalSize" :options="sizeOptions" :block="false" aria-label="Modal size" style="min-width: 200px" />
        <label style="display: inline-flex; align-items: center; gap: var(--jin-space-2)">
          <JinSwitch v-model="modalNoEsc" size="sm" label="Escape disabled" />
        </label>
        <label style="display: inline-flex; align-items: center; gap: var(--jin-space-2)">
          <JinSwitch v-model="modalNoOutside" size="sm" label="Scrim click disabled" />
        </label>
        <label style="display: inline-flex; align-items: center; gap: var(--jin-space-2)">
          <JinSwitch v-model="modalHideClose" size="sm" label="Hide close button" />
        </label>
        <JinButton variant="primary" @click="modalOpen = true">
          <template #icon><JinIcon name="external" /></template>
          Open modal
        </JinButton>
      </div>

      <JinAlert
        v-if="log.length > 0"
        tone="neutral"
        title="What the controls reported"
        :description="log.join(' · ')"
      />
    </DemoSection>

    <JinModal
      v-model="modalOpen"
      :size="modalSize"
      title="Publish this revision?"
      description="Publishing makes the revision visible to everyone with access."
      :close-on-esc="!modalNoEsc"
      :close-on-outside="!modalNoOutside"
      :hide-close="modalHideClose"
      :busy="modalBusy"
    >
      <div class="gallery-grid">
        <JinAlert
          tone="info"
          title="Try the keyboard"
          description="Tab cycles between the controls below. Escape closes unless it is switched off. The focus ring never disappears."
        />
        <JinField label="Revision note" hint="Shown in the history panel." required>
          <template #default="{ field }">
            <JinTextField :id="field.controlId" placeholder="What changed?" />
          </template>
        </JinField>
        <JinField label="Notify watchers">
          <JinSwitch label="Send a message when it is published" />
        </JinField>
      </div>

      <template #footer>
        <JinButton variant="ghost" :disabled="modalBusy" @click="modalOpen = false">Cancel</JinButton>
        <JinButton variant="primary" :loading="modalBusy" @click="simulateSave">
          {{ modalBusy ? 'Publishing…' : 'Publish' }}
        </JinButton>
      </template>
    </JinModal>

    <DemoSection
      title="Nested overlays"
      note="A modal opened from a modal. Escape closes the topmost one first, and the shared scrim does not double-darken."
    >
      <JinButton variant="secondary" @click="outerModal = true">Open the outer modal</JinButton>
      <JinButton variant="primary" @click="nestedModal = true">Open a second modal</JinButton>
      <span class="gallery-muted">Both can be open at once.</span>
    </DemoSection>

    <JinModal v-model="outerModal" title="Outer dialog" description="This one owns the scrim.">
      <div class="gallery-grid">
        <p>Press Escape: the topmost dialog closes first, not both at once.</p>
        <JinButton variant="secondary" @click="nestedModal = true">Open another on top</JinButton>
      </div>
      <template #footer>
        <JinButton @click="outerModal = false">Close</JinButton>
      </template>
    </JinModal>

    <JinModal v-model="nestedModal" title="Second dialog" description="Stacked above the first, no extra scrim." no-scrim>
      <p>Both are registered in the same stack; this one is on top and receives Escape first.</p>
      <template #footer>
        <JinButton variant="primary" @click="nestedModal = false">Close this one</JinButton>
      </template>
    </JinModal>

    <DemoSection
      title="Drawer"
      note="Edge-anchored panel in four directions and four widths. Same dismissal and focus contract as the modal."
      stacked
    >
      <div style="display: flex; flex-wrap: wrap; gap: var(--jin-space-3); align-items: flex-end">
        <JinSelect v-model="drawerSide" :options="sideOptions" :block="false" aria-label="Drawer side" style="min-width: 140px" />
        <JinSelect v-model="drawerSize" :options="drawerSizeOptions" :block="false" aria-label="Drawer size" style="min-width: 180px" />
        <JinButton variant="primary" @click="drawerOpen = true">
          <template #icon><JinIcon name="folder" /></template>
          Open drawer
        </JinButton>
        <JinButton variant="secondary" @click="() => { drawerSide = 'bottom'; drawerOpen = true }">
          Bottom sheet
        </JinButton>
        <JinButton variant="secondary" @click="() => { drawerSide = 'top'; drawerOpen = true }">
          Top sheet
        </JinButton>
      </div>
    </DemoSection>

    <JinDrawer
      v-model="drawerOpen"
      title="Filters"
      description="Changes apply as soon as you close this panel."
      :side="drawerSide"
      :size="drawerSize"
    >
      <div class="gallery-grid">
        <JinField label="Kind">
          <JinSelect
            :options="[
              { value: 'any', label: 'Any' },
              { value: 'folded', label: 'Folded' },
              { value: 'hidden', label: 'Hidden' },
            ]"
            model-value="any"
          />
        </JinField>
        <JinField label="Name contains">
          <JinTextField placeholder="Substring" clearable />
        </JinField>
        <JinDivider />
        <JinSwitch label="Include nested items" />
        <JinSwitch label="Only changed since last run" />
      </div>
      <template #footer>
        <JinButton variant="ghost" @click="drawerOpen = false">Cancel</JinButton>
        <JinButton variant="primary" @click="drawerOpen = false">Apply</JinButton>
      </template>
    </JinDrawer>

    <DemoSection
      title="Popover"
      note="Arbitrary anchored content. The anchor is measured, the placement flips when there is no room, and the element shifts to stay inside the viewport."
      stacked
    >
      <div style="display: flex; flex-wrap: wrap; gap: var(--jin-space-3); align-items: center">
        <JinSelect
          v-model="popoverPlacement"
          :options="popoverPlacements"
          :block="false"
          aria-label="Placement"
          style="min-width: 180px"
        />
        <JinPopover
          :model-value="popoverOpen"
          :placement="popoverPlacement"
          arrow
          aria-label="Anchored panel"
          @update:model-value="(value: boolean) => (popoverOpen = value)"
        >
          <template #anchor="{ open, toggle }">
            <JinButton variant="secondary" @click="toggle()">
              <template #icon><JinIcon name="filter" /></template>
              {{ open ? 'Hide panel' : 'Show panel' }}
            </JinButton>
          </template>

          <div style="padding: var(--jin-space-4); width: 260px">
            <p style="margin: 0 0 var(--jin-space-2); font-weight: var(--jin-font-weight-medium)">
              Anchored content
            </p>
            <p class="gallery-muted" style="margin: 0 0 var(--jin-space-3)">
              Any content belongs here: a form, a list, a colour note. Escape and outside clicks close
              it, and the anchor itself is exempt so the trigger does not fight the dismissal.
            </p>
            <JinButton size="sm" variant="primary" @click="popoverOpen = false">Done</JinButton>
          </div>
        </JinPopover>

        <span class="gallery-muted">Resize the window while it is open — the panel follows.</span>
      </div>
    </DemoSection>

    <DemoSection
      title="Tooltip"
      note="Hover or focus. Deliberately non-interactive and never the only place information lives: it opens after a delay, closes promptly, and touch input reaches it through focus."
    >
      <JinTooltip content="Saved 4 minutes ago" placement="top">
        <JinButton variant="ghost" size="sm">
          <template #icon><JinIcon name="clock" /></template>
          Hover or focus me
        </JinButton>
      </JinTooltip>

      <JinTooltip content="This one opens immediately" :open-delay="0" placement="top">
        <JinButton variant="ghost" size="sm">No delay</JinButton>
      </JinTooltip>

      <JinTooltip content="Still here after a second of hovering" :close-delay="1000" placement="bottom">
        <JinButton variant="ghost" size="sm">Lingering close</JinButton>
      </JinTooltip>

      <JinTooltip content="Disabled tooltips explain why a control is unavailable" placement="right">
        <JinButton variant="ghost" size="sm" disabled>Disabled control</JinButton>
      </JinTooltip>

      <JinTooltip placement="top">
        <JinButton variant="ghost" size="sm">
          <template #icon><JinIcon name="info" /></template>
          Rich content
        </JinButton>
        <template #content>
          <span>A tooltip can hold markup, but must stay non-interactive.</span>
        </template>
      </JinTooltip>
    </DemoSection>

    <DemoSection
      title="Popconfirm"
      note="Inline confirmation for an action that is reversible but not free. Focus lands on the confirm button so a keyboard user is never stranded, and Escape cancels."
      stacked
    >
      <div style="display: flex; flex-wrap: wrap; gap: var(--jin-space-3)">
        <JinPopconfirm
          title="Remove this filter?"
          description="The filter is not saved anywhere, so this cannot be undone."
          :tone="popconfirmTone"
          placement="top"
          @confirm="record('popconfirm: confirmed')"
          @cancel="record('popconfirm: cancelled')"
        >
          <template #anchor="{ toggle }">
            <JinButton :variant="popconfirmTone === 'danger' ? 'danger' : 'secondary'" @click="toggle()">
              <template #icon><JinIcon name="trash" /></template>
              Delete filter
            </JinButton>
          </template>
        </JinPopconfirm>

        <JinPopconfirm
          v-model="confirmBasic"
          title="Overwrite the existing file?"
          confirm-label="Overwrite"
          cancel-label="Keep both"
          placement="bottom"
          @confirm="record('popconfirm: overwritten')"
        >
          <template #anchor="{ toggle }">
            <JinButton variant="secondary" @click="toggle()">Overwrite…</JinButton>
          </template>
        </JinPopconfirm>

        <JinButton variant="ghost" @click="confirmDanger = !confirmDanger">
          Toggle danger styling ({{ confirmDanger ? 'on' : 'off' }})
        </JinButton>
      </div>

      <JinAlert
        v-if="log.length > 0"
        tone="neutral"
        title="Reported events"
        :description="log.join(' · ')"
      />
    </DemoSection>

    <DemoSection
      title="What the application must not re-implement"
      note="These four behaviours exist exactly once in the library. Any overlay added later inherits them instead of re-solving them."
      stacked
    >
      <div class="gallery-grid gallery-grid--two">
        <JinAlert
          tone="success"
          title="One positioning module"
          description="Anchor measurement, flip when the preferred side overflows, shift to stay inside the viewport, and arrow placement. Pure geometry, unit tested without a browser."
        />
        <JinAlert
          tone="success"
          title="One focus module"
          description="Where focus enters, how Tab cycles, and where it returns. Never a detached node, never the body."
        />
        <JinAlert
          tone="success"
          title="One dismissal module"
          description="Escape and outside-click, with the topmost-only rule so nested overlays close one at a time."
        />
        <JinAlert
          tone="success"
          title="One portal and stack"
          description="A single container, six z-index layers from tokens. No z-index escalation in application code."
        />
      </div>
    </DemoSection>
  </DemoPage>
</template>
