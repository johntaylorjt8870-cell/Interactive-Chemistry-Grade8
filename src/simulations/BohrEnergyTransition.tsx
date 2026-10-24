import { useState } from 'react'
import { ChargeNotation, MathFormula, ScientificNotationText } from '@/scientific'
import type { InteractiveProps } from './registry'

/* ============================================================================
   Bohr transitions (page 5)
   ----------------------------------------------------------------------------
   The textbook states the rule (a jump up absorbs energy, a jump down emits
   light) but prints no numerical level energies. To keep the interaction
   quantitative *and* honest, two separate rows are shown:

     * capacity  y = 2(n)²  — computed from the printed law, always available;
     * ΔE and photon wavelength — computed from the hydrogen Bohr model
       Eₙ = −13.6/n² eV and λ(nm) = 1240/ΔE(eV). This is enrichment outside the
       textbook, and is labelled as such so it is never mistaken for book data.
   ========================================================================= */

const LEVELS = [
  { n: 1, symbol: 'K' },
  { n: 2, symbol: 'L' },
  { n: 3, symbol: 'M' },
  { n: 4, symbol: 'N' },
] as const

/** Printed law: y = 2(n)². */
const capacity = (n: number) => 2 * n * n
/** Hydrogen Bohr-model energy in eV — platform enrichment, not book data. */
const energyEv = (n: number) => -13.6 / (n * n)
/** Photon wavelength in nanometres from an energy gap in eV. */
const wavelengthNm = (deltaEv: number) => 1240 / deltaEv

type Transition = 'idle' | 'absorbed' | 'emitted'

export default function BohrEnergyTransition({ reducedMotion }: InteractiveProps) {
  const [levelIndex, setLevelIndex] = useState(0)
  // The level the electron came *from* is part of the displayed result, so it is
  // state updated together with the destination. (A ref written in an effect
  // would already hold the new index by the time the gap is rendered, which made
  // every gap read 0.00 eV.)
  const [previousIndex, setPreviousIndex] = useState(0)
  const [transition, setTransition] = useState<Transition>('idle')
  const level = LEVELS[levelIndex]!

  function goTo(next: number) {
    if (next === levelIndex) return
    setPreviousIndex(levelIndex)
    setLevelIndex(next)
    setTransition(next > levelIndex ? 'absorbed' : 'emitted')
  }

  const moveOut = () => goTo(Math.min(LEVELS.length - 1, levelIndex + 1))
  const moveIn = () => goTo(Math.max(0, levelIndex - 1))

  const previousLevel = LEVELS[previousIndex]!.n
  const currentLevel = level.n
  const gap = Math.abs(energyEv(currentLevel) - energyEv(previousLevel))
  const transferred = transition === 'idle' ? 0 : gap
  const photon = transition === 'emitted' ? wavelengthNm(transferred) : null

  return (
    <section className="lab bohr-lab" aria-labelledby="bohr-lab-title">
      <header className="lab__header">
        <div>
          <p className="lab__phase">إضافة من المنصة · شرح بصري تفاعلي</p>
          <h3 id="bohr-lab-title">انتقال إلكترون بين سويات الطاقة</h3>
        </div>
        <div className="bohr-lab__current" aria-live="polite">
          <span>السوية الحالية</span>
          <strong dir="ltr">
            {level.symbol} · n = {level.n}
          </strong>
        </div>
      </header>

      <div
        className="bohr-stage"
        data-transition={transition}
        aria-label={`الإلكترون في السوية ${level.symbol} ورقمها ${level.n}`}
      >
        <div className="bohr-stage__energy" aria-hidden="true">
          <span>طاقة أعلى</span>
          <span className="bohr-stage__energy-arrow">↑</span>
          <span>طاقة أدنى</span>
        </div>
        <div className="bohr-stage__atom" aria-hidden="true">
          {LEVELS.map((item, index) => (
            <span
              className="bohr-orbit"
              data-active={index === levelIndex ? 'true' : undefined}
              key={item.symbol}
              style={{ '--orbit': index + 1 } as React.CSSProperties}
            >
              <span className="bohr-orbit__label">{item.symbol}</span>
            </span>
          ))}
          <span className="bohr-nucleus">
            نواة
            <br />
            موجبة
          </span>
          <span
            className={`bohr-electron ${reducedMotion ? 'bohr-electron--still' : ''}`}
            style={{ '--level': levelIndex + 1 } as React.CSSProperties}
          >
            {/* One inline notation child — never a bare `e` next to a raw sup
                element: the badge is a grid container, so two children become
                two grid items and the charge drops onto a second line. */}
            <ChargeNotation source="e⁻" className="particle-notation" />
          </span>
          {transition === 'emitted' ? (
            <span className={`bohr-photon ${reducedMotion ? 'bohr-photon--still' : ''}`}>ضوء</span>
          ) : null}
        </div>
        <div className="bohr-stage__transition" aria-live="polite">
          {transition === 'absorbed' ? (
            <>
              <strong>امتصاص طاقة</strong>
              <span>انتقل الإلكترون إلى سوية أعلى.</span>
            </>
          ) : null}
          {transition === 'emitted' ? (
            <>
              <strong>إصدار طاقة على شكل ضوء</strong>
              <span>انتقل الإلكترون إلى سوية أدنى.</span>
            </>
          ) : null}
          {transition === 'idle' ? (
            <>
              <strong>ابدأ من السوية K</strong>
              <span>استخدم الزرين ولاحظ اتجاه الانتقال والطاقة.</span>
            </>
          ) : null}
        </div>
      </div>

      <div className="lab__actions">
        <button
          type="button"
          className="button button--primary"
          onClick={moveOut}
          disabled={levelIndex === LEVELS.length - 1}
        >
          امتصاص طاقة — انتقال إلى الخارج
        </button>
        <button
          type="button"
          className="button button--secondary"
          onClick={moveIn}
          disabled={levelIndex === 0}
        >
          إصدار طاقة — انتقال إلى الداخل
        </button>
        <button
          type="button"
          className="button button--quiet"
          onClick={() => {
            setLevelIndex(0)
            setPreviousIndex(0)
            setTransition('idle')
          }}
        >
          إعادة
        </button>
      </div>

      <div className="lab__measurements">
        <div>
          <span>الفعل</span>
          <strong className="lab__measurement-text">
            {transition === 'absorbed'
              ? 'زوّدنا الذرة بالطاقة'
              : transition === 'emitted'
                ? 'عاد الإلكترون إلى الداخل'
                : 'لم يبدأ انتقال بعد'}
          </strong>
        </div>
        <div>
          <span>الملاحظة</span>
          <strong className="lab__measurement-text">
            {transition === 'emitted'
              ? 'ظهرت إشارة الضوء'
              : transition === 'absorbed'
                ? 'ارتفعت سوية الإلكترون'
                : `الإلكترون في ${level.symbol}`}
          </strong>
        </div>
        <div>
          <span>نوع التغير</span>
          <strong className="lab__measurement-text">
            {transition === 'idle' ? 'وجود في سوية' : 'انتقال بين سويتين'}
          </strong>
        </div>
        <div>
          <span>سعة السوية y = 2(n)²</span>
          <strong>
            <MathFormula tex={`2(${level.n})^2 = ${capacity(level.n)}`} />
          </strong>
        </div>
      </div>

      {transition !== 'idle' ? (
        <div className="capacity-note">
          <p>
            <strong>قيمة الفرق الطاقي في هذا النموذج:</strong> الانتقال بين{' '}
            <span dir="ltr">
              n = {Math.min(previousLevel, currentLevel)} و n = {Math.max(previousLevel, currentLevel)}
            </span>{' '}
            يقابل طاقة مقدارها <strong dir="ltr">{transferred.toFixed(2)} eV</strong>
            {photon !== null ? (
              <>
                {' '}
                ويُصدر ضوءاً طوله الموجي نحو{' '}
                <strong dir="ltr">{photon.toFixed(0)} nm</strong>.
              </>
            ) : (
              ' تمتصها الذرة من الخارج.'
            )}
          </p>
        </div>
      ) : null}

      <p className="lab__conclusion">
        <strong>الخلاصة:</strong> بقاء الإلكترون في سوية يصف حالته الحالية. أمّا انتقاله فهو تغيّر من سوية محددة
        إلى أخرى، ويرافقه امتصاص الطاقة عند الصعود أو إصدارها على شكل ضوء عند الهبوط. ويبقى الفرق الطاقي محدداً لأن
        السويات نفسها محددة.
      </p>
      <p className="lab__note">
        <strong>حدود النموذج:</strong>{' '}
        <ScientificNotationText>
          قيم الطاقة (−13.6/n² eV) والطول الموجي محسوبة من نموذج بور لذرّة الهيدروجين، وهي إثراء من المنصة وليست مطبوعة في الكتاب. الكتاب يذكر القاعدة النوعية فقط: الطاقة المتبادلة تساوي الفرق بين السويتين. أما سعة السوية فمحسوبة من قانون الكتاب y = 2(n)².
        </ScientificNotationText>
      </p>
    </section>
  )
}
