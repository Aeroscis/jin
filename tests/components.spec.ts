// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createApp, defineComponent, h, nextTick, ref } from 'vue'
import JinButton from '../src/components/JinButton.vue'
import JinAlert from '../src/components/JinAlert.vue'
import JinTree from '../src/components/JinTree.vue'
import JinField from '../src/components/JinField.vue'
import JinTextField from '../src/components/JinTextField.vue'
import JinModal from '../src/components/JinModal.vue'
import JinProgress from '../src/components/JinProgress.vue'
import JinTabs from '../src/components/JinTabs.vue'
import JinSelect from '../src/components/JinSelect.vue'
import JinSwitch from '../src/components/JinSwitch.vue'
import JinIcon from '../src/components/JinIcon.vue'
import JinButtonIdx from '../src/components/JinButton.vue'
import JinToastRegion from '../src/components/JinToastRegion.vue'
import { JinUI } from '../src/index'
import { createOverlayController } from '../src/composables/useOverlay'
import type { TreeNode } from '../src/core/tree'

function withPlugin(component: unknown, options: Record<string, unknown> = {}) {
  return mount(component as never, {
    global: { plugins: [[JinUI, {}]] as never },
    ...options,
  })
}

describe('JinButton', () => {
  it('renders a real button with the jin- classes', () => {
    const wrapper = mount(JinButton, { slots: { default: 'Save' } })
    const button = wrapper.get('button')
    expect(button.classes()).toContain('jin-button')
    expect(button.classes()).toContain('jin-button--secondary')
    expect(button.attributes('type')).toBe('button')
    expect(button.text()).toContain('Save')
  })

  it('applies variant and size classes', () => {
    const wrapper = mount(JinButton, { props: { variant: 'primary', size: 'lg' } })
    expect(wrapper.get('button').classes()).toContain('jin-button--primary')
    expect(wrapper.get('button').classes()).toContain('jin-button--lg')
  })

  it('disables the button and blocks the click event', async () => {
    const wrapper = mount(JinButton, { props: { disabled: true } })
    await wrapper.get('button').trigger('click')
    expect(wrapper.emitted('click')).toBeUndefined()
    expect(wrapper.get('button').attributes('disabled')).toBeDefined()
  })

  it('stays focusable while loading but blocks activation and announces busy', async () => {
    const wrapper = mount(JinButton, { props: { loading: true } })
    const button = wrapper.get('button')
    expect(button.attributes('disabled')).toBeUndefined()
    expect(button.attributes('aria-busy')).toBe('true')
    await button.trigger('click')
    expect(wrapper.emitted('click')).toBeUndefined()
  })

  it('renders an anchor for href and drops it when disabled', () => {
    const wrapper = mount(JinButton, { props: { href: 'https://example.com' } })
    expect(wrapper.get('a').attributes('href')).toBe('https://example.com')

    const disabled = mount(JinButton, { props: { href: 'https://example.com', disabled: true } })
    expect(disabled.get('a').attributes('href')).toBeUndefined()
    expect(disabled.get('a').attributes('aria-disabled')).toBe('true')
  })

  it('names an icon-only button for screen readers', () => {
    const wrapper = mount(JinButtonIdx, { props: { icon: true, label: 'Close' } })
    expect(wrapper.get('button').text()).toContain('Close')
    expect(wrapper.find('.jin-visually-hidden').exists()).toBe(true)
  })

  it('still names an icon-only button when the glyph arrives through #icon', () => {
    // Regression: the accessible name used to require the absence of an
    // #icon slot, so the documented icon-only usage rendered a button with no
    // name at all — exactly the shape every application writes.
    const wrapper = mount(JinButtonIdx, {
      props: { icon: true, label: 'Settings' },
      slots: { icon: () => h(JinIcon, { name: 'settings' }) },
    })
    const button = wrapper.get('button')
    expect(button.find('svg').exists()).toBe(true)
    expect(button.text()).toContain('Settings')
    expect(wrapper.find('.jin-visually-hidden').exists()).toBe(true)
    // One naming mechanism only: the hidden text, not aria-label as well.
    expect(button.attributes('aria-label')).toBeUndefined()
  })

  it('keeps the accessible name while an icon-only button is loading', () => {
    const wrapper = mount(JinButtonIdx, { props: { icon: true, label: 'Reload', loading: true } })
    const button = wrapper.get('button')
    expect(button.attributes('aria-busy')).toBe('true')
    expect(button.text()).toContain('Reload')
  })
})

describe('JinIcon', () => {
  it('is hidden from assistive tech without a label', () => {
    const wrapper = mount(JinIcon, { props: { name: 'check' } })
    expect(wrapper.get('svg').attributes('aria-hidden')).toBe('true')
  })

  it('exposes an accessible name when labelled', () => {
    const wrapper = mount(JinIcon, { props: { name: 'check', label: 'Done' } })
    expect(wrapper.get('svg').attributes('role')).toBe('img')
    expect(wrapper.get('title').text()).toBe('Done')
  })
})

describe('JinAlert', () => {
  it('uses role=alert for danger and role=status otherwise', () => {
    expect(mount(JinAlert, { props: { tone: 'danger' } }).find('[role="alert"]').exists()).toBe(true)
    expect(mount(JinAlert, { props: { tone: 'info' } }).find('[role="status"]').exists()).toBe(true)
  })

  it('pairs the tone with an icon so colour is not the only signal', () => {
    const wrapper = mount(JinAlert, { props: { tone: 'warning', title: 'Careful' } })
    expect(wrapper.find('svg').exists()).toBe(true)
    expect(wrapper.text()).toContain('Careful')
  })

  it('emits dismiss from the close button', async () => {
    const wrapper = mount(JinAlert, { props: { dismissible: true } })
    await wrapper.get('button').trigger('click')
    expect(wrapper.emitted('dismiss')).toHaveLength(1)
  })
})

describe('JinProgress', () => {
  it('reports determinate values through aria', () => {
    const wrapper = mount(JinProgress, { props: { value: 40 } })
    const bar = wrapper.get('[role="progressbar"]')
    expect(bar.attributes('aria-valuenow')).toBe('40')
    expect(wrapper.text()).toContain('40%')
  })

  it('omits aria-valuenow when indeterminate', () => {
    const wrapper = mount(JinProgress, { props: { value: null } })
    const bar = wrapper.get('[role="progressbar"]')
    expect(bar.attributes('aria-valuenow')).toBeUndefined()
    expect(wrapper.classes()).toContain('jin-progress--indeterminate')
  })

  it('clamps out-of-range values', () => {
    const wrapper = mount(JinProgress, { props: { value: 500, max: 100 } })
    expect(wrapper.get('[role="progressbar"]').attributes('aria-valuenow')).toBe('100')
  })
})

describe('JinField + JinTextField', () => {
  it('wires label, hint and control ids together', () => {
    const wrapper = mount(JinField, {
      props: { label: 'Name', hint: 'Your full name' },
      slots: { default: () => h(JinTextField) },
      global: { plugins: [[JinUI, {}]] as never },
    })
    const label = wrapper.get('label')
    const input = wrapper.get('input')
    expect(label.attributes('for')).toBe(input.attributes('id'))
    expect(input.attributes('aria-describedby')).toContain(wrapper.get('p').attributes('id'))
  })

  it('marks the control invalid and shows the error as an alert', () => {
    const wrapper = mount(JinField, {
      props: { label: 'Name', error: 'Required' },
      slots: { default: () => h(JinTextField) },
      global: { plugins: [[JinUI, {}]] as never },
    })
    expect(wrapper.get('input').attributes('aria-invalid')).toBe('true')
    expect(wrapper.get('[role="alert"]').text()).toContain('Required')
  })

  it('flags required on the control', () => {
    const wrapper = mount(JinField, {
      props: { label: 'Name', required: true },
      slots: { default: () => h(JinTextField) },
      global: { plugins: [[JinUI, {}]] as never },
    })
    expect(wrapper.get('input').attributes('aria-required')).toBe('true')
  })

  it('emits the new value on input', async () => {
    const wrapper = mount(JinTextField, { props: { modelValue: '' } })
    await wrapper.get('input').setValue('hello')
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['hello'])
  })
})

describe('JinSwitch', () => {
  it('exposes role=switch and toggles', async () => {
    const wrapper = mount(JinSwitch, { props: { modelValue: false, label: 'Enabled' } })
    const input = wrapper.get('input')
    expect(input.attributes('role')).toBe('switch')
    await input.setValue(true)
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([true])
  })
})

describe('JinSelect', () => {
  const options = [
    { value: 'a', label: 'Alpha' },
    { value: 'b', label: 'Beta' },
  ]

  it('renders a native select in native mode', () => {
    const wrapper = mount(JinSelect, { props: { native: true, options, modelValue: 'a' } })
    const select = wrapper.get('select')
    expect(select.findAll('option')).toHaveLength(2)
  })

  it('renders a combobox with listbox semantics in custom mode', () => {
    const wrapper = mount(JinSelect, { props: { options, modelValue: 'a' } })
    const trigger = wrapper.get('[role="combobox"]')
    expect(trigger.attributes('aria-haspopup')).toBe('listbox')
    expect(trigger.attributes('aria-expanded')).toBe('false')
    expect(wrapper.text()).toContain('Alpha')
  })

  it('emits the selected value from a native change', async () => {
    const wrapper = mount(JinSelect, { props: { native: true, options, modelValue: 'a' } })
    await wrapper.get('select').setValue('b')
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['b'])
  })
})

describe('JinTabs', () => {
  const items = [
    { value: 'one', label: 'One' },
    { value: 'two', label: 'Two' },
    { value: 'three', label: 'Three', disabled: true },
  ]

  it('marks the selected tab and wires the panel', () => {
    const wrapper = mount(JinTabs, { props: { items, modelValue: 'one' } })
    const tabs = wrapper.findAll('[role="tab"]')
    expect(tabs).toHaveLength(3)
    expect(tabs[0]?.attributes('aria-selected')).toBe('true')
    const panel = wrapper.get('[role="tabpanel"]')
    expect(panel.attributes('aria-labelledby')).toBe(tabs[0]?.attributes('id'))
  })

  it('uses roving tabindex with a single tab stop', () => {
    const wrapper = mount(JinTabs, { props: { items, modelValue: 'one' } })
    const tabstops = wrapper.findAll('[role="tab"]').filter((tab) => tab.attributes('tabindex') === '0')
    expect(tabstops).toHaveLength(1)
  })

  it('skips disabled tabs when arrowing', async () => {
    const wrapper = mount(JinTabs, { props: { items, modelValue: 'one' } })
    const tabs = wrapper.findAll('[role="tab"]')
    // A horizontal tab list navigates with the left/right arrows.
    await tabs[0]?.trigger('keydown', { key: 'ArrowRight' })
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual(['two'])
    // 'three' is disabled, so the third stop wraps back to 'one'.
    await wrapper.findAll('[role="tab"]')[1]?.trigger('keydown', { key: 'ArrowRight' })
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual(['one'])
  })
})

describe('JinTree', () => {
  const nodes: TreeNode[] = [
    { id: 'a', label: 'Alpha', children: [{ id: 'a1', label: 'Alpha one' }] },
    { id: 'b', label: 'Beta', hasChildren: true },
  ]

  it('renders treeitems with the level attributes screen readers need', () => {
    const wrapper = mount(JinTree, { props: { nodes } })
    const items = wrapper.findAll('[role="treeitem"]')
    expect(items).toHaveLength(2)
    expect(items[0]?.attributes('aria-level')).toBe('1')
    expect(items[0]?.attributes('aria-expanded')).toBe('false')
    expect(items[0]?.attributes('aria-setsize')).toBe('2')
  })

  it('expands a branch and reveals its children', async () => {
    const wrapper = mount(JinTree, { props: { nodes } })
    await wrapper.findAll('[role="treeitem"]')[0]?.trigger('click')
    const twisty = wrapper.get('.jin-tree__twisty')
    await twisty.trigger('click')
    expect(wrapper.findAll('[role="treeitem"]')).toHaveLength(3)
  })

  it('lazy-loads a branch inline on first expand', async () => {
    const load = vi.fn().mockResolvedValue([{ id: 'b1', label: 'Beta one' }])
    const wrapper = mount(JinTree, { props: { nodes, load } })
    // Row 'b' is the lazy one; expand it through its own twisty.
    await wrapper.findAll('[role="treeitem"]')[1]?.get('.jin-tree__twisty').trigger('click')
    await nextTick()
    await nextTick()
    expect(load).toHaveBeenCalledTimes(1)
    expect(wrapper.emitted('load')?.[0]?.[1]).toEqual([{ id: 'b1', label: 'Beta one' }])
  })

  it('fires exactly one load per expansion even though the state watcher also observes it', async () => {
    // Regression: expanding used to start a load directly *and* through the
    // expanded-state watcher, so every expansion issued two requests.
    const load = vi.fn().mockResolvedValue([{ id: 'b1', label: 'One' }])
    const wrapper = mount(JinTree, { props: { nodes, load } })
    await wrapper.findAll('[role="treeitem"]')[1]?.get('.jin-tree__twisty').trigger('click')
    await nextTick()
    await nextTick()
    await nextTick()
    expect(load).toHaveBeenCalledTimes(1)
  })

  it('does not refetch a branch that is already loaded', async () => {
    const load = vi.fn().mockResolvedValue([{ id: 'b1', label: 'One' }])
    const wrapper = mount(JinTree, { props: { nodes, load } })
    const twisty = () => wrapper.findAll('[role="treeitem"]')[1]?.find('.jin-tree__twisty')
    await twisty()?.trigger('click')
    await nextTick()
    await nextTick()
    // Collapse and expand again: the children are cached.
    await twisty()?.trigger('click')
    await nextTick()
    await twisty()?.trigger('click')
    await nextTick()
    await nextTick()
    expect(load).toHaveBeenCalledTimes(1)
  })

  it('returns a failed row to "not loaded" and reports the error', async () => {
    const boom = new Error('nope')
    const load = vi.fn().mockRejectedValue(boom)
    const wrapper = mount(JinTree, { props: { nodes, load } })
    await wrapper.findAll('[role="treeitem"]')[1]?.get('.jin-tree__twisty').trigger('click')
    await nextTick()
    await nextTick()
    await nextTick()

    const payload = wrapper.emitted('load-error')?.[0]?.[0] as { node: TreeNode; error: unknown }
    expect(payload.node.id).toBe('b')
    expect(payload.error).toBe(boom)
    // The row is collapsed again and shows the failure marker.
    const row = wrapper.findAll('[role="treeitem"]')[1]
    expect(row?.attributes('aria-expanded')).toBe('false')
    expect(wrapper.find('.jin-tree__error').exists()).toBe(true)
  })

  it('retries after a failure', async () => {
    const load = vi.fn().mockRejectedValueOnce(new Error('nope')).mockResolvedValueOnce([{ id: 'b1', label: 'One' }])
    const wrapper = mount(JinTree, { props: { nodes, load } })
    await wrapper.findAll('[role="treeitem"]')[1]?.get('.jin-tree__twisty').trigger('click')
    await nextTick()
    await nextTick()
    await nextTick()
    await wrapper.get('.jin-tree__error button').trigger('click')
    await nextTick()
    await nextTick()
    expect(load).toHaveBeenCalledTimes(2)
    expect(wrapper.findAll('[role="treeitem"]')).toHaveLength(3)
  })

  it('applies the generic tone prop without knowing what it means', () => {
    const wrapper = mount(JinTree, { props: { nodes: [{ id: 'x', label: 'X', tone: 'warning' }] } })
    expect(wrapper.get('[role="treeitem"]').classes()).toContain('jin-tree__row--tone-warning')
  })

  it('follows node.children when the application replaces a loaded branch', async () => {
    // Regression: the internal load cache used to shadow whatever the
    // application put into `nodes` after a successful load.
    const load = vi.fn().mockResolvedValue([{ id: 'b1', label: 'Beta one' }])
    const wrapper = mount(JinTree, { props: { nodes, load } })
    await wrapper.findAll('[role="treeitem"]')[1]?.get('.jin-tree__twisty').trigger('click')
    await nextTick()
    await nextTick()
    expect(wrapper.text()).toContain('Beta one')

    await wrapper.setProps({
      nodes: [
        { id: 'a', label: 'Alpha', children: [{ id: 'a1', label: 'Alpha one' }] },
        { id: 'b', label: 'Beta', children: [{ id: 'b2', label: 'Beta two' }] },
      ],
    })
    await nextTick()
    expect(wrapper.text()).toContain('Beta two')
    expect(wrapper.text()).not.toContain('Beta one')
    // Inline children satisfy the branch, so nothing is refetched.
    expect(load).toHaveBeenCalledTimes(1)
  })

  it('keeps a tab stop when the application mutates the nodes array in place', async () => {
    // Regression: the active row is the only row with tabindex="0". It was
    // initialised from a `nodes` identity watcher, so an in-place mutation
    // left every row at tabindex="-1" and the tree unreachable by Tab.
    const current = ref<TreeNode[]>([])
    const Host = defineComponent({ setup: () => () => h(JinTree, { nodes: current.value }) })
    const wrapper = mount(Host)
    current.value.push(...nodes)
    await nextTick()

    const stops = wrapper
      .findAll('[role="treeitem"]')
      .filter((row) => row.attributes('tabindex') === '0')
    expect(stops).toHaveLength(1)
    expect(stops[0]?.attributes('data-jin-node-id')).toBe('a')
  })

  it('expands the first branch with ArrowRight after keyboard focus', async () => {
    const wrapper = mount(JinTree, { props: { nodes } })
    await wrapper.findAll('[role="treeitem"]')[0]?.trigger('focus')
    await wrapper.get('[role="tree"]').trigger('keydown', { key: 'ArrowRight' })
    await nextTick()
    expect(wrapper.findAll('[role="treeitem"]')).toHaveLength(3)
  })
})

describe('JinModal', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
    document.querySelectorAll('.jin-portal').forEach((node) => node.remove())
  })

  it('renders nothing while closed', () => {
    const wrapper = withPlugin(JinModal, { props: { modelValue: false } })
    expect(wrapper.find('.jin-modal').exists()).toBe(false)
  })

  it('teleports an open dialog into the shared portal with dialog semantics', async () => {
    withPlugin(JinModal, { props: { modelValue: true, title: 'Confirm' }, attachTo: document.body })
    await nextTick()
    const portal = document.querySelector('.jin-portal')
    expect(portal).not.toBeNull()
    const dialog = portal?.querySelector('.jin-modal__panel')
    expect(dialog).not.toBeNull()
    expect(dialog?.getAttribute('role')).toBe('dialog')
    expect(dialog?.getAttribute('aria-modal')).toBe('true')
    expect(portal?.querySelector('.jin-scrim')?.getAttribute('data-jin-visible')).not.toBeNull()
  })

  it('moves focus into the panel and traps Tab inside it', async () => {
    withPlugin(JinModal, {
      props: { modelValue: true, title: 'Confirm' },
      slots: { default: () => h('button', { id: 'inner' }, 'Inner') },
      attachTo: document.body,
    })
    await nextTick()
    await nextTick()
    expect(document.activeElement?.classList.contains('jin-modal__panel')).toBe(true)
  })

  it('emits update:modelValue on Escape', async () => {
    const wrapper = withPlugin(JinModal, { props: { modelValue: true }, attachTo: document.body })
    await nextTick()
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
    await nextTick()
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([false])
  })

  it('ignores Escape while busy', async () => {
    const wrapper = withPlugin(JinModal, { props: { modelValue: true, busy: true }, attachTo: document.body })
    await nextTick()
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
    await nextTick()
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    expect(document.querySelector('.jin-modal__panel')?.getAttribute('role')).toBe('alertdialog')
  })
})

describe('plugin installation', () => {
  it('creates the shared portal lazily, on the first overlay registration', async () => {
    document.querySelectorAll('.jin-portal').forEach((node) => node.remove())
    const host = document.createElement('div')
    document.body.appendChild(host)
    const app = createApp({ render: () => h(JinModal, { modelValue: false }) })
    // A private controller stands in for "no plugin installed".
    app.use(JinUI, { overlay: createOverlayController() })
    app.mount(host)
    await nextTick()
    // Nothing is open yet, so no portal was created.
    expect(document.querySelector('.jin-portal')).toBeNull()
    app.unmount()
    host.remove()
  })

  it('creates the portal at install time so a toast can render before any overlay opens', async () => {
    // Regression: the portal used to be created only when an overlay
    // registered, so an application that only ever pushed a toast had nowhere
    // to teleport into and the message silently never appeared.
    document.querySelectorAll('.jin-portal').forEach((node) => node.remove())
    const host = document.createElement('div')
    document.body.appendChild(host)
    const app = createApp({ render: () => h(JinToastRegion) })
    app.use(JinUI, {})
    app.mount(host)
    await nextTick()
    expect(document.querySelector('.jin-portal')).not.toBeNull()

    // Push into the very store the region reads from, i.e. the app-provided one.
    const { toastsKey } = await import('../src/composables/useFeedback')
    const store = app._context.provides[toastsKey as unknown as string] as {
      push: (input: Record<string, unknown>) => string
      clear: () => void
    }
    store.push({ tone: 'success', title: 'Saved', duration: 0 })
    await nextTick()
    await nextTick()
    expect(document.querySelector('.jin-toast__title')?.textContent).toBe('Saved')
    store.clear()

    app.unmount()
    host.remove()
  })
})
