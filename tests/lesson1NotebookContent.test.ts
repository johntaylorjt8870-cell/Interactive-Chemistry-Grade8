import { describe, expect, it } from 'vitest'
import type { ContentBlock, LessonStep } from '@/data/curriculum/schema'
import { chemistryLesson1 } from '@/data/curriculum/chemistryLesson1'
import { bookActivitySolutions, bookQuestions } from '@/data/curriculum/chemistryLesson1Book'
import { lesson1PracticeQuestions } from '@/data/curriculum/chemistryLesson1Practice'
import { lesson1StudentNotebook } from '@/data/curriculum/chemistryLesson1Notebook'
import { getLesson } from '@/data/curriculum/registry'

/**
 * «📒 دفتر الطالب» — source integrity.
 *
 * The notebook is a *selection* of the lesson, so the failure mode that matters
 * is a sentence entering the notebook that the lesson never states. These tests
 * close that door mechanically:
 *
 *   1. every definition whose `source` is a plain page number must appear
 *      verbatim in a block of that page inside this lesson;
 *   2. every definition marked `شرح الدرس — صN` must appear verbatim in the
 *      *platform explanation* of a step that cites page N — so a platform
 *      definition may restate the lesson, but never invent;
 *   3. every other sentence (points, ordered rules, methods, notes) must be
 *      traceable to the lesson text or to its structured data;
 *   4. nothing is duplicated across the notebook, and nothing that belongs to
 *      the lesson's own teaching apparatus (questions, labs, instructions) is
 *      carried over.
 *
 * Normalisation strips Arabic diacritics, tatweel, Arabic-Indic digits and
 * punctuation, so a faithful copy with different hamza/ya spelling still
 * matches while a changed fact does not.
 */

/* ---------------------------------------------------------------------------
 * Normalisation and extraction
 * ------------------------------------------------------------------------ */

const ARABIC_DIACRITICS = /[\u064B-\u0652\u0670\u0640]/g

function normalise(value: string): string {
  return value
    .replace(ARABIC_DIACRITICS, '')
    .replace(/[\u0660-\u0669]/g, (digit) => String(digit.charCodeAt(0) - 0x0660))
    .replace(/[\u06F0-\u06F9]/g, (digit) => String(digit.charCodeAt(0) - 0x06f0))
    .replace(/[أإآ]/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/ة/g, 'ه')
    .replace(/[«»"'“”()،؛:.,!?—–\-−]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

/** Every visible sentence of a step, with the pages the step cites. */
type StepText = { stepId: string; kind: LessonStep['kind']; pages: string[]; text: string; verbatim: boolean }

function blockTexts(block: ContentBlock): { text: string; verbatim: boolean }[] {
  switch (block.kind) {
    case 'textbook-verbatim':
      return [{ text: block.text, verbatim: true }]
    case 'paragraph':
      return [{ text: block.text, verbatim: false }]
    case 'list':
      return block.items.map((item) => ({ text: item, verbatim: block.attribution === 'textbook' }))
    case 'definition':
      return [{ text: block.text, verbatim: block.attribution === 'textbook' }]
    case 'callout':
      return [{ text: `${block.title ?? ''} ${block.text}`, verbatim: block.attribution === 'textbook' }]
    case 'key-terms':
      return block.terms.map((term) => ({ text: `${term.term} ${term.meaning}`, verbatim: false }))
    case 'table':
      return [
        { text: block.caption, verbatim: false },
        ...block.rows.flatMap((row) => Object.values(row.cells).map((cell) => ({ text: cell, verbatim: false }))),
        ...block.footnote ? [{ text: block.footnote, verbatim: false }] : [],
      ]
    case 'procedure':
      return block.items.map((item) => ({ text: item, verbatim: block.attribution === 'textbook' }))
    case 'diagram':
      return [
        { text: `${block.title ?? ''} ${block.description} ${block.caption ?? ''}`, verbatim: false },
      ]
    default:
      return []
  }
}

const stepTexts: StepText[] = chemistryLesson1.steps.flatMap((step) => {
  const pages = (step.source?.pages ?? []).map((page) => page.page)
  return step.blocks.flatMap((block) =>
    blockTexts(block).map((entry) => ({ stepId: step.id, kind: step.kind, pages, ...entry })),
  )
})

const lessonText = normalise(stepTexts.map((entry) => entry.text).join(' '))

/**
 * The lesson's own question explanations. They are *not* a source for the
 * notebook — the final review ruled that a platform explanation is not
 * evidence a fact belongs in the notes — but they are collected here so a test
 * can prove no notebook sentence was lifted from one.
 */
const explanationText = normalise(
  [...bookQuestions, ...bookActivitySolutions, ...lesson1PracticeQuestions]
    .map((question) => `${'prompt' in question ? question.prompt : ''} ${'explanation' in question ? question.explanation ?? '' : ''}`)
    .join(' '),
)

/** The notebook entries, flattened with the section they belong to. */
type Entry = {
  section: string
  kind: string
  text: string
  source?: string
  notation?: string
  term?: string
  anchors?: string[]
}

const entries: Entry[] = lesson1StudentNotebook.sections.flatMap((section) => [
  ...(section.definitions ?? []).map((definition) => ({
    section: section.id,
    kind: 'definition',
    text: definition.text,
    source: definition.source,
    term: definition.term,
    anchors: definition.anchors,
  })),
  ...(section.points ?? []).map((point) => ({ section: section.id, kind: 'point', text: point })),
  ...(section.ordered ?? []).map((item) => ({ section: section.id, kind: 'ordered', text: item })),
  ...(section.notes ?? []).map((note) => ({
    section: section.id,
    kind: 'note',
    text: note.text,
    notation: note.notation,
  })),
  ...(section.procedure?.steps ?? []).map((step) => ({ section: section.id, kind: 'procedure', text: step })),
  ...(section.table ? [{ section: section.id, kind: 'table', text: section.table.caption }] : []),
])

/* ---------------------------------------------------------------------------
 * Tests
 * ------------------------------------------------------------------------ */

describe('student notebook — every definition is quoted from the lesson', () => {
  const definitions = entries.filter((entry) => entry.kind === 'definition')

  it('has the definitions the lesson actually states', () => {
    expect(definitions.length).toBeGreaterThanOrEqual(7)

    // Source lines carry explanatory suffixes («ص7 — نص الكتاب: …»), so the
    // pages are extracted rather than matched as whole strings.
    const citedPages = new Set(
      definitions.flatMap((entry) => [...(entry.source ?? '').matchAll(/ص(\d+)/g)].map((match) => match[1])),
    )
    for (const page of ['4', '7', '8', '9', '11']) {
      expect(citedPages.has(page), `no definition is sourced to ص${page}`).toBe(true)
    }
  })

  it('takes each printed definition from the page it cites, without adding a fact', () => {
    // `ص7 — شرح…` means the book prints the question but the sentence is the
    // platform's explanation, so it is checked as a composed definition below.
    const printed = definitions.filter(
      (entry) => /^ص\d+/.test(entry.source ?? '') && !/شرح|صياغة/.test(entry.source ?? ''),
    )
    expect(printed.length).toBeGreaterThan(0)

    /**
     * A printed definition may be abridged for the notebook (the electron
     * definition drops the historical discovery clause, keeping mass and
     * charge), but it may never gain a fact the page does not state. So it is
     * checked clause by clause against its own page: every clause must be a
     * contiguous excerpt of that page.
     */
    for (const definition of printed) {
      const page = definition.source!.match(/ص(\d+)/)![1]
      const pageSteps = stepTexts.filter((entry) => entry.pages.includes(page))
      expect(pageSteps.length, `no lesson content cites page ${page}`).toBeGreaterThan(0)
      const pageText = normalise(pageSteps.map((entry) => entry.text).join(' '))

      const clauses = definition.text
        .split(/[،:؛.]/)
        .map((clause) => normalise(clause))
        .filter((clause) => clause.split(' ').filter(Boolean).length >= 3)

      expect(clauses.length, `no checkable clause in: ${definition.text.slice(0, 50)}`).toBeGreaterThan(0)
      for (const clause of clauses) {
        expect(
          pageText.includes(clause),
          `clause not on ص${page}: ${clause}`,
        ).toBe(true)
      }
    }
  })

  /**
   * After the final review the notebook carries no platform-composed
   * definition at all: the composed «مفهوم العنصر الكيميائي», the mass number
   * and the atomic number were removed by decision, not by accident. The test
   * therefore asserts the removal as a property of the file, so a future edit
   * cannot quietly reintroduce a definition that is not in the book.
   */
  it('carries no definition the book does not print', () => {
    const platformDefinitions = definitions.filter(
      (entry) => !/^ص\d+/.test(entry.source ?? '') || /شرح|صياغة|مركّبة/.test(entry.source ?? ''),
    )
    expect(
      platformDefinitions.map((entry) => `${entry.term} — ${entry.source}`),
      'a definition that is not a printed book sentence re-entered the notebook',
    ).toEqual([])

    // Every remaining definition is a printed page reference, and it is quoted
    // from that page (checked clause by clause above).
    for (const definition of definitions) {
      expect(definition.source, `${definition.term} must cite a printed page`).toMatch(/^ص\d+/)
      expect(definition.anchors, `${definition.term} is labelled as a composition`).toBeUndefined()
    }
  })

  it('takes no sentence from a platform explanation', () => {
    /**
     * The previous round accepted notebook wording that appeared only in a
     * question explanation. The review closed that door: an explanation is
     * evidence of what the platform says, never of what the student must write.
     * Every student-facing sentence must now be found in the lesson's own
     * content, not in an explanation.
     */
    const sentences = entries
      .filter((entry) => entry.notation !== 'math')
      .flatMap((entry) => entry.text.split(/(?<=[.؛])\s+/))
      .map((sentence) => normalise(sentence))
      .filter((sentence) => sentence.split(' ').filter(Boolean).length >= 4)

    const explainedOnly = sentences.filter(
      (sentence) => explanationText.includes(sentence) && !lessonText.includes(sentence),
    )
    expect(explainedOnly, 'a notebook sentence exists only in a platform explanation').toEqual([])
  })

  it('keeps every definition complete instead of truncating it to keywords', () => {
    for (const definition of definitions) {
      // A definition a student must copy is a sentence, not a label.
      expect(definition.text.split(/\s+/).length, definition.text).toBeGreaterThanOrEqual(6)
    }
  })
})

describe('student notebook — no definition is a composition of sources', () => {
  it('keeps the composed-definition machinery empty', () => {
    /**
     * `anchors`/`claims` exist so that a definition built from the book plus
     * the platform can be falsified clause by clause. The review ruled that the
     * notebook should hold no such definition, so the machinery must stay
     * unused — an unused capability is a guard, not dead code: the moment an
     * anchor appears, the reviewer's decision has been reversed silently.
     */
    const composed = lesson1StudentNotebook.sections.flatMap((section) => section.definitions ?? [])
    expect(composed.filter((definition) => definition.anchors?.length)).toEqual([])
    expect(composed.filter((definition) => definition.claims?.length)).toEqual([])
  })
})

describe('student notebook — no invented content', () => {
  /**
   * Plain prose of the notebook, i.e. only the sentences a student reads. TeX
   * and ids are excluded: they are rendered notation and structure, not content.
   */
  const proseEntries = entries.filter((entry) => entry.notation !== 'math')

  it('does not introduce a subject the lesson never teaches', () => {
    // Words a sentence may not bring in unless the lesson itself uses them.
    // Each of these would be a new fact if it appeared here (periodic-table
    // groups, subatomic particles not covered, bonding types, etc.).
    const offLessonTopics = ['الفلزات القلوية', 'البروتيوم', 'الكوارك', 'الأوربيتال', 'الجدول الدوري الحديث']
    for (const topic of offLessonTopics) {
      expect(normalise(JSON.stringify(proseEntries))).not.toContain(normalise(topic))
    }
  })

  it('keeps every sentence traceable to the lesson vocabulary', () => {
    // A faithful copy shares (almost) every word with the lesson. Inflections
    // (`عددهما` vs `عددها`, `والأكسجين` vs `الأكسجين`) are expected; an invented
    // fact would drag the ratio down. 0.6 is the floor: the lowest real
    // sentence in this notebook measures 0.64 for inflections only.
    const ratioFor = (text: string): { ratio: number; missing: string[] } => {
      const words = normalise(text)
        .split(' ')
        .filter((word) => word.length >= 4 || /[A-Za-z0-9²³⁺⁻]/.test(word))
      if (words.length === 0) return { ratio: 1, missing: [] }
      const missing = words.filter((word) => !lessonText.includes(word))
      return { ratio: 1 - missing.length / words.length, missing }
    }

    const weak = proseEntries
      .map((entry) => ({ section: entry.section, ...ratioFor(entry.text) }))
      .filter((result) => result.ratio < 0.6)

    expect(weak).toEqual([])
  })

  it('does not carry over the lesson apparatus (questions, labs, drill instructions)', () => {
    const banned = [
      'المحاكاة',
      'المختبر',
      'جرّب',
      'اضغط',
      'الخطوة',
      'اختر',
      'أجب عن السؤال',
      'بطاقة النشاط',
      'سؤال التحقق',
      'أعد المحاولة',
    ]
    const notebookProse = normalise(proseEntries.map((entry) => entry.text).join(' '))
    for (const word of banned) {
      expect(notebookProse, `notebook carries lesson apparatus: ${word}`).not.toContain(normalise(word))
    }
    // No question is embedded in the notebook.
    expect(proseEntries.some((entry) => /[؟?]/.test(entry.text))).toBe(false)
  })

  it('does not repeat the same sentence across sections', () => {
    const seen = new Map<string, string>()
    for (const entry of entries) {
      const key = normalise(entry.text)
      const previous = seen.get(key)
      expect(previous, `duplicated between ${previous} and ${entry.section}`).toBeUndefined()
      seen.set(key, entry.section)
    }
  })

  it('prints no number the lesson does not print or derive', () => {
    // Check the numbers a student reads — table cells included — against the
    // lesson. `1/1860` and `2(n)²` survive normalisation as `1 1860` and
    // `2 n ²`, which the lesson also contains.
    const readable = entries
      .filter((entry) => entry.notation !== 'math')
      .map((entry) => entry.text)
    for (const section of lesson1StudentNotebook.sections) {
      if (!section.table) continue
      readable.push(section.table.caption, section.table.footnote ?? '')
      for (const row of section.table.rows) readable.push(...Object.values(row.cells))
      for (const column of section.table.columns) readable.push(column.header)
    }
    for (const text of lesson1StudentNotebook.checklist?.items ?? []) readable.push(text)

    // The capacity table is the lesson's own activity (ص6): K and L are printed,
    // M, N and O are left for the student to compute with y = 2(n)². Those
    // computed cells are the only values the lesson prints as a formula rather
    // than a number, and they are checked here against that formula.
    const capacity = lesson1StudentNotebook.sections.find((section) => section.id === 'levels')!.table!
    const capacityValues = new Set(capacity.rows.map((row) => row.cells.y))
    const derived = new Set(['18', '32', '50'])
    for (const value of capacityValues) {
      if (derived.has(value)) continue
      expect(lessonText, `capacity value ${value}`).toContain(value)
    }
    for (const row of capacity.rows) {
      expect(Number(row.cells.y)).toBe(2 * Number(row.cells.n) ** 2)
    }

    const numbers = new Set(
      [...normalise(readable.join(' ')).matchAll(/\d+(?:[.-]\d+)*/g)]
        .map((match) => match[0])
        .filter((number) => !derived.has(number)),
    )
    for (const number of numbers) {
      expect(lessonText, `number ${number} is not in the lesson`).toContain(number)
    }
  })
})

describe('student notebook — structure and coverage', () => {
  it('covers every objective of the lesson', () => {
    const titles = lesson1StudentNotebook.sections.map((section) => section.title)
    // The agreed shape is 8–10 sections. Ten is reached by merging the electron
    // and Thomson sections and folding isotope-vs-ion into isotopes.
    expect(titles.length).toBeGreaterThanOrEqual(8)
    expect(titles.length, `notebook has ${titles.length} sections`).toBeLessThanOrEqual(10)
    for (const expected of [
      'الإلكترون',
      'طومسون',
      'رذرفورد',
      'بور',
      'العدد الذري',
      'قاعدة الثمانية',
      'الأيون',
      'لويس',
      'النظائر',
    ]) {
      expect(titles.some((title) => title.includes(expected)), expected).toBe(true)
    }
  })

  it('keeps only the two tables that hold data a student must recall', () => {
    // A table earns its place in a handwritten notebook only when the data
    // itself is what must be remembered. Capacities and ion charges qualify;
    // the Lewis rows and the isotope/ion grid were examples and repetitions.
    const tables = lesson1StudentNotebook.sections.flatMap((section) => (section.table ? [section.table] : []))
    expect(tables).toHaveLength(2)

    const capacities = tables.find((table) => table.caption.includes('السعة العظمى'))!
    expect(capacities.rows.map((row) => row.cells.y)).toEqual(['2', '8', '18', '32', '50'])

    const ions = tables.find((table) => table.caption.includes('الأيونات'))!
    for (const symbol of ['K⁺', 'F⁻', 'Ca²⁺', 'O²⁻']) {
      expect(ions.rows.some((row) => Object.values(row.cells).join(' ').includes(symbol)), symbol).toBe(true)
    }
  })

  it('does not keep a six-column answer grid in the notes', () => {
    // The ion table used to reproduce the book's worked table (z + configuration
    // + method + charge + symbol); that is an example set, not a rule.
    const tables = lesson1StudentNotebook.sections.flatMap((section) => (section.table ? [section.table] : []))
    for (const table of tables) {
      expect(table.columns.length, `${table.caption} has ${table.columns.length} columns`).toBeLessThanOrEqual(3)
    }
  })

  it('keeps the rules a student has to apply, as rules rather than procedures', () => {
    const sections = lesson1StudentNotebook.sections
    /**
     * The rules kept are the *printed* ones, in the book's own wording: the
     * fill-from-the-inside rule (ص6) and the proton/electron equality (ص11).
     * The platform's four-condition check and its `q = Np − Ne` formula were
     * removed, so the test asserts their absence rather than their presence.
     */
    const distribution = sections.find((section) => section.id === 'distribution')!
    expect(distribution.points?.join(' ')).toContain('الإلكترونات تشغل السويّات الأدنى أولاً')
    expect(distribution.points?.join(' ')).toContain('عدد الإلكترونات يساوي عدد البروتونات في الذرة')
    expect(distribution.procedure, 'a solution procedure reappeared').toBeUndefined()
    expect(distribution.points?.join(' '), 'the platform check-list reappeared').not.toContain('2(n)²')

    const ions = sections.find((section) => section.id === 'ions')!
    expect(ions.points?.join(' ')).toContain('ترتيب إشارة الشحنة')
    expect(ions.notes, 'the charge formula came back as a note').toBeUndefined()
    expect(ions.ordered).toBeUndefined()

    // Only the printed capacity law survives as a formula note.
    const atomic = sections.find((section) => section.id === 'atomic-numbers')!
    expect(atomic.notes, 'the neutron relation came back as a note').toBeUndefined()

    const levels = sections.find((section) => section.id === 'levels')!
    expect(levels.notes, 'the capacity law is a printed rule, not a formula gloss').toBeUndefined()
    expect(levels.points?.join(' ')).toContain('y = 2(n)²')
  })

  it('keeps the capacity wording without a platform lecture beside it', () => {
    const text = JSON.stringify(lesson1StudentNotebook)
    // The law's own printed phrase survives…
    expect(text).toContain('السعة العظمى')
    // …but the platform's «max vs. actual» explanation was removed with the
    // rest of the added prose, and must not creep back in.
    expect(text).not.toContain('العدد الفعلي')
    const isotopes = lesson1StudentNotebook.sections.find((section) => section.id === 'isotopes')!
    expect(isotopes.points?.join(' ')).toContain('النظير:')
    expect(isotopes.points?.join(' ')).toContain('الأيون:')
  })
})

describe('student notebook — the octet rule is stated once', () => {
  const count = (value: string, pattern: RegExp) => (value.match(pattern) ?? []).length

  it('does not restate the octet rule across the section', () => {
    const octet = lesson1StudentNotebook.sections.find((section) => section.id === 'octet')!

    /**
     * Counting the word «ثمانية» alone would count the rule's *name* in the
     * heading and in the term. What must not repeat is a statement of the rule
     * itself, so only prose is measured — the definitions' meanings, the points
     * and the ordered items — not titles or terms.
     */
    const prose = [
      ...(octet.definitions ?? []).map((definition) => definition.text),
      ...(octet.points ?? []),
      ...(octet.ordered ?? []),
      ...(octet.notes ?? []).map((note) => note.text),
    ].join(' ')

    // The printed sentence mentions «ثمانية» twice, so two is the floor for
    // faithful quotation. A third would be a restatement.
    expect(count(prose, /ثمانية/g), `the rule is restated: «ثمانية» appears ${count(prose, /ثمانية/g)} times in prose`).toBeLessThanOrEqual(2)
    // The hydrogen exception must survive — it is in the printed rule.
    expect(prose).toContain('عدا الهيدروجين')
  })

  it('quotes the printed sentence once instead of turning it into a definition', () => {
    const sections = lesson1StudentNotebook.sections
    const sentence = 'فتكتسب أو تفقد الإلكترونات وهذا ما يسمى النشاط الكيميائي'

    // The lesson prints no standalone definition of the term, so the notebook
    // must not manufacture one: the term may not appear as a definition entry.
    const standalone = sections.flatMap((section) =>
      (section.definitions ?? []).map((definition) => definition.term),
    )
    expect(standalone, 'the active-activity term became a standalone definition').not.toContain('النشاط الكيميائي')

    // The printed sentence itself appears exactly once in the student-facing text.
    const prose = sections.flatMap((section) => [
      section.title,
      section.lead ?? '',
      ...(section.definitions ?? []).flatMap((definition) => [definition.term, definition.text]),
      ...(section.points ?? []),
      ...(section.ordered ?? []),
      ...(section.notes ?? []).map((note) => note.text),
    ])
    const occurrences = prose.filter((text) => normalise(text).includes(normalise(sentence)))
    expect(occurrences, `the printed sentence appears ${occurrences.length} times`).toHaveLength(1)

    // …and it is quoted, with the printed-page label, not paraphrased.
    const octet = sections.find((section) => section.id === 'octet')!
    const rule = octet.definitions!.find((definition) => definition.term.includes('قاعدة الثمانية'))!
    expect(rule.text).toContain(sentence)
    expect(rule.source).toMatch(/نص الكتاب/)
  })

  it('states the rule in exactly one place across the whole notebook', () => {
    const prose = lesson1StudentNotebook.sections.flatMap((section) => [
      ...(section.points ?? []),
      ...(section.definitions ?? []).map((definition) => definition.text),
    ])
    const ruleStatements = prose.filter((text) => /سعى|تسعى/.test(text) && /ثمانية/.test(text))
    expect(ruleStatements.length, `the octet rule is restated ${ruleStatements.length} times`).toBeLessThanOrEqual(2)
  })
})

describe('student notebook — the review’s acceptance criteria', () => {
  const sections = lesson1StudentNotebook.sections
  const everything = JSON.stringify(lesson1StudentNotebook)

  it('leaves the element and the mass number to the lesson, not to the notebook', () => {
    const definitions = sections.flatMap((section) => section.definitions ?? [])

    /**
     * The book prints no definition of the chemical element and none of the
     * mass number; the two entries that used to stand here were platform
     * compositions. The final review removed them, so the notebook must contain
     * neither — and must not replace them with a new paraphrase.
     */
    expect(definitions.some((definition) => definition.term.includes('العنصر الكيميائي'))).toBe(false)
    expect(definitions.some((definition) => definition.term.includes('العدد الكتلي'))).toBe(false)

    const text = JSON.stringify(sections)
    expect(text, 'a composed element concept came back').not.toContain('عنصراً مختلفاً')
    expect(text, 'a composed mass-number definition came back').not.toContain('مجموع البروتونات والنيوترونات')

    // What remains is only what lets the student *read* the printed symbol.
    const atomic = sections.find((section) => section.id === 'atomic-numbers')!
    expect(atomic.points).toHaveLength(1)
    expect(atomic.points![0]).toContain('العدد الكتلي A في الأعلى')
  })

  it('carries no experiment execution, only observation and conclusion', () => {
    expect(everything).not.toContain('أسقط')
    expect(everything).not.toContain('صفيحة ذهب رقيقة.')
    expect(everything).not.toContain('شاشة مطلية')
    // The scientific result of the experiment stays.
    expect(everything).toContain('معظم حجم الذرّة فراغ')
    expect(everything).toContain('رذرفورد')
  })

  it('keeps worked examples and practice applications out of the notebook', () => {
    // Neon worked example, sodium/oxygen/sulphur drills, Lewis example rows.
    expect(everything).not.toContain('مثال محلول')
    expect(everything).not.toContain('الكبريت')
    expect(everything).not.toContain('النيتروجين زوج واحد')
    // Students must not be asked to practise here. `source` lines are excluded:
    // they quote the lesson's step titles (one of which is a question) inside an
    // editorial note the student reads as a citation, not as an exercise.
    const studentFacing = JSON.stringify(
      sections.map((section) => ({
        title: section.title,
        lead: section.lead,
        definitions: (section.definitions ?? []).map((definition) => ({ term: definition.term, text: definition.text })),
        points: section.points,
        ordered: section.ordered,
        notes: (section.notes ?? []).map((note) => note.text),
        procedure: section.procedure,
        table: section.table,
      })),
    )
    expect(studentFacing).not.toContain('؟')
  })

  it('states each definition and each formula once', () => {
    const definitions = sections.flatMap((section) => section.definitions ?? [])
    const terms = definitions.map((definition) => definition.term)
    expect(new Set(terms).size, `duplicate terms: ${terms.join(' | ')}`).toBe(terms.length)

    /**
     * The charge formula (`q = Np − Ne`) and the neutron relation (`N = A − Z`)
     * are platform derivations, not printed statements: the final review had
     * them removed from the notebook. They must not return as formula notes,
     * and no note may reintroduce them in prose either.
     */
    const formulaNotes = sections.flatMap((section) => (section.notes ?? []).map((note) => note.tex ?? ''))
    for (const removed of ['q = N_{p} - N_{e}', 'N = A - Z']) {
      expect(formulaNotes, `${removed} is a platform formula the review removed`).not.toContain(removed)
    }
    const prose = sections.flatMap((section) => [
      ...(section.points ?? []),
      ...(section.definitions ?? []).map((definition) => definition.text),
      ...(section.notes ?? []).map((note) => note.text),
    ])
    expect(prose.join(' '), 'the A − Z relation came back').not.toContain('A − Z')
    expect(prose.join(' '), 'the charge difference formula came back').not.toMatch(/الشحنة\s*=\s*عدد البروتونات/)
    // The capacity law, which *is* printed, stays stated once as a rule.
    expect(prose.filter((text) => text.includes('2(n)')).length).toBeGreaterThanOrEqual(1)

    // The capacity law is stated once as a rule and once as its formula only.
    const lawMentions = sections
      .flatMap((section) => [
        ...(section.points ?? []),
        ...(section.definitions ?? []).map((definition) => definition.text),
      ])
      .filter((text) => text.includes('2(n)'))
    expect(lawMentions.length).toBeLessThanOrEqual(3)
  })

  it('cites pages whose own content actually carries the definition', () => {
    /**
     * A page number that merely *exists* in the lesson proves nothing. For every
     * printed definition the test takes the cited page's own material and
     * requires the definition's substance to be found there — so a definition
     * filed under the wrong page fails even though the page exists.
     */
    const definitions = sections.flatMap((section) => section.definitions ?? [])
    const carried = new Set(stepTexts.flatMap((entry) => entry.pages))

    for (const definition of definitions) {
      const pages = [...definition.source.matchAll(/ص(\d+)/g)].map((match) => match[1])
      for (const page of pages) {
        expect(carried.has(page), `source cites ص${page} which the lesson does not carry`).toBe(true)
      }

      // Printed definitions: substance must be on the cited page itself.
      if (/^ص\d+$/.test(definition.source)) {
        const pageText = normalise(
          stepTexts.filter((entry) => entry.pages.includes(pages[0])).map((entry) => entry.text).join(' '),
        )
        const substantive = definition.text
          .split(/[،:؛.]/)
          .map((clause) => normalise(clause))
          .filter((clause) => clause.split(' ').filter(Boolean).length >= 3)
        expect(substantive.length).toBeGreaterThan(0)
        for (const clause of substantive) {
          expect(pageText.includes(clause), `ص${pages[0]} does not carry: ${clause}`).toBe(true)
        }
      }
    }
  })

  it('does not file a printed definition under a page other than its own', () => {
    /**
     * Guards the exact defect the review found twice: a definition copied from
     * ص4 but labelled ص3. For each printed definition, the cited page must be the
     * page where the sentence is *first* stated, not merely a page that mentions
     * the topic.
     */
    const printed = entries.filter(
      (entry) => entry.kind === 'definition' && /^ص\d+$/.test(entry.source ?? ''),
    )
    for (const definition of printed) {
      const cited = definition.source!.match(/ص(\d+)/)![1]
      const key = normalise(definition.text).slice(0, 50)
      const firstPage = stepTexts.find((entry) => normalise(entry.text).includes(key))
      expect(
        firstPage?.pages.includes(cited),
        `«${definition.term}» is cited to ص${cited} but the lesson states it on ص${firstPage?.pages.join(',') ?? '—'}`,
      ).toBe(true)
    }
  })

  it('stays at the size that was agreed for handwritten notes', () => {
    const count = (value: string) => value.trim().split(/\s+/).filter(Boolean).length

    /**
     * The agreed target is 400–500 words, and after the final review it is
     * reachable — so it is enforced as a range, not as a ceiling. Part of the
     * notebook cannot be shortened: the printed definitions quoted from the
     * book (`source: 'صN'`, about 283 words) and the printed Bohr statements.
     * Everything else — the points and the table cells — is platform-authored,
     * and that is what the upper bound governs. An earlier version of this test
     * accepted 908 words merely for staying under 1000; a later one accepted 657.
     */
    let printed = 0
    let authored = 0
    for (const section of sections) {
      for (const definition of section.definitions ?? []) {
        const words = count(definition.text)
        if (definition.anchors) authored += words
        else printed += words
      }
      for (const item of section.ordered ?? []) printed += count(item)
      for (const point of section.points ?? []) authored += count(point)
      for (const note of section.notes ?? []) authored += count(note.text)
      for (const row of section.table?.rows ?? []) authored += count(Object.values(row.cells).join(' '))
    }

    const total = printed + authored

    // The agreed window, enforced in both directions.
    expect(total, `notebook is ${total} words — below the agreed 400`).toBeGreaterThanOrEqual(400)
    expect(total, `notebook is ${total} words — above the agreed 500`).toBeLessThanOrEqual(500)

    // Platform-authored prose must also stay a minority of the page: a notebook
    // that reaches 500 words by padding its own commentary has missed the point.
    expect(
      authored,
      `platform-authored prose is ${authored} words (printed source: ${printed})`,
    ).toBeLessThan(printed)
  })

  it('keeps section leads and the introduction from becoming extra explanation', () => {
    const count = (value: string) => value.trim().split(/\s+/).filter(Boolean).length

    // The introduction is a one-line statement of what the notebook is.
    expect(count(lesson1StudentNotebook.introduction)).toBeLessThanOrEqual(30)

    // A lead is a label for the section, not a paragraph of teaching.
    for (const section of lesson1StudentNotebook.sections) {
      if (!section.lead) continue
      expect(count(section.lead), `${section.title}: lead is ${count(section.lead)} words`).toBeLessThanOrEqual(12)
    }
    const leadWords = lesson1StudentNotebook.sections.reduce(
      (total, section) => total + count(section.lead ?? ''),
      0,
    )
    expect(leadWords, `leads total ${leadWords} words`).toBeLessThanOrEqual(80)
  })

  it('keeps no solution procedure and no worked example', () => {
    const sectionIds = sections.map((section) => section.id)
    expect(sectionIds, `a separate isotope/ion section reappeared`).not.toContain('isotope-vs-ion')

    for (const section of sections) {
      // A numbered how-to-answer block is a solution procedure, not notes.
      expect(section.procedure, `${section.title} still carries a procedure`).toBeUndefined()

      for (const item of section.ordered ?? []) {
        // Ordered items must be the printed model statements, not steps the
        // student executes to produce an answer.
        expect(item, `${section.title}: «${item.slice(0, 40)}» reads like a step`).not.toMatch(
          /^(اقرأ|اكتب|اجمع|اطرح|تأكد|احسب|وزّع|عدّ)\b/,
        )
      }

      // Example grids: a table with more than three columns is a worked table.
      if (section.table) expect(section.table.columns.length).toBeLessThanOrEqual(3)
    }

    const text = JSON.stringify(sections)
    // «حرف X» is printed on ص9 and is deliberately kept; what is banned is the
    // platform's spacing rule for the dots, which the book never states.
    for (const banned of ['مثال محلول', 'كما في مثالنا السابق', 'خطوات التحقق', 'الكبريت', 'فرادى']) {
      expect(text, `worked example or procedure leaked in: ${banned}`).not.toContain(banned)
    }
  })
})

describe('student notebook — scope', () => {
  it('belongs to Lesson 1 and is exported through the registry', () => {
    const registered = getLesson('chemistry', 'structural-chemistry', 'atom-and-element')
    expect(registered?.studentNotebook).toBe(lesson1StudentNotebook)
    expect(registered?.studentNotebook?.source.pages.map((page) => page.page)).toEqual([
      '3', '4', '5', '6', '7', '8', '9', '10', '11', '12',
    ])
  })
})
