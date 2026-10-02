import { useState } from 'react'
import { DiagramDefs, ScientificValue, VectorArrow, VectorSvgLabel } from '@/scientific'
import type { InteractiveProps } from './registry'
import { COMPONENTS_VIEWBOX, axesLayout, inclineLayout } from './diagramLayouts'

/* ============================================================================
   مختبر تحليل القوّة — إضافة من المنصة حول الصفحتين 59–60
   ----------------------------------------------------------------------------
   وضعا عرض:
   1) «تحليل قوّة»: قوّة واحدة F تُحلّ إلى مركّبتين متعامدتين على محورين،
      كما في خطوات تجربة الصفحة 60: القوة ← المحوران ← إسقاط العمودين من
      M (مرسم النقطة) ← المستطيل قطره القوّة نفسها.
   2) «المستوي المائل»: نشاط الصفحة 60 — ثقل الجسم على مستوٍ مائل يُحلّ إلى
      مركّبة موازية للسطح وأخرى شاقولية عليه، والشكل الناتج مستطيل.
   كل الأسهم مرسومة هندسياً (خط + رأس سهم)، وكل مركّبة بلونها الدلالي
   وعلامتها، والزاوية القائمة معلّمة في المواضع التي تثبت التعامد.
   ========================================================================= */

type Mode = 'axes' | 'incline'
const rad = (deg: number) => (deg * Math.PI) / 180

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
          <AxesFigure force={force} theta={theta} along={along} perp={perp} reducedMotion={reducedMotion} />
        ) : (
          <InclineFigure angle={incline} weight={weight} along={along} perp={perp} reducedMotion={reducedMotion} />
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
        <div>
          <span>التحقق بالفيتاغورث</span>
          <strong className="lab__measurement-text">
            √({along.toFixed(1)}² + {perp.toFixed(1)}²) = {magnitude} N ✓
          </strong>
        </div>
      </div>

      <p className="lab__conclusion" aria-live="polite">
        <strong>الاستنتاج:</strong> المركّبتان المتعامدتان تقومان معاً مقام القوّة الأصلية، وعملية التحليل معاكسة لعملية
        إيجاد المحصّلة. على المستوي المائل يكون الشكل الناتج مستطيلاً: مركّبة توازي المستوي تسحب الجسم نحو الأسفل،
        وأخرى تعامده تضغطه على السطح، ومجموعهما الهندسي يعيد الثقل نفسه.
      </p>
    </section>
  )
}

function AxesFigure({ force, theta, along, perp, reducedMotion }: { force: number; theta: number; along: number; perp: number; reducedMotion: boolean }) {
  const layout = axesLayout({ force, theta, along, perp })
  const { O, tip, onX, onY, xEnd, yEnd, labels } = layout
  return (
    <svg viewBox={`0 0 ${COMPONENTS_VIEWBOX.width} ${COMPONENTS_VIEWBOX.height}`} role="img" aria-label={`قوّة ${force} نيوتن بزاوية ${theta} درجة تحلّل إلى مركبة أفقية ${along.toFixed(1)} نيوتن ومركبة شاقولية ${perp.toFixed(1)} نيوتن ضمن مستطيل`}>
      <DiagramDefs />
      {/* axes with real arrowheads */}
      <VectorArrow x1={O.x} y1={O.y} x2={xEnd.x} y2={xEnd.y} role="neutral" strokeWidth={1.6} headSize={8} label="المحور الأفقي" />
      <VectorArrow x1={O.x} y1={O.y} x2={yEnd.x} y2={yEnd.y} role="neutral" strokeWidth={1.6} headSize={8} label="المحور الشاقولي" />
      <text x={layout.xLabel.x} y={layout.xLabel.y} textAnchor="middle" className="vec-lab__label">x</text>
      <text x={layout.yLabel.x} y={layout.yLabel.y} textAnchor="middle" className="vec-lab__label">y</text>

      {/* the rectangle (parallelogram of components) */}
      <path
        d={`M ${O.x} ${O.y} L ${onX.x} ${onX.y} L ${tip.x} ${tip.y} L ${onY.x} ${onY.y} Z`}
        className="force-components-lab__rect"
        data-rect="true"
      />

      {/* projection lines from M (مرسم النقطة) */}
      <line x1={tip.x} y1={tip.y} x2={onX.x} y2={onX.y} className="vec-lab__dashed" />
      <line x1={tip.x} y1={tip.y} x2={onY.x} y2={onY.y} className="vec-lab__dashed" />

      {/* right angles at the projections */}
      <path d={`M ${onX.x - 12} ${O.y} L ${onX.x - 12} ${O.y - 12} L ${onX.x} ${O.y - 12}`} className="vec-lab__angle" />
      <path d={`M ${O.x} ${onY.y + 12} L ${O.x + 12} ${onY.y + 12} L ${O.x + 12} ${onY.y}`} className="vec-lab__angle" />

      {/* the force and its two components */}
      <VectorArrow x1={O.x} y1={O.y} x2={tip.x} y2={tip.y} role="resultant" strokeWidth={3.8} animated={!reducedMotion} label={`القوّة المحلّلة ${force} نيوتن`} />
      <VectorArrow x1={O.x} y1={O.y} x2={onX.x} y2={onX.y} role="component1" strokeWidth={3} animated={!reducedMotion} label={`المركّبة الأفقية ${along.toFixed(1)} نيوتن`} />
      <VectorArrow x1={O.x} y1={O.y} x2={onY.x} y2={onY.y} role="component2" strokeWidth={3} animated={!reducedMotion} label={`المركّبة الشاقولية ${perp.toFixed(1)} نيوتن`} />

      {/* angle at O */}
      <path d={layout.arc} className="vec-lab__angle" />
      <text x={labels.angle.x} y={labels.angle.y} textAnchor="middle" className="vec-lab__label vec-lab__label--angle vec-lab__label--num">{theta}°</text>

      <circle cx={O.x} cy={O.y} r={5} className="vec-lab__point" />
      <text x={labels.o.x} y={labels.o.y} textAnchor="middle" className="vec-lab__label">O</text>
      <text x={labels.m.x} y={labels.m.y} textAnchor="middle" className="vec-lab__label">M</text>

      {/* labels with their own arrow accents; each placed clear of arrows, projections and the other labels */}
      <VectorSvgLabel x={labels.f.x} y={labels.f.y} {...labels.f.spec} tone="resultant" anchor="middle" />
      <VectorSvgLabel x={labels.f1.x} y={labels.f1.y} {...labels.f1.spec} tone="component1" anchor="middle" />
      <VectorSvgLabel x={labels.f2.x} y={labels.f2.y} {...labels.f2.spec} tone="component2" anchor="middle" />
    </svg>
  )
}

function InclineFigure({ angle, weight, along, perp, reducedMotion }: { angle: number; weight: number; along: number; perp: number; reducedMotion: boolean }) {
  const layout = inclineLayout({ angle, weight, along, perp })
  const { base, slopeEnd, body, upSlope, intoSurface, wTip, alongTip, perpTip, horizonEnd, labels } = layout
  return (
    <svg viewBox={`0 0 ${COMPONENTS_VIEWBOX.width} ${COMPONENTS_VIEWBOX.height}`} role="img" aria-label={`جسم على مستوٍ مائل بزاوية ${angle} درجة؛ ثقله ${weight} نيوتن يحلّل إلى مركبة موازية للمستوي ${along.toFixed(1)} نيوتن ومركبة شاقولية على المستوي ${perp.toFixed(1)} نيوتن`}>
      <DiagramDefs />
      {/* the inclined plane: a real wedge */}
      <path
        d={`M ${base.x} ${base.y} L ${slopeEnd.x} ${slopeEnd.y} L ${slopeEnd.x} ${base.y} Z`}
        className="force-components-lab__wedge"
        data-wedge="true"
      />
      <line x1={base.x - 30} y1={base.y} x2={horizonEnd.x} y2={horizonEnd.y} className="vec-lab__axis" />
      <text x={layout.horizonLabel.x} y={layout.horizonLabel.y} textAnchor="end" className="vec-lab__label vec-lab__label--ar">{layout.horizonText}</text>

      {/* the body on the surface */}
      <rect
        x={body.x - 15}
        y={body.y - 20}
        width={30}
        height={20}
        rx={3}
        className="concurrent-forces-lab__body"
        data-body="true"
        transform={`rotate(${-angle} ${body.x} ${body.y})`}
      />

      {/* decomposition rectangle: the two components sum to w */}
      <path
        d={`M ${body.x} ${body.y} L ${alongTip.x} ${alongTip.y} L ${wTip.x} ${wTip.y} L ${perpTip.x} ${perpTip.y} Z`}
        className="force-components-lab__rect"
        data-rect="true"
      />
      <line x1={alongTip.x} y1={alongTip.y} x2={wTip.x} y2={wTip.y} className="vec-lab__dashed" />
      <line x1={perpTip.x} y1={perpTip.y} x2={wTip.x} y2={wTip.y} className="vec-lab__dashed" />

      {/* weight and its two components — all real vectors */}
      <VectorArrow x1={body.x} y1={body.y} x2={wTip.x} y2={wTip.y} role="weight" strokeWidth={3.8} animated={!reducedMotion} label={`ثقل الجسم ${weight} نيوتن`} />
      <VectorArrow x1={body.x} y1={body.y} x2={alongTip.x} y2={alongTip.y} role="component1" strokeWidth={3} animated={!reducedMotion} label={`المركّبة الموازية ${along.toFixed(1)} نيوتن`} />
      <VectorArrow x1={body.x} y1={body.y} x2={perpTip.x} y2={perpTip.y} role="component2" strokeWidth={3} animated={!reducedMotion} label={`المركّبة الشاقولية ${perp.toFixed(1)} نيوتن`} />

      {/* right angle at the surface foot of the perpendicular component */}
      <path
        d={`M ${body.x + intoSurface.x * 14} ${body.y + intoSurface.y * 14} l ${upSlope.x * 12} ${upSlope.y * 12} m ${-upSlope.x * 12} ${-upSlope.y * 12} l ${intoSurface.x * 12} ${intoSurface.y * 12}`}
        className="vec-lab__angle"
      />

      {/* incline angle a at the base + the equal angle between w and F₂ */}
      <path d={layout.baseArc} className="vec-lab__angle" />
      <text x={labels.aBase.x} y={labels.aBase.y} textAnchor="middle" className="vec-lab__label vec-lab__label--angle">a</text>
      <path d={layout.bodyArc} className="vec-lab__angle" />
      <text x={labels.aBody.x} y={labels.aBody.y} textAnchor="middle" className="vec-lab__label vec-lab__label--angle">a</text>

      {/* labels: each placed clear of arrows, arcs, the body and the other labels */}
      <VectorSvgLabel x={labels.w.x} y={labels.w.y} {...labels.w.spec} tone="weight" anchor="middle" />
      <VectorSvgLabel x={labels.f1.x} y={labels.f1.y} {...labels.f1.spec} tone="component1" anchor="middle" />
      <VectorSvgLabel x={labels.f2.x} y={labels.f2.y} {...labels.f2.spec} tone="component2" anchor="middle" />
    </svg>
  )
}
