import { beforeEach, describe, expect, it } from 'vitest'
import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import axe from 'axe-core'
import { chemistryLesson3 } from '@/data/curriculum/chemistryLesson3'
import { progressStore } from '@/data/progress'
import {
  FORBIDDEN_LAB_SANDBOX_TOKENS,
  buildLabSandboxAttribute,
  getLessonLab,
  listLessonLabs,
  resolveLabUrl,
} from '@/labs/registry'
import { renderApp } from './utils/renderApp'

const LESSON3_PATH = '/chemistry/structural-chemistry/chemical-formulas'
const LESSON1_PATH = '/chemistry/structural-chemistry/atom-and-element'

beforeEach(() => {
  window.history.replaceState(null, '', '#step-1')
  progressStore.resetLesson(chemistryLesson3.id)
})

describe('lesson lab registry & security contract', () => {
  it('registers chem-u1-l3 with exact approved sandbox tokens and no forbidden tokens', () => {
    const lab = getLessonLab('chem-u1-l3')
    expect(lab).toBeDefined()
    expect(lab?.tabTitle).toBe('المخبر')
    expect(lab?.entryPath).toBe('labs/chem-u1-l3/index.html')

    const sandbox = buildLabSandboxAttribute(lab!.sandbox)
    expect(sandbox).toBe('allow-scripts allow-popups allow-popups-to-escape-sandbox')

    const tokens = sandbox.split(/\s+/)
    for (const forbidden of FORBIDDEN_LAB_SANDBOX_TOKENS) {
      expect(tokens).not.toContain(forbidden)
    }
  })

  it('rejects allow-same-origin, allow-top-navigation, and unknown sandbox tokens', () => {
    expect(() => buildLabSandboxAttribute([])).toThrow(/allow-scripts/)
    expect(() => buildLabSandboxAttribute(['allow-scripts', 'allow-same-origin'])).toThrow(/Disallowed/)
    expect(() => buildLabSandboxAttribute(['allow-scripts', 'allow-top-navigation'])).toThrow(/Disallowed/)
    expect(() => buildLabSandboxAttribute(['allow-scripts', 'allow-forms'])).toThrow(/Disallowed/)
  })

  it('resolves lab URLs cleanly under both root and GitHub Pages base paths', () => {
    const lab = getLessonLab('chem-u1-l3')!
    expect(resolveLabUrl(lab, '/')).toBe('/labs/chem-u1-l3/index.html')
    expect(resolveLabUrl(lab, '/Interactive-Chemistry-Grade8/')).toBe(
      '/Interactive-Chemistry-Grade8/labs/chem-u1-l3/index.html',
    )
    expect(resolveLabUrl(lab, '/Interactive-Chemistry-Grade8')).toBe(
      '/Interactive-Chemistry-Grade8/labs/chem-u1-l3/index.html',
    )
  })

  it('does not register labs for lessons that do not yet have one', () => {
    expect(listLessonLabs().map((l) => l.lessonId)).toEqual(['chem-u1-l3'])
    expect(getLessonLab('chem-u1-l1')).toBeUndefined()
    expect(getLessonLab('chem-u1-l2')).toBeUndefined()
  })
})

describe('Lesson 3 «المخبر» tab integration', () => {
  it('places «المخبر» immediately before «📒 دفتر الطالب» and mounts the isolated iframe on click', async () => {
    const user = userEvent.setup()
    const { container } = renderApp(LESSON3_PATH)
    await screen.findByRole('heading', { level: 1, name: /صيغةُ المركّباتِ الكيميائيَّةِ/ })

    // Not mounted eagerly before opening the lab tab.
    expect(container.querySelector('iframe.lesson-lab__frame')).toBeNull()

    const nav = screen.getByRole('navigation', { name: 'خطوات الدرس' })
    const buttons = within(nav).getAllByRole('button')
    const labButton = buttons.at(-2)!
    const notebookButton = buttons.at(-1)!
    expect(labButton).toHaveAttribute('data-tab', 'lab')
    expect(labButton).toHaveTextContent('المخبر')
    expect(notebookButton).toHaveAttribute('data-tab', 'notebook')

    await user.click(labButton)
    expect(window.location.hash).toBe('#lab')
    expect(labButton).toHaveAttribute('aria-current', 'page')

    const iframe = container.querySelector<HTMLIFrameElement>('iframe.lesson-lab__frame')
    expect(iframe).not.toBeNull()
    expect(iframe).toHaveAttribute('sandbox', 'allow-scripts allow-popups allow-popups-to-escape-sandbox')
    expect(iframe).toHaveAttribute('referrerpolicy', 'no-referrer')
    expect(iframe).toHaveAttribute('allow', '')
    expect(iframe?.getAttribute('src')).toMatch(/\/labs\/chem-u1-l3\/index\.html$/)

    const results = await axe.run(container, {
      iframes: false,
      rules: { 'color-contrast': { enabled: false } },
    })
    expect(
      results.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical'),
    ).toEqual([])
  })

  it('preserves written step answers and avoids touching lesson progress when round-tripping through «المخبر»', async () => {
    const user = userEvent.setup()
    window.history.replaceState(null, '', '/#step-2')
    renderApp(LESSON3_PATH)
    await screen.findByRole('heading', { level: 1, name: /صيغةُ المركّباتِ الكيميائيَّةِ/ })

    const step = document.querySelector<HTMLElement>('.step')!
    const answer = screen.getAllByRole('textbox')[0] as HTMLTextAreaElement
    await user.type(answer, 'H2O')
    expect(answer).toHaveValue('H2O')

    const seenBefore = progressStore.getLesson(chemistryLesson3.id)?.seenStepIds ?? []

    const nav = screen.getByRole('navigation', { name: 'خطوات الدرس' })
    const labButton = within(nav).getAllByRole('button').at(-2)!
    await user.click(labButton)

    expect(step).toHaveAttribute('hidden')
    expect(progressStore.getLesson(chemistryLesson3.id)?.seenStepIds ?? []).toEqual(seenBefore)

    // During Full Page there must be exactly one accessible button named
    // "العودة إلى الدرس" — the one rendered by LessonLabView. The legacy
    // button in lesson-shell__nav is not rendered in the DOM while the lab
    // is active, so getByRole returns a single element and the round-trip
    // preserves the step content and answer without reloading.
    const closeButtons = screen.getAllByRole('button', { name: /العودة إلى الدرس/ })
    expect(closeButtons).toHaveLength(1)

    await user.click(closeButtons[0])
    expect(step).not.toHaveAttribute('hidden')
    expect(answer).toHaveValue('H2O')
  })

  it('opens directly when entering the lesson URL with #lab hash', async () => {
    window.history.replaceState(null, '', '/#lab')
    const { container } = renderApp(LESSON3_PATH)
    await screen.findByRole('heading', { level: 1, name: /صيغةُ المركّباتِ الكيميائيَّةِ/ })

    const iframe = container.querySelector<HTMLIFrameElement>('iframe.lesson-lab__frame')
    expect(iframe).not.toBeNull()
    expect(iframe?.closest('.lesson-lab')).not.toHaveAttribute('hidden')
  })

  it('leaves lessons without a registered lab completely untouched', async () => {
    const { container } = renderApp(LESSON1_PATH)
    await screen.findByRole('heading', { level: 1, name: /الذرّة والعنصر/ })

    const nav = screen.getByRole('navigation', { name: 'خطوات الدرس' })
    expect(within(nav).queryByRole('button', { name: /^المخبر/ })).toBeNull()
    expect(container.querySelector('[data-tab="lab"]')).toBeNull()
  })
})
