import { useCallback, useMemo, useSyncExternalStore } from 'react'
import type { LessonDefinition } from './curriculum/schema'

/**
 * Lesson progress store.
 *
 * Progress is deliberately plain: which steps a student has opened, and
 * whether the lesson was completed. It is stored in `localStorage` under a
 * versioned key, never invented, and never displayed as gamification.
 */

export type LessonProgressEntry = {
  seenStepIds: string[]
  completed: boolean
  updatedAt: string
}

export type ProgressState = {
  version: 1
  lessons: Record<string, LessonProgressEntry>
}

const STORAGE_KEY = 'ipc:progress'

const EMPTY_STATE: ProgressState = { version: 1, lessons: {} }

export type StorageLike = {
  getItem: (key: string) => string | null
  setItem: (key: string, value: string) => void
  removeItem: (key: string) => void
}

function isProgressState(value: unknown): value is ProgressState {
  if (!value || typeof value !== 'object') return false
  const candidate = value as Partial<ProgressState>
  return candidate.version === 1 && typeof candidate.lessons === 'object' && candidate.lessons !== null
}

export type ProgressStore = ReturnType<typeof createProgressStore>

/**
 * Creates an isolated progress store. Taking the storage as a parameter keeps
 * the store testable without touching a real browser storage.
 */
export function createProgressStore(storage: StorageLike | null) {
  let state: ProgressState = load(storage)
  const listeners = new Set<() => void>()

  function load(source: StorageLike | null): ProgressState {
    if (!source) return EMPTY_STATE
    try {
      const raw = source.getItem(STORAGE_KEY)
      if (!raw) return EMPTY_STATE
      const parsed: unknown = JSON.parse(raw)
      return isProgressState(parsed) ? parsed : EMPTY_STATE
    } catch {
      return EMPTY_STATE
    }
  }

  function persist(next: ProgressState) {
    state = next
    try {
      storage?.setItem(STORAGE_KEY, JSON.stringify(next))
    } catch {
      // Persistence is best-effort: a blocked storage must not break the lesson.
    }
    listeners.forEach((listener) => listener())
  }

  function updateLesson(lessonId: string, update: (entry: LessonProgressEntry) => LessonProgressEntry) {
    const existing = state.lessons[lessonId] ?? { seenStepIds: [], completed: false, updatedAt: new Date(0).toISOString() }
    persist({
      version: 1,
      lessons: {
        ...state.lessons,
        [lessonId]: { ...update(existing), updatedAt: new Date().toISOString() },
      },
    })
  }

  return {
    subscribe(listener: () => void) {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
    getSnapshot(): ProgressState {
      return state
    },
    getServerSnapshot(): ProgressState {
      return EMPTY_STATE
    },
    getLesson(lessonId: string): LessonProgressEntry | undefined {
      return state.lessons[lessonId]
    },
    markStepSeen(lessonId: string, stepId: string) {
      updateLesson(lessonId, (entry) =>
        entry.seenStepIds.includes(stepId) ? entry : { ...entry, seenStepIds: [...entry.seenStepIds, stepId] },
      )
    },
    setCompleted(lessonId: string, completed = true) {
      updateLesson(lessonId, (entry) => ({ ...entry, completed }))
    },
    resetLesson(lessonId: string) {
      const nextLessons = { ...state.lessons }
      delete nextLessons[lessonId]
      persist({ version: 1, lessons: nextLessons })
    },
    resetAll() {
      persist(EMPTY_STATE)
      try {
        storage?.removeItem(STORAGE_KEY)
      } catch {
        // ignored on purpose
      }
    },
    /** Reloads from storage; used when another tab changes progress. */
    refresh() {
      state = load(storage)
      listeners.forEach((listener) => listener())
    },
  }
}

function safeStorage(): StorageLike | null {
  if (typeof window === 'undefined') return null
  try {
    const probe = '__ipc_probe__'
    window.localStorage.setItem(probe, '1')
    window.localStorage.removeItem(probe)
    return window.localStorage
  } catch {
    return null
  }
}

export const progressStore = createProgressStore(safeStorage())

/** React binding for the shared progress store. */
export function useLessonProgress(lessonId: string) {
  const state = useSyncExternalStore(
    progressStore.subscribe,
    progressStore.getSnapshot,
    progressStore.getServerSnapshot,
  )

  const entry = state.lessons[lessonId]

  const markStepSeen = useCallback((stepId: string) => progressStore.markStepSeen(lessonId, stepId), [lessonId])
  const setCompleted = useCallback(
    (completed = true) => progressStore.setCompleted(lessonId, completed),
    [lessonId],
  )
  const reset = useCallback(() => progressStore.resetLesson(lessonId), [lessonId])

  return useMemo(
    () => ({
      seenStepIds: entry?.seenStepIds ?? [],
      completed: entry?.completed ?? false,
      markStepSeen,
      setCompleted,
      reset,
    }),
    [entry, markStepSeen, setCompleted, reset],
  )
}

export type LessonProgressView = {
  seen: number
  total: number
  ratio: number
  completed: boolean
}

/** Percentages are computed from real step ids only; nothing is fabricated. */
export function computeLessonProgress(
  lesson: Pick<LessonDefinition, 'id' | 'steps'>,
  entry: LessonProgressEntry | undefined,
): LessonProgressView {
  const total = lesson.steps.length
  const seenIds = new Set(entry?.seenStepIds ?? [])
  const seen = lesson.steps.filter((step) => seenIds.has(step.id)).length
  return {
    seen,
    total,
    ratio: total === 0 ? 0 : seen / total,
    completed: entry?.completed ?? false,
  }
}
