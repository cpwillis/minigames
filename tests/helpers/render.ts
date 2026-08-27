import { cleanup, render as tlRender } from '@testing-library/react'
import { afterEach, beforeEach } from 'node:test'
import { createElement, type ComponentType, type ReactElement } from 'react'

export * from '@testing-library/react'
export { createElement as h }

/**
 * Render a component. Tests use createElement rather than JSX so they stay plain .ts: the root
 * tsconfig must keep jsx: preserve for Next, and fighting that in a second config buys nothing
 * when `h(Component, props)` reads fine.
 */
export function mount<P extends object>(Component: ComponentType<P>, props?: P) {
  return tlRender(createElement(Component, (props ?? {}) as P))
}

export function renderEl(el: ReactElement) {
  return tlRender(el)
}

export function resetBrowserState() {
  try { localStorage.clear() } catch {}
  // The store keeps a module-level cache that outlives a render, so clearing localStorage alone
  // leaves the previous test's values in memory. This is the same event a second tab would fire.
  window.dispatchEvent(new StorageEvent('storage', { key: null }))
  document.documentElement.className = ''
}

/** Progress, the saved user and the theme all live in localStorage; without this it leaks. */
export function useCleanDom() {
  beforeEach(resetBrowserState)
  afterEach(() => { cleanup(); resetBrowserState() })
}
