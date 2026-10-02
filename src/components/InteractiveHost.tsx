import { ScientificNotationText } from '@/scientific'
import { Suspense, lazy, useMemo } from 'react'
import type { ComponentType } from 'react'
import { getInteractive, type InteractiveProps } from '@/simulations/registry'
import { useReducedMotion } from '@/hooks/useReducedMotion'

export type InteractiveHostProps = {
  interactiveId: string
  /** Caption shown beneath the interactive, supplied by the lesson author. */
  caption?: string
}

/**
 * Mounts a registered interactive (experiment / simulation / activity) by id.
 *
 * The module is loaded lazily on first render of the step, `prefers-reduced-motion`
 * is passed down so modules can switch to a static representation, and an
 * unregistered id produces an explicit, non-decorative message instead of a
 * broken empty box.
 */
export function InteractiveHost({ interactiveId, caption }: InteractiveHostProps) {
  const reducedMotion = useReducedMotion()
  const definition = useMemo(() => getInteractive(interactiveId), [interactiveId])

  // The lazy component must be created once per definition: building it inside
  // the render body made React see a brand-new component type on every parent
  // re-render (opening the outline drawer, saving progress…), which unmounted
  // the experiment and silently reset every slider and construction stage.
  const LazyModule = useMemo(
    () =>
      definition
        ? lazy(async () => {
            const module = await definition.load()
            return { default: module.default as ComponentType<InteractiveProps> }
          })
        : null,
    [definition],
  )

  if (!definition || !LazyModule) {
    return (
      <div className="interactive-missing" role="note" data-interactive-missing={interactiveId}>
        <p className="interactive-missing__title">عنصر تفاعلي غير مُسجَّل</p>
        <p className="interactive-missing__body">
          المعرّف <code dir="ltr">{interactiveId}</code> غير موجود في سجل العناصر التفاعلية. لن يُعرض
          عنصر بديل مُصطنع.
        </p>
      </div>
    )
  }

  return (
    <div className="interactive-host" data-interactive={interactiveId} data-interactive-kind={definition.kind}>
      <Suspense
        fallback={
          <div className="interactive-host__loading" role="status">
            <span className="spinner" aria-hidden="true" />
            <span>جارٍ تحميل {definition.title}…</span>
          </div>
        }
      >
        <LazyModule interactiveId={interactiveId} reducedMotion={reducedMotion} />
      </Suspense>
      {caption ? (
        <p className="interactive-host__caption">
          <ScientificNotationText as="span">{caption}</ScientificNotationText>
        </p>
      ) : null}
    </div>
  )
}
