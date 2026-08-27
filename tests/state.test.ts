// Theme, progress and user state. These share one module-level store backed by localStorage,
// which is exactly where the cross-component staleness bug lived.
import { test, describe, before } from 'node:test'
import assert from 'node:assert/strict'
import { mount, renderEl, screen, fireEvent, act, waitFor, useCleanDom, h } from './helpers/render.ts'

useCleanDom()

const load = (p: string) => import(p)

describe('ThemeProvider and ThemeToggle', () => {
  let ThemeProvider: any, ThemeToggle: any
  before(async () => {
    ThemeProvider = (await load('../src/components/ThemeProvider.tsx')).ThemeProvider
    ThemeToggle = (await load('../src/components/ThemeToggle.tsx')).default
  })

  const withProvider = () => renderEl(h(ThemeProvider, null, h(ThemeToggle, null)))

  test('a new visitor follows the system, storing nothing', async () => {
    withProvider()
    await waitFor(() => assert.ok(screen.getByRole('button')))
    assert.equal(localStorage.getItem('theme'), null, 'nothing should be stored until they choose')
  })

  // Regression: the toggle used to cycle light -> system -> dark, so half the clicks looked
  // like nothing happened.
  test('the toggle flips between exactly two states, never landing on system', async () => {
    withProvider()
    const btn = () => screen.getByRole('button')
    await waitFor(() => assert.match(btn().getAttribute('aria-label') ?? '', /Switch to (light|dark) theme/))

    const seen: string[] = []
    for (let i = 0; i < 4; i++) {
      fireEvent.click(btn())
      seen.push(localStorage.getItem('theme') ?? 'unset')
    }
    assert.ok(!seen.includes('system'), `should never store system, got ${seen.join(', ')}`)
    assert.deepEqual(new Set(seen), new Set(['light', 'dark']))
    // And it alternates rather than sticking.
    assert.notEqual(seen[0], seen[1])
    assert.equal(seen[0], seen[2])
  })

  test('an explicit choice is applied to the document', async () => {
    localStorage.setItem('theme', 'dark')
    withProvider()
    await waitFor(() => assert.ok(document.documentElement.classList.contains('dark')))
  })

  test('the label always describes what the click will do', async () => {
    localStorage.setItem('theme', 'dark')
    withProvider()
    await waitFor(() => assert.equal(screen.getByRole('button').getAttribute('aria-label'), 'Switch to light theme'))
    fireEvent.click(screen.getByRole('button'))
    assert.equal(screen.getByRole('button').getAttribute('aria-label'), 'Switch to dark theme')
  })
})

describe('useProgress via the home page', () => {
  let HomePage: any
  before(async () => { HomePage = (await load('../src/app/page.tsx')).default })

  test('shows nothing completed on a first visit', async () => {
    mount(HomePage)
    await waitFor(() => assert.ok(screen.getByText('0/15')))
  })

  test('reads progress already in localStorage', async () => {
    localStorage.setItem('minigames-progress', JSON.stringify({
      'big-o': { bestTime: 10, bestPoints: 900 },
      'hangman': { bestTime: 20, bestPoints: 600 },
    }))
    mount(HomePage)
    await waitFor(() => assert.ok(screen.getByText('2/15')))
    assert.ok(screen.getByText(/1,500 points/))
  })

  test('survives corrupt stored progress', async () => {
    localStorage.setItem('minigames-progress', 'not json{{')
    mount(HomePage)
    await waitFor(() => assert.ok(screen.getByText('0/15')), { timeout: 2000 })
  })

  test('the progress meter is announced', async () => {
    mount(HomePage)
    const bar = await waitFor(() => screen.getByRole('progressbar'))
    assert.equal(bar.getAttribute('aria-valuemax'), '15')
  })
})

describe('Nav', () => {
  let Nav: any
  before(async () => { Nav = (await load('../src/components/Nav.tsx')).default })

  test('hides the points chip until something is completed', async () => {
    mount(Nav)
    await waitFor(() => assert.ok(screen.getByRole('link', { name: /minigames/i })))
    assert.equal(screen.queryByText(/pts/), null)
  })

  test('shows points once there is progress', async () => {
    localStorage.setItem('minigames-progress', JSON.stringify({ 'big-o': { bestTime: 10, bestPoints: 900 } }))
    mount(Nav)
    await waitFor(() => assert.ok(screen.getByText(/900/)))
  })
})

describe('UsernameDialog', () => {
  let UsernameDialog: any
  before(async () => { UsernameDialog = (await load('../src/components/UsernameDialog.tsx')).default })

  test('will not submit an empty name', async () => {
    mount(UsernameDialog, { onClose: () => {} })
    const save = screen.getByRole('button', { name: /Save name/ }) as HTMLButtonElement
    assert.ok(save.disabled)
  })

  test('rejects a profane name without calling the API', async () => {
    let closed = 0
    mount(UsernameDialog, { onClose: () => { closed++ } })
    fireEvent.change(screen.getByLabelText('Display name'), { target: { value: 'xXfuckXx' } })
    fireEvent.click(screen.getByRole('button', { name: /Save name/ }))
    await waitFor(() => assert.ok(screen.getByRole('alert')))
    assert.equal(closed, 0, 'should not close on a rejected name')
    assert.equal(localStorage.getItem('minigames-user'), null)
  })

  test('Skip registers anonymously and closes', async () => {
    let closed = 0
    mount(UsernameDialog, { onClose: () => { closed++ } })
    fireEvent.click(screen.getByRole('button', { name: 'Skip' }))
    await waitFor(() => assert.equal(closed, 1))
    const user = JSON.parse(localStorage.getItem('minigames-user') ?? '{}')
    assert.equal(user.anonymous, true)
    assert.ok(user.secret, 'even an anonymous player gets a secret')
    assert.equal(user.secret.length, 43)
  })

  test('the secret is never rendered', async () => {
    mount(UsernameDialog, { onClose: () => {} })
    fireEvent.click(screen.getByRole('button', { name: 'Skip' }))
    await waitFor(() => assert.ok(localStorage.getItem('minigames-user')))
    const { secret } = JSON.parse(localStorage.getItem('minigames-user')!)
    assert.ok(!document.body.innerHTML.includes(secret), 'the secret leaked into the DOM')
  })
})

describe('Settings', () => {
  let SettingsPage: any, ThemeProvider: any
  before(async () => {
    SettingsPage = (await load('../src/app/settings/page.tsx')).default
    ThemeProvider = (await load('../src/components/ThemeProvider.tsx')).ThemeProvider
  })

  const withProvider = () => renderEl(h(ThemeProvider, null, h(SettingsPage, null)))

  // Regression: useState only reads its initialiser once and `user` is null on that first
  // render, so a saved name never appeared and the field was always empty.
  test('shows the saved display name', async () => {
    localStorage.setItem('minigames-user', JSON.stringify({
      id: '11111111-1111-4111-8111-111111111111', displayName: 'Ada Lovelace', secret: 'x'.repeat(43),
    }))
    withProvider()
    const field = await waitFor(() => screen.getByLabelText('Display name') as HTMLInputElement)
    await waitFor(() => assert.equal(field.value, 'Ada Lovelace'))
  })

  test('is empty for someone with no name yet', async () => {
    withProvider()
    const field = await waitFor(() => screen.getByLabelText('Display name') as HTMLInputElement)
    assert.equal(field.value, '')
  })

  test('does not clobber what you are typing', async () => {
    localStorage.setItem('minigames-user', JSON.stringify({
      id: '11111111-1111-4111-8111-111111111111', displayName: 'Ada', secret: 'x'.repeat(43),
    }))
    withProvider()
    const field = await waitFor(() => screen.getByLabelText('Display name') as HTMLInputElement)
    await waitFor(() => assert.equal(field.value, 'Ada'))
    fireEvent.change(field, { target: { value: 'Ada Lovelace' } })
    await new Promise(r => setTimeout(r, 60))
    assert.equal(field.value, 'Ada Lovelace', 'the effect must not overwrite an edit in progress')
  })

  test('offers all three theme options, unlike the nav toggle', async () => {
    withProvider()
    await waitFor(() => assert.ok(screen.getByRole('group', { name: 'Theme' })))
    for (const t of ['light', 'dark', 'system']) {
      assert.ok(screen.getByRole('button', { name: t }), `missing ${t}`)
    }
  })

  test('choosing system hands control back to the OS', async () => {
    localStorage.setItem('theme', 'dark')
    withProvider()
    const systemBtn = await waitFor(() => screen.getByRole('button', { name: 'system' }))
    fireEvent.click(systemBtn)
    assert.equal(localStorage.getItem('theme'), 'system')
  })
})
