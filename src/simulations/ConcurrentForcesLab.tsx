import { useEffect, useMemo, useRef, useState } from 'react'
import { DiagramDefs, ScientificValue } from '@/scientific'
import { LiveStatus } from '@/components/LiveStatus'
import type { InteractiveProps } from './registry'
import {
  buildPointMotionStyle,
  buildSegmentMotionStyle,
  vectorAngleDeg,
  vectorLabelPoint,
  vectorLength,
  type Point2D,
} from './vectorAnimation'

/* ============================================================================
   مختبر القوى المتلاقية — إضافة من المنصة حول تجربة الصفحة 56
   ----------------------------------------------------------------------------
   إعادة بناء رقمية لتجربة الكتاب: جسم معلّق بخطّافين عبر ربيعتين. الطالب
   يغيّر زاويتي الربيعتين وثقل الجسم، ويقرأ شدّتي الشدّ، ويرى أنّ حوامل القوى
   الثلاث (بامتداداتها) تتلاقى في نقطة واحدة — وهو تعريف الكتاب للقوى المتلاقية.
   ========================================================================= */

type ChangedParam = 'init' | 'a1' | 'a2' | 'w' | 'carriers'
type AnimTrigger = 'construct' | 'param'

const rad = (deg: number) => (deg * Math.PI) / 180

export default function ConcurrentForcesLab({ reducedMotion }: InteractiveProps) {
  const [a1, setA1] = useState(35)
  const [a2, setA2] = useState(35)
  const [w, setW] = useState(4)
  const [showCarriers, setShowCarriers] = useState(true)
  const [lastChanged, setLastChanged] = useState<ChangedParam>('init')
  const [animTrigger, setAnimTrigger] = useState<AnimTrigger>('construct')
  const [revision, setRevision] = useState(0)

  const state = useMemo(() => {
    const sum = a1 + a2
    const t1 = (w * Math.sin(rad(a2))) / Math.sin(rad(sum))
    const t2 = (w * Math.sin(rad(a1))) / Math.sin(rad(sum))
    return { t1, t2, sum }
  }, [a1, a2, w])

  const announcement = `ثقل الجسم ${w} نيوتن والزاوية بين الربيعتين ${state.sum} درجة؛ شدّة الشدّ في الربيعة الأولى ${state.t1.toFixed(1)} نيوتن وفي الثانية ${state.t2.toFixed(1)} نيوتن.`
  const O: Point2D = { x: 240, y: 170 }
  // Fix 14: every vector is drawn at the same scale (6 px per newton), so the
  // shaft length is directly proportional to the tension or weight it shows.
  const pixelsPerNewton = 6
  const len1 = state.t1 * pixelsPerNewton
  const len2 = state.t2 * pixelsPerNewton
  const u1 = { x: Math.sin(rad(a1)), y: -Math.cos(rad(a1)) }
  const u2 = { x: -Math.sin(rad(a2)), y: -Math.cos(rad(a2)) }
  const S1: Point2D = { x: O.x + len1 * u1.x, y: O.y + len1 * u1.y }
  const S2: Point2D = { x: O.x + len2 * u2.x, y: O.y + len2 * u2.y }
  const wLen = w * pixelsPerNewton
  const W: Point2D = { x: O.x, y: O.y + wLen }

  // Labels are centred (text-anchor: middle) and placed clear of the arrowhead,
  // so their position never depends on the resolved bidi base direction and
  // they never sit on top of the shaft they annotate.
  const labelF1 = vectorLabelPoint(O, S1)
  const labelF2 = vectorLabelPoint(O, S2)
  const labelW = vectorLabelPoint(O, W)

  const prevRef = useRef<{ O: Point2D; S1: Point2D; S2: Point2D; W: Point2D } | null>(null)
  const prev = prevRef.current

  useEffect(() => {
    prevRef.current = { O, S1, S2, W }
  }, [O.x, O.y, S1.x, S1.y, S2.x, S2.y, W.x, W.y])

  const updateParam = (param: 'a1' | 'a2' | 'w', value: number) => {
    if (param === 'a1') setA1(value)
    else if (param === 'a2') setA2(value)
    else setW(value)
    setLastChanged(param)
    setAnimTrigger('param')
    setRevision((current) => current + 1)
  }

  const toggleCarriers = (checked: boolean) => {
    setShowCarriers(checked)
    setLastChanged('carriers')
    setAnimTrigger('construct')
    setRevision((current) => current + 1)
  }

  return (
    <section
      className={`lab concurrent-forces-lab ${reducedMotion ? 'lab--still' : ''}`}
      data-a1={a1}
      data-a2={a2}
      data-w={w}
      data-t1={state.t1.toFixed(1)}
      data-t2={state.t2.toFixed(1)}
      data-carriers={showCarriers ? 'true' : 'false'}
      data-anim-mode={reducedMotion ? 'still' : 'animated'}
      data-anim-trigger={animTrigger}
      data-last-changed={lastChanged}
      data-revision={revision}
      aria-labelledby="concurrent-forces-lab-title"
    >
      <header className="lab__header">
        <div>
          <p className="lab__phase">محاكاة تفاعلية من المنصة · مستلهمة من تجربة الصفحة 56</p>
          <h3 id="concurrent-forces-lab-title">أين تتلاقى حوامل القوى الثلاث؟</h3>
        </div>
        <label className="concurrent-forces-lab__toggle">
          <input
            type="checkbox"
            checked={showCarriers}
            onChange={(event) => toggleCarriers(event.target.checked)}
          />
          أظهر امتدادات الحوامل (خطوطاً متقطعة)
        </label>
      </header>

      <div className="parallelogram-lab__controls">
        <label className="lab__range">
          <span>
            ميل الربيعة الأولى عن الشاقول <ScientificValue value={a1} unit="°" size="sm" />
          </span>
          <input
            type="range"
            min={10}
            max={80}
            step={5}
            value={a1}
            onChange={(event) => updateParam('a1', Number(event.target.value))}
            aria-label="ميل الربيعة الأولى عن الشاقول بالدرجات"
            aria-valuetext={`${a1} درجة`}
          />
        </label>
        <label className="lab__range">
          <span>
            ميل الربيعة الثانية عن الشاقول <ScientificValue value={a2} unit="°" size="sm" />
          </span>
          <input
            type="range"
            min={10}
            max={80}
            step={5}
            value={a2}
            onChange={(event) => updateParam('a2', Number(event.target.value))}
            aria-label="ميل الربيعة الثانية عن الشاقول بالدرجات"
            aria-valuetext={`${a2} درجة`}
          />
        </label>
        <label className="lab__range">
          <span>
            ثقل الجسم المعلّق <ScientificValue value={w} unit="N" size="sm" />
          </span>
          <input
            type="range"
            min={1}
            max={10}
            step={1}
            value={w}
            onChange={(event) => updateParam('w', Number(event.target.value))}
            aria-label="ثقل الجسم المعلق نيوتن"
            aria-valuetext={`${w} نيوتن`}
          />
        </label>
      </div>

      <div className="concurrent-forces-lab__figure">
        <svg
          viewBox="0 0 480 300"
          role="img"
          data-morph-phase={revision % 2 === 0 ? 'a' : 'b'}
          aria-label={`جسم معلّق بربيعتين؛ شدتا الشد ${state.t1.toFixed(1)} و${state.t2.toFixed(1)} نيوتن والثقل ${w} نيوتن، وحوامل القوى تتلاقى في النقطة O`}
        >
          <DiagramDefs />
          {showCarriers ? (
            <g className="vec-lab__construction" data-carriers-group="true">
              <line
                x1={O.x - 130 * u1.x}
                y1={O.y - 130 * u1.y}
                x2={S1.x}
                y2={S1.y}
                className="vec-lab__dashed"
                data-anim-role="carrier-line"
                data-carrier="F1"
                style={buildSegmentMotionStyle(
                  { start: O, end: S1 },
                  prev ? { start: prev.O, end: prev.S1 } : undefined,
                  { delayMs: 20, reducedMotion },
                )}
              />
              <line
                x1={O.x - 130 * u2.x}
                y1={O.y - 130 * u2.y}
                x2={S2.x}
                y2={S2.y}
                className="vec-lab__dashed"
                data-anim-role="carrier-line"
                data-carrier="F2"
                style={buildSegmentMotionStyle(
                  { start: O, end: S2 },
                  prev ? { start: prev.O, end: prev.S2 } : undefined,
                  { delayMs: 90, reducedMotion },
                )}
              />
              <line
                x1={O.x}
                y1={O.y - 120}
                x2={O.x}
                y2={O.y + 120}
                className="vec-lab__dashed"
                data-anim-role="carrier-line"
                data-carrier="w"
                style={buildSegmentMotionStyle(
                  { start: O, end: W },
                  prev ? { start: prev.O, end: prev.W } : undefined,
                  { delayMs: 160, reducedMotion },
                )}
              />
              <circle
                cx={O.x}
                cy={O.y}
                r={11}
                className="vec-lab__concurrency-ring"
                data-anim-role="concurrency-ring"
              />
            </g>
          ) : null}

          {/* angle arcs relative to vertical at O */}
          <path
            d={`M ${O.x} ${O.y - 28} A 28 28 0 0 1 ${O.x + 28 * u1.x} ${O.y + 28 * u1.y}`}
            className="vec-lab__angle"
          />
          <path
            d={`M ${O.x} ${O.y - 28} A 28 28 0 0 0 ${O.x + 28 * u2.x} ${O.y + 28 * u2.y}`}
            className="vec-lab__angle"
          />

          {/* the two spring tensions */}
          <line
            x1={O.x}
            y1={O.y}
            x2={S1.x}
            y2={S1.y}
            pathLength={100}
            className="vec-lab__force vec-lab__force--f1"
            data-vector="F1"
            data-anim-role="vector-shaft"
            data-vector-length={vectorLength(O, S1)}
            data-vector-angle={vectorAngleDeg(O, S1)}
            style={buildSegmentMotionStyle(
              { start: O, end: S1 },
              prev ? { start: prev.O, end: prev.S1 } : undefined,
              { delayMs: 40, reducedMotion },
            )}
            markerEnd="url(#diagram-arrow)"
          />
          <line
            x1={O.x}
            y1={O.y}
            x2={S2.x}
            y2={S2.y}
            pathLength={100}
            className="vec-lab__force vec-lab__force--f2"
            data-vector="F2"
            data-anim-role="vector-shaft"
            data-vector-length={vectorLength(O, S2)}
            data-vector-angle={vectorAngleDeg(O, S2)}
            style={buildSegmentMotionStyle(
              { start: O, end: S2 },
              prev ? { start: prev.O, end: prev.S2 } : undefined,
              { delayMs: 110, reducedMotion },
            )}
            markerEnd="url(#diagram-arrow)"
          />
          <text
            x={labelF1.x}
            y={labelF1.y}
            textAnchor="middle"
            className="vec-lab__label"
            data-anim-role="vector-label"
            data-label-for="F1"
            style={buildPointMotionStyle(labelF1, prev ? vectorLabelPoint(prev.O, prev.S1) : undefined, {
              delayMs: 180,
              reducedMotion,
            })}
          >
            F₁
          </text>
          <text
            x={labelF2.x}
            y={labelF2.y}
            textAnchor="middle"
            className="vec-lab__label"
            data-anim-role="vector-label"
            data-label-for="F2"
            style={buildPointMotionStyle(labelF2, prev ? vectorLabelPoint(prev.O, prev.S2) : undefined, {
              delayMs: 220,
              reducedMotion,
            })}
          >
            F₂
          </text>

          {/* weight; drawn under its vector so the scaled arrowhead stays visible */}
          <rect
            x={O.x - 9}
            y={O.y + wLen * 0.45}
            width={18}
            height={14}
            className="concurrent-forces-lab__body"
            style={buildPointMotionStyle(
              { x: O.x, y: O.y + wLen * 0.45 },
              prev ? { x: prev.O.x, y: O.y + (prev.W.y - prev.O.y) * 0.45 } : undefined,
              { delayMs: 0, reducedMotion },
            )}
          />
          <line
            x1={O.x}
            y1={O.y}
            x2={W.x}
            y2={W.y}
            pathLength={100}
            className="vec-lab__force vec-lab__force--w"
            data-vector="w"
            data-anim-role="vector-shaft"
            data-vector-length={vectorLength(O, W)}
            data-vector-angle={vectorAngleDeg(O, W)}
            style={buildSegmentMotionStyle(
              { start: O, end: W },
              prev ? { start: prev.O, end: prev.W } : undefined,
              { delayMs: 170, reducedMotion },
            )}
            markerEnd="url(#diagram-arrow)"
          />
          <text
            x={labelW.x}
            y={labelW.y}
            textAnchor="middle"
            className="vec-lab__label"
            data-anim-role="vector-label"
            data-label-for="w"
            style={buildPointMotionStyle(labelW, prev ? vectorLabelPoint(prev.O, prev.W) : undefined, {
              delayMs: 260,
              reducedMotion,
            })}
          >
            w
          </text>
          <circle cx={O.x} cy={O.y} r={5} className="vec-lab__point" data-meet="O" data-anim-role="origin" />
          <text x={O.x - 16} y={O.y + 18} textAnchor="middle" className="vec-lab__label" data-label-kind="marker">
            O
          </text>
        </svg>
      </div>

      <div className="lab__measurements">
        <div data-highlight={lastChanged === 'a1' || lastChanged === 'a2' || lastChanged === 'w' ? 'true' : undefined}>
          <span>شدّة شدّ الربيعة الأولى F₁</span>
          <ScientificValue value={Number(state.t1.toFixed(1))} unit="N" />
        </div>
        <div data-highlight={lastChanged === 'a1' || lastChanged === 'a2' || lastChanged === 'w' ? 'true' : undefined}>
          <span>شدّة شدّ الربيعة الثانية F₂</span>
          <ScientificValue value={Number(state.t2.toFixed(1))} unit="N" />
        </div>
        <div data-highlight={lastChanged === 'w' ? 'true' : undefined}>
          <span>ثقل الجسم w</span>
          <ScientificValue value={w} unit="N" />
        </div>
        <div data-highlight={lastChanged === 'a1' || lastChanged === 'a2' ? 'true' : undefined}>
          <span>الزاوية بين الربيعتين</span>
          <ScientificValue value={state.sum} unit="°" />
        </div>
        <div data-highlight={lastChanged === 'carriers' ? 'true' : undefined}>
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
