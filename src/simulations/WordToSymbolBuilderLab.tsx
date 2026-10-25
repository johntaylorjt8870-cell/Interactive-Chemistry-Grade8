import { useId, useState } from 'react'
import { RtlRun } from '@/components/BidiText'
import { MathFormula, ScientificNotationText, WordEquation } from '@/scientific'
import type { InteractiveProps } from './registry'
import { WORD_TO_SYMBOL_SCENARIOS } from './lesson6Models'

export default function WordToSymbolBuilderLab({ interactiveId, reducedMotion }: InteractiveProps) {
  const uid = useId()
  const [scenarioIdx, setScenarioIdx] = useState(0)
  const [formulaPick, setFormulaPick] = useState<string | null>(null)
  const [statePick, setStatePick] = useState<string | null>(null)
  const [balancePick, setBalancePick] = useState<string | null>(null)

  const scenario = WORD_TO_SYMBOL_SCENARIOS[scenarioIdx]!
  const chosenFormula = scenario.formulaChoices.find((c) => c.id === formulaPick)
  const chosenState = scenario.stateChoices.find((c) => c.id === statePick)
  const chosenBalance = scenario.balancedChoices.find((c) => c.id === balancePick)

  const stage1Passed = Boolean(chosenFormula?.isCorrect)
  const stage2Passed = stage1Passed && Boolean(chosenState?.isCorrect)
  const stage3Passed = stage2Passed && Boolean(chosenBalance?.isCorrect)
  const completedStages = Number(stage1Passed) + Number(stage2Passed) + Number(stage3Passed)

  const resetCurrent = () => {
    setFormulaPick(null)
    setStatePick(null)
    setBalancePick(null)
  }

  const switchScenario = (idx: number) => {
    setScenarioIdx(idx)
    setFormulaPick(null)
    setStatePick(null)
    setBalancePick(null)
  }

  return (
    <section
      className={`lab l6-lab l6-builder ${reducedMotion ? 'l6-lab--still' : ''}`}
      data-interactive-id={interactiveId}
      data-scenario={scenario.id}
      data-completed={completedStages}
      aria-labelledby={`${uid}-title`}
    >
      <header className="lab__header l6-lab__header">
        <div>
          <p className="lab__phase">إضافة من المنصة · نشاط موجّه من ثلاث خطوات</p>
          <h3 id={`${uid}-title`}>باني المعادلة الرمزية الموزونة من الوصف اللفظي</h3>
        </div>
        <div className="l6-builder__header-meta">
          <RtlRun className="l6-lab__counter">{`أنجزت ${completedStages} من 3 مراحل`}</RtlRun>
          <button
            type="button"
            className="button button--quiet"
            disabled={!formulaPick && !statePick && !balancePick}
            onClick={resetCurrent}
          >
            إعادة المحاولة
          </button>
        </div>
      </header>

      <div className="l6-balancer__selector" role="group" aria-label="اختر التفاعل اللفظي">
        {WORD_TO_SYMBOL_SCENARIOS.map((item, idx) => (
          <button
            key={item.id}
            type="button"
            className={`button ${idx === scenarioIdx ? 'button--primary' : 'button--quiet'}`}
            aria-pressed={idx === scenarioIdx}
            onClick={() => switchScenario(idx)}
          >
            {item.title}
          </button>
        ))}
      </div>

      <div className="l6-builder__prompt">
        <p className="l6-builder__desc">
          <ScientificNotationText>{scenario.description}</ScientificNotationText>
        </p>
        <WordEquation
          reactants={[...scenario.wordReactants]}
          products={[...scenario.wordProducts]}
          condition={scenario.condition}
        />
      </div>

      {/* Stage 1: Formulas */}
      <div className="l6-builder__stage" data-stage-step="1">
        <h4 className="l6-builder__stage-title">المرحلة 1: اختر الرموز والصيغ الكيميائيّة الصحيحة قبل أي موازنة</h4>
        <div className="l6-builder__options">
          {scenario.formulaChoices.map((choice) => {
            const active = formulaPick === choice.id
            return (
              <button
                key={choice.id}
                type="button"
                className={`button l6-builder__option ${active ? 'button--primary' : 'button--quiet'}`}
                aria-pressed={active}
                onClick={() => {
                  setFormulaPick(choice.id)
                  if (!choice.isCorrect) {
                    setStatePick(null)
                    setBalancePick(null)
                  }
                }}
              >
                <ScientificNotationText>{choice.label}</ScientificNotationText>
              </button>
            )
          })}
        </div>
        {chosenFormula && (
          <p
            className={`l6-builder__feedback ${chosenFormula.isCorrect ? 'l6-builder__feedback--ok' : 'l6-builder__feedback--err'}`}
            role="status"
          >
            <ScientificNotationText>{chosenFormula.feedback}</ScientificNotationText>
          </p>
        )}
      </div>

      {/* Stage 2: Physical states */}
      {stage1Passed && (
        <div className="l6-builder__stage" data-stage-step="2">
          <h4 className="l6-builder__stage-title">المرحلة 2: أقرن كل مادة برمز حالتها الفيزيائيّة المناسب</h4>
          <div className="l6-builder__options">
            {scenario.stateChoices.map((choice) => {
              const active = statePick === choice.id
              return (
                <button
                  key={choice.id}
                  type="button"
                  className={`button l6-builder__option ${active ? 'button--primary' : 'button--quiet'}`}
                  aria-pressed={active}
                  onClick={() => {
                    setStatePick(choice.id)
                    if (!choice.isCorrect) setBalancePick(null)
                  }}
                >
                  <ScientificNotationText>{choice.label}</ScientificNotationText>
                </button>
              )
            })}
          </div>
          {chosenState && (
            <p
              className={`l6-builder__feedback ${chosenState.isCorrect ? 'l6-builder__feedback--ok' : 'l6-builder__feedback--err'}`}
              role="status"
            >
              <ScientificNotationText>{chosenState.feedback}</ScientificNotationText>
            </p>
          )}
        </div>
      )}

      {/* Stage 3: Balancing */}
      {stage2Passed && (
        <div className="l6-builder__stage" data-stage-step="3">
          <h4 className="l6-builder__stage-title">المرحلة 3: اختر المعادلة الموزونة النهائية بعد تساوي ذرات كل عنصر</h4>
          <div className="l6-builder__options l6-builder__options--stacked">
            {scenario.balancedChoices.map((choice) => {
              const active = balancePick === choice.id
              return (
                <button
                  key={choice.id}
                  type="button"
                  className={`button l6-builder__option l6-builder__option--eq ${active ? 'button--primary' : 'button--quiet'}`}
                  aria-pressed={active}
                  aria-label={choice.plainLabel}
                  onClick={() => setBalancePick(choice.id)}
                >
                  <MathFormula tex={choice.tex} display="inline" />
                </button>
              )
            })}
          </div>
          {chosenBalance && (
            <p
              className={`l6-builder__feedback ${chosenBalance.isCorrect ? 'l6-builder__feedback--ok' : 'l6-builder__feedback--err'}`}
              role="status"
            >
              <ScientificNotationText>{chosenBalance.feedback}</ScientificNotationText>
            </p>
          )}
        </div>
      )}

      {stage3Passed && (
        <div className="l6-balancer__verdict l6-balancer__verdict--success" role="status">
          <p>
            <strong>اكتمل بناء المعادلة الكيميائيّة بنجاح ✔ </strong>
            انتقلتَ بترتيب علمي سليم: صيغ صحيحة بالتكافؤ ← رموز حالة فيزيائية دقيقة ← معاملات موازِنة بأبسط نسبة.
          </p>
        </div>
      )}
    </section>
  )
}
