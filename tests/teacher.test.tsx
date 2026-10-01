import { beforeEach, describe, expect, it, vi } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createTeacherAccess, isTeacherPasswordValid, teacherAccess, TEACHER_PASSWORD } from '@/teacher/teacherAccess'
import { TeacherGate } from '@/teacher/TeacherGate'
import { renderApp, renderWithTheme } from './utils/renderApp'

function memoryStorage() {
  const map = new Map<string, string>()
  return {
    getItem: (key: string) => map.get(key) ?? null,
    setItem: (key: string, value: string) => void map.set(key, value),
    removeItem: (key: string) => void map.delete(key),
    snapshot: () => map,
  }
}

describe('teacher access gate logic', () => {
  it('accepts only the configured password', () => {
    expect(isTeacherPasswordValid(TEACHER_PASSWORD)).toBe(true)
    expect(isTeacherPasswordValid('')).toBe(false)
    expect(isTeacherPasswordValid(' wrong ')).toBe(false)
    expect(isTeacherPasswordValid(TEACHER_PASSWORD.toUpperCase())).toBe(false)
  })

  it('unlocks, persists for the session, and locks again', () => {
    const storage = memoryStorage()
    const access = createTeacherAccess(storage)

    expect(access.isUnlocked()).toBe(false)
    expect(access.unlock('nope')).toBe(false)
    expect(access.isUnlocked()).toBe(false)

    expect(access.unlock(TEACHER_PASSWORD)).toBe(true)
    expect(access.isUnlocked()).toBe(true)
    expect(storage.snapshot().get('ipc:teacher-access')).toBe('granted')

    access.lock()
    expect(access.isUnlocked()).toBe(false)
    expect(storage.snapshot().has('ipc:teacher-access')).toBe(false)
  })

  it('restores an unlocked session from storage', () => {
    const storage = memoryStorage()
    storage.setItem('ipc:teacher-access', 'granted')
    expect(createTeacherAccess(storage).isUnlocked()).toBe(true)
  })

  it('notifies subscribers when access changes', () => {
    const access = createTeacherAccess(null)
    const listener = vi.fn()
    const unsubscribe = access.subscribe(listener)

    access.unlock(TEACHER_PASSWORD)
    expect(listener).toHaveBeenCalledTimes(1)
    unsubscribe()
    access.lock()
    expect(listener).toHaveBeenCalledTimes(1)
  })

  it('works without storage available', () => {
    const access = createTeacherAccess(null)
    expect(access.unlock(TEACHER_PASSWORD)).toBe(true)
    expect(access.isUnlocked()).toBe(true)
  })
})

describe('TeacherGate', () => {
  beforeEach(() => {
    // A previous test may have unlocked the shared session gate.
    teacherAccess.lock()
  })

  it('hides the teacher content until the password is correct', () => {
    renderWithTheme(
      <TeacherGate>
        <p>محتوى المعلم</p>
      </TeacherGate>,
    )

    expect(screen.queryByText('محتوى المعلم')).not.toBeInTheDocument()
    expect(screen.getByLabelText('كلمة مرور المعلم')).toHaveAttribute('type', 'password')
  })

  it('reports a wrong password with an alert and keeps the content hidden', async () => {
    const user = userEvent.setup()
    renderWithTheme(
      <TeacherGate>
        <p>محتوى المعلم</p>
      </TeacherGate>,
    )

    await user.type(screen.getByLabelText('كلمة مرور المعلم'), 'wrong-password')
    await user.click(screen.getByRole('button', { name: 'دخول مساحة المعلم' }))

    const alert = await screen.findByRole('alert')
    expect(alert).toHaveTextContent('كلمة المرور غير صحيحة.')
    expect(screen.queryByText('محتوى المعلم')).not.toBeInTheDocument()
    expect(screen.getByLabelText('كلمة مرور المعلم')).toHaveAttribute('aria-invalid', 'true')
  })

  it('reveals the content with the correct password and clears the error state', async () => {
    const user = userEvent.setup()
    renderWithTheme(
      <TeacherGate>
        <p>محتوى المعلم</p>
      </TeacherGate>,
    )

    const input = screen.getByLabelText('كلمة مرور المعلم')
    await user.type(input, 'wrong')
    await user.click(screen.getByRole('button', { name: 'دخول مساحة المعلم' }))
    await screen.findByRole('alert')

    await user.clear(input)
    await user.type(input, TEACHER_PASSWORD)
    await user.click(screen.getByRole('button', { name: 'دخول مساحة المعلم' }))

    expect(await screen.findByText('محتوى المعلم')).toBeInTheDocument()
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('states clearly that the gate is not server-side protection', () => {
    renderWithTheme(
      <TeacherGate>
        <span />
      </TeacherGate>,
    )

    expect(screen.getByText(/لا تُعدّ هذه البوابة حماية أمنية بالمعنى التقني/)).toBeInTheDocument()
  })
})

describe('teacher area routes', () => {
  beforeEach(() => {
    teacherAccess.lock()
  })

  it('gates every teacher route behind the password', () => {
    for (const path of ['/teacher', '/teacher/book-solutions', '/teacher/final-test', '/teacher/final-test-solutions']) {
      const { unmount } = renderApp(path)
      expect(screen.getByRole('heading', { level: 1, name: 'مساحة المعلم' })).toBeInTheDocument()
      expect(screen.getByLabelText('كلمة مرور المعلم')).toBeInTheDocument()
      unmount()
    }
  })

  it('exposes the three sections on the teacher home and links to them', async () => {
    const user = userEvent.setup()
    const { container } = renderApp('/teacher')

    await user.type(screen.getByLabelText('كلمة مرور المعلم'), TEACHER_PASSWORD)
    await user.click(screen.getByRole('button', { name: 'دخول مساحة المعلم' }))

    const heading = await screen.findByRole('heading', { level: 1, name: 'أدوات المعلم' })
    expect(heading).toBeInTheDocument()

    const links = screen.getAllByRole('link')
    const hrefs = links.map((link) => link.getAttribute('href'))
    expect(hrefs).toEqual(
      expect.arrayContaining(['/teacher/book-solutions', '/teacher/final-test', '/teacher/final-test-solutions']),
    )
    // No dashboard: no admin panels, no fabricated student analytics.
    expect(screen.queryByText('لوحة التحكم')).not.toBeInTheDocument()
    expect(screen.queryByText(/إحصاءات الطلاب/)).not.toBeInTheDocument()
    expect(container.querySelectorAll('.teacher-section')).toHaveLength(3)
  })

  it('shows the lesson-specific book solutions after access', async () => {
    const user = userEvent.setup()
    renderApp('/teacher/book-solutions')

    await user.type(screen.getByLabelText('كلمة مرور المعلم'), TEACHER_PASSWORD)
    await user.click(screen.getByRole('button', { name: 'دخول مساحة المعلم' }))

    expect(await screen.findByRole('heading', { level: 1, name: 'حلول أسئلة الكتاب' })).toBeInTheDocument()
    expect(screen.getByText('الدرس الأول — كيمياء: الذرّة والعنصر', { selector: '.teacher-lesson-tab' })).toBeInTheDocument()
    expect(screen.getByText(/K\(2\), L\(8\), M\(1\)/)).toBeInTheDocument()
    expect(screen.getAllByText(/التفسير وخطوات الحل/).length).toBeGreaterThan(10)
  })

  it('does not present the teacher area as a modal inside a lesson', () => {
    const { container } = renderApp('/teacher')
    expect(container.querySelector('[role="dialog"]')).toBeNull()
  })
})
