import { useEffect } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { SiteLayout } from '@/layouts/SiteLayout'
import { CourseHome } from '@/pages/CourseHome'
import { SubjectHome } from '@/pages/SubjectHome'
import { UnitView } from '@/pages/UnitView'
import { LessonView } from '@/pages/LessonView'
import { NotFound } from '@/pages/NotFound'
import { TeacherGate } from '@/teacher/TeacherGate'
import { TeacherHome } from '@/teacher/TeacherHome'
import { TeacherSection } from '@/teacher/TeacherSection'
import { lazy, Suspense } from 'react'
// Side-effect import: registers every published Test Area bank + solution set.
import '@/data/testArea/register'
import { routes } from './navigation'

/* The Test Area is code-split: its pages, question banks and solutions are
   loaded only when the student opens them, and the solutions module is a
   separate chunk from the bank so an attempt never downloads an explanation. */
const TestAreaHome = lazy(() =>
  import('@/testArea/pages/TestAreaHome').then((m) => ({ default: m.TestAreaHome })),
)
const TestRunnerPage = lazy(() =>
  import('@/testArea/pages/TestRunnerPage').then((m) => ({ default: m.TestRunnerPage })),
)
const SolutionsBrowserPage = lazy(() =>
  import('@/testArea/pages/SolutionsBrowserPage').then((m) => ({ default: m.SolutionsBrowserPage })),
)

function TestAreaBoundary({ children }: { children: React.ReactNode }) {
  return (
    <Suspense
      fallback={
        <div className="container ta-page">
          <p className="ta-loading" role="status">
            جارٍ التحميل…
          </p>
        </div>
      }
    >
      {children}
    </Suspense>
  )
}

/** Resets scroll position on navigation, except when deep-linking to a step. */
function ScrollToTop() {
  const { pathname, hash } = useLocation()

  useEffect(() => {
    if (hash) return
    window.scrollTo({ top: 0, behavior: 'auto' })
  }, [pathname, hash])

  return null
}

/**
 * Application routes.
 *
 * The teacher area is its own route (`/teacher`) with its own gate — never a
 * modal, drawer or hidden section inside a lesson.
 *
 * The router is a `BrowserRouter` with a base path supplied by Vite
 * (`import.meta.env.BASE_URL`), which equals the GitHub Pages project path in
 * production. The Pages workflow therefore publishes `404.html` as a copy of
 * `index.html` so deep links resolve, as well as keeping the base path correct
 * for every asset (see scripts/verify-dist.mjs).
 */
export function AppRoutes() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route element={<SiteLayout />}>
          <Route path={routes.home} element={<CourseHome />} />

          <Route path="/:subject" element={<SubjectHome />} />
          <Route path="/:subject/:unitSlug" element={<UnitView />} />
          <Route path="/:subject/:unitSlug/:lessonSlug" element={<LessonView />} />

          <Route
            path={routes.teacher}
            element={
              <TeacherGate>
                <TeacherHome />
              </TeacherGate>
            }
          />
          <Route
            path={routes.teacherBookSolutions}
            element={
              <TeacherGate>
                <TeacherSection kind="book-solutions" />
              </TeacherGate>
            }
          />
          <Route
            path={routes.teacherFinalTest}
            element={
              <TeacherGate>
                <TeacherSection kind="final-test" />
              </TeacherGate>
            }
          />
          <Route
            path={routes.teacherFinalTestSolutions}
            element={
              <TeacherGate>
                <TeacherSection kind="final-test-solutions" />
              </TeacherGate>
            }
          />

          <Route
            path={routes.testArea}
            element={
              <TestAreaBoundary>
                <TestAreaHome />
              </TestAreaBoundary>
            }
          />
          <Route
            path="/test-area/:testId"
            element={
              <TestAreaBoundary>
                <TestRunnerPage />
              </TestAreaBoundary>
            }
          />
          <Route
            path="/test-area/:testId/solutions"
            element={
              <TestAreaBoundary>
                <SolutionsBrowserPage />
              </TestAreaBoundary>
            }
          />

          <Route path="/unit-1" element={<Navigate to={routes.home} replace />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </>
  )
}
