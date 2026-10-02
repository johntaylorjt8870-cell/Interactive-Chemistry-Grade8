import { useCallback, useEffect, useState } from 'react'

/**
 * Announces the final state after a burst of control changes, rather than
 * emitting a live-region update for every range-input event. The region is
 * empty until the student interacts, so mounting a simulation is silent.
 */
export function useDebouncedLiveAnnouncement(message: string, delay = 400) {
  const [enabled, setEnabled] = useState(false)
  const [announcement, setAnnouncement] = useState('')

  const requestAnnouncement = useCallback(() => setEnabled(true), [])

  useEffect(() => {
    if (!enabled || message === '') return

    const timer = window.setTimeout(() => setAnnouncement(message), delay)
    return () => window.clearTimeout(timer)
  }, [delay, enabled, message])

  return { announcement, requestAnnouncement }
}
