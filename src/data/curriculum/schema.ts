import type { Attribution, ContentStatus, PageReference, SourceReference } from '@/data/source'
import type { FinalTest } from '@/assessment/types'

export type SubjectId = 'chemistry'

export const SUBJECT_IDS: readonly SubjectId[] = ['chemistry']

export function isSubjectId(value: string): value is SubjectId {
  return (SUBJECT_IDS as readonly string[]).includes(value)
}

/* ---------------------------------------------------------------------------
 * Lesson steps
 * ------------------------------------------------------------------------ */

/**
 * Step kinds the lesson engine understands. A lesson is a sequence of steps;
 * each step is one meaningful unit of work, never a wall of text.
 */
export type StepKind =
  | 'discovery'
  | 'source'
  | 'explanation'
  | 'deep-explanation'
  | 'example'
  | 'experiment'
  | 'simulation'
  | 'activity'
  | 'question'
  | 'apply'
  | 'note'
  | 'common-error'
  | 'comparison'
  | 'summary'
  | 'final-test'

export const STEP_KINDS: readonly StepKind[] = [
  'discovery',
  'source',
  'explanation',
  'deep-explanation',
  'example',
  'experiment',
  'simulation',
  'activity',
  'question',
  'apply',
  'note',
  'common-error',
  'comparison',
  'summary',
  'final-test',
]

/* ---------------------------------------------------------------------------
 * Content blocks — the serialisable body of a step
 * ------------------------------------------------------------------------ */

export type TableColumnSpec = {
  key: string
  header: string
  unit?: string
  numeric?: boolean
  rowHeader?: boolean
}

export type TableRowSpec = {
  id: string
  cells: Record<string, string>
  selected?: boolean
  active?: boolean
}

export type ContentBlock =
  /** Platform explanation prose. */
  | { kind: 'paragraph'; text: string; attribution: Attribution }
  /** Text reproduced from the book, character for character. */
  | { kind: 'textbook-verbatim'; text: string; source: PageReference }
  | { kind: 'list'; items: string[]; ordered?: boolean; attribution: Attribution }
  | {
      kind: 'definition'
      term: string
      text: string
      symbol?: string
      unit?: string
      attribution: Attribution
    }
  | { kind: 'formula'; tex: string; display?: 'inline' | 'block'; caption?: string; attribution: Attribution }
  | { kind: 'chemical-formula'; formula: string; caption?: string; attribution: Attribution }
  | {
      kind: 'chemical-equation'
      reactants: string[]
      products: string[]
      arrow?: 'forward' | 'equilibrium'
      condition?: string
      caption?: string
      attribution: Attribution
    }
  | {
      /** Printed Arabic names within one isolated LTR reaction chain. */
      kind: 'word-equation'
      reactants: string[]
      products: string[]
      condition?: string
      reactantRoles?: string[]
      productRoles?: string[]
      caption?: string
      attribution: Attribution
    }
  | {
      kind: 'value'
      value: string | number
      unit?: string
      exponent?: string | number
      label?: string
      attribution: Attribution
    }
  | { kind: 'ion'; formula: string; charge: string; caption?: string; attribution: Attribution }
  | {
      kind: 'nuclear'
      symbol: string
      massNumber?: string | number
      atomicNumber?: string | number
      caption?: string
      attribution: Attribution
    }
  | {
      kind: 'lewis'
      symbol: string
      pairs?: Partial<Record<'top' | 'right' | 'bottom' | 'left', number>>
      dots?: Array<{ position: 'top' | 'right' | 'bottom' | 'left'; slot?: number }>
      caption?: string
      attribution: Attribution
    }
  | {
      /**
       * Diatomic molecule printed as the book does: Lewis dot column beside the
       * ball-and-stick model column. Lone-pair sides are per atom, in the LTR
       * diagram space; shared pairs print as one row of two dots per pair.
       */
      kind: 'lewis-molecule'
      leftSymbol: string
      rightSymbol: string
      leftLonePairSides?: Array<'top' | 'right' | 'bottom' | 'left'>
      rightLonePairSides?: Array<'top' | 'right' | 'bottom' | 'left'>
      sharedPairs: 1 | 2 | 3
      /** Hide the model column (defaults to showing both, as printed). */
      showModel?: boolean
      caption?: string
      attribution: Attribution
    }
  | {
      /** The printed electron-transfer figure (Na/Cl → Na⁺/Cl → NaCl). */
      kind: 'transfer-diagram'
      caption?: string
      attribution: Attribution
    }
  | {
      kind: 'table'
      caption: string
      columns: TableColumnSpec[]
      rows: TableRowSpec[]
      footnote?: string
      attribution: Attribution
    }
  | {
      kind: 'diagram'
      /** Registered interactive/diagram id, or a source figure reference. */
      diagramId: string
      title?: string
      description: string
      sourceRef?: string
      caption?: string
      attribution: Attribution
    }
  /** A supplied page scan shown as-is (used when a figure cannot be redrawn). */
  | { kind: 'source-image'; src: string; alt: string; caption?: string; source: PageReference }
  | { kind: 'callout'; tone: 'note' | 'warning' | 'method'; title?: string; text: string; attribution: Attribution }
  /** Ordered procedure, e.g. experiment steps. */
  | { kind: 'procedure'; title?: string; items: string[]; attribution: Attribution }
  | { kind: 'key-terms'; terms: Array<{ term: string; meaning: string }>; attribution: Attribution }
  /**
   * Reference to a question authored in the assessment layer.
   *
   * `reveal` opts into a self-check (explanation shown only after the student
   * answers). It is off by default so existing lessons keep their behaviour.
   */
  | { kind: 'question'; questionId: string; reveal?: boolean }
  /** Reference to a lazily-loaded interactive component (experiment/simulation). */
  | { kind: 'interactive'; interactiveId: string; caption?: string }

/* ---------------------------------------------------------------------------
 * Lesson / unit / subject definitions
 * ------------------------------------------------------------------------ */

export type LessonStep = {
  id: string
  kind: StepKind
  title: string
  /** One line describing the purpose of the step, shown in the outline. */
  summary?: string
  attribution: Attribution
  /** Required for any step that carries textbook material. */
  source?: SourceReference
  blocks: ContentBlock[]
  /** For `final-test` steps: the id of the test inside `LessonDefinition.tests`. */
  testId?: string
  /** Author-supplied estimate, never generated automatically. */
  minutes?: number
}

/* ---------------------------------------------------------------------------
 * Student notebook (دفتر الطالب)
 * ------------------------------------------------------------------------ */

/**
 * One sentence a student is expected to write down.
 *
 * `text` is the sentence itself. `notation` marks a sentence whose core is a
 * symbol, a formula or an operation (not a prose definition): it is rendered as
 * structured notation instead of being left to bidi reordering inside RTL
 * prose. Nothing is generated: every entry is authored from the lesson.
 */
export type NotebookNote = {
  text: string
  notation?: 'nuclide' | 'formula' | 'ion' | 'configuration' | 'math'
  /** TeX for `notation: 'math'`, e.g. `y = 2(n)^2`. */
  tex?: string
}

/** A complete scientific definition, kept in one block, never shortened. */
export type NotebookDefinition = {
  term: string
  /** The full meaning, as it must be written in the notebook. */
  text: string
  /** Where the lesson states it, e.g. `ص4` or `ص11 — «تعلّمُ»`. */
  source: string
}

export type NotebookTable = {
  caption: string
  columns: Array<{ key: string; header: string; rowHeader?: boolean }>
  rows: Array<{ id: string; cells: Record<string, string> }>
  footnote?: string
}

/** A step-by-step method the student must be able to apply. */
export type NotebookProcedure = {
  title: string
  steps: string[]
}

export type NotebookSection = {
  id: string
  /** Section heading, taken from the topic the lesson actually teaches. */
  title: string
  /** One short line: what this part of the notebook covers. */
  lead?: string
  definitions?: NotebookDefinition[]
  /** Bulleted facts, rules and classifications to keep. */
  points?: string[]
  /** Ordered rule that must be applied in this order. */
  ordered?: string[]
  notes?: NotebookNote[]
  table?: NotebookTable
  procedure?: NotebookProcedure
}

export type StudentNotebook = {
  /** Notebook title shown as the page heading. */
  title: string
  /** One line under the title: what the notebook is and is not. */
  introduction: string
  /** Page range the notebook is drawn from. */
  source: SourceReference
  sections: NotebookSection[]
  /**
   * Revision checklist of what the student must be able to *do* with the notes.
   * It is deliberately not part of the notebook page: it is not material to
   * copy, so it is rendered as a separate card beside the notebook.
   */
  checklist?: { title: string; items: string[] }
}

export type LessonDefinition = {
  id: string
  slug: string
  title: string
  order: number
  status: ContentStatus
  source: SourceReference
  /** Short statement of what the lesson covers, taken from the book. */
  summary?: string
  steps: LessonStep[]
  /**
   * Optional student notebook (دفتر الطالب) for this lesson. When present it is
   * shown as the last tab of the lesson, after the last teaching step.
   */
  studentNotebook?: StudentNotebook
  /** Comprehensive tests attached to the lesson (normally one). */
  tests?: FinalTest[]
}

export type UnitDefinition = {
  id: string
  slug: string
  /** Unit title exactly as printed in the textbook. */
  title: string
  order: number
  status: ContentStatus
  source?: SourceReference
  lessons: LessonDefinition[]
}

export type SubjectMotif = {
  label: string
  glyph: 'atom' | 'flask' | 'reaction' | 'lattice'
}

export type SubjectDefinition = {
  id: SubjectId
  /** Subject name in Arabic, e.g. `الكيمياء`. */
  title: string
  /** Subject name in Latin script, e.g. `Chemistry`. */
  latinTitle: string
  /** Honest description of the track; must not claim curriculum content. */
  description: string
  /**
   * Visual identity motifs. These are decorative identity references only —
   * they are never presented as curriculum units or lesson titles.
   */
  motifs: SubjectMotif[]
  status: ContentStatus
  /**
   * Units read from the supplied textbook pages. This may be empty for a
   * subject whose pages have not yet been supplied and read.
   */
  units: UnitDefinition[]
}

export type Curriculum = Record<SubjectId, SubjectDefinition>
