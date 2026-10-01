import type { ContentStatus, PageReference } from '@/data/source'
import type { TableColumnSpec, TableRowSpec } from '@/data/curriculum/schema'

/**
 * Assessment types.
 *
 * Question *shapes* and *evaluation* live here; rendering lives in
 * `QuestionView.tsx` and test orchestration in `FinalTestRunner.tsx`. No
 * question content is authored in the foundation phase — the textbook has not
 * been supplied yet.
 */

export type QuestionType =
  | 'multiple-choice'
  | 'true-false'
  | 'fill-blank'
  | 'ordering'
  | 'matching'
  | 'numerical'
  | 'short-answer'
  | 'table-interpretation'
  | 'diagram-interpretation'

export type ChoiceId = string

export type Choice = {
  id: ChoiceId
  /** Text or rich scientific content id; kept serialisable for data files. */
  label: string
}

type QuestionCommon = {
  id: string
  /** The question text, in Arabic, exactly as authored. */
  prompt: string
  /**
   * Where the question comes from. A question copied from the book keeps its
   * wording and page reference; platform-authored questions are marked as such.
   */
  origin: 'textbook' | 'platform'
  source?: PageReference
  /** Optional hint shown on request, never auto-revealed. */
  hint?: string
  /** Explanation shown in the solutions view (not during the test). */
  explanation?: string
  points?: number
}

export type MultipleChoiceQuestion = QuestionCommon & {
  type: 'multiple-choice'
  /**
   * `single` shows radio controls, `multiple` shows checkboxes.
   * The correct answer is never revealed during the test.
   */
  selection: 'single' | 'multiple'
  options: Choice[]
  correctOptionIds: ChoiceId[]
}

export type TrueFalseQuestion = QuestionCommon & {
  type: 'true-false'
  correctAnswer: boolean
  /** Statement shown in place of `prompt` when the prompt is a stem. */
  statement?: string
}

export type FillBlankQuestion = QuestionCommon & {
  type: 'fill-blank'
  /** Segments with `{blankId}` markers, e.g. `الوحدة هي {b1} ورمزها {b2}`. */
  template: string
  blanks: Array<{
    id: string
    acceptedAnswers: string[]
    caseSensitive?: boolean
    /** Narrower input for numeric blanks. */
    kind?: 'text' | 'number' | 'unit'
  }>
}

export type OrderingQuestion = QuestionCommon & {
  type: 'ordering'
  items: Choice[]
  correctOrder: ChoiceId[]
}

export type MatchingQuestion = QuestionCommon & {
  type: 'matching'
  left: Choice[]
  right: Choice[]
  pairs: Array<{ leftId: ChoiceId; rightId: ChoiceId }>
}

export type NumericalQuestion = QuestionCommon & {
  type: 'numerical'
  acceptedAnswers: number[]
  /** Absolute tolerance; defaults to an exact comparison against each answer. */
  tolerance?: number
  /** Expected unit, displayed next to the input and checked when provided. */
  unit?: string
  /** Unit alternatives accepted for the answer (e.g. `m/s`, `m·s⁻¹`). */
  acceptedUnits?: string[]
}

export type ShortAnswerQuestion = QuestionCommon & {
  type: 'short-answer'
  /** Reference answer used for self-assessment and solution display. */
  referenceAnswer: string
  /** Aspects a complete answer must address. */
  rubric?: string[]
  minWords?: number
}

export type TableInterpretationQuestion = QuestionCommon & {
  type: 'table-interpretation'
  table: {
    caption: string
    columns: TableColumnSpec[]
    rows: TableRowSpec[]
    footnote?: string
  }
  questions: Question[]
}

export type DiagramInterpretationQuestion = QuestionCommon & {
  type: 'diagram-interpretation'
  diagramId: string
  diagramDescription: string
  questions: Question[]
}

export type Question =
  | MultipleChoiceQuestion
  | TrueFalseQuestion
  | FillBlankQuestion
  | OrderingQuestion
  | MatchingQuestion
  | NumericalQuestion
  | ShortAnswerQuestion
  | TableInterpretationQuestion
  | DiagramInterpretationQuestion

/* ---------------------------------------------------------------------------
 * Responses
 * ------------------------------------------------------------------------ */

export type ResponseValue =
  | { type: 'choice'; optionIds: ChoiceId[] }
  | { type: 'boolean'; value: boolean | null }
  | { type: 'blanks'; values: Record<string, string> }
  | { type: 'order'; itemIds: ChoiceId[] }
  | { type: 'matching'; pairs: Array<{ leftId: ChoiceId; rightId: ChoiceId | null }> }
  | { type: 'number'; value: string; unit?: string }
  | { type: 'text'; value: string }
  | { type: 'composite'; children: Record<string, ResponseValue> }

export type QuestionResponse = {
  questionId: string
  value: ResponseValue | null
}

/* ---------------------------------------------------------------------------
 * Final comprehensive test
 * ------------------------------------------------------------------------ */

export type FinalTest = {
  id: string
  /** Lesson this test completes. */
  lessonId: string
  origin: 'platform'
  status: ContentStatus
  /** Platform policy: 10–20 questions depending on lesson size. */
  targetQuestionCount: { min: number; max: number }
  questions: Question[]
}

export type AttemptSummary = {
  total: number
  answered: number
  /** Per-question automatic evaluation; short answers report `needs-review`. */
  results: Array<{
    questionId: string
    outcome: 'correct' | 'incorrect' | 'partial' | 'needs-review' | 'unanswered'
    points?: number
  }>
}
