import { useState } from 'react'
import { RtlRun } from '@/components/BidiText'
import { ScientificNotationText } from '@/scientific'
import type { InteractiveProps } from './registry'

/* ============================================================================
   مختبر «اكتشف الخطأ» — إضافة من المنصة
   ----------------------------------------------------------------------------
   ست عبارات مأخوذة من الأخطاء التي يرصدها الدرس فعلاً (إشارة الأيون، نطاق
   تمثيل لويس، معنى الرابطة المضاعفة، خواص المركّبات، وسلوك اللافلزّ مع الشريك).
   الطالب يحكم على كل عبارة بنفسه، ثم يرى التصحيح معلَّلاً. العبارة الرابعة صحيحة
   عن قصد، حتى لا يتعلّم الطالب أن «كل عبارة خطأ».
   ========================================================================= */

type Statement = {
  id: string
  claim: string
  /** هل العبارة صحيحة علمياً؟ */
  isTrue: boolean
  verdict: string
  correction: string
}

const STATEMENTS: Statement[] = [
  {
    id: 'charge-sign',
    claim: 'إذا فقدت ذرّة الصوديوم إلكتروناً واحداً، فإن شحنتها تصبح سالبة.',
    isTrue: false,
    verdict: 'خطأ في الإشارة.',
    correction:
      'الإلكترون شحنة سالبة؛ فمن يفقد شحنة سالبة يبقى لديه فائض موجب. الحساب: 11 بروتوناً − 10 إلكترونات = +1. القاعدة: فقد ⇒ موجب، اكتسب ⇒ سالب.',
  },
  {
    id: 'lewis-scope',
    claim: 'تمثيل لويس يرسم جميع إلكترونات الذرّة في سوياتها كلها.',
    isTrue: false,
    verdict: 'خطأ في نطاق التمثيل.',
    correction:
      'تمثيل لويس يعرض إلكترونات السوية الأخيرة فقط، لأنها وحدها تشارك في الرابطة. رسم الإلكترونات الداخلية يجعل التمثيل مخالفاً لمعناه العلمي.',
  },
  {
    id: 'double-bond',
    claim: 'الرابطة المضاعفة تعني وجود إلكترونين مشتركين بين الذرّتين.',
    isTrue: false,
    verdict: 'خطأ في العدد.',
    correction:
      'المضاعفة تعني زوجين مشتركين، أي أربعة إلكترونات (اثنان من كل ذرّة). خطأ شائع: عدّ الأزواج بدل الإلكترونات، أو العكس.',
  },
  {
    id: 'covalent-properties',
    claim: 'معظم المركّبات ذات الرابطة المشتركة غازات، ودرجات غليانها منخفضة.',
    isTrue: true,
    verdict: 'صحيحة، وهي نصّ «إضاءة» صفحة 16.',
    correction:
      'هذه العبارة مطابقة لما ينصّ عليه الكتاب: معظمها غازات وغير ناقلة للتيار الكهربائي ودرجات غليانها منخفضة، لأن قوى الجذب بين الجزيئات أضعف من التجاذب داخل الشبكة الأيونية.',
  },
  {
    id: 'ionic-conductivity',
    claim: 'المركّب الأيوني لا ينقل التيار الكهربائي في أي حالة من حالاته.',
    isTrue: false,
    verdict: 'خطأ في التعميم.',
    correction:
      'الكتاب يقول: لا ينقله في الحالة الصلبة، بينما محاليله ومصاهيره تنقله. السبب أن الأيونات مثبّتة في البلورة الصلبة، وتتحرّر عند الصهر أو الذوبان.',
  },
  {
    id: 'nonmetal-always-gains',
    claim: 'بما أن الأكسجين (توزيعه 2-6) لا فلزّ، فهو يكتسب إلكترونين ويتحوّل إلى أيون سالب في جميع مركّباته حتى في O₂ وH₂O.',
    isTrue: false,
    verdict: 'خطأ في التعميم وإغفال الطرف المقابل.',
    correction:
      'سلوك اللافلزّ يتوقّف على الذرّة المقابلة: مع الفلزّات (مثل MgO وCaO) يكتسب الأكسجين إلكترونين ويكوّن أيون O²⁻، أمّا مع اللافلزّات (مثل O₂ وH₂O) فلا توجد ذرّة تفقد إلكتروناتها، فيتشارك أزواج الإلكترونات برابطة مشتركة دون تكوين أيونات.',
  },
]

export default function ErrorSpotterLab({ interactiveId }: InteractiveProps) {
  const [answers, setAnswers] = useState<Record<string, boolean>>({})
  const answered = Object.keys(answers).length
  const correctCount = STATEMENTS.filter((statement) => answers[statement.id] === statement.isTrue).length

  const answer = (statement: Statement, value: boolean) => {
    setAnswers((current) => ({ ...current, [statement.id]: value }))
  }

  return (
    <section
      className="lab l2-spotter-lab"
      data-interactive-id={interactiveId}
      data-answered={answered}
      aria-labelledby="l2-spotter-lab-title"
    >
      <header className="lab__header">
        <div>
          <p className="lab__phase">إضافة من المنصة · اكتشف الخطأ العلمي</p>
          <h3 id="l2-spotter-lab-title">أي العبارات صحيح وأيها خطأ؟</h3>
        </div>
        <button
          type="button"
          className="button button--quiet"
          onClick={() => setAnswers({})}
          disabled={answered === 0}
        >
          إعادة المحاولة
        </button>
      </header>

      <p className="l2-spotter-lab__intro">
        اقرأ كل عبارة على حدة، واحكم عليها بنفسك قبل أن تفتح التصحيح. لا يظهر التعليل قبل
        إجابتك، ولا يستطيع زرّ التصحيح أن يمنحك إجابة سؤال لم تحاوله.
      </p>

      <ul className="l2-spotter-lab__list">
        {STATEMENTS.map((statement, index) => {
          const chosen = answers[statement.id]
          const isAnswered = chosen !== undefined
          const isRight = chosen === statement.isTrue
          return (
            <li
              key={statement.id}
              className="l2-spotter-lab__item"
              data-statement={statement.id}
              data-state={!isAnswered ? 'unanswered' : isRight ? 'correct' : 'incorrect'}
            >
              <div className="l2-spotter-lab__claim">
                <span className="l2-observation-index" aria-hidden="true">
                  {index + 1}
                </span>
                <p>
                  <ScientificNotationText>{statement.claim}</ScientificNotationText>
                </p>
              </div>

              <div className="l2-spotter-lab__actions" role="group" aria-label={`احكم على العبارة ${index + 1}`}>
                <button
                  type="button"
                  className="l2-choice"
                  aria-pressed={chosen === true}
                  disabled={isAnswered}
                  onClick={() => answer(statement, true)}
                >
                  صحيح
                </button>
                <button
                  type="button"
                  className="l2-choice"
                  aria-pressed={chosen === false}
                  disabled={isAnswered}
                  onClick={() => answer(statement, false)}
                >
                  خطأ
                </button>
              </div>

              <div className="l2-spotter-lab__feedback" aria-live="polite">
                {isAnswered ? (
                  <>
                    <p className="l2-spotter-lab__verdict" data-verdict={isRight ? 'correct' : 'incorrect'}>
                      <strong>{isRight ? 'حكمك صحيح.' : 'حكمك غير دقيق.'}</strong> {statement.verdict}
                    </p>
                    <p>
                      <ScientificNotationText>{statement.correction}</ScientificNotationText>
                    </p>
                  </>
                ) : (
                  <p className="l2-spotter-lab__waiting">التصحيح يظهر بعد اختيارك.</p>
                )}
              </div>
            </li>
          )
        })}
      </ul>

      <p className="lab__conclusion" aria-live="polite">
        <strong>نتيجتك:</strong>{' '}
        <RtlRun>
          أجبت عن {answered} من {STATEMENTS.length} عبارات، وأصبت في {correctCount}.
        </RtlRun>{' '}
        والهدف ليس النتيجة وحدها: أعد قراءة تصحيح كل عبارة أخطأت فيها، فالخطأ المتكرّر في الاختبار هو نفسه هنا.
      </p>
    </section>
  )
}
