// The rules CONTRIBUTING sets out for adding a game, actually enforced. Adding a game means
// touching a component, shared/game-ids.ts, registry.ts and public/sitemap.xml, and forgetting
// one of them is the obvious mistake.
//
// The metas are read as text rather than imported: they live in .tsx files, and Node's type
// stripping does not handle JSX.
import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { GAME_IDS } from '../shared/game-ids.ts'

const DIR = 'src/features/games/components'
const POINTS_FOR = { easy: 500, medium: 750, hard: 1000 }

function parseMeta(file) {
  const src = readFileSync(join(DIR, file), 'utf8')
  const block = src.match(/export const meta = \{([\s\S]*?)\n\}/)
  if (!block) return null
  const body = block[1]
  const str = key => body.match(new RegExp(`${key}:\\s*'([^']*)'`))?.[1]
  const num = key => {
    const m = body.match(new RegExp(`${key}:\\s*(\\d+)`))
    return m ? Number(m[1]) : undefined
  }
  return {
    file,
    id: str('id'),
    title: str('title'),
    description: str('description'),
    icon: body.match(/icon:\s*'([^']*)'/)?.[1],
    difficulty: str('difficulty'),
    maxPoints: num('maxPoints'),
    order: num('order'),
  }
}

const metas = readdirSync(DIR).filter(f => f.endsWith('.tsx')).map(parseMeta).filter(Boolean)
const registry = readFileSync('src/features/games/registry.ts', 'utf8')
const sitemap = readFileSync('public/sitemap.xml', 'utf8')

describe('game registry', () => {
  test('every component exposes a parseable meta', () => {
    const components = readdirSync(DIR).filter(f => f.endsWith('.tsx'))
    assert.equal(metas.length, components.length,
      `parsed ${metas.length} metas from ${components.length} components`)
  })

  test('there is exactly one game per registered id', () => {
    assert.equal(metas.length, GAME_IDS.length)
  })

  test('every meta id is in shared/game-ids.ts', () => {
    for (const m of metas) {
      assert.ok(GAME_IDS.includes(m.id), `${m.file}: id "${m.id}" is not in shared/game-ids.ts`)
    }
  })

  test('every registered id has a game behind it', () => {
    const ids = new Set(metas.map(m => m.id))
    for (const id of GAME_IDS) assert.ok(ids.has(id), `no component provides "${id}"`)
  })

  test('ids are unique', () => {
    const ids = metas.map(m => m.id)
    assert.equal(new Set(ids).size, ids.length, `duplicate id in ${ids.join(', ')}`)
  })

  test('every game is wired into the registry', () => {
    for (const m of metas) {
      const component = m.file.replace('.tsx', '')
      assert.ok(registry.includes(`./components/${component}`), `${component} is missing from registry.ts`)
    }
  })

  test('maxPoints matches the difficulty tier', () => {
    for (const m of metas) {
      assert.ok(m.difficulty in POINTS_FOR, `${m.file}: unknown difficulty "${m.difficulty}"`)
      assert.equal(m.maxPoints, POINTS_FOR[m.difficulty],
        `${m.file}: ${m.difficulty} should be ${POINTS_FOR[m.difficulty]} points, not ${m.maxPoints}`)
    }
  })

  test('order values are unique, so the grid is deterministic', () => {
    const orders = metas.map(m => m.order)
    assert.ok(orders.every(o => Number.isInteger(o)), 'every game needs an order')
    assert.equal(new Set(orders).size, orders.length, `duplicate order in ${orders.join(', ')}`)
  })

  test('titles, descriptions and icons are present', () => {
    for (const m of metas) {
      assert.ok(m.title?.length, `${m.file}: missing title`)
      assert.ok(m.description?.length, `${m.file}: missing description`)
      assert.ok(m.icon?.length, `${m.file}: missing icon`)
    }
  })

  // Games embed code snippets as puzzle content, so a naive scan trips over the fetch( inside
  // Bug Finder's own questions. Strip string literals before looking for real calls.
  const codeOf = file =>
    readFileSync(join(DIR, file), 'utf8')
      .replace(/'(?:[^'\\]|\\.)*'/g, "''")
      .replace(/"(?:[^"\\]|\\.)*"/g, '""')
      .replace(/`(?:[^`\\]|\\.)*`/g, '``')

  test('games call onComplete', () => {
    for (const m of metas) {
      const src = readFileSync(join(DIR, m.file), 'utf8')
      assert.ok(src.includes('onComplete'), `${m.file} never calls onComplete, so it can never be won`)
    }
  })

  test('no game talks to the network itself', () => {
    for (const m of metas) {
      const code = codeOf(m.file)
      assert.ok(!/\bfetch\(|XMLHttpRequest|navigator\.sendBeacon/.test(code),
        `${m.file} makes network calls; game data must stay client-side`)
      assert.ok(!/from ['"]@\/lib\/api/.test(readFileSync(join(DIR, m.file), 'utf8')),
        `${m.file} imports the API client; games must not submit their own scores`)
    }
  })

  test('games use the semantic colour tokens, not raw palette colours', () => {
    for (const m of metas) {
      const src = readFileSync(join(DIR, m.file), 'utf8')
      assert.ok(!/\bdark:/.test(src), `${m.file} uses dark: variants; the tokens already swap per theme`)
      assert.ok(!/\b(?:bg|text|border)-gray-\d/.test(src), `${m.file} uses raw gray palette colours`)
    }
  })

  test('no game manages its own timer', () => {
    for (const m of metas) {
      const code = codeOf(m.file)
      assert.ok(!/useTimer|performance\.now\(/.test(code),
        `${m.file} runs its own clock; the route wrapper owns timing and scoring`)
    }
  })
})

// A privacy claim and the CSP are edited in different files, months apart, and nothing connects
// them. This is the guard: if the site loads an analytics beacon, it may not also tell visitors
// it does not. Adding analytics without correcting the copy fails here.
describe('privacy claims match what the site actually loads', () => {
  const headers = readFileSync('public/_headers', 'utf8')
  const ANALYTICS_HOSTS = ['cloudflareinsights.com', 'google-analytics.com', 'googletagmanager.com', 'plausible.io', 'umami']
  const loadsAnalytics = ANALYTICS_HOSTS.some(h => headers.includes(h))

  const COPY = ['src/app/page.tsx', 'src/app/layout.tsx', 'src/app/settings/page.tsx', 'README.md']
  const DENIALS = [/no analytics/i, /nothing tracked/i, /no tracking/i, /no third-party scripts/i]

  test('the copy does not deny analytics while the CSP allows it', () => {
    if (!loadsAnalytics) return
    for (const file of COPY) {
      const text = readFileSync(file, 'utf8')
      for (const denial of DENIALS) {
        assert.ok(!denial.test(text),
          `${file} claims ${denial} but public/_headers allows an analytics beacon`)
      }
    }
  })

  test('the beacon host is allowed by host, not by exact path', () => {
    if (!headers.includes('cloudflareinsights.com')) return
    // The real script URL carries a version suffix after beacon.min.js, so a path-exact source
    // silently fails to match and the beacon stays blocked.
    assert.ok(!/static\.cloudflareinsights\.com\/beacon\.min\.js(?![\w.])/.test(headers),
      'allowlist static.cloudflareinsights.com as a host; the versioned path will not match')
  })
})

describe('sitemap', () => {
  test('lists every game', () => {
    for (const id of GAME_IDS) {
      assert.ok(sitemap.includes(`/${id}<`), `public/sitemap.xml is missing /${id}`)
    }
  })

  test('lists the static pages', () => {
    for (const path of ['/leaderboard', '/settings', '/legal']) {
      assert.ok(sitemap.includes(`${path}<`), `public/sitemap.xml is missing ${path}`)
    }
  })

  test('has no entries for pages that do not exist', () => {
    const known = new Set([...GAME_IDS.map(id => `/${id}`), '/', '/leaderboard', '/settings', '/legal'])
    for (const [, loc] of sitemap.matchAll(/<loc>https:\/\/minigames\.cpwillis\.dev(\/[^<]*)<\/loc>/g)) {
      assert.ok(known.has(loc), `sitemap lists ${loc}, which is not a real page`)
    }
  })
})
