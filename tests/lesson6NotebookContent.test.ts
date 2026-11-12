import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { chemistryLesson6, chemistryLesson6StudentNotebook as notebook } from '@/data/curriculum/chemistryLesson6'
import { LESSON6_OBJECTIVES } from '@/data/curriculum/lesson6SourceLedger'

const section = (id: string) => notebook.sections.find((item) => item.id === id)!
const printed = chemistryLesson6.steps.flatMap((step) => step.blocks).filter((block) => block.kind === 'textbook-verbatim')

describe('Lesson 6 notebook — source and content', () => {
  it('preserves the four textbook objectives and both keywords from page 36', () => {
    const points = section('objectives-and-keywords').points!
    const entry = printed.filter((block) => block.source.page === '36').map((block) => block.text).join('\n')
    const objectives = LESSON6_OBJECTIVES.filter((objective) => objective.origin === 'textbook')
    expect(objectives).toHaveLength(4)
    for (const objective of objectives) {
      expect(points).toContain(objective.printed)
      expect(entry).toContain(objective.printed)
    }
    const keywords = 'الكلمات المفتاحية: المعادلة الكيميائيّة الموزونة – دلالات الرّموز.'
    expect(points).toContain(keywords)
    expect(entry).toContain(keywords)
    expect(JSON.stringify(notebook.sections)).not.toContain(LESSON6_OBJECTIVES.find((objective) => objective.origin === 'platform')!.printed)
  })

  it('preserves the complete definition and balancing principle as locally quoted on page 38', () => {
    const definition = section('chemical-equation').definitions![0]
    const principle = section('balancing').points![0]
    const source = printed.find((block) => block.source.page === '38' && block.source.item === 'أستنتج')!
    expect(definition.source).toContain('ص38')
    expect(definition.text).toBe('المعادلة الكيميائيّة هي تعبيرٌ وصفيٌّ وكمّيٌّ عن التغيّر الكيميائيّ.')
    expect(principle).toBe('نوازن المعادلة الكيميائيّة بجعل عدد ذرّات كل عنصر متساوياً في طرفي المعادلة.')
    expect(source.text).toContain(definition.text)
    expect(source.text).toContain(principle)
  })

  it('keeps both other learned-box sentences and references the balancing conclusion without repeating it', () => {
    const summary = section('learned-summary').points!
    const learned = printed.find((block) => block.source.page === '39' && block.source.item === 'تعلّمتُ')!
    for (const point of summary.slice(0, 2)) expect(learned.text).toContain(point)
    expect(summary[2]).toContain('إحالة من المنصة')
    expect(summary[2]).toContain('موازنة المعادلة')
  })

  it('records the printed state symbols and labels all added clarifications and references', () => {
    const stateStep = chemistryLesson6.steps.find((step) => step.id === 'observe-and-state-table-source')!
    const table = stateStep.blocks.find((block) => block.kind === 'table')!
    expect(table.rows.map((row) => row.cells.symbol)).toEqual(['s', 'ℓ', 'aq', 'g', 'Δ'])
    const symbols = section('symbol-meanings').points![0]
    for (const symbol of ['s', 'ℓ', 'aq', 'g', 'Δ']) expect(symbols).toContain(symbol)
    for (const point of notebook.sections.flatMap((s) => s.points ?? []).filter((p) => /من المنصة/.test(p))) {
      expect(point).toMatch(/^(توضيح من المنصة — ليس نصاً من الكتاب|إحالة من المنصة):/)
    }
    expect(notebook.source.verified).toBe(false)
    expect(notebook.source.readability?.notes).toContain('لم تُعاين صور الصفحات الأصلية مباشرة')
  })

  it('has no external enrichment, copied exercises, equations, tables or worked procedures', () => {
    expect(notebook.enrichmentNote).toBeUndefined()
    expect(notebook.sections.every((s) => !s.enrichment && !s.table && !s.procedure && !s.ordered && !s.lewisMolecules)).toBe(true)
    const text = JSON.stringify(notebook.sections)
    expect(text).not.toMatch(/→|⟶|أختبر نفسي|questionId|solutionBlocks|الإجابة الصحيحة/)
    expect(text).not.toMatch(/ZnCl|HCl|AlCl|Na₂|CO₂/)
  })

  it('keeps the three approved unanswered reflection prompts in order, distinct from assessment wording', () => {
    const review = notebook.checklist!.items
    expect(review).toEqual([
      'كيف تقرأ علامة الجمع بين المواد قبل سهم التفاعل، وكيف تقرؤها بين المواد بعده؟',
      'في تجربة الزنك، أيّ العبارتين ملاحظة مباشرة وأيّهما استنتاج: تصاعدت فقاعات أم تكوّن غاز الهدروجين؟ وضّح الفرق.',
      'عند التعبير عن تجربة بمعادلة كيميائية، لماذا لا نكتب أنبوب الاختبار ضمن المواد المتفاعلة أو الناتجة؟',
    ])
    expect(new Set(review).size).toBe(3)
    const prompts: string[] = []
    const walk = (value: unknown) => {
      if (!value || typeof value !== 'object') return
      if (Array.isArray(value)) { value.forEach(walk); return }
      const obj = value as Record<string, unknown>
      if (typeof obj.prompt === 'string') prompts.push(obj.prompt)
      if (typeof obj.statement === 'string') prompts.push(obj.statement)
      Object.values(obj).forEach(walk)
    }
    walk(chemistryLesson6.tests)
    for (const question of review) expect(prompts).not.toContain(question)
    expect(JSON.stringify(notebook.checklist)).not.toMatch(/الإجابة|الحل|جواب/)
  })

  it('leaves the entire original step declaration unchanged, not only its count or IDs', () => {
    const file = readFileSync('src/data/curriculum/chemistryLesson6.ts', 'utf8')
    const steps = file.slice(file.indexOf('const steps: LessonStep[] = ['), file.indexOf('\nexport const chemistryLesson6: LessonDefinition'))
    expect(createHash('sha256').update(steps).digest('hex')).toBe('5d4e92dc71b25a45513a146490aa53da4a7ccdcbc3cd24e7dbd5e7389dbad391')
  })
})
