import { useEffect, useRef } from 'react'
import { ScientificNotationText } from '@/scientific'
import { FlaskGlyph, NotebookGlyph } from '@/components/Icons'
import { useLessonLab } from '@/labs/LessonLabContext'
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
  /** Optional independent supplement, before the unchanged final notebook tab. */
  extra?: { open: boolean; onSelect: () => void }
  /** Optional independent interactive lab tab, rendered before the final notebook tab. */
  lab?: { title: string; open: boolean; onSelect: () => void }
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
  extra,
  lab,
}: LessonOutlineProps) {
  const seen = new Set(seenStepIds)
  const currentRef = useRef<HTMLButtonElement>(null)
  const labCtx = useLessonLab()
  const resolvedLab =
    lab ??
    (labCtx && labCtx.lab.lessonId === lesson.id
      ? {
          title: labCtx.lab.tabTitle,
          open: labCtx.labOpen,
          onSelect: () => labCtx.openLab({ fromDrawer: variant === 'drawer' }),
        }
      : undefined)
  const effectiveCurrentIndex = resolvedLab?.open ? -1 : currentIndex

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
          const isCurrent = index === effectiveCurrentIndex
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
                onClick={() => {
                  if (resolvedLab?.open) {
                    labCtx?.closeLabToStep(index + 1)
                  }
                  onSelect?.(index)
                }}
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
        {extra ? (
          <li className="lesson-outline__item lesson-outline__item--extra">
            <button
              type="button"
              className="lesson-outline__button"
              data-current={extra.open && !resolvedLab?.open ? 'true' : undefined}
              data-tab="extra"
              aria-current={extra.open && !resolvedLab?.open ? 'page' : undefined}
              onClick={() => {
                labCtx?.closeLabSilently()
                extra.onSelect()
              }}
            >
              <span className="lesson-outline__index" aria-hidden="true">+</span>
              <span className="lesson-outline__text">
                <span className="lesson-outline__title">إضافي</span>
                <span className="lesson-outline__meta">
                  <span className="lesson-outline__kind">محتوى السبورة</span>
                  <span className="lesson-outline__status">
                    {extra.open && !resolvedLab?.open ? 'مفتوح' : 'مرجع إضافي'}
                  </span>
                </span>
              </span>
            </button>
          </li>
        ) : null}
        {resolvedLab ? (
          <li className="lesson-outline__item lesson-outline__item--lab">
            <button
              type="button"
              className="lesson-outline__button lesson-outline__button--lab"
              data-current={resolvedLab.open ? 'true' : undefined}
              data-tab="lab"
              aria-current={resolvedLab.open ? 'page' : undefined}
              onClick={resolvedLab.onSelect}
            >
              <span className="lesson-outline__index" aria-hidden="true">
                <FlaskGlyph size={16} />
              </span>
              <span className="lesson-outline__text">
                <span className="lesson-outline__title">
                  <span>{resolvedLab.title}</span>
                </span>
                <span className="lesson-outline__meta">
                  <span className="lesson-outline__kind">مخبر تفاعلي</span>
                  <span className="lesson-outline__status">
                    {resolvedLab.open ? 'مفتوح' : 'تطبيق عملي'}
                  </span>
                </span>
              </span>
            </button>
          </li>
        ) : null}
        {notebook ? (
          <li className="lesson-outline__item lesson-outline__item--notebook">
            <button
              type="button"
              className="lesson-outline__button lesson-outline__button--notebook"
              data-current={notebook.open && !resolvedLab?.open ? 'true' : undefined}
              data-tab="notebook"
              aria-current={notebook.open && !resolvedLab?.open ? 'page' : undefined}
              onClick={() => {
                labCtx?.closeLabToNotebook(notebook.open)
                notebook.onSelect()
              }}
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
                    {notebook.open && !resolvedLab?.open ? 'مفتوح' : 'آخر تبويب'}
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
