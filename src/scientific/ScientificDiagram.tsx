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
 * Shared SVG definitions (arrowheads, grid pattern) available to every drawing
 * so vectors and grids look identical throughout the platform.
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
        <path d="M 0 0 L 10 5 L 0 10 z" fill="context-stroke" />
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
        <path d="M 0 0 L 10 5 L 0 10 z" fill="currentColor" opacity="0.55" />
      </marker>
      <pattern id="diagram-grid" width="20" height="20" patternUnits="userSpaceOnUse">
        <path d="M 20 0 L 0 0 0 20" fill="none" stroke="currentColor" strokeOpacity="0.14" strokeWidth="1" />
      </pattern>
    </defs>
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

/** A vector arrow. Drawn as a real SVG line with an arrowhead marker. */
export function DiagramVector({
  x1,
  y1,
  x2,
  y2,
  tone = 'accent',
  label,
  dashed = false,
  arrow = true,
}: DiagramVectorProps) {
  return (
    <g className={`diagram-vector diagram-vector--${tone}`} data-tone={tone}>
      <line
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeDasharray={dashed ? '6 5' : undefined}
        markerEnd={arrow ? 'url(#diagram-arrow)' : undefined}
      />
      {label ? (
        <text x={(x1 + x2) / 2} y={(y1 + y2) / 2 - 6} className="diagram-vector__label" textAnchor="middle">
          {label}
        </text>
      ) : null}
    </g>
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
