import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import katex from 'katex'
const renderToString = katex.renderToString
import { chemistryLesson7, bookActivitySolutions, bookQuestions, finalTest, lesson7PracticeQuestions } from '@/data/curriculum/chemistryLesson7'
import { computeLedgerCoverage, LESSON7_LEDGER, LESSON7_OBJECTIVES, lesson7SourceText } from '@/data/curriculum/lesson7SourceLedger'
import { validateFinalTest } from '@/assessment/validate'
import { validateLesson } from '@/data/sourceFidelity'
import type { ContentBlock } from '@/data/curriculum/schema'
import { getInteractive } from '@/simulations/registry'
import { strayScriptGlyphs } from './utils/strayGlyphs'
import { ContentBlocks } from '@/lessons/ContentBlocks'
import { render } from '@testing-library/react'

const inventory = JSON.parse(readFileSync('docs/source-reports/lesson7-source-inventory.json', 'utf8')) as { items: Array<{ id: string; order: number; page: string; content: string; clarity: string }> }
function allBlocks(): ContentBlock[] {
  const blocks: ContentBlock[] = []
  const walk = (list: ContentBlock[]) => { for (const block of list) blocks.push(block) }
  for (const step of chemistryLesson7.steps) walk(step.blocks)
  for (const test of chemistryLesson7.tests ?? []) for (const question of test.questions) { walk(question.material ?? []); walk(question.solutionBlocks ?? []) }
  return blocks
}
function allQuestions() { return (chemistryLesson7.tests ?? []).flatMap((test) => test.questions) }

describe('Lesson 7 source ledger — approved pp.40–49', () => {
  it('keeps all 194 audited items in order with exact inventory wording', () => {
    expect(LESSON7_LEDGER).toHaveLength(194)
    expect(LESSON7_LEDGER.map((item) => item.id)).toEqual(inventory.items.map((item) => item.id))
    for (const [index, item] of LESSON7_LEDGER.entries()) {
      expect(item.order).toBe(index + 1)
      expect(item.content).toBe(inventory.items[index]!.content)
      expect(item.page).toBe(inventory.items[index]!.page)
      expect(item.clarity).toBe(inventory.items[index]!.clarity)
    }
  })
  it('covers every page and leaves only the white p41 label deferred', () => {
    const coverage = computeLedgerCoverage(chemistryLesson7)
    expect(coverage.byPage).toEqual({ '40': 24, '41': 18, '42': 18, '43': 19, '44': 19, '45': 21, '46': 20, '47': 9, '48': 28, '49': 18 })
    expect(coverage.deferred).toEqual(['L7-P41-E012'])
    expect(coverage.danglingSteps).toEqual([])
    expect(coverage.danglingQuestions).toEqual([])
    expect(coverage.unlistedTextbookQuestions).toEqual([])
    expect(coverage.pagesWithoutEntries).toEqual([])
    expect(coverage.implemented + coverage.sourceImage).toBe(193)
  })
  it('maps every ledger item to an existing step and every interactive to the registry', () => {
    const stepIds = new Set(chemistryLesson7.steps.map((step) => step.id))
    for (const item of LESSON7_LEDGER) {
      expect(item.implementedBy.length).toBeGreaterThan(0)
      for (const id of item.implementedBy) expect(stepIds.has(id)).toBe(true)
      for (const id of item.interactiveIds) expect(getInteractive(id)).toBeDefined()
    }
  })
  it('preserves the original balance crop and never guesses the deferred label', () => {
    const step = chemistryLesson7.steps.find((entry) => entry.id === 'p41-balance-source')!
    const image = step.blocks.find((block) => block.kind === 'source-image')
    expect(image).toBeDefined()
    expect(step.blocks.some((block) => block.kind === 'callout' && /غير معتمدة/.test(block.title ?? ''))).toBe(true)
    expect(lesson7SourceText('L7-P41-E012')).toContain('يلزم توضيح')
    expect(allBlocks().filter((block) => block.kind === 'textbook-verbatim').some((block) => block.text.includes('يلزم توضيح'))).toBe(false)
  })
  it('keeps the p42 table unitless and the p43 activity blanks empty', () => {
    const blocks = allBlocks()
    const elements = blocks.find((block) => block.kind === 'table' && block.caption.includes('جدول لبعض العناصر'))
    expect(elements?.kind).toBe('table')
    if (elements?.kind === 'table') {
      expect(elements.rows).toHaveLength(16)
      expect(elements.columns.find((column) => column.key === 'mass')?.unit).toBeUndefined()
      expect(elements.rows[7]!.cells).toEqual({ name: 'كلور', symbol: 'Cl', mass: '35.5' })
    }
    const activity = blocks.find((block) => block.kind === 'table' && block.caption.includes('نشاط ص43'))
    expect(activity?.kind).toBe('table')
    if (activity?.kind === 'table') {
      expect(activity.rows[1]!.cells).toEqual({ formula: 'NH₃', first: '', second: '', sum: '', molar: '' })
      expect(activity.rows[2]!.cells).toEqual({ formula: 'CH₄', first: '', second: '1 × 4', sum: '', molar: '' })
    }
  })
  it('prints 814م and the p46 spelling الهدروجين without silent correction', () => {
    expect(lesson7SourceText('L7-P46-E016')).toContain('814م')
    expect(lesson7SourceText('L7-P46-E004')).toContain('الهدروجين')
    expect(lesson7SourceText('L7-P41-E005')).toContain('يحتوي من')
  })
  it('attributes the 21% oxygen assumption to platform, never to the printed question', () => {
    const air = bookQuestions.find((question) => question.id === 'l7-p49-methane5')!
    expect(air.origin).toBe('textbook')
    expect(air.prompt).toBe(lesson7SourceText('L7-P49-E017'))
    expect(air.prompt).not.toMatch(/21|20/)
    expect(air.solutionBlocks?.some((block) => block.kind === 'callout' && block.attribution === 'platform' && /21%/.test(block.text))).toBe(true)
    const review = chemistryLesson7.steps.find((step) => step.id === 'p49-air-review')!
    expect(review.attribution).toBe('platform')
    expect(review.blocks.some((block) => block.kind === 'callout' && /ليست معطى مطبوعاً/.test(block.text))).toBe(true)
  })
  it('aligns the four printed objectives and marks the fifth as platform', () => {
    expect(LESSON7_OBJECTIVES.filter((objective) => objective.origin === 'textbook').map((objective) => objective.printed)).toEqual(['يتعرّف المول.', 'يحسب الكتلة الموليّة لمادة ما.', 'يتعرّف الحجم المولي لغاز ما في الشّرطين النّظاميين.', 'يحل بعض تطبيقات الحساب الكيميائي.'])
    expect(LESSON7_OBJECTIVES[4]!.origin).toBe('platform')
    for (const objective of LESSON7_OBJECTIVES) for (const id of objective.stepIds) expect(chemistryLesson7.steps.some((step) => step.id === id)).toBe(true)
  })
})

describe('Lesson 7 assessment and scientific rendering', () => {
  it('has 41 book units, 12 practice questions and a valid 20-question final test', () => {
    expect(bookActivitySolutions).toHaveLength(15)
    expect(bookQuestions).toHaveLength(26)
    expect(lesson7PracticeQuestions).toHaveLength(12)
    expect(finalTest.questions).toHaveLength(20)
    expect(validateFinalTest(finalTest, 'l7-final')).toEqual([])
    expect(validateLesson(chemistryLesson7, 'chem-u1-l7').filter((issue) => issue.severity === 'error')).toEqual([])
    for (const question of allQuestions()) expect(question.solutionBlocks?.length ?? 0).toBeGreaterThan(0)
  })
  it('renders every TeX string with KaTeX strict mode', () => {
    const formulas = allBlocks().filter((block): block is Extract<ContentBlock, { kind: 'formula' }> => block.kind === 'formula')
    expect(formulas.length).toBeGreaterThan(30)
    for (const block of formulas) expect(() => renderToString(block.tex, { strict: 'error', throwOnError: true })).not.toThrow()
  })
  it('keeps raw bidi controls and stray script glyphs out of authored content', () => {
    const text = JSON.stringify(allBlocks()) + JSON.stringify(allQuestions())
    expect(/[\u202A-\u202E\u2066-\u2069]/.test(text)).toBe(false)
    const { container } = render(<ContentBlocks blocks={allBlocks()} />)
    expect(strayScriptGlyphs(container)).toEqual([])
  })
  it('uses KaTeX fractions for the printed proportional calculations', () => {
    const tex = allBlocks().filter((block): block is Extract<ContentBlock, { kind: 'formula' }> => block.kind === 'formula').map((block) => block.tex).join('\n')
    expect(tex).toContain('\\frac{190}{95}')
    expect(tex).toContain('\\frac{127}{x}')
    expect(tex).toContain('\\frac{22.4}{V}')
    expect(katex.renderToString('\\frac{44.8}{0.21}', { strict: 'error' })).toContain('mfrac')
  })
})
