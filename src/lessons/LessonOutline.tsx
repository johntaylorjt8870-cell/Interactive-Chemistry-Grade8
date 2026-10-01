import { STEP_KIND_META } from './stepKinds'
import type { LessonDefinition } from '@/data/curriculum/schema'

export type LessonOutlineProps = {
  lesson: LessonDefinition
  currentIndex: number
  onSelect?: (index: number) => void
  seenStepIds?: string[]
  /** `sidebar` is the desktop outline; `drawer` is used inside the mobile drawer. */
  variant?: 'sidebar' | 'drawer'
}

/**
 * Persistent lesson outline: teaches the student where they are, what the step
 * is for, and how much is left. Entries are real buttons (keyboard reachable),
 * the current step is marked with `aria-current="step"`, and visited steps are
 * marked with text and a glyph — never with colour alone.
 */
export function LessonOutline({
  lesson,
  currentIndex,
  onSelect,
  seenStepIds = [],
  variant = 'sidebar',
}: LessonOutlineProps) {
  const seen = new Set(seenStepIds)

  return (
    <nav
      className={['lesson-outline', `lesson-outline--${variant}`].filter(Boolean).join(' ')}
      aria-label="خطوات الدرس"
    >
      <ol className="lesson-outline__list">
        {lesson.steps.map((step, index) => {
          const meta = STEP_KIND_META[step.kind]
          const isCurrent = index === currentIndex
          const isSeen = seen.has(step.id)
          const status = isCurrent ? 'الحالية' : isSeen ? 'تمت زيارتها' : 'لم تُفتح بعد'

          return (
            <li key={step.id} className="lesson-outline__item">
              <button
                type="button"
                className="lesson-outline__button"
                data-current={isCurrent ? 'true' : undefined}
                data-seen={isSeen ? 'true' : undefined}
                aria-current={isCurrent ? 'step' : undefined}
                onClick={() => onSelect?.(index)}
                disabled={!onSelect}
              >
                <span className="lesson-outline__index" aria-hidden="true">
                  {index + 1}
                </span>
                <span className="lesson-outline__text">
                  <span className="lesson-outline__title">{step.title}</span>
                  <span className="lesson-outline__meta">
                    <span className="lesson-outline__kind">{meta.label}</span>
                    <span className="lesson-outline__status">{status}</span>
                  </span>
                </span>
                {isSeen && !isCurrent ? (
                  <span className="lesson-outline__check" aria-hidden="true">
                    ✓
                  </span>
                ) : null}
              </button>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
