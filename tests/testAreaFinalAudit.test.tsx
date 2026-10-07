import { beforeEach, describe, expect, it } from 'vitest'
import { screen } from '@testing-library/react'
import axe from 'axe-core'

import '@/data/testArea/register'

import {
  getTestDefinition,
  listComprehensiveTests,
  listTestDefinitions,
} from '@/data/testArea/registry'
import { renderApp } from './utils/renderApp'
import { readProjectFile } from './utils/projectFiles'

const definitions = listTestDefinitions()
const routeCases = definitions.map(({ meta }) => ({
  id: meta.id,
  title: meta.title,
  questionCount: meta.questionCount,
  solutionChunkSize: meta.solutionChunkSize,
}))

beforeEach(() => {
  window.sessionStorage.clear()
})

async function seriousOrCriticalAxeViolations(container: HTMLElement) {
  const results = await axe.run(container, {
    rules: {
      'color-contrast': { enabled: false },
    },
  })
  return results.violations.filter(
    (violation) => violation.impact === 'serious' || violation.impact === 'critical',
  )
}

describe('Final Test Area route audit', () => {
  it('publishes only the current lesson and provisional unit tests', () => {
    expect(routeCases.map((route) => route.id)).toEqual([
      'chem-u1-l1',
      'chem-u1-l2',
      'chem-u1-l3',
      'chem-u1',
    ])
    expect(listComprehensiveTests()).toEqual([])
  })

  it('keeps the current scoring policy explicit and bank-owned', async () => {
    for (const [id, expected] of [
      ['chem-u1-l1', false],
      ['chem-u1-l2', false],
      ['chem-u1-l3', false],
      ['chem-u1', true],
    ] as const) {
      const definition = getTestDefinition(id)
      expect(definition).toBeDefined()
      const bank = (await definition!.load()).default
      expect(bank.blueprint.scoring.allowPartial).toBe(expected)
    }
  })

  it('exposes a start and solutions link for every registered test', async () => {
    renderApp('/test-area')
    await screen.findByRole('heading', { level: 1, name: 'منطقة الاختبارات' })

    const starts = screen.getAllByRole('link', { name: 'ابدأ الاختبار' })
    const solutions = screen.getAllByRole('link', { name: 'حلول الاختبار' })
    for (const route of routeCases) {
      expect(starts.some((link) => link.getAttribute('href') === `/test-area/${route.id}`)).toBe(true)
      expect(
        solutions.some((link) => link.getAttribute('href') === `/test-area/${route.id}/solutions`),
      ).toBe(true)
    }
    expect(screen.getByText('لا يوجد اختبار شامل منشور بعد')).toBeInTheDocument()
  })

  it.each(routeCases)('loads the runner route for $id without a result before submit', async (route) => {
    const { container } = renderApp(`/test-area/${route.id}`)
    expect(await screen.findByRole('heading', { level: 1, name: route.title })).toBeInTheDocument()
    expect(screen.getByText(`السؤال 1 من ${route.questionCount}`)).toBeInTheDocument()
    expect(container.querySelector('.ta-result')).toBeNull()
    expect(screen.queryByRole('heading', { name: 'نتيجة الاختبار' })).toBeNull()
  })

  it.each(routeCases)('loads the separate solutions route for $id', async (route) => {
    renderApp(`/test-area/${route.id}/solutions`)
    expect(
      await screen.findByRole('heading', { level: 1, name: `حلول ${route.title}` }),
    ).toBeInTheDocument()
    expect(
      await screen.findAllByText(`الجزء الأول (1–${route.solutionChunkSize})`),
    ).toHaveLength(2)
    expect(screen.getAllByText('لماذا هذه الإجابة صحيحة؟').length).toBeGreaterThan(0)
  })

  it('handles unpublished runner and solutions ids honestly', async () => {
    const runner = renderApp('/test-area/not-published')
    expect(await screen.findByRole('heading', { level: 1, name: 'هذا الاختبار غير منشور' })).toBeInTheDocument()
    runner.unmount()

    renderApp('/test-area/not-published/solutions')
    expect(await screen.findByRole('heading', { level: 1, name: 'لا حلول لهذا الاختبار' })).toBeInTheDocument()
  })
})

describe('Final Test Area accessibility and loading boundaries', () => {
  it.each([
    { label: 'home', path: '/test-area', ready: 'منطقة الاختبارات' },
    { label: 'Lesson 2 runner', path: '/test-area/chem-u1-l2', ready: 'اختبار الدرس الثاني — الروابط الكيميائية' },
    { label: 'Unit 1 solutions', path: '/test-area/chem-u1/solutions', ready: 'حلول اختبار الوحدة الأولى — الكيمياء البنيوية' },
  ])('has no serious or critical axe violations on the $label route', async ({ path, ready }) => {
    const { container } = renderApp(path)
    await screen.findByRole('heading', { level: 1, name: ready })
    expect(await seriousOrCriticalAxeViolations(container)).toEqual([])
  })

  it('keeps the attempt boundary free of solution imports and keeps solution loading separate', () => {
    const runnerSource = readProjectFile('src/testArea/pages/TestRunnerPage.tsx')
    const registrySource = readProjectFile('src/data/testArea/register.ts')

    expect(runnerSource).not.toContain('loadSolutions')
    expect(registrySource).toContain("load: () => import('./banks/")
    expect(registrySource).toContain("loadSolutions: () => import('./solutions/")
  })
})
