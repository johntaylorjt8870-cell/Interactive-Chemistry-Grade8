import type { FinalTest, Question } from '@/assessment/types'
import {
  bookActivitySolutions as lesson1Activities,
  bookQuestions as lesson1Questions,
  finalTest as lesson1FinalTest,
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
}

export const TEACHER_LESSONS: TeacherLessonContent[] = [
  {
    lessonId: 'chem-u1-l1',
    label: 'الدرس الأول — كيمياء: الذرّة والعنصر',
    pages: 'الصفحات 3–12',
    bookNote: 'تتضمن أسئلة أختبر نفسي كاملة وحلول النشاطات الواردة في سياق الدرس.',
    bookQuestions: [...lesson1Activities, ...lesson1Questions],
    finalTest: lesson1FinalTest,
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
]

/** Resolves the active teacher lesson; unknown or missing ids fall back to the first. */
export function getTeacherLesson(lessonId: string | null | undefined): TeacherLessonContent {
  return TEACHER_LESSONS.find((lesson) => lesson.lessonId === lessonId) ?? TEACHER_LESSONS[0]!
}
