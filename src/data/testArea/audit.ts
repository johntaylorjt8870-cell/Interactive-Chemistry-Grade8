import { solutionAnswerMatchesKey } from '@/testArea/answers'
import {
  COGNITIVE_KEYS,
  COGNITIVE_TAG,
  DIFFICULTIES,
  QUESTION_TYPES,
  type Difficulty,
  type QuestionTag,
  type QuestionType,
  type SolutionSet,
  type TestBank,
  type TestBlueprint,
  type TestMeta,
  type TestQuestion,
} from './types'
import { isPageInScope, unknownLatinTokens } from './curriculumScope'
import {
  compareOriginality,
  existingPromptEntries,
  originalitySourceLabel,
  testAreaEntries,
  type OriginalityCandidate,
} from './originality'
import { listTestDefinitions } from './registry'

/* ============================================================================
   Test Area audit
   ----------------------------------------------------------------------------
   Quality rules that are *checked*, not claimed. Every rule below was written
   as a failure mode first (a duplicated question, a solution that disagrees
   with the grader, an out-of-curriculum symbol, a placeholder string) and then
   turned into an assertion.

   The audit is imported by the test suite only — never by application code —
   so it costs nothing at runtime and cannot be switched off in production.
   ========================================================================= */

export type AuditIssue = {
  severity: 'error' | 'warning'
  code: string
  message: string
  /** Dotted path, e.g. `chem-u1-l1.question[3]:ta-l1-q04`. */
  path: string
}

/**
 * Placeholder wording — the death of a content bank.
 *
 * The Arabic alternatives are guarded by a non-letter boundary on the left,
 * because `قريبًا` also occurs inside the perfectly legitimate word
 * `تقريبًا` ("approximately"), which real chemistry prose needs.
 */
export const PLACEHOLDER_PATTERN =
  /\b(TODO|TBD|FIXME|XXX|Lorem|ipsum|placeholder|coming\s*soon)\b|(?:^|[^\u0621-\u064A])قريبًا|(?:^|[^\u0621-\u064A])قريبا|لوريم|يُضاف\s*لاحقًا/i

/* --- helpers -------------------------------------------------------------- */

function originalityLayerCode(layer: 'exact' | 'normalized' | 'structural' | 'semantic'): string {
  switch (layer) {
    case 'exact':
      return 'bank/exact-duplicate'
    case 'normalized':
      return 'bank/normalized-duplicate'
    case 'structural':
      return 'bank/structural-template-similarity'
    case 'semantic':
      return 'bank/semantic-similarity'
  }
}

/** Every authored string in a question, used by the text-level guards. */
export function questionText(question: TestQuestion): string {
  switch (question.type) {
    case 'single-choice':
    case 'multi-select':
      return [question.prompt, ...question.options.map((option) => option.label)].join(' ')
    case 'error-analysis':
      return [
        question.prompt,
        question.flawedWork,
        ...question.options.map((option) => option.label),
      ].join(' ')
    case 'true-false':
      return [question.prompt, question.statement ?? ''].join(' ')
    case 'ordering':
      return [question.prompt, ...question.items.map((item) => item.label)].join(' ')
    case 'matching':
      return [
        question.prompt,
        ...question.left.map((item) => item.label),
        ...question.right.map((item) => item.label),
      ].join(' ')
    case 'error-correction':
      return [question.prompt, question.flawedWork].join(' ')
    case 'numeric':
    case 'exact':
      return question.prompt
  }
}

export function solutionText(solution: SolutionSet['solutions'][number]): string {
  return [
    solution.answer,
    solution.whyCorrect,
    solution.concept,
    ...solution.thinking,
    solution.rule?.label ?? '',
    solution.substitution?.given ?? '',
    solution.substitution?.required ?? '',
    ...(solution.steps ?? []),
    solution.unitNote ?? '',
    solution.resultMeaning ?? '',
    solution.verification ?? '',
    ...solution.commonMistakes,
    ...(solution.whyOthersWrong ?? []).map((entry) => entry.reason),
  ].join(' ')
}

function sumRecord(record: Record<string, number>): number {
  return Object.values(record).reduce((total, value) => total + value, 0)
}

/* --- per-question structure ----------------------------------------------- */

function auditQuestionStructure(bank: TestBank, question: TestQuestion, index: number): AuditIssue[] {
  const issues: AuditIssue[] = []
  const path = `${bank.id}.question[${index}]:${question.id}`

  if (question.id.trim() === '') {
    issues.push({ severity: 'error', code: 'question/empty-id', message: 'Question id is empty.', path })
  }
  if (question.prompt.trim() === '') {
    issues.push({ severity: 'error', code: 'question/empty-prompt', message: 'Question prompt is empty.', path })
  }
  if (!DIFFICULTIES.includes(question.difficulty)) {
    issues.push({
      severity: 'error',
      code: 'question/bad-difficulty',
      message: `Unknown difficulty "${question.difficulty}".`,
      path,
    })
  }
  if (!bank.blueprint.concepts.some((concept) => concept.id === question.conceptId)) {
    issues.push({
      severity: 'error',
      code: 'question/unknown-concept',
      message: `Concept "${question.conceptId}" is not declared in the blueprint.`,
      path,
    })
  }
  if (question.tags.length === 0) {
    issues.push({
      severity: 'error',
      code: 'question/no-tags',
      message: 'A question must carry at least one cognitive tag.',
      path,
    })
  }
  if (question.sourceRefs.length === 0) {
    issues.push({
      severity: 'error',
      code: 'question/no-source',
      message: 'A question must reference the textbook pages it derives from.',
      path,
    })
  }
  for (const ref of question.sourceRefs) {
    if (!isPageInScope(ref.page, bank.lessonIds)) {
      issues.push({
        severity: 'error',
        code: 'question/page-out-of-scope',
        message: `Page "${ref.page}" is outside the published pages of ${bank.lessonIds.join(', ')}.`,
        path,
      })
    }
  }

  const unknown = unknownLatinTokens(questionText(question))
  if (unknown.length > 0) {
    issues.push({
      severity: 'error',
      code: 'question/out-of-curriculum-symbol',
      message: `Symbols outside the published curriculum: ${unknown.join(', ')}.`,
      path,
    })
  }

  if (PLACEHOLDER_PATTERN.test(questionText(question))) {
    issues.push({
      severity: 'error',
      code: 'question/placeholder',
      message: 'Question text contains placeholder wording.',
      path,
    })
  }

  switch (question.type) {
    case 'single-choice':
    case 'error-analysis': {
      if (question.options.length < 3) {
        issues.push({
          severity: 'error',
          code: 'question/too-few-options',
          message: 'A choice question needs at least three options.',
          path,
        })
      }
      if (question.correctOptionIds.length !== 1) {
        issues.push({
          severity: 'error',
          code: 'question/single-choice-arity',
          message: `A single-choice question must have exactly one correct option (found ${question.correctOptionIds.length}).`,
          path,
        })
      }
      for (const id of question.correctOptionIds) {
        if (!question.options.some((option) => option.id === id)) {
          issues.push({
            severity: 'error',
            code: 'question/dangling-correct-option',
            message: `Correct option "${id}" does not exist.`,
            path,
          })
        }
      }
      if (question.type === 'error-analysis' && question.flawedWork.trim() === '') {
        issues.push({
          severity: 'error',
          code: 'question/empty-flawed-work',
          message: 'An error-analysis question must show the flawed work.',
          path,
        })
      }
      break
    }

    case 'multi-select': {
      if (question.options.length < 3) {
        issues.push({
          severity: 'error',
          code: 'question/too-few-options',
          message: 'A multi-select question needs at least three options.',
          path,
        })
      }
      if (question.correctOptionIds.length < 2) {
        issues.push({
          severity: 'error',
          code: 'question/multi-select-arity',
          message: 'A multi-select question must have at least two correct options.',
          path,
        })
      }
      for (const id of question.correctOptionIds) {
        if (!question.options.some((option) => option.id === id)) {
          issues.push({
            severity: 'error',
            code: 'question/dangling-correct-option',
            message: `Correct option "${id}" does not exist.`,
            path,
          })
        }
      }
      break
    }

    case 'true-false':
      break

    case 'numeric': {
      if (!Number.isFinite(question.answer.correctValue)) {
        issues.push({
          severity: 'error',
          code: 'question/bad-correct-value',
          message: 'A numeric question must declare a finite correct value.',
          path,
        })
      }
      if ((question.answer.tolerance ?? 0) < 0) {
        issues.push({
          severity: 'error',
          code: 'question/negative-tolerance',
          message: 'Tolerance cannot be negative.',
          path,
        })
      }
      break
    }

    case 'exact': {
      if (question.answer.acceptedAnswers.length === 0) {
        issues.push({
          severity: 'error',
          code: 'question/no-accepted-answer',
          message: 'An exact question must declare at least one accepted answer.',
          path,
        })
      }
      break
    }

    case 'ordering': {
      if (question.items.length < 3) {
        issues.push({
          severity: 'error',
          code: 'question/too-few-items',
          message: 'An ordering question needs at least three items.',
          path,
        })
      }
      const unique = new Set(question.correctOrder)
      if (
        question.correctOrder.length !== question.items.length ||
        unique.size !== question.items.length ||
        question.items.some((item) => !question.correctOrder.includes(item.id))
      ) {
        issues.push({
          severity: 'error',
          code: 'question/ordering-not-permutation',
          message: 'The correct order must contain every item exactly once.',
          path,
        })
      }
      break
    }

    case 'matching': {
      if (question.left.length < 3 || question.right.length < 3) {
        issues.push({
          severity: 'error',
          code: 'question/too-few-items',
          message: 'A matching question needs at least three items on each side.',
          path,
        })
      }
      const leftIds = new Set(question.left.map((item) => item.id))
      const rightIds = new Set(question.right.map((item) => item.id))
      const usedLeft = new Set<string>()
      for (const pair of question.pairs) {
        if (!leftIds.has(pair.leftId)) {
          issues.push({
            severity: 'error',
            code: 'question/matching-unknown-left',
            message: `Unknown left item "${pair.leftId}".`,
            path,
          })
        }
        if (!rightIds.has(pair.rightId)) {
          issues.push({
            severity: 'error',
            code: 'question/matching-unknown-right',
            message: `Unknown right item "${pair.rightId}".`,
            path,
          })
        }
        if (usedLeft.has(pair.leftId)) {
          issues.push({
            severity: 'error',
            code: 'question/matching-duplicate-left',
            message: `Left item "${pair.leftId}" is matched more than once.`,
            path,
          })
        }
        usedLeft.add(pair.leftId)
      }
      if (question.pairs.length !== question.left.length) {
        issues.push({
          severity: 'error',
          code: 'question/matching-incomplete',
          message: 'Every left item must be matched exactly once.',
          path,
        })
      }
      break
    }

    case 'error-correction': {
      if (question.flawedWork.trim() === '') {
        issues.push({
          severity: 'error',
          code: 'question/empty-flawed-work',
          message: 'An error-correction question must show the flawed work.',
          path,
        })
      }
      if (question.correction.kind === 'numeric' && !Number.isFinite(question.correction.spec.correctValue)) {
        issues.push({
          severity: 'error',
          code: 'question/bad-correct-value',
          message: 'The corrected value must be finite.',
          path,
        })
      }
      if (
        question.correction.kind === 'exact' &&
        question.correction.spec.acceptedAnswers.length === 0
      ) {
        issues.push({
          severity: 'error',
          code: 'question/no-accepted-answer',
          message: 'An error-correction question must declare the corrected answer.',
          path,
        })
      }
      break
    }
  }

  return issues
}

/* --- blueprint ------------------------------------------------------------ */

function auditBlueprint(bank: TestBank): AuditIssue[] {
  const issues: AuditIssue[] = []
  const blueprint = bank.blueprint
  const path = `${bank.id}.blueprint`
  const total = bank.questions.length

  if (blueprint.testId !== bank.id) {
    issues.push({
      severity: 'error',
      code: 'blueprint/test-id',
      message: `Blueprint testId "${blueprint.testId}" does not match the bank id "${bank.id}".`,
      path,
    })
  }
  if (blueprint.questionCount !== total) {
    issues.push({
      severity: 'error',
      code: 'blueprint/question-count',
      message: `Blueprint declares ${blueprint.questionCount} questions, the bank has ${total}.`,
      path,
    })
  }

  const difficultyTotal = sumRecord(blueprint.difficulty)
  if (difficultyTotal !== total) {
    issues.push({
      severity: 'error',
      code: 'blueprint/difficulty-total',
      message: `Difficulty totals reach ${difficultyTotal}, expected ${total}.`,
      path,
    })
  }
  for (const level of DIFFICULTIES) {
    const declared = blueprint.difficulty[level]
    const actual = bank.questions.filter((question) => question.difficulty === level).length
    if (declared !== actual) {
      issues.push({
        severity: 'error',
        code: 'blueprint/difficulty-mismatch',
        message: `Blueprint declares ${declared} "${level}" questions, the bank has ${actual}.`,
        path,
      })
    }
  }

  const basic = blueprint.difficulty.basic
  if (basic > Math.ceil(total * 0.4)) {
    issues.push({
      severity: 'error',
      code: 'blueprint/too-many-basic',
      message: `Basic questions (${basic}) exceed 40% of the test.`,
      path,
    })
  }
  const higher = blueprint.difficulty.advanced + blueprint.difficulty.thinking
  if (higher < Math.floor(total * 0.25)) {
    issues.push({
      severity: 'error',
      code: 'blueprint/too-few-higher-order',
      message: `Advanced + thinking questions (${higher}) fall below 25% of the test.`,
      path,
    })
  }
  for (const level of DIFFICULTIES) {
    if (blueprint.difficulty[level] < 1) {
      issues.push({
        severity: 'error',
        code: 'blueprint/missing-difficulty-level',
        message: `No "${level}" questions — every test must span all four levels.`,
        path,
      })
    }
  }

  const typeTotal = sumRecord(blueprint.types)
  if (typeTotal !== total) {
    issues.push({
      severity: 'error',
      code: 'blueprint/type-total',
      message: `Question-type totals reach ${typeTotal}, expected ${total}.`,
      path,
    })
  }
  for (const type of QUESTION_TYPES) {
    const declared = blueprint.types[type]
    const actual = bank.questions.filter((question) => question.type === type).length
    if (declared !== actual) {
      issues.push({
        severity: 'error',
        code: 'blueprint/type-mismatch',
        message: `Blueprint declares ${declared} "${type}" questions, the bank has ${actual}.`,
        path,
      })
    }
  }
  const usedTypes = QUESTION_TYPES.filter((type) => blueprint.types[type] > 0).length
  const minTypes = blueprint.scope === 'unit' ? 8 : 6
  if (usedTypes < minTypes) {
    issues.push({
      severity: 'error',
      code: 'blueprint/too-few-types',
      message: `Only ${usedTypes} question types are used; a ${blueprint.scope} test needs at least ${minTypes}.`,
      path,
    })
  }
  for (const type of QUESTION_TYPES) {
    if (blueprint.types[type] > Math.floor(total / 2)) {
      issues.push({
        severity: 'error',
        code: 'blueprint/type-dominates',
        message: `Type "${type}" covers more than half of the test.`,
        path,
      })
    }
  }

  for (const key of COGNITIVE_KEYS) {
    const declared = blueprint.cognitive[key]
    const tag = COGNITIVE_TAG[key]
    const actual = bank.questions.filter((question) => question.tags.includes(tag)).length
    if (declared !== actual) {
      issues.push({
        severity: 'error',
        code: 'blueprint/cognitive-mismatch',
        message: `Blueprint declares ${declared} "${key}" questions, ${actual} carry the tag.`,
        path,
      })
    }
  }
  if (blueprint.cognitive.errorAnalysis < 1) {
    issues.push({
      severity: 'error',
      code: 'blueprint/no-error-coverage',
      message: 'Every test must cover at least one common error.',
      path,
    })
  }
  if (blueprint.scope === 'unit' && blueprint.cognitive.crossTopic < 1) {
    issues.push({
      severity: 'error',
      code: 'blueprint/no-cross-topic',
      message: 'A unit test must connect the lessons it covers.',
      path,
    })
  }

  for (const concept of blueprint.concepts) {
    if (concept.questionIds.length === 0) {
      issues.push({
        severity: 'error',
        code: 'blueprint/empty-concept',
        message: `Concept "${concept.id}" is declared but has no questions.`,
        path: `${path}.concept:${concept.id}`,
      })
    }
    for (const questionId of concept.questionIds) {
      if (!bank.questions.some((question) => question.id === questionId)) {
        issues.push({
          severity: 'error',
          code: 'blueprint/unknown-question-in-concept',
          message: `Concept "${concept.id}" references unknown question "${questionId}".`,
          path: `${path}.concept:${concept.id}`,
        })
      }
    }
    for (const ref of concept.pageRefs) {
      if (!isPageInScope(ref.page, bank.lessonIds)) {
        issues.push({
          severity: 'error',
          code: 'blueprint/page-out-of-scope',
          message: `Concept "${concept.id}" references page "${ref.page}" outside the covered lessons.`,
          path: `${path}.concept:${concept.id}`,
        })
      }
    }
  }

  if (blueprint.commonErrors.length === 0) {
    issues.push({
      severity: 'error',
      code: 'blueprint/no-common-errors',
      message: 'The blueprint must list the common errors the test targets.',
      path,
    })
  }

  for (const error of blueprint.commonErrors) {
    if (error.questionIds.length === 0) {
      issues.push({
        severity: 'error',
        code: 'blueprint/empty-common-error',
        message: `Common error "${error.id}" has no questions.`,
        path: `${path}.commonError:${error.id}`,
      })
    }
    for (const questionId of error.questionIds) {
      if (!bank.questions.some((question) => question.id === questionId)) {
        issues.push({
          severity: 'error',
          code: 'blueprint/unknown-question-in-error',
          message: `Common error "${error.id}" references unknown question "${questionId}".`,
          path: `${path}.commonError:${error.id}`,
        })
      }
    }
  }

  if (blueprint.solutionChunkSize < 1) {
    issues.push({
      severity: 'error',
      code: 'blueprint/bad-chunk-size',
      message: 'solutionChunkSize must be at least 1.',
      path,
    })
  }
  if (blueprint.scoring.pointsPerQuestion <= 0) {
    issues.push({
      severity: 'error',
      code: 'blueprint/bad-points',
      message: 'pointsPerQuestion must be positive.',
      path,
    })
  }

  if (blueprint.scope === 'lesson' && bank.lessonIds.length !== 1) {
    issues.push({
      severity: 'error',
      code: 'blueprint/lesson-scope',
      message: 'A lesson test must cover exactly one lesson.',
      path,
    })
  }
  if (blueprint.scope === 'unit' && bank.lessonIds.length < 2) {
    issues.push({
      severity: 'error',
      code: 'blueprint/unit-scope',
      message: 'A unit test must cover at least two lessons.',
      path,
    })
  }

  return issues
}

/* --- bank ----------------------------------------------------------------- */

export function auditTestBank(bank: TestBank): AuditIssue[] {
  const issues: AuditIssue[] = []
  const path = bank.id

  if (bank.questions.length === 0) {
    issues.push({
      severity: 'error',
      code: 'bank/no-questions',
      message: 'A registered test bank must contain questions.',
      path,
    })
    return issues
  }

  const seen = new Set<string>()
  for (const [index, question] of bank.questions.entries()) {
    if (seen.has(question.id)) {
      issues.push({
        severity: 'error',
        code: 'bank/duplicate-question-id',
        message: `Question id "${question.id}" is used more than once.`,
        path,
      })
    }
    seen.add(question.id)
    issues.push(...auditQuestionStructure(bank, question, index))
  }

  issues.push(...auditBlueprint(bank))

  // The bank guards itself with all four originality layers. The legacy
  // near-duplicate code is retained as a readable umbrella for callers that
  // already consume the audit, while the layer-specific code explains why it
  // failed.
  for (let i = 0; i < bank.questions.length; i += 1) {
    for (let j = i + 1; j < bank.questions.length; j += 1) {
      const left = bank.questions[i]!
      const right = bank.questions[j]!
      const match = compareOriginality(
        { prompt: left.prompt, text: questionText(left) },
        { prompt: right.prompt, text: questionText(right) },
      )
      if (match) {
        issues.push({
          severity: 'error',
          code: originalityLayerCode(match.layer),
          message: `Questions "${left.id}" and "${right.id}" collide at the ${match.layer} originality layer (score ${match.score.toFixed(2)}).`,
          path,
        })
        issues.push({
          severity: 'error',
          code: 'bank/near-duplicate',
          message: `Questions "${left.id}" and "${right.id}" are not independent questions.`,
          path,
        })
      }
    }
  }

  if (bank.scope === 'lesson' && bank.questions.length !== 20) {
    issues.push({
      severity: 'error',
      code: 'bank/lesson-question-count',
      message: `A lesson test must hold 20 questions (found ${bank.questions.length}).`,
      path,
    })
  }
  if (bank.scope === 'unit' && (bank.questions.length < 50 || bank.questions.length > 60)) {
    issues.push({
      severity: 'error',
      code: 'bank/unit-question-count',
      message: `A unit test must hold 50–60 questions (found ${bank.questions.length}).`,
      path,
    })
  }

  return issues
}

/**
 * Guards originality against curriculum content and, optionally, banks that
 * were already created. The string overload is retained for focused audit
 * tests; production passes provenance-aware candidates.
 */
export function auditOriginality(
  bank: TestBank,
  externalPrompts: readonly string[] | readonly OriginalityCandidate[],
  priorTestAreaEntries: readonly OriginalityCandidate[] = [],
): AuditIssue[] {
  const issues: AuditIssue[] = []
  const curriculumCandidates: OriginalityCandidate[] = externalPrompts.map((entry) =>
    typeof entry === 'string'
      ? { prompt: entry, text: entry, source: 'existing-content' as const }
      : entry,
  )
  const candidates = [...curriculumCandidates, ...priorTestAreaEntries]

  for (const question of bank.questions) {
    const left = { prompt: question.prompt, text: question.prompt }
    for (const candidate of candidates) {
      // A bank is never compared to itself here; self-collisions are checked by
      // auditTestBank above. Later banks are compared with earlier banks only.
      if (candidate.ownerId === bank.id && candidate.id === question.id) continue

      const match = compareOriginality(left, candidate)
      if (!match) continue

      const sourceLabel = originalitySourceLabel(match.candidate.source)
      issues.push({
        severity: 'error',
        code: originalityLayerCode(match.layer),
        message: `Question "${question.id}" collides at the ${match.layer} layer with ${sourceLabel} (score ${match.score.toFixed(2)}${match.candidate.id ? `; ${match.candidate.id}` : ''}).`,
        path: bank.id,
      })
      // Keep the stable public failure code used by the original guard. The
      // layer-specific code above is the evidence that the guard is no longer
      // a Jaccard-only check.
      issues.push({
        severity: 'error',
        code: 'bank/copies-existing-question',
        message: `Question "${question.id}" is not independent of ${sourceLabel}.`,
        path: bank.id,
      })
    }
  }
  return issues
}

/* --- solutions ------------------------------------------------------------ */

export function auditSolutionSet(bank: TestBank, set: SolutionSet): AuditIssue[] {
  const issues: AuditIssue[] = []
  const path = `${bank.id}.solutions`

  if (set.testId !== bank.id) {
    issues.push({
      severity: 'error',
      code: 'solutions/test-id',
      message: `Solution set targets "${set.testId}" but the bank is "${bank.id}".`,
      path,
    })
    return issues
  }

  const questionIds = new Set(bank.questions.map((question) => question.id))
  const seen = new Set<string>()

  for (const solution of set.solutions) {
    const solutionPath = `${path}:${solution.questionId}`
    if (seen.has(solution.questionId)) {
      issues.push({
        severity: 'error',
        code: 'solutions/duplicate',
        message: `Question "${solution.questionId}" has more than one solution.`,
        path: solutionPath,
      })
    }
    seen.add(solution.questionId)

    const question = bank.questions.find((entry) => entry.id === solution.questionId)
    if (!question) {
      issues.push({
        severity: 'error',
        code: 'solutions/unknown-question',
        message: `Solution references unknown question "${solution.questionId}".`,
        path: solutionPath,
      })
      continue
    }

    if (solution.answer.trim() === '') {
      issues.push({ severity: 'error', code: 'solutions/no-answer', message: 'Solution has no answer.', path: solutionPath })
    }
    if (solution.whyCorrect.trim() === '') {
      issues.push({ severity: 'error', code: 'solutions/no-reason', message: 'Solution never explains why the answer is right.', path: solutionPath })
    }
    if (solution.concept.trim() === '') {
      issues.push({ severity: 'error', code: 'solutions/no-concept', message: 'Solution does not explain the concept.', path: solutionPath })
    }
    if (solution.thinking.filter((step) => step.trim() !== '').length === 0) {
      issues.push({ severity: 'error', code: 'solutions/no-thinking', message: 'Solution does not show the line of thinking.', path: solutionPath })
    }
    if (solution.commonMistakes.filter((item) => item.trim() !== '').length === 0) {
      issues.push({ severity: 'error', code: 'solutions/no-common-mistakes', message: 'Solution lists no common mistakes.', path: solutionPath })
    }
    if (solution.pageRefs.length === 0) {
      issues.push({ severity: 'error', code: 'solutions/no-source', message: 'Solution does not reference the textbook pages.', path: solutionPath })
    }
    for (const ref of solution.pageRefs) {
      if (!isPageInScope(ref.page, bank.lessonIds)) {
        issues.push({
          severity: 'error',
          code: 'solutions/page-out-of-scope',
          message: `Page "${ref.page}" is outside the published pages of this test.`,
          path: solutionPath,
        })
      }
    }
    if (PLACEHOLDER_PATTERN.test(solutionText(solution))) {
      issues.push({
        severity: 'error',
        code: 'solutions/placeholder',
        message: 'Solution text contains placeholder wording.',
        path: solutionPath,
      })
    }
    if (solution.answer.trim() !== '' && !solutionAnswerMatchesKey(solution.answer, question)) {
      issues.push({
        severity: 'error',
        code: 'solutions/answer-mismatch',
        message: `Solution answer "${solution.answer}" does not match the grading key "${solution.questionId}".`,
        path: solutionPath,
      })
    }

    const optionIds = new Set<string>()
    if (question.type === 'single-choice' || question.type === 'multi-select' || question.type === 'error-analysis') {
      for (const option of question.options) optionIds.add(option.id)
    }
    for (const entry of solution.whyOthersWrong ?? []) {
      if (optionIds.size > 0 && !optionIds.has(entry.optionId)) {
        issues.push({
          severity: 'error',
          code: 'solutions/unknown-option',
          message: `Distractor rationale references unknown option "${entry.optionId}".`,
          path: solutionPath,
        })
      }
      if (entry.reason.trim() === '') {
        issues.push({
          severity: 'error',
          code: 'solutions/empty-distractor-reason',
          message: `Distractor "${entry.optionId}" has no explanation.`,
          path: solutionPath,
        })
      }
    }
  }

  for (const questionId of questionIds) {
    if (!seen.has(questionId)) {
      issues.push({
        severity: 'error',
        code: 'solutions/missing',
        message: `Question "${questionId}" has no solution.`,
        path,
      })
    }
  }

  return issues
}

/* --- metadata ------------------------------------------------------------- */

export function auditTestMeta(meta: TestMeta, bank: TestBank): AuditIssue[] {
  const issues: AuditIssue[] = []
  const path = `${meta.id}.meta`

  if (meta.id !== bank.id) return issues
  if (meta.questionCount !== bank.questions.length) {
    issues.push({
      severity: 'error',
      code: 'meta/question-count',
      message: `Meta declares ${meta.questionCount} questions, the bank has ${bank.questions.length}.`,
      path,
    })
  }
  for (const level of DIFFICULTIES) {
    if (meta.difficulty[level] !== bank.blueprint.difficulty[level]) {
      issues.push({
        severity: 'error',
        code: 'meta/difficulty',
        message: `Meta difficulty "${level}" disagrees with the blueprint.`,
        path,
      })
    }
  }
  for (const type of QUESTION_TYPES) {
    if (meta.types[type] !== bank.blueprint.types[type]) {
      issues.push({
        severity: 'error',
        code: 'meta/type',
        message: `Meta question type "${type}" disagrees with the blueprint.`,
        path,
      })
    }
  }
  if (meta.solutionChunkSize !== bank.blueprint.solutionChunkSize) {
    issues.push({
      severity: 'error',
      code: 'meta/chunk-size',
      message: 'Meta solution chunk size disagrees with the blueprint.',
      path,
    })
  }
  if (meta.scope !== bank.scope) {
    issues.push({ severity: 'error', code: 'meta/scope', message: 'Meta scope disagrees with the bank.', path })
  }
  return issues
}

/* --- whole registry ------------------------------------------------------- */

export type AuditReport = {
  issues: AuditIssue[]
  /** Question ids seen more than once across the whole Test Area. */
  duplicateIds: string[]
}

export async function auditRegisteredTests(): Promise<AuditReport> {
  const issues: AuditIssue[] = []
  const idOwner = new Map<string, string>()
  const duplicateIds = new Set<string>()
  const priorTestAreaQuestions: OriginalityCandidate[] = []
  const curriculumQuestions = existingPromptEntries()

  for (const definition of listTestDefinitions()) {
    const bankModule = await definition.load()
    const bank = bankModule.default
    issues.push(...auditTestBank(bank))
    issues.push(...auditTestMeta(definition.meta, bank))

    const solutionsModule = await definition.loadSolutions()
    issues.push(...auditSolutionSet(bank, solutionsModule.default))

    // Registry order is deterministic. A later bank is checked against every
    // Test Area question already created, so Unit 1 cannot recycle Lesson 1 or
    // Lesson 2 while Lesson 2 itself is checked against Lesson 1.
    issues.push(...auditOriginality(bank, curriculumQuestions, priorTestAreaQuestions))
    priorTestAreaQuestions.push(...testAreaEntries(bank))

    for (const question of bank.questions) {
      if (idOwner.has(question.id) && idOwner.get(question.id) !== bank.id) {
        duplicateIds.add(question.id)
      }
      idOwner.set(question.id, bank.id)
    }
  }

  for (const id of duplicateIds) {
    issues.push({
      severity: 'error',
      code: 'registry/duplicate-question-id',
      message: `Question id "${id}" is used by more than one test.`,
      path: 'registry',
    })
  }

  return { issues, duplicateIds: [...duplicateIds] }
}

export function hasErrors(issues: readonly AuditIssue[]): boolean {
  return issues.some((issue) => issue.severity === 'error')
}

export function formatIssues(issues: readonly AuditIssue[]): string {
  return issues.map((issue) => `[${issue.severity}] ${issue.code} — ${issue.message} (${issue.path})`).join('\n')
}

export type { Difficulty, QuestionTag, QuestionType, TestBlueprint }
