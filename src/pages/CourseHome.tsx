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

/**
 * CourseHome — the entrance to the platform.
 *
 * It communicates the current curriculum totals and the source policy for both
 * subject tracks. Only verified units, lessons, topics, and statistics appear;
 * unpublished future content is never invented to make the page look fuller.
 */
export function CourseHome() {
  useDocumentTitle('منصة الفيزياء والكيمياء — الصف الثامن')
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
              <span className="hero__title-physics">الفيزياء</span>
              <span className="hero__title-plus" aria-hidden="true">
                +
              </span>
              <span className="hero__title-chemistry">الكيمياء</span>
            </h1>

            <p className="hero__lead">
              منصة واحدة تُبنى على كتاب الصف الثامن المدرسي الجامع للمادتين. يُعرض محتوى الكتاب كما
              هو، مدعوماً بشرح عميق وتجارب ومحاكيات وأسئلة تفاعلية.
            </p>

            <dl className="hero__facts">
              <div className="hero__fact">
                <dt>الكتاب</dt>
                <dd>كتاب واحد يجمع الفيزياء والكيمياء</dd>
              </div>
              <div className="hero__fact">
                <dt>المسارات</dt>
                <dd>مسارَان مستقلان: فيزياء وكيمياء</dd>
              </div>
              <div className="hero__fact">
                <dt>العرض العلمي</dt>
                <dd>معادلات وصيغ كيميائية وترميز نووي بعزل اتجاه دقيق</dd>
              </div>
            </dl>

            <div className="hero__actions">
              <Link className="button button--primary" to={routes.physics}>
                مسار الفيزياء
              </Link>
              <Link className="button button--secondary" to={routes.chemistry}>
                مسار الكيمياء
              </Link>
            </div>

            <p className="hero__status">
              <HourglassGlyph size={16} />
              <span>
                الوحدات المنشورة حتى الآن: {stats.units} · الدروس: {stats.lessons} · الخطوات:{' '}
                {stats.steps} — الوحدات الجديدة لا تُنشر إلا بعد قراءة صفحات الكتاب المدرسي.
              </span>
            </p>
          </div>

          <div className="hero__visual">
            <HeroFigure />
          </div>
        </div>
      </section>

      <section className="section" aria-labelledby="tracks-title">
        <div className="container">
          <div className="section-heading">
            <p className="eyebrow">المسارَان</p>
            <h2 id="tracks-title">مادتان، منصة واحدة</h2>
            <p className="lead">
              لكل مادة هوية بصرية خاصة بها، مع نظام تصميم واحد: الخطوط والمسافات والتنقّل وأنماط
              التفاعل متطابقة، فلا يشعر الطالب بأنه انتقل إلى موقع آخر.
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
