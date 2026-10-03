import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { LessonShell } from '@/layouts/LessonShell'
import { LessonOutline } from './LessonOutline'
import { getStepRenderer } from './stepRenderers'
import { STEP_KIND_META } from './stepKinds'
import { Drawer } from '@/components/Drawer'
import { LiveStatus } from '@/components/LiveStatus'
import { ArrowEndGlyph, ArrowStartGlyph, CheckGlyph, ListGlyph } from '@/components/Icons'
import { computeLessonProgress, useLessonProgress } from '@/data/progress'
import type { LessonDefinition } from '@/data/curriculum/schema'

export type LessonFlowProps = {
  lesson: LessonDefinition
  breadcrumb?: ReactNode
  /** Step id or 1-based index to open first; defaults to the URL hash. */
  initialStepId?: string
  renderQuestion?: (questionId: string) => ReactNode
  renderDiagram?: (diagramId: string, description: string) => ReactNode
  renderTest?: (testId: string) => ReactNode
  /** Called when the student reaches the end of the lesson. */
  onCompleted?: () => void
  /** Renders an action area in the final step (e.g. "back to unit"). */
  finishAction?: ReactNode
}

function stepIndexFromHash(lesson: LessonDefinition, hash: string): number | null {
  const raw = hash.replace(/^#/, '')
  if (!raw) return null
  const byPosition = Number(raw.replace(/^step-?/, ''))
  if (Number.isInteger(byPosition) && byPosition >= 1 && byPosition <= lesson.steps.length) {
    return byPosition - 1
  }
  const index = lesson.steps.findIndex((step) => step.id === raw)
  return index >= 0 ? index : null
}

/**
 * Lesson engine: shows one meaningful step at a time and keeps the student
 * oriented with a persistent outline, a real step counter and honest progress.
 *
 * The current step is reflected in the URL hash, so a lesson step can be
 * bookmarked and shared, and the browser back button keeps working.
 */
export function LessonFlow({
  lesson,
  breadcrumb,
  initialStepId,
  renderQuestion,
  renderDiagram,
  renderTest,
  onCompleted,
  finishAction,
}: LessonFlowProps) {
  const total = lesson.steps.length

  const [currentIndex, setCurrentIndex] = useState(() => {
    if (total === 0) return 0
    if (initialStepId) {
      const byId = lesson.steps.findIndex((step) => step.id === initialStepId)
      if (byId >= 0) return byId
    }
    if (typeof window !== 'undefined') {
      const fromHash = stepIndexFromHash(lesson, window.location.hash)
      if (fromHash !== null) return fromHash
    }
    return 0
  })
  const [drawerOpen, setDrawerOpen] = useState(false)
  const focusContentAfterDrawer = useRef(false)

  const { seenStepIds, markStepSeen, setCompleted } = useLessonProgress(lesson.id)
  const progress = useMemo(
    () => computeLessonProgress(lesson, { seenStepIds, completed: false, updatedAt: '' }),
    [lesson, seenStepIds],
  )

  const currentStep = lesson.steps[currentIndex]
  const isLast = currentIndex === total - 1

  // Record visited steps so the outline can report honest progress.
  useEffect(() => {
    if (!currentStep) return
    markStepSeen(currentStep.id)
    if (typeof window !== 'undefined') {
      const nextHash = `#step-${currentIndex + 1}`
      if (window.location.hash !== nextHash) {
        window.history.replaceState(null, '', nextHash)
      }
    }
  }, [currentStep, currentIndex, lesson.id, markStepSeen])

  const goTo = useCallback(
    (index: number) => {
      if (index < 0 || index >= total) return
      setCurrentIndex(index)

      // Closing the drawer hands focus back to the trigger that opened it. When
      // the student chose a step, the step that is now displayed has to receive
      // focus instead — otherwise a keyboard or screen-reader user is dropped
      // back on «خطوات الدرس» with no sign that the step changed. The drawer
      // restores focus while it unmounts, so the move happens after it closed.
      focusContentAfterDrawer.current = drawerOpen
      setDrawerOpen(false)

      if (!drawerOpen && typeof document !== 'undefined') {
        document.getElementById('lesson-content')?.focus?.()
      }
    },
    [drawerOpen, total],
  )

  // Runs after the drawer's own focus restore, so the new step wins.
  useEffect(() => {
    if (drawerOpen || !focusContentAfterDrawer.current) return
    focusContentAfterDrawer.current = false
    if (typeof document !== 'undefined') {
      document.getElementById('lesson-content')?.focus?.()
    }
  }, [drawerOpen])

  const handleFinish = useCallback(() => {
    setCompleted(true)
    onCompleted?.()
  }, [onCompleted, setCompleted])

  if (!currentStep) {
    return (
      <div className="container lesson-shell__empty">
        <div className="empty-state">
          <p className="empty-state__title">لا توجد خطوات في هذا الدرس</p>
          <p className="empty-state__body">لم تُضَف خطوات الدرس بعد. لن تُعرض خطوات مُصطنعة.</p>
        </div>
      </div>
    )
  }

  const meta = STEP_KIND_META[currentStep.kind]
  const StepRenderer = getStepRenderer(currentStep.kind)
  const isFinalStep = currentStep.kind === 'final-test'

  // Announced when the step changes, so the student learns *where* they landed
  // and not only that the counter moved. Mount state stays silent.
  const stepAnnouncement = `الخطوة ${currentIndex + 1} من ${total}: ${currentStep.title}`

  return (
    <>
      <LessonShell
        breadcrumb={breadcrumb}
        title={lesson.title}
        description={lesson.summary}
        subtitle={`${meta.label}: ${meta.intention}`}
        progress={{
          current: currentIndex + 1,
          total,
          ratio: total === 0 ? 0 : progress.seen / total,
          visited: progress.seen,
        }}
        outline={
          <LessonOutline
            lesson={lesson}
            currentIndex={currentIndex}
            onSelect={goTo}
            seenStepIds={seenStepIds}
          />
        }
        mobileOutlineTrigger={
          <button
            type="button"
            className="button button--quiet button--small lesson-shell__outline-trigger"
            onClick={() => setDrawerOpen(true)}
            aria-haspopup="dialog"
            aria-expanded={drawerOpen}
          >
            <ListGlyph size={18} />
            <span>خطوات الدرس</span>
          </button>
        }
        navigation={
          <div className="lesson-nav">
            <button
              type="button"
              className="button button--secondary"
              onClick={() => goTo(currentIndex - 1)}
              disabled={currentIndex === 0}
            >
              <ArrowEndGlyph size={17} />
              <span>السابق</span>
            </button>

            {isLast || isFinalStep ? (
              <button type="button" className="button button--primary" onClick={handleFinish}>
                <CheckGlyph size={17} />
                <span>إنهاء الدرس</span>
              </button>
            ) : (
              <button type="button" className="button button--primary" onClick={() => goTo(currentIndex + 1)}>
                <span>التالي</span>
                <ArrowStartGlyph size={17} />
              </button>
            )}
          </div>
        }
      >
        <LiveStatus message={stepAnnouncement} delayMs={0} />
        <StepRenderer
          step={currentStep}
          meta={meta}
          renderQuestion={renderQuestion}
          renderDiagram={renderDiagram}
          renderTest={renderTest}
        />
        {isLast && finishAction ? <div className="lesson-shell__finish">{finishAction}</div> : null}
      </LessonShell>

      <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)} title="خطوات الدرس" side="start">
        {/* On narrow screens this drawer is the only place where the lesson
            identity and the progress counters are shown, so it carries them
            together with the outline instead of showing the outline alone. */}
        <div className="drawer-lesson">
          {breadcrumb ? <div className="drawer-lesson__breadcrumb">{breadcrumb}</div> : null}
          <p className="drawer-lesson__title">{lesson.title}</p>
          {lesson.summary ? <p className="drawer-lesson__summary">{lesson.summary}</p> : null}
          <p className="drawer-lesson__progress">
            الخطوة {currentIndex + 1} من {total} · زُرت {progress.seen} من {total}
          </p>
          <p className="drawer-lesson__step">
            {meta.label}: {meta.intention}
          </p>
        </div>
        <LessonOutline
          lesson={lesson}
          currentIndex={currentIndex}
          onSelect={goTo}
          seenStepIds={seenStepIds}
          variant="drawer"
        />
      </Drawer>
    </>
  )
}
