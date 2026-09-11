/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<Record<string, unknown>, Record<string, unknown>, unknown>
  export default component
}

declare module 'jin-ui/styles'
declare module 'jin-ui/themes/*'
declare module 'jin-ui/contracts/*'
