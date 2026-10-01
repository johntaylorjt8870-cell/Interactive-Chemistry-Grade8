import { Link } from 'react-router-dom'
import { EmptyState } from '@/components/EmptyState'
import { BookGlyph, ClipboardCheckGlyph, KeyGlyph } from '@/components/Icons'
import { routes } from '@/app/navigation'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import type { ReactNode } from 'react'

export type TeacherSectionKind = 'book-solutions' | 'final-test' | 'final-test-solutions'

const CONTENT: Record<
  TeacherSectionKind,
  { title: string; lead: string; emptyTitle: string; emptyBody: ReactNode; icon: typeof BookGlyph }
> = {
  'book-solutions': {
    title: 'حلول أسئلة الكتاب',
    lead: 'حلول مفصّلة لأسئلة الكتاب المدرسي وتمارينه وأنشطته، مع الإشارة إلى رقم الصفحة ورقم السؤال.',
    emptyTitle: 'لا توجد حلول بعد',
    emptyBody: (
      <>
        <p>
          تُكتب الحلول بعد قراءة السؤال من صفحته في الكتاب، ويُحفظ نص السؤال كما هو ثم يُضاف الحل
          خطوة بخطوة.
        </p>
        <p>لن يُنشر أي حل لسؤال لم يُقرأ من الكتاب المدرسي.</p>
      </>
    ),
    icon: BookGlyph,
  },
  'final-test': {
    title: 'الاختبار النهائي الشامل',
    lead: 'اختبار شامل لكل درس، يتضمّن عادةً بين 10 و20 سؤالاً جديداً، ويقيس الفهم لا الحفظ فقط.',
    emptyTitle: 'لا توجد اختبارات بعد',
    emptyBody: (
      <>
        <p>
          يُبنى الاختبار النهائي بعد اعتماد محتوى الدرس، وتتنوّع أسئلته بين الاختيار المتعدّد والصواب
          والخطأ والترتيب والمطابقة والملء والأسئلة الحسابية والأسئلة التطبيقية.
        </p>
        <p>تُعرض نتيجة كل محاولة بعد إنهاء الاختبار كاملاً، لا سؤالاً بسؤال.</p>
      </>
    ),
    icon: ClipboardCheckGlyph,
  },
  'final-test-solutions': {
    title: 'حلول الاختبار النهائي',
    lead: 'الإجابات المرجعية وخطوات الحل لكل سؤال في الاختبار النهائي الشامل.',
    emptyTitle: 'لا توجد حلول اختبار بعد',
    emptyBody: (
      <>
        <p>يُعرض كل سؤال مع إجابته المرجعية وخطوات الوصول إليها، ويُشار إلى سبب الاختيار الصحيح.</p>
        <p>تظهر هذه الحلول هنا وفي مراجعة الدرس بعد إتمام الاختبار.</p>
      </>
    ),
    icon: KeyGlyph,
  },
}

export function TeacherSection({ kind }: { kind: TeacherSectionKind }) {
  const content = CONTENT[kind]
  useDocumentTitle(`${content.title} — مساحة المعلم`)

  return (
    <div className="container teacher-section-page">
      <nav className="breadcrumb" aria-label="مسار التنقل">
        <Link to={routes.teacher}>مساحة المعلم</Link>
        <span aria-hidden="true">/</span>
        <span aria-current="page">{content.title}</span>
      </nav>

      <header className="teacher-section-page__header">
        <h1 className="teacher-section-page__title">{content.title}</h1>
        <p className="teacher-section-page__lead">{content.lead}</p>
      </header>

      <EmptyState icon={<content.icon size={22} />} title={content.emptyTitle}>
        {content.emptyBody}
      </EmptyState>
    </div>
  )
}
