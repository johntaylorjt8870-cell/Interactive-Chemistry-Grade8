import { useCallback, useEffect, useMemo, useReducer } from 'react'
import type { ResponseValue, TestBank, TestQuestion } from '@/data/testArea/types'
import {
  answeredCountOf,
  attemptReducer,
  createAttemptState,
  progressRatioOf,
  unansweredIndicesOf,
  type AttemptAction,
  type AttemptState,
} from './attemptReducer'
import { clearDraft, readDraft, sessionStorageLike, writeDraft, type StorageLike } from './draft'

/* ============================================================================
   React binding for one attempt
   ----------------------------------------------------------------------------
   The hook owns no grading rules: it wires the pure reducer to React and to
   sessionStorage. Everything the screen shows — progress, navigation, the
   unanswered warning — is derived from the reducer state.
   ========================================================================= */

export type UseTestAttemptOptions = {
  /** Pass `null` to disable persistence (tests, private mode). */
  storage?: StorageLike | null
}

export type TestAttempt = {
  state: AttemptState
  questions: TestQuestion[]
  currentQuestion: TestQuestion | undefined
  currentIndex: number
  answeredCount: number
  total: number
  progressRatio: number
  unansweredIndices: number[]
  answer: (questionId: string, value: ResponseValue) => void
  clearAnswer: (questionId: string) => void
  goTo: (index: number) => void
  next: () => void
  previous: () => void
  submit: () => void
  submitAnyway: () => void
  dismissWarning: () => void
  restart: () => void
}

export function useTestAttempt(bank: TestBank, options: UseTestAttemptOptions = {}): TestAttempt {
  const storage = options.storage === undefined ? sessionStorageLike() : options.storage

  const [state, dispatch] = useReducer(
    (current: AttemptState, action: AttemptAction) => attemptReducer(current, action, bank),
    undefined,
    (): AttemptState => {
      const base = createAttemptState(bank)
      const draft = readDraft(bank.id, bank.version, storage)
      if (!draft) return base
      return { ...base, currentIndex: draft.currentIndex, responses: draft.responses }
    },
  )

  useEffect(() => {
    if (state.status === 'submitted') {
      clearDraft(bank.id, storage)
      return
    }
    writeDraft(
      bank.id,
      bank.version,
      { currentIndex: state.currentIndex, responses: state.responses },
      storage,
    )
  }, [state, bank.id, bank.version, storage])

  const answer = useCallback(
    (questionId: string, value: ResponseValue) => dispatch({ type: 'answer', questionId, value }),
    [],
  )
  const clearAnswer = useCallback((questionId: string) => dispatch({ type: 'clear', questionId }), [])
  const goTo = useCallback((index: number) => dispatch({ type: 'goto', index }), [])
  const next = useCallback(() => dispatch({ type: 'next' }), [])
  const previous = useCallback(() => dispatch({ type: 'previous' }), [])
  const submit = useCallback(() => dispatch({ type: 'submit' }), [])
  const submitAnyway = useCallback(() => dispatch({ type: 'submit-anyway' }), [])
  const dismissWarning = useCallback(() => dispatch({ type: 'dismiss-warning' }), [])
  const restart = useCallback(() => dispatch({ type: 'restart' }), [])

  const total = bank.questions.length
  const currentIndex = Math.min(state.currentIndex, Math.max(total - 1, 0))

  return useMemo(
    () => ({
      state,
      questions: bank.questions,
      currentQuestion: bank.questions[currentIndex],
      currentIndex,
      answeredCount: answeredCountOf(bank, state),
      total,
      progressRatio: progressRatioOf(bank, state),
      unansweredIndices: unansweredIndicesOf(bank, state),
      answer,
      clearAnswer,
      goTo,
      next,
      previous,
      submit,
      submitAnyway,
      dismissWarning,
      restart,
    }),
    [
      state,
      bank,
      currentIndex,
      total,
      answer,
      clearAnswer,
      goTo,
      next,
      previous,
      submit,
      submitAnyway,
      dismissWarning,
      restart,
    ],
  )
}
