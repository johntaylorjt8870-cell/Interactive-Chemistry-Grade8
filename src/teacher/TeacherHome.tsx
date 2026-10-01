import { Link } from 'react-router-dom'
import { BookGlyph, ClipboardCheckGlyph, KeyGlyph, LockGlyph } from '@/components/Icons'
import { routes } from '@/app/navigation'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { curriculumStats } from '@/data/curriculum/registry'
import { useTeacherAccess } from './teacherAccess'

const SECTIONS = [
  {
    id: 'book-solutions',
    to: routes.teacherBookSolutions,
    icon: BookGlyph,
    title: 'حلول أسئلة الكتاب',
    body: 'حلول مفصّلة لأسئلة الكتاب وتمارينه وأنشطته، مع رقم الصفحة ورقم السؤال.',
  },
  {
    id: 'final-test',
    to: routes.teacherFinalTest,
    icon: ClipboardCheckGlyph,
    title: 'الاختبار النهائي الشامل',
    body: 'اختبار شامل لكل درس، من 10 إلى 20 سؤالاً جديداً، بعد اعتماد محتوى الدرس.',
  },
  {
    id: 'final-test-solutions',
    to: routes.teacherFinalTestSolutions,
    icon: KeyGlyph,
    title: 'حلول الاختبار النهائي',
    body: 'الإجابات المرجعية وخطوات الحل لكل سؤال في الاختبار النهائي.',
  },
] as const

/** Teacher area landing page — three sections only, no admin dashboard. */
export function TeacherHome() {
  useDocumentTitle('مساحة المعلم — منصة الفيزياء والكيمياء')
  const { lock } = useTeacherAccess()
  const stats = curriculumStats()

  return (
    <div className="container teacher-home">
      <header className="teacher-home__header">
        <div>
          <p className="eyebrow">
            <LockGlyph size={15} />
            مساحة المعلم
          </p>
          <h1 className="teacher-home__title">أدوات المعلم</h1>
          <p className="teacher-home__lead">
            ثلاثة أقسام فقط: حلول أسئلة الكتاب، الاختبار النهائي الشامل، وحلول الاختبار النهائي.
          </p>
        </div>
        <button type="button" className="button button--quiet" onClick={lock}>
          إغلاق الجلسة
        </button>
      </header>

      <ul className="teacher-sections">
        {SECTIONS.map((section) => (
          <li className="teacher-section" key={section.id}>
            <Link className="teacher-section__link" to={section.to}>
              <span className="teacher-section__icon" aria-hidden="true">
                <section.icon size={22} />
              </span>
              <span className="teacher-section__body">
                <span className="teacher-section__title">{section.title}</span>
                <span className="teacher-section__text">{section.body}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>

      <section className="panel panel--quiet" aria-labelledby="teacher-status">
        <h2 className="panel__title" id="teacher-status">
          حالة المحتوى
        </h2>
        <p className="panel__body">
          الوحدات المنشورة: {stats.units} · الدروس: {stats.lessons} · الخطوات: {stats.steps}.
        </p>
        <p className="panel__body">
          تبدأ حلول الكتاب والاختبارات بعد توفير صور صفحات الكتاب المدرسي وقراءتها واعتماد محتوى
          الدروس. هذه الصفحة لا تعرض بيانات طلاب ولا إحصاءات مُصطنعة.
        </p>
      </section>
    </div>
  )
}
