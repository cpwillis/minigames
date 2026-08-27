'use client'
import { useState, useEffect, useRef } from 'react'

export function useTimer(resetKey: number) {
  const [elapsed, setElapsed] = useState(0)
  const startRef = useRef(Date.now())
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const stoppedRef = useRef(false)

  useEffect(() => {
    startRef.current = Date.now()
    stoppedRef.current = false
    setElapsed(0)
    intervalRef.current = setInterval(() => {
      if (!stoppedRef.current) {
        setElapsed((Date.now() - startRef.current) / 1000)
      }
    }, 500)
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [resetKey])

  const stop = (): number => {
    stoppedRef.current = true
    if (intervalRef.current) clearInterval(intervalRef.current)
    return (Date.now() - startRef.current) / 1000
  }

  return { elapsed, stop }
}
