import type { FinalTest, Question } from '@/assessment/types'
import type { ContentBlock } from '@/data/curriculum/schema'
import {
  bookActivitySolutions as lesson1Activities,
  bookQuestions as lesson1Questions,
  finalTest as lesson1FinalTest,
  lesson1TeacherGuide,
} from '@/data/curriculum/chemistryLesson1'
import {
  bookActivitySolutions as lesson2Activities,
  bookQuestions as lesson2Questions,
  finalTest as lesson2FinalTest,
} from '@/data/curriculum/chemistryLesson2'
import {
  bookActivitySolutions as lesson3Activities,
  bookQuestions as lesson3Questions,
  finalTest as lesson3FinalTest,
} from '@/data/curriculum/chemistryLesson3'

import {
  bookActivitySolutions as lesson4Activities,
  bookQuestions as lesson4Questions,
  finalTest as lesson4FinalTest,
  lesson4TeacherGuide,
} from '@/data/curriculum/chemistryLesson4'
import {
  bookActivitySolutions as lesson5Activities,
  bookQuestions as lesson5Questions,
  finalTest as lesson5FinalTest,
  lesson5TeacherGuide,
} from '@/data/curriculum/chemistryLesson5'

/**
 * Teacher-area content registry.
 *
 * Every published Chemistry lesson owns an independent tab with its own book
 * solutions, comprehensive test and test solutions — never mixed with another
 * lesson. The teacher pages render directly from this list.
 */
export type TeacherLessonContent = {
  lessonId: string
  /** Tab and section label, e.g. «الدرس الأول — كيمياء: الذرّة والعنصر». */
  label: string
  /** Printed page range of the lesson, shown with the book solutions. */
  pages: string
  bookNote: string
  /** Textbook questions and in-lesson activities with full solutions. */
  bookQuestions: Question[]
  finalTest: FinalTest
  /** Optional detailed teacher guide for the selected lesson only. */
  conceptBlocks?: ContentBlock[]
  /** Optional navigation to the separate lesson bank and its full solutions. */
  testAreaId?: string
}

export const TEACHER_LESSONS: TeacherLessonContent[] = [
  {
    lessonId: 'chem-u1-l1',
    label: 'الدرس الأول — كيمياء: الذرّة والعنصر',
    pages: 'الصفحات 3–12',
    bookNote: 'تتضمن أسئلة أختبر نفسي كاملة وحلول النشاطات الواردة في سياق الدرس، ودليلاً تعليمياً مفصلاً يغطي النماذج الذرية والتوزيع الإلكتروني والأيونات والنظائر وتمثيل لويس.',
    bookQuestions: [...lesson1Activities, ...lesson1Questions],
    finalTest: lesson1FinalTest,
    conceptBlocks: lesson1TeacherGuide,
  },
  {
    lessonId: 'chem-u1-l2',
    label: 'الدرس الثاني — كيمياء: الروابط الكيميائية',
    pages: 'الصفحات 13–17',
    bookNote: 'تتضمن أسئلة أختبر نفسي الخمسة وحلول نشاطات الصفحات 13 و15 و16 وقضيّة البحث.',
    bookQuestions: [...lesson2Activities, ...lesson2Questions],
    finalTest: lesson2FinalTest,
  },
  {
    lessonId: 'chem-u1-l3',
    label: 'الدرس الثالث — كيمياء: صيغةُ المركّباتِ الكيميائيَّةِ',
    pages: 'الصفحات 18–23',
    bookNote: 'تتضمن حلول السؤال التمهيدي ونشاط النماذج وجدول الأيونات ونشاط التفكك (ص19–20)، وحلول «أختبر نفسي» الخمسة كاملة بترتيبها القرائي (ص23).',
    bookQuestions: [...lesson3Activities, ...lesson3Questions],
    finalTest: lesson3FinalTest,
  },
  {
    lessonId: 'chem-u1-l4',
    label: 'الدرس الرابع — كيمياء: التفاعلات الكيميائية',
    pages: 'الصفحات 24–29',
    bookNote: 'شرح مفصل للمفاهيم، وجميع مشاهد الملاحظة وأسئلة التجربتين والأنشطة وقضية البحث (20 بنداً)، وحلول أسئلة أختبر نفسي الستة بكل فروعها (13 بنداً)، مع مراجع الصفحات وفصل حلول المنصة عن نص الكتاب.',
    bookQuestions: [...lesson4Activities, ...lesson4Questions],
    finalTest: lesson4FinalTest,
    conceptBlocks: lesson4TeacherGuide,
    testAreaId: 'chem-u1-l4',
  },
  {
    lessonId: 'chem-u1-l5',
    label: 'الدرس الخامس — كيمياء: انحفاظ الكتلة والنسب الثابتة',
    pages: 'الصفحات 30–35',
    bookNote: 'حلول مشاهد عدّ الذرات، وقراءة تجربة الميزان، وجميع فروع جدولي الرصاص والكبريت والحديد والكبريت، وأسئلة «أختبر نفسي» بكل فروعها، مع شرح معلمي مفصل. اختبار هذا الدرس مستقل من 16 سؤالاً؛ لا يوجد بنك منفصل له.',
    bookQuestions: [...lesson5Activities, ...lesson5Questions],
    finalTest: lesson5FinalTest,
    conceptBlocks: lesson5TeacherGuide,
  },
]

/** Resolves the active teacher lesson; unknown or missing ids fall back to the first. */
export function getTeacherLesson(lessonId: string | null | undefined): TeacherLessonContent {
  return TEACHER_LESSONS.find((lesson) => lesson.lessonId === lessonId) ?? TEACHER_LESSONS[0]!
}
