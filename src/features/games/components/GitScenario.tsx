'use client'
import { useState } from 'react'

export const meta = {
  id: 'git-scenario',
  title: 'Git Scenario',
  description: 'Pick the correct git command for each situation.',
  icon: '🌿',
  difficulty: 'medium' as const,
  maxPoints: 750,
  order: 14,
}

interface Question {
  scenario: string
  options: string[]
  answer: number
}

const ALL_QUESTIONS: Question[] = [
  {
    scenario: 'Undo the last commit but keep the changes staged.',
    options: ['git reset --hard HEAD~1', 'git reset --soft HEAD~1', 'git revert HEAD', 'git checkout HEAD~1'],
    answer: 1,
  },
  {
    scenario: 'See which files were changed in the last commit.',
    options: ['git log --stat -1', 'git diff HEAD~1', 'git status', 'git show --name-only'],
    answer: 3,
  },
  {
    scenario: 'Create a new branch called "feature/login" and switch to it immediately.',
    options: ['git branch feature/login', 'git checkout feature/login', 'git checkout -b feature/login', 'git switch feature/login'],
    answer: 2,
  },
  {
    scenario: 'Bring in commits from "main" into your current branch without a merge commit.',
    options: ['git merge main', 'git rebase main', 'git cherry-pick main', 'git pull --no-ff main'],
    answer: 1,
  },
  {
    scenario: 'Temporarily stash your uncommitted changes so you can switch branches.',
    options: ['git commit -m "WIP"', 'git stash', 'git reset HEAD', 'git save'],
    answer: 1,
  },
  {
    scenario: 'Apply a single commit from another branch onto the current branch.',
    options: ['git rebase', 'git merge --squash', 'git cherry-pick <sha>', 'git apply <sha>'],
    answer: 2,
  },
  {
    scenario: 'Discard all uncommitted changes in tracked files.',
    options: ['git reset HEAD', 'git stash', 'git restore .', 'git clean -fd'],
    answer: 2,
  },
  {
    scenario: 'Rename the current branch to "main".',
    options: ['git branch -m main', 'git rename main', 'git checkout -b main', 'git branch --rename main'],
    answer: 0,
  },
  {
    scenario: 'See a compact one-line log with branch graph.',
    options: ['git log --all', 'git log --oneline --graph --decorate', 'git show --stat', 'git reflog'],
    answer: 1,
  },
  {
    scenario: 'Unstage a file you accidentally added with git add.',
    options: ['git rm --cached file', 'git reset HEAD file', 'git restore --staged file', 'git checkout -- file'],
    answer: 2,
  },
]

const TOTAL_ROUNDS = 5

function pickQuestions(): Question[] {
  return [...ALL_QUESTIONS].sort(() => Math.random() - 0.5).slice(0, TOTAL_ROUNDS)
}

export default function GitScenario({ onComplete }: { onComplete: () => void }) {
  const [questions] = useState(pickQuestions)
  const [round, setRound] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [correct, setCorrect] = useState(0)

  const q = questions[round]

  const pick = (i: number) => {
    if (selected !== null) return
    setSelected(i)
    if (i === q.answer) setCorrect(c => c + 1)
    setTimeout(() => {
      if (round + 1 >= TOTAL_ROUNDS) {
        setTimeout(onComplete, 300)
      } else {
        setRound(r => r + 1)
        setSelected(null)
      }
    }, 900)
  }

  return (
    <div className="space-y-5 max-w-lg">
      <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
        <span>Round {round + 1} / {TOTAL_ROUNDS}</span>
        <span>{correct} correct</span>
      </div>

      <div className="rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 p-4">
        <p className="text-sm text-gray-900 dark:text-gray-100 leading-relaxed">{q.scenario}</p>
      </div>

      <div className="space-y-2">
        {q.options.map((opt, i) => {
          let cls = 'w-full text-left rounded-lg border px-3 py-2.5 font-mono text-sm transition-colors'
          if (selected === null) {
            cls += ' border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 hover:border-green-500 cursor-pointer'
          } else if (i === q.answer) {
            cls += ' border-green-500 bg-[var(--game-correct-bg)] text-green-700 dark:text-green-400'
          } else if (i === selected) {
            cls += ' border-red-400 bg-[var(--game-wrong-bg)] text-red-600 dark:text-red-400'
          } else {
            cls += ' border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-400 dark:text-gray-600'
          }
          return (
            <button key={i} className={cls} onClick={() => pick(i)} disabled={selected !== null}>
              {opt}
            </button>
          )
        })}
      </div>
    </div>
  )
}
