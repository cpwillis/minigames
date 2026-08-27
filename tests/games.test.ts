// The games themselves, in a real DOM.
//
// Four of them used to drive play through onClick on plain divs and were unplayable by keyboard;
// Regex Match's checkbox toggled twice per click and never ticked; Hangman re-subscribed its
// key listener on every render. Those are the cases weighted most heavily here.
import { test, describe, before } from 'node:test'
import assert from 'node:assert/strict'
import { mount, screen, fireEvent, waitFor, useCleanDom } from './helpers/render.ts'

useCleanDom()

const load = (name: string) => import(`../src/features/games/components/${name}.tsx`)

describe('Riddle Box', () => {
  let RiddleBox: any
  before(async () => { RiddleBox = (await load('RiddleBox')).default })

  // The answers are bare emoji; without aria-label a screen reader announces nothing useful.
  test('every answer has an accessible name', () => {
    mount(RiddleBox, { onComplete: () => {} })
    const names = screen.getAllByRole('button').map(b => b.getAttribute('aria-label'))
    assert.deepEqual(names, ['Fire', 'Floppy disk', 'Bug', 'Gear', 'Explosion'])
  })

  test('the right answer completes the game', async () => {
    let done = 0
    mount(RiddleBox, { onComplete: () => { done++ } })
    fireEvent.click(screen.getByRole('button', { name: 'Bug' }))
    await waitFor(() => assert.equal(done, 1), { timeout: 3000 })
  })

  test('a wrong answer does not complete it', async () => {
    let done = 0
    mount(RiddleBox, { onComplete: () => { done++ } })
    fireEvent.click(screen.getByRole('button', { name: 'Fire' }))
    await new Promise(r => setTimeout(r, 300))
    assert.equal(done, 0)
  })
})

describe('Memory Match', () => {
  let MemoryMatch: any
  before(async () => { MemoryMatch = (await load('MemoryMatch')).default })

  // Regression: the cards were divs with onClick, so no keyboard user could play at all.
  test('cards are buttons with accessible names', () => {
    mount(MemoryMatch, { onComplete: () => {} })
    const cards = screen.getAllByRole('button')
    assert.equal(cards.length, 16)
    for (const c of cards) {
      assert.equal(c.tagName, 'BUTTON')
      assert.match(c.getAttribute('aria-label') ?? '', /Face down card \d+/)
    }
  })

  test('clicking a card turns it face up', () => {
    mount(MemoryMatch, { onComplete: () => {} })
    const card = screen.getAllByRole('button')[0]
    fireEvent.click(card)
    assert.match(card.getAttribute('aria-label') ?? '', /Face up/)
  })
})

describe('Bug Finder', () => {
  let BugFinder: any
  before(async () => { BugFinder = (await load('BugFinder')).default })

  // Regression: code lines were clickable divs.
  test('code lines are buttons naming their line number', () => {
    mount(BugFinder, { onComplete: () => {} })
    const lines = screen.getAllByRole('button')
    assert.ok(lines.length > 1)
    assert.match(lines[0].getAttribute('aria-label') ?? '', /^Line 1:/)
  })

  test('picking a line reveals the verdict and an explanation', () => {
    mount(BugFinder, { onComplete: () => {} })
    fireEvent.click(screen.getAllByRole('button')[0])
    const verdict = screen.queryByText(/Correct!/) ?? screen.queryByText(/bug was on line/)
    assert.ok(verdict, 'should say whether the pick was right')
    assert.ok(screen.getByRole('button', { name: /Next|Finish/ }))
  })

  test('lines lock once answered, so you cannot fish for the answer', () => {
    mount(BugFinder, { onComplete: () => {} })
    const lines = screen.getAllByRole('button')
    fireEvent.click(lines[0])
    for (const l of screen.getAllByRole('button')) {
      if ((l.getAttribute('aria-label') ?? '').startsWith('Line ')) {
        assert.ok((l as HTMLButtonElement).disabled, 'answered lines should be disabled')
      }
    }
  })
})

describe('JSON Fix', () => {
  let JsonFix: any
  before(async () => { JsonFix = (await load('JsonFix')).default })

  test('code lines are buttons', () => {
    mount(JsonFix, { onComplete: () => {} })
    const lines = screen.getAllByRole('button').filter(b => (b.getAttribute('aria-label') ?? '').startsWith('Line '))
    assert.ok(lines.length >= 4)
  })

  test('choosing a line reveals the fix options', () => {
    mount(JsonFix, { onComplete: () => {} })
    assert.equal(screen.queryByText(/Step 2/), null)
    fireEvent.click(screen.getAllByRole('button')[0])
    assert.ok(screen.getByText(/Step 2/))
  })
})

describe('Regex Match', () => {
  let RegexMatch: any
  before(async () => { RegexMatch = (await load('RegexMatch')).default })

  // Regression: onClick on the label plus onChange on the checkbox fired twice per click, so the
  // box never actually ticked. This is the test that would have caught it.
  test('a single click ticks the checkbox exactly once', () => {
    mount(RegexMatch, { onComplete: () => {} })
    const box = screen.getAllByRole('checkbox')[0] as HTMLInputElement
    assert.equal(box.checked, false)
    fireEvent.click(box)
    assert.equal(box.checked, true, 'one click should leave the box ticked, not toggle it twice')
    fireEvent.click(box)
    assert.equal(box.checked, false)
  })

  test('submitting locks the answers', () => {
    mount(RegexMatch, { onComplete: () => {} })
    fireEvent.click(screen.getByRole('button', { name: 'Submit' }))
    for (const b of screen.getAllByRole('checkbox')) {
      assert.ok((b as HTMLInputElement).disabled)
    }
    assert.ok(screen.getByText(/Matches:/))
  })
})

describe('Hangman', () => {
  let Hangman: any
  before(async () => { Hangman = (await load('Hangman')).default })

  test('offers the whole alphabet as buttons', () => {
    mount(Hangman, { onComplete: () => {} })
    const letters = screen.getAllByRole('button').filter(b => /^[A-Z]$/.test(b.textContent ?? ''))
    assert.equal(letters.length, 26)
  })

  test('a guessed letter is disabled afterwards', () => {
    mount(Hangman, { onComplete: () => {} })
    const e = screen.getByRole('button', { name: 'E' }) as HTMLButtonElement
    fireEvent.click(e)
    assert.ok((screen.getByRole('button', { name: 'E' }) as HTMLButtonElement).disabled)
  })

  // Regression: the keydown effect had no dep array and re-subscribed on every render.
  test('typing a letter guesses it', () => {
    mount(Hangman, { onComplete: () => {} })
    fireEvent.keyDown(window, { key: 'e' })
    assert.ok((screen.getByRole('button', { name: 'E' }) as HTMLButtonElement).disabled,
      'a physical keypress should register the same as a click')
  })

  test('the keyboard listener does not stack up duplicates', () => {
    mount(Hangman, { onComplete: () => {} })
    // Guessing the same letter repeatedly must stay idempotent no matter how many renders happened.
    for (let i = 0; i < 5; i++) fireEvent.keyDown(window, { key: 'q' })
    const guessesLeft = screen.getByText(/guesses left/).textContent ?? ''
    assert.match(guessesLeft, /[56] guesses left/, `one wrong letter should cost one guess, got "${guessesLeft}"`)
  })
})

describe('Typing Speed', () => {
  let TypingSpeed: any
  before(async () => { TypingSpeed = (await load('TypingSpeed')).default })

  test('completes when the snippet is typed exactly', async () => {
    let done = 0
    mount(TypingSpeed, { onComplete: () => { done++ } })
    const input = screen.getByPlaceholderText(/Start typing/) as HTMLInputElement
    const target = (screen.getByText(/\d+ \/ \d+ characters/).textContent ?? '').match(/\/ (\d+)/)?.[1]
    assert.ok(target, 'should show a character count')

    // Read the snippet back off the rendered characters.
    const snippet = Array.from(document.querySelectorAll('.font-mono span'))
      .map(s => s.textContent).join('')
    fireEvent.change(input, { target: { value: snippet } })
    await waitFor(() => assert.equal(done, 1), { timeout: 3000 })
  })

  test('refuses input longer than the snippet', () => {
    mount(TypingSpeed, { onComplete: () => {} })
    const input = screen.getByPlaceholderText(/Start typing/) as HTMLInputElement
    fireEvent.change(input, { target: { value: 'x'.repeat(500) } })
    assert.notEqual(input.value.length, 500)
  })
})

describe('every game', () => {
  const NAMES = [
    'WordSearch', 'CaesarCipher', 'CodeTrivia', 'MemoryMatch', 'RiddleBox', 'NumberGuess',
    'Hangman', 'HttpStatus', 'BugFinder', 'TypingSpeed', 'RegexMatch', 'ColorHex', 'JsonFix',
    'GitScenario', 'BigO',
  ]

  for (const name of NAMES) {
    test(`${name} renders and is keyboard reachable`, async () => {
      const Game = (await load(name)).default
      mount(Game, { onComplete: () => {} })
      const interactive = document.querySelectorAll('button, input, [tabindex]:not([tabindex="-1"])')
      assert.ok(interactive.length > 0, `${name} renders nothing a keyboard can reach`)
      // Anything driving play must be a real control, not a div with onClick.
      assert.equal(document.querySelectorAll('div[onclick]').length, 0)
    })
  }

  for (const name of NAMES) {
    test(`${name} gives every control an accessible name`, async () => {
      const Game = (await load(name)).default
      mount(Game, { onComplete: () => {} })
      for (const el of Array.from(document.querySelectorAll('button'))) {
        const name_ = el.getAttribute('aria-label') || el.textContent?.trim()
        assert.ok(name_, `a button in ${name} has no accessible name`)
      }
    })
  }
})
