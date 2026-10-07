import type { Question } from '@/assessment/types'
import {
  bookActivitySolutions as l1Activity,
  bookQuestions as l1Book,
  finalTest as l1Final,
} from '@/data/curriculum/chemistryLesson1'
import {
  bookActivitySolutions as l2Activity,
  bookQuestions as l2Book,
  finalTest as l2Final,
} from '@/data/curriculum/chemistryLesson2'
import {
  bookActivitySolutions as l3Activity,
  bookQuestions as l3Book,
  finalTest as l3Final,
} from '@/data/curriculum/chemistryLesson3'
import type { TestBank, TestQuestion } from './types'

/* ============================================================================
   Originality corpus and layered comparison
   ----------------------------------------------------------------------------
   A Test Area question is original only after it passes several independent
   checks. The checks deliberately do not collapse into one Jaccard number:

   1. exact text — catches a prompt copied character-for-character;
   2. normalised text — catches changes to whitespace, punctuation, case,
      Arabic diacritics and common letter forms;
   3. structural/template form — masks numbers and formula tokens, catching a
      copied question frame with values swapped;
   4. semantic-style similarity — combines token overlap, token containment,
      character n-gram overlap and ordered-word agreement. It is a conservative
      lexical semantic guard, not a random generator and not a single metric.

   The corpus is provenance-aware: textbook questions, lesson assessments and
   final tests are kept as separate source classes. Existing Test Area banks
   are supplied by the registry audit as another source class, so a later bank
   is compared with every bank already created before it is accepted.
   ========================================================================= */

export type OriginalitySource =
  | 'textbook-question'
  | 'lesson-assessment'
  | 'final-test'
  | 'test-area'
  | 'existing-content'

export type OriginalityCandidate = {
  prompt: string
  /** Optional longer text; defaults to prompt. */
  text?: string
  id?: string
  source: OriginalitySource
  ownerId?: string
}

export type OriginalityLayer = 'exact' | 'normalized' | 'structural' | 'semantic'

export type OriginalityMatch = {
  layer: OriginalityLayer
  score: number
  candidate: OriginalityCandidate
}

function questionPrompts(question: Question): string[] {
  const prompts = [question.prompt]
  if ('statement' in question && typeof question.statement === 'string') {
    prompts.push(question.statement)
  }
  if ('template' in question && typeof question.template === 'string') {
    prompts.push(question.template)
  }
  return prompts
}

function curriculumEntries(
  questions: readonly Question[],
  source: OriginalitySource,
  prefix: string,
): OriginalityCandidate[] {
  return questions.flatMap((question) =>
    questionPrompts(question).map((prompt, index) => ({
      prompt,
      id: `${prefix}:${question.id}:${index}`,
      source,
    })),
  )
}

/**
 * Every question-like prompt already shipped by the curriculum and assessment
 * surfaces. Keeping the source class here makes the audit report explain what
 * a collision was compared against rather than merely saying "duplicate".
 */
export function existingPromptEntries(): OriginalityCandidate[] {
  return [
    ...curriculumEntries(l1Book, 'textbook-question', 'l1-book'),
    ...curriculumEntries(l1Activity, 'lesson-assessment', 'l1-activity'),
    ...curriculumEntries(l1Final.questions, 'final-test', 'l1-final'),
    ...curriculumEntries(l2Book, 'textbook-question', 'l2-book'),
    ...curriculumEntries(l2Activity, 'lesson-assessment', 'l2-activity'),
    ...curriculumEntries(l2Final.questions, 'final-test', 'l2-final'),
    ...curriculumEntries(l3Book, 'textbook-question', 'l3-book'),
    ...curriculumEntries(l3Activity, 'lesson-assessment', 'l3-activity'),
    ...curriculumEntries(l3Final.questions, 'final-test', 'l3-final'),
  ]
}

/** Every prompt the platform already ships, de-duplicated exactly. */
export function existingPrompts(): string[] {
  return [
    ...new Set(
      existingPromptEntries()
        .map((entry) => entry.prompt.trim())
        .filter(Boolean),
    ),
  ]
}

/** How many distinct questions the curriculum corpus holds. */
export function corpusSize(): number {
  return existingPrompts().length
}

/** Prompts of the questions inside one bank, for self-comparison. */
export function bankPrompts(questions: readonly TestQuestion[]): string[] {
  return questions.map((question) => question.prompt.trim())
}

/** Turns a bank into candidates for the cross-bank originality guard. */
export function testAreaEntries(bank: TestBank): OriginalityCandidate[] {
  return bank.questions.map((question) => ({
    prompt: question.prompt,
    text: question.prompt,
    id: question.id,
    source: 'test-area',
    ownerId: bank.id,
  }))
}

const ARABIC_DIACRITICS = /[\u064B-\u0652\u0670\u0640]/g
const PUNCTUATION = /[.,؛;:،«»()\[\]{}"'!؟?\-–—_+*\/|=<>]/g

/** Exact comparison: only surrounding whitespace is ignored. */
function exactText(value: string): string {
  return value.trim()
}

/** Normalised comparison: formatting and harmless Arabic orthography vanish. */
export function normaliseOriginalityText(value: string): string {
  return value
    .normalize('NFKC')
    .replace(ARABIC_DIACRITICS, '')
    .replace(/[أإآٱ]/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/ؤ/g, 'و')
    .replace(/ئ/g, 'ي')
    .replace(/ة/g, 'ه')
    .replace(/[٠-٩]/g, (digit) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(digit)))
    .replace(/\s+/g, '')
    .replace(PUNCTUATION, '')
    .toLowerCase()
}

function words(value: string): string[] {
  return (
    value
      .normalize('NFKC')
      .toLowerCase()
      .replace(ARABIC_DIACRITICS, '')
      .match(/[\p{L}\p{N}]+/gu) ?? []
  )
}

const STOP_WORDS = new Set([
  'ما', 'ماذا', 'هل', 'أي', 'أيّ', 'في', 'من', 'إلى', 'عن', 'على', 'بين', 'كل', 'ثم',
  'هو', 'هي', 'هذا', 'هذه', 'ذلك', 'تلك', 'التي', 'الذي', 'الآتي', 'الآتية', 'كم',
  'عدد', 'اكتب', 'اكتبوا', 'حدّد', 'حدد', 'اختر', 'اختر', 'اذكر', 'بيّن', 'بين',
  'علّل', 'علل', 'مع', 'أو', 'و', 'أن', 'إن', 'لـ', 'ل', 'منها', 'له', 'لها',
])

function meaningfulWords(value: string): string[] {
  return words(value).filter((word) => word.length > 1 && !STOP_WORDS.has(word))
}

function setOf(values: readonly string[]): Set<string> {
  return new Set(values)
}

function jaccard(left: Set<string>, right: Set<string>): number {
  if (left.size === 0 && right.size === 0) return 1
  if (left.size === 0 || right.size === 0) return 0
  let shared = 0
  for (const token of left) if (right.has(token)) shared += 1
  return shared / (left.size + right.size - shared)
}

function dice(left: Set<string>, right: Set<string>): number {
  if (left.size === 0 && right.size === 0) return 1
  if (left.size === 0 || right.size === 0) return 0
  let shared = 0
  for (const token of left) if (right.has(token)) shared += 1
  return (2 * shared) / (left.size + right.size)
}

function characterBigrams(value: string): Set<string> {
  const compact = normaliseOriginalityText(value)
  const result = new Set<string>()
  for (let index = 0; index < compact.length - 1; index += 1) {
    result.add(compact.slice(index, index + 2))
  }
  return result
}

function orderedAgreement(left: readonly string[], right: readonly string[]): number {
  if (left.length === 0 || right.length === 0) return 0
  let cursor = 0
  let matched = 0
  for (const token of left) {
    const found = right.indexOf(token, cursor)
    if (found >= cursor) {
      matched += 1
      cursor = found + 1
    }
  }
  return matched / Math.max(left.length, right.length)
}

function maskTemplate(value: string): string[] {
  return words(value)
    .map((word) => {
      if (/^\d+$/.test(word) || /^[a-z][a-z]?\d*$/i.test(word)) return '<value>'
      return word
    })
    .filter((word) => word.length > 1 || word === '<value>')
}

function structuralSimilarity(left: string, right: string): number {
  const leftTemplate = maskTemplate(left)
  const rightTemplate = maskTemplate(right)
  if (leftTemplate.length < 5 || rightTemplate.length < 5) return 0
  const leftSet = setOf(leftTemplate)
  const rightSet = setOf(rightTemplate)
  const templateOverlap = jaccard(leftSet, rightSet)
  const order = orderedAgreement(leftTemplate, rightTemplate)
  const lengthAgreement =
    1 - Math.min(1, Math.abs(leftTemplate.length - rightTemplate.length) / Math.max(leftTemplate.length, rightTemplate.length))
  return 0.45 * templateOverlap + 0.35 * order + 0.2 * lengthAgreement
}

/**
 * Combined semantic-style score. It intentionally uses four signals, with
 * Jaccard only one contributor, so a shared question frame alone is not enough
 * to reject a valid question about a different chemistry concept.
 */
function semanticSimilarity(left: string, right: string): number {
  const leftWords = meaningfulWords(left)
  const rightWords = meaningfulWords(right)
  const leftSet = setOf(leftWords)
  const rightSet = setOf(rightWords)
  if (leftSet.size < 3 || rightSet.size < 3) return 0
  const overlap = jaccard(leftSet, rightSet)
  const sharedContainment =
    [...leftSet].filter((token) => rightSet.has(token)).length / Math.min(leftSet.size, rightSet.size)
  const character = dice(characterBigrams(left), characterBigrams(right))
  const order = orderedAgreement(leftWords, rightWords)
  return 0.32 * overlap + 0.28 * sharedContainment + 0.24 * character + 0.16 * order
}

/**
 * Compares two stems in layer order. A later layer is considered only when
 * earlier, stricter layers did not match; this keeps the audit explainable.
 */
type ComparisonCandidate = Pick<OriginalityCandidate, 'prompt' | 'text'> &
  Partial<Pick<OriginalityCandidate, 'id' | 'source' | 'ownerId'>>

function completeCandidate(candidate: ComparisonCandidate): OriginalityCandidate {
  return {
    prompt: candidate.prompt,
    text: candidate.text,
    id: candidate.id,
    source: candidate.source ?? 'existing-content',
    ownerId: candidate.ownerId,
  }
}

export function compareOriginality(
  left: ComparisonCandidate,
  right: ComparisonCandidate,
): OriginalityMatch | null {
  const leftPrompt = exactText(left.prompt)
  const rightPrompt = exactText(right.prompt)
  if (leftPrompt !== '' && leftPrompt === rightPrompt) {
    return { layer: 'exact', score: 1, candidate: completeCandidate(right) }
  }

  const normalLeft = normaliseOriginalityText(leftPrompt)
  const normalRight = normaliseOriginalityText(rightPrompt)
  if (normalLeft !== '' && normalLeft === normalRight) {
    return { layer: 'normalized', score: 1, candidate: completeCandidate(right) }
  }

  const structural = structuralSimilarity(leftPrompt, rightPrompt)
  // A template collision must also retain substantial ordered structure; the
  // threshold is intentionally stricter than a broad topical resemblance.
  if (structural >= 0.93) {
    return { layer: 'structural', score: structural, candidate: completeCandidate(right) }
  }

  const semantic = semanticSimilarity(left.text ?? leftPrompt, right.text ?? rightPrompt)
  if (semantic >= 0.90) {
    return { layer: 'semantic', score: semantic, candidate: completeCandidate(right) }
  }
  return null
}

/** Human-readable provenance for an audit message. */
export function originalitySourceLabel(source: OriginalitySource): string {
  switch (source) {
    case 'textbook-question':
      return 'أسئلة الكتاب المدرسي'
    case 'lesson-assessment':
      return 'تقويمات الدروس والأنشطة'
    case 'final-test':
      return 'الاختبارات النهائية الموجودة'
    case 'test-area':
      return 'أسئلة منطقة الاختبارات المنشورة سابقاً'
    case 'existing-content':
      return 'المحتوى المنشور سابقاً'
  }
}
