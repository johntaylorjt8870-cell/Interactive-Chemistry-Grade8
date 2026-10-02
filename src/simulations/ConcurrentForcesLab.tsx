import { useMemo, useState } from 'react'
import { ScientificValue } from '@/scientific'
import { LabSymbol, PhysicsLabDefs, usePhysicsLabArrowIds } from './PhysicsLabSvg'
import type { InteractiveProps } from './registry'

/*
 * Page 56 apparatus, rebuilt as a platform model: a magnetic spring board,
 * two springs, their tying strings, the central hook and the hanging body.
 * The forces are applied at O. The tension calculation is a labelled platform
 * enhancement; the book gives no numerical readings for this experiment.
 */

const rad = (deg: number) => (deg * Math.PI) / 180

type Point = { x: number; y: number }

function pointAlong(start: Point, end: Point, distance: number): Point {
  const dx = end.x - start.x
  const dy = end.y - start.y
  const length = Math.hypot(dx, dy) || 1
  return { x: start.x + (dx / length) * distance, y: start.y + (dy / length) * distance }
}

/** A schematic zig-zag spring; its drawn extension is deliberately not a scale. */
function springPath(start: Point, end: Point, turns = 8, amplitude = 4.5): string {
  const dx = end.x - start.x
  const dy = end.y - start.y
  const length = Math.hypot(dx, dy) || 1
  const ux = dx / length
  const uy = dy / length
  const nx = -uy
  const ny = ux
  const lead = Math.min(10, length * 0.16)
  const tail = Math.min(10, length * 0.16)
  const usable = Math.max(8, length - lead - tail)
  const first = { x: start.x + ux * lead, y: start.y + uy * lead }
  const last = { x: end.x - ux * tail, y: end.y - uy * tail }
  const points = Array.from({ length: turns * 2 - 1 }, (_, index) => {
    const step = index + 1
    const t = step / (turns * 2)
    const sign = step % 2 === 0 ? -1 : 1
    return {
      x: first.x + ux * usable * t + nx * amplitude * sign,
      y: first.y + uy * usable * t + ny * amplitude * sign,
    }
  })

  return [
    `M ${start.x} ${start.y}`,
    `L ${first.x} ${first.y}`,
    ...points.map((point) => `L ${point.x} ${point.y}`),
    `L ${last.x} ${last.y}`,
    `L ${end.x} ${end.y}`,
  ].join(' ')
}

function carrierLine(origin: Point, endpoint: Point) {
  return {
    x1: origin.x - (endpoint.x - origin.x) * 0.48,
    y1: origin.y - (endpoint.y - origin.y) * 0.48,
    x2: endpoint.x + (endpoint.x - origin.x) * 0.18,
    y2: endpoint.y + (endpoint.y - origin.y) * 0.18,
  }
}

export default function ConcurrentForcesLab({ interactiveId, reducedMotion }: InteractiveProps) {
  const [a1, setA1] = useState(35)
  const [a2, setA2] = useState(35)
  const [w, setW] = useState(4)
  const [showCarriers, setShowCarriers] = useState(true)
  const arrows = usePhysicsLabArrowIds('concurrent-forces')

  const state = useMemo(() => {
    const sum = a1 + a2
    const t1 = (w * Math.sin(rad(a2))) / Math.sin(rad(sum))
    const t2 = (w * Math.sin(rad(a1))) / Math.sin(rad(sum))
    const O = { x: 310, y: 188 + (w - 4) * 1.6 }
    // Spring extension and hook travel are illustrative only; the book gives
    // neither a spring constant nor a displacement measurement.
    const length1 = 104 + Math.min(t1, 30) * 5.2
    const length2 = 104 + Math.min(t2, 30) * 5.2
    const u1 = { x: -Math.sin(rad(a1)), y: -Math.cos(rad(a1)) }
    const u2 = { x: Math.sin(rad(a2)), y: -Math.cos(rad(a2)) }
    const A1 = { x: O.x + length1 * u1.x, y: O.y + length1 * u1.y }
    const A2 = { x: O.x + length2 * u2.x, y: O.y + length2 * u2.y }
    const springEnd1 = pointAlong(A1, O, Math.hypot(O.x - A1.x, O.y - A1.y) * 0.57)
    const springEnd2 = pointAlong(A2, O, Math.hypot(O.x - A2.x, O.y - A2.y) * 0.57)
    const forceEnd1 = pointAlong(O, A1, Math.min(length1 * 0.88, 18 + t1 * 7))
    const forceEnd2 = pointAlong(O, A2, Math.min(length2 * 0.88, 18 + t2 * 7))
    const forceLabel1 = pointAlong(O, A1, Math.min(length1 * 0.78, Math.max(48, t1 * 8 + 20)))
    const forceLabel2 = pointAlong(O, A2, Math.min(length2 * 0.78, Math.max(48, t2 * 8 + 20)))
    const weightEnd = { x: O.x, y: O.y + 18 + w * 6.5 }
    const bodyY = O.y + 100
    return {
      sum,
      t1,
      t2,
      O,
      A1,
      A2,
      springEnd1,
      springEnd2,
      forceEnd1,
      forceEnd2,
      forceLabel1,
      forceLabel2,
      weightEnd,
      bodyY,
      length1,
      length2,
    }
  }, [a1, a2, w])

  const leftCarrier = carrierLine(state.O, state.A1)
  const rightCarrier = carrierLine(state.O, state.A2)
  const gridHoles = Array.from({ length: 7 }, (_, row) =>
    Array.from({ length: 13 }, (_, column) => ({ x: 58 + column * 42, y: 45 + row * 31, key: `${row}-${column}` })),
  ).flat()
  const leftAngleEnd = {
    x: state.O.x - 30 * Math.sin(rad(a1)),
    y: state.O.y - 30 * Math.cos(rad(a1)),
  }
  const rightAngleEnd = {
    x: state.O.x + 30 * Math.sin(rad(a2)),
    y: state.O.y - 30 * Math.cos(rad(a2)),
  }

  return (
    <section
      className={`lab physics-lab concurrent-forces-lab ${reducedMotion ? 'lab--still' : ''}`}
      data-a1={a1}
      data-a2={a2}
      data-w={w}
      data-t1={state.t1.toFixed(1)}
      data-t2={state.t2.toFixed(1)}
      data-hook-y={state.O.y.toFixed(1)}
      data-carriers={showCarriers ? 'true' : 'false'}
      aria-labelledby="concurrent-forces-lab-title"
      data-interactive={interactiveId}
    >
      <header className="lab__header">
        <div>
          <p className="lab__phase">إضافة من المنصة · تجربة الربيعتين (الصفحة 56)</p>
          <h3 id="concurrent-forces-lab-title">أين تتلاقى حوامل القوى الثلاث؟</h3>
        </div>
        <label className="concurrent-forces-lab__toggle">
          <input type="checkbox" checked={showCarriers} onChange={(event) => setShowCarriers(event.target.checked)} />
          أظهر امتدادات الحوامل المتقطعة
        </label>
      </header>

      <div className="parallelogram-lab__controls">
        <label className="lab__range">
          <span>
            زاوية الربيعة الأولى عن الشاقول <ScientificValue value={a1} unit="°" size="sm" />
          </span>
          <input type="range" min={10} max={80} step={5} value={a1} onChange={(event) => setA1(Number(event.target.value))} aria-label="زاوية الربيعة الأولى عن الشاقول بالدرجات" />
        </label>
        <label className="lab__range">
          <span>
            زاوية الربيعة الثانية عن الشاقول <ScientificValue value={a2} unit="°" size="sm" />
          </span>
          <input type="range" min={10} max={80} step={5} value={a2} onChange={(event) => setA2(Number(event.target.value))} aria-label="زاوية الربيعة الثانية عن الشاقول بالدرجات" />
        </label>
        <label className="lab__range">
          <span>
            ثقل الجسم المعلّق <ScientificValue value={w} unit="N" size="sm" />
          </span>
          <input type="range" min={1} max={10} step={1} value={w} onChange={(event) => setW(Number(event.target.value))} aria-label="ثقل الجسم المعلق نيوتن" />
        </label>
      </div>

      <figure className="concurrent-forces-lab__figure physics-lab__figure">
        <svg
          viewBox="0 0 620 365"
          role="img"
          aria-label={`لوح زنابض مغناطيسي عليه ربيعتان وخيطا ربط وجسم معلّق عند O. زاويتا الربيعتين ${a1} و${a2} درجة، والثقل ${w} نيوتن؛ شدّتا النموذج ${state.t1.toFixed(1)} و${state.t2.toFixed(1)} نيوتن.`}
        >
          <PhysicsLabDefs arrows={arrows} />

          {/* Magnetic spring board and its fixing holes. */}
          <rect x="34" y="24" width="552" height="244" rx="10" className="concurrent-forces-lab__board" />
          <line x1="48" y1="53" x2="572" y2="53" className="concurrent-forces-lab__board-rail" />
          {gridHoles.map((hole) => <circle key={hole.key} cx={hole.x} cy={hole.y} r="2.1" className="concurrent-forces-lab__board-hole" />)}
          <text x="566" y="43" textAnchor="end" className="physics-lab__equipment-label" direction="rtl">لوح الزنابض</text>

          {/* Extended lines of action all pass through the same hook point O. */}
          {showCarriers ? (
            <g className="vec-lab__carriers" aria-hidden="true">
              <line {...leftCarrier} className="vec-lab__carrier" />
              <line {...rightCarrier} className="vec-lab__carrier" />
              <line x1={state.O.x} y1={state.O.y - 112} x2={state.O.x} y2={state.O.y + 148} className="vec-lab__carrier" />
            </g>
          ) : null}

          {/* The two actual coil springs end in short tying strings at the hook. */}
          <line x1={state.A1.x} y1={state.A1.y} x2={state.A1.x} y2={state.A1.y - 10} className="concurrent-forces-lab__mount-stem" />
          <line x1={state.A2.x} y1={state.A2.y} x2={state.A2.x} y2={state.A2.y - 10} className="concurrent-forces-lab__mount-stem" />
          <circle cx={state.A1.x} cy={state.A1.y} r="7" className="concurrent-forces-lab__mount" />
          <circle cx={state.A2.x} cy={state.A2.y} r="7" className="concurrent-forces-lab__mount" />
          <path d={springPath(state.A1, state.springEnd1)} className="concurrent-forces-lab__spring" />
          <path d={springPath(state.A2, state.springEnd2)} className="concurrent-forces-lab__spring" />
          <line x1={state.springEnd1.x} y1={state.springEnd1.y} x2={state.O.x} y2={state.O.y} className="concurrent-forces-lab__string" />
          <line x1={state.springEnd2.x} y1={state.springEnd2.y} x2={state.O.x} y2={state.O.y} className="concurrent-forces-lab__string" />

          {/* The hanging hook, connecting thread and body are separate from the vectors. */}
          <path d={`M ${state.O.x - 8} ${state.O.y + 5} Q ${state.O.x - 10} ${state.O.y + 21} ${state.O.x} ${state.O.y + 26} Q ${state.O.x + 10} ${state.O.y + 21} ${state.O.x + 8} ${state.O.y + 5}`} className="concurrent-forces-lab__hook" />
          <line x1={state.O.x} y1={state.O.y + 26} x2={state.O.x} y2={state.bodyY} className="concurrent-forces-lab__string concurrent-forces-lab__string--load" />
          <rect x={state.O.x - 25} y={state.bodyY} width="50" height="32" rx="4" className="concurrent-forces-lab__body" />
          <line x1={state.O.x - 13} y1={state.bodyY + 8} x2={state.O.x + 13} y2={state.bodyY + 8} className="concurrent-forces-lab__body-mark" />

          {/* Force vectors at O; lengths use the schematic drawing scale, not a book measurement. */}
          <line x1={state.O.x} y1={state.O.y} x2={state.forceEnd1.x} y2={state.forceEnd1.y} className="vec-lab__force vec-lab__force--f1" markerEnd={`url(#${arrows.f1})`} data-force-vector="F1" />
          <line x1={state.O.x} y1={state.O.y} x2={state.forceEnd2.x} y2={state.forceEnd2.y} className="vec-lab__force vec-lab__force--f2" markerEnd={`url(#${arrows.f2})`} data-force-vector="F2" />
          <line x1={state.O.x} y1={state.O.y} x2={state.weightEnd.x} y2={state.weightEnd.y} className="vec-lab__force vec-lab__force--w" markerEnd={`url(#${arrows.weight})`} data-force-vector="weight" />
          <text x={state.forceLabel1.x - 22} y={state.forceLabel1.y - 8} className="vec-lab__label">F₁</text>
          <text x={state.forceLabel2.x + 8} y={state.forceLabel2.y - 8} className="vec-lab__label">F₂</text>
          <text x={state.weightEnd.x + 10} y={state.weightEnd.y + 5} className="vec-lab__label">w</text>

          {/* Angle references, common point and the book's three-force picture. */}
          <line x1={state.O.x} y1={state.O.y - 38} x2={state.O.x} y2={state.O.y + 38} className="vec-lab__axis" />
          <path d={`M ${state.O.x} ${state.O.y - 30} A 30 30 0 0 0 ${leftAngleEnd.x} ${leftAngleEnd.y}`} className="vec-lab__angle" />
          <path d={`M ${state.O.x} ${state.O.y - 30} A 30 30 0 0 1 ${rightAngleEnd.x} ${rightAngleEnd.y}`} className="vec-lab__angle" />
          <text x={state.O.x - 44} y={state.O.y - 31} className="vec-lab__label">a₁</text>
          <text x={state.O.x + 30} y={state.O.y - 31} className="vec-lab__label">a₂</text>
          <circle cx={state.O.x} cy={state.O.y} r="7" className="vec-lab__point" data-meet="O" />
          <text x={state.O.x - 21} y={state.O.y + 17} className="vec-lab__label">O</text>
        </svg>
        <figcaption className="physics-lab__figure-caption">اتجاهات القوى مرسومة من نقطة التعليق <LabSymbol>O</LabSymbol>؛ امتدادات الحوامل المتقطعة تُظهر التلاقي.</figcaption>
      </figure>

      <div className="lab__measurements physics-lab__readouts" role="group" aria-label="قراءات نموذج المنصة">
        <div>
          <span>شدّ الربيعة الأولى، <LabSymbol>F₁</LabSymbol></span>
          <ScientificValue value={Number(state.t1.toFixed(1))} unit="N" />
        </div>
        <div>
          <span>شدّ الربيعة الثانية، <LabSymbol>F₂</LabSymbol></span>
          <ScientificValue value={Number(state.t2.toFixed(1))} unit="N" />
        </div>
        <div>
          <span>ثقل الجسم، <LabSymbol>w</LabSymbol></span>
          <ScientificValue value={w} unit="N" />
        </div>
        <div>
          <span>الزاوية بين الربيعتين</span>
          <ScientificValue value={state.sum} unit="°" />
        </div>
        <div>
          <span>نقطة تلاقي الحوامل</span>
          <strong className="lab__measurement-text">نقطة واحدة: <LabSymbol>O</LabSymbol></strong>
        </div>
      </div>

      <p className="physics-lab__note" data-attribution="platform">
        <strong>إضافة من المنصة:</strong> شدّتا الربيعتين محسوبتان من نموذج اتزان ساكن باستخدام الزوايا والثقل المختار؛ الكتاب لا يورد قراءات عددية لهذه التجربة. استطالة الربيعتين وموضع الخطاف وأطوال الأسهم في الرسم توضيحية وغير مقياسة.
      </p>

      <p className="lab__conclusion" aria-live="polite">
        <strong>استنتاج الكتاب:</strong> حوامل شدّي الربيعتين والثقل، بعد امتدادها، تلتقي في نقطة واحدة <LabSymbol>O</LabSymbol>؛ لذلك تُسمّى القوى قوى متلاقية.
      </p>
    </section>
  )
}
