import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { getLessonLab, type LessonLabDefinition } from './registry'

export const LAB_HASH = '#lab'

export type LessonLabContextValue = {
  lab: LessonLabDefinition
  labOpen: boolean
  labMounted: boolean
  openLab: (options?: { fromDrawer?: boolean }) => void
  closeLabToLesson: () => void
  closeLabToStep: (stepNumber: number) => void
  closeLabToNotebook: (alreadyOpenInFlow: boolean) => void
  closeLabSilently: () => void
}

const LessonLabContext = createContext<LessonLabContextValue | null>(null)

export function useLessonLab(): LessonLabContextValue | null {
  return useContext(LessonLabContext)
}

export function LessonLabProvider({
  lessonId,
  children,
}: {
  lessonId: string
  children: ReactNode
}) {
  const lab = useMemo(() => getLessonLab(lessonId), [lessonId])

  const [labOpen, setLabOpen] = useState(
    () => Boolean(lab && typeof window !== 'undefined' && window.location.hash === LAB_HASH),
  )
  const [labMounted, setLabMounted] = useState(
    () => Boolean(lab && typeof window !== 'undefined' && window.location.hash === LAB_HASH),
  )
  const returnStepHash = useRef<string>('#step-1')
  const prevLessonId = useRef(lessonId)

  useEffect(() => {
    if (prevLessonId.current === lessonId) return
    prevLessonId.current = lessonId
    const nextHasLab = Boolean(getLessonLab(lessonId))
    const openOnHash =
      nextHasLab && typeof window !== 'undefined' && window.location.hash === LAB_HASH
    setLabMounted(openOnHash)
    setLabOpen(openOnHash)
    returnStepHash.current = '#step-1'
  }, [lessonId])

  useEffect(() => {
    if (!lab || !labOpen || typeof window === 'undefined') return
    if (window.location.hash !== LAB_HASH) {
      window.history.replaceState(null, '', LAB_HASH)
    }
  }, [lab, labOpen])

  const focusLessonContent = useCallback(() => {
    if (typeof document !== 'undefined') {
      document.getElementById('lesson-content')?.focus?.()
    }
  }, [])

  const openLab = useCallback(
    (options?: { fromDrawer?: boolean }) => {
      if (!lab) return
      if (typeof window !== 'undefined' && /^#step-\d+$/.test(window.location.hash)) {
        returnStepHash.current = window.location.hash
      }
      if (typeof document !== 'undefined' && document.querySelector('.student-notebook, .lesson-extra')) {
        document.querySelector<HTMLButtonElement>('.lesson-shell__nav button')?.click()
      }
      setLabMounted(true)
      setLabOpen(true)
      if (typeof window !== 'undefined') {
        window.history.replaceState(null, '', LAB_HASH)
      }
      if (options?.fromDrawer && typeof document !== 'undefined') {
        document.querySelector<HTMLElement>('[data-testid="drawer-backdrop"]')?.click()
        setTimeout(() => focusLessonContent(), 0)
      } else {
        focusLessonContent()
      }
    },
    [focusLessonContent, lab],
  )

  const closeLabToLesson = useCallback(() => {
    setLabOpen(false)
    if (typeof window !== 'undefined') {
      window.history.replaceState(null, '', returnStepHash.current || '#step-1')
    }
    focusLessonContent()
  }, [focusLessonContent])

  const closeLabToStep = useCallback((stepNumber: number) => {
    const hash = `#step-${stepNumber}`
    returnStepHash.current = hash
    setLabOpen(false)
    if (typeof window !== 'undefined') {
      window.history.replaceState(null, '', hash)
    }
  }, [])

  const closeLabToNotebook = useCallback((alreadyOpenInFlow: boolean) => {
    setLabOpen(false)
    if (alreadyOpenInFlow && typeof window !== 'undefined') {
      window.history.replaceState(null, '', '#student-notebook')
    }
  }, [])

  const closeLabSilently = useCallback(() => {
    setLabOpen(false)
  }, [])

  const value = useMemo<LessonLabContextValue | null>(() => {
    if (!lab) return null
    return {
      lab,
      labOpen,
      labMounted,
      openLab,
      closeLabToLesson,
      closeLabToStep,
      closeLabToNotebook,
      closeLabSilently,
    }
  }, [
    closeLabSilently,
    closeLabToLesson,
    closeLabToNotebook,
    closeLabToStep,
    lab,
    labMounted,
    labOpen,
    openLab,
  ])

  return <LessonLabContext.Provider value={value}>{children}</LessonLabContext.Provider>
}
