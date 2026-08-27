'use client'
import { useSyncExternalStore } from 'react'

// Every useProgress()/useUser() call used to hold its own copy of state read from
// localStorage, so a write in one component was invisible to the others until a remount:
// finishing a game left the nav's point counter stale and re-prompted for a display name
// that had already been set. One module-level cache plus a subscription fixes all callers.

const listeners = new Set<() => void>()
const cache = new Map<string, unknown>()

function subscribe(cb: () => void) {
  listeners.add(cb)
  return () => { listeners.delete(cb) }
}

/** Current value for `key`, parsed once and cached so the reference stays stable between writes. */
export function readStored<T>(key: string, fallback: T): T {
  if (!cache.has(key)) {
    let value = fallback
    try {
      const raw = localStorage.getItem(key)
      if (raw) value = JSON.parse(raw) as T
    } catch {}
    cache.set(key, value)
  }
  return cache.get(key) as T
}

export function writeStored<T>(key: string, value: T) {
  cache.set(key, value)
  try { localStorage.setItem(key, JSON.stringify(value)) } catch {}
  listeners.forEach(l => l())
}

export function clearStored(key: string) {
  cache.delete(key)
  try { localStorage.removeItem(key) } catch {}
  listeners.forEach(l => l())
}

/** `fallback` must be a stable module-level constant: it doubles as the prerender snapshot. */
export function useStored<T>(key: string, fallback: T): T {
  return useSyncExternalStore(
    subscribe,
    () => readStored(key, fallback),
    () => fallback,
  )
}
