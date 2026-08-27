'use client'
import { useCallback } from 'react'
import { api, ApiError } from '@/lib/api'
import { validateUsername } from '@/lib/username.ts'
import { useStored, writeStored } from '@/lib/store'

export interface User {
  id: string
  displayName: string
}

const KEY = 'minigames-user'
const NO_USER = null

export function useUser() {
  const user = useStored<User | null>(KEY, NO_USER)

  const register = useCallback(async (
    displayName: string,
  ): Promise<{ ok: boolean; error?: string }> => {
    const result = validateUsername(displayName)
    if (!result.ok) return { ok: false, error: result.error }

    const id = crypto.randomUUID()
    try {
      await api.registerUser(id, result.value)
    } catch {
      // API unreachable — still persist locally so play is never blocked on the network.
    }
    writeStored<User>(KEY, { id, displayName: result.value })
    return { ok: true }
  }, [])

  const registerAnonymous = useCallback(() => {
    const id = crypto.randomUUID()
    writeStored<User>(KEY, { id, displayName: 'Anonymous' })
    return id
  }, [])

  const updateName = useCallback(async (
    displayName: string,
  ): Promise<{ ok: boolean; error?: string }> => {
    if (!user) return { ok: false, error: 'Not registered' }
    const result = validateUsername(displayName)
    if (!result.ok) return { ok: false, error: result.error }

    try {
      await api.updateName(user.id, result.value)
    } catch (err) {
      if (err instanceof ApiError && err.status === 404) {
        // Saved locally while the API was down; register the id now instead of renaming.
        try {
          await api.registerUser(user.id, result.value)
        } catch {
          return { ok: false, error: 'Could not reach server. Try again.' }
        }
      } else if (err instanceof ApiError) {
        return { ok: false, error: err.message }
      } else {
        return { ok: false, error: 'Could not reach server. Try again.' }
      }
    }
    writeStored<User>(KEY, { ...user, displayName: result.value })
    return { ok: true }
  }, [user])

  return { user, register, registerAnonymous, updateName, isRegistered: !!user }
}
