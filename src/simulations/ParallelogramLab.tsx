import { useEffect, useMemo, useRef, useState } from 'react'
import { DiagramDefs, MathFormula, ScientificValue } from '@/scientific'
import { LiveStatus } from '@/components/LiveStatus'
import type { InteractiveProps } from './registry'
import {
  buildPointMotionStyle,
  buildSegmentMotionStyle,
  vectorAngleDeg,
  vectorLength,
  type Point2D,
} from './vectorAnimation'

/* ============================================================================
   مختبر متوازي الأضلاع — إضافة من المنصة حول الصفحتين 57–59
   ----------------------------------------------------------------------------
   forces → diagram → resultant → calculation → conclusion.
   The student changes F₁، F₂ والزاوية ويراقب بناء متوازي الأضلاع وقطره
   (المحصّلة) حيًّا، مع مقياس رسم يُختار كما يختاره الكتاب، ومع حالة خاصة
   للزاوية القائمة تُظهر قانون فيتاغورث بأرقام الطالب نفسها.
   ========================================================================= */

const rad = (deg: number) => (deg * Math.PI) / 180

const CONSTRUCTION_STAGES = [
  'رسم شعاعي القوّتين F₁ وF₂ من نقطة التأثير O ومدّ الحاملين.',
  'إنشاء الضلعين الموازيين من نهايتي الشعاعين حتى الرأس المقابل M.',
  'رسم القطر OM المارّ من نقطة التلاقي O ليمثّل المحصّلة F.',
] as const

type ChangedParam = 'init' | 'stage' | 'f1' | 'f2' | 'angle'
type AnimTrigger = 'construct' | 'param'

/** Picks a drawing scale the way the book does: «كل 1 cm يمثل X N». */
function scaleFor(maxNewton: number): number {
  if (maxNewton > 40) return 20
  if (maxNewton > 20) return 10
  if (maxNewton > 8) return 5
  return 1
}

export default function ParallelogramLab({ reducedMotion }: InteractiveProps) {
  const [f1, setF1] = useState(4)
  const [f2, setF2] = useState(3)
  const [angle, setAngle] = useState(60)
  const [stage, setStage] = useState(reducedMotion ? 2 : 0)
  const [lastChanged, setLastChanged] = useState<ChangedParam>('init')
  const [animTrigger, setAnimTrigger] = useState<AnimTrigger>('construct')
  const [revision, setRevision] = useState(0)

  const geometry = useMemo(() => {
    const resultant = Math.sqrt(f1 * f1 + f2 * f2 + 2 * f1 * f2 * Math.cos(rad(angle)))
    const direction = (Math.atan2(f1 * Math.sin(rad(angle)), f2 + f1 * Math.cos(rad(angle))) * 180) / Math.PI
    const perCm = scaleFor(Math.max(f1, f2, resultant))
    const pxPerCm = 26
    const s = pxPerCm / perCm
    const O: Point2D = { x: 70, y: 250 }
    const u1 = { x: Math.cos(rad(angle)), y: -Math.sin(rad(angle)) }
    const u2 = { x: 1, y: 0 }
    const P1: Point2D = { x: O.x + f1 * s * u1.x, y: O.y + f1 * s * u1.y }
    const P2: Point2D = { x: O.x + f2 * s * u2.x, y: O.y + f2 * s * u2.y }
    const M: Point2D = { x: O.x + (f1 * u1.x + f2 * u2.x) * s, y: O.y + (f1 * u1.y + f2 * u2.y) * s }
    return { resultant, direction, perCm, O, P1, P2, M }
  }, [f1, f2, angle])

  const prevGeometryRef = useRef<{ O: Point2D; P1: Point2D; P2: Point2D; M: Point2D } | null>(null)
  const prev = prevGeometryRef.current

  const { resultant, direction, perCm, O, P1, P2, M } = geometry

  useEffect(() => {
    prevGeometryRef.current = { O, P1, P2, M }
  }, [O, P1, P2, M])

  const rightAngle = angle === 90
  const shapeKind = rightAngle ? (f1 === f2 ? 'square' : 'rectangle') : 'parallelogram'

  const advance = () => {
    setStage((current) => (reducedMotion ? 2 : Math.min(current + 1, 2)))
    setLastChanged('stage')
    setAnimTrigger('construct')
    setRevision((current) => current + 1)
  }

  const resetConstruction = () => {
    setStage(0)
    setLastChanged('stage')
    setAnimTrigger('construct')
    setRevision((current) => current + 1)
  }

  const updateParam = (param: 'f1' | 'f2' | 'angle', value: number) => {
    if (param === 'f1') setF1(value)
    else if (param === 'f2') setF2(value)
    else setAngle(value)
    setStage(2)
    setLastChanged(param)
    setAnimTrigger('param')
    setRevision((current) => current + 1)
  }

  const carrier1Start: Point2D = { x: O.x - (P1.x - O.x) * 0.35, y: O.y - (P1.y - O.y) * 0.35 }
  const carrier2Start: Point2D = { x: O.x - (P2.x - O.x) * 0.35, y: O.y - (P2.y - O.y) * 0.35 }
  const diagMid: Point2D = { x: (O.x + M.x) / 2, y: (O.y + M.y) / 2 }
  const prevDiagMid: Point2D | undefined = prev ? { x: (prev.O.x + prev.M.x) / 2, y: (prev.O.y + prev.M.y) / 2 } : undefined

  const stageLabel =
    stage === 0
      ? 'المرحلة 1 من 3: شعاعا القوّتين وحاملاهما'
      : stage === 1
        ? 'المرحلة 2 من 3: اكتمل متوازي الأضلاع'
        : 'المرحلة 3 من 3: رُسم القطر الذي يمثّل المحصّلة'
  const announcement = `${stageLabel}. المحصّلة ${resultant.toFixed(1)} نيوتن، ووجهتها ${direction.toFixed(1)} درجة عن حامل القوّة الثانية.`

  return (
    <section
      className={`lab parallelogram-lab ${reducedMotion ? 'lab--still' : ''}`}
      data-f1={f1}
      data-f2={f2}
      data-angle={angle}
      data-resultant={resultant.toFixed(1)}
      data-stage={stage}
      data-anim-mode={reducedMotion ? 'still' : 'animated'}
      data-anim-trigger={animTrigger}
      data-last-changed={lastChanged}
      data-revision={revision}
      aria-labelledby="parallelogram-lab-title"
    >
      <header className="lab__header">
        <div>
          <p className="lab__phase">إضافة من المنصة · مختبر متوازي الأضلاع</p>
          <h3 id="parallelogram-lab-title">قوّتان متلاقيتان: كيف نبني المحصّلة؟</h3>
        </div>
        <div className="lab__actions">
          <button type="button" className="button button--secondary" onClick={advance}>
            {stage === 0 ? 'ارسم القوّتين ومدّ الحاملين' : stage === 1 ? 'أكمل متوازي الأضلاع وارسم القطر' : 'البناء مكتمل'}
          </button>
          <button type="button" className="button button--quiet" onClick={resetConstruction}>
            أعد البناء
          </button>
        </div>
      </header>

      <ol className="ionic-bond-lab__stages vec-lab__stages" aria-label="مراحل البناء الهندسي للمحصّلة">
        {CONSTRUCTION_STAGES.map((label, index) => (
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

      <div className="parallelogram-lab__controls">
        <label className="lab__range">
          <span>
            شدّة القوّة الأولى <ScientificValue value={f1} unit="N" size="sm" />
          </span>
          <input
            type="range"
            min={1}
            max={100}
            step={1}
            value={f1}
            onChange={(event) => updateParam('f1', Number(event.target.value))}
            aria-label="شدّة القوّة الأولى نيوتن"
            aria-valuetext={`${f1} نيوتن`}
          />
        </label>
        <label className="lab__range">
          <span>
            شدّة القوّة الثانية <ScientificValue value={f2} unit="N" size="sm" />
          </span>
          <input
            type="range"
            min={1}
            max={100}
            step={1}
            value={f2}
            onChange={(event) => updateParam('f2', Number(event.target.value))}
            aria-label="شدّة القوّة الثانية نيوتن"
            aria-valuetext={`${f2} نيوتن`}
          />
        </label>
        <label className="lab__range">
          <span>
            الزاوية بين الحاملين <ScientificValue value={angle} unit="°" size="sm" />
          </span>
          <input
            type="range"
            min={15}
            max={165}
            step={15}
            value={angle}
            onChange={(event) => updateParam('angle', Number(event.target.value))}
            aria-label="الزاوية بين حاملي القوتين بالدرجات"
            aria-valuetext={`${angle} درجة`}
          />
        </label>
      </div>

      <div className="parallelogram-lab__figure">
        <svg
          viewBox="0 0 480 300"
          role="img"
          data-morph-phase={revision % 2 === 0 ? 'a' : 'b'}
          aria-label={`متوازي أضلاع للقوتين ${f1} و${f2} نيوتن بزاوية ${angle} درجة، والمحصلة ${resultant.toFixed(1)} نيوتن`}
        >
          <DiagramDefs />
          {/* lines of action */}
          <line
            x1={carrier1Start.x}
            y1={carrier1Start.y}
            x2={P1.x}
            y2={P1.y}
            className="vec-lab__carrier"
            data-stage-visible={0}
            data-anim-role="carrier-line"
            style={buildSegmentMotionStyle(
              { start: O, end: P1 },
              prev ? { start: prev.O, end: prev.P1 } : undefined,
              { delayMs: 0, reducedMotion },
            )}
          />
          <line
            x1={carrier2Start.x}
            y1={carrier2Start.y}
            x2={P2.x}
            y2={P2.y}
            className="vec-lab__carrier"
            data-stage-visible={0}
            data-anim-role="carrier-line"
            style={buildSegmentMotionStyle(
              { start: O, end: P2 },
              prev ? { start: prev.O, end: prev.P2 } : undefined,
              { delayMs: 60, reducedMotion },
            )}
          />
          {/* the two forces */}
          <line
            x1={O.x}
            y1={O.y}
            x2={P1.x}
            y2={P1.y}
            pathLength={100}
            className="vec-lab__force vec-lab__force--f1"
            data-vector="F1"
            data-anim-role="vector-shaft"
            data-vector-length={vectorLength(O, P1)}
            data-vector-angle={vectorAngleDeg(O, P1)}
            style={buildSegmentMotionStyle(
              { start: O, end: P1 },
              prev ? { start: prev.O, end: prev.P1 } : undefined,
              { delayMs: 40, reducedMotion },
            )}
            markerEnd="url(#diagram-arrow)"
          />
          <line
            x1={O.x}
            y1={O.y}
            x2={P2.x}
            y2={P2.y}
            pathLength={100}
            className="vec-lab__force vec-lab__force--f2"
            data-vector="F2"
            data-anim-role="vector-shaft"
            data-vector-length={vectorLength(O, P2)}
            data-vector-angle={vectorAngleDeg(O, P2)}
            style={buildSegmentMotionStyle(
              { start: O, end: P2 },
              prev ? { start: prev.O, end: prev.P2 } : undefined,
              { delayMs: 140, reducedMotion },
            )}
            markerEnd="url(#diagram-arrow)"
          />
          <text
            x={P1.x + 6}
            y={P1.y - 4}
            className="vec-lab__label"
            data-anim-role="vector-label"
            style={buildPointMotionStyle(P1, prev?.P1, { delayMs: 200, reducedMotion })}
          >
            F₁
          </text>
          <text
            x={P2.x + 4}
            y={P2.y + 14}
            className="vec-lab__label"
            data-anim-role="vector-label"
            style={buildPointMotionStyle(P2, prev?.P2, { delayMs: 260, reducedMotion })}
          >
            F₂
          </text>
          {/* parallelogram completion */}
          {stage >= 1 ? (
            <g className="vec-lab__construction" data-construction-stage="1">
              <polygon
                points={`${O.x},${O.y} ${P1.x},${P1.y} ${M.x},${M.y} ${P2.x},${P2.y}`}
                className="vec-lab__quad-fill"
                data-shape={shapeKind}
                data-anim-role="parallelogram-surface"
              />
              <line
                x1={P1.x}
                y1={P1.y}
                x2={M.x}
                y2={M.y}
                className="vec-lab__dashed"
                data-anim-role="parallel-side"
                data-from="P1"
                data-vector-length={vectorLength(P1, M)}
                style={buildSegmentMotionStyle(
                  { start: P1, end: M },
                  prev ? { start: prev.P1, end: prev.M } : undefined,
                  { delayMs: 40, reducedMotion },
                )}
              />
              <line
                x1={P2.x}
                y1={P2.y}
                x2={M.x}
                y2={M.y}
                className="vec-lab__dashed"
                data-anim-role="parallel-side"
                data-from="P2"
                data-vector-length={vectorLength(P2, M)}
                style={buildSegmentMotionStyle(
                  { start: P2, end: M },
                  prev ? { start: prev.P2, end: prev.M } : undefined,
                  { delayMs: 130, reducedMotion },
                )}
              />
              <circle
                cx={M.x}
                cy={M.y}
                r={3.5}
                className="vec-lab__vertex"
                data-vertex="M"
                data-anim-role="vertex"
                style={buildPointMotionStyle(M, prev?.M, { delayMs: 240, reducedMotion })}
              />
              <text
                x={M.x + 6}
                y={M.y - 4}
                className="vec-lab__label"
                data-anim-role="vector-label"
                style={buildPointMotionStyle(M, prev?.M, { delayMs: 260, reducedMotion })}
              >
                M
              </text>
            </g>
          ) : null}
          {/* resultant */}
          {stage >= 2 ? (
            <g className="vec-lab__resultant-group" data-construction-stage="2">
              <line
                x1={O.x}
                y1={O.y}
                x2={M.x}
                y2={M.y}
                pathLength={100}
                className="vec-lab__resultant"
                data-vector="F"
                data-anim-role="resultant-shaft"
                data-vector-length={vectorLength(O, M)}
                data-vector-angle={vectorAngleDeg(O, M)}
                style={buildSegmentMotionStyle(
                  { start: O, end: M },
                  prev ? { start: prev.O, end: prev.M } : undefined,
                  { delayMs: 40, reducedMotion },
                )}
                markerEnd="url(#diagram-arrow)"
              />
              <text
                x={diagMid.x - 14}
                y={diagMid.y - 6}
                className="vec-lab__label vec-lab__label--resultant"
                data-anim-role="resultant-label"
                style={buildPointMotionStyle(diagMid, prevDiagMid, { delayMs: 240, reducedMotion })}
              >
                F
              </text>
            </g>
          ) : null}
          {angle !== 90 ? (
            <path
              d={`M ${O.x + 26} ${O.y} A 26 26 0 0 0 ${O.x + 26 * Math.cos(rad(angle))} ${O.y - 26 * Math.sin(rad(angle))}`}
              className="vec-lab__angle"
            />
          ) : (
            <path
              d={`M ${O.x + 18} ${O.y} L ${O.x + 18} ${O.y - 18} L ${O.x} ${O.y - 18}`}
              className="vec-lab__angle"
            />
          )}
          <circle cx={O.x} cy={O.y} r={4} className="vec-lab__point" data-anim-role="origin" />
          <text x={O.x - 16} y={O.y + 16} className="vec-lab__label">
            O
          </text>
        </svg>
      </div>

      <div className="lab__measurements">
        <div>
          <span>مقياس الرسم المختار</span>
          <strong className="lab__measurement-text">كل 1 cm يمثل {perCm} N</strong>
        </div>
        <div data-highlight={lastChanged === 'f1' ? 'true' : undefined}>
          <span>طول شعاع القوّة الأولى</span>
          <ScientificValue value={Number((f1 / perCm).toFixed(2))} unit="cm" />
        </div>
        <div data-highlight={lastChanged === 'f2' ? 'true' : undefined}>
          <span>طول شعاع القوّة الثانية</span>
          <ScientificValue value={Number((f2 / perCm).toFixed(2))} unit="cm" />
        </div>
        <div data-highlight={stage === 2 || lastChanged !== 'init' ? 'true' : undefined}>
          <span>شدّة المحصّلة F</span>
          <ScientificValue value={Number(resultant.toFixed(1))} unit="N" size="lg" />
        </div>
        <div data-highlight={lastChanged === 'angle' ? 'true' : undefined}>
          <span>جهتها: الزاوية مع حامل F₂</span>
          <ScientificValue value={Number(direction.toFixed(1))} unit="°" />
        </div>
        <div>
          <span>نقطة التأثير</span>
          <strong className="lab__measurement-text">النقطة المشتركة O</strong>
        </div>
      </div>

      {rightAngle ? (
        <div className="parallelogram-lab__pythagoras" data-pythagoras="true">
          <MathFormula
            display="block"
            tex={`F = \\sqrt{F_1^2 + F_2^2} = \\sqrt{(${f1})^2 + (${f2})^2} = ${Number(resultant.toFixed(1))}\\ \\text{N}`}
          />
        </div>
      ) : null}

      <LiveStatus message={announcement} />

      <p className="lab__conclusion">
        <strong>الاستنتاج:</strong> المحصّلة قوّة وحيدة تحل محل القوّتين معاً: حاملها قطر متوازي الأضلاع المارّ من نقطة
        تلاقيهما، وجهتها من O إلى الرأس المقابل M، وشدّتها تُمثَّل بطول القطر. جرّب زاوية 90° لتظهر حالة المستطيل وقانون
        فيتاغورث، ولاحظ: كلما اتسعت الزاوية عن 90° قلت المحصّلة عند ثبات الشدّتين.
      </p>
    </section>
  )
}
