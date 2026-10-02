import { describe, expect, it } from 'vitest'
import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { routerBasename } from '@/app/App'
import { renderApp } from './utils/renderApp'
import { readProjectFile } from './utils/projectFiles'

/** Mirrors vite.config.ts; the deployment test asserts the two agree. */
const PAGES_BASE_PATH = '/Interactive-Physics-Chemistry-Grade8/'

describe('application boot and routing', () => {
  it('boots the course home with the platform identity', () => {
    renderApp('/')

    expect(screen.getByRole('heading', { level: 1, name: /الفيزياء.*الكيمياء/ })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'مسار الفيزياء' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'مسار الكيمياء' })).toBeInTheDocument()
    expect(screen.getAllByRole('link', { name: /مساحة المعلم/ }).length).toBeGreaterThan(0)
  })

  it('reports the published curriculum counts', () => {
    renderApp('/')

    const status = screen.getByText(/الوحدات المنشورة حتى الآن/)
    expect(status).toBeInTheDocument()
    expect(status).toHaveTextContent('الوحدات المنشورة حتى الآن: 1')
    expect(status).toHaveTextContent('الدروس: 2')
  })

  it('routes to the physics subject page', async () => {
    renderApp('/physics')

    expect(await screen.findByRole('heading', { level: 1, name: 'الفيزياء' })).toBeInTheDocument()
    expect(screen.getByText(/لم تُضف وحدات هذا المسار بعد/)).toBeInTheDocument()
    expect(screen.getByText(/الكتاب المدرسي الجامع للفيزياء والكيمياء/)).toBeInTheDocument()
  })

  it('routes to the chemistry subject page with its own identity', () => {
    const { container } = renderApp('/chemistry')

    expect(screen.getByRole('heading', { level: 1, name: 'الكيمياء' })).toBeInTheDocument()
    expect(container.querySelector('[data-subject="chemistry"]')).not.toBeNull()
    expect(screen.getByRole('link', { name: /الوحدة الأولى — الكيمياء البنيوية/ })).toBeInTheDocument()
  })

  it('shows a pending state for a unit that does not exist instead of fabricating one', () => {
    renderApp('/physics/unit-1')

    expect(screen.getByText('هذه الوحدة غير منشورة بعد')).toBeInTheDocument()
    expect(screen.getByText(/لا تُعرض وحدات بديلة أو محتوى مُصطنع/)).toBeInTheDocument()
  })

  it('shows a pending state for a lesson that does not exist', () => {
    renderApp('/chemistry/unit-1/lesson-1')

    expect(screen.getByText('هذا الدرس غير منشور بعد')).toBeInTheDocument()
    expect(screen.getByText(/يُبنى الدرس من صفحاته في الكتاب المدرسي/)).toBeInTheDocument()
  })

  it('renders a not-found state for unknown routes', () => {
    renderApp('/this-route-does-not-exist')

    expect(screen.getByText('لا توجد صفحة بهذا العنوان')).toBeInTheDocument()
  })

  it('exposes one external entry point to the teacher area', () => {
    renderApp('/')

    const links = screen.getAllByRole('link', { name: /مساحة المعلم/ })
    expect(links.length).toBeGreaterThan(0)
    for (const link of links) {
      expect(link.getAttribute('href')).toBe('/teacher')
    }
  })

  it('does not render any modal or inline teacher area inside the course home', () => {
    renderApp('/')

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(screen.queryByLabelText('كلمة مرور المعلم')).not.toBeInTheDocument()
  })

  it('navigates from the header to the teacher gate', async () => {
    const user = userEvent.setup()
    renderApp('/')

    const headerNav = screen.getByRole('navigation', { name: 'التنقل الرئيسي' })
    await user.click(within(headerNav).getByRole('link', { name: /مساحة المعلم/ }))

    expect(await screen.findByRole('heading', { level: 1, name: 'مساحة المعلم' })).toBeInTheDocument()
    expect(screen.getByLabelText('كلمة مرور المعلم')).toBeInTheDocument()
  })

  it('keeps the language and direction requirements on the document', () => {
    const html = readProjectFile('index.html')

    expect(html).toMatch(/<html lang="ar" dir="rtl">/)
  })

  it('derives the router basename from the Vite base path', () => {
    expect(routerBasename('/')).toBe('')
    expect(routerBasename(PAGES_BASE_PATH)).toBe('/Interactive-Physics-Chemistry-Grade8')
    expect(PAGES_BASE_PATH).toBe('/Interactive-Physics-Chemistry-Grade8/')
  })

  it('renders a single h1 and a skip link on every public page', () => {
    for (const path of ['/', '/physics', '/chemistry', '/physics/unit-1']) {
      const { unmount, container } = renderApp(path)
      expect(container.querySelectorAll('h1')).toHaveLength(1)
      expect(screen.getByRole('link', { name: 'تخطَّ إلى المحتوى' })).toBeInTheDocument()
      unmount()
    }
  })

  it('puts the subject tracks in the header navigation', () => {
    renderApp('/')

    const nav = screen.getByRole('navigation', { name: 'التنقل الرئيسي' })
    const links = within(nav).getAllByRole('link')
    expect(links.map((link) => link.textContent?.trim())).toEqual(
      expect.arrayContaining(['المنصة', 'الفيزياء', 'الكيمياء']),
    )
  })
})
