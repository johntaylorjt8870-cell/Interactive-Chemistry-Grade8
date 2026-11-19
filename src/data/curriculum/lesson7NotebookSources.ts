import { LESSON7_LEDGER } from './lesson7SourceLedger'
import type { NotebookSourceRow } from './schema'

export const LESSON7_BOOK_CLASSIFICATION = 'من الكتاب بحسب السجل المعتمد'
export const LESSON7_CROP_CLASSIFICATION = 'قصّة أصلية محفوظة من الكتاب (معايَنة مباشرة)'

export type Lesson7Citation = Omit<NotebookSourceRow, 'item' | 'kind'>

const ledgerById = new Map(LESSON7_LEDGER.map((entry) => [entry.id, entry]))

function requireLedgerEntries(ids: string[]) {
  if (ids.length === 0) throw new Error('At least one Lesson 7 ledger id is required.')
  return ids.map((id) => {
    const entry = ledgerById.get(id)
    if (!entry) throw new Error(`Unknown Lesson 7 ledger id: ${id}`)
    return entry
  })
}

function uniquePages(pages: string[]): string {
  return [...new Set(pages)].join('، ')
}

/** Verbatim or direct textbook item cited from the approved 194-item Lesson 7 ledger. */
export function book(...ids: string[]): Lesson7Citation {
  const entries = requireLedgerEntries(ids)
  return {
    classification: LESSON7_BOOK_CLASSIFICATION,
    source: entries.map((entry) => `${entry.locator} (${entry.id})`).join('؛ '),
    page: uniquePages(entries.map((entry) => entry.page)),
  }
}

/** Preserved original textbook figure crop inspected directly in src/assets/textbook/lesson7/. */
export function crop(fileName: string, ...ids: string[]): Lesson7Citation {
  const entries = requireLedgerEntries(ids)
  return {
    classification: LESSON7_CROP_CLASSIFICATION,
    source: `src/assets/textbook/lesson7/${fileName} — ${entries.map((entry) => `${entry.locator} (${entry.id})`).join('؛ ')}`,
    page: uniquePages(entries.map((entry) => entry.page)),
  }
}

/** Platform-organized table presenting exact textbook labels/rows faithfully. */
export function organizedBook(topic: string, ...ids: string[]): Lesson7Citation {
  const entries = requireLedgerEntries(ids)
  return {
    classification: 'تنظيم تعليمي لبيانات الكتاب المطبوعة',
    source: `${topic} — استناداً إلى ${entries.map((entry) => `${entry.locator} (${entry.id})`).join('؛ ')}`,
    page: uniquePages(entries.map((entry) => entry.page)),
  }
}

/** Complete educational solution to one or more printed textbook activity or self-test questions. */
export function solution(...questionIds: string[]): Lesson7Citation {
  if (questionIds.length === 0) throw new Error('At least one Lesson 7 book question id is required.')
  const entries = questionIds.map((qid) => {
    const entry = LESSON7_LEDGER.find((item) => item.questionIds.includes(qid))
    if (!entry) throw new Error(`Unknown Lesson 7 book question id: ${qid}`)
    return entry
  })
  const entrySummary = [...new Map(entries.map((e) => [e.id, `${e.locator} (${e.id})`])).values()].join('؛ ')
  return {
    classification: 'حل تعليمي لسؤال الكتاب (إضافة منصة)',
    source: `حل سؤال/نشاط الدرس السابع: ${questionIds.join('، ')} — ${entrySummary}`,
    page: uniquePages(entries.map((entry) => entry.page)),
  }
}

/** Solution combining printed textbook cells/prompt with platform-supplied missing values. */
export function mixedSolution(questionIds: string[], ledgerIds: string[], detail: string): Lesson7Citation {
  const qEntries = questionIds.map((qid) => {
    const entry = LESSON7_LEDGER.find((item) => item.questionIds.includes(qid))
    if (!entry) throw new Error(`Unknown Lesson 7 book question id: ${qid}`)
    return entry
  })
  const lEntries = requireLedgerEntries(ledgerIds)
  const all = [...lEntries, ...qEntries]
  return {
    classification: 'مثال الكتاب مع حل النشاط (إضافة منصة للخلايا الفارغة)',
    source: `${detail} — ${[...new Set(lEntries.map((e) => e.id))].join('، ')}؛ الحل: ${questionIds.join('، ')}`,
    page: uniquePages(all.map((entry) => entry.page)),
  }
}

/** Solution to the p. 49 air-volume sub-question using the explicitly approved 21% O₂ platform assumption. */
export function airAssumptionSolution(questionId: string, detail: string): Lesson7Citation {
  const entry = LESSON7_LEDGER.find((item) => item.questionIds.includes(questionId))
  if (!entry) throw new Error(`Unknown Lesson 7 book question id: ${questionId}`)
  return {
    classification: 'حل تعليمي بافتراض منصة معلن (21% أكسجين حجماً — ليس معطى مطبوعاً)',
    source: `${detail} — ${questionId} (${entry.id})؛ lesson7-approval-and-implementation.md`,
    page: entry.page,
  }
}

/** Explicit disclosure for an unverified/deferred textbook detail or printed arithmetic discrepancy. */
export function sourceAlert(detail: string, ...ids: string[]): Lesson7Citation {
  const entries = requireLedgerEntries(ids)
  return {
    classification: 'إضافة منصة — تدقيق مصدري وحسابي صريح',
    source: `${detail} — على ${entries.map((entry) => `${entry.locator} (${entry.id})`).join('؛ ')}`,
    page: uniquePages(entries.map((entry) => entry.page)),
  }
}

/** Platform pedagogical explanation, rule clarification, comparison, or common-error guard. */
export function teaching(topic: string, ...anchorIds: string[]): Lesson7Citation {
  if (anchorIds.length === 0) {
    return {
      classification: 'إضافة منصة — شرح تعليمي وتنظيم للمراجعة',
      source: `chemistryLesson7Notebook.ts — ${topic}`,
      page: '—',
    }
  }
  const entries = requireLedgerEntries(anchorIds)
  return {
    classification: 'إضافة منصة — شرح تعليمي مكمّل',
    source: `chemistryLesson7Notebook.ts — ${topic} (توضيح على ${entries.map((e) => e.id).join('، ')})`,
    page: uniquePages(entries.map((entry) => entry.page)),
  }
}

/** Platform-authored static schematic diagram for the student notebook. */
export function diagramSource(topic: string): Lesson7Citation {
  return {
    classification: 'إضافة منصة — رسم تخطيطي تعليمي ثابت قابل للطباعة',
    source: `src/lessons/lesson7NotebookFigures.tsx — ${topic}`,
    page: '—',
  }
}
