import type { Question } from '@/assessment/types'
import type { ContentBlock, TableColumnSpec, TableRowSpec } from './schema'

/** Source pages 30–35. Answers and worked reasoning are platform-authored. */
const page = (number: string, item: string) => ({ page: number, item })
const procedure = (items: string[], title = 'خطوات التفكير والحل'): ContentBlock => ({
  kind: 'procedure', title, items, attribution: 'platform',
})
const math = (tex: string, caption?: string): ContentBlock => ({
  kind: 'formula', tex, display: 'block', caption, attribution: 'platform',
})
const explanation = (text: string): ContentBlock => ({ kind: 'paragraph', text, attribution: 'platform' })

function shortAnswer(
  id: string,
  sourcePage: string,
  item: string,
  prompt: string,
  referenceAnswer: string,
  steps: string[],
  extra: ContentBlock[] = [],
  rubric?: string[],
  sourceIndex = 0,
  material?: ContentBlock[],
): Question {
  return {
    id,
    type: 'short-answer',
    origin: 'textbook',
    source: page(sourcePage, item),
    sourceIndex,
    prompt,
    ...(material ? { material } : {}),
    referenceAnswer,
    explanation: 'الحل والتعليل من إعداد المنصة، مع الفصل بين البيانات المطبوعة والاستنتاج الحسابي. لا تُعرض الإجابة للطالب أثناء نشاطه؛ تظهر في منطقة المعلم.',
    rubric: rubric ?? steps,
    solutionBlocks: [procedure(steps), ...extra],
  }
}

const leadTableColumns: TableColumnSpec[] = [
  { key: 'trial', header: 'رقم التجربة', rowHeader: true },
  { key: 'leadBefore', header: 'الرصاص قبل التفاعل (g)', numeric: true },
  { key: 'sulfurBefore', header: 'الكبريت قبل التفاعل (g)', numeric: true },
  { key: 'sulfide', header: 'كبريتيد الرصاص بعد التفاعل (g)', numeric: true },
  { key: 'leadLeft', header: 'الرصاص المتبقي (g)', numeric: true },
  { key: 'sulfurLeft', header: 'الكبريت المتبقي (g)', numeric: true },
  { key: 'ratio', header: 'كتلة الرصاص المتفاعل / كتلة الكبريت المتفاعل', numeric: true },
]

/** The p33 exercise is reproduced with the printed first row and blank cells. */
export const leadSulfurWorksheetColumns = leadTableColumns
export const leadSulfurWorksheetRows: TableRowSpec[] = [
  { id: 'trial-1', cells: { trial: '1', leadBefore: '10', sulfurBefore: '1.56', sulfide: '11.56', leadLeft: '0', sulfurLeft: '0', ratio: '10 / 1.56 = 6.41' } },
  { id: 'trial-2', cells: { trial: '2', leadBefore: '10', sulfurBefore: '', sulfide: '11.56', leadLeft: '', sulfurLeft: '', ratio: '10 / …… = ……' } },
  { id: 'trial-3', cells: { trial: '3', leadBefore: '', sulfurBefore: '', sulfide: '', leadLeft: '', sulfurLeft: '', ratio: '' } },
]

const leadSulfurCompletedRows: TableRowSpec[] = [
  { id: 'trial-1-answer', cells: { trial: '1', leadBefore: '10', sulfurBefore: '1.56', sulfide: '11.56', leadLeft: '0', sulfurLeft: '0', ratio: '10 / 1.56 = 6.41' } },
  { id: 'trial-2-answer', cells: { trial: '2', leadBefore: '10', sulfurBefore: '3', sulfide: '11.56', leadLeft: '0', sulfurLeft: '1.44', ratio: '10 / 1.56 = 6.41' } },
  { id: 'trial-3-answer', cells: { trial: '3', leadBefore: '18', sulfurBefore: '1.56', sulfide: '11.56', leadLeft: '8', sulfurLeft: '0', ratio: '10 / 1.56 = 6.41' } },
]

const leadTableBlock = (rows: TableRowSpec[], caption: string): ContentBlock => ({
  kind: 'table',
  caption,
  columns: leadTableColumns,
  rows,
  footnote: 'القيم في الرسم ص32؛ «المتبقي» لا يدخل في حساب النسبة الكتلية للمركب المتكوّن.',
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

/** In-lesson activities and all numbered questions before «أختبر نفسي». */
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
    [
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
    ['تسجيل أعداد C وH وO وNa على طرفي التفاعل.', 'مقارنة كل عنصر بالعنصر نفسه لا بمجموع أعداد مختلفة.', 'استنتاج أن الذرات يعاد ترتيبها ولا تختفي.'],
  ),
  shortAnswer(
    'l5-calcium-observation', '32', 'تجربة أكسيد الكالسيوم — ماذا ألاحظ؟',
    'أضيف باستخدام الملقط قطع أكسيد الكالسيوم إلى حمض كلور الماء. ماذا ألاحظ؟',
    'وفق الشكل المصاحب، يتفاعل CaO مع HCl، ويُشار إلى تكون CaCl2 وH2O. لا يحدد النص لونًا أو غازًا أو تغيرًا بصريًا آخر؛ فلا نضيف ملاحظة غير مطبوعة.',
    [
      'أصف فقط ما يسنده المصدر: يوضح الشكل CaO وHCl قبل التفاعل وCaCl2 وH2O بعده.',
      'لا أستنتج انطلاق غاز؛ النواتج المبيّنة في الشكل هي كلوريد الكالسيوم والماء.',
      'أفصل ملاحظة الشكل عن تفسير المنصة: القراءة 125.100 معروضة في رسم الميزان، وليست قياسًا تولده محاكاة الدرس.',
    ],
    [
      explanation('لا توجد في الصفحة ملاحظة لونية أو كمية قطع أو زمن أو درجة حرارة؛ يُقبل وصف تحوّل المواد وبيانات الشكل فقط.'),
    ],
    ['ذكر المواد المتفاعلة CaO وHCl.', 'ذكر النواتج كما في الشكل CaCl2 وH2O.', 'عدم اختراع غاز أو لون أو قياس غير وارد.'],
  ),
  shortAnswer(
    'l5-calcium-compare', '32', 'تجربة أكسيد الكالسيوم — مقارنة الميزان',
    'أقارن النتائج.',
    'تظهر في الرسم قراءة 125.100 قبل التفاعل و125.100 بعده؛ القراءتان متساويتان كما في تمثيل الكتاب، ولا تظهر وحدة مع القراءة.',
    [
      'أنقل القراءة الأولى كما تظهر: 125.100.',
      'أنقل القراءة الثانية كما تظهر: 125.100.',
      'أقارن العددين فأجد أنهما متساويان، ولا ألحق بهما وحدة غير ظاهرة في المصدر.',
      'أحصر النتيجة في هذا الرسم؛ لا أعمم ثبات قراءة ميزان نظام مفتوح إذا غادره غاز أو تبادلت مادته مع المحيط.',
    ],
    [math('125.100 = 125.100', 'قراءة الشكل كما طبعت، دون وحدة ظاهرة')],
  ),
  shortAnswer(
    'l5-proust-table', '33', 'أكمل جدول تجارب الرصاص والكبريت',
    'أسجل النتائج في الجدول الآتي، وأكمل الفراغات بما يناسبها، ثم أجيب.',
    'يُستكمل صفا التجربتين (2) و(3) ببيانات الرسم ص32: (2) 10 g رصاص و3 g كبريت، يتكون 11.56 g كبريتيد رصاص ويبقى 1.44 g كبريت؛ (3) 18 g رصاص و1.56 g كبريت، يتكون 11.56 g كبريتيد رصاص ويبقى 8 g رصاص. كتلة الرصاص التي تفاعلت في (3) هي 10 g. نسبة كتلتي العنصرين المتفاعلين في كل تجربة 10/1.56 = 6.41 تقريبًا.',
    [
      'أرجع إلى بيانات التجارب الثلاث في الشكل ص32؛ لا أستنتج خانات من الفراغ وحده.',
      'في التجربة (2) يبقى الكبريت الزائد: 3 − 1.56 = 1.44 g، ولا يبقى رصاص؛ إذن 10 g رصاص تفاعلت مع 1.56 g كبريت.',
      'في التجربة (3) يبقى 8 g رصاص؛ كتلة الرصاص المتفاعلة = 18 − 8 = 10 g، مع 1.56 g كبريت.',
      'أحسب النسبة من كتلتي العنصرين اللتين دخلتا في المركب، لا من كتلة الكبريت أو الرصاص الزائد.',
    ],
    [leadTableBlock(leadSulfurCompletedRows, 'الجدول مكتمل — إضافة حلّية من المنصة اعتمادًا على بيانات ص32–33')],
    undefined,
    0,
    [leadTableBlock(leadSulfurWorksheetRows, 'جدول بيانات التمرين — إعادة تنظيم تعليمية من المنصة')],
  ),
  shortAnswer(
    'l5-trial1-mass-ratio', '33', 'السؤال عن التجربة (1)',
    'أحسب مجموع كتلتي الرصاص والكبريت قبل التفاعل في التجربة (1)، ثم نسبة تفاعلهما؟',
    'مجموع الكتلتين قبل التفاعل 10 + 1.56 = 11.56 g. نسبة كتلتي الرصاص إلى الكبريت المتفاعلين 10/1.56 ≈ 6.41.',
    [
      'أقرأ كتلتي البداية من التجربة (1): 10 g رصاص و1.56 g كبريت.',
      'أجمعهما: 10 + 1.56 = 11.56 g؛ وهذه تساوي كتلة كبريتيد الرصاص المتكونة في الشكل.',
      'أقسم كتلة الرصاص المتفاعلة على كتلة الكبريت المتفاعلة: 10 ÷ 1.56 = 6.410256… ≈ 6.41.',
      'أكتب النسبة بلا وحدة؛ إنها مقارنة كتلتي عنصرين في المركب نفسه.',
    ],
    [math('10 + 1.56 = 11.56\;\text{g}'), math('\frac{10}{1.56} = 6.410256\ldots \approx 6.41')],
  ),
  shortAnswer(
    'l5-trial2-excess-sulfur', '33', 'السؤال عن بقاء الكبريت في التجربة (2)',
    'أتساءل لماذا بقي 1.44 g من الكبريت لم يتفاعل في التجربة (2)؟',
    'لأن كتلة الكبريت الابتدائية 3 g أكبر مما تتطلبه كتلة الرصاص 10 g لتكوين كبريتيد الرصاص وفق النسبة الثابتة؛ تفاعل 1.56 g فقط وبقي 1.44 g زائدًا.',
    [
      'أستخدم النسبة الثابتة التي ظهرت في التجربة (1): 10 g رصاص تتفاعل مع 1.56 g كبريت.',
      'أقارنها بكتلة الكبريت الموضوعة في التجربة (2): 3 g.',
      'أحسب الزائد: 3 − 1.56 = 1.44 g؛ لذلك لا يدخل هذا الجزء في كتلة المركب المتكون.',
      'أتحقق من حفظ الكتلة في التجربة: 11.56 g كبريتيد رصاص + 1.44 g كبريت متبقٍ = 13 g مواد ابتدائية.',
    ],
    [math('3 - 1.56 = 1.44\;\text{g}'), math('11.56 + 1.44 = 10 + 3 = 13\;\text{g}')],
  ),
  shortAnswer(
    'l5-trial2-mass-ratio', '33', 'السؤال عن مجموع كتل التجربة (2)',
    'أحسب مجموع كتلتي الرصاص والكبريت قبل التفاعل في التجربة (2)، ثم نسبة تفاعلهما؟',
    'مجموع الكتلتين قبل التفاعل 10 + 3 = 13 g. تفاعل 10 g رصاص مع 1.56 g كبريت، فتكون النسبة 10/1.56 ≈ 6.41.',
    [
      'أجمع الكتلتين الابتدائيتين: 10 + 3 = 13 g.',
      'أميز كتلة الكبريت الموضوعة (3 g) من كتلة الكبريت المتفاعلة: 3 − 1.44 = 1.56 g.',
      'أحسب النسبة من الأجزاء المتفاعلة: 10 ÷ 1.56 ≈ 6.41.',
      'أتحقق من الكتلة الكلية بإضافة الكبريت المتبقي إلى الناتج: 11.56 + 1.44 = 13 g.',
    ],
    [math('10 + 3 = 13\;\text{g}'), math('\frac{10}{3 - 1.44} = \frac{10}{1.56} \approx 6.41')],
  ),
  shortAnswer(
    'l5-trial3-mass-ratio', '33', 'السؤال عن مجموع كتل التجربة (3)',
    'أحسب مجموع كتلتي الرصاص والكبريت قبل التفاعل في التجربة (3)، ثم نسبة تفاعلهما؟',
    'مجموع الكتلتين قبل التفاعل 18 + 1.56 = 19.56 g. تفاعل 10 g رصاص فقط؛ لأن 8 g بقيت، لذا النسبة 10/1.56 ≈ 6.41.',
    [
      'أجمع كتلتي البداية: 18 + 1.56 = 19.56 g.',
      'أحسب كتلة الرصاص التي تفاعلت: 18 − 8 = 10 g.',
      'أقسم كتلتي العنصرين المتفاعلين: 10 ÷ 1.56 ≈ 6.41.',
      'أتحقق من حفظ الكتلة: 11.56 g مركب + 8 g رصاص متبقٍ = 19.56 g.',
    ],
    [math('18 + 1.56 = 19.56\;\text{g}'), math('\frac{18 - 8}{1.56} = \frac{10}{1.56} \approx 6.41'), math('11.56 + 8 = 19.56\;\text{g}')],
  ),
  shortAnswer(
    'l5-trial3-excess-lead', '33', 'السؤال عن بقاء الرصاص في التجربة (3)',
    'أتساءل لماذا بقي 8 g من الرصاص لم يتفاعل في التجربة (3)؟',
    'لأن 1.56 g من الكبريت لا تتحد إلا مع 10 g رصاص وفق النسبة الثابتة؛ وُضع 18 g رصاص، فبقي 18 − 10 = 8 g فائضًا.',
    [
      'أستعمل النسبة نفسها: 10 g رصاص لكل 1.56 g كبريت.',
      'أحسب ما تحتاج إليه 1.56 g كبريت: 10 g رصاص.',
      'أطرح المستهلك من الكمية الابتدائية: 18 − 10 = 8 g رصاص متبقٍ.',
      'أميز الفائض غير المتفاعل عن عنصر داخل كبريتيد الرصاص؛ لذلك لا أستخدم 18 g كلها في حساب نسبة المركب.',
    ],
    [math('18 - 10 = 8\;\text{g}')],
  ),
  shortAnswer(
    'l5-iron-sulfur-ratio-table', '34', 'نشاط الحديد والكبريت — إكمال الجدول',
    'أكمل الجدول الآتي، واستنتج النسبة الكتلية للتفاعل، ماذا تلاحظ؟',
    'النسب الثلاث: 56/32 = 1.75، و28/16 = 1.75، و7/4 = 1.75. النسبة الكتلية للحديد إلى الكبريت ثابتة وتساوي 7/4 أو 1.75؛ تختلف الكتل الكلية لكن تبقى النسبة نفسها.',
    [
      'أقسم كتلة الحديد على كتلة الكبريت في كل عمود.',
      '56 ÷ 32 = 1.75، و28 ÷ 16 = 1.75، و7 ÷ 4 = 1.75.',
      'أبسط 56/32 بقسمة البسط والمقام على 8، فأحصل على 7/4؛ والعمودان الآخران يعطيان النسبة ذاتها.',
      'ألاحظ أن مقدار المادة يختلف بين التجارب بينما نسبة كتلة الحديد إلى كتلة الكبريت لا تتغير.',
    ],
    [
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
      math('\frac{56}{32} = \frac{28}{16} = \frac{7}{4} = 1.75'),
    ],
    undefined,
    0,
    [ironSulfurWorksheet],
  ),
  shortAnswer(
    'l5-iron-sulfur-60-30', '34', 'نشاط الحديد والكبريت — 60 g و30 g',
    'ماذا يحدث إذا تفاعل 60 g من الحديد مع 30 g من الكبريت؟',
    'وفق النسبة 56:32 = 7:4، تتفاعل 30 g كبريت مع 52.5 g حديد. يبقى 7.5 g حديد فائضًا، وتتكون 82.5 g من المركب؛ ومجموع الكتلة محفوظ: 82.5 + 7.5 = 90 g.',
    [
      'أبسط نسبة الحديد إلى الكبريت: 56/32 = 7/4.',
      'أحسب الحديد اللازم لـ30 g كبريت: 30 × 7/4 = 52.5 g.',
      'أقارن 52.5 g اللازمة بـ60 g المتاحة؛ الحديد زائد بمقدار 60 − 52.5 = 7.5 g، والكبريت هو الذي يحدد مقدار المركب.',
      'أحسب كتلة المركب من العنصرين المتفاعلين: 52.5 + 30 = 82.5 g.',
      'أتحقق من قانون انحفاظ الكتلة: كتلة المركب 82.5 g + الحديد المتبقي 7.5 g = مجموع البداية 90 g.',
    ],
    [math('\frac{56}{32} = \frac{7}{4}'), math('30 \times \frac{7}{4} = 52.5\;\text{g Fe}'), math('60 - 52.5 = 7.5\;\text{g Fe left}'), math('52.5 + 30 = 82.5\;\text{g}')],
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
  { id: 'oxygen', cells: { metric: 'كتلة الأكسجين (g)', sample1: '16', sample2: '128', sample3: '64', sample4: '32' } },
  { id: 'carbon', cells: { metric: 'كتلة الكربون (g)', sample1: '6', sample2: '48', sample3: '24', sample4: '12' } },
  { id: 'ratio', cells: { metric: 'كتلة الأكسجين / كتلة الكربون', sample1: '……', sample2: '……', sample3: '……', sample4: '32 / 12 = 2.66' } },
]

const carbonOxygenSubquestions: Question[] = [
  {
    id: 'l5-selftest-co-table', type: 'short-answer', origin: 'textbook', source: page('35', 'السؤال الثالث — إكمال الجدول والاستنتاج'), sourceIndex: 1,
    prompt: 'أكمل الجدول السابق، ماذا تستنتج؟',
    referenceAnswer: 'النسب في الأعمدة الأربعة متساوية: 16/6 = 128/48 = 64/24 = 32/12 = 8/3 = 2.666…، ويظهر في الكتاب 32/12 = 2.66. النسبة الكتلية للأكسجين إلى الكربون في ثاني أكسيد الكربون ثابتة.',
    explanation: 'يُنقل 2.66 كما طبعه الكتاب. حساب 32 ÷ 12 يساوي 2.666…؛ وعند التقريب المعتاد إلى منزلتين تكون 2.67. لا نصحح قيمة المصدر بصمت، ونحسب باستعمال النسبة الدقيقة 8/3.',
    rubric: ['إكمال القيم الأربع على أنها النسبة نفسها.', 'ذكر ثبات نسبة الكتلتين في المركب.', 'الإشارة إلى أن 2.66 مطبوعة كما هي، بينما القيمة الدقيقة 2.666… والتقريب المعتاد 2.67.'],
    solutionBlocks: [
      procedure(['16/6 = 8/3 = 2.666…، و128/48 = 8/3، و64/24 = 8/3.', '32/12 = 8/3 = 2.666…؛ يطبع المصدر 2.66، وهو قطع عشري لا تقريب اعتيادي إلى منزلتين.', 'أستنتج ثبات نسبة كتلة الأكسجين إلى كتلة الكربون في CO2.']),
      {
        kind: 'table', caption: 'حل جدول الكربون والأكسجين — من المنصة مع إبقاء قيمة الكتاب ظاهرة', attribution: 'platform',
        columns: p35CarbonOxygenColumns,
        rows: [
          { id: 'oxygen-solved', cells: { metric: 'كتلة الأكسجين (g)', sample1: '16', sample2: '128', sample3: '64', sample4: '32' } },
          { id: 'carbon-solved', cells: { metric: 'كتلة الكربون (g)', sample1: '6', sample2: '48', sample3: '24', sample4: '12' } },
          { id: 'ratio-solved', cells: { metric: 'كتلة الأكسجين / كتلة الكربون', sample1: '16/6 = 2.666…', sample2: '128/48 = 2.666…', sample3: '64/24 = 2.666…', sample4: '32/12 = 2.66 مطبوعة' } },
        ],
        footnote: 'القيمة الدقيقة لكل نسبة هي 8/3 = 2.666…؛ 2.67 هو التقريب المعتاد إلى منزلتين.',
      },
    ],
  },
  {
    id: 'l5-selftest-co-law', type: 'short-answer', origin: 'textbook', source: page('35', 'السؤال الثالث — تسمية القانون'), sourceIndex: 2,
    prompt: 'ماذا نسمي القانون الذي يحقق هذه النتيجة؟',
    referenceAnswer: 'قانون النسب الثابتة (قانون بروست).',
    explanation: 'النتيجة التي تكررت في الأعمدة هي ثبات نسبة الكتل المكوّنة للمركب، لذلك ينطبق قانون بروست لا قانون انحفاظ الكتلة.',
    rubric: ['تسمية قانون النسب الثابتة.', 'ذكر اسم بروست أو قانون بروست.'],
    solutionBlocks: [procedure(['أحدد النتيجة: نسبة الكتلة بين عنصري المركب ثابتة في العينات.', 'أطابقها مع تعريف قانون بروست في خلاصة ص34.', 'أجيب: قانون النسب الثابتة (قانون بروست).'])],
  },
  {
    id: 'l5-selftest-co-carbon-mass', type: 'numerical', origin: 'textbook', source: page('35', 'السؤال الثالث — الفرع 3'), sourceIndex: 3,
    prompt: 'احسب كتلة الكربون اللازمة لتتفاعل مع 4 g من الأكسجين بشكل تام.',
    acceptedAnswers: [1.5], tolerance: 0.01, unit: 'g',
    explanation: 'النسبة الدقيقة O:C = 32:12. إذا كانت كتلة O تساوي 4 g، فكتلة C = 4 × 12/32 = 1.5 g. أتحقق بالعودة إلى النسبة نفسها: 4/1.5 = 8/3.',
    solutionBlocks: [procedure(['أكتب النسبة من الجدول: كتلة O / كتلة C = 32/12.', 'أعوض: 4 / m(C) = 32/12.', 'أحل: m(C) = 4 × 12/32 = 1.5 g.', 'أتحقق: 4/1.5 = 8/3؛ إذن الجواب 1.5 g كربون.']), math('\frac{4}{m_C} = \frac{32}{12} \quad\Rightarrow\quad m_C = 4\times\frac{12}{32}=1.5\;\text{g}')],
  },
  {
    id: 'l5-selftest-co-oxygen-mass', type: 'numerical', origin: 'textbook', source: page('35', 'السؤال الثالث — الفرع 4'), sourceIndex: 4,
    prompt: 'احسب كتلة الأكسجين اللازمة لتتفاعل مع 10 g من الكربون بشكل تام.',
    acceptedAnswers: [26.6667], tolerance: 0.02, unit: 'g',
    explanation: 'النسبة الدقيقة O:C = 32:12، لذا كتلة O = 10 × 32/12 = 26.666… g، أي نحو 26.67 g عند التقريب المعتاد إلى منزلتين. لا نستخدم 2.66 المقطوعة للحصول على جواب غير دقيق.',
    solutionBlocks: [procedure(['أكتب النسبة الدقيقة: m(O)/m(C) = 32/12 = 8/3.', 'أعوض m(C)=10 g: m(O)=10×32/12.', 'أحسب: 320/12 = 26.666… g؛ أقرب إلى 26.67 g عند منزلتين.', 'أذكر أن 2.66 في الجدول منقولة حرفيًا، لكنها ليست التقريب المعتاد للقسمة.']), math('m_O = 10\times\frac{32}{12}=26.666\ldots\;\text{g}\approx 26.67\;\text{g}')],
  },
]

/** «أختبر نفسي» exactly as printed: question 1, two MC branches, table + four branches. */
export const bookQuestions: Question[] = [
  {
    id: 'l5-selftest-water-ratio', type: 'numerical', origin: 'textbook', source: page('35', 'السؤال الأول'), sourceIndex: 1,
    prompt: 'بلغت كتلة الأكسجين 16 g وكتلة الهيدروجين 2 g في 18 g من جزيء الماء، احسب النسبة بين كتلة الأكسجين وكتلة الهيدروجين.',
    acceptedAnswers: [8], tolerance: 0, unit: undefined,
    explanation: 'النسبة المطلوبة هي كتلة الأكسجين إلى كتلة الهيدروجين: 16/2 = 8، أي 8:1. لا نقسم على كتلة الماء الكلية لأن السؤال يطلب نسبة كتلة O إلى كتلة H.',
    solutionBlocks: [procedure(['أحدد ترتيب المطلوب: كتلة O مقسومة على كتلة H.', 'أعوض بالقيم المعطاة: 16/2.', 'أحسب 8؛ لذلك نسبة O:H = 8:1، بلا وحدة لأنها نسبة كتلتين.']), math('\frac{16}{2}=8:1')],
  },
  {
    id: 'l5-selftest-atom-count', type: 'multiple-choice', selection: 'single', showOptionIds: true,
    origin: 'textbook', source: page('35', 'السؤال الثاني — 1'), sourceIndex: 1,
    prompt: 'في المعادلة الكيميائية، عدد ذرات العنصر ذاته يكون:',
    options: [
      { id: 'a', label: 'مختلفة بين طرفي المعادلة.' },
      { id: 'b', label: 'متساوية في طرفي المعادلة.' },
      { id: 'c', label: 'في المواد الناتجة أكثر منها في المواد المتفاعلة.' },
      { id: 'd', label: 'في المواد المتفاعلة أكثر منها في المواد الناتجة.' },
    ],
    correctOptionIds: ['b'],
    explanation: 'في تفاعل كيميائي يعاد ترتيب الذرات، ولا يختفي عنصر ولا يظهر من لا شيء. لذلك نقارن ذرات كل عنصر على حدة بين الطرفين، ونختار (ب). لا تعني المساواة أن المواد أو الجزيئات في الطرفين هي نفسها.',
    solutionBlocks: [procedure(['أحدد أن المقارنة تخص العنصر نفسه لا مجموع أنواع الذرات.', 'أستحضر استنتاج ص31 من عدّ الذرات: كل عنصر له العدد نفسه قبل التفاعل وبعده.', 'أختار (ب)، وأرفض الخيارات التي تجعل أحد الطرفين يكتسب ذرات بلا مصدر أو يفقدها.'])],
  },
  {
    id: 'l5-selftest-mass', type: 'multiple-choice', selection: 'single', showOptionIds: true,
    origin: 'textbook', source: page('35', 'السؤال الثاني — 2'), sourceIndex: 2,
    prompt: 'في تفاعل كيميائي يكون مجموع كتل المواد المتفاعلة:',
    options: [
      { id: 'a', label: 'أصغر من مجموع كتل المواد الناتجة.' },
      { id: 'b', label: 'أكبر من مجموع كتل المواد الناتجة.' },
      { id: 'c', label: 'ضعف مجموع كتل المواد الناتجة.' },
      { id: 'd', label: 'يساوي مجموع كتل المواد الناتجة.' },
    ],
    correctOptionIds: ['d'],
    explanation: 'قانون لافوازييه يقرر تساوي مجموع كتل المواد المتفاعلة والناتجة عند حساب النظام كله. لا تقتصر المساواة على تجربة بعينها، لكن قراءة جهاز يقيس جزءًا من نظام مفتوح قد تتغير إذا انتقلت مادة مثل الغاز إلى المحيط.',
    solutionBlocks: [procedure(['أميز مجموع الكتل عن كتلة مادة واحدة.', 'أستحضر نص قانون لافوازييه في خلاصة ص34.', 'أختار (د). أضيف عند التفسير أن المقارنة تشمل المادة التي عبرت حدود النظام؛ لا أخلط ذلك بقراءة ميزان وعاء مفتوح.'])],
  },
  {
    id: 'l5-selftest-carbon-table', type: 'table-interpretation', origin: 'textbook', source: page('35', 'السؤال الثالث — الجدول والفروع 1–4'), sourceIndex: 3,
    prompt: 'الجدول الآتي يسجل كتل الكربون والأكسجين المتفاعلة لتشكل غاز ثاني أكسيد الكربون، أجب عما يأتي:',
    table: {
      caption: 'كتل الأكسجين والكربون في تكوّن CO2 — إعادة تنظيم تعليمية لجدول ص35',
      columns: p35CarbonOxygenColumns,
      rows: p35CarbonOxygenRows,
      footnote: 'الجدول معاد تنظيمه للعرض؛ القيم وترتيب الأعمدة وقيمة 32/12 = 2.66 كما في المصدر.',
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
