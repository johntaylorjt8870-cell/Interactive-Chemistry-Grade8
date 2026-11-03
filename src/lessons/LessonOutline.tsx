import { useEffect, useRef } from 'react'
import { ScientificNotationText } from '@/scientific'
import { NotebookGlyph } from '@/components/Icons'
import { STEP_KIND_META } from './stepKinds'
import type { LessonDefinition } from '@/data/curriculum/schema'

export type LessonOutlineProps = {
  lesson: LessonDefinition
  currentIndex: number
  onSelect?: (index: number) => void
  seenStepIds?: string[]
  /** `sidebar` is the desktop outline; `drawer` is used inside the mobile drawer. */
  variant?: 'sidebar' | 'drawer'
  /**
   * Final tab of the lesson («📒 دفتر الطالب»). It is rendered after the last
   * step, in the same list, because it belongs to the lesson's own navigation —
   * not to its counted steps.
   */
  notebook?: { title: string; open: boolean; onSelect: () => void }
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
  notebook,
}: LessonOutlineProps) {
  const seen = new Set(seenStepIds)
  const currentRef = useRef<HTMLButtonElement>(null)

  /**
   * The desktop rail scrolls on its own: a long lesson outline must never
   * push the step content down, and the step the student is on must stay
   * visible in it. `block: 'nearest'` scrolls the rail only — the page itself
   * never moves because of the outline. Skipped in the drawer variant, whose
   * own focus handling decides what is visible.
   */
  useEffect(() => {
    if (variant !== 'sidebar') return
    // jsdom has no layout engine and no `scrollIntoView`, hence the optional call.
    currentRef.current?.scrollIntoView?.({ block: 'nearest', inline: 'nearest' })
  }, [variant, currentIndex])

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
                ref={isCurrent ? currentRef : undefined}
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
                  <span className="lesson-outline__title">
                    <ScientificNotationText as="span">{step.title}</ScientificNotationText>
                  </span>
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
        {notebook ? (
          <li className="lesson-outline__item lesson-outline__item--notebook">
            <button
              type="button"
              className="lesson-outline__button lesson-outline__button--notebook"
              data-current={notebook.open ? 'true' : undefined}
              data-tab="notebook"
              aria-current={notebook.open ? 'page' : undefined}
              onClick={notebook.onSelect}
            >
              <span className="lesson-outline__index" aria-hidden="true">
                <NotebookGlyph size={16} />
              </span>
              <span className="lesson-outline__text">
                <span className="lesson-outline__title">
                  <span>{notebook.title}</span>
                </span>
                <span className="lesson-outline__meta">
                  <span className="lesson-outline__kind">دفتر الطالب</span>
                  <span className="lesson-outline__status">
                    {notebook.open ? 'مفتوح' : 'آخر تبويب'}
                  </span>
                </span>
              </span>
            </button>
          </li>
        ) : null}
      </ol>
    </nav>
  )
}
