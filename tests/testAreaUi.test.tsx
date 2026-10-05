import { beforeEach, describe, expect, it } from 'vitest'
import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { renderApp } from './utils/renderApp'

/* ============================================================================
   Test Area — UI behaviour
   ----------------------------------------------------------------------------
   The rules that cannot be broken by accident are asserted here, at the level
   the student sees:

   - nothing about correctness, score or solutions exists before submit;
   - submit is what produces a score, a percentage and the split;
   - restart erases the attempt completely;
   - the solutions area is reachable on its own and reads in parts.
   ========================================================================= */

const TEST_PATH = '/test-area/chem-u1-l1'
const SOLUTIONS_PATH = '/test-area/chem-u1-l1/solutions'

beforeEach(() => {
  window.sessionStorage.clear()
})

describe('Test Area home', () => {
  it('opens with the Lesson 1 test and its two entry points', async () => {
    renderApp('/test-area')

    expect(
      await screen.findByRole('heading', { level: 1, name: 'منطقة الاختبارات' }),
    ).toBeInTheDocument()

    const starts = await screen.findAllByRole('link', { name: 'ابدأ الاختبار' })
    const start = starts.find((link) => link.getAttribute('href') === TEST_PATH)
    expect(start).toBeDefined()
    const solutionLinks = screen.getAllByRole('link', { name: 'حلول الاختبار' })
    expect(solutionLinks.some((link) => link.getAttribute('href') === SOLUTIONS_PATH)).toBe(true)
  })

  it('states the rules of the area before the first question', async () => {
    renderApp('/test-area')
    expect(
      await screen.findByText(/لا تظهر أي إجابة أو درجة أو تلميح قبل الضغط/),
    ).toBeInTheDocument()
  })

  it('says honestly that no comprehensive test is published', async () => {
    renderApp('/test-area')
    expect(await screen.findByText('لا يوجد اختبار شامل منشور بعد')).toBeInTheDocument()
  })
})

describe('Entry surfaces', () => {
  it('keeps the Test Area reachable from the homepage card', async () => {
    renderApp('/')
    const link = await screen.findByRole('link', { name: 'دخول منطقة الاختبارات' })
    expect(link).toHaveAttribute('href', '/test-area')
  })

  it('keeps the Unit 1 page entry pointed at the independent unit test', async () => {
    renderApp('/chemistry/structural-chemistry')
    const link = await screen.findByRole('link', { name: 'بدء اختبار الوحدة' })
    expect(link).toHaveAttribute('href', '/test-area/chem-u1')
  })

  it('removes the Test Area link from the Header while keeping it in the Footer', async () => {
    const { container } = renderApp('/test-area')
    await screen.findByRole('heading', { level: 1, name: 'منطقة الاختبارات' })
    const header = container.querySelector('header.site-header') as HTMLElement | null
    const footer = container.querySelector('footer.site-footer') as HTMLElement | null
    expect(header).not.toBeNull()
    expect(footer).not.toBeNull()
    expect(within(header!).queryByRole('link', { name: 'منطقة الاختبارات' })).toBeNull()
    expect(within(footer!).getByRole('link', { name: 'منطقة الاختبارات' })).toHaveAttribute(
      'href',
      '/test-area',
    )
  })
})

describe('Attempt', () => {
  it('loads the test and shows the first question', async () => {
    renderApp(TEST_PATH)
    expect(
      await screen.findByRole('heading', { level: 1, name: /الدرس الأول — الذرّة والعنصر/ }),
    ).toBeInTheDocument()
    expect(screen.getByText(/السؤال 1 من 20/)).toBeInTheDocument()
  })

  it('reveals nothing about correctness before submit', async () => {
    const { container } = renderApp(TEST_PATH)
    await screen.findByRole('heading', { level: 1, name: /الدرس الأول/ })

    expect(container.querySelector('.ta-result')).toBeNull()
    expect(container.querySelector('.ta-chip--correct')).toBeNull()
    expect(container.querySelector('.ta-chip--incorrect')).toBeNull()
    expect(screen.queryByRole('heading', { name: /نتيجة الاختبار/ })).toBeNull()
    expect(screen.queryByText(/لماذا هذه الإجابة صحيحة/)).toBeNull()
    expect(screen.queryByText(/الإجابة الصحيحة/)).toBeNull()
    expect(screen.queryByText(/%/)).toBeNull()
  })

  it('marks a question as answered in the navigator without saying whether it is right', async () => {
    const user = userEvent.setup()
    const { container } = renderApp(TEST_PATH)
    await screen.findByRole('heading', { level: 1, name: /الدرس الأول/ })

    const options = screen.getAllByRole('radio')
    await user.click(options[1]!)

    expect(container.querySelectorAll('.ta-navigator__cell.is-answered')).toHaveLength(1)
    expect(container.querySelectorAll('.ta-navigator__cell.is-correct')).toHaveLength(0)
    expect(container.querySelectorAll('.ta-navigator__cell.is-incorrect')).toHaveLength(0)
  })

  it('warns about unanswered questions and only submits when asked', async () => {
    const user = userEvent.setup()
    renderApp(TEST_PATH)
    await screen.findByRole('heading', { level: 1, name: /الدرس الأول/ })

    await user.click(screen.getByRole('button', { name: 'إرسال الإجابات' }))

    const alert = await screen.findByRole('alert')
    expect(alert).toHaveTextContent('لم تُجب عن 20 من 20 سؤالاً')
    expect(screen.queryByText(/نتيجة الاختبار/)).toBeNull()

    await user.click(within(alert).getByRole('button', { name: 'راجع أسئلتي أولاً' }))
    expect(screen.queryByRole('alert')).toBeNull()
  })

  it('produces a score only after submit', async () => {
    const user = userEvent.setup()
    renderApp(TEST_PATH)
    await screen.findByRole('heading', { level: 1, name: /الدرس الأول/ })

    const options = screen.getAllByRole('radio')
    await user.click(options[1]!)
    await user.click(screen.getByRole('button', { name: 'إرسال الإجابات' }))
    await user.click(screen.getByRole('button', { name: 'أرسل على أي حال' }))

    const result = await screen.findByRole('heading', { name: 'نتيجة الاختبار' })
    expect(result).toBeInTheDocument()
    expect(screen.getByText('5%')).toBeInTheDocument()
    expect(screen.getByText('إجابات صحيحة')).toBeInTheDocument()
    expect(screen.getByText('أسئلة لم تُجب')).toBeInTheDocument()
  })

  it('restart erases the attempt: answers, progress and result', async () => {
    const user = userEvent.setup()
    const { container } = renderApp(TEST_PATH)
    await screen.findByRole('heading', { level: 1, name: /الدرس الأول/ })

    await user.click(screen.getAllByRole('radio')[1]!)
    await user.click(screen.getByRole('button', { name: 'إرسال الإجابات' }))
    await user.click(screen.getByRole('button', { name: 'أرسل على أي حال' }))
    await screen.findByRole('heading', { name: 'نتيجة الاختبار' })

    await user.click(screen.getByRole('button', { name: 'إعادة الاختبار من جديد' }))

    expect(screen.queryByRole('heading', { name: 'نتيجة الاختبار' })).toBeNull()
    expect(screen.getByText(/السؤال 1 من 20/)).toBeInTheDocument()
    expect(container.querySelectorAll('.ta-navigator__cell.is-answered')).toHaveLength(0)
    expect(screen.getByText(/أجبت عن 0 من 20/)).toBeInTheDocument()
  })

  it('keeps the draft for the session and restores it after a reload', async () => {
    const user = userEvent.setup()
    const first = renderApp(TEST_PATH)
    await screen.findByRole('heading', { level: 1, name: /الدرس الأول/ })

    await user.click(screen.getAllByRole('radio')[1]!)
    await user.click(screen.getByRole('button', { name: 'التالي' }))
    expect(await screen.findByText(/السؤال 2 من 20/)).toBeInTheDocument()
    first.unmount()

    renderApp(TEST_PATH)
    expect(await screen.findByText(/السؤال 2 من 20/)).toBeInTheDocument()
    expect(screen.getByText(/أجبت عن 1 من 20/)).toBeInTheDocument()
  })
})

describe('Solutions area', () => {
  it('is a separate route from the Teacher Area', async () => {
    renderApp(SOLUTIONS_PATH)
    expect(await screen.findByText(/حلول الاختبارات · منطقة الاختبارات/)).toBeInTheDocument()
  })

  it('opens on the first part and explains the answer pedagogically', async () => {
    renderApp(SOLUTIONS_PATH)

    // The part indicator is printed twice on purpose: above and below the set.
    expect(await screen.findAllByText('الجزء الأول (1–5)')).toHaveLength(2)
    expect(screen.getAllByText(/الأسئلة 1–5 من 20/)).toHaveLength(2)
    expect(screen.getAllByText('لماذا هذه الإجابة صحيحة؟').length).toBeGreaterThan(0)
    expect(screen.getAllByText('أخطاء شائعة').length).toBeGreaterThan(0)
    expect(screen.getAllByText('كيف أتحقق؟').length).toBeGreaterThan(0)
  })

  it('moves between parts and back', async () => {
    const user = userEvent.setup()
    renderApp(SOLUTIONS_PATH)
    await screen.findAllByText('الجزء الأول (1–5)')

    const nav = screen.getAllByRole('navigation', { name: 'أجزاء الحلول' })[0]!
    expect(within(nav).getByRole('button', { name: 'الجزء السابق' })).toBeDisabled()
    await user.click(within(nav).getByRole('button', { name: 'الجزء التالي' }))

    expect(screen.getAllByText('الجزء الثاني (6–10)')).toHaveLength(2)
    expect(screen.getAllByText(/الأسئلة 6–10 من 20/)).toHaveLength(2)

    const navAfter = screen.getAllByRole('navigation', { name: 'أجزاء الحلول' })[0]!
    await user.click(within(navAfter).getByRole('button', { name: 'الجزء السابق' }))
    expect(screen.getAllByText('الجزء الأول (1–5)')).toHaveLength(2)
  })

  it('never merges the solutions into the teacher area route', async () => {
    renderApp(SOLUTIONS_PATH)
    await screen.findByText(/حلول الاختبارات · منطقة الاختبارات/)
    expect(window.location.pathname).not.toMatch(/^\/teacher/)
  })
})
