import { Link, useParams } from 'react-router-dom'
import { EmptyState } from '@/components/EmptyState'
import { BookGlyph, HourglassGlyph } from '@/components/Icons'
import { routes } from '@/app/navigation'
import { Sci } from '@/scientific'
import { getSubjectDefinition, getUnit } from '@/data/curriculum/registry'
import { contentStatusLabel } from '@/data/source'
import { isSubjectId, type SubjectId, type UnitDefinition } from '@/data/curriculum/schema'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { NotFound } from './NotFound'

/**
 * Unit page. It renders the real unit when the registry contains one, and an
 * honest pending state when it does not — it never invents a blank marker unit.
 */
export function UnitView() {
  const { subject, unitSlug } = useParams<{ subject: string; unitSlug: string }>()

  if (!isSubjectId(subject ?? '')) return <NotFound />

  const subjectId = subject as SubjectId
  const unit = unitSlug ? getUnit(subjectId, unitSlug) : undefined

  return unit ? <UnitContent subject={subjectId} unit={unit} /> : <UnitPending subject={subjectId} slug={unitSlug ?? ''} />
}

function UnitContent({ subject, unit }: { subject: SubjectId; unit: UnitDefinition }) {
  const definition = getSubjectDefinition(subject)
  useDocumentTitle(`${unit.title} — ${definition.title}`)

  return (
    <div className="container unit-view">
      <nav className="breadcrumb" aria-label="مسار التنقل">
        <Link to={routes.home}>المنصة</Link>
        <span aria-hidden="true">/</span>
        <Link to={routes.subject(subject)}>{definition.title}</Link>
        <span aria-hidden="true">/</span>
        <span aria-current="page">{unit.title}</span>
      </nav>

      <header className="unit-view__header">
        <h1 className="unit-view__title">{unit.title}</h1>
        <p className="unit-view__meta">
          {contentStatusLabel(unit.status)}
          {unit.source?.pages.length
            ? ` · الصفحات: ${unit.source.pages.map((page) => page.page).join('، ')}`
            : null}
        </p>
      </header>

      <ol className="lesson-list">
        {unit.lessons.map((lesson) => (
          <li className="lesson-list__item" key={lesson.id}>
            <Link className="lesson-list__link" to={routes.lesson(subject, unit.slug, lesson.slug)}>
              <span className="lesson-list__order" aria-hidden="true">
                {lesson.order}
              </span>
              <span className="lesson-list__body">
                <span className="lesson-list__title">{lesson.title}</span>
                <span className="lesson-list__meta">
                  {lesson.steps.length} خطوة · {contentStatusLabel(lesson.status)}
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ol>

      <section className="unit-view__test-entry ta-card" aria-labelledby="unit-test-entry-title">
        <div>
          <p className="eyebrow">تقييم مستقل</p>
          <h2 className="unit-view__test-entry-title" id="unit-test-entry-title">
            اختبار الوحدة الأولى
          </h2>
          <p className="unit-view__test-entry-text">
            ستون سؤالاً أصلياً تربط بين دروس الوحدة، مع سياسة تصحيح معلنة وحلول منفصلة.
          </p>
        </div>
        <Link className="button button--primary" to={routes.testAreaTest('chem-u1')}>
          بدء اختبار الوحدة
        </Link>
      </section>
    </div>
  )
}

function UnitPending({ subject, slug }: { subject: SubjectId; slug: string }) {
  const definition = getSubjectDefinition(subject)
  useDocumentTitle(`وحدة غير منشورة — ${definition.title}`)

  return (
    <div className="container unit-view">
      <nav className="breadcrumb" aria-label="مسار التنقل">
        <Link to={routes.home}>المنصة</Link>
        <span aria-hidden="true">/</span>
        <Link to={routes.subject(subject)}>{definition.title}</Link>
        <span aria-hidden="true">/</span>
        <span aria-current="page">
          <Sci variant="textual">{slug}</Sci>
        </span>
      </nav>

      <EmptyState
        headingLevel={1}
        icon={<BookGlyph size={22} />}
        title="هذه الوحدة غير منشورة بعد"
        actions={
          <div className="cluster">
            <Link className="button button--primary" to={routes.subject(subject)}>
              العودة إلى مسار {definition.title}
            </Link>
            <Link className="button button--secondary" to={routes.home}>
              الصفحة الرئيسية
            </Link>
          </div>
        }
      >
        <p>
          المعرّف المطلوب: <Sci variant="textual">{slug}</Sci> — لا توجد وحدة بهذا المعرّف في مسار{' '}
          {definition.title}.
        </p>
        <p>
          تُنشأ الوحدات فقط من فهرس الكتاب المدرسي بعد توفير صور صفحاته وقراءتها. لا تُعرض وحدات
          بديلة أو محتوى مُصطنع.
        </p>
        <p className="empty-state__hint">
          <HourglassGlyph size={16} /> حالة المسار الحالية: {contentStatusLabel(definition.status)}
        </p>
      </EmptyState>
    </div>
  )
}
