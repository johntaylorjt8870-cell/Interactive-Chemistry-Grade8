import type { SubjectId } from '@/data/curriculum/schema'

export type RouteSubject = SubjectId | 'neutral'

export const routes = {
  home: '/',
  physics: '/physics',
  chemistry: '/chemistry',
  teacher: '/teacher',
  teacherBookSolutions: '/teacher/book-solutions',
  teacherFinalTest: '/teacher/final-test',
  teacherFinalTestSolutions: '/teacher/final-test-solutions',
  subject: (subject: SubjectId) => `/${subject}`,
  unit: (subject: SubjectId, unitSlug: string) => `/${subject}/${unitSlug}`,
  lesson: (subject: SubjectId, unitSlug: string, lessonSlug: string) =>
    `/${subject}/${unitSlug}/${lessonSlug}`,
} as const

export const SUBJECT_LABELS: Record<SubjectId, string> = {
  physics: 'الفيزياء',
  chemistry: 'الكيمياء',
}

export const SUBJECT_LATIN_LABELS: Record<SubjectId, string> = {
  physics: 'Physics',
  chemistry: 'Chemistry',
}

/** Resolves the active subject identity from a URL pathname. */
export function subjectFromPath(pathname: string): RouteSubject {
  if (pathname === routes.physics || pathname.startsWith(`${routes.physics}/`)) return 'physics'
  if (pathname === routes.chemistry || pathname.startsWith(`${routes.chemistry}/`)) return 'chemistry'
  return 'neutral'
}

export const PRIMARY_NAV = [
  { label: 'المنصة', to: routes.home, description: 'الصفحة الرئيسية للمسارين' },
  { label: SUBJECT_LABELS.physics, to: routes.physics, description: 'مسار الفيزياء' },
  { label: SUBJECT_LABELS.chemistry, to: routes.chemistry, description: 'مسار الكيمياء' },
] as const
