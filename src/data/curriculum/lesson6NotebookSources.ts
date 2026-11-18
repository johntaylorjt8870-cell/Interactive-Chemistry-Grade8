import { LESSON6_LEDGER } from './lesson6SourceLedger'
import type { NotebookNote, NotebookSourceRow } from './schema'

const transcription = 'من الكتاب بحسب التفريغ المحلي'
type Citation = Omit<NotebookSourceRow, 'item' | 'kind'>
const entries = new Map(LESSON6_LEDGER.map(entry => [entry.id, entry]))

/** A page is inherited from the transcribed entry, never assigned by proximity. */
export function book(...ids: string[]): Citation & { classification: typeof transcription } {
  const records = ids.map(id => {
    const entry = entries.get(id)
    if (!entry) throw new Error(`Unknown Lesson 6 source: ${id}`)
    return entry
  })
  return {
    classification: transcription,
    source: records.map(r => `${r.locator} (${r.id})`).join('؛ '),
    page: [...new Set(records.map(r => r.page))].join('، '),
  }
}

export function solution(...questionIds: string[]): Citation {
  const records = questionIds.map(id => {
    const entry = LESSON6_LEDGER.find(e => e.questionIds?.includes(id))
    if (!entry) throw new Error(`Unknown Lesson 6 book question: ${id}`)
    return entry
  })
  return {
    classification: 'حل تعليمي لسؤال الكتاب',
    source: `حلول أسئلة الدرس السادس: ${questionIds.join('، ')}، ${[...new Set(records.map(r => r.locator))].join('؛ ')}`,
    page: [...new Set(records.map(r => r.page))].join('، '),
  }
}

export function teaching(step: string): Citation {
  return { classification: 'شرح من المنصة', source: `خطوة الدرس السادس: ${step}`, page: '—' }
}

/** A table (including its cells), figure and key, or named procedure is one item.
 * The very same number goes on the copyable item and on its sole appendix row. */
export function notebookIndex() {
  const rows: NotebookSourceRow[] = []
  function item(kind: string, citation: Citation, label: string): string {
    const number = String(rows.length + 1).replace(/\d/g, d => '٠١٢٣٤٥٦٧٨٩'[Number(d)]!)
    rows.push({ item: number, kind, ...citation })
    return `${number} ـ ${label}`
  }
  // Only material from the transcription may take the renderer's legacy default.
  function printedNote(kind: string, citation: ReturnType<typeof book>, label: string): NotebookNote {
    return { text: item(kind, citation, label) }
  }
  // Opt in at an actual worked solution, not at every non-book citation.
  function workedNote(kind: string, citation: Citation, label: string): NotebookNote {
    return { text: item(kind, citation, label), role: 'appendix' }
  }
  return { item, printedNote, workedNote, rows }
}
