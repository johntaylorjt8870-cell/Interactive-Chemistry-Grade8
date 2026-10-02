import type { ReactNode } from 'react'
import { useId } from 'react'
import { DiagramDefs } from '@/scientific'

/** Keep short scientific labels in a single LTR isolate inside Arabic prose. */
export function LabSymbol({ children }: { children: ReactNode }) {
  return <bdi dir="ltr" className="physics-lab__symbol">{children}</bdi>
}

export type PhysicsLabArrowKey = 'f1' | 'f2' | 'weight' | 'resultant' | 'normal' | 'source'
export type PhysicsLabArrowIds = Record<PhysicsLabArrowKey, string>

const ARROW_KEYS: PhysicsLabArrowKey[] = ['f1', 'f2', 'weight', 'resultant', 'normal', 'source']

/**
 * Namespaced markers keep several interactive diagrams safe on the same page.
 * The local arrowheads use semantic theme tokens with light/dark fallbacks;
 * they do not alter the shared scientific-vector notation primitives.
 */
export function usePhysicsLabArrowIds(prefix: string): PhysicsLabArrowIds {
  const reactId = useId().replace(/[^a-zA-Z0-9_-]/g, '')
  return Object.fromEntries(ARROW_KEYS.map((key) => [key, `${prefix}-${reactId}-${key}`])) as PhysicsLabArrowIds
}

const ARROWHEAD_CLASS: Record<PhysicsLabArrowKey, string> = {
  f1: 'physics-lab-arrowhead--f1',
  f2: 'physics-lab-arrowhead--f2',
  weight: 'physics-lab-arrowhead--weight',
  resultant: 'physics-lab-arrowhead--resultant',
  normal: 'physics-lab-arrowhead--normal',
  source: 'physics-lab-arrowhead--source',
}

export function PhysicsLabDefs({ arrows }: { arrows: PhysicsLabArrowIds }) {
  return (
    <>
      <DiagramDefs />
      <defs>
        {ARROW_KEYS.map((key) => (
          <marker
            key={key}
            id={arrows[key]}
            viewBox="0 0 10 10"
            refX="8.5"
            refY="5"
            markerWidth="11"
            markerHeight="11"
            markerUnits="userSpaceOnUse"
            orient="auto-start-reverse"
          >
            <path className={`physics-lab-arrowhead ${ARROWHEAD_CLASS[key]}`} d="M 0 0 L 10 5 L 0 10 z" />
          </marker>
        ))}
      </defs>
    </>
  )
}
