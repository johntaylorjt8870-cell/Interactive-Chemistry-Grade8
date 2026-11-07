import { describe, expect, it } from 'vitest'
import { chemistryLesson5, chemistryLesson5StudentNotebook as notebook } from '@/data/curriculum/chemistryLesson5'
import { LESSON5_OBJECTIVES } from '@/data/curriculum/lesson5SourceLedger'

const textbookBlocks = chemistryLesson5.steps.flatMap((step) => step.blocks)
const printed = textbookBlocks.filter((block) => block.kind === 'textbook-verbatim')
const section = (id: string) => notebook.sections.find((item) => item.id === id)!

describe('Lesson 5 notebook — source fidelity and approved scope', () => {
  it('quotes the two laws in full, on the same pages as the lesson', () => {
    const definitions = notebook.sections.flatMap((item) => item.definitions ?? [])
    expect(definitions).toHaveLength(2)
    for (const definition of definitions) {
      const page = definition.source.match(/^ص(\d+)/)?.[1]
      expect(printed.some((block) => block.source.page === page && block.text === definition.text)).toBe(true)
    }
    expect(definitions[0].text).toContain('قانون مصونيّة الكتلة')
    expect(definitions[1].text).toContain('مهما اختلفت طرائق تحضيره')
  })

  it('preserves both printed atom conclusions and the book enrichment', () => {
    const points = section('atom-conservation').points!
    for (const text of points.slice(0, 2)) {
      expect(printed.some((block) => block.source.page === '31' && block.text === text)).toBe(true)
    }
    const bookEnrichment = printed.find((block) => block.source.page === '31' && block.source.item === 'نص الإثراء')!
    expect(points[2]).toContain(bookEnrichment.text)
    expect(points[2]).toContain('من الكتاب')
  })

  it('includes all four printed objectives and the keywords', () => {
    const points = section('objectives-and-keywords').points!
    for (const objective of LESSON5_OBJECTIVES) expect(points).toContain(objective.text)
    expect(points).toContain('الكلمات المفتاحية: قانون انحفاظ الكتلة (لافوازييه) – قانون النّسب الثّابتة.')
  })

  it('labels authored summaries and keeps external claims exclusively in enrichment', () => {
    expect(section('mass-conservation').points![0]).toMatch(/^تلخيص من المنصة — ليس نصاً من الكتاب/)
    expect(section('learned-summary').source).toBe('توضيح ضروري من المنصة — ليس نصاً من الكتاب')
    const enriched = notebook.sections.flatMap((item) => item.enrichment ?? [])
    expect(enriched).toHaveLength(2)
    expect(enriched.map((item) => item.url)).toEqual([
      'https://openstax.org/books/chemistry-2e/pages/1-2-phases-and-classification-of-matter',
      'https://openstax.org/books/chemistry-2e/pages/2-1-early-ideas-in-atomic-theory',
    ])
    expect(enriched[0].text).toMatch(/المركّب النقي.*المخلوط/)
    expect(enriched[1].text).toMatch(/CO.*CO₂/)
    for (const item of enriched) {
      expect(item.reference).toBe('OpenStax')
      expect(item.citation.length).toBeGreaterThan(20)
      expect(item.why.length).toBeGreaterThan(20)
      expect(notebook.sections.flatMap((s) => s.points ?? [])).not.toContain(item.text)
      expect(notebook.sections.flatMap((s) => s.definitions ?? []).map((d) => d.text)).not.toContain(item.text)
    }
  })

  it('refers to rather than duplicating lesson tables, calculations, worked examples or tests', () => {
    expect(notebook.sections.every((item) => !item.table && !item.procedure && !item.ordered)).toBe(true)
    const text = JSON.stringify(notebook)
    expect(text).not.toMatch(/أختبر نفسي|إجابة نموذجية|الإجابة الصحيحة|solutionBlocks|questionId/)
    expect(text).not.toMatch(/10\s*\/\s*1\.56|56\s*\/\s*32|82\.5|32\s*\/\s*12/)
    expect(text).not.toContain('→')
    expect(text).toContain('125.100')
    expect(text).toContain('دون وحدة مطبوعة')
  })

  it('keeps review prompts separate, unanswered and different from all assessment prompts', () => {
    const review = notebook.checklist!.items
    expect(review).toHaveLength(6)
    const prompts: string[] = []
    const walk = (value: unknown) => {
      if (!value || typeof value !== 'object') return
      if (Array.isArray(value)) { value.forEach(walk); return }
      const object = value as Record<string, unknown>
      if (typeof object.prompt === 'string') prompts.push(object.prompt)
      Object.values(object).forEach(walk)
    }
    walk(chemistryLesson5.tests)
    for (const item of review) expect(prompts).not.toContain(item)
    expect(JSON.stringify(notebook.checklist)).not.toMatch(/الإجابة|الحل|جواب/)
  })
})
