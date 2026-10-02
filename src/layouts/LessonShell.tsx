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
 * Desktop: content column + a small persistent outline column (about 15% of
 * the viewport — lesson content first, navigation second). Narrow screens: the
 * outline moves into an accessible drawer opened from the header.
 *
 * The sticky header is ONE slim row (about 45px): the lesson title and the
 * step-context chip on the start side, the position in the lesson on the end
 * side. The breadcrumb is a small line above it that scrolls away with the page,
 * so it costs no reading height once the student starts working. Visit counts
 * live in the outline, next to the list they describe.
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
  // The bar shows the position the label announces (step N of M), so the visual
  // bar, the aria values and the text can never disagree.
  const percent = progress.total === 0 ? 0 : Math.round((progress.current / progress.total) * 100)

  return (
    <div className="lesson-shell">
      {breadcrumb ? (
        <div className="container lesson-shell__crumbs">
          <div className="lesson-shell__breadcrumb">{breadcrumb}</div>
        </div>
      ) : null}
      <div className="lesson-shell__header">
        <div className="container lesson-shell__header-inner">
          {mobileOutlineTrigger ? <div className="lesson-shell__mobile-trigger">{mobileOutlineTrigger}</div> : null}
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
            </p>
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
