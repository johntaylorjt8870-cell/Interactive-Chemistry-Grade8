import type { ResponseMap } from '@/data/testArea/types'

/* ============================================================================
   Draft persistence
   ----------------------------------------------------------------------------
   Scope deliberately minimal: only the *draft* (answers + position) is stored,
   in sessionStorage, for the duration of the tab session. No results, no
   scores, no analytics, no server, no database — the Test Area adds no backend
   and stores nothing that would outlive the session.

   The draft is bound to `bankVersion`; when a question bank changes, an old
   draft is discarded instead of being silently reused against new questions.
   ========================================================================= */

export type StorageLike = {
  getItem: (key: string) => string | null
  setItem: (key: string, value: string) => void
  removeItem: (key: string) => void
}

export const DRAFT_KEY_PREFIX = 'ipc:testarea:draft:v1:'

export type AttemptDraft = {
  bankVersion: number
  currentIndex: number
  responses: ResponseMap
}

export function draftKeyOf(testId: string): string {
  return `${DRAFT_KEY_PREFIX}${testId}`
}

function isDraft(value: unknown): value is AttemptDraft {
  if (!value || typeof value !== 'object') return false
  const candidate = value as Partial<AttemptDraft>
  return (
    typeof candidate.bankVersion === 'number' &&
    typeof candidate.currentIndex === 'number' &&
    typeof candidate.responses === 'object' &&
    candidate.responses !== null
  )
}

/** Returns null for a missing, corrupt or outdated draft. */
export function readDraft(
  testId: string,
  bankVersion: number,
  storage: StorageLike | null,
): AttemptDraft | null {
  if (!storage) return null
  try {
    const raw = storage.getItem(draftKeyOf(testId))
    if (!raw) return null
    const parsed: unknown = JSON.parse(raw)
    if (!isDraft(parsed) || parsed.bankVersion !== bankVersion) return null
    return parsed
  } catch {
    return null
  }
}

export function writeDraft(
  testId: string,
  bankVersion: number,
  draft: Omit<AttemptDraft, 'bankVersion'>,
  storage: StorageLike | null,
): void {
  if (!storage) return
  try {
    storage.setItem(draftKeyOf(testId), JSON.stringify({ bankVersion, ...draft }))
  } catch {
    // Storage may be unavailable or full; the attempt still works in memory.
  }
}

export function clearDraft(testId: string, storage: StorageLike | null): void {
  if (!storage) return
  try {
    storage.removeItem(draftKeyOf(testId))
  } catch {
    // ignored on purpose
  }
}

export function sessionStorageLike(): StorageLike | null {
  if (typeof window === 'undefined') return null
  try {
    const probe = '__ipc_testarea_probe__'
    window.sessionStorage.setItem(probe, '1')
    window.sessionStorage.removeItem(probe)
    return window.sessionStorage
  } catch {
    return null
  }
}
