import { canonicalAnswerOf } from '@/testArea/answers'
import {
  COGNITIVE_KEYS,
  COGNITIVE_TAG,
  DIFFICULTIES,
  QUESTION_TAGS,
  QUESTION_TYPES,
  type CognitiveKey,
  type Difficulty,
  type QuestionTag,
  type QuestionType,
  type QuestionSolution,
  type SolutionSet,
  type TestBank,
  type TestBlueprint,
  type TestQuestion,
} from '@/data/testArea/types'

/* ============================================================================
   TEST FIXTURES ONLY
   ----------------------------------------------------------------------------
   Synthetic banks used to prove that the Test Area audit actually fires. The
   questions below are structural placeholders for the *audit mechanism* — they
   are never registered in the Test Area registry, never rendered, and never
   presented to a student.
   ========================================================================= */

export const FIXTURE_LESSON_ID = 'chem-u1-l1'
export const FIXTURE_PAGE = { page: '5' }

const DIFFICULTY_PLAN: Difficulty[] = [
  'basic', 'basic', 'basic', 'basic', 'basic', 'basic',
  'medium', 'medium', 'medium', 'medium', 'medium', 'medium', 'medium',
  'advanced', 'advanced', 'advanced', 'advanced',
  'thinking', 'thinking', 'thinking',
]

const TYPE_PLAN: QuestionType[] = [
  'single-choice', 'single-choice', 'single-choice', 'single-choice', 'single-choice', 'single-choice',
  'true-false', 'true-false',
  'multi-select', 'multi-select',
  'numeric', 'numeric', 'numeric',
  'exact', 'exact',
  'ordering',
  'matching',
  'error-analysis',
  'error-correction', 'error-correction',
]

/**
 * Distinct topics keep the fixture stems genuinely different from each other,
 * so the audit's near-duplicate rule is tested on its own merits rather than
 * tripping over identical placeholder prose.
 */
const TOPICS = [
  'عن النواة', 'عن الإلكترون', 'عن السويات', 'عن التوزع', 'عن الأيون',
  'عن النظائر', 'عن الرابطة', 'عن المشاركة', 'عن الانتقال', 'عن الثمانية',
  'عن الترميز', 'عن الشحنة', 'عن الجدول', 'عن الشكل', 'عن التطبيق',
  'عن المقارنة', 'عن الاستنتاج', 'عن التجربة', 'عن التحليل', 'عن التصحيح',
]

export function fixtureQuestion(type: QuestionType, index: number): TestQuestion {
  const id = `fx-q${String(index + 1).padStart(2, '0')}`
  const difficulty = DIFFICULTY_PLAN[index % DIFFICULTY_PLAN.length] ?? 'basic'
  const tag: QuestionTag = QUESTION_TAGS[index % QUESTION_TAGS.length] ?? 'conceptual'
  const topic = TOPICS[index % TOPICS.length] ?? 'عن المفهوم'
  const base = {
    id,
    prompt: `سؤال تجريبي ${topic} رقم ${index + 1}.`,
    difficulty,
    conceptId: `fx-concept-${(index % 4) + 1}`,
    sourceRefs: [{ ...FIXTURE_PAGE }],
    tags: [tag],
  }

  switch (type) {
    case 'single-choice':
      return {
        ...base,
        type,
        options: [
          { id: 'a', label: 'الخيار الأول' },
          { id: 'b', label: 'الخيار الثاني' },
          { id: 'c', label: 'الخيار الثالث' },
          { id: 'd', label: 'الخيار الرابع' },
        ],
        correctOptionIds: ['b'],
      }
    case 'true-false':
      return { ...base, type, correctAnswer: index % 2 === 0 }
    case 'multi-select':
      return {
        ...base,
        type,
        options: [
          { id: 'a', label: 'العبارة الأولى' },
          { id: 'b', label: 'العبارة الثانية' },
          { id: 'c', label: 'العبارة الثالثة' },
          { id: 'd', label: 'العبارة الرابعة' },
        ],
        correctOptionIds: ['a', 'c'],
      }
    case 'numeric':
      return { ...base, type, answer: { correctValue: index + 1, integerOnly: true } }
    case 'exact':
      return {
        ...base,
        type,
        answer: { kind: 'distribution', acceptedAnswers: [`2-8-${index % 8}`] },
      }
    case 'ordering':
      return {
        ...base,
        type,
        items: [
          { id: 's1', label: 'الخطوة الأولى' },
          { id: 's2', label: 'الخطوة الثانية' },
          { id: 's3', label: 'الخطوة الثالثة' },
        ],
        correctOrder: ['s1', 's2', 's3'],
      }
    case 'matching':
      return {
        ...base,
        type,
        left: [
          { id: 'l1', label: 'العنصر الأول' },
          { id: 'l2', label: 'العنصر الثاني' },
          { id: 'l3', label: 'العنصر الثالث' },
        ],
        right: [
          { id: 'r1', label: 'الوصف الأول' },
          { id: 'r2', label: 'الوصف الثاني' },
          { id: 'r3', label: 'الوصف الثالث' },
        ],
        pairs: [
          { leftId: 'l1', rightId: 'r1' },
          { leftId: 'l2', rightId: 'r2' },
          { leftId: 'l3', rightId: 'r3' },
        ],
      }
    case 'error-analysis':
      return {
        ...base,
        type,
        flawedWork: 'كتب الطالب حلًّا خاطئًا في هذه المسألة التجريبية.',
        options: [
          { id: 'a', label: 'الخطأ في الخطوة الأولى' },
          { id: 'b', label: 'الخطأ في الخطوة الثانية' },
          { id: 'c', label: 'الخطأ في الخطوة الثالثة' },
        ],
        correctOptionIds: ['b'],
      }
    case 'error-correction':
      return {
        ...base,
        type,
        flawedWork: 'حسب الطالب قيمة خاطئة في هذه المسألة التجريبية.',
        correction: { kind: 'numeric', spec: { correctValue: 8, integerOnly: true } },
      }
  }
}

function tally<T extends string>(values: readonly T[], keys: readonly T[]): Record<T, number> {
  const record = Object.fromEntries(keys.map((key) => [key, 0])) as Record<T, number>
  for (const value of values) record[value] += 1
  return record
}

export function fixtureBlueprint(bank: TestBank): TestBlueprint {
  const questions = bank.questions
  const cognitive = Object.fromEntries(COGNITIVE_KEYS.map((key) => [key, 0])) as Record<CognitiveKey, number>
  for (const question of questions) {
    for (const key of COGNITIVE_KEYS) {
      if (question.tags.includes(COGNITIVE_TAG[key])) cognitive[key] += 1
    }
  }

  return {
    testId: bank.id,
    scope: bank.scope,
    questionCount: questions.length,
    lessonIds: bank.lessonIds,
    unitId: bank.unitId,
    concepts: [...new Set(questions.map((question) => question.conceptId))].map((conceptId) => ({
      id: conceptId,
      label: `مفهوم تجريبي ${conceptId}`,
      pageRefs: [{ ...FIXTURE_PAGE }],
      questionIds: questions.filter((question) => question.conceptId === conceptId).map((q) => q.id),
    })),
    difficulty: tally(questions.map((question) => question.difficulty), DIFFICULTIES),
    types: tally(questions.map((question) => question.type), QUESTION_TYPES),
    cognitive,
    commonErrors: [
      {
        id: 'fx-error-1',
        label: 'خطأ تجريبي شائع',
        questionIds: questions
          .filter((question) => question.type === 'error-analysis' || question.type === 'error-correction')
          .map((question) => question.id),
      },
    ],
    scoring: { pointsPerQuestion: 1, allowPartial: false },
    solutionChunkSize: 5,
  }
}

export type FixtureBankOptions = {
  id?: string
  scope?: TestBank['scope']
  lessonIds?: string[]
  questionCount?: number
}

export function fixtureBank(options: FixtureBankOptions = {}): TestBank {
  const id = options.id ?? 'fx-lesson-test'
  const scope = options.scope ?? 'lesson'
  const lessonIds = options.lessonIds ?? [FIXTURE_LESSON_ID]
  const questionCount = options.questionCount ?? 20

  const questions: TestQuestion[] = []
  for (let index = 0; index < questionCount; index += 1) {
    questions.push(fixtureQuestion(TYPE_PLAN[index % TYPE_PLAN.length] ?? 'single-choice', index))
  }

  const bank: TestBank = {
    id,
    version: 1,
    scope,
    title: 'بنك اختبارات تجريبي',
    summary: 'بنك يُستخدم فقط لاختبار منطق التدقيق.',
    unitId: 'chem-u1',
    lessonIds,
    questions,
    blueprint: null as unknown as TestBlueprint,
  }
  bank.blueprint = fixtureBlueprint(bank)
  return bank
}

/** Recomputes the blueprint from the questions — used by audit negative tests. */
export function syncBlueprint(bank: TestBank): TestBank {
  bank.blueprint = fixtureBlueprint(bank)
  return bank
}

export function fixtureSolutionSet(bank: TestBank): SolutionSet {
  const solutions: QuestionSolution[] = bank.questions.map((question, index) => {
    // Numeric answers are authored as a readable sentence on purpose: the
    // matcher has to read the value out of the prose, not compare strings.
    const answer =
      question.type === 'numeric'
        ? `${index + 1} إلكتروناً`
        : question.type === 'error-correction' && question.correction.kind === 'numeric'
          ? `${question.correction.spec.correctValue} إلكتروناً`
          : canonicalAnswerOf(question)

    return {
      questionId: question.id,
      answer,
      whyCorrect: 'لأن الإجابة مطابقة لما يقتضيه المفهوم التجريبي.',
      concept: 'شرح المفهوم التجريبي.',
      thinking: ['نحدّد المعطيات', 'نطبّق القاعدة', 'نستنتج الإجابة'],
      commonMistakes: ['خطأ تجريبي شائع أول'],
      pageRefs: [{ ...FIXTURE_PAGE }],
    }
  })

  return { testId: bank.id, version: 1, solutions }
}
