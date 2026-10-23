import { useId, useState } from 'react'
import { Sci, ScientificDiagram, ScientificTable } from '@/scientific'
import type { InteractiveProps } from './registry'
import { calculateProportionalReaction, formatModelMass, MASS_RATIOS } from './lesson5Models'
import './lesson5-labs.css'

type RatioId = keyof typeof MASS_RATIOS

function amountOf(raw: string): number | null {
  if (raw.trim() === '') return null
  const value = Number(raw)
  return Number.isFinite(value) && value >= 0 ? value : null
}

export default function FixedRatioLab({ reducedMotion }: InteractiveProps) {
  const id = useId()
  const [ratioId, setRatioId] = useState<RatioId>('iron-sulfur')
  const [leftInput, setLeftInput] = useState('60')
  const [rightInput, setRightInput] = useState('30')
  const [unit, setUnit] = useState('g')
  const ratio = MASS_RATIOS[ratioId]
  const leftAvailable = amountOf(leftInput)
  const rightAvailable = amountOf(rightInput)
  const result = leftAvailable !== null && rightAvailable !== null
    ? calculateProportionalReaction(leftAvailable, rightAvailable, ratio)
    : null

  function chooseRatio(next: RatioId) {
    setRatioId(next)
    setLeftInput(next === 'iron-sulfur' ? '60' : '10')
    setRightInput(next === 'iron-sulfur' ? '30' : '3')
  }

  const maxRatioMass = Math.max(ratio.leftRatioMass, ratio.rightRatioMass)
  const barScale = 220 / maxRatioMass
  const leftBarWidth = ratio.leftRatioMass * barScale
  const rightBarWidth = ratio.rightRatioMass * barScale
  const modelRows = result ? [
    { id: 'left', cells: {
      element: ratio.leftName,
      available: `${formatModelMass(result.leftAvailable)} ${unit}`,
      reacted: `${formatModelMass(result.leftReacted)} ${unit}`,
      excess: `${formatModelMass(result.leftExcess)} ${unit}`,
    } },
    { id: 'right', cells: {
      element: ratio.rightName,
      available: `${formatModelMass(result.rightAvailable)} ${unit}`,
      reacted: `${formatModelMass(result.rightReacted)} ${unit}`,
      excess: `${formatModelMass(result.rightExcess)} ${unit}`,
    } },
  ] : []

  return (
    <section
      className={`lab l5-lab ${reducedMotion ? 'l5-lab--still' : ''}`}
      data-lab="fixed-proportions"
      data-ratio={ratioId}
      aria-labelledby={`${id}-title`}
    >
      <header className="l5-lab__header">
        <div>
          <p className="l5-lab__phase">إضافة من المنصة · حساب تناسبي من بيانات الكتاب</p>
          <h3 id={`${id}-title`}>مختبر النسب الثابتة والمواد الزائدة</h3>
        </div>
      </header>

      <fieldset className="l5-lab__fieldset">
        <legend>اختر زوج العناصر والنسبة المصدرية</legend>
        <div className="l5-lab__choices">
          <button type="button" className="button button--quiet" aria-pressed={ratioId === 'iron-sulfur'} onClick={() => chooseRatio('iron-sulfur')}>الحديد والكبريت</button>
          <button type="button" className="button button--quiet" aria-pressed={ratioId === 'lead-sulfur'} onClick={() => chooseRatio('lead-sulfur')}>الرصاص والكبريت</button>
          <button type="button" className="button button--quiet" onClick={() => { setRatioId('iron-sulfur'); setLeftInput('60'); setRightInput('30'); setUnit('g') }}>إعادة تعيين المختبر</button>
        </div>
      </fieldset>

      <p className="l5-lab__status" dir="rtl">
        <span>النسبة الكتلية المعتمدة:</span>{' '}
        <Sci as="span" variant="plain">{`${ratio.leftRatioMass} : ${ratio.rightRatioMass}`}</Sci>
        {ratioId === 'iron-sulfur' ? (
          <>
            {' '}<span>وتبسيطها</span>{' '}<Sci as="span" variant="plain">7 : 4</Sci>{' '}<Sci as="span" variant="plain">(Fe : S)</Sci><span>.</span>
          </>
        ) : (
          <>
            <span>؛ أي</span>{' '}<Sci as="span" variant="plain">10 g</Sci>{' '}<span>رصاص تقابل</span>{' '}<Sci as="span" variant="plain">1.56 g</Sci>{' '}<span>كبريت في بيانات المصدر.</span>
          </>
        )}
      </p>
      <ScientificDiagram
        title="تمثيل بصري للنسبة الكتلية"
        description={`رسم تعليمي من المنصة يقارن النسبة الكتلية ${ratio.leftName} إلى ${ratio.rightName}: ${ratio.leftRatioMass} إلى ${ratio.rightRatioMass}. طول الشريط يتناسب مع الكتلة المرجعية؛ لا يمثل عدد الذرات أو صورة الكتاب.`}
        sourceRef="إعادة رسم تعليمية من المنصة — بيانات النسبة من صفحات الدرس"
        className="l5-lab__ratio-diagram"
        viewBox="0 0 400 220"
        caption="الشريط أطول بنسبة الكتلتين المعطاة؛ الرسم تخطيطي للمقارنة وليس نموذجاً للجسيمات أو رسماً أصلياً من الكتاب."
      >
        <text x="150" y="70" direction="rtl" textAnchor="start" className="l5-lab__svg-heading">{ratio.leftName}</text>
        <rect x="160" y="42" width={leftBarWidth} height="42" rx="8" className="l5-lab__ratio-bar l5-lab__ratio-bar--left" />
        <text x="160" y="112" direction="ltr" className="l5-lab__svg-count">{ratio.leftRatioMass} g</text>
        <text x="150" y="164" direction="rtl" textAnchor="start" className="l5-lab__svg-heading">{ratio.rightName}</text>
        <rect x="160" y="136" width={rightBarWidth} height="42" rx="8" className="l5-lab__ratio-bar l5-lab__ratio-bar--right" />
        <text x="160" y="207" direction="ltr" className="l5-lab__svg-count">{ratio.rightRatioMass} g</text>
      </ScientificDiagram>

      <div className="l5-lab__fields">
        <label className="field" htmlFor={`${id}-left`}>
          <span className="field__label">كتلة {ratio.leftName} المتاحة</span>
          <input id={`${id}-left`} className="field__input" type="number" inputMode="decimal" min="0" step="any" value={leftInput} onChange={(event) => setLeftInput(event.target.value)} />
        </label>
        <label className="field" htmlFor={`${id}-right`}>
          <span className="field__label">كتلة {ratio.rightName} المتاحة</span>
          <input id={`${id}-right`} className="field__input" type="number" inputMode="decimal" min="0" step="any" value={rightInput} onChange={(event) => setRightInput(event.target.value)} />
        </label>
        <label className="field" htmlFor={`${id}-unit`}>
          <span className="field__label">وحدة المدخلات</span>
          <select id={`${id}-unit`} className="field__input" value={unit} onChange={(event) => setUnit(event.target.value)}>
            <option value="g">g</option><option value="kg">kg</option>
          </select>
        </label>
      </div>

      {result ? (
        <div className="l5-lab__result">
          <h4>ناتج الحساب التناسبي</h4>
          <p role="status" aria-live="polite">
            يمكن أن يتكوّن حسابياً {formatModelMass(result.productMass)} {unit} من {ratio.productName} وفق النسبة المدخلة؛
            {' '}{result.leftExcess > 0
              ? `يبقى ${formatModelMass(result.leftExcess)} ${unit} من ${ratio.leftName} فائضاً.`
              : result.rightExcess > 0
                ? `يبقى ${formatModelMass(result.rightExcess)} ${unit} من ${ratio.rightName} فائضاً.`
                : 'لا يبقى فائض في هذا المثال الحسابي.'}
          </p>
          <ScientificTable
            caption="فصل الكمية المتاحة عن المتفاعلة والفائض — حساب من المنصة"
            columns={[
              { key: 'element', header: 'العنصر', rowHeader: true },
              { key: 'available', header: 'متاح' },
              { key: 'reacted', header: 'تفاعل حسابياً' },
              { key: 'excess', header: 'فائض' },
            ]}
            rows={modelRows}
            footnote={`فحص الكتلة في هذا النموذج: المتفاعل من ${ratio.leftName} + المتفاعل من ${ratio.rightName} = كتلة الناتج المحسوبة. الفائض يبقى منفصلاً ولا يدخل في نسبة تركيب ${ratio.productName}.`}
          />
        </div>
      ) : (
        <p className="l5-lab__status" role="status">أدخل كتلتين غير سالبتين لعرض الحساب التناسبي.</p>
      )}

      <p className="l5-lab__note">
        الحساب يطبق نسبة المصدر على القيم التي أدخلتها؛ المخرجات استنتاج رياضي لا قياس مخبري جديد ولا صورة أو قراءة ميزان. يضم قانون انحفاظ الكتلة الفائض أيضاً عند حساب النظام كله، بينما نسبة المركب تستخدم فقط الكتل التي تفاعلت.
      </p>
    </section>
  )
}
