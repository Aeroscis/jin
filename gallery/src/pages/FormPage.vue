<script setup lang="ts">
/**
 * Form catalogue: field, text field, search field, select, checkbox, radio,
 * switch, hotkey recorder.
 *
 * Every control demonstrates its states, including the ones that are easy to
 * forget: disabled, read-only, invalid, long text, and inside a field wrapper.
 */
import { computed, ref } from 'vue'
import {
  JinAlert,
  JinButton,
  JinCheckbox,
  JinDivider,
  JinField,
  JinHotkeyRecorder,
  JinIcon,
  JinRadioGroup,
  JinSearchField,
  JinSelect,
  JinSwitch,
  JinTag,
  JinTextField,
  serializeHotkey,
  type HotkeyBinding,
  type HotkeyParts,
} from '@aeroscis/jin'
import { DemoPage, DemoSection } from '../demo/DemoSection'

defineProps<{ section?: string | null }>()

// ------------------------------------------------------------- form model
const basicText = ref('')
const withValue = ref('Initial value')
const longValue = ref(
  'A deliberately long value that has to be truncated with an ellipsis rather than pushing the clear button out of the field',
)
const invalidText = ref('not-an-address')
const search = ref('')
const searchResult = ref('')
const selectValue = ref<string | null>('fold')
const nativeSelectValue = ref<string | null>('fold')
const richSelectValue = ref<string | null>('md')
const checked = ref(true)
const unchecked = ref(false)
const indeterminate = ref(false)
const radio = ref<string | null>('normal')
const radioEmpty = ref<string | null>(null)
const toggledOn = ref(true)
const toggledOff = ref(false)
const bio = ref('')
const counter = ref('')

const selectOptions = [
  { value: 'normal', label: 'Normal — shown as-is' },
  { value: 'fold', label: 'Folded — collapsed in the list' },
  { value: 'hide', label: 'Hidden — excluded entirely' },
  { value: 'archived', label: 'Archived — kept but de-emphasised', disabled: true },
]

const richOptions = [
  { value: 'sm', label: 'Small' },
  { value: 'md', label: 'Medium' },
  { value: 'lg', label: 'Large' },
]

const radioOptions = [
  { value: 'normal', label: 'Normal', hint: 'Index everything under this node' },
  { value: 'fold', label: 'Folded', hint: 'Keep the node, hide its contents' },
  { value: 'hide', label: 'Hidden', hint: 'Exclude the node and its children' },
  { value: 'inherit', label: 'Inherit from parent', disabled: true },
]

// ------------------------------------------------------------ hotkey demo
const recorded = ref('Ctrl+Shift+K')
const events = ref<string[]>([])
const bindings: HotkeyBinding[] = [
  { id: 'save', hotkey: { ctrl: true, alt: false, shift: false, meta: false, key: 'S' } },
  { id: 'open', hotkey: { ctrl: true, alt: false, shift: false, meta: false, key: 'O' } },
]
const recordedParts = computed<HotkeyParts | null>(() => (recorded.value ? parse(recorded.value) : null))

function parse(value: string): HotkeyParts | null {
  const tokens = value.split('+')
  const parts: HotkeyParts = { ctrl: false, alt: false, shift: false, meta: false, key: '' }
  for (const token of tokens) {
    const lower = token.toLowerCase()
    if (lower === 'ctrl' || lower === 'control') parts.ctrl = true
    else if (lower === 'alt') parts.alt = true
    else if (lower === 'shift') parts.shift = true
    else if (lower === 'meta' || lower === 'cmd') parts.meta = true
    else parts.key = token
  }
  return parts.key ? parts : null
}

function onRecord(serialized: string, parts: HotkeyParts): void {
  events.value = [`recorded ${serialized} (${spoken(parts)})`, ...events.value].slice(0, 4)
}

function onConflict(ids: string[]): void {
  events.value = [`conflict with ${ids.join(', ')}`, ...events.value].slice(0, 4)
}

function onInvalid(parts: HotkeyParts): void {
  events.value = [`rejected ${spoken(parts)} — needs a modifier`, ...events.value].slice(0, 4)
}

function spoken(parts: HotkeyParts): string {
  return serializeHotkey(parts)
}

function submitDemo(): void {
  events.value = ['form submitted', ...events.value].slice(0, 4)
}
</script>

<template>
  <DemoPage
    title="Forms"
    lead="One field container carries the label, hint, error and required wiring, so every control stays small and every form stays consistent. Validation state is aria-invalid plus visible error text — never colour alone."
  >
    <DemoSection
      title="Field"
      note="The composition container. It generates the ids, publishes them through provide/inject, and the control inside picks them up automatically."
      stacked
    >
      <div class="gallery-grid gallery-grid--two">
        <JinField label="Plain label">
          <JinTextField placeholder="No hint, no error" />
        </JinField>

        <JinField label="With a hint" hint="Hints persist; errors replace them.">
          <JinTextField placeholder="Focus me" />
        </JinField>

        <JinField label="Required" required>
          <JinTextField placeholder="The asterisk is announced, not just drawn" />
        </JinField>

        <JinField label="Optional" optional optional-label="(not required)">
          <JinTextField />
        </JinField>

        <JinField label="With an error" error="This value is already taken.">
          <JinTextField model-value="taken" />
        </JinField>

        <JinField label="Reserved message space" hint="No layout jump when an error appears" reserve-message-space>
          <JinTextField />
        </JinField>

        <JinField label="Disabled control" hint="The hint still explains the state.">
          <JinTextField disabled model-value="Read-only content" />
        </JinField>

        <JinField label="Composite control" :no-label-for="true" hint="A label without a single target control.">
          <JinSwitch label="Nested switch inside a field" />
        </JinField>
      </div>
    </DemoSection>

    <DemoSection
      title="Text field"
      note="Single line and textarea variants, sizes, affixes, a clear button and a character counter that turns into a warning when the limit is exceeded."
      stacked
    >
      <div class="gallery-grid gallery-grid--two">
        <JinField label="Empty with placeholder">
          <JinTextField v-model="basicText" placeholder="Type something" clearable />
        </JinField>

        <JinField label="With a value and clear button">
          <JinTextField v-model="withValue" clearable />
        </JinField>

        <JinField label="Long value">
          <JinTextField v-model="longValue" clearable />
        </JinField>

        <JinField label="Invalid" error="That is not a valid address.">
          <JinTextField v-model="invalidText" invalid />
        </JinField>

        <JinField label="Read-only">
          <JinTextField model-value="Set by the system" readonly />
        </JinField>

        <JinField label="Disabled">
          <JinTextField model-value="Unavailable right now" disabled />
        </JinField>

        <JinField label="Small">
          <JinTextField size="sm" placeholder="sm" />
        </JinField>

        <JinField label="Large">
          <JinTextField size="lg" placeholder="lg" />
        </JinField>

        <JinField label="With a prefix and suffix">
          <JinTextField placeholder="example.com">
            <template #prefix><span class="gallery-muted">https://</span></template>
            <template #suffix><JinIcon name="external" /></template>
          </JinTextField>
        </JinField>

        <JinField label="Password">
          <JinTextField type="password" model-value="hunter2" />
        </JinField>

        <JinField label="Character counter" hint="Counter turns to a warning past the limit.">
          <JinTextField v-model="counter" :maxlength="24" show-count />
        </JinField>

        <JinField label="Textarea">
          <JinTextField v-model="bio" multiline :rows="4" placeholder="A few paragraphs" />
        </JinField>

        <JinField label="Autosizing textarea" hint="Grows with the content up to maxRows.">
          <JinTextField multiline autosize :rows="2" :max-rows="6" placeholder="Keep typing…" />
        </JinField>
      </div>
    </DemoSection>

    <DemoSection
      title="Search field"
      note="A text field specialised for search: an icon, a clear affordance, a debounced search event, and Escape to clear."
      stacked
    >
      <div class="gallery-grid gallery-grid--two">
        <JinField label="Debounced" :hint="searchResult || 'Emits after 300 ms of no typing.'">
          <JinSearchField v-model="search" placeholder="Search…" @search="(value: string) => (searchResult = value ? `Searched for “${value}”` : 'Cleared')" />
        </JinField>

        <JinField label="Immediate (no debounce)">
          <JinSearchField :debounce="0" placeholder="Emits on Enter only" />
        </JinField>

        <JinField label="Disabled">
          <JinSearchField disabled placeholder="Unavailable" />
        </JinField>

        <JinField label="Large">
          <JinSearchField size="lg" placeholder="lg" />
        </JinField>
      </div>
    </DemoSection>

    <DemoSection
      title="Select"
      note="One API, two implementations. Native mode renders a real select for maximum platform fidelity; custom mode renders a listbox with rich rows. Switching between them does not change the call site."
      stacked
    >
      <div class="gallery-grid gallery-grid--two">
        <JinField label="Custom listbox" hint="Arrow keys, type-ahead, disabled options.">
          <JinSelect v-model="selectValue" :options="selectOptions" />
        </JinField>

        <JinField label="Native select" hint="The platform control, same props.">
          <JinSelect v-model="nativeSelectValue" :options="selectOptions" native />
        </JinField>

        <JinField label="Rich option rows" hint="The #option slot renders whatever the row needs.">
          <JinSelect v-model="richSelectValue" :options="richOptions">
            <template #option="{ option }">
              <span style="display: inline-flex; align-items: center; gap: var(--jin-space-2)">
                <JinIcon name="sparkle" :size="0.9" />
                {{ option.label }}
                <JinTag v-if="option.value === 'lg'" label="popular" />
              </span>
            </template>
          </JinSelect>
        </JinField>

        <JinField label="Placeholder (nothing selected)">
          <JinSelect :options="selectOptions" placeholder="Choose a state" />
        </JinField>

        <JinField label="Invalid" error="Pick one to continue.">
          <JinSelect :options="selectOptions" placeholder="Choose" invalid />
        </JinField>

        <JinField label="Disabled">
          <JinSelect :options="selectOptions" model-value="fold" disabled />
        </JinField>

        <JinField label="Empty option list">
          <JinSelect :options="[]" placeholder="No options available" />
        </JinField>

        <JinField label="Small and large" hint="Size travels with the control.">
          <div style="display: flex; gap: var(--jin-space-2)">
            <JinSelect v-model="selectValue" size="sm" :options="selectOptions" />
            <JinSelect v-model="selectValue" size="lg" :options="selectOptions" />
          </div>
        </JinField>
      </div>
    </DemoSection>

    <DemoSection
      title="Checkbox"
      note="Checked, unchecked, and the mixed state — which is announced as aria-checked=mixed rather than drawn as an ambiguous dash."
    >
      <div style="display: flex; flex-direction: column; gap: var(--jin-space-3)">
        <JinCheckbox v-model="checked" label="Checked" />
        <JinCheckbox v-model="unchecked" label="Unchecked" />
        <JinCheckbox :model-value="false" :indeterminate="true" label="Indeterminate (mixed)" />
        <JinCheckbox v-model="checked" label="With a hint" hint="Hints explain the consequence, not the mechanism." />
        <JinCheckbox :model-value="false" disabled label="Disabled" />
        <JinCheckbox :model-value="true" disabled label="Disabled and checked" />
        <JinCheckbox :model-value="false" invalid label="Invalid" />
        <JinCheckbox :model-value="false" label="A very long label that wraps onto a second line because it keeps going and going and going" />
      </div>
    </DemoSection>

    <DemoSection
      title="Radio group"
      note="A roving tabindex group over native radio inputs: one tab stop for the group, arrows move and select, disabled options are skipped."
    >
      <div class="gallery-grid gallery-grid--two">
        <JinRadioGroup v-model="radio" :options="radioOptions" label="Display state" required />
        <JinRadioGroup v-model="radioEmpty" :options="radioOptions" label="Nothing selected yet" hint="The first enabled option owns the tab stop." />
        <JinRadioGroup
          v-model="radio"
          :options="radioOptions.slice(0, 3)"
          label="Horizontal"
          orientation="horizontal"
        />
        <JinRadioGroup :options="radioOptions" label="Disabled group" disabled model-value="normal" />
        <JinRadioGroup :options="radioOptions" label="With an error" error="Choose one of the enabled options." model-value="normal" />
      </div>
    </DemoSection>

    <DemoSection
      title="Switch"
      note="On/off with role=switch, so assistive technology announces the state as on or off rather than true or false."
    >
      <div style="display: flex; flex-direction: column; gap: var(--jin-space-3)">
        <JinSwitch v-model="toggledOn" label="Enabled" />
        <JinSwitch v-model="toggledOff" label="Disabled state of the same control (off)" />
        <JinSwitch :model-value="true" disabled label="Disabled, on" />
        <JinSwitch :model-value="false" disabled label="Disabled, off" />
        <JinSwitch v-model="toggledOn" size="sm" label="Small" />
        <JinSwitch :model-value="false" aria-label="Named only for screen readers" />
      </div>
    </DemoSection>

    <DemoSection
      title="Hotkey recorder"
      note="Recording and conflict detection are pure functions in the kernel: normalization, whether a combination is usable at all, and whether it collides with an existing binding. Click the control, then press a combination."
      stacked
    >
      <div class="gallery-grid gallery-grid--two">
        <JinField label="Shortcut" hint="Click, then press the keys you want.">
          <JinHotkeyRecorder
            v-model="recorded"
            :bindings="bindings"
            placeholder="Click to record"
            @record="onRecord"
            @conflict="onConflict"
            @invalid="onInvalid"
          />
        </JinField>

        <JinField label="Conflicts rejected outright" hint="Ctrl+S and Ctrl+O are taken, so they are refused.">
          <JinHotkeyRecorder
            model-value=""
            :bindings="bindings"
            :reject-conflicts="true"
            placeholder="Try Ctrl+S"
            @record="onRecord"
            @conflict="onConflict"
            @invalid="onInvalid"
          />
        </JinField>

        <JinField label="Disabled">
          <JinHotkeyRecorder model-value="Ctrl+Alt+D" disabled />
        </JinField>

        <JinField label="Bare keys allowed" hint="Without this, a bare letter is refused because it would swallow typing.">
          <JinHotkeyRecorder model-value="" allow-bare-keys placeholder="Press any key" @record="onRecord" @invalid="onInvalid" />
        </JinField>
      </div>

      <JinAlert
        v-if="events.length > 0"
        tone="neutral"
        title="Recorder events"
        :description="events.join(' · ')"
      />
      <p v-if="recordedParts" class="gallery-mono">
        Current value: {{ recorded }} — key {{ recordedParts.key }},
        modifiers {{ [recordedParts.ctrl && 'Ctrl', recordedParts.alt && 'Alt', recordedParts.shift && 'Shift', recordedParts.meta && 'Meta'].filter(Boolean).join('+') || 'none' }}
      </p>
    </DemoSection>

    <DemoSection
      title="A complete form"
      note="Everything above composed: a field container per control, hints that become errors, a required marker, and a submit that reports back."
      stacked
    >
      <form style="width: min(560px, 100%); display: grid; gap: var(--jin-space-4)" @submit.prevent="submitDemo">
        <JinField label="Name" hint="The label that appears in the list." required>
          <JinTextField model-value="" placeholder="Display name" />
        </JinField>

        <JinField label="Kind">
          <JinSelect v-model="selectValue" :options="selectOptions" />
        </JinField>

        <JinField label="Notes" :optional="true">
          <JinTextField multiline autosize :rows="2" :max-rows="5" placeholder="Anything worth remembering" />
        </JinField>

        <JinRadioGroup v-model="radio" :options="radioOptions.slice(0, 3)" label="Visibility" />

        <JinDivider />

        <div style="display: flex; gap: var(--jin-space-2)">
          <JinButton type="submit" variant="primary">Save</JinButton>
          <JinButton type="reset" variant="ghost">Reset</JinButton>
        </div>
      </form>

      <JinAlert v-if="events.length > 0" tone="success" :title="events[0]" />
    </DemoSection>
  </DemoPage>
</template>
