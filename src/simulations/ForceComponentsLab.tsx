import { useMemo, useState } from 'react'
import { MathFormula, ScientificValue, SvgText, VectorArrow, VectorSvgLabel, quantityText } from '@/scientific'
import { resolveForce, resolveOnIncline, toRadians } from '@/utils/forces'
import { polar } from '@/utils/vectorGeometry'
import type { Point } from '@/utils/vectorGeometry'
import {
  AngleMark,
  LabFrame,
  LabLegend,
  LabRange,
  LabReadouts,
  LabStages,
  PointMark,
  RightAngleMark,
  SymbolText,
  angleLabelPoint,
  cssVars,
  fix,
  num,
} from './physicsLabKit'
import type { LabStageDef } from './physicsLabKit'
import type { InteractiveProps } from './registry'

/* ============================================================================
   مختبر تحليل القوّة — إضافة من المنصة حول الصفحتين 59–60
   ----------------------------------------------------------------------------
   وضعان:
   1) «تحليل قوّة على محورين»: ست مراحل هي بنود تجربة الصفحة 60 نفسها —
      نقطة O ← الشعاع OM ← المحوران OX وOY ← العمودان من M (مرسم النقطة) ←
      المستطيل وقطره F⃗ ← المسافتان على المحورين هما المركّبتان.
   2) «المستوي المائل الأملس»: نشاط الصفحة 60 — القوى المؤثرة في الجسم هي
      الثقل w⃗ وردّ فعل المستوي R⃗؛ نحلّل الثقل إلى F₁⃗ موازية للمستوي وF₂⃗
      عمودية عليه فيتشكّل مستطيل قطره w⃗. R⃗ تعادل F₂⃗، فلا تبقى إلا F₁⃗
      فتسحب الجسم على السطح الأملس (يمكن تحريره لمشاهدة الانزلاق).
   ========================================================================= */

type Mode = 'axes' | 'incline'

const VIEW_AXES = { width: 720, height: 430 }
const VIEW_INCLINE = { width: 720, height: 470 }

const AXES_STAGES: LabStageDef[] = [
  { title: 'نحدّد النقطة O', hint: 'نحدّد على لوح الزّنابض نقطة O تؤثّر فيها القوّة.' },
  { title: 'نرسم الشعاع OM', hint: 'نرسم من O شعاعاً يمثّل القوّة F⃗ وليكن الشعاع OM؛ طوله يمثّل شدّتها بمقياس رسم.' },
  { title: 'نرسم المحورين OX و OY', hint: 'نرسم من O محورين متعامدين OX و OY يمثّلان حاملَي المركّبتين F₁⃗ و F₂⃗.' },
  { title: 'العمودان من M', hint: 'نرسم من النقطة M عموداً على كل من المحورين (مرسم النقطة): خطّان متقطّعان يلتقيان مع المحورين بزاويتين قائمتين.' },
  { title: 'المستطيل وقطره', hint: 'يتشكّل مستطيل ضلعاه على المحورين، وقطره المارّ من O هو الشعاع OM الذي يمثّل المحصّلة F⃗.' },
  { title: 'المركّبتان', hint: 'المسافتان على المحورين OX و OY تمثّلان المركّبتين F₁⃗ و F₂⃗: قوّتان متعامدتان تقومان معاً مقام F⃗.' },
]

const INCLINE_STAGES: LabStageDef[] = [
  { title: 'الجسم على السطح الأملس', hint: 'يستقرّ جسم صلب على سطح أملس يميل عن الأفق بالزاوية a (لا احتكاك بين الجسم والسطح).' },
  { title: 'القوى المؤثّرة: w⃗ و R⃗', hint: 'يؤثّر في الجسم ثقله w⃗ شاقولياً نحو الأسفل، وردّ فعل السطح R⃗ عمودياً على السطح نحو الخارج.' },
  { title: 'نختار محورين', hint: 'نختار محوراً موازياً للسطح وآخر عمودياً عليه، ونحلّل الثقل w⃗ على هذين المحورين.' },
  { title: 'نُسقط عمودين من رأس w⃗', hint: 'نرسم من رأس السهم w⃗ عمودين على المحورين (مرسم النقطة) فنحصل على مركّبتي الثقل F₁⃗ و F₂⃗.' },
  { title: 'الشكل الناتج: مستطيل', hint: 'الشكل الناتج مستطيل قطره w⃗. F₂⃗ تعادلها R⃗ فلا يغوص الجسم في السطح ولا يرتفع عنه، وتبقى F₁⃗ وحدها تسحبه على السطح نحو الأسفل.' },
]

const AXES_LEGEND = [
  { tone: 'resultant' as const, symbol: 'F', text: 'القوّة المحلَّلة (القطر OM)' },
  { tone: 'component1' as const, symbol: 'F', subscript: '1', text: 'المركّبة على OX' },
  { tone: 'component2' as const, symbol: 'F', subscript: '2', text: 'المركّبة على OY' },
]

const INCLINE_LEGEND = [
  { tone: 'weight' as const, symbol: 'w', text: 'ثقل الجسم (القطر)' },
  { tone: 'reaction' as const, symbol: 'R', text: 'ردّ فعل السطح' },
  { tone: 'component1' as const, symbol: 'F', subscript: '1', text: 'مركّبة موازية للسطح' },
  { tone: 'component2' as const, symbol: 'F', subscript: '2', text: 'مركّبة عمودية على السطح' },
]

export default function ForceComponentsLab({ reducedMotion }: InteractiveProps) {
  const [mode, setMode] = useState<Mode>('axes')
  const [force, setForce] = useState(6)
  const [theta, setTheta] = useState(40)
  const [incline, setIncline] = useState(25)
  const [weight, setWeight] = useState(5)
  const [stages, setStages] = useState<Record<Mode, number>>({ axes: AXES_STAGES.length - 1, incline: INCLINE_STAGES.length - 1 })
  const [released, setReleased] = useState(false)

  const resolved = useMemo(() => {
    if (mode === 'axes') {
      const { along, across } = resolveForce(force, theta)
      return { along, perp: across, magnitude: force, angle: theta }
    }
    const { parallel, perpendicular } = resolveOnIncline(weight, incline)
    return { along: parallel, perp: perpendicular, magnitude: weight, angle: incline }
  }, [mode, force, theta, incline, weight])

  const stage = stages[mode]
  const stageDefs = mode === 'axes' ? AXES_STAGES : INCLINE_STAGES
  const setStage = (value: number) => setStages((current) => ({ ...current, [mode]: value }))

  return (
    <LabFrame
      className="force-components-lab"
      titleId="force-components-lab-title"
      title="قوّة واحدة تُستبدل بمركّبتين متعامدتين"
      phase="تحليل القوّة إلى مركّبتين متعامدتين (الصفحتان 59–60)"
      reducedMotion={reducedMotion}
      data={{
        mode,
        angle: resolved.angle,
        fx: resolved.along.toFixed(2),
        fy: resolved.perp.toFixed(2),
        stage,
      }}
      headerExtra={
        <div className="plab__modes" role="group" aria-label="اختر وضع العرض">
          <button type="button" className="button button--quiet" aria-pressed={mode === 'axes'} onClick={() => setMode('axes')}>
            تحليل قوّة على محورين
          </button>
          <button type="button" className="button button--quiet" aria-pressed={mode === 'incline'} onClick={() => setMode('incline')}>
            المستوي المائل الأملس (نشاط الصفحة 60)
          </button>
        </div>
      }
    >
      <LabStages stages={stageDefs} stage={stage} onStage={setStage} label={mode === 'axes' ? 'مراحل تحليل قوّة' : 'مراحل نشاط الجسم على السطح الأملس'} />

      <div className="plab__controls">
        {mode === 'axes' ? (
          <>
            <LabRange
              label={
                <>
                  شدّة القوّة <MathFormula tex="F" />
                </>
              }
              value={force}
              valueNode={<ScientificValue value={force} unit="N" size="sm" />}
              min={2}
              max={10}
              onChange={setForce}
              ariaLabel="شدّة القوّة نيوتن"
              valueText={`${force} نيوتن`}
            />
            <LabRange
              label={
                <>
                  زاوية القوّة مع المحور OX <MathFormula tex="a" />
                </>
              }
              value={theta}
              valueNode={<ScientificValue value={theta} unit="°" size="sm" />}
              min={10}
              max={80}
              step={5}
              onChange={setTheta}
              ariaLabel="زاوية القوّة مع المحور الأفقي بالدرجات"
              valueText={`${theta} درجة`}
            />
          </>
        ) : (
          <>
            <LabRange
              label={
                <>
                  زاوية ميل السطح <MathFormula tex="a" />
                </>
              }
              value={incline}
              valueNode={<ScientificValue value={incline} unit="°" size="sm" />}
              min={15}
              max={60}
              step={5}
              onChange={(value) => {
                setReleased(false)
                setIncline(value)
              }}
              ariaLabel="زاوية ميل المستوي بالدرجات"
              valueText={`${incline} درجة`}
            />
            <LabRange
              label={
                <>
                  ثقل الجسم <MathFormula tex="w" />
                </>
              }
              value={weight}
              valueNode={<ScientificValue value={weight} unit="N" size="sm" />}
              min={2}
              max={8}
              onChange={setWeight}
              ariaLabel="ثقل الجسم نيوتن"
              valueText={`${weight} نيوتن`}
            />
            <button
              type="button"
              className="button button--quiet plab__release"
              aria-pressed={released}
              onClick={() => setReleased((value) => !value)}
            >
              {released ? 'أعد الجسم إلى مكانه' : 'حرّر الجسم وراقب انزلاقه'}
            </button>
          </>
        )}
      </div>

      <figure className="plab__figure force-components-lab__figure">
        {mode === 'axes' ? (
          <AxesFigure force={force} theta={theta} along={resolved.along} perp={resolved.perp} stage={stage} reducedMotion={reducedMotion} />
        ) : (
          <InclineFigure
            angle={incline}
            weight={weight}
            along={resolved.along}
            perp={resolved.perp}
            stage={stage}
            released={released}
            reducedMotion={reducedMotion}
          />
        )}
        <LabLegend items={mode === 'axes' ? AXES_LEGEND : INCLINE_LEGEND} />
      </figure>

      <LabReadouts
        label="قيم القوّة ومركّبتيها"
        items={[
          {
            key: 'f1',
            tone: 'component1',
            label: mode === 'axes' ? 'المركّبة على OX: F₁' : 'المركّبة الموازية للسطح: F₁',
            value: <ScientificValue value={num(resolved.along)} unit="N" />,
          },
          {
            key: 'f2',
            tone: 'component2',
            label: mode === 'axes' ? 'المركّبة على OY: F₂' : 'المركّبة العمودية على السطح: F₂',
            value: <ScientificValue value={num(resolved.perp)} unit="N" />,
          },
          {
            key: 'f',
            tone: mode === 'axes' ? 'resultant' : 'weight',
            label: mode === 'axes' ? 'القوّة المحلَّلة F' : 'ثقل الجسم w',
            value: <ScientificValue value={resolved.magnitude} unit="N" />,
          },
          ...(mode === 'incline'
            ? [
                {
                  key: 'r',
                  tone: 'reaction' as const,
                  label: 'ردّ فعل السطح R (يعادل F₂)',
                  value: <ScientificValue value={num(resolved.perp)} unit="N" />,
                },
              ]
            : []),
          {
            key: 'shape',
            label: 'الشكل الناتج',
            value: <span className="plab__text-value">مستطيل قطره {mode === 'axes' ? 'القوّة نفسها' : 'الثقل'}</span>,
          },
        ]}
      />

      <div className="plab__pythagoras" data-pythagoras-check="true">
        <p className="plab__pythagoras-title">التحقق بنظرية فيثاغورث: القطر وتر في مثلّث قائم ضلعاه المركّبتان</p>
        <MathFormula
          display="block"
          tex={`${mode === 'axes' ? 'F' : 'w'}=\\sqrt{F_1^{2}+F_2^{2}}=\\sqrt{${fix(resolved.along, 2)}^{2}+${fix(resolved.perp, 2)}^{2}}\\approx${num(resolved.magnitude)}\\ \\mathrm{N}`}
        />
      </div>

      <div className="plab__note" aria-live="polite">
        {mode === 'axes' ? (
          <>
            <p>
              <strong>الاستنتاج:</strong> المركّبتان المتعامدتان F₁ و F₂ تقومان معاً مقام القوّة F؛ وتحليل القوّة عمليّة معاكسة لإيجاد محصّلة قوّتين متعامدتين.
            </p>
            <p>
              <strong>تأمّل:</strong> كلّما ازدادت الزاوية <MathFormula tex="a" /> مع OX صغرت المركّبة على OX وكبرت المركّبة على OY، بينما يبقى قطر المستطيل F ثابتاً.
            </p>
          </>
        ) : (
          <>
            <p>
              <strong>الاستنتاج:</strong> على السطح الأملس تتوازن F₂ مع R، فلا تبقى إلا F₁ تسحب الجسم على السطح. كلّما كبرت زاوية الميل <MathFormula tex="a" /> كبرت F₁ وصغرت F₂ (وصغر ضغط الجسم على السطح).
            </p>
            <p>
              <strong>تأمّل:</strong> عندما يصبح السطح أفقياً <MathFormula tex="(a\to 0)" /> تنعدم F₁ ويحمل السطح الثقل كاملاً، وعندما يصير شاقولياً <MathFormula tex="(a\to 90^{\circ})" /> تنعدم R ويسقط الجسم بثقله.
            </p>
          </>
        )}
      </div>
    </LabFrame>
  )
}

/* ---------- figure 1: a force resolved on two perpendicular axes ---------- */

function AxesFigure({ force, theta, along, perp, stage, reducedMotion }: {
  force: number
  theta: number
  along: number
  perp: number
  stage: number
  reducedMotion: boolean
}) {
  const O: Point = { x: 150, y: 366 }
  const s = 32
  const M = polar(O, force * s, theta)
  const A: Point = { x: O.x + along * s, y: O.y }
  const B: Point = { x: O.x, y: O.y - perp * s }
  const arcLabel = angleLabelPoint(O, 70, 0, theta)
  // beyond the tip, along the force: the free side of the figure, clear of the rectangle and of M
  const fLabel = polar(M, 60, theta + 14)
  const f1Label: Point = { x: (O.x + A.x) / 2, y: O.y + 36 }
  const f2Label: Point = { x: O.x - 44, y: (O.y + B.y) / 2 + 2 }

  return (
    <svg
      viewBox={`0 0 ${VIEW_AXES.width} ${VIEW_AXES.height}`}
      role="img"
      aria-label={`قوّة ${force} نيوتن بزاوية ${theta} درجة مع المحور OX تحلّل إلى مركّبة على OX قدرها ${num(along)} نيوتن ومركّبة على OY قدرها ${num(perp)} نيوتن ضمن مستطيل`}
    >
      <rect className="plab-board" x={6} y={6} width={VIEW_AXES.width - 12} height={VIEW_AXES.height - 12} rx={16} />

      {/* axes */}
      {stage >= 2 ? (
        <g className="plab-axes" data-stage-axes="true">
          <VectorArrow x1={O.x - 24} y1={O.y} x2={O.x + 500} y2={O.y} role="neutral" strokeWidth={2} headSize={11} className="plab-axis" />
          <VectorArrow x1={O.x} y1={O.y + 24} x2={O.x} y2={O.y - 330} role="neutral" strokeWidth={2} headSize={11} className="plab-axis" />
          <SymbolText x={O.x + 506} y={O.y + 24} symbol="X" align="center" />
          <SymbolText x={O.x + 18} y={O.y - 322} symbol="Y" align="left" />
        </g>
      ) : null}

      {/* rectangle and perpendiculars from M */}
      {stage >= 4 ? (
        <polygon className="plab-parallelogram plab-rect" data-rect="true" points={`${O.x},${O.y} ${A.x},${A.y} ${M.x},${M.y} ${B.x},${B.y}`} />
      ) : null}
      {stage >= 3 ? (
        <g className="plab-construction" data-stage-projections="true">
          <line className="plab-dashed" x1={M.x} y1={M.y} x2={A.x} y2={A.y} />
          <line className="plab-dashed" x1={M.x} y1={M.y} x2={B.x} y2={B.y} />
          <RightAngleMark vertex={A} dir1={90} dir2={180} size={12} />
          <RightAngleMark vertex={B} dir1={0} dir2={270} size={12} />
          <RightAngleMark vertex={M} dir1={180} dir2={270} size={12} />
          {stage >= 2 ? <RightAngleMark vertex={O} dir1={0} dir2={90} size={12} /> : null}
          <circle className="plab-foot" cx={A.x} cy={A.y} r={3.5} />
          <circle className="plab-foot" cx={B.x} cy={B.y} r={3.5} />
        </g>
      ) : null}

      {/* components on the axes */}
      {stage >= 5 ? (
        <g className="plab-components" data-stage-components="true">
          <VectorArrow x1={O.x} y1={O.y} x2={A.x} y2={A.y} role="component1" strokeWidth={4.5} headSize={15} className="plab-arrow" animated={!reducedMotion} label={`المركّبة F₁ ${num(along)} نيوتن على OX`} />
          <VectorArrow x1={O.x} y1={O.y} x2={B.x} y2={B.y} role="component2" strokeWidth={4.5} headSize={15} className="plab-arrow" animated={!reducedMotion} label={`المركّبة F₂ ${num(perp)} نيوتن على OY`} />
          <VectorSvgLabel x={f1Label.x} y={f1Label.y} symbol="F" subscript="1" tone="component1" anchor="middle" magnitude={quantityText(along, 'N')} />
          <VectorSvgLabel x={f2Label.x} y={f2Label.y} symbol="F" subscript="2" tone="component2" anchor="middle" magnitude={quantityText(perp, 'N')} />
        </g>
      ) : null}

      {/* the force OM */}
      {stage >= 1 ? (
        <g className="plab-resultant" data-stage-force="true">
          <VectorArrow x1={O.x} y1={O.y} x2={M.x} y2={M.y} role="resultant" strokeWidth={4.5} headSize={16} className="plab-arrow" label={`القوّة F ${force} نيوتن`} />
          <VectorSvgLabel x={fLabel.x} y={fLabel.y + 4} symbol="F" tone="resultant" anchor="middle" magnitude={quantityText(force, 'N')} />
        </g>
      ) : null}

      {/* the angle a between F and OX */}
      {stage >= 2 ? (
        <g className="plab-angles">
          <AngleMark centre={O} r={56} fromDeg={0} toDeg={theta} />
          <SymbolText x={arcLabel.x + 4} y={arcLabel.y + 5} symbol="a" fontSize={16} className="svg-text--angle" />
        </g>
      ) : null}

      {/* points */}
      <g className="plab-meet" data-meet="O">
        <PointMark at={O} />
        <SymbolText x={O.x - 16} y={O.y + 26} symbol="O" align="right" />
      </g>
      {stage >= 1 ? (
        <g>
          <PointMark at={M} />
          <SymbolText x={M.x + 16} y={M.y + 6} symbol="M" align="left" />
        </g>
      ) : null}
    </svg>
  )
}

/* ---------- figure 2: a body on a smooth inclined plane ------------------- */

function InclineFigure({ angle, weight, along, perp, stage, released, reducedMotion }: {
  angle: number
  weight: number
  along: number
  perp: number
  stage: number
  released: boolean
  reducedMotion: boolean
}) {
  const a = toRadians(angle)
  const ground = 420
  const A: Point = { x: 90, y: ground }
  const slope = 400
  const B: Point = { x: A.x + slope * Math.cos(a), y: ground }
  const C: Point = { x: B.x, y: ground - slope * Math.sin(a) }

  // unit vectors on screen: along the slope (up), and the outward normal
  const s: Point = { x: Math.cos(a), y: -Math.sin(a) }
  const n: Point = { x: -Math.sin(a), y: -Math.cos(a) }
  const bodyW = 56
  const bodyH = 36
  const P: Point = { x: A.x + s.x * slope * 0.7, y: A.y + s.y * slope * 0.7 }
  const corners = [
    { x: P.x - s.x * bodyW / 2, y: P.y - s.y * bodyW / 2 },
    { x: P.x + s.x * bodyW / 2, y: P.y + s.y * bodyW / 2 },
    { x: P.x + s.x * bodyW / 2 + n.x * bodyH, y: P.y + s.y * bodyW / 2 + n.y * bodyH },
    { x: P.x - s.x * bodyW / 2 + n.x * bodyH, y: P.y - s.y * bodyW / 2 + n.y * bodyH },
  ]
  const centre: Point = { x: P.x + n.x * bodyH / 2, y: P.y + n.y * bodyH / 2 }
  const k = 16
  const wTip: Point = { x: centre.x, y: centre.y + weight * k }
  const rTip: Point = { x: centre.x + n.x * perp * k, y: centre.y + n.y * perp * k }
  const f1Tip: Point = { x: centre.x - s.x * along * k, y: centre.y - s.y * along * k }
  const f2Tip: Point = { x: centre.x - n.x * perp * k, y: centre.y - n.y * perp * k }

  const polygonPoints = (pts: Point[]) => pts.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')

  // sliding model: a smooth incline accelerates at g·sin a, so a steeper plane is quicker
  const distanceMetres = 1.2
  const seconds = Math.sqrt((2 * distanceMetres) / (9.8 * Math.sin(a)))
  const slide = 150
  const slideVector = { x: -s.x * slide, y: -s.y * slide }

  const arcAtBase = { fromDeg: 0, toDeg: angle }
  const baseLabel = angleLabelPoint(A, 78, 0, angle)
  const arcAtBody = { fromDeg: 270, toDeg: 270 + angle }
  // inside the wedge between w and F₂ when it is wide enough; otherwise just outside it, beside w
  const bodyLabelDir = angle >= 28 ? 270 + angle / 2 : 248
  const bodyLabel = angleLabelPoint(centre, 60, bodyLabelDir, bodyLabelDir)

  // every label sits beyond its own tip, on a side no other vector uses
  const rLabel = { x: rTip.x + n.x * 26, y: rTip.y + n.y * 26 + 4 }
  // a shallow plane with a heavy body pushes the tips against the bottom edge: those labels go beside the arrow
  const fits = (point: Point) => point.y <= VIEW_INCLINE.height - 52
  const wBelow = { x: wTip.x, y: wTip.y + 34 }
  const wLabel = fits(wBelow) ? wBelow : { x: wTip.x - 42, y: wTip.y - 10 }
  const f1Label = { x: f1Tip.x - s.x * 32 + n.x * 24, y: f1Tip.y - s.y * 32 + n.y * 24 + 4 }
  const f2Beyond = { x: f2Tip.x - n.x * 30 + 20, y: f2Tip.y - n.y * 30 + 8 }
  const f2Label = fits(f2Beyond) ? f2Beyond : { x: f2Tip.x + 46, y: f2Tip.y - 14 }

  return (
    <svg
      viewBox={`0 0 ${VIEW_INCLINE.width} ${VIEW_INCLINE.height}`}
      role="img"
      aria-label={`جسم ثقله ${weight} نيوتن على سطح أملس يميل ${angle} درجة: يحلَّل الثقل إلى مركّبة موازية للسطح ${num(along)} نيوتن ومركّبة عمودية عليه ${num(perp)} نيوتن، وردّ فعل السطح يعادل المركّبة العمودية`}
    >
      <rect className="plab-board" x={6} y={6} width={VIEW_INCLINE.width - 12} height={VIEW_INCLINE.height - 12} rx={16} />
      <line className="plab-ground" x1={30} y1={ground} x2={VIEW_INCLINE.width - 30} y2={ground} />

      <g data-wedge="true" className="plab-wedge">
        <polygon className="plab-wedge__body" points={polygonPoints([A, B, C])} />
        <line className="plab-wedge__surface" x1={A.x} y1={A.y} x2={C.x} y2={C.y} />
      </g>

      {/* angle a at the foot of the plane */}
      <g className="plab-angles">
        <AngleMark centre={A} r={64} fromDeg={arcAtBase.fromDeg} toDeg={arcAtBase.toDeg} />
        <SymbolText x={baseLabel.x + 6} y={baseLabel.y + 5} symbol="a" fontSize={16} className="svg-text--angle" />
      </g>

      {/* the axes along and across the plane (stage 3) */}
      {stage >= 2 ? (
        <g className="plab-axes" data-stage-axes="true">
          <line className="plab-axis-line" x1={centre.x - s.x * 190} y1={centre.y - s.y * 190} x2={centre.x + s.x * 190} y2={centre.y + s.y * 190} />
          <line className="plab-axis-line" x1={centre.x - n.x * 120} y1={centre.y - n.y * 120} x2={centre.x + n.x * 150} y2={centre.y + n.y * 150} />
        </g>
      ) : null}

      {/* the rectangle of the components */}
      {stage >= 4 ? (
        <polygon
          className="plab-parallelogram plab-rect"
          data-rect="true"
          points={polygonPoints([centre, f1Tip, wTip, f2Tip])}
        />
      ) : null}
      {stage >= 3 ? (
        <g className="plab-construction" data-stage-projections="true">
          <line className="plab-dashed" x1={wTip.x} y1={wTip.y} x2={f1Tip.x} y2={f1Tip.y} />
          <line className="plab-dashed" x1={wTip.x} y1={wTip.y} x2={f2Tip.x} y2={f2Tip.y} />
          <RightAngleMark vertex={centre} dir1={angle + 180} dir2={angle + 270} size={13} />
        </g>
      ) : null}

      {/* the body: static copy, plus a ghost that slides when released */}
      <g data-body="true" className="plab-incline-body">
        <polygon className="plab-body__mass" points={polygonPoints(corners)} />
      </g>
      {released ? (
        <g
          className={['plab-ghost', reducedMotion ? 'plab-ghost--end' : 'plab-ghost--slide'].join(' ')}
          style={cssVars({ '--sx': `${slideVector.x}px`, '--sy': `${slideVector.y}px`, '--dur': `${seconds.toFixed(2)}s` })}
          aria-hidden="true"
          data-released="true"
        >
          <polygon className="plab-body__ghost" points={polygonPoints(corners)} />
        </g>
      ) : null}

      {/* forces on the body */}
      {stage >= 1 ? (
        <g className="plab-vectors">
          <VectorArrow x1={centre.x} y1={centre.y} x2={wTip.x} y2={wTip.y} role="weight" strokeWidth={4} headSize={14} className="plab-arrow" label={`ثقل الجسم ${weight} نيوتن`} />
          <VectorArrow x1={centre.x} y1={centre.y} x2={rTip.x} y2={rTip.y} role="reaction" strokeWidth={4} headSize={14} className="plab-arrow" label={`ردّ فعل السطح ${num(perp)} نيوتن`} />
          <VectorSvgLabel x={wLabel.x} y={wLabel.y} symbol="w" tone="weight" anchor="middle" magnitude={quantityText(weight, 'N')} />
          <VectorSvgLabel x={rLabel.x} y={rLabel.y} symbol="R" tone="reaction" anchor="middle" magnitude={quantityText(perp, 'N')} />
        </g>
      ) : null}
      {stage >= 3 ? (
        <g className="plab-components" data-stage-components="true">
          <VectorArrow x1={centre.x} y1={centre.y} x2={f1Tip.x} y2={f1Tip.y} role="component1" strokeWidth={4} headSize={14} className="plab-arrow" animated={!reducedMotion} label={`المركّبة F₁ ${num(along)} نيوتن موازية للسطح`} />
          <VectorArrow x1={centre.x} y1={centre.y} x2={f2Tip.x} y2={f2Tip.y} role="component2" strokeWidth={4} headSize={14} className="plab-arrow" animated={!reducedMotion} label={`المركّبة F₂ ${num(perp)} نيوتن عمودية على السطح`} />
          <VectorSvgLabel x={f1Label.x} y={f1Label.y} symbol="F" subscript="1" tone="component1" anchor="middle" magnitude={quantityText(along, 'N')} />
          <VectorSvgLabel x={f2Label.x} y={f2Label.y} symbol="F" subscript="2" tone="component2" anchor="middle" magnitude={quantityText(perp, 'N')} />
          <g className="plab-angles">
            <AngleMark centre={centre} r={40} fromDeg={arcAtBody.fromDeg} toDeg={arcAtBody.toDeg} />
            <SymbolText x={bodyLabel.x} y={bodyLabel.y + 5} symbol="a" fontSize={16} className="svg-text--angle" />
          </g>
        </g>
      ) : null}

      <g className="plab-meet">
        <PointMark at={centre} />
      </g>
      <SvgText x={VIEW_INCLINE.width - 40} y={ground + 26} align="right" script="ar" tone="muted">
        سطح أفقي
      </SvgText>
    </svg>
  )
}
