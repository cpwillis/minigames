// Preloaded via --import so a DOM exists before React DOM is ever imported.
//
// The components are .tsx, and Node's native type stripping does not handle JSX, so the
// component layer runs through tsx (esbuild) rather than the built-in stripper. That is the
// only reason this layer has dependencies at all; every other layer still has none.
import { register } from 'node:module'
import { GlobalRegistrator } from '@happy-dom/global-registrator'

// Two games import their own stylesheet; stub .css out before anything imports them.
register('./css-hook.mjs', import.meta.url)

GlobalRegistrator.register({ url: 'http://localhost/' })

// Tells React that updates are wrapped in act(), so it stops warning and flushes effects.
globalThis.IS_REACT_ACT_ENVIRONMENT = true

// The components read and write localStorage directly; happy-dom provides it, but it has to be
// empty at the start of every file or state leaks between suites.
globalThis.localStorage?.clear()
