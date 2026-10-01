/**
 * Source-of-truth primitives.
 *
 * Platform policy: the printed textbook is the only source of truth. Every
 * piece of textbook-derived material must carry a reference that points back
 * to the page it was read from, so fidelity stays auditable and no item can be
 * silently lost, reworded or invented.
 */

/** Lifecycle of any content object in the platform. */
export type ContentStatus =
  /** No source material supplied yet — nothing may be authored. */
  | 'awaiting-source'
  /** Authoring in progress; not publishable. */
  | 'in-progress'
  /** Read from supplied pages, cross-checked against the source. */
  | 'source-verified'

/** A single page of the supplied textbook, with an optional item locator. */
export type PageReference = {
  /** Page number exactly as printed in the book, e.g. `'42'`. */
  page: string
  /** Locator inside the page, e.g. `'سؤال 3'`, `'نشاط 1'`, `'شكل 4-2'`. */
  item?: string
  /** Identifier of the supplied page image, once the scans are provided. */
  scanId?: string
}

/** A reference set: which pages a piece of material was read from. */
export type SourceReference = {
  pages: PageReference[]
  /** True only after the supplied page images were actually read and checked. */
  verified: boolean
  /**
   * Readability report for the supplied pages. Anything unclear must be
   * recorded here (or left unpublishable) instead of being guessed.
   */
  readability?: {
    arabicText?: ReadabilityLevel
    latinText?: ReadabilityLevel
    equations?: ReadabilityLevel
    numbers?: ReadabilityLevel
    units?: ReadabilityLevel
    tables?: ReadabilityLevel
    diagrams?: ReadabilityLevel
    experiments?: ReadabilityLevel
    questions?: ReadabilityLevel
    notes?: string
  }
}

export type ReadabilityLevel = 'clear' | 'partial' | 'unreadable'

/** Where a piece of material came from. Never guess this value. */
export type Attribution =
  /** Reproduced from the textbook, verbatim. */
  | 'textbook'
  /** Added by the platform around the textbook material. */
  | 'platform'
  /** A platform wrapper that contains verbatim textbook material. */
  | 'mixed'

export function isAwaitingSource(status: ContentStatus): boolean {
  return status === 'awaiting-source'
}

/** Human-readable Arabic label for a content status. */
export function contentStatusLabel(status: ContentStatus): string {
  switch (status) {
    case 'awaiting-source':
      return 'بانتظار صفحات الكتاب'
    case 'in-progress':
      return 'قيد الإعداد'
    case 'source-verified':
      return 'مُتحقَّق من الكتاب'
  }
}

/** Empty reference used while no source material exists. */
export const NO_SOURCE: SourceReference = { pages: [], verified: false }

/* ---------------------------------------------------------------------------
 * Fidelity reporting
 * ------------------------------------------------------------------------ */

export type FidelitySeverity = 'error' | 'warning'

export type FidelityIssue = {
  severity: FidelitySeverity
  code: string
  message: string
  /** Dotted path to the offending object, e.g. `physics.unit-1.lesson-1`. */
  path: string
}

export function hasErrors(issues: FidelityIssue[]): boolean {
  return issues.some((issue) => issue.severity === 'error')
}
