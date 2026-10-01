import { BookGlyph, CheckGlyph, InfoGlyph } from '@/components/Icons'
import { PlatformAddition } from '@/scientific'

const PRINCIPLES = [
  {
    id: 'verbatim',
    icon: BookGlyph,
    title: 'الكتاب هو المصدر الوحيد',
    body: 'كل نص علمي أو تعريف أو قيمة أو وحدة أو سؤال يُنقل من الكتاب كما هو، دون تلخيص أو إعادة صياغة أو تغيير في الترتيب.',
  },
  {
    id: 'traceable',
    icon: CheckGlyph,
    title: 'كل عنصر مرتبط بصفحته',
    body: 'يحمل كل عنصر مرجعه إلى صفحة الكتاب ورقم السؤال أو النشاط، ويوجد تدقيق آلي يكشف أي عنصر فقد مرجعه أو وصفه.',
  },
  {
    id: 'honest',
    icon: InfoGlyph,
    title: 'لا يُنشر ما لم يُقرأ',
    body: 'إذا كانت صورة الصفحة غير واضحة، لا يُخمَّن الرقم أو الشكل أو السؤال؛ يُطلب توضيح أو يُحفظ المصدر كما هو.',
  },
] as const

/**
 * States the source-fidelity policy and shows the marking used to keep
 * textbook material and platform material visibly distinct.
 */
export function SourcePolicy() {
  return (
    <section className="section" aria-labelledby="policy-title">
      <div className="section-heading">
        <p className="eyebrow">دقّة المحتوى</p>
        <h2 id="policy-title">لا يُنسب إلى الكتاب إلا ما هو منه</h2>
        <p className="lead">
          تعرض المنصة مادة الكتاب داخل إطار يحمل رقم الصفحة، وتوسم كل إضافة تعليمية من صناعة المنصة
          بوسم واضح، فلا يختلط المحتوى الأصلي بالمحتوى المضاف.
        </p>
      </div>

      <div className="policy">
        <ul className="policy__list">
          {PRINCIPLES.map((principle) => (
            <li className="policy__item" key={principle.id}>
              <span className="policy__icon" aria-hidden="true">
                <principle.icon size={20} />
              </span>
              <div>
                <h3 className="policy__title">{principle.title}</h3>
                <p className="policy__body">{principle.body}</p>
              </div>
            </li>
          ))}
        </ul>

        <div className="policy__marking">
          <h3 className="policy__title">وسم المحتوى</h3>
          <p className="policy__body">هكذا يظهر الفرق بين مادة الكتاب وإضافة المنصة:</p>
          <ul className="policy__examples">
            <li>
              <span className="textbook-source__label">من الكتاب المدرسي</span>
              <span className="policy__example-note">
                نص الكتاب كما هو، مع رقم الصفحة ورقم السؤال.
              </span>
            </li>
            <li>
              <PlatformAddition />
              <span className="policy__example-note">
                شرح أو مثال أو محاكاة أو سؤال من إعداد المنصة.
              </span>
            </li>
          </ul>
          <p className="policy__footnote">
            لا يُعرض أي نص داخل إطار «من الكتاب المدرسي» قبل توفير صور الصفحات وقراءتها.
          </p>
        </div>
      </div>
    </section>
  )
}
