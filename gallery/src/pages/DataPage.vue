<script setup lang="ts">
/**
 * Data-display catalogue: badge, tag, detail list, link, icon.
 */
import { ref } from 'vue'
import {
  JinAlert,
  JinBadge,
  JinButton,
  JinCard,
  JinDetailList,
  JinDivider,
  JinIcon,
  JinLink,
  JinTag,
  ICON_PATHS,
  type DetailItem,
  type IconName,
} from 'jin-ui'
import { DemoPage, DemoSection } from '../demo/DemoSection'

defineProps<{ section?: string | null }>()

// ------------------------------------------------------------------ badge
const tags = ref(['inbox', 'flagged', 'later'])
function removeTag(index: number): void {
  tags.value = tags.value.filter((_, position) => position !== index)
}

// ------------------------------------------------------------ detail list
const fileDetails: DetailItem[] = [
  { key: 'name', label: 'Name', value: 'quarterly-report.pdf' },
  { key: 'size', label: 'Size', value: '2.4 MB' },
  { key: 'modified', label: 'Last modified', value: '11 September 2026, 14:03' },
  { key: 'owner', label: 'Owner', value: 'the operations team account' },
  { key: 'checksum', label: 'Checksum', value: 'sha256:9f2c…d41a' },
  { key: 'note', label: 'Note', value: null },
  { key: 'secret', label: 'Internal id', value: 'hidden', hidden: true },
]

// ------------------------------------------------------------------- link
const linkClicks = ref(0)

// ------------------------------------------------------------------- icon
const iconNames = Object.keys(ICON_PATHS) as IconName[]

const composedDetails: DetailItem[] = [
  { key: 'status', label: 'Status', value: 'ready' },
  { key: 'entries', label: 'Entries', value: '1,204' },
  { key: 'owner', label: 'Owner', value: null },
]
</script>

<template>
  <DemoPage
    title="Data display"
    lead="Small, composable pieces that carry a value without carrying meaning. Nothing here needs a domain concept to describe, which is exactly why they can be reused across applications."
  >
    <DemoSection
      title="Badge"
      note="A short status marker. A dot badge always takes a label, because a bare coloured circle conveys nothing to a screen reader — and very little to a colour-blind user."
    >
      <div style="display: flex; flex-direction: column; gap: var(--jin-space-4)">
        <div style="display: flex; flex-wrap: wrap; gap: var(--jin-space-2); align-items: center">
          <JinBadge tone="neutral" label="neutral" />
          <JinBadge tone="accent" label="accent" />
          <JinBadge tone="info" label="info" />
          <JinBadge tone="success" label="success" />
          <JinBadge tone="warning" label="warning" />
          <JinBadge tone="danger" label="danger" />
        </div>

        <div style="display: flex; flex-wrap: wrap; gap: var(--jin-space-4); align-items: center">
          <JinBadge variant="dot" tone="success" label="Online" />
          <JinBadge variant="dot" tone="warning" label="Degraded" />
          <JinBadge variant="dot" tone="danger" label="Offline" />
          <span class="gallery-muted">dot + label renders the dot, and announces the label</span>
        </div>

        <div style="display: flex; flex-wrap: wrap; gap: var(--jin-space-2); align-items: center">
          <JinBadge tone="neutral" label="12" />
          <JinBadge tone="danger" label="99+" />
          <JinBadge tone="info">slot content</JinBadge>
          <span class="gallery-muted">a badge is a value container, not a button</span>
        </div>
      </div>
    </DemoSection>

    <DemoSection
      title="Tag"
      note="A removable chip. The remove button joins the tab order when removable, because a keyboard user has to be able to take a tag off."
      stacked
    >
      <div class="jin-cluster">
        <JinTag v-for="(tag, index) in tags" :key="tag" :label="tag" tone="accent" removable @remove="removeTag(index)" />
        <JinButton v-if="tags.length < 5" size="sm" variant="ghost" @click="tags = [...tags, `tag ${tags.length + 1}`]">
          <template #icon><JinIcon name="plus" /></template>
          Add
        </JinButton>
        <span v-if="tags.length === 0" class="gallery-muted">All tags removed — press Add to put one back.</span>
      </div>

      <div class="jin-cluster">
        <JinTag label="neutral" tone="neutral" />
        <JinTag label="info" tone="info" />
        <JinTag label="success" tone="success" />
        <JinTag label="warning" tone="warning" />
        <JinTag label="danger" tone="danger" />
        <JinTag label="not removable" />
      </div>
    </DemoSection>

    <DemoSection
      title="Detail list"
      note="A key/value table rendered as a real description list, so the label-value relationship survives without any aria plumbing. Rows can be hidden without leaving a gap."
      stacked
    >
      <div class="gallery-grid gallery-grid--two">
        <JinDetailList :items="fileDetails" />
        <JinDetailList :items="fileDetails.slice(0, 4)" striped :bordered="false" />
        <JinDetailList :items="fileDetails.slice(0, 3)" compact empty-text="not set" />
        <JinCard title="Inside a card" description="The usual setting for a properties panel.">
          <JinDetailList :items="composedDetails" :bordered="false">
            <template #value="{ item }">
              <JinBadge v-if="item.key === 'status'" tone="success" :label="String(item.value)" />
              <span v-else-if="item.value === null" class="gallery-muted">unassigned</span>
              <span v-else>{{ item.value }}</span>
            </template>
          </JinDetailList>
        </JinCard>
      </div>

      <JinAlert
        tone="info"
        title="Why not a table?"
        description="A detail list is for reading one record, not for sorting or comparing many. A table would add semantics the content does not have."
      />
    </DemoSection>

    <DemoSection
      title="Link"
      note="An inline anchor. With the external variant and an openExternal capability, navigation is handed to the host instead of the browser — which is what a desktop shell needs."
    >
      <JinLink href="#section">A plain link</JinLink>
      <JinLink href="#section" muted>A muted link</JinLink>
      <JinLink href="https://example.com" external>A link that opens externally</JinLink>
      <JinLink href="#section" @click="linkClicks += 1">Clicked {{ linkClicks }} time{{ linkClicks === 1 ? '' : 's' }}</JinLink>
      <JinLink href="#section" disabled>A disabled link</JinLink>
      <JinLink>A link with no href at all</JinLink>
    </DemoSection>

    <DemoSection
      title="Icon"
      note="A slot-and-convention component, not an icon system. Controls accept a slot for their glyphs and fall back to this set; an application that has its own icon library passes its own component and the library never notices."
      stacked
    >
      <div
        style="
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
          gap: var(--jin-space-2);
          width: 100%;
        "
      >
        <div
          v-for="name in iconNames"
          :key="name"
          style="display: flex; align-items: center; gap: var(--jin-space-2); min-width: 0"
        >
          <JinIcon :name="name" :size="1.2" />
          <span class="gallery-mono" style="overflow: hidden; text-overflow: ellipsis">{{ name }}</span>
        </div>
      </div>

      <JinDivider />

      <div style="display: flex; align-items: center; gap: var(--jin-space-4)">
        <JinIcon name="star" :size="1" />
        <JinIcon name="star" :size="1.5" />
        <JinIcon name="star" :size="2" />
        <JinIcon name="star" :size="3" />
        <span class="gallery-muted">Sizes are in em, so an icon follows the text it sits next to.</span>
      </div>

      <div style="display: flex; align-items: center; gap: var(--jin-space-4)">
        <JinIcon name="check" label="Available" />
        <span class="gallery-muted">A labelled icon is exposed as an image with that name.</span>
        <JinIcon name="check" />
        <span class="gallery-muted">An unlabelled one is hidden from assistive technology.</span>
      </div>
    </DemoSection>

    <DemoSection
      title="Contrast and non-colour signals"
      note="Every tone in the system pairs its colour with an icon or with text. Turn the system greyscale and nothing becomes ambiguous."
      stacked
    >
      <div class="gallery-grid gallery-grid--three">
        <JinCard title="Status" description="Icon + label, never a bare colour.">
          <div class="jin-stack">
            <div style="display: flex; align-items: center; gap: var(--jin-space-2)">
              <JinIcon name="success" />
              <JinBadge tone="success" label="ready" />
            </div>
            <div style="display: flex; align-items: center; gap: var(--jin-space-2)">
              <JinIcon name="warning" />
              <JinBadge tone="warning" label="degraded" />
            </div>
            <div style="display: flex; align-items: center; gap: var(--jin-space-2)">
              <JinIcon name="danger" />
              <JinBadge tone="danger" label="blocked" />
            </div>
          </div>
        </JinCard>

        <JinCard title="Value" description="Numbers carry their own meaning.">
          <JinDetailList
            :items="[
              { key: 'a', label: 'Total', value: '1,204' },
              { key: 'b', label: 'Failed', value: '3' },
              { key: 'c', label: 'Skipped', value: '0' },
            ]"
            :bordered="false"
            compact
          />
        </JinCard>

        <JinCard title="Wording" description="The strongest signal is still the sentence.">
          <div class="jin-stack">
            <JinAlert tone="success" title="Saved" description="All changes are on disk." />
            <JinAlert tone="danger" title="Failed" description="Nothing was written." />
          </div>
        </JinCard>
      </div>
    </DemoSection>
  </DemoPage>
</template>
