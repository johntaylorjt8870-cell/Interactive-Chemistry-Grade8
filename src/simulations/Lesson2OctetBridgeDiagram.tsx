import { ChemicalFormula, MathFormula, ScientificNotationText } from '@/scientific'
import type { InteractiveProps } from './registry'

/* ============================================================================
   شكل تعليمي: من عدّ إلكترونات السطح إلى كتابة الصيغة
   ----------------------------------------------------------------------------
   يعالج سؤالاً يتكرّر في الصفحات 15–16: لماذا يختلف عدد الأزواج من جزيء إلى آخر،
   وكيف يتحوّل ذلك إلى رتبة رابطة ثم إلى صيغة مكتوبة؟ كل صف سلسلة من خمس خطوات،
   وكل خطوة تُقرأ من التي قبلها لا تُحفظ.
   ========================================================================= */

type ChainRow = {
  id: 'h2' | 'o2' | 'n2'
  atom: string
  config: string
  surface: number
  missing: number
  pairs: number
  order: string
  formula: string
  target: number
}

const ROWS: ChainRow[] = [
  { id: 'h2', atom: 'H', config: '1', surface: 1, missing: 1, pairs: 1, order: 'وحيدة', formula: 'H2', target: 2 },
  { id: 'o2', atom: 'O', config: '2-6', surface: 6, missing: 2, pairs: 2, order: 'مضاعفة', formula: 'O2', target: 8 },
  { id: 'n2', atom: 'N', config: '2-5', surface: 5, missing: 3, pairs: 3, order: 'ثلاثية', formula: 'N2', target: 8 },
]

const COLUMNS = [
  'سطح الذرّة',
  'الناقص للاكتمال',
  'الأزواج المشتركة',
  'رتبة الرابطة',
  'الصيغة',
] as const

export default function Lesson2OctetBridgeDiagram({ interactiveId }: InteractiveProps) {
  return (
    <figure className="l2-figure" data-diagram={interactiveId} data-interactive-id={interactiveId}>
      <header className="l2-figure__header">
        <p className="l2-figure__eyebrow">شكل توضيحي من إضافة المنصة · قراءة جزيئات الصفحة 15 ثنائية الذرّة المتماثلة</p>
        <h4 className="l2-figure__title">
          <ScientificNotationText>من إلكترونات السطح إلى تمثيل لويس فالصيغة في H₂ وO₂ وN₂</ScientificNotationText>
        </h4>
        <p className="l2-figure__lead">
          في الجزيئات ثنائية الذرّة المتماثلة المرسومة في الصفحة 15، تتساوى الذرّتان في النقص، فتساهم كل
          ذرّة بعدد الإلكترونات الناقصة نفسها ليتكوّن بينهما زوج مشترك أو زوجان أو ثلاثة أزواج.
        </p>
      </header>

      <div className="l2-chain" role="table" aria-label="سلسلة الاستنتاج من إلكترونات السطح إلى الصيغة">
        <div className="l2-chain__head" role="row">
          <span className="l2-chain__atom-head" role="columnheader">
            الذرّة
          </span>
          {COLUMNS.map((column) => (
            <span className="l2-chain__column" role="columnheader" key={column}>
              {column}
            </span>
          ))}
        </div>

        {ROWS.map((row) => (
          <div className="l2-chain__row" role="row" key={row.id} data-molecule={row.id} data-pairs={row.pairs}>
            <span className="l2-chain__atom" role="rowheader" dir="ltr">
              {row.atom}
              <small dir="ltr">{row.config}</small>
            </span>
            <span className="l2-chain__cell" role="cell">
              <small>سطح الذرّة</small>
              <strong>{row.surface}</strong>
            </span>
            <span className="l2-chain__cell" role="cell">
              <small>الناقص للاكتمال</small>
              <strong>
                <MathFormula tex={`${row.target} - ${row.surface} = ${row.missing}`} label={`${row.target} ناقص ${row.surface} يساوي ${row.missing}`} />
              </strong>
            </span>
            <span className="l2-chain__cell l2-chain__cell--result" role="cell">
              <small>الأزواج المشتركة</small>
              <strong>{row.pairs}</strong>
              <em className="l2-chain__aside">
                <MathFormula
                  tex={`${row.pairs} \\times 2 = ${row.pairs * 2}\\text{ e}^-`}
                  label={`${row.pairs} أزواج، إلكترونان في كل زوج يساوي ${row.pairs * 2} إلكترونات مشتركة`}
                />
              </em>
            </span>
            <span className="l2-chain__cell l2-chain__cell--result" role="cell">
              <small>رتبة الرابطة</small>
              <strong>{row.order}</strong>
            </span>
            <span className="l2-chain__cell l2-chain__cell--formula" role="cell">
              <small>الصيغة</small>
              <ChemicalFormula formula={row.formula} size="md" />
            </span>
          </div>
        ))}
      </div>

      <ul className="l2-figure__legend" aria-label="مفتاح السلسلة">
        <li>
          <span className="l2-legend__marker l2-legend__marker--order" aria-hidden="true" />
          <span>
            <strong>الخلايا الفاتحة:</strong> معطيات تُقرأ من التوزيع (سطح الذرّة، وما ينقصها).
          </span>
        </li>
        <li>
          <span className="l2-legend__marker l2-legend__marker--shared" aria-hidden="true" />
          <span>
            <strong>الخلايا الملوّنة:</strong> نتائج محسوبة (الأزواج، رتبة الرابطة، الصيغة) — لا تُحفظ، بل تُشتق.
          </span>
        </li>
      </ul>

      <figcaption className="l2-figure__caption">
        <p>
          <strong>اقرأ السلسلة بالاتجاه نفسه في كل صف:</strong>{' '}
          <ScientificNotationText>
            في الجزيئات المتماثلة (H₂ وO₂ وN₂) يتحدّد السطح من التوزيع، ويتحدّد الناقص من سعة السوية الأخيرة، ثم تقدّم كل ذرّة إلكتروناتها الناقصة فتلتقي بإلكترونات الذرّة المماثلة، فيتكوّن زوج مشترك مقابل كل إلكترون ناقص، ويكون مجموع الإلكترونات المشتركة ضعف عدد الأزواج: 2 في H₂، و4 في O₂، و6 في N₂.
          </ScientificNotationText>
        </p>
        <p>
          <strong>نطاق هذا الجدول وحدود قاعدته:</strong> الهيدروجين هدفه 2 لا 8 لأن سويته الأولى تتّسع لإلكترونين فقط، لذا يكون الناقص <MathFormula tex="2 - 1 = 1" /> لا <MathFormula tex="8 - 1 = 7" />. كما أن مطابقة «عدد الأزواج بين الذرّتين = ما ينقص الذرّة الواحدة» تخصّ <strong>ذرّتين متماثلتين ترتبطان معاً</strong>؛ أمّا في الجزيئات متعدّدة الذرّات غير المتماثلة (مثل <ChemicalFormula formula="H2O" size="sm" /> أو <ChemicalFormula formula="CH4" size="sm" />) فنرسم تمثيل لويس ونتحقّق من اكتمال سطح كل ذرّة على حدة بدلاً من تطبيق معادلة آلية.
        </p>
      </figcaption>
    </figure>
  )
}
