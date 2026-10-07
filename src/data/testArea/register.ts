import { defineTest } from './registry'
import type { Difficulty, QuestionType } from './types'

/* ============================================================================
   Test Area content registration
   ----------------------------------------------------------------------------
   `defineTest` is the single gate through which content becomes visible. A
   test is registered here only once its bank *and* its solutions both exist,
   and the metadata below is checked against the lazily loaded bank by the
   audit (`meta/question-count`, `meta/difficulty`, `meta/type`,
   `meta/chunk-size`), so a card can never advertise more than the bank holds.

   The distribution shown on each card is the distribution of the questions
   themselves: 20 questions — 6 basic, 7 medium, 4 advanced, 3 thinking.
   ========================================================================= */

/** Difficulty and type tallies for the Lesson 1 test, as authored in the bank. */
const L1_DIFFICULTY: Record<Difficulty, number> = {
  basic: 6,
  medium: 7,
  advanced: 4,
  thinking: 3,
}

const L1_TYPES: Record<QuestionType, number> = {
  'single-choice': 6,
  'true-false': 2,
  'multi-select': 2,
  numeric: 3,
  exact: 2,
  ordering: 1,
  matching: 1,
  'error-analysis': 1,
  'error-correction': 2,
}

/** Lesson 2 deliberately uses fewer single-choice items and more diagnosed
 * errors: the published pages support several reliable error-analysis cases
 * around transfer, charge balance and Lewis counting. */
const L2_DIFFICULTY: Record<Difficulty, number> = {
  basic: 6,
  medium: 7,
  advanced: 4,
  thinking: 3,
}

const L2_TYPES: Record<QuestionType, number> = {
  'single-choice': 5,
  'true-false': 2,
  'multi-select': 2,
  numeric: 3,
  exact: 2,
  ordering: 1,
  matching: 1,
  'error-analysis': 2,
  'error-correction': 2,
}

/** Lesson 3 leans into formula construction: reading subscripts and
 * parentheses, charge balance, radical identification and diagnosed
 * error-correction of broken formulas. */
const L3_DIFFICULTY: Record<Difficulty, number> = {
  basic: 6,
  medium: 7,
  advanced: 4,
  thinking: 3,
}

const L3_TYPES: Record<QuestionType, number> = {
  'single-choice': 4,
  'true-false': 2,
  'multi-select': 2,
  numeric: 3,
  exact: 2,
  ordering: 1,
  matching: 2,
  'error-analysis': 2,
  'error-correction': 2,
}

export const chemUnit1Lesson1Test = defineTest({
  meta: {
    id: 'chem-u1-l1',
    scope: 'lesson',
    title: 'اختبار الدرس الأول — الذرّة والعنصر',
    summary:
      'نماذج الذرّة، السويّات الرئيسية وسعتها، التوزيع الإلكتروني، الترميز النووي، الأيونات، تمثيل لويس، والنظائر.',
    unitId: 'chem-u1',
    lessonIds: ['chem-u1-l1'],
    questionCount: 20,
    difficulty: L1_DIFFICULTY,
    types: L1_TYPES,
    solutionChunkSize: 5,
    pageRange: '3–12',
  },
  load: () => import('./banks/chem-u1-l1'),
  loadSolutions: () => import('./solutions/chem-u1-l1'),
})

export const chemUnit1Lesson2Test = defineTest({
  meta: {
    id: 'chem-u1-l2',
    scope: 'lesson',
    title: 'اختبار الدرس الثاني — الروابط الكيميائية',
    summary:
      'الرابطة الكيميائية، الانتقال والمشاركة، تعادل المركب الأيوني، عدّ الأزواج وتمثيل لويس، خواص المركبات وتحليل الأخطاء.',
    unitId: 'chem-u1',
    lessonIds: ['chem-u1-l2'],
    questionCount: 20,
    difficulty: L2_DIFFICULTY,
    types: L2_TYPES,
    solutionChunkSize: 5,
    pageRange: '13–17',
  },
  load: () => import('./banks/chem-u1-l2'),
  loadSolutions: () => import('./solutions/chem-u1-l2'),
})

export const chemUnit1Lesson3Test = defineTest({
  meta: {
    id: 'chem-u1-l3',
    scope: 'lesson',
    title: 'اختبار الدرس الثالث — صيغةُ المركّباتِ الكيميائيَّةِ',
    summary:
      'قراءة الصيغة والأرقام الفهرسية والأقواس، التكافؤ من النماذج والمعادلات، الجذور وتكافؤاتها، بناء الصيغة بالتعادل الكهربائي والتحقق منها.',
    unitId: 'chem-u1',
    lessonIds: ['chem-u1-l3'],
    questionCount: 20,
    difficulty: L3_DIFFICULTY,
    types: L3_TYPES,
    solutionChunkSize: 5,
    pageRange: '18–23',
  },
  load: () => import('./banks/chem-u1-l3'),
  loadSolutions: () => import('./solutions/chem-u1-l3'),
})

const U1_DIFFICULTY: Record<Difficulty, number> = {
  basic: 15,
  medium: 20,
  advanced: 15,
  thinking: 10,
}

const U1_TYPES: Record<QuestionType, number> = {
  'single-choice': 14,
  'true-false': 4,
  'multi-select': 8,
  numeric: 12,
  exact: 6,
  ordering: 4,
  matching: 4,
  'error-analysis': 4,
  'error-correction': 4,
}

export const chemUnit1Test = defineTest({
  meta: {
    id: 'chem-u1',
    scope: 'unit',
    title: 'اختبار الوحدة الأولى — الكيمياء البنيوية',
    summary:
      'اختبار مرحلي للمحتوى المنشور حتى الآن (الدرس الأول والدرس الثاني): يربط بنية الذرة بالسويات والترميز والأيونات والنظائر والروابط وتمثيل لويس وخواص المركبات. الوحدة الأولى ما زالت مفتوحة لدروس لاحقة، فيُعاد تدقيق هذا الاختبار وبناؤه نهائياً بعد إعلان اكتمال محتوى الوحدة فقط.',
    unitId: 'chem-u1',
    lessonIds: ['chem-u1-l1', 'chem-u1-l2'],
    questionCount: 60,
    difficulty: U1_DIFFICULTY,
    types: U1_TYPES,
    solutionChunkSize: 10,
    pageRange: '3–17',
  },
  load: () => import('./banks/chem-u1'),
  loadSolutions: () => import('./solutions/chem-u1'),
})
