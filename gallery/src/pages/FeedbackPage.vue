<script setup lang="ts">
/**
 * Feedback catalogue: spinner, progress, skeleton, alert, toast, notification,
 * result. Each section shows the full state range the control supports.
 */
import { computed, ref } from 'vue'
import {
  JinAlert,
  JinButton,
  JinDivider,
  JinIcon,
  JinProgress,
  JinResult,
  JinSkeleton,
  JinSpinner,
  JinSwitch,
  useNotifications,
  useToasts,
} from '@aeroscis/jin'
import { DemoPage, DemoSection, StateGrid } from '../demo/DemoSection'

defineProps<{ section?: string | null }>()

const toasts = useToasts()
const notifications = useNotifications()

const determinate = ref(35)
const longText = 'A very long label that has to be truncated or wrapped without breaking the layout of its container'

function bump(value: number): void {
  determinate.value = Math.min(100, Math.max(0, value))
}

function spawnToast(tone: 'neutral' | 'info' | 'success' | 'warning' | 'danger'): void {
  toasts.push({
    tone,
    title: `${tone[0]?.toUpperCase()}${tone.slice(1)} toast`,
    description: 'Disappears on its own — non-blocking by definition.',
    duration: tone === 'danger' ? 8000 : 4000,
  })
}

function spawnStickyToast(): void {
  toasts.push({
    tone: 'neutral',
    title: 'Sticky toast',
    description: 'duration: 0 keeps it until it is dismissed.',
    duration: 0,
  })
}

function spawnActionToast(): void {
  toasts.push({
    tone: 'info',
    title: 'Item archived',
    description: 'The action stays available while the message lives.',
    duration: 6000,
    actions: [
      {
        label: 'Undo',
        primary: true,
        handler: () => toasts.push({ tone: 'success', title: 'Restored', duration: 2500 }),
      },
    ],
  })
}

function spawnNotification(kind: 'plain' | 'actions' | 'danger'): void {
  if (kind === 'plain') {
    notifications.push({
      tone: 'info',
      title: 'Sync finished',
      description: 'A notification stays until the user deals with it. Nothing disappears on its own.',
    })
    return
  }
  if (kind === 'actions') {
    notifications.push({
      tone: 'accent',
      title: 'Update available',
      description: 'Version 0.2.0 is ready to install. This is information the user must act on, so it does not time out.',
      actions: [
        { label: 'Later', handler: () => undefined, keepOpen: false },
        { label: 'Install now', primary: true, handler: () => undefined, keepOpen: false },
      ],
    })
    return
  }
  notifications.push({
    tone: 'danger',
    title: 'Could not reach the service',
    description: 'Retry when the connection is back. This message will wait.',
    actions: [{ label: 'Retry', primary: true, handler: () => undefined, keepOpen: true }],
  })
}

const positions = [
  'top-start',
  'top',
  'top-end',
  'bottom-start',
  'bottom',
  'bottom-end',
] as const

function toastAt(position: (typeof positions)[number]): void {
  toasts.push({ tone: 'info', title: `Position: ${position}`, duration: 2500, position })
}

const progressLabel = computed(() => `Uploading — ${determinate.value}%`)
</script>

<template>
  <DemoPage
    title="Feedback"
    lead="Controls that report what the system is doing. The distinction that matters most here is toast versus notification: one interrupts briefly and leaves, the other waits for a decision."
  >
    <!-- ------------------------------------------------------------ spinner -->
    <DemoSection
      title="Spinner"
      note="Indeterminate activity in three sizes. Pass a label to make it announce itself; without one it is decorative."
    >
      <JinSpinner size="sm" />
      <JinSpinner size="md" />
      <JinSpinner size="lg" />
      <JinDivider orientation="vertical" />
      <JinSpinner size="md" label="Loading repositories" />
      <span class="gallery-muted">labelled spinner is a live region</span>
    </DemoSection>

    <!-- ----------------------------------------------------------- progress -->
    <DemoSection
      title="Progress — linear"
      note="Determinate mode always prints the percentage, so the state is never colour-only. Omit the value for indeterminate."
    >
      <div style="display: flex; flex-direction: column; gap: var(--jin-space-4); width: 100%">
        <JinProgress :value="determinate" :label="progressLabel" />
        <JinProgress :value="10" label="Small" size="sm" />
        <JinProgress :value="60" label="Large" size="lg" />
        <JinProgress :value="null" label="Indeterminate — no measurable progress" />
        <div style="display: flex; gap: var(--jin-space-2)">
          <JinButton size="sm" @click="bump(determinate - 10)">−10</JinButton>
          <JinButton size="sm" @click="bump(determinate + 10)">+10</JinButton>
          <JinButton size="sm" variant="ghost" @click="bump(0)">Reset</JinButton>
        </div>
      </div>
    </DemoSection>

    <DemoSection
      title="Progress — circular"
      note="Ring form for tight spaces. The diameter is the only sizing knob."
    >
      <JinProgress variant="circular" :value="25" :diameter="40" />
      <JinProgress variant="circular" :value="70" :diameter="56" />
      <JinProgress variant="circular" :value="100" :diameter="72" />
      <JinProgress variant="circular" :value="null" :diameter="56" label="Working" :show-value="false" />
    </DemoSection>

    <!-- ----------------------------------------------------------- skeleton -->
    <DemoSection
      title="Skeleton"
      note="Placeholders that hold the shape of the content while it loads. The sweep respects prefers-reduced-motion."
      stacked
    >
      <div style="display: grid; gap: var(--jin-space-5); grid-template-columns: repeat(auto-fit, minmax(240px, 1fr))">
        <div class="gallery-grid">
          <JinSkeleton variant="text" width="70%" />
          <JinSkeleton variant="text" width="100%" />
          <JinSkeleton variant="text" width="45%" />
          <JinSkeleton variant="rect" height="72px" />
        </div>
        <div style="display: flex; gap: var(--jin-space-3); align-items: center">
          <JinSkeleton variant="circle" width="48px" height="48px" />
          <div style="flex: 1 1 auto; display: grid; gap: var(--jin-space-2)">
            <JinSkeleton variant="text" width="60%" />
            <JinSkeleton variant="text" width="90%" />
          </div>
        </div>
        <div class="gallery-grid">
          <JinSkeleton variant="text" :animated="false" width="100%" />
          <JinSkeleton variant="rect" :animated="false" height="72px" />
          <span class="gallery-muted">static (no sweep)</span>
        </div>
      </div>
    </DemoSection>

    <!-- -------------------------------------------------------------- alert -->
    <DemoSection
      title="Alert"
      note="Inline, persistent feedback that belongs to the page. Warning and danger use role=alert; the others role=status. Every tone pairs its colour with an icon."
      stacked
    >
      <div class="gallery-grid">
        <JinAlert tone="info" title="Info" description="Background work continues while you keep editing." />
        <JinAlert tone="success" title="Saved" description="All changes are on disk." />
        <JinAlert tone="warning" title="Unsaved changes" description="Closing now discards them." />
        <JinAlert
          tone="danger"
          title="Upload rejected"
          description="The file exceeds the 25 MB limit."
          dismissible
          @dismiss="toasts.push({ tone: 'neutral', title: 'Alert dismissed', duration: 2000 })"
        />
        <JinAlert tone="neutral" title="No description on this one" />
        <JinAlert tone="info" title="With actions">
          <template #actions>
            <JinButton size="sm" variant="primary">Retry</JinButton>
            <JinButton size="sm" variant="ghost">Dismiss</JinButton>
          </template>
        </JinAlert>
        <JinAlert tone="warning" :title="longText" description="Long title wrapping behaviour" />
      </div>
    </DemoSection>

    <!-- -------------------------------------------------------------- toast -->
    <DemoSection
      title="Toast"
      note="Auto-dismissing and non-blocking. Hovering or focusing a region pauses its countdown, so a message never vanishes while it is being read. A toast must never carry information the user cannot get back somewhere else."
      stacked
    >
      <div style="display: flex; flex-wrap: wrap; gap: var(--jin-space-2)">
        <JinButton size="sm" @click="spawnToast('neutral')">Neutral</JinButton>
        <JinButton size="sm" @click="spawnToast('info')">Info</JinButton>
        <JinButton size="sm" @click="spawnToast('success')">Success</JinButton>
        <JinButton size="sm" @click="spawnToast('warning')">Warning</JinButton>
        <JinButton size="sm" @click="spawnToast('danger')">Danger (8s)</JinButton>
        <JinButton size="sm" variant="secondary" @click="spawnStickyToast">Sticky (duration 0)</JinButton>
        <JinButton size="sm" variant="secondary" @click="spawnActionToast">With an action</JinButton>
      </div>

      <p class="gallery-section__note" style="margin: var(--jin-space-4) 0 0">Six positions, chosen per message:</p>
      <div style="display: flex; flex-wrap: wrap; gap: var(--jin-space-2)">
        <JinButton v-for="position in positions" :key="position" size="sm" variant="ghost" @click="toastAt(position)">
          {{ position }}
        </JinButton>
      </div>
    </DemoSection>

    <!-- ------------------------------------------------------- notification -->
    <DemoSection
      title="Notification"
      note="Permanent until the user deals with it. Same queue and stacking machinery as the toast — the difference is purely the lifetime, which is why both live in one implementation."
      stacked
    >
      <div style="display: flex; flex-wrap: wrap; gap: var(--jin-space-2)">
        <JinButton size="sm" @click="spawnNotification('plain')">Plain notification</JinButton>
        <JinButton size="sm" @click="spawnNotification('actions')">With actions</JinButton>
        <JinButton size="sm" variant="danger" @click="spawnNotification('danger')">Danger, keeps open</JinButton>
        <JinButton size="sm" variant="ghost" @click="notifications.clear()">Clear all</JinButton>
      </div>
      <JinAlert
        tone="info"
        title="Toast vs notification"
        description="A toast auto-dismisses and must not interrupt; a notification persists until acted on and is the right place for a decision. Both cap how many are visible at once and evict the oldest toast first, so a notification is never dropped to make room for a toast."
      />
    </DemoSection>

    <!-- ------------------------------------------------------------- result -->
    <DemoSection
      title="Result"
      note="Full-region status pages: icon, title, description, actions. The variants cover the states a page-level outcome needs, including empty and permission cases."
      stacked
    >
      <StateGrid :columns="2">
        <div class="gallery-demo gallery-demo--stack gallery-demo--plain">
          <JinResult status="success" title="Import complete" description="1,204 rows were added.">
            <template #actions>
              <JinButton variant="primary" size="sm">View results</JinButton>
              <JinButton size="sm" variant="ghost">Import another</JinButton>
            </template>
          </JinResult>
        </div>
        <div class="gallery-demo gallery-demo--stack gallery-demo--plain">
          <JinResult status="danger" title="Import failed" description="Row 88 has an unexpected column count.">
            <template #actions><JinButton variant="primary" size="sm">Download the error report</JinButton></template>
          </JinResult>
        </div>
        <div class="gallery-demo gallery-demo--stack gallery-demo--plain">
          <JinResult status="empty" description="Nothing has been imported yet.">
            <template #actions><JinButton variant="primary" size="sm">Choose a file</JinButton></template>
          </JinResult>
        </div>
        <div class="gallery-demo gallery-demo--stack gallery-demo--plain">
          <JinResult
            status="forbidden"
            title="You do not have access"
            description="Ask an administrator for the reader role."
          />
        </div>
        <div class="gallery-demo gallery-demo--stack gallery-demo--plain">
          <JinResult status="notFound" title="Page not found" description="The link may be out of date." />
        </div>
        <div class="gallery-demo gallery-demo--stack gallery-demo--plain">
          <JinResult status="offline" title="Connection lost" description="Retrying automatically." />
        </div>
      </StateGrid>
    </DemoSection>

    <DemoSection title="A note on loading states" note="These compose; they are not alternatives." stacked>
      <div class="gallery-grid gallery-grid--two">
        <div class="gallery-demo gallery-demo--stack">
          <div style="display: flex; align-items: center; gap: var(--jin-space-2)">
            <JinSpinner size="sm" />
            <span>Inline: an action is in flight</span>
          </div>
          <JinDivider />
          <div style="display: flex; align-items: center; gap: var(--jin-space-2)">
            <JinIcon name="clock" />
            <span class="gallery-muted">Region: skeleton, when the shape is known</span>
          </div>
          <JinDivider />
          <div style="display: flex; align-items: center; gap: var(--jin-space-2)">
            <JinSwitch :model-value="true" disabled size="sm" label="Determinate: a bar, when progress is measurable" />
          </div>
        </div>
        <div class="gallery-demo gallery-demo--stack">
          <p class="gallery-muted">
            The rule the library follows: a spinner for anything under a second; a skeleton when the
            final layout is predictable; a progress bar only when a real fraction is available.
          </p>
          <JinAlert
            tone="warning"
            title="Never fake progress"
            description="An animated bar that is not tied to real work teaches users to distrust every bar you show."
          />
        </div>
      </div>
    </DemoSection>
  </DemoPage>
</template>
