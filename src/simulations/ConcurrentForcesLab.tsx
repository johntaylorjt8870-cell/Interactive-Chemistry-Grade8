import { useMemo, useState } from 'react'
import { ScientificValue, VectorArrow, VectorSvgLabel } from '@/scientific'
import type { InteractiveProps } from './registry'

/* ============================================================================
   مختبر القوى المتلاقية — إضافة من المنصة حول تجربة الصفحة 56
   ----------------------------------------------------------------------------
   إعادة بناء رقمية لتجربة الكتاب: جسم معلّق بخطّافين عبر ربيعتين مثبّتتين
   على لوح الزنابض. الطالب يغيّر زاويتي الربيعتين وثقل الجسم، فيرى ربيعتين
   حقيقيتين (لفّات نابض)، وجسماً معلّقاً، وثلاثة أسهم قوى حقيقية (خط + رأس
   سهم مرسومان هندسياً)، وامتدادات الحوامل الثلاثة تلتقي في نقطة واحدة O —
   وهو تعريف الكتاب للقوى المتلاقية.
   ========================================================================= */

const rad = (deg: number) => (deg * Math.PI) / 180

type P = { x: number; y: number }

/** Zig-zag spring between two points — a real coil, not a straight line. */
function springPath(from: P, to: P, coils = 9, amplitude = 7): string {
  const dx = to.x - from.x
  const dy = to.y - from.y
  const length = Math.hypot(dx, dy) || 1
  const ux = dx / length
  const uy = dy / length
  const px = -uy
  const py = ux
  const lead = 10
  const coilLength = length - lead * 2
  const step = coilLength / (coils * 2)
  const points: string[] = [`M ${from.x} ${from.y}`, `L ${from.x + ux * lead} ${from.y + uy * lead}`]
  for (let i = 0; i < coils * 2; i += 1) {
    const along = lead + step * (i + 1)
    const side = i % 2 === 0 ? amplitude : -amplitude
    points.push(`L ${from.x + ux * along + px * side} ${from.y + uy * along + py * side}`)
  }
  points.push(`L ${to.x} ${to.y}`)
  return points.join(' ')
}

export default function ConcurrentForcesLab({ reducedMotion }: InteractiveProps) {
  const [a1, setA1] = useState(35)
  const [a2, setA2] = useState(35)
  const [w, setW] = useState(4)
  const [showCarriers, setShowCarriers] = useState(true)

  const state = useMemo(() => {
    const sum = a1 + a2
    const t1 = (w * Math.sin(rad(a2))) / Math.sin(rad(sum))
    const t2 = (w * Math.sin(rad(a1))) / Math.sin(rad(sum))
    return { t1, t2, sum }
  }, [a1, a2, w])

  const O = { x: 260, y: 190 }
  const beamY = 34
  const anchor1 = { x: 260 + 120 * Math.sin(rad(a1)), y: beamY }
  const anchor2 = { x: 260 - 120 * Math.sin(rad(a2)), y: beamY }
  const u1 = { x: Math.sin(rad(a1)), y: -Math.cos(rad(a1)) }
  const u2 = { x: -Math.sin(rad(a2)), y: -Math.cos(rad(a2)) }
  // force arrow lengths encode the tension magnitudes (1 N ≙ 11 px)
  const f1Len = 34 + state.t1 * 11
  const f2Len = 34 + state.t2 * 11
  const wLen = 34 + w * 11
  const F1 = { x: O.x + u1.x * f1Len, y: O.y + u1.y * f1Len }
  const F2 = { x: O.x + u2.x * f2Len, y: O.y + u2.y * f2Len }
  const W = { x: O.x, y: O.y + wLen }
  const bodyY = O.y + wLen * 0.62

  return (
    <section
      className={`lab concurrent-forces-lab ${reducedMotion ? 'lab--still' : ''}`}
      data-a1={a1}
      data-a2={a2}
      data-w={w}
      data-t1={state.t1.toFixed(1)}
      data-t2={state.t2.toFixed(1)}
      data-carriers={showCarriers ? 'true' : 'false'}
      aria-labelledby="concurrent-forces-lab-title"
    >
      <header className="lab__header">
        <div>
          <p className="lab__phase">إضافة من المنصة · تجربة الصفحة 56 بشكل تفاعلي</p>
          <h3 id="concurrent-forces-lab-title">أين تتلاقى حوامل القوى الثلاث؟</h3>
        </div>
        <label className="concurrent-forces-lab__toggle">
          <input type="checkbox" checked={showCarriers} onChange={(event) => setShowCarriers(event.target.checked)} />
          أظهر امتدادات الحوامل (خطوطاً متقطعة)
        </label>
      </header>

      <div className="parallelogram-lab__controls">
        <label className="lab__range">
          <span>
            ميل الربيعة الأولى عن الشاقول <ScientificValue value={a1} unit="°" size="sm" />
          </span>
          <input type="range" min={10} max={80} step={5} value={a1} onChange={(event) => setA1(Number(event.target.value))} aria-label="ميل الربيعة الأولى عن الشاقول بالدرجات" />
        </label>
        <label className="lab__range">
          <span>
            ميل الربيعة الثانية عن الشاقول <ScientificValue value={a2} unit="°" size="sm" />
          </span>
          <input type="range" min={10} max={80} step={5} value={a2} onChange={(event) => setA2(Number(event.target.value))} aria-label="ميل الربيعة الثانية عن الشاقول بالدرجات" />
        </label>
        <label className="lab__range">
          <span>
            ثقل الجسم المعلّق <ScientificValue value={w} unit="N" size="sm" />
          </span>
          <input type="range" min={1} max={10} step={1} value={w} onChange={(event) => setW(Number(event.target.value))} aria-label="ثقل الجسم المعلق نيوتن" />
        </label>
      </div>

      <div className="concurrent-forces-lab__figure">
        <svg viewBox="0 0 520 360" role="img" aria-label={`جسم معلّق بربيعتين مثبّتتين على لوح؛ شدتا الشد ${state.t1.toFixed(1)} و${state.t2.toFixed(1)} نيوتن والثقل ${w} نيوتن، وحوامل القوى الثلاث تتلاقى في النقطة O`}>
          {/* magnetic spring board */}
          <rect x={40} y={12} width={440} height={22} rx={6} className="concurrent-forces-lab__board" />
          <text x={48} y={28} className="concurrent-forces-lab__board-label">لوح الزنابض</text>

          {/* lines of action (carriers), all passing through O */}
          {showCarriers ? (
            <g className="vec-lab__construction" data-carriers="true">
              <line x1={O.x - 200 * u1.x} y1={O.y - 200 * u1.y} x2={anchor1.x} y2={anchor1.y} className="vec-lab__carrier" />
              <line x1={O.x - 200 * u2.x} y1={O.y - 200 * u2.y} x2={anchor2.x} y2={anchor2.y} className="vec-lab__carrier" />
              <line x1={O.x} y1={O.y - 170} x2={O.x} y2={330} className="vec-lab__carrier" />
            </g>
          ) : null}

          {/* the two real springs */}
          <path d={springPath(anchor1, { x: O.x + u1.x * 12, y: O.y + u1.y * 12 })} className="concurrent-forces-lab__spring" data-spring="1" />
          <path d={springPath(anchor2, { x: O.x + u2.x * 12, y: O.y + u2.y * 12 })} className="concurrent-forces-lab__spring" data-spring="2" />

          {/* strings from the springs to the ring at O */}
          <line x1={O.x + u1.x * 12} y1={O.y + u1.y * 12} x2={O.x} y2={O.y} className="concurrent-forces-lab__string" />
          <line x1={O.x + u2.x * 12} y1={O.y + u2.y * 12} x2={O.x} y2={O.y} className="concurrent-forces-lab__string" />

          {/* hanging body: hook + mass */}
          <line x1={O.x} y1={O.y} x2={O.x} y2={bodyY - 14} className="concurrent-forces-lab__string" />
          <path d={`M ${O.x - 5} ${bodyY - 14} a 5 5 0 1 0 10 0 z`} className="concurrent-forces-lab__hook" />
          <rect x={O.x - 17} y={bodyY - 12} width={34} height={28} rx={5} className="concurrent-forces-lab__body" data-body="true" />
          <text x={O.x} y={bodyY + 7} textAnchor="middle" className="concurrent-forces-lab__body-label">جسم</text>

          {/* the three force vectors — real shafts + real arrowheads */}
          <g data-forces="tensions">
            <VectorArrow x1={O.x} y1={O.y} x2={F1.x} y2={F1.y} role="force1" strokeWidth={3.4} label={`شدّة الربيعة الأولى ${state.t1.toFixed(1)} نيوتن`} />
            <VectorArrow x1={O.x} y1={O.y} x2={F2.x} y2={F2.y} role="force2" strokeWidth={3.4} label={`شدّة الربيعة الثانية ${state.t2.toFixed(1)} نيوتن`} />
            <VectorArrow x1={O.x} y1={O.y} x2={W.x} y2={W.y} role="weight" strokeWidth={3.4} label={`ثقل الجسم ${w} نيوتن`} />
          </g>

          {/* labels carry their own arrow accents — never colour alone */}
          <VectorSvgLabel x={F1.x + 12} y={F1.y - 4} symbol="F" subscript="1" tone="force1" magnitude={`${state.t1.toFixed(1)} N`} />
          <VectorSvgLabel x={F2.x - 12} y={F2.y - 18} symbol="F" subscript="2" tone="force2" anchor="end" magnitude={`${state.t2.toFixed(1)} N`} />
          <VectorSvgLabel x={W.x + 12} y={W.y + 2} symbol="w" tone="weight" magnitude={`${w} N`} />

          {/* concurrency point */}
          <circle cx={O.x} cy={O.y} r={6} className="vec-lab__point" data-meet="O" />
          <text x={O.x - 22} y={O.y - 10} className="vec-lab__label">O</text>

          {/* angle arcs against the vertical */}
          <path d={`M ${O.x + 34 * Math.sin(rad(a1)) * 0.6} ${O.y - 34 * Math.cos(rad(a1)) * 0.6} A 20 20 0 0 1 ${O.x} ${O.y - 20}`} className="vec-lab__angle" />
          <path d={`M ${O.x - 34 * Math.sin(rad(a2)) * 0.6} ${O.y - 34 * Math.cos(rad(a2)) * 0.6} A 20 20 0 0 0 ${O.x} ${O.y - 20}`} className="vec-lab__angle" />
          <text x={O.x + 22} y={O.y - 26} className="vec-lab__label vec-lab__label--angle">a₁</text>
          <text x={O.x - 40} y={O.y - 26} className="vec-lab__label vec-lab__label--angle">a₂</text>
        </svg>
      </div>

      <div className="lab__measurements">
        <div>
          <span>شدّة شدّ الربيعة الأولى F₁</span>
          <ScientificValue value={Number(state.t1.toFixed(1))} unit="N" />
        </div>
        <div>
          <span>شدّة شدّ الربيعة الثانية F₂</span>
          <ScientificValue value={Number(state.t2.toFixed(1))} unit="N" />
        </div>
        <div>
          <span>ثقل الجسم w</span>
          <ScientificValue value={w} unit="N" />
        </div>
        <div>
          <span>الزاوية بين الربيعتين</span>
          <ScientificValue value={state.sum} unit="°" />
        </div>
        <div>
          <span>نقطة تلاقي الحوامل</span>
          <strong className="lab__measurement-text">نقطة واحدة: O مهما غيّرت</strong>
        </div>
        <div>
          <span>عند التعادل</span>
          <strong className="lab__measurement-text">محصلة القوى الثلاث تساوي صفراً</strong>
        </div>
      </div>

      <p className="lab__conclusion" aria-live="polite">
        <strong>الاستنتاج:</strong> مهما غيّرت الزاويتين أو الثقل، تبقى حوامل القوى الثلاث (بامتداداتها المتقطعة) تتلاقى في
        نقطة واحدة هي نقطة التعليق O؛ لذلك تسمّى قوى متلاقية، والجسم يبقى ساكناً لأن محصّلتها صفر.
      </p>
    </section>
  )
}
