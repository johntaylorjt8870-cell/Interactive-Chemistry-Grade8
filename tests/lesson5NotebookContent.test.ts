import { describe, expect, it } from 'vitest'
import { chemistryLesson5, chemistryLesson5StudentNotebook as notebook } from '@/data/curriculum/chemistryLesson5'
import { LESSON5_LEDGER, LESSON5_OBJECTIVES } from '@/data/curriculum/lesson5SourceLedger'

const textbookBlocks = chemistryLesson5.steps.flatMap((step) => step.blocks)
const printed = textbookBlocks.filter((block) => block.kind === 'textbook-verbatim')
const section = (id: string) => notebook.sections.find((item) => item.id === id)!
const allPoints = notebook.sections.flatMap((s) => s.points ?? [])
const allDefinitions = notebook.sections.flatMap((s) => s.definitions ?? [])
const allFigures = notebook.sections.flatMap((s) => s.figures ?? [])

describe('Lesson 5 notebook — complete educational content', () => {
  it('contains all four objectives and keywords verbatim', () => {
    const objectivesSection = section('objectives-and-keywords')
    for (const objective of LESSON5_OBJECTIVES) {
      expect(objectivesSection.points).toContain(objective.text)
    }
    expect(objectivesSection.points!.join(' ')).toContain('الكلمات المفتاحية')
    expect(objectivesSection.points!.join(' ')).toContain('قانون انحفاظ الكتلة')
  })

  it('quotes both laws in full with exact textbook wording', () => {
    expect(allDefinitions.length).toBeGreaterThanOrEqual(2)
    const lavoisier = allDefinitions.find((d) => d.term.includes('لافوازييه'))!
    const proust = allDefinitions.find((d) => d.term.includes('بروست'))!
    expect(lavoisier).toBeDefined()
    expect(proust).toBeDefined()
    expect(lavoisier.text).toContain('قانون مصونيّة الكتلة')
    expect(proust.text).toContain('مهما اختلفت طرائق تحضيره')
    // Must match printed verbatim blocks
    for (const definition of [lavoisier, proust]) {
      expect(printed.some((block) => block.text === definition.text)).toBe(true)
    }
  })

  it('preserves atom conclusions and enrichment verbatim', () => {
    const atomSection = section('atom-conclusion')
    expect(atomSection.points).toContain('يتساوى عدد ذرّات كلّ عنصر في المواد المتفاعلة مع عدد ذرّاته في المواد النّاتجة.')
    expect(atomSection.points).toContain('يحافظ التَّفاعل الكيميائي على نوع العنصر، وعدد ذرّاته.')
    const enrichment = section('enrichment-bicarbonate')
    expect(enrichment.points!.join(' ')).toContain('بيكربونات الصّوديوم مسحوق أبيض')
  })

  it('includes complete apparatus list and four experiment steps', () => {
    const exp = section('mass-experiment')
    expect(exp.points!.join(' ')).toContain('ميزان إلكتروني')
    expect(exp.points!.join(' ')).toContain('CaO')
    expect(exp.points!.join(' ')).toContain('HCl')
    expect(exp.ordered!.length).toBe(4)
    expect(exp.ordered![0]).toContain('أضعُ باستخدام الملقط')
    expect(exp.points!.join(' ')).toContain('125.100')
    expect(exp.points!.join(' ')).not.toContain('وحدة مطبوعة مضاف')
  })

  it('explains closed/open system distinction with table', () => {
    const boundaries = section('system-boundaries')
    expect(boundaries.points!.join(' ')).toContain('نظام مغلق')
    expect(boundaries.points!.join(' ')).toContain('نظام مفتوح')
    expect(boundaries.table).toBeDefined()
    expect(boundaries.table!.rows.length).toBe(2)
  })

  it('provides solved worked examples for both laws with step-by-step procedures', () => {
    const massExample = section('worked-mass')
    expect(massExample.procedure).toBeDefined()
    expect(massExample.procedure!.steps.join(' ')).toContain('7 + 4 = 11')
    expect(allPoints.join(' ')).toContain('46 + 4 = 50')
    const proustExample = section('worked-proust')
    expect(proustExample.procedure).toBeDefined()
    expect(proustExample.procedure!.steps.join(' ')).toContain('3 − 1.56 = 1.44')
  })

  it('includes complete trials figure and solved table for lead/sulfur with 5 questions', () => {
    const trials = section('proust-trials')
    expect(trials.points!.join(' ')).toContain('10 غرام رصاص')
    expect(trials.figures!.some((f) => f.id === 'fig-trials')).toBe(true)
    const tableSection = section('proust-table')
    expect(tableSection.table).toBeDefined()
    expect(tableSection.table!.rows).toHaveLength(3)
    expect(tableSection.table!.rows[1]!.cells.sulfurLeft).toBe('1.44')
    expect(tableSection.table!.rows[2]!.cells.leadLeft).toBe('8')
    expect(tableSection.table!.rows[0]!.cells.ratio).toContain('6.41')
    expect(tableSection.ordered!.length).toBe(5)
    expect(tableSection.ordered!.join(' ')).toContain('خطأ مطبعي')
  })

  it('covers both iron/sulfur activities with completed ratio table and 60/30 solution', () => {
    const iron = section('iron-sulfur')
    expect(iron.table).toBeDefined()
    expect(iron.table!.rows.find((r) => r.id === 'ratio')!.cells.case1).toBe('1.75')
    expect(iron.procedure).toBeDefined()
    expect(iron.procedure!.steps.join(' ')).toContain('52.5')
    expect(iron.procedure!.steps.join(' ')).toContain('7.5')
    expect(iron.procedure!.steps.join(' ')).toContain('82.5')
  })

  it('preserves learned summary verbatim', () => {
    const learned = section('learned-summary')
    expect(learned.points!.join(' ')).toContain('قانون لافوازييه')
    expect(learned.points!.join(' ')).toContain('قانون بروست')
  })

  it('compares both laws in a dedicated table', () => {
    const comp = section('laws-comparison')
    expect(comp.table).toBeDefined()
    expect(comp.table!.rows.length).toBe(5)
  })

  it('includes self-test questions with full model solutions', () => {
    const q1 = section('self-test-1')
    expect(q1.procedure!.steps.join(' ')).toContain('16 / 2')
    expect(q1.points!.join(' ')).toContain('8:1')
    const q2 = section('self-test-2')
    expect(q2.procedure!.steps.join(' ')).toContain('متساوية في طرفي المعادلة')
    expect(q2.procedure!.steps.join(' ')).toContain('يساوي')
    const q3 = section('self-test-3')
    expect(q3.table).toBeDefined()
    expect(q3.table!.rows[2]!.cells.sample1).toContain('2.66')
    expect(q3.procedure!.steps.join(' ')).toContain('1.5')
    expect(q3.procedure!.steps.join(' ')).toContain('26.666')
    expect(q3.procedure!.steps.join(' ')).toContain('قانون النسب الثابتة')
  })

  it('retains the printed values 125.100 and 2.66 correctly and distinguishes exact calculation', () => {
    const text = JSON.stringify(notebook)
    expect(text).toContain('125.100')
    expect(text).toContain('2.66')
    expect(text).toContain('2.666')
    expect(text).toContain('8/3')
  })

  it('provides correct chemical formulas and equations', () => {
    const text = JSON.stringify(notebook)
    expect(text).toContain('CH3COOH')
    expect(text).toContain('NaHCO3')
    expect(text).toContain('CH3COONa')
    expect(text).toContain('CO2')
    expect(text).toContain('H2O')
    expect(text).toContain('CaO')
    expect(text).toContain('HCl')
    expect(text).toContain('CaCl2')
  })

  it('keeps external enrichment exclusively in enrichment with references', () => {
    const enriched = notebook.sections.flatMap((s) => s.enrichment ?? [])
    expect(enriched.length).toBe(2)
    for (const item of enriched) {
      expect(item.reference).toBe('OpenStax')
      expect(item.url).toMatch(/^https:\/\//)
      expect(item.why.length).toBeGreaterThan(10)
    }
    expect(allPoints.join(' ')).not.toContain(enriched[0]!.text)
  })

  it('contains required static figures with reconstruction labels', () => {
    expect(allFigures.length).toBeGreaterThanOrEqual(3)
    expect(allFigures.some((f) => f.id === 'fig-balance')).toBe(true)
    expect(allFigures.some((f) => f.id === 'fig-scale')).toBe(true)
    expect(allFigures.some((f) => f.id === 'fig-trials')).toBe(true)
    for (const fig of allFigures) {
      expect(fig.caption.length).toBeGreaterThan(10)
      expect((fig as any).reconstruction).toBe(true)
    }
  })

  it('has a single sources appendix with one row per documented item and no page numbers in body', () => {
    expect(notebook.sourcesAppendix).toBeDefined()
    expect(notebook.sourcesAppendix!.caption).toBe('جدول مصادر بنود دفتر الطالب')
    expect(notebook.sourcesAppendix!.rows.length).toBeGreaterThanOrEqual(30)
    const bodyText = JSON.stringify(notebook.sections)
    // Body must not contain page number patterns like "ص30"
    expect(bodyText).not.toMatch(/ص\d/)
    expect(bodyText).not.toMatch(/\[كتاب\]|\[حل نشاط\]|\[منصة\]/)
    // Each row must have page
    for (const row of notebook.sourcesAppendix!.rows) {
      expect(row.item.length).toBeGreaterThan(0)
      expect(row.kind.length).toBeGreaterThan(0)
      expect(row.classification.length).toBeGreaterThan(0)
      expect(row.source.length).toBeGreaterThan(0)
      expect(row.page.length).toBeGreaterThan(0)
    }
  })

  it('maps ledger entries to notebook or appendix', () => {
    const serialized = JSON.stringify(notebook)
    const relevant = LESSON5_LEDGER.filter((e) => e.status !== 'decorative')
    for (const entry of relevant) {
      const inNotebook = serialized.includes(entry.sourceSummary.slice(0, 20)) || serialized.includes(entry.id)
      const inAppendix = notebook.sourcesAppendix!.rows.some((r) => r.source.includes(entry.id) || r.page === entry.page)
      expect(inNotebook || inAppendix, entry.id).toBe(true)
    }
  })

  it('keeps review checklist separate and distinct from assessment prompts', () => {
    expect(notebook.checklist).toBeDefined()
    expect(notebook.checklist!.items.length).toBeGreaterThanOrEqual(5)
    expect(notebook.checklist!.title).not.toContain('ص')
    const reviewText = JSON.stringify(notebook.checklist)
    expect(reviewText).not.toMatch(/الإجابة الصحيحة|حل نموذجي/)
  })

  it('does not duplicate laboratory interactivity as required content', () => {
    const text = JSON.stringify(notebook)
    // Interactive IDs should not appear in notebook; static figures replace them
    expect(text).not.toContain('lesson5-atom-count-lab')
    expect(text).not.toContain('lesson5-mass-boundary-lab')
    expect(text).not.toContain('lesson5-fixed-ratio-lab')
  })
})
