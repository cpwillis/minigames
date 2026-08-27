'use client'
import { useCallback } from 'react'
import { api, ApiError } from '@/lib/api'
import { validateUsername } from '@shared/username.ts'
import { useStored, readStored, writeStored } from '@/lib/store'
import type { GameRecord } from '@/features/games/types'

export interface User {
  id: string
  displayName: string
  /** Proves this browser owns `id`. Held here only, never rendered, only ever sent to the API. */
  secret: string
  /** Skipped the name prompt. No server row exists, so nothing is sent until they pick a name. */
  anonymous?: boolean
}

const KEY = 'minigames-user'
const PROGRESS_KEY = 'minigames-progress'
const NO_USER = null

/** 32 random bytes, base64url. The server stores only its SHA-256. */
function newSecret(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(32))
  return btoa(String.fromCharCode(...bytes)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

/**
 * Push everything already won in this browser to the server.
 *
 * Games are playable before you pick a name, and until now those results only ever existed in
 * localStorage: the first thing a new player finished was never on the leaderboard. Registering
 * now backfills them.
 *
 * One request at a time, deliberately. Fired in parallel this is up to fifteen simultaneous
 * writes from one IP, which is indistinguishable from a flood to a rate limiter and would force
 * any such rule to be set uselessly high. It runs at most once per player and nothing waits on
 * it, so the extra second costs nobody anything. Best-effort: one failure must not lose the rest.
 */
export async function backfillScores(user: User) {
  const progress = readStored<Record<string, GameRecord>>(PROGRESS_KEY, {})
  for (const [gameId, record] of Object.entries(progress)) {
    try {
      await api.submitScore(user.id, gameId, record.bestTime, record.bestPoints, user.secret)
    } catch {
      // Keep going; a single rejected score should not strand the others.
    }
  }
}

/**
 * Re-create a server row for an id this browser still holds but the server has forgotten, which
 * happens if the database is reset or the player skipped registration while the API was down.
 *
 * The backfill sends everything in localStorage, so whatever prompted this recovery is included
 * and the player's whole history is restored, not just the run that hit the 404.
 */
export async function reregister(user: User) {
  await api.registerUser(user.id, user.displayName, user.secret)
  await backfillScores(user)
}

export function useUser() {
  const user = useStored<User | null>(KEY, NO_USER)

  const register = useCallback(async (
    displayName: string,
  ): Promise<{ ok: boolean; error?: string }> => {
    const result = validateUsername(displayName)
    if (!result.ok) return { ok: false, error: result.error }

    // Keep the id if one already exists (they skipped earlier), so their scores stay theirs.
    const existing = readStored<User | null>(KEY, NO_USER)
    const newUser: User = existing
      ? { ...existing, displayName: result.value, anonymous: false }
      : { id: crypto.randomUUID(), displayName: result.value, secret: newSecret() }

    writeStored<User>(KEY, newUser)
    try {
      await api.registerUser(newUser.id, newUser.displayName, newUser.secret)
      await backfillScores(newUser)
    } catch {
      // API unreachable. The account is still usable locally; scores sync on the next win.
    }
    return { ok: true }
  }, [])

  const registerAnonymous = useCallback(() => {
    // Deliberately local-only: "Skip" means stay off the leaderboard, so nothing is sent.
    const anon: User = { id: crypto.randomUUID(), displayName: 'Anonymous', secret: newSecret(), anonymous: true }
    writeStored<User>(KEY, anon)
    return anon.id
  }, [])

  const updateName = useCallback(async (
    displayName: string,
  ): Promise<{ ok: boolean; error?: string }> => {
    if (!user) return { ok: false, error: 'Not registered' }
    const result = validateUsername(displayName)
    if (!result.ok) return { ok: false, error: result.error }

    try {
      await api.updateName(user.id, result.value, user.secret)
    } catch (err) {
      if (err instanceof ApiError && err.status === 404) {
        // Saved locally while the API was down, or skipped past the name prompt: register the id
        // now instead of renaming, and bring any scores earned in the meantime with it.
        try {
          await reregister({ ...user, displayName: result.value, anonymous: false })
        } catch {
          return { ok: false, error: 'Could not reach server. Try again.' }
        }
      } else if (err instanceof ApiError) {
        return { ok: false, error: err.message }
      } else {
        return { ok: false, error: 'Could not reach server. Try again.' }
      }
    }
    writeStored<User>(KEY, { ...user, displayName: result.value, anonymous: false })
    return { ok: true }
  }, [user])

  return {
    user,
    register,
    registerAnonymous,
    updateName,
    isRegistered: !!user,
    // Who to submit scores as. Anonymous players have no server row, so submitting would only
    // generate 404s; they sync when and if they pick a name.
    syncUser: user && !user.anonymous ? user : undefined,
  }
}
