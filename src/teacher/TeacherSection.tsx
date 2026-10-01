import { Link } from 'react-router-dom'
import { BookGlyph, ClipboardCheckGlyph, KeyGlyph } from '@/components/Icons'
import { routes } from '@/app/navigation'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { bookActivitySolutions, bookQuestions, finalTest } from '@/data/curriculum/chemistryLesson1'
import type { Question } from '@/assessment/types'
import type { ReactNode } from 'react'

export type TeacherSectionKind = 'book-solutions' | 'final-test' | 'final-test-solutions'

const CONTENT: Record<TeacherSectionKind, { title: string; lead: string; icon: typeof BookGlyph }> = {
  'book-solutions': { title: 'حلول أسئلة الكتاب', lead: 'جميع أسئلة وأنشطة الدرس مع المرجع والحل العلمي المفصّل.', icon: BookGlyph },
  'final-test': { title: 'الاختبار الشامل', lead: 'النص الكامل للاختبار الجديد المستقل عن أسئلة الكتاب.', icon: ClipboardCheckGlyph },
  'final-test-solutions': { title: 'حلول الاختبار الشامل', lead: 'الإجابة المرجعية وطريق الوصول إليها لكل سؤال.', icon: KeyGlyph },
}

export function TeacherSection({ kind }: { kind: TeacherSectionKind }) {
  const content = CONTENT[kind]
  const questions = kind === 'book-solutions' ? [...bookActivitySolutions, ...bookQuestions] : finalTest.questions
  const showSolutions = kind !== 'final-test'
  useDocumentTitle(`${content.title} — مساحة المعلم`)

  return (
    <div className="container teacher-section-page">
      <nav className="breadcrumb" aria-label="مسار التنقل">
        <Link to={routes.teacher}>مساحة المعلم</Link><span aria-hidden="true">/</span><span aria-current="page">{content.title}</span>
      </nav>
      <header className="teacher-section-page__header">
        <p className="eyebrow"><content.icon size={16} /> مساحة المعلم</p>
        <h1 className="teacher-section-page__title">{content.title}</h1>
        <p className="teacher-section-page__lead">{content.lead}</p>
      </header>

      <nav className="teacher-lesson-tabs" aria-label="دروس مساحة المعلم">
        <span className="teacher-lesson-tab" aria-current="page">الدرس الأول — كيمياء: الذرّة والعنصر</span>
      </nav>

      <section aria-labelledby="teacher-lesson-title">
        <h2 id="teacher-lesson-title">الدرس الأول — كيمياء: الذرّة والعنصر</h2>
        <p className="panel__body">{kind === 'book-solutions' ? 'الصفحات 3–12 · تتضمن أسئلة أختبر نفسي كاملة وحلول النشاطات الواردة في سياق الدرس.' : `اختبار من ${finalTest.questions.length} سؤالاً جديداً ومتنوّعاً · إضافة من المنصة.`}</p>
        <ol className="teacher-answer-list">
          {questions.map((question, index) => <TeacherQuestion key={question.id} question={question} index={index + 1} showSolution={showSolutions} />)}
        </ol>
      </section>
    </div>
  )
}

function TeacherQuestion({ question, index, showSolution }: { question: Question; index: number; showSolution: boolean }) {
  return (
    <li className="teacher-answer">
      <div className="teacher-answer__meta">
        <span>السؤال {index}</span><span>·</span><span>{typeLabel(question.type)}</span>
        <span>·</span><span>{question.origin === 'textbook' ? 'من الكتاب المدرسي' : 'إضافة من المنصة'}</span>
        {question.source ? <span>· ص{question.source.page}{question.source.item ? ` — ${question.source.item}` : ''}</span> : null}
      </div>
      <p className="teacher-answer__prompt">{question.prompt}</p>
      <QuestionMaterial question={question} />
      {showSolution ? <>
        <div className="teacher-answer__result"><strong>الإجابة:</strong> {answerOf(question)}</div>
        {question.explanation ? <p className="teacher-answer__explanation"><strong>التفسير وخطوات الحل:</strong> {question.explanation}</p> : null}
        {question.type === 'short-answer' && question.rubric ? <div><p><strong>عناصر الإجابة المكتملة:</strong></p><ul>{question.rubric.map((item) => <li key={item}>{item}</li>)}</ul></div> : null}
      </> : <p className="teacher-answer__explanation">تظهر الإجابة المفصّلة في قسم «حلول الاختبار الشامل» داخل تبويب هذا الدرس.</p>}
    </li>
  )
}

function QuestionMaterial({ question }: { question: Question }) {
  switch (question.type) {
    case 'multiple-choice': return <ol type="a">{question.options.map((option) => <li key={option.id}>{option.label}</li>)}</ol>
    case 'true-false': return <p>اختر: صح / غلط.</p>
    case 'fill-blank': return <p dir="rtl">{question.template.replace(/\{[^}]+\}/g, '________')}</p>
    case 'ordering': return <ul>{question.items.map((item) => <li key={item.id}>{item.label}</li>)}</ul>
    case 'matching': return <div className="cluster"><ul>{question.left.map((item) => <li key={item.id}>{item.label}</li>)}</ul><ul>{question.right.map((item) => <li key={item.id}>{item.label}</li>)}</ul></div>
    case 'table-interpretation': return <p>{question.table.caption}</p>
    case 'diagram-interpretation': return <p>{question.diagramDescription}</p>
    case 'numerical':
    case 'short-answer': return null
  }
}

function answerOf(question: Question): ReactNode {
  switch (question.type) {
    case 'multiple-choice': return question.options.filter((option) => question.correctOptionIds.includes(option.id)).map((option) => option.label).join('، ')
    case 'true-false': return question.correctAnswer ? 'صح.' : 'غلط.'
    case 'fill-blank': return question.blanks.map((blank) => blank.acceptedAnswers[0]).join('، ')
    case 'ordering': return question.correctOrder.map((id) => question.items.find((item) => item.id === id)?.label).join(' ← ')
    case 'matching': return question.pairs.map((pair) => `${question.left.find((item) => item.id === pair.leftId)?.label} ↔ ${question.right.find((item) => item.id === pair.rightId)?.label}`).join('؛ ')
    case 'numerical': return `${question.acceptedAnswers.join(' أو ')}${question.unit ? ` ${question.unit}` : ''}`
    case 'short-answer': return question.referenceAnswer
    case 'table-interpretation':
    case 'diagram-interpretation': return 'تُحل البنود الفرعية كلٌّ وفق نوعه.'
  }
}

function typeLabel(type: Question['type']) {
  return ({ 'multiple-choice': 'اختيار', 'true-false': 'صح/غلط', 'fill-blank': 'ملء فراغ', ordering: 'ترتيب', matching: 'مطابقة', numerical: 'حسابي', 'short-answer': 'إجابة علمية', 'table-interpretation': 'تفسير جدول', 'diagram-interpretation': 'تفسير شكل' } as const)[type]
}
