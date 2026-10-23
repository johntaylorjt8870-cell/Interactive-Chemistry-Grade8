import { useMemo, useState } from 'react'
import type { InteractiveProps } from './registry'

/* ============================================================================
   Rutherford scattering (page 4)
   ----------------------------------------------------------------------------
   Every particle is computed from geometry, not from a modulo counter:

     * the atom is modelled as a disc of radius A = 100 (screen units);
     * the nucleus is a disc of adjustable radius R, drawn enlarged — the real
       nucleus is about 1/10 000 of the atom, which would be invisible here;
     * the impact parameter b is sampled uniformly over the atom's area
       (b = A·√u, so the sample density is constant per unit area);
     * the interaction zone is a model choice stated in the panel:
         b < R            → the particle comes close enough to rebound
         R ≤ b < 2R       → deflected
         b ≥ 2R           → passes straight through.

   Because the zones are circles, the fractions follow the areas:
   rebound (R/A)², deflection (4R² − R²)/A², straight 1 − 4R²/A².
   Sampling uses a seeded PRNG so a rerun with the same settings is reproducible
   and a test never depends on Math.random.
   ========================================================================= */

const ATOM_RADIUS = 100
const STRAIGHT = 'straight'
const DEFLECTED = 'deflected'
const REBOUND = 'rebounded'
type Track = typeof STRAIGHT | typeof DEFLECTED | typeof REBOUND

/** mulberry32 — tiny deterministic PRNG, seeded per run. */
function random(seed: number) {
  let state = seed >>> 0
  return () => {
    state = (state + 0x6d2b79f5) >>> 0
    let t = state
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function classify(impact: number, nucleusRadius: number): Track {
  if (impact < nucleusRadius) return REBOUND
  if (impact < nucleusRadius * 2) return DEFLECTED
  return STRAIGHT
}

type Particle = { id: string; impact: number; /** Signed offset from the axis, in atom-radius units. */ offset: number; track: Track }

/** Pure sample: same arguments always produce the same particles. */
function makeParticles(run: number, count: number, nucleusRadius: number): Particle[] {
  const next = random(run * 7919 + nucleusRadius * 131 + count)
  return Array.from({ length: count }, (_, index) => {
    const impact = ATOM_RADIUS * Math.sqrt(next())
    const sign = next() < 0.5 ? -1 : 1
    return {
      id: `${run}-${index}`,
      impact,
      offset: (impact / ATOM_RADIUS) * 7 * sign,
      track: classify(impact, nucleusRadius),
    }
  })
}

type Prediction = 'mostly-straight' | 'mostly-deflected' | 'mostly-rebound'

/** The prediction the sampled result actually supports. */
function dominantPrediction(particles: Particle[]): Prediction {
  const totals: Record<Track, number> = { straight: 0, deflected: 0, rebounded: 0 }
  for (const particle of particles) totals[particle.track] += 1
  if (totals.straight >= totals.deflected && totals.straight >= totals.rebounded) return 'mostly-straight'
  return totals.deflected >= totals.rebounded ? 'mostly-deflected' : 'mostly-rebound'
}

const PREDICTIONS: Array<{ id: Prediction; label: string }> = [
  { id: 'mostly-straight', label: 'معظمها ستمرّ مستقيمة' },
  { id: 'mostly-deflected', label: 'معظمها ستنحرف' },
  { id: 'mostly-rebound', label: 'معظمها سترتدّ' },
]

export default function RutherfordScattering({ reducedMotion }: InteractiveProps) {
  const [count, setCount] = useState(120)
  const [nucleusRadius, setNucleusRadius] = useState(14)
  const [run, setRun] = useState(0)
  const [prediction, setPrediction] = useState<Prediction | null>(null)
  const [predictionState, setPredictionState] = useState<'none' | 'correct' | 'wrong'>('none')
  const [visible, setVisible] = useState(0)

  const particles = useMemo(
    () => makeParticles(run, count, nucleusRadius),
    [count, nucleusRadius, run],
  )

  const shown = particles.slice(0, visible === 0 ? 0 : visible)
  const measurements = {
    straight: shown.filter((particle) => particle.track === STRAIGHT).length,
    deflected: shown.filter((particle) => particle.track === DEFLECTED).length,
    rebounded: shown.filter((particle) => particle.track === REBOUND).length,
  }
  const launched = visible > 0
  const finished = visible >= count

  const expectedRebound = (nucleusRadius / ATOM_RADIUS) ** 2
  const expectedDeflected = (4 * nucleusRadius ** 2 - nucleusRadius ** 2) / ATOM_RADIUS ** 2

  function reset() {
    setVisible(0)
    setPrediction(null)
    setPredictionState('none')
  }

  function launchAll() {
    const nextRun = run + 1
    const nextParticles = makeParticles(nextRun, count, nucleusRadius)
    setRun(nextRun)
    setVisible(count)
    // Check against the sample that is about to be displayed.
    setPredictionState(prediction === dominantPrediction(nextParticles) ? 'correct' : 'wrong')
  }

  function step() {
    setVisible((value) => Math.min(count, value + 1))
  }

  return (
    <section className="lab" aria-labelledby="rutherford-title">
      <header className="lab__header">
        <div>
          <p className="lab__phase">إضافة من المنصة · محاكاة تفسيرية</p>
          <h3 id="rutherford-title">حزمة ألفا وصفيحة الذهب</h3>
        </div>
        <label className="lab__range">
          عدد الجسيمات: <output>{count}</output>
          <input
            type="range"
            min={20}
            max={300}
            step={20}
            value={count}
            onChange={(event) => {
              setCount(Number(event.target.value))
              reset()
            }}
          />
        </label>
      </header>

      <div className="prediction-panel">
        <p className="prediction-panel__title">توقّع قبل التشغيل: ماذا سيحدث لمعظم جسيمات ألفا؟</p>
        <div className="prediction-panel__options" role="group" aria-label="توقّع نتيجة التجربة">
          {PREDICTIONS.map((option) => (
            <button
              key={option.id}
              type="button"
              className="button button--secondary button--small"
              aria-pressed={prediction === option.id}
              onClick={() => {
                setPrediction(option.id)
                setPredictionState('none')
              }}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div className="rutherford-stage" role="img" aria-label="تمثيل مسارات جسيمات ألفا على صفيحة الذهب">
        <div className="rutherford-stage__source">α</div>
        <div className="rutherford-stage__foil" role="img" aria-label="صفيحة الذهب" />
        <div
          className="rutherford-stage__nucleus"
          role="img"
          aria-label="نواة موجبة مرسومة مكبّرة"
          style={{
          inlineSize: `${nucleusRadius * 4}px`,
          blockSize: `${nucleusRadius * 4}px`,
          insetInlineStart: `calc(61% - ${nucleusRadius * 2}px)`,
          insetBlockStart: `calc(50% - ${nucleusRadius * 2}px)`,
        }}
        >
          +
        </div>
        {shown.map((particle) => (
          // The impact parameter is a distance from the nucleus axis, so it is
          // drawn on both sides of the central line, not stacked on one edge.
          <span
            key={particle.id}
            className={`alpha alpha--${particle.track}`}
            style={
              {
                '--start-y': `calc(50% + ${particle.offset.toFixed(2)}rem)`,
                '--delay': reducedMotion ? '0ms' : '0ms',
              } as React.CSSProperties
            }
            title={
              particle.track === REBOUND ? 'ارتداد' : particle.track === DEFLECTED ? 'انحراف' : 'نفاذ'
            }
          >
            α
          </span>
        ))}
      </div>

      <div className="lab__actions">
        <button
          type="button"
          className="button button--primary"
          onClick={launchAll}
          disabled={prediction === null}
        >
          {launched ? 'أعد إطلاق الحزمة' : 'أطلق الحزمة'}
        </button>
        <button
          type="button"
          className="button button--secondary"
          onClick={step}
          disabled={finished || prediction === null}
        >
          خطوة واحدة
        </button>
        <button type="button" className="button button--quiet" onClick={reset}>
          إعادة الضبط
        </button>
      </div>

      {prediction === null ? (
        <p className="lab__note">اختر توقعك أولاً؛ لا يبدأ الإطلاق قبل التوقع.</p>
      ) : null}

      <label className="lab__range">
        حجم النواة في النموذج (مرسومة مكبّرة): <output>{nucleusRadius}</output>
        <input
          type="range"
          min={2}
          max={30}
          step={1}
          value={nucleusRadius}
          onChange={(event) => {
            setNucleusRadius(Number(event.target.value))
            reset()
          }}
        />
      </label>

      <div className="lab__measurements" aria-live="polite">
        <div>
          <span>نفذت مستقيمة</span>
          <strong>{launched ? measurements.straight : '—'}</strong>
        </div>
        <div>
          <span>انحرفت</span>
          <strong>{launched ? measurements.deflected : '—'}</strong>
        </div>
        <div>
          <span>ارتدت</span>
          <strong>{launched ? measurements.rebounded : '—'}</strong>
        </div>
        <div>
          <span>أُطلقت فعلاً</span>
          <strong>{shown.length} / {count}</strong>
        </div>
      </div>

      <div className="capacity-note">
        <p>
          <strong>نتوقع من النموذج هندسياً:</strong> نسبة الارتداد ≈ (نصف قطر النواة ÷ نصف قطر الذرة)² ={' '}
          {(expectedRebound * 100).toFixed(2)}%، ونسبة الانحراف حتى ضعف نصف القطر ≈{' '}
          {(expectedDeflected * 100).toFixed(2)}%. النموذج يضع النواة مكبّرة لتبقى مرئية؛ في الذرة الحقيقية تكون
          النواة أصغر من ذلك بمقادير كبيرة، ولهذا تكون نسبة الارتداد في التجربة الحقيقية أقل بكثير.
        </p>
      </div>

      {predictionState === 'wrong' ? (
        <p className="prediction-panel__result" data-state="wrong" role="status">
          الملاحظة تخالف هذا التوقع: معظم الجسيمات مرّت مستقيمة، وقليل منها فقط انحرف أو ارتد. فسّر ذلك بأن معظم
          حجم الذرة فراغ، وبأن الشحنة الموجبة والكتلة مركزتان في النواة.
        </p>
      ) : predictionState === 'correct' ? (
        <p className="prediction-panel__result" data-state="correct" role="status">
          توقّعك صحيح: معظم الجسيمات نفذت مستقيمة، وجزء صغير انحرف، وجزء أصغر ارتد.
        </p>
      ) : null}

      <p className="lab__conclusion">
        <strong>الاستنتاج:</strong> كثرة المسارات المستقيمة تدل على أن معظم الحجم فراغ، وندرة الانحراف والارتداد
        تدل على جزء صغير كثيف موجب هو النواة. زد حجم النواة في النموذج وستزداد نسب الانحراف والارتداد، وهذا اختبار
        للفكرة: النتيجة تتبع مساحة الهدف المركزي.
      </p>
    </section>
  )
}
