import { useMemo, useState } from 'react'
import { MathFormula, ScientificValue, SvgText, VectorArrow, VectorSvgLabel, quantityText } from '@/scientific'
import { drawingScale, resultantBounds, resultantOfTwo, roundTo } from '@/utils/forces'
import { distance, parallelogramCorners, pointAlong, polar } from '@/utils/vectorGeometry'
import type { Point } from '@/utils/vectorGeometry'
import {
  AngleMark,
  CheckMark,
  LabCanvas,
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
  num,
} from './physicsLabKit'
import type { LabStageDef } from './physicsLabKit'
import type { InteractiveProps } from './registry'

/* ============================================================================
   مختبر متوازي الأضلاع — إضافة من المنصة حول الصفحات 57–59
   ----------------------------------------------------------------------------
   يُبنى على ثلاث مراحل هي مراحل رسم الكتاب نفسها:
     0  نمثّل القوّتين بمقياس رسم مناسب (شعاعان من O)
     1  نكمل متوازي الأضلاع (تُنقل كل قوّة موازية لنفسها إلى نهاية الأخرى)
     2  نرسم القطر OM ونقيس طوله ثم نحسب الشدّة بمقياس الرسم

   • الشبكة سنتيمترية والمقياس ظاهر بطول 1 cm حقيقي من الرسم.
   • المثالان المحلولان في الكتاب (4 N و3 N بزاوية 60°، و60 N و80 N متعامدتان)
     زرّان جاهزان.
   • عند 90° يظهر التحقق بنظرية فيثاغورث (KaTeX) بجانب القياس.
   ========================================================================= */

const VIEW = { width: 760, height: 430 }
const PAD = { left: 70, right: 70, top: 56, bottom: 74 }

const STAGES: LabStageDef[] = [
  {
    title: 'نمثّل القوّتين',
    hint: 'نختار مقياس رسم مناسباً ونرسم من النقطة O شعاع القوّة الأولى F₁⃗ ثم شعاع القوّة الثانية F₂⃗ بحيث يصنع حاملاهما الزاوية المعطاة. طول كل شعاع = الشدّة ÷ مقياس الرسم.',
  },
  {
    title: 'نكمل متوازي الأضلاع',
    hint: 'ننقل كل قوّة موازية لنفسها حتى تبدأ من نهاية الأخرى (النسختان المنقولتان بخطّ متقطّع)، فيكتمل متوازي الأضلاع المنشأ على F₁⃗ و F₂⃗ ورأسه الرابع M.',
  },
  {
    title: 'نرسم القطر ونقيسه',
    hint: 'نرسم القطر OM المارّ من O: هو شعاع المحصّلة F⃗، جهته من O إلى الرأس المقابل M. نقيس طوله بالمسطرة ونحسب الشدّة: F = طول القطر × مقياس الرسم.',
  },
]

const ANGLE_PRESETS = [0, 60, 90, 180]

const LEGEND = [
  { tone: 'force1' as const, symbol: 'F', subscript: '1', text: 'القوّة الأولى' },
  { tone: 'force2' as const, symbol: 'F', subscript: '2', text: 'القوّة الثانية' },
  { tone: 'resultant' as const, symbol: 'F', text: 'المحصّلة (القطر OM)' },
]

function angleCase(angle: number, f1: number, f2: number, f: number) {
  if (angle === 0) {
    return {
      name: 'القوّتان في الاتجاه نفسه',
      text: 'المتوازي يتسطّح إلى قطعة مستقيمة: تُجمع الشدّتان وللمحصّلة جهتهما المشتركة. هذه أكبر محصّلة ممكنة.',
      tex: `F=F_1+F_2=${num(f1)}+${num(f2)}=${num(f1 + f2)}\\ \\mathrm{N}`,
    }
  }
  if (angle === 180) {
    return {
      name: 'القوّتان في اتجاهين متعاكسين',
      text: 'تُطرح الشدّة الصغرى من الكبرى وجهة المحصّلة جهة القوّة الأكبر. هذه أصغر محصّلة ممكنة.',
      tex: `F=\\left|F_1-F_2\\right|=\\left|${num(f1)}-${num(f2)}\\right|=${num(Math.abs(f1 - f2))}\\ \\mathrm{N}`,
    }
  }
  if (angle === 90) {
    return {
      name: 'القوّتان متعامدتان',
      text: 'متوازي الأضلاع مستطيل، والقطر وتر في مثلث قائم ضلعاه F₁ و F₂: نحسب الشدّة بنظرية فيثاغورث كما نقيسها بالرسم.',
      tex: '',
    }
  }
  if (angle < 90) {
    return {
      name: 'زاوية حادة',
      text: 'المحصّلة أكبر من كل من القوّتين وأصغر من مجموعهما. كلّما صغرت الزاوية اقتربت المحصّلة من مجموع الشدّتين.',
      tex: `${num(Math.max(f1, f2))}<F=${num(f)}<${num(f1 + f2)}\\ \\mathrm{N}`,
    }
  }
  return {
    name: 'زاوية منفرجة',
    text: 'تتجاذب القوّتان جزئياً فتصغر المحصّلة. كلّما كبرت الزاوية اقتربت المحصّلة من الفرق بين الشدّتين وقد تكون أصغر من إحداهما.',
    tex: `${num(Math.abs(f1 - f2))}<F=${num(f)}<${num(f1 + f2)}\\ \\mathrm{N}`,
  }
}

export default function ParallelogramLab({ reducedMotion }: InteractiveProps) {
  const [f1, setF1] = useState(4)
  const [f2, setF2] = useState(3)
  const [angle, setAngle] = useState(60)
  const [stage, setStage] = useState(reducedMotion ? 2 : 0)

  const model = useMemo(() => {
    const result = resultantOfTwo(f1, f2, angle)
    const scale = drawingScale(Math.max(f1, f2, result.magnitude))
    const l1 = f1 / scale
    const l2 = f2 / scale
    const widthCm = l1 + 2 * l2
    const zoom = Math.min(
      (VIEW.width - PAD.left - PAD.right) / widthCm,
      (VIEW.height - PAD.top - PAD.bottom) / Math.max(l2, 0.5),
      84,
    )
    const O: Point = { x: PAD.left + l2 * zoom, y: VIEW.height - PAD.bottom }
    const P1 = polar(O, l1 * zoom, 0)
    const P2 = polar(O, l2 * zoom, angle)
    const { m: M } = parallelogramCorners(O, P1, P2)
    const lengthCm = result.magnitude / scale
    return { result, scale, l1, l2, zoom, O, P1, P2, M, lengthCm }
  }, [f1, f2, angle])

  const { result, scale, l1, l2, zoom, O, P1, P2, M, lengthCm } = model
  const bounds = resultantBounds(f1, f2)
  const phi = result.fromF1
  const text = angleCase(angle, f1, f2, result.magnitude)
  const perpendicular = angle === 90
  const measured = roundTo(lengthCm, 1)
  const byDrawing = roundTo(measured * scale, 1)

  // grid in cm, aligned on O so every cell is exactly 1 cm of the drawing
  const gridX: number[] = []
  const gridY: number[] = []
  for (let x = O.x - Math.floor(O.x / zoom) * zoom; x < VIEW.width; x += zoom) gridX.push(x)
  for (let y = O.y - Math.floor(O.y / zoom) * zoom; y < VIEW.height; y += zoom) gridY.push(y)

  const tipLabel = (tip: Point, direction: number, side: 1 | -1): Point =>
    polar(polar(tip, 18, direction), 22, direction + 90 * side)

  const f1Label = tipLabel(P1, 0, -1)
  const f2Label = tipLabel(P2, angle, 1)
  // the resultant label sits beside the middle of the diagonal, on the free side, so it never meets
  // the vertex label M or the arrowheads at the tip
  // nearly collinear forces (0° / 180°) pile all labels on one line, so the resultant label moves further out
  const flat = angle < 14 || angle > 166
  const resLabel = polar(pointAlong(O, M, distance(O, M) * (flat ? 0.68 : 0.56)), flat ? 42 : 36, phi + 90)
  const mLabel = polar(M, 21, phi)

  // dimension line parallel to the diagonal, on the outer side
  const dimSide = angle >= 25 ? -1 : 1
  const dimOffset = angle >= 25 ? 22 : 58
  const D1 = polar(O, dimOffset, phi + 90 * dimSide)
  const D2 = polar(M, dimOffset, phi + 90 * dimSide)
  const dimMid: Point = { x: (D1.x + D2.x) / 2, y: (D1.y + D2.y) / 2 }
  const dimLabel = polar(dimMid, 16, phi + 90 * dimSide)

  const showCopies = stage >= 1
  const showResultant = stage >= 2
  const translation = { f2: { x: P1.x - O.x, y: P1.y - O.y }, f1: { x: P2.x - O.x, y: P2.y - O.y } }
  const angleArcRadius = Math.min(42, Math.max(24, l2 * zoom * 0.5))
  // the label sits just outside the wedge, away from the diagonal that runs through its middle
  const angleLabelDir = angle <= 150 ? angle + 18 : angle - 24
  const angleArcLabel = angleLabelPoint(O, angleArcRadius + 26, angleLabelDir, angleLabelDir)

  const plot = useMemo(() => {
    const w = 440
    const h = 190
    const box = { x: 56, y: 18, width: w - 56 - 16, height: h - 18 - 40 }
    const top = f1 + f2
    const points: string[] = []
    for (let a = 0; a <= 180; a += 3) {
      const value = resultantOfTwo(f1, f2, a).magnitude
      points.push(`${(box.x + (a / 180) * box.width).toFixed(1)},${(box.y + box.height - (value / top) * box.height).toFixed(1)}`)
    }
    const marker = {
      x: box.x + (angle / 180) * box.width,
      y: box.y + box.height - (result.magnitude / top) * box.height,
    }
    const minY = box.y + box.height - (bounds.min / top) * box.height
    return { w, h, box, points: points.join(' '), marker, minY, top }
  }, [f1, f2, angle, result.magnitude, bounds.min])

  const chooseExample = (a: number, b: number, theta: number) => {
    setF1(a)
    setF2(b)
    setAngle(theta)
  }

  return (
    <LabFrame
      className="parallelogram-lab"
      titleId="parallelogram-lab-title"
      title="قوّتان متلاقيتان: كيف نبني المحصّلة؟"
      phase="متوازي الأضلاع ومحصّلة قوّتين (الصفحات 57–59)"
      reducedMotion={reducedMotion}
      data={{
        f1,
        f2,
        angle,
        resultant: result.magnitude.toFixed(1),
        scale,
        stage,
      }}
    >
      <LabStages stages={STAGES} stage={stage} onStage={setStage} label="مراحل رسم المحصّلة" />

      <div className="plab__controls">
        <LabRange
          label={
            <>
              شدّة القوّة الأولى <MathFormula tex="F_1" />
            </>
          }
          value={f1}
          valueNode={<ScientificValue value={f1} unit="N" size="sm" />}
          min={1}
          max={100}
          onChange={setF1}
          ariaLabel="شدّة القوّة الأولى بالنيوتن"
          valueText={`${f1} نيوتن`}
        />
        <LabRange
          label={
            <>
              شدّة القوّة الثانية <MathFormula tex="F_2" />
            </>
          }
          value={f2}
          valueNode={<ScientificValue value={f2} unit="N" size="sm" />}
          min={1}
          max={100}
          onChange={setF2}
          ariaLabel="شدّة القوّة الثانية بالنيوتن"
          valueText={`${f2} نيوتن`}
        />
        <LabRange
          label="الزاوية بين الحاملين"
          value={angle}
          valueNode={<ScientificValue value={angle} unit="°" size="sm" />}
          min={0}
          max={180}
          onChange={setAngle}
          ariaLabel="الزاوية بين حاملي القوّتين بالدرجات"
          valueText={`${angle} درجة`}
        />
      </div>

      <div className="plab__presets-row">
        <div className="parallelogram-lab__presets" role="group" aria-label="زوايا مميّزة">
          {ANGLE_PRESETS.map((value) => (
            <button
              key={value}
              type="button"
              className={`parallelogram-lab__preset ${angle === value ? 'is-active' : ''}`}
              aria-pressed={angle === value}
              onClick={() => setAngle(value)}
            >
              {value}°
            </button>
          ))}
        </div>
        <div className="plab__examples" role="group" aria-label="مثالا الكتاب المحلولان">
          <button type="button" className="plab__example" onClick={() => chooseExample(4, 3, 60)}>
            مثال الصفحة 58: 4 N و 3 N بزاوية 60°
          </button>
          <button type="button" className="plab__example" onClick={() => chooseExample(60, 80, 90)}>
            مثال الصفحتين 58–59: 60 N و 80 N متعامدتان
          </button>
        </div>
      </div>

      <figure className="plab__figure parallelogram-lab__figure">
        <div className="parallelogram-lab__scale">
        <LabCanvas focus={((O.x - 60 + Math.max(M.x, P1.x) + 40) / 2) / VIEW.width}>
        <svg
          viewBox={`0 0 ${VIEW.width} ${VIEW.height}`}
          role="img"
          aria-label={`قوّتان ${f1} نيوتن و ${f2} نيوتن بينهما زاوية ${angle} درجة، محصّلتهما ${num(result.magnitude)} نيوتن بمقياس رسم ${scale} نيوتن لكل سنتيمتر`}
        >
          <rect className="plab-board" x={6} y={6} width={VIEW.width - 12} height={VIEW.height - 12} rx={16} />
          <g className="parallelogram-lab__grid">
            {gridX.map((x) => (
              <line key={`x${x.toFixed(1)}`} x1={x} y1={8} x2={x} y2={VIEW.height - 8} />
            ))}
            {gridY.map((y) => (
              <line key={`y${y.toFixed(1)}`} x1={8} y1={y} x2={VIEW.width - 8} y2={y} />
            ))}
          </g>

          {/* parallelogram body and translated copies */}
          {showCopies ? (
            <g className="plab-construction" data-stage-copies="true">
              <polygon className="plab-parallelogram" points={`${O.x},${O.y} ${P1.x},${P1.y} ${M.x},${M.y} ${P2.x},${P2.y}`} />
              <g className="plab-slide" style={cssVars({ '--tx': `${translation.f2.x}px`, '--ty': `${translation.f2.y}px` })}>
                <VectorArrow x1={O.x} y1={O.y} x2={P2.x} y2={P2.y} role="force2" lineStyle="dashed" strokeWidth={3} headSize={13} label="نسخة منقولة من القوّة الثانية" />
              </g>
              <g className="plab-slide" style={cssVars({ '--tx': `${translation.f1.x}px`, '--ty': `${translation.f1.y}px` })}>
                <VectorArrow x1={O.x} y1={O.y} x2={P1.x} y2={P1.y} role="force1" lineStyle="dashed" strokeWidth={3} headSize={13} label="نسخة منقولة من القوّة الأولى" />
              </g>
            </g>
          ) : null}

          {/* the two forces from O */}
          <VectorArrow x1={O.x} y1={O.y} x2={P1.x} y2={P1.y} role="force1" strokeWidth={4} headSize={15} className="plab-arrow" label={`القوّة الأولى ${f1} نيوتن`} />
          <VectorArrow x1={O.x} y1={O.y} x2={P2.x} y2={P2.y} role="force2" strokeWidth={4} headSize={15} className="plab-arrow" label={`القوّة الثانية ${f2} نيوتن`} />
          <VectorSvgLabel x={f1Label.x} y={f1Label.y} symbol="F" subscript="1" tone="force1" anchor="middle" magnitude={quantityText(f1, 'N')} />
          <VectorSvgLabel x={f2Label.x} y={f2Label.y} symbol="F" subscript="2" tone="force2" anchor="middle" magnitude={quantityText(f2, 'N')} />

          {/* the angle between the carriers */}
          {angle > 0 && angle < 180 && !perpendicular ? (
            <g className="plab-angles">
              <AngleMark centre={O} r={angleArcRadius} fromDeg={0} toDeg={angle} />
              <SvgText x={angleArcLabel.x} y={angleArcLabel.y + 5} tone="angle" halo>
                {quantityText(angle, '°', 0)}
              </SvgText>
            </g>
          ) : null}
          {perpendicular ? (
            <g className="plab-angles">
              <RightAngleMark vertex={O} dir1={0} dir2={90} size={14} />
              <SvgText x={O.x + 30} y={O.y - 12} tone="angle" halo>
                90°
              </SvgText>
            </g>
          ) : null}

          {/* resultant: the diagonal */}
          {showResultant ? (
            <g className="plab-resultant" data-stage-resultant="true">
              <VectorArrow
                x1={O.x}
                y1={O.y}
                x2={M.x}
                y2={M.y}
                role="resultant"
                strokeWidth={4.5}
                headSize={16}
                className="plab-arrow"
                animated={!reducedMotion}
                label={`المحصّلة ${num(result.magnitude)} نيوتن`}
              />
              <VectorSvgLabel x={resLabel.x} y={resLabel.y + 4} symbol="F" tone="resultant" anchor="middle" magnitude={quantityText(result.magnitude, 'N')} />
              {perpendicular ? (
                <g>
                  <RightAngleMark vertex={P1} dir1={180} dir2={90} size={12} />
                  <RightAngleMark vertex={M} dir1={270} dir2={180} size={12} />
                  <RightAngleMark vertex={P2} dir1={0} dir2={270} size={12} />
                </g>
              ) : null}
              {/* ruler: the length of the diagonal, read off the grid */}
              <g className="plab-dimension" aria-hidden="true">
                <line x1={D1.x} y1={D1.y} x2={D2.x} y2={D2.y} />
                <line x1={D1.x} y1={D1.y} x2={O.x} y2={O.y} className="plab-dimension__tick" />
                <line x1={D2.x} y1={D2.y} x2={M.x} y2={M.y} className="plab-dimension__tick" />
                <SvgText x={dimLabel.x} y={dimLabel.y + 5} tone="strong" halo>
                  {`OM = ${quantityText(lengthCm, 'cm')}`}
                </SvgText>
              </g>
            </g>
          ) : null}

          {/* points */}
          <g className="plab-meet" data-meet="O">
            <PointMark at={O} />
            <SymbolText x={O.x - 14} y={O.y + 24} symbol="O" align="right" />
          </g>
          {showCopies ? (
            <g>
              <PointMark at={M} />
              <SymbolText x={mLabel.x} y={mLabel.y + 5} symbol="M" align="center" />
            </g>
          ) : null}
        </svg>

          {/* a ruler of exactly one grid cell: its width is a share of the drawing's own width */}
          <span className="parallelogram-lab__scale-ruler" aria-hidden="true" style={{ inlineSize: `${(zoom / VIEW.width) * 100}%` }}>
            <span className="parallelogram-lab__scale-bar" />
          </span>
        </LabCanvas>
        <p className="parallelogram-lab__scale-caption">
          <strong>
            كل <bdi dir="ltr">1 cm</bdi> يمثل <bdi dir="ltr">{scale} N</bdi>
          </strong>{' '}
          <span>(مقياس رسم مناسب يُختار تلقائياً؛ الشبكة كلها بأقسام <bdi dir="ltr">1 cm</bdi>)</span>
        </p>
        </div>
        <LabLegend items={LEGEND} />
      </figure>

      <LabReadouts
        label="أطوال الرسم والمحصّلة"
        items={[
          {
            key: 'l1',
            tone: 'force1',
            label: 'طول شعاع القوّة الأولى',
            value: <ScientificValue value={num(l1, 2)} unit="cm" />,
          },
          {
            key: 'l2',
            tone: 'force2',
            label: 'طول شعاع القوّة الثانية',
            value: <ScientificValue value={num(l2, 2)} unit="cm" />,
          },
          ...(showResultant
            ? [
                {
                  key: 'om',
                  tone: 'resultant' as const,
                  label: 'طول القطر OM (بالقياس)',
                  value: <ScientificValue value={num(measured)} unit="cm" />,
                },
                {
                  key: 'f',
                  tone: 'resultant' as const,
                  label: 'شدّة المحصّلة F',
                  value: <ScientificValue value={num(byDrawing)} unit="N" />,
                },
                {
                  key: 'dir',
                  label: 'الزاوية بين F⃗ و F₁⃗',
                  value: <ScientificValue value={num(phi)} unit="°" />,
                },
              ]
            : []),
        ]}
      />

      {showResultant ? (
        <div className="plab__note" aria-live="polite">
          <p>
            <strong>الحساب من الرسم:</strong>{' '}
            <MathFormula tex={`F=${num(measured)}\\times${scale}=${num(byDrawing)}\\ \\mathrm{N}`} />
          </p>
          <p>
            <strong>حدّا المحصّلة:</strong> لا تقلّ عن الفرق بين الشدّتين ولا تزيد على مجموعهما:{' '}
            <MathFormula tex={`${num(bounds.min)}\\le F\\le ${num(bounds.max)}\\ \\mathrm{N}`} />.{' '}
            <span className="plab__ok">
              <CheckMark /> القيمة <ScientificValue value={num(result.magnitude)} unit="N" size="sm" /> ضمن الحدّين.
            </span>
          </p>
        </div>
      ) : null}

      <div className="plab__split">
        <div className="plab__split-main">
      <div className="parallelogram-lab__angle-case" aria-live="polite">
        <strong>
          <ScientificValue value={angle} unit="°" size="sm" /> — {text.name}
        </strong>
        <p>{text.text}</p>
        {text.tex ? <MathFormula tex={text.tex} display="block" /> : null}
      </div>

      {perpendicular ? (
        <div className="plab__pythagoras" data-pythagoras="true">
          <p className="plab__pythagoras-title">التحقق بنظرية فيثاغورث عند 90° (في المثلّث القائم: مربع الوتر = مجموع مربعي الضلعين القائمين)</p>
          <div className="plab__pythagoras-step">
            <strong>المعطيات</strong>
            <MathFormula tex={`F_1=${num(f1)}\\ \\mathrm{N},\\qquad F_2=${num(f2)}\\ \\mathrm{N},\\qquad \\angle(F_1,F_2)=90^{\\circ}`} />
          </div>
          <div className="plab__pythagoras-step">
            <strong>التعويض والحساب</strong>
            <MathFormula
              display="block"
              tex={`F=\\sqrt{F_1^{2}+F_2^{2}}=\\sqrt{${num(f1)}^{2}+${num(f2)}^{2}}=\\sqrt{${num(f1 * f1 + f2 * f2)}}${Math.abs(result.magnitude - Math.round(result.magnitude)) < 1e-9 ? '=' : '\\approx'}${num(result.magnitude)}\\ \\mathrm{N}`}
            />
          </div>
          <div className="plab__pythagoras-step">
            <strong>التحقق من المعقولية</strong>
            <ul>
              <li>
                الوتر أطول من كل ضلع قائم: <MathFormula tex={`F=${num(result.magnitude)}>${num(Math.max(f1, f2))}`} /> <CheckMark />
              </li>
              <li>
                والوتر أقصر من مجموع الضلعين: <MathFormula tex={`${num(result.magnitude)}<${num(f1 + f2)}`} /> <CheckMark />
              </li>
              <li>
                القياس بالمسطرة يوافق الحساب: <MathFormula tex={`OM=${num(measured)}\\ \\mathrm{cm}\\;\\Rightarrow\\;${num(measured)}\\times${scale}=${num(byDrawing)}\\ \\mathrm{N}`} /> <CheckMark />
              </li>
            </ul>
          </div>
        </div>
      ) : null}
        </div>

      <figure className="plab__plot">
        <svg viewBox={`0 0 ${plot.w} ${plot.h}`} role="img" aria-label={`منحنى شدّة المحصّلة بدلالة الزاوية: تتناقص من ${num(f1 + f2)} نيوتن عند 0 درجة إلى ${num(bounds.min)} نيوتن عند 180 درجة`}>
          <rect className="plab-plot__frame" x={plot.box.x} y={plot.box.y} width={plot.box.width} height={plot.box.height} />
          <line className="plab-plot__bound" x1={plot.box.x} y1={plot.box.y} x2={plot.box.x + plot.box.width} y2={plot.box.y} />
          <line className="plab-plot__bound" x1={plot.box.x} y1={plot.minY} x2={plot.box.x + plot.box.width} y2={plot.minY} />
          <polyline className="plab-plot__curve" points={plot.points} />
          <line className="plab-plot__guide" x1={plot.marker.x} y1={plot.box.y + plot.box.height} x2={plot.marker.x} y2={plot.marker.y} />
          <circle className="plab-plot__marker" cx={plot.marker.x} cy={plot.marker.y} r={5} />
          <SvgText x={plot.box.x - 6} y={plot.box.y + 4} align="right" tone="muted">
            {num(f1 + f2)}
          </SvgText>
          <SvgText x={plot.box.x - 6} y={plot.minY + 4} align="right" tone="muted">
            {num(bounds.min)}
          </SvgText>
          {[0, 90, 180].map((a) => (
            <SvgText key={a} x={plot.box.x + (a / 180) * plot.box.width} y={plot.h - 16} tone="muted">
              {`${a}°`}
            </SvgText>
          ))}
        </svg>
        <figcaption>
          العلاقة بين الزاوية وشدّة المحصّلة (إضافة من المنصة): كلّما كبرت الزاوية بين الحاملين صغرت المحصّلة، من <ScientificValue value={f1 + f2} unit="N" size="sm" /> عند 0° إلى{' '}
          <ScientificValue value={bounds.min} unit="N" size="sm" /> عند 180°.
        </figcaption>
      </figure>
      </div>
    </LabFrame>
  )
}

