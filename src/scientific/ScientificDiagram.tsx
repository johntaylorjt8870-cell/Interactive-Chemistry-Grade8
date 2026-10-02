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
 * Arrowhead tones. `f1`, `f2`, `w` and `resultant` are the semantic force
 * colours of the vector laboratories (F₁ green, F₂ blue, weight red, resultant
 * accent); the other four are the generic diagram tones.
 */
export type DiagramArrowTone = 'accent' | 'support' | 'muted' | 'danger' | 'f1' | 'f2' | 'w' | 'resultant'

const DIAGRAM_ARROW_TONES: readonly DiagramArrowTone[] = [
  'accent',
  'support',
  'muted',
  'danger',
  'f1',
  'f2',
  'w',
  'resultant',
]

/**
 * Id of the arrowhead marker for a tone (`diagram-arrow-f1`). Without a tone it
 * is the generic marker (`diagram-arrow`), which every existing drawing already
 * references. Exported so drawings never hand-spell a marker id.
 */
export function diagramArrowId(tone?: DiagramArrowTone): string {
  return tone ? `diagram-arrow-${tone}` : 'diagram-arrow'
}

const ARROWHEAD_PATH = 'M 0 0 L 10 5 L 0 10 z'

/**
 * One arrowhead marker.
 *
 *  - The fill is explicit per tone (scientific-components.css). A marker's
 *    content inherits from the marker's own ancestors, never from the line that
 *    references it, so a head matches its line in EVERY browser only if it is
 *    told the colour. `fill="context-stroke"` does it with one marker, but
 *    Safari and every iOS browser do not implement it, so an unsupported paint
 *    is ignored and the head takes the default black fill: the semantic force
 *    colours are lost and the head all but disappears on the dark surface. The
 *    generic marker keeps it only as an enhancement (see CSS).
 *  - `refX="8"`: the line ends 8 units into the 10-unit head, where the triangle
 *    is 2 units tall — wider than the 10/6 units the line occupies at any stroke
 *    width (the marker scales with it) — so the line's end is hidden inside the
 *    head instead of poking out beside the tip.
 *  - `orient="auto"` is the SVG 1.1 value understood everywhere;
 *    `auto-start-reverse` is SVG 2 and no drawing uses `marker-start`.
 */
function ArrowMarker({ tone }: { tone?: DiagramArrowTone }) {
  return (
    <marker
      id={diagramArrowId(tone)}
      viewBox="0 0 10 10"
      refX="8"
      refY="5"
      markerWidth="6"
      markerHeight="6"
      orient="auto"
    >
      <path
        d={ARROWHEAD_PATH}
        fill="currentColor"
        className={`diagram-arrowhead diagram-arrowhead--${tone ?? 'auto'}`}
      />
    </marker>
  )
}

/**
 * Shared SVG definitions (arrowheads, grid pattern) available to every drawing
 * so vectors and grids look identical throughout the platform.
 *
 * Each drawing declares them inside its own <svg>, so the ids repeat when
 * several drawings share a page. The copies are identical and browsers resolve
 * `url(#id)` to the first one, which is harmless as long as that copy is
 * rendered — do not place a drawing inside a `display: none` container that
 * precedes visible drawings.
 */
export function DiagramDefs() {
  return (
    <defs>
      <ArrowMarker />
      {DIAGRAM_ARROW_TONES.map((tone) => (
        <ArrowMarker key={tone} tone={tone} />
      ))}
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

/**
 * A vector arrow. Drawn as a real SVG line with an arrowhead marker of the same
 * tone, so the head always matches the line (see ArrowMarker).
 */
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
        markerEnd={arrow ? `url(#${diagramArrowId(tone)})` : undefined}
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
