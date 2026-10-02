import type { CSSProperties, ReactNode } from 'react'
import { PlatformAddition, ScientificNotationText, VectorNotation } from '@/scientific'
import type { VectorTone } from '@/scientific'
import { arcPath, bisector, distance, polar, rightAnglePath } from '@/utils/vectorGeometry'
import type { Point } from '@/utils/vectorGeometry'

/* ============================================================================
   Shared kit of the three physics laboratories (القوى المتلاقية).
   ----------------------------------------------------------------------------
   One frame, one stage stepper, one slider, one readout grid and one set of
   SVG drawing primitives, so the labs look and behave like one instrument and
   every symbol, angle mark and label goes through the same bidi-safe path.
   Styles live in `src/styles/physics-labs.css` (namespace `plab`).
   ========================================================================= */

/** Typed helper for CSS custom properties in a `style` prop. */
export function cssVars(vars: Record<string, string | number>): CSSProperties {
  return vars as CSSProperties
}

/* ---------- frame ---------------------------------------------------------- */

export type LabFrameProps = {
  /** Lab-specific class, e.g. `concurrent-forces-lab`. */
  className: string
  titleId: string
  /** The lab's heading, exactly as the lesson refers to it. */
  title: string
  /** Short origin line shown beside the «إضافة من المنصة» badge. */
  phase: string
  reducedMotion: boolean
  /** Mirrors of the lab state as `data-*` attributes (inspectable, testable). */
  data?: Record<string, string | number | boolean>
  headerExtra?: ReactNode
  children: ReactNode
}

export function LabFrame({ className, titleId, title, phase, reducedMotion, data, headerExtra, children }: LabFrameProps) {
  const dataProps: Record<string, string> = {}
  for (const [key, value] of Object.entries(data ?? {})) dataProps[`data-${key}`] = String(value)
  return (
    <section
      className={['lab', 'plab', className, reducedMotion ? 'lab--still' : null].filter(Boolean).join(' ')}
      aria-labelledby={titleId}
      {...dataProps}
    >
      <header className="lab__header plab__header">
        <div className="plab__titles">
          <p className="lab__phase plab__phase">
            <PlatformAddition />
            <span>{phase}</span>
          </p>
          <h3 id={titleId}>{title}</h3>
        </div>
        {headerExtra}
      </header>
      {children}
    </section>
  )
}

/* ---------- construction stages -------------------------------------------- */

export type LabStageDef = {
  title: string
  /** Prose for the stage; vector tokens (F₁⃗ …) are promoted to real notation. */
  hint: string
}

export function LabStages({ stages, stage, onStage, label = 'مراحل البناء' }: {
  stages: LabStageDef[]
  stage: number
  onStage: (stage: number) => void
  label?: string
}) {
  const last = stages.length - 1
  const current = stages[stage]!
  const next = stages[stage + 1]
  return (
    <div className="plab__stepper">
      <div className="lab__actions plab__actions">
        <button type="button" className="button button--secondary" onClick={() => onStage(Math.min(stage + 1, last))} disabled={stage >= last}>
          {next ? `التالي: ${next.title}` : 'اكتمل البناء'}
        </button>
        <button type="button" className="button button--quiet" onClick={() => onStage(Math.max(stage - 1, 0))} disabled={stage <= 0}>
          السابق
        </button>
        <button type="button" className="button button--quiet" onClick={() => onStage(0)} disabled={stage <= 0}>
          ابدأ من الخطوة الأولى
        </button>
      </div>
      <ol className="plab__stages" aria-label={label}>
        {stages.map((item, index) => (
          <li key={item.title}>
            <button
              type="button"
              className="plab__stage"
              data-state={index < stage ? 'done' : index === stage ? 'current' : 'todo'}
              aria-current={index === stage ? 'step' : undefined}
              onClick={() => onStage(index)}
            >
              <span className="plab__stage-index" aria-hidden="true">
                {index + 1}
              </span>
              <span className="plab__stage-title">{item.title}</span>
            </button>
          </li>
        ))}
      </ol>
      <p className="plab__stage-hint" aria-live="polite">
        <strong>
          المرحلة {stage + 1} من {stages.length}:
        </strong>{' '}
        <ScientificNotationText as="span">{current.hint}</ScientificNotationText>
      </p>
    </div>
  )
}

/* ---------- controls ------------------------------------------------------- */

export function LabRange({ label, value, valueNode, min, max, step = 1, onChange, ariaLabel, valueText, disabled }: {
  label: ReactNode
  value: number
  /** How the current value is shown beside the label (a `ScientificValue`). */
  valueNode: ReactNode
  min: number
  max: number
  step?: number
  onChange: (value: number) => void
  ariaLabel: string
  /** Spoken value for assistive technology, e.g. `35 درجة`. */
  valueText?: string
  disabled?: boolean
}) {
  return (
    <label className="plab__range" data-disabled={disabled ? 'true' : undefined}>
      <span className="plab__range-head">
        <span className="plab__range-name">{label}</span>
        <span className="plab__range-value">{valueNode}</span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        disabled={disabled}
        aria-label={ariaLabel}
        aria-valuetext={valueText}
        onChange={(event) => onChange(Number(event.target.value))}
      />
    </label>
  )
}

/* ---------- readouts and legend -------------------------------------------- */

export type LabReadoutItem = {
  key: string
  label: ReactNode
  value: ReactNode
  /** `ok` marks a satisfied check; a vector tone tints the tile edge. */
  tone?: VectorTone | 'ok'
}

export function LabReadouts({ items, label }: { items: LabReadoutItem[]; label: string }) {
  return (
    <dl className="plab__readouts" aria-label={label}>
      {items.map((item) => (
        <div className="plab__readout" key={item.key} data-tone={item.tone}>
          <dt>{typeof item.label === 'string' ? <ScientificNotationText as="span">{item.label}</ScientificNotationText> : item.label}</dt>
          <dd>{item.value}</dd>
        </div>
      ))}
    </dl>
  )
}

export type LabLegendItem = { tone: VectorTone; symbol: string; subscript?: string; text: string }

/** Colour key. Every colour is paired with the symbol and a name — never colour alone. */
export function LabLegend({ items }: { items: LabLegendItem[] }) {
  return (
    <ul className="plab__legend" aria-label="مفتاح الرموز والألوان">
      {items.map((item) => (
        <li key={`${item.symbol}${item.subscript ?? ''}`} data-tone={item.tone}>
          <svg className="plab__legend-arrow" viewBox="0 0 28 10" aria-hidden="true" focusable="false">
            <line className="plab__legend-shaft" x1="1" y1="5" x2="20" y2="5" />
            <path className="plab__legend-head" d="M 27 5 L 19 1 L 19 9 Z" />
          </svg>
          <VectorNotation symbol={item.symbol} subscript={item.subscript} tone={item.tone} size="sm" />
          <span className="plab__legend-text">{item.text}</span>
        </li>
      ))}
    </ul>
  )
}

/* ---------- SVG drawing primitives ----------------------------------------- */

/** Light drawing grid for a board: one path, no per-line elements. */
export function BoardGrid({ width, height, step = 40 }: { width: number; height: number; step?: number }) {
  let d = ''
  for (let x = step; x < width; x += step) d += `M ${x} 0 V ${height} `
  for (let y = step; y < height; y += step) d += `M 0 ${y} H ${width} `
  return <path className="plab-board-grid" d={d} />
}

/** A labelled point (O, M…): a dot with a ring. */
export function PointMark({ at, className }: { at: Point; className?: string }) {
  return (
    <g className={['plab-point', className].filter(Boolean).join(' ')}>
      <circle className="plab-point__halo" cx={at.x} cy={at.y} r={8} />
      <circle className="plab-point__dot" cx={at.x} cy={at.y} r={4.2} />
    </g>
  )
}

/** Arc that marks an angle between two directions at `centre`. */
export function AngleMark({ centre, r, fromDeg, toDeg, className }: { centre: Point; r: number; fromDeg: number; toDeg: number; className?: string }) {
  return <path className={['plab-angle', className].filter(Boolean).join(' ')} d={arcPath(centre, r, fromDeg, toDeg)} data-angle-mark="true" />
}

/** Where the label of an angle mark should be drawn. */
export function angleLabelPoint(centre: Point, r: number, fromDeg: number, toDeg: number): Point {
  return polar(centre, r, bisector(fromDeg, toDeg))
}

/** Square corner that proves two directions are perpendicular. */
export function RightAngleMark({ vertex, dir1, dir2, size = 10, className }: { vertex: Point; dir1: number; dir2: number; size?: number; className?: string }) {
  return <path className={['plab-right-angle', className].filter(Boolean).join(' ')} d={rightAnglePath(vertex, dir1, dir2, size)} data-right-angle="true" />
}

/**
 * Italic math symbol with an optional subscript (a₁, O, M, X…), always laid out
 * left to right. `align` is visual (left / centre / right).
 */
export function SymbolText({ x, y, symbol, subscript, align = 'center', fontSize = 17, className }: {
  x: number
  y: number
  symbol: string
  subscript?: string
  align?: 'left' | 'center' | 'right'
  fontSize?: number
  className?: string
}) {
  return (
    <text
      x={x}
      y={y}
      className={['svg-text', 'svg-text--point', 'svg-text--halo', className].filter(Boolean).join(' ')}
      textAnchor={align === 'center' ? 'middle' : align === 'left' ? 'start' : 'end'}
      direction="ltr"
      fontSize={fontSize}
    >
      {symbol}
      {subscript ? (
        <tspan className="svg-text__sub" dy={fontSize * 0.2} fontSize={fontSize * 0.7}>
          {subscript}
        </tspan>
      ) : null}
    </text>
  )
}

/** Zig-zag coil between two points, with straight lead-in and lead-out. */
export function springPath(from: Point, to: Point, coils = 9, amplitude = 6.5, lead = 0.14): string {
  const length = distance(from, to) || 1
  const ux = (to.x - from.x) / length
  const uy = (to.y - from.y) / length
  const nx = -uy
  const ny = ux
  const steps = coils * 2
  let d = `M ${from.x.toFixed(1)} ${from.y.toFixed(1)}`
  for (let i = 1; i <= steps; i += 1) {
    const t = lead + (1 - 2 * lead) * ((i - 0.5) / steps)
    const side = i % 2 === 0 ? 1 : -1
    const px = from.x + ux * length * t + nx * amplitude * side
    const py = from.y + uy * length * t + ny * amplitude * side
    d += ` L ${px.toFixed(1)} ${py.toFixed(1)}`
  }
  return `${d} L ${to.x.toFixed(1)} ${to.y.toFixed(1)}`
}

/**
 * A check mark drawn as SVG. A text "✓" depends on the device having a font with
 * that glyph (headless and some Android/Linux setups show an empty box), so the
 * mark is geometry, with an accessible name.
 */
export function CheckMark({ label = 'تحقّق' }: { label?: string }) {
  return (
    <svg className="plab__tick" viewBox="0 0 16 16" role="img" aria-label={label} focusable="false">
      <circle cx="8" cy="8" r="7.1" />
      <path d="M4.6 8.4 L7 10.8 L11.6 5.6" />
    </svg>
  )
}

/** Format a number for display without trailing noise: 4, 2.4, 0. */
export function num(value: number, digits = 1): string {
  const rounded = Number(value.toFixed(digits))
  return String(Object.is(rounded, -0) ? 0 : rounded)
}

/** A fixed number of decimals (3.86, 4.60), used when two numbers must line up. */
export function fix(value: number, digits: number): string {
  const text = value.toFixed(digits)
  return text === `-${(0).toFixed(digits)}` ? (0).toFixed(digits) : text
}
