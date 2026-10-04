import { Link } from 'react-router-dom'
import { HeroFigure } from './home/HeroFigure'
import { SubjectDoors } from './home/SubjectDoors'
import { PlatformArchitecture } from './home/PlatformArchitecture'
import { ScientificShowcase } from './home/ScientificShowcase'
import { SourcePolicy } from './home/SourcePolicy'
import { TeacherEntryBand } from './home/TeacherEntryBand'
import { HourglassGlyph } from '@/components/Icons'
import { routes } from '@/app/navigation'
import { curriculumStats } from '@/data/curriculum/registry'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'

/** Chemistry course home: published content and shared learning tools only. */
export function CourseHome() {
  useDocumentTitle('الكيمياء التفاعلية — الصف الثامن | Interactive Chemistry Grade 8')
  const stats = curriculumStats()

  return (
    <>
      <section className="hero" aria-labelledby="hero-title">
        <div className="container hero__inner">
          <div className="hero__content">
            <p className="hero__eyebrow">
              <span>منصة تفاعلية تعليمية</span>
              <span className="hero__eyebrow-sep" aria-hidden="true" />
              <span>الصف الثامن</span>
            </p>

            <h1 className="hero__title" id="hero-title">
              <span className="hero__title-chemistry">الكيمياء</span>
            </h1>

            <p className="hero__lead">
              منصة تعليمية تفاعلية لكيمياء الصف الثامن. تعرض مادة الكتاب المدرسي كما هي، وتدعمها
              بشرح المنصة وتجارب ومحاكيات وأسئلة تفاعلية.
            </p>

            <dl className="hero__facts">
              <div className="hero__fact">
                <dt>المادة</dt>
                <dd>الكيمياء — الصف الثامن</dd>
              </div>
              <div className="hero__fact">
                <dt>المصدر</dt>
                <dd>الكتاب المدرسي الرسمي</dd>
              </div>
              <div className="hero__fact">
                <dt>العرض العلمي</dt>
                <dd>صيغ كيميائية وأيونية ونووية بعزل اتجاه دقيق</dd>
              </div>
            </dl>

            <div className="hero__actions">
              <Link className="button button--primary" to={routes.chemistry}>
                دخول مسار الكيمياء
              </Link>
            </div>

            <p className="hero__status">
              <HourglassGlyph size={16} />
              <span>
                الوحدات المنشورة حتى الآن: {stats.units} · الدروس: {stats.lessons} · الخطوات:{' '}
                {stats.steps} — لا تُنشر وحدة جديدة إلا بعد قراءة صفحات الكتاب المدرسي.
              </span>
            </p>
          </div>

          <div className="hero__visual">
            <HeroFigure />
          </div>
        </div>
      </section>

      <section className="section" aria-labelledby="chemistry-track-title">
        <div className="container">
          <div className="section-heading">
            <p className="eyebrow">مسار الكيمياء</p>
            <h2 id="chemistry-track-title">محتوى الكيمياء للصف الثامن</h2>
            <p className="lead">
              يعرض المسار الوحدات والدروس المنشورة من الكتاب فقط، ضمن نظام موحّد للتعلّم والتجارب
              والعرض العلمي.
            </p>
          </div>
          <SubjectDoors />
        </div>
      </section>

      <div className="container">
        <PlatformArchitecture />
        <ScientificShowcase />
        <SourcePolicy />
        <TeacherEntryBand />
      </div>
    </>
  )
}
