import type { FinalTest, Question } from '@/assessment/types'
import type { ContentBlock, TableColumnSpec, TableRowSpec } from './schema'
import type { Lesson5ObjectiveId } from './lesson5SourceLedger'

/**
 * Verbatim textbook prompts, activities, experiment, tables and «أختبر نفسي»
 * questions for Lesson 5 (printed pages 30–35), audited against the six
 * supplied textbook page images.
 *
 * Fidelity notes:
 * - Page 33 prints «بقي 8g من الكبريت» for trial (3); the page-32 figure labels
 *   the 8 g leftover «رصاص متبقّي». The printed prompt is preserved verbatim
 *   and the misprint is flagged in a platform note and in the solution.
 * - Page 35 prints `32/12 = 2.66`; the value is preserved as printed and the
 *   solution separates it from the exact `2.666…` (conventionally 2.67).
 * Every question carries `objectiveId`, a non-leaking `hint`, an explanation,
 * and step-by-step platform-authored `solutionBlocks`.
 */
const page = (number: string, item: string) => ({ page: number, item })
const procedure = (items: string[], title = 'خطوات التفكير والحل'): ContentBlock => ({
  kind: 'procedure', title, items, attribution: 'platform',
})
const math = (tex: string, caption?: string): ContentBlock => ({
  kind: 'formula', tex, display: 'block', caption, attribution: 'platform',
})
const explanationBlock = (text: string): ContentBlock => ({ kind: 'paragraph', text, attribution: 'platform' })

function shortAnswer(
  id: string,
  sourcePage: string,
  item: string,
  prompt: string,
  referenceAnswer: string,
  steps: string[],
  options: {
    extra?: ContentBlock[]
    rubric?: string[]
    material?: ContentBlock[]
    objectiveId: Lesson5ObjectiveId
    hint: string
  },
): Question {
  return {
    id,
    type: 'short-answer',
    origin: 'textbook',
    source: page(sourcePage, item),
    objectiveId: options.objectiveId,
    hint: options.hint,
    prompt,
    ...(options.material ? { material: options.material } : {}),
    referenceAnswer,
    explanation: 'الحل والتعليل من إعداد المنصة، مع الفصل بين البيانات المطبوعة والاستنتاج الحسابي. لا تُعرض الإجابة للطالب أثناء نشاطه؛ تظهر في منطقة المعلم.',
    rubric: options.rubric ?? steps,
    solutionBlocks: [procedure(steps), ...(options.extra ?? [])],
  }
}

/** Reference cards for printed figures whose informational content is textual. */
export const lesson5Figures = {
  enrichmentPhotos: {
    kind: 'diagram',
    diagramId: 'book-l5-p31-enrichment',
    title: 'مرجع صورتَي «إثراء» (ص31)',
    description:
      'في الصفحة 31 صورتان فوتوغرافيتان داخل إطار «إثراء»: ملعقة خشبية تحوي مسحوقاً أبيض وبجانبها كمية صغيرة منه، وتحت الصورتين التعليق المطبوع «بيكربونات الصوديوم»؛ وصحن فيه قطعتان من حلوى جاهزة مزينة بالمكسرات. الصورتان توضيحيتان لحياة يومية ولا تحملان قياساً أو بياناً عددياً.',
    sourceRef: 'الكتاب المدرسي — الصفحة 31 — صورتا «إثراء»',
    attribution: 'textbook',
  },
  lavoisier: {
    kind: 'diagram',
    diagramId: 'book-l5-p32-lavoisier',
    title: 'مرجع بطاقة أنطوان لافوازييه (ص32)',
    description:
      'إلى جانب صندوق «أستنتجُ» في الصفحة 32 صورة مرسومة للعالم أنطوان لافوازييه، وتحت الصورة النص المطبوع: «أنطوان لافوازييه ولد عام 1743 وتوفّي عام 1794».',
    sourceRef: 'الكتاب المدرسي — الصفحة 32 — بطاقة لافوازييه',
    attribution: 'textbook',
  },
  proust: {
    kind: 'diagram',
    diagramId: 'book-l5-p33-proust',
    title: 'مرجع بطاقة جوزيف لويس بروست (ص33)',
    description:
      'إلى جانب صندوق «أستنتجُ» في الصفحة 33 صورة مرسومة جانبية للعالم جوزيف لويس بروست، وتحت الصورة النص المطبوع: «جوزيف لويس بروست ولد في فرنسا، عام 1754 ميلادي، توفّي عام 1826».',
    sourceRef: 'الكتاب المدرسي — الصفحة 33 — بطاقة بروست',
    attribution: 'textbook',
  },
} satisfies Record<string, ContentBlock>

const leadTableColumns: TableColumnSpec[] = [
  { key: 'trial', header: 'رقم التجربة', rowHeader: true },
  { key: 'sulfurBefore', header: 'الكبريت قبل التفاعل (g)', numeric: true },
  { key: 'leadBefore', header: 'الرصاص قبل التفاعل (g)', numeric: true },
  { key: 'sulfide', header: 'كبريتيد الرصاص بعد التفاعل (g)', numeric: true },
  { key: 'leadLeft', header: 'الرصاص المتبقي دون تفاعل (g)', numeric: true },
  { key: 'sulfurLeft', header: 'الكبريت المتبقي دون تفاعل (g)', numeric: true },
  { key: 'ratio', header: 'كتلة الرصاص المتفاعل / كتلة الكبريت المتفاعل', numeric: true },
]

/** The p33 exercise reproduced with the printed first row and blank cells. */
export const leadSulfurWorksheetColumns = leadTableColumns
export const leadSulfurWorksheetRows: TableRowSpec[] = [
  { id: 'trial-1', cells: { trial: '1', sulfurBefore: '1.56', leadBefore: '10', sulfide: '11.56', leadLeft: '0', sulfurLeft: '0', ratio: '10 / 1.56 = 6.41' } },
  { id: 'trial-2', cells: { trial: '2', sulfurBefore: '', leadBefore: '10', sulfide: '11.56', leadLeft: '', sulfurLeft: '', ratio: '10 / …… = ……' } },
  { id: 'trial-3', cells: { trial: '3', sulfurBefore: '', leadBefore: '', sulfide: '', leadLeft: '', sulfurLeft: '', ratio: '' } },
]

const leadSulfurCompletedRows: TableRowSpec[] = [
  { id: 'trial-1-answer', cells: { trial: '1', sulfurBefore: '1.56', leadBefore: '10', sulfide: '11.56', leadLeft: '0', sulfurLeft: '0', ratio: '10 / 1.56 = 6.41' } },
  { id: 'trial-2-answer', cells: { trial: '2', sulfurBefore: '3', leadBefore: '10', sulfide: '11.56', leadLeft: '0', sulfurLeft: '1.44', ratio: '10 / 1.56 = 6.41' } },
  { id: 'trial-3-answer', cells: { trial: '3', sulfurBefore: '1.56', leadBefore: '18', sulfide: '11.56', leadLeft: '8', sulfurLeft: '0', ratio: '10 / 1.56 = 6.41' } },
]

const leadTableBlock = (rows: TableRowSpec[], caption: string): ContentBlock => ({
  kind: 'table',
  caption,
  columns: leadTableColumns,
  rows,
  footnote: 'القيم في شكل التجارب ص32 وجدول ص33؛ «المتبقي دون تفاعل» لا يدخل في حساب النسبة الكتلية للمركب المتكوّن.',
  attribution: 'platform',
})

const ironSulfurWorksheet: ContentBlock = {
  kind: 'table', caption: 'نشاط الحديد والكبريت — جدول البيانات كما أعيد تنظيمه تعليمياً', attribution: 'platform',
  columns: [
    { key: 'quantity', header: 'الكمية', rowHeader: true },
    { key: 'case1', header: 'الحالة 1', numeric: true },
    { key: 'case2', header: 'الحالة 2', numeric: true },
    { key: 'case3', header: 'الحالة 3', numeric: true },
  ],
  rows: [
    { id: 'iron-source', cells: { quantity: 'كتلة الحديد (g)', case1: '56', case2: '28', case3: '7' } },
    { id: 'sulfur-source', cells: { quantity: 'كتلة الكبريت (g)', case1: '32', case2: '16', case3: '4' } },
    { id: 'ratio-source', cells: { quantity: 'كتلة الحديد / كتلة الكبريت', case1: '……', case2: '……', case3: '……' } },
  ],
  footnote: 'الصفان العدديان مستندان إلى نشاط ص34؛ خانات النسبة تُترك للطالب. هذا تنظيم تعليمي من المنصة، وليس صورة الجدول الأصلي.',
}

/** In-lesson activities and experiments before «أختبر نفسي», in printed order. */
export const bookActivitySolutions: Question[] = [
  shortAnswer(
    'l5-observe-atoms', '30', 'ألاحظ وأستنتج — عدّ الذرات',
    'أعدّ ذرات كل عنصر في كلّ من كفتي الميزان، وأقارن النتائج.',
    'في طرف المتفاعلات: 3 ذرات كربون و5 هيدروجين و5 أكسجين وذرة صوديوم واحدة. وفي طرف النواتج الأعداد نفسها؛ إذن يتساوى عدد ذرات كل عنصر في الطرفين.',
    [
      'أفكك صيغ المتفاعلات: CH3COOH يحتوي C2H4O2، وNaHCO3 يحتوي Na1H1C1O3؛ فالمجموع C3H5O5Na1.',
      'أفكك صيغ النواتج: CH3COONa يحتوي C2H3O2Na1، وH2O يضيف H2O1، وCO2 يضيف C1O2؛ فالمجموع C3H5O5Na1.',
      'أقارن كل عنصر على حدة: C يساوي 3، وH يساوي 5، وO يساوي 5، وNa يساوي 1 على الجانبين.',
      'أستنتج حفظ نوع الذرة وعددها في التفاعل، لا أن كل مادة تبقى جزيئاتها نفسها؛ الذرات يعاد ترتيبها في مواد جديدة.',
    ],
    {
      objectiveId: 'O3',
      hint: 'عدّ كل عنصر وحده في كل كفة؛ الرقم السفلي الصغير بعد الرمز هو عدد ذراته في الصيغة، وغيابه يعني ذرة واحدة.',
      extra: [
        {
          kind: 'table', caption: 'عدّ الذرات من صيغ الشكل — حل من المنصة', attribution: 'platform',
          columns: [
            { key: 'element', header: 'العنصر', rowHeader: true },
            { key: 'reactants', header: 'المتفاعلات', numeric: true },
            { key: 'products', header: 'النواتج', numeric: true },
          ],
          rows: [
            { id: 'carbon', cells: { element: 'C', reactants: '3', products: '3' } },
            { id: 'hydrogen', cells: { element: 'H', reactants: '5', products: '5' } },
            { id: 'oxygen', cells: { element: 'O', reactants: '5', products: '5' } },
            { id: 'sodium', cells: { element: 'Na', reactants: '1', products: '1' } },
          ],
        },
      ],
      rubric: ['تسجيل أعداد C وH وO وNa على طرفي التفاعل.', 'مقارنة كل عنصر بالعنصر نفسه لا بمجموع أعداد مختلفة.', 'استنتاج أن الذرات يعاد ترتيبها ولا تختفي.'],
    },
  ),
  shortAnswer(
    'l5-calcium-observation', '32', 'تجربة أكسيد الكالسيوم — الخطوة 2: ماذا ألاحظ؟',
    'أضيف باستخدام الملقط قطع أكسيد الكالسيوم إلى حمض كلور الماء. ماذا ألاحظ؟',
    'وفق شكل التجربة، يتفاعل CaO مع HCl، ويُشار في اللوحة الثانية إلى تكون CaCl2 وH2O. لا يحدد الكتاب لوناً أو غازاً أو تغيراً بصرياً آخر؛ فلا نضيف ملاحظة غير مطبوعة.',
    [
      'أصف فقط ما يسنده المصدر: يوضح الشكل CaO وHCl قبل التفاعل وCaCl2 وH2O بعده.',
      'لا أستنتج انطلاق غاز؛ النواتج المبيّنة في الشكل هي كلوريد الكالسيوم والماء.',
      'أفصل ملاحظة الشكل عن تفسير المنصة: القراءة 125.100 معروضة في رسم الميزان، وليست قياساً تولده محاكاة الدرس.',
    ],
    {
      objectiveId: 'O1',
      hint: 'قارن وسوم اللوحة الأولى بوسم اللوحة الثانية في شكل الميزانين؛ ماذا كان موجوداً قبل الإضافة وماذا صار بعدها؟',
      extra: [
        explanationBlock('لا توجد في الصفحة ملاحظة لونية أو كمية قطع أو زمن أو درجة حرارة؛ يُقبل وصف تحوّل المواد وبيانات الشكل فقط.'),
      ],
      rubric: ['ذكر المواد المتفاعلة CaO وHCl.', 'ذكر النواتج كما في الشكل CaCl2 وH2O.', 'عدم اختراع غاز أو لون أو قياس غير وارد.'],
    },
  ),
  shortAnswer(
    'l5-calcium-compare', '32', 'تجربة أكسيد الكالسيوم — الخطوة 4: أقارن النتائج',
    'أقارن النتائج.',
    'تظهر في الرسم قراءة 125.100 قبل التفاعل و125.100 بعده؛ القراءتان متساويتان كما في تمثيل الكتاب، ولا تظهر وحدة قياس بجانب القراءة.',
    [
      'أنقل القراءة الأولى كما تظهر: 125.100.',
      'أنقل القراءة الثانية كما تظهر: 125.100.',
      'أقارن العددين فأجد أنهما متساويان، ولا ألحق بهما وحدة غير ظاهرة في المصدر.',
      'أربط النتيجة بنص «أستنتجُ» في الكتاب: مجموع كتل المواد المتفاعلة يساوي مجموع كتل المواد الناتجة.',
    ],
    {
      objectiveId: 'O3',
      hint: 'اقرأ الرقم على شاشة كل ميزان في اللوحتين وقارنهما، وانتبه: هل كتب الكتاب وحدة قياس بجانب الرقم؟',
      extra: [math('125.100 = 125.100', 'قراءة الشكل كما طبعت، دون وحدة ظاهرة')],
    },
  ),
  shortAnswer(
    'l5-proust-table', '33', 'أكمل جدول تجارب الرصاص والكبريت',
    'أسجل النتائج في الجدول الآتي، وأكمل الفراغات بما يناسبها، ثم أجيب.',
    'يُستكمل صفا التجربتين (2) و(3) ببيانات شكل ص32: (2) 10 g رصاص و3 g كبريت، يتكون 11.56 g كبريتيد رصاص ويبقى 1.44 g كبريت دون تفاعل؛ (3) 18 g رصاص و1.56 g كبريت، يتكون 11.56 g كبريتيد رصاص ويبقى 8 g رصاص دون تفاعل. نسبة كتلتي العنصرين المتفاعلين في كل تجربة 10/1.56 = 6.41 تقريباً.',
    [
      'أرجع إلى بيانات التجارب الثلاث في شكل ص32؛ لا أستنتج خانات من الفراغ وحده.',
      'في التجربة (2) يبقى الكبريت الزائد: 3 − 1.56 = 1.44 g، ولا يبقى رصاص؛ إذن 10 g رصاص تفاعلت مع 1.56 g كبريت.',
      'في التجربة (3) يبقى 8 g رصاص؛ كتلة الرصاص المتفاعلة = 18 − 8 = 10 g، مع 1.56 g كبريت.',
      'أحسب النسبة من كتلتي العنصرين اللتين دخلتا في المركب، لا من كتلة الكبريت أو الرصاص الزائد.',
    ],
    {
      objectiveId: 'O4',
      hint: 'كل خانة ناقصة موجودة قيمتها في شكل التجارب الثلاث في الصفحة السابقة؛ ميّز «قبل التفاعل» من «المتبقي دون تفاعل».',
      extra: [leadTableBlock(leadSulfurCompletedRows, 'الجدول مكتمل — إضافة حلّية من المنصة اعتماداً على بيانات ص32–33')],
      material: [leadTableBlock(leadSulfurWorksheetRows, 'جدول بيانات التمرين — إعادة تنظيم تعليمية من المنصة')],
    },
  ),
  shortAnswer(
    'l5-trial1-mass-ratio', '33', 'السؤال عن التجربة (1)',
    'أحسب مجموع كتلتي الرصاص والكبريت قبل التفاعل في التجربة (1)؟ ثم نسبة تفاعلهما؟',
    'مجموع الكتلتين قبل التفاعل 10 + 1.56 = 11.56 g. نسبة كتلتي الرصاص إلى الكبريت المتفاعلين 10/1.56 ≈ 6.41.',
    [
      'أقرأ كتلتي البداية من التجربة (1): 10 g رصاص و1.56 g كبريت.',
      'أجمعهما: 10 + 1.56 = 11.56 g؛ وهذه تساوي كتلة كبريتيد الرصاص المتكونة في الشكل.',
      'أقسم كتلة الرصاص المتفاعلة على كتلة الكبريت المتفاعلة: 10 ÷ 1.56 = 6.410256… ≈ 6.41.',
      'أكتب النسبة بلا وحدة؛ إنها مقارنة كتلتي عنصرين في المركب نفسه.',
    ],
    {
      objectiveId: 'O4',
      hint: 'المجموع قبل التفاعل عملية جمع بسيطة، والنسبة قسمة كتلة الرصاص على كتلة الكبريت بالترتيب نفسه في عنوان الجدول.',
      extra: [math('10 + 1.56 = 11.56\\;\\text{g}'), math('\\frac{10}{1.56} = 6.410256\\ldots \\approx 6.41')],
    },
  ),
  shortAnswer(
    'l5-trial2-mass-ratio', '33', 'السؤال عن تجربة (2): المجموع والنسبة',
    'أحسب مجموع كتلتي الرصاص والكبريت قبل التفاعل في التجربة (2)؟ ثم نسبة تفاعلهما؟',
    'مجموع الكتلتين قبل التفاعل 10 + 3 = 13 g. تفاعل 10 g رصاص مع 1.56 g كبريت فقط، فتكون النسبة 10/1.56 ≈ 6.41.',
    [
      'أجمع الكتلتين الابتدائيتين: 10 + 3 = 13 g.',
      'أميز كتلة الكبريت الموضوعة (3 g) من كتلة الكبريت المتفاعلة: 3 − 1.44 = 1.56 g.',
      'أحسب النسبة من الأجزاء المتفاعلة: 10 ÷ 1.56 ≈ 6.41.',
      'أتحقق من الكتلة الكلية بإضافة الكبريت المتبقي إلى الناتج: 11.56 + 1.44 = 13 g.',
    ],
    {
      objectiveId: 'O4',
      hint: 'انتبه للفرق بين «الكبريت الموضوع» و«الكبريت المتفاعل»: النسبة تستخدم ما دخل في المركب فعلاً.',
      extra: [math('10 + 3 = 13\\;\\text{g}'), math('\\frac{10}{3 - 1.44} = \\frac{10}{1.56} \\approx 6.41')],
    },
  ),
  shortAnswer(
    'l5-trial2-excess-sulfur', '33', 'السؤال عن بقاء الكبريت في التجربة (2)',
    'أتساءل لماذا بقي 1.44 g من الكبريت لم يتفاعل في التجربة (2)؟',
    'لأن كتلة الكبريت الابتدائية 3 g أكبر مما تتطلبه كتلة الرصاص 10 g لتكوين كبريتيد الرصاص وفق النسبة الثابتة؛ تفاعل 1.56 g فقط وبقي 1.44 g زائداً دون تفاعل.',
    [
      'أستخدم النسبة الثابتة التي ظهرت في التجربة (1): 10 g رصاص تتفاعل مع 1.56 g كبريت.',
      'أقارنها بكتلة الكبريت الموضوعة في التجربة (2): 3 g.',
      'أحسب الزائد: 3 − 1.56 = 1.44 g؛ لذلك لا يدخل هذا الجزء في كتلة المركب المتكون.',
      'أتحقق من حفظ الكتلة في التجربة: 11.56 g كبريتيد رصاص + 1.44 g كبريت متبقٍ = 13 g مواد ابتدائية.',
    ],
    {
      objectiveId: 'O4',
      hint: 'اسأل: كم غرام كبريت يحتاج 10 g رصاص بحسب التجربة (1)؟ ثم قارنه بما وُضع فعلاً.',
      extra: [math('3 - 1.56 = 1.44\\;\\text{g}'), math('11.56 + 1.44 = 10 + 3 = 13\\;\\text{g}')],
    },
  ),
  shortAnswer(
    'l5-trial3-mass-ratio', '33', 'السؤال عن تجربة (3): المجموع والنسبة',
    'أحسب مجموع كتلتي الرصاص والكبريت قبل التفاعل في التجربة (3)؟ ثم نسبة تفاعلهما؟',
    'مجموع الكتلتين قبل التفاعل 18 + 1.56 = 19.56 g. تفاعل 10 g رصاص فقط؛ لأن 8 g بقيت دون تفاعل، لذا النسبة 10/1.56 ≈ 6.41.',
    [
      'أجمع كتلتي البداية: 18 + 1.56 = 19.56 g.',
      'أحسب كتلة الرصاص التي تفاعلت: 18 − 8 = 10 g.',
      'أقسم كتلتي العنصرين المتفاعلين: 10 ÷ 1.56 ≈ 6.41.',
      'أتحقق من حفظ الكتلة: 11.56 g مركب + 8 g رصاص متبقٍ = 19.56 g.',
    ],
    {
      objectiveId: 'O4',
      hint: 'كمية الرصاص الموضوعة هنا أكبر من حاجة الكبريت؛ اطرح المتبقي أولاً قبل حساب النسبة.',
      extra: [math('18 + 1.56 = 19.56\\;\\text{g}'), math('\\frac{18 - 8}{1.56} = \\frac{10}{1.56} \\approx 6.41'), math('11.56 + 8 = 19.56\\;\\text{g}')],
    },
  ),
  shortAnswer(
    'l5-trial3-excess-lead', '33', 'السؤال عن بقاء 8 g في التجربة (3)',
    'أتساءل لماذا بقي 8 g من الكبريت لم تتفاعل في التجربة (3)؟',
    'تنبيه المنصة: في السؤال خطأ مطبعي؛ شكل ص32 وجدول ص33 يبينان أن المتبقي في التجربة (3) هو الرصاص (8 g) لا الكبريت. بقي الرصاص لأن 1.56 g من الكبريت لا تتحد إلا مع 10 g رصاص وفق النسبة الثابتة؛ وُضع 18 g رصاص، فبقي 18 − 10 = 8 g فائضاً دون تفاعل.',
    [
      'أتحقق من المادة المتبقية في شكل التجربة (3) ص32: المكتوب «رصاص متبقّي 8g»؛ إذن كلمة «الكبريت» في نص السؤال خطأ مطبعي.',
      'أستعمل النسبة نفسها: 10 g رصاص لكل 1.56 g كبريت.',
      'أحسب ما تحتاج إليه 1.56 g كبريت: 10 g رصاص.',
      'أطرح المستهلك من الكمية الابتدائية: 18 − 10 = 8 g رصاص متبقٍ.',
      'أميز الفائض غير المتفاعل عن عنصر داخل كبريتيد الرصاص؛ لذلك لا أستخدم 18 g كلها في حساب نسبة المركب.',
    ],
    {
      objectiveId: 'O4',
      hint: 'قبل الإجابة راجع شكل التجربة (3) في ص32: ما اسم المادة المكتوب بجانب «8g متبقّي»؟',
      extra: [math('18 - 10 = 8\\;\\text{g}')],
      material: [
        {
          kind: 'callout', tone: 'warning', title: 'تنبيه من المنصة إلى خطأ مطبعي',
          text: 'نُقل نص السؤال كما طُبع وفيه كلمة «الكبريت»، لكن شكل التجربة (3) في ص32 يسمّي المادة المتبقية (8g) «رصاص متبقّي»، وجدول ص33 يجعل الكبريت المتبقي في هذه التجربة صفراً. أجب عن بقاء الرصاص، واذكر التنبيه في إجابتك.',
          attribution: 'platform',
        },
      ],
      rubric: ['التنبيه إلى أن المتبقي فعلياً هو الرصاص وفق الشكل.', 'حساب 18 − 10 = 8 g.', 'ربط البقاء بثبات النسبة الكتلية.'],
    },
  ),
  shortAnswer(
    'l5-iron-sulfur-ratio-table', '34', 'نشاط الحديد والكبريت — إكمال الجدول',
    'أكمل الجدول الآتي، واستنتج النسبة الكتلية للتفاعل، ماذا تلاحظ؟',
    'النسب الثلاث: 56/32 = 1.75، و28/16 = 1.75، و7/4 = 1.75. النسبة الكتلية للحديد إلى الكبريت ثابتة وتساوي 7/4 أو 1.75؛ تختلف الكتل الكلية لكن تبقى النسبة نفسها.',
    [
      'أقسم كتلة الحديد على كتلة الكبريت في كل عمود.',
      '56 ÷ 32 = 1.75، و28 ÷ 16 = 1.75، و7 ÷ 4 = 1.75.',
      'أبسط 56/32 بقسمة البسط والمقام على 8، فأحصل على 7/4؛ والعمودان الآخران يعطيان النسبة ذاتها.',
      'ألاحظ أن مقدار المادة يختلف بين الحالات بينما نسبة كتلة الحديد إلى كتلة الكبريت لا تتغير.',
    ],
    {
      objectiveId: 'O4',
      hint: 'نفّذ القسمة نفسها (حديد ÷ كبريت) في الأعمدة الثلاثة وقارن النواتج قبل كتابة الاستنتاج.',
      extra: [
        {
          kind: 'table', caption: 'جدول النشاط مكتمل — حل من المنصة', attribution: 'platform',
          columns: [
            { key: 'quantity', header: 'الكمية', rowHeader: true },
            { key: 'case1', header: 'الحالة 1', numeric: true },
            { key: 'case2', header: 'الحالة 2', numeric: true },
            { key: 'case3', header: 'الحالة 3', numeric: true },
          ],
          rows: [
            { id: 'iron', cells: { quantity: 'كتلة الحديد (g)', case1: '56', case2: '28', case3: '7' } },
            { id: 'sulfur', cells: { quantity: 'كتلة الكبريت (g)', case1: '32', case2: '16', case3: '4' } },
            { id: 'ratio', cells: { quantity: 'كتلة الحديد / كتلة الكبريت', case1: '1.75', case2: '1.75', case3: '1.75' } },
          ],
        },
        math('\\frac{56}{32} = \\frac{28}{16} = \\frac{7}{4} = 1.75'),
      ],
      material: [ironSulfurWorksheet],
    },
  ),
  shortAnswer(
    'l5-iron-sulfur-60-30', '34', 'نشاط الحديد والكبريت — 60 g و30 g',
    'ماذا يحدث إذا تفاعل 60 g من الحديد مع 30 g من الكبريت؟',
    'وفق النسبة 56:32 = 7:4، تتفاعل 30 g كبريت مع 52.5 g حديد. يبقى 7.5 g حديد فائضاً دون تفاعل، وتتكون 82.5 g من المركب؛ ومجموع الكتلة محفوظ: 82.5 + 7.5 = 90 g.',
    [
      'أبسط نسبة الحديد إلى الكبريت: 56/32 = 7/4.',
      'أحسب الحديد اللازم لـ30 g كبريت: 30 × 7/4 = 52.5 g.',
      'أقارن 52.5 g اللازمة بـ60 g المتاحة؛ الحديد زائد بمقدار 60 − 52.5 = 7.5 g، والكبريت هو الذي يحدد مقدار المركب.',
      'أحسب كتلة المركب من العنصرين المتفاعلين: 52.5 + 30 = 82.5 g.',
      'أتحقق من قانون انحفاظ الكتلة: كتلة المركب 82.5 g + الحديد المتبقي 7.5 g = مجموع البداية 90 g.',
    ],
    {
      objectiveId: 'O4',
      hint: 'لا تفترض أن الكميتين تتفاعلان كاملتين؛ احسب أولاً كم يحتاج 30 g كبريت من الحديد وفق نسبة النشاط السابق.',
      extra: [math('\\frac{56}{32} = \\frac{7}{4}'), math('30 \\times \\frac{7}{4} = 52.5\\;\\text{g}'), math('60 - 52.5 = 7.5\\;\\text{g}'), math('52.5 + 30 = 82.5\\;\\text{g}')],
    },
  ),
]

const p35CarbonOxygenColumns = [
  { key: 'metric', header: 'الكمية', rowHeader: true },
  { key: 'sample1', header: 'العمود 1', numeric: true },
  { key: 'sample2', header: 'العمود 2', numeric: true },
  { key: 'sample3', header: 'العمود 3', numeric: true },
  { key: 'sample4', header: 'العمود 4', numeric: true },
]

const p35CarbonOxygenRows: TableRowSpec[] = [
  { id: 'oxygen', cells: { metric: 'كتلة الأكسجين (g)', sample1: '32', sample2: '64', sample3: '128', sample4: '16' } },
  { id: 'carbon', cells: { metric: 'كتلة الكربون (g)', sample1: '12', sample2: '24', sample3: '48', sample4: '6' } },
  { id: 'ratio', cells: { metric: 'كتلة الأكسجين المتفاعل / كتلة الكربون المتفاعل', sample1: '32 / 12 = 2.66', sample2: '……', sample3: '……', sample4: '……' } },
]

const carbonOxygenSubquestions: Question[] = [
  {
    id: 'l5-selftest-co-table', type: 'short-answer', origin: 'textbook', source: page('35', 'السؤال الثالث — الفرع 1'), objectiveId: 'O4',
    hint: 'اقسم في كل عمود كتلة الأكسجين على كتلة الكربون، ثم انظر هل تتغير النتيجة من عمود لآخر.',
    prompt: 'أكمل الجدول السابق، ماذا تستنتج؟',
    referenceAnswer: 'النسب في الأعمدة الأربعة متساوية: 32/12 = 64/24 = 128/48 = 16/6 = 8/3 = 2.666…، ويطبع الكتاب في الخانة الأولى 32/12 = 2.66. أستنتج أن النسبة الكتلية للأكسجين إلى الكربون في ثاني أكسيد الكربون ثابتة.',
    explanation: 'يُنقل 2.66 كما طبعه الكتاب. حساب 32 ÷ 12 يساوي 2.666…؛ وعند التقريب المعتاد إلى منزلتين تكون 2.67. لا نصحح قيمة المصدر بصمت، ونحسب باستعمال النسبة الدقيقة 8/3.',
    rubric: ['إكمال القيم الأربع على أنها النسبة نفسها.', 'ذكر ثبات نسبة الكتلتين في المركب.', 'الإشارة إلى أن 2.66 مطبوعة كما هي، بينما القيمة الدقيقة 2.666… والتقريب المعتاد 2.67.'],
    solutionBlocks: [
      procedure(['32/12 = 8/3 = 2.666…، و64/24 = 8/3، و128/48 = 8/3، و16/6 = 8/3.', 'يطبع المصدر 2.66 في الخانة الأولى، وهو قطع عشري لا تقريب اعتيادي إلى منزلتين.', 'أستنتج ثبات نسبة كتلة الأكسجين إلى كتلة الكربون في CO2.']),
      {
        kind: 'table', caption: 'حل جدول الكربون والأكسجين — من المنصة مع إبقاء قيمة الكتاب ظاهرة', attribution: 'platform',
        columns: p35CarbonOxygenColumns,
        rows: [
          { id: 'oxygen-solved', cells: { metric: 'كتلة الأكسجين (g)', sample1: '32', sample2: '64', sample3: '128', sample4: '16' } },
          { id: 'carbon-solved', cells: { metric: 'كتلة الكربون (g)', sample1: '12', sample2: '24', sample3: '48', sample4: '6' } },
          { id: 'ratio-solved', cells: { metric: 'كتلة الأكسجين / كتلة الكربون', sample1: '32/12 = 2.66 مطبوعة', sample2: '64/24 = 2.666…', sample3: '128/48 = 2.666…', sample4: '16/6 = 2.666…' } },
        ],
        footnote: 'القيمة الدقيقة لكل نسبة هي 8/3 = 2.666…؛ 2.67 هو التقريب المعتاد إلى منزلتين.',
      },
    ],
  },
  {
    id: 'l5-selftest-co-law', type: 'short-answer', origin: 'textbook', source: page('35', 'السؤال الثالث — الفرع 2'), objectiveId: 'O2',
    hint: 'النتيجة التي تكررت في الأعمدة تتعلق بثبات نسبة، لا بتساوي مجموع قبل التفاعل وبعده.',
    prompt: 'ماذا نسمي القانون الذي يحقق هذه النتيجة؟',
    referenceAnswer: 'قانون النسب الثابتة (قانون بروست).',
    explanation: 'النتيجة التي تكررت في الأعمدة هي ثبات نسبة الكتل المكوّنة للمركب، لذلك ينطبق قانون بروست لا قانون انحفاظ الكتلة.',
    rubric: ['تسمية قانون النسب الثابتة.', 'ذكر اسم بروست أو قانون بروست.'],
    solutionBlocks: [procedure(['أحدد النتيجة: نسبة الكتلة بين عنصري المركب ثابتة في العينات.', 'أطابقها مع تعريف قانون بروست في خلاصة «تعلّمتُ» ص34.', 'أجيب: قانون النسب الثابتة (قانون بروست).'])],
  },
  {
    id: 'l5-selftest-co-carbon-mass', type: 'numerical', origin: 'textbook', source: page('35', 'السؤال الثالث — الفرع 3'), objectiveId: 'O4',
    hint: 'اكتب التناسب من العمود الأول: كل 32 g أكسجين تقابل 12 g كربون، ثم صغّر إلى 4 g أكسجين.',
    prompt: 'احسب كتلة الكربون اللازمة لتتفاعل مع 4 g من الأكسجين بشكل تام.',
    acceptedAnswers: [1.5], tolerance: 0.01, unit: 'g',
    explanation: 'النسبة الدقيقة O:C = 32:12. إذا كانت كتلة O تساوي 4 g، فكتلة C = 4 × 12/32 = 1.5 g. أتحقق بالعودة إلى النسبة نفسها: 4/1.5 = 8/3.',
    solutionBlocks: [procedure(['أكتب النسبة من الجدول: كتلة O / كتلة C = 32/12.', 'أعوض: 4 / m(C) = 32/12.', 'أحل: m(C) = 4 × 12/32 = 1.5 g.', 'أتحقق: 4/1.5 = 8/3؛ إذن الجواب 1.5 g كربون.']), math('\\frac{4}{m_C} = \\frac{32}{12} \\quad\\Rightarrow\\quad m_C = 4\\times\\frac{12}{32}=1.5\\;\\text{g}')],
  },
  {
    id: 'l5-selftest-co-oxygen-mass', type: 'numerical', origin: 'textbook', source: page('35', 'السؤال الثالث — الفرع 4'), objectiveId: 'O4',
    hint: 'استخدم الكسر الدقيق 32/12 لا القيمة العشرية المطبوعة 2.66، واضربه في كتلة الكربون المعطاة.',
    prompt: 'احسب كتلة الأكسجين اللازمة لتتفاعل مع 10 g من الكربون بشكل تام.',
    acceptedAnswers: [26.6667], tolerance: 0.02, unit: 'g',
    explanation: 'النسبة الدقيقة O:C = 32:12، لذا كتلة O = 10 × 32/12 = 26.666… g، أي نحو 26.67 g عند التقريب المعتاد إلى منزلتين. لا نستخدم 2.66 المقطوعة للحصول على جواب غير دقيق.',
    solutionBlocks: [procedure(['أكتب النسبة الدقيقة: m(O)/m(C) = 32/12 = 8/3.', 'أعوض m(C)=10 g: m(O)=10×32/12.', 'أحسب: 320/12 = 26.666… g؛ أقرب إلى 26.67 g عند منزلتين.', 'أذكر أن 2.66 في الجدول منقولة حرفياً، لكنها ليست التقريب المعتاد للقسمة.']), math('m_O = 10\\times\\frac{32}{12}=26.666\\ldots\\;\\text{g}\\approx 26.67\\;\\text{g}')],
  },
]

/** «أختبر نفسي» (p35): question 1, two MC branches, table + four branches. */
export const bookQuestions: Question[] = [
  {
    id: 'l5-selftest-water-ratio', type: 'numerical', origin: 'textbook', source: page('35', 'السؤال الأول'), objectiveId: 'O4',
    hint: 'النسبة المطلوبة بين كتلتي عنصرين داخل الماء؛ اقسم كتلة الأكسجين على كتلة الهيدروجين ولا تستخدم 18 g مقاماً.',
    prompt: 'تبلغ كتلة الأكسجين 16 g وكتلة الهيدروجين 2 g في 18 g من جزيء الماء، احسب النسبة بين كتلة الأكسجين وكتلة الهيدروجين.',
    acceptedAnswers: [8], tolerance: 0, unit: undefined,
    explanation: 'النسبة المطلوبة هي كتلة الأكسجين إلى كتلة الهيدروجين: 16/2 = 8، أي 8:1. لا نقسم على كتلة الماء الكلية لأن السؤال يطلب نسبة كتلة O إلى كتلة H.',
    solutionBlocks: [procedure(['أحدد ترتيب المطلوب: كتلة O مقسومة على كتلة H.', 'أعوض بالقيم المعطاة: 16/2.', 'أحسب 8؛ لذلك نسبة O:H = 8:1، بلا وحدة لأنها نسبة كتلتين.']), math('\\frac{16}{2}=8')],
  },
  {
    id: 'l5-selftest-atom-count', type: 'multiple-choice', selection: 'single', showOptionIds: true,
    origin: 'textbook', source: page('35', 'السؤال الثاني — 1'), objectiveId: 'O3',
    hint: 'استرجع نتيجة عدّ ذرات شكل ص30 واستنتاج ص31 لكل عنصر على حدة.',
    prompt: 'في المعادلة الكيميائية عدد ذرات العنصر ذاته تكون:',
    options: [
      { id: 'a', label: 'مختلفة بين طرفي المعادلة.' },
      { id: 'b', label: 'متساوية في طرفي المعادلة.' },
      { id: 'c', label: 'في المواد الناتجة أكثر منها في المواد المتفاعلة.' },
      { id: 'd', label: 'في المواد المتفاعلة أكثر منها في المواد الناتجة.' },
    ],
    correctOptionIds: ['b'],
    explanation: 'في تفاعل كيميائي يعاد ترتيب الذرات، ولا يختفي عنصر ولا يظهر من لا شيء. لذلك نقارن ذرات كل عنصر على حدة بين الطرفين، ونختار (b). لا تعني المساواة أن المواد أو الجزيئات في الطرفين هي نفسها.',
    solutionBlocks: [procedure(['أحدد أن المقارنة تخص العنصر نفسه لا مجموع أنواع الذرات.', 'أستحضر استنتاج ص31 من عدّ الذرات: كل عنصر له العدد نفسه قبل التفاعل وبعده.', 'أختار (b)، وأرفض الخيارات التي تجعل أحد الطرفين يكتسب ذرات بلا مصدر أو يفقدها.'])],
  },
  {
    id: 'l5-selftest-mass', type: 'multiple-choice', selection: 'single', showOptionIds: true,
    origin: 'textbook', source: page('35', 'السؤال الثاني — 2'), objectiveId: 'O1',
    hint: 'المطلوب مقارنة «مجموع» الكتل في الطرفين كما نصّت خلاصة «تعلّمتُ» ص34.',
    prompt: 'في تفاعل كيميائي يكون مجموع كتل المواد المتفاعلة:',
    options: [
      { id: 'a', label: 'أصغر من مجموع كتل المواد الناتجة.' },
      { id: 'b', label: 'أكبر من مجموع كتل المواد الناتجة.' },
      { id: 'c', label: 'ضعف مجموع كتل المواد الناتجة.' },
      { id: 'd', label: 'يساوي مجموع كتل المواد الناتجة.' },
    ],
    correctOptionIds: ['d'],
    explanation: 'قانون لافوازييه يقرر تساوي مجموع كتل المواد المتفاعلة والناتجة عند حساب النظام كله. لا تقتصر المساواة على تجربة بعينها، لكن قراءة جهاز يقيس جزءاً من نظام مفتوح قد تتغير إذا انتقلت مادة مثل الغاز إلى المحيط.',
    solutionBlocks: [procedure(['أميز مجموع الكتل عن كتلة مادة واحدة.', 'أستحضر نص قانون لافوازييه في خلاصة ص34.', 'أختار (d). أضيف عند التفسير أن المقارنة تشمل المادة التي عبرت حدود النظام؛ لا أخلط ذلك بقراءة ميزان وعاء مفتوح.'])],
  },
  {
    id: 'l5-selftest-carbon-table', type: 'table-interpretation', origin: 'textbook', source: page('35', 'السؤال الثالث — الجدول والفروع 1–4'), objectiveId: 'O4',
    hint: 'اقرأ كل عمود زوجاً واحداً (أكسجين، كربون) واحسب نسبته قبل الانتقال إلى الفروع.',
    prompt: 'الجدول الآتي يسجل كتل الكربون والأكسجين المتفاعلة لتشكل غاز ثاني أكسيد الكربون، أجب عما يلي:',
    table: {
      caption: 'كتل الأكسجين والكربون في تكوّن CO2 — إعادة تنظيم تعليمية لجدول ص35',
      columns: p35CarbonOxygenColumns,
      rows: p35CarbonOxygenRows,
      footnote: 'الجدول معاد تنظيمه للعرض؛ القيم وقيمة 32/12 = 2.66 كما في المصدر.',
    },
    questions: carbonOxygenSubquestions,
    explanation: 'حل الفروع يربط النسبة العددية بقانون بروست ثم يستخدم الكسر الدقيق 8/3. قيمة 2.66 تُحفظ كما ظهرت في الكتاب؛ التقريب الاعتيادي إلى منزلتين هو 2.67.',
    solutionBlocks: [procedure(['أبدأ بقراءة صف الأكسجين وصف الكربون في كل عمود.', 'أكمل النسب وأقارنها، ثم أسمّي القانون في الفرع الثاني.', 'في الحسابين أستخدم النسبة الدقيقة O:C = 32:12، وأكتب الوحدة g في كل جواب كتلة.', 'أفصل قيمة المصدر المطبوعة 2.66 عن التفسير الحسابي الدقيق 2.666… (2.67 بالتقريب المعتاد).'])],
  },
]

export const lesson5BookQuestionCount = 19

export const lesson5BookQuestionIds = [
  ...bookActivitySolutions.map((question) => question.id),
  ...bookQuestions.map((question) => question.id),
  ...carbonOxygenSubquestions.map((question) => question.id),
]

export const bookAssessment: FinalTest = {
  id: 'chem-u1-l5-book',
  lessonId: 'chem-u1-l5',
  origin: 'platform',
  status: 'source-verified',
  // Lookup container used to render source activities and teacher solutions; it is not another exam or bank.
  targetQuestionCount: { min: lesson5BookQuestionCount, max: lesson5BookQuestionCount },
  questions: [...bookActivitySolutions, ...bookQuestions],
}
