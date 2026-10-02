import { useMemo, useState } from 'react'
import { DiagramDefs, MathFormula, ScientificValue } from '@/scientific'
import { LiveStatus } from '@/components/LiveStatus'
import type { InteractiveProps } from './registry'

/* ============================================================================
   مختبر متوازي الأضلاع — إضافة من المنصة حول الصفحتين 57–59
   ----------------------------------------------------------------------------
   forces → diagram → resultant → calculation → conclusion.
   The student changes F₁، F₂ والزاوية ويراقب بناء متوازي الأضلاع وقطره
   (المحصّلة) حيًّا، مع مقياس رسم يُختار كما يختاره الكتاب، ومع حالة خاصة
   للزاوية القائمة تُظهر قانون فيتاغورث بأرقام الطالب نفسها.
   ========================================================================= */

const rad = (deg: number) => (deg * Math.PI) / 180

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

  const geometry = useMemo(() => {
    const resultant = Math.sqrt(f1 * f1 + f2 * f2 + 2 * f1 * f2 * Math.cos(rad(angle)))
    const direction = (Math.atan2(f1 * Math.sin(rad(angle)), f2 + f1 * Math.cos(rad(angle))) * 180) / Math.PI
    const perCm = scaleFor(Math.max(f1, f2, resultant))
    const pxPerCm = 26
    const s = pxPerCm / perCm
    const O = { x: 70, y: 250 }
    const u1 = { x: Math.cos(rad(angle)), y: -Math.sin(rad(angle)) }
    const u2 = { x: 1, y: 0 }
    const P1 = { x: O.x + f1 * s * u1.x, y: O.y + f1 * s * u1.y }
    const P2 = { x: O.x + f2 * s * u2.x, y: O.y + f2 * s * u2.y }
    const M = { x: O.x + (f1 * u1.x + f2 * u2.x) * s, y: O.y + (f1 * u1.y + f2 * u2.y) * s }
    return { resultant, direction, perCm, O, P1, P2, M }
  }, [f1, f2, angle])

  const { resultant, direction, perCm, O, P1, P2, M } = geometry
  const rightAngle = angle === 90
  const advance = () => setStage((current) => (reducedMotion ? 2 : Math.min(current + 1, 2)))

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
          <button type="button" className="button button--quiet" onClick={() => setStage(0)}>
            أعد البناء
          </button>
        </div>
      </header>

      <div className="parallelogram-lab__controls">
        <label className="lab__range">
          <span>
            شدّة القوّة الأولى <ScientificValue value={f1} unit="N" size="sm" />
          </span>
          <input type="range" min={1} max={100} step={1} value={f1} onChange={(event) => { setF1(Number(event.target.value)); setStage(2) }} aria-label="شدّة القوّة الأولى نيوتن" aria-valuetext={`${f1} نيوتن`} />
        </label>
        <label className="lab__range">
          <span>
            شدّة القوّة الثانية <ScientificValue value={f2} unit="N" size="sm" />
          </span>
          <input type="range" min={1} max={100} step={1} value={f2} onChange={(event) => { setF2(Number(event.target.value)); setStage(2) }} aria-label="شدّة القوّة الثانية نيوتن" aria-valuetext={`${f2} نيوتن`} />
        </label>
        <label className="lab__range">
          <span>
            الزاوية بين الحاملين <ScientificValue value={angle} unit="°" size="sm" />
          </span>
          <input type="range" min={15} max={165} step={15} value={angle} onChange={(event) => { setAngle(Number(event.target.value)); setStage(2) }} aria-label="الزاوية بين حاملي القوتين بالدرجات" aria-valuetext={`${angle} درجة`} />
        </label>
      </div>

      <div className="parallelogram-lab__figure">
        <svg viewBox="0 0 480 300" role="img" aria-label={`متوازي أضلاع للقوتين ${f1} و${f2} نيوتن بزاوية ${angle} درجة، والمحصلة ${resultant.toFixed(1)} نيوتن`}>
          <DiagramDefs />
          {/* lines of action */}
          <line x1={O.x - (P1.x - O.x) * 0.35} y1={O.y - (P1.y - O.y) * 0.35} x2={P1.x} y2={P1.y} className="vec-lab__carrier" data-stage-visible={0} />
          <line x1={O.x - (P2.x - O.x) * 0.35} y1={O.y - (P2.y - O.y) * 0.35} x2={P2.x} y2={P2.y} className="vec-lab__carrier" data-stage-visible={0} />
          {/* the two forces */}
          <line x1={O.x} y1={O.y} x2={P1.x} y2={P1.y} className="vec-lab__force vec-lab__force--f1" markerEnd="url(#diagram-arrow)" />
          <line x1={O.x} y1={O.y} x2={P2.x} y2={P2.y} className="vec-lab__force vec-lab__force--f2" markerEnd="url(#diagram-arrow)" />
          <text x={P1.x + 6} y={P1.y - 4} className="vec-lab__label">F₁</text>
          <text x={P2.x + 4} y={P2.y + 14} className="vec-lab__label">F₂</text>
          {/* parallelogram completion */}
          {stage >= 1 ? (
            <g className="vec-lab__construction">
              <line x1={P1.x} y1={P1.y} x2={M.x} y2={M.y} className="vec-lab__dashed" />
              <line x1={P2.x} y1={P2.y} x2={M.x} y2={M.y} className="vec-lab__dashed" />
              <text x={M.x + 6} y={M.y - 4} className="vec-lab__label">M</text>
            </g>
          ) : null}
          {/* resultant */}
          {stage >= 2 ? (
            <g className="vec-lab__resultant-group">
              <line x1={O.x} y1={O.y} x2={M.x} y2={M.y} className="vec-lab__resultant" markerEnd="url(#diagram-arrow)" />
              <text x={(O.x + M.x) / 2 - 14} y={(O.y + M.y) / 2 - 6} className="vec-lab__label vec-lab__label--resultant">F</text>
            </g>
          ) : null}
          {angle !== 90 ? (
            <path d={`M ${O.x + 26} ${O.y} A 26 26 0 0 0 ${O.x + 26 * Math.cos(rad(angle))} ${O.y - 26 * Math.sin(rad(angle))}`} className="vec-lab__angle" />
          ) : (
            <path d={`M ${O.x + 18} ${O.y} L ${O.x + 18} ${O.y - 18} L ${O.x} ${O.y - 18}`} className="vec-lab__angle" />
          )}
          <circle cx={O.x} cy={O.y} r={4} className="vec-lab__point" />
          <text x={O.x - 16} y={O.y + 16} className="vec-lab__label">O</text>
        </svg>
      </div>

      <div className="lab__measurements">
        <div>
          <span>مقياس الرسم المختار</span>
          <strong className="lab__measurement-text">كل 1 cm يمثل {perCm} N</strong>
        </div>
        <div>
          <span>طول شعاع القوّة الأولى</span>
          <ScientificValue value={Number((f1 / perCm).toFixed(2))} unit="cm" />
        </div>
        <div>
          <span>طول شعاع القوّة الثانية</span>
          <ScientificValue value={Number((f2 / perCm).toFixed(2))} unit="cm" />
        </div>
        <div>
          <span>شدّة المحصّلة F</span>
          <ScientificValue value={Number(resultant.toFixed(1))} unit="N" size="lg" />
        </div>
        <div>
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
