import { useId, useState } from 'react'
import { RtlRun } from '@/components/BidiText'
import { ChemicalFormula, MathFormula, Sci, ScientificNotationText } from '@/scientific'
import type { InteractiveProps } from './registry'
import {
  BALANCER_REACTIONS,
  evaluateBalanceState,
  formatReactionTeX,
} from './lesson6Models'

const MIN_COEFF = 1
const MAX_COEFF = 8

export default function EquationBalancerLab({ interactiveId, reducedMotion }: InteractiveProps) {
  const uid = useId()
  const [reactionIndex, setReactionIndex] = useState(0)
  const reaction = BALANCER_REACTIONS[reactionIndex]!

  const [reactantCoeffs, setReactantCoeffs] = useState<number[]>(() =>
    reaction.reactants.map(() => 1),
  )
  const [productCoeffs, setProductCoeffs] = useState<number[]>(() =>
    reaction.products.map(() => 1),
  )

  const selectReaction = (nextIndex: number) => {
    const next = BALANCER_REACTIONS[nextIndex]!
    setReactionIndex(nextIndex)
    setReactantCoeffs(next.reactants.map(() => 1))
    setProductCoeffs(next.products.map(() => 1))
  }

  const resetCoefficients = () => {
    setReactantCoeffs(reaction.reactants.map(() => 1))
    setProductCoeffs(reaction.products.map(() => 1))
  }

  const updateReactant = (idx: number, delta: number) => {
    setReactantCoeffs((prev) =>
      prev.map((val, i) => (i === idx ? Math.min(MAX_COEFF, Math.max(MIN_COEFF, val + delta)) : val)),
    )
  }

  const updateProduct = (idx: number, delta: number) => {
    setProductCoeffs((prev) =>
      prev.map((val, i) => (i === idx ? Math.min(MAX_COEFF, Math.max(MIN_COEFF, val + delta)) : val)),
    )
  }

  const evaluation = evaluateBalanceState(reaction, reactantCoeffs, productCoeffs)
  const texEquation = formatReactionTeX(reaction, reactantCoeffs, productCoeffs)
  const isInitial =
    reactantCoeffs.every((v) => v === 1) && productCoeffs.every((v) => v === 1)

  const simplifyByGcd = () => {
    if (evaluation.coefficientsGcd <= 1) return
    const g = evaluation.coefficientsGcd
    setReactantCoeffs((prev) => prev.map((v) => v / g))
    setProductCoeffs((prev) => prev.map((v) => v / g))
  }

  return (
    <section
      className={`lab l6-lab l6-balancer ${reducedMotion ? 'l6-lab--still' : ''}`}
      data-interactive-id={interactiveId}
      data-reaction={reaction.id}
      data-balanced={String(evaluation.isBalancedInSimplestForm)}
      aria-labelledby={`${uid}-title`}
    >
      <header className="lab__header l6-lab__header">
        <div>
          <p className="lab__phase">إضافة من المنصة · مختبر موازنة المعادلات وعدّ الذرات</p>
          <h3 id={`${uid}-title`}>مختبر موازنة المعادلات الكيميائيّة التفاعلي</h3>
        </div>
        <button
          type="button"
          className="button button--quiet"
          onClick={resetCoefficients}
          disabled={isInitial}
        >
          إعادة ضبط المعاملات
        </button>
      </header>

      <div className="l6-balancer__selector" role="group" aria-label="اختر المعادلة المراد موازنتها">
        {BALANCER_REACTIONS.map((item, idx) => (
          <button
            key={item.id}
            type="button"
            className={`button l6-balancer__choice ${idx === reactionIndex ? 'button--primary' : 'button--quiet'}`}
            aria-pressed={idx === reactionIndex}
            onClick={() => selectReaction(idx)}
          >
            <span>{item.title}</span>
            <span className="l6-balancer__level">{item.level}</span>
          </button>
        ))}
      </div>

      <div className="l6-balancer__equation-box">
        <MathFormula
          tex={texEquation}
          display="block"
          label={`المعادلة الحالية: ${reaction.title}`}
        />
      </div>

      {reaction.scientificNote && (
        <p className="l6-lab__safety-note" data-safety-note={reaction.id}>
          <ScientificNotationText>{reaction.scientificNote}</ScientificNotationText>
        </p>
      )}

      <div className="l6-balancer__sides">
        <fieldset className="l6-balancer__fieldset">
          <legend>معاملات المواد المتفاعلة (الطرف الأول — يسار السهم)</legend>
          <div className="l6-balancer__species-list">
            {reaction.reactants.map((species, idx) => {
              const coeff = reactantCoeffs[idx] ?? 1
              return (
                <div key={`r-${species.formula}`} className="l6-balancer__control-card">
                  <div className="l6-balancer__species-meta">
                    <span className="l6-balancer__formula-line" dir="ltr">
                      <ChemicalFormula formula={species.formula} size="md" />
                      <span className="l6-balancer__state">({species.state})</span>
                    </span>
                    <span className="l6-balancer__arabic-name">{species.arabicName}</span>
                  </div>
                  <div className="l6-balancer__stepper">
                    <button
                      type="button"
                      className="button button--quiet l6-stepper-btn"
                      disabled={coeff <= MIN_COEFF}
                      aria-label={`إنقاص معامل ${species.arabicName}`}
                      onClick={() => updateReactant(idx, -1)}
                    >
                      −
                    </button>
                    <Sci className="l6-balancer__coeff-value">{String(coeff)}</Sci>
                    <button
                      type="button"
                      className="button button--quiet l6-stepper-btn"
                      disabled={coeff >= MAX_COEFF}
                      aria-label={`زيادة معامل ${species.arabicName}`}
                      onClick={() => updateReactant(idx, 1)}
                    >
                      +
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </fieldset>

        <fieldset className="l6-balancer__fieldset">
          <legend>معاملات المواد النّاتجة (الطرف الثاني — يمين السهم)</legend>
          <div className="l6-balancer__species-list">
            {reaction.products.map((species, idx) => {
              const coeff = productCoeffs[idx] ?? 1
              return (
                <div key={`p-${species.formula}`} className="l6-balancer__control-card">
                  <div className="l6-balancer__species-meta">
                    <span className="l6-balancer__formula-line" dir="ltr">
                      <ChemicalFormula formula={species.formula} size="md" />
                      <span className="l6-balancer__state">({species.state})</span>
                    </span>
                    <span className="l6-balancer__arabic-name">{species.arabicName}</span>
                  </div>
                  <div className="l6-balancer__stepper">
                    <button
                      type="button"
                      className="button button--quiet l6-stepper-btn"
                      disabled={coeff <= MIN_COEFF}
                      aria-label={`إنقاص معامل ${species.arabicName}`}
                      onClick={() => updateProduct(idx, -1)}
                    >
                      −
                    </button>
                    <Sci className="l6-balancer__coeff-value">{String(coeff)}</Sci>
                    <button
                      type="button"
                      className="button button--quiet l6-stepper-btn"
                      disabled={coeff >= MAX_COEFF}
                      aria-label={`زيادة معامل ${species.arabicName}`}
                      onClick={() => updateProduct(idx, 1)}
                    >
                      +
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </fieldset>
      </div>

      <div className="l6-balancer__inventory">
        <h4 className="l6-balancer__inventory-title">ميزان عدّ الذرّات الفوري في طرفي المعادلة</h4>
        <div className="l6-balancer__rows">
          {evaluation.rows.map((row) => {
            const maxBar = Math.max(row.reactants, row.products, 6)
            const leftPct = Math.min(100, Math.round((row.reactants / maxBar) * 100))
            const rightPct = Math.min(100, Math.round((row.products / maxBar) * 100))
            return (
              <div
                key={row.element}
                className={`l6-balancer__row ${row.balanced ? 'l6-balancer__row--ok' : 'l6-balancer__row--diff'}`}
                data-element-row={row.element}
              >
                <div className="l6-balancer__row-head">
                  <Sci className="l6-balancer__el-symbol">{row.element}</Sci>
                  <span className="l6-balancer__el-status">
                    {row.balanced ? 'متساوٍ ✔' : 'غير متساوٍ'}
                  </span>
                </div>
                <div className="l6-balancer__bars">
                  <div className="l6-balancer__bar-group">
                    <span className="l6-balancer__bar-label">المتفاعلات:</span>
                    <div className="l6-balancer__bar-track" aria-hidden="true">
                      <div className="l6-balancer__bar-fill l6-balancer__bar-fill--left" style={{ inlineSize: `${leftPct}%` }} />
                    </div>
                    <Sci className="l6-balancer__count">{String(row.reactants)}</Sci>
                  </div>
                  <div className="l6-balancer__bar-group">
                    <span className="l6-balancer__bar-label">النواتج:</span>
                    <div className="l6-balancer__bar-track" aria-hidden="true">
                      <div className="l6-balancer__bar-fill l6-balancer__bar-fill--right" style={{ inlineSize: `${rightPct}%` }} />
                    </div>
                    <Sci className="l6-balancer__count">{String(row.products)}</Sci>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div
        className={`l6-balancer__verdict ${
          evaluation.isBalancedInSimplestForm
            ? 'l6-balancer__verdict--success'
            : evaluation.allAtomsEqual
              ? 'l6-balancer__verdict--warn'
              : 'l6-balancer__verdict--pending'
        }`}
        role="status"
        aria-live="polite"
      >
        {evaluation.isBalancedInSimplestForm ? (
          <p>
            <strong>أحسنت! المعادلة موزونة في أبسط نسبة عددية صحيحة ✔ </strong>
            جميع عناصر التفاعل متساوية الذرات بين المتفاعلات والنواتج، وصيغ المركّبات بقيت ثابتة دون أي تغيير في أرقامها السفلية.
          </p>
        ) : evaluation.allAtomsEqual ? (
          <div className="l6-balancer__simplify-box">
            <p>
              <RtlRun>{`انتبه: أعداد الذرات متساوية، لكن جميع المعاملات تقبل القسمة على ${evaluation.coefficientsGcd}!`}</RtlRun>{' '}
              في الصورة النهائية القياسية نكتب المعاملات بأبسط نسبة عددية صحيحة.
            </p>
            <button type="button" className="button button--primary" onClick={simplifyByGcd}>
              <RtlRun>{`تبسيط المعاملات بالقسمة على ${evaluation.coefficientsGcd}`}</RtlRun>
            </button>
          </div>
        ) : (
          <p>
            <strong>إرشاد الموازنة: </strong>
            <ScientificNotationText>{reaction.strategyTip}</ScientificNotationText>
          </p>
        )}
      </div>
    </section>
  )
}
