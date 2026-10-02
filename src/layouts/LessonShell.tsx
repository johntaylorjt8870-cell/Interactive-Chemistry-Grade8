import type { ReactNode } from 'react'

export type LessonShellProps = {
  /** Breadcrumb trail rendered above the lesson title. */
  breadcrumb?: ReactNode
  title: string
  /** Compact step-context chip (kind of the current step). */
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
  /** Mobile-only outline opener, rendered in the header topline. */
  mobileOutlineTrigger?: ReactNode
}

/**
 * Lesson layout.
 *
 * Desktop: content column + a compact persistent outline column (around a
 * fifth of the layout — lesson content first, navigation second). Mobile: a
 * compact header with an accessible drawer for the outline (never a squeezed
 * copy of the desktop layout).
 *
 * The header is deliberately shallow: breadcrumb and outline trigger share one
 * thin line, then title + step-context chip + progress share the next line, so
 * the student keeps the maximum reading area while still knowing the lesson,
 * the current section and how far they have come.
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

  return (
    <div className="lesson-shell">
      <div className="lesson-shell__header">
        <div className="container lesson-shell__header-inner">
          <div className="lesson-shell__topline">
            {breadcrumb ? <div className="lesson-shell__breadcrumb">{breadcrumb}</div> : <span />}
            {mobileOutlineTrigger ? (
              <div className="lesson-shell__mobile-trigger">{mobileOutlineTrigger}</div>
            ) : null}
          </div>
          <div className="lesson-shell__title-row">
            <div className="lesson-shell__title-block">
              <h1 className="lesson-shell__title">{title}</h1>
              {subtitle ? <p className="lesson-shell__subtitle">{subtitle}</p> : null}
            </div>
            <div className="lesson-shell__progress">
              <div
                className="progress"
                role="progressbar"
                aria-valuemin={0}
                aria-valuemax={progress.total}
                aria-valuenow={progress.current}
                aria-label={`الخطوة ${progress.current} من ${progress.total}`}
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
      </div>

      <div className="container lesson-shell__body">
        <aside className="lesson-shell__aside">{outline}</aside>
        <main className="lesson-shell__main" id="lesson-content" tabIndex={-1}>
          {children}
          <div className="lesson-shell__nav">{navigation}</div>
        </main>
      </div>
    </div>
  )
}
