import { useMemo, useState } from 'react'
import { MathFormula, ScientificValue, SvgText, VectorArrow, VectorSvgLabel, quantityText } from '@/scientific'
import { equilibriumResidual, equilibriumTensions, toRadians } from '@/utils/forces'
import { directionOf, lineThroughRect, pointAlong } from '@/utils/vectorGeometry'
import type { Point } from '@/utils/vectorGeometry'
import {
  AngleMark,
  LabFrame,
  LabLegend,
  LabRange,
  LabReadouts,
  LabStages,
  PointMark,
  SymbolText,
  angleLabelPoint,
  BoardGrid,
  cssVars,
  num,
  springPath,
} from './physicsLabKit'
import type { LabStageDef } from './physicsLabKit'
import type { InteractiveProps } from './registry'

/* ============================================================================
   مختبر القوى المتلاقية — إضافة من المنصة حول تجربة الصفحتين 56–57
   ----------------------------------------------------------------------------
   إعادة بناء رقمية لتجربة الكتاب (لوح الزنابض): تُبنى على مراحل تتبع بنود
   الكتاب، ثم تنتقل إلى ما تفعله الصفحة 57 بالنتائج نفسها:

     1  جسم على ربيعة واحدة  — قوّتان على حامل واحد (بندا 1 و2)
     2  ربيعتان وخيط         — ثلاث قوى بحوامل مختلفة (بندا 3 و4)
     3  حوامل القوى الثلاث   — الخطوط المرسومة على اللوح (بند 5)
     4  نرفع الجهاز          — تلتقي الخطوط في نقطة واحدة O (بندا 6 و7)
     5  متوازي الأضلاع       — الصفحة 57: قطره ينطبق على القوّة المعاكسة للثقل

   الأسهم متناسبة مع الشدّات (مقياس واحد لكل القوى ويظهر على اللوح)، وأطوالها لا
   تحمل أي إزاحة ثابتة؛ والتوازن يُتحقق عددياً (مجموع المركّبات = 0).
   ========================================================================= */

const VIEW = { width: 720, height: 470 }
const O: Point = { x: 360, y: 250 }
const SPRING_LENGTH = 212
const MAX_ARROW = 132
const BOARD = { x: 10, y: 10, width: VIEW.width - 20, height: VIEW.height - 20 }

const STAGES: LabStageDef[] = [
  {
    title: 'جسم على ربيعة واحدة',
    hint: 'نعلّق الجسم بخطّاف ربيعة واحدة: يشدّه ثقله w⃗ نحو الأسفل، ويشدّه نابض الربيعة بقوّة توتّر T⃗ نحو الأعلى. حاملا القوّتين منطبقان (الخطّ الشاقولي نفسه) وشدّتاهما متساويتان لأن الجسم ساكن.',
  },
  {
    title: 'ربيعتان وخيط',
    hint: 'نربط خطّافَي ربيعتين بخيط ونعلّق الجسم بمنتصفه. تشدّ الربيعتان الجسم بالقوّتين F₁⃗ و F₂⃗ ويشدّه ثقله w⃗. حوامل القوى الثلاث لم تعد منطبقة: حرّك الزاويتين وراقب الشدّتين.',
  },
  {
    title: 'حوامل القوى الثلاث',
    hint: 'نرسم على اللوح خطّاً على امتداد كل ربيعة وخطّاً شاقولياً على امتداد الخيط المحمّل بالجسم: هذه حوامل القوى الثلاث. لاحظ أنها تمرّ كلها بالنقطة O.',
  },
  {
    title: 'نرفع الجهاز ونلاحظ',
    hint: 'نرفع الربيعتين والجسم عن اللوح ونُبقي الخطوط المرسومة: تتلاقى الخطوط الثلاثة في نقطة واحدة O مهما غيّرت الزاويتين والثقل. القوى التي تتلاقى حواملها في نقطة واحدة تسمّى قوى متلاقية.',
  },
  {
    title: 'متوازي الأضلاع (ص57)',
    hint: 'كما في الصفحة 57: نرسم القوّة F⃗ التي تعاكس w⃗ مباشرة، ثم متوازي الأضلاع المنشأ على F₁⃗ و F₂⃗ وقطره المارّ من O، ونقارن: القطر ينطبق على F⃗ في الحامل والشدّة، وجهته عكس جهة w⃗.',
  },
]

const DEFAULT_STAGE = 2

const LEGEND = [
  { tone: 'force1' as const, symbol: 'F', subscript: '1', text: 'قوّة الربيعة اليمنى' },
  { tone: 'force2' as const, symbol: 'F', subscript: '2', text: 'قوّة الربيعة اليسرى' },
  { tone: 'weight' as const, symbol: 'w', text: 'ثقل الجسم' },
  { tone: 'resultant' as const, symbol: 'F', text: 'القوّة المعاكسة للثقل (قطر المتوازي)' },
]

type SpringSpec = { id: 1 | 2; angle: number; side: 1 | -1; tension: number; role: 'force1' | 'force2' }

export default function ConcurrentForcesLab({ reducedMotion }: InteractiveProps) {
  const [a1, setA1] = useState(35)
  const [a2, setA2] = useState(35)
  const [w, setW] = useState(4)
  const [showCarriers, setShowCarriers] = useState(true)
  const [stage, setStage] = useState(DEFAULT_STAGE)

  const state = useMemo(() => {
    const { t1, t2 } = equilibriumTensions(w, a1, a2)
    const residual = equilibriumResidual(w, a1, a2, t1, t2)
    return { t1, t2, residual }
  }, [a1, a2, w])

  // stage 1 is the single-spring warm-up: one vertical spring carries the whole weight
  const springs: SpringSpec[] =
    stage === 0
      ? [{ id: 1, angle: 0, side: 1, tension: w, role: 'force1' }]
      : [
          { id: 1, angle: a1, side: 1, tension: state.t1, role: 'force1' },
          { id: 2, angle: a2, side: -1, tension: state.t2, role: 'force2' },
        ]

  // one drawing scale for every force; arrows are exactly proportional to the newtons
  const largest = Math.max(w, ...springs.map((spring) => spring.tension))
  // the one-spring warm-up uses shorter arrows so the spring keeps a readable coil
  const pxPerNewton = Math.min(stage === 0 ? 26 : 34, Math.max(8, (stage === 0 ? 104 : MAX_ARROW) / largest))

  const axis = springs.map((spring) => {
    const a = toRadians(spring.angle)
    const unit: Point = { x: spring.side * Math.sin(a), y: -Math.cos(a) }
    const tip: Point = { x: O.x + unit.x * spring.tension * pxPerNewton, y: O.y + unit.y * spring.tension * pxPerNewton }
    const anchor: Point = { x: O.x + unit.x * SPRING_LENGTH, y: O.y + unit.y * SPRING_LENGTH }
    // the coil starts beyond the arrow tip, so a force arrow lies on the thread, never on the coil
    const hook: Point = pointAlong(O, anchor, Math.min(spring.tension * pxPerNewton + 28, SPRING_LENGTH - 80))
    return { spring, unit, tip, anchor, hook }
  })

  const weightLength = w * pxPerNewton
  const weightTip: Point = { x: O.x, y: O.y + weightLength }
  const bodyTop = O.y + Math.max(weightLength + 22, 84)
  const bodyWidth = 34 + w * 2.4
  const bodyHeight = 30

  const lifted = stage === 3
  const showCarrierLines = (stage === 0 || stage >= 2) && showCarriers
  const showVectors = stage !== 3
  const showParallelogram = stage === 4

  const carrierDirections = [
    ...axis.map((item) => ({ role: item.spring.role as 'force1' | 'force2' | 'weight', dir: directionOf(O, { x: O.x + item.unit.x, y: O.y + item.unit.y }) })),
    { role: 'weight' as const, dir: 90 },
  ]

  const tensionLabel = (index: number): Point => {
    const item = axis[index]!
    const side = item.spring.side
    // outside the arrow tip, away from the vertical, so labels never meet
    const perp = { x: side * Math.cos(toRadians(item.spring.angle)), y: Math.sin(toRadians(item.spring.angle)) }
    return {
      x: item.tip.x + item.unit.x * 20 + perp.x * 26,
      y: item.tip.y + item.unit.y * 20 + perp.y * 26 + 5,
    }
  }

  // parallelogram on F₁ and F₂ (stage 5): M = O + F₁ + F₂
  const two = stage >= 1
  const P1 = axis[0]?.tip
  const P2 = two ? axis[1]?.tip : undefined
  const M: Point | null = P1 && P2 ? { x: P1.x + P2.x - O.x, y: P1.y + P2.y - O.y } : null

  const angleArc = (index: 0 | 1) => {
    const item = axis[index]
    if (!item || item.spring.angle <= 0) return null
    const side = item.spring.side
    const from = side === 1 ? 90 - item.spring.angle : 90
    const to = side === 1 ? 90 : 90 + item.spring.angle
    const inside = item.spring.angle >= 28
    const labelDir = inside ? (from + to) / 2 : side === 1 ? from - 20 : to + 20
    const radius = 64
    const labelAt = angleLabelPoint(O, radius, labelDir, labelDir)
    return { from, to, labelAt }
  }

  const arcs = stage >= 1 && stage !== 3 ? [angleArc(0), angleArc(1)] : []
  const scaleNewtons = largest > 12 ? 5 : largest > 5 ? 2 : 1
  const scalePx = scaleNewtons * pxPerNewton

  const halfWeight = w / 2
  const onePair = stage >= 1
  const checkOk = Math.abs(state.residual.horizontal) < 1e-6 && Math.abs(state.residual.vertical) < 1e-6

  return (
    <LabFrame
      className="concurrent-forces-lab"
      titleId="concurrent-forces-lab-title"
      title="أين تتلاقى حوامل القوى الثلاث؟"
      phase="تجربة الربيعتين على لوح الزّنابض (الصفحتان 56–57)"
      reducedMotion={reducedMotion}
      data={{
        a1,
        a2,
        w,
        t1: state.t1.toFixed(2),
        t2: state.t2.toFixed(2),
        carriers: showCarriers,
        stage,
      }}
    >
      <LabStages stages={STAGES} stage={stage} onStage={setStage} label="مراحل تجربة الربيعتين" />

      <div className="plab__controls">
        {stage >= 1 ? (
          <>
            <LabRange
              label={
                <>
                  زاوية الربيعة اليمنى مع الشاقول <MathFormula tex="a_1" />
                </>
              }
              value={a1}
              valueNode={<ScientificValue value={a1} unit="°" size="sm" />}
              min={15}
              max={70}
              step={1}
              onChange={setA1}
              ariaLabel="زاوية الربيعة الأولى مع الشاقول بالدرجات"
              valueText={`${a1} درجة`}
            />
            <LabRange
              label={
                <>
                  زاوية الربيعة اليسرى مع الشاقول <MathFormula tex="a_2" />
                </>
              }
              value={a2}
              valueNode={<ScientificValue value={a2} unit="°" size="sm" />}
              min={15}
              max={70}
              step={1}
              onChange={setA2}
              ariaLabel="زاوية الربيعة الثانية مع الشاقول بالدرجات"
              valueText={`${a2} درجة`}
            />
          </>
        ) : null}
        <LabRange
          label={
            <>
              ثقل الجسم <MathFormula tex="w" />
            </>
          }
          value={w}
          valueNode={<ScientificValue value={w} unit="N" size="sm" />}
          min={1}
          max={10}
          step={1}
          onChange={setW}
          ariaLabel="ثقل الجسم بالنيوتن"
          valueText={`${w} نيوتن`}
        />
        <label className="plab__check">
          <input type="checkbox" checked={showCarriers} onChange={(event) => setShowCarriers(event.target.checked)} />
          <span>إظهار حوامل القوى (الخطوط المرسومة على اللوح)</span>
        </label>
      </div>

      <figure className="plab__figure concurrent-forces-lab__figure">
        <svg
          viewBox={`0 0 ${VIEW.width} ${VIEW.height}`}
          role="img"
          aria-label={
            stage === 0
              ? `جسم ثقله ${w} نيوتن معلّق بربيعة واحدة: توتّر النابض يساوي الثقل ويعاكسه على الحامل نفسه`
              : `جسم ثقله ${w} نيوتن معلّق بربيعتين: شدّة الأولى ${num(state.t1)} نيوتن وشدّة الثانية ${num(state.t2)} نيوتن، وحوامل القوى الثلاث تلتقي في النقطة O`
          }
        >
          <rect className="plab-board" x={BOARD.x} y={BOARD.y} width={BOARD.width} height={BOARD.height} rx={16} />
          <g className="plab-board-grid-layer">
            <BoardGrid width={VIEW.width} height={VIEW.height} step={40} />
          </g>
          <SvgText x={BOARD.x + 18} y={BOARD.y + 26} align="left" script="ar" tone="muted" className="plab-board-label">
            لوح الزّنابض
          </SvgText>

          {/* carriers — lines drawn on the board along every force */}
          {showCarrierLines ? (
            <g className="plab-carriers" data-carriers="true">
              {carrierDirections.slice(0, stage === 0 ? 1 : 3).map((carrier, index) => {
                const ends = lineThroughRect(O, carrier.dir, { x: BOARD.x + 6, y: BOARD.y + 6, width: BOARD.width - 12, height: BOARD.height - 12 })
                return (
                  <line
                    key={`${carrier.role}-${index}`}
                    className={`plab-carrier plab-carrier--${carrier.role} plab-draw`}
                    pathLength={1}
                    x1={ends.a.x}
                    y1={ends.a.y}
                    x2={ends.b.x}
                    y2={ends.b.y}
                    style={cssVars({ '--draw-delay': `${index * 160}ms` })}
                    data-carrier={carrier.role}
                  />
                )
              })}
            </g>
          ) : null}

          {/* the apparatus: springs, thread and body (lifted away in stage 4) */}
          <g className={['plab-apparatus', lifted ? 'plab-apparatus--lifted' : null, stage === 4 ? 'plab-apparatus--faded' : null].filter(Boolean).join(' ')} aria-hidden="true">
            {axis.map((item) => (
              <g key={item.spring.id} className="plab-spring" data-spring={item.spring.id}>
                <path className="plab-spring__coil" d={springPath(item.anchor, item.hook)} />
                <line className="plab-spring__thread" x1={item.hook.x} y1={item.hook.y} x2={O.x} y2={O.y} />
                <circle className="plab-spring__magnet" cx={item.anchor.x} cy={item.anchor.y} r={9} />
                <circle className="plab-spring__magnet-core" cx={item.anchor.x} cy={item.anchor.y} r={3.5} />
                <circle className="plab-spring__hook" cx={item.hook.x} cy={item.hook.y} r={4} />
              </g>
            ))}
            <g className="plab-body" data-body="true">
              <line className="plab-spring__thread" x1={O.x} y1={O.y} x2={O.x} y2={bodyTop} />
              <rect className="plab-body__mass" x={O.x - bodyWidth / 2} y={bodyTop} width={bodyWidth} height={bodyHeight} rx={5} />
              <rect className="plab-body__band" x={O.x - bodyWidth / 2} y={bodyTop + 9} width={bodyWidth} height={4} />
              <circle className="plab-body__ring" cx={O.x} cy={bodyTop} r={4.5} />
            </g>
          </g>

          {/* parallelogram built on F₁ and F₂ (page 57) */}
          {showParallelogram && P1 && P2 && M ? (
            <g className="plab-construction" data-stage-parallelogram="true">
              <polygon className="plab-parallelogram" points={`${O.x},${O.y} ${P1.x},${P1.y} ${M.x},${M.y} ${P2.x},${P2.y}`} />
              <line className="plab-dashed" x1={P1.x} y1={P1.y} x2={M.x} y2={M.y} />
              <line className="plab-dashed" x1={P2.x} y1={P2.y} x2={M.x} y2={M.y} />
            </g>
          ) : null}

          {/* force vectors */}
          {showVectors ? (
            <g className="plab-vectors">
              {axis.map((item, index) => {
                const labelAt = tensionLabel(index)
                const isSingle = stage === 0
                return (
                  <g key={item.spring.id}>
                    <VectorArrow
                      x1={O.x}
                      y1={O.y}
                      x2={item.tip.x}
                      y2={item.tip.y}
                      role={item.spring.role}
                      strokeWidth={4}
                      headSize={15}
                      className="plab-arrow"
                      label={isSingle ? `قوّة توتّر النابض ${num(item.spring.tension)} نيوتن` : `القوّة ${item.spring.id === 1 ? 'F₁' : 'F₂'} ${num(item.spring.tension)} نيوتن`}
                    />
                    <VectorSvgLabel
                      x={isSingle ? item.tip.x + 22 : labelAt.x}
                      y={isSingle ? item.tip.y + 8 : labelAt.y}
                      symbol={isSingle ? 'T' : 'F'}
                      subscript={isSingle ? undefined : String(item.spring.id)}
                      tone={item.spring.role}
                      anchor="middle"
                      magnitude={quantityText(item.spring.tension, 'N')}
                    />
                  </g>
                )
              })}
              <VectorArrow
                x1={O.x}
                y1={O.y}
                x2={weightTip.x}
                y2={weightTip.y}
                role="weight"
                strokeWidth={4}
                headSize={15}
                className="plab-arrow"
                label={`ثقل الجسم ${w} نيوتن`}
              />
              <VectorSvgLabel x={O.x + 20} y={O.y + weightLength * 0.5} symbol="w" tone="weight" anchor="start" magnitude={quantityText(w, 'N')} />
              {showParallelogram && M ? (
                <g data-stage-resultant="true" className="plab-resultant">
                  <VectorArrow
                    x1={O.x}
                    y1={O.y}
                    x2={M.x}
                    y2={M.y}
                    role="resultant"
                    strokeWidth={4}
                    headSize={15}
                    className="plab-arrow"
                    animated={!reducedMotion}
                    label={`القوّة F المعاكسة للثقل ${num(w)} نيوتن`}
                  />
                  <VectorSvgLabel x={M.x - 28} y={M.y - 10} symbol="F" tone="resultant" anchor="middle" magnitude={quantityText(w, 'N')} />
                </g>
              ) : null}
            </g>
          ) : null}

          {/* angles with the vertical */}
          {arcs.map((arc, index) =>
            arc ? (
              <g key={index} className="plab-angles">
                <AngleMark centre={O} r={42} fromDeg={arc.from} toDeg={arc.to} />
                <SymbolText x={arc.labelAt.x} y={arc.labelAt.y + 5} symbol="a" subscript={String(index + 1)} fontSize={15} className="svg-text--angle" />
              </g>
            ) : null,
          )}

          {/* the meeting point */}
          {stage >= 1 ? (
            <g className={['plab-meet', stage >= 2 ? 'plab-meet--pulse' : null].filter(Boolean).join(' ')} data-meet="O">
              {stage >= 2 ? <circle className="plab-meet__ring" cx={O.x} cy={O.y} r={13} /> : null}
              <PointMark at={O} />
              <SymbolText x={O.x - 20} y={O.y + 7} symbol="O" align="right" />
              {M && showParallelogram ? <SymbolText x={M.x + 14} y={M.y + 4} symbol="M" align="left" /> : null}
            </g>
          ) : (
            <g className="plab-meet" data-meet-point="O">
              <PointMark at={O} />
              <SymbolText x={O.x - 20} y={O.y + 7} symbol="O" align="right" />
            </g>
          )}

          {/* drawing scale: one bar for every arrow */}
          <g className="plab-scale" aria-hidden="true">
            <line x1={BOARD.x + 22} y1={BOARD.y + BOARD.height - 24} x2={BOARD.x + 22 + scalePx} y2={BOARD.y + BOARD.height - 24} />
            <line x1={BOARD.x + 22} y1={BOARD.y + BOARD.height - 30} x2={BOARD.x + 22} y2={BOARD.y + BOARD.height - 18} />
            <line x1={BOARD.x + 22 + scalePx} y1={BOARD.y + BOARD.height - 30} x2={BOARD.x + 22 + scalePx} y2={BOARD.y + BOARD.height - 18} />
            <SvgText x={BOARD.x + 22 + scalePx + 10} y={BOARD.y + BOARD.height - 19} align="left" tone="muted">
              {quantityText(scaleNewtons, 'N')}
            </SvgText>
          </g>
        </svg>
        <LabLegend items={stage === 0 ? [{ tone: 'force1', symbol: 'T', text: 'قوّة توتّر النابض' }, LEGEND[2]!] : stage === 4 ? LEGEND : LEGEND.slice(0, 3)} />
      </figure>

      {onePair ? (
        <LabReadouts
          label="قراءات الربيعتين والتحقق من التوازن"
          items={[
            { key: 'f1', tone: 'force1', label: 'شدّة F₁ (الربيعة اليمنى)', value: <ScientificValue value={num(state.t1)} unit="N" /> },
            { key: 'f2', tone: 'force2', label: 'شدّة F₂ (الربيعة اليسرى)', value: <ScientificValue value={num(state.t2)} unit="N" /> },
            { key: 'w', tone: 'weight', label: 'ثقل الجسم w', value: <ScientificValue value={w} unit="N" /> },
            { key: 'angle', label: 'الزاوية بين الربيعتين', value: <ScientificValue value={a1 + a2} unit="°" /> },
            {
              key: 'sum',
              tone: checkOk ? 'ok' : undefined,
              label: 'مجموع القوى الثلاث على كل محور',
              value: (
                <span className="plab__check-value">
                  <ScientificValue value={num(state.residual.horizontal)} unit="N" />
                  <span aria-hidden="true">/</span>
                  <ScientificValue value={num(state.residual.vertical)} unit="N" />
                </span>
              ),
            },
          ]}
        />
      ) : null}

      {onePair ? (
        <div className="plab__note" aria-live="polite">
          <p>
            <strong>التوازن:</strong> الجسم ساكن، إذن محصّلة القوى الثلاث معدومة:{' '}
            <MathFormula tex="\vec{F}_1+\vec{F}_2+\vec{w}=\vec{0}" />
          </p>
          <p>
            <strong>ماذا نلاحظ؟</strong> لو كانت الربيعتان شاقوليتين لحملت كلٌّ منهما نصف الثقل ({' '}
            <ScientificValue value={halfWeight} unit="N" size="sm" />). أمّا الآن فتشدّ الأولى بـ{' '}
            <ScientificValue value={num(state.t1)} unit="N" size="sm" /> والثانية بـ{' '}
            <ScientificValue value={num(state.t2)} unit="N" size="sm" />: كلّما انفرجت الربيعتان عن الشاقول زادت شدّتاهما رغم ثبات الثقل.
          </p>
        </div>
      ) : (
        <div className="plab__note" aria-live="polite">
          <p>
            <strong>ماذا نلاحظ؟</strong> الجسم ساكن، لذلك تساوي شدّة التوتّر شدّة الثقل (
            <ScientificValue value={w} unit="N" size="sm" />) وتعاكسه في الجهة، والقوّتان على حامل واحد. انتقل إلى المرحلة التالية لتعليق الجسم بربيعتين.
          </p>
        </div>
      )}
    </LabFrame>
  )
}
