import { useMemo, useState } from 'react'
import { ChargeValue, ElectronConfiguration, IonNotation, NuclearNotation } from '@/scientific'
import { RtlRun } from '@/components/BidiText'
import type { InteractiveProps } from './registry'
import './lesson1-labs.css'

/* ============================================================================
   Atom inventory lab (pages 7–8)
   ----------------------------------------------------------------------------
   A single coherent model of a particle: the student sets protons, neutrons and
   electrons; every displayed value is derived from those three numbers:

       Z = protons            (the element's identity)
       A = protons + neutrons (mass number)
       charge = protons − electrons
       distribution = textbook fill order (K = 2, every later shell ≤ 8)

   No displayed value is hard-coded per preset. The challenge mode compares the
   student's own settings with a target particle and reports which of the three
   numbers is wrong — it never fakes success.
   ========================================================================= */

type Element = { z: number; symbol: string; name: string }

const ELEMENTS: Element[] = [
  { z: 1, symbol: 'H', name: 'الهيدروجين' },
  { z: 2, symbol: 'He', name: 'الهيليوم' },
  { z: 3, symbol: 'Li', name: 'الليثيوم' },
  { z: 4, symbol: 'Be', name: 'البيريليوم' },
  { z: 5, symbol: 'B', name: 'البورون' },
  { z: 6, symbol: 'C', name: 'الكربون' },
  { z: 7, symbol: 'N', name: 'النيتروجين' },
  { z: 8, symbol: 'O', name: 'الأكسجين' },
  { z: 9, symbol: 'F', name: 'الفلور' },
  { z: 10, symbol: 'Ne', name: 'النيون' },
  { z: 11, symbol: 'Na', name: 'الصوديوم' },
  { z: 12, symbol: 'Mg', name: 'المغنزيوم' },
  { z: 13, symbol: 'Al', name: 'الألمنيوم' },
  { z: 14, symbol: 'Si', name: 'السيليكون' },
  { z: 15, symbol: 'P', name: 'الفوسفور' },
  { z: 16, symbol: 'S', name: 'الكبريت' },
  { z: 17, symbol: 'Cl', name: 'الكلور' },
  { z: 18, symbol: 'Ar', name: 'الأرغون' },
  { z: 19, symbol: 'K', name: 'البوتاسيوم' },
  { z: 20, symbol: 'Ca', name: 'الكالسيوم' },
]

/** Textbook fill order: K holds 2, every later shell holds at most 8. */
function textbookDistribution(electrons: number): number[] {
  const result: number[] = []
  let remaining = Math.max(0, electrons)
  let index = 0
  while (remaining > 0 && index < 5) {
    const capacity = index === 0 ? 2 : 8
    const used = Math.min(capacity, remaining)
    result.push(used)
    remaining -= used
    index += 1
  }
  return result.length > 0 ? result : [0]
}

type Particle = { protons: number; neutrons: number; electrons: number }

const TARGETS: Array<{ id: string; label: string; particle: Particle }> = [
  { id: 'na', label: 'ذرة الصوديوم ²³₁₁Na', particle: { protons: 11, neutrons: 12, electrons: 11 } },
  { id: 'na-ion', label: 'أيون الصوديوم Na⁺', particle: { protons: 11, neutrons: 12, electrons: 10 } },
  { id: 'cl-ion', label: 'أيون الكلور Cl⁻', particle: { protons: 17, neutrons: 18, electrons: 18 } },
  { id: 'o18', label: 'نظير الأكسجين ¹⁸₈O', particle: { protons: 8, neutrons: 10, electrons: 8 } },
  { id: 'mg-ion', label: 'أيون المغنزيوم Mg²⁺', particle: { protons: 12, neutrons: 12, electrons: 10 } },
]

const PRESETS: Array<{ id: string; label: string; particle: Particle }> = [
  { id: 'na', label: 'Na', particle: { protons: 11, neutrons: 12, electrons: 11 } },
  { id: 'na-ion', label: 'Na⁺', particle: { protons: 11, neutrons: 12, electrons: 10 } },
  { id: 'cl', label: 'Cl', particle: { protons: 17, neutrons: 18, electrons: 17 } },
  { id: 'o16', label: '¹⁶O', particle: { protons: 8, neutrons: 8, electrons: 8 } },
  { id: 'o18', label: '¹⁸O', particle: { protons: 8, neutrons: 10, electrons: 8 } },
]

type Prediction = 'positive' | 'negative' | 'neutral'
const PREDICTION_LABEL: Record<Prediction, string> = {
  positive: 'أيون موجب',
  negative: 'أيون سالب',
  neutral: 'ذرّة متعادلة',
}

export default function AtomInventoryLab(_props: InteractiveProps) {
  const [particle, setParticle] = useState<Particle>({ protons: 11, neutrons: 12, electrons: 11 })
  const [prediction, setPrediction] = useState<Prediction | null>(null)
  const [predictionResult, setPredictionResult] = useState<'none' | 'correct' | 'wrong'>('none')
  const [targetIndex, setTargetIndex] = useState(0)
  const [challengeResult, setChallengeResult] = useState<'idle' | 'correct' | 'wrong'>('idle')

  const element = ELEMENTS[Math.min(Math.max(particle.protons, 1), 20) - 1]!
  const massNumber = particle.protons + particle.neutrons
  const charge = particle.protons - particle.electrons
  const distribution = useMemo(() => textbookDistribution(particle.electrons), [particle.electrons])
  const target = TARGETS[targetIndex]!

  const kind: Prediction = charge > 0 ? 'positive' : charge < 0 ? 'negative' : 'neutral'
  // ChargeValue treats a bare number as a magnitude, so the sign is passed
  // explicitly: a positive charge must read «+1», never «1».
  const chargeText = charge > 0 ? `+${charge}` : String(charge)
  const kindLabel = PREDICTION_LABEL[kind]
  // The derived identity is the answer to the prediction prompt, so it stays
  // hidden until the student commits to a prediction and asks for the check.
  // (Protons, neutrons and electrons remain visible: they are the inputs the
  // student reasons from, not the conclusion.)
  const revealed = predictionResult !== 'none'

  function update(next: Partial<Particle>) {
    setParticle((current) => {
      const merged = { ...current, ...next }
      return {
        protons: Math.min(20, Math.max(1, merged.protons)),
        neutrons: Math.min(25, Math.max(0, merged.neutrons)),
        electrons: Math.min(22, Math.max(0, merged.electrons)),
      }
    })
    setPredictionResult('none')
    setChallengeResult('idle')
  }

  function selectPreset(next: Particle) {
    setParticle(next)
    setPredictionResult('none')
    setChallengeResult('idle')
  }

  function checkChallenge() {
    const correct =
      particle.protons === target.particle.protons &&
      particle.neutrons === target.particle.neutrons &&
      particle.electrons === target.particle.electrons
    setChallengeResult(correct ? 'correct' : 'wrong')
  }

  return (
    <section className="lab atom-lab" aria-labelledby="atom-lab-title">
      <header className="lab__header">
        <div>
          <p className="lab__phase">إضافة من المنصة · نموذج حسابي لجسيم</p>
          <h3 id="atom-lab-title">مخزون الجسيمات: من الأعداد إلى الهوية والشحنة</h3>
        </div>
        <div className="atom-badge" aria-live="polite">
          <NuclearNotation symbol={element.symbol} massNumber={massNumber} atomicNumber={particle.protons} size="lg" />
          <span className="atom-badge__name">{element.name}</span>
        </div>
      </header>

      <div className="particle-grid">
        <ParticleStepper
          id="protons"
          label="البروتونات (Z)"
          hint="تحدد هوية العنصر"
          value={particle.protons}
          min={1}
          max={20}
          onChange={(value) => update({ protons: value })}
        />
        <ParticleStepper
          id="neutrons"
          label="النيوترونات"
          hint="تحدد النظير والعدد الكتلي"
          value={particle.neutrons}
          min={0}
          max={25}
          onChange={(value) => update({ neutrons: value })}
        />
        <ParticleStepper
          id="electrons"
          label="الإلكترونات"
          hint="تحدد الشحنة ونوع الجسيم"
          value={particle.electrons}
          min={0}
          max={22}
          onChange={(value) => update({ electrons: value })}
        />
      </div>

      <div className="atom-presets" role="group" aria-label="نماذج جاهزة من الدرس">
        {PRESETS.map((preset) => (
          <button
            key={preset.id}
            type="button"
            className="button button--quiet button--small"
            onClick={() => selectPreset(preset.particle)}
          >
            {preset.label}
          </button>
        ))}
      </div>

      <div className="lab__measurements" aria-live="polite">
        <div>
          <span>العدد الذري Z</span>
          <strong>{particle.protons}</strong>
        </div>
        <div>
          <span>العدد الكتلي A = Z + N</span>
          <strong>{massNumber}</strong>
        </div>
        <div>
          <span>النيوترونات = A − Z</span>
          <strong>{particle.neutrons}</strong>
        </div>
        <div>
          <span>عدد الإلكترونات</span>
          <strong>{particle.electrons}</strong>
        </div>
        <div>
          <span>الشحنة = البروتونات − الإلكترونات</span>
          <strong data-revealed={revealed ? 'true' : 'false'}>
            {revealed ? <ChargeValue value={chargeText} /> : <span aria-label="تُكشف بعد التحقق من التوقع">؟</span>}
          </strong>
        </div>
        <div>
          <span>نوع الجسيم</span>
          <strong className="lab__measurement-text" data-revealed={revealed ? 'true' : 'false'}>
            {revealed ? kindLabel : 'بانتظار توقّعك'}
          </strong>
        </div>
      </div>

      <div className="atom-readout">
        <div className="atom-readout__row">
          <span>التوزيع الإلكتروني</span>
          <ElectronConfiguration value={distribution.join('-')} />
        </div>
        <div className="atom-readout__row">
          <span>إلكترونات السوية الأخيرة</span>
          <strong>{distribution.at(-1) ?? 0}</strong>
        </div>
        <div className="atom-readout__row">
          <span>الرمز الأيوني</span>
          {!revealed ? (
            <span className="atom-readout__pending">يُكشف بعد التحقق من التوقّع</span>
          ) : charge === 0 ? (
            <span>لا شحنة — ذرّة متعادلة</span>
          ) : (
            <IonNotation formula={element.symbol} charge={`${Math.abs(charge)}${charge > 0 ? '+' : '-'}`} />
          )}
        </div>
      </div>

      <div className="prediction-panel">
        <p className="prediction-panel__title">
          توقّع قبل القراءة: ما نوع الجسيم الحالي؟ (تُكشف الشحنة والنوع بعد تثبيت توقّعك)
        </p>
        <div className="prediction-panel__options" role="group" aria-label="توقّع نوع الجسيم">
          {(Object.keys(PREDICTION_LABEL) as Prediction[]).map((option) => (
            <button
              key={option}
              type="button"
              className="button button--secondary button--small"
              aria-pressed={prediction === option}
              onClick={() => {
                setPrediction(option)
                setPredictionResult('none')
              }}
            >
              {PREDICTION_LABEL[option]}
            </button>
          ))}
        </div>
        <div className="lab__actions">
          <button
            type="button"
            className="button button--primary button--small"
            disabled={prediction === null}
            onClick={() => setPredictionResult(prediction === kind ? 'correct' : 'wrong')}
          >
            تحقّق من توقّعي
          </button>
        </div>
        {predictionResult === 'correct' ? (
          <p className="prediction-panel__result" data-state="correct" role="status">
            توقّعك صحيح. الشحنة = {particle.protons} − {particle.electrons} ={' '}
            <ChargeValue value={chargeText} />، لذلك الجسيم {kindLabel}.
          </p>
        ) : predictionResult === 'wrong' ? (
          <p className="prediction-panel__result" data-state="wrong" role="status">
            راجع الحساب: الشحنة = البروتونات − الإلكترونات = {particle.protons} − {particle.electrons} ={' '}
            <ChargeValue value={chargeText} />. النوع الصحيح: {kindLabel}.
          </p>
        ) : null}
      </div>

      <div className="challenge-panel">
        <div className="challenge-panel__head">
          <p className="prediction-panel__title">تحدٍّ: اضبط الجسيم ليصبح «{target.label}»</p>
          <button
            type="button"
            className="button button--quiet button--small"
            onClick={() => {
              setTargetIndex((index) => (index + 1) % TARGETS.length)
              setChallengeResult('idle')
            }}
          >
            هدف آخر
          </button>
        </div>
        <div className="lab__actions">
          <button type="button" className="button button--secondary button--small" onClick={checkChallenge}>
            تحقّق من التحدّي
          </button>
          <button
            type="button"
            className="button button--quiet button--small"
            onClick={() => {
              setParticle({ protons: 8, neutrons: 8, electrons: 8 })
              setPrediction(null)
              setPredictionResult('none')
              setChallengeResult('idle')
            }}
          >
            إعادة الضبط
          </button>
        </div>
        {challengeResult !== 'idle' ? (
          <p className="prediction-panel__result" data-state={challengeResult} role="status">
            {challengeResult === 'correct'
              ? 'صحيح: البروتونات والنيوترونات والإلكترونات كلها مطابقة للهدف.'
              : `ليس بعد. المطلوب: ${target.particle.protons} بروتوناً، ${target.particle.neutrons} نيوتروناً، ${target.particle.electrons} إلكتروناً. ما لديك الآن: ${particle.protons} و${particle.neutrons} و${particle.electrons}.`}
          </p>
        ) : null}
      </div>

      <p className="lab__conclusion">
        <strong>الخلاصة:</strong> البروتونات تحدد العنصر، ومجموع البروتونات والنيوترونات يحدد العدد الكتلي، والفرق بين
        البروتونات والإلكترونات يحدد الشحنة. تغيير الإلكترونات ينتج أيوناً، وتغيير النيوترونات ينتج نظيراً، أما تغيير
        البروتونات فيغير العنصر نفسه.
      </p>

      {/* The scope of the model is content, not motion: every student sees it. */}
      <RtlRun as="p" className="lab__note">
        هذا نموذج حسابي للأعداد المطبوعة في الدرس (حتى العدد الذري 20)، وليس صورة فيزيائية كاملة للذرة.
      </RtlRun>
    </section>
  )
}

function ParticleStepper({
  id,
  label,
  hint,
  value,
  min,
  max,
  onChange,
}: {
  id: string
  label: string
  hint: string
  value: number
  min: number
  max: number
  onChange: (value: number) => void
}) {
  const labelId = `particle-${id}-label`
  return (
    <div className="particle-stepper">
      <p className="particle-stepper__label" id={labelId}>
        {label}
      </p>
      <div className="particle-stepper__controls">
        <button
          type="button"
          className="button button--quiet button--small"
          onClick={() => onChange(value - 1)}
          disabled={value <= min}
          aria-label={`إنقاص ${label}`}
        >
          −
        </button>
        <output className="particle-stepper__value" aria-live="polite" aria-labelledby={labelId}>
          {value}
        </output>
        <button
          type="button"
          className="button button--quiet button--small"
          onClick={() => onChange(value + 1)}
          disabled={value >= max}
          aria-label={`زيادة ${label}`}
        >
          +
        </button>
      </div>
      <p className="particle-stepper__hint">{hint}</p>
    </div>
  )
}
