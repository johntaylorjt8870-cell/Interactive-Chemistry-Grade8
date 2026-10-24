import { ChemicalFormula } from '@/scientific'
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
        <p className="l2-figure__eyebrow">شكل توضيحي من إضافة المنصة · يحوّل العدّ إلى صيغة</p>
        <h4 className="l2-figure__title">من إلكترونات السطح إلى الصيغة: سلسلة واحدة تتكرّر</h4>
        <p className="l2-figure__lead">
          كل زوج مشترك يوفّر إلكترونين. فإذا عرفتَ كم ينقص سطح الذرّة، عرفتَ عدد الأزواج، وعرفت
          رتبة الرابطة. الصيغة لا تُحفظ؛ هي نتيجة هذه السلسلة.
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
                {row.target} − {row.surface} = {row.missing}
              </strong>
            </span>
            <span className="l2-chain__cell l2-chain__cell--result" role="cell">
              <small>الأزواج المشتركة</small>
              <strong>
                {row.missing} إلكتروناً من كل ذرّة = {row.pairs}
              </strong>
              <em className="l2-chain__aside" dir="ltr">
                {row.pairs} × 2 = {row.pairs * 2}
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
          <strong>اقرأ السلسلة بالاتجاه نفسه في كل صف:</strong> السطح يتحدّد من التوزيع، والناقص
          يتحدّد من سعة السوية الأخيرة، ثم تساهم كل ذرّة بعدد الإلكترونات الناقصة نفسها. وكل
          إلكترون تساهم به يجد إلكتروناً مقابلًا من الذرّة الأخرى، فيتكوّن زوج مشترك. لذلك يساوي
          عددُ الأزواج عددَ الإلكترونات الناقصة، ويكون مجموع الإلكترونات المشتركة ضعف هذا العدد:
          2 في H₂، و4 في O₂، و6 في N₂.
        </p>
        <p>
          <strong>لماذا الهيدروجين مختلف؟</strong> لأن سويتَه الأولى تتّسع لإلكترونين فقط، فهدفه
          2 لا 8. ولهذا يكون الناقص عنده 2 − 1 = 1، لا 8 − 1 = 7. لو استخدمت 8 لكل الذرّات
          لحصلت على سبعة أزواج مشتركة في H₂، وهذا مستحيل: كل ذرّة تملك إلكتروناً واحداً فقط.
        </p>
      </figcaption>
    </figure>
  )
}
