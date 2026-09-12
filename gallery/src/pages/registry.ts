/**
 * The catalogue registry: which pages exist, in which order, and which
 * sections each page has. The navigation in App.vue is generated from this
 * list, so adding a page is a one-file change.
 */
import type { Component } from 'vue'
import type { IconName } from '@aeroscis/jin'

import FeedbackPage from './FeedbackPage.vue'
import OverlayPage from './OverlayPage.vue'
import FormPage from './FormPage.vue'
import NavigationPage from './NavigationPage.vue'
import DataPage from './DataPage.vue'
import TreePage from './TreePage.vue'
import SamplesPage from './SamplesPage.vue'

export interface PageChild {
  id: string
  label: string
}

export interface PageEntry {
  id: string
  label: string
  icon: IconName
  component: Component
  children?: PageChild[]
}

export const PAGES: PageEntry[] = [
  {
    id: 'feedback',
    label: 'Feedback',
    icon: 'bell',
    component: FeedbackPage,
    children: [
      { id: 'spinner', label: 'Spinner' },
      { id: 'progress', label: 'Progress' },
      { id: 'skeleton', label: 'Skeleton' },
      { id: 'alert', label: 'Alert' },
      { id: 'toast', label: 'Toast' },
      { id: 'notification', label: 'Notification' },
      { id: 'result', label: 'Result' },
    ],
  },
  {
    id: 'overlays',
    label: 'Overlays',
    icon: 'copy',
    component: OverlayPage,
    children: [
      { id: 'modal', label: 'Modal' },
      { id: 'drawer', label: 'Drawer' },
      { id: 'popover', label: 'Popover' },
      { id: 'tooltip', label: 'Tooltip' },
      { id: 'popconfirm', label: 'Popconfirm' },
    ],
  },
  {
    id: 'forms',
    label: 'Forms',
    icon: 'settings',
    component: FormPage,
    children: [
      { id: 'field', label: 'Field' },
      { id: 'text-field', label: 'Text field' },
      { id: 'search-field', label: 'Search field' },
      { id: 'select', label: 'Select' },
      { id: 'checkbox', label: 'Checkbox' },
      { id: 'radio', label: 'Radio group' },
      { id: 'switch', label: 'Switch' },
      { id: 'hotkey', label: 'Hotkey recorder' },
    ],
  },
  {
    id: 'navigation',
    label: 'Navigation & structure',
    icon: 'menu',
    component: NavigationPage,
    children: [
      { id: 'tabs', label: 'Tabs' },
      { id: 'menu', label: 'Menu' },
      { id: 'dropdown', label: 'Dropdown' },
      { id: 'context-menu', label: 'Context menu' },
      { id: 'breadcrumb', label: 'Breadcrumb' },
      { id: 'divider', label: 'Divider' },
      { id: 'card', label: 'Card' },
      { id: 'toolbar', label: 'Toolbar' },
      { id: 'nav', label: 'Nav' },
    ],
  },
  {
    id: 'tree',
    label: 'Tree',
    icon: 'database',
    component: TreePage,
    children: [
      { id: 'basic', label: 'Basics' },
      { id: 'selection', label: 'Selection' },
      { id: 'lazy', label: 'Lazy loading' },
      { id: 'failure', label: 'Failure & retry' },
      { id: 'slots', label: 'Item slot & tone' },
      { id: 'keyboard', label: 'Keyboard' },
    ],
  },
  {
    id: 'data',
    label: 'Data display',
    icon: 'file',
    component: DataPage,
    children: [
      { id: 'badge', label: 'Badge' },
      { id: 'tag', label: 'Tag' },
      { id: 'detail-list', label: 'Detail list' },
      { id: 'link', label: 'Link' },
      { id: 'icon', label: 'Icon' },
    ],
  },
  {
    id: 'samples',
    label: 'Application samples',
    icon: 'home',
    component: SamplesPage,
    children: [
      { id: 'list-detail', label: 'List & detail' },
      { id: 'form', label: 'Form page' },
      { id: 'flow', label: 'Modal + drawer flow' },
      { id: 'states', label: 'Empty & error states' },
      { id: 'rtl', label: 'RTL & long text' },
    ],
  },
]
