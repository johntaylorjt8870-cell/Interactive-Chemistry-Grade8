import { useMemo, useState } from 'react'
import { MathFormula, ScientificValue } from '@/scientific'
import { LabSymbol, PhysicsLabDefs, usePhysicsLabArrowIds } from './PhysicsLabSvg'
import type { InteractiveProps } from './registry'

/*
 * The platform construction follows the book's parallelogram method (pp. 57–59).
 * The textbook's 4 N / 3 N / 60° example and its 60 N / 80 N right-angle case
 * remain unchanged; computed readouts are explicitly identified as platform math.
 */

const rad = (deg: number) => (deg * Math.PI) / 180

type Point = { x: number; y: number }

/** Picks the textbook-style drawing scale: «كل 1 cm يمثل X N». */
function scaleFor(maxNewton: number): number {
  if (maxNewton > 40) return 20
  if (maxNewton > 20) return 10
  if (maxNewton > 8) return 5
  return 1
}

function linePath(start: Point, end: Point) {
  return `M ${start.x} ${start.y} L ${end.x} ${end.y}`
}

export default function ParallelogramLab({ interactiveId, reducedMotion }: InteractiveProps) {
  const [f1, setF1] = useState(4)
  const [f2, setF2] = useState(3)
  const [angle, setAngle] = useState(60)
  const [stage, setStage] = useState(reducedMotion ? 2 : 0)
  const arrows = usePhysicsLabArrowIds('parallelogram')

  const geometry = useMemo(() => {
    const theta = rad(angle)
    const resultantX = f2 + f1 * Math.cos(theta)
    const resultantY = f1 * Math.sin(theta)
    const resultant = Math.hypot(resultantX, resultantY)
    const direction = (Math.atan2(resultantY, resultantX) * 180) / Math.PI
    const perCm = scaleFor(Math.max(f1, f2, resultant))
    const pxPerNewton = 32 / perCm
    const O = { x: 220, y: 340 }
    const P1 = { x: O.x + f1 * pxPerNewton * Math.cos(theta), y: O.y - f1 * pxPerNewton * Math.sin(theta) }
    const P2 = { x: O.x + f2 * pxPerNewton, y: O.y }
    const M = { x: P1.x + P2.x - O.x, y: P1.y + P2.y - O.y }
    const resultLength = Math.hypot(M.x - O.x, M.y - O.y) || 1
    const resultNormal = { x: -(M.y - O.y) / resultLength, y: (M.x - O.x) / resultLength }
    const resultLabel = {
      x: O.x + (M.x - O.x) * 0.55 + resultNormal.x * 15,
      y: O.y + (M.y - O.y) * 0.55 + resultNormal.y * 15,
    }
    const angleLabel = {
      x: O.x + 48 * Math.cos(theta / 2),
      y: O.y - 48 * Math.sin(theta / 2),
    }
    return { resultant, direction, perCm, O, P1, P2, M, resultLabel, angleLabel }
  }, [f1, f2, angle])

  const { resultant, direction, perCm, O, P1, P2, M, resultLabel, angleLabel } = geometry
  const rightAngle = angle === 90
  const bookExample = f1 === 4 && f2 === 3 && angle === 60
  const bookRightAngleExample = f1 === 60 && f2 === 80 && angle === 90
  const advance = () => setStage((current) => (reducedMotion ? 2 : Math.min(current + 1, 2)))

  return (
    <section
      className={`lab physics-lab parallelogram-lab ${reducedMotion ? 'lab--still' : ''}`}
      data-f1={f1}
      data-f2={f2}
      data-angle={angle}
      data-resultant={resultant.toFixed(1)}
      data-direction={direction.toFixed(1)}
      data-scale-per-cm={perCm}
      data-stage={stage}
      data-interactive={interactiveId}
      aria-labelledby="parallelogram-lab-title"
    >
      <header className="lab__header">
        <div>
          <p className="lab__phase">إضافة من المنصة · إنشاء هندسي لمحصّلة القوتين</p>
          <h3 id="parallelogram-lab-title">قوّتان متلاقيتان: كيف نبني المحصّلة؟</h3>
        </div>
        <div className="lab__actions">
          <button type="button" className="button button--secondary" onClick={advance} disabled={stage === 2}>
            {stage === 0 ? 'انقل القوتين وأكمل المتوازي' : stage === 1 ? 'ارسم قطر المحصّلة' : 'اكتمل البناء'}
          </button>
          <button type="button" className="button button--quiet" onClick={() => setStage(0)}>
            أعد البناء
          </button>
        </div>
      </header>

      <p className="physics-lab__stage" aria-live="polite">
        {stage === 0 ? <>الخطوة 1: القوتان تبدآن من النقطة المشتركة <LabSymbol>O</LabSymbol>.</> : stage === 1 ? 'الخطوة 2: انقل كل قوة موازيةً لنفسها لتكوين الضلعين الآخرين.' : <>الخطوة 3: القطر من <LabSymbol>O</LabSymbol> إلى <LabSymbol>M</LabSymbol> هو المحصّلة.</>}
      </p>

      <div className="parallelogram-lab__controls">
        <label className="lab__range">
          <span>
            شدّة القوّة الأولى <LabSymbol>F₁</LabSymbol> <ScientificValue value={f1} unit="N" size="sm" />
          </span>
          <input type="range" min={1} max={100} step={1} value={f1} onChange={(event) => setF1(Number(event.target.value))} aria-label="شدّة القوّة الأولى نيوتن" />
        </label>
        <label className="lab__range">
          <span>
            شدّة القوّة الثانية <LabSymbol>F₂</LabSymbol> <ScientificValue value={f2} unit="N" size="sm" />
          </span>
          <input type="range" min={1} max={100} step={1} value={f2} onChange={(event) => setF2(Number(event.target.value))} aria-label="شدّة القوّة الثانية نيوتن" />
        </label>
        <label className="lab__range">
          <span>
            الزاوية بين القوّتين <ScientificValue value={angle} unit="°" size="sm" />
          </span>
          <input type="range" min={15} max={165} step={15} value={angle} onChange={(event) => setAngle(Number(event.target.value))} aria-label="الزاوية بين القوتين بالدرجات" />
        </label>
      </div>

      <figure className="parallelogram-lab__figure physics-lab__figure">
        <svg
          viewBox="0 0 620 380"
          role="img"
          aria-label={`القوة الأولى ${f1} نيوتن والثانية ${f2} نيوتن بينهما ${angle} درجة. متوازي الأضلاع ورأسه M، والمحصلة R مقدارها ${resultant.toFixed(1)} نيوتن واتجاهها ${direction.toFixed(1)} درجة من اتجاه القوة الثانية.`}
        >
          <PhysicsLabDefs arrows={arrows} />

          {/* Input vectors: both tails meet at O; their arrowheads show direction. */}
          <line x1={O.x} y1={O.y} x2={P1.x} y2={P1.y} className="vec-lab__force vec-lab__force--f1" markerEnd={`url(#${arrows.f1})`} data-force-vector="F1" />
          <line x1={O.x} y1={O.y} x2={P2.x} y2={P2.y} className="vec-lab__force vec-lab__force--f2" markerEnd={`url(#${arrows.f2})`} data-force-vector="F2" />
          <text x={P1.x + (Math.cos(rad(angle)) < 0 ? -29 : 8)} y={P1.y - 9} className="vec-lab__label">F₁</text>
          <text x={P2.x + 8} y={P2.y + 19} className="vec-lab__label">F₂</text>

          {/* The two translated sides are drawn from their vector tips to M. */}
          <path
            d={linePath(P1, M)}
            pathLength={1}
            className="vec-lab__build-line vec-lab__build-line--f2"
            data-visible={stage >= 1 ? 'true' : 'false'}
            markerEnd={`url(#${arrows.f2})`}
            data-construction="copy-f2"
          />
          <path
            d={linePath(P2, M)}
            pathLength={1}
            className="vec-lab__build-line vec-lab__build-line--f1"
            data-visible={stage >= 1 ? 'true' : 'false'}
            markerEnd={`url(#${arrows.f1})`}
            data-construction="copy-f1"
          />
          <text x={(P1.x + M.x) / 2 + 7} y={(P1.y + M.y) / 2 - 7} className="vec-lab__label vec-lab__construction-label" data-visible={stage >= 1 ? 'true' : 'false'}>F₂</text>
          <text x={(P2.x + M.x) / 2 - 25} y={(P2.y + M.y) / 2 - 7} className="vec-lab__label vec-lab__construction-label" data-visible={stage >= 1 ? 'true' : 'false'}>F₁</text>

          {/* Resultant: its line is drawn from O to the opposite vertex M. */}
          <path
            d={linePath(O, M)}
            pathLength={1}
            className="vec-lab__resultant vec-lab__vector-reveal"
            data-visible={stage >= 2 ? 'true' : 'false'}
            markerEnd={`url(#${arrows.resultant})`}
            data-force-vector="R"
          />
          <text x={resultLabel.x} y={resultLabel.y} className="vec-lab__label vec-lab__label--resultant vec-lab__construction-label" data-visible={stage >= 2 ? 'true' : 'false'}>R</text>
          <circle cx={M.x} cy={M.y} r="4" className="vec-lab__point vec-lab__construction-label" data-visible={stage >= 1 ? 'true' : 'false'} />
          <text x={M.x + 7} y={M.y + 17} className="vec-lab__label vec-lab__construction-label" data-visible={stage >= 1 ? 'true' : 'false'}>M</text>

          {/* Angle between F1 and F2. */}
          {rightAngle ? (
            <path d={`M ${O.x + 19} ${O.y} L ${O.x + 19} ${O.y - 19} L ${O.x} ${O.y - 19}`} className="vec-lab__angle" />
          ) : (
            <path d={`M ${O.x + 34} ${O.y} A 34 34 0 0 0 ${O.x + 34 * Math.cos(rad(angle))} ${O.y - 34 * Math.sin(rad(angle))}`} className="vec-lab__angle" />
          )}
          <text x={angleLabel.x} y={angleLabel.y - 4} className="vec-lab__label">θ</text>
          <circle cx={O.x} cy={O.y} r="5" className="vec-lab__point" />
          <text x={O.x - 20} y={O.y + 17} className="vec-lab__label">O</text>
        </svg>
        <figcaption className="physics-lab__figure-caption">الضلعان المنقولان يظلان موازيين للقوتين الأصليتين؛ القطر يبدأ من <LabSymbol>O</LabSymbol> وينتهي عند الرأس المقابل <LabSymbol>M</LabSymbol>.</figcaption>
      </figure>

      <div className="lab__measurements physics-lab__readouts" role="group" aria-label="مقادير واتجاهات البناء الهندسي">
        <div>
          <span><LabSymbol>F₁</LabSymbol></span>
          <ScientificValue value={f1} unit="N" />
        </div>
        <div>
          <span><LabSymbol>F₂</LabSymbol></span>
          <ScientificValue value={f2} unit="N" />
        </div>
        <div>
          <span>الزاوية بينهما</span>
          <ScientificValue value={angle} unit="°" />
        </div>
        <div>
          <span>مقياس الرسم</span>
          <strong className="lab__measurement-text">كل <LabSymbol>1 cm</LabSymbol> يمثل <LabSymbol>{perCm} N</LabSymbol></strong>
        </div>
        <div>
          <span>طول ضلع <LabSymbol>F₁</LabSymbol> على الرسم</span>
          <ScientificValue value={Number((f1 / perCm).toFixed(2))} unit="cm" />
        </div>
        <div>
          <span>طول ضلع <LabSymbol>F₂</LabSymbol> على الرسم</span>
          <ScientificValue value={Number((f2 / perCm).toFixed(2))} unit="cm" />
        </div>
        <div>
          <span>مقدار المحصّلة <LabSymbol>R</LabSymbol></span>
          <ScientificValue value={Number(resultant.toFixed(1))} unit="N" size="lg" />
        </div>
        <div>
          <span>اتجاه <LabSymbol>R</LabSymbol> من اتجاه <LabSymbol>F₂</LabSymbol></span>
          <ScientificValue value={Number(direction.toFixed(1))} unit="°" />
        </div>
      </div>

      {rightAngle ? (
        <div className="parallelogram-lab__pythagoras" data-pythagoras="true">
          <p className="physics-lab__formula-label">إضافة من المنصة · حالة التعامد</p>
          <MathFormula
            display="block"
            tex={`R = \\sqrt{F_1^2 + F_2^2} = \\sqrt{(${f1})^2 + (${f2})^2} = ${Number(resultant.toFixed(1))}\\ \\text{N}`}
          />
        </div>
      ) : null}

      <p className="physics-lab__note" data-attribution="platform">
        <strong>إضافة من المنصة:</strong> مقدار <LabSymbol>R</LabSymbol> واتجاهها محسوبان من القيم التي تدخلها، أما الكتاب فيسمّي القطر المحصّلة <LabSymbol>F</LabSymbol>.
        {bookExample ? <> في مثال الكتاب (ص 58)، طول القطر المقاس من الرسم يقارب <LabSymbol>6 cm</LabSymbol> وبالمقياس <LabSymbol>1 cm</LabSymbol> لكل <LabSymbol>1 N</LabSymbol> سجّل الكتاب <LabSymbol>F = 6 N</LabSymbol>؛ قراءة <LabSymbol>6.1 N</LabSymbol> هنا حساب آلي وليست قياس الكتاب.</> : null}
        {bookRightAngleExample ? <> في مثال الكتاب (ص 58–59): <LabSymbol>F₁ = 60 N</LabSymbol> و<LabSymbol>F₂ = 80 N</LabSymbol> متعامدتان؛ المقياس <LabSymbol>1 cm</LabSymbol> لكل <LabSymbol>20 N</LabSymbol>، والقطر <LabSymbol>5 cm</LabSymbol>، والمحصّلة <LabSymbol>100 N</LabSymbol>.</> : null}
      </p>

      <p className="lab__conclusion" aria-live="polite">
        <strong>استنتاج الكتاب:</strong> قطر متوازي الأضلاع المارّ من <LabSymbol>O</LabSymbol> يمثّل محصّلة القوتين؛ يبدأ من <LabSymbol>O</LabSymbol> وينتهي عند <LabSymbol>M</LabSymbol>.
      </p>
    </section>
  )
}
