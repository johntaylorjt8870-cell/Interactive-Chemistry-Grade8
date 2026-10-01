const LAYERS = [
  {
    id: 'course-home',
    title: 'الصفحة الرئيسية للمسار',
    latin: 'CourseHome',
    body: 'نقطة الدخول: المسارَان، حالة الكتاب، ومساحة المعلم.',
  },
  {
    id: 'subject',
    title: 'المادة',
    latin: 'Subject',
    body: 'الفيزياء أو الكيمياء: هوية بصرية مستقلة داخل نظام تصميم واحد.',
  },
  {
    id: 'unit',
    title: 'الوحدة',
    latin: 'Unit',
    body: 'تُنشأ الوحدة بعد قراءة صفحاتها من الكتاب، بعنوانها كما هو مطبوع.',
  },
  {
    id: 'lesson',
    title: 'الدرس',
    latin: 'Lesson',
    body: 'محتوى الدرس يُبنى من صفحات الكتاب بترتيبها ودون حذف.',
  },
  {
    id: 'lesson-shell',
    title: 'إطار الدرس',
    latin: 'LessonShell',
    body: 'مخطط دائم للخطوات على الشاشات الكبيرة، وقائمة مدمجة على الهاتف.',
  },
  {
    id: 'lesson-flow',
    title: 'تدفق الدرس',
    latin: 'LessonFlow',
    body: 'خطوة واحدة في كل مرة، مع تقدّم حقيقي وتنقّل واضح.',
  },
  {
    id: 'lesson-step',
    title: 'الخطوة',
    latin: 'LessonStep',
    body: 'وحدة عمل ذات معنى: مصدر، شرح، تجربة، محاكاة، سؤال، خلاصة، اختبار.',
  },
] as const

/**
 * Explains how the platform is put together. This is real structural
 * information about the application — it never lists units, lessons or
 * curriculum content, because none has been supplied yet.
 */
export function PlatformArchitecture() {
  return (
    <section className="section" aria-labelledby="architecture-title">
      <div className="section-heading">
        <p className="eyebrow">بنية المنصة</p>
        <h2 id="architecture-title">مسار واحد واضح من المادة إلى الخطوة</h2>
        <p className="lead">
          كل مستوى في المنصة له مسؤولية واحدة، ويُقرأ المحتوى من ملفات بيانات منفصلة عن الواجهة —
          لذلك يمكن التحقق من مطابقة كل عنصر لصفحته في الكتاب.
        </p>
      </div>

      <ol className="architecture">
        {LAYERS.map((layer, index) => (
          <li className="architecture__item" key={layer.id}>
            <span className="architecture__index" aria-hidden="true">
              {String(index + 1).padStart(2, '0')}
            </span>
            <div className="architecture__content">
              <p className="architecture__latin" dir="ltr">
                {layer.latin}
              </p>
              <h3 className="architecture__title">{layer.title}</h3>
              <p className="architecture__body">{layer.body}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  )
}
