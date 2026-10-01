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
    ratio: number
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
              aria-valuenow={progress.current}
              aria-label={`الخطوة ${progress.current} من ${progress.total}`}
            >
              <div className="progress__track">
                <div className="progress__bar" style={{ inlineSize: `${percent}%` }} />
              </div>
            </div>
            <p className="lesson-shell__progress-label">
              الخطوة {progress.current} من {progress.total}
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
