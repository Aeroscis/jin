<script setup lang="ts">
/**
 * The token panel.
 *
 * It lists every contract token with its current computed value AND where that
 * value came from — a theme file or a live override. That makes it both a
 * debugging tool and the visual proof that a theme file defines the full
 * contract: if a token were missing, its row would show the fallback rather
 * than a themed value.
 *
 * Overrides are temporary by design: they are written to the element's inline
 * style and never persisted.
 */
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { JinAlert, JinBadge, JinButton, JinIcon, JinSelect, JinTextField, JinTooltip } from '@aeroscis/jin'
import contract from '@aeroscis/jin/contracts/tokens.json'
import { useTheme } from '@aeroscis/jin'

interface TokenEntry {
  name: string
  group: string
  type: string
  description: string
}

const tokens = (contract as { tokens: TokenEntry[] }).tokens

const theme = useTheme()
const values = ref<Record<string, string>>({})
const overrides = ref<Record<string, string>>({})
const filter = ref('')
const groupFilter = ref<string>('all')
const showOnlyOverridden = ref(false)

const groups = computed(() => {
  const seen: string[] = []
  for (const token of tokens) if (!seen.includes(token.group)) seen.push(token.group)
  return seen
})

const groupOptions = computed(() => [
  { value: 'all', label: `All groups (${tokens.length})` },
  ...groups.value.map((group) => ({
    value: group,
    label: `${group} (${tokens.filter((token) => token.group === group).length})`,
  })),
])

function readAll(): void {
  if (typeof document === 'undefined') return
  const styles = getComputedStyle(document.documentElement)
  const next: Record<string, string> = {}
  for (const token of tokens) {
    next[token.name] = styles.getPropertyValue(token.name).trim()
  }
  values.value = next
}

const visible = computed(() => {
  const needle = filter.value.trim().toLowerCase()
  return tokens.filter((token) => {
    if (groupFilter.value !== 'all' && token.group !== groupFilter.value) return false
    if (showOnlyOverridden.value && !overrides.value[token.name]) return false
    if (!needle) return true
    return (
      token.name.toLowerCase().includes(needle) ||
      token.description.toLowerCase().includes(needle) ||
      (values.value[token.name] ?? '').toLowerCase().includes(needle)
    )
  })
})

const missing = computed(() => tokens.filter((token) => !values.value[token.name]).map((token) => token.name))
const overrideCount = computed(() => Object.keys(overrides.value).length)

function override(token: TokenEntry, value: string): void {
  const root = document.documentElement
  const trimmed = value.trim()
  if (!trimmed) {
    clearOverride(token)
    return
  }
  root.style.setProperty(token.name, trimmed)
  overrides.value[token.name] = trimmed
  readAll()
}

function clearOverride(token: TokenEntry): void {
  document.documentElement.style.removeProperty(token.name)
  const next = { ...overrides.value }
  delete next[token.name]
  overrides.value = next
  readAll()
}

function clearAll(): void {
  for (const token of tokens) document.documentElement.style.removeProperty(token.name)
  overrides.value = {}
  readAll()
}

/** A value is a colour when it renders as one; drives the swatch. */
function swatchStyle(token: TokenEntry): Record<string, string> {
  const value = values.value[token.name] ?? 'transparent'
  const isColor =
    token.type === 'color' ||
    value.startsWith('#') ||
    value.startsWith('rgb') ||
    value.startsWith('hsl') ||
    value.startsWith('oklch') ||
    value.startsWith('color(')
  if (!isColor) return { background: 'transparent', borderStyle: 'dashed' }
  return { background: value }
}

function sourceOf(token: TokenEntry): 'override' | 'theme' | 'missing' {
  if (overrides.value[token.name]) return 'override'
  return values.value[token.name] ? 'theme' : 'missing'
}

// A theme switch rewrites the custom properties; the panel has to re-read them
// once the new values are in the cascade.
function refresh(): void {
  requestAnimationFrame(readAll)
}

onMounted(() => {
  readAll()
  // Values can change without the panel knowing: theme switch, live override
  // from devtools, or a stylesheet finishing to load.
  const observer = new MutationObserver(refresh)
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-jin-style', 'data-jin-mode', 'style'],
  })
  cleanup = () => observer.disconnect()
})

let cleanup: (() => void) | null = null
onBeforeUnmount(() => cleanup?.())

defineExpose({ refresh })
</script>

<template>
  <article class="gallery-page">
    <h1 class="gallery-page__title">Design tokens</h1>
    <p class="gallery-page__lead">
      Every token in the contract, with its current computed value and where that value comes from.
      Change the style or mode above and this list re-reads itself — that is the point: a theme is
      only valid when all {{ tokens.length }} rows show a real value and none fall back.
    </p>

    <JinAlert
      v-if="missing.length > 0"
      tone="danger"
      title="The current theme is incomplete"
      :description="`${missing.length} token(s) have no value: ${missing.slice(0, 6).join(', ')}`"
    />
    <JinAlert
      v-else
      tone="success"
      title="Theme complete"
      :description="`All ${tokens.length} contract tokens resolve in style “${theme.style.value}”, mode “${theme.mode.value}”.`"
    />

    <section class="gallery-section">
      <div class="gallery-demo gallery-demo--stack">
        <div class="gallery-grid gallery-grid--two">
          <JinTextField v-model="filter" placeholder="Filter by name, description or value" clearable>
            <template #prefix><JinIcon name="search" /></template>
          </JinTextField>
          <JinSelect v-model="groupFilter" :options="groupOptions" aria-label="Token group" />
        </div>

        <div class="gallery-demo" style="justify-content: space-between">
          <span class="gallery-muted">
            Showing {{ visible.length }} of {{ tokens.length }} tokens ·
            {{ overrideCount }} live override{{ overrideCount === 1 ? '' : 's' }}
          </span>
          <span style="display: flex; gap: var(--jin-space-2); align-items: center">
            <label style="display: inline-flex; align-items: center; gap: var(--jin-space-2)">
              <input v-model="showOnlyOverridden" type="checkbox" />
              <span class="gallery-muted">Only overridden</span>
            </label>
            <JinTooltip content="Remove every live override" placement="top">
              <JinButton variant="secondary" size="sm" :disabled="overrideCount === 0" @click="clearAll">
                <template #icon><JinIcon name="refresh" /></template>
                Reset overrides
              </JinButton>
            </JinTooltip>
          </span>
        </div>
      </div>
    </section>

    <section v-for="group in groups" :key="group" class="gallery-token-group">
      <template v-if="visible.some((token) => token.group === group)">
        <h2 class="gallery-token-group__title">
          {{ group }}
          <span class="gallery-token-group__count">
            {{ visible.filter((token) => token.group === group).length }} /
            {{ tokens.filter((token) => token.group === group).length }}
          </span>
        </h2>

        <div class="gallery-tokens">
          <div v-for="token in visible.filter((entry) => entry.group === group)" :key="token.name" class="gallery-token">
            <span class="gallery-token__swatch" :style="swatchStyle(token)" aria-hidden="true" />

            <span class="gallery-token__names">
              <span class="gallery-token__name" :title="token.description">{{ token.name }}</span>
              <span class="gallery-token__value">{{ values[token.name] || '(missing — fallback in use)' }}</span>
            </span>

            <span style="display: flex; align-items: center; gap: var(--jin-space-1)">
              <JinBadge
                v-if="sourceOf(token) === 'override'"
                tone="accent"
                label="override"
                style="text-transform: none"
              />
              <JinTextField
                class="gallery-token__override"
                size="sm"
                :model-value="overrides[token.name] ?? ''"
                placeholder="override"
                :aria-label="`Override ${token.name}`"
                @update:model-value="(value: string) => override(token, value)"
              />
              <JinTooltip content="Clear this override" placement="top">
                <JinButton
                  class="gallery-token__reset"
                  variant="ghost"
                  size="sm"
                  icon
                  :disabled="!overrides[token.name]"
                  :label="`Reset ${token.name}`"
                  @click="clearOverride(token)"
                >
                  <template #icon><JinIcon name="close" /></template>
                </JinButton>
              </JinTooltip>
            </span>
          </div>
        </div>
      </template>
    </section>

    <!--
      A token list proves every token *resolves*. This section proves the
      texture, gradient and border tokens actually *render*: they feed a small
      set of opt-in utility classes, and without a demo those classes are
      invisible public API.
    -->
    <section class="gallery-section">
      <h2 class="gallery-section__title">Decoration utilities</h2>
      <p class="gallery-section__note">
        Three opt-in classes consume the tokens above. The library never applies them on its own —
        except the ground weave, which it uses for empty states, because a pattern cannot compete
        with content that is not there. Each theme decides what these render as; a theme with
        <code class="gallery-mono">--jin-surface-texture: none</code> simply gets a flat surface.
      </p>

      <div class="gallery-grid gallery-grid--three">
        <div class="jin-card jin-ground" style="padding: var(--jin-space-4)">
          <p class="gallery-mono" style="margin: 0 0 var(--jin-space-1); font-size: var(--jin-font-size-sm)">
            .jin-ground
          </p>
          <p class="gallery-muted" style="margin: 0; font-size: var(--jin-font-size-sm)">
            The woven ground, from <code class="gallery-mono">--jin-surface-texture</code>.
          </p>
        </div>

        <div class="jin-card" style="padding: var(--jin-space-4)">
          <p class="gallery-mono" style="margin: 0 0 var(--jin-space-1); font-size: var(--jin-font-size-sm)">
            surface gradient
          </p>
          <p class="gallery-muted" style="margin: 0 0 var(--jin-space-3); font-size: var(--jin-font-size-sm)">
            Every panel already carries <code class="gallery-mono">--jin-surface-gradient</code>.
          </p>
          <JinButton variant="secondary" size="sm">A raised surface</JinButton>
        </div>

        <div class="jin-card jin-sheen" style="padding: var(--jin-space-4)">
          <p class="gallery-mono" style="margin: 0 0 var(--jin-space-1); font-size: var(--jin-font-size-sm)">
            .jin-sheen
          </p>
          <p class="gallery-muted" style="margin: 0; font-size: var(--jin-font-size-sm)">
            One narrow highlight crosses on hover or focus. Nothing animates unattended.
          </p>
        </div>
      </div>

      <div class="gallery-demo gallery-demo--stack" style="margin-top: var(--jin-space-4)">
        <p class="gallery-muted" style="margin: 0">
          Border and focus hierarchy, all from three tokens:
        </p>
        <div class="gallery-grid gallery-grid--three">
          <div class="gallery-demo" style="border-color: var(--jin-border-color)">--jin-border-color</div>
          <div class="gallery-demo" style="border-color: var(--jin-border-color-strong)">--jin-border-color-strong</div>
          <div
            class="gallery-demo"
            style="
              outline: var(--jin-focus-ring-width) solid var(--jin-focus-ring-color);
              outline-offset: var(--jin-focus-ring-offset);
            "
          >
            --jin-focus-ring-color
          </div>
        </div>
        <hr class="jin-rule-thread" style="width: 100%; margin: var(--jin-space-2) 0" />
        <p class="gallery-muted" style="margin: 0; font-size: var(--jin-font-size-sm)">
          <code class="gallery-mono">.jin-rule-thread</code> — a decorative separator built from the
          border and focus tokens. The focus ring is declared separately from the accent in every
          theme, so no style can erase keyboard focus by choosing its colours badly.
        </p>
      </div>

      <JinAlert
        tone="neutral"
        title="Where the rationale lives"
        description="This page shows what the tokens are; the reasoning behind a given style belongs with the design documentation, not in the component catalogue. Each style's one-line identity is in the switcher above, and the full Jin theme specification is in docs/theming.md."
      />
    </section>

    <JinAlert
      v-if="visible.length === 0"
      tone="neutral"
      title="No tokens match the filter"
      description="Clear the filter or pick a different group."
    />
  </article>
</template>
