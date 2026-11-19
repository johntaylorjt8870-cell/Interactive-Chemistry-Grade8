import katex from 'katex'
import { describe, expect, it } from 'vitest'
import { chemistryLesson7, lesson7BookQuestionIds } from '@/data/curriculum/chemistryLesson7'
import { chemistryLesson7Notebook } from '@/data/curriculum/chemistryLesson7Notebook'
import { LESSON7_LEDGER, lesson7SourceText } from '@/data/curriculum/lesson7SourceLedger'
import {
  NOTEBOOK_SOURCES_APPENDIX_CAPTION,
  collectNotebookBodyItems,
  toArabicIndicNumber,
  validateLesson,
} from '@/data/sourceFidelity'

const notebook = chemistryLesson7Notebook
const rows = notebook.sourcesAppendix!.rows
const section = (id: string) => {
  const found = notebook.sections.find((entry) => entry.id === id)
  expect(found, `missing section ${id}`).toBeDefined()
  return found!
}
const unnumber = (text: string) => text.replace(/^[٠-٩]+ ـ /u, '')
const rowFor = (text: string) => {
  const match = rows.find((row) => text.startsWith(`${row.item} ـ `))
  expect(match, `missing source row for "${text}"`).toBeDefined()
  return match!
}
const sectionText = (id: string) => JSON.stringify(section(id))

describe('Lesson 7 student notebook — full source fidelity, coverage, and arithmetic verification', () => {
  it('passes validateLesson with zero issues and leaves Lesson 7 steps and tests untouched', () => {
    expect(chemistryLesson7.studentNotebook).toBe(notebook)
    expect(chemistryLesson7.steps).toHaveLength(33)
    expect(chemistryLesson7.tests?.map((test) => test.id)).toEqual([
      'chem-u1-l7-book',
      'chem-u1-l7-practice',
      'chem-u1-l7-final',
    ])
    expect(validateLesson(chemistryLesson7, 'chem-u1-l7')).toEqual([])
  })

  it('maintains a strict sequential 1-to-1 bijection between all body items and source rows', () => {
    const bodyItems = collectNotebookBodyItems(notebook)
    expect(notebook.hidePageTagsInBody).toBe(true)
    expect(notebook.sourcesAppendix?.caption).toBe(NOTEBOOK_SOURCES_APPENDIX_CAPTION)
    expect(bodyItems.length).toBeGreaterThanOrEqual(100)
    expect(rows).toHaveLength(bodyItems.length)

    bodyItems.forEach((item, index) => {
      const expectedNum = toArabicIndicNumber(index + 1)
      expect(item.startsWith(`${expectedNum} ـ `), `item #${index + 1}: ${item}`).toBe(true)
      const row = rows[index]!
      expect(row.item).toBe(expectedNum)
      expect(row.kind.trim()).not.toBe('')
      expect(row.classification.trim()).not.toBe('')
      expect(row.source.trim()).not.toBe('')
      expect(row.page.trim()).not.toBe('')
    })
  })

  it('covers 100% of all 194 Lesson 7 source ledger entries and all 41 book questions', () => {
    const allSources = rows.map((row) => row.source).join(' || ')

    const citedLedgerIds = new Set([...allSources.matchAll(/L7-P\d+-E\d+/gu)].map((match) => match[0]))
    expect(LESSON7_LEDGER).toHaveLength(194)
    const missingLedgerIds = LESSON7_LEDGER.map((entry) => entry.id).filter((id) => !citedLedgerIds.has(id))
    expect(missingLedgerIds).toEqual([])

    const citedQuestionIds = new Set([...allSources.matchAll(/l7-p\d+-[a-z0-9-]+/gu)].map((match) => match[0]))
    expect(lesson7BookQuestionIds).toHaveLength(41)
    const missingQuestions = lesson7BookQuestionIds.filter((qid) => !citedQuestionIds.has(qid))
    expect(missingQuestions).toEqual([])

    // Covers every single printed page 40 through 49.
    const citedPages = new Set(
      rows.flatMap((row) => [...row.page.matchAll(/\d+/gu)].map((match) => match[0])),
    )
    expect([...citedPages].sort()).toEqual(['40', '41', '42', '43', '44', '45', '46', '47', '48', '49'])
  })

  it('discloses source verification status honestly without claiming absent full-page scans were viewed', () => {
    expect(notebook.source.verified).toBe(false)
    expect(notebook.source.readability?.notes).toContain('src/assets/textbook/lesson7/')
    expect(notebook.source.readability?.notes).toContain('194')
    expect(notebook.source.readability?.notes).toContain('1.27 g')
    expect(notebook.source.readability?.notes).toContain('12.7 g')
    expect(notebook.source.readability?.notes).toContain('21%')

    // No page numbers or inline source markers inside any student-facing section.
    const bodyJson = JSON.stringify(notebook.sections)
    expect(bodyJson).not.toMatch(/L7-P\d+-E\d+/u)
    expect(bodyJson).not.toMatch(/(?:^|[\s(«،؛])(?:ص\.?\s*\d+|صفحة\s*\d+)/u)
  })

  it('preserves page 40 objectives, keywords, four-photo crop, and all 6 entry questions with answers', () => {
    const goals = section('goals-and-keywords').points!.map(unnumber)
    expect(goals.slice(0, 4)).toEqual([
      lesson7SourceText('L7-P40-E004'),
      lesson7SourceText('L7-P40-E005'),
      lesson7SourceText('L7-P40-E006'),
      lesson7SourceText('L7-P40-E007'),
    ])
    expect(goals[4]).toBe(`${lesson7SourceText('L7-P40-E008')} ${lesson7SourceText('L7-P40-E009')}`)

    const entry = section('counting-and-mole-entry')
    expect(entry.table!.rows).toHaveLength(6)
    expect(entry.table!.rows[0]!.cells.c1).toContain('12 قلماً')
    expect(entry.table!.rows[1]!.cells.c1).toContain('60 قلماً')
    expect(entry.table!.rows[2]!.cells.c1).toContain('10 دزينات')
    expect(entry.table!.rows[5]!.cells.c0).toContain('...')
    expect(entry.figures![0]).toMatchObject({ kind: 'lesson7-figure', figureKey: 'counting-objects' })
    expect(rowFor(entry.figures![0]!.caption)).toMatchObject({ page: '40' })
  })

  it('preserves page 41–42 verbatim wording, deferred white label disclosure, and the exact 16-element table', () => {
    const mole = section('mole-and-avogadro')
    expect(mole.points!.map(unnumber)).toContain('(1mol) من الماء يحتوي من 6.022 × 10²³ جزيئات الماء.')
    expect(sectionText('mole-and-avogadro')).toContain('تسمية بيضاء متداخلة باهتة غير معتمدة')
    expect(mole.figures![0]).toMatchObject({ kind: 'lesson7-figure', figureKey: 'balance-original' })

    const atomic = section('hydrogen-note-and-atomic-masses')
    expect(sectionText('hydrogen-note-and-atomic-masses')).toContain('0.16607 × 10⁻²³ × 6.022 × 10²³ = 1 g')
    expect(sectionText('hydrogen-note-and-atomic-masses')).toContain('(H:1)')
    expect(sectionText('hydrogen-note-and-atomic-masses')).toContain(
      'ومقارنتها مع الكتلة الذرّية للهيدروجين أو نظير الكربون',
    )
    expect(sectionText('hydrogen-note-and-atomic-masses')).not.toContain('كربون-12')

    const elemTable = atomic.table!
    expect(elemTable.columns.map((col) => col.header)).toEqual(['اسم العنصر', 'رمزه', 'الكتلة الذرّية'])
    expect(elemTable.rows).toHaveLength(16)
    expect(elemTable.rows[0]!.cells).toEqual({ c0: 'هيدروجين', c1: 'H', c2: '1' })
    expect(elemTable.rows[7]!.cells).toEqual({ c0: 'كلور', c1: 'Cl', c2: '35.5' })
    expect(elemTable.rows[12]!.cells).toEqual({ c0: 'المنيوم', c1: 'Al', c2: '27' })
    expect(elemTable.rows[15]!.cells).toEqual({ c0: 'نحاس', c1: 'Cu', c2: '63.5' })
  })

  it('preserves page 43 blank and solved tables, MgCl₂ example, and activity calculations', () => {
    const mm = section('molecular-molar-mass')
    expect(mm.tables).toHaveLength(2)
    // Printed blank table keeps NH3 4 blanks and CH4 printed "1 × 4" + 3 blanks.
    expect(mm.tables![0]!.rows[1]!.cells).toEqual({ c0: 'NH₃', c1: '……', c2: '……', c3: '……', c4: '……' })
    expect(mm.tables![0]!.rows[2]!.cells).toEqual({ c0: 'CH₄', c1: '……', c2: '1 × 4', c3: '……', c4: '……' })
    // Solved table supplies 18, 17, 16.
    expect(mm.tables![1]!.rows.map((r) => r.cells.c4)).toEqual(['18', '17', '16'])

    const calc = section('moles-and-mass-calculations')
    expect(sectionText('moles-and-mass-calculations')).toContain('95 g.mol⁻¹')
    expect(sectionText('moles-and-mass-calculations')).toContain('190/95 = 2 mol')
    expect(calc.table!.rows.map((r) => r.cells.c3)).toEqual([
      '98 g.mol⁻¹',
      '36 g (التّحقّق: 36 ÷ 18 = 2 mol)',
      '4 mol (التّحقّق: 4 × 17 = 68 g)',
    ])
  })

  it('preserves page 44–47 STP gas experiment, Fe worked example with 1.27 g vs 12.7 g audit, Jabir, and summary', () => {
    const gas = section('molar-gas-volume-and-stp')
    expect(sectionText('molar-gas-volume-and-stp')).toContain('t = 0°C')
    expect(sectionText('molar-gas-volume-and-stp')).toContain('P = 1atm')
    expect(sectionText('molar-gas-volume-and-stp')).toContain('273 K')
    expect(sectionText('molar-gas-volume-and-stp')).toContain('4.0 g')
    expect(sectionText('molar-gas-volume-and-stp')).toContain('32.0 g')
    expect(sectionText('molar-gas-volume-and-stp')).toContain('28.0 g')
    expect(sectionText('molar-gas-volume-and-stp')).toContain('22.4 L')
    expect(sectionText('molar-gas-volume-and-stp')).toContain('44.8/22.4')
    expect(gas.figures![0]).toMatchObject({ kind: 'lesson7-figure', figureKey: 'gases-original' })

    // Iron worked example keeps printed (aq) on p45, no (aq) and الهدروجين on p46, printed 1.27 g, and explicit 12.7 g correction.
    expect(sectionText('stoichiometry-iron-mass')).toContain('Fe + 2HCl(aq) ⟶ FeCl₂(aq) + H₂')
    expect(sectionText('stoichiometry-iron-mass')).toContain('x = (127 × 5.6)/56 = 1.27 g')
    expect(sectionText('stoichiometry-iron-mass')).toContain('12.7 g')
    const correctionNote = section('stoichiometry-iron-mass').notes![1]!
    expect(rowFor(correctionNote.text).classification).toContain('إضافة منصة')

    expect(sectionText('stoichiometry-iron-volume')).toContain('Fe + 2HCl ⟶ FeCl₂ + H₂')
    expect(sectionText('stoichiometry-iron-volume')).toContain('الهدروجين')
    expect(sectionText('stoichiometry-iron-volume')).toContain('2.24 L')

    // Jabir ibn Hayyan enrichment preserved verbatim: 721, 814م, trailing ellipsis, 3 works, original crop.
    const jabir = section('enrichment-jabir')
    expect(sectionText('enrichment-jabir')).toContain('721 ميلادي')
    expect(sectionText('enrichment-jabir')).toContain('814م')
    expect(sectionText('enrichment-jabir')).not.toContain('815')
    expect(sectionText('enrichment-jabir')).toContain('الماء الملكي، وحجر الكيّ، وطلاء يقي الحديد من الصدأ ...')
    expect(sectionText('enrichment-jabir')).toContain('كتاب الخواص الكبير، كتاب الأسرار، كتاب السّموم.')
    expect(jabir.figures![0]).toMatchObject({ kind: 'lesson7-figure', figureKey: 'jabir-original' })

    // Summary (تعلّمتُ) preserved completely including "في شروط التجربة".
    expect(sectionText('lesson-summary')).toContain('في شروط التجربة.')
    expect(section('lesson-summary').points).toHaveLength(6)
  })

  it('verifies every self-test answer across pages 48–49 including exact air volume 426.7 L under disclosed 21% O₂', () => {
    expect(section('self-test-q1').table!.rows.map((r) => r.cells.c1)).toEqual([
      'الكتلة الموليّة (الجزيئيّة)',
      'واحد مول (1 mol)',
      'متساوية',
    ])
    expect(section('self-test-q2').table!.rows.map((r) => r.cells.c3)).toEqual([
      '63 g.mol⁻¹',
      '142 g.mol⁻¹',
      '74 g.mol⁻¹',
      '40 g.mol⁻¹',
    ])
    expect(section('self-test-q3').table!.rows.map((r) => r.cells.c3)).toEqual([
      '44.8 L',
      '67.2 L',
      '112 L',
      '224 L',
    ])
    expect(sectionText('self-test-q4')).toContain('56 g.mol⁻¹')
    expect(sectionText('self-test-q4')).toContain('280 g')
    expect(sectionText('self-test-q5')).toContain('17 g.mol⁻¹')
    expect(sectionText('self-test-q5')).toContain('3 mol')
    expect(section('self-test-q6-1').table!.rows.map((r) => r.cells.c3)).toEqual([
      '22.4 L',
      '112 L',
      '44.8 L',
      '89.6 L',
      '67.2 L',
    ])
    expect(sectionText('self-test-q6-2')).toContain('58.5 g.mol⁻¹')
    expect(sectionText('self-test-q6-2')).toContain('234 g')

    // Page 49 Problem 1 (Zn + H2SO4)
    expect(sectionText('self-test-q7-zinc')).toContain('Zn + H₂SO₄ ⟶ ZnSO₄ + H₂')
    expect(sectionText('self-test-q7-zinc')).toContain('161 g.mol⁻¹')
    expect(sectionText('self-test-q7-zinc')).toContain('16.1 g')
    expect(sectionText('self-test-q7-zinc')).toContain('2.24 L')

    // Page 49 Problem 2 (CH4 + 2O2 -> CO2 + 2H2O): 32 g = 2 mol -> 4 mol O2, 72 g H2O, 44.8 L CO2, 89.6 L O2 -> 426.7 L air.
    const methane = section('self-test-q7-methane')
    expect(sectionText('self-test-q7-methane')).toContain('CH₄ + 2O₂ ⟶ CO₂ + 2H₂O')
    expect(sectionText('self-test-q7-methane')).toContain('4 mol')
    expect(sectionText('self-test-q7-methane')).toContain('72 g')
    expect(sectionText('self-test-q7-methane')).toContain('44.8 L')
    expect(sectionText('self-test-q7-methane')).toContain('89.6 L')
    expect(sectionText('self-test-q7-methane')).toContain('426.7 L')
    expect(sectionText('self-test-q7-methane')).toContain('21% حجماً')
    expect(sectionText('self-test-q7-methane')).not.toContain('213.3')

    const airNote = methane.notes![4]!
    const airRow = rowFor(airNote.text)
    expect(airRow.classification).toContain('بافتراض منصة معلن')
    expect(airRow.classification).toContain('21%')
    expect(airRow.page).toBe('49')
  })

  it('renders every display KaTeX expression cleanly without error or embedded Arabic text', () => {
    const texExpressions = notebook.sections.flatMap((sec) =>
      (sec.notes ?? []).flatMap((note) => (note.tex ? [note.tex] : [])),
    )
    expect(texExpressions.length).toBeGreaterThanOrEqual(18)

    for (const tex of texExpressions) {
      expect(tex).not.toMatch(/[\u0600-\u06FF]/u)
      const html = katex.renderToString(tex, { throwOnError: true, displayMode: true })
      expect(html).toContain('katex-display')
    }
  })
})
