import { Link, useParams } from 'react-router-dom'
import { EmptyState } from '@/components/EmptyState'
import { BookGlyph, ChemistryGlyph, PhysicsGlyph } from '@/components/Icons'
import { routes, SUBJECT_LABELS } from '@/app/navigation'
import { getSubjectDefinition } from '@/data/curriculum/registry'
import { contentStatusLabel } from '@/data/source'
import { isSubjectId, type SubjectId } from '@/data/curriculum/schema'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { NotFound } from './NotFound'

const GLYPHS = {
  physics: PhysicsGlyph,
  chemistry: ChemistryGlyph,
} as const

export function SubjectHome() {
  const { subject: subjectParam } = useParams<{ subject: string }>()
  const subjectId = subjectParam ?? ''

  if (!isSubjectId(subjectId)) {
    return <NotFound />
  }

  return <SubjectHomeView subject={subjectId} />
}

function SubjectHomeView({ subject }: { subject: SubjectId }) {
  const definition = getSubjectDefinition(subject)
  const Glyph = GLYPHS[subject]
  useDocumentTitle(`${definition.title} — الصف الثامن`)

  return (
    <>
      <section className="subject-hero" data-subject={subject} aria-labelledby="subject-title">
        <div className="container subject-hero__inner">
          <div className="subject-hero__mark" aria-hidden="true">
            <Glyph size={46} />
          </div>
          <div className="subject-hero__content">
            <p className="subject-hero__eyebrow">
              <Link to={routes.home}>المنصة</Link>
              <span aria-hidden="true">/</span>
              <span>{definition.latinTitle}</span>
            </p>
            <h1 className="subject-hero__title" id="subject-title">
              {definition.title}
            </h1>
            <p className="subject-hero__lead">{definition.description}</p>

            <ul className="subject-hero__facts">
              <li>
                <span className="subject-hero__fact-label">حالة المحتوى</span>
                <span className="subject-hero__fact-value">{contentStatusLabel(definition.status)}</span>
              </li>
              <li>
                <span className="subject-hero__fact-label">الوحدات المنشورة</span>
                <span className="subject-hero__fact-value">{definition.units.length}</span>
              </li>
              <li>
                <span className="subject-hero__fact-label">الكتاب المعتمد</span>
                <span className="subject-hero__fact-value">الكتاب المدرسي الجامع للفيزياء والكيمياء — الصف الثامن</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      <section className="section" aria-labelledby="units-title">
        <div className="container">
          <div className="section-heading">
            <p className="eyebrow">بنية المسار</p>
            <h2 id="units-title">الوحدات والدروس</h2>
            <p className="lead">
              تظهر الوحدات في مسار {SUBJECT_LABELS[subject]} بعناوينها المطبوعة في الكتاب، وبالترتيب
              نفسه، بعد قراءة صفحاتها واعتمادها.
            </p>
          </div>

          {definition.units.length === 0 ? (
            <EmptyState
              title="لم تُضف وحدات هذا المسار بعد"
              icon={<BookGlyph size={22} />}
            >
              <p>
                لم تُنشر وحدات لهذا المسار بعد؛ لذلك لا توجد وحدات أو دروس معروضة هنا، ولن تُعرض
                أسماء مُصطنعة.
              </p>
              <p>تُنشر الوحدة بعد قراءة صفحاتها والتحقق من وضوح النص والأرقام والأشكال، ثم يُبنى محتواها من الكتاب.</p>
            </EmptyState>
          ) : (
            <ul className="unit-list">
              {definition.units.map((unit) => (
                <li className="unit-card" key={unit.id}>
                  <Link className="unit-card__link" to={routes.unit(subject, unit.slug)}>
                    <span className="unit-card__order" aria-hidden="true">
                      {unit.order}
                    </span>
                    <span className="unit-card__body">
                      <span className="unit-card__title">{unit.title}</span>
                      <span className="unit-card__meta">
                        {unit.lessons.length} درساً · {contentStatusLabel(unit.status)}
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <section className="section" aria-labelledby="next-title">
        <div className="container">
          <div className="panel panel--quiet">
            <h2 className="panel__title" id="next-title">
              ما الذي سيظهر داخل الدرس؟
            </h2>
            <p className="panel__body">
              يُعرض الدرس خطوة واحدة في كل مرة: نص الكتاب أولاً وبرقم الصفحة، ثم شرح المنصة الموسوم
              بوسم «إضافة من المنصة»، ثم أمثلة وتجارب ومحاكيات وأسئلة، وتُختم بخلاصة واختبار نهائي
              شامل.
            </p>
            <p className="panel__body">يُبنى كل ذلك بعد اعتماد محتوى الدرس من الكتاب، دون اختراع أي عنصر.</p>
          </div>
        </div>
      </section>
    </>
  )
}
