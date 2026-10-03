import { useEffect, useRef, useState } from 'react'
import { DiagramDefs, ScientificValue } from '@/scientific'
import { LiveStatus } from '@/components/LiveStatus'
import type { InteractiveProps } from './registry'
import {
  buildPointMotionStyle,
  buildSegmentMotionStyle,
  clampToSurface,
  vectorAngleDeg,
  vectorLabelPoint,
  vectorLength,
  type Point2D,
} from './vectorAnimation'

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
type DecompositionStage = 0 | 1 | 2
type ChangedParam = 'init' | 'mode' | 'stage' | 'force' | 'theta' | 'incline' | 'weight'
type AnimTrigger = 'construct' | 'param'

const AXES_STAGES = [
  'رسم القوّة الأصلية F والمحورين المتعامدين OX وOY من النقطة O.',
  'إسقاط العمودين من الرأس M على المحورين لتشكيل المستطيل.',
  'رسم المركّبتين المتعامدتين F₁ وF₂ من O حتى مسقطي الرأس.',
] as const

const INCLINE_STAGES = [
  'رسم ثقل الجسم w شاقولياً والمحورين المتعامدين (الموازي للميل والشاقولي عليه).',
  'إسقاط العمودين من نهاية w على محوري المستوي المائل لتشكيل المستطيل.',
  'رسم المركّبة الموازية للميل F₁ والمركّبة الشاقولية عليه F₂ من مركز الجسم.',
] as const

const rad = (deg: number) => (deg * Math.PI) / 180

export default function ForceComponentsLab({ reducedMotion }: InteractiveProps) {
  const [mode, setMode] = useState<Mode>('axes')
  const [force, setForce] = useState(6)
  const [theta, setTheta] = useState(40)
  const [incline, setIncline] = useState(25)
  const [weight, setWeight] = useState(5)
  const [stage, setStage] = useState<DecompositionStage>(2)
  const [lastChanged, setLastChanged] = useState<ChangedParam>('init')
  const [animTrigger, setAnimTrigger] = useState<AnimTrigger>('construct')
  const [revision, setRevision] = useState(0)

  const angle = mode === 'axes' ? theta : incline
  const magnitude = mode === 'axes' ? force : weight
  const along = mode === 'axes' ? force * Math.cos(rad(theta)) : weight * Math.sin(rad(incline))
  const perp = mode === 'axes' ? force * Math.sin(rad(theta)) : weight * Math.cos(rad(incline))

  const s = 16
  const a = rad(angle)
  const stageLabels = mode === 'axes' ? AXES_STAGES : INCLINE_STAGES

  const switchMode = (nextMode: Mode) => {
    setMode(nextMode)
    setStage(2)
    setLastChanged('mode')
    setAnimTrigger('construct')
    setRevision((current) => current + 1)
  }

  const updateParam = (param: 'force' | 'theta' | 'incline' | 'weight', value: number) => {
    if (param === 'force') setForce(value)
    else if (param === 'theta') setTheta(value)
    else if (param === 'incline') setIncline(value)
    else setWeight(value)
    setStage(2)
    setLastChanged(param)
    setAnimTrigger('param')
    setRevision((current) => current + 1)
  }

  const startStepByStep = () => {
    setStage(reducedMotion ? 2 : 0)
    setLastChanged('stage')
    setAnimTrigger('construct')
    setRevision((current) => current + 1)
  }

  const advanceStage = () => {
    setStage((current) => (reducedMotion ? 2 : (Math.min(current + 1, 2) as DecompositionStage)))
    setLastChanged('stage')
    setAnimTrigger('construct')
    setRevision((current) => current + 1)
  }

  const announcement =
    mode === 'axes'
      ? `تحليل قوّة على محورين: القوّة ${force} نيوتن بزاوية ${theta} درجة؛ المركّبة الأفقية ${along.toFixed(1)} نيوتن والمركّبة الشاقولية ${perp.toFixed(1)} نيوتن.`
      : `المستوي المائل: ثقل ${weight} نيوتن على مستوٍ بزاوية ${incline} درجة؛ المركّبة الموازية للمستوي ${along.toFixed(1)} نيوتن والمركّبة الشاقولية عليه ${perp.toFixed(1)} نيوتن.`

  return (
    <section
      className={`lab force-components-lab ${reducedMotion ? 'lab--still' : ''}`}
      data-mode={mode}
      data-angle={angle}
      data-fx={along.toFixed(1)}
      data-fy={perp.toFixed(1)}
      data-stage={stage}
      data-anim-mode={reducedMotion ? 'still' : 'animated'}
      data-anim-trigger={animTrigger}
      data-last-changed={lastChanged}
      data-revision={revision}
      aria-labelledby="force-components-lab-title"
    >
      <header className="lab__header">
        <div>
          <p className="lab__phase">إضافة من المنصة · تحليل القوّة (الصفحتان 59–60)</p>
          <h3 id="force-components-lab-title">قوّة واحدة تُستبدل بمركّبتين متعامدتين</h3>
        </div>
        <div className="covalent-bond-lab__views" role="group" aria-label="اختر وضع العرض">
          <button
            type="button"
            className="button button--quiet"
            aria-pressed={mode === 'axes'}
            onClick={() => switchMode('axes')}
          >
            تحليل قوّة على محورين
          </button>
          <button
            type="button"
            className="button button--quiet"
            aria-pressed={mode === 'incline'}
            onClick={() => switchMode('incline')}
          >
            المستوي المائل (نشاط الصفحة 60)
          </button>
        </div>
      </header>

      <ol className="ionic-bond-lab__stages vec-lab__stages" aria-label="مراحل تحليل القوّة إلى مركّبتين متعامدتين">
        {stageLabels.map((label, index) => (
          <li
            key={index}
            data-active={index === stage ? 'true' : undefined}
            data-done={index < stage ? 'true' : undefined}
          >
            <span className="ionic-bond-lab__stage-index" aria-hidden="true">
              {index + 1}
            </span>
            {label}
          </li>
        ))}
      </ol>

      <div className="lab__actions">
        {stage < 2 ? (
          <button type="button" className="button button--secondary" onClick={advanceStage}>
            {stage === 0 ? 'الخطوة التالية: إسقاط العمودين' : 'الخطوة التالية: رسم المركّبتين F₁ وF₂'}
          </button>
        ) : null}
        <button type="button" className="button button--quiet" onClick={startStepByStep}>
          أعد التحليل خطوة بخطوة
        </button>
      </div>

      {mode === 'axes' ? (
        <div className="parallelogram-lab__controls">
          <label className="lab__range">
            <span>
              شدّة القوّة F <ScientificValue value={force} unit="N" size="sm" />
            </span>
            <input
              type="range"
              min={2}
              max={10}
              step={1}
              value={force}
              onChange={(event) => updateParam('force', Number(event.target.value))}
              aria-label="شدّة القوّة نيوتن"
              aria-valuetext={`${force} نيوتن`}
            />
          </label>
          <label className="lab__range">
            <span>
              زاوية F مع المحور الأفقي <ScientificValue value={theta} unit="°" size="sm" />
            </span>
            <input
              type="range"
              min={10}
              max={80}
              step={5}
              value={theta}
              onChange={(event) => updateParam('theta', Number(event.target.value))}
              aria-label="زاوية القوّة مع المحور الأفقي بالدرجات"
              aria-valuetext={`${theta} درجة`}
            />
          </label>
        </div>
      ) : (
        <div className="parallelogram-lab__controls">
          <label className="lab__range">
            <span>
              زاوية الميل a <ScientificValue value={incline} unit="°" size="sm" />
            </span>
            <input
              type="range"
              min={5}
              max={60}
              step={5}
              value={incline}
              onChange={(event) => updateParam('incline', Number(event.target.value))}
              aria-label="زاوية ميل المستوي بالدرجات"
              aria-valuetext={`${incline} درجة`}
            />
          </label>
          <label className="lab__range">
            <span>
              ثقل الجسم w <ScientificValue value={weight} unit="N" size="sm" />
            </span>
            <input
              type="range"
              min={2}
              max={10}
              step={1}
              value={weight}
              onChange={(event) => updateParam('weight', Number(event.target.value))}
              aria-label="ثقل الجسم نيوتن"
              aria-valuetext={`${weight} نيوتن`}
            />
          </label>
        </div>
      )}

      <div className="force-components-lab__figure">
        {mode === 'axes' ? (
          <AxesFigure
            force={force}
            theta={theta}
            along={along}
            perp={perp}
            scale={s}
            stage={stage}
            reducedMotion={reducedMotion}
            morphPhase={revision % 2 === 0 ? 'a' : 'b'}
          />
        ) : (
          <InclineFigure
            angle={incline}
            weight={weight}
            along={along}
            perp={perp}
            scale={s}
            a={a}
            stage={stage}
            reducedMotion={reducedMotion}
            morphPhase={revision % 2 === 0 ? 'a' : 'b'}
          />
        )}
      </div>

      <div className="lab__measurements">
        <div data-highlight={stage === 2 || lastChanged !== 'init' ? 'true' : undefined}>
          <span>{mode === 'axes' ? 'المركّبة الأفقية F₁' : 'المركّبة الموازية للمستوي F₁'}</span>
          <ScientificValue value={Number(along.toFixed(1))} unit="N" />
        </div>
        <div data-highlight={stage === 2 || lastChanged !== 'init' ? 'true' : undefined}>
          <span>{mode === 'axes' ? 'المركّبة الشاقولية F₂' : 'المركّبة الشاقولية على المستوي F₂'}</span>
          <ScientificValue value={Number(perp.toFixed(1))} unit="N" />
        </div>
        <div data-highlight={lastChanged === 'force' || lastChanged === 'weight' ? 'true' : undefined}>
          <span>{mode === 'axes' ? 'القوّة المحلّلة F' : 'الثقل w'}</span>
          <ScientificValue value={magnitude} unit="N" />
        </div>
        <div>
          <span>الشكل الناتج</span>
          <strong className="lab__measurement-text">مستطيل قطره القوّة نفسها</strong>
        </div>
      </div>

      <LiveStatus message={announcement} />

      <p className="lab__conclusion">
        <strong>الاستنتاج:</strong> المركّبتان المتعامدتان تقومان معاً مقام القوّة الأصلية، وعملية التحليل معاكسة لعملية إيجاد
        المحصّلة. على المستوي المائل يكون الشكل الناتج مستطيلاً: مركّبة توازي المستوي وأخرى تعامده، ومجموعهما الهندسي يعيد
        الثقل نفسه.
      </p>
    </section>
  )
}

function AxesFigure({
  force,
  theta,
  along,
  perp,
  scale,
  stage,
  reducedMotion,
  morphPhase,
}: {
  force: number
  theta: number
  along: number
  perp: number
  scale: number
  stage: DecompositionStage
  reducedMotion: boolean
  morphPhase: 'a' | 'b'
}) {
  const O: Point2D = { x: 90, y: 240 }
  const a = rad(theta)
  const tip: Point2D = { x: O.x + force * scale * Math.cos(a), y: O.y - force * scale * Math.sin(a) }
  const onX: Point2D = { x: O.x + along * scale, y: O.y }
  const onY: Point2D = { x: O.x, y: O.y - perp * scale }

  const prevRef = useRef<{ O: Point2D; tip: Point2D; onX: Point2D; onY: Point2D } | null>(null)
  const prev = prevRef.current

  useEffect(() => {
    prevRef.current = { O, tip, onX, onY }
  }, [O.x, O.y, tip.x, tip.y, onX.x, onX.y, onY.x, onY.y])

  // Centred vector labels, placed clear of their arrowheads so their position
  // is independent of the resolved bidi base direction. See vectorLabelPoint.
  const labelResultant = vectorLabelPoint(O, tip)
  const labelOnX = vectorLabelPoint(O, onX, { side: 'below' })
  const labelOnY = vectorLabelPoint(O, onY)
  // The rectangle vertex M sits beside the resultant tip so the two labels
  // never collide.
  const labelVertexM = clampToSurface({ x: tip.x + 14, y: tip.y + 6 })

  return (
    <svg
      viewBox="0 0 480 300"
      role="img"
      data-morph-phase={morphPhase}
      aria-label={`قوّة ${force} نيوتن بزاوية ${theta} درجة تحلّل إلى مركبة أفقية ${along.toFixed(1)} نيوتن ومركبة شاقولية ${perp.toFixed(1)} نيوتن ضمن مستطيل`}
    >
      <DiagramDefs />
      <line x1={O.x} y1={O.y} x2={440} y2={O.y} className="vec-lab__axis" />
      <line x1={O.x} y1={O.y} x2={O.x} y2={20} className="vec-lab__axis" />
      <text x={444} y={O.y - 8} textAnchor="middle" className="vec-lab__label" data-label-kind="marker">
        x
      </text>
      <text x={O.x + 16} y={18} textAnchor="middle" className="vec-lab__label" data-label-kind="marker">
        y
      </text>

      {/* Stage 1: perpendicular projections from M onto OX and OY */}
      <g
        className="vec-lab__construction"
        data-decomposition-stage="1"
        data-stage-active={stage >= 1 ? 'true' : 'false'}
      >
        <polygon
          points={`${O.x},${O.y} ${onX.x},${onX.y} ${tip.x},${tip.y} ${onY.x},${onY.y}`}
          className="vec-lab__quad-fill"
          data-shape="rectangle"
          data-anim-role="decomposition-rectangle"
        />
        <line
          x1={tip.x}
          y1={tip.y}
          x2={onX.x}
          y2={onX.y}
          className="vec-lab__dashed"
          data-anim-role="projection-line"
          data-projection-axis="x"
          data-vector-length={vectorLength(tip, onX)}
          style={buildSegmentMotionStyle(
            { start: tip, end: onX },
            prev ? { start: prev.tip, end: prev.onX } : undefined,
            { delayMs: 140, reducedMotion },
          )}
        />
        <line
          x1={tip.x}
          y1={tip.y}
          x2={onY.x}
          y2={onY.y}
          className="vec-lab__dashed"
          data-anim-role="projection-line"
          data-projection-axis="y"
          data-vector-length={vectorLength(tip, onY)}
          style={buildSegmentMotionStyle(
            { start: tip, end: onY },
            prev ? { start: prev.tip, end: prev.onY } : undefined,
            { delayMs: 190, reducedMotion },
          )}
        />
        <circle
          cx={onX.x}
          cy={onX.y}
          r={3}
          className="vec-lab__projection-foot"
          data-projection-foot="x"
          style={buildPointMotionStyle(onX, prev?.onX, { delayMs: 250, reducedMotion })}
        />
        <circle
          cx={onY.x}
          cy={onY.y}
          r={3}
          className="vec-lab__projection-foot"
          data-projection-foot="y"
          style={buildPointMotionStyle(onY, prev?.onY, { delayMs: 270, reducedMotion })}
        />
      </g>

      {/* Stage 0: original force F (diagonal OM) */}
      <g data-decomposition-stage="0" data-stage-active="true">
        <line
          x1={O.x}
          y1={O.y}
          x2={tip.x}
          y2={tip.y}
          pathLength={100}
          className="vec-lab__resultant"
          data-vector="F"
          data-anim-role="original-force"
          data-vector-length={vectorLength(O, tip)}
          data-vector-angle={vectorAngleDeg(O, tip)}
          style={buildSegmentMotionStyle(
            { start: O, end: tip },
            prev ? { start: prev.O, end: prev.tip } : undefined,
            { delayMs: 20, reducedMotion },
          )}
          markerEnd="url(#diagram-arrow)"
        />
        <text
          x={labelResultant.x}
          y={labelResultant.y}
          textAnchor="middle"
          className="vec-lab__label vec-lab__label--resultant"
          data-anim-role="vector-label"
          data-label-for="F"
          style={buildPointMotionStyle(labelResultant, prev ? vectorLabelPoint(prev.O, prev.tip) : undefined, {
            delayMs: 110,
            reducedMotion,
          })}
        >
          F
        </text>
        <text
          x={labelVertexM.x}
          y={labelVertexM.y}
          textAnchor="middle"
          className="vec-lab__label"
          data-anim-role="vector-label"
          data-label-for="M"
          style={buildPointMotionStyle(
            labelVertexM,
            prev ? clampToSurface({ x: prev.tip.x + 14, y: prev.tip.y + 6 }) : undefined,
            { delayMs: 120, reducedMotion },
          )}
        >
          M
        </text>
        <path
          d={`M ${O.x + 26} ${O.y} A 26 26 0 0 0 ${O.x + 26 * Math.cos(a)} ${O.y - 26 * Math.sin(a)}`}
          className="vec-lab__angle"
        />
      </g>

      {/* Stage 2: perpendicular component vectors F1 and F2 */}
      <g
        className="vec-lab__components-group"
        data-decomposition-stage="2"
        data-stage-active={stage >= 2 ? 'true' : 'false'}
      >
        <line
          x1={O.x}
          y1={O.y}
          x2={onX.x}
          y2={onX.y}
          pathLength={100}
          className="vec-lab__force vec-lab__force--f2"
          data-vector="F1"
          data-anim-role="component-shaft"
          data-vector-length={vectorLength(O, onX)}
          data-vector-angle={vectorAngleDeg(O, onX)}
          style={buildSegmentMotionStyle(
            { start: O, end: onX },
            prev ? { start: prev.O, end: prev.onX } : undefined,
            { delayMs: 280, reducedMotion },
          )}
          markerEnd="url(#diagram-arrow)"
        />
        <line
          x1={O.x}
          y1={O.y}
          x2={onY.x}
          y2={onY.y}
          pathLength={100}
          className="vec-lab__force vec-lab__force--f1"
          data-vector="F2"
          data-anim-role="component-shaft"
          data-vector-length={vectorLength(O, onY)}
          data-vector-angle={vectorAngleDeg(O, onY)}
          style={buildSegmentMotionStyle(
            { start: O, end: onY },
            prev ? { start: prev.O, end: prev.onY } : undefined,
            { delayMs: 340, reducedMotion },
          )}
          markerEnd="url(#diagram-arrow)"
        />
        <text
          x={labelOnX.x}
          y={labelOnX.y}
          textAnchor="middle"
          className="vec-lab__label"
          data-anim-role="vector-label"
          data-label-for="F1"
          data-label-placement="below"
          style={buildPointMotionStyle(
            labelOnX,
            prev ? vectorLabelPoint(prev.O, prev.onX, { side: 'below' }) : undefined,
            {
              delayMs: 390,
              reducedMotion,
            },
          )}
        >
          F₁
        </text>
        <text
          x={labelOnY.x}
          y={labelOnY.y}
          textAnchor="middle"
          className="vec-lab__label"
          data-anim-role="vector-label"
          data-label-for="F2"
          style={buildPointMotionStyle(labelOnY, prev ? vectorLabelPoint(prev.O, prev.onY) : undefined, {
            delayMs: 420,
            reducedMotion,
          })}
        >
          F₂
        </text>
      </g>

      <circle cx={O.x} cy={O.y} r={4} className="vec-lab__point" data-anim-role="origin" />
      <text x={O.x - 16} y={O.y + 18} textAnchor="middle" className="vec-lab__label" data-label-kind="marker">
        O
      </text>
    </svg>
  )
}

function InclineFigure({
  angle,
  weight,
  along,
  perp,
  scale,
  a,
  stage,
  reducedMotion,
  morphPhase,
}: {
  angle: number
  weight: number
  along: number
  perp: number
  scale: number
  a: number
  stage: DecompositionStage
  reducedMotion: boolean
  morphPhase: 'a' | 'b'
}) {
  // Keep the point of application inside the viewBox as the slope angle changes.
  const base: Point2D = { x: 40, y: 120 + 180 * Math.sin(a) }
  const upSlope = { x: Math.cos(a), y: -Math.sin(a) }
  const slopeEnd: Point2D = { x: base.x + 300 * upSlope.x, y: base.y + 300 * upSlope.y }
  const body: Point2D = { x: base.x + 180 * upSlope.x, y: base.y + 180 * upSlope.y }
  const downSlope = { x: -upSlope.x, y: -upSlope.y }
  const intoSurface = { x: Math.sin(a), y: Math.cos(a) }
  const wTip: Point2D = { x: body.x, y: body.y + weight * scale }
  const alongTip: Point2D = { x: body.x + along * scale * downSlope.x, y: body.y + along * scale * downSlope.y }
  const perpTip: Point2D = { x: body.x + perp * scale * intoSurface.x, y: body.y + perp * scale * intoSurface.y }

  const prevRef = useRef<{ body: Point2D; wTip: Point2D; alongTip: Point2D; perpTip: Point2D } | null>(null)
  const prev = prevRef.current

  useEffect(() => {
    prevRef.current = { body, wTip, alongTip, perpTip }
  }, [body.x, body.y, wTip.x, wTip.y, alongTip.x, alongTip.y, perpTip.x, perpTip.y])

  // Centred vector labels, placed clear of their arrowheads so their position
  // is independent of the resolved bidi base direction. See vectorLabelPoint.
  const labelW = vectorLabelPoint(body, wTip)
  const labelAlong = vectorLabelPoint(body, alongTip)
  const labelPerp = vectorLabelPoint(body, perpTip)

  return (
    <svg
      viewBox="0 0 480 300"
      role="img"
      data-morph-phase={morphPhase}
      aria-label={`جسم على مستوٍ مائل بزاوية ${angle} درجة؛ ثقله ${weight} نيوتن يحلّل إلى مركبة موازية للمستوي ${along.toFixed(1)} نيوتن ومركبة شاقولية على المستوي ${perp.toFixed(1)} نيوتن`}
    >
      <DiagramDefs />
      <line x1={base.x} y1={base.y} x2={440} y2={base.y} className="vec-lab__axis" />
      <line x1={base.x} y1={base.y} x2={slopeEnd.x} y2={slopeEnd.y} className="vec-lab__axis" />
      {/* Orthogonal incline reference axes through the body */}
      <line
        x1={body.x - 110 * downSlope.x}
        y1={body.y - 110 * downSlope.y}
        x2={body.x + 150 * downSlope.x}
        y2={body.y + 150 * downSlope.y}
        className="vec-lab__carrier"
        data-anim-role="incline-axis"
        data-axis="parallel"
      />
      <line
        x1={body.x - 35 * intoSurface.x}
        y1={body.y - 35 * intoSurface.y}
        x2={body.x + 165 * intoSurface.x}
        y2={body.y + 165 * intoSurface.y}
        className="vec-lab__carrier"
        data-anim-role="incline-axis"
        data-axis="normal"
      />
      <rect
        x={body.x - 11}
        y={body.y - 14}
        width={22}
        height={14}
        className="concurrent-forces-lab__body"
        transform={`rotate(${-angle} ${body.x} ${body.y - 7})`}
      />

      {/* Stage 1: perpendicular projections from wTip onto the parallel and normal axes */}
      <g
        className="vec-lab__construction"
        data-decomposition-stage="1"
        data-stage-active={stage >= 1 ? 'true' : 'false'}
      >
        <polygon
          points={`${body.x},${body.y} ${alongTip.x},${alongTip.y} ${wTip.x},${wTip.y} ${perpTip.x},${perpTip.y}`}
          className="vec-lab__quad-fill"
          data-shape="rectangle"
          data-anim-role="decomposition-rectangle"
        />
        <line
          x1={wTip.x}
          y1={wTip.y}
          x2={alongTip.x}
          y2={alongTip.y}
          className="vec-lab__dashed"
          data-anim-role="projection-line"
          data-projection-axis="parallel"
          data-vector-length={vectorLength(wTip, alongTip)}
          style={buildSegmentMotionStyle(
            { start: wTip, end: alongTip },
            prev ? { start: prev.wTip, end: prev.alongTip } : undefined,
            { delayMs: 140, reducedMotion },
          )}
        />
        <line
          x1={wTip.x}
          y1={wTip.y}
          x2={perpTip.x}
          y2={perpTip.y}
          className="vec-lab__dashed"
          data-anim-role="projection-line"
          data-projection-axis="normal"
          data-vector-length={vectorLength(wTip, perpTip)}
          style={buildSegmentMotionStyle(
            { start: wTip, end: perpTip },
            prev ? { start: prev.wTip, end: prev.perpTip } : undefined,
            { delayMs: 190, reducedMotion },
          )}
        />
        <circle
          cx={alongTip.x}
          cy={alongTip.y}
          r={3}
          className="vec-lab__projection-foot"
          data-projection-foot="parallel"
          style={buildPointMotionStyle(alongTip, prev?.alongTip, { delayMs: 250, reducedMotion })}
        />
        <circle
          cx={perpTip.x}
          cy={perpTip.y}
          r={3}
          className="vec-lab__projection-foot"
          data-projection-foot="normal"
          style={buildPointMotionStyle(perpTip, prev?.perpTip, { delayMs: 270, reducedMotion })}
        />
      </g>

      {/* Stage 0: vertical weight vector w */}
      <g data-decomposition-stage="0" data-stage-active="true">
        <line
          x1={body.x}
          y1={body.y}
          x2={wTip.x}
          y2={wTip.y}
          pathLength={100}
          className="vec-lab__force vec-lab__force--w"
          data-vector="w"
          data-anim-role="original-force"
          data-vector-length={vectorLength(body, wTip)}
          data-vector-angle={vectorAngleDeg(body, wTip)}
          style={buildSegmentMotionStyle(
            { start: body, end: wTip },
            prev ? { start: prev.body, end: prev.wTip } : undefined,
            { delayMs: 20, reducedMotion },
          )}
          markerEnd="url(#diagram-arrow)"
        />
        <text
          x={labelW.x}
          y={labelW.y}
          textAnchor="middle"
          className="vec-lab__label vec-lab__label--resultant"
          data-anim-role="vector-label"
          data-label-for="w"
          style={buildPointMotionStyle(labelW, prev ? vectorLabelPoint(prev.body, prev.wTip) : undefined, {
            delayMs: 120,
            reducedMotion,
          })}
        >
          w
        </text>
      </g>

      {/* Stage 2: slope-parallel component F1 and slope-normal component F2 */}
      <g
        className="vec-lab__components-group"
        data-decomposition-stage="2"
        data-stage-active={stage >= 2 ? 'true' : 'false'}
      >
        <line
          x1={body.x}
          y1={body.y}
          x2={alongTip.x}
          y2={alongTip.y}
          pathLength={100}
          className="vec-lab__force vec-lab__force--f1"
          data-vector="F1"
          data-anim-role="component-shaft"
          data-vector-length={vectorLength(body, alongTip)}
          data-vector-angle={vectorAngleDeg(body, alongTip)}
          style={buildSegmentMotionStyle(
            { start: body, end: alongTip },
            prev ? { start: prev.body, end: prev.alongTip } : undefined,
            { delayMs: 280, reducedMotion },
          )}
          markerEnd="url(#diagram-arrow)"
        />
        <line
          x1={body.x}
          y1={body.y}
          x2={perpTip.x}
          y2={perpTip.y}
          pathLength={100}
          className="vec-lab__force vec-lab__force--f2"
          data-vector="F2"
          data-anim-role="component-shaft"
          data-vector-length={vectorLength(body, perpTip)}
          data-vector-angle={vectorAngleDeg(body, perpTip)}
          style={buildSegmentMotionStyle(
            { start: body, end: perpTip },
            prev ? { start: prev.body, end: prev.perpTip } : undefined,
            { delayMs: 340, reducedMotion },
          )}
          markerEnd="url(#diagram-arrow)"
        />
        <text
          x={labelAlong.x}
          y={labelAlong.y}
          textAnchor="middle"
          className="vec-lab__label"
          data-anim-role="vector-label"
          data-label-for="F1"
          style={buildPointMotionStyle(labelAlong, prev ? vectorLabelPoint(prev.body, prev.alongTip) : undefined, {
            delayMs: 390,
            reducedMotion,
          })}
        >
          F₁
        </text>
        <text
          x={labelPerp.x}
          y={labelPerp.y}
          textAnchor="middle"
          className="vec-lab__label"
          data-anim-role="vector-label"
          data-label-for="F2"
          style={buildPointMotionStyle(labelPerp, prev ? vectorLabelPoint(prev.body, prev.perpTip) : undefined, {
            delayMs: 420,
            reducedMotion,
          })}
        >
          F₂
        </text>
      </g>

      <circle cx={body.x} cy={body.y} r={3.5} className="vec-lab__point" data-anim-role="origin" />
      <path
        d={`M ${base.x + 50} ${base.y} A 50 50 0 0 0 ${base.x + 50 * Math.cos(a)} ${base.y - 50 * Math.sin(a)}`}
        className="vec-lab__angle"
      />
      <text x={base.x + 60} y={base.y - 10} textAnchor="middle" className="vec-lab__label" data-label-kind="marker">
        a
      </text>
    </svg>
  )
}
