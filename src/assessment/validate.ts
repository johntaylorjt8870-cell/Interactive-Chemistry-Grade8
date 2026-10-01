import type { FidelityIssue } from '@/data/source'
import type { FinalTest, Question } from './types'

/**
 * Structural validation for assessment content.
 *
 * These checks protect the quality rules of the platform: a published test has
 * 10–20 questions, ids are unique, every "correct" reference points at
 * something that exists, and any question that claims to come from the
 * textbook carries a page reference.
 */
export function validateFinalTest(test: FinalTest, path: string): FidelityIssue[] {
  const issues: FidelityIssue[] = []
  const walk = (questions: Question[], scope: string) => {
    questions.forEach((question, index) => {
      const questionPath = `${scope}.question[${index}]:${question.id}`
      if (question.prompt.trim() === '') {
        issues.push({
          severity: 'error',
          code: 'question/empty-prompt',
          message: 'Question prompt is empty.',
          path: questionPath,
        })
      }

      if (question.origin === 'textbook' && !question.source?.page) {
        issues.push({
          severity: 'error',
          code: 'question/missing-source',
          message: 'A question taken from the textbook must reference its page.',
          path: questionPath,
        })
      }

      switch (question.type) {
        case 'multiple-choice': {
          if (question.options.length < 2) {
            issues.push({
              severity: 'error',
              code: 'question/too-few-options',
              message: 'A choice question needs at least two options.',
              path: questionPath,
            })
          }
          if (question.correctOptionIds.length === 0) {
            issues.push({
              severity: 'error',
              code: 'question/no-correct-option',
              message: 'A choice question must declare at least one correct option.',
              path: questionPath,
            })
          }
          if (question.selection === 'single' && question.correctOptionIds.length > 1) {
            issues.push({
              severity: 'error',
              code: 'question/single-choice-multiple-answers',
              message: 'A single-choice question cannot have several correct options.',
              path: questionPath,
            })
          }
          for (const correctId of question.correctOptionIds) {
            if (!question.options.some((option) => option.id === correctId)) {
              issues.push({
                severity: 'error',
                code: 'question/dangling-correct-option',
                message: `Correct option "${correctId}" does not exist among the options.`,
                path: questionPath,
              })
            }
          }
          break
        }

        case 'fill-blank': {
          const declared = new Set(question.blanks.map((blank) => blank.id))
          const blankMarkers = [...question.template.matchAll(/\{([a-zA-Z0-9_-]+)\}/g)].map((match) => match[1]!)
          for (const marker of blankMarkers) {
            if (!declared.has(marker)) {
              issues.push({
                severity: 'error',
                code: 'question/undeclared-blank',
                message: `Template references blank "${marker}" which is not declared.`,
                path: questionPath,
              })
            }
          }
          if (blankMarkers.length !== declared.size) {
            issues.push({
              severity: 'error',
              code: 'question/blank-count-mismatch',
              message: 'Template blank markers and declared blanks do not match.',
              path: questionPath,
            })
          }
          break
        }

        case 'ordering': {
          if (question.correctOrder.length !== question.items.length) {
            issues.push({
              severity: 'error',
              code: 'question/ordering-incomplete',
              message: 'The correct order must contain every item exactly once.',
              path: questionPath,
            })
          }
          break
        }

        case 'matching': {
          for (const pair of question.pairs) {
            if (!question.left.some((item) => item.id === pair.leftId)) {
              issues.push({
                severity: 'error',
                code: 'question/matching-unknown-left',
                message: `Matching pair references unknown left item "${pair.leftId}".`,
                path: questionPath,
              })
            }
            if (!question.right.some((item) => item.id === pair.rightId)) {
              issues.push({
                severity: 'error',
                code: 'question/matching-unknown-right',
                message: `Matching pair references unknown right item "${pair.rightId}".`,
                path: questionPath,
              })
            }
          }
          break
        }

        case 'numerical': {
          if (question.acceptedAnswers.length === 0) {
            issues.push({
              severity: 'error',
              code: 'question/no-accepted-answer',
              message: 'A numerical question must declare at least one accepted answer.',
              path: questionPath,
            })
          }
          break
        }

        case 'short-answer': {
          if (question.referenceAnswer.trim() === '') {
            issues.push({
              severity: 'error',
              code: 'question/missing-reference-answer',
              message: 'A short-answer question must carry a reference answer.',
              path: questionPath,
            })
          }
          break
        }

        case 'table-interpretation':
        case 'diagram-interpretation': {
          if (question.questions.length === 0) {
            issues.push({
              severity: 'error',
              code: 'question/no-sub-questions',
              message: 'An interpretation question must contain sub-questions.',
              path: questionPath,
            })
          }
          walk(question.questions, questionPath)
          break
        }

        case 'true-false':
          break
      }
    })
  }

  walk(test.questions, path)

  const duplicates = findDuplicateIds(test.questions)
  for (const id of duplicates) {
    issues.push({
      severity: 'error',
      code: 'test/duplicate-question-id',
      message: `Question id "${id}" is used more than once in this test.`,
      path,
    })
  }

  if (test.status !== 'awaiting-source') {
    const count = countQuestions(test.questions)
    if (count < test.targetQuestionCount.min || count > test.targetQuestionCount.max) {
      issues.push({
        severity: 'error',
        code: 'test/question-count',
        message: `A published final test must contain between ${test.targetQuestionCount.min} and ${test.targetQuestionCount.max} questions (found ${count}).`,
        path,
      })
    }
  }

  return issues
}

/** Counts a question and all of its nested sub-questions. */
export function countQuestions(questions: Question[]): number {
  return questions.reduce((total, question) => {
    if (question.type === 'table-interpretation' || question.type === 'diagram-interpretation') {
      return total + 1 + countQuestions(question.questions)
    }
    return total + 1
  }, 0)
}

function findDuplicateIds(questions: Question[]): string[] {
  const seen = new Set<string>()
  const duplicates = new Set<string>()

  const walk = (list: Question[]) => {
    for (const question of list) {
      if (seen.has(question.id)) duplicates.add(question.id)
      seen.add(question.id)
      if (question.type === 'table-interpretation' || question.type === 'diagram-interpretation') {
        walk(question.questions)
      }
    }
  }

  walk(questions)
  return [...duplicates]
}
