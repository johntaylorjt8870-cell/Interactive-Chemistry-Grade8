import { ChemicalFormula, LewisMolecule, MathFormula, ScientificNotationText } from '@/scientific'
import type { InteractiveProps } from './registry'

/* ============================================================================
   شكل تعليمي: كيف نقرأ تمثيل لويس المطبوع في صفحة 15؟
   ----------------------------------------------------------------------------
   الشكل لا يعيد رسم الكتاب فحسب؛ يعلّم الطالب مهارة القراءة: ماذا تعني النقطة،
   وماذا يعني موقعها، وكيف يتحوّل عدد الأزواج إلى رتبة رابطة. كل بطاقة تحمل
   رقماً وملاحظة قابلة للتحقّق من الرسم نفسه.
   ========================================================================= */

type CardSpec = {
  id: 'h2' | 'o2' | 'n2'
  symbol: string
  sharedPairs: 1 | 2 | 3
  leftSides: Array<'top' | 'right' | 'bottom' | 'left'>
  rightSides: Array<'top' | 'right' | 'bottom' | 'left'>
  order: string
  sharedElectrons: number
  lonePairs: number
  target: number
  observe: string
}

const CARDS: CardSpec[] = [
  {
    id: 'h2',
    symbol: 'H',
    sharedPairs: 1,
    leftSides: [],
    rightSides: [],
    order: 'وحيدة',
    sharedElectrons: 2,
    lonePairs: 0,
    target: 2,
    observe:
      'لا توجد أي نقاط على أطراف الرمزين. كل إلكترون في الجزيء مشارَك، ولهذا لا يبقى زوج غير مشترك.',
  },
  {
    id: 'o2',
    symbol: 'O',
    sharedPairs: 2,
    leftSides: ['left', 'bottom'],
    rightSides: ['right', 'bottom'],
    order: 'مضاعفة',
    sharedElectrons: 4,
    lonePairs: 2,
    target: 8,
    observe:
      'بين الرمزين أربع نقاط مرتّبة صفّين: كل صف زوج مشترك. وحول كل رمز زوج على الجهة الخارجية وزوج أسفله.',
  },
  {
    id: 'n2',
    symbol: 'N',
    sharedPairs: 3,
    leftSides: ['left'],
    rightSides: ['right'],
    order: 'ثلاثية',
    sharedElectrons: 6,
    lonePairs: 1,
    target: 8,
    observe:
      'بين الرمزين ست نقاط في ثلاثة صفوف. وحول كل رمز زوج واحد فقط على الجهة الخارجية.',
  },
]

const LEGEND = [
  { marker: 'dot', label: 'النقطة الواحدة = إلكترون واحد.' },
  { marker: 'pair', label: 'النقطتان المتجاورتان = زوج إلكترونات.' },
  { marker: 'shared', label: 'النقاط بين الرمزين = إلكترونات مشتركة.' },
  { marker: 'lone', label: 'النقاط على الأطراف = أزواج غير مشتركة.' },
  { marker: 'order', label: 'عدد الأزواج بين الرمزين = رتبة الرابطة.' },
] as const

export default function Lesson2LewisAnatomyDiagram({ interactiveId }: InteractiveProps) {
  return (
    <figure className="l2-figure" data-diagram={interactiveId} data-interactive-id={interactiveId}>
      <header className="l2-figure__header">
        <p className="l2-figure__eyebrow">شكل توضيحي من إضافة المنصة · يشرح شكل صفحة 15</p>
        <h4 className="l2-figure__title">تمثيل لويس: خريطة قراءة لا مجرّد نقاط</h4>
        <p className="l2-figure__lead">
          التمثيل يكتب <strong>إلكترونات السطح فقط</strong>. قبل أن تعدّ، اعرف موضع كل نقطة؛
          فالمعنى كلّه في الموضع.
        </p>
      </header>

      <ul className="l2-lewis__legend" aria-label="مفتاح تمثيل لويس">
        {LEGEND.map((item) => (
          <li key={item.marker} data-marker={item.marker}>
            <span className={`l2-legend__marker l2-legend__marker--${item.marker}`} aria-hidden="true" />
            <span>{item.label}</span>
          </li>
        ))}
      </ul>

      <div className="l2-lewis__cards">
        {CARDS.map((card, index) => (
          <article className="l2-lewis__card" key={card.id} data-molecule={card.id}>
            <header className="l2-lewis__card-head">
              <span className="l2-observation-index" aria-hidden="true">
                {index + 1}
              </span>
              <h5>
                الجزيء <ChemicalFormula formula={`${card.symbol}2`} size="sm" />
              </h5>
            </header>

            <div className="l2-lewis__figure">
              <LewisMolecule
                left={{ symbol: card.symbol, lonePairSides: card.leftSides }}
                right={{ symbol: card.symbol, lonePairSides: card.rightSides }}
                sharedPairs={card.sharedPairs}
                showModel={false}
                size="sm"
                label={`تمثيل لويس لجزيء ${card.symbol}₂: ${card.sharedElectrons} إلكتروناً مشتركاً و${card.lonePairs} زوج غير مشترك حول كل ذرّة.`}
              />
            </div>

            <dl className="l2-lewis__facts">
              <div>
                <dt>الإلكترونات المشتركة</dt>
                <dd>{card.sharedElectrons}</dd>
              </div>
              <div>
                <dt>الأزواج غير المشتركة لكل ذرّة</dt>
                <dd>{card.lonePairs}</dd>
              </div>
              <div>
                <dt>رتبة الرابطة</dt>
                <dd>{card.order}</dd>
              </div>
              <div>
                <dt>التحقّق: سطح كل ذرّة</dt>
                <dd>
                  <MathFormula
                    tex={`${card.sharedElectrons} + ${card.lonePairs * 2} = ${card.target}`}
                    label={`${card.sharedElectrons} إلكترونات مشتركة زائد ${card.lonePairs * 2} إلكترونات غير مشتركة يساوي ${card.target}`}
                  />
                </dd>
              </div>
            </dl>

            <p className="l2-lewis__observe">
              <strong>ماذا تلاحظ؟</strong> {card.observe}
            </p>
          </article>
        ))}
      </div>

      <figcaption className="l2-figure__caption">
        <p>
          <strong>لماذا هذا الرسم دليل؟</strong> لأن الأعداد في البطاقة تُقرأ من الشكل نفسه ولا
          تحتاج حفظاً: عدّ النقاط بين الرمزين، ثم عدّ الأزواج على الأطراف، ثم تحقّق من العلاقة
          <MathFormula tex="E_{\text{shared}} + 2 \times P_{\text{lone}} = E_{\text{surface}}" label="الإلكترونات المشتركة زائد إلكترونا كل زوج غير مشترك يساوي إلكترونات سطح الذرة" />.
          الهيدروجين وحده هدفه 2، لأن سويتَه الأولى تتّسع لإلكترونين.
        </p>
        <p>
          <strong>قاعدة التحويل إلى صيغة:</strong>{' '}
          <ScientificNotationText>
            عدد الأزواج المشتركة هو ما يحدّد كيف نكتب الرابطة (خط واحد أو خطان أو ثلاثة خطوط). أمّا الصيغة نفسها فتُكتب بعدد الذرّات، لا بعدد الخطوط؛ ولهذا يبقى كلٌّ من H₂ وO₂ وN₂ مكتوباً برمزين مهما اختلفت رتبة الرابطة.
          </ScientificNotationText>
        </p>
      </figcaption>
    </figure>
  )
}
