import type { Question } from '@/assessment/types'
import type { ContentBlock } from './schema'

/* ============================================================================
   Lesson 1 — «الذرّة والعنصر» — every textbook question, activity and worked
   example on pages 5–12, with a complete scientific solution.

   Rules followed here:
     * the prompt keeps the book's wording and required data;
     * `origin: 'textbook'` and a page reference are always set;
     * the answer is separated from the reasoning (`explanation`) and, where a
       calculation or a table is involved, the steps are also written as
       structured `solutionBlocks` so the teacher view shows a full solution;
     * platform practice is never mixed into this file.
   ========================================================================= */

const source = (page: string, item?: string) => ({ page, item })

/* Solution-block helpers — all platform-authored reasoning, never textbook text. */
const prose = (text: string): ContentBlock => ({ kind: 'paragraph', text, attribution: 'platform' })
const method = (text: string, title?: string): ContentBlock => ({
  kind: 'callout',
  tone: 'method',
  title,
  text,
  attribution: 'platform',
})
const formula = (tex: string, caption?: string): ContentBlock => ({
  kind: 'formula',
  tex,
  display: 'block',
  caption,
  attribution: 'platform',
})
const solutionTable = (
  caption: string,
  columns: Array<{ key: string; header: string; numeric?: boolean; rowHeader?: boolean }>,
  rows: Array<{ id: string; cells: Record<string, string> }>,
): ContentBlock => ({ kind: 'table', caption, columns, rows, attribution: 'platform' })

/* ---------------------------------------------------------------------------
 * Page 5 — «أقرأ وأستنتج»: capacities of K, L, M and N
 * ------------------------------------------------------------------------ */

const capacityQuestions: Question[] = [
  {
    id: 'book-p5-k',
    type: 'numerical',
    origin: 'textbook',
    source: source('5', 'أقرأ وأستنتج — السوية K'),
    prompt: 'أحسب العدد الأعظمي للإلكترونات في السوية الرئيسية الأولى K باستخدام العلاقة y = 2(n)².',
    acceptedAnswers: [2],
    hint: 'رقم السوية K هو n = 1. احسب المربع أولاً ثم اضربه في 2.',
    explanation:
      'السوية K هي الأولى، فرقمها n = 1. نعوّض: y = 2 × (1)² = 2 × 1 = 2 إلكتروناً. وهذا هو العدد المطبوع في الكتاب للسوية K.',
    solutionBlocks: [formula('y = 2(n)^2 \\;\\Longrightarrow\\; y = 2 \\times (1)^2 = 2', 'التعويض الكامل في السوية K')],
  },
  {
    id: 'book-p5-l',
    type: 'numerical',
    origin: 'textbook',
    source: source('5', 'أقرأ وأستنتج — السوية L'),
    prompt: 'أحسب العدد الأعظمي للإلكترونات في السوية الرئيسية الثانية L باستخدام العلاقة y = 2(n)².',
    acceptedAnswers: [8],
    hint: 'السوية L هي الثانية، فرقمها n = 2.',
    explanation:
      'السوية L هي الثانية، فرقمها n = 2. نعوّض: y = 2 × (2)² = 2 × 4 = 8 إلكترونات، وهو العدد المطبوع في الكتاب ويملأ به الطالب الجدول في صفحة 6.',
    solutionBlocks: [formula('y = 2(n)^2 \\;\\Longrightarrow\\; y = 2 \\times (2)^2 = 8', 'التعويض الكامل في السوية L')],
  },
  {
    id: 'book-p5-m',
    type: 'numerical',
    origin: 'textbook',
    source: source('5', 'أقرأ وأستنتج — السوية M'),
    prompt: 'أحسب عدد الإلكترونات الأعظمي في السوية الرئيسية الثالثة M: 2 × (3)² = ……',
    acceptedAnswers: [18],
    hint: 'احسب 3² أولاً (9)، ثم اضرب الناتج في 2.',
    explanation:
      'نحسب المربع أولاً: 3² = 9، ثم نضرب في 2: 2 × 9 = 18. إذن العدد الأعظمي لإلكترونات السوية M هو 18 إلكتروناً. لاحظ أن هذه سعة نظرية: الذرة لا تضع فيها 18 إلكتروناً إلا إذا كان لديها هذا العدد فعلاً.',
    solutionBlocks: [
      formula('2 \\times (3)^2 = 2 \\times 9 = 18', 'خطوتان: المربع ثم الضرب'),
      method(
        'لا تخلط بين السعة العظمى والعدد الفعلي. ذرة الصوديوم لها إلكترون واحد فقط في M، فتُكتب M(1) لا M(18).',
        'السعة ليست عدّاً فعلياً',
      ),
    ],
  },
  {
    id: 'book-p5-n',
    type: 'numerical',
    origin: 'textbook',
    source: source('5', 'أقرأ وأستنتج — السوية N'),
    prompt: 'أحسب عدد الإلكترونات الأعظمي في السوية الرئيسية الرابعة N: 2 × (4)² = ……',
    acceptedAnswers: [32],
    hint: 'احسب 4² أولاً (16)، ثم اضرب الناتج في 2.',
    explanation:
      'نحسب المربع أولاً: 4² = 16، ثم نضرب في 2: 2 × 16 = 32. إذن العدد الأعظمي لإلكترونات السوية N هو 32 إلكتروناً، وهو العدد نفسه الذي يظهر في جدول صفحة 6.',
    solutionBlocks: [formula('2 \\times (4)^2 = 2 \\times 16 = 32', 'التعويض الكامل في السوية N')],
  },
]

/* ---------------------------------------------------------------------------
 * Page 6 — completing the capacity table (K–O)
 * ------------------------------------------------------------------------ */

const capacityTableQuestion: Question = {
  id: 'book-p6-table',
  type: 'table-interpretation',
  origin: 'textbook',
  source: source('6', 'أكمل الجدول الآتي'),
  prompt: 'أكمل الجدول الآتي بالعدد الأعظمي للإلكترونات في السويات M وN وO.',
  table: {
    caption: 'جدول الكتاب: رقم السوية الرئيسية n والعدد الأعظمي للإلكترونات y',
    columns: [
      { key: 'y', header: 'العدد الأعظمي للإلكترونات y', numeric: true, rowHeader: true },
      { key: 'o', header: 'O', numeric: true },
      { key: 'n', header: 'N', numeric: true },
      { key: 'm', header: 'M', numeric: true },
      { key: 'l', header: 'L', numeric: true },
      { key: 'k', header: 'K', numeric: true },
    ],
    rows: [
      {
        id: 'n-row',
        cells: { y: 'رقم السوية الرئيسية n', o: '5', n: '4', m: '3', l: '2', k: '1' },
      },
      {
        id: 'y-row',
        cells: { y: 'عدد الإلكترونات الأعظمي y', o: '؟', n: '؟', m: '؟', l: '8', k: '2' },
      },
    ],
  },
  questions: [
    {
      id: 'book-p6-table-m',
      type: 'numerical',
      origin: 'textbook',
      source: source('6', 'أكمل الجدول — السوية M'),
      prompt: 'ما العدد الأعظمي للإلكترونات في السوية M (n = 3)؟',
      acceptedAnswers: [18],
      explanation: 'y = 2 × (3)² = 2 × 9 = 18.',
    },
    {
      id: 'book-p6-table-n',
      type: 'numerical',
      origin: 'textbook',
      source: source('6', 'أكمل الجدول — السوية N'),
      prompt: 'ما العدد الأعظمي للإلكترونات في السوية N (n = 4)؟',
      acceptedAnswers: [32],
      explanation: 'y = 2 × (4)² = 2 × 16 = 32.',
    },
    {
      id: 'book-p6-table-o',
      type: 'numerical',
      origin: 'textbook',
      source: source('6', 'أكمل الجدول — السوية O'),
      prompt: 'ما العدد الأعظمي للإلكترونات في السوية O (n = 5)؟',
      acceptedAnswers: [50],
      explanation: 'y = 2 × (5)² = 2 × 25 = 50.',
    },
  ],
  hint: 'استخدم n المطبوعة في الصف الأول، ثم طبّق y = 2(n)².',
  explanation:
    'الجدول مكتملاً: K = 2، L = 8، M = 18، N = 32، O = 50. نلاحظ أن السعة تزداد بسرعة لأنها تتناسب مع مربع رقم السوية: n = 5 تعطي 50 إلكتروناً.',
  solutionBlocks: [
    solutionTable(
      'الجدول مكتملاً (الحل)',
      [
        { key: 'level', header: 'السوية', rowHeader: true },
        { key: 'n', header: 'n', numeric: true },
        { key: 'work', header: 'التعويض' },
        { key: 'y', header: 'y', numeric: true },
      ],
      [
        { id: 'k', cells: { level: 'K', n: '1', work: '2 × (1)²', y: '2' } },
        { id: 'l', cells: { level: 'L', n: '2', work: '2 × (2)²', y: '8' } },
        { id: 'm', cells: { level: 'M', n: '3', work: '2 × (3)²', y: '18' } },
        { id: 'n', cells: { level: 'N', n: '4', work: '2 × (4)²', y: '32' } },
        { id: 'o', cells: { level: 'O', n: '5', work: '2 × (5)²', y: '50' } },
      ],
    ),
  ],
}

/* ---------------------------------------------------------------------------
 * Page 6 — worked example: sodium
 * ------------------------------------------------------------------------ */

const sodiumQuestion: Question = {
  id: 'book-p6-sodium',
  type: 'short-answer',
  origin: 'textbook',
  source: source('6', 'تطبيق محلول — الصوديوم'),
  prompt:
    'أكتب التوزع الإلكتروني على السويات الرئيسية لذرّة الصوديوم Na، إذا علمتَ أن عدد الإلكترونات فيها يساوي 11، وأوضّح ذلك بالرسم.',
  referenceAnswer: 'K(2), L(8), M(1) — أي 2-8-1، والمجموع 2 + 8 + 1 = 11 إلكتروناً.',
  rubric: [
    'ملء السوية الأقرب إلى النواة K أولاً بإلكترونين',
    'ملء السوية L بثمانية إلكترونات',
    'وضع الإلكترون الحادي عشر وحده في السوية M',
    'التحقق من أن مجموع الإلكترونات 11',
  ],
  explanation:
    'نبدأ من الداخل: السوية K سعتها 2 فنملؤها، ويتبقى 11 − 2 = 9 إلكترونات. السوية L سعتها 8 فنملؤها، ويتبقى 9 − 8 = 1 إلكترون واحد يوضع في السوية M. لذلك التوزيع K(2), L(8), M(1). أما الرسم فيُظهر نواة في المركز وثلاث حلقات: حلقة داخلية فيها نقطتان، ووسطى فيها ثماني نقاط، وخارجية فيها نقطة واحدة.',
  solutionBlocks: [
    method('نملأ السويات من الداخل إلى الخارج، ولا ننتقل إلى سوية قبل استكمال السعة المسموحة للسوية التي قبلها.', 'خطة الحل'),
    prose('الخطوة 1: K سعتها 2، فنضع 2. المتبقي: 11 − 2 = 9.'),
    prose('الخطوة 2: L سعتها 8، فنضع 8. المتبقي: 9 − 8 = 1.'),
    prose('الخطوة 3: المتبقي 1 يوضع في M. إذن M(1).'),
    formula('2 + 8 + 1 = 11', 'التحقق من مجموع الإلكترونات'),
    solutionTable(
      'توزيع إلكترونات الصوديوم',
      [
        { key: 'level', header: 'السوية', rowHeader: true },
        { key: 'n', header: 'n', numeric: true },
        { key: 'electrons', header: 'عدد الإلكترونات', numeric: true },
        { key: 'reason', header: 'سبب العدد' },
      ],
      [
        { id: 'k', cells: { level: 'K', n: '1', electrons: '2', reason: 'سعتها العظمى 2 فتمتلئ' } },
        { id: 'l', cells: { level: 'L', n: '2', electrons: '8', reason: 'سعتها العظمى 8 فتمتلئ' } },
        { id: 'm', cells: { level: 'M', n: '3', electrons: '1', reason: 'الإلكترون المتبقي وحده' } },
      ],
    ),
  ],
}

/* ---------------------------------------------------------------------------
 * Page 7 — the neon example (A, Z, electrons, distribution)
 * ------------------------------------------------------------------------ */

const neonQuestions: Question[] = [
  {
    id: 'book-p7-neon-a',
    type: 'numerical',
    origin: 'textbook',
    source: source('7', 'مثال — ذرة النيون (1)'),
    prompt: 'رمز ذرة النيون هو ²⁰₁₀Ne. ما قيمة العدد الكتلي A؟',
    acceptedAnswers: [20],
    explanation: 'العدد الكتلي يكتب أعلى يسار الرمز، وهو 20. وهو مجموع البروتونات والنيوترونات.',
  },
  {
    id: 'book-p7-neon-z',
    type: 'numerical',
    origin: 'textbook',
    source: source('7', 'مثال — ذرة النيون (2)'),
    prompt: 'رمز ذرة النيون هو ²⁰₁₀Ne. ما قيمة العدد الذري Z؟',
    acceptedAnswers: [10],
    explanation: 'العدد الذري يكتب أسفل يسار الرمز، وهو 10. وهو عدد البروتونات في نواة النيون.',
  },
  {
    id: 'book-p7-neon-e',
    type: 'numerical',
    origin: 'textbook',
    source: source('7', 'مثال — ذرة النيون (3)'),
    prompt: 'رمز ذرة النيون هو ²⁰₁₀Ne. ما عدد الإلكترونات في ذرة النيون المتعادلة؟',
    acceptedAnswers: [10],
    explanation:
      'في الذرة المتعادلة يساوي عدد الإلكترونات عدد البروتونات. وبما أن العدد الذري 10 فإن عدد البروتونات 10، وبالتالي عدد الإلكترونات 10.',
  },
  {
    id: 'book-p7-neon-dist',
    type: 'fill-blank',
    origin: 'textbook',
    source: source('7', 'مثال — ذرة النيون (4)'),
    prompt: 'أكتب التوزّع الإلكتروني لذرّة النيون على السويات الرئيسية.',
    template: 'التوزّع الإلكتروني للنيون: {b1}',
    blanks: [{ id: 'b1', acceptedAnswers: ['2-8', '2 - 8', '2ـ8'] }],
    hint: '10 إلكترونات: املأ K (2) ثم L (8).',
    explanation:
      'نملأ K بإلكترونين، ويتبقى 8 إلكترونات تمتلئ بها السوية L تماماً. لذلك التوزيع 2-8، والسوية الأخيرة ممتلئة بثمانية إلكترونات.',
  },
]

/* ---------------------------------------------------------------------------
 * Page 8 — the atom/ion table and its four questions
 * ------------------------------------------------------------------------ */

const ionTableQuestion: Question = {
  id: 'book-p8-table',
  type: 'short-answer',
  origin: 'textbook',
  source: source('8', 'ألاحظ واستنتج — الجدول'),
  prompt:
    'أكمل الجدول الآتي لذرّة الصوديوم وأيون الصوديوم وذرّة الكلور وأيون الكلور: عدد الإلكترونات، عدد البروتونات، والمجموع الجبري للشحنات.',
  material: [
    {
      kind: 'table',
      caption: 'جدول الكتاب: نماذج الذرات والأيونات (الحقول المطلوبة فارغة)',
      columns: [
        { key: 'symbol', header: 'الشكل / رمز النواة', rowHeader: true },
        { key: 'electrons', header: 'عدد الإلكترونات', numeric: true },
        { key: 'protons', header: 'عدد البروتونات', numeric: true },
        { key: 'sum', header: 'المجموع الجبري للشحنات' },
      ],
      rows: [
        { id: 'na', cells: { symbol: 'ذرة الصوديوم ²³₁₁Na', electrons: '؟', protons: '؟', sum: '؟' } },
        { id: 'na-ion', cells: { symbol: 'أيون الصوديوم ²³₁₁Na⁺', electrons: '؟', protons: '؟', sum: '؟' } },
        { id: 'cl', cells: { symbol: 'ذرة الكلور ³⁵₁₇Cl', electrons: '؟', protons: '؟', sum: '؟' } },
        { id: 'cl-ion', cells: { symbol: 'أيون الكلور ³⁵₁₇Cl⁻', electrons: '؟', protons: '؟', sum: '؟' } },
      ],
      attribution: 'textbook',
    },
  ],
  referenceAnswer:
    'ذرة Na: الإلكترونات 11، البروتونات 11، المجموع 0. أيون Na⁺: الإلكترونات 10، البروتونات 11، المجموع +1. ذرة Cl: الإلكترونات 17، البروتونات 17، المجموع 0. أيون Cl⁻: الإلكترونات 18، البروتونات 17، المجموع −1.',
  rubric: [
    'استخدام العدد الذري عدداً للبروتونات',
    'تساوي الإلكترونات والبروتونات في الذرتين المتعادلتين',
    'حساب الفرق الجبري بعد فقد الصوديوم إلكتروناً واكتساب الكلور إلكتروناً',
    'كتابة إشارة الشحنة مع العدد',
  ],
  explanation:
    'العدد الذري هو عدد البروتونات دائماً: 11 للصوديوم و17 للكلور. في الذرة المتعادلة يساوي عدد الإلكترونات عدد البروتونات فيكون المجموع صفراً. أيون الصوديوم فقد إلكتروناً واحداً فصار 10 إلكترونات مقابل 11 بروتوناً، أي فائض موجب مقداره 1. وأيون الكلور اكتسب إلكتروناً فصار 18 إلكتروناً مقابل 17 بروتوناً، أي فائض سالب مقداره 1.',
  solutionBlocks: [
    solutionTable(
      'الجدول مكتملاً (الحل)',
      [
        { key: 'symbol', header: 'الشكل', rowHeader: true },
        { key: 'electrons', header: 'الإلكترونات', numeric: true },
        { key: 'protons', header: 'البروتونات', numeric: true },
        { key: 'sum', header: 'المجموع الجبري' },
      ],
      [
        { id: 'na', cells: { symbol: 'ذرة الصوديوم', electrons: '11', protons: '11', sum: '0' } },
        { id: 'na-ion', cells: { symbol: 'أيون الصوديوم Na⁺', electrons: '10', protons: '11', sum: '+1' } },
        { id: 'cl', cells: { symbol: 'ذرة الكلور', electrons: '17', protons: '17', sum: '0' } },
        { id: 'cl-ion', cells: { symbol: 'أيون الكلور Cl⁻', electrons: '18', protons: '17', sum: '−1' } },
      ],
    ),
    formula('q = N_{p} - N_{e}', 'قاعدة الحساب: q الشحنة، Np عدد البروتونات، Ne عدد الإلكترونات'),
  ],
}

const ionTableSubQuestions: Question[] = [
  {
    id: 'book-p8-q1',
    type: 'short-answer',
    origin: 'textbook',
    source: source('8', 'السؤال 1'),
    prompt: 'أقارن بين المجموع الجبري للشّحنات في الجدول السابق. ماذا ألاحظ؟',
    referenceAnswer:
      'المجموع صفر في الذرتين المتعادلتين (Na وCl)، ويساوي +1 في أيون الصوديوم و−1 في أيون الكلور؛ أي أن الأيونات غير متعادلة كهربائياً.',
    rubric: [
      'ذكر أن الذرتين المتعادلتين مجموعهما صفر',
      'ذكر إشارة شحنة كل أيون وقيمتها',
      'الربط بين الفرق في عدد الإلكترونات والشحنة',
    ],
    explanation:
      'في ذرة الصوديوم وذرة الكلور يتساوى عدد الشحنات الموجبة (البروتونات) والسالبة (الإلكترونات)، فيكون المجموع صفراً. أما الأيون فعدد إلكتروناته لا يساوي عدد بروتوناته، لذلك يظهر مجموع جبري لا يساوي صفراً: +1 للصوديوم و−1 للكلور.',
    solutionBlocks: [
      method(
        'لا حكم على الشحنة من اسم الجسيم، بل من الفرق: بروتونات (+) ناقص إلكترونات (−).',
        'طريقة القراءة',
      ),
    ],
  },
  {
    id: 'book-p8-q2',
    type: 'short-answer',
    origin: 'textbook',
    source: source('8', 'السؤال 2'),
    prompt: 'ما الاختلاف بين عدد الإلكترونات في ذرّة الصوديوم وفي أيون الصوديوم؟',
    referenceAnswer:
      'ذرة الصوديوم لها 11 إلكتروناً، وأيون الصوديوم له 10 إلكترونات؛ أي أن الأيون فقد إلكتروناً واحداً.',
    rubric: ['ذكر العددين 11 و10', 'تحديد الفرق بأنه إلكترون واحد'],
    explanation:
      'العدد الذري للصوديوم 11، فالذرة المتعادلة فيها 11 إلكتروناً. ولأن رمز الأيون Na⁺ يحمل إشارة موجبة واحدة، فقد فقدت الذرة إلكتروناً واحداً، فأصبح عدد إلكتروناتها 10. لاحظ أن عدد البروتونات بقي 11.',
  },
  {
    id: 'book-p8-q3',
    type: 'short-answer',
    origin: 'textbook',
    source: source('8', 'السؤال 3'),
    prompt: 'أفسّر ما حدث لذرّة الصوديوم عندما تحولت لأيون الصوديوم.',
    referenceAnswer:
      'فقدت ذرة الصوديوم إلكتروناً واحداً من سويتها الأخيرة، فبقي فيها 11 بروتوناً و10 إلكترونات، فظهر فائض موجب مقداره +1 وتكوّن أيون Na⁺.',
    rubric: [
      'ذكر فقد إلكترون واحد',
      'ذكر ثبات عدد البروتونات',
      'ربط الفرق بين البروتونات والإلكترونات بالشحنة الموجبة',
    ],
    explanation:
      'فقدان الإلكترون (وهو سالب الشحنة) يُنقص الشحنة السالبة في الذرة، فيصبح عدد البروتونات الموجبة أكبر من عدد الإلكترونات بواحد. لذلك يكون المجموع الجبري +1، ويُكتب الرمز Na⁺. البروتونات لا تتغير، ولهذا يبقى العنصر صوديوم.',
    solutionBlocks: [
      formula('q = 11 - 10 = +1', 'حساب الشحنة بعد فقد إلكترون واحد: 11 بروتوناً و10 إلكترونات'),
    ],
  },
  {
    id: 'book-p8-q4',
    type: 'short-answer',
    origin: 'textbook',
    source: source('8', 'السؤال 4'),
    prompt: 'أكرّر ما سبق من أجل ذرّة الكلور وأيون الكلور.',
    referenceAnswer:
      'ذرة الكلور: 17 بروتوناً و17 إلكتروناً والمجموع صفر. أيون الكلور Cl⁻: اكتسبت الذرة إلكتروناً واحداً فصار عندها 18 إلكتروناً و17 بروتوناً، فظهر فائض سالب مقداره −1.',
    rubric: [
      'ذكر 17 بروتوناً في الحالتين',
      'ذكر انتقال الإلكترونات من 17 إلى 18',
      'الربط بين زيادة الإلكترونات والشحنة السالبة',
    ],
    explanation:
      'ذرة الكلور متعادلة لأن 17 بروتوناً تقابلها 17 إلكتروناً. عند اكتساب إلكترون واحد يصبح عدد الإلكترونات 18 مقابل 17 بروتوناً، فيزيد السالب على الموجب بمقدار 1، وتكون الشحنة −1 ويُكتب الرمز Cl⁻.',
    solutionBlocks: [
      formula('q = 17 - 18 = -1', 'حساب الشحنة بعد اكتساب إلكترون واحد: 17 بروتوناً و18 إلكتروناً'),
    ],
  },
]

/* ---------------------------------------------------------------------------
 * Page 9 — ion examples, fill-in-the-blank activity, Lewis table
 * ------------------------------------------------------------------------ */

const ionExamplesQuestion: Question = {
  id: 'book-p9-examples',
  type: 'short-answer',
  origin: 'textbook',
  source: source('9', 'أمثلة'),
  prompt:
    'اشرح كيف وصل كل من البوتاسيوم (19) والفلور (9) والكالسيوم (20) والأكسجين (8) إلى أيوناته K⁺ وF⁻ وCa²⁺ وO²⁻، مستعيناً بالتوزع الإلكتروني.',
  referenceAnswer:
    'البوتاسيوم 2-8-8-1 يفقد إلكتروناً واحداً فيصبح K⁺. الفلور 2-7 يكتسب إلكتروناً واحداً فيصبح F⁻. الكالسيوم 2-8-8-2 يفقد إلكترونين فيصبح Ca²⁺. الأكسجين 2-6 يكتسب إلكترونين فيصبح O²⁻. في الحالات الأربع يصبح في السوية الأخيرة ثمانية إلكترونات.',
  rubric: [
    'كتابة التوزع قبل التغيّر لكل عنصر',
    'ربط عدد الإلكترونات المفقودة أو المكتسبة بعدد إشارات الشحنة',
    'الربط بقاعدة الثمانية الإلكترونية',
  ],
  explanation:
    'الفكرة نفسها في الأمثلة الأربعة: الذرة تصل إلى ثمانية إلكترونات في سويتها الأخيرة. التي تبدو أقرب إلى الثمانية بفقد إلكترونات تفقدها (البوتاسيوم إلكتروناً، الكالسيوم إلكترونين)، والتي تبدو أقرب بالاكتساب تكتسبها (الفلور إلكتروناً، الأكسجين إلكترونين). وعدد الإلكترونات المفقودة أو المكتسبة هو عدد إشارات الشحنة نفسه.',
  solutionBlocks: [
    solutionTable(
      'الأمثلة الأربعة كما في الكتاب',
      [
        { key: 'element', header: 'العنصر', rowHeader: true },
        { key: 'z', header: 'العدد الذري', numeric: true },
        { key: 'dist', header: 'التوزع' },
        { key: 'way', header: 'طريقة الوصول إلى الثمانية' },
        { key: 'ion', header: 'الشحنة والرمز' },
      ],
      [
        { id: 'k', cells: { element: 'البوتاسيوم', z: '19', dist: '2-8-8-1', way: 'فقدان إلكترون واحد', ion: '1+ · K⁺' } },
        { id: 'f', cells: { element: 'الفلور', z: '9', dist: '2-7', way: 'اكتساب إلكترون واحد', ion: '1− · F⁻' } },
        { id: 'ca', cells: { element: 'الكالسيوم', z: '20', dist: '2-8-8-2', way: 'فقدان إلكترونين', ion: '2+ · Ca²⁺' } },
        { id: 'o', cells: { element: 'الأكسجين', z: '8', dist: '2-6', way: 'اكتساب إلكترونين', ion: '2− · O²⁻' } },
      ],
    ),
  ],
}

const ionBlankQuestions: Question[] = [
  {
    id: 'book-p9-blank-1',
    type: 'fill-blank',
    origin: 'textbook',
    source: source('9', 'نشاط — الفراغ 1'),
    prompt: 'أكمل الفراغين في الجملة كما في الكتاب.',
    template: 'تفقد ذرّة الفضة Ag إلكترونًا واحدًا فتتحوّل إلى {b1} موجب، نرمز له بالرمز {b2}.',
    blanks: [
      { id: 'b1', acceptedAnswers: ['أيون', 'ايون'] },
      { id: 'b2', acceptedAnswers: ['Ag⁺', 'Ag+', 'Ag^+'] },
    ],
    hint: 'فقد الإلكترونات السالبة يجعل الشحنة موجبة، وعدد الإشارات يساوي عدد الإلكترونات المفقودة.',
    explanation:
      'فقدان إلكترون واحد من ذرة الفضة يجعل عدد البروتونات أكبر من عدد الإلكترونات بواحد، فتتكوّن شحنة موجبة واحدة. لذلك تتحوّل الذرة إلى أيون موجب يُكتب Ag⁺ (إشارة واحدة لأن الإلكترون المفقود واحد).',
  },
  {
    id: 'book-p9-blank-2',
    type: 'fill-blank',
    origin: 'textbook',
    source: source('9', 'نشاط — الفراغ 2'),
    prompt: 'أكمل الفراغ في الجملة كما في الكتاب.',
    template: 'تتحوّل ذرّة البروم إلى أيون البروم Br⁻ عندما تكتسب {b1}.',
    blanks: [
      {
        id: 'b1',
        acceptedAnswers: ['إلكتروناً واحداً', 'الكتروناً واحداً', 'إلكترون واحد', 'الكترون واحد', 'إلكترونًا واحدًا', 'الكترونًا واحدًا'],
      },
    ],
    hint: 'إشارة سالبة واحدة تعني إلكتروناً واحداً مكتسباً.',
    explanation:
      'الإشارة − في Br⁻ تعني فائضاً سالباً مقداره شحنة إلكترون واحد. لذلك تكتسب ذرة البروم إلكتروناً واحداً، فيصبح لديها إلكترون أكثر من البروتونات، وتصبح الشحنة −1.',
  },
]

const lewisTableQuestion: Question = {
  id: 'book-p9-lewis-table',
  type: 'table-interpretation',
  origin: 'textbook',
  source: source('9', 'أكمل الجدول'),
  prompt:
    'أكمل جدول تمثيل لويس: التوزع الإلكتروني وتمثيل لويس لكل من النيتروجين (7) والفلور (9)، بعد أن عُبّئت أمثلة الليثيوم والبورون والكربون.',
  table: {
    caption: 'جدول لويس في الكتاب (الليثيوم والبورون والكربون مكتملة)',
    columns: [
      { key: 'label', header: 'العنصر', rowHeader: true },
      { key: 'f', header: 'الفلور · 9', numeric: true },
      { key: 'n', header: 'النيتروجين · 7', numeric: true },
      { key: 'c', header: 'الكربون · 6', numeric: true },
      { key: 'b', header: 'البورون · 5', numeric: true },
      { key: 'li', header: 'الليثيوم · 3', numeric: true },
    ],
    rows: [
      { id: 'number', cells: { label: 'عدده الذري', f: '9', n: '7', c: '6', b: '5', li: '3' } },
      { id: 'dist', cells: { label: 'توزعه الإلكتروني', f: '؟', n: '؟', c: '2-4', b: '2-3', li: '2-1' } },
      { id: 'lewis', cells: { label: 'تمثيل لويس للعنصر', f: '؟', n: '؟', c: '٤ نقاط في الجهات الأربع', b: '٣ نقاط', li: 'نقطة واحدة' } },
    ],
  },
  questions: [
    {
      id: 'book-p9-lewis-n',
      type: 'short-answer',
      origin: 'textbook',
      source: source('9', 'أكمل الجدول — النيتروجين'),
      prompt: 'ما التوزع الإلكتروني للنيتروجين (عدده الذري 7)، وكم إلكتروناً سطحياً له؟',
      referenceAnswer: 'التوزع 2-5، والإلكترونات السطحية 5.',
      rubric: ['ملء K بإلكترونين وL بخمسة', 'عدّ إلكترونات السوية الأخيرة'],
      explanation:
        'العدد الذري 7 يعني 7 إلكترونات. نملأ K بإلكترونين، فيتبقى 5 إلكترونات في L. إذن التوزع 2-5، وإلكترونات السطح هي الخمسة في السوية الأخيرة.',
    },
    {
      id: 'book-p9-lewis-f',
      type: 'short-answer',
      origin: 'textbook',
      source: source('9', 'أكمل الجدول — الفلور'),
      prompt: 'ما التوزع الإلكتروني للفلور (عدده الذري 9)، وكم إلكتروناً سطحياً له؟ وكيف يُكتب تمثيل لويس؟',
      referenceAnswer:
        'التوزع 2-7، والإلكترونات السطحية 7: ثلاثة أزواج ونقطة مفردة. يُرسم رمز F وتحوله سبع نقاط.',
      rubric: [
        'التوزع 2-7',
        'سبع نقاط لويس',
        'الازدواج في ثلاث جهات وبقاء نقطة مفردة',
      ],
      explanation:
        '9 إلكترونات: 2 في K و7 في L. إلكترونات السطح 7، فتُكتب سبع نقاط حول الرمز F: نضع النقاط فرادى في الجهات الأربع أولاً (4 نقاط)، ثم نكمل ازدواج ثلاث جهات، فتبقى نقطة واحدة مفردة.',
    },
  ],
  hint: 'التوزع يحدد عدد إلكترونات السطح؛ هي إلكترونات السوية الأخيرة فقط.',
  explanation:
    'الجدول مكتملاً: النيتروجين 2-5 (5 نقاط: زوج ونقطة مفردة في كل من ثلاث جهات، أي زوج واحد وثلاث نقاط)، والفلور 2-7 (7 نقاط: ثلاثة أزواج ونقطة مفردة).',
  solutionBlocks: [
    solutionTable(
      'الجدول مكتملاً (الحل)',
      [
        { key: 'element', header: 'العنصر', rowHeader: true },
        { key: 'z', header: 'العدد الذري', numeric: true },
        { key: 'dist', header: 'التوزع' },
        { key: 'surface', header: 'الإلكترونات السطحية', numeric: true },
      ],
      [
        { id: 'li', cells: { element: 'الليثيوم', z: '3', dist: '2-1', surface: '1' } },
        { id: 'b', cells: { element: 'البورون', z: '5', dist: '2-3', surface: '3' } },
        { id: 'c', cells: { element: 'الكربون', z: '6', dist: '2-4', surface: '4' } },
        { id: 'n', cells: { element: 'النيتروجين', z: '7', dist: '2-5', surface: '5' } },
        { id: 'f', cells: { element: 'الفلور', z: '9', dist: '2-7', surface: '7' } },
      ],
    ),
  ],
}

/* ---------------------------------------------------------------------------
 * Page 10 — Al/Mg/O activity and hydrogen isotopes
 * ------------------------------------------------------------------------ */

const alMgOQuestion: Question = {
  id: 'book-p10-al-mg-o',
  type: 'table-interpretation',
  origin: 'textbook',
  source: source('10', 'نشاط'),
  prompt: 'لدينا الذرّات ₈O و₁₂Mg و₁₃Al: ما عدد الإلكترونات السطحية في كلّ منها؟ ثم أكتب تمثيل لويس لها.',
  table: {
    caption: 'الذرات المعطاة في الكتاب (أعداد ذرية فقط)',
    columns: [
      { key: 'atom', header: 'الذرّة', rowHeader: true },
      { key: 'z', header: 'العدد الذري', numeric: true },
    ],
    rows: [
      { id: 'al', cells: { atom: '₁₃Al', z: '13' } },
      { id: 'mg', cells: { atom: '₁₂Mg', z: '12' } },
      { id: 'o', cells: { atom: '₈O', z: '8' } },
    ],
  },
  questions: [
    {
      id: 'book-p10-al-mg-o-surface',
      type: 'short-answer',
      origin: 'textbook',
      source: source('10', 'النشاط (1)'),
      prompt: 'ما عدد الإلكترونات السطحية في كل من ₁₃Al و₁₂Mg و₈O؟',
      referenceAnswer: 'الألمنيوم 3، والمغنزيوم 2، والأكسجين 6.',
      rubric: ['توزيع الإلكترونات بالاعتماد على العدد الذري', 'عدّ إلكترونات السوية الأخيرة فقط'],
      explanation:
        'لا يوجد عدد كتلي في الرموز، فالأعداد المعطاة أعداد ذرية، وهي عدد الإلكترونات في الذرة المتعادلة. Al: 13 ← 2-8-3 فالسطح 3. Mg: 12 ← 2-8-2 فالسطح 2. O: 8 ← 2-6 فالسطح 6.',
    },
    {
      id: 'book-p10-al-mg-o-lewis',
      type: 'short-answer',
      origin: 'textbook',
      source: source('10', 'النشاط (2)'),
      prompt: 'أكتب تمثيل لويس للذرات ₁₃Al و₁₂Mg و₈O.',
      referenceAnswer:
        'Al: ثلاث نقاط مفردة في ثلاث جهات. Mg: نقطتان مفردتان. O: ست نقاط (زوجان ونقطتان مفردتان).',
      rubric: [
        'ثلاث نقاط للألمنيوم',
        'نقطتان للمغنزيوم',
        'ست نقاط للأكسجين بترتيب: فرادى أولاً ثم أزواج',
      ],
      explanation:
        'تمثيل لويس يعرض إلكترونات السطح فقط. Al له 3 إلكترونات سطحية = 3 نقاط في ثلاث جهات. Mg له إلكترونان = نقطتان. O له 6 إلكترونات: نضع 4 فرادى في الجهات الأربع، ثم نزدوج جهتين، فيظهر زوجان ونقطتان مفردتان.',
    },
  ],
  explanation:
    'النشاط يختبر مهارتين: عدّ إلكترونات السطح من العدد الذري، ثم تحويل هذا العدد إلى نقاط لويس. المفتاح أن الأعداد في الرموز أعداد ذرية، لا كتلية.',
  solutionBlocks: [
    solutionTable(
      'التوزع والسطح ولويس (الحل)',
      [
        { key: 'atom', header: 'الذرّة', rowHeader: true },
        { key: 'dist', header: 'التوزع' },
        { key: 'surface', header: 'إلكترونات السطح', numeric: true },
        { key: 'lewis', header: 'تمثيل لويس' },
      ],
      [
        { id: 'al', cells: { atom: 'Al', dist: '2-8-3', surface: '3', lewis: 'ثلاث نقاط مفردة' } },
        { id: 'mg', cells: { atom: 'Mg', dist: '2-8-2', surface: '2', lewis: 'نقطتان مفردتان' } },
        { id: 'o', cells: { atom: 'O', dist: '2-6', surface: '6', lewis: 'زوجان ونقطتان مفردتان' } },
      ],
    ),
  ],
}

const hydrogenTableQuestion: Question = {
  id: 'book-p10-hydrogen-table',
  type: 'table-interpretation',
  origin: 'textbook',
  source: source('10', 'أملأ الجدول'),
  prompt: 'أملأ جدول نظائر الهيدروجين: العدد الكتلي والعدد الذري وعدد النيوترونات لكل من ¹₁H و²₁H و³₁H.',
  table: {
    caption: 'جدول نظائر الهيدروجين في الكتاب',
    columns: [
      { key: 'property', header: 'الخاصية', rowHeader: true },
      { key: 'h1', header: '¹₁H' },
      { key: 'h2', header: '²₁H' },
      { key: 'h3', header: '³₁H' },
    ],
    rows: [
      { id: 'a', cells: { property: 'العدد الكتلي', h1: '؟', h2: '؟', h3: '؟' } },
      { id: 'z', cells: { property: 'العدد الذري', h1: '؟', h2: '؟', h3: '؟' } },
      { id: 'n', cells: { property: 'عدد النيوترونات', h1: '؟', h2: '؟', h3: '؟' } },
    ],
  },
  questions: [
    {
      id: 'book-p10-hydrogen-a',
      type: 'short-answer',
      origin: 'textbook',
      source: source('10', 'الجدول — العدد الكتلي'),
      prompt: 'ما الأعداد الكتلية لنظائر الهيدروجين الثلاثة ¹₁H و²₁H و³₁H بالترتيب؟',
      referenceAnswer: '1 و2 و3 على الترتيب.',
      rubric: ['قراءة العدد العلوي في كل رمز'],
      explanation: 'العدد الكتلي مكتوب أعلى الرمز: 1 للهيدروجين العادي، 2 للديوتيريوم، 3 للتريتيوم.',
    },
    {
      id: 'book-p10-hydrogen-z',
      type: 'short-answer',
      origin: 'textbook',
      source: source('10', 'الجدول — العدد الذري'),
      prompt: 'ما الأعداد الذرية لنظائر الهيدروجين الثلاثة؟',
      referenceAnswer: '1 في الحالات الثلاث؛ لأنها ذرات العنصر نفسه.',
      rubric: ['قراءة العدد السفلي', 'الربط بين ثبات العدد الذري وثبات العنصر'],
      explanation:
        'العدد الذري مكتوب أسفل الرمز، وهو 1 في النظائر الثلاثة. ثباته هو سبب اعتبارها ذرات العنصر نفسه (هيدروجين)، لا عناصر مختلفة.',
    },
    {
      id: 'book-p10-hydrogen-n',
      type: 'short-answer',
      origin: 'textbook',
      source: source('10', 'الجدول — عدد النيوترونات'),
      prompt: 'ما أعداد النيوترونات في نظائر الهيدروجين الثلاثة بالترتيب ¹₁H و²₁H و³₁H؟',
      referenceAnswer: '0 و1 و2 على الترتيب: الهيدروجين العادي 0، الديوتيريوم 1، التريتيوم 2.',
      rubric: ['طرح العدد الذري من العدد الكتلي', 'مطابقة الترتيب القرائي للجدول'],
      explanation:
        'عدد النيوترونات = العدد الكتلي − العدد الذري. للترتيب ¹H ثم ²H ثم ³H: 1 − 1 = 0، ثم 2 − 1 = 1، ثم 3 − 1 = 2. لاحظ أن الهيدروجين العادي لا نيوترونات في نواته.',
    },
  ],
  hint: 'عدد النيوترونات = العدد الكتلي − العدد الذري.',
  explanation:
    'الجدول مكتملاً بالترتيب القرائي للأعمدة (¹H ثم ²H ثم ³H): الأعداد الكتلية 1، 2، 3؛ والأعداد الذرية 1، 1، 1؛ والنيوترونات 0، 1، 2.',
  solutionBlocks: [
    solutionTable(
      'الجدول مكتملاً (الحل)',
      [
        { key: 'property', header: 'الخاصية', rowHeader: true },
        { key: 'h1', header: '¹₁H' },
        { key: 'h2', header: '²₁H' },
        { key: 'h3', header: '³₁H' },
      ],
      [
        { id: 'a', cells: { property: 'العدد الكتلي', h1: '1', h2: '2', h3: '3' } },
        { id: 'z', cells: { property: 'العدد الذري', h1: '1', h2: '1', h3: '1' } },
        { id: 'n', cells: { property: 'عدد النيوترونات', h1: '0', h2: '1', h3: '2' } },
      ],
    ),
  ],
}

const hydrogenQuestions: Question[] = [
  {
    id: 'book-p10-q1',
    type: 'short-answer',
    origin: 'textbook',
    source: source('10', 'أسئلة — السؤال 1'),
    prompt: 'ما أوجه الشبه والاختلاف بين نوى ذرّات عنصر الهيدروجين؟',
    referenceAnswer:
      'الشبه: كل نواة تحتوي بروتوناً واحداً، فالعدد الذري 1 في الحالات الثلاث. الاختلاف: عدد النيوترونات (0 و1 و2)، وبالتالي العدد الكتلي (1 و2 و3).',
    rubric: ['ذكر بروتون واحد مشترك', 'ذكر اختلاف عدد النيوترونات', 'ربط ذلك بالعدد الكتلي'],
    explanation:
      'نوى نظائر الهيدروجين الثلاثة كلها تحتوي بروتوناً واحداً، ولهذا تبقى العنصر نفسه. أما النيوترونات فتختلف: صفر في الهيدروجين العادي، وواحد في الديوتيريوم، واثنان في التريتيوم. الاختلاف في مجموع البروتونات والنيوترونات هو ما يجعل الأعداد الكتلية 1 و2 و3.',
  },
  {
    id: 'book-p10-q2',
    type: 'short-answer',
    origin: 'textbook',
    source: source('10', 'أسئلة — السؤال 2'),
    prompt: 'أيّ الذرّات لها كتلة أكبر؟',
    referenceAnswer:
      'التريتيوم ³₁H؛ لأنه يضم أكبر عدد من النيوترونات (2) مع البروتون الواحد، فيكون عدده الكتلي 3 وهو الأكبر.',
    rubric: ['اختيار التريتيوم', 'تعليل بزيادة عدد النيوترونات/العدد الكتلي'],
    explanation:
      'كتلة النواة تتأتى أساساً من البروتونات والنيوترونات. التريتيوم له بروتون ونيوترونان، فعدده الكتلي 3، وهو أكبر من 2 في الديوتيريوم ومن 1 في الهيدروجين العادي. لذلك التريتيوم هو الأثقل.',
  },
  {
    id: 'book-p10-q3',
    type: 'short-answer',
    origin: 'textbook',
    source: source('10', 'أسئلة — السؤال 3'),
    prompt: 'هل تختلف بخصائصها الفيزيائية؟ وهل تتماثل بالخصائص الكيميائية؟',
    referenceAnswer:
      'نعم تختلف في الخصائص الفيزيائية، أهمها الكتلة. وتتماثل في الخصائص الكيميائية لأن الخصائص الكيميائية تعتمد على الإلكترونات، وعدد إلكترونات النظائر الثلاثة واحد.',
    rubric: [
      'ذكر اختلاف الخصائص الفيزيائية (الكتلة)',
      'ربط التماثل الكيميائي بعدد الإلكترونات نفسه',
      'ذكر أن العدد الذري ثابت',
    ],
    explanation:
      'الخصائص الفيزيائية مثل الكتلة تتأثر بعدد النيوترونات، فيختلف التريتيوم عن الهيدروجين العادي في كتلته. أما التفاعل الكيميائي فيحكمه ترتيب الإلكترونات، وعدد إلكترونات النظائر الثلاثة واحد (إلكترون واحد)، ولهذا تتشابه كيميائياً. هذا هو المعنى المطبوع في صفحة 11: تتماثل بالعدد الذري وتختلف بالعدد الكتلي.',
  },
]

/* ---------------------------------------------------------------------------
 * Page 11 — oxygen isotopes table
 * ------------------------------------------------------------------------ */

const oxygenTableQuestion: Question = {
  id: 'book-p11-oxygen-table',
  type: 'table-interpretation',
  origin: 'textbook',
  source: source('11', 'نشاط — أملأ الجدول'),
  prompt: 'أملأ جدول نظائر الأكسجين: العدد الكتلي والعدد الذري وعدد النيوترونات لكل من ¹⁶O و¹⁷O و¹⁸O.',
  table: {
    caption: 'جدول نظائر الأكسجين في الكتاب',
    columns: [
      { key: 'property', header: 'الخاصية', rowHeader: true },
      { key: 'o16', header: '¹⁶O' },
      { key: 'o17', header: '¹⁷O' },
      { key: 'o18', header: '¹⁸O' },
    ],
    rows: [
      { id: 'a', cells: { property: 'العدد الكتلي', o16: '؟', o17: '؟', o18: '؟' } },
      { id: 'z', cells: { property: 'العدد الذري', o16: '؟', o17: '؟', o18: '؟' } },
      { id: 'n', cells: { property: 'عدد النيوترونات', o16: '؟', o17: '؟', o18: '؟' } },
    ],
  },
  questions: [
    {
      id: 'book-p11-oxygen-a',
      type: 'short-answer',
      origin: 'textbook',
      source: source('11', 'الجدول — العدد الكتلي'),
      prompt: 'ما الأعداد الكتلية لنظائر الأكسجين ¹⁶O و¹⁷O و¹⁸O؟',
      referenceAnswer: '16 و17 و18.',
      rubric: ['قراءة العدد العلوي'],
      explanation: 'العدد العلوي في كل رمز هو العدد الكتلي: 16 و17 و18.',
    },
    {
      id: 'book-p11-oxygen-z',
      type: 'short-answer',
      origin: 'textbook',
      source: source('11', 'الجدول — العدد الذري'),
      prompt: 'ما العدد الذري لنظائر الأكسجين الثلاثة؟',
      referenceAnswer: '8 في الحالات الثلاث.',
      rubric: ['قراءة العدد السفلي', 'ربط ثباته بثبات العنصر'],
      explanation: 'العدد السفلي 8 في الرموز الثلاثة، وهو عدد البروتونات في نواة الأكسجين. ثباته يجعل النظائر الثلاثة أكسجين.',
    },
    {
      id: 'book-p11-oxygen-n',
      type: 'short-answer',
      origin: 'textbook',
      source: source('11', 'الجدول — عدد النيوترونات'),
      prompt: 'ما أعداد النيوترونات في ¹⁶O و¹⁷O و¹⁸O؟',
      referenceAnswer: '8 و9 و10 على الترتيب.',
      rubric: ['طرح العدد الذري من العدد الكتلي لكل نظير'],
      explanation:
        'نطرح العدد الذري 8 من كل عدد كتلي: 16 − 8 = 8، و17 − 8 = 9، و18 − 8 = 10. الاختلاف في النيوترونات هو ما يميز النظائر.',
    },
  ],
  hint: 'العدد الذري واحد (8) في النظائر الثلاثة، والاختلاف كله في النيوترونات.',
  explanation:
    'الجدول مكتملاً: ¹⁶O (A=16, Z=8, n=8)، ¹⁷O (A=17, Z=8, n=9)، ¹⁸O (A=18, Z=8, n=10).',
  solutionBlocks: [
    solutionTable(
      'الجدول مكتملاً (الحل)',
      [
        { key: 'property', header: 'الخاصية', rowHeader: true },
        { key: 'o16', header: '¹⁶O' },
        { key: 'o17', header: '¹⁷O' },
        { key: 'o18', header: '¹⁸O' },
      ],
      [
        { id: 'a', cells: { property: 'العدد الكتلي', o16: '16', o17: '17', o18: '18' } },
        { id: 'z', cells: { property: 'العدد الذري', o16: '8', o17: '8', o18: '8' } },
        { id: 'n', cells: { property: 'عدد النيوترونات', o16: '8', o17: '9', o18: '10' } },
      ],
    ),
  ],
}

/* ---------------------------------------------------------------------------
 * Page 12 — «أختبر نفسي» (the six true/false, five choice, four Lewis)
 * ------------------------------------------------------------------------ */

const trueFalse: Question[] = [
  {
    id: 'book-tf-1',
    type: 'true-false',
    origin: 'textbook',
    source: source('12', 'أختبر نفسي — السؤال الأول (1)'),
    prompt: 'الذرّة التي تخسر إلكتروناً تصبح أيوناً موجباً.',
    correctAnswer: true,
    explanation:
      'صح. خسارة إلكترون سالب تُنقص مقدار الشحنة السالبة بينما يبقى عدد البروتونات الموجبة ثابتاً، فيصبح المجموع الجبري للشحنات موجباً.',
  },
  {
    id: 'book-tf-2',
    type: 'true-false',
    origin: 'textbook',
    source: source('12', 'أختبر نفسي — السؤال الأول (2)'),
    prompt: 'الأيونات معتدلة كهربائياً.',
    correctAnswer: false,
    explanation:
      'غلط. الأيون جسيم مشحون لأن عدد إلكتروناته لا يساوي عدد بروتوناته؛ يكون موجباً عند فقد الإلكترونات وسالباً عند اكتسابها. المتعادل هو الذرة، لا الأيون.',
  },
  {
    id: 'book-tf-3',
    type: 'true-false',
    origin: 'textbook',
    source: source('12', 'أختبر نفسي — السؤال الأول (3)'),
    prompt: 'الذرّة التي تكتسب إلكتروناً تصبح أيوناً سالباً.',
    correctAnswer: true,
    explanation:
      'صح. الإلكترون المكتسب يحمل شحنة سالبة؛ لذلك يصبح عدد الشحنات السالبة أكبر من عدد الشحنات الموجبة، فيكون الأيون سالباً.',
  },
  {
    id: 'book-tf-4',
    type: 'true-false',
    origin: 'textbook',
    source: source('12', 'أختبر نفسي — السؤال الأول (4)'),
    prompt: 'النظائر هي ذرّات متماثلة بالعدد الكتلي ومختلفة بالعدد الذري.',
    correctAnswer: false,
    explanation:
      'غلط، والعبارة معكوسة. نظائر العنصر الواحد متماثلة في العدد الذري (عدد البروتونات) ومختلفة في عدد النيوترونات، ولذلك تختلف في العدد الكتلي. تغيير العدد الذري يغيّر العنصر نفسه.',
  },
  {
    id: 'book-tf-5',
    type: 'true-false',
    origin: 'textbook',
    source: source('12', 'أختبر نفسي — السؤال الأول (5)'),
    prompt: 'العدد الأعظمي للإلكترونات في السويّة الرئيسية الثالثة 18.',
    correctAnswer: true,
    explanation:
      'صح. نعوّض n = 3 في العلاقة y = 2(n)² فنحصل على y = 2 × 3² = 2 × 9 = 18 إلكتروناً.',
  },
  {
    id: 'book-tf-6',
    type: 'true-false',
    origin: 'textbook',
    source: source('12', 'أختبر نفسي — السؤال الأول (6)'),
    prompt: 'تمتلىء السويّة الطاقية الرئيسية الأولى K بثلاثة إلكترونات.',
    correctAnswer: false,
    explanation:
      'غلط. للسوية K الرقم n = 1، ومن العلاقة y = 2(n)² يكون عددها الأعظمي 2 × 1² = 2 إلكترون فقط. الإلكترون الثالث يبدأ السوية التالية.',
  },
]

const multipleChoice: Question[] = [
  {
    id: 'book-mc-1',
    type: 'multiple-choice',
    selection: 'single',
    origin: 'textbook',
    source: source('12', 'أختبر نفسي — السؤال الثاني (1)'),
    prompt: 'النظائر هي ذرّات متماثلة بالعدد:',
    options: [
      { id: 'a', label: 'الكتلي.' },
      { id: 'b', label: 'الذرّي.' },
      { id: 'c', label: 'الكتلي والذرّي معاً.' },
      { id: 'd', label: 'النيوترونات.' },
    ],
    correctOptionIds: ['b'],
    explanation:
      'الإجابة b: الذرّي. ثبات عدد البروتونات يحافظ على هوية العنصر، أما اختلاف عدد النيوترونات فيغيّر العدد الكتلي ويُنتج نظائر مختلفة.',
  },
  {
    id: 'book-mc-2',
    type: 'multiple-choice',
    selection: 'single',
    origin: 'textbook',
    source: source('12', 'أختبر نفسي — السؤال الثاني (2)'),
    prompt: 'إذا فقدت الذرّة إلكتروناً أو أكثر أصبحت:',
    options: [
      { id: 'a', label: 'أيون موجب.' },
      { id: 'b', label: 'أيون سالب.' },
      { id: 'c', label: 'معتدلة.' },
      { id: 'd', label: 'نظيراً.' },
    ],
    correctOptionIds: ['a'],
    explanation:
      'الإجابة a: أيون موجب؛ لأن فقد الشحنة السالبة يجعل عدد البروتونات الموجبة أكبر من عدد الإلكترونات. أما النظير فينتج من اختلاف النيوترونات، لا الإلكترونات.',
  },
  {
    id: 'book-mc-3',
    type: 'multiple-choice',
    selection: 'single',
    origin: 'textbook',
    source: source('12', 'أختبر نفسي — السؤال الثاني (3)'),
    prompt: 'في تمثيل لويس تُكتب حول رمز الذرة نقاط عددها يساوي:',
    options: [
      { id: 'a', label: 'جميع الإلكترونات.' },
      { id: 'b', label: 'الإلكترونات السطحية فقط.' },
      { id: 'c', label: 'البروتونات.' },
      { id: 'd', label: 'النيوترونات.' },
    ],
    correctOptionIds: ['b'],
    explanation:
      'الإجابة b: الإلكترونات السطحية فقط، أي إلكترونات السوية الأخيرة التي ترتبط بالسلوك الكيميائي للذرة. إلكترونات السويات الداخلية لا تُرسم.',
  },
  {
    id: 'book-mc-4',
    type: 'multiple-choice',
    selection: 'single',
    origin: 'textbook',
    source: source('12', 'أختبر نفسي — السؤال الثاني (4)'),
    prompt: 'الذرّة ذات التوزيع الإلكتروني وفق نظرية بور (2-8-6) هي:',
    options: [
      { id: 'a', label: '₆C' },
      { id: 'b', label: '₁₆S' },
      { id: 'c', label: '₁₀Ne' },
      { id: 'd', label: '₈O' },
    ],
    correctOptionIds: ['b'],
    explanation:
      'الإجابة b: ₁₆S. مجموع الإلكترونات = 2 + 8 + 6 = 16، وفي الذرة المتعادلة يساوي عدد الإلكترونات العدد الذري.',
  },
  {
    id: 'book-mc-5',
    type: 'multiple-choice',
    selection: 'single',
    origin: 'textbook',
    source: source('12', 'أختبر نفسي — السؤال الثاني (5)'),
    prompt: 'إذا كان العدد الذرّي للفوسفور 15 فيكون عدد الإلكترونات في السويّة الرئيسيّة الثالثة M هو:',
    options: [
      { id: 'a', label: '2' },
      { id: 'b', label: '5' },
      { id: 'c', label: '6' },
      { id: 'd', label: '7' },
    ],
    correctOptionIds: ['b'],
    explanation:
      'الإجابة b: 5. نوزّع 15 إلكتروناً من الداخل إلى الخارج: K(2)، ثم L(8)، ويبقى 15 − 10 = 5 إلكترونات في M.',
  },
]

const lewisAnswers = [
  {
    id: 'c',
    atom: '₆C',
    distribution: '2-4',
    lewis: 'أربع نقاط منفردة، نقطة في كل جهة حول C.',
    surface: 4,
    atomic: 6,
  },
  {
    id: 'he',
    atom: '₂He',
    distribution: '2',
    lewis: 'نقطتان فقط، لأن السوية K هي السوية الأخيرة وتتسع لإلكترونين. تُكتب النقطتان في كثير من المراجع زوجاً واحداً في جهة واحدة، ويجوز توزيعهما على جهتين باتباع قاعدة الفرادى؛ المقصود في الحالتين إلكترونان سطحيان لا أكثر.',
    surface: 2,
    atomic: 2,
  },
  {
    id: 'ar',
    atom: '₁₈Ar',
    distribution: '2-8-8',
    lewis: 'ثماني نقاط حول Ar، زوج في كل جهة.',
    surface: 8,
    atomic: 18,
  },
  {
    id: 'o',
    atom: '₈O',
    distribution: '2-6',
    lewis: 'ست نقاط حول O: زوجان ونقطتان منفردتان.',
    surface: 6,
    atomic: 8,
  },
] as const

const lewisQuestions: Question[] = lewisAnswers.map(
  ({ id, atom, distribution, lewis, surface, atomic }): Question => ({
    id: `book-lewis-${id}`,
    type: 'short-answer',
    origin: 'textbook',
    source: source('12', 'أختبر نفسي — السؤال الثالث'),
    prompt: `اكتب التوزع الإلكتروني ثم تمثيل لويس للذرّة ${atom}.`,
    referenceAnswer: `التوزع الإلكتروني: ${distribution}. تمثيل لويس: ${lewis}`,
    rubric: [
      'توزيع العدد الكامل للإلكترونات بدءاً من السوية الداخلية',
      'تمثيل إلكترونات السوية الأخيرة فقط بنقاط لويس',
      'وضع النقاط منفردة قبل بدء الازدواج',
    ],
    explanation: `نقرأ العدد الذري بوصفه عدد الإلكترونات في الذرة المعتمدة، فنملأ السويات بالتتابع. النتيجة ${distribution}، وعدد إلكترونات السطح ${surface}، لذلك ${lewis} التحقق: مجموع إلكترونات التوزع = ${atomic}.`,
    solutionBlocks: [
      solutionTable(
        `خطوات حل ${atom}`,
        [
          { key: 'step', header: 'الخطوة', rowHeader: true },
          { key: 'value', header: 'القيمة' },
        ],
        [
          { id: 'z', cells: { step: 'العدد الذري = عدد البروتونات', value: String(atomic) } },
          { id: 'e', cells: { step: 'عدد الإلكترونات في الذرة المتعادلة', value: String(atomic) } },
          { id: 'dist', cells: { step: 'التوزع الإلكتروني', value: distribution } },
          { id: 'surface', cells: { step: 'إلكترونات السوية الأخيرة', value: String(surface) } },
          { id: 'lewis', cells: { step: 'تمثيل لويس', value: lewis } },
        ],
      ),
    ],
  }),
)

/* ---------------------------------------------------------------------------
 * Public collections
 * ------------------------------------------------------------------------ */

/** Activities, worked examples and table exercises across pages 5–11. */
export const bookActivitySolutions: Question[] = [
  ...capacityQuestions,
  capacityTableQuestion,
  sodiumQuestion,
  ...neonQuestions,
  ionTableQuestion,
  ...ionTableSubQuestions,
  ionExamplesQuestion,
  ...ionBlankQuestions,
  lewisTableQuestion,
  alMgOQuestion,
  hydrogenTableQuestion,
  ...hydrogenQuestions,
  oxygenTableQuestion,
]

/** «أختبر نفسي» on page 12, preserved in the printed order. */
export const bookQuestions: Question[] = [...trueFalse, ...multipleChoice, ...lewisQuestions]
