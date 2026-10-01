import { useCallback, useMemo, useSyncExternalStore } from 'react'

/**
 * Teacher-area access gate.
 *
 * SECURITY NOTICE — read before changing:
 * This application is a static site published on GitHub Pages. There is no
 * server, therefore there is no server-side authentication. The password below
 * is a practical in-app gate that keeps the teacher area out of the way of
 * students; it is NOT cryptographic protection, and it must never be described
 * as secure. Anyone with the published JavaScript can read it.
 *
 * The implementation is centralised here so a real authentication service can
 * replace it later without touching any teacher page.
 */

export const TEACHER_PASSWORD = 'somer173'

const STORAGE_KEY = 'ipc:teacher-access'

export type StorageLike = {
  getItem: (key: string) => string | null
  setItem: (key: string, value: string) => void
  removeItem: (key: string) => void
}

/** Exact comparison; no trimming, so the gate behaves predictably. */
export function isTeacherPasswordValid(input: string): boolean {
  return input === TEACHER_PASSWORD
}

export function createTeacherAccess(storage: StorageLike | null) {
  let unlocked = storage?.getItem(STORAGE_KEY) === 'granted'
  const listeners = new Set<() => void>()

  const notify = () => listeners.forEach((listener) => listener())

  return {
    isUnlocked(): boolean {
      return unlocked
    },
    /** Returns false for a wrong password; the caller shows the error state. */
    unlock(password: string): boolean {
      if (!isTeacherPasswordValid(password)) return false
      unlocked = true
      try {
        storage?.setItem(STORAGE_KEY, 'granted')
      } catch {
        // Session storage may be unavailable; access still holds in memory.
      }
      notify()
      return true
    },
    lock(): void {
      unlocked = false
      try {
        storage?.removeItem(STORAGE_KEY)
      } catch {
        // ignored
      }
      notify()
    },
    subscribe(listener: () => void): () => void {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
  }
}

function sessionStorageLike(): StorageLike | null {
  if (typeof window === 'undefined') return null
  try {
    const probe = '__ipc_probe__'
    window.sessionStorage.setItem(probe, '1')
    window.sessionStorage.removeItem(probe)
    return window.sessionStorage
  } catch {
    return null
  }
}

export const teacherAccess = createTeacherAccess(sessionStorageLike())

export function useTeacherAccess() {
  const unlocked = useSyncExternalStore(
    teacherAccess.subscribe,
    () => teacherAccess.isUnlocked(),
    () => false,
  )

  const unlock = useCallback((password: string) => teacherAccess.unlock(password), [])
  const lock = useCallback(() => teacherAccess.lock(), [])

  return useMemo(() => ({ unlocked, unlock, lock }), [unlocked, unlock, lock])
}
