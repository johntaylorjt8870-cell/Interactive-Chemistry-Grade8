import { useState } from 'react'
import { ScientificValue } from '@/scientific'
import { LabSymbol, PhysicsLabDefs, usePhysicsLabArrowIds } from './PhysicsLabSvg'
import type { InteractiveProps } from './registry'

/*
 * Page 60 construction: draw the original force, project its head to the two
 * perpendicular directions, then reveal the component vectors. The inclined
 * plane keeps the book's weight w and normal reaction R distinct: R is not a
 * component of w and no unsupported magnitude is assigned to it.
 */

type Mode = 'axes' | 'incline'
type Point = { x: number; y: number }
const rad = (deg: number) => (deg * Math.PI) / 180

function linePath(start: Point, end: Point) {
  return `M ${start.x} ${start.y} L ${end.x} ${end.y}`
}

export default function ForceComponentsLab({ interactiveId, reducedMotion }: InteractiveProps) {
  const [mode, setMode] = useState<Mode>('axes')
  const [force, setForce] = useState(6)
  const [theta, setTheta] = useState(40)
  const [incline, setIncline] = useState(25)
  const [weight, setWeight] = useState(5)
  const [stage, setStage] = useState(reducedMotion ? 2 : 0)
  const arrows = usePhysicsLabArrowIds('force-components')

  const angle = mode === 'axes' ? theta : incline
  const magnitude = mode === 'axes' ? force : weight
  const along = mode === 'axes' ? force * Math.cos(rad(theta)) : weight * Math.sin(rad(incline))
  const perp = mode === 'axes' ? force * Math.sin(rad(theta)) : weight * Math.cos(rad(incline))

  const changeMode = (nextMode: Mode) => {
    setMode(nextMode)
    setStage(reducedMotion ? 2 : 0)
  }
  const advance = () => setStage((current) => (reducedMotion ? 2 : Math.min(current + 1, 2)))

  return (
    <section
      className={`lab physics-lab force-components-lab ${reducedMotion ? 'lab--still' : ''}`}
      data-mode={mode}
      data-angle={angle}
      data-fx={along.toFixed(1)}
      data-fy={perp.toFixed(1)}
      data-stage={stage}
      data-interactive={interactiveId}
      aria-labelledby="force-components-lab-title"
    >
      <header className="lab__header">
        <div>
          <p className="lab__phase">إضافة من المنصة · تحليل القوة (الصفحتان 59–60)</p>
          <h3 id="force-components-lab-title">قوّة واحدة تُستبدل بمركّبتين متعامدتين</h3>
        </div>
        <div className="physics-lab__header-controls">
          <div className="physics-lab__modes" role="group" aria-label="اختر شكل التحليل">
            <button type="button" className="button button--quiet" aria-pressed={mode === 'axes'} onClick={() => changeMode('axes')}>
              المحوران <LabSymbol>x</LabSymbol> و<LabSymbol>y</LabSymbol>
            </button>
            <button type="button" className="button button--quiet" aria-pressed={mode === 'incline'} onClick={() => changeMode('incline')}>
              المستوي المائل (نشاط ص 60)
            </button>
          </div>
          <div className="lab__actions">
            <button type="button" className="button button--secondary" onClick={advance} disabled={stage === 2}>
              {stage === 0 ? 'أظهر إسقاط رأس القوة' : stage === 1 ? 'ارسم المركبتين' : 'اكتمل التحليل'}
            </button>
            <button type="button" className="button button--quiet" onClick={() => setStage(0)}>
              أعد التحليل
            </button>
          </div>
        </div>
      </header>

      <p className="physics-lab__stage" aria-live="polite">
        {stage === 0 ? 'الخطوة 1: ابدأ بالقوة الأصلية عند نقطة تأثيرها.' : stage === 1 ? 'الخطوة 2: أسقط رأس القوة على الاتجاهين المتعامدين.' : 'الخطوة 3: المركبتان معاً تعيدان القوة الأصلية.'}
      </p>

      {mode === 'axes' ? (
        <div className="parallelogram-lab__controls">
          <label className="lab__range">
            <span>
              شدّة القوة <LabSymbol>F</LabSymbol> <ScientificValue value={force} unit="N" size="sm" />
            </span>
            <input type="range" min={2} max={10} step={1} value={force} onChange={(event) => setForce(Number(event.target.value))} aria-label="شدّة القوة نيوتن" />
          </label>
          <label className="lab__range">
            <span>
              زاوية <LabSymbol>F</LabSymbol> مع المحور <LabSymbol>x</LabSymbol> <ScientificValue value={theta} unit="°" size="sm" />
            </span>
            <input type="range" min={10} max={80} step={5} value={theta} onChange={(event) => setTheta(Number(event.target.value))} aria-label="زاوية القوة مع المحور الأفقي بالدرجات" />
          </label>
        </div>
      ) : (
        <div className="parallelogram-lab__controls">
          <label className="lab__range">
            <span>
              زاوية ميل المستوي <LabSymbol>a</LabSymbol> <ScientificValue value={incline} unit="°" size="sm" />
            </span>
            <input type="range" min={5} max={60} step={5} value={incline} onChange={(event) => setIncline(Number(event.target.value))} aria-label="زاوية ميل المستوي بالدرجات" />
          </label>
          <label className="lab__range">
            <span>
              ثقل الجسم <LabSymbol>w</LabSymbol> <ScientificValue value={weight} unit="N" size="sm" />
            </span>
            <input type="range" min={2} max={10} step={1} value={weight} onChange={(event) => setWeight(Number(event.target.value))} aria-label="ثقل الجسم نيوتن" />
          </label>
        </div>
      )}

      <figure className="force-components-lab__figure physics-lab__figure">
        {mode === 'axes' ? (
          <AxesFigure force={force} theta={theta} along={along} perp={perp} stage={stage} arrows={arrows} />
        ) : (
          <InclineFigure angle={incline} weight={weight} along={along} perp={perp} stage={stage} arrows={arrows} />
        )}
        <figcaption className="physics-lab__figure-caption">
          {mode === 'axes' ? <> <LabSymbol>F₁</LabSymbol> على المحور <LabSymbol>x</LabSymbol> و<LabSymbol>F₂</LabSymbol> على المحور <LabSymbol>y</LabSymbol>؛ إسقاط رأس <LabSymbol>F</LabSymbol> يحدّد طولي الضلعين.</> : <> <LabSymbol>w</LabSymbol> شاقولي إلى أسفل؛ <LabSymbol>F₁</LabSymbol> موازية للمستوي و<LabSymbol>F₂</LabSymbol> عمودية عليه إلى الداخل، أما <LabSymbol>R</LabSymbol> فردّ فعل السطح إلى الخارج.</>}
        </figcaption>
      </figure>

      <div className="lab__measurements physics-lab__readouts" role="group" aria-label="مقادير القوة ومركبتيها">
        <div>
          <span>{mode === 'axes' ? <><LabSymbol>F₁</LabSymbol> على المحور <LabSymbol>x</LabSymbol></> : <><LabSymbol>F₁</LabSymbol> موازية للمستوي</>}</span>
          <ScientificValue value={Number(along.toFixed(1))} unit="N" />
        </div>
        <div>
          <span>{mode === 'axes' ? <><LabSymbol>F₂</LabSymbol> على المحور <LabSymbol>y</LabSymbol></> : <><LabSymbol>F₂</LabSymbol> عمودية إلى داخل المستوي</>}</span>
          <ScientificValue value={Number(perp.toFixed(1))} unit="N" />
        </div>
        <div>
          <span>{mode === 'axes' ? <>القوة الأصلية <LabSymbol>F</LabSymbol></> : <>ثقل الجسم <LabSymbol>w</LabSymbol></>}</span>
          <ScientificValue value={magnitude} unit="N" />
        </div>
        <div>
          <span>{mode === 'axes' ? <>زاوية <LabSymbol>F</LabSymbol> مع <LabSymbol>x</LabSymbol></> : <>زاوية ميل المستوي <LabSymbol>a</LabSymbol></>}</span>
          <ScientificValue value={angle} unit="°" />
        </div>
        {mode === 'incline' ? (
          <div>
            <span>ردّ فعل المستوي <LabSymbol>R</LabSymbol></span>
            <strong className="lab__measurement-text">عمودي إلى الخارج؛ بلا مقدار معطى</strong>
          </div>
        ) : null}
      </div>

      <p className="physics-lab__note" data-attribution="platform">
        <strong>إضافة من المنصة:</strong> القيم المعروضة للمركبتين محسوبة من مدخلات المحاكاة لتوضيح الإسقاط؛ ليست قياسات عددية من الكتاب. {mode === 'incline' ? <>سهم <LabSymbol>R</LabSymbol> يبيّن الاتجاه فقط، ولا يُسند إليه مقدار غير مذكور.</> : 'القيم الافتراضية هنا إعدادات للمحاكاة وليست مثالاً عددياً مطبوعاً.'}
      </p>

      <p className="lab__conclusion" aria-live="polite">
        {mode === 'axes' ? (
          <><strong>استنتاج الكتاب:</strong> يمكن الاستعاضة عن <LabSymbol>F</LabSymbol> بمركّبتين متعامدتين <LabSymbol>F₁</LabSymbol> و<LabSymbol>F₂</LabSymbol>؛ وتحليل القوة عكس إيجاد المحصّلة.</>
        ) : (
          <><strong>نشاط الكتاب:</strong> ثقل الجسم <LabSymbol>w</LabSymbol> يُحلّل هندسياً إلى مركّبة موازية للمستوي وأخرى عمودية عليه. ردّ الفعل <LabSymbol>R</LabSymbol> قوة منفصلة عن مركّبتي الثقل.</>
        )}
      </p>
    </section>
  )
}

function AxesFigure({
  force,
  theta,
  along,
  perp,
  stage,
  arrows,
}: {
  force: number
  theta: number
  along: number
  perp: number
  stage: number
  arrows: ReturnType<typeof usePhysicsLabArrowIds>
}) {
  const O = { x: 116, y: 310 }
  const scale = 21
  const a = rad(theta)
  const tip = { x: O.x + force * scale * Math.cos(a), y: O.y - force * scale * Math.sin(a) }
  const onX = { x: O.x + along * scale, y: O.y }
  const onY = { x: O.x, y: O.y - perp * scale }
  const angleLabel = { x: O.x + 49 * Math.cos(a / 2), y: O.y - 49 * Math.sin(a / 2) }
  const rightAngle = `M ${O.x + 13} ${O.y} L ${O.x + 13} ${O.y - 13} L ${O.x} ${O.y - 13}`

  return (
    <svg viewBox="0 0 620 380" role="img" aria-label={`قوة مقدارها ${force} نيوتن بزاوية ${theta} درجة تتحلل إلى F1 أفقية ${along.toFixed(1)} نيوتن وF2 شاقولية ${perp.toFixed(1)} نيوتن.`}>
      <PhysicsLabDefs arrows={arrows} />
      <line x1={O.x} y1={O.y} x2="520" y2={O.y} className="vec-lab__axis" />
      <line x1={O.x} y1={O.y} x2={O.x} y2="24" className="vec-lab__axis" />
      <text x="526" y={O.y + 5} className="vec-lab__label">x</text>
      <text x={O.x - 5} y="20" className="vec-lab__label">y</text>

      {/* From M, construct perpendicular projections to the x and y carriers. */}
      <path d={linePath(tip, onX)} pathLength={1} className="vec-lab__build-line" data-visible={stage >= 1 ? 'true' : 'false'} data-construction="projection-x" />
      <path d={linePath(tip, onY)} pathLength={1} className="vec-lab__build-line vec-lab__build-line--second" data-visible={stage >= 1 ? 'true' : 'false'} data-construction="projection-y" />

      <line x1={O.x} y1={O.y} x2={tip.x} y2={tip.y} className="vec-lab__force vec-lab__force--source" markerEnd={`url(#${arrows.source})`} data-force-vector="F" />
      <path d={linePath(O, onX)} pathLength={1} className="vec-lab__force vec-lab__force--f1 vec-lab__vector-reveal" data-visible={stage >= 2 ? 'true' : 'false'} markerEnd={`url(#${arrows.f1})`} data-force-vector="F1" />
      <path d={linePath(O, onY)} pathLength={1} className="vec-lab__force vec-lab__force--f2 vec-lab__vector-reveal vec-lab__vector-reveal--second" data-visible={stage >= 2 ? 'true' : 'false'} markerEnd={`url(#${arrows.f2})`} data-force-vector="F2" />

      <text x={tip.x + 8} y={tip.y - 8} className="vec-lab__label">F</text>
      <text x={Math.max(O.x + 28, onX.x + 8)} y={O.y + 19} className="vec-lab__label vec-lab__construction-label" data-visible={stage >= 2 ? 'true' : 'false'}>F₁</text>
      <text x={O.x - 30} y={Math.min(O.y - 12, onY.y - 8)} className="vec-lab__label vec-lab__construction-label" data-visible={stage >= 2 ? 'true' : 'false'}>F₂</text>
      <text x={tip.x + 8} y={tip.y + 18} className="vec-lab__label">M</text>
      <path d={rightAngle} className="vec-lab__right-angle vec-lab__construction-label" data-visible={stage >= 2 ? 'true' : 'false'} />
      <path d={`M ${O.x + 38} ${O.y} A 38 38 0 0 0 ${O.x + 38 * Math.cos(a)} ${O.y - 38 * Math.sin(a)}`} className="vec-lab__angle" />
      <text x={angleLabel.x} y={angleLabel.y - 6} className="vec-lab__label">θ</text>
      <circle cx={O.x} cy={O.y} r="5" className="vec-lab__point" />
      <text x={O.x - 19} y={O.y + 18} className="vec-lab__label">O</text>
    </svg>
  )
}

function InclineFigure({
  angle,
  weight,
  along,
  perp,
  stage,
  arrows,
}: {
  angle: number
  weight: number
  along: number
  perp: number
  stage: number
  arrows: ReturnType<typeof usePhysicsLabArrowIds>
}) {
  const base = { x: 72, y: 310 }
  const a = rad(angle)
  const upSlope = { x: Math.cos(a), y: -Math.sin(a) }
  const downSlope = { x: -upSlope.x, y: -upSlope.y }
  const intoSurface = { x: Math.sin(a), y: Math.cos(a) }
  const outOfSurface = { x: -intoSurface.x, y: -intoSurface.y }
  const slopeEnd = { x: base.x + 340 * upSlope.x, y: base.y + 340 * upSlope.y }
  const contact = { x: base.x + 190 * upSlope.x, y: base.y + 190 * upSlope.y }
  const center = { x: contact.x + outOfSurface.x * 14, y: contact.y + outOfSurface.y * 14 }
  const surfaceEnd = { x: slopeEnd.x + intoSurface.x * 12, y: slopeEnd.y + intoSurface.y * 12 }
  const surfaceBase = { x: base.x + intoSurface.x * 12, y: base.y + intoSurface.y * 12 }
  const weightTip = { x: center.x, y: center.y + weight * 12 }
  const alongTip = { x: center.x + along * 12 * downSlope.x, y: center.y + along * 12 * downSlope.y }
  const perpTip = { x: center.x + perp * 12 * intoSurface.x, y: center.y + perp * 12 * intoSurface.y }
  const reactionTip = { x: center.x + outOfSurface.x * 74, y: center.y + outOfSurface.y * 74 }
  const rightAngleA = { x: center.x + 14 * downSlope.x, y: center.y + 14 * downSlope.y }
  const rightAngleB = { x: center.x + 14 * (downSlope.x + intoSurface.x), y: center.y + 14 * (downSlope.y + intoSurface.y) }
  const rightAngleC = { x: center.x + 14 * intoSurface.x, y: center.y + 14 * intoSurface.y }
  const planeAngleLabel = { x: base.x + 54 * Math.cos(a / 2), y: base.y - 54 * Math.sin(a / 2) - 5 }
  const componentAngleLabel = { x: center.x + 40 * Math.sin(a / 2), y: center.y + 40 * Math.cos(a / 2) }
  const normalAngleEnd = { x: center.x + 30 * intoSurface.x, y: center.y + 30 * intoSurface.y }
  const arrowRotation = -angle

  return (
    <svg viewBox="0 0 620 430" role="img" aria-label={`جسم على مستوٍ مائل بزاوية ${angle} درجة. ثقله ${weight} نيوتن إلى أسفل، ومركبته الموازية للمستوي ${along.toFixed(1)} نيوتن ومركبته العمودية إلى الداخل ${perp.toFixed(1)} نيوتن، ورد الفعل R عمودي إلى الخارج.`}>
      <PhysicsLabDefs arrows={arrows} />

      {/* The ramp has a visible top surface and a thin section, not just an axis. */}
      <line x1="34" y1={base.y} x2="470" y2={base.y} className="vec-lab__axis" />
      <polygon points={`${base.x},${base.y} ${slopeEnd.x},${slopeEnd.y} ${surfaceEnd.x},${surfaceEnd.y} ${surfaceBase.x},${surfaceBase.y}`} className="force-components-lab__plane" />
      <line x1={base.x} y1={base.y} x2={slopeEnd.x} y2={slopeEnd.y} className="force-components-lab__plane-edge" />
      <line x1={surfaceBase.x} y1={surfaceBase.y} x2={surfaceEnd.x} y2={surfaceEnd.y} className="force-components-lab__plane-edge force-components-lab__plane-edge--lower" />

      {/* A block aligned with and resting on the plane. */}
      <rect x={center.x - 20} y={center.y - 13} width="40" height="26" rx="3" className="concurrent-forces-lab__body force-components-lab__block" transform={`rotate(${arrowRotation} ${center.x} ${center.y})`} />
      <line x1={center.x - 8} y1={center.y} x2={center.x + 8} y2={center.y} className="force-components-lab__block-mark" transform={`rotate(${arrowRotation} ${center.x} ${center.y})`} />

      {/* Textbook force directions: weight down, reaction normal outward. */}
      <line x1={center.x} y1={center.y} x2={weightTip.x} y2={weightTip.y} className="vec-lab__force vec-lab__force--w" markerEnd={`url(#${arrows.weight})`} data-force-vector="weight" />
      <line x1={center.x} y1={center.y} x2={reactionTip.x} y2={reactionTip.y} className="vec-lab__force vec-lab__force--normal" markerEnd={`url(#${arrows.normal})`} data-force-vector="reaction" />

      {/* Geometric construction: the translated sides close the component rectangle. */}
      <path d={linePath(alongTip, weightTip)} pathLength={1} className="vec-lab__build-line" data-visible={stage >= 1 ? 'true' : 'false'} data-construction="translated-f2" />
      <path d={linePath(perpTip, weightTip)} pathLength={1} className="vec-lab__build-line vec-lab__build-line--second" data-visible={stage >= 1 ? 'true' : 'false'} data-construction="translated-f1" />
      <path d={linePath(center, alongTip)} pathLength={1} className="vec-lab__force vec-lab__force--f1 vec-lab__vector-reveal" data-visible={stage >= 2 ? 'true' : 'false'} markerEnd={`url(#${arrows.f1})`} data-force-vector="F1" />
      <path d={linePath(center, perpTip)} pathLength={1} className="vec-lab__force vec-lab__force--f2 vec-lab__vector-reveal vec-lab__vector-reveal--second" data-visible={stage >= 2 ? 'true' : 'false'} markerEnd={`url(#${arrows.f2})`} data-force-vector="F2" />

      <path d={`M ${rightAngleA.x} ${rightAngleA.y} L ${rightAngleB.x} ${rightAngleB.y} L ${rightAngleC.x} ${rightAngleC.y}`} className="vec-lab__right-angle vec-lab__construction-label" data-visible={stage >= 2 ? 'true' : 'false'} />
      <text x={weightTip.x + 9} y={weightTip.y - 7} className="vec-lab__label">w</text>
      <text x={reactionTip.x - 23} y={reactionTip.y - 8} className="vec-lab__label">R</text>
      <text x={alongTip.x - 25} y={alongTip.y + 17} className="vec-lab__label vec-lab__construction-label" data-visible={stage >= 2 ? 'true' : 'false'}>F₁</text>
      <text x={perpTip.x + 8} y={perpTip.y + 5} className="vec-lab__label vec-lab__construction-label" data-visible={stage >= 2 ? 'true' : 'false'}>F₂</text>

      {/* The slope angle and its matching angle between w and the inward normal. */}
      <path d={`M ${base.x + 44} ${base.y} A 44 44 0 0 0 ${base.x + 44 * Math.cos(a)} ${base.y - 44 * Math.sin(a)}`} className="vec-lab__angle" />
      <text x={planeAngleLabel.x} y={planeAngleLabel.y} className="vec-lab__label">a</text>
      <path d={`M ${center.x} ${center.y + 30} A 30 30 0 0 0 ${normalAngleEnd.x} ${normalAngleEnd.y}`} className="vec-lab__angle" />
      <text x={componentAngleLabel.x} y={componentAngleLabel.y} className="vec-lab__label">a</text>
      <circle cx={center.x} cy={center.y} r="4" className="vec-lab__point" />
    </svg>
  )
}
