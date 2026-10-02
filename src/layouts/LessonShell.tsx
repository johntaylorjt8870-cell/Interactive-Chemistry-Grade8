import type { ReactNode } from 'react'

export type LessonShellProps = {
  /** Breadcrumb trail rendered above the lesson title. */
  breadcrumb?: ReactNode
  title: string
  subtitle?: ReactNode
  /** Step counter text, e.g. `الخطوة 3 من 9`. */
  progress: {
    current: number
    total: number
    /** Fraction of steps actually visited — never an invented percentage. */
    ratio: number
    /** Number of distinct steps visited so far. */
    visited?: number
  }
  /** Desktop outline column. */
  outline: ReactNode
  /** Mobile outline trigger + the step content. */
  children: ReactNode
  /** Previous / next navigation. */
  navigation: ReactNode
  /** Mobile-only outline opener, rendered next to the title. */
  mobileOutlineTrigger?: ReactNode
}

/**
 * Lesson layout.
 *
 * Desktop: content column + persistent outline column, so the student always
 * sees the shape of the lesson. Mobile: a compact progress bar with an
 * accessible drawer for the outline (never a squeezed copy of the desktop
 * layout).
 */
export function LessonShell({
  breadcrumb,
  title,
  subtitle,
  progress,
  outline,
  children,
  navigation,
  mobileOutlineTrigger,
}: LessonShellProps) {
  const percent = Math.round(progress.ratio * 100)
  const progressValue = progress.visited ?? progress.current

  return (
    <div className="lesson-shell">
      <div className="lesson-shell__header">
        <div className="container lesson-shell__header-inner">
          {breadcrumb ? <div className="lesson-shell__breadcrumb">{breadcrumb}</div> : null}
          <div className="lesson-shell__title-row">
            <div>
              <h1 className="lesson-shell__title">{title}</h1>
              {subtitle ? <p className="lesson-shell__subtitle">{subtitle}</p> : null}
            </div>
            {mobileOutlineTrigger ? (
              <div className="lesson-shell__mobile-trigger">{mobileOutlineTrigger}</div>
            ) : null}
          </div>
          <div className="lesson-shell__progress">
            <div
              className="progress"
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={progress.total}
              aria-valuenow={progressValue}
              aria-valuetext={`زُرت ${progressValue} من ${progress.total} خطوة؛ الخطوة الحالية ${progress.current} من ${progress.total}`}
              aria-label="التقدّم في الدرس"
            >
              <div className="progress__track">
                <div className="progress__bar" style={{ inlineSize: `${percent}%` }} />
              </div>
            </div>
            <p className="lesson-shell__progress-label">
              <span>
                الخطوة {progress.current} من {progress.total}
              </span>
              {progress.visited !== undefined ? (
                <span className="lesson-shell__progress-visited">
                  زُرت {progress.visited} من {progress.total}
                </span>
              ) : null}
            </p>
          </div>
        </div>
      </div>

      <div className="container lesson-shell__body">
        <aside className="lesson-shell__aside" aria-label="مخطط الدرس">{outline}</aside>
        <section className="lesson-shell__main" id="lesson-content" tabIndex={-1} role="region" aria-label="محتوى الدرس">
          {children}
          <div className="lesson-shell__nav">{navigation}</div>
        </section>
      </div>
    </div>
  )
}
