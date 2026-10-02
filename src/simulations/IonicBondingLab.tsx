import { useState } from 'react'
import { BohrAtom, IonNotation, NaClCluster } from '@/scientific'
import type { InteractiveProps } from './registry'

type Stage = 0 | 1 | 2 | 3

const STAGE_LABELS = [
  'ذرّتان متعادلتان: Na توزّعها 2-8-1 وCl توزّعها 2-8-7.',
  'الإلكترون السطحي ينتقل من Na إلى Cl.',
  'تكوّن الأيونان: Na⁺ توزّعها 2-8 وCl⁻ توزّعها 2-8-8، ولكل منهما قاعدة الثمانية.',
  'تجاذب كهربائي ساكن بين الأيونين الموجب والسالب، وتتراكب الأيونات في بلورة NaCl المتعادلة كهربائياً.',
]

const STAGE_ACTIONS: Record<Stage, string> = {
  0: 'انقل الإلكترون السطحي من Na إلى Cl',
  1: 'أكمل الانتقال: تكوّن الأيونان',
  2: 'قرّب الأيونين: التجاذب الكهربائي الساكن',
  3: 'إعادة المحاكاة من الذرّتين المتعادلتين',
}

/**
 * Platform addition — interactive electron-transfer mechanism for the
 * textbook figure of page 14.
 *
 * Action → observation → conclusion: the student moves the real valence
 * electron of sodium into the chlorine shell, watches the electron counts and
 * the algebraic charge change per atom, then brings the ions together and sees
 * the neutral NaCl crystal. Every control changes scientific state; with
 * `prefers-reduced-motion` the flight and approach become instant jumps.
 */
export default function IonicBondingLab({ reducedMotion }: InteractiveProps) {
  const [stage, setStage] = useState<Stage>(0)

  const naShells = stage >= 2 ? [2, 8] : [2, 8, 1]
  const clShells = stage >= 2 ? [2, 8, 8] : [2, 8, 7]
  const naElectrons = naShells.reduce((total, shell) => total + shell, 0)
  const clElectrons = clShells.reduce((total, shell) => total + shell, 0)
  const naCharge = 11 - naElectrons
  const clCharge = 17 - clElectrons

  const advance = () => setStage((current) => (current === 3 ? 0 : ((current + 1) as Stage)))

  return (
    <section
      className={`lab ionic-bond-lab ${reducedMotion ? 'lab--still' : ''}`}
      data-stage={stage}
      aria-labelledby="ionic-bond-lab-title"
    >
      <header className="lab__header">
        <div>
          <p className="lab__phase">إضافة من المنصة · محاكاة انتقال الإلكترون</p>
          <h3 id="ionic-bond-lab-title">من ذرّتي Na وCl إلى بلورة NaCl</h3>
        </div>
        <ol className="ionic-bond-lab__stages" aria-label="مراحل المحاكاة">
          {STAGE_LABELS.map((label, index) => (
            <li key={index} data-active={index === stage ? 'true' : undefined} data-done={index < stage ? 'true' : undefined}>
              <span className="ionic-bond-lab__stage-index" aria-hidden="true">
                {index + 1}
              </span>
              {label}
            </li>
          ))}
        </ol>
      </header>

      <div className={`ionic-bond-lab__scene ${stage >= 3 ? 'ionic-bond-lab__scene--attract' : ''}`} dir="ltr">
        <span className={`ionic-bond-lab__atom ${stage >= 2 ? 'is-ion' : ''}`} data-side="donor">
          <BohrAtom symbol="Na" shells={naShells} charge={stage >= 2 ? '+' : undefined} highlightValence={stage === 0} size={148} />
          <span className="ionic-bond-lab__readout" dir="rtl">
            <span>
              البروتونات <b dir="ltr">11</b>
            </span>
            <span>
              الإلكترونات <b dir="ltr">{naElectrons}</b>
            </span>
            <span>
              الشحنة <b dir="ltr">{formatCharge(naCharge)}</b>
            </span>
          </span>
        </span>

        <span className="ionic-bond-lab__flight" aria-hidden="true">
          <span className={`ionic-bond-lab__particle ${stage >= 1 ? 'is-moving' : ''} ${stage >= 2 ? 'is-arrived' : ''}`}>
            e<sup>−</sup>
          </span>
          <span className="ionic-bond-lab__flight-line" />
        </span>

        <span className={`ionic-bond-lab__atom ${stage >= 2 ? 'is-ion' : ''}`} data-side="acceptor">
          <BohrAtom symbol="Cl" shells={clShells} charge={stage >= 2 ? '-' : undefined} highlightValence={stage === 0} size={148} />
          <span className="ionic-bond-lab__readout" dir="rtl">
            <span>
              البروتونات <b dir="ltr">17</b>
            </span>
            <span>
              الإلكترونات <b dir="ltr">{clElectrons}</b>
            </span>
            <span>
              الشحنة <b dir="ltr">{formatCharge(clCharge)}</b>
            </span>
          </span>
        </span>

        {stage >= 2 ? (
          <span className="ionic-bond-lab__attraction" aria-hidden="true" data-stage={stage}>
            <span className="ionic-bond-lab__attraction-line" />
            <span className="ionic-bond-lab__attraction-label" dir="rtl">
              تجاذب كهربائي ساكن
            </span>
          </span>
        ) : null}
      </div>

      {stage === 3 ? (
        <div className="ionic-bond-lab__crystal">
          <NaClCluster size={132} />
          <div className="ionic-bond-lab__crystal-text" dir="rtl">
            <IonNotation formula="Na" charge="+" size="md" />
            <span>مع</span>
            <IonNotation formula="Cl" charge="-" size="md" />
            <span>→ بلورة</span>
            <strong dir="ltr">NaCl</strong>
            <span>متعادلة كهربائياً (ملح الطعام).</span>
          </div>
        </div>
      ) : null}

      <div className="lab__actions">
        <button type="button" className="button button--primary" onClick={advance}>
          {STAGE_ACTIONS[stage]}
        </button>
        <button type="button" className="button button--quiet" onClick={() => setStage(0)} disabled={stage === 0}>
          إعادة التعيين
        </button>
      </div>

      <p className="lab__conclusion" aria-live="polite">
        <strong>الملاحظة:</strong> {STAGE_LABELS[stage]}{' '}
        {stage === 0
          ? 'كم إلكتروناً تحتاج كل ذرّة لتحقّق قاعدة الثمانية؟ اضغط النقل وراقب العدّادات.'
          : stage === 1
            ? 'الإلكترون المنتقل هو إلكترون Na السطحي نفسه؛ عدد البروتونات لم يتغيّر في الذرّتين.'
            : stage === 2
              ? 'فقد Na شحنة سالبة واحدة فصار +1، واكتسب Cl شحنة سالبة واحدة فصار −1، وتحقّقت الثمانية لكليهما.'
              : 'المجموع الجبري لشحنات البلورة صفر؛ لذلك يكون NaCl متعادلاً كهربائياً.'}
      </p>
    </section>
  )
}

function formatCharge(charge: number): string {
  if (charge === 0) return '0'
  return charge > 0 ? `+${charge}` : `\u2212${Math.abs(charge)}`
}
