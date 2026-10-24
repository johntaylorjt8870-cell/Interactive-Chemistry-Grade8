import { useState } from 'react'
import { BohrAtom } from '@/scientific'
import type { InteractiveProps } from './registry'

/* ============================================================================
   مختبر عدّ إلكترونات السطح — إضافة من المنصة
   ----------------------------------------------------------------------------
   مهارة واحدة: أن يقرأ الطالب السوية الأخيرة في توزيع مطبوع ويستنتج عدد
   إلكترونات السطح. الاختيار بالأزرار (لا بالسحب)، والتغذية الراجعة لا تظهر إلا
   بعد «تحقّق»، وتشرح *سبب* الجواب ثم تصل به إلى الميل المتوقّع للذرّة.
   ========================================================================= */

type AtomSpec = {
  symbol: string
  atomicNumber: number
  shells: number[]
  /** أين وردت الذرّة في صفحات الدرس. */
  printedOn: string
}

const ATOMS: AtomSpec[] = [
  { symbol: 'Na', atomicNumber: 11, shells: [2, 8, 1], printedOn: '14' },
  { symbol: 'Mg', atomicNumber: 12, shells: [2, 8, 2], printedOn: '17' },
  { symbol: 'Al', atomicNumber: 13, shells: [2, 8, 3], printedOn: '16' },
  { symbol: 'O', atomicNumber: 8, shells: [2, 6], printedOn: '15' },
  { symbol: 'N', atomicNumber: 7, shells: [2, 5], printedOn: '15' },
  { symbol: 'Cl', atomicNumber: 17, shells: [2, 8, 7], printedOn: '14' },
  { symbol: 'H', atomicNumber: 1, shells: [1], printedOn: '15' },
]

function tendencyFor(surface: number, symbol: string): string {
  if (symbol === 'H') return 'تميل إلى المشاركة بإلكترونها الوحيد، لأن سويتها الأولى تكتمل بإلكترونين.'
  if (surface <= 2) return 'تميل إلى فقد إلكترونات سطحها والتحوّل إلى أيون موجب.'
  if (surface >= 6) return 'تميل إلى اكتساب إلكترونات لتكمل الثمانية وتصبح أيوناً سالباً.'
  return 'تميل إلى المشاركة بأزواج إلكترونات، لا إلى الفقد أو الاكتساب الكامل.'
}

export default function ValenceCounterLab({ interactiveId }: InteractiveProps) {
  const [index, setIndex] = useState(0)
  const [answer, setAnswer] = useState<number | null>(null)
  const [checked, setChecked] = useState(false)
  const [showConfig, setShowConfig] = useState(false)

  const atom = ATOMS[index]!
  const surface = atom.shells[atom.shells.length - 1]!
  const isCorrect = answer === surface
  const state = checked ? (isCorrect ? 'correct' : 'incorrect') : 'idle'

  const selectAtom = (nextIndex: number) => {
    setIndex(nextIndex)
    setAnswer(null)
    setChecked(false)
    setShowConfig(false)
  }

  return (
    <section
      className="lab l2-valence-lab"
      data-interactive-id={interactiveId}
      data-atom={atom.symbol}
      data-state={state}
      aria-labelledby="l2-valence-lab-title"
    >
      <header className="lab__header">
        <div>
          <p className="lab__phase">إضافة من المنصة · عدّ إلكترونات السطح</p>
          <h3 id="l2-valence-lab-title">كم إلكتروناً في سطح الذرّة؟</h3>
        </div>
        <div className="l2-valence-lab__picker" role="group" aria-label="اختر الذرّة">
          {ATOMS.map((item, itemIndex) => (
            <button
              key={item.symbol}
              type="button"
              className="l2-choice"
              aria-pressed={itemIndex === index}
              onClick={() => selectAtom(itemIndex)}
            >
              <span dir="ltr">{item.symbol}</span>
            </button>
          ))}
        </div>
      </header>

      <div className="l2-valence-lab__body">
        <div className="l2-valence-lab__figure">
          <BohrAtom symbol={atom.symbol} shells={atom.shells} size={168} />
          <p className="l2-valence-lab__figure-note">
            النواة والبروتونات لا تتغيّر عند العدّ. عدّ إلكترونات <strong>السوية الأخيرة</strong> فقط،
            لا كل النقاط في الرسم.
          </p>
        </div>

        <div className="l2-valence-lab__panel">
          <p className="l2-valence-lab__prompt">
            ذرّة <strong dir="ltr">{atom.symbol}</strong> ( العدد الذري {atom.atomicNumber} ) — كم
            إلكتروناً يحمل سطحها؟
          </p>

          <div className="l2-valence-lab__answers" role="group" aria-label="اختر عدد إلكترونات السطح">
            {Array.from({ length: 8 }, (_unused, value) => value + 1).map((value) => (
              <button
                key={value}
                type="button"
                className="l2-choice l2-choice--number"
                aria-pressed={answer === value}
                disabled={checked}
                onClick={() => setAnswer(value)}
              >
                {value}
              </button>
            ))}
          </div>

          <div className="lab__actions">
            <button
              type="button"
              className="button button--primary"
              disabled={answer === null || checked}
              onClick={() => setChecked(true)}
            >
              تحقّق
            </button>
            <button
              type="button"
              className="button button--quiet"
              onClick={() => {
                setAnswer(null)
                setChecked(false)
              }}
              disabled={answer === null && !checked}
            >
              إعادة المحاولة
            </button>
            <button
              type="button"
              className="button button--quiet"
              onClick={() => selectAtom((index + 1) % ATOMS.length)}
            >
              الذرّة التالية
            </button>
            <button
              type="button"
              className="button button--quiet"
              aria-pressed={showConfig}
              onClick={() => setShowConfig((current) => !current)}
            >
              {showConfig ? 'أخفِ التوزيع' : 'أظهر التوزيع الإلكتروني'}
            </button>
          </div>

          {showConfig ? (
            <p className="l2-valence-lab__config">
              التوزيع الإلكتروني لـ<span dir="ltr">{atom.symbol}</span>:
              <span dir="ltr" className="l2-valence-lab__config-value">
                {atom.shells.join('-')}
              </span>
            </p>
          ) : null}

          <div className="l2-valence-lab__feedback" aria-live="polite" data-feedback={state}>
            {state === 'idle' ? (
              <p>اختر عدداً، ثم اضغط «تحقّق». لا تظهر النتيجة قبل المحاولة.</p>
            ) : state === 'correct' ? (
              <>
                <p>
                  <strong>إجابة صحيحة.</strong> السوية الأخيرة في التوزيع{' '}
                  <span dir="ltr">{atom.shells.join('-')}</span> تحمل {surface} إلكترون
                  {surface > 1 ? 'ات' : ''}، وهذا هو عدد إلكترونات السطح.
                </p>
                <p>{tendencyFor(surface, atom.symbol)}</p>
              </>
            ) : (
              <>
                <p>
                  <strong>ليست الإجابة الدقيقة.</strong> السوية الأخيرة في التوزيع{' '}
                  <span dir="ltr">{atom.shells.join('-')}</span> تحمل {surface} إلكترون
                  {surface > 1 ? 'ات' : ''}. العدد الذي اخترته ({answer}) ليس عدد إلكترونات السطح.
                </p>
                <p>
                  التصحيح: اقرأ التوزيع من الداخل إلى الخارج، وخُذ <strong>آخر رقم</strong> وحده؛
                  الأرقام الأخرى إلكترونات داخلية لا تشارك في الرابطة.
                </p>
              </>
            )}
          </div>
        </div>
      </div>

      <p className="lab__conclusion">
        <strong>الفكرة التي يثبّتها العدّ:</strong> الذرّة لا «تعرف» عدد إلكتروناتها كلها عند
        الارتباط، بل تتصرّف بحسب سطحها فقط. ولهذا تشترك ذرّات العناصر نفسها في العمود نفسه من
        الجدول بالطريقة نفسها تماماً. الذرّة المطبوعة في الصفحة {atom.printedOn}.
      </p>
    </section>
  )
}
