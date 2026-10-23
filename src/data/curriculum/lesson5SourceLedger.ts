import type { ContentBlock, LessonDefinition } from './schema'

/**
 * Exhaustive page-by-page source-to-platform ledger for Lesson 5:
 * «قانونا التَّفاعل الكِيميائِيّ» (printed pages 30–35).
 *
 * Every heading, subheading, learning objective, keyword line, definition/law
 * statement, figure (balance, electronic-balance panels, lead/sulfur trials,
 * portraits, enrichment photographs), printed caption, apparatus list,
 * procedure step, observation prompt, table, activity, enrichment box,
 * summary point, and self-test question/subquestion from the six supplied
 * textbook page images (pages 30–35) is accounted for here and verified by
 * `tests/lesson5Coverage.test.tsx` against the live `chemistryLesson5` object.
 */

export type Lesson5ObjectiveId = 'O1' | 'O2' | 'O3' | 'O4'

export type Lesson5LedgerCategory =
  | 'heading'
  | 'objective'
  | 'keyword'
  | 'prompt'
  | 'definition'
  | 'rule'
  | 'figure'
  | 'example'
  | 'activity'
  | 'summary'
  | 'question'

export type Lesson5LedgerStatus = 'implemented' | 'reconstructed' | 'decorative' | 'unresolved'

export type Lesson5LedgerEntry = {
  readonly id: string
  readonly page: '30' | '31' | '32' | '33' | '34' | '35'
  readonly category: Lesson5LedgerCategory
  readonly sourceItem: string
  readonly sourceSummary: string
  readonly status: Lesson5LedgerStatus
  readonly stepIds: readonly string[]
  readonly questionIds?: readonly string[]
  readonly interactiveIds?: readonly string[]
  readonly objectiveIds?: readonly Lesson5ObjectiveId[]
  readonly justification?: string
}

export const LESSON5_OBJECTIVES: ReadonlyArray<{
  readonly id: Lesson5ObjectiveId
  readonly text: string
  readonly explanationStepIds: readonly string[]
  readonly exampleStepIds: readonly string[]
  readonly practiceQuestionIds: readonly string[]
  readonly finalQuestionIds: readonly string[]
}> = [
  {
    id: 'O1',
    text: 'يتعرّف قانون انحفاظ الكتلة (لافوازييه).',
    explanationStepIds: ['atom-conclusion-source', 'mass-law-source', 'mass-deep-explanation', 'laws-comparison'],
    exampleStepIds: ['mass-boundary-lab', 'worked-example-mass'],
    practiceQuestionIds: ['l5-practice-04', 'l5-practice-06', 'l5-practice-08'],
    finalQuestionIds: ['l5-final-01', 'l5-final-05', 'l5-final-17'],
  },
  {
    id: 'O2',
    text: 'يتعرّف قانون النّسب الثّابتة (بروست).',
    explanationStepIds: ['proust-conclusion-source', 'proust-deep-explanation', 'laws-comparison'],
    exampleStepIds: ['fixed-ratio-lab', 'worked-example-proust'],
    practiceQuestionIds: ['l5-practice-10', 'l5-practice-17', 'l5-practice-18'],
    finalQuestionIds: ['l5-final-06', 'l5-final-11', 'l5-final-14'],
  },
  {
    id: 'O3',
    text: 'يطبّق قانون انحفاظ الكتلة.',
    explanationStepIds: ['atom-deep-explanation', 'mass-deep-explanation'],
    exampleStepIds: ['atom-count-lab', 'worked-example-mass'],
    practiceQuestionIds: [
      'l5-practice-01',
      'l5-practice-02',
      'l5-practice-03',
      'l5-practice-05',
      'l5-practice-07',
    ],
    finalQuestionIds: ['l5-final-02', 'l5-final-03', 'l5-final-04', 'l5-final-15', 'l5-final-18'],
  },
  {
    id: 'O4',
    text: 'يطبّق قانون النّسب الثّابتة.',
    explanationStepIds: ['proust-deep-explanation'],
    exampleStepIds: ['worked-example-proust', 'fixed-ratio-lab'],
    practiceQuestionIds: [
      'l5-practice-09',
      'l5-practice-11',
      'l5-practice-12',
      'l5-practice-13',
      'l5-practice-14',
      'l5-practice-15',
      'l5-practice-16',
      'l5-practice-19',
      'l5-practice-20',
    ],
    finalQuestionIds: [
      'l5-final-07',
      'l5-final-08',
      'l5-final-09',
      'l5-final-10',
      'l5-final-12',
      'l5-final-13',
      'l5-final-16',
      'l5-final-19',
      'l5-final-20',
    ],
  },
] as const

export const LESSON5_LEDGER: readonly Lesson5LedgerEntry[] = [
  // =========================================================================
  // Page 30 — العنوان، الأهداف، الكلمات المفتاحية، قانون لافوازييه، شكل الميزان
  // =========================================================================
  {
    id: 'p30-title',
    page: '30',
    category: 'heading',
    sourceItem: 'عنوان الدرس 5',
    sourceSummary: 'الدرس 5 — قانونا التَّفاعلِ الكِيميائِيِّ.',
    status: 'implemented',
    stepIds: ['opening'],
  },
  {
    id: 'p30-objectives',
    page: '30',
    category: 'objective',
    sourceItem: 'الأهداف الأربعة',
    sourceSummary:
      'الأهداف الأربعة المطبوعة: يتعرّف قانون انحفاظ الكتلة (لافوازييه)، يتعرّف قانون النّسب الثّابتة (بروست)، يطبّق قانون انحفاظ الكتلة، يطبّق قانون النّسب الثّابتة.',
    status: 'implemented',
    stepIds: ['opening', 'connected-summary'],
    objectiveIds: ['O1', 'O2', 'O3', 'O4'],
  },
  {
    id: 'p30-keywords',
    page: '30',
    category: 'keyword',
    sourceItem: 'الكلمات المفتاحية',
    sourceSummary: 'قانون انحفاظ الكتلة (لافوازييه) – قانون النّسب الثّابتة.',
    status: 'implemented',
    stepIds: ['opening'],
    objectiveIds: ['O1', 'O2'],
  },
  {
    id: 'p30-law-heading',
    page: '30',
    category: 'heading',
    sourceItem: 'قانون انحفاظ الكتلة (قانون لافوازييه) / أُلاحِظُ وأستنتجُ',
    sourceSummary: 'العنوان الأحمر: «قانون انحفاظ الكتلة (قانون لافوازييه).» وتحته «أُلاحِظُ وأستنتجُ:».',
    status: 'implemented',
    stepIds: ['atom-count-source'],
    objectiveIds: ['O1', 'O3'],
  },
  {
    id: 'p30-observe-prompt',
    page: '30',
    category: 'prompt',
    sourceItem: 'نص نشاط «أُلاحِظُ وأستنتجُ» وسؤاله',
    sourceSummary:
      'يُمثِّلُ الشَّكل المجاور ذرّات المواد المتفاعلة، وذرّات المواد النّاتجة، لتفاعل حمض الخلّ مع بيكربونات الصّوديوم. أَعُدُّ ذرّات كلّ عنصر في كلٍّ من كفّتي الميزان، وأقارنُ النّتائج.',
    status: 'implemented',
    stepIds: ['atom-count-source'],
    questionIds: ['l5-observe-atoms'],
    objectiveIds: ['O1', 'O3'],
  },
  {
    id: 'p30-balance-figure',
    page: '30',
    category: 'figure',
    sourceItem: 'شكل ميزان الكفتين وذرّات التفاعل',
    sourceSummary:
      'ميزان بكفّتين متوازنتين: كفّة «المتفاعلات» تحمل دورقاً فيه ذرّات التفاعل وصيغة CH3COOH + NaHCO3 واسما «حمض الخل + بيكربونات الصوديوم»، وكفّة «النواتج» تحمل دورقاً مماثلاً وصيغة CH3COONa + H2O + CO2 وأسماء النواتج، وبين الكفّتين عدّ مطبوع: 3C و5H و5O و1Na في كل كفّة.',
    status: 'reconstructed',
    stepIds: ['atom-count-source', 'atom-count-lab'],
    interactiveIds: ['source-figure-p30-balance', 'lesson5-atom-count-lab'],
    objectiveIds: ['O1', 'O3'],
    justification:
      'صورة الشكل الأصلية غير محفوظة كملف مسح داخل المستودع؛ أعيد بناؤها برسم SVG تخطيطي يحفظ الكفّتين والوسمين «المتفاعلات/النواتج» والعدّات المطبوعة 3C و5H و5O و1Na والشريطين السفليين بالصيغ والأسماء العربية، مع مختبر عدّ يحسب الأعداد من الصيغ نفسها لا من الرسم.',
  },

  // =========================================================================
  // Page 31 — استنتاج الذرّات، إثراء البيكربونات، أدوات تجربة الميزان وشكله
  // =========================================================================
  {
    id: 'p31-conclusion-atoms',
    page: '31',
    category: 'rule',
    sourceItem: 'أستنتجُ — بندا انحفاظ الذرّات',
    sourceSummary:
      'يتساوى عدد ذرّات كلّ عنصر في المواد المتفاعلة مع عدد ذرّاته في المواد النّاتجة. / يحافظ التَّفاعل الكيميائي على نوع العنصر، وعدد ذرّاته.',
    status: 'implemented',
    stepIds: ['atom-conclusion-source', 'atom-deep-explanation'],
    objectiveIds: ['O1', 'O3'],
  },
  {
    id: 'p31-enrichment-text',
    page: '31',
    category: 'rule',
    sourceItem: 'إثراء — استعمالات بيكربونات الصوديوم',
    sourceSummary:
      'بيكربونات الصّوديوم مسحوق أبيض من المركّبات الكيميائيّة التي تستخدم في صناعة الحلويات والمعجنات، كما يساعد على إنضاج الطّعام بسرعة.',
    status: 'implemented',
    stepIds: ['enrichment-bicarbonate'],
    objectiveIds: ['O1'],
  },
  {
    id: 'p31-enrichment-photos',
    page: '31',
    category: 'figure',
    sourceItem: 'صورتا «إثراء» وتعليق «بيكربونات الصوديوم»',
    sourceSummary:
      'صورتان فوتوغرافيتان: ملعقة خشبية فيها مسحوق أبيض وتحت الصورة تعليق «بيكربونات الصوديوم»، وصحن فيه قطعتا حلوى جاهزة.',
    status: 'decorative',
    stepIds: ['enrichment-bicarbonate'],
    justification:
      'الصورتان فوتوغرافيتان توضيحيتان من الحياة اليومية ولا تحملان بياناً علمياً أو قياساً مطلوباً منهما؛ التعريف ذو القيمة التعليمية هو نص «إثراء» نفسه وهو منقول حرفياً، مع بطاقة وصف مرجعي توثق الصورتين والتعليق المطبوع دون اختلاق صورة بديلة توحي بأنها أصلية.',
  },
  {
    id: 'p31-experiment-heading',
    page: '31',
    category: 'heading',
    sourceItem: 'أُجرّبُ وأستنتجُ / أدوات التجربة / خطوات التَّنفيذ',
    sourceSummary: 'عناوين تجربة الميزان الإلكتروني الثلاثة المطبوعة في أسفل الصفحة 31.',
    status: 'implemented',
    stepIds: ['mass-experiment-source'],
    objectiveIds: ['O1', 'O3'],
  },
  {
    id: 'p31-apparatus',
    page: '31',
    category: 'rule',
    sourceItem: 'أدوات التجربة',
    sourceSummary:
      'ميزان إلكتروني – قطع من أكسيد الكالسيوم (الكلس الحي) CaO – وعاء زجاجي – حمض كلور الماء الممدَّد HCl – ملقط.',
    status: 'implemented',
    stepIds: ['mass-experiment-source'],
    objectiveIds: ['O1', 'O3'],
  },
  {
    id: 'p31-scale-figure',
    page: '31',
    category: 'figure',
    sourceItem: 'شكل الميزانين الإلكترونيين (125.100)',
    sourceSummary:
      'لوحتان: يساراً دورق فوق ميزان إلكتروني يُظهر 125.100 وبجانبه قطع، بوسمَي HCl وCaO؛ ويميناً دورق فوق ميزان يُظهر 125.100 بوسم CaCl2 + H2O. لا تظهر وحدة قياس بجانب القراءة.',
    status: 'reconstructed',
    stepIds: ['mass-experiment-source', 'mass-boundary-lab'],
    interactiveIds: ['source-figure-p31-scale', 'lesson5-mass-boundary-lab'],
    objectiveIds: ['O1', 'O3'],
    justification:
      'رسم الشكل الأصلي غير محفوظ كملف مسح في المستودع؛ أعيد بناؤه برسم SVG تخطيطي بلوحتين بقراءة 125.100 في كلتيهما والوسوم المطبوعة HCl وCaO وCaCl2 + H2O، دون إضافة وحدة غير ظاهرة ودون ادعاء أن النموذج الحاسوبي قاس القيمتين.',
  },

  // =========================================================================
  // Page 32 — خطوات التجربة، قانون لافوازييه وبطاقته، تجارب الرصاص والكبريت
  // =========================================================================
  {
    id: 'p32-procedure-steps',
    page: '32',
    category: 'activity',
    sourceItem: 'خطوات التنفيذ 1–4',
    sourceSummary:
      '1: أضعُ باستخدام الملقط قطع أكسيد الكالسيوم في كفَّة الميزان جانب الوعاء الزُّجاجي الحاوي على حمض كلور الماء، وأسجِّل دلالة الميزان. 2: أضيفُ باستخدام الملقط قطع أكسيد الكالسيوم إلى حمض كلور الماء، ماذا أُلاحظُ؟ 3: أنتظرُ حتى ينتهي التَّفاعل، ثمَّ أسجِّل دلالة الميزان. 4: أقارنُ النَّتائج.',
    status: 'implemented',
    stepIds: ['mass-experiment-source'],
    questionIds: ['l5-calcium-observation', 'l5-calcium-compare'],
    objectiveIds: ['O1', 'O3'],
  },
  {
    id: 'p32-law-statement',
    page: '32',
    category: 'definition',
    sourceItem: 'أستنتجُ — نص قانون انحفاظ الكتلة',
    sourceSummary:
      'مجموع كتل المواد المتفاعلة يساوي مجموع كتل المواد النَّاتجة، وهذا ما يُسمّى قانون انحفاظ الكتلة (قانون مصونيّة الكتلة)، أو قانون لافوازييه.',
    status: 'implemented',
    stepIds: ['mass-law-source', 'mass-deep-explanation'],
    objectiveIds: ['O1'],
  },
  {
    id: 'p32-lavoisier-card',
    page: '32',
    category: 'figure',
    sourceItem: 'صورة أنطوان لافوازييه وبطاقة تاريخه',
    sourceSummary: 'صورة لافوازييه وتحتها: «أنطوان لافوازييه ولد عام 1743 وتوفّي عام 1794».',
    status: 'implemented',
    stepIds: ['mass-law-source'],
    objectiveIds: ['O1'],
    justification:
      'المعلومة التعليمية المطبوعة هي الاسم والتاريخان، وهي منقولة حرفياً في بطاقة مرجعية؛ أما شبه الوجه في الصورة فلا يحمل محتوى دراسياً ولم يُستبدل بصورة مولّدة، وبقي موصوفاً نصياً في البطاقة.',
  },
  {
    id: 'p32-proust-heading',
    page: '32',
    category: 'heading',
    sourceItem: 'قانون النَّسب الثَّابتة (قانون بروست)',
    sourceSummary: 'العنوان الأحمر: «قانون النَّسب الثَّابتة (قانون بروست).»',
    status: 'implemented',
    stepIds: ['proust-trials-source'],
    objectiveIds: ['O2', 'O4'],
  },
  {
    id: 'p32-proust-intro',
    page: '32',
    category: 'prompt',
    sourceItem: 'تقديم تجارب الرصاص والكبريت',
    sourceSummary:
      'أُجريتْ بعض التَّجارب على تفاعل الرَّصاص مع مسحوق الكبريت باستعمال كمّيّات مختلفة، وكانت النَّتائج كما في الشَّكل:',
    status: 'implemented',
    stepIds: ['proust-trials-source'],
    objectiveIds: ['O2', 'O4'],
  },
  {
    id: 'p32-trials-figure',
    page: '32',
    category: 'figure',
    sourceItem: 'شكل التجارب الثلاث (1) و(2) و(3)',
    sourceSummary:
      '(1) رصاص 10g + كبريت 1.56g ← كبريتيد الرصاص 11.56g. (2) رصاص 10g + كبريت 3g ← كبريتيد الرصاص 11.56g + كبريت متبقٍّ 1.44g. (3) رصاص 18g + كبريت 1.56g ← كبريتيد الرصاص 11.56g + رصاص متبقٍّ 8g.',
    status: 'reconstructed',
    stepIds: ['proust-trials-source', 'proust-table-source'],
    interactiveIds: ['source-figure-p32-trials'],
    objectiveIds: ['O2', 'O4'],
    justification:
      'الشكل الأصلي (أكوام سوداء للرصاص وكبريتيد الرصاص وصفراء للكبريت مع الكتل) غير محفوظ كملف مسح في المستودع؛ أعيد بناؤه برسم SVG تخطيطي بالصفوف الثلاثة والترقيم المطبوع والقيم نفسها، واكتُفي فيه ببيانات الشكل دون إجراء تجربة رصاص فعلية.',
  },

  // =========================================================================
  // Page 33 — جدول الرصاص والكبريت، الأسئلة الخمسة، قانون بروست وبطاقته
  // =========================================================================
  {
    id: 'p33-table-instruction',
    page: '33',
    category: 'prompt',
    sourceItem: 'تعليمة الجدول',
    sourceSummary: 'أسجِّل النَّتائج في الجدول الآتي، وأُكمِل الفراغات بما يناسبها، ثمَّ أُجيبُ:',
    status: 'implemented',
    stepIds: ['proust-table-source'],
    questionIds: ['l5-proust-table'],
    objectiveIds: ['O2', 'O4'],
  },
  {
    id: 'p33-table-structure',
    page: '33',
    category: 'figure',
    sourceItem: 'جدول التجارب (قبل/بعد التفاعل والنسبة)',
    sourceSummary:
      'أعمدة الجدول: رقم التَّجربة، كتل المواد قبل التفاعل بـ(g) (الكبريت، الرصاص)، كتل المواد بعد التفاعل بـ(g) (كبريتيد الرصاص، الرصاص المتبقي دون تفاعل، الكبريت المتبقي دون تفاعل)، والنسبة (كتلة الرصاص المتفاعل/كتلة الكبريت المتفاعل). الصف (1) مملوء بقيمة النسبة 10/1.56 = 6.41 والمتبقي صفر، والصف (2) فيه 10/……، والصف (3) فارغ.',
    status: 'implemented',
    stepIds: ['proust-table-source', 'proust-deep-explanation'],
    questionIds: ['l5-proust-table'],
    objectiveIds: ['O2', 'O4'],
  },
  {
    id: 'p33-q-trial1',
    page: '33',
    category: 'question',
    sourceItem: 'سؤال التجربة (1): المجموع والنسبة',
    sourceSummary: 'أحسُبُ مجموع كتلتي الرَّصاص والكبريت قبل التَّفاعل في التَّجربة (1)؟ ثمَّ نسبة تفاعلهما؟',
    status: 'implemented',
    stepIds: ['proust-table-source'],
    questionIds: ['l5-trial1-mass-ratio'],
    objectiveIds: ['O2', 'O3', 'O4'],
  },
  {
    id: 'p33-q-trial2',
    page: '33',
    category: 'question',
    sourceItem: 'سؤال التجربة (2): المجموع والنسبة',
    sourceSummary: 'أحسُبُ مجموع كتلتي الرَّصاص والكبريت قبل التَّفاعل في التَّجربة (2)؟ ثمَّ نسبة تفاعلهما؟',
    status: 'implemented',
    stepIds: ['proust-table-source'],
    questionIds: ['l5-trial2-mass-ratio'],
    objectiveIds: ['O2', 'O3', 'O4'],
  },
  {
    id: 'p33-q-excess-sulfur',
    page: '33',
    category: 'question',
    sourceItem: 'سؤال بقاء 1.44g كبريت في التجربة (2)',
    sourceSummary: 'أتساءلُ لماذا بقي 1.44g من الكبريت لم تتفاعل في التَّجربة (2)؟',
    status: 'implemented',
    stepIds: ['proust-table-source'],
    questionIds: ['l5-trial2-excess-sulfur'],
    objectiveIds: ['O2', 'O4'],
  },
  {
    id: 'p33-q-trial3',
    page: '33',
    category: 'question',
    sourceItem: 'سؤال التجربة (3): المجموع والنسبة',
    sourceSummary: 'أحسُبُ مجموع كتلتي الرَّصاص والكبريت قبل التَّفاعل في التَّجربة (3)؟ ثمَّ نسبة تفاعلهما؟',
    status: 'implemented',
    stepIds: ['proust-table-source'],
    questionIds: ['l5-trial3-mass-ratio'],
    objectiveIds: ['O2', 'O3', 'O4'],
  },
  {
    id: 'p33-q-excess-8g',
    page: '33',
    category: 'question',
    sourceItem: 'سؤال بقاء 8g في التجربة (3) — مع تنبيه للخطأ المطبعي',
    sourceSummary:
      'المطبوع حرفياً: «أتساءلُ لماذا بقي 8g من الكبريت لم تتفاعل في التَّجربة (3)؟» بينما شكل الصفحة 32 يبيّن أن المتبقي في التجربة (3) هو «رصاص متبقّي 8g».',
    status: 'implemented',
    stepIds: ['proust-table-source'],
    questionIds: ['l5-trial3-excess-lead'],
    objectiveIds: ['O2', 'O4'],
    justification:
      'حُفظ نص السؤال كما طُبع في موضع السؤال، ووُضع بجانبه تنبيه من المنصة يميّز الخطأ المطبعي (كبريت بدل رصاص) مستنداً إلى شكل ص32 وجدول ص33، وحلّ السؤال على المادة المتبقية فعلياً وهي الرصاص، دون تصحيح صامت لنص الكتاب.',
  },
  {
    id: 'p33-law-statement',
    page: '33',
    category: 'definition',
    sourceItem: 'أستنتجُ — نص قانون النّسب الثّابتة',
    sourceSummary:
      'النِّسب الكتليَّة للعناصر المكوِّنة لمركَّب ما تبقى ثابتة مهما اختلفت طرائق تحضيره، وهو ما يُسمَّى بقانون النَّسب الثَّابتة (قانون بروست).',
    status: 'implemented',
    stepIds: ['proust-conclusion-source', 'proust-deep-explanation'],
    objectiveIds: ['O2'],
  },
  {
    id: 'p33-proust-card',
    page: '33',
    category: 'figure',
    sourceItem: 'صورة جوزيف لويس بروست وبطاقة تاريخه',
    sourceSummary: 'صورة بروست وتحتها: «جوزيف لويس بروست ولد في فرنسا، عام 1754 ميلادي، توفّي عام 1826».',
    status: 'implemented',
    stepIds: ['proust-conclusion-source'],
    objectiveIds: ['O2'],
    justification:
      'المعلومة التعليمية المطبوعة هي الاسم ومكان الولادة والتاريخان، وهي منقولة حرفياً في بطاقة مرجعية؛ شبه الوجه لا يحمل محتوى دراسياً ولم يُستبدل بصورة مولّدة، وبقي موصوفاً نصياً في البطاقة.',
  },

  // =========================================================================
  // Page 34 — نشاطا الحديد والكبريت، وخلاصة «تعلَّمتُ»
  // =========================================================================
  {
    id: 'p34-activity-iron-table',
    page: '34',
    category: 'activity',
    sourceItem: 'نشاط — جدول الحديد والكبريت',
    sourceSummary:
      'أُكملُ الجدول الآتي، واستنتجُ النَّسبة الكتليَّة للتَّفاعل، ماذا تلاحظُ؟ جدول: كتلة الحديد (g) 56 و28 و7، كتلة الكبريت (g) 32 و16 و4، وصفّ (كتلة الحديد/كتلة الكبريت) فارغ.',
    status: 'implemented',
    stepIds: ['iron-sulfur-source'],
    questionIds: ['l5-iron-sulfur-ratio-table'],
    objectiveIds: ['O2', 'O4'],
  },
  {
    id: 'p34-activity-60-30',
    page: '34',
    category: 'activity',
    sourceItem: 'نشاط — 60g حديد مع 30g كبريت',
    sourceSummary: 'ماذا يحدث إذا تفاعل 60g من الحديد مع 30g من الكبريت؟',
    status: 'implemented',
    stepIds: ['iron-sulfur-source'],
    questionIds: ['l5-iron-sulfur-60-30'],
    objectiveIds: ['O2', 'O4'],
  },
  {
    id: 'p34-learned-lavoisier',
    page: '34',
    category: 'summary',
    sourceItem: 'تعلَّمتُ — قانون لافوازييه',
    sourceSummary:
      'قانون لافوازييه (قانون انحفاظ الكتلة): مجموع كتل المواد المتفاعلة يساوي مجموع كتل المواد النَّاتجة، عن التَّفاعل الكيميائي.',
    status: 'implemented',
    stepIds: ['learned-summary', 'connected-summary'],
    objectiveIds: ['O1'],
  },
  {
    id: 'p34-learned-proust',
    page: '34',
    category: 'summary',
    sourceItem: 'تعلَّمتُ — قانون بروست',
    sourceSummary:
      'قانون بروست (قانون النَّسب الثَّابتة): النِّسب الكتليَّة للعناصر المكوِّنة لمركَّب ما هي نسب محدَّدة وثابتة مهما اختلفت طرائق تحضيره.',
    status: 'implemented',
    stepIds: ['learned-summary', 'connected-summary'],
    objectiveIds: ['O2'],
  },

  // =========================================================================
  // Page 35 — أختبرُ نفسي: الأسئلة الأول والثاني والثالث
  // =========================================================================
  {
    id: 'p35-selftest-heading',
    page: '35',
    category: 'heading',
    sourceItem: 'أختبرُ نفسي / السؤال الأول',
    sourceSummary: 'أختبرُ نفسي: / السؤال الأوَّل:',
    status: 'implemented',
    stepIds: ['book-question-1'],
    objectiveIds: ['O2', 'O4'],
  },
  {
    id: 'p35-q1-water',
    page: '35',
    category: 'question',
    sourceItem: 'السؤال الأول — نسبة الماء',
    sourceSummary:
      'تبلغ كتلة الأكسجين 16g وكتلة الهيدروجين 2g في 18g من جزيء الماء، احسُبِ النَّسبة بين كتلة الأكسجين وكتلة الهيدروجين.',
    status: 'implemented',
    stepIds: ['book-question-1'],
    questionIds: ['l5-selftest-water-ratio'],
    objectiveIds: ['O2', 'O4'],
  },
  {
    id: 'p35-q2-stem',
    page: '35',
    category: 'heading',
    sourceItem: 'السؤال الثاني — التقديم',
    sourceSummary: 'السؤال الثَّاني: اختر الإجابة الصَّحيحة لكلِّ ممَّا يأتي:',
    status: 'implemented',
    stepIds: ['book-question-2'],
    objectiveIds: ['O1', 'O3'],
  },
  {
    id: 'p35-q2-item1',
    page: '35',
    category: 'question',
    sourceItem: 'السؤال الثاني — البند 1 (عدّ الذرّات)',
    sourceSummary:
      'في المعادلة الكيميائيَّة عدد ذرَّات العنصر ذاته تكون: a. مختلفة بين طرفي المعادلة. b. متساوية في طرفي المعادلة. c. في المواد النَّاتجة أكثر منها في المواد المتفاعلة. d. في المواد المتفاعلة أكثر منها في المواد النَّاتجة.',
    status: 'implemented',
    stepIds: ['book-question-2'],
    questionIds: ['l5-selftest-atom-count'],
    objectiveIds: ['O1', 'O3'],
  },
  {
    id: 'p35-q2-item2',
    page: '35',
    category: 'question',
    sourceItem: 'السؤال الثاني — البند 2 (مجموع الكتل)',
    sourceSummary:
      'في تفاعل كيميائيٍّ يكون مجموع كتل المواد المتفاعلة: a. أصغر من مجموع كتل المواد النَّاتجة. b. أكبر من مجموع كتل المواد النَّاتجة. c. ضعف مجموع كتل المواد النَّاتجة. d. يساوي مجموع كتل المواد النَّاتجة.',
    status: 'implemented',
    stepIds: ['book-question-2'],
    questionIds: ['l5-selftest-mass'],
    objectiveIds: ['O1', 'O3'],
  },
  {
    id: 'p35-q3-intro',
    page: '35',
    category: 'prompt',
    sourceItem: 'السؤال الثالث — التقديم',
    sourceSummary:
      'السؤال الثَّالث: الجدول الآتي يسجِّل كتل الكربون والأكسجين المتفاعلة لتشكُّل غاز ثنائي أكسيد الكربون، أجب عمَّا يلي:',
    status: 'implemented',
    stepIds: ['book-question-3'],
    questionIds: ['l5-selftest-carbon-table'],
    objectiveIds: ['O2', 'O4'],
  },
  {
    id: 'p35-q3-table',
    page: '35',
    category: 'figure',
    sourceItem: 'جدول الكربون والأكسجين وقيمة 2.66 المطبوعة',
    sourceSummary:
      'كتلة الأكسجين (g): 32 و64 و128 و16؛ كتلة الكربون (g): 12 و24 و48 و6؛ صفّ النسبة (كتلة الأكسجين المتفاعل/كتلة الكربون المتفاعل) فيه القيمة المطبوعة 32/12 = 2.66 وبقية الخانات فارغة.',
    status: 'implemented',
    stepIds: ['book-question-3'],
    questionIds: ['l5-selftest-carbon-table', 'l5-selftest-co-table'],
    objectiveIds: ['O2', 'O4'],
    justification:
      'حُفظت القيمة المطبوعة 2.66 كما هي في خانة الجدول، وفصل الحلّ بينها وبين القيمة الدقيقة 32/12 = 2.666… والتقريب المعتاد إلى منزلتين 2.67، دون تصحيح صامت لبيان الكتاب.',
  },
  {
    id: 'p35-q3-branch1',
    page: '35',
    category: 'question',
    sourceItem: 'السؤال الثالث — الفرع 1',
    sourceSummary: 'أكمل الجدول السَّابق، ماذا تستنتجُ؟',
    status: 'implemented',
    stepIds: ['book-question-3'],
    questionIds: ['l5-selftest-co-table'],
    objectiveIds: ['O2', 'O4'],
  },
  {
    id: 'p35-q3-branch2',
    page: '35',
    category: 'question',
    sourceItem: 'السؤال الثالث — الفرع 2',
    sourceSummary: 'ماذا نُسمِّي القانون الذي يحقِّق هذه النَّتيجة؟',
    status: 'implemented',
    stepIds: ['book-question-3'],
    questionIds: ['l5-selftest-co-law'],
    objectiveIds: ['O2'],
  },
  {
    id: 'p35-q3-branch3',
    page: '35',
    category: 'question',
    sourceItem: 'السؤال الثالث — الفرع 3',
    sourceSummary: 'احسُب كتلة الكربون اللازمة لتتفاعل مع 4g من الأكسجين بشكل تامّ.',
    status: 'implemented',
    stepIds: ['book-question-3'],
    questionIds: ['l5-selftest-co-carbon-mass'],
    objectiveIds: ['O4'],
  },
  {
    id: 'p35-q3-branch4',
    page: '35',
    category: 'question',
    sourceItem: 'السؤال الثالث — الفرع 4',
    sourceSummary: 'احسُب كتلة الأكسجين اللازمة لتتفاعل مع 10g من الكربون بشكل تامّ.',
    status: 'implemented',
    stepIds: ['book-question-3'],
    questionIds: ['l5-selftest-co-oxygen-mass'],
    objectiveIds: ['O4'],
  },
] as const

export function stepBlocks(lesson: LessonDefinition): Map<string, readonly ContentBlock[]> {
  return new Map(lesson.steps.map((step) => [step.id, step.blocks]))
}

export function computeLedgerCoverage(lesson: LessonDefinition) {
  const stepIds = new Set(lesson.steps.map((step) => step.id))
  const questionIds = new Set(
    (lesson.tests ?? []).flatMap((test) =>
      test.questions.flatMap((q) =>
        q.type === 'table-interpretation' || q.type === 'diagram-interpretation'
          ? [q.id, ...q.questions.map((sub) => sub.id)]
          : [q.id],
      ),
    ),
  )
  const interactiveIds = new Set<string>()
  for (const step of lesson.steps) {
    for (const block of step.blocks) {
      if (block.kind === 'interactive') interactiveIds.add(block.interactiveId)
      if (block.kind === 'diagram') interactiveIds.add(block.diagramId)
    }
  }

  const brokenEntries: string[] = []
  for (const entry of LESSON5_LEDGER) {
    if (entry.status === 'unresolved') brokenEntries.push(`${entry.id}: unresolved`)
    if (entry.stepIds.length === 0) brokenEntries.push(`${entry.id}: no stepIds`)
    for (const id of entry.stepIds) {
      if (!stepIds.has(id)) brokenEntries.push(`${entry.id}: missing step ${id}`)
    }
    for (const id of entry.questionIds ?? []) {
      if (!questionIds.has(id)) brokenEntries.push(`${entry.id}: missing question ${id}`)
    }
    for (const id of entry.interactiveIds ?? []) {
      if (!interactiveIds.has(id)) brokenEntries.push(`${entry.id}: missing interactive ${id}`)
    }
  }

  return {
    total: LESSON5_LEDGER.length,
    byPage: ['30', '31', '32', '33', '34', '35'].map((page) => ({
      page,
      count: LESSON5_LEDGER.filter((entry) => entry.page === page).length,
    })),
    byStatus: {
      implemented: LESSON5_LEDGER.filter((entry) => entry.status === 'implemented').length,
      reconstructed: LESSON5_LEDGER.filter((entry) => entry.status === 'reconstructed').length,
      decorative: LESSON5_LEDGER.filter((entry) => entry.status === 'decorative').length,
      unresolved: LESSON5_LEDGER.filter((entry) => entry.status === 'unresolved').length,
    },
    brokenEntries,
  }
}
