import type { LessonDefinition } from '@/data/curriculum/schema'
import type { FinalTest, Question } from '@/assessment/types'

/**
 * TEST FIXTURES ONLY.
 *
 * This file is imported exclusively by the test suite. It is not part of the
 * curriculum registry and is never bundled into the application: it exists so
 * the lesson engine, the step renderers and the assessment layer can be tested
 * with realistic shapes without using published lesson content.
 *
 * Nothing here may be presented to students as curriculum content.
 */

export const fixtureQuestions: Question[] = [
  {
    id: 'q-1',
    type: 'multiple-choice',
    prompt: 'سؤال تجريبي بأربعة خيارات.',
    origin: 'platform',
    selection: 'single',
    options: [
      { id: 'a', label: 'الخيار الأول' },
      { id: 'b', label: 'الخيار الثاني' },
      { id: 'c', label: 'الخيار الثالث' },
    ],
    correctOptionIds: ['b'],
    points: 1,
  },
  {
    id: 'q-2',
    type: 'numerical',
    prompt: 'أدخل كمية المادة.',
    origin: 'platform',
    acceptedAnswers: [0.5],
    tolerance: 0.05,
    unit: 'mol',
  },
]

export const fixtureFinalTest: FinalTest = {
  id: 'fixture-lesson-test',
  lessonId: 'fixture-lesson',
  origin: 'platform',
  status: 'in-progress',
  targetQuestionCount: { min: 10, max: 20 },
  questions: fixtureQuestions,
}

export const fixtureLesson: LessonDefinition = {
  id: 'fixture-lesson',
  slug: 'fixture-lesson',
  title: 'درس اختباري',
  order: 1,
  status: 'in-progress',
  source: {
    pages: [{ page: '10', item: 'نشاط 1' }],
    verified: true,
  },
  steps: [
    {
      id: 'step-source',
      kind: 'source',
      title: 'نص الكتاب',
      summary: 'منقول كما هو',
      attribution: 'textbook',
      source: { pages: [{ page: '10' }], verified: true },
      blocks: [{ kind: 'textbook-verbatim', text: 'نص تجريبي منقول حرفياً.', source: { page: '10' } }],
    },
    {
      id: 'step-explain',
      kind: 'explanation',
      title: 'شرح المنصة',
      attribution: 'platform',
      blocks: [
        { kind: 'paragraph', text: 'شرح تجريبي من إعداد المنصة.', attribution: 'platform' },
        { kind: 'formula', tex: 'n=\\frac{m}{M}', attribution: 'platform' },
        { kind: 'value', value: 5, unit: 'g', attribution: 'platform' },
        { kind: 'chemical-formula', formula: 'H2O', attribution: 'platform' },
        { kind: 'ion', formula: 'Ca', charge: '2+', attribution: 'platform' },
        { kind: 'nuclear', symbol: 'C', massNumber: 12, atomicNumber: 6, attribution: 'platform' },
      ],
    },
    {
      id: 'step-note',
      kind: 'note',
      title: 'ملاحظة',
      attribution: 'platform',
      blocks: [{ kind: 'callout', tone: 'note', text: 'ملاحظة تجريبية.', attribution: 'platform' }],
    },
    {
      id: 'step-summary',
      kind: 'summary',
      title: 'خلاصة',
      attribution: 'platform',
      blocks: [{ kind: 'list', items: ['نقطة أولى', 'نقطة ثانية'], attribution: 'platform' }],
    },
    {
      id: 'step-test',
      kind: 'final-test',
      title: 'الاختبار النهائي',
      attribution: 'platform',
      testId: 'fixture-lesson-test',
      blocks: [],
    },
  ],
  tests: [fixtureFinalTest],
}

/** A lesson with a single step, for edge-case tests. */
export const singleStepLesson: LessonDefinition = {
  ...fixtureLesson,
  id: 'fixture-single',
  slug: 'fixture-single',
  steps: [fixtureLesson.steps[0]!],
}
