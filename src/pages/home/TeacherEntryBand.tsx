import { Link } from 'react-router-dom'
import { BookGlyph, ClipboardCheckGlyph, KeyGlyph, LockGlyph } from '@/components/Icons'
import { routes } from '@/app/navigation'

const AREAS = [
  { id: 'book', icon: BookGlyph, title: 'حلول أسئلة الكتاب', body: 'حلول الأسئلة والتمارين والأنشطة مع رقم الصفحة.' },
  { id: 'test', icon: ClipboardCheckGlyph, title: 'الاختبار النهائي', body: 'اختبار شامل لكل درس بعد اعتماد محتواه.' },
  { id: 'solutions', icon: KeyGlyph, title: 'حلول الاختبار النهائي', body: 'الإجابات المرجعية وخطوات الحل.' },
] as const

/** Single, clearly signposted entry point to the independent teacher area. */
export function TeacherEntryBand() {
  return (
    <section className="teacher-band" aria-labelledby="teacher-band-title">
      <div className="teacher-band__inner">
        <div className="teacher-band__intro">
          <p className="eyebrow">
            <LockGlyph size={15} />
            مساحة مستقلة
          </p>
          <h2 className="teacher-band__title" id="teacher-band-title">
            مساحة المعلم
          </h2>
          <p className="teacher-band__body">
            صفحة مستقلة خارج مسار الطالب، محميّة ببوابة وصول داخل التطبيق، وتضم ثلاثة أقسام فقط.
          </p>
          <Link className="button button--primary" to={routes.teacher}>
            الدخول إلى مساحة المعلم
          </Link>
          <p className="teacher-band__notice">
            بوابة الوصول تعمل داخل المتصفح فقط ولا تُعدّ حماية من جهة الخادم.
          </p>
        </div>

        <ul className="teacher-band__areas">
          {AREAS.map((area) => (
            <li className="teacher-band__area" key={area.id}>
              <span className="teacher-band__icon" aria-hidden="true">
                <area.icon size={20} />
              </span>
              <div>
                <h3 className="teacher-band__area-title">{area.title}</h3>
                <p className="teacher-band__area-body">{area.body}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
