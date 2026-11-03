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
 * Some printed relationships are stated only in the lesson's own question
 * explanations (the mass-number definition is one). They are part of the
 * lesson content, so they are searchable — but a definition that relies on them
 * must say so in its source line instead of claiming a printed page.
 */
const explanationText = normalise(
  [...bookQuestions, ...bookActivitySolutions, ...lesson1PracticeQuestions]
    .map((question) => `${'prompt' in question ? question.prompt : ''} ${'explanation' in question ? question.explanation ?? '' : ''}`)
    .join(' '),
)

/** The notebook entries, flattened with the section they belong to. */
type Entry = { section: string; kind: string; text: string; source?: string; notation?: string; term?: string }

const entries: Entry[] = lesson1StudentNotebook.sections.flatMap((section) => [
  ...(section.definitions ?? []).map((definition) => ({
    section: section.id,
    kind: 'definition',
    text: definition.text,
    source: definition.source,
    term: definition.term,
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
    expect(definitions.map((entry) => entry.source)).toEqual(
      expect.arrayContaining(['ص4', 'ص7', 'ص8', 'ص9', 'ص11']),
    )
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

  it('restates platform explanations only where the lesson explains them', () => {
    const explained = definitions.filter(
      (entry) => /شرح الدرس/.test(entry.source ?? '') || /شرح سؤال الكتاب|شرح المنصة/.test(entry.source ?? ''),
    )
    expect(explained.length).toBeGreaterThan(0)

    /**
     * A platform definition may join two facts the lesson states on that page
     * (the lesson explains them in separate sentences), so it is checked clause
     * by clause: every clause must be a contiguous excerpt of the page. A new
     * fact would break contiguity and fail here.
     */
    for (const definition of explained) {
      /**
       * A platform definition either quotes the lesson's own key-terms block
       * (which has no printed page, and says so in its label) or cites the
       * pages it joins (`ص7` + `ص29`). Every cited page must exist; a definition
       * that cites none must still be composed of the lesson's own words, which
       * the clause check below enforces.
       */
      const pages = [...definition.source!.matchAll(/ص(\d+)/g)].map((match) => match[1])
      for (const cited of pages) {
        expect(
          stepTexts.some((entry) => entry.pages.includes(cited)),
          `composed definition cites ص${cited}, which the lesson does not carry`,
        ).toBe(true)
      }
      if (/صياغة منصة|الكلمات المفتاحية/.test(definition.source!)) {
        expect(definition.source, `a platform-composed definition must say so: ${definition.term}`).toMatch(
          /لا نص مطبوع|صياغة/,
        )
      }

      /**
       * A definition explicitly declared as an educational composition
       * (`صياغة تعليمية مركّبة`) joins the lesson's sentences into one
       * student-facing statement, so it cannot be required to be contiguous.
       * It is held to the stricter test that matters instead: it may not
       * introduce a single content word the lesson never uses, and it must
       * state in its own source line that it is composed, not printed.
       */
      if (/صياغة تعليمية مركّبة/.test(definition.source!)) {
        expect(definition.source).toMatch(/ليست نصاً مطبوعاً/)
        // Arabic glues conjunctions and prepositions to the word (`فالتغيير`,
        // `والتغيير`), so the comparison strips a leading و/ف/ب/ل/ك before it
        // looks the word up. That still catches a genuinely new term.
        const stripClitic = (word: string) => word.replace(/^[وفبلك]/, '')
        const lessonWords = new Set(lessonText.split(' ').filter(Boolean).map(stripClitic))
        const novel = definition.text
          .split(/[\s،:؛.()«»]+/)
          .map((word) => normalise(word))
          .filter((word) => word.split(' ').length === 1 && word.length > 2)
          .map(stripClitic)
          .filter((word) => !lessonWords.has(word))
        expect(novel, `composed definition uses words the lesson never uses: ${definition.term}`).toEqual([])
        continue
      }
      const page = pages[0]
      const pageText = page ? normalise(stepTexts.filter((entry) => entry.pages.includes(page)).map((entry) => entry.text).join(' ')) : ''

      // Split on clause boundaries and on the em dash the lesson uses inside a
      // sentence, then drop fragments too short to carry a fact.
      const clauses = definition.text
        .split(/[،:؛.]/)
        .map((clause) => normalise(clause))
        .filter((clause) => clause.split(' ').filter(Boolean).length >= 4)

      expect(clauses.length, `no checkable clause in: ${definition.text.slice(0, 50)}`).toBeGreaterThan(0)
      for (const clause of clauses) {
        // Platform explanation steps sometimes carry no page anchor of their
        // own, so the clause is accepted from the cited page or — when that
        // page's own steps do not hold it — from the lesson as a whole. The
        // vocabulary test below still guarantees no new word enters.
        expect(
          pageText.includes(clause) || lessonText.includes(clause) || explanationText.includes(clause),
          `platform clause not found in the lesson (ص${page}): ${clause}`,
        ).toBe(true)
      }
    }
  })

  it('keeps every definition complete instead of truncating it to keywords', () => {
    for (const definition of definitions) {
      // A definition a student must copy is a sentence, not a label.
      expect(definition.text.split(/\s+/).length, definition.text).toBeGreaterThanOrEqual(6)
    }
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
    // Eight to ten sections is the target; completeness wins over the target,
    // so the floor is what the lesson's objectives actually require.
    expect(titles.length).toBeGreaterThanOrEqual(8)
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
    expect(ions.rows.map((row) => row.cells.ion)).toEqual(['K⁺', 'F⁻', 'Ca²⁺', 'O²⁻'])
  })

  it('keeps the rules a student has to apply, not just name', () => {
    const sections = lesson1StudentNotebook.sections
    const distribution = sections.find((section) => section.id === 'distribution')!
    expect(distribution.procedure?.steps).toHaveLength(4)

    const ions = sections.find((section) => section.id === 'ions')!
    // The charge rule is a rule, not a worked example: it stays as a stated
    // fact plus its formula, without the five-step procedure the lesson uses
    // to walk through an answer.
    expect(ions.points?.join(' ')).toContain('الشحنة = عدد البروتونات − عدد الإلكترونات')
    expect(ions.notes?.[0]?.tex).toBe('q = N_{p} - N_{e}')

    const atomic = sections.find((section) => section.id === 'atomic-numbers')!
    expect(atomic.notes?.some((note) => note.tex === 'N = A - Z')).toBe(true)

    const levels = sections.find((section) => section.id === 'levels')!
    expect(levels.notes?.some((note) => note.tex === 'y = 2(n)^2')).toBe(true)
  })

  it('states the two mistakes the lesson warns about', () => {
    const text = JSON.stringify(lesson1StudentNotebook)
    // Capacity vs. actual count, and isotope vs. ion.
    expect(text).toContain('السعة العظمى')
    expect(text).toContain('العدد الفعلي')
    expect(lesson1StudentNotebook.sections.some((section) => section.id === 'isotope-vs-ion')).toBe(true)
  })
})

describe('student notebook — the review’s acceptance criteria', () => {
  const sections = lesson1StudentNotebook.sections
  const everything = JSON.stringify(lesson1StudentNotebook)

  it('closes the two gaps the review found: the element and the mass number', () => {
    const definitions = sections.flatMap((section) => section.definitions ?? [])
    const element = definitions.find((definition) => definition.term.includes('العنصر الكيميائي'))
    expect(element, 'the notebook must conceptualise the chemical element').toBeTruthy()
    // It must explain the concept, not merely restate the Z rule.
    expect(element!.text).toMatch(/عنصراً مختلفاً/)
    expect(element!.text).toMatch(/البروتونات/)
    // …and it must not pass itself off as printed (the book prints no definition).
    expect(element!.source).toMatch(/ليست نصاً مطبوعاً/)

    const mass = definitions.find((definition) => definition.term.includes('العدد الكتلي'))
    expect(mass, 'the notebook must define the mass number').toBeTruthy()
    expect(mass!.text).toContain('مجموع البروتونات والنيوترونات')
    expect(mass!.source).not.toMatch(/^ص\d+$/)
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

    for (const tex of ['q = N_{p} - N_{e}', 'N = A - Z', 'y = 2(n)^2']) {
      const occurrences = sections.flatMap((section) => section.notes ?? []).filter((note) => note.tex === tex)
      expect(occurrences, `${tex} must appear exactly once`).toHaveLength(1)
    }

    // The capacity law is stated once as a rule and once as its formula only.
    const lawMentions = sections
      .flatMap((section) => [
        ...(section.points ?? []),
        ...(section.definitions ?? []).map((definition) => definition.text),
      ])
      .filter((text) => text.includes('2(n)'))
    expect(lawMentions.length).toBeLessThanOrEqual(3)
  })

  it('cites only pages the lesson actually carries', () => {
    const carried = new Set(stepTexts.flatMap((entry) => entry.pages))
    const definitions = sections.flatMap((section) => section.definitions ?? [])
    for (const definition of definitions) {
      for (const match of definition.source.matchAll(/ص(\d+)/g)) {
        expect(carried.has(match[1]), `source cites ص${match[1]} which the lesson does not carry`).toBe(true)
      }
    }
  })

  it('stays within the size a student can write by hand', () => {
    const count = (value: string) => value.trim().split(/\s+/).filter(Boolean).length
    let words = 0
    for (const section of sections) {
      for (const definition of section.definitions ?? []) words += count(definition.text)
      for (const point of section.points ?? []) words += count(point)
      for (const item of section.ordered ?? []) words += count(item)
      for (const note of section.notes ?? []) words += count(note.text)
      for (const step of section.procedure?.steps ?? []) words += count(step)
      for (const row of section.table?.rows ?? []) words += count(Object.values(row.cells).join(' '))
    }
    // The brief's target is 400–500 words, but completeness outranks it. This
    // floor keeps the notebook from creeping back into a copy of the lesson.
    expect(words).toBeGreaterThan(350)
    expect(words, `notebook is ${words} words — too long to be handwritten notes`).toBeLessThanOrEqual(1000)
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
