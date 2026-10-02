import { useState } from 'react'
import { DiagramDefs, ScientificValue } from '@/scientific'
import type { InteractiveProps } from './registry'

/* ============================================================================
   مختبر تحليل القوّة — إضافة من المنصة حول الصفحتين 59–60
   ----------------------------------------------------------------------------
   وضعا عرض:
   1) «تحليل قوّة»: قوّة واحدة F تُحلّ إلى مركّبتين متعامدتين على محورين،
      كما في خطوات تجربة الصفحة 60 (المستطيل قطره المارّ من O يمثّل المحصّلة).
   2) «المستوي المائل»: نشاط الصفحة 60 — ثقل الجسم على مستوٍ مائل يُحلّ إلى
      مركّبة موازية للسطح وأخرى شاقولية عليه، والشكل الناتج مستطيل.
   ========================================================================= */

type Mode = 'axes' | 'incline'
type LabPoint = { x: number; y: number }

const rad = (deg: number) => (deg * Math.PI) / 180

/* viewBox padding from the shared marker (markerWidth 6 × stroke) plus label font. */
const ARROW_MARKER_WIDTH = 6
const FORCE_STROKE_MAX = 3.5
const LABEL_FONT_SIZE = 15
const VIEW_PAD = ARROW_MARKER_WIDTH * FORCE_STROKE_MAX + LABEL_FONT_SIZE
const DEFAULT_VIEW = { minX: 0, minY: 0, maxX: 480, maxY: 300 }

function viewBoxForPoints(points: LabPoint[]): string {
  let { minX, minY, maxX, maxY } = DEFAULT_VIEW
  for (const point of points) {
    minX = Math.min(minX, point.x - VIEW_PAD)
    minY = Math.min(minY, point.y - VIEW_PAD)
    maxX = Math.max(maxX, point.x + VIEW_PAD)
    maxY = Math.max(maxY, point.y + VIEW_PAD)
  }
  return `${minX} ${minY} ${maxX - minX} ${maxY - minY}`
}

export default function ForceComponentsLab({ reducedMotion }: InteractiveProps) {
  const [mode, setMode] = useState<Mode>('axes')
  const [force, setForce] = useState(6)
  const [theta, setTheta] = useState(40)
  const [incline, setIncline] = useState(25)
  const [weight, setWeight] = useState(5)

  const angle = mode === 'axes' ? theta : incline
  const magnitude = mode === 'axes' ? force : weight
  const along = mode === 'axes' ? force * Math.cos(rad(theta)) : weight * Math.sin(rad(incline))
  const perp = mode === 'axes' ? force * Math.sin(rad(theta)) : weight * Math.cos(rad(incline))

  const s = 16
  const a = rad(angle)

  return (
    <section
      className={`lab force-components-lab ${reducedMotion ? 'lab--still' : ''}`}
      data-mode={mode}
      data-angle={angle}
      data-fx={along.toFixed(1)}
      data-fy={perp.toFixed(1)}
      aria-labelledby="force-components-lab-title"
    >
      <header className="lab__header">
        <div>
          <p className="lab__phase">إضافة من المنصة · تحليل القوّة (الصفحتان 59–60)</p>
          <h3 id="force-components-lab-title">قوّة واحدة تُستبدل بمركّبتين متعامدتين</h3>
        </div>
        <div className="covalent-bond-lab__views" role="group" aria-label="اختر وضع العرض">
          <button type="button" className="button button--quiet" aria-pressed={mode === 'axes'} onClick={() => setMode('axes')}>
            تحليل قوّة على محورين
          </button>
          <button type="button" className="button button--quiet" aria-pressed={mode === 'incline'} onClick={() => setMode('incline')}>
            المستوي المائل (نشاط الصفحة 60)
          </button>
        </div>
      </header>

      {mode === 'axes' ? (
        <div className="parallelogram-lab__controls">
          <label className="lab__range">
            <span>
              شدّة القوّة F <ScientificValue value={force} unit="N" size="sm" />
            </span>
            <input type="range" min={2} max={10} step={1} value={force} onChange={(event) => setForce(Number(event.target.value))} aria-label="شدّة القوّة نيوتن" />
          </label>
          <label className="lab__range">
            <span>
              زاوية F مع المحور الأفقي <ScientificValue value={theta} unit="°" size="sm" />
            </span>
            <input type="range" min={10} max={80} step={5} value={theta} onChange={(event) => setTheta(Number(event.target.value))} aria-label="زاوية القوّة مع المحور الأفقي بالدرجات" />
          </label>
        </div>
      ) : (
        <div className="parallelogram-lab__controls">
          <label className="lab__range">
            <span>
              زاوية الميل a <ScientificValue value={incline} unit="°" size="sm" />
            </span>
            <input type="range" min={5} max={60} step={5} value={incline} onChange={(event) => setIncline(Number(event.target.value))} aria-label="زاوية ميل المستوي بالدرجات" />
          </label>
          <label className="lab__range">
            <span>
              ثقل الجسم w <ScientificValue value={weight} unit="N" size="sm" />
            </span>
            <input type="range" min={2} max={10} step={1} value={weight} onChange={(event) => setWeight(Number(event.target.value))} aria-label="ثقل الجسم نيوتن" />
          </label>
        </div>
      )}

      <div className="force-components-lab__figure">
        {mode === 'axes' ? (
          <AxesFigure force={force} theta={theta} along={along} perp={perp} scale={s} />
        ) : (
          <InclineFigure angle={incline} weight={weight} along={along} perp={perp} scale={s} a={a} />
        )}
      </div>

      <div className="lab__measurements">
        <div>
          <span>{mode === 'axes' ? 'المركّبة الأفقية F₁' : 'المركّبة الموازية للمستوي F₁'}</span>
          <ScientificValue value={Number(along.toFixed(1))} unit="N" />
        </div>
        <div>
          <span>{mode === 'axes' ? 'المركّبة الشاقولية F₂' : 'المركّبة الشاقولية على المستوي F₂'}</span>
          <ScientificValue value={Number(perp.toFixed(1))} unit="N" />
        </div>
        <div>
          <span>{mode === 'axes' ? 'القوّة المحلّلة F' : 'الثقل w'}</span>
          <ScientificValue value={magnitude} unit="N" />
        </div>
        <div>
          <span>الشكل الناتج</span>
          <strong className="lab__measurement-text">مستطيل قطره القوّة نفسها</strong>
        </div>
      </div>

      <p className="lab__conclusion" aria-live="polite">
        <strong>الاستنتاج:</strong> المركّبتان المتعامدتان تقومان معاً مقام القوّة الأصلية، وعملية التحليل معاكسة لعملية إيجاد
        المحصّلة. على المستوي المائل يكون الشكل الناتج مستطيلاً: مركّبة توازي المستوي وأخرى تعامده، ومجموعهما الهندسي يعيد
        الثقل نفسه.
      </p>
    </section>
  )
}

function AxesFigure({ force, theta, along, perp, scale }: { force: number; theta: number; along: number; perp: number; scale: number }) {
  const O = { x: 90, y: 240 }
  const a = rad(theta)
  const tip = { x: O.x + force * scale * Math.cos(a), y: O.y - force * scale * Math.sin(a) }
  const onX = { x: O.x + along * scale, y: O.y }
  const onY = { x: O.x, y: O.y - perp * scale }
  const fLabel = { x: tip.x + 6, y: tip.y - 4 }
  const f1Label = { x: onX.x + 4, y: onX.y + 16 }
  const f2Label = { x: onY.x - 24, y: onY.y + 4 }
  const viewBox = viewBoxForPoints([
    O,
    tip,
    onX,
    onY,
    { x: 440, y: O.y },
    { x: O.x, y: 20 },
    fLabel,
    f1Label,
    f2Label,
    { x: 444, y: O.y + 4 },
    { x: O.x - 4, y: 14 },
    { x: O.x - 20, y: O.y + 16 },
  ])
  return (
    <svg viewBox={viewBox} role="img" aria-label={`قوّة ${force} نيوتن بزاوية ${theta} درجة تحلّل إلى مركبة أفقية ${along.toFixed(1)} نيوتن ومركبة شاقولية ${perp.toFixed(1)} نيوتن ضمن مستطيل`}>
      <DiagramDefs />
      <line x1={O.x} y1={O.y} x2={440} y2={O.y} className="vec-lab__axis" />
      <line x1={O.x} y1={O.y} x2={O.x} y2={20} className="vec-lab__axis" />
      <text x={444} y={O.y + 4} className="vec-lab__label">x</text>
      <text x={O.x - 4} y={14} className="vec-lab__label">y</text>
      <line x1={tip.x} y1={tip.y} x2={onX.x} y2={onX.y} className="vec-lab__dashed" />
      <line x1={tip.x} y1={tip.y} x2={onY.x} y2={onY.y} className="vec-lab__dashed" />
      <line x1={O.x} y1={O.y} x2={tip.x} y2={tip.y} className="vec-lab__resultant" markerEnd="url(#diagram-arrow)" />
      <line x1={O.x} y1={O.y} x2={onX.x} y2={onX.y} className="vec-lab__force vec-lab__force--f1" markerEnd="url(#diagram-arrow)" />
      <line x1={O.x} y1={O.y} x2={onY.x} y2={onY.y} className="vec-lab__force vec-lab__force--f2" markerEnd="url(#diagram-arrow)" />
      <text x={fLabel.x} y={fLabel.y} className="vec-lab__label vec-lab__label--resultant">F</text>
      <text x={f1Label.x} y={f1Label.y} className="vec-lab__label">F₁</text>
      <text x={f2Label.x} y={f2Label.y} className="vec-lab__label">F₂</text>
      <text x={tip.x + 8} y={tip.y + 14} className="vec-lab__label">M</text>
      <circle cx={O.x} cy={O.y} r={4} className="vec-lab__point" />
      <text x={O.x - 20} y={O.y + 16} className="vec-lab__label">O</text>
    </svg>
  )
}

function InclineFigure({ angle, weight, along, perp, scale, a }: { angle: number; weight: number; along: number; perp: number; scale: number; a: number }) {
  const base = { x: 40, y: 260 }
  const upSlope = { x: Math.cos(a), y: -Math.sin(a) }
  const slopeEnd = { x: base.x + 300 * upSlope.x, y: base.y + 300 * upSlope.y }
  const body = { x: base.x + 180 * upSlope.x, y: base.y + 180 * upSlope.y }
  const downSlope = { x: -upSlope.x, y: -upSlope.y }
  const intoSurface = { x: Math.sin(a), y: Math.cos(a) }
  const wTip = { x: body.x, y: body.y + weight * scale }
  const alongTip = { x: body.x + along * scale * downSlope.x, y: body.y + along * scale * downSlope.y }
  const perpTip = { x: body.x + perp * scale * intoSurface.x, y: body.y + perp * scale * intoSurface.y }
  const outOfSurface = { x: -intoSurface.x, y: -intoSurface.y }
  const rTip = { x: body.x + perp * scale * outOfSurface.x, y: body.y + perp * scale * outOfSurface.y }
  const wLabel = { x: wTip.x + 8, y: wTip.y - 4 }
  const f1Label = { x: alongTip.x - 4, y: alongTip.y + 16 }
  const f2Label = { x: perpTip.x + 8, y: perpTip.y + 4 }
  const rLabel = { x: rTip.x - 20, y: rTip.y - 6 }
  const viewBox = viewBoxForPoints([
    base,
    slopeEnd,
    { x: 440, y: base.y },
    body,
    wTip,
    alongTip,
    perpTip,
    rTip,
    wLabel,
    f1Label,
    f2Label,
    rLabel,
    { x: body.x - 11, y: body.y - 14 },
    { x: body.x + 11, y: body.y },
    { x: base.x + 50, y: base.y },
    { x: base.x + 50 * Math.cos(a), y: base.y - 50 * Math.sin(a) },
    { x: base.x + 60, y: base.y - 8 },
  ])
  return (
    <svg viewBox={viewBox} role="img" aria-label={`جسم على مستوٍ مائل بزاوية ${angle} درجة؛ ثقله ${weight} نيوتن يحلّل إلى مركبة موازية للمستوي ${along.toFixed(1)} نيوتن ومركبة شاقولية على المستوي ${perp.toFixed(1)} نيوتن، وقوّة رد الفعل R⃗`}>
      <DiagramDefs />
      <line x1={base.x} y1={base.y} x2={440} y2={base.y} className="vec-lab__axis" />
      <line x1={base.x} y1={base.y} x2={slopeEnd.x} y2={slopeEnd.y} className="vec-lab__axis" />
      <rect x={body.x - 11} y={body.y - 14} width={22} height={14} className="concurrent-forces-lab__body" transform={`rotate(${-angle} ${body.x} ${body.y - 7})`} />
      <line x1={body.x} y1={body.y} x2={wTip.x} y2={wTip.y} className="vec-lab__force vec-lab__force--w" markerEnd="url(#diagram-arrow)" />
      <line x1={body.x} y1={body.y} x2={alongTip.x} y2={alongTip.y} className="vec-lab__force vec-lab__force--f1" markerEnd="url(#diagram-arrow)" />
      <line x1={body.x} y1={body.y} x2={perpTip.x} y2={perpTip.y} className="vec-lab__force vec-lab__force--f2" markerEnd="url(#diagram-arrow)" />
      <line x1={body.x} y1={body.y} x2={rTip.x} y2={rTip.y} className="vec-lab__force" data-force="R" markerEnd="url(#diagram-arrow)" />
      <line x1={alongTip.x} y1={alongTip.y} x2={wTip.x} y2={wTip.y} className="vec-lab__dashed" />
      <line x1={perpTip.x} y1={perpTip.y} x2={wTip.x} y2={wTip.y} className="vec-lab__dashed" />
      <text x={wLabel.x} y={wLabel.y} className="vec-lab__label vec-lab__label--resultant">w</text>
      <text x={f1Label.x} y={f1Label.y} className="vec-lab__label">F₁</text>
      <text x={f2Label.x} y={f2Label.y} className="vec-lab__label">F₂</text>
      <text x={rLabel.x} y={rLabel.y} className="vec-lab__label">R⃗</text>
      <path d={`M ${base.x + 50} ${base.y} A 50 50 0 0 0 ${base.x + 50 * Math.cos(a)} ${base.y - 50 * Math.sin(a)}`} className="vec-lab__angle" />
      <text x={base.x + 60} y={base.y - 8} className="vec-lab__label">a</text>
    </svg>
  )
}
