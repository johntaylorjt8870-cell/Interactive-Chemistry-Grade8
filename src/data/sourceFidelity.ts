import { curriculum } from './curriculum/registry'
export { hasErrors } from './source'
import type {
  ContentBlock,
  Curriculum,
  LessonDefinition,
  LessonStep,
  NotebookSection,
  NotebookTable,
  StudentNotebook,
  UnitDefinition,
} from './curriculum/schema'
import type { Question } from '@/assessment/types'
import type { FidelityIssue, SourceReference } from './source'

/**
 * Source-fidelity checks.
 *
 * These validators exist so that losing, paraphrasing or inventing textbook
 * material becomes a *detectable* event rather than a silent one. They are
 * used by the automated tests and are safe to run at build time later.
 */

const TEXTBOOK_ATTRIBUTIONS = new Set(['textbook', 'mixed'])

/** Exact required caption for the single final provenance table in a student notebook. */
export const NOTEBOOK_SOURCES_APPENDIX_CAPTION = 'جدول مصادر بنود دفتر الطالب'

/**
 * Closed sets of earlier approved notebooks preserved without retroactive rebuilds:
 * - Lessons 3–4 predate the consolidated `sourcesAppendix` rule and keep visible chips.
 * - Lessons 1, 2, 5 have complete consolidated appendices whose rows name or group
 *   entries rather than numbering every body block sequentially in Arabic-Indic digits.
 * Every other lesson (Lesson 6, Lesson 7, and every future lesson) must satisfy the
 * full permanent student-notebook standard without exception.
 */
const LEGACY_INLINE_SOURCE_NOTEBOOK_IDS = new Set(['chem-u1-l3', 'chem-u1-l4'])
const LEGACY_GROUPED_APPENDIX_NOTEBOOK_IDS = new Set(['chem-u1-l1', 'chem-u1-l2', 'chem-u1-l5'])

const ARABIC_INDIC_DIGITS = '٠١٢٣٤٥٦٧٨٩'
const NUMBERED_ITEM_PREFIX = /^([٠-٩]+)\s*ـ\s+\S/u
const INLINE_PAGE_REF_PATTERN =
  /(?:^|[\s(«،؛:—–\-/])ص\s*[0-9٠-٩]+|(?:^|[\s(«،؛:—–\-/])(?:ال)?صفح(?:ة|ات)\s*[0-9٠-٩]+|\bpp?\.?\s*\d+/iu
const INLINE_SOURCE_TAG_PATTERN =
  /\[\s*(?:نص\s+)?(?:ال)?كتاب[^\]]*\]|\[\s*(?:إضافة|توضيح|شرح|حل)?\s*(?:ال)?منص[ةه][^\]]*\]|\[\s*حل\s+[^\]]+\]|\[\s*إثراء[^\]]*\]|\bL\d+-P\d+-E\d+\b/u
const BIDI_CONTROL_PATTERN = /[\u202A-\u202E\u2066-\u2069]/u
const TEXTBOOK_CLASSIFICATION_PATTERN =
  /(?:^|[\s—–\-/،؛])(?:من\s+الكتاب|قصّ?ة\s+أصلية[^\n]*الكتاب|(?:نص|مثال|جدول|رسم|صورة|خلاصة|قانون|تعريف)\s+الكتاب)/u

export function toArabicIndicNumber(value: number): string {
  return String(value).replace(/\d/g, (digit) => ARABIC_INDIC_DIGITS[Number(digit)]!)
}

function blocksWithText(blocks: ContentBlock[]): ContentBlock[] {
  return blocks.filter((block) => block.kind === 'textbook-verbatim' || block.kind === 'source-image')
}

/** Validates one lesson. Returns every issue found, never throws. */
export function validateLesson(lesson: LessonDefinition, path: string): FidelityIssue[] {
  const issues: FidelityIssue[] = []

  if (lesson.title.trim() === '') {
    issues.push({
      severity: 'error',
      code: 'lesson/empty-title',
      message: 'Lesson title is empty. Titles must be copied from the textbook.',
      path,
    })
  }

  if (lesson.status !== 'awaiting-source' && lesson.steps.length === 0) {
    issues.push({
      severity: 'error',
      code: 'lesson/no-steps',
      message: 'A published lesson must contain at least one step.',
      path,
    })
  }

  if (lesson.status === 'source-verified' && !lesson.source.verified) {
    issues.push({
      severity: 'error',
      code: 'lesson/unverified-source',
      message: 'A lesson marked "source-verified" must carry a verified source reference.',
      path,
    })
  }

  if (lesson.steps.length > 0 && !lesson.source.pages.length) {
    issues.push({
      severity: 'error',
      code: 'lesson/missing-pages',
      message: 'A lesson built from the textbook must list the pages it was read from.',
      path,
    })
  }

  lesson.steps.forEach((step, index) => {
    issues.push(...validateStep(step, `${path}.step[${index}]:${step.id}`))
  })

  if (lesson.status === 'source-verified' && !lesson.studentNotebook) {
    issues.push({
      severity: 'error',
      code: 'lesson/missing-student-notebook',
      message: 'A source-verified lesson must include a complete studentNotebook (دفتر الطالب) with its sources table.',
      path,
    })
  }

  if (lesson.studentNotebook) {
    issues.push(...validateStudentNotebook(lesson.studentNotebook, lesson, `${path}.studentNotebook`))
  }

  return issues
}

export function validateStep(step: LessonStep, path: string): FidelityIssue[] {
  const issues: FidelityIssue[] = []

  if (TEXTBOOK_ATTRIBUTIONS.has(step.attribution) && !hasUsableSource(step.source)) {
    issues.push({
      severity: 'error',
      code: 'step/missing-source',
      message: `Step "${step.id}" claims textbook material but has no verified page reference.`,
      path,
    })
  }

  for (const block of blocksWithText(step.blocks)) {
    if (block.kind === 'textbook-verbatim' && block.text.trim() === '') {
      issues.push({
        severity: 'error',
        code: 'block/empty-verbatim',
        message: `Step "${step.id}" contains an empty verbatim block.`,
        path,
      })
    }
  }

  if (step.blocks.length === 0 && step.kind !== 'final-test') {
    issues.push({
      severity: 'error',
      code: 'step/empty',
      message: `Step "${step.id}" has no content blocks.`,
      path,
    })
  }

  if (step.kind === 'final-test' && !step.testId) {
    issues.push({
      severity: 'error',
      code: 'step/missing-test',
      message: `Final-test step "${step.id}" must reference a test definition.`,
      path,
    })
  }

  return issues
}

export function validateUnit(unit: UnitDefinition, path: string): FidelityIssue[] {
  const issues: FidelityIssue[] = []

  if (unit.title.trim() === '') {
    issues.push({
      severity: 'error',
      code: 'unit/empty-title',
      message: 'Unit title is empty. Titles must be copied from the textbook.',
      path,
    })
  }

  if (unit.status !== 'awaiting-source' && unit.lessons.length === 0) {
    issues.push({
      severity: 'warning',
      code: 'unit/no-lessons',
      message: 'This unit has no lessons yet.',
      path,
    })
  }

  unit.lessons.forEach((lesson, index) => {
    issues.push(...validateLesson(lesson, `${path}.lesson[${index}]:${lesson.slug}`))
  })

  return issues
}

export function validateCurriculum(source: Curriculum = curriculum): FidelityIssue[] {
  return Object.values(source).flatMap((subject) =>
    subject.units.flatMap((unit, index) => validateUnit(unit, `${subject.id}.unit[${index}]:${unit.slug}`)),
  )
}

/** A source reference is usable when it names at least one page and was read. */
export function hasUsableSource(source: SourceReference | undefined): boolean {
  if (!source) return false
  if (!source.verified) return false
  return source.pages.length > 0 && source.pages.every((page) => page.page.trim() !== '')
}

/** Summarises the readability report supplied with a set of textbook pages. */
export function summariseReadability(source: SourceReference): string {
  const report = source.readability
  if (!report) return 'لم يُسجَّل تقرير وضوح لهذه الصفحات.'
  const entries: Array<[string, string | undefined]> = [
    ['النص العربي', report.arabicText],
    ['النص اللاتيني', report.latinText],
    ['المعادلات', report.equations],
    ['الأرقام', report.numbers],
    ['الوحدات', report.units],
    ['الجداول', report.tables],
    ['الأشكال', report.diagrams],
    ['التجارب', report.experiments],
    ['الأسئلة', report.questions],
  ]
  const labels: Record<string, string> = {
    clear: 'واضح',
    partial: 'جزئي',
    unreadable: 'غير مقروء',
  }
  const parts = entries
    .filter((entry): entry is [string, string] => Boolean(entry[1]))
    .map(([label, level]) => `${label}: ${labels[level] ?? level}`)
  return parts.length ? parts.join(' · ') : 'لم يُسجَّل تقرير وضوح لهذه الصفحات.'
}

/** True when every recorded readability level is clear enough to publish. */
export function isFullyReadable(source: SourceReference): boolean {
  const report = source.readability
  if (!report) return false
  return Object.entries(report).every(([key, level]) => key === 'notes' || level === 'clear' || level === undefined)
}

/* ---------------------------------------------------------------------------
 * Permanent Student Notebook (دفتر الطالب) standard enforcement
 * ------------------------------------------------------------------------ */

function sectionTables(section: NotebookSection): NotebookTable[] {
  return [section.table, ...(section.tables ?? [])].filter((table): table is NotebookTable => Boolean(table))
}

/** Collects every student-facing item across all notebook sections in exact DOM render order. */
export function collectNotebookBodyItems(notebook: StudentNotebook): string[] {
  return notebook.sections.flatMap((section) => [
    ...(section.lead ? [section.lead] : []),
    ...(section.definitions ?? []).map((definition) => definition.term),
    ...(section.points ?? []),
    ...(section.ordered ?? []),
    ...(section.notes ?? []).map((note) => note.text),
    ...(section.lewisMolecules ?? []).map((molecule) => molecule.formula),
    ...sectionTables(section).map((table) => table.caption),
    ...(section.procedure ? [section.procedure.title] : []),
    ...(section.figures ?? []).map((figure) => figure.caption),
    ...(section.enrichment ?? []).map((entry) => entry.text),
  ])
}

function collectVisibleNotebookStrings(notebook: StudentNotebook): Array<{ text: string; where: string }> {
  const texts: Array<{ text: string; where: string }> = [
    { text: notebook.title, where: 'title' },
    { text: notebook.introduction, where: 'introduction' },
  ]
  if (notebook.enrichmentNote) texts.push({ text: notebook.enrichmentNote, where: 'enrichmentNote' })
  notebook.sections.forEach((section, sIdx) => {
    const base = `section[${sIdx}]:${section.id}`
    texts.push({ text: section.title, where: `${base}.title` })
    if (section.lead) texts.push({ text: section.lead, where: `${base}.lead` })
    section.definitions?.forEach((def, i) => {
      texts.push({ text: def.term, where: `${base}.definition[${i}].term` })
      texts.push({ text: def.text, where: `${base}.definition[${i}].text` })
    })
    section.points?.forEach((point, i) => texts.push({ text: point, where: `${base}.point[${i}]` }))
    section.ordered?.forEach((item, i) => texts.push({ text: item, where: `${base}.ordered[${i}]` }))
    sectionTables(section).forEach((table, tIdx) => {
      texts.push({ text: table.caption, where: `${base}.table[${tIdx}].caption` })
      table.columns.forEach((col) => texts.push({ text: col.header, where: `${base}.table[${tIdx}].col:${col.key}` }))
      table.rows.forEach((row) => {
        Object.entries(row.cells).forEach(([key, value]) => {
          texts.push({ text: value, where: `${base}.table[${tIdx}].row:${row.id}.${key}` })
        })
      })
      if (table.footnote) texts.push({ text: table.footnote, where: `${base}.table[${tIdx}].footnote` })
    })
    section.notes?.forEach((note, i) => {
      texts.push({ text: note.text, where: `${base}.note[${i}].text` })
      note.wordEquation?.reactants.forEach((r) => texts.push({ text: r, where: `${base}.note[${i}].reactant` }))
      note.wordEquation?.products.forEach((p) => texts.push({ text: p, where: `${base}.note[${i}].product` }))
    })
    section.figures?.forEach((figure, i) => texts.push({ text: figure.caption, where: `${base}.figure[${i}].caption` }))
    section.procedure?.steps.forEach((item, i) => texts.push({ text: item, where: `${base}.procedure[${i}]` }))
    if (section.procedure) texts.push({ text: section.procedure.title, where: `${base}.procedure.title` })
    section.enrichment?.forEach((entry, i) => {
      texts.push({ text: entry.text, where: `${base}.enrichment[${i}].text` })
      texts.push({ text: entry.why, where: `${base}.enrichment[${i}].why` })
    })
  })
  if (notebook.checklist) {
    texts.push({ text: notebook.checklist.title, where: 'checklist.title' })
    notebook.checklist.items.forEach((item, i) => texts.push({ text: item, where: `checklist.item[${i}]` }))
  }
  return texts
}

function expandReferencedPages(pageField: string): string[] {
  const normalized = pageField.replace(/[٠-٩]/g, (d) => String(ARABIC_INDIC_DIGITS.indexOf(d)))
  const pages = new Set<string>()
  for (const range of normalized.matchAll(/(\d+)\s*[–\-]\s*(\d+)/g)) {
    const start = Number(range[1])
    const end = Number(range[2])
    if (end >= start && end - start <= 50) {
      for (let page = start; page <= end; page += 1) pages.add(String(page))
    }
  }
  for (const single of normalized.matchAll(/\d+/g)) pages.add(String(Number(single[0])))
  return [...pages]
}

function collectLessonTextbookQuestions(lesson: LessonDefinition): Question[] {
  const found: Question[] = []
  const walk = (questions: Question[]) => {
    for (const question of questions) {
      if (question.origin === 'textbook') found.push(question)
      if (question.type === 'table-interpretation' || question.type === 'diagram-interpretation') {
        walk(question.questions)
      }
    }
  }
  for (const test of lesson.tests ?? []) walk(test.questions)
  return found
}

/**
 * Validates a lesson's Student Notebook against the permanent project standard.
 * Completeness checks are derived dynamically from the lesson's own pages,
 * blocks, and textbook questions — never from fixed global page or item counts.
 */
export function validateStudentNotebook(
  notebook: StudentNotebook,
  lesson: LessonDefinition,
  path: string,
): FidelityIssue[] {
  const issues: FidelityIssue[] = []
  const isLegacyInline = LEGACY_INLINE_SOURCE_NOTEBOOK_IDS.has(lesson.id)
  const isLegacyGrouped = LEGACY_GROUPED_APPENDIX_NOTEBOOK_IDS.has(lesson.id)
  const isStrictStandard = !isLegacyInline && !isLegacyGrouped

  if (notebook.title.trim() === '') {
    issues.push({ severity: 'error', code: 'notebook/empty-title', message: 'Notebook title is empty.', path })
  }
  if (notebook.introduction.trim() === '') {
    issues.push({
      severity: 'error',
      code: 'notebook/empty-introduction',
      message: 'Notebook introduction is empty.',
      path,
    })
  }
  if (notebook.source.pages.length === 0 || notebook.source.pages.some((page) => page.page.trim() === '')) {
    issues.push({
      severity: 'error',
      code: 'notebook/missing-pages',
      message: 'Notebook source must declare all printed textbook pages of the lesson.',
      path,
    })
  } else {
    const declaredPages = new Set(notebook.source.pages.map((page) => page.page.trim()))
    for (const lessonPage of lesson.source.pages) {
      const page = lessonPage.page.trim()
      if (page && !declaredPages.has(page)) {
        issues.push({
          severity: 'error',
          code: 'notebook/uncovered-lesson-page',
          message: `Notebook source.pages omits lesson page "${page}".`,
          path,
        })
      }
    }
  }
  if (!notebook.source.verified && !(notebook.source.readability?.notes?.trim())) {
    issues.push({
      severity: 'error',
      code: 'notebook/unexplained-unverified-source',
      message: 'When notebook source.verified is false, source.readability.notes must explicitly disclose why original scans were not inspected.',
      path,
    })
  }
  if (BIDI_CONTROL_PATTERN.test(JSON.stringify(notebook))) {
    issues.push({
      severity: 'error',
      code: 'notebook/bidi-control-char',
      message: 'Notebook contains raw Unicode bidi control characters; use structured notation isolation instead.',
      path,
    })
  }
  if (notebook.sections.length === 0) {
    issues.push({ severity: 'error', code: 'notebook/no-sections', message: 'Notebook has no sections.', path })
    return issues
  }

  const sectionIds = new Set<string>()
  const figureIds = new Set<string>()
  notebook.sections.forEach((section, sIdx) => {
    const sectionPath = `${path}.section[${sIdx}]:${section.id}`
    if (section.id.trim() === '') {
      issues.push({ severity: 'error', code: 'notebook/empty-section-id', message: 'Section id is empty.', path: sectionPath })
    } else if (sectionIds.has(section.id)) {
      issues.push({
        severity: 'error',
        code: 'notebook/duplicate-section-id',
        message: `Duplicate notebook section id "${section.id}".`,
        path: sectionPath,
      })
    }
    sectionIds.add(section.id)

    if (section.title.trim() === '') {
      issues.push({ severity: 'error', code: 'notebook/empty-section-title', message: 'Section title is empty.', path: sectionPath })
    }

    const tables = sectionTables(section)
    const entryCount =
      (section.definitions?.length ?? 0) +
      (section.points?.length ?? 0) +
      (section.ordered?.length ?? 0) +
      tables.length +
      (section.notes?.length ?? 0) +
      (section.figures?.length ?? 0) +
      (section.lewisMolecules?.length ?? 0) +
      (section.procedure ? 1 : 0) +
      (section.enrichment?.length ?? 0)
    if (entryCount === 0) {
      issues.push({
        severity: 'error',
        code: 'notebook/empty-section',
        message: `Section "${section.id}" contains no study material.`,
        path: sectionPath,
      })
    }

    section.definitions?.forEach((def, dIdx) => {
      if (def.term.trim() === '' || def.text.trim() === '') {
        issues.push({
          severity: 'error',
          code: 'notebook/empty-item',
          message: `Definition ${dIdx} in section "${section.id}" has an empty term or meaning.`,
          path: sectionPath,
        })
      }
    })
    for (const text of [...(section.points ?? []), ...(section.ordered ?? [])]) {
      if (text.trim() === '') {
        issues.push({
          severity: 'error',
          code: 'notebook/empty-item',
          message: `Section "${section.id}" contains an empty list item.`,
          path: sectionPath,
        })
      }
    }
    section.notes?.forEach((note, nIdx) => {
      if (note.text.trim() === '') {
        issues.push({
          severity: 'error',
          code: 'notebook/empty-item',
          message: `Note ${nIdx} in section "${section.id}" has empty text.`,
          path: sectionPath,
        })
      }
      if (note.notation === 'math' && !(note.tex?.trim())) {
        issues.push({
          severity: 'error',
          code: 'notebook/missing-math-tex',
          message: `Math note ${nIdx} in section "${section.id}" is missing its TeX expression.`,
          path: sectionPath,
        })
      }
      if (note.wordEquation && (note.wordEquation.reactants.length === 0 || note.wordEquation.products.length === 0)) {
        issues.push({
          severity: 'error',
          code: 'notebook/invalid-word-equation',
          message: `Word equation note ${nIdx} in section "${section.id}" must list reactants and products.`,
          path: sectionPath,
        })
      }
    })
    tables.forEach((table, tIdx) => {
      if (table.caption.trim() === '' || table.columns.length === 0 || table.rows.length === 0) {
        issues.push({
          severity: 'error',
          code: 'notebook/invalid-table',
          message: `Table ${tIdx} in section "${section.id}" must have a caption, columns, and rows.`,
          path: sectionPath,
        })
      }
      for (const row of table.rows) {
        for (const col of table.columns) {
          if (!(col.key in row.cells)) {
            issues.push({
              severity: 'error',
              code: 'notebook/invalid-table',
              message: `Table "${table.caption}" row "${row.id}" is missing column "${col.key}".`,
              path: sectionPath,
            })
          }
        }
      }
    })
    section.figures?.forEach((figure) => {
      if (figure.id.trim() === '' || figure.caption.trim() === '') {
        issues.push({
          severity: 'error',
          code: 'notebook/empty-item',
          message: `Figure "${figure.id}" in section "${section.id}" must have an id and caption.`,
          path: sectionPath,
        })
      } else if (figureIds.has(figure.id)) {
        issues.push({
          severity: 'error',
          code: 'notebook/duplicate-figure-id',
          message: `Duplicate notebook figure id "${figure.id}".`,
          path: sectionPath,
        })
      }
      figureIds.add(figure.id)
      if (isStrictStandard && figure.kind === 'interactive') {
        issues.push({
          severity: 'error',
          code: 'notebook/non-static-figure',
          message: `Figure "${figure.id}" uses lazy interactive loading; core notebook figures must be static and printable.`,
          path: sectionPath,
        })
      }
    })
    section.enrichment?.forEach((entry, eIdx) => {
      if (!entry.text.trim() || !entry.reference.trim() || !entry.citation.trim() || !entry.why.trim()) {
        issues.push({
          severity: 'error',
          code: 'notebook/empty-item',
          message: `Enrichment item ${eIdx} in section "${section.id}" is incomplete.`,
          path: sectionPath,
        })
      }
    })
  })

  if (notebook.checklist && (!notebook.checklist.title.trim() || notebook.checklist.items.length === 0 || notebook.checklist.items.some((item) => !item.trim()))) {
    issues.push({
      severity: 'error',
      code: 'notebook/empty-checklist',
      message: 'Notebook revision checklist must have a non-empty title and items.',
      path,
    })
  }

  if (isLegacyInline) return issues

  /* Consolidated sources appendix & clean student-facing body (L1, L2, L5, L6, L7, and all future lessons). */
  if (notebook.hidePageTagsInBody !== true) {
    issues.push({
      severity: 'error',
      code: 'notebook/page-tags-visible',
      message: 'Notebook must set hidePageTagsInBody: true so page tags appear only in the final sources table.',
      path,
    })
  }
  for (const section of notebook.sections) {
    if (section.source?.trim()) {
      issues.push({
        severity: 'error',
        code: 'notebook/section-source-in-body',
        message: `Section "${section.id}" carries an inline source line; move provenance to sourcesAppendix.`,
        path,
      })
    }
    for (const def of section.definitions ?? []) {
      if (def.source.trim() !== '' && !/^ص\d/u.test(def.source)) {
        issues.push({
          severity: 'error',
          code: 'notebook/visible-definition-source',
          message: `Definition "${def.term}" has a visible source chip "${def.source}"; keep provenance in sourcesAppendix.`,
          path,
        })
      }
    }
  }
  for (const entry of collectVisibleNotebookStrings(notebook)) {
    if (INLINE_PAGE_REF_PATTERN.test(entry.text)) {
      issues.push({
        severity: 'error',
        code: 'notebook/inline-page-reference',
        message: `Notebook body contains an inline page reference at ${entry.where}.`,
        path: `${path}.${entry.where}`,
      })
    }
    if (INLINE_SOURCE_TAG_PATTERN.test(entry.text)) {
      issues.push({
        severity: 'error',
        code: 'notebook/inline-source-tag',
        message: `Notebook body contains an inline source tag or raw ledger id at ${entry.where}.`,
        path: `${path}.${entry.where}`,
      })
    }
  }

  const appendix = notebook.sourcesAppendix
  if (!appendix || appendix.rows.length === 0) {
    issues.push({
      severity: 'error',
      code: 'notebook/missing-sources-appendix',
      message: `Notebook must end with a populated "${NOTEBOOK_SOURCES_APPENDIX_CAPTION}" table.`,
      path,
    })
    return issues
  }
  if (appendix.caption !== NOTEBOOK_SOURCES_APPENDIX_CAPTION) {
    issues.push({
      severity: 'error',
      code: 'notebook/sources-caption',
      message: `Notebook sources table caption must be "${NOTEBOOK_SOURCES_APPENDIX_CAPTION}".`,
      path: `${path}.sourcesAppendix`,
    })
  }

  const seenItems = new Set<string>()
  appendix.rows.forEach((row, rIdx) => {
    const rowPath = `${path}.sourcesAppendix.row[${rIdx}]`
    const fields: Array<[string, string]> = [
      ['item', row.item],
      ['kind', row.kind],
      ['classification', row.classification],
      ['source', row.source],
      ['page', row.page],
    ]
    for (const [name, value] of fields) {
      if (value.trim() === '') {
        issues.push({
          severity: 'error',
          code: 'notebook/incomplete-source-row',
          message: `Source row ${rIdx} has an empty "${name}" field; all 5 columns are required.`,
          path: rowPath,
        })
      }
    }
    if (row.item.trim()) {
      if (seenItems.has(row.item)) {
        issues.push({
          severity: 'error',
          code: 'notebook/duplicate-source-item',
          message: `Duplicate item identifier "${row.item}" in sourcesAppendix.`,
          path: rowPath,
        })
      }
      seenItems.add(row.item)
    }
    if (TEXTBOOK_CLASSIFICATION_PATTERN.test(row.classification) && expandReferencedPages(row.page).length === 0) {
      issues.push({
        severity: 'error',
        code: 'notebook/textbook-row-missing-page',
        message: `Source row "${row.item}" attributes material to the textbook without a page number.`,
        path: rowPath,
      })
    }
    if (
      isStrictStandard &&
      TEXTBOOK_CLASSIFICATION_PATTERN.test(row.classification) &&
      /Notebook\.ts|إضافة منصة/u.test(row.source) &&
      !/Ledger|سجل|تفريغ|p\d+-|L\d+-P\d+/u.test(row.source)
    ) {
      issues.push({
        severity: 'error',
        code: 'notebook/platform-claimed-as-textbook',
        message: `Source row "${row.item}" attributes a platform-authored item to the textbook without textbook/ledger evidence.`,
        path: rowPath,
      })
    }
  })

  if (!isStrictStandard) return issues

  /* Strict permanent standard (Lesson 6, Lesson 7, and every future lesson). */
  const bodyItems = collectNotebookBodyItems(notebook)
  const expectedSequence = bodyItems.map((_, idx) => toArabicIndicNumber(idx + 1))
  const expectedSet = new Set(expectedSequence)
  const seenBodyNumbers = new Set<string>()
  bodyItems.forEach((itemText, idx) => {
    const match = itemText.match(NUMBERED_ITEM_PREFIX)
    const number = match?.[1]
    if (!number || !expectedSet.has(number) || seenBodyNumbers.has(number)) {
      issues.push({
        severity: 'error',
        code: 'notebook/unnumbered-body-item',
        message: `Body item #${idx + 1} must carry a unique Arabic-Indic item number within ١–${toArabicIndicNumber(bodyItems.length)} prefixed as "N ـ ".`,
        path: `${path}.bodyItem[${idx}]`,
      })
    } else {
      seenBodyNumbers.add(number)
    }
  })

  const actualRowItems = appendix.rows.map((row) => row.item)
  if (
    actualRowItems.length !== expectedSequence.length ||
    seenBodyNumbers.size !== expectedSequence.length ||
    actualRowItems.some((value, idx) => value !== expectedSequence[idx])
  ) {
    issues.push({
      severity: 'error',
      code: 'notebook/source-row-mismatch',
      message: `sourcesAppendix must match all numbered body items 1-to-1 in sequential order ١–${toArabicIndicNumber(bodyItems.length)} (expected ${expectedSequence.length} items, found ${actualRowItems.length} rows).`,
      path: `${path}.sourcesAppendix`,
    })
  }

  /* Lesson-relative completeness gates — adapt dynamically to each lesson's content. */
  const coveredPages = new Set(appendix.rows.flatMap((row) => expandReferencedPages(row.page)))
  const requiredPages = new Set<string>()
  for (const ref of lesson.source.pages) {
    if (ref.page.trim()) requiredPages.add(String(Number(ref.page.trim())))
  }
  const allStepBlocks = lesson.steps.flatMap((step) => step.blocks)
  for (const block of allStepBlocks) {
    if ((block.kind === 'textbook-verbatim' || block.kind === 'source-image') && block.source.page.trim()) {
      requiredPages.add(String(Number(block.source.page.trim())))
    }
  }
  const textbookQuestions = collectLessonTextbookQuestions(lesson)
  const questionPages = new Set<string>()
  for (const question of textbookQuestions) {
    if (question.source?.page.trim()) {
      const page = String(Number(question.source.page.trim()))
      requiredPages.add(page)
      questionPages.add(page)
    }
  }
  for (const page of requiredPages) {
    if (!coveredPages.has(page)) {
      issues.push({
        severity: 'error',
        code: 'notebook/uncovered-source-page',
        message: `Notebook sourcesAppendix has no documented items covering lesson page "${page}".`,
        path: `${path}.sourcesAppendix`,
      })
    }
  }
  const solvedPages = new Set(
    appendix.rows
      .filter((row) => /حل/u.test(row.classification) || /حل/u.test(row.kind))
      .flatMap((row) => expandReferencedPages(row.page)),
  )
  for (const page of questionPages) {
    if (!solvedPages.has(page)) {
      issues.push({
        severity: 'error',
        code: 'notebook/missing-question-solutions',
        message: `Lesson has textbook questions/activities on page "${page}" with no documented solution rows in the notebook.`,
        path: `${path}.sourcesAppendix`,
      })
    }
  }

  const hasLessonDefinitions = allStepBlocks.some((block) => block.kind === 'definition' || block.kind === 'key-terms')
  const hasNotebookDefinitions = notebook.sections.some((section) => (section.definitions?.length ?? 0) > 0)
  if (hasLessonDefinitions && !hasNotebookDefinitions) {
    issues.push({
      severity: 'error',
      code: 'notebook/missing-lesson-definitions',
      message: 'Lesson includes definitions/key terms, so its student notebook must record definitions.',
      path,
    })
  }

  const hasLessonTables = allStepBlocks.some((block) => block.kind === 'table')
  const hasNotebookTables = notebook.sections.some((section) => sectionTables(section).length > 0)
  if (hasLessonTables && !hasNotebookTables) {
    issues.push({
      severity: 'error',
      code: 'notebook/missing-lesson-tables',
      message: 'Lesson includes data/summary tables, so its student notebook must include structured tables.',
      path,
    })
  }

  const hasLessonNotation = allStepBlocks.some(
    (block) => block.kind === 'formula' || block.kind === 'chemical-equation' || block.kind === 'word-equation',
  )
  const hasNotebookNotation = notebook.sections.some((section) =>
    (section.notes ?? []).some((note) => Boolean(note.notation) || Boolean(note.wordEquation)),
  )
  notebook.sections.forEach((section) => {
    ;(section.notes ?? []).forEach((note, nIdx) => {
      if (note.tex && note.notation !== 'math') {
        issues.push({
          severity: 'error',
          code: 'notebook/unrendered-tex',
          message: `Note ${nIdx} in section "${section.id}" defines tex without notation: 'math', so its formula would not render.`,
          path: `${path}.section:${section.id}`,
        })
      }
    })
  })
  if (hasLessonNotation && !hasNotebookNotation) {
    issues.push({
      severity: 'error',
      code: 'notebook/missing-lesson-notation',
      message: 'Lesson includes formulas or chemical equations, so its student notebook must record structured notation.',
      path,
    })
  }

  const hasLessonSourceFigures = allStepBlocks.some(
    (block) =>
      block.kind === 'source-image' ||
      (block.kind === 'diagram' && (block.attribution === 'textbook' || block.attribution === 'mixed')),
  )
  const hasNotebookFigures = notebook.sections.some((section) => (section.figures?.length ?? 0) > 0)
  if (hasLessonSourceFigures && !hasNotebookFigures) {
    issues.push({
      severity: 'error',
      code: 'notebook/missing-lesson-figures',
      message: 'Lesson includes textbook figures/diagrams, so its student notebook must include static printable figures.',
      path,
    })
  }

  return issues
}

