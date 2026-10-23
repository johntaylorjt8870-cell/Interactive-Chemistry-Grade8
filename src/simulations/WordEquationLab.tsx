import { useId, useState } from 'react'
import { RtlRun } from '@/components/BidiText'
import { ScientificNotationText, WordEquation } from '@/scientific'
import type { InteractiveProps } from './registry'
import './lesson4-labs.css'

const REACTIONS = [
  { id: 'magnesium', title: 'احتراق المغنزيوم', page: '25', first: 'المغنزيوم', second: 'الأكسجين', product: 'أكسيد المغنزيوم', condition: 'تسخين' },
  { id: 'iron', title: 'الحديد والكبريت', page: '26', first: 'الحديد', second: 'الكبريت', product: 'كبريتيد الحديد II' },
  { id: 'water', title: 'تكون الماء', page: '26', first: 'الهدروجين', second: 'الأكسجين', product: 'الماء' },
  { id: 'carbon', title: 'احتراق الكربون', page: '28', first: 'الكربون', second: 'الأكسجين', product: 'ثنائي أكسيد الكربون' },
  { id: 'ammonia', title: 'تكون النشادر', page: '28', first: 'الهدروجين', second: 'الآزوت', product: 'النّشادر' },
  { id: 'sulfide', title: 'الزنك والكبريت', page: '28', first: 'الزنك', second: 'الكبريت', product: 'كبريتيد الزنك' },
  { id: 'oxide', title: 'الزنك والأكسجين', page: '28', first: 'الزنك', second: 'الأكسجين', product: 'أكسيد الزنك' },
] as const

const SECOND = ['الأكسجين', 'الكبريت', 'الآزوت'] as const
const PRODUCTS = [
  'الماء',
  'أكسيد المغنزيوم',
  'أكسيد الزنك',
  'ثنائي أكسيد الكربون',
  'النّشادر',
  'كبريتيد الزنك',
  'كبريتيد الحديد II',
] as const

export default function WordEquationLab({ reducedMotion }: InteractiveProps) {
  const id = useId()
  const [reactionId, setReactionId] = useState<string>('magnesium')
  const [second, setSecond] = useState('')
  const [product, setProduct] = useState('')
  const [checked, setChecked] = useState(false)
  const [solvedIds, setSolvedIds] = useState<readonly string[]>([])

  const reaction = REACTIONS.find((entry) => entry.id === reactionId)!
  const correct = second === reaction.second && product === reaction.product

  function choose(next: string) {
    setReactionId(next)
    setSecond('')
    setProduct('')
    setChecked(false)
  }

  function handleCheck() {
    setChecked(true)
    if (correct && !solvedIds.includes(reaction.id)) {
      setSolvedIds((prev) => [...prev, reaction.id])
    }
  }

  return (
    <section
      className={`lab reaction-lab word-lab ${reducedMotion ? 'reaction-lab--still' : ''}`}
      data-reaction={reactionId}
      data-checked={checked ? 'true' : 'false'}
      aria-labelledby={`${id}-title`}
    >
      <header className="lab__header">
        <div>
          <p className="lab__phase">إضافة من المنصة · تدريب، وليس الاختبار</p>
          <h3 id={`${id}-title`}>أسماء البداية، ثم اسم المادة الجديدة</h3>
        </div>
        <RtlRun className="badge badge--ghost reaction-lab__progress">
          أنجزت {solvedIds.length} من {REACTIONS.length} معادلات
        </RtlRun>
      </header>
      <div className="reaction-lab__choices" role="group" aria-label="اختر تفاعل التدريب">
        {REACTIONS.map((entry) => (
          <button
            type="button"
            key={entry.id}
            className="button button--quiet"
            aria-pressed={reactionId === entry.id}
            onClick={() => choose(entry.id)}
          >
            {entry.title}
          </button>
        ))}
      </div>
      <div className="reaction-lab__fields">
        <label className="field">
          <span className="field__label">المتفاعل الثاني مع {reaction.first}</span>
          <select
            className="field__input"
            value={second}
            onChange={(event) => {
              setSecond(event.target.value)
              setChecked(false)
            }}
          >
            <option value="">اختر مادة البداية</option>
            {SECOND.map((name) => (
              <option value={name} key={name}>
                {name}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          <span className="field__label">المادة الجديدة الناتجة</span>
          <select
            className="field__input"
            value={product}
            onChange={(event) => {
              setProduct(event.target.value)
              setChecked(false)
            }}
          >
            <option value="">اختر المادة الناتجة</option>
            {PRODUCTS.map((name) => (
              <option value={name} key={name}>
                {name}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="reaction-lab__equation">
        <WordEquation
          reactants={[reaction.first, second || '................']}
          products={[product || '................']}
          condition={'condition' in reaction ? reaction.condition : undefined}
          reactantRoles={['مادة متفاعلة', 'مادة متفاعلة']}
          productRoles={['مادة ناتجة']}
        />
      </div>
      <div className="lab__actions">
        <button type="button" className="button button--primary" disabled={!second || !product} onClick={handleCheck}>
          تحقق من المعادلة
        </button>
        <button type="button" className="button button--quiet" disabled={!second && !product} onClick={() => choose(reactionId)}>
          إعادة بناء المعادلة
        </button>
      </div>
      <p className="lab__conclusion" role="status">
        <ScientificNotationText>
          {checked
            ? correct
              ? `اتسقت البطاقة: ${reaction.first} يتفاعل مع ${reaction.second} ليعطي ${reaction.product}. راجع مواضع البداية والنهاية؛ ${'condition' in reaction && reaction.condition ? 'التسخين شرط فوق السهم، لا مادة.' : 'لم نضف شروطاً غير مطبوعة في السؤال.'}`
              : `راجع وصف تفاعل «${reaction.title}» في الصفحة ${reaction.page}. اختيارك لا يطابق مواد هذا التفاعل؛ تذكّر أن الأكسجين يعطي «أكسيد» والكبريت يعطي «كبريتيد».`
            : 'اختر مادتي البداية والنهاية ثم اطلب التحقق. السهم يقرأ من المتفاعلات إلى النواتج ولا يقلب بسبب العربية.'}
        </ScientificNotationText>
      </p>
      <p className="reaction-lab__note">
        بناء البطاقة تدريب على لغة المعادلة؛ لا تنفذ التفاعلات منزلياً. الصيغ والظروف غير المذكورة في المصدر لا تخترع في هذه
        البطاقة.
      </p>
    </section>
  )
}
