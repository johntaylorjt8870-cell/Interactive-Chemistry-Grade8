import { useMemo, useState } from 'react'
import { ScientificValue, VectorArrow, VectorArrowSet, VectorSvgLabel } from '@/scientific'
import type { InteractiveProps } from './registry'
import {
  CONCURRENT_BOARD,
  CONCURRENT_BODY_TEXT,
  CONCURRENT_TITLE,
  CONCURRENT_VIEWBOX,
  concurrentLayout,
} from './diagramLayouts'

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

  const layout = concurrentLayout({ a1, a2, w, t1: state.t1, t2: state.t2 })
  const { O, u1, u2, anchor1, anchor2, tail1, tail2, F1, F2, W, bodyY, labels } = layout

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
        <svg viewBox={`0 0 ${CONCURRENT_VIEWBOX.width} ${CONCURRENT_VIEWBOX.height}`} role="img" aria-label={`جسم معلّق بربيعتين مثبّتتين على لوح؛ شدتا الشد ${state.t1.toFixed(1)} و${state.t2.toFixed(1)} نيوتن والثقل ${w} نيوتن، وحوامل القوى الثلاث تتلاقى في النقطة O`}>
          {/* magnetic spring board: a panel, so each spring peg sits where its line of action leaves it */}
          <rect
            x={CONCURRENT_BOARD.left}
            y={CONCURRENT_BOARD.top}
            width={CONCURRENT_BOARD.right - CONCURRENT_BOARD.left}
            height={CONCURRENT_BOARD.bottom - CONCURRENT_BOARD.top}
            rx={12}
            className="concurrent-forces-lab__board"
          />
          <text x={34} y={36} className="concurrent-forces-lab__board-label">{CONCURRENT_TITLE}</text>

          {/* lines of action (carriers), all passing through O */}
          {showCarriers ? (
            <g className="vec-lab__construction" data-carriers="true">
              <line x1={tail1.x} y1={tail1.y} x2={anchor1.x} y2={anchor1.y} className="vec-lab__carrier" />
              <line x1={tail2.x} y1={tail2.y} x2={anchor2.x} y2={anchor2.y} className="vec-lab__carrier" />
              <line x1={O.x} y1={30} x2={O.x} y2={328} className="vec-lab__carrier" />
            </g>
          ) : null}

          {/* the two real springs: each lies ALONG its force, pegged where the line of action leaves the board */}
          <path d={springPath(anchor1, { x: O.x + u1.x * 12, y: O.y + u1.y * 12 })} className="concurrent-forces-lab__spring" data-spring="1" />
          <path d={springPath(anchor2, { x: O.x + u2.x * 12, y: O.y + u2.y * 12 })} className="concurrent-forces-lab__spring" data-spring="2" />
          <circle cx={anchor1.x} cy={anchor1.y} r={5} className="concurrent-forces-lab__peg" />
          <circle cx={anchor2.x} cy={anchor2.y} r={5} className="concurrent-forces-lab__peg" />

          {/* strings from the springs to the ring at O */}
          <line x1={O.x + u1.x * 12} y1={O.y + u1.y * 12} x2={O.x} y2={O.y} className="concurrent-forces-lab__string" />
          <line x1={O.x + u2.x * 12} y1={O.y + u2.y * 12} x2={O.x} y2={O.y} className="concurrent-forces-lab__string" />

          {/* hanging body: hook + mass (drawn first, so the weight arrow stays on top and visible) */}
          <line x1={O.x} y1={O.y} x2={O.x} y2={bodyY - 14} className="concurrent-forces-lab__string" />
          <path d={`M ${O.x - 5} ${bodyY - 14} a 5 5 0 1 0 10 0 z`} className="concurrent-forces-lab__hook" />
          <rect x={O.x - 17} y={bodyY - 12} width={34} height={28} rx={5} className="concurrent-forces-lab__body" data-body="true" />
          <text x={layout.bodyLabel.x} y={layout.bodyLabel.y} textAnchor="middle" className="concurrent-forces-lab__body-label">{CONCURRENT_BODY_TEXT}</text>

          {/* the three force vectors — real shafts + real arrowheads */}
          <g data-forces="tensions">
            {/* one shared halo layer under all three: crisp over springs, no fringe over each other */}
            <VectorArrowSet>
              <VectorArrow x1={O.x} y1={O.y} x2={F1.x} y2={F1.y} role="force1" strokeWidth={3.4} label={`شدّة الربيعة الأولى ${state.t1.toFixed(1)} نيوتن`} />
              <VectorArrow x1={O.x} y1={O.y} x2={F2.x} y2={F2.y} role="force2" strokeWidth={3.4} label={`شدّة الربيعة الثانية ${state.t2.toFixed(1)} نيوتن`} />
              <VectorArrow x1={O.x} y1={O.y} x2={W.x} y2={W.y} role="weight" strokeWidth={3.4} label={`ثقل الجسم ${w} نيوتن`} />
            </VectorArrowSet>
          </g>

          {/* concurrency point */}
          <circle cx={O.x} cy={O.y} r={6} className="vec-lab__point" data-meet="O" />
          <text x={labels.o.x} y={labels.o.y} textAnchor="middle" className="vec-lab__label">O</text>

          {/* angle arcs against the vertical, drawn around O */}
          <path d={layout.arc1} className="vec-lab__angle" />
          <path d={layout.arc2} className="vec-lab__angle" />
          <text x={labels.a1.x} y={labels.a1.y} textAnchor="middle" className="vec-lab__label vec-lab__label--angle">{labels.a1.text}</text>
          <text x={labels.a2.x} y={labels.a2.y} textAnchor="middle" className="vec-lab__label vec-lab__label--angle">{labels.a2.text}</text>

          {/* labels carry their own arrow accents — never colour alone; each was placed clear of arrows, springs and the other labels */}
          <VectorSvgLabel x={labels.f1.x} y={labels.f1.y} {...labels.f1.spec} tone="force1" anchor="middle" />
          <VectorSvgLabel x={labels.f2.x} y={labels.f2.y} {...labels.f2.spec} tone="force2" anchor="middle" />
          <VectorSvgLabel x={labels.w.x} y={labels.w.y} {...labels.w.spec} tone="weight" anchor="middle" />
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
