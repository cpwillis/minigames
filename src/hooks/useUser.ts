'use client'
import { useState, useCallback } from 'react'
import { api } from '@/lib/api'
import { validateUsername } from '@/lib/username'

export interface User {
  id: string
  displayName: string
}

const KEY = 'minigames-user'

function load(): User | null {
  try {
    const stored = localStorage.getItem(KEY)
    return stored ? JSON.parse(stored) : null
  } catch {
    return null
  }
}

function save(user: User) {
  localStorage.setItem(KEY, JSON.stringify(user))
}

export function useUser() {
  const [user, setUser] = useState<User | null>(load)

  const register = useCallback(async (
    displayName: string,
  ): Promise<{ ok: boolean; error?: string }> => {
    const result = validateUsername(displayName)
    if (!result.ok) return { ok: false, error: result.error }

    const id = crypto.randomUUID()
    try {
      await api.registerUser(id, result.value)
    } catch {
      // API unreachable — still persist locally so the user has an identity
    }
    const newUser: User = { id, displayName: result.value }
    save(newUser)
    setUser(newUser)
    return { ok: true }
  }, [])

  const registerAnonymous = useCallback(() => {
    const id = crypto.randomUUID()
    const newUser: User = { id, displayName: 'Anonymous' }
    // Don't call API for anonymous users — they can claim a name in settings later
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
    } catch {
      return { ok: false, error: 'Could not reach server. Try again.' }
    }
    const updated: User = { ...user, displayName: result.value }
    save(updated)
    setUser(updated)
    return { ok: true }
  }, [user])

  return { user, register, registerAnonymous, updateName, isRegistered: !!user }
}
