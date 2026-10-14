import type { FinalTest, Question } from '@/assessment/types'
import type { ContentBlock, LessonDefinition, LessonStep } from './schema'
import {
  bookActivitySolutions,
  bookQuestions,
  lesson5BookQuestionCount,
  lesson5BookQuestionIds,
} from './chemistryLesson5Questions'
import { finalTest } from './chemistryLesson5Test'

export { bookActivitySolutions, bookQuestions, finalTest, lesson5BookQuestionCount, lesson5BookQuestionIds }

const ref = (page: string, item?: string) => ({ page, item })
const source = (pages: string[], item?: string) => ({
  pages: pages.map((page) => ref(page, item)),
  verified: true,
})
const quote = (page: string, text: string, item?: string): ContentBlock => ({
  kind: 'textbook-verbatim', text, source: ref(page, item),
})
const q = (...questionIds: string[]): ContentBlock[] => questionIds.map((questionId) => ({ kind: 'question', questionId }))
const prose = (text: string): ContentBlock => ({ kind: 'paragraph', text, attribution: 'platform' })
const platformCallout = (tone: 'note' | 'warning' | 'method', title: string, text: string): ContentBlock => ({
  kind: 'callout', tone, title, text, attribution: 'platform',
})
const procedure = (title: string, items: string[]): ContentBlock => ({ kind: 'procedure', title, items, attribution: 'platform' })

/** Detailed teacher reasoning and lab guidance; every block is a platform addition. */
export const lesson5TeacherGuide: ContentBlock[] = [
  platformCallout(
    'method',
    '1. عد الذرات: ثبات نوع الذرة وعددها — ص30–31',
    'الصيغة الكيميائية تصف نوع الذرات وعددها في مادة واحدة، ثم نجمع الذرات في كل مواد طرف التفاعل. في المثال CH3COOH + NaHCO3 → CH3COONa + H2O + CO2 تكون المجاميع C=3 وH=5 وO=5 وNa=1 على كل جانب. لا نكتفي بتساوي مجموع كل الذرات؛ نقارن كل عنصر بنفسه. تتغير الروابط وترتيب الذرات، لا هوية الذرات أو أعدادها.',
  ),
  procedure('طريقة تصحيح سؤال العد', [
    'أجزّئ كل صيغة إلى رموز عناصر، وأحوّل الرقم السفلي إلى عدد الذرات لذلك العنصر؛ غياب الرقم يعني ذرة واحدة.',
    'أجمع مساهمات جميع صيغ المتفاعلات، ثم أعيد الحساب منفصلاً للنواتج.',
    'أقارن C مع C وH مع H وO مع O وNa مع Na. لا تعوّض ذرات عنصرٍ ذراتَ عنصر مختلف.',
    'أشرح أن الرسم التعليمي يرمز للعد فقط، ولا يدعي تمثيل حجم الجزيئات أو ترتيب الروابط كما في صورة كتاب.',
  ]),
  platformCallout(
    'method',
    '2. انحفاظ الكتلة وحدود النظام — ص31–32',
    'قانون انحفاظ الكتلة يقارن مجموع كتلة النظام الكيميائي قبل التفاعل وبعده. في نظام مغلق لا تعبر المادة الحد المختار، فيتساوى المجموع داخل الحدين. أما في نظام مفتوح فقد يخرج غاز أو تدخل مادة؛ قد تتغير قراءة ميزان يزن الوعاء وما بقي فيه لأن الميزان لا يزن ما غادره. عند توسيع الحساب ليشمل المادة المتبادلة مع المحيط يظل مجموع الكتلة محفوظاً. لا نعمم ثبات قراءة الميزان على كل تصميم تجربة.',
  ),
  platformCallout(
    'note',
    'قراءة CaO وHCl كما يعرضها المصدر',
    'ينقل حل المنصة قراءة 125.100 قبل التفاعل و125.100 بعده كما تظهر في الشكل، من دون إضافة وحدة غير ظاهرة. هذه إعادة عرض لبيانات الكتاب وليست نتيجة ولدتها المحاكاة. التفاعل الموضح CaO مع HCl لا يعطي CO2؛ لذلك لا نفسر تغير الكتلة بخروج هذا الغاز في هذه التجربة.',
  ),
  procedure('توجيه مناقشة النظام المفتوح والمغلق', [
    'أطلب من الطالب أن يرسم حدود ما يضعه على الميزان: الوعاء ومحتواه، لا كل الغرفة.',
    'في النظام المغلق، تبقى مادة النظام داخل الحدود؛ تتغير هويات الجزيئات لكن لا يفقد الميزان مادة بسبب خروج غاز.',
    'في مثال مفتوح توضيحي، إذا خرجت كتلة غاز من الوعاء فقد تقل كتلة ما بقي فوق الميزان بمقدار ما غادر، مع بقاء الغاز مادة في المحيط.',
    'أميز القراءة المنقولة 125.100 عن كل ناتج حسابي تفاعلي، وأتحقق أن كل نموذج حسابي يعلن مدخلاته وافتراضاته.',
  ]),
  platformCallout(
    'method',
    '3. النسب الثابتة: تركيب المركب لا حجم العينة — ص33–35',
    'قانون بروست يصف النسبة الكتلية للعناصر داخل المركب نفسه. يمكن أن تكبر كتلتا العنصرين معاً أو تصغرا، لكن النسبة بينهما تبقى واحدة. عند وجود مادة متبقية، نحسب أولاً الكتلة التي تفاعلت ونستبعد الفائض من نسبة تركيب المركب. لا نستبعد الفائض من جرد الكتلة الكلية للنظام عند تطبيق قانون انحفاظ الكتلة.',
  ),
  procedure('مراجعة بيانات الرصاص والكبريت والحديد والكبريت', [
    'في جدول الرصاص والكبريت، تفاعل 10 g رصاص مع 1.56 g كبريت؛ النسبة 10/1.56 = 6.410256… ≈ 6.41.',
    'في التجربة التي بدأ فيها 10 g رصاص و3 g كبريت، بقي 3−1.56=1.44 g كبريت. النسبة تستخدم 1.56 g التي تفاعلت، لا 3 g الموضوعة كلها.',
    'في تجربة 18 g رصاص و1.56 g كبريت، بقي 18−10=8 g رصاص؛ كتلة الرصاص الداخلة في المركب 10 g.',
    'في جدول الحديد والكبريت: 56/32 = 28/16 = 7/4 = 1.75. اكتب البسط والمقام بالترتيب نفسه في كل تجربة.',
    'في مثال 60 g حديد و30 g كبريت، تحتاج النسبة 7:4 إلى 52.5 g حديد؛ يتفاعل 30 g كبريت، ويبقى 7.5 g حديد، وتساوي كتلة المركب المحسوبة 82.5 g.',
  ]),
  platformCallout(
    'warning',
    'النقل الدقيق لقيمة 2.66 في ص35',
    'تظل 2.66 ظاهرة كما طُبعت في المصدر. حساب 32/12 هو 2.666…؛ والتقريب المعتاد إلى منزلتين عشريتين هو 2.67. أشرح الفرق بين نقل القيمة المطبوعة والنتيجة الحسابية، ولا أستبدل إحداهما بالأخرى بصمت. في الحسابات استخدم الكسر الدقيق 32/12 = 8/3.',
  ),
  platformCallout(
    'note',
    'ما الذي لا تستنتجه الرسوم؟',
    'الرسوم الجديدة داخل الدرس تعليمية من المنصة، مبنية على الصيغ والكتل المقروءة، وليست صور الكتاب الأصلية. مخطط العد لا يقرر حجم الذرات أو شكل الروابط، ومخطط الميزان لا يعيد تفاصيل جهاز غير مؤكدة. لا نخترع لوناً أو غازاً أو وحدة قياس لم يقرأها المصدر بوضوح.',
  ),
]

const bookQuestionContainer: FinalTest = {
  id: 'chem-u1-l5-book',
  lessonId: 'chem-u1-l5',
  origin: 'platform',
  status: 'source-verified',
  // Lookup container used to render source activities and teacher solutions; it is not another exam or bank.
  targetQuestionCount: { min: lesson5BookQuestionCount, max: lesson5BookQuestionCount },
  questions: [...bookActivitySolutions, ...bookQuestions],
}

const steps: LessonStep[] = [
  {
    id: 'atom-count-source', kind: 'source', title: 'ألاحظ وأستنتج: عدّ الذرات', attribution: 'textbook',
    source: source(['30'], 'ألاحظ وأستنتج — تفاعل حمض الخل وبيكربونات الصوديوم'),
    blocks: [
      quote('30', 'ألاحظ وأستنتج:', 'عدّ الذرات في التفاعل'),
      ...q('l5-observe-atoms'),
      { kind: 'interactive', interactiveId: 'lesson5-atom-count-lab', caption: 'تمرين تفاعلي جديد من المنصة، وتعداد الذرات فيه محسوب من الصيغ.' },
    ],
  },
  {
    id: 'atom-count-explanation', kind: 'deep-explanation', title: 'كيف تُحفظ ذرات كل عنصر؟', attribution: 'platform',
    source: source(['30', '31'], 'عدّ الذرات ومبدأ انحفاظها'),
    summary: 'افصل بين إعادة ترتيب الذرات وفقدانها، وقارن كل عنصر على حدة.',
    blocks: [
      prose('في هذا التفاعل تتبدل المواد: جزيئات المتفاعلات لا تبقى كما هي، لكن ذرات الكربون والهيدروجين والأكسجين والصوديوم يعاد ترتيبها لتكوين النواتج. نختبر الفكرة بفك الصيغ وجمع عدد ذرات كل عنصر على الطرفين.'),
      { kind: 'chemical-equation', reactants: ['CH3COOH', 'NaHCO3'], products: ['CH3COONa', 'H2O', 'CO2'], attribution: 'platform', caption: 'إعادة كتابة تعليمية للصيغ الظاهرة في نشاط ص30؛ ليست رسماً أصلياً من الكتاب.' },
      { kind: 'table', caption: 'حصيلة العد المحسوبة من الصيغ — إضافة من المنصة', attribution: 'platform',
        columns: [
          { key: 'element', header: 'العنصر', rowHeader: true },
          { key: 'reactants', header: 'المتفاعلات', numeric: true },
          { key: 'products', header: 'النواتج', numeric: true },
        ],
        rows: [
          { id: 'c', cells: { element: 'C', reactants: '3', products: '3' } },
          { id: 'h', cells: { element: 'H', reactants: '5', products: '5' } },
          { id: 'o', cells: { element: 'O', reactants: '5', products: '5' } },
          { id: 'na', cells: { element: 'Na', reactants: '1', products: '1' } },
        ],
        footnote: 'تعداد منصة من الصيغ، لا معلومات عن أحجام الذرات أو أشكال الجزيئات.',
      },
      platformCallout('note', 'خطأ شائع', 'لا يكفي أن يتساوى العدد الإجمالي لكل الذرات. يجب أن يتساوى عدد ذرات كل نوع عنصر على حدة؛ فلا تعوّض ذرة كربون ذرة أكسجين.'),
    ],
  },
  {
    id: 'mass-conservation-explanation', kind: 'deep-explanation', title: 'انحفاظ الكتلة: اختر حدود النظام أولاً', attribution: 'platform',
    source: source(['31', '32'], 'قانون انحفاظ الكتلة وتجربة الميزان'),
    summary: 'قراءة الميزان تتعلق بما يزنه الجهاز؛ أما الكتلة الكلية فتشمل كل مادة النظام.',
    blocks: [
      prose('قانون انحفاظ الكتلة يعني أن مجموع كتل المواد في النظام الكيميائي يبقى نفسه أثناء التفاعل. ما يتغير هو تركيب المواد وترتيب الذرات. قبل مقارنة رقمين، اسأل: ما المواد التي يزنها الجهاز؟ وهل عبر غاز أو سائل أو رذاذ حدود هذا النظام؟'),
      platformCallout('method', 'نظام مغلق', 'لا تعبر مادة حدود النظام أثناء التفاعل؛ إذا قسنا النظام كله قبل التفاعل وبعده، تكون الكتلتان متساويتين ضمن شروط النموذج والقياس.'),
      platformCallout('warning', 'نظام مفتوح', 'قد تدخل مادة من المحيط أو تخرج إليه. إذا غادر CO2 وعاء تفاعل مثلاً، قد تنخفض كتلة الوعاء وما بقي فوق الميزان؛ الغاز لم يختف. عند ضم الغاز إلى حساب النظام الأوسع، يبقى مجموع الكتلة محفوظاً.'),
      { kind: 'chemical-equation', reactants: ['CaO', '2HCl'], products: ['CaCl2', 'H2O'], attribution: 'platform', caption: 'معادلة موزونة للتفاعل المذكور؛ توضيح كيميائي من المنصة، لا قراءة أو معادلة منقولة عن الشكل.' },
      prose('تفاعل أكسيد الكالسيوم مع حمض كلور الماء في الشكل يبين النواتج CaCl2 وH2O، ولا يبرر اختراع غاز متصاعد أو تعميم انخفاض قراءة الميزان على كل تفاعل مفتوح.'),
    ],
  },
  {
    id: 'mass-source-experiment', kind: 'source', title: 'تجربة أكسيد الكالسيوم وحمض كلور الماء', attribution: 'textbook',
    source: source(['32'], 'ماذا ألاحظ؟ أقارن النتائج.'),
    blocks: [
      quote('32', 'أضيف باستخدام الملقط قطع أكسيد الكالسيوم إلى حمض كلور الماء. ماذا ألاحظ؟', 'ماذا ألاحظ؟'),
      ...q('l5-calcium-observation', 'l5-calcium-compare'),
      { kind: 'diagram', diagramId: 'lesson5-mass-boundary-lab', title: 'إعادة تمثيل قراءة الميزان',
        description: 'يعرض المصدر قراءة 125.100 قبل التفاعل وبعده، من دون وحدة ظاهرة. أُعيد تمثيل البيانات فقط؛ لا أعيد رسم جهاز الكتاب أو أدعي أن المحاكاة قاستها.',
        sourceRef: 'ص32 — بيانات معاد تمثيلها برسمة تعليمية من المنصة', attribution: 'platform' },
    ],
  },

  {
    id: 'mass-boundary-lab', kind: 'simulation', title: 'تفاعُل مع حدود النظام', attribution: 'platform',
    summary: 'قارن بيانات الكتاب بنموذج حسابي مستقل؛ لا تخلط المخرجات.',
    blocks: [
      prose('ابدأ بقراءة ص32 إذا أردت مراجعة 125.100 كما طُبعت. انتقل إلى النظام المفتوح أو المغلق لإجراء حساب بأرقام تدخلها أنت؛ تظهر مخرجات النموذج بوسم مستقل ولا تستعمل قراءة المصدر كمدخل.'),
      { kind: 'interactive', interactiveId: 'lesson5-mass-boundary-lab' },
    ],
  },
  {
    id: 'lead-sulfur-source', kind: 'source', title: 'بيانات تجارب الرصاص والكبريت', attribution: 'textbook',
    source: source(['32', '33'], 'جدول تكوين كبريتيد الرصاص وأسئلته'),
    blocks: [
      quote('33', 'أسجل النتائج في الجدول الآتي، وأكمل الفراغات بما يناسبها، ثم أجيب.', 'جدول تجارب الرصاص والكبريت'),
      ...q('l5-proust-table', 'l5-trial1-mass-ratio', 'l5-trial2-excess-sulfur', 'l5-trial2-mass-ratio', 'l5-trial3-mass-ratio', 'l5-trial3-excess-lead'),
    ],
  },
  {
    id: 'fixed-proportions-explanation', kind: 'deep-explanation', title: 'قانون النسب الثابتة: احسب ما تفاعل', attribution: 'platform',
    source: source(['33', '34'], 'قانون النسب الثابتة والبيانات التطبيقية'),
    summary: 'تركيب المركب نسبة كتلية ثابتة؛ المواد الزائدة تبقى خارج هذه النسبة.',
    blocks: [
      prose('يقارن قانون النسب الثابتة كتل العناصر التي دخلت فعلياً في المركب نفسه. إذا اختلف مقدار العينة، تتغير الكتل معاً بالمقياس نفسه، وتبقى نسبتها ثابتة. أما إذا بقي عنصر غير متفاعل، فكتلته الزائدة لا تصف تركيب المركب.'),
      procedure('خطوات التعامل مع مادة زائدة', [
        'اقرأ الكتلة الابتدائية والكتلة المتبقية لكل عنصر.',
        'احسب كتلة العنصر المستهلك بالطرح: الكتلة المتفاعلة = الكتلة الابتدائية − الكتلة المتبقية.',
        'اقسم الكتل المتفاعلة بالترتيب نفسه في جميع العينات.',
        'اختبر قانون انحفاظ الكتلة منفصلاً: كتلة الناتج + كتلة كل فائض = مجموع كتل البداية، إذا شمل النظام كله.',
      ]),
      { kind: 'formula', tex: '\\frac{10}{1.56} = 6.410256\\ldots \\approx 6.41', display: 'block', caption: 'نسبة الرصاص إلى الكبريت المتفاعلين في جدول المصدر', attribution: 'platform' },
      { kind: 'formula', tex: '\\frac{56}{32} = \\frac{28}{16} = \\frac{7}{4} = 1.75', display: 'block', caption: 'نسب الحديد إلى الكبريت في نشاط ص34', attribution: 'platform' },
      platformCallout('note', 'الكتلة الكلية أم تركيب المركب؟', 'الفائض يُستبعد من نسبة التركيب، لكنه لا يُستبعد من كتلة النظام. هذا الفرق يحل الالتباس بين قانوني لافوازييه وبروست.'),
    ],
  },
  {
    id: 'fixed-ratio-source-iron-sulfur', kind: 'source', title: 'نشاط الحديد والكبريت: جدول النسبة الكتلية', attribution: 'textbook',
    source: source(['34'], 'إكمال الجدول والاستنتاج'),
    blocks: [
      quote('34', 'أكمل الجدول الآتي، واستنتج النسبة الكتلية للتفاعل، ماذا تلاحظ؟', 'نشاط الحديد والكبريت'),
      ...q('l5-iron-sulfur-ratio-table', 'l5-iron-sulfur-60-30'),
    ],
  },
  {
    id: 'fixed-ratio-lab', kind: 'activity', title: 'طبّق النسبة واحسب الفائض', attribution: 'platform',
    summary: 'غيّر كتل البداية، وشاهد ما يستنتجه النموذج التناسبي.',
    blocks: [
      prose('يستخدم هذا النموذج حساب تناسب من بيانات الجدولين، لا محاكاة تفاعل مختبري ولا قراءة ميزان. غيّر الزوج أو الكتل المتاحة، ثم ميّز بين ما يدخل المركب وما يبقى زائداً.'),
      { kind: 'interactive', interactiveId: 'lesson5-fixed-ratio-lab' },
    ],
  },
  {
    id: 'law-summary-source', kind: 'source', title: 'خلاصة الدرس وأسئلة «أختبر نفسي»', attribution: 'textbook',
    source: source(['34', '35'], 'الخلاصة وأسئلة الدرس'),
    blocks: [
      quote('35', 'أختبر نفسي:', 'أسئلة الدرس'),
      ...q('l5-selftest-water-ratio', 'l5-selftest-atom-count', 'l5-selftest-mass', 'l5-selftest-carbon-table'),
    ],
  },
  {
    id: 'lesson5-summary', kind: 'summary', title: 'اربط القانونين قبل الاختبار', attribution: 'platform',
    blocks: [
      { kind: 'list', attribution: 'platform', items: [
        'قانون انحفاظ الكتلة: نقارن مجموع كتل النظام كله قبل التفاعل وبعده؛ نوسّع حدود الحساب إذا خرجت مادة أو دخلت.',
        'قانون النسب الثابتة: نقارن كتلة عنصر بكتلة عنصر آخر داخل المركب نفسه؛ لا نقارن الكتلة الكلية لعينتين مختلفتين.',
        'المادة المتبقية فائض غير متفاعل: لا تدخل في نسبة تركيب المركب، لكنها تبقى ضمن مجموع كتلة النظام.',
        'افكك الصيغ الكيميائية وعدّ كل عنصر على حدة؛ يظل نوع الذرات وعددها محفوظاً عند إعادة ترتيبها.',
        'انقل 2.66 كما طُبعت في الجدول؛ واكتب في شرح الحساب أن 32/12 = 2.666… وأن التقريب المعتاد إلى منزلتين هو 2.67.',
        'القراءة 125.100 معروضة من الكتاب بلا وحدة ظاهرة. مخرجات النموذج التفاعلي قيم حسابية مستقلة ومعلنة المصدر.',
      ] },
    ],
  },
  {
    id: 'final-test', kind: 'final-test', title: 'الاختبار النهائي الخاص بالدرس الخامس — 16 سؤالاً', attribution: 'platform',
    testId: finalTest.id, summary: 'اختبار جديد من 16 سؤالاً؛ تظهر التغذية الراجعة بعد إكمال جميع الأجزاء والتسليم.', blocks: [],
  },
]

export const chemistryLesson5: LessonDefinition = {
  id: 'chem-u1-l5',
  slug: 'mass-and-fixed-proportions',
  title: 'الدرس الخامس — انحفاظ الكتلة والنسب الثابتة',
  order: 5,
  status: 'source-verified',
  source: {
    pages: ['30', '31', '32', '33', '34', '35'].map((page) => ref(page)),
    verified: true,
    readability: {
      arabicText: 'partial',
      latinText: 'clear',
      equations: 'clear',
      numbers: 'partial',
      units: 'partial',
      tables: 'partial',
      diagrams: 'partial',
      experiments: 'clear',
      questions: 'partial',
      notes: 'The working transcript and numerical/table data for pages 30–35 were retained from the user-supplied pages. The original page image files are not available in this checkout, so a second pixel-level verification of every small caption/table cell is blocked. The value 125.100 is transcribed without an added unit. The printed 2.66 is preserved; calculations separately explain 32/12 = 2.666… and conventional two-decimal rounding to 2.67. Diagrams in this lesson are platform educational redraws, not textbook scans; any wording not retained verbatim is explicitly platform-authored rather than guessed.',
    },
  },
  summary: 'انحفاظ الكتلة في التفاعلات الكيميائية، وحدود النظام المفتوح والمغلق، وثبات النسب الكتلية للعناصر في المركب الواحد، وتمييز الفائض غير المتفاعل.',
  steps,
  tests: [bookQuestionContainer, finalTest],
}

/** Source-question IDs also include every child branch of the p35 table prompt. */
export const allLesson5BookQuestions: Question[] = [...bookActivitySolutions, ...bookQuestions]
