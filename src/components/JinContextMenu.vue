<script setup lang="ts">
/**
 * JinContextMenu — right-click (or long-press) menu anchored to the pointer.
 *
 * It reuses JinMenu for navigation; the only new part is "where did the
 * pointer land", which still goes through the shared positioning module by
 * feeding it a synthetic zero-size anchor.
 */
import { computed, nextTick, ref, watch } from 'vue'
import JinMenu from './JinMenu.vue'
import { useOverlay } from '../composables/useOverlay'
import { useDismissable } from '../composables/useDismissable'
import { createId } from '../core/id'
import type { MenuEntry } from '../core/menu'

const props = withDefaults(
  defineProps<{
    items: MenuEntry[]
    ariaLabel?: string
    disabled?: boolean
    /** Also open on long-press / context-menu key. */
    keyboardAccessible?: boolean
  }>(),
  { ariaLabel: '', disabled: false, keyboardAccessible: true },
)

const emit = defineEmits<{
  (event: 'select', entry: MenuEntry): void
  (event: 'open'): void
  (event: 'close'): void
}>()

const overlay = useOverlay()
const wrapper = ref<HTMLElement | null>(null)
const menu = ref<InstanceType<typeof JinMenu> | null>(null)
const open = ref(false)
const x = ref(0)
const y = ref(0)
const overlayId = ref<string | null>(null)
const instanceId = createId('ctx')
const menuId = `jin-context-menu-${instanceId}`

const portalTarget = computed(() => overlay.root.value)

const style = computed(() => {
  const z = overlay.entryZIndex(overlayId.value)
  const base: Record<string, string> = {
    position: 'absolute',
    left: `${x.value}px`,
    top: `${y.value}px`,
  }
  if (z !== null) base['zIndex'] = String(z)
  return base
})

// Clamp into the viewport so a menu near the edge stays fully visible.
function clampToViewport(clientX: number, clientY: number): void {
  const width = wrapper.value?.offsetWidth ?? 0
  const height = wrapper.value?.offsetHeight ?? 0
  const maxX = typeof window === 'undefined' ? clientX : window.innerWidth - width - 4
  const maxY = typeof window === 'undefined' ? clientY : window.innerHeight - height - 4
  x.value = Math.max(4, Math.min(clientX, maxX))
  y.value = Math.max(4, Math.min(clientY, maxY))
}

function showAt(clientX: number, clientY: number): void {
  if (props.disabled) return
  x.value = clientX
  y.value = clientY
  open.value = true
  emit('open')
  void nextTick(() => {
    clampToViewport(clientX, clientY)
    // Reposition again once the menu has its real size.
    void nextTick(() => clampToViewport(clientX, clientY))
  })
}

function hide(): void {
  if (!open.value) return
  open.value = false
  emit('close')
}

function onContextMenu(event: MouseEvent): void {
  if (props.disabled) return
  event.preventDefault()
  showAt(event.clientX, event.clientY)
}

function onKeydown(event: KeyboardEvent): void {
  if (!props.keyboardAccessible || props.disabled) return
  if (event.key === 'ContextMenu' || (event.shiftKey && event.key === 'F10')) {
    event.preventDefault()
    const rect = wrapper.value?.getBoundingClientRect()
    showAt(rect?.left ?? 0, rect?.bottom ?? 0)
  }
}

function onSelect(entry: MenuEntry): void {
  emit('select', entry)
  hide()
}

useDismissable({
  overlayId,
  element: wrapper,
  onDismiss: () => hide(),
})

watch(open, (isOpen, wasOpen) => {
  if (isOpen) {
    const entry = overlay.register({
      id: `jin-context-menu-${instanceId}`,
      layer: 'dropdown',
      dismissOnEsc: false,
      dismissOnOutside: false,
    })
    overlayId.value = entry.id
  } else if (wasOpen && overlayId.value) {
    overlay.unregister(overlayId.value)
    overlayId.value = null
    wrapper.value?.focus()
  }
}, { immediate: true })
</script>

<template>
  <span
    ref="wrapper"
    class="jin-context-menu"
    :tabindex="props.keyboardAccessible && !props.disabled ? 0 : undefined"
    @contextmenu="onContextMenu"
    @keydown="onKeydown"
  >
    <slot />

    <Teleport v-if="portalTarget" :to="portalTarget">
      <div v-show="open" class="jin-context-menu__layer" :style="style" @contextmenu.prevent>
        <JinMenu
          :id="menuId"
          ref="menu"
          :items="props.items"
          :aria-label="props.ariaLabel"
          @select="onSelect"
          @close="hide"
        />
      </div>
    </Teleport>
  </span>
</template>
