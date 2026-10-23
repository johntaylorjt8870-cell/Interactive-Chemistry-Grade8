import { useId, useState } from 'react'
import { ChemicalEquation, ScientificDiagram, ScientificNotationText } from '@/scientific'
import type { InteractiveProps } from './registry'
import {
  ACETIC_ACID_ELEMENTS,
  ACETIC_ACID_PRODUCT_COUNTS,
  ACETIC_ACID_REACTION,
  ACETIC_ACID_REACTANT_COUNTS,
} from './lesson5Models'
import './lesson5-labs.css'

type Side = 'reactants' | 'products'

export default function AtomCountLab({ reducedMotion }: InteractiveProps) {
  const id = useId()
  const [element, setElement] = useState<(typeof ACETIC_ACID_ELEMENTS)[number]>('C')
  const [side, setSide] = useState<Side>('reactants')
  const [answer, setAnswer] = useState('')
  const [checked, setChecked] = useState(false)
  const correctCount = (side === 'reactants' ? ACETIC_ACID_REACTANT_COUNTS : ACETIC_ACID_PRODUCT_COUNTS)[element] ?? 0
  const balanced = ACETIC_ACID_ELEMENTS.every(
    (symbol) => ACETIC_ACID_REACTANT_COUNTS[symbol] === ACETIC_ACID_PRODUCT_COUNTS[symbol],
  )
  const isCorrect = Number(answer) === correctCount && answer.trim() !== ''

  return (
    <section
      className={`lab l5-lab ${reducedMotion ? 'l5-lab--still' : ''}`}
      data-lab="atom-count"
      aria-labelledby={`${id}-title`}
    >
      <header className="l5-lab__header">
        <div>
          <p className="l5-lab__phase">إضافة من المنصة · العد محسوب من الصيغ المعروضة</p>
          <h3 id={`${id}-title`}>مختبر عدّ الذرات: قبل التفاعل وبعده</h3>
        </div>
      </header>

      <div className="l5-lab__equation" dir="ltr" aria-label="معادلة تمثيلية للتفاعل">
        <ChemicalEquation reactants={[...ACETIC_ACID_REACTION.reactants]} products={[...ACETIC_ACID_REACTION.products]} />
      </div>
      <p className="l5-lab__note l5-lab__equation-hint">على الشاشات الصغيرة، مرّر المعادلة أفقياً لعرض طرفيها كاملين.</p>
      <ScientificDiagram
        title="مخطط عدّ الذرات حسب العنصر"
        description={`رسم تعليمي من المنصة لأعداد الذرات المحسوبة من الصيغ. المتفاعلات: C ${ACETIC_ACID_REACTANT_COUNTS.C}, H ${ACETIC_ACID_REACTANT_COUNTS.H}, O ${ACETIC_ACID_REACTANT_COUNTS.O}, Na ${ACETIC_ACID_REACTANT_COUNTS.Na}. النواتج: C ${ACETIC_ACID_PRODUCT_COUNTS.C}, H ${ACETIC_ACID_PRODUCT_COUNTS.H}, O ${ACETIC_ACID_PRODUCT_COUNTS.O}, Na ${ACETIC_ACID_PRODUCT_COUNTS.Na}. الدوائر رموز للعد وليست رسماً للبنية أو الحجم.`}
        sourceRef="إعادة رسم تعليمية من المنصة — ليست صورة الكتاب الأصلية"
        viewBox="0 0 760 340"
        caption="كل دائرة تمثل ذرة واحدة في عملية العد؛ لا تمثل أحجام الذرات أو ترتيب الروابط. أعداد الصفين محسوبة آلياً من الصيغ، لا من شكل جزيئي مفترض."
      >
        <text x="214" y="36" textAnchor="middle" className="l5-lab__svg-heading">المتفاعلات</text>
        <text x="540" y="36" textAnchor="middle" className="l5-lab__svg-heading">النواتج</text>
        {ACETIC_ACID_ELEMENTS.map((symbol, row) => {
          const y = 80 + row * 62
          const leftCount = ACETIC_ACID_REACTANT_COUNTS[symbol] ?? 0
          const rightCount = ACETIC_ACID_PRODUCT_COUNTS[symbol] ?? 0
          return (
            <g key={symbol} className={element === symbol ? 'l5-lab__atom-row l5-lab__atom-row--selected' : 'l5-lab__atom-row'}>
              <text x="46" y={y + 5} className="l5-lab__svg-symbol" direction="ltr">{symbol}</text>
              {Array.from({ length: leftCount }, (_, index) => (
                <g key={`left-${index}`} className={`l5-lab__atom l5-lab__atom--${symbol.toLowerCase()}`}>
                  <circle cx={126 + index * 29} cy={y} r="12" />
                  <text x={126 + index * 29} y={y + 4} textAnchor="middle" className="l5-lab__atom-symbol" direction="ltr">{symbol}</text>
                </g>
              ))}
              <text x="293" y={y + 5} className="l5-lab__svg-count" direction="ltr">{leftCount}</text>
              {Array.from({ length: rightCount }, (_, index) => (
                <g key={`right-${index}`} className={`l5-lab__atom l5-lab__atom--${symbol.toLowerCase()}`}>
                  <circle cx={450 + index * 29} cy={y} r="12" />
                  <text x={450 + index * 29} y={y + 4} textAnchor="middle" className="l5-lab__atom-symbol" direction="ltr">{symbol}</text>
                </g>
              ))}
              <text x="618" y={y + 5} className="l5-lab__svg-count" direction="ltr">{rightCount}</text>
            </g>
          )
        })}
      </ScientificDiagram>

      <fieldset className="l5-lab__fieldset">
        <legend>جرّب عدّ عنصر واحد بنفسك</legend>
        <div className="l5-lab__choices" role="group" aria-label="اختر العنصر المراد عده">
          {ACETIC_ACID_ELEMENTS.map((symbol) => (
            <button
              key={symbol}
              type="button"
              className="button button--quiet"
              aria-pressed={element === symbol}
              onClick={() => { setElement(symbol); setAnswer(''); setChecked(false) }}
            >
              <span dir="ltr">{symbol}</span>
            </button>
          ))}
        </div>
        <div className="l5-lab__choices" role="group" aria-label="اختر طرف التفاعل">
          <button type="button" className="button button--quiet" aria-pressed={side === 'reactants'} onClick={() => { setSide('reactants'); setAnswer(''); setChecked(false) }}>المتفاعلات</button>
          <button type="button" className="button button--quiet" aria-pressed={side === 'products'} onClick={() => { setSide('products'); setAnswer(''); setChecked(false) }}>النواتج</button>
        </div>
        <div className="l5-lab__answer-row">
          <label className="field" htmlFor={`${id}-count`}>
            <span className="field__label">كم ذرة {element} في {side === 'reactants' ? 'المتفاعلات' : 'النواتج'}؟</span>
            <input
              id={`${id}-count`}
              className="field__input"
              type="number"
              inputMode="numeric"
              min="0"
              step="1"
              value={answer}
              onChange={(event) => { setAnswer(event.target.value); setChecked(false) }}
              aria-describedby={`${id}-count-help`}
            />
          </label>
          <button type="button" className="button button--primary" disabled={answer.trim() === ''} onClick={() => setChecked(true)}>تحقق من العد</button>
          <button type="button" className="button button--quiet" onClick={() => { setElement('C'); setSide('reactants'); setAnswer(''); setChecked(false) }}>إعادة تعيين المختبر</button>
        </div>
        <p id={`${id}-count-help`} className="l5-lab__note">فكّ الصيغة إلى رموز عناصرها، واجمع أعداد العنصر المختار في جميع المواد على الطرف نفسه.</p>
      </fieldset>

      <p className="l5-lab__status" role="status" aria-live="polite">
        {!checked
          ? 'اختر عنصراً وطرفاً، ثم أدخل عدد الذرات الذي حسبته.'
          : isCorrect
            ? `إجابة صحيحة: ${element} موجود بعدد ${correctCount} في ${side === 'reactants' ? 'المتفاعلات' : 'النواتج'}.`
            : `ليس بعد؛ عدّ ${element} في كل صيغة على حدة، ثم اجمعه في ${side === 'reactants' ? 'المتفاعلات' : 'النواتج'}.`}
      </p>
      <p className="l5-lab__note">
        {balanced
          ? 'في هذا المثال يساوي عدد ذرات كل عنصر على الجانبين، مع أن جزيئات المواد قد تغيرت.'
          : 'راجع أعداد كل عنصر على جانبي التفاعل.'}
        {' '}هذا مخطط عدّ تعليمي من المنصة، وليس صورة أو إعادة بناء لجزيئات الكتاب الأصلية.
      </p>
      <ScientificNotationText as="span" className="visually-hidden">قيمة الإجابة لا تظهر حتى تضغط زر التحقق.</ScientificNotationText>
    </section>
  )
}
