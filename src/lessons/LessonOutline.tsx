import { STEP_KIND_META } from './stepKinds'
import { CheckGlyph } from '@/components/Icons'
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
 * Persistent lesson outline: tells the student where they are and how much
 * they have visited. It is deliberately compact — a small summary, then one
 * line-height-tight entry per step — so it can stay beside the content at about
 * a seventh of the screen.
 *
 * Entries are real buttons (keyboard reachable) and the current step carries
 * `aria-current="step"`. Status is never colour alone: the index circle shows
 * a number (to do), a filled number (current) or a check mark (visited), and the
 * spoken status text is always present for assistive technology.
 */
export function LessonOutline({
  lesson,
  currentIndex,
  onSelect,
  seenStepIds = [],
  variant = 'sidebar',
}: LessonOutlineProps) {
  const seen = new Set(seenStepIds)
  const total = lesson.steps.length
  const seenCount = lesson.steps.filter((step) => seen.has(step.id)).length
  const seenPercent = total === 0 ? 0 : Math.round((seenCount / total) * 100)

  return (
    <nav
      className={['lesson-outline', `lesson-outline--${variant}`].filter(Boolean).join(' ')}
      aria-label="خطوات الدرس"
    >
      <div className="lesson-outline__summary">
        {variant === 'sidebar' ? <p className="lesson-outline__heading">خطوات الدرس</p> : null}
        <p className="lesson-outline__count">
          زُرت {seenCount} من {total}
        </p>
        <div className="lesson-outline__bar" aria-hidden="true">
          <span style={{ inlineSize: `${seenPercent}%` }} />
        </div>
      </div>
      <ol className="lesson-outline__list">
        {lesson.steps.map((step, index) => {
          const meta = STEP_KIND_META[step.kind]
          const isCurrent = index === currentIndex
          const isSeen = seen.has(step.id)
          const status = isCurrent ? 'الحالية' : isSeen ? 'تمت زيارتها' : 'لم تُفتح بعد'
          // the kind stays in the accessible name; it is only drawn for the current step and in the drawer
          const kindVisible = isCurrent || variant === 'drawer'

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
                  {isSeen && !isCurrent ? <CheckGlyph size={12} /> : index + 1}
                </span>
                <span className="lesson-outline__text">
                  <span className="lesson-outline__title">{step.title}</span>
                  <span className={['lesson-outline__kind', kindVisible ? null : 'visually-hidden'].filter(Boolean).join(' ')}>
                    {meta.label}
                  </span>
                  <span className="lesson-outline__status visually-hidden">{status}</span>
                </span>
              </button>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
