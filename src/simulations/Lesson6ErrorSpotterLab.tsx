import { useId, useState } from 'react'
import { RtlRun } from '@/components/BidiText'
import { MathFormula, ScientificNotationText } from '@/scientific'
import type { InteractiveProps } from './registry'
import { LESSON6_ERROR_CASES } from './lesson6Models'

export default function Lesson6ErrorSpotterLab({ interactiveId }: InteractiveProps) {
  const uid = useId()
  const [answers, setAnswers] = useState<Record<string, boolean>>({})
  const answeredCount = Object.keys(answers).length
  const correctCount = LESSON6_ERROR_CASES.filter((item) => answers[item.id] === item.isTrue).length

  const choose = (caseId: string, judgement: boolean) => {
    setAnswers((prev) => ({ ...prev, [caseId]: judgement }))
  }

  return (
    <section
      className="lab l6-lab l6-spotter"
      data-interactive-id={interactiveId}
      data-answered={answeredCount}
      aria-labelledby={`${uid}-title`}
    >
      <header className="lab__header l6-lab__header">
        <div>
          <p className="lab__phase">إضافة من المنصة · تشخيص الأخطاء الشائعة في المعادلات</p>
          <h3 id={`${uid}-title`}>مختبر اكتشف الخطأ في كتابة المعادلة الكيميائيّة وموازنتها</h3>
        </div>
        <div className="l6-builder__header-meta">
          <RtlRun className="l6-lab__counter">{`أجبت عن ${answeredCount} من ${LESSON6_ERROR_CASES.length}`}</RtlRun>
          <button
            type="button"
            className="button button--quiet"
            disabled={answeredCount === 0}
            onClick={() => setAnswers({})}
          >
            إعادة المحاولة
          </button>
        </div>
      </header>

      <p className="l6-spotter__intro">
        افحص كل عبارة ومعادلتها بدقة: تفقّد صحّة الصيغ الكيميائيّة أولاً، ثم رموز الحالة الفيزيائيّة، ثم مجموع ذرات كل عنصر وأبسط نسبة للمعاملات. لا يظهر التعليل إلا بعد أن تصدر حكمك بنفسك.
      </p>

      <ul className="l6-spotter__list">
        {LESSON6_ERROR_CASES.map((item, idx) => {
          const picked = answers[item.id]
          const isAnswered = picked !== undefined
          const isRight = picked === item.isTrue

          return (
            <li
              key={item.id}
              className="l6-spotter__item"
              data-case={item.id}
              data-judged={isAnswered ? (isRight ? 'right' : 'wrong') : 'pending'}
            >
              <div className="l6-spotter__head">
                <RtlRun className="l6-spotter__num">{`الحالة ${idx + 1}`}</RtlRun>
                <p className="l6-spotter__claim">
                  <ScientificNotationText>{item.claim}</ScientificNotationText>
                </p>
              </div>

              <div className="l6-spotter__eq">
                <MathFormula tex={item.texEquation} display="block" label={item.claim} />
              </div>

              <div className="l6-spotter__actions" role="group" aria-label={`حكمك على الحالة ${idx + 1}`}>
                <button
                  type="button"
                  className={`button ${picked === true ? 'button--primary' : 'button--quiet'}`}
                  aria-pressed={picked === true}
                  onClick={() => choose(item.id, true)}
                >
                  صحيحة علمياً
                </button>
                <button
                  type="button"
                  className={`button ${picked === false ? 'button--primary' : 'button--quiet'}`}
                  aria-pressed={picked === false}
                  onClick={() => choose(item.id, false)}
                >
                  فيها خطأ علمي
                </button>
              </div>

              {isAnswered && (
                <div
                  className={`l6-spotter__feedback ${isRight ? 'l6-spotter__feedback--ok' : 'l6-spotter__feedback--err'}`}
                  role="status"
                >
                  <p className="l6-spotter__verdict">
                    <strong>{isRight ? 'حكمك سليم ✔ — ' : 'راجع حكمك — '}</strong>
                    <ScientificNotationText>{item.verdict}</ScientificNotationText>
                  </p>
                  <p className="l6-spotter__correction">
                    <ScientificNotationText>{item.correction}</ScientificNotationText>
                  </p>
                </div>
              )}
            </li>
          )
        })}
      </ul>

      {answeredCount === LESSON6_ERROR_CASES.length && (
        <div className="l6-balancer__verdict l6-balancer__verdict--success" role="status" aria-live="polite">
          <p>
            <RtlRun>{`النتيجة النهائية: أصبتَ في ${correctCount} من ${LESSON6_ERROR_CASES.length} حالات.`}</RtlRun>
          </p>
        </div>
      )}
    </section>
  )
}
