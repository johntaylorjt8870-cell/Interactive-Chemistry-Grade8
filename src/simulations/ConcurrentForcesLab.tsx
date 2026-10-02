import { useMemo, useState } from 'react'
import { DiagramDefs, ScientificValue } from '@/scientific'
import { LiveStatus } from '@/components/LiveStatus'
import type { InteractiveProps } from './registry'

/* ============================================================================
   مختبر القوى المتلاقية — إضافة من المنصة حول تجربة الصفحة 56
   ----------------------------------------------------------------------------
   إعادة بناء رقمية لتجربة الكتاب: جسم معلّق بخطّافين عبر ربيعتين. الطالب
   يغيّر زاويتي الربيعتين وثقل الجسم، ويقرأ شدّتي الشدّ، ويرى أنّ حوامل القوى
   الثلاث (بامتداداتها) تتلاقى في نقطة واحدة — وهو تعريف الكتاب للقوى المتلاقية.
   ========================================================================= */

const rad = (deg: number) => (deg * Math.PI) / 180

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

  const announcement = `ثقل الجسم ${w} نيوتن والزاوية بين الربيعتين ${state.sum} درجة؛ شدّة الشدّ في الربيعة الأولى ${state.t1.toFixed(1)} نيوتن وفي الثانية ${state.t2.toFixed(1)} نيوتن.`

  const O = { x: 240, y: 170 }
  const springLen = 95
  const u1 = { x: Math.sin(rad(a1)), y: -Math.cos(rad(a1)) }
  const u2 = { x: -Math.sin(rad(a2)), y: -Math.cos(rad(a2)) }
  const S1 = { x: O.x + springLen * u1.x, y: O.y + springLen * u1.y }
  const S2 = { x: O.x + springLen * u2.x, y: O.y + springLen * u2.y }
  const wLen = 26 + w * 7

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
          <input type="range" min={10} max={80} step={5} value={a1} onChange={(event) => setA1(Number(event.target.value))} aria-label="ميل الربيعة الأولى عن الشاقول بالدرجات" aria-valuetext={`${a1} درجة`} />
        </label>
        <label className="lab__range">
          <span>
            ميل الربيعة الثانية عن الشاقول <ScientificValue value={a2} unit="°" size="sm" />
          </span>
          <input type="range" min={10} max={80} step={5} value={a2} onChange={(event) => setA2(Number(event.target.value))} aria-label="ميل الربيعة الثانية عن الشاقول بالدرجات" aria-valuetext={`${a2} درجة`} />
        </label>
        <label className="lab__range">
          <span>
            ثقل الجسم المعلّق <ScientificValue value={w} unit="N" size="sm" />
          </span>
          <input type="range" min={1} max={10} step={1} value={w} onChange={(event) => setW(Number(event.target.value))} aria-label="ثقل الجسم المعلق نيوتن" aria-valuetext={`${w} نيوتن`} />
        </label>
      </div>

      <div className="concurrent-forces-lab__figure">
        <svg viewBox="0 0 480 300" role="img" aria-label={`جسم معلّق بربيعتين؛ شدتا الشد ${state.t1.toFixed(1)} و${state.t2.toFixed(1)} نيوتن والثقل ${w} نيوتن، وحوامل القوى تتلاقى في النقطة O`}>
          <DiagramDefs />
          {showCarriers ? (
            <g className="vec-lab__construction">
              <line x1={O.x - 130 * u1.x} y1={O.y - 130 * u1.y} x2={S1.x} y2={S1.y} className="vec-lab__dashed" />
              <line x1={O.x - 130 * u2.x} y1={O.y - 130 * u2.y} x2={S2.x} y2={S2.y} className="vec-lab__dashed" />
              <line x1={O.x} y1={O.y - 120} x2={O.x} y2={O.y + 120} className="vec-lab__dashed" />
            </g>
          ) : null}
          {/* the two spring tensions */}
          <line x1={O.x} y1={O.y} x2={S1.x} y2={S1.y} className="vec-lab__force vec-lab__force--f1" markerEnd="url(#diagram-arrow)" />
          <line x1={O.x} y1={O.y} x2={S2.x} y2={S2.y} className="vec-lab__force vec-lab__force--f2" markerEnd="url(#diagram-arrow)" />
          <text x={S1.x + 6} y={S1.y} className="vec-lab__label">F₁</text>
          <text x={S2.x - 20} y={S2.y} className="vec-lab__label">F₂</text>
          {/* weight */}
          <line x1={O.x} y1={O.y} x2={O.x} y2={O.y + wLen} className="vec-lab__force vec-lab__force--w" markerEnd="url(#diagram-arrow)" />
          <text x={O.x + 8} y={O.y + wLen} className="vec-lab__label">w</text>
          <rect x={O.x - 9} y={O.y + wLen * 0.45} width={18} height={14} className="concurrent-forces-lab__body" />
          <circle cx={O.x} cy={O.y} r={5} className="vec-lab__point" data-meet="O" />
          <text x={O.x - 20} y={O.y + 4} className="vec-lab__label">O</text>
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

      <LiveStatus message={announcement} />

      <p className="lab__conclusion">
        <strong>الاستنتاج:</strong> مهما غيّرت الزاويتين أو الثقل، تبقى حوامل القوى الثلاث (بامتداداتها المتقطعة) تتلاقى في
        نقطة واحدة هي نقطة التعليق O؛ لذلك تسمّى قوى متلاقية، والجسم يبقى ساكناً لأن محصّلتها صفر.
      </p>
    </section>
  )
}
