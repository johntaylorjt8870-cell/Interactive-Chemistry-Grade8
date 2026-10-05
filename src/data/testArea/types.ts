import type { PageReference } from '@/data/source'

/* ============================================================================
   Test Area — data model
   ----------------------------------------------------------------------------
   This model is deliberately independent of `src/assessment/`: Test Area owns
   its own question shapes, its own grading key, its own blueprints and its own
   solutions. Nothing here is imported by the lesson engine, the lesson final
   test or the teacher area, and nothing there is imported by this folder.

   Rules encoded in the types themselves:
   - every question carries `difficulty`, `conceptId`, `sourceRefs` and `tags`,
     so curriculum fidelity and blueprint coverage are checkable, not claimed;
   - the grading key lives with the question (in the bank), while the
     pedagogical solution lives in a separate lazily loaded module, so an
     attempt never ships the explanations;
   - answers are deterministic: no runtime generation, no randomisation.
   ========================================================================= */

/* --- Difficulty ---------------------------------------------------------- */

export type Difficulty = 'basic' | 'medium' | 'advanced' | 'thinking'

export const DIFFICULTIES = ['basic', 'medium', 'advanced', 'thinking'] as const

export const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  basic: 'أساسي',
  medium: 'متوسط',
  advanced: 'متقدم',
  thinking: 'تفكير',
}

export function isDifficulty(value: string): value is Difficulty {
  return (DIFFICULTIES as readonly string[]).includes(value)
}

/* --- Question types ------------------------------------------------------ */

export type QuestionType =
  | 'single-choice'
  | 'true-false'
  | 'multi-select'
  | 'numeric'
  | 'exact'
  | 'ordering'
  | 'matching'
  | 'error-analysis'
  | 'error-correction'

export const QUESTION_TYPES = [
  'single-choice',
  'true-false',
  'multi-select',
  'numeric',
  'exact',
  'ordering',
  'matching',
  'error-analysis',
  'error-correction',
] as const

export const QUESTION_TYPE_LABELS: Record<QuestionType, string> = {
  'single-choice': 'اختيار من متعدد',
  'true-false': 'صح أو خطأ',
  'multi-select': 'اختيار متعدد الإجابات',
  numeric: 'إجابة رقمية',
  exact: 'إجابة مضبوطة',
  ordering: 'ترتيب',
  matching: 'مطابقة',
  'error-analysis': 'تحليل خطأ',
  'error-correction': 'تصحيح خطأ',
}

export function isQuestionType(value: string): value is QuestionType {
  return (QUESTION_TYPES as readonly string[]).includes(value)
}

/* --- Scope --------------------------------------------------------------- */

export type Scope = 'lesson' | 'unit' | 'comprehensive'

export const SCOPE_LABELS: Record<Scope, string> = {
  lesson: 'اختبار درس',
  unit: 'اختبار وحدة',
  comprehensive: 'اختبار شامل',
}

/* --- Cognitive tags ------------------------------------------------------ */

export type QuestionTag =
  | 'conceptual'
  | 'application'
  | 'problem-solving'
  | 'thinking'
  | 'comparison'
  | 'error-analysis'
  | 'cross-topic'
  | 'data-reading'

export const QUESTION_TAGS = [
  'conceptual',
  'application',
  'problem-solving',
  'thinking',
  'comparison',
  'error-analysis',
  'cross-topic',
  'data-reading',
] as const

export const QUESTION_TAG_LABELS: Record<QuestionTag, string> = {
  conceptual: 'فهم المفاهيم',
  application: 'تطبيق',
  'problem-solving': 'حل مشكلات',
  thinking: 'تفكير',
  comparison: 'مقارنة',
  'error-analysis': 'تحليل أخطاء',
  'cross-topic': 'ربط بين الدروس',
  'data-reading': 'قراءة بيانات',
}

/** Blueprint cognitive key → the tag counted for it. */
export const COGNITIVE_TAG: Record<CognitiveKey, QuestionTag> = {
  conceptual: 'conceptual',
  application: 'application',
  problemSolving: 'problem-solving',
  thinking: 'thinking',
  comparison: 'comparison',
  errorAnalysis: 'error-analysis',
  crossTopic: 'cross-topic',
  dataReading: 'data-reading',
}

export type CognitiveKey =
  | 'conceptual'
  | 'application'
  | 'problemSolving'
  | 'thinking'
  | 'comparison'
  | 'errorAnalysis'
  | 'crossTopic'
  | 'dataReading'

export const COGNITIVE_KEYS = [
  'conceptual',
  'application',
  'problemSolving',
  'thinking',
  'comparison',
  'errorAnalysis',
  'crossTopic',
  'dataReading',
] as const

export const COGNITIVE_LABELS: Record<CognitiveKey, string> = {
  conceptual: 'فهم المفاهيم',
  application: 'تطبيق',
  problemSolving: 'حل المشكلات',
  thinking: 'تفكير واستنتاج',
  comparison: 'مقارنة',
  errorAnalysis: 'تحليل الأخطاء',
  crossTopic: 'ربط بين الدروس',
  dataReading: 'قراءة البيانات',
}

/* --- Shared pieces ------------------------------------------------------- */

export type Choice = {
  id: string
  /** Arabic text or compact scientific notation (`H₂O`, `Ca²⁺`, `2-8-1`). */
  label: string
}

/**
 * Numeric answer policy — explicit, never guessed at grading time.
 *
 * `tolerance`      absolute tolerance; `0` (default) means an exact value.
 * `integerOnly`    rejects non-integer entries (counts of particles).
 * `decimals.max`   rejects entries with more decimal places than allowed.
 * `unit`           when absent, the unit is not part of the answer and its
 *                  absence never fails the answer. When present, a *supplied*
 *                  unit must be one of `accepted`, and `required` additionally
 *                  makes the unit mandatory.
 */
export type NumericAnswerSpec = {
  correctValue: number
  acceptedValues?: number[]
  tolerance?: number
  integerOnly?: boolean
  decimals?: { max?: number }
  unit?: { required: boolean; accepted: string[]; label?: string }
  allowFractionInput?: boolean
}

export type ExactKind = 'distribution' | 'formula' | 'ion' | 'fraction' | 'text'

export type ExactAnswerSpec = {
  /** Which normaliser equates the student entry with the accepted answers. */
  kind: ExactKind
  acceptedAnswers: string[]
  /** Defaults to false: element symbols are case sensitive, Arabic text is not. */
  caseSensitive?: boolean
  /** Hint printed next to the input, e.g. `2-8-1`. */
  inputHint?: string
}

export type TestQuestionBase = {
  /** Stable, globally unique id, e.g. `ta-l1-q07`. */
  id: string
  prompt: string
  difficulty: Difficulty
  /** Must exist in the owning blueprint's `concepts`. */
  conceptId: string
  /** Pages of the printed textbook this question derives from. */
  sourceRefs: PageReference[]
  tags: QuestionTag[]
  points?: number
}

export type SingleChoiceQuestion = TestQuestionBase & {
  type: 'single-choice'
  options: Choice[]
  /** Exactly one id — enforced by the audit. */
  correctOptionIds: string[]
}

export type TrueFalseQuestion = TestQuestionBase & {
  type: 'true-false'
  correctAnswer: boolean
  /** Optional statement restated below the prompt. */
  statement?: string
}

export type MultiSelectQuestion = TestQuestionBase & {
  type: 'multi-select'
  options: Choice[]
  /** Two or more ids — enforced by the audit. */
  correctOptionIds: string[]
}

export type NumericQuestion = TestQuestionBase & {
  type: 'numeric'
  answer: NumericAnswerSpec
}

export type ExactQuestion = TestQuestionBase & {
  type: 'exact'
  answer: ExactAnswerSpec
}

export type OrderingQuestion = TestQuestionBase & {
  type: 'ordering'
  items: Choice[]
  correctOrder: string[]
}

export type MatchingQuestion = TestQuestionBase & {
  type: 'matching'
  left: Choice[]
  right: Choice[]
  pairs: Array<{ leftId: string; rightId: string }>
}

/** A flawed solution is shown; the student identifies the mistake. */
export type ErrorAnalysisQuestion = TestQuestionBase & {
  type: 'error-analysis'
  /** The student's (fictional) work, printed exactly as authored. */
  flawedWork: string
  options: Choice[]
  correctOptionIds: string[]
}

/** A flawed solution is shown; the student enters the corrected value. */
export type ErrorCorrectionQuestion = TestQuestionBase & {
  type: 'error-correction'
  flawedWork: string
  correction:
    | { kind: 'numeric'; spec: NumericAnswerSpec }
    | { kind: 'exact'; spec: ExactAnswerSpec }
}

export type TestQuestion =
  | SingleChoiceQuestion
  | TrueFalseQuestion
  | MultiSelectQuestion
  | NumericQuestion
  | ExactQuestion
  | OrderingQuestion
  | MatchingQuestion
  | ErrorAnalysisQuestion
  | ErrorCorrectionQuestion

/* --- Responses ----------------------------------------------------------- */

export type ResponseValue =
  | { type: 'choice'; optionIds: string[] }
  | { type: 'boolean'; value: boolean | null }
  | { type: 'number'; value: string; unit?: string }
  | { type: 'text'; value: string }
  | { type: 'order'; itemIds: string[] }
  | { type: 'matching'; pairs: Array<{ leftId: string; rightId: string | null }> }

export type ResponseMap = Record<string, ResponseValue | undefined>

/** True when the student has supplied something meaningful. */
export function hasResponse(value: ResponseValue | undefined | null): boolean {
  if (!value) return false
  switch (value.type) {
    case 'choice':
      return value.optionIds.length > 0
    case 'boolean':
      return value.value !== null
    case 'number':
      return value.value.trim() !== ''
    case 'text':
      return value.value.trim() !== ''
    case 'order':
      return value.itemIds.length > 0
    case 'matching':
      return value.pairs.some((pair) => pair.rightId !== null && pair.rightId !== '')
    default:
      return false
  }
}

/* --- Blueprint ----------------------------------------------------------- */

export type BlueprintConcept = {
  id: string
  label: string
  pageRefs: PageReference[]
  questionIds: string[]
}

export type BlueprintCommonError = {
  id: string
  label: string
  questionIds: string[]
}

export type ScoringPolicy = {
  pointsPerQuestion: number
  /** Multi-select, ordering and matching may earn partial credit when true. */
  allowPartial: boolean
}

export type TestBlueprint = {
  testId: string
  scope: Scope
  questionCount: number
  /** Lesson ids whose content this test measures. */
  lessonIds: string[]
  unitId: string
  concepts: BlueprintConcept[]
  difficulty: Record<Difficulty, number>
  types: Record<QuestionType, number>
  cognitive: Record<CognitiveKey, number>
  commonErrors: BlueprintCommonError[]
  crossTopicConnections?: Array<{ label: string; lessonIds: string[]; questionIds: string[] }>
  scoring: ScoringPolicy
  /** Solutions are chunked by this many questions per part. */
  solutionChunkSize: number
}

/* --- Bank ---------------------------------------------------------------- */

export type TestBank = {
  id: string
  /** Bumped whenever questions change; invalidates persisted drafts. */
  version: number
  scope: Scope
  title: string
  summary: string
  unitId: string
  lessonIds: string[]
  questions: TestQuestion[]
  blueprint: TestBlueprint
}

/* --- Solutions ----------------------------------------------------------- */

/**
 * An educational solution — never a bare answer key.
 *
 * `thinking`, `commonMistakes` and `whyOthersWrong` are what make the
 * solutions area a learning surface rather than a cheat sheet.
 */
export type QuestionSolution = {
  /** References a question id in the matching bank. */
  questionId: string
  /** The correct answer in its scientific form (`Ca²⁺`, `2-8-1`, `32`). */
  answer: string
  whyCorrect: string
  concept: string
  thinking: string[]
  rule?: { label: string; tex?: string }
  substitution?: { given: string; required: string }
  steps?: string[]
  unitNote?: string
  resultMeaning?: string
  verification?: string
  commonMistakes: string[]
  whyOthersWrong?: Array<{ optionId: string; reason: string }>
  pageRefs: PageReference[]
}

export type SolutionSet = {
  testId: string
  version: number
  solutions: QuestionSolution[]
}

/* --- Registry meta ------------------------------------------------------- */

/**
 * The cheap, eagerly-shipped description of a test: enough to render the
 * Test Area home without loading a single question. The audit asserts that
 * these numbers match the lazily loaded bank.
 */
export type TestMeta = {
  id: string
  scope: Scope
  title: string
  summary: string
  unitId: string
  lessonIds: string[]
  questionCount: number
  difficulty: Record<Difficulty, number>
  types: Record<QuestionType, number>
  solutionChunkSize: number
  /** Pages covered, e.g. `3–12`. */
  pageRange: string
}

export type TestDefinition = {
  meta: TestMeta
  /** Lazily loads the questions + blueprint (no solutions inside). */
  load: () => Promise<{ default: TestBank }>
  /** Lazily loads the solutions — never fetched during an attempt. */
  loadSolutions: () => Promise<{ default: SolutionSet }>
}
