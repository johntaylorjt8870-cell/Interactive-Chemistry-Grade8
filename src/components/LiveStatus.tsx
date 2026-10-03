import { useEffect, useRef, useState } from 'react'

export type LiveStatusProps = {
  /**
   * Concise, human-readable summary of the state that just changed, in the
   * student's language. Never put implementation details here (ids, class
   * names, raw attributes) — only what the student would say out loud.
   */
  message: string
  /**
   * Quiet period, in milliseconds, before the message is announced.
   *
   * Dragging a slider produces a burst of value updates; the delay collapses
   * the burst into a single announcement of the value the student stopped on,
   * so the region never becomes a running commentary. Use `0` for discrete,
   * low-frequency changes (for example moving to another lesson step), where
   * the update is already one announcement per user action.
   */
  delayMs?: number
  className?: string
}

/**
 * Polite live region for values that change while the student interacts.
 *
 * The contract this component implements, and that the accessibility tests
 * pin down:
 *
 * - it is a real, always-mounted `role="status"` region — screen readers only
 *   announce *changes* to a region they already know about, so the state the
 *   page happens to start with is never shouted at the student;
 * - it announces meaningful state, never animation frames: the optional
 *   debounce collapses rapid updates into one announcement;
 * - it is visually hidden, so nothing about the premium visual design moves;
 * - it is written in normal Arabic prose, so it needs no bidi isolation.
 */
export function LiveStatus({ message, delayMs = 400, className }: LiveStatusProps) {
  const [announced, setAnnounced] = useState('')
  const lastMessage = useRef(message)

  useEffect(() => {
    // Mount state is silent: only a real change is worth interrupting for.
    if (message === lastMessage.current) return
    lastMessage.current = message

    if (delayMs <= 0) {
      setAnnounced(message)
      return
    }

    const timer = setTimeout(() => setAnnounced(message), delayMs)
    return () => clearTimeout(timer)
  }, [message, delayMs])

  return (
    <span
      className={['visually-hidden', className].filter(Boolean).join(' ')}
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      {announced}
    </span>
  )
}
