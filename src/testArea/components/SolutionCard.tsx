import {
  DIFFICULTY_LABELS,
  QUESTION_TYPE_LABELS,
  type QuestionSolution,
  type TestQuestion,
} from '@/data/testArea/types'
import { formatPageRefs } from '@/data/testArea/curriculumScope'
import { MathFormula, ScientificNotationText } from '@/scientific'

/* ============================================================================
   SolutionCard — a pedagogical solution, not an answer key
   ----------------------------------------------------------------------------
   Every card answers the questions a student actually asks after a test: why
   is this right, what rule carries it, how do I reach the number, what does
   the number mean, how would I check it, and which trap did the wrong options
   set for me?
   ========================================================================= */

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="ta-solution__section">
      <h4 className="ta-solution__section-title">{title}</h4>
      {children}
    </section>
  )
}

export type SolutionCardProps = {
  solution: QuestionSolution
  question: TestQuestion
  number: number
}

export function SolutionCard({ solution, question, number }: SolutionCardProps) {
  const optionLabel = (optionId: string) =>
    'options' in question
      ? question.options.find((option) => option.id === optionId)?.label ?? optionId
      : optionId

  return (
    <article className="ta-card ta-solution" id={`solution-${question.id}`}>
      <header className="ta-question__head">
        <span className="ta-chip ta-chip--number">السؤال {number}</span>
        <span className="ta-chip">{QUESTION_TYPE_LABELS[question.type]}</span>
        <span className={`ta-chip ta-chip--${question.difficulty}`}>
          {DIFFICULTY_LABELS[question.difficulty]}
        </span>
      </header>

      <h3 className="ta-question__prompt">
        <ScientificNotationText>{question.prompt}</ScientificNotationText>
      </h3>

      {question.type === 'error-analysis' || question.type === 'error-correction' ? (
        <div className="ta-flawed">
          <p className="ta-flawed__label">الحل المعروض:</p>
          <blockquote className="ta-flawed__body">
            <ScientificNotationText>{question.flawedWork}</ScientificNotationText>
          </blockquote>
        </div>
      ) : null}

      <div className="ta-solution__answer">
        <span className="ta-solution__answer-label">الإجابة الصحيحة</span>
        <span className="ta-solution__answer-value" dir="auto">
          <ScientificNotationText>{solution.answer}</ScientificNotationText>
        </span>
      </div>

      <Section title="لماذا هذه الإجابة صحيحة؟">
        <p className="ta-solution__text">
          <ScientificNotationText>{solution.whyCorrect}</ScientificNotationText>
        </p>
      </Section>

      <Section title="المفهوم">
        <p className="ta-solution__text">
          <ScientificNotationText>{solution.concept}</ScientificNotationText>
        </p>
      </Section>

      {solution.rule ? (
        <Section title="القاعدة المستعملة">
          {solution.rule.tex ? (
            <div className="ta-solution__formula">
              <MathFormula tex={solution.rule.tex} display="block" />
            </div>
          ) : (
            <p className="ta-solution__rule" dir="auto">
              <ScientificNotationText>{solution.rule.label}</ScientificNotationText>
            </p>
          )}
        </Section>
      ) : null}

      {solution.substitution ? (
        <Section title="المعطيات والمطلوب">
          <dl className="ta-solution__pairs">
            <div>
              <dt>المعطى</dt>
              <dd>
                <ScientificNotationText>{solution.substitution.given}</ScientificNotationText>
              </dd>
            </div>
            <div>
              <dt>المطلوب</dt>
              <dd>
                <ScientificNotationText>{solution.substitution.required}</ScientificNotationText>
              </dd>
            </div>
          </dl>
        </Section>
      ) : null}

      {solution.steps && solution.steps.length > 0 ? (
        <Section title="خطوات الحل">
          <ol className="ta-solution__steps">
            {solution.steps.map((step) => (
              <li key={step}>
                <ScientificNotationText>{step}</ScientificNotationText>
              </li>
            ))}
          </ol>
        </Section>
      ) : null}

      {solution.unitNote ? (
        <Section title="ملاحظة على الوحدة">
          <p className="ta-solution__text">
            <ScientificNotationText>{solution.unitNote}</ScientificNotationText>
          </p>
        </Section>
      ) : null}

      {solution.resultMeaning ? (
        <Section title="ماذا يعني الناتج؟">
          <p className="ta-solution__text">
            <ScientificNotationText>{solution.resultMeaning}</ScientificNotationText>
          </p>
        </Section>
      ) : null}

      {solution.verification ? (
        <Section title="كيف أتحقق؟">
          <p className="ta-solution__text">
            <ScientificNotationText>{solution.verification}</ScientificNotationText>
          </p>
        </Section>
      ) : null}

      <Section title="كيف أفكر في هذا السؤال؟">
        <ol className="ta-solution__steps">
          {solution.thinking.map((step) => (
            <li key={step}>
              <ScientificNotationText>{step}</ScientificNotationText>
            </li>
          ))}
        </ol>
      </Section>

      <Section title="أخطاء شائعة">
        <ul className="ta-solution__mistakes">
          {solution.commonMistakes.map((mistake) => (
            <li key={mistake}>
              <ScientificNotationText>{mistake}</ScientificNotationText>
            </li>
          ))}
        </ul>
      </Section>

      {solution.whyOthersWrong && solution.whyOthersWrong.length > 0 ? (
        <Section title="لماذا الخيارات الأخرى خاطئة؟">
          <dl className="ta-solution__pairs ta-solution__pairs--stacked">
            {solution.whyOthersWrong.map((entry) => (
              <div key={entry.optionId}>
                <dt>
                  <ScientificNotationText>{optionLabel(entry.optionId)}</ScientificNotationText>
                </dt>
                <dd>
                  <ScientificNotationText>{entry.reason}</ScientificNotationText>
                </dd>
              </div>
            ))}
          </dl>
        </Section>
      ) : null}

      <footer className="ta-solution__footer">
        <span className="ta-chip">المرجع: الصفحات {formatPageRefs(solution.pageRefs)}</span>
      </footer>
    </article>
  )
}
