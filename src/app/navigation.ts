import type { SubjectId } from '@/data/curriculum/schema'

export type RouteSubject = SubjectId | 'neutral'

export const routes = {
  home: '/',
  chemistry: '/chemistry',
  teacher: '/teacher',
  teacherBookSolutions: '/teacher/book-solutions',
  teacherFinalTest: '/teacher/final-test',
  teacherFinalTestSolutions: '/teacher/final-test-solutions',
  testArea: '/test-area',
  testAreaTest: (testId: string) => `/test-area/${testId}`,
  testAreaSolutions: (testId: string) => `/test-area/${testId}/solutions`,
  subject: (subject: SubjectId) => `/${subject}`,
  unit: (subject: SubjectId, unitSlug: string) => `/${subject}/${unitSlug}`,
  lesson: (subject: SubjectId, unitSlug: string, lessonSlug: string) =>
    `/${subject}/${unitSlug}/${lessonSlug}`,
} as const

export const SUBJECT_LABELS: Record<SubjectId, string> = {
  chemistry: 'الكيمياء',
}

export const SUBJECT_LATIN_LABELS: Record<SubjectId, string> = {
  chemistry: 'Chemistry',
}

/** Resolves the active subject identity from a URL pathname. */
export function subjectFromPath(pathname: string): RouteSubject {
  if (pathname === routes.chemistry || pathname.startsWith(`${routes.chemistry}/`)) return 'chemistry'
  return 'neutral'
}

export const PRIMARY_NAV = [
  { label: 'المنصة', to: routes.home, description: 'الصفحة الرئيسية لمنصة الكيمياء' },
  { label: SUBJECT_LABELS.chemistry, to: routes.chemistry, description: 'مسار الكيمياء' },
] as const
