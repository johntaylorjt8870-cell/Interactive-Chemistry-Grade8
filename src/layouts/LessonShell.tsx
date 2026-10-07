import type { ReactNode } from 'react'
import { RtlRun } from '@/components/BidiText'

export type LessonShellProps = {
  /** Breadcrumb trail, rendered at the top of the lesson rail. */
  breadcrumb?: ReactNode
  title: string
  /** What the lesson covers, taken from the lesson definition. */
  description?: ReactNode
  /** Line about the step that is currently open (kind + intention). */
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
  /** Step outline: the rail's own list on desktop, the drawer's list on mobile. */
  outline: ReactNode
  /** The step content (one step at a time) and the previous/next navigation. */
  children: ReactNode
  /** Previous / next navigation, rendered with the step. */
  navigation: ReactNode
  /** Compact outline opener for narrow screens; lives in the rail. */
  mobileOutlineTrigger?: ReactNode
}

/**
 * Lesson layout — one rail, no header band.
 *
 * The lesson page owns no header of its own. Everything that used to sit in a
 * full-width band above the content now lives in a single rail element:
 *
 * - **Desktop**: the rail is a sticky column beside the content column. The
 *   lesson starts directly under the site header, and the step content — the
 *   experiments, figures and tables — gets the whole remaining surface.
 * - **Narrow screens**: the very same rail collapses into a one-line compact
 *   bar (title, step counter, an accessible drawer trigger and a slim progress
 *   line) at the top of the content flow. Nothing is reserved above the step,
 *   and the full outline plus the lesson information move into the drawer.
 *
 * One element renders both presentations, so the lesson keeps exactly one
 * `h1`, one progressbar and one outline landmark at any breakpoint. The
 * content column keeps its own `region` landmark, and the drawer keeps its
 * `dialog` semantics (see `Drawer` and `LessonFlow`).
 */
export function LessonShell({
  breadcrumb,
  title,
  description,
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
      <div className="container container--lesson lesson-shell__body">
        <aside className="lesson-shell__rail" aria-label="مخطط الدرس">
          <div className="lesson-rail__identity">
            {breadcrumb ? <div className="lesson-rail__breadcrumb">{breadcrumb}</div> : null}
            <div className="lesson-rail__title-row">
              <h1 className="lesson-rail__title">{title}</h1>
              {mobileOutlineTrigger ? (
                <div className="lesson-shell__mobile-trigger">{mobileOutlineTrigger}</div>
              ) : null}
            </div>
            {description ? <p className="lesson-rail__description">{description}</p> : null}
            {subtitle ? <p className="lesson-rail__subtitle">{subtitle}</p> : null}
          </div>

          <div className="lesson-rail__progress">
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
            <p className="lesson-rail__progress-label">
              <RtlRun className="lesson-rail__steps">
                الخطوة {progress.current} من {progress.total}
              </RtlRun>
              {progress.visited !== undefined ? (
                <RtlRun className="lesson-rail__visited">
                  زُرت {progress.visited} من {progress.total}
                </RtlRun>
              ) : null}
            </p>
          </div>

          <div className="lesson-rail__outline">{outline}</div>
        </aside>

        <section
          className="lesson-shell__main"
          id="lesson-content"
          tabIndex={-1}
          role="region"
          aria-label="محتوى الدرس"
        >
          {children}
          <div className="lesson-shell__nav">{navigation}</div>
        </section>
      </div>
    </div>
  )
}
