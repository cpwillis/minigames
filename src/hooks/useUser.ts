'use client'
import { useState, useEffect, useCallback } from 'react'
import { api, ApiError } from '@/lib/api'
import { validateUsername } from '@/lib/username'

export interface User {
  id: string
  displayName: string
}

const KEY = 'minigames-user'

function save(user: User) {
  localStorage.setItem(KEY, JSON.stringify(user))
}

export function useUser() {
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    try {
      const stored = localStorage.getItem(KEY)
      if (stored) setUser(JSON.parse(stored))
    } catch {}
  }, [])

  const register = useCallback(async (
    displayName: string,
  ): Promise<{ ok: boolean; error?: string }> => {
    const result = validateUsername(displayName)
    if (!result.ok) return { ok: false, error: result.error }

    const id = crypto.randomUUID()
    try {
      await api.registerUser(id, result.value)
    } catch {
      // API unreachable — still persist locally
    }
    const newUser: User = { id, displayName: result.value }
    save(newUser)
    setUser(newUser)
    return { ok: true }
  }, [])

  const registerAnonymous = useCallback(() => {
    const id = crypto.randomUUID()
    const newUser: User = { id, displayName: 'Anonymous' }
    save(newUser)
    setUser(newUser)
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
        // User was saved locally while the API was down, register them now instead
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
    const updated: User = { ...user, displayName: result.value }
    save(updated)
    setUser(updated)
    return { ok: true }
  }, [user])

  return { user, register, registerAnonymous, updateName, isRegistered: !!user }
}
