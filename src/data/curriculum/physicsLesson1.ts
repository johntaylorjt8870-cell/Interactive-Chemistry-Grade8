import type { FinalTest, Question } from '@/assessment/types'
import type { PageReference } from '@/data/source'
import type { LessonDefinition, LessonStep } from './schema'

/* ============================================================================
   الفيزياء — الوحدة الثانية (الحركة والقوى) — الدرس 1 — القوى المتلاقية
   (الصفحات 55–62)
   ----------------------------------------------------------------------------
   Source of truth: docs/source-reports/physics-lesson1-concurrent-forces-readability.md
   (تنقيح 1 — جميع الأصناف clear، والأعلام F1–F9 مغلقة).
   كل ما هو منقول عن الكتاب يُحفظ حرفياً بترتيب الكتاب؛ وكل ما تضيفه المنصة
   موسوم `attribution: 'platform'` أو يعيش في خطوات موسومة بإضافة من المنصة.
   ========================================================================= */

const source = (page: string, item?: string) => ({ page, item })
const pages = Array.from({ length: 8 }, (_, index) => ({ page: String(index + 55) }))
const verifiedSource = {
  pages,
  verified: true,
  readability: {
    arabicText: 'clear' as const,
    latinText: 'clear' as const,
    equations: 'clear' as const,
    numbers: 'clear' as const,
    units: 'clear' as const,
    tables: 'clear' as const,
    diagrams: 'clear' as const,
    experiments: 'clear' as const,
    questions: 'clear' as const,
    notes: 'تنقيح 1 (2026-10-02): أُنشئ التقرير في هذه الجلسة؛ أُغلق F9 بقراءة مباشرة لسطر البند 3 صفحة 56 («الزّنابض») وصُحّح F6 إلى «أسائل».',
  },
}

/**
 * Audit inventory for the textbook visuals actually placed in this lesson.
 *
 * The supplied page scans are not present as files in this repository or the
 * current workspace. These records deliberately carry no `src`, so they are
 * never rendered as `source-image` blocks or substituted with a lab. They
 * retain the textbook location and student-step order for a future restoration
 * using only the actual page scan or figure asset.
 */
export type PhysicsLesson1TextbookVisual = {
  id: string
  stepId: string
  source: PageReference
  attribution: 'textbook'
  assetStatus: 'source-scan-not-in-workspace'
}

export const physicsLesson1TextbookVisuals = [
  { id: 'p55-parachutist-photo', stepId: 'entry-parachute', source: source('55', 'صورة المظلّي'), attribution: 'textbook', assetStatus: 'source-scan-not-in-workspace' },
  { id: 'p56-spring-experiment', stepId: 'concurrent-experiment', source: source('56', 'شكل التجربة'), attribution: 'textbook', assetStatus: 'source-scan-not-in-workspace' },
  { id: 'p56-concurrent-forces-conclusion', stepId: 'concurrent-experiment', source: source('56', 'شكل الاستنتاج'), attribution: 'textbook', assetStatus: 'source-scan-not-in-workspace' },
  { id: 'p57-resultant-construction', stepId: 'resultant-construction', source: source('57', 'الشكل الجانبي'), attribution: 'textbook', assetStatus: 'source-scan-not-in-workspace' },
  { id: 'p57-resultant-conclusion', stepId: 'resultant-construction', source: source('57', 'شكل الاستنتاج'), attribution: 'textbook', assetStatus: 'source-scan-not-in-workspace' },
  { id: 'p58-parallelogram-worked-example', stepId: 'solved-60', source: source('58', 'الشكل الجانبي'), attribution: 'textbook', assetStatus: 'source-scan-not-in-workspace' },
  { id: 'p59-perpendicular-resultant-worked-example', stepId: 'solved-90', source: source('59', 'الشكل الجانبي'), attribution: 'textbook', assetStatus: 'source-scan-not-in-workspace' },
  { id: 'p59-force-components-axes', stepId: 'components-theory', source: source('59', 'شكل تحليل القوّة'), attribution: 'textbook', assetStatus: 'source-scan-not-in-workspace' },
  { id: 'p60-inclined-plane-activity', stepId: 'incline-activity', source: source('60', 'شكل النشاط'), attribution: 'textbook', assetStatus: 'source-scan-not-in-workspace' },
  { id: 'p61-summary-parallelogram', stepId: 'learn-box', source: source('61', 'الشكل الجانبي'), attribution: 'textbook', assetStatus: 'source-scan-not-in-workspace' },
] as const satisfies readonly PhysicsLesson1TextbookVisual[]

/* ---------------------------------------------------------------------------
   أسئلة الكتاب — الصفحتان 61–62 «أختبر نفسي»
   ------------------------------------------------------------------------ */

export const bookQuestions: Question[] = [
  {
    id: 'p1-book-mc-1', type: 'multiple-choice', selection: 'single', origin: 'textbook', source: source('61', 'أختبر نفسي — السؤال الأول (1)'),
    prompt: 'قوّتان F₁⃗ ، F₂⃗ متلاقيتان مختلفتان شدّةً، بينهما زاوية حادة. حامل محصلتهما هو قطر لشكل هندسي رباعي يُنشأ على حاملي هاتين القوّتين ويمرّ من نقطة تلاقيهما، وهذا الشكل هو:',
    options: [{ id: 'a', label: 'مربع.' }, { id: 'b', label: 'مستطيل.' }, { id: 'c', label: 'معيّن.' }, { id: 'd', label: 'متوازي أضلاع.' }],
    correctOptionIds: ['d'],
    explanation: 'الإجابة d: متوازي أضلاع. الزاوية حادة (ليست قائمة) والشدّتان مختلفتان (ليسا متساويتين)، فلا مستطيل ولا مربع ولا معيّن؛ الشكل العام هو متوازي الأضلاع.',
  },
  {
    id: 'p1-book-mc-2', type: 'multiple-choice', selection: 'single', origin: 'textbook', source: source('61', 'أختبر نفسي — السؤال الأول (2)'),
    prompt: 'قوّتان F₁⃗ ، F₂⃗ متلاقيتان متعامدتان مختلفتان شدّةً. حامل محصلتهما هو قطرٌ لشكل هندسي رباعي يُنشأ على حاملي هاتين القوّتين ويمرّ من نقطة تلاقيهما، وهذا الشكل هو:',
    options: [{ id: 'a', label: 'مربع.' }, { id: 'b', label: 'مستطيل.' }, { id: 'c', label: 'معيّن.' }, { id: 'd', label: 'متوازي أضلاع.' }],
    correctOptionIds: ['b'],
    explanation: 'الإجابة b: مستطيل. التعامد يجعل متوازي الأضلاع مستطيلاً، واختلاف الشدّتين يمنع المربع.',
  },
  {
    id: 'p1-book-mc-3', type: 'multiple-choice', selection: 'single', origin: 'textbook', source: source('62', 'أختبر نفسي — السؤال الأول (3)'),
    prompt: 'قوّتان F₁⃗ ، F₂⃗ متلاقيتان متعامدتان متساويتان شدّةً. حامل محصلتهما هو قطر لشكل هندسي رباعي يُنشأ على حاملي هاتين القوّتين ويمرّ من نقطة تلاقيهما، وهذا الشكل هو:',
    options: [{ id: 'a', label: 'مربع.' }, { id: 'b', label: 'مستطيل.' }, { id: 'c', label: 'معيّن.' }, { id: 'd', label: 'متوازي أضلاع.' }],
    correctOptionIds: ['a'],
    explanation: 'الإجابة a: مربع. التعامد مع تساوي الشدّتين يجعل متوازي الأضلاع مربعاً.',
  },
  {
    id: 'p1-book-mc-4', type: 'multiple-choice', selection: 'single', origin: 'textbook', source: source('62', 'أختبر نفسي — السؤال الأول (4)'),
    prompt: 'قوّتان F₁⃗ ، F₂⃗ متلاقيتان متعامدتان شدّتاهما 12N ، 16N تؤثّران في نقطة O من جسم صلب فتكون شدّة محصلتهما F مساويةً:',
    options: [{ id: 'a', label: 'F = 4 N .' }, { id: 'b', label: 'F = 20 N .' }, { id: 'c', label: 'F = 28 N .' }, { id: 'd', label: 'F = 192 N .' }],
    correctOptionIds: ['b'],
    explanation: 'الإجابة b: بالتعامد F = √(12² + 16²) = √(144 + 256) = √400 = 20 N. الخيار 4 N هو الفرق و28 N هو المجموع، وكلاهما خطأ شائع.',
  },
  {
    id: 'p1-book-mc-5', type: 'multiple-choice', selection: 'single', origin: 'textbook', source: source('62', 'أختبر نفسي — السؤال الأول (5)'),
    prompt: 'قوّتان متعامدتان تؤثّران في نقطة O من جسم صلب شدّة محصلتهما F = 50 N شدّة القوّة الأولى F₁ = 40 N فتكون شدّة القوّة الثانية F₂ مساويةً:',
    options: [{ id: 'a', label: 'F = 90 N .' }, { id: 'b', label: 'F = 30 N .' }, { id: 'c', label: 'F = 2000 N .' }, { id: 'd', label: 'F = 10 N .' }],
    correctOptionIds: ['b'],
    explanation: 'الإجابة b: F₂ = √(50² − 40²) = √(2500 − 1600) = √900 = 30 N. الوتر هنا المحصّلة نفسها، لذلك يُطرح مربع الضلع المعروف من مربعها.',
  },
  {
    id: 'p1-book-mc-6', type: 'multiple-choice', selection: 'single', origin: 'textbook', source: source('62', 'أختبر نفسي — السؤال الأول (6)'),
    prompt: 'قوّتان F₁⃗ ، F₂⃗ متلاقيتان متعامدتان مختلفتان شدّةً تؤثّران في نقطة O من جسم صلب، فإنّ شدّة محصلتهما تُحسب من العلاقة:',
    options: [{ id: 'a', label: 'F = F₁ + F₂ .' }, { id: 'b', label: 'F = F₁ − F₂ .' }, { id: 'c', label: 'F = √(F₁² + F₂²) .' }, { id: 'd', label: 'F = F₁² + F₂² .' }],
    correctOptionIds: ['c'],
    explanation: 'الإجابة c: قانون فيتاغورث في المثلّث القائم كما في صندوق «الفيزياء والرياضيات» صفحة 59: مربع الوتر يساوي مجموع مربعي الضلعين القائمين.',
  },
  {
    id: 'p1-book-pr-1', type: 'short-answer', origin: 'textbook', source: source('62', 'أختبر نفسي — السؤال الثاني — المسألة الأولى'),
    prompt: 'تؤثّر قوّتان متعامدتان F₁⃗ ، F₂⃗ في نقطة (O) من جسم صلب، شدّة القوّة الثانية 12 N وشدّة محصلتهما 15 N. المطلوب: 1. احسب شدّة القوّة الأولى F₁⃗ . 2. حدّد بالكتابة عناصر محصّلة هاتين القوّتين. 3. ما قيمة القوّة F⃗\' التي إذا أثّرت في النقطة O جعلت الجسم متوازناً، ثمّ اكتب عناصرها. 4. مثّل بمقياس رسم مناسب كلاً من القوى (F₂⃗ ، F⃗ ، F₁⃗ ، F\').',
    referenceAnswer:
      '1) F₁ = √(15² − 12²) = √(225 − 144) = √81 = 9 N. 2) عناصر المحصّلة: نقطة التأثير O، الحامل قطر المستطيل المُنشأ على القوّتين OM، الجهة من O إلى الرأس المقابل M، الشدّة 15 N. 3) القوّة الموازِنة F\' = 15 N لأنها يجب أن تساوي المحصّلة شدّةً وتعاكسها جهةً على الحامل نفسه. عناصرها: نقطة التأثير O، الحامل حامل المحصّلة نفسه، الجهة من M إلى O، الشدّة 15 N. 4) بمقياس 1cm = 3N تُمثَّل F₂ بشعاع 4cm وF₁ بشعاع 3cm وF وF\' بقطر 5cm على الحامل نفسه وبجهتين متعاكستين.',
    rubric: ['حساب F₁ = 9 N بجذر فرق المربعين', 'عناصر المحصّلة الأربعة (نقطة/حامل/جهة/شدّة)', 'الموازنة 15 N معاكسة للجهة وبيان عناصرها', 'تمثيل بمقياس رسم مناسب وبجهتين متعاكستين'],
    explanation: 'المحصّلة وتر المثلث القائم؛ لذلك يُحسب الضلع المجهول بطرح مربع الضلع المعروف من مربع الوتر. والتوازن يتحقق بقوة تساوي المحصّلة وتعاكسها فتصير المحصّلة الكلية صفراً.',
  },
  {
    id: 'p1-book-pr-2', type: 'short-answer', origin: 'textbook', source: source('62', 'أختبر نفسي — السؤال الثاني — المسألة الثانية'),
    prompt: 'يحمل شخصان حقيبةً بوساطة حبلين بينهما زاوية 90° شدّة القوّة الأول 30 N و شدّة قوّة الثاني 40 N المطلوب: 1. أحسبُ شدّة محصّلة هاتين القوّتين. 2. أحدّدُ بالكتابة عناصر محصّلة هاتين القوّتين. 3. مثّلْ هاتين القوّتين بمقياس رسم مناسب.',
    referenceAnswer:
      '1) F = √(30² + 40²) = √(900 + 1600) = √2500 = 50 N. 2) نقطة التأثير: النقطة المشتركة O (مقبض الحقيبة)، الحامل: قطر المستطيل المُنشأ على القوّتين، الجهة: من O إلى الرأس المقابل M، الشدّة: 50 N. 3) بمقياس 1cm = 10N يُمثَّل الأول بشعاع 3cm والثاني بشعاع 4cm متعامدين، فيكون القطر 5cm.',
    rubric: ['حساب 50 N بفيتاغورث', 'عناصر المحصّلة الأربعة', 'تمثيل بمقياس 1cm = 10N وأشعة 3 و4 و5 سم'],
    explanation: 'الزاوية قائمة فالمستطيل قائم والوتر يُحسب بفيتاغورث؛ والثلاثية 3-4-5 مضروبة بعشرة تعطي 50 N.',
  },
]

/* ---------------------------------------------------------------------------
   حلول أنشطة الكتاب وتجاربه الواردة في سياق الدرس (تُعرض في مساحة المعلم)
   ------------------------------------------------------------------------ */

export const bookActivitySolutions: Question[] = [
  {
    id: 'p1-act-56-1', type: 'short-answer', origin: 'textbook', source: source('56', 'خطوات التجربة (1)'),
    prompt: 'أعلّقُ جسماً في خطّاف ربيعة، فيتأثّر بقوّة ثقله w⃗ . ما حامل هذه القوّة؟ وما جهتها؟',
    referenceAnswer: 'حامل قوّة الثقل الخط الشاقولي المارّ بمركز الجسم (امتداد الخيط)، وجهتها من الجسم نحو أسفل (نحو مركز الأرض).',
    rubric: ['الحامل شاقولي', 'الجهة نحو الأسفل'],
    explanation: 'الثقل قوة جذب الأرض للجسم، لذا يكون حامله شاقولياً وجهته دائماً نحو الأسفل مهما كان وضع الجسم.',
  },
  {
    id: 'p1-act-56-2', type: 'short-answer', origin: 'textbook', source: source('56', 'خطوات التجربة (2)'),
    prompt: 'أُسمّي القوّة التي يشدُّ بها نابض الربيعة الجسم قوّة توتر النابض. هل ينطبق حاملها على حامل قوّة الثقل؟ وما جهتها؟',
    referenceAnswer: 'نعم، ينطبق حاملها على حامل قوّة الثقل لأن الجسم معلق بسكون على استقامة واحدة، وجهتها نحو الأعلى (عكس جهة الثقل).',
    rubric: ['نعم ينطبق الحاملان', 'جهة التوتر نحو الأعلى'],
    explanation: 'تعادل الجسم الساكن يعني قوتين على حامل واحد متساويتين شدّةً ومتعاكستين جهةً.',
  },
  {
    id: 'p1-act-56-3', type: 'short-answer', origin: 'textbook', source: source('56', 'خطوات التجربة (3)'),
    prompt: 'أربطُ خطّافَي ربيعتين بخيط باستخدام لوح الزّنابض، وأعلّقُ خطّاف الجسم بمنتصف الخيط كما في الشكل، هل لحاملَي قوّتي شدّ الربيعتين الاستقامة ذاتها؟',
    referenceAnswer: 'لا؛ لكل ربيعة حامل بحسب امتدادها، فالخطّان مائلان بزاويتين مختلفتين عن الشاقول ولا يستقيمان على استقامة واحدة.',
    rubric: ['لا، الحاملان مختلفان', 'كل حامل بحسب امتداد ربيعته'],
    explanation: 'لو كان الحاملان على استقامة واحدة لما أمكن تعادل الجسم مع الثقل إلا بشاقول واحد؛ الميل ضروري هنا لوجود مركّبتين أفقيتين متعاكستين.',
  },
  {
    id: 'p1-act-56-4', type: 'short-answer', origin: 'textbook', source: source('56', 'خطوات التجربة (4 و6 و7)'),
    prompt: 'هل يتغيّر حامل قوّة ثقل الجسم في هذه الحالة عمّا كان عليه في الحالة الأولى؟ وبعد رسم الخطين ورفعهما: أين تلتقي الخطوط الممثّلة لحوامل القوى الثلاث؟',
    referenceAnswer: 'لا يتغيّر حامل الثقل؛ يبقى شاقولياً مارّاً بنقطة التعليق. الخطوط الممثّلة لحوامل القوى الثلاث تتلاقى جميعها في نقطة واحدة هي نقطة تعليق الجسم.',
    rubric: ['حامل الثقل لا يتغيّر', 'الحوامل الثلاث تتلاقى في نقطة واحدة'],
    explanation: 'هذه هي نقطة الدرس كلها: ثلاث قوى مختلفة الاتجاهات تتلاقى حواملها في نقطة واحدة فهي قوى متلاقية.',
  },
  {
    id: 'p1-act-57-1', type: 'short-answer', origin: 'textbook', source: source('57', 'أسائل'),
    prompt: 'هل يمكن إيجاد محصّلة عدّة قوى متلاقية؟ وكيف يتمّ ذلك؟',
    referenceAnswer: 'نعم؛ نجمع أول قوتين بطريقة متوازي الأضلاع فنحصل على محصّلة أولى، ثم نجمع هذه المحصّلة مع القوّة الثالثة بالطريقة نفسها، وهكذا حتى تبقى قوة وحيدة هي المحصّلة النهائية.',
    rubric: ['نعم يمكن', 'الجمع ثنائياً بالتتابع بطريقة متوازي الأضلاع'],
    explanation: 'المحصّلة تحل محل قوتين، فيجوز أن تحل هي نفسها محلّهما مع الثالثة، وهكذا.',
  },
  {
    id: 'p1-act-60-1', type: 'short-answer', origin: 'textbook', source: source('60', 'نشاط (1)'),
    prompt: 'إذا وضع جسم صلب فوق مستوٍ مائل أملس يميل عن الأفق بزاوية: أحدّدُ بالرّسم القوى المؤثّرة عليه.',
    referenceAnswer: 'قوّتان: الثقل w⃗ شاقولي الاتجاه نحو الأسفل من مركز الجسم، وقوّة ردّ الفعل R⃗ العمودية على سطح المستوي المائل باتجاه الخارج منه (لأن السطح أملس فلا احتكاك).',
    rubric: ['الثقل شاقولي لأسفل', 'رد الفعل عمودي على السطح', 'لا احتكاك لأن السطح أملس'],
    explanation: 'السطح الأملس يبذل على الجسم قوة تعامد سطحه فقط؛ لذلك يظهر في الشكل R عمودياً على الميل وw شاقولياً.',
  },
  {
    id: 'p1-act-60-2', type: 'short-answer', origin: 'textbook', source: source('60', 'نشاط (2)'),
    prompt: 'أحلّل قوّة ثقله إلى مركّبتين متعامدتين، ما الشّكل الذي أحصل عليه؟',
    referenceAnswer: 'أحلّل w إلى مركّبة F₁⃗ موازية لسطح المستوي (تسحبه نحو أسفل الميل) ومركّبة F₂⃗ شاقولية على السطح (تضغطه عليه). الشكل الناتج مستطيل قطره w⃗ لأن المركّبتين متعامدتان.',
    rubric: ['مركّبة موازية للمستوي', 'مركّبة شاقولية على المستوي', 'الشكل مستطيل قطره الثقل'],
    explanation: 'كل تحليل لقوّة إلى مركّبتين متعامدتين يُنشئ مستطيلاً قطره المارّ من نقطة التأثير يمثّل القوّة الأصلية، عكس حالة المحصّلة تماماً.',
  },
]

/* ---------------------------------------------------------------------------
   الاختبار الشامل — إضافة من المنصة (14 سؤالاً جديداً متنوّعاً)
   ------------------------------------------------------------------------ */

export const finalTest: FinalTest = {
  id: 'phys-u2-l1-final', lessonId: 'phys-u2-l1', origin: 'platform', status: 'source-verified', targetQuestionCount: { min: 10, max: 20 },
  questions: [
    {
      id: 'p1-final-1', type: 'multiple-choice', selection: 'single', origin: 'platform',
      prompt: 'قوّتان شدّتاهما 3N و4N متلاقيتان متعامدتان. شدّة محصلتهما تساوي:',
      options: [{ id: 'a', label: '7 N' }, { id: 'b', label: '5 N' }, { id: 'c', label: '1 N' }, { id: 'd', label: '12 N' }],
      correctOptionIds: ['b'],
      explanation: 'بالتعامد تُحسب المحصّلة بفيتاغورث: √(9+16) = √25 = 5 N. الجمع المباشر 7 N يخص زاوية صفر وليس التعامد.',
    },
    {
      id: 'p1-final-2', type: 'multiple-choice', selection: 'multiple', origin: 'platform',
      prompt: 'اختر العبارات الصحيحة عن محصّلة قوّتين متلاقيتين:',
      options: [
        { id: 'a', label: 'قوّة وحيدة تحل محل القوّتين معاً.' },
        { id: 'b', label: 'حاملها قطر متوازي الأضلاع المارّ من نقطة تلاقيهما.' },
        { id: 'c', label: 'شدّتها دائماً أكبر من شدّة كلٍّ من القوّتين.' },
        { id: 'd', label: 'جهتها من نقطة التأثير O إلى الرأس المقابل M.' },
      ],
      correctOptionIds: ['a', 'b', 'd'],
      explanation: 'العبارات a وb وd هي عناصر المحصّلة كما في خلاصة الكتاب. أما c فخطأ: عند زاوية منفرجة كبيرة قد تصبح المحصّلة أصغر من إحدى القوّتين.',
    },
    {
      id: 'p1-final-3', type: 'true-false', origin: 'platform',
      prompt: 'إذا تساوت شدّتا قوّتين متعامدتين فإنّ حامل المحصّلة ينصّف الزاوية بين حامليهما.',
      correctAnswer: true,
      explanation: 'صح. متوازي الأضلاع يصبح مربعاً عند تساوي الشدّتين والتعامد، وقطر المربع ينصّف زاويته.',
    },
    {
      id: 'p1-final-4', type: 'true-false', origin: 'platform',
      prompt: 'عند تثبيت شدّتي قوّتين متلاقيتين، تزداد شدّة المحصّلة كلما زادت الزاوية بين الحاملين من 0° إلى 180°.',
      correctAnswer: false,
      explanation: 'غلط. العلاقة عكسية: أعظم محصّلة عند 0° (المجموع) وأصغرها عند 180° (الفرق)، وتتناقص المحصّلة كلما اتسعت الزاوية بينهما.',
    },
    {
      id: 'p1-final-5', type: 'fill-blank', origin: 'platform',
      prompt: 'أكمل العبارة الآتية:',
      template: 'حامل المحصّلة هو قطر متوازي الأضلاع المارّ من نقطة {b1} القوّتين، وجهة المحصّلة من O إلى {b2} المقابل M.',
      blanks: [
        { id: 'b1', acceptedAnswers: ['تلاقي', 'تلاقيهما'] },
        { id: 'b2', acceptedAnswers: ['الرأس'] },
      ],
      explanation: 'هذا نص عناصر المحصّلة في استنتاج الكتاب صفحة 57: نقطة التلاقي والرأس المقابل.',
    },
    {
      id: 'p1-final-6', type: 'ordering', origin: 'platform',
      prompt: 'رتّب خطوات إيجاد محصّلة قوّتين متلاقيتين بالرسم (طريقة متوازي الأضلاع):',
      items: [
        { id: 'rays', label: 'رسم شعاعي القوّتين من نقطة التأثير O بمقياس رسم مناسب.' },
        { id: 'para', label: 'إكمال الشكل إلى متوازي أضلاع بإنشاء ضلعين موازيين.' },
        { id: 'diag', label: 'رسم القطر المارّ من نقطة التلاقي O نحو الرأس المقابل M.' },
        { id: 'measure', label: 'قياس طول القطر وتحويله إلى نيوتن بمقياس الرسم.' },
        { id: 'elements', label: 'كتابة عناصر المحصّلة: نقطة التأثير والحامل والجهة والشدّة.' },
      ],
      correctOrder: ['rays', 'para', 'diag', 'measure', 'elements'],
      explanation: 'الترتيب يطبق خطوات «تطبيق محلول» صفحة 58: الشعاعان ثم المتوازي ثم القطر ثم القياس ثم العناصر.',
    },
    {
      id: 'p1-final-7', type: 'matching', origin: 'platform',
      prompt: 'طابق كل زاوية بين الحاملين مع عبارة المحصّلة الصحيحة (الشدّتان مثبتتان):',
      left: [{ id: 'z0', label: '0°' }, { id: 'z90', label: '90°' }, { id: 'z180', label: '180°' }],
      right: [{ id: 'sum', label: 'F = F₁ + F₂' }, { id: 'pyth', label: 'F = √(F₁² + F₂²)' }, { id: 'diff', label: 'F = |F₁ − F₂|' }],
      pairs: [{ leftId: 'z0', rightId: 'sum' }, { leftId: 'z90', rightId: 'pyth' }, { leftId: 'z180', rightId: 'diff' }],
      explanation: 'عند تطابق الحاملين تجمع الشدّتان، وعند التعامد يسري فيتاغورث، وعند التضاد تطرح الأصغر من الأكبر.',
    },
    {
      id: 'p1-final-8', type: 'numerical', origin: 'platform',
      prompt: 'قوّتان متعامدتان شدّتاهما 6N و8N. احسب شدّة المحصّلة بالنيوتن.',
      acceptedAnswers: [10],
      unit: 'N',
      explanation: '√(36+64) = √100 = 10 N.',
    },
    {
      id: 'p1-final-9', type: 'numerical', origin: 'platform',
      prompt: 'شدّة محصّلة قوّتين متعامدتين 13N وشدّة إحداهما 5N. احسب شدّة القوّة الأخرى بالنيوتن.',
      acceptedAnswers: [12],
      unit: 'N',
      explanation: 'المحصّلة وتر: √(169−25) = √144 = 12 N.',
    },
    {
      id: 'p1-final-10', type: 'numerical', origin: 'platform',
      prompt: 'في رسم بمقياس «كل 1cm يمثل 2N» قيس طول قطر متوازي الأضلاع فوجد 5cm. احسب شدّة المحصّلة بالنيوتن.',
      acceptedAnswers: [10],
      unit: 'N',
      explanation: 'الشدّة = الطول × قيمة السنتيمتر: 5 × 2 = 10 N كما في طريقة الكتاب صفحة 59 (F = 5 × 20 = 100 N بمقياسه).',
    },
    {
      id: 'p1-final-11', type: 'diagram-interpretation', origin: 'platform',
      diagramId: 'parallelogram-lab',
      diagramDescription: 'في مختبر متوازي الأضلاع: شعاعان أخضر وأزرق من O يمثّلان F₁ وF₂، وضلعان متقطعان يكملان متوازي الأضلاع، وقطر داكن من O إلى M.',
      prompt: 'اقرأ الشكل في المختبر ثم أجب:',
      questions: [
        {
          id: 'p1-final-11-a', type: 'multiple-choice', selection: 'single', origin: 'platform',
          prompt: 'أي قطعة في الشكل تمثّل حامل المحصّلة؟',
          options: [
            { id: 'a', label: 'الشعاع الأخضر F₁.' },
            { id: 'b', label: 'القطر الداكن المارّ من O إلى M.' },
            { id: 'c', label: 'أحد الضلعين المتقطعين.' },
            { id: 'd', label: 'امتدادا الحاملين خلف O.' },
          ],
          correctOptionIds: ['b'],
          explanation: 'حامل المحصّلة قطر متوازي الأضلاع المارّ من نقطة التلاقي، لا الضلعان ولا الشعاعان.',
        },
      ],
      explanation: 'القراءة الصحيحة للشكل: الشعاعان من O قوّتان متلاقيتان، والضلعان المتقطعان إكمال للمتوازي، أما القطر الداكن من O إلى M فهو حامل المحصّلة بجهتها وشدّتها.',
    },
    {
      id: 'p1-final-12', type: 'true-false', origin: 'platform',
      prompt: 'تحليل القوّة إلى مركّبتين متعامدتين عملية معاكسة لعملية إيجاد محصّلة قوّتين متعامدتين.',
      correctAnswer: true,
      explanation: 'صح، وهذا نص استنتاج الكتاب صفحة 60: في التحليل نبدأ من القطر ونستخرج الضلعين، وفي المحصّلة نبدأ من الضلعين ونستخرج القطر.',
    },
    {
      id: 'p1-final-13', type: 'short-answer', origin: 'platform',
      prompt: 'فسّر: لماذا يصحّ أن نستبدل بقوّة واحدة مركّبتين متعامدتين؟ واذكر مثال الجسم على المستوي المائل مبيناً أثر كل مركّبة.',
      referenceAnswer:
        'يصح الاستبدال لأن المركّبتين معاً تُحدثان الأثر نفسه الذي تُحدثه القوّة الأصلية؛ فمتوازي (هنا مستطيل) المركّبتين قطره القوّة نفسها. مثال المستوي المائل: مركّبة موازية للسطح تسحب الجسم نحو أسفل الميل (سبب انزلاقه)، ومركّبة شاقولية على السطح تضغط الجسم عليه (توازنها ردّ فعل السطح).',
      rubric: ['المركّبتان تحدثان الأثر نفسه', 'الموازاة تسبب الانزلاق', 'الشاقولية تسبب الضغط ويوازنها رد الفعل'],
      minWords: 20,
      explanation: 'معيار التكافؤ هو الأثر: إن أنتجت المركّبتان التسارع نفسه والضغط نفسه صحّ الاستبدال، ولهذا يُبنى التحليل على المستطيل قطره الثقل.',
    },
    {
      id: 'p1-final-14', type: 'multiple-choice', selection: 'single', origin: 'platform',
      prompt: 'قوّتان شدّة كلٍّ منهما 5N متلاقيتان على حامل واحد وبجهتين متعاكستين (زاوية 180°). شدّة المحصّلة:',
      options: [{ id: 'a', label: '10 N' }, { id: 'b', label: '5 N' }, { id: 'c', label: 'صفر' }, { id: 'd', label: '25 N' }],
      correctOptionIds: ['c'],
      explanation: 'عند التضاد تُطرح الشدّتان: 5 − 5 = 0؛ الجسم يبقى متوازناً وكأن القوّتين غير موجودتين شدّةً.',
    },
  ],
}

const bookAssessment: FinalTest = {
  id: 'phys-u2-l1-book', lessonId: 'phys-u2-l1', origin: 'platform', status: 'source-verified', targetQuestionCount: { min: 10, max: 20 }, questions: [...bookActivitySolutions, ...bookQuestions],
}

/* ---------------------------------------------------------------------------
   خطوات الدرس — بترتيب الكتاب 55 ← 62
   ------------------------------------------------------------------------ */

const steps: LessonStep[] = [
  {
    id: 'entry-parachute', kind: 'source', title: 'مدخل الدرس: الأهداف والكلمات المفتاحية والمظلّي', summary: 'صفحة 55: الأهداف الأربعة والكلمات المفتاحية وفقرة المظلّي وأسئلتها.', attribution: 'textbook',
    source: { pages: [source('55')], verified: true }, minutes: 6,
    blocks: [
      { kind: 'textbook-verbatim', text: 'الوحدة الثانية الحركة والقوى', source: { page: '55' } },
      { kind: 'textbook-verbatim', text: '1 القوى المتلاقية', source: { page: '55', item: 'رقم الدرس وعنوانه' } },
      { kind: 'list', attribution: 'textbook', items: ['يتعرّفُ القوى المتلاقية.', 'يوضّحُ بالرّسم القوى المتلاقية.', 'يجدُ عناصر محصّلة قوّتين متلاقيتين.', 'يحلّلُ القوّة إلى مركّبتين متعامدتين.'] },
      { kind: 'textbook-verbatim', text: 'الكلمات المفتاحية: القوى المتلاقية – تحليل القوّة.', source: { page: '55' } },
      { kind: 'textbook-verbatim', text: 'يستخدمُ المظلّيُّ الذي يهبطُ من طائرةٍ على ارتفاعٍ ما من سطح الأرض مظلّةً من أجل الوصول إلى الأرض بسلامةٍ وأمان.', source: { page: '55' } },
      { kind: 'textbook-verbatim', text: 'كيف يرتبط المظلّيُّ بمظلّته؟ ما القوى المؤثّرة على المظلّيِّ؟ أين تتلاقى حبالُ المظلّة؟', source: { page: '55' } },
    ],
  },
  {
    id: 'concurrent-experiment', kind: 'experiment', title: 'تجربة الكتاب: ربيعتان وجسم معلّق', summary: 'صفحة 56: أدوات التجربة وخطواتها السبعة واستنتاج تعريف القوى المتلاقية.', attribution: 'textbook',
    source: { pages: [source('56', 'تجربة تعريف القوى المتلاقية')], verified: true }, minutes: 10,
    blocks: [
      { kind: 'textbook-verbatim', text: 'تعريف القوى المتلاقية:', source: { page: '56' } },
      { kind: 'textbook-verbatim', text: 'أجيب وأستنتج:', source: { page: '56' } },
      { kind: 'textbook-verbatim', text: 'أدوات التجربة: لوح الزّنابض المغناطيسي – ربيعتان – جسم مزوّد بخطّاف – خيوط ربط.', source: { page: '56', item: 'أدوات التجربة' } },
      {
        kind: 'procedure', title: 'خطوات التجربة:', attribution: 'textbook', items: [
          'أعلّقُ جسماً في خطّاف ربيعة، فيتأثّر بقوّة ثقله w⃗ . ما حامل هذه القوّة؟ وما جهتها؟',
          'أُسمّي القوّة التي يشدُّ بها نابض الربيعة الجسم قوّة توتر النابض. هل ينطبق حاملها على حامل قوّة الثقل؟ وما جهتها؟',
          'أربطُ خطّافَي ربيعتين بخيط باستخدام لوح الزّنابض، وأعلّقُ خطّاف الجسم بمنتصف الخيط كما في الشكل، هل لحاملَي قوّتي شدّ الربيعتين الاستقامة ذاتها؟',
          'هل يتغيّر حامل قوّة ثقل الجسم في هذه الحالة عمّا كان عليه في الحالة الأولى؟',
          'أرسمُ على اللوح خطّين على امتداد كل ربيعة وباتجاه نقطة تعليق الجسم بعد أن يتوازن، ثمّ أرسمُ خطّاً منطبقاً على حامل قوّة ثقل الجسم.',
          'أرفعُ الربيعتين والجسم، ماذا ألاحظ؟',
          'أين تلتقي الخطوط الممثّلة لحوامل القوى الثلاث؟',
        ],
      },
      { kind: 'callout', tone: 'note', title: 'أستنتج', attribution: 'textbook', text: 'القوى المتلاقية: هي القوى التي تتلاقى حواملها في نقطة واحدة.' },
    ],
  },
  {
    id: 'concurrent-lab', kind: 'simulation', title: 'محاكاة: تجربة الربيعتين بيدك', summary: 'غيّر الزاويتين والثقل وراقب شدّتي الشدّ وتلاقي الحوامل في O.', attribution: 'platform', minutes: 8,
    blocks: [
      { kind: 'paragraph', attribution: 'platform', text: 'المحاكاة تعيد بناء تجربة الصفحة 56 رقمياً: ربيعتان وجسم معلّق. حرّك المنزلقات وراقب العدّادات، ثم فعّل امتدادات الحوامل لترى بعينيك أن الخطوط الثلاثة تلتقي في نقطة واحدة مهما غيّرت.' },
      { kind: 'interactive', interactiveId: 'concurrent-forces-lab', caption: 'حرّك المنزلقات الثلاثة وبدّل إظهار الامتدادات، ثم اقرأ الاستنتاج.' },
    ],
  },
  {
    id: 'concurrent-explained', kind: 'explanation', title: 'ما القوّة؟ وما الحامل؟ ولماذا «متلاقية»؟', summary: 'شرح المنصة: القوّة وحاملها وجهتها، ومعنى التلاقي ولماذا نحتاج المحصّلة.', attribution: 'platform', minutes: 10,
    blocks: [
      { kind: 'paragraph', attribution: 'platform', text: 'القوّة مؤثر يُحدَث بثلاثة أوصاف لا تكتمل إلا بها: شدّة (كم نيوتن)، وجهة (نحو أين)، وحامل (الخط المستقيم الذي تقع عليه القوّة). لذلك نرسمها سهماً: طوله يمثّل الشدّة بمقياس رسم، واتجاه رأسه يمثّل الجهة، والمستقيم الذي يحتويه هو الحامل.' },
      { kind: 'paragraph', attribution: 'platform', text: 'في تجربة الصفحة 56 تؤثر على الجسم المعلّق ثلاث قوى: شدّا الربيعتين F₁⃗ وF₂⃗ وثقله w⃗. لكل قوة حاملها، وعند تمديد الحوامل بالرسم وجدنا أنها تلتقي كلها في نقطة واحدة هي نقطة التعليق O؛ لذلك سمّاها الكتاب قوى متلاقية.' },
      { kind: 'definition', term: 'القوى المتلاقية', attribution: 'platform', symbol: '', text: 'هي القوى التي تتلاقى حواملها في نقطة واحدة — وهذا تعريف الكتاب حرفياً في استنتاج الصفحة 56.' },
      { kind: 'paragraph', attribution: 'platform', text: 'لماذا نبحث عن محصّلة؟ لأن الجسم لا «يهتم» بعدد القوى بل بأثرها المشترك. المحصّلة قوّة وحيدة تُحدث الأثر نفسه الذي تُحدثه القوى كلها معاً؛ فإذا عرفناها عرفنا ماذا سيحدث للجسم: تسارع باتجاهها، أو سكوناً إن كانت صفراً.' },
      { kind: 'paragraph', attribution: 'platform', text: 'كيف نقرأ شكل القوى؟ نبدأ من نقطة التأثير O، ونتتبع كل سهم: طوله شدّته، ورأسه جهته، وامتداده المتقطع حامله. وإذا رأينا الامتدادات تتقاطع في نقطة واحدة فنحن أمام قوى متلاقية يجوز جمعها بطريقة متوازي الأضلاع.' },
      { kind: 'callout', tone: 'warning', title: 'لا تجمع الشدّات جمعاً مباشراً', attribution: 'platform', text: 'القوى كميات ذات اتجاه: 3N مع 4N لا تعطيان 7N إلا على حامل واحد وبجهة واحدة. اتجاه القوّة جزء من هويتها، وإهماله أشهر خطأ في هذا الدرس.' },
    ],
  },
  {
    id: 'resultant-construction', kind: 'source', title: 'محصّلة قوّتين متلاقيتين: البناء الهندسي', summary: 'صفحة 57: أسائل، خطوات البناء الأربعة، واستنتاج عناصر المحصّلة.', attribution: 'mixed',
    source: { pages: [source('57')], verified: true }, minutes: 9,
    blocks: [
      { kind: 'textbook-verbatim', text: 'أسائل:', source: { page: '57' } },
      { kind: 'textbook-verbatim', text: 'هل يمكن إيجاد محصّلة عدّة قوى متلاقية؟ وكيف يتمّ ذلك؟', source: { page: '57', item: 'أسائل' } },
      { kind: 'textbook-verbatim', text: 'محصّلة قوّتين متلاقيتين:', source: { page: '57' } },
      { kind: 'textbook-verbatim', text: 'في التجربة السابقة:', source: { page: '57' } },
      {
        kind: 'list', attribution: 'textbook', items: [
          'أرسمُ القوّة F⃗ التي تعاكس مباشرة قوّة ثقل الجسم w⃗ .',
          'أرسمُ هندسياً متوازي الأضلاع المُنشأ على القوّتين F₁⃗ و F₂⃗ .',
          'أرسمُ قطر متوازي الأضلاع المارّ من نقطة تلاقي القوّتين، وأقارن النتائج.',
          'أحدّد عناصر F⃗ محصّلة القوّتين السابقتين.',
        ],
      },
      { kind: 'callout', tone: 'note', title: 'أستنتج', attribution: 'textbook', text: 'قطر متوازي الأضلاع يمثل محصّلة القوّتين المتلاقيتين المارّ من نقطة تلاقيهما.' },
      { kind: 'callout', tone: 'note', title: 'أستنتج', attribution: 'textbook', text: 'محصّلة قوّتين متلاقيتين تقعان في مستوٍ واحد، هي قوّة وحيدة.' },
      {
        kind: 'list', attribution: 'textbook', items: [
          'عناصرها:',
          'نقطة التأثير: نقطة تأثير القوّتين O.',
          'الحامل: قطر متوازي الأضلاع OM المُنشأ على القوّتين.',
          'الجهة: من O إلى الرأس المقابل M.',
          'الشدّة: تمثّل طول قطر متوازي الأضلاع.',
        ],
      },
    ],
  },
  {
    id: 'parallelogram-lab-step', kind: 'simulation', title: 'محاكاة: ابنِ متوازي الأضلاع وغيّر الزاوية', summary: 'القوّتان والزاوية منزلقات، والبناء يظهر مراحل: الحاملان، المتوازي، القطر.', attribution: 'platform', minutes: 10,
    blocks: [
      { kind: 'paragraph', attribution: 'platform', text: 'المحاكاة تنفّذ خطوات الصفحة 57 بيدك: ارسم الشعاعين، أكمل المتوازي، ارسم القطر، ثم اقرأ الشدّة والجهة من العدّادات. جرّب الزاوية 90° لترى حالة المستطيل وقانون فيتاغورث بأرقامك أنت.' },
      { kind: 'interactive', interactiveId: 'parallelogram-lab', caption: 'ابدأ بـ«ارسم القوّتين» وتتابع المراحل، ثم حرّك المنزلقات وراقب المحصّلة.' },
    ],
  },
  {
    id: 'parallelogram-explained', kind: 'explanation', title: 'لماذا تعمل طريقة متوازي الأضلاع؟ وكيف تؤثر الزاوية؟', summary: 'شرح المنصة: منطق البناء، أثر الزاوية من 0° إلى 180°، ولماذا التعامد يعني فيتاغورث.', attribution: 'platform', minutes: 12,
    blocks: [
      { kind: 'paragraph', attribution: 'platform', text: 'لماذا متوازي الأضلاع تحديداً؟ لأن التجربة تثبت ذلك: في تجربة الصفحة 56 كانت القوّة F⃗ المعاكسة للثقل توازن القوّتين F₁⃗ وF₂⃗، وعند رسم متوازي الأضلاع على F₁⃗ وF₂⃗ انطبق قطره على حامل F⃗ وبطوله نفسه. الطريقة ليست رسماً جميلاً بل خلاصة قياس.' },
      { kind: 'paragraph', attribution: 'platform', text: 'كيف تؤثر الزاوية؟ ثبّت الشدّتين وافتح الزاوية تدريجياً في المختبر: عند 0° ينطبق الحاملان فتجمع الشدّتان (أعظم محصّلة)، وعند 180° يتضادان فتطرح الأصغر من الأكبر (أصغر محصّلة)، وبينهما تتناقص المحصّلة كلما اتسعت الزاوية. لذلك أي نتيجة خارج المجال |F₁ − F₂| ≤ F ≤ F₁ + F₂ نتيجة مستحيلة تكشف خطأ الرسم أو الحساب.' },
      { kind: 'paragraph', attribution: 'platform', text: 'لماذا تظهر فيتاغورث عند التعامد؟ لأن متوازي الأضلاع يصبح مستطيلاً، والقطر يقسمه إلى مثلثين قائمين: القطر وتر، والضلعان القائمان هما القوّتان. ومربع الوتر يساوي مجموع مربعي الضلعين القائمين — وهذا نص صندوق «الفيزياء والرياضيات» صفحة 59.' },
      { kind: 'formula', display: 'block', attribution: 'platform', caption: 'حالة التعامد (صفحة 59)', tex: 'F = \\sqrt{F_1^2 + F_2^2}' },
      { kind: 'paragraph', attribution: 'platform', text: 'كيف يتقابل الرسم والحساب؟ في الرسم نقيس طول القطر بالسنتيمتر ونضربه في مقياس الرسم؛ وفي الحساب عند التعامد نطبق فيتاغورث مباشرة. الطريقتان تصفان القطر نفسه، لذلك يجب أن تتفقا ضمن دقة الرسم — وهذا معيارك للتحقق من حلك.' },
      { kind: 'callout', tone: 'method', title: 'تحقّق من حلك', attribution: 'platform', text: 'بعد الحساب اسأل: هل النتيجة داخل المجال بين الفرق والمجموع؟ هل الوحدة نيوتن؟ هل الجهة مذكورة من O إلى M؟ إن سقط أحد هذه الثلاثة فالحل ناقص حتى لو صحّ الرقم.' },
    ],
  },
  {
    id: 'solved-60', kind: 'example', title: 'تطبيق محلول: قوّتان بزاوية 60°', summary: 'صفحة 58: النص والحل كما طُبعا، ثم إضافة من المنصة بتسع خطوات منظمة.', attribution: 'mixed',
    source: { pages: [source('58', 'تطبيق محلول أول')], verified: true }, minutes: 10,
    blocks: [
      { kind: 'textbook-verbatim', text: 'قوّتان F₁⃗ ، F₂⃗ متلاقيتان في النقطة O الزاوية بين حامليهما 60° شدّتاهما: F₁ = 4 N ، F₂ = 3 N .', source: { page: '58' } },
      { kind: 'list', attribution: 'textbook', items: ['المطلوب: 1. أمثّلُ القوّتين بمقياس رسم مناسب (1cm يمثل 1N). 2. أحددُ بالرّسم والكتابة عناصر F⃗ محصّلة هاتين القوّتين.'] },
      {
        kind: 'list', attribution: 'textbook', items: [
          'الحل: أمثّلُ القوّتين بالرّسم:',
          'أرسمُ شعاع القوّة الأولى بطول 4 cm ، بدايته O .',
          'أرسمُ من O شعاع القوّة الثانية بطول 3 cm ، يصنع حاملها زاوية 60° مع حامل القوّة الأولى.',
          'أكملُ الشّكل إلى متوازي أضلاع.',
          'أرسمُ القطر OM .',
          'أقيسُ طول قطر متوازي الأضلاع، أجده يساوي تقريباً 6 cm .',
        ],
      },
      { kind: 'formula', display: 'block', attribution: 'textbook', caption: 'أحسبُ قيمة شدّة المحصّلة حسب مقياس الرّسم', tex: 'F = 6 \\times 1 = 6\\ \\text{N}' },
      {
        kind: 'list', attribution: 'textbook', items: [
          'عناصر F⃗ محصّلة هاتين القوّتين:',
          'نقطة التأثير: نقطة تأثير القوّتين O .',
          'الحامل: قطر متوازي الأضلاع OM المُنشأ على القوّتين.',
          'الجهة: من O إلى الرأس المقابل M .',
          'الشدّة: F = 6 N .',
        ],
      },
      {
        kind: 'list', attribution: 'platform', ordered: true, items: [
          'المعطيات: F₁ = 4 N ، F₂ = 3 N ، الزاوية بين الحاملين 60°.',
          'المطلوب: تمثيل القوّتين بمقياس 1cm = 1N ثم عناصر المحصّلة F⃗.',
          'القاعدة: المحصّلة قطر متوازي الأضلاع المارّ من O؛ هنا تُقاس شدّتها من الرسم.',
          'التعويض: شعاع بطول 4 cm وشعاع بطول 3 cm بزاوية 60°.',
          'الحساب: قياس القطر يعطي 6 cm تقريباً، وبالضرب في مقياس الرسم F = 6 × 1 = 6 N.',
          'النتيجة: F ≈ 6 N.',
          'الوحدة: نيوتن (N).',
          'التفسير الفيزيائي: قوّة واحدة شدّتها 6N باتجاه OM تُحدث أثر القوّتين معاً.',
          'التحقق: الحدّان الممكنان |4−3| = 1 و 4+3 = 7؛ والنتيجة 6N داخل المجال وأقرب إلى المجموع لأن الزاوية حادة — نتيجة معقولة.',
        ],
      },
    ],
  },
  {
    id: 'perpendicular-statement', kind: 'source', title: 'عناصر محصّلة قوّتين متعامدتين: نص التطبيق الثاني', summary: 'أسفل صفحة 58: العنوان والتطبيق المحلول الثاني بمعطياته ومطلوبه.', attribution: 'textbook',
    source: { pages: [source('58', 'تطبيق محلول ثانٍ')], verified: true }, minutes: 4,
    blocks: [
      { kind: 'textbook-verbatim', text: 'عناصر محصّلة قوّتين متعامدتين:', source: { page: '58' } },
      { kind: 'textbook-verbatim', text: 'قوّتان F₁⃗ ، F₂⃗ متلاقيتان متعامدتان تؤثّران في النقطة O شدّتاهما F₁ = 60 N ، F₂ = 80 N .', source: { page: '58' } },
      { kind: 'list', attribution: 'textbook', items: ['المطلوب: 1. أمثّلُ القوّتين (F₁⃗ ، F₂⃗) بمقياس رسم مناسب. 2. أحسبُ شدّة محصّلة هاتين القوّتين. 3. أحدّد بالكتابة عناصر محصّلة هاتين القوّتين.'] },
    ],
  },
  {
    id: 'solved-90', kind: 'example', title: 'تطبيق محلول: التعامد وقانون فيتاغورث', summary: 'صفحة 59: الحل كما طُبع مع صندوق فيتاغورث، ثم إضافة من المنصة بتسع خطوات.', attribution: 'mixed',
    source: { pages: [source('59', 'حل التطبيق الثاني وصندوق فيتاغورث')], verified: true }, minutes: 12,
    blocks: [
      { kind: 'textbook-verbatim', text: 'الحل: 1. أختارُ مقياس رسم مناسب كل 1 cm يمثل 20 N . ثمّ أرسمُ القوّة الأولى بشعاعٍ طوله 3 cm و أرسمُ القوّة الثانية بشعاع طوله 4 cm', source: { page: '59' } },
      { kind: 'textbook-verbatim', text: '2. أحسبُ شدّة محصّلة القوّتين: لإيجاد المحصّلة أكملُ الشّكل إلى مستطيل ثمّ أرسمُ القطر OM المارّ من النقطة O . بقياس طول القطر OM أجده مساوياً 5 cm وبحسب مقياس الرّسم تكون', source: { page: '59' } },
      { kind: 'formula', display: 'block', attribution: 'textbook', caption: 'شدّة المحصّلة', tex: 'F = 5 \\times 20' },
      { kind: 'formula', display: 'block', attribution: 'textbook', tex: 'F = 100\\ \\text{N}' },
      { kind: 'textbook-verbatim', text: 'ويمكن أن نحسب شدّة المحصّلة لقوّتين متعامدتين بتطبيق قانون فيتاغورث في المثلّث القائم:', source: { page: '59' } },
      { kind: 'formula', display: 'block', attribution: 'textbook', tex: 'F = \\sqrt{F_1^2 + F_2^2}' },
      { kind: 'formula', display: 'block', attribution: 'textbook', tex: 'F = \\sqrt{(60)^2 + (80)^2}' },
      { kind: 'formula', display: 'block', attribution: 'textbook', tex: 'F = 100\\ \\text{N}' },
      { kind: 'callout', tone: 'note', title: 'الفيزياء والرياضيات — نظرية فيتاغورث', attribution: 'textbook', text: 'في المثلّث القائم مربع الوتر يساوي مجموع مربعي الضلعين القائمين' },
      {
        kind: 'list', attribution: 'textbook', items: [
          '3. عناصر F⃗ محصّلة القوّتين المتعامدتين السابقتين:',
          'نقطة التأثير: النقطة المشتركة للقوّتين O .',
          'الحامل: قطر المستطيل OM المُنشأ على القوّتين.',
          'الجهة: من O إلى الرأس المقابل M .',
          'الشدّة: F = 100 N .',
        ],
      },
      {
        kind: 'list', attribution: 'platform', ordered: true, items: [
          'المعطيات: F₁ = 60 N ، F₂ = 80 N ، الزاوية 90°.',
          'المطلوب: التمثيل بمقياس مناسب، حساب الشدّة، كتابة العناصر.',
          'القاعدة: عند التعامد F = √(F₁² + F₂²) لأن القطر وتر مثلث قائم.',
          'التعويض: F = √((60)² + (80)²).',
          'الحساب: √(3600 + 6400) = √10000 = 100.',
          'النتيجة: F = 100 N.',
          'الوحدة: نيوتن (N).',
          'التفسير الفيزيائي: المحصّلة أكبر من كلٍّ من القوّتين وأصغر من مجموعهما 140N، وهذا مطابق للمجال الممكن.',
          'التحقق: الرسم بمقياس 1cm = 20N أعطى قطراً 5cm أي 100N — تطابق الرسم والحساب تماماً.',
        ],
      },
    ],
  },
  {
    id: 'components-theory', kind: 'source', title: 'تحليل القوّة إلى مركّبتين متعامدتين', summary: 'أسفل صفحة 59 وصفحة 60: الفقرة التمهيدية، أسائل، خطوات التجربة، وأستنتج.', attribution: 'mixed',
    source: { pages: [source('59', 'تحليل القوّة'), source('60', 'خطوات تجربة التحليل')], verified: true }, minutes: 10,
    blocks: [
      { kind: 'textbook-verbatim', text: 'تحليل القوّة إلى مركّبتين متعامدتين:', source: { page: '59' } },
      { kind: 'textbook-verbatim', text: 'لإيجاد F⃗ محصّلة قوّتين متعامدتين (F₁⃗ ، F₂⃗) نكمل الشّكل إلى مستطيل ونرسم قطره المُنشأ على القوّتين والمارّ من نقطة التأثير ذاتها فيكون هذا القطر هو الممثل لمحصّلة القوّتين F⃗ .', source: { page: '59' } },
      { kind: 'textbook-verbatim', text: 'أسائل:', source: { page: '60' } },
      { kind: 'textbook-verbatim', text: 'هل يمكن تحليل القوّة F⃗ إلى مركّبتين متعامدتين F₁⃗ ، F₂⃗ وكيف يتمّ ذلك؟', source: { page: '60', item: 'أسائل' } },
      { kind: 'textbook-verbatim', text: 'أجيب وأستنتج:', source: { page: '60' } },
      {
        kind: 'procedure', title: 'خطوات التجربة:', attribution: 'textbook', items: [
          'أحدّدُ على لوح الزنابض نقطة O .',
          'أرسمُ منها شعاعاً يُمثّلُ القوّة F⃗ وليكن الشعاع OM⃗ .',
          'أرسمُ من O محورين متعامدين OX ، OY يمثّلان حاملي القوّتين F₁⃗ ، F₂⃗ .',
          'أرسمُ من النقطة M عمودين على هذين المحورين (مرسم النقطة).',
          'يشكّل مستطيل قطره المارّ من النقطة O يمثل المحصّلة F⃗ .',
          'فالمسافات على المحورين OX ، OY يمثّلان المركّبتين F₁⃗ ، F₂⃗ .',
        ],
      },
      { kind: 'callout', tone: 'note', title: 'أستنتج', attribution: 'textbook', text: 'يمكن الاستعاضة عن القوّة F⃗ بقوّتين متعامدتين F₁⃗ ، F₂⃗ تقومان مقامها تُسمّيان مركّبتَيها.' },
      { kind: 'callout', tone: 'note', title: 'أستنتج', attribution: 'textbook', text: 'عملية تحليل القوة إلى مركّبتين متعامدتين عمليّة معاكسة لعملية إيجاد محصّلة قوّتين متعامدتين.' },
    ],
  },
  {
    id: 'components-lab', kind: 'simulation', title: 'محاكاة: من قوّة واحدة إلى مركّبتين', summary: 'وضعان: تحليل على محورين متعامدين، وتحليل الثقل على المستوي المائل.', attribution: 'platform', minutes: 9,
    blocks: [
      { kind: 'paragraph', attribution: 'platform', text: 'المحاكاة تطبق خطوات الصفحة 60: ارسم القوّة، ارسم المحورين، أسقط العمودين من M، واقرأ المركّبتين. ثم انتقل إلى وضع المستوي المائل لتنفّذ نشاط الصفحة 60 وتكتشف الشكل الناتج بنفسك.' },
      { kind: 'interactive', interactiveId: 'force-components-lab', caption: 'بدّل بين الوضعين وغيّر الزاوية والشدّة وراقب المركّبتين والشكل الناتج.' },
    ],
  },
  {
    id: 'incline-activity', kind: 'activity', title: 'نشاط الكتاب: الجسم على المستوي المائل', summary: 'صفحة 60: نص النشاط كما طُبع ببنديه.', attribution: 'textbook',
    source: { pages: [source('60', 'نشاط المستوي المائل')], verified: true }, minutes: 7,
    blocks: [
      { kind: 'textbook-verbatim', text: 'نشاط: إذا وضع جسم صلب فوق مستوٍ مائل أملس يميل عن الأفق بزاوية، والمطلوب:', source: { page: '60' } },
      { kind: 'list', attribution: 'textbook', ordered: true, items: ['أحدّدُ بالرّسم القوى المؤثّرة عليه.', 'أحلّل قوّة ثقله إلى مركّبتين متعامدتين، ما الشّكل الذي أحصل عليه؟'] },
    ],
  },
  {
    id: 'learn-box', kind: 'summary', title: 'تعلّم — خلاصة الكتاب', summary: 'صفحة 61: صندوق تعلّم بنقاطه الثلاث وتفاريعها.', attribution: 'textbook',
    source: { pages: [source('61', 'تعلّم')], verified: true }, minutes: 5,
    blocks: [
      {
        kind: 'list', attribution: 'textbook', items: [
          'القوى المتلاقية: هي القوى التي تتلاقى حواملها في نقطة واحدة.',
          'عناصر محصّلة قوّتين متلاقيتين تقعان في مستوٍ واحد: نقطة التأثير: نقطة تأثير القوّتين O . — الحامل: قطر متوازي الأضلاع OM المُنشأ على القوّتين والمارّ بنقطة التأثير المشتركة. — الجهة: من O إلى الرأس المقابل M . — الشدّة: تمثل طول قطر متوازي الأضلاع.',
          'عناصر محصّلة قوّتين متعامدتين: نقطة التأثير: النقطة المشتركة للقوّتين O . — الحامل: قطر المستطيل OM المُنشأ على القوّتين. — الجهة: من O إلى الرأس المقابل M . — الشدّة: تُحسب من العلاقة: F = √(F₁² + F₂²) أو من الرسم.',
          'تحليل قوّة إلى مركّبتين متعامدتين: عملية تحليل القوّة إلى مركّبتين متعامدتين عملية معاكسة لعملية إيجاد محصّلة قوّتين متعامدتين.',
          'يمكن الاستعاضة عن القوّة F⃗ بقوّتين متعامدتين F₁⃗ ، F₂⃗ تقومان مقامها تسميّان مركّبتَيها.',
        ],
      },
    ],
  },
  {
    id: 'book-check-1', kind: 'question', title: 'أختبر نفسي: اختر الإجابة الصحيحة', summary: 'الصفحتان 61–62 — السؤال الأول بفقراته الست.', attribution: 'textbook',
    source: { pages: [source('61', 'أختبر نفسي — السؤال الأول'), source('62', 'تتمة السؤال الأول')], verified: true }, minutes: 10,
    blocks: [
      { kind: 'textbook-verbatim', text: 'اختر الإجابة الصحيحة لكلٍّ مما يأتي، وانقلها إلى دفترك:', source: { page: '61' } },
      { kind: 'question', questionId: 'p1-book-mc-1' },
      { kind: 'question', questionId: 'p1-book-mc-2' },
      { kind: 'question', questionId: 'p1-book-mc-3' },
      { kind: 'question', questionId: 'p1-book-mc-4' },
      { kind: 'question', questionId: 'p1-book-mc-5' },
      { kind: 'question', questionId: 'p1-book-mc-6' },
    ],
  },
  {
    id: 'book-check-2', kind: 'question', title: 'أختبر نفسي: المسألتان', summary: 'صفحة 62 — السؤال الثاني بمسألتيه.', attribution: 'textbook',
    source: { pages: [source('62', 'أختبر نفسي — السؤال الثاني')], verified: true }, minutes: 12,
    blocks: [
      { kind: 'question', questionId: 'p1-book-pr-1' },
      { kind: 'question', questionId: 'p1-book-pr-2' },
    ],
  },
  {
    id: 'common-errors', kind: 'common-error', title: 'أخطاء شائعة في القوى المتلاقية', summary: 'تنبيهات المنصة: الجمع المباشر، المقياس، نقطة البداية، والمجال المستحيل.', attribution: 'platform', minutes: 6,
    blocks: [
      { kind: 'callout', tone: 'warning', title: 'جمع الشدّات وإهمال الزاوية', attribution: 'platform', text: 'F₁ + F₂ محصّلةٌ صحيحة فقط عند زاوية 0°. عند أي زاوية أخرى يجب البناء الهندسي أو فيتاغورث عند التعامد.' },
      { kind: 'callout', tone: 'warning', title: 'نسيان مقياس الرسم', attribution: 'platform', text: 'طول القطر بالسنتيمتر ليس نيوتن؛ تُضرب القراءة في قيمة السنتيمتر (كما في الكتاب: F = 5 × 20 = 100 N بمقياس 1cm = 20N).' },
      { kind: 'callout', tone: 'warning', title: 'قطر لا يمرّ من O', attribution: 'platform', text: 'المحصّلة تُرسم من نقطة التلاقي O إلى الرأس المقابل M. قطر يصل رأسين آخرين لا يمثل المحصّلة.' },
      { kind: 'callout', tone: 'warning', title: 'نتيجة خارج المجال الممكن', attribution: 'platform', text: 'إن خرجت شدّة المحصّلة عن |F₁ − F₂| ≤ F ≤ F₁ + F₂ فالرسم أو الحساب خطأ؛ هذا معيار كشف النتائج المستحيلة.' },
      { kind: 'callout', tone: 'note', title: 'المركّبتان ليستا قوّتين جديدتين', attribution: 'platform', text: 'التحليل استبدال وصفّي لا إضافة قوى: الجسم يشعر بالأثر نفسه، لذلك لا تُجمع المركّبتان مع القوّة الأصلية في حساب واحد.' },
    ],
  },
  {
    id: 'summary-platform', kind: 'summary', title: 'خلاصة مترابطة', summary: 'من تلاقي الحوامل إلى المحصّلة والتحليل، بعلاقات الكتاب نفسها.', attribution: 'platform', minutes: 5,
    blocks: [
      {
        kind: 'list', attribution: 'platform', items: [
          'القوى المتلاقية قوى تتلاقى حواملها في نقطة واحدة، كما في تجربة الربيعتين صفحة 56.',
          'المحصّلة قوّة وحيدة تحل محل قوّتين: حاملها قطر متوازي الأضلاع المارّ من O، وجهتها من O إلى M، وشدّتها طول القطر بمقياس الرسم.',
          'الزاوية تتحكم بالشدّة: المجموع عند 0°، والفرق عند 180°، وفيتاغورث عند 90°.',
          'تحليل القوّة عكس إيجاد المحصّلة: من القطر إلى الضلعين، والمستطيل شكل التحليل عند التعامد.',
          'على المستوي المائل يُحلّ الثقل إلى مركّبة موازية للسطح وأخرى شاقولية عليه، وهذا يفسّر انزلاق الجسم وضغطه على السطح.',
          'كل حل يُفحص بثلاثة أسئلة: هل هو داخل المجال الممكن؟ هل وحدته نيوتن؟ هل كُتبت عناصره الأربعة؟',
        ],
      },
    ],
  },
  {
    id: 'final-test', kind: 'final-test', title: 'الاختبار الشامل للدرس', summary: '14 سؤالاً جديداً متنوّعاً من إضافة المنصة.', attribution: 'platform', testId: finalTest.id, minutes: 25,
    blocks: [],
  },
]

export const physicsLesson1: LessonDefinition = {
  id: 'phys-u2-l1', slug: 'concurrent-forces', title: 'الدرس الأول — القوى المتلاقية', order: 1, status: 'source-verified', source: verifiedSource,
  summary: 'القوى المتلاقية وتجربة الربيعتين، محصّلة قوّتين متلاقيتين بطريقة متوازي الأضلاع وعناصرها، حالة التعامد وقانون فيتاغورث، وتحليل القوّة إلى مركّبتين متعامدتين بما فيها المستوي المائل.',
  steps,
  tests: [bookAssessment, finalTest],
}
