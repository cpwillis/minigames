// Component layer: real DOM, real React, real user events.
//
// Weighted towards the bugs that actually shipped and the accessibility work, because those are
// the things a refactor silently undoes. Tests use createElement (exported as `h`) rather than
// JSX so they stay plain .ts.
import { test, describe, before } from 'node:test'
import assert from 'node:assert/strict'
import { mount, screen, fireEvent, act, useCleanDom, waitFor } from './helpers/render.ts'
import type { GameMeta } from '../src/features/games/types.ts'

useCleanDom()

const GAME: GameMeta = {
  id: 'big-o',
  title: 'Big-O',
  description: 'Identify the time complexity.',
  icon: '#',
  difficulty: 'hard',
  maxPoints: 1000,
  order: 1,
  component: () => null,
}

describe('GameCard', () => {
  let GameCard: typeof import('../src/components/GameCard.tsx').default
  before(async () => { GameCard = (await import('../src/components/GameCard.tsx')).default })

  test('links to the game and shows its details', () => {
    mount(GameCard, { game: GAME })
    assert.equal(screen.getByRole('link').getAttribute('href'), '/big-o')
    assert.ok(screen.getByRole('heading', { name: 'Big-O' }))
    assert.ok(screen.getByText('hard'))
  })

  test('shows the max points when unplayed', () => {
    mount(GameCard, { game: GAME })
    assert.ok(screen.getByText(/1,000 pts max/))
    assert.equal(screen.queryByText('Completed'), null)
  })

  test('shows the personal best once played', () => {
    mount(GameCard, { game: GAME, record: { bestTime: 65, bestPoints: 920 } })
    assert.ok(screen.getByText('Completed'))
    assert.ok(screen.getByText(/1:05/), 'best time should be formatted')
    assert.ok(screen.getByText(/920/))
  })
})

describe('CompletionOverlay', () => {
  let Overlay: typeof import('../src/components/CompletionOverlay.tsx').default
  before(async () => { Overlay = (await import('../src/components/CompletionOverlay.tsx')).default })

  // Regression: `previous` used to be read after the new score had already been written, so
  // this never said "New best!" for a genuine improvement.
  test('says New best when beating the previous time', () => {
    mount(Overlay, { elapsed: 10, points: 900, previous: { bestTime: 30, bestPoints: 600 }, onPlayAgain: () => {} })
    assert.ok(screen.getByText('New best!'))
    assert.ok(screen.getByText('0:30'), 'should show what was beaten')
  })

  test('says New best on a first ever run', () => {
    mount(Overlay, { elapsed: 10, points: 900, previous: null, onPlayAgain: () => {} })
    assert.ok(screen.getByText('New best!'))
  })

  test('does not claim a best when the run was slower', () => {
    mount(Overlay, { elapsed: 40, points: 300, previous: { bestTime: 12, bestPoints: 880 }, onPlayAgain: () => {} })
    assert.equal(screen.queryByText('New best!'), null)
    assert.ok(screen.getByText('Complete'))
  })

  test('Play again calls back', () => {
    let called = 0
    mount(Overlay, { elapsed: 5, points: 100, previous: null, onPlayAgain: () => { called++ } })
    fireEvent.click(screen.getByRole('button', { name: 'Play again' }))
    assert.equal(called, 1)
  })

  // Regression: it used to redirect to / after 8 seconds via window.location.
  test('does not navigate away on its own', async () => {
    const before = window.location.href
    mount(Overlay, { elapsed: 5, points: 100, previous: null, onPlayAgain: () => {} })
    await new Promise(r => setTimeout(r, 50))
    assert.equal(window.location.href, before)
  })

  test('is a labelled modal dialog', () => {
    mount(Overlay, { elapsed: 5, points: 100, previous: null, onPlayAgain: () => {} })
    const dialog = screen.getByRole('dialog')
    assert.equal(dialog.getAttribute('aria-modal'), 'true')
    assert.ok(dialog.getAttribute('aria-labelledby'))
  })
})

describe('ResetButton', () => {
  let ResetButton: typeof import('../src/components/ResetButton.tsx').default
  before(async () => { ResetButton = (await import('../src/components/ResetButton.tsx')).default })

  test('asks for confirmation before wiping progress', () => {
    localStorage.setItem('minigames-progress', JSON.stringify({ 'big-o': { bestTime: 5, bestPoints: 900 } }))
    mount(ResetButton)

    fireEvent.click(screen.getByRole('button', { name: 'Reset progress' }))
    assert.ok(screen.getByText(/cannot be undone/i))
    // Still there: asking is not doing.
    assert.ok(localStorage.getItem('minigames-progress'))

    fireEvent.click(screen.getByRole('button', { name: 'Reset' }))
    assert.equal(localStorage.getItem('minigames-progress'), null)
  })

  test('cancel leaves progress alone', () => {
    localStorage.setItem('minigames-progress', JSON.stringify({ 'big-o': { bestTime: 5, bestPoints: 900 } }))
    mount(ResetButton)
    fireEvent.click(screen.getByRole('button', { name: 'Reset progress' }))
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }))
    assert.ok(localStorage.getItem('minigames-progress'))
    assert.ok(screen.getByRole('button', { name: 'Reset progress' }))
  })
})
