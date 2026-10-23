import type { ContentBlock, LessonDefinition } from './schema'

/**
 * Exhaustive page-by-page source-to-platform ledger for Lesson 4:
 * «التّفاعلات الكيميائيّة» (printed pages 24–29).
 *
 * Every heading, subheading, learning objective, keyword, definition, rule,
 * figure/photo panel, printed caption, laboratory apparatus list, procedure
 * prompt, observation question, activity, word equation, enrichment box,
 * research prompt, summary point, and self-test question/subquestion from the
 * six textbook scans (pages 24–29) is accounted for here and verified by
 * `tests/lesson4Coverage.test.ts` against the live `chemistryLesson4` object.
 */

export type Lesson4ObjectiveId = 'O1' | 'O2' | 'O3' | 'O4' | 'O5' | 'O6'

export type Lesson4LedgerCategory =
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

export type Lesson4LedgerStatus = 'implemented' | 'reconstructed' | 'decorative' | 'unresolved'

export type Lesson4LedgerEntry = {
  readonly id: string
  readonly page: '24' | '25' | '26' | '27' | '28' | '29'
  readonly category: Lesson4LedgerCategory
  readonly sourceItem: string
  readonly sourceSummary: string
  readonly status: Lesson4LedgerStatus
  readonly stepIds: readonly string[]
  readonly questionIds?: readonly string[]
  readonly interactiveIds?: readonly string[]
  readonly objectiveIds?: readonly Lesson4ObjectiveId[]
  readonly justification?: string
}

export const LESSON4_OBJECTIVES: ReadonlyArray<{
  readonly id: Lesson4ObjectiveId
  readonly text: string
  readonly explanationStepIds: readonly string[]
  readonly exampleStepIds: readonly string[]
  readonly practiceQuestionIds: readonly string[]
  readonly finalQuestionIds: readonly string[]
}> = [
  {
    id: 'O1',
    text: 'يتعرّفُ التّفاعل الكيميائيّ.',
    explanationStepIds: ['discovery-changes', 'observe-reactions', 'reaction-definition', 'reaction-deep-explanation'],
    exampleStepIds: ['observation-lab', 'worked-example-magnesium'],
    practiceQuestionIds: [
      'l4-observe-lemon',
      'l4-observe-javel',
      'l4-observe-limewater',
      'l4-observe-name',
      'l4-mg-q3',
      'l4-book-q5',
      'l4-practice-01',
      'l4-practice-03',
      'l4-practice-04',
      'l4-practice-05',
    ],
    finalQuestionIds: ['l4-final-01', 'l4-final-03', 'l4-final-04', 'l4-final-15', 'l4-final-20'],
  },
  {
    id: 'O2',
    text: 'يميّزُ بين المواد المتفاعلة والنّاتجة.',
    explanationStepIds: ['prerequisites-bridge', 'reaction-definition', 'roles-comparison'],
    exampleStepIds: ['worked-example-magnesium', 'worked-example-word-equations'],
    practiceQuestionIds: [
      'l4-mg-act1',
      'l4-mg-act2',
      'l4-book-mc3',
      'l4-practice-02',
      'l4-practice-06',
      'l4-practice-07',
      'l4-practice-08',
      'l4-practice-09',
    ],
    finalQuestionIds: ['l4-final-02', 'l4-final-05', 'l4-final-06', 'l4-final-08'],
  },
  {
    id: 'O3',
    text: 'يتعرّفُ تفاعل الاحتراق.',
    explanationStepIds: ['magnesium-experiment', 'combustion-conclusions', 'household-gas'],
    exampleStepIds: ['magnesium-lab', 'worked-example-magnesium'],
    practiceQuestionIds: [
      'l4-mg-observation',
      'l4-mg-q1',
      'l4-mg-q2',
      'l4-book-mc2',
      'l4-practice-14',
      'l4-practice-20',
    ],
    finalQuestionIds: ['l4-final-07', 'l4-final-13'],
  },
  {
    id: 'O4',
    text: 'يميّزُ أنواع تفاعلات الاحتراق.',
    explanationStepIds: ['burner-experiment', 'combustion-conclusions', 'combustion-comparison'],
    exampleStepIds: ['burner-lab', 'worked-example-gas-safety'],
    practiceQuestionIds: [
      'l4-burner-observe1',
      'l4-burner-observe2',
      'l4-burner-q1',
      'l4-burner-q2',
      'l4-book-q6',
      'l4-practice-15',
      'l4-practice-16',
      'l4-practice-19',
    ],
    finalQuestionIds: ['l4-final-11', 'l4-final-12'],
  },
  {
    id: 'O5',
    text: 'يقارنُ نواتج الاحتراق التّام وغير التّام.',
    explanationStepIds: ['burner-experiment', 'combustion-comparison', 'carbon-monoxide', 'research-heaters'],
    exampleStepIds: ['burner-lab', 'worked-example-gas-safety'],
    practiceQuestionIds: [
      'l4-burner-q3',
      'l4-burner-q4',
      'l4-research',
      'l4-book-mc1',
      'l4-book-mc4',
      'l4-book-q4',
      'l4-practice-17',
      'l4-practice-18',
      'l4-practice-21',
      'l4-practice-22',
      'l4-practice-23',
      'l4-practice-24',
    ],
    finalQuestionIds: ['l4-final-14', 'l4-final-16', 'l4-final-17', 'l4-final-18', 'l4-final-19'],
  },
  {
    id: 'O6',
    text: 'يعبّرُ عن التّفاعل الكيميائيّ بمعادلة كيميائيّة لفظيّة.',
    explanationStepIds: ['magnesium-word-activity', 'word-equation-activities', 'word-equation-method', 'learned-summary'],
    exampleStepIds: ['worked-example-magnesium', 'worked-example-word-equations', 'word-equation-lab'],
    practiceQuestionIds: [
      'l4-mg-act3',
      'l4-word-iron',
      'l4-word-water',
      'l4-book-q2-1',
      'l4-book-q2-2',
      'l4-book-q2-3',
      'l4-book-q3-1',
      'l4-book-q3-2',
      'l4-book-q3-3',
      'l4-practice-10',
      'l4-practice-11',
      'l4-practice-12',
      'l4-practice-13',
    ],
    finalQuestionIds: ['l4-final-09', 'l4-final-10'],
  },
] as const

export const LESSON4_LEDGER: readonly Lesson4LedgerEntry[] = [
  // =========================================================================
  // Page 24 — العنوان، الأهداف، الكلمات المفتاحية، ألاحظ وأجيب
  // =========================================================================
  {
    id: 'p24-title',
    page: '24',
    category: 'heading',
    sourceItem: 'عنوان الدرس 4',
    sourceSummary: 'الدرس 4 — التّفاعلات الكيميائيّة.',
    status: 'implemented',
    stepIds: ['opening'],
  },
  {
    id: 'p24-objectives',
    page: '24',
    category: 'objective',
    sourceItem: 'الأهداف الستة',
    sourceSummary:
      'الأهداف الستة المطبوعة: تعرّف التفاعل الكيميائي، التمييز بين المواد المتفاعلة والناتجة، تعرّف تفاعل الاحتراق، تمييز أنواع تفاعلات الاحتراق، مقارنة نواتج الاحتراق التام وغير التام، والتعبير عن التفاعل الكيميائي بمعادلة كيميائية لفظية.',
    status: 'implemented',
    stepIds: ['opening', 'connected-summary'],
    objectiveIds: ['O1', 'O2', 'O3', 'O4', 'O5', 'O6'],
  },
  {
    id: 'p24-keywords',
    page: '24',
    category: 'keyword',
    sourceItem: 'الكلمات المفتاحية',
    sourceSummary:
      'تفاعل كيميائيّ – مواد متفاعلة – مواد ناتجة – معادلة كيميائيّة لفظيّة – احتراق تام – احتراق غير تام.',
    status: 'implemented',
    stepIds: ['opening'],
    objectiveIds: ['O1', 'O2', 'O3', 'O4', 'O5', 'O6'],
  },
  {
    id: 'p24-section-heading',
    page: '24',
    category: 'heading',
    sourceItem: 'التّفاعل الكيميائيّ / أُلاحِظُ وأجيب',
    sourceSummary: 'العنوان الفرعي: «التّفاعل الكيميائيّ :» وتحته «أُلاحِظُ وأجيب :».',
    status: 'implemented',
    stepIds: ['observe-reactions'],
    objectiveIds: ['O1'],
  },
  {
    id: 'p24-figure-observations',
    page: '24',
    category: 'figure',
    sourceItem: 'صور المشاهد الثلاثة لملاحظة التحولات الكيميائية',
    sourceSummary:
      'ثلاث صور أفقية من اليمين إلى اليسار: (1) كأس تفيض رغوة بيضاء عند إضافة قطرات الليمون إلى بيكربونات الصوديوم، (2) جهاز تسخين وأنبوب توصيل يمرر غاز ثنائي أكسيد الكربون في رائق الكلس فيتعكر، (3) قارورة ماء جافيل بجانب قماش داكن ظهرت عليه بقع زوال لون وردية فاتحة.',
    status: 'reconstructed',
    stepIds: ['observe-reactions', 'observation-lab'],
    interactiveIds: ['source-figure-p24-observations', 'reaction-observation-lab'],
    objectiveIds: ['O1'],
    justification:
      'الصور الفوتوغرافية الأصلية غير محفوظة كملفات مسح داخل المستودع؛ أعيد بناؤها برسم SVG تخطيطي أمين بالترتيب المطبوع من اليمين إلى اليسار مع بطاقة مرجعية نصية ومختبر تفاعلي للمشاهد الثلاثة دون مقادير مخترعة.',
  },
  {
    id: 'p24-photo-caption',
    page: '24',
    category: 'prompt',
    sourceItem: 'التعليق الأحمر على الصورة اليمنى',
    sourceSummary: 'النص المطبوع باللون الأحمر فوق الصورة اليمنى: «إضافة قطرات ليمون إلى بيكربونات الصوديوم (الكربونة)».',
    status: 'implemented',
    stepIds: ['observe-reactions'],
    objectiveIds: ['O1'],
  },
  {
    id: 'p24-observe-q1',
    page: '24',
    category: 'activity',
    sourceItem: 'ألاحظ وأجيب — السؤال 1',
    sourceSummary: 'عند إضافة بضع قطرات من حامض الليمون على بيكربونات الصّوديوم، ماذا أُلاحِظُ؟',
    status: 'implemented',
    stepIds: ['observe-reactions'],
    questionIds: ['l4-observe-lemon'],
    objectiveIds: ['O1'],
  },
  {
    id: 'p24-observe-q2',
    page: '24',
    category: 'activity',
    sourceItem: 'ألاحظ وأجيب — السؤال 2',
    sourceSummary: 'عند سقوط قطرات ماء جافيل على ثياب ملوّنة ماذا أُلاحِظُ؟',
    status: 'implemented',
    stepIds: ['observe-reactions'],
    questionIds: ['l4-observe-javel'],
    objectiveIds: ['O1'],
  },
  {
    id: 'p24-observe-q3',
    page: '24',
    category: 'activity',
    sourceItem: 'ألاحظ وأجيب — السؤال 3',
    sourceSummary: 'عند مرور غاز ثنائي أكسيد الكربون في رائق الكلس، ماذا أُلاحِظُ؟',
    status: 'implemented',
    stepIds: ['observe-reactions'],
    questionIds: ['l4-observe-limewater'],
    objectiveIds: ['O1'],
  },
  {
    id: 'p24-observe-q4',
    page: '24',
    category: 'activity',
    sourceItem: 'ألاحظ وأجيب — السؤال 4',
    sourceSummary: 'أسمّي جميع التّحولات في التّجارب السّابقة.',
    status: 'implemented',
    stepIds: ['observe-reactions'],
    questionIds: ['l4-observe-name'],
    objectiveIds: ['O1'],
  },

  // =========================================================================
  // Page 25 — تفاعل احتراق المغنزيوم، تعريف التفاعل الكيميائي، نشاط المعادلة
  // =========================================================================
  {
    id: 'p25-mg-headings',
    page: '25',
    category: 'heading',
    sourceItem: 'تفاعل احتراق المغنزيوم / أجرب وأستنتج',
    sourceSummary: 'العنوان الفرعي: «تفاعل احتراق المغنزيوم:» وتحته «أجرب وأستنتج :».',
    status: 'implemented',
    stepIds: ['magnesium-experiment'],
    objectiveIds: ['O3'],
  },
  {
    id: 'p25-mg-apparatus',
    page: '25',
    category: 'rule',
    sourceItem: 'أدوات التجربة — احتراق المغنزيوم',
    sourceSummary: 'أدوات التجربة: شريط مغنزيوم، ملقط، موقد، نظّارات واقية، جفنة خزفية تحوي قليلاً من الرّمل.',
    status: 'implemented',
    stepIds: ['magnesium-experiment', 'roles-comparison'],
    objectiveIds: ['O2', 'O3'],
  },
  {
    id: 'p25-mg-procedure',
    page: '25',
    category: 'activity',
    sourceItem: 'خطوات التنفيذ — احتراق المغنزيوم',
    sourceSummary:
      'أضعُ النّظارة الواقية ،ثمّ أُمسكُ بملقطٍ شريطاً من المغنزيوم وأقرّبه من الموقد المشتعل بحذرٍ ماذا أُلاحِظُ؟',
    status: 'implemented',
    stepIds: ['magnesium-experiment'],
    questionIds: ['l4-mg-observation'],
    objectiveIds: ['O3'],
  },
  {
    id: 'p25-figure-magnesium',
    page: '25',
    category: 'figure',
    sourceItem: 'صورة احتراق شريط المغنزيوم',
    sourceSummary:
      'صورة على خلفية داكنة لملقط معدني يمسك شريط مغنزيوم يشتعل بضوء أبيض ساطع ويتدلّى من طرفه شريط أبيض هش من الناتج.',
    status: 'reconstructed',
    stepIds: ['magnesium-experiment', 'magnesium-lab'],
    interactiveIds: ['source-figure-p25-magnesium', 'magnesium-combustion-lab'],
    objectiveIds: ['O3'],
    justification:
      'الصورة الفوتوغرافية غير محفوظة كملف مسح في المستودع؛ أعيد بناؤها برسم SVG تخطيطي للملقط والشريط المشتعل بالضوء الأبيض الساطع والناتج الأبيض، مع بطاقة مرجعية ومختبر تفاعلي بمراحل قبل/أثناء/بعد دون كتل أو درجات حرارة مخترعة.',
  },
  {
    id: 'p25-mg-questions',
    page: '25',
    category: 'activity',
    sourceItem: 'أسئلة التجربة 1–3 (احتراق المغنزيوم)',
    sourceSummary:
      '1- ماذا يحصل لشريط المغنزيوم؟ 2- ما لون الدُّخان المرافق؟ 3- بعد انتهاء التّفاعل، هل يمكنني إعادة شريط المغنزيوم إلى ما كان عليه؟',
    status: 'implemented',
    stepIds: ['magnesium-experiment'],
    questionIds: ['l4-mg-q1', 'l4-mg-q2', 'l4-mg-q3'],
    objectiveIds: ['O1', 'O3'],
  },
  {
    id: 'p25-reaction-definition',
    page: '25',
    category: 'definition',
    sourceItem: 'أستنتج — تعريف التفاعل الكيميائي',
    sourceSummary:
      'التّفاعل الكيميائيّ: تحوّل يطرأ على مواد كيميائيّة (مواد متفاعلة) وتتكوّن مواد جديدة (مواد ناتجة).',
    status: 'implemented',
    stepIds: ['reaction-definition', 'reaction-deep-explanation'],
    objectiveIds: ['O1', 'O2'],
  },
  {
    id: 'p25-reaction-indicators',
    page: '25',
    category: 'rule',
    sourceItem: 'أستنتج — دلائل التفاعل الكيميائي',
    sourceSummary:
      'غالباً ما يرافق التّفاعلات الكيميائيّة: تغيّر في اللّون، أو تشكّل راسب، أو انطلاق غاز، أو نشر حرارة، ..........',
    status: 'implemented',
    stepIds: ['reaction-definition', 'reaction-deep-explanation'],
    objectiveIds: ['O1'],
  },
  {
    id: 'p25-mg-activity-q1',
    page: '25',
    category: 'activity',
    sourceItem: 'نشاط ص25 — البند ١',
    sourceSummary: '١. أسمّي الغاز الذي ساعد على احتراق شريط المغنزيوم.',
    status: 'implemented',
    stepIds: ['magnesium-word-activity'],
    questionIds: ['l4-mg-act1'],
    objectiveIds: ['O2', 'O3'],
  },
  {
    id: 'p25-mg-activity-q2',
    page: '25',
    category: 'activity',
    sourceItem: 'نشاط ص25 — البند ٢',
    sourceSummary: '٢. أسمّي المركّب الناتج وأستنتجُ صيغته.',
    status: 'implemented',
    stepIds: ['magnesium-word-activity', 'worked-example-magnesium'],
    questionIds: ['l4-mg-act2'],
    objectiveIds: ['O2'],
  },
  {
    id: 'p25-mg-activity-q3',
    page: '25',
    category: 'activity',
    sourceItem: 'نشاط ص25 — البند ٣',
    sourceSummary: '٣. أعبّر عن التّفاعل الكيميائيّ الحاصل (احتراق المغنزيوم) بمعادلة لفظيّة.',
    status: 'implemented',
    stepIds: ['magnesium-word-activity', 'worked-example-magnesium'],
    questionIds: ['l4-mg-act3'],
    objectiveIds: ['O6'],
  },
  {
    id: 'p25-mg-word-diagram',
    page: '25',
    category: 'example',
    sourceItem: 'مخطط المعادلة اللفظية الناقصة لاحتراق المغنزيوم',
    sourceSummary:
      'المغنزيوم (مادة متفاعلة) + ................ (مادة متفاعلة) ──تسخين──► ................ (مادة ناتجة).',
    status: 'implemented',
    stepIds: ['magnesium-word-activity', 'worked-example-magnesium'],
    questionIds: ['l4-mg-act3'],
    objectiveIds: ['O2', 'O6'],
  },

  // =========================================================================
  // Page 26 — نشاط المعادلتين اللفظيتين، تجربة موقد بنزن، أنواع الاحتراق
  // =========================================================================
  {
    id: 'p26-word-activity-1',
    page: '26',
    category: 'activity',
    sourceItem: 'نشاط ص26 — البند ١ (كبريتيد الحديد II)',
    sourceSummary: '١. أكتبُ معادلة لفظيّة تعبّر عن تفاعل الحديد مع الكبريت وينتج عنه كبريتيد الحديد II.',
    status: 'implemented',
    stepIds: ['word-equation-activities', 'word-equation-method'],
    questionIds: ['l4-word-iron'],
    objectiveIds: ['O6'],
  },
  {
    id: 'p26-word-activity-2',
    page: '26',
    category: 'activity',
    sourceItem: 'نشاط ص26 — البند ٢ (تكوّن الماء)',
    sourceSummary: '٢. أكتبُ معادلة لفظيّة تعبّر عن تكوّن الماء من تفاعل غازي الهدروجين والأكسجين.',
    status: 'implemented',
    stepIds: ['word-equation-activities', 'word-equation-method'],
    questionIds: ['l4-word-water'],
    objectiveIds: ['O6'],
  },
  {
    id: 'p26-burner-apparatus',
    page: '26',
    category: 'rule',
    sourceItem: 'أجرب وأستنتج — أدوات تجربة موقد بنزن',
    sourceSummary: 'أدوات التجربة: موقد بنزن في المخبر له ثقب فوق الصّمام يسمح بدخول الهواء - صحن خزف.',
    status: 'implemented',
    stepIds: ['burner-experiment'],
    objectiveIds: ['O3', 'O4'],
  },
  {
    id: 'p26-burner-procedure',
    page: '26',
    category: 'activity',
    sourceItem: 'خطوات التنفيذ — الحالتان (1) و(2)',
    sourceSummary:
      'أشعِل الموقد كما في الحالة (1) وأضع فوق اللّهب صحن الخزف، ماذا أُلاحِظُ؟ / ثم أغلِقُ الثّقب جزئيّاً الحالة (2). ماذا أُلاحِظُ؟',
    status: 'implemented',
    stepIds: ['burner-experiment'],
    questionIds: ['l4-burner-observe1', 'l4-burner-observe2'],
    objectiveIds: ['O4'],
  },
  {
    id: 'p26-figure-burner',
    page: '26',
    category: 'figure',
    sourceItem: 'شكل موقد بنزن وصحن الخزف في الحالتين (1) و(2)',
    sourceSummary:
      'شبكة من أربع لوحات (عمودان × صفّان): اليمين الحالة (1) لهب أزرق مستدقّ ثم صحن خزف نظيف فوق اللهب الأزرق؛ اليسار الحالة (2) لهب أصفر/برتقالي أطول ثم صحن خزف عليه طبقة سوداء فوق اللهب الأصفر.',
    status: 'reconstructed',
    stepIds: ['burner-experiment', 'burner-lab'],
    interactiveIds: ['source-figure-p26-burner', 'combustion-air-lab'],
    objectiveIds: ['O4', 'O5'],
    justification:
      'الشكل المطبوع غير محفوظ كصورة مسح في المستودع؛ أعيد رسمه كشبكة SVG مطابقة للعمود الأيمن (1) والعمود الأيسر (2) بالشارتين المرقمتين، مع بطاقة مرجعية ومختبر تفاعلي لضبط فتحة الهواء ووضع صحن الخزف.',
  },
  {
    id: 'p26-burner-questions',
    page: '26',
    category: 'activity',
    sourceItem: 'أسئلة تجربة موقد بنزن 1–4',
    sourceSummary:
      '1- أُميّزُ لون اللّهب؟ في كلّ من الحالتين (1) و(2). 2- أفسّرُ سبب تغيّر لون اللّهب. 3- أفسّرُ تشكّل طبقة سوداء على صحن الخزف في الحالة (2). 4- أقارنُ نواتج الاحتراق بين الحالة (1) والحالة (2).',
    status: 'implemented',
    stepIds: ['burner-experiment'],
    questionIds: ['l4-burner-q1', 'l4-burner-q2', 'l4-burner-q3', 'l4-burner-q4'],
    objectiveIds: ['O4', 'O5'],
  },
  {
    id: 'p26-combustion-definition',
    page: '26',
    category: 'definition',
    sourceItem: 'أستنتج — تعريف الاحتراق',
    sourceSummary: 'الاحتراق: هو تفاعل المادّة مع الأكسجين عند درجة حرارة مناسبة.',
    status: 'implemented',
    stepIds: ['combustion-conclusions'],
    objectiveIds: ['O3'],
  },
  {
    id: 'p26-combustion-products-rule',
    page: '26',
    category: 'rule',
    sourceItem: 'أستنتج — ارتباط النواتج بكمية الهواء (الأكسجين)',
    sourceSummary: 'تختلف نواتج الاحتراق حسب كمية الهواء (الأكسجين) المتوفّرة.',
    status: 'implemented',
    stepIds: ['combustion-conclusions', 'combustion-comparison'],
    objectiveIds: ['O5'],
  },
  {
    id: 'p26-combustion-types',
    page: '26',
    category: 'rule',
    sourceItem: 'أستنتج — الاحتراق التام وغير التام وشرطاهما',
    sourceSummary:
      'الاحتراق نوعان: تامّ وغير تامّ — 1. يحدث الاحتراق التّام عندما تتوافر كميّة كافية من الأكسجين. 2. يحدث الاحتراق غير التّام عندما تكون كميّة الأكسجين غير كافية.',
    status: 'implemented',
    stepIds: ['combustion-conclusions', 'combustion-comparison'],
    objectiveIds: ['O4', 'O5'],
  },

  // =========================================================================
  // Page 27 — هل تعلم؟، إضاءة، قضية للبحث، تعلمتُ
  // =========================================================================
  {
    id: 'p27-did-you-know',
    page: '27',
    category: 'rule',
    sourceItem: 'هل تعلم؟ — الغاز المنزلي والمركبتان ورغوة الصابون',
    sourceSummary:
      'الغاز المنزلي مكون من خليط غازي (البوتان والبروبان) لا رائحة له ولالون يضاف له مادة عضوية (المركبتان) لها رائحة قوية لإكتشاف أي تسرب للغاز. وعند تركيب أسطوانة الغاز استخدم رغوة الماء والصابون للتأكد من وجود تسرب.',
    status: 'implemented',
    stepIds: ['household-gas', 'worked-example-gas-safety'],
    objectiveIds: ['O3', 'O5'],
  },
  {
    id: 'p27-illumination-co',
    page: '27',
    category: 'rule',
    sourceItem: 'إضاءة — غاز أحادي أكسيد الكربون (CO)',
    sourceSummary:
      'غاز أحادي أكسيد الكربون (CO) عديم اللّون سامّ جداً. يتّحد مع كريات الدم الحمراء فيمنعها من نقل الأكسجين ممّا يسبّب الإعياء واضطراب دقّات القلب.',
    status: 'implemented',
    stepIds: ['carbon-monoxide', 'worked-example-gas-safety'],
    objectiveIds: ['O5'],
  },
  {
    id: 'p27-research-issue',
    page: '27',
    category: 'activity',
    sourceItem: 'قضيّة للبحث — مدافئ الوقود في الغرف محكمة الإغلاق',
    sourceSummary:
      'تتعرّض حياة الإنسان للخطر في الغرف محكمة الإغلاق التي تستخدم فيها مدافئ الوقود للتّدفئة في أيام الشتاء القارس، ابحث في ذلك.',
    status: 'implemented',
    stepIds: ['research-heaters', 'worked-example-gas-safety'],
    questionIds: ['l4-research'],
    objectiveIds: ['O4', 'O5'],
  },
  {
    id: 'p27-learned-definition',
    page: '27',
    category: 'summary',
    sourceItem: 'تعلمتُ — تعريف التفاعل الكيميائي',
    sourceSummary:
      'التّفاعل الكيميائيّ: تحوّل يطرأ على مواد كيميائيّة (مواد متفاعلة) وتتكوّن مواد جديدة (مواد ناتجة).',
    status: 'implemented',
    stepIds: ['learned-summary', 'connected-summary'],
    objectiveIds: ['O1', 'O2'],
  },
  {
    id: 'p27-learned-word-equation',
    page: '27',
    category: 'summary',
    sourceItem: 'تعلمتُ — المعادلة الكيميائية اللفظية ومخططها',
    sourceSummary: 'المعادلة الكيميائيّة اللّفظيّة: مواد متفاعلة ───► مواد ناتجة.',
    status: 'implemented',
    stepIds: ['learned-summary', 'connected-summary'],
    objectiveIds: ['O2', 'O6'],
  },
  {
    id: 'p27-learned-combustion',
    page: '27',
    category: 'summary',
    sourceItem: 'تعلمتُ — شرطا الاحتراق التام وغير التام',
    sourceSummary:
      'يحدث الاحتراق التّام عندما تكون كمية الأكسجين كافية. / يحدث الاحتراق غير التّام عندما تكون كمية الأكسجين غير كافية.',
    status: 'implemented',
    stepIds: ['learned-summary', 'connected-summary'],
    objectiveIds: ['O4'],
  },

  // =========================================================================
  // Page 28 — أختبر نفسي: الأسئلة الأول والثاني والثالث
  // =========================================================================
  {
    id: 'p28-q1-heading',
    page: '28',
    category: 'heading',
    sourceItem: 'أختبر نفسي — السؤال الأول',
    sourceSummary: 'أختبر نفسي : / السؤال الأول: اختر الإجابة الصحيحة لكلّ ممّا يأتي:',
    status: 'implemented',
    stepIds: ['book-question-1'],
    objectiveIds: ['O2', 'O3', 'O5'],
  },
  {
    id: 'p28-q1-items',
    page: '28',
    category: 'question',
    sourceItem: 'السؤال الأول — البنود 1–4',
    sourceSummary:
      'أربعة أسئلة اختيار من متعدد بأربعة بدائل لكل منها: (1) نواتج الاحتراق التام لغاز البوتان، (2) الغاز المساعد على احتراق الوقود المنزلي، (3) المسحوق الأبيض المتشكل عند اشتعال المغنزيوم في الهواء، (4) الغاز العديم اللون والسام جداً (CO).',
    status: 'implemented',
    stepIds: ['book-question-1'],
    questionIds: ['l4-book-mc1', 'l4-book-mc2', 'l4-book-mc3', 'l4-book-mc4'],
    objectiveIds: ['O2', 'O3', 'O5'],
  },
  {
    id: 'p28-q2',
    page: '28',
    category: 'question',
    sourceItem: 'السؤال الثاني — إكمال التفاعلات اللفظية 1–3',
    sourceSummary:
      'أكمل التّفاعلات اللّفظيّة الآتية: (1) الأكسجين + المغنزيوم → ، (2) الزّنك + الكبريت → ، (3) الكبريت + الحديد → .',
    status: 'implemented',
    stepIds: ['book-question-2'],
    questionIds: ['l4-book-q2-1', 'l4-book-q2-2', 'l4-book-q2-3'],
    objectiveIds: ['O6'],
  },
  {
    id: 'p28-q3',
    page: '28',
    category: 'question',
    sourceItem: 'السؤال الثالث — كتابة المعادلة اللفظية 1–3',
    sourceSummary:
      'اكتب المعادلة الكيميائيّة اللّفظيّة لكلٍ من التّفاعلات الآتية: (1) احتراق الكربون بالأكسجين وانطلاق غاز ثنائي أكسيد الكربون، (2) تفاعل الهدروجين مع الآزوت وتكوّن النّشادر، (3) تفاعل الزّنك مع الأكسجين وتشكّل أكسيد الزّنك.',
    status: 'implemented',
    stepIds: ['book-question-3'],
    questionIds: ['l4-book-q3-1', 'l4-book-q3-2', 'l4-book-q3-3'],
    objectiveIds: ['O6'],
  },

  // =========================================================================
  // Page 29 — أختبر نفسي: الأسئلة الرابع والخامس والسادس وشكلاه
  // =========================================================================
  {
    id: 'p29-q4',
    page: '29',
    category: 'question',
    sourceItem: 'السؤال الرابع — الموازنة بين نواتج احتراق البوتان',
    sourceSummary: 'وازنْ بين الاحتراق التّام والاحتراق غير التّام لغاز البوتان، من حيث نواتج الاحتراق.',
    status: 'implemented',
    stepIds: ['book-question-4'],
    questionIds: ['l4-book-q4'],
    objectiveIds: ['O5'],
  },
  {
    id: 'p29-q5',
    page: '29',
    category: 'question',
    sourceItem: 'السؤال الخامس — الكشف عن ثنائي أكسيد الكربون تجريبياً',
    sourceSummary: 'كيف يتم الكشف عن غاز ثنائي أكسيد الكربون تجريبيّاً.',
    status: 'implemented',
    stepIds: ['book-question-5'],
    questionIds: ['l4-book-q5'],
    objectiveIds: ['O1'],
  },
  {
    id: 'p29-q6',
    page: '29',
    category: 'question',
    sourceItem: 'السؤال السادس — تمييز الاحتراق وتعليل الطبقة السوداء',
    sourceSummary: 'ميّزْ عملية الاحتراق في الشكلين الآتيين، وعلّلْ تشكّل الطّبقة السوداء كما في الشكل (2):',
    status: 'implemented',
    stepIds: ['book-question-6'],
    questionIds: ['l4-book-q6'],
    objectiveIds: ['O4', 'O5'],
  },
  {
    id: 'p29-figure-q6',
    page: '29',
    category: 'figure',
    sourceItem: 'الشكلان (١) و(٢) المرافقان للسؤال السادس',
    sourceSummary:
      'يميناً الشكل (١): عين موقد غاز منزلي بلهب أزرق منتظم؛ يساراً الشكل (٢): موقد مخبري بلهب أصفر/برتقالي وتعلوه يد تمسك صحن خزف عليه طبقة سوداء.',
    status: 'reconstructed',
    stepIds: ['book-question-6'],
    questionIds: ['l4-book-q6'],
    interactiveIds: ['source-figure-p29-q6'],
    objectiveIds: ['O4', 'O5'],
    justification:
      'صورتا السؤال السادس غير محفوظتين كملفات مسح في المستودع؛ أعيد بناؤهما برسم SVG ثنائي اللوحة يحفظ الترتيب اليميني (١) واليساري (٢) والتسميتين المطبوعتين بالأرقام الهندية العربية، إلى جانب بطاقة وصف مرجعي داخل السؤال.',
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
  for (const entry of LESSON4_LEDGER) {
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
    total: LESSON4_LEDGER.length,
    byPage: ['24', '25', '26', '27', '28', '29'].map((page) => ({
      page,
      count: LESSON4_LEDGER.filter((entry) => entry.page === page).length,
    })),
    byStatus: {
      implemented: LESSON4_LEDGER.filter((entry) => entry.status === 'implemented').length,
      reconstructed: LESSON4_LEDGER.filter((entry) => entry.status === 'reconstructed').length,
      decorative: LESSON4_LEDGER.filter((entry) => entry.status === 'decorative').length,
      unresolved: LESSON4_LEDGER.filter((entry) => entry.status === 'unresolved').length,
    },
    brokenEntries,
  }
}
