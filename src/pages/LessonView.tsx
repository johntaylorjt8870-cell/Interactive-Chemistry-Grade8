import { useCallback } from 'react'
import type { ReactNode } from 'react'
import { Link, useParams } from 'react-router-dom'
import { EmptyState } from '@/components/EmptyState'
import { BookGlyph, HourglassGlyph } from '@/components/Icons'
import { routes } from '@/app/navigation'
import { Sci } from '@/scientific'
import { LessonFlow } from '@/lessons/LessonFlow'
import { InlineQuestion } from '@/assessment/InlineQuestion'
import { FinalTestRunner } from '@/assessment/FinalTestRunner'
import { InteractiveHost } from '@/components/InteractiveHost'
import { getLesson, getSubjectDefinition, getUnit } from '@/data/curriculum/registry'
import { contentStatusLabel } from '@/data/source'
import { isSubjectId, type LessonDefinition, type SubjectId } from '@/data/curriculum/schema'
import type { Question } from '@/assessment/types'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { NotFound } from './NotFound'

/**
 * Lesson page.
 *
 * When the registry contains the lesson, the full lesson engine runs:
 * LessonShell → LessonOutline → LessonFlow → one LessonStep at a time, with
 * lazily loaded interactives and assessment hosts wired in.
 *
 * When it does not (today, because the textbook pages have not been supplied)
 * the page shows an explicit pending state — never a fabricated lesson.
 */
export function LessonView() {
  const { subject, unitSlug, lessonSlug } = useParams<{
    subject: string
    unitSlug: string
    lessonSlug: string
  }>()

  if (!isSubjectId(subject ?? '')) return <NotFound />

  const subjectId = subject as SubjectId
  const lesson =
    unitSlug && lessonSlug ? getLesson(subjectId, unitSlug, lessonSlug) : undefined

  return lesson ? (
    <LessonContent subject={subjectId} unitSlug={unitSlug!} lesson={lesson} />
  ) : (
    <LessonPending subject={subjectId} unitSlug={unitSlug ?? ''} slug={lessonSlug ?? ''} />
  )
}

function LessonContent({
  subject,
  unitSlug,
  lesson,
}: {
  subject: SubjectId
  unitSlug: string
  lesson: LessonDefinition
}) {
  const definition = getSubjectDefinition(subject)
  const unit = getUnit(subject, unitSlug)
  useDocumentTitle(`${lesson.title} — ${definition.title}`)

  const findQuestion = useCallback(
    (questionId: string): Question | undefined => {
      for (const test of lesson.tests ?? []) {
        const found = findQuestionById(test.questions, questionId)
        if (found) return found
      }
      return undefined
    },
    [lesson.tests],
  )

  const renderQuestion = useCallback(
    (questionId: string): ReactNode => {
      const question = findQuestion(questionId)
      if (!question) {
        return (
          <div className="empty-state empty-state--inline">
            <p className="empty-state__body">
              لا يوجد سؤال بالمعرّف <Sci variant="textual">{questionId}</Sci> في هذا الدرس.
            </p>
          </div>
        )
      }
      return <InlineQuestion question={question} />
    },
    [findQuestion],
  )

  const renderDiagram = useCallback(
    (diagramId: string, description: string): ReactNode => (
      <div className="lesson-diagram">
        <InteractiveHost interactiveId={diagramId} caption={description} />
      </div>
    ),
    [],
  )

  const renderTest = useCallback(
    (testId: string): ReactNode => {
      const test = (lesson.tests ?? []).find((candidate) => candidate.id === testId)
      if (!test) return null
      return <FinalTestRunner test={test} renderDiagram={renderDiagram} />
    },
    [lesson.tests, renderDiagram],
  )

  return (
    <LessonFlow
      lesson={lesson}
      breadcrumb={
        <>
          <Link to={routes.home}>المنصة</Link>
          <span aria-hidden="true">/</span>
          <Link to={routes.subject(subject)}>{definition.title}</Link>
          {unit ? (
            <>
              <span aria-hidden="true">/</span>
              <Link to={routes.unit(subject, unit.slug)}>{unit.title}</Link>
            </>
          ) : null}
          <span aria-hidden="true">/</span>
          <span aria-current="page">{lesson.title}</span>
        </>
      }
      renderQuestion={renderQuestion}
      renderDiagram={renderDiagram}
      renderTest={renderTest}
      finishAction={
        <Link className="button button--secondary" to={routes.subject(subject)}>
          العودة إلى مسار {definition.title}
        </Link>
      }
    />
  )
}

/** Recursively searches composite questions (table / diagram interpretation). */
function findQuestionById(questions: Question[], id: string): Question | undefined {
  for (const question of questions) {
    if (question.id === id) return question
    if (question.type === 'table-interpretation' || question.type === 'diagram-interpretation') {
      const nested = findQuestionById(question.questions, id)
      if (nested) return nested
    }
  }
  return undefined
}

function LessonPending({
  subject,
  unitSlug,
  slug,
}: {
  subject: SubjectId
  unitSlug: string
  slug: string
}) {
  const definition = getSubjectDefinition(subject)
  useDocumentTitle(`درس غير منشور — ${definition.title}`)

  return (
    <div className="container lesson-view">
      <nav className="breadcrumb" aria-label="مسار التنقل">
        <Link to={routes.home}>المنصة</Link>
        <span aria-hidden="true">/</span>
        <Link to={routes.subject(subject)}>{definition.title}</Link>
        <span aria-hidden="true">/</span>
        <Link to={routes.unit(subject, unitSlug)}>
          <Sci variant="textual">{unitSlug}</Sci>
        </Link>
        <span aria-hidden="true">/</span>
        <span aria-current="page">
          <Sci variant="textual">{slug}</Sci>
        </span>
      </nav>

      <EmptyState
        headingLevel={1}
        icon={<BookGlyph size={22} />}
        title="هذا الدرس غير منشور بعد"
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
          المعرّف المطلوب: <Sci variant="textual">{slug}</Sci> داخل الوحدة{' '}
          <Sci variant="textual">{unitSlug}</Sci>.
        </p>
        <p>
          يُبنى الدرس من صفحاته في الكتاب المدرسي: يُقرأ النص والأرقام والوحدات والأشكال والأسئلة
          أولاً، ثم يُنشر المحتوى كما هو مع شرح المنصة الموسوم بوضوح.
        </p>
        <p className="empty-state__hint">
          <HourglassGlyph size={16} /> حالة المسار الحالية: {contentStatusLabel(definition.status)}
        </p>
      </EmptyState>
    </div>
  )
}
