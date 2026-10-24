import { useId, useState } from 'react'
import { MathFormula, Sci, ScientificDiagram, ScientificNotationText } from '@/scientific'
import type { InteractiveProps } from './registry'
import { calculateOpenSystemMass, formatModelMass } from './lesson5Models'
import './lesson5-labs.css'

type Mode = 'book-data' | 'closed' | 'open'

function amountOf(raw: string): number | null {
  if (raw.trim() === '') return null
  const value = Number(raw)
  return Number.isFinite(value) && value >= 0 ? value : null
}

export default function MassConservationLab({ reducedMotion }: InteractiveProps) {
  const id = useId()
  const [mode, setMode] = useState<Mode>('book-data')
  const [initial, setInitial] = useState('')
  const [escaped, setEscaped] = useState('')
  const [unit, setUnit] = useState('g')
  const initialMass = amountOf(initial)
  const escapedMass = amountOf(escaped)
  const openResult = initialMass !== null && escapedMass !== null
    ? calculateOpenSystemMass(initialMass, escapedMass)
    : null
  const closedReady = mode === 'closed' && initialMass !== null
  const openReady = mode === 'open' && openResult !== null
  const openInvalid = mode === 'open' && initialMass !== null && escapedMass !== null && escapedMass > initialMass

  return (
    <section
      className={`lab l5-lab ${reducedMotion ? 'l5-lab--still' : ''}`}
      data-lab="mass-conservation"
      data-mode={mode}
      aria-labelledby={`${id}-title`}
    >
      <header className="l5-lab__header">
        <div>
          <p className="l5-lab__phase">إضافة من المنصة · ميّز بيانات المصدر عن الحساب</p>
          <h3 id={`${id}-title`}>مختبر حدود النظام وانحفاظ الكتلة</h3>
        </div>
      </header>

      <div className="l5-lab__choices" role="group" aria-label="اختر نوع النشاط">
        <button type="button" className="button button--quiet" aria-pressed={mode === 'book-data'} onClick={() => setMode('book-data')}>قراءة بيانات الكتاب</button>
        <button type="button" className="button button--quiet" aria-pressed={mode === 'closed'} onClick={() => setMode('closed')}>نموذج نظام مغلق</button>
        <button type="button" className="button button--quiet" aria-pressed={mode === 'open'} onClick={() => setMode('open')}>نموذج نظام مفتوح</button>
        <button type="button" className="button button--quiet" onClick={() => { setMode('book-data'); setInitial(''); setEscaped(''); setUnit('g') }}>إعادة تعيين المختبر</button>
      </div>

      {mode === 'book-data' ? (
        <>
          <ScientificDiagram
            title="القراءتان المنقولتان من الشكل المطبوع"
            description="إعادة تمثيل تعليمية من المنصة للقراءة قبل التفاعل وبعده. يعرض المصدر 125.100 في الموضعين ولا تظهر وحدة بجانب القراءة. هذا ليس ناتج المحاكاة ولا يعيد رسم جهاز الكتاب الأصلي."
            sourceRef="رسم تعليمي من المنصة لبيانات ص32 — ليس صورة الكتاب الأصلية"
            viewBox="0 0 700 240"
            caption="نقل حرفي لقيمتي الشكل كما وردتا: لا تُضاف وحدة غير ظاهرة، ولا تُنسب القراءة إلى النموذج التفاعلي."
          >
            <rect x="36" y="32" width="286" height="164" rx="14" className="l5-lab__data-card" />
            <rect x="378" y="32" width="286" height="164" rx="14" className="l5-lab__data-card" />
            <text x="179" y="75" textAnchor="middle" className="l5-lab__svg-heading">قبل التفاعل</text>
            <text x="521" y="75" textAnchor="middle" className="l5-lab__svg-heading">بعد التفاعل</text>
            <text x="179" y="143" textAnchor="middle" direction="ltr" className="l5-lab__source-number">125.100</text>
            <text x="521" y="143" textAnchor="middle" direction="ltr" className="l5-lab__source-number">125.100</text>
            <text x="179" y="174" textAnchor="middle" className="l5-lab__svg-note">لا تظهر وحدة</text>
            <text x="521" y="174" textAnchor="middle" className="l5-lab__svg-note">لا تظهر وحدة</text>
          </ScientificDiagram>
          <p className="l5-lab__status" role="status">بيانات الكتاب كما عُرضت: القراءتان متساويتان في هذا الشكل المحدد فقط.</p>
          <p className="l5-lab__note">لا نستنتج من هذه التجربة وحدها أن كل ميزان يعطي قراءة ثابتة؛ يعتمد ما يقيسه الميزان على حدود الجهاز وما إذا كانت مادة قد دخلت أو غادرت.</p>
        </>
      ) : (
        <>
          <ScientificDiagram
            title={mode === 'closed' ? 'حدود نظام مغلق' : 'حدود نظام مفتوح'}
            description={mode === 'closed'
              ? 'رسم تخطيطي تعليمي من المنصة لحد نظام مغلق: المادة تبقى داخل الحدود ولا تعبرها أثناء التفاعل.'
              : 'رسم تخطيطي تعليمي من المنصة لحد نظام مفتوح: يمكن لكتلة من المادة أن تعبر إلى المحيط؛ لا تختفي من حساب النظام الأوسع.'}
            sourceRef="رسم مفاهيمي من المنصة — ليس شكلاً أصلياً من الكتاب"
            viewBox="0 0 700 230"
            caption="يمثل الإطار حدود النظام المختار، لا صورة وعاء بعينه. انتقال مادة عبر الحد يغير ما يبقى داخله، لكنه لا يلغي كتلتها."
          >
            <rect x="170" y="42" width="350" height="148" rx="22" className={mode === 'closed' ? 'l5-lab__boundary l5-lab__boundary--closed' : 'l5-lab__boundary l5-lab__boundary--open'} />
            <text x="345" y="76" textAnchor="middle" className="l5-lab__svg-heading">حد النظام</text>
            <circle cx="292" cy="124" r="18" className="l5-lab__matter-dot" />
            <circle cx="345" cy="124" r="18" className="l5-lab__matter-dot l5-lab__matter-dot--second" />
            <circle cx="398" cy="124" r="18" className="l5-lab__matter-dot" />
            {mode === 'open' ? (
              <>
                <path d="M449 124 H610" className="l5-lab__escape-arrow" />
                <path d="M610 124 L592 114 L592 134 Z" className="l5-lab__escape-arrow-head" />
                <text x="605" y="100" textAnchor="end" className="l5-lab__svg-note">كتلة مادة إلى المحيط</text>
              </>
            ) : (
              <text x="345" y="171" textAnchor="middle" className="l5-lab__svg-note">لا تعبر مادة حدود النظام</text>
            )}
          </ScientificDiagram>

          <div className="l5-lab__fields">
            <label className="field" htmlFor={`${id}-initial`}>
              <span className="field__label">مجموع الكتلة داخل الحساب قبل التفاعل</span>
              <input id={`${id}-initial`} className="field__input" type="number" inputMode="decimal" min="0" step="any" value={initial} onChange={(event) => setInitial(event.target.value)} />
            </label>
            {mode === 'open' ? (
              <label className="field" htmlFor={`${id}-escaped`}>
                <span className="field__label">كتلة المادة التي عبرت إلى المحيط</span>
                <input id={`${id}-escaped`} className="field__input" type="number" inputMode="decimal" min="0" step="any" value={escaped} onChange={(event) => setEscaped(event.target.value)} />
              </label>
            ) : null}
            <label className="field" htmlFor={`${id}-unit`}>
              <span className="field__label">وحدة القيم التي أدخلتها</span>
              <select id={`${id}-unit`} className="field__input" value={unit} onChange={(event) => setUnit(event.target.value)}>
                <option value="g">g</option><option value="kg">kg</option>
              </select>
            </label>
          </div>

          <p className="l5-lab__status" role="status" aria-live="polite">
            <ScientificNotationText>{mode === 'closed'
              ? closedReady
                ? `ناتج حسابي للنظام المغلق: مجموع الكتلة قبل التفاعل ${formatModelMass(initialMass!)} ${unit}، وبعده ${formatModelMass(initialMass!)} ${unit}.`
                : 'أدخل قيمة كتلة غير سالبة لإظهار نتيجة النموذج المغلق.'
              : openInvalid
                ? 'كتلة المادة المغادرة لا يمكن أن تتجاوز الكتلة الابتدائية في هذا النموذج؛ راجع القيم.'
                : openReady
                  ? `ناتج النموذج: ما بقي داخل الوعاء ${formatModelMass(openResult.insideMass)} ${unit}؛ ومع إضافة الكتلة التي عبرت الحد ${formatModelMass(openResult.accountedTotal)} ${unit}.`
                  : 'أدخل الكتلة الابتدائية وكتلة المادة المغادرة لإظهار الحساب.'}</ScientificNotationText>
          </p>
          <p className="l5-lab__note">
            كل قراءة هنا ناتج نموذج حسابي من مدخلاتك وقانون انحفاظ الكتلة، وليست قراءة ميزان أو نتيجة تجربة كتابية. في النظام المفتوح قد تختلف كتلة ما بقي على الميزان إذا خرجت مادة؛ نحسب المادة المغادرة عند توسيع حدود النظام.
          </p>
          {mode === 'open' && openReady ? (
            <p className="l5-lab__note" dir="rtl">
              فحص النموذج:
              {' '}<MathFormula
                tex={`${formatModelMass(openResult.insideMass)} + ${formatModelMass(openResult.escapedMass)} = ${formatModelMass(openResult.accountedTotal)}`}
                label={`${formatModelMass(openResult.insideMass)} زائد ${formatModelMass(openResult.escapedMass)} يساوي ${formatModelMass(openResult.accountedTotal)}`}
              />{' '}<Sci variant="plain">{unit}</Sci>.
            </p>
          ) : null}
        </>
      )}
      <ScientificNotationText as="span" className="visually-hidden">القراءة 125.100 تخص بيانات الكتاب وحدها ولا تنتج عن أداة الحساب.</ScientificNotationText>
    </section>
  )
}
