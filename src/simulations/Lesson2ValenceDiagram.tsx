import { BohrAtom } from '@/scientific'
import type { InteractiveProps } from './registry'

/* ============================================================================
   إعادة بناء تعليمية لصفحة 13–16: قراءة الذرّة وعدّ إلكترونات السطح
   ----------------------------------------------------------------------------
   الشكل يجيب عن سؤال واحد: «ما الذي يحدّد ميل الذرّة: عدد إلكتروناتها كلها أم
   إلكترونات سطحها؟». لذلك يُعرض لكل ذرّة توزيعها كما في الكتاب، ويُبرز السطح
   وحده، ثم يُكتب العدد والميل تحته مباشرة. الألوان ليست الوسيلة الوحيدة:
   النواة دائرة مملوءة، والإلكترون الداخلي نقطة صغيرة، وإلكترون السطح نقطة
   أكبر بحلقة — وكلها موسومة نصّياً في المفتاح.
   ========================================================================= */

type AtomSpec = {
  symbol: string
  shells: number[]
  /** سطح الذرّة = إلكترونات السوية الأخيرة. */
  surface: number
  /** ما تفعله الذرّة عادةً في هذا المستوى. */
  tendency: string
  /** العنصر مذكور في صفحات الدرس: صفحة الذكر. */
  printedOn: string
}

const ATOMS: AtomSpec[] = [
  { symbol: 'Na', shells: [2, 8, 1], surface: 1, tendency: 'تفقد إلكتروناً واحداً', printedOn: '14' },
  { symbol: 'Mg', shells: [2, 8, 2], surface: 2, tendency: 'تفقد إلكترونين', printedOn: '17' },
  { symbol: 'H', shells: [1], surface: 1, tendency: 'تشارك بإلكترونها الوحيد', printedOn: '15' },
  { symbol: 'O', shells: [2, 6], surface: 6, tendency: 'تكتسب إلكترونين', printedOn: '15' },
  { symbol: 'Cl', shells: [2, 8, 7], surface: 7, tendency: 'تكتسب إلكتروناً واحداً', printedOn: '14' },
]

export default function Lesson2ValenceDiagram({ interactiveId }: InteractiveProps) {
  return (
    <figure className="l2-figure" data-diagram={interactiveId} data-interactive-id={interactiveId}>
      <header className="l2-figure__header">
        <p className="l2-figure__eyebrow">شكل توضيحي من إضافة المنصة · يعتمد على توزيعات الكتاب</p>
        <h4 className="l2-figure__title">ما الذي يحدّد ميل الذرّة إلى الارتباط؟</h4>
        <p className="l2-figure__lead">
          أمامك خمس ذرّات من صفحات الدرس، مرسومة كما يرسمها الكتاب: نواة في المركز وسويات
          إلكترونية حولها. النقطة المميّزة هي <strong>إلكترون السطح</strong>، وهو وحده الذي
          يدخل في الرابطة.
        </p>
      </header>

      <div className="l2-valence__grid" dir="rtl">
        {ATOMS.map((atom) => (
          <article className="l2-valence__card" key={atom.symbol} data-atom={atom.symbol} data-surface={atom.surface}>
            <BohrAtom symbol={atom.symbol} shells={atom.shells} highlightValence size={112} />
            <dl className="l2-valence__facts">
              <div>
                <dt>إلكترونات السطح</dt>
                <dd>
                  <strong>{atom.surface}</strong>
                </dd>
              </div>
              <div>
                <dt>الميل</dt>
                <dd>{atom.tendency}</dd>
              </div>
              <div>
                <dt>التوزيع</dt>
                <dd dir="ltr">{atom.shells.join('-')}</dd>
              </div>
            </dl>
            <p className="l2-valence__source">وردت في الصفحة {atom.printedOn}</p>
          </article>
        ))}
      </div>

      <ul className="l2-figure__legend" aria-label="مفتاح الرسم">
        <li>
          <span className="l2-legend__nucleus" aria-hidden="true" />
          <span>
            <strong>النواة:</strong> البروتونات والنيوترونات. لا تنتقل في أي رابطة كيميائية.
          </span>
        </li>
        <li>
          <span className="l2-legend__inner" aria-hidden="true" />
          <span>
            <strong>إلكترون داخلي:</strong> في سوية مكتملة، لا يشارك في الرابطة ولا في العدّ.
          </span>
        </li>
        <li>
          <span className="l2-legend__valence" aria-hidden="true" />
          <span>
            <strong>إلكترون سطح:</strong> في السوية الأخيرة، وهو وحده الذي يُحسب عند قراءة الميل.
          </span>
        </li>
      </ul>

      <figcaption className="l2-figure__caption">
        <p>
          <strong>سؤال الرسم:</strong> الصوديوم والهيدروجين لهما العدد نفسه من إلكترونات السطح
          (إلكترون واحد)، فهل يميلان إلى الشيء نفسه؟ الجواب: لا. الصوديوم سطحه فوق سوية مكتملة
          (2-8-1) فيميل إلى الفقد، والهيدروجين سويتُه الأولى تتّسع لإلكترونين فقط فيميل إلى
          المشاركة. العدد وحده لا يكفي؛ موقع السوية وسعتها هما ما يفسّر الفرق.
        </p>
        <p>
          <strong>لماذا هذا الرسم دليل؟</strong> لأنك تستطيع أن تعدّ بنفسك: النقاط في السوية
          الأخيرة هي بالضبط «إلكترونات السطح» المطبوعة في خانة كل ذرّة. لو حاولت عدّ
          الإلكترونات كلها لفسّرتَ الميل خطأً: الكلور يملك 17 إلكتروناً والصوديوم 11، ومع ذلك
          يتصرّف كلٌّ منهما بحسب سطحه فقط.
        </p>
      </figcaption>
    </figure>
  )
}
