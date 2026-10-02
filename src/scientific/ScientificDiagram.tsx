import type { ReactNode } from 'react'

export type ScientificDiagramProps = {
  /** Short title shown above the drawing. */
  title?: ReactNode
  /** Accessible description — required, so no diagram is ever unlabelled. */
  description: string
  /** Textbook reference for the drawing, when one is known. Never invented. */
  sourceRef?: string
  caption?: ReactNode
  /** SVG viewBox of the drawing surface. */
  viewBox?: string
  /** Drawing content (SVG children). */
  children?: ReactNode
  className?: string
  /** True when the drawing responds to input (simulations, experiments). */
  interactive?: boolean
  /** Extra content rendered beside the drawing (controls, legends). */
  aside?: ReactNode
}

/**
 * Standard frame for every scientific drawing in the platform: vector-based,
 * labelled, and consistent across lessons.
 *
 * Drawings are SVG by default — never oversized raster images — and always
 * carry an accessible description. When a textbook figure is too unclear to
 * reproduce faithfully, lessons link the source scan through this frame
 * instead of guessing (see docs/SOURCE_FIDELITY.md).
 */
export function ScientificDiagram({
  title,
  description,
  sourceRef,
  caption,
  viewBox = '0 0 400 240',
  children,
  className,
  interactive = false,
  aside,
}: ScientificDiagramProps) {
  return (
    <figure
      className={['diagram', interactive ? 'diagram--interactive' : null, className].filter(Boolean).join(' ')}
      data-diagram-surface
    >
      {title || sourceRef ? (
        <header className="diagram__header">
          {title ? <h4 className="diagram__title">{title}</h4> : null}
          {sourceRef ? <span className="diagram__source">{sourceRef}</span> : null}
        </header>
      ) : null}
      <div className="diagram__body">
        <div className="diagram__surface">
          <svg
            className="diagram__svg"
            viewBox={viewBox}
            role="img"
            aria-label={description}
            preserveAspectRatio="xMidYMid meet"
            data-diagram-svg="true"
          >
            <DiagramDefs />
            {children}
          </svg>
        </div>
        {aside ? <div className="diagram__aside">{aside}</div> : null}
      </div>
      {caption ? <figcaption className="diagram__caption">{caption}</figcaption> : null}
    </figure>
  )
}

/**
 * Shared SVG definitions (grid pattern, legacy arrow markers) available to
 * every drawing so vectors and grids look identical throughout the platform.
 *
 * Arrowheads on vectors are NOT drawn with markers: the marker fill keyword
 * `context-stroke` (the only DRY way to colour a marker from its referencing
 * line) is still unsupported in WebKit, which silently produced black,
 * theme-clashing heads.
 * `VectorArrow` below draws each head as explicit filled geometry instead —
 * deterministic in every browser and inspectable in the DOM. The markers kept
 * here exist for custom author content and are filled with `currentColor` plus
 * a per-role CSS class so they can never render invisible.
 */
export function DiagramDefs() {
  return (
    <defs>
      <marker
        id="diagram-arrow"
        viewBox="0 0 10 10"
        refX="9"
        refY="5"
        markerWidth="6"
        markerHeight="6"
        orient="auto-start-reverse"
      >
        <path d="M 0 0 L 10 5 L 0 10 z" className="diagram-arrow-head diagram-arrow-head--default" />
      </marker>
      <marker
        id="diagram-arrow-muted"
        viewBox="0 0 10 10"
        refX="9"
        refY="5"
        markerWidth="6"
        markerHeight="6"
        orient="auto-start-reverse"
      >
        <path d="M 0 0 L 10 5 L 0 10 z" className="diagram-arrow-head diagram-arrow-head--muted" />
      </marker>
      <pattern id="diagram-grid" width="20" height="20" patternUnits="userSpaceOnUse">
        <path d="M 20 0 L 0 0 0 20" fill="none" stroke="currentColor" strokeOpacity="0.14" strokeWidth="1" />
      </pattern>
    </defs>
  )
}

/* ============================================================================
   VectorArrow — the platform's force-vector primitive.
   ----------------------------------------------------------------------------
   A real shaft plus a real filled arrowhead drawn as explicit geometry
   (triangle along the shaft direction). The semantic `role` selects the
   colour through design tokens (`--vec-force1`, `--vec-resultant`, …) via
   CSS classes on both parts, so the head can never desynchronise from the
   shaft and never depends on marker support. Colour is always paired with a
   label — see `VectorSvgLabel`.
   ========================================================================= */

export type VectorRole =
  | 'force1'
  | 'force2'
  | 'resultant'
  | 'weight'
  | 'component1'
  | 'component2'
  | 'reaction'
  | 'construction'
  | 'neutral'

export type VectorArrowProps = {
  x1: number
  y1: number
  x2: number
  y2: number
  /** Semantic colour role (design tokens). Paired with labels, never alone. */
  role?: VectorRole
  /** Shaft line style: `solid` (forces) or `dashed` (translated copies). */
  lineStyle?: 'solid' | 'dashed'
  /** Arrowhead length in viewBox units. */
  headSize?: number
  strokeWidth?: number
  /** Marks an animated draw-on group (respects reduced motion via CSS). */
  animated?: boolean
  className?: string
  /** Accessible name for the whole vector, when meaningful. */
  label?: string
  children?: ReactNode
}

function arrowHeadPath(x1: number, y1: number, x2: number, y2: number, headSize: number) {
  const dx = x2 - x1
  const dy = y2 - y1
  const length = Math.hypot(dx, dy) || 1
  const ux = dx / length
  const uy = dy / length
  const head = Math.min(headSize, length * 0.6)
  // Pull the shaft back so line and head meet at the head's base, not its tip.
  const baseX = x2 - ux * head * 0.92
  const baseY = y2 - uy * head * 0.92
  const halfWidth = head * 0.4
  const px = -uy * halfWidth
  const py = ux * halfWidth
  return {
    shaft: { x2: baseX, y2: baseY },
    head: `M ${x2} ${y2} L ${baseX + px} ${baseY + py} L ${baseX - px} ${baseY - py} Z`,
  }
}

export function VectorArrow({
  x1,
  y1,
  x2,
  y2,
  role = 'neutral',
  lineStyle = 'solid',
  headSize = 11,
  strokeWidth,
  animated = false,
  className,
  label,
  children,
}: VectorArrowProps) {
  const geometry = arrowHeadPath(x1, y1, x2, y2, headSize)
  return (
    <g
      className={['diagram-vector', `diagram-vector--${role}`, lineStyle === 'dashed' ? 'diagram-vector--dashed' : null, animated ? 'diagram-vector--animated' : null, className]
        .filter(Boolean)
        .join(' ')}
      data-vector-arrow={role}
      data-arrow-head="true"
      {...(label ? { role: 'img', 'aria-label': label } : {})}
    >
      <line
        className="diagram-vector__shaft"
        x1={x1}
        y1={y1}
        x2={geometry.shaft.x2}
        y2={geometry.shaft.y2}
        {...(strokeWidth !== undefined ? { strokeWidth } : {})}
      />
      <path className="diagram-vector__head" d={geometry.head} />
      {children}
    </g>
  )
}

export type DiagramVectorProps = {
  x1: number
  y1: number
  x2: number
  y2: number
  /** Semantic tone — always paired with a legend label, never colour alone. */
  tone?: 'accent' | 'support' | 'muted' | 'danger'
  label?: string
  dashed?: boolean
  arrow?: boolean
}

const TONE_TO_ROLE: Record<NonNullable<DiagramVectorProps['tone']>, VectorRole> = {
  accent: 'force1',
  support: 'force2',
  muted: 'construction',
  danger: 'weight',
}

/** A vector arrow. Drawn as a real SVG shaft with an explicit arrowhead. */
export function DiagramVector({ x1, y1, x2, y2, tone = 'accent', label, dashed = false, arrow = true }: DiagramVectorProps) {
  const role = TONE_TO_ROLE[tone]
  if (!arrow) {
    return (
      <g className={`diagram-vector diagram-vector--${role}`} data-tone={tone}>
        <line
          x1={x1}
          y1={y1}
          x2={x2}
          y2={y2}
          className="diagram-vector__shaft"
          strokeDasharray={dashed ? '6 5' : undefined}
        />
        {label ? (
          <text x={(x1 + x2) / 2} y={(y1 + y2) / 2 - 6} className="diagram-vector__label" textAnchor="middle">
            {label}
          </text>
        ) : null}
      </g>
    )
  }
  return (
    <VectorArrow x1={x1} y1={y1} x2={x2} y2={y2} role={role} lineStyle={dashed ? 'dashed' : 'solid'}>
      {label ? (
        <text x={(x1 + x2) / 2} y={(y1 + y2) / 2 - 6} className="diagram-vector__label" textAnchor="middle">
          {label}
        </text>
      ) : null}
    </VectorArrow>
  )
}

export type DiagramLegendItem = {
  label: ReactNode
  /** Shape carries meaning alongside colour. */
  shape?: 'line' | 'dot' | 'square' | 'dash'
  tone?: 'accent' | 'support' | 'muted' | 'danger'
  description?: string
}

/** Legend where every entry pairs a shape with a label — never colour alone. */
export function DiagramLegend({ items, title }: { items: DiagramLegendItem[]; title?: ReactNode }) {
  return (
    <div className="diagram-legend" role="list" aria-label={typeof title === 'string' ? title : undefined}>
      {title ? <p className="diagram-legend__title">{title}</p> : null}
      {items.map((item, index) => (
        <span className="diagram-legend__item" role="listitem" key={index} data-shape={item.shape ?? 'line'}>
          <span
            className={`diagram-legend__swatch diagram-legend__swatch--${item.shape ?? 'line'} diagram-legend__swatch--${
              item.tone ?? 'accent'
            }`}
            aria-hidden="true"
          />
          <span className="diagram-legend__label">{item.label}</span>
          {item.description ? (
            <span className="diagram-legend__description">{item.description}</span>
          ) : null}
        </span>
      ))}
    </div>
  )
}
