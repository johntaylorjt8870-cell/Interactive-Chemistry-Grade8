import { buildLabSandboxAttribute, resolveLabUrl, type LessonLabDefinition } from './registry'

export type LessonLabViewProps = {
  lab: LessonLabDefinition
  hidden?: boolean
}

/**
 * Isolated host frame for an independent lesson lab.
 *
 * Security invariants:
 * - `sandbox` is validated via `buildLabSandboxAttribute` (never includes
 *   `allow-same-origin` or `allow-top-navigation*`, keeping `window.origin === "null"`).
 * - `referrerPolicy="no-referrer"` prevents leaking the platform URL.
 * - `allow=""` denies powerful browser features (camera, microphone, geolocation, etc.).
 * - No Storage Shim is injected unless explicitly authorized for a lab that requires it.
 */
export function LessonLabView({ lab, hidden = false }: LessonLabViewProps) {
  const sandbox = buildLabSandboxAttribute(lab.sandbox)
  const src = resolveLabUrl(lab)

  return (
    <section
      className="lesson-lab"
      data-lab-lesson={lab.lessonId}
      aria-label={lab.frameTitle}
      hidden={hidden}
    >
      <iframe
        className="lesson-lab__frame"
        title={lab.frameTitle}
        src={src}
        sandbox={sandbox}
        referrerPolicy="no-referrer"
        allow=""
      />
    </section>
  )
}
