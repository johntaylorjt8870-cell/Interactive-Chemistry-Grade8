import { buildBlueprint } from '../blueprint'
import type { TestBank, TestQuestion } from '../types'

/* ============================================================================
   اختبار الدرس الثالث — صيغةُ المركّباتِ الكيميائيَّةِ (الصفحات 18–23)
   ----------------------------------------------------------------------------
   عشرون سؤالًا أصليًا من إضافة المنصة، مستقلة عن أسئلة الكتاب وأنشطته
   واختباره النهائي: تقيس قراءة الصيغة، تحديد التكافؤ من النماذج والمعادلات،
   الجذور وتكافؤاتها، بناء الصيغة بالتعادل الكهربائي، القوس، والتحقق من الصيغة
   وتشخيص أخطائها. لا تعيد صياغة سؤال كتاب ولا سؤال اختبار الدرس.
   ========================================================================= */

const p = (page: string, item?: string) => ({ page, item })

const questions: TestQuestion[] = [
  /* 1 — دلالة الرقم خارج القوس في صيغة كتابية ................................ */
  {
    id: 'ta-l3-q01',
    type: 'single-choice',
    difficulty: 'basic',
    conceptId: 'l3-formula-reading',
    tags: ['conceptual'],
    sourceRefs: [p('21'), p('22')],
    prompt: 'في صيغة كبريتات الألمنيوم المطبوعة في الدرس: ماذا يشير الرقم 3 الواقع خارج القوس إلى؟',
    options: [
      { id: 'a', label: 'عدد جذور الكبريتات كاملة الوحدات في الصيغة.' },
      { id: 'b', label: 'عدد ذرّات الكبريت داخل الجذر فقط.' },
      { id: 'c', label: 'تكافؤ الألمنيوم في المركّب.' },
      { id: 'd', label: 'عدد أيونات الألمنيوم في الصيغة.' },
    ],
    correctOptionIds: ['a'],
  },

  /* 2 — التكافؤ من النموذج ................................................... */
  {
    id: 'ta-l3-q02',
    type: 'single-choice',
    difficulty: 'basic',
    conceptId: 'l3-valence-covalent',
    tags: ['application'],
    sourceRefs: [p('19')],
    prompt: 'اعتمادًا على نموذج الدرس لجزيء النشادر: كم رابطة مشتركة شكّل النتروجين، وما تكافؤه بها؟',
    options: [
      { id: 'a', label: 'رابطتان، وتكافؤه 2.' },
      { id: 'b', label: 'ثلاث روابط، وتكافؤه 3.' },
      { id: 'c', label: 'أربع روابط، وتكافؤه 4.' },
      { id: 'd', label: 'رابطة واحدة، وتكافؤه 1.' },
    ],
    correctOptionIds: ['b'],
  },

  /* 3 — تعريف التكافؤ الأيوني ................................................ */
  {
    id: 'ta-l3-q03',
    type: 'true-false',
    difficulty: 'basic',
    conceptId: 'l3-valence-ionic',
    tags: ['conceptual'],
    sourceRefs: [p('19')],
    prompt: 'عددُ الإلكتروناتِ التي تفقدها ذرّةٌ أو تكتسبها عند ارتباطها في مركّبها الأيوني هو تكافؤها.',
    correctAnswer: true,
  },

  /* 4 — التكافؤ من المعادلة .................................................. */
  {
    id: 'ta-l3-q04',
    type: 'numeric',
    difficulty: 'basic',
    conceptId: 'l3-valence-ionic',
    tags: ['application'],
    sourceRefs: [p('19')],
    prompt: 'في معادلة الدرس للمغنزيوم: عبر السهم إلكترونان. ما تكافؤ المغنزيوم في مركّباته الأيونية؟ اكتب عدداً صحيحاً.',
    answer: { correctValue: 2, integerOnly: true, decimals: { max: 0 } },
  },

  /* 5 — صيغة بتكافؤين متساويين ................................................ */
  {
    id: 'ta-l3-q05',
    type: 'exact',
    difficulty: 'basic',
    conceptId: 'l3-formula-writing',
    tags: ['application'],
    sourceRefs: [p('21'), p('22')],
    prompt: 'تكافؤ الكالسيوم 2 وتكافؤ الأكسجين 2. اكتب صيغة أكسيد الكالسيوم الناتجة (مثال للتنسيق: NaCl).',
    answer: { kind: 'formula', acceptedAnswers: ['CaO'], inputHint: 'مثال: NaCl' },
  },

  /* 6 — مفهوم الجذر ................................................................ */
  {
    id: 'ta-l3-q06',
    type: 'multi-select',
    difficulty: 'basic',
    conceptId: 'l3-radicals',
    tags: ['conceptual'],
    sourceRefs: [p('20'), p('21')],
    prompt: 'اختر العبارتين الصحيحتين عن الجذور الكيميائية كما قدّمها الدرس:',
    options: [
      { id: 'a', label: 'مجموعة ذرّات مترابطة تسلك سلوك أيون واحد أو ذرّة واحدة.' },
      { id: 'b', label: 'تكافؤ الجذر تبيّنه شحنته في جدول الدرس.' },
      { id: 'c', label: 'يتفكك الجذر إلى ذرّاته كلما دخل مركّباً.' },
      { id: 'd', label: 'كل الجذور الواردة في جدول الدرس سالبة الشحنة.' },
    ],
    correctOptionIds: ['a', 'b'],
  },

  /* 7 — قراءة الأُسّ السفلي داخل القوس ......................................... */
  {
    id: 'ta-l3-q07',
    type: 'single-choice',
    difficulty: 'medium',
    conceptId: 'l3-formula-reading',
    tags: ['application', 'data-reading'],
    sourceRefs: [p('22')],
    prompt: 'كم ذرّة أكسجين تدخل في صيغة كبريتات الألمنيوم Al₂(SO₄)₃؟',
    options: [
      { id: 'a', label: '4 ذرّات.' },
      { id: 'b', label: '7 ذرّات.' },
      { id: 'c', label: '12 ذرّة.' },
      { id: 'd', label: '3 ذرّات.' },
    ],
    correctOptionIds: ['c'],
  },

  /* 8 — تركيب الصيغ ........................................................... */
  {
    id: 'ta-l3-q08',
    type: 'matching',
    difficulty: 'medium',
    conceptId: 'l3-formula-writing',
    tags: ['application'],
    sourceRefs: [p('21'), p('22')],
    prompt: 'اربط كل صيغة بتركيبها الصحيح كما تظهر في أمثلة الدرس:',
    left: [{ id: 'al2o3', label: 'Al₂O₃' }, { id: 'zncl2', label: 'ZnCl₂' }, { id: 'al2so43', label: 'Al₂(SO₄)₃' }, { id: 'cao', label: 'CaO' }],
    right: [
      { id: 'al-o', label: 'ذرّتا ألمنيوم وثلاث ذرّات أكسجين' },
      { id: 'zn-cl', label: 'أيون زنك وأيونَا كلوريد' },
      { id: 'al-so4', label: 'أيونَا ألمنيوم وثلاثة جذور كبريتات' },
      { id: 'ca-o', label: 'ذرّة كالسيوم وذرّة أكسجين' },
    ],
    pairs: [
      { leftId: 'al2o3', rightId: 'al-o' },
      { leftId: 'zncl2', rightId: 'zn-cl' },
      { leftId: 'al2so43', rightId: 'al-so4' },
      { leftId: 'cao', rightId: 'ca-o' },
    ],
  },

  /* 9 — مجموع الشحنة الموجبة .................................................. */
  {
    id: 'ta-l3-q09',
    type: 'numeric',
    difficulty: 'medium',
    conceptId: 'l3-charge-balance',
    tags: ['problem-solving'],
    sourceRefs: [p('22')],
    prompt: 'في صيغة كبريتات الألمنيوم Al₂(SO₄)₃: ما مجموع الشحنة الموجبة لأيونات الألمنيوم في الوحدة الواحدة؟ اكتب عدداً صحيحاً.',
    answer: { correctValue: 6, integerOnly: true, decimals: { max: 0 } },
  },

  /* 10 — خطوات التحقق من صيغة .................................................. */
  {
    id: 'ta-l3-q10',
    type: 'ordering',
    difficulty: 'medium',
    conceptId: 'l3-formula-writing',
    tags: ['problem-solving'],
    sourceRefs: [p('21'), p('22')],
    prompt: 'رتّب خطوات التحقق من صحة صيغة كيميائية بعد كتابتها:',
    items: [
      { id: 'species', label: 'نسمّي المؤلِّفَين ونحدّد شحنة كلٍّ منهما.' },
      { id: 'multiply', label: 'نضرب شحنة كل مؤلِّف في عدد مرات وروده في الصيغة.' },
      { id: 'sum', label: 'نجمع الشحنات الموجبة وشحنات السالب على حدة.' },
      { id: 'zero', label: 'نتأكد أن المجموعين متقايسان فيكون المجموع الكلي صفراً.' },
    ],
    correctOrder: ['species', 'multiply', 'sum', 'zero'],
  },

  /* 11 — تشخيص خطأ: صيغة بلا تبادل ............................................. */
  {
    id: 'ta-l3-q11',
    type: 'error-analysis',
    difficulty: 'medium',
    conceptId: 'l3-formula-writing',
    tags: ['error-analysis'],
    sourceRefs: [p('21')],
    prompt: 'راجع عمل الطالب وحدّد الخطأ:',
    flawedWork: 'تكافؤ المغنزيوم 2 وتكافؤ الكلور 1؛ لذلك كتبتُ صيغة كلوريد المغنزيوم هكذا: MgCl — كل تكافؤ وضعته مع مؤلِّفه.',
    options: [
      { id: 'a', label: 'لم يبدّل التكافؤين؛ فتكافؤ المغنزيوم يحدّد عدد أيونات الكلوريد، والصواب MgCl₂.' },
      { id: 'b', label: 'لا خطأ في عمله؛ فالصيغة MgCl متعادلة كهربائياً.' },
      { id: 'c', label: 'الخطأ في شحنة المغنزيوم؛ فهي +1 لا +2.' },
      { id: 'd', label: 'الخطأ في تكافؤ الكلور؛ فهو 2 لا 1 كما في الجدول.' },
    ],
    correctOptionIds: ['a'],
  },

  /* 12 — كتابة صيغة بجذر ....................................................... */
  {
    id: 'ta-l3-q12',
    type: 'exact',
    difficulty: 'medium',
    conceptId: 'l3-formula-writing',
    tags: ['application'],
    sourceRefs: [p('20'), p('21')],
    prompt: 'المغنزيوم تكافؤه 2 وجذور الكبريتات تكافؤها 2. اكتب صيغة كبريتات المغنزيوم (مثال للتنسيق: NaCl).',
    answer: { kind: 'formula', acceptedAnswers: ['MgSO4'], inputHint: 'مثال: NaCl' },
  },

  /* 13 — متى يوضع القوس ................................................................ */
  {
    id: 'ta-l3-q13',
    type: 'single-choice',
    difficulty: 'medium',
    conceptId: 'l3-radicals',
    tags: ['application'],
    sourceRefs: [p('21'), p('22')],
    prompt: 'أيّ الصيغ الأربع تحتاج قوساً عند كتابتها وفق قاعدة الدرس؟',
    options: [
      { id: 'a', label: 'مركّب الصوديوم مع جذر النترات: NaNO₃.' },
      { id: 'b', label: 'مركّب المغنزيوم مع جذور الهيدروكسيل: يحتاج جذراً اثنين.' },
      { id: 'c', label: 'مركّب الكالسيوم مع الأكسجين: CaO.' },
      { id: 'd', label: 'مركّب الزنك مع الكلور: ZnCl₂.' },
    ],
    correctOptionIds: ['b'],
  },

  /* 14 — تصحيح خطأ: التكافؤ على نفسه ............................................ */
  {
    id: 'ta-l3-q14',
    type: 'error-correction',
    difficulty: 'advanced',
    conceptId: 'l3-formula-writing',
    tags: ['error-analysis'],
    sourceRefs: [p('21')],
    prompt: 'صحّح صيغة الطالب واكتبها على النسق اللاتيني:',
    flawedWork: 'أكسيد الألمنيوم: Al₃O₂ — وضعتُ تكافؤ كل مؤلِّف على نفسه دون تبادل.',
    correction: { kind: 'exact', spec: { kind: 'formula', acceptedAnswers: ['Al2O3'], inputHint: 'مثال: NaCl' } },
  },

  /* 15 — عدّ ذرّات بجذر مكرر ..................................................... */
  {
    id: 'ta-l3-q15',
    type: 'numeric',
    difficulty: 'advanced',
    conceptId: 'l3-formula-reading',
    tags: ['problem-solving', 'data-reading'],
    sourceRefs: [p('20'), p('21')],
    prompt: 'في مركّب يتكوّن من جذرَيْ أمونيوم وجذر كبريتات واحد: كم ذرّة هيدروجين في وحدته الصيغية؟ اكتب عدداً صحيحاً.',
    answer: { correctValue: 8, integerOnly: true, decimals: { max: 0 } },
  },

  /* 16 — تمييز المركّبات الجذرية ................................................ */
  {
    id: 'ta-l3-q16',
    type: 'multi-select',
    difficulty: 'advanced',
    conceptId: 'l3-radicals',
    tags: ['conceptual', 'application'],
    sourceRefs: [p('21')],
    prompt: 'اختر المركّبين اللذين يدخل في بناء كلٍّ منهما جذر كيميائي من جدول الدرس:',
    options: [
      { id: 'a', label: 'CaO' },
      { id: 'b', label: 'K₂CO₃' },
      { id: 'c', label: 'H₂O' },
      { id: 'd', label: 'Al₂(SO₄)₃' },
    ],
    correctOptionIds: ['b', 'd'],
  },

  /* 17 — تساوي التكافؤين ........................................................ */
  {
    id: 'ta-l3-q17',
    type: 'true-false',
    difficulty: 'thinking',
    conceptId: 'l3-formula-writing',
    tags: ['conceptual'],
    sourceRefs: [p('22')],
    prompt: 'إذا تحقّق التعادل الكهربائي بمقدار واحد من كل مؤلِّف فقد تُكتب الصيغة دون أرقام فهرسية أصلًا، كما في التطبيق المحلول لأكسيد الكالسيوم.',
    correctAnswer: true,
  },

  /* 18 — تشخيص خطأ: عكس التبادل في الجذور ....................................... */
  {
    id: 'ta-l3-q18',
    type: 'error-analysis',
    difficulty: 'thinking',
    conceptId: 'l3-formula-writing',
    tags: ['error-analysis', 'problem-solving'],
    sourceRefs: [p('22')],
    prompt: 'راجع استنتاج الطالب وحدّد موضع الخطأ:',
    flawedWork: 'استنتجتُ صيغة كبريتات الألمنيوم هكذا: Al(SO₄)₃ — لأن تكافؤ الألمنيوم 3 يعني وجود ثلاثة أيونات ألمنيوم.',
    options: [
      { id: 'a', label: 'عكس التبادل المتقاطع: تكافؤ الألمنيوم يحدّد عدد جذور الكبريتات لا عدد أيوناته، والصواب Al₂(SO₄)₃.' },
      { id: 'b', label: 'الخطأ في تكافؤ جذر الكبريتات؛ فهو 3 لا 2.' },
      { id: 'c', label: 'النسبة صحيحة والخطأ في موضع القوس فقط.' },
      { id: 'd', label: 'لا يصح كتابة جذر الكبريتات مع الألمنيوم أصلًا.' },
    ],
    correctOptionIds: ['a'],
  },

  /* 19 — ربط المركّب بجذره ....................................................... */
  {
    id: 'ta-l3-q19',
    type: 'matching',
    difficulty: 'thinking',
    conceptId: 'l3-radicals',
    tags: ['application', 'data-reading'],
    sourceRefs: [p('21')],
    prompt: 'اربط كل مركّب بالجذر الكيميائي الذي يدخل في بنائه وفق جدول الدرس:',
    left: [{ id: 'nh4cl', label: 'NH₄Cl' }, { id: 'caoh2', label: 'Ca(OH)₂' }, { id: 'nano3', label: 'NaNO₃' }, { id: 'ca3po42', label: 'Ca₃(PO₄)₂' }],
    right: [
      { id: 'ammonium', label: 'جذور الأمونيوم' },
      { id: 'hydroxide', label: 'جذور الهيدروكسيل' },
      { id: 'nitrate', label: 'جذور النترات' },
      { id: 'phosphate', label: 'جذور الفوسفات' },
    ],
    pairs: [
      { leftId: 'nh4cl', rightId: 'ammonium' },
      { leftId: 'caoh2', rightId: 'hydroxide' },
      { leftId: 'nano3', rightId: 'nitrate' },
      { leftId: 'ca3po42', rightId: 'phosphate' },
    ],
  },

  /* 20 — تصحيح خطأ: صيغة جذرية معطّلة ............................................ */
  {
    id: 'ta-l3-q20',
    type: 'error-correction',
    difficulty: 'advanced',
    conceptId: 'l3-formula-writing',
    tags: ['error-analysis'],
    sourceRefs: [p('20'), p('21')],
    prompt: 'صحّح صيغة الطالب لمركّب الكالسيوم مع جذور الفوسفات واكتبها على النسق اللاتيني:',
    flawedWork: 'كتبتُ: CaPO₄ — لأن كل مؤلِّف يكفيه مقدار واحد.',
    correction: { kind: 'exact', spec: { kind: 'formula', acceptedAnswers: ['Ca3(PO4)2'], inputHint: 'مثال: NaCl' } },
  },
]

const chemUnit1Lesson3Bank: TestBank = {
  id: 'chem-u1-l3',
  version: 1,
  scope: 'lesson',
  title: 'اختبار الدرس الثالث — صيغةُ المركّباتِ الكيميائيَّةِ',
  summary:
    'عشرون سؤالاً أصلياً تقيس قراءة الصيغة، التكافؤ من النماذج والمعادلات، الجذور وتكافؤاتها، بناء الصيغة بالتعادل الكهربائي، القوس، والتحقق من الصيغ.',
  unitId: 'chem-u1',
  lessonIds: ['chem-u1-l3'],
  questions,
  blueprint: buildBlueprint({
    testId: 'chem-u1-l3',
    scope: 'lesson',
    unitId: 'chem-u1',
    lessonIds: ['chem-u1-l3'],
    questions,
    concepts: [
      {
        id: 'l3-formula-reading',
        label: 'قراءة الصيغة الكيميائية ودلالة الأرقام والأقواس',
        pageRefs: [p('21'), p('22')],
        questionIds: ['ta-l3-q01', 'ta-l3-q07', 'ta-l3-q15'],
      },
      {
        id: 'l3-valence-covalent',
        label: 'التكافؤ في المركّبات ذات الروابط المشتركة من النماذج',
        pageRefs: [p('19')],
        questionIds: ['ta-l3-q02'],
      },
      {
        id: 'l3-valence-ionic',
        label: 'التكافؤ في المركّبات الأيونية من المعادلات',
        pageRefs: [p('19')],
        questionIds: ['ta-l3-q03', 'ta-l3-q04'],
      },
      {
        id: 'l3-radicals',
        label: 'الجذور الكيميائية وصيغها وتكافؤاتها وموضع القوس',
        pageRefs: [p('20'), p('21'), p('22')],
        questionIds: ['ta-l3-q06', 'ta-l3-q13', 'ta-l3-q16', 'ta-l3-q19'],
      },
      {
        id: 'l3-formula-writing',
        label: 'مراحل كتابة الصيغة والتحقق منها وتشخيص أخطائها',
        pageRefs: [p('20'), p('21'), p('22')],
        questionIds: [
          'ta-l3-q05', 'ta-l3-q08', 'ta-l3-q10', 'ta-l3-q11', 'ta-l3-q12',
          'ta-l3-q14', 'ta-l3-q17', 'ta-l3-q18', 'ta-l3-q20',
        ],
      },
      {
        id: 'l3-charge-balance',
        label: 'التعادل الكهربائي وحساب الشحنات',
        pageRefs: [p('22')],
        questionIds: ['ta-l3-q09'],
      },
    ],
    commonErrors: [
      {
        id: 'e3-subscripts',
        label: 'سوء قراءة الأرقام الفهرسية داخل الصيغة وخارج القوس',
        questionIds: ['ta-l3-q01', 'ta-l3-q07', 'ta-l3-q15'],
      },
      {
        id: 'e3-valence-source',
        label: 'الخلط بين التكافؤ وعدد إلكترونات السطح',
        questionIds: ['ta-l3-q02', 'ta-l3-q03', 'ta-l3-q04'],
      },
      {
        id: 'e3-charge-balance',
        label: 'إهمال التعادل الكهربائي أو عكس التبادل المتقاطع',
        questionIds: ['ta-l3-q09', 'ta-l3-q11', 'ta-l3-q14', 'ta-l3-q18'],
      },
      {
        id: 'e3-parentheses',
        label: 'إسقاط القوس عن الجذر المكرر أو إدخاله بلا داعٍ',
        questionIds: ['ta-l3-q13', 'ta-l3-q16', 'ta-l3-q20'],
      },
      {
        id: 'e3-equal-valences',
        label: 'كتابة أرقام فهرسية رغم تساوي تكافؤ المؤلِّفَين',
        questionIds: ['ta-l3-q05', 'ta-l3-q17'],
      },
      {
        id: 'e3-radical-identity',
        label: 'التعامل مع الجذر كذرّات منفصلة لا كوحدة واحدة',
        questionIds: ['ta-l3-q06', 'ta-l3-q19'],
      },
    ],
    crossTopicConnections: [
      {
        label: 'قاعدة الثمانية وميل الذرّة إلى الفقد أو الاكتساب (الدرس الثاني)',
        lessonIds: ['chem-u1-l2'],
        questionIds: ['ta-l3-q03', 'ta-l3-q04', 'ta-l3-q18'],
      },
    ],
    scoring: { pointsPerQuestion: 1, allowPartial: false },
    solutionChunkSize: 5,
  }),
}

export default chemUnit1Lesson3Bank
