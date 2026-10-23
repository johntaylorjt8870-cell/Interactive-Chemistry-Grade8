import type { ContentBlock, LessonDefinition } from './schema'

/* ============================================================================
   الدرس الثالث — صيغةُ المركّباتِ الكيميائيَّةِ — سجل المصدر (الصفحات 18–23)
   ----------------------------------------------------------------------------
   كل عنصر قرأناه في صور الصفحات الست مسجَّل هنا مرّة واحدة، مع موضعه داخل
   المنصة. يحرس السجل اختبار `tests/lesson3Coverage.test.ts`، الذي يتحقّق آليًا:

     * كل مدخل يشير إلى خطوة موجودة فعلًا؛
     * كل سؤال/نشاط كتابي يشير إلى سؤال موجود في طبقة التقييم؛
     * كل سؤال كتابي في طبقة التقييم مذكور هنا (فلا يُسقط سؤال بصمت)؛
     * كل صفحة من صفحات المصدر لها مدخل واحد على الأقل، ولا مدخل خارج 18–23؛
     * لا مدخل `unresolved` (وإلا فشل الاختبار)؛
     * كل إعادة بناء أو عنصر زخرفي له ملاحظة تفسّر قرار التصنيف.

   الحالة لكل مدخل:
     `implemented`   نُفِّذ محتوى المصدر كما هو في المنصة؛
     `reconstructed` أُعيد بناء الشكل أو التمثيل مع حفظ المعلومات العلمية؛
     `decorative`    عنصر قُرئ ولا يحمل معلومة قابلة للتعليم (صورة فوتوغرافية)؛
     `unresolved`    لم يُنفَّذ بعد — يجب أن يكون صفرًا قبل النشر.
   ========================================================================= */

export type Lesson3ObjectiveId = 'O1' | 'O2' | 'O3' | 'O4' | 'O5'

export type Lesson3Objective = {
  id: Lesson3ObjectiveId
  /** صياغة الهدف كما طُبعت في صفحة 18. */
  printed: string
  /** جملة واحدة موجّهة إلى الطالب. */
  studentFacing: string
  page: string
  /** الخطوات التي تُعلّم هذا الهدف. */
  stepIds: string[]
  /** أسئلة الكتاب والتدريبات والاختبار التي تقيسه. */
  questionIds: string[]
}

export const LESSON3_OBJECTIVES: Lesson3Objective[] = [
  {
    id: 'O1',
    printed: 'يتعرّف التكافؤ الكيميائي.',
    studentFacing:
      'أفسّر أن التكافؤ قدرة الذرّة على الارتباط، وأحدّده بطريقتين: عدد الروابط المشتركة في المركّبات المشتركة، وعدد الإلكترونات المفقودة أو المكتسبة في المركّبات الأيونية.',
    page: '18',
    stepIds: ['valence-models', 'valence-lab', 'valence-why', 'ionic-equations', 'ionic-valence', 'valence-table', 'valence-table-reading', 'summary'],
    questionIds: ['l3-act-models', 'l3-act-ion-table', 'l3-book-tf-3', 'l3-practice-1', 'l3-practice-2', 'l3-practice-3', 'l3-practice-4', 'l3-practice-5', 'l3-practice-6', 'l3-practice-24', 'l3-final-2', 'l3-final-3', 'l3-final-4', 'l3-final-12'],
  },
  {
    id: 'O2',
    printed: 'يتعرّف بعض الجذور الكيميائية.',
    studentFacing:
      'أعرّف الجذر الكيميائي، وأميّز الجذور الثمانية المطبوعة بصيغها وتكافؤاتها، وأستخرج تكافؤ الجذر من عدد شحناته أو من عدد أيونات الهيدروجين التي تعادله.',
    page: '18',
    stepIds: ['radicals-intro', 'radical-definition', 'radicals-table', 'summary'],
    questionIds: ['l3-act-dissociation', 'l3-practice-7', 'l3-practice-8', 'l3-practice-9', 'l3-practice-10', 'l3-practice-11', 'l3-final-5', 'l3-final-6'],
  },
  {
    id: 'O3',
    printed: 'يكتب الصيغة الأيونية لمركّب كيميائي.',
    studentFacing:
      'أكتب صيغة مركّب أيوني بمراحل الكتاب الأربع، محقّقًا التعادل الكهربائي، وواضعًا القوس حول الجذر المتكرّر، ومدقّقًا أن مجموع الشحنات صفر.',
    page: '18',
    stepIds: ['writing-formula', 'stages', 'formula-builder-lab', 'worked-aluminium-sulfate', 'worked-calcium-oxide', 'parentheses-verify', 'summary'],
    questionIds: ['l3-act-steps', 'l3-act-applied-aluminium-sulfate', 'l3-act-applied-calcium-oxide', 'l3-book-q3-1', 'l3-book-q3-2', 'l3-book-q3-3', 'l3-book-q3-4', 'l3-practice-12', 'l3-practice-13', 'l3-practice-14', 'l3-practice-15', 'l3-practice-16', 'l3-final-7', 'l3-final-8', 'l3-final-9', 'l3-final-10', 'l3-final-11', 'l3-final-13'],
  },
  {
    id: 'O4',
    printed: 'يميّز بين الرمز والصيغة.',
    studentFacing:
      'أميّز رمز العنصر من صيغة المركّب، وأقرأ الصيغة الكيميائية قراءة صحيحة: الأُسّ السفلي، والقوس، والمعامل، والشحنة.',
    page: '18',
    stepIds: ['reading-formula', 'symbol-vs-formula', 'parentheses-verify', 'summary'],
    questionIds: ['l3-act-intro', 'l3-book-tf-1', 'l3-book-tf-2', 'l3-book-tf-4', 'l3-practice-17', 'l3-practice-18', 'l3-practice-19', 'l3-practice-20', 'l3-final-1', 'l3-final-14'],
  },
  {
    id: 'O5',
    printed: 'يسمّي بعض المركّبات الكيميائية.',
    studentFacing:
      'أسمّي مركّبًا من صيغته: أذكر اسم الجزء السالب ثم الموجب، وأضيف الرقم الروماني فقط حين يكون للفلز أكثر من تكافؤ.',
    page: '18',
    stepIds: ['naming', 'naming-workshop', 'summary'],
    questionIds: ['l3-book-mc-1', 'l3-book-mc-2', 'l3-book-q4-1', 'l3-book-q4-2', 'l3-book-q4-3', 'l3-book-q4-4', 'l3-book-q5', 'l3-practice-21', 'l3-practice-22', 'l3-practice-23', 'l3-final-15', 'l3-final-16', 'l3-final-17', 'l3-final-18'],
  },
]

export function getLesson3Objective(id: string): Lesson3Objective | undefined {
  return LESSON3_OBJECTIVES.find((objective) => objective.id === id)
}

/* --------------------------------------------------------------------------- */

export type LedgerKind =
  | 'heading'
  | 'objective'
  | 'keyword'
  | 'prompt'
  | 'figure'
  | 'table'
  | 'rule'
  | 'definition'
  | 'activity'
  | 'example'
  | 'question'
  | 'summary'
  | 'photo'
  | 'pagination'

export type LedgerStatus = 'implemented' | 'reconstructed' | 'decorative' | 'unresolved'

export type Lesson3LedgerItem = {
  id: string
  page: string
  kind: LedgerKind
  /** موضع العنصر في الصفحة. */
  locator: string
  /** وصف موجز لما في المصدر. */
  title: string
  /** البيانات التي يجب أن تبقى (نقل حرفي أو وصف دقيق). */
  excerpt?: string
  /** معرّفات الخطوات التي تحمل هذا العنصر. */
  implementedBy: string[]
  /** معرّفات الأسئلة التي تحمل العنصر (للأسئلة والأنشطة). */
  questionIds?: string[]
  status: LedgerStatus
  /** ملاحظة إلزامية عند reconstruction / decorative، وعند أي غموض حقيقي. */
  note?: string
}

export const LESSON3_LEDGER: Lesson3LedgerItem[] = [
  /* -------------------------------- صفحة 18 -------------------------------- */
  {
    id: 'p18-title',
    page: '18',
    kind: 'heading',
    locator: 'رأس الصفحة: الرقم 3 ثم العنوان',
    title: 'عنوان الدرس: صيغةُ المركّباتِ الكيميائيَّةِ',
    excerpt: 'صيغةُ المركّباتِ الكيميائيَّةِ',
    implementedBy: ['entry'],
    status: 'implemented',
  },
  {
    id: 'p18-objectives',
    page: '18',
    kind: 'objective',
    locator: 'صندوق «الأهداف» — خمسة بنود',
    title: 'أهداف الدرس الخمسة',
    excerpt:
      'يتعرّف التكافؤ الكيميائي. — يتعرّف بعض الجذور الكيميائية. — يكتب الصيغة الأيونية لمركّب كيميائي. — يميّز بين الرمز والصيغة. — يسمّي بعض المركّبات الكيميائية.',
    implementedBy: ['entry', 'summary'],
    status: 'implemented',
    note: 'لكل هدفٍ خريطة في LESSON3_OBJECTIVES تربطه بخطواته وأسئلته، ويتحقّق منها الاختبار آليًا.',
  },
  {
    id: 'p18-keywords',
    page: '18',
    kind: 'keyword',
    locator: 'صندوق «الكلمات المفتاحية»',
    title: 'الكلمات المفتاحية الأربع',
    excerpt: 'صيغة كيميائية – التكافؤ الكيميائي – مركّب كيميائي – جذر كيميائي.',
    implementedBy: ['entry'],
    status: 'implemented',
  },
  {
    id: 'p18-opening-question',
    page: '18',
    kind: 'prompt',
    locator: 'السطر التمهيدي فوق الصورة',
    title: 'السؤال التمهيدي عن صيغة الماء',
    excerpt:
      'تتّحد ذرّتا هيدروجين مع ذرّة أكسجين فيتكوّن جزيء الماء، فما الصيغة الكيميائية لجزيء الماء؟',
    implementedBy: ['entry', 'discovery-water'],
    questionIds: ['l3-act-intro'],
    status: 'implemented',
  },
  {
    id: 'p18-photo',
    page: '18',
    kind: 'photo',
    locator: 'الصورة الكبيرة وسط الصفحة',
    title: 'صورة تعبيرية لمسطح ماء',
    implementedBy: ['discovery-water'],
    status: 'decorative',
    note: 'صورة فوتوغرافية تعبيرية لا تحمل بيانات كيميائية (لا تسميات ولا أرقام)؛ تُذكر إشارةً وصفية في خطوة الاستكشاف ولا تُحفظ كملف في المستودع.',
  },
  {
    id: 'p18-page-number',
    page: '18',
    kind: 'pagination',
    locator: 'أسفل الصفحة',
    title: 'رقم الصفحة 18',
    implementedBy: ['entry'],
    status: 'implemented',
    note: 'رقم الصفحة يُحفظ بوصفه مرجع المصدر في كل خطوة وفي مساحة المعلم.',
  },

  /* -------------------------------- صفحة 19 -------------------------------- */
  {
    id: 'p19-title',
    page: '19',
    kind: 'heading',
    locator: 'العنوان الأحمر ثم العنوان الفرعي الأزرق',
    title: 'التكافئ الكيميائي — ألاحظ وأستنتج',
    excerpt: 'التَّكافُؤُ الكيميائِيُّ: / أُلاحِظُ وأستنتجُ:',
    implementedBy: ['valence-models'],
    status: 'implemented',
  },
  {
    id: 'p19-models-figure',
    page: '19',
    kind: 'figure',
    locator: 'صندوق الأشكال: ثلاثة نماذج كروية–عصوية',
    title: 'نماذج H₂O وNH₃ وCH₄ بعدد روابطها',
    excerpt: 'H₂O (الماء) — NH₃ (النشادر) — CH₄ (الميتان)',
    implementedBy: ['valence-models', 'valence-lab'],
    status: 'reconstructed',
    note:
      'الشكل المطبوع صور كرات وعصيّ؛ لا تُحفظ مسحات الكتاب في المستودع، فقُرئت بنيته (مركز + ذرّات هيدروجين + عدد الروابط) وعُرض جدول قراءة وتشكيل حركي في مختبر مسجَّل. كل الأعداد (4/3/2/1) منقولة من الشكل والبنود المطبوعة، ولا تُضاف أي ذرّة لم تُطبع.',
  },
  {
    id: 'p19-observation-items',
    page: '19',
    kind: 'rule',
    locator: 'أربعة بنود تحت النماذج',
    title: 'بنود الملاحظة الأربعة',
    excerpt:
      'شكّل الكربون أربع روابط مشتركة مع أربع ذرّات هيدروجين في جزيء الميتان. وشكّل النتروجين ثلاث روابط مشتركة مع ثلاث ذرّات هيدروجين في جزيء النشادر. وشكّل الأكسجين رابطتين مشتركتين مع ذرّتَي هيدروجين في جزيء الماء. وشكّلت كل ذرّة هيدروجين رابطة مشتركة واحدة.',
    implementedBy: ['valence-models'],
    questionIds: ['l3-act-models'],
    status: 'implemented',
  },
  {
    id: 'p19-conclusion-covalent',
    page: '19',
    kind: 'rule',
    locator: 'صندوق «أستنتج» الأول',
    title: 'تعريف التكافؤ في المركّبات ذات الروابط المشتركة',
    excerpt:
      'التكافؤ الكيميائي في المركّبات ذات الروابط المشتركة يساوي عدد الروابط التي اشتركت بها الذرّة.',
    implementedBy: ['valence-models', 'valence-why', 'learn-box', 'summary'],
    status: 'implemented',
  },
  {
    id: 'p19-ion-instruction',
    page: '19',
    kind: 'prompt',
    locator: 'السطر التمهيدي فوق المعادلات الأيونية',
    title: 'صيغة الأمر المطبوعة قبل المعادلات',
    excerpt: 'ألاحظ المعادلات الأيونية الآتية، وأملأ الجدول الآتي:',
    implementedBy: ['ionic-equations'],
    status: 'implemented',
    note:
      'تصحيح موثَّق (تنقيح 4، 2026-10-23): تقرير الوضوح تنقيح 3 سجّل «أَرْبِطُ المعادلاتِ الأيُونيّةِ الآتيّةِ»، والقصّة المكبَّرة 500% تُظهر «ألاحظ المعادلات الأيونية الآتية، وأملأ الجدول الآتي:». نُقلت القراءة المصحَّحة إلى الدرس والاختبار، وصُحّح التقرير.',
  },
  {
    id: 'p19-ion-equations',
    page: '19',
    kind: 'rule',
    locator: 'يسار الصفحة، خمس معادلات',
    title: 'المعادلات الأيونية الخمس',
    excerpt: 'Na → Na⁺ + e⁻ / Ca → Ca²⁺ + 2e⁻ / Mg → Mg²⁺ + 2e⁻ / Cl + e⁻ → Cl⁻ / O + 2e⁻ → O²⁻',
    implementedBy: ['ionic-equations', 'ionic-valence'],
    status: 'implemented',
  },
  {
    id: 'p19-ion-table',
    page: '19',
    kind: 'table',
    locator: 'الجدول الأصفر: ثلاثة صفوف وستة أعمدة',
    title: 'جدول نشاط الأيونات: الذرّة والأيون وعدد الإلكترونات',
    excerpt:
      'الأعمدة: الذرّة | Na | Ca | Mg | Cl | O. الصفوف: الذرّة، الأيُون، عدد الإلكترونات التي فقدها أو اكتسبتها الذرّة. مثال الصوديوم معبَّأ في صفّ الأيون فقط.',
    implementedBy: ['ionic-equations'],
    questionIds: ['l3-act-ion-table'],
    status: 'implemented',
    note: 'صفّ الذرّة وصفّ العدد فارغان إلا مثال Na⁺ كما طُبعا؛ الحل الكامل يُعرض في مساحة المعلم فقط.',
  },
  {
    id: 'p19-conclusion-ionic',
    page: '19',
    kind: 'rule',
    locator: 'صندوق «أستنتج» الثاني',
    title: 'تعريف التكافؤ في المركّبات ذات الروابط الأيونية',
    excerpt:
      'التكافؤ الكيميائي في المركّبات ذات الروابط الأيونية هو: عدد الإلكترونات التي تفقدها أو تكتسبها ذرّة عنصر ما عند ارتباطها بذرّة عنصر آخر.',
    implementedBy: ['ionic-equations', 'ionic-valence', 'learn-box', 'summary'],
    status: 'implemented',
  },

  /* -------------------------------- صفحة 20 -------------------------------- */
  {
    id: 'p20-valence-table',
    page: '20',
    kind: 'table',
    locator: 'أعلى الصفحة: كتلتان متجاورتان كل واحدة 8 صفوف',
    title: 'جدول تكافؤات بعض العناصر (16 عنصرًا)',
    excerpt:
      'Na:1، H:1، Br:1، K:1، Cl:1، Ag:1، S:2، Mg:2 / Ca:2، O:2، Zn:2، Al:3، Fe(III):3، Fe(II):2، Cu(II):2، Cu(I):1',
    implementedBy: ['valence-table', 'valence-table-reading'],
    questionIds: ['l3-practice-5', 'l3-practice-6'],
    status: 'implemented',
    note: 'أُعيد إخراج الجدول بكتلتيه المتجاورتين (عمودا عنصر/تكافؤ مرّتين) بدل قائمة مسطَّحة، حفاظًا على بنية الطباعة.',
  },
  {
    id: 'p20-radicals-title',
    page: '20',
    kind: 'heading',
    locator: 'العنوان الأزرق وسط الصفحة',
    title: 'بعض الجذور الكيميائية وتكافؤاتها',
    excerpt: 'بعض الجذور الكيميائية وتكافؤاتها:',
    implementedBy: ['radicals-intro'],
    status: 'implemented',
  },
  {
    id: 'p20-radicals-origin',
    page: '20',
    kind: 'rule',
    locator: 'السطر الأول تحت العنوان',
    title: 'منشأ الجذور الكيميائية',
    excerpt:
      '«… الجذور الكيميائية عن تأيّن مركّبات الحموض أو مركّبات الأسس.» — الفعل الأول غير مقروء تمامًا في الصورة المرفقة (يظهر كـ«تـ…ـج»).',
    implementedBy: ['radicals-intro', 'radical-definition'],
    status: 'reconstructed',
    note:
      'الجزء المقروء من السطر منقول حرفيًا، والفعل الأول غير واضح في دقّة الصورة المتاحة. صيغ المعنى في الدرس بجملة من وسم «المنصة» («تنشأ الجذور الكيميائية عن تأيّن مركّبات الحموض أو مركّبات الأسس») ولم يُنسب الفعل إلى الطباعة، وسُجّلت الملاحظة في تقرير الوضوح (تنقيح 4).',
  },
  {
    id: 'p20-dissociation-instruction',
    page: '20',
    kind: 'prompt',
    locator: 'السطر التمهيدي فوق معادلات التأين',
    title: 'صيغة الأمر المطبوعة قبل معادلات التأيّن',
    excerpt: 'ألاحظ معادلات التأيّن الآتية:',
    implementedBy: ['radicals-intro'],
    status: 'implemented',
    note: 'نُقل بنصّه المطبوع، ومنه ضبط لفظ «التأيّن» في العنوان وفي وصف النشاط.',
  },
  {
    id: 'p20-dissociation-equations',
    page: '20',
    kind: 'rule',
    locator: 'خمس معادلات تأين',
    title: 'معادلات التأين الخمس',
    excerpt: 'HNO₃ → H⁺ + NO₃⁻ / H₂SO₄ → 2H⁺ + SO₄²⁻ / H₃PO₄ → 3H⁺ + PO₄³⁻ / NaOH → Na⁺ + OH⁻ / NH₄OH → NH₄⁺ + OH⁻',
    implementedBy: ['radicals-intro', 'radical-definition'],
    status: 'implemented',
  },
  {
    id: 'p20-radical-instructions',
    page: '20',
    kind: 'activity',
    locator: 'ثلاث تعليمات مرقّمة تحت المعادلات',
    title: 'تعليمات نشاط التفكك الثلاث',
    excerpt:
      '1) ألاحظ الأيونات الناتجة عن تفكك كلٍّ من المركّبات السابقة. 2) أميّز المجموعات الذرّية في نواتج المعادلات الكيميائية السابقة. 3) أستنتج تكافؤ كلٍّ من المجموعات الذرّية السابقة.',
    implementedBy: ['radicals-intro'],
    questionIds: ['l3-act-dissociation'],
    status: 'implemented',
  },
  {
    id: 'p20-radical-definition',
    page: '20',
    kind: 'definition',
    locator: 'صندوق «تعرّف» أسفل الصفحة',
    title: 'تعريف الجذر الكيميائي',
    excerpt: 'الجذر الكيميائي: مجموعة ذرّات مترابطة بقوّة تسلك سلوك أيون أو ذرّة عنصر.',
    implementedBy: ['radical-definition', 'summary'],
    questionIds: ['l3-final-6'],
    status: 'implemented',
  },

  /* -------------------------------- صفحة 21 -------------------------------- */
  {
    id: 'p21-radicals-table',
    page: '21',
    kind: 'table',
    locator: 'الجدول البنفسجي أعلى الصفحة: كتلتان متجاورتان',
    title: 'جدول الجذور الثمانية وتكافؤاتها',
    excerpt:
      'جذور النترات NO₃⁻:1، جذور الكبريتات SO₄²⁻:2، جذور الكربونات CO₃²⁻:2، جذور الفوسفات PO₄³⁻:3 / جذور الفورمات HCOO⁻:1، جذور الخلّات CH₃COO⁻:1، جذور الهيدروكسيل OH⁻:1، جذور الأمونيوم NH₄⁺:1',
    implementedBy: ['radicals-table'],
    questionIds: ['l3-practice-8', 'l3-final-5'],
    status: 'implemented',
  },
  {
    id: 'p21-formula-title',
    page: '21',
    kind: 'heading',
    locator: 'العنوان الأحمر ثم العنوان الفرعي الأزرق',
    title: 'كتابة الصيغة الكيميائية لبعض المركّبات — أفكّر وأستنتج',
    excerpt: 'كتابة الصيغة الكيميائية لبعض المركّبات: / أفكّر وأستنتج:',
    implementedBy: ['writing-formula'],
    status: 'implemented',
  },
  {
    id: 'p21-steps-examples',
    page: '21',
    kind: 'example',
    locator: 'الجدول الأصفر بعنوان جانبي «خطوات كتابة صيغة مركّب كيميائي»',
    title: 'مثالا كتابة الصيغة: كلوريد الزنك وأكسيد الألمنيوم',
    excerpt:
      'اسم المركّب: كلوريد الزنك | أكسيد الألمنيوم. 1. أكتبُ أيونات المركّب: Zn²⁺ | Cl⁻ ‖ Al³⁺ | O²⁻. 2. أحقّقُ التعادل الكهربائي: (+2)(......) + (−1)(......) = 0 ‖ (+3)(......) + (−2)(......) = 0. 3. أكتبُ صيغة المركّب: 1 × Zn²⁺ | 2 × Cl⁻ ‖ 2 × Al³⁺ | 3 × O²⁻. الناتج: ZnCl₂ ‖ Al₂O₃.',
    implementedBy: ['writing-formula'],
    questionIds: ['l3-act-steps'],
    status: 'reconstructed',
    note:
      'تصحيح واعادة تمثيل موثَّقتان (تنقيح 4): الطباعة تضع عنوانًا جانبيًا «خطوات كتابة صيغة مركّب كيميائي» وصفَّ رأس داخل الجدول «اسم المركّب» ثم اسمَي المركّبين، وصفوفًا مرقَّمة 1/2/3 بألفاظ «أكتبُ أيونات المركّب» و«أحقّقُ التعادل الكهربائي» و«أكتبُ صيغة المركّب». نُقلت أسماء المركّبين إلى رؤوس الأعمدة لالتزام بنية الجدول وعناصر الوصول، وبقيت ألفاظ الصفوف والأرقام والفراغات الست كما طُبعت؛ الفرق مبيَّن في حاشية الجدول.',
  },
  {
    id: 'p21-stages',
    page: '21',
    kind: 'rule',
    locator: 'صندوق «أستنتج» أسفل الصفحة',
    title: 'مراحل كتابة صيغة كيميائية (أربع مراحل)',
    excerpt:
      '1) أكتبُ رموز (صيغ أو جذور) مكوّنات الصيغة. 2) أكتبُ التكافؤات. 3) أبادلُ بين تكافؤات مكوّنات الصيغة بحيث يتحقق التعادل الكهربائي. 4) أحصلُ على الصيغة المطلوبة.',
    implementedBy: ['stages', 'learn-box', 'summary'],
    questionIds: ['l3-final-8'],
    status: 'implemented',
  },

  /* -------------------------------- صفحة 22 -------------------------------- */
  {
    id: 'p22-applied-title',
    page: '22',
    kind: 'heading',
    locator: 'صندوق الإطار البنفسجي أعلى الصفحة',
    title: 'تطبيق محلول',
    excerpt: 'تطبيق محلول:',
    implementedBy: ['worked-aluminium-sulfate', 'worked-calcium-oxide'],
    status: 'implemented',
  },
  {
    id: 'p22-applied-aluminium-sulfate',
    page: '22',
    kind: 'example',
    locator: 'التطبيق الأول: الأمر، الجدول، الأسهم المتقاطعة، الصيغة',
    title: 'مثال محلول: كبريتات الألمنيوم Al₂(SO₄)₃',
    excerpt:
      '1. أكتبُ صيغة كبريتات الألمنيوم: / جدول «المكوّنات»: كبريتات SO₄ بتكافؤ 2، والألمنيوم Al بتكافؤ 3 / الصيغة: Al₂(SO₄)₃',
    implementedBy: ['worked-aluminium-sulfate'],
    questionIds: ['l3-act-applied-aluminium-sulfate'],
    status: 'implemented',
    note: 'الجدول يُعرض بصفّيه المطبوعين (صفّ الرموز بخانة تسمية فارغة، وصفّ التكافؤ) كما في القصّة، ورأس عموده الأول «المكوّنات» (لا «المؤلّفان» كما سجّل تنقيح 3).',
  },
  {
    id: 'p22-applied-calcium-oxide',
    page: '22',
    kind: 'example',
    locator: 'التطبيق الثاني: الأمر، الجدول، الأسهم، الصيغة',
    title: 'مثال محلول: أكسيد الكالسيوم CaO',
    excerpt: '2. أكتبُ صيغة أكسيد الكالسيوم: / O بتكافؤ 2، وCa بتكافؤ 2 / الصيغة: CaO',
    implementedBy: ['worked-calcium-oxide'],
    questionIds: ['l3-act-applied-calcium-oxide'],
    status: 'implemented',
  },
  {
    id: 'p22-learn-box',
    page: '22',
    kind: 'summary',
    locator: 'صندوق «تعلّمتُ» أسفل الصفحة',
    title: 'خلاصة الدرس في أربعة بنود',
    excerpt:
      '1) التكافؤ الكيميائي في المركّبات الأيونيّة: هو عدد الإلكترونات التي تفقدها أو تكتسبها ذرّة عنصر ما عند ارتباطها بذرّة عنصر آخر في المركّب الأيونيّ. 2) التكافؤ الكيميائي في المركّبات ذات الروابط المشتركة: عدد الأزواج الإلكترونية التي اشتركت بها الذرّة مع ذرة أخرى. 3) الجذر الكيميائي: مجموعة ذرّية مترابطة تسلك سلوك ذرّة واحدة. 4) مراحل كتابة صيغة كيميائية: أكتبُ رموز (صيغ أو جذور) مكوّنات الصيغة، أكتبُ التكافؤات، أبادلُ بين تكافؤات مكونات الصيغة بحيث يتحقق التعادل الكهربائي، أحصلُ على الصيغة المطلوبة.',
    implementedBy: ['learn-box'],
    status: 'implemented',
    note:
      'عنوان الصندوق المطبوع «تعلّمتُ:» (لا «تعلَّمْ» كما سجّل تنقيح 3). وبند الجذر هنا «مجموعة ذرّية مترابطة تسلك سلوك ذرّة واحدة» ويختلف لفظًا عن تعريف ص20 («مجموعة ذرّات مترابطة بقوّة تسلك سلوك أيون أو ذرّة عنصر»)؛ نُقل كلٌّ في موضعه، وبيّنت المنصة العلاقة بينهما في خطوة الخلاصة.',
  },

  /* -------------------------------- صفحة 23 -------------------------------- */
  {
    id: 'p23-heading',
    page: '23',
    kind: 'heading',
    locator: 'العنوان فوق الأسئلة',
    title: 'أختبر نفسي',
    excerpt: 'أختبر نفسي:',
    implementedBy: ['book-check-q1', 'book-check-q2', 'book-check-q3', 'book-check-q4', 'book-check-q5'],
    status: 'implemented',
  },
  {
    id: 'p23-q1',
    page: '23',
    kind: 'question',
    locator: 'السؤال الأول: أربع عبارات',
    title: 'صواب/خطأ في الرمز والصيغة والتكافؤ',
    excerpt:
      'ضع إشارة (✓) أمام العبارة الصحيحة و إشارة (✗) أمام العبارة الغلط لكلّ من الجمل الآتية: 1) رمز الصوديوم هو Na⁺. 2) صيغة حمض الكبريت هي H₂SO₄. 3) تكافؤ البوتاسيوم يساوي (3). 4) صيغة الماء هي H₂O.',
    implementedBy: ['book-check-q1'],
    questionIds: ['l3-book-tf-1', 'l3-book-tf-2', 'l3-book-tf-3', 'l3-book-tf-4'],
    status: 'implemented',
    note:
      'العبارة الثالثة المطبوعة هي «تكافؤ البوتاسيوم يساوي (3)» — لا «الألمنيوم» — وهي خاطئة لأن تكافؤ البوتاسيوم في جدول ص20 يساوي 1، فإجابتها (✗). ونُقلت تعليمة السؤال المطبوعة بنصّها.',
  },
  {
    id: 'p23-q2',
    page: '23',
    kind: 'question',
    locator: 'السؤال الثاني: فقرتان بأربعة خيارات لكلٍّ منهما',
    title: 'اختيار الإجابة الصحيحة: CaCO₃ وأكسيد الزنك',
    excerpt:
      '1) الصيغة CaCO₃ تسمّى: a) كربيتيد الكالسيوم. b) كبريتات الكالسيوم. c) كربون أكسيجين الكالسيوم. d) كربونات الكالسيوم. 2) الصيغة الكيميائية لأكسيد الزنك هي: a) ZnCO₃ b) ZnO c) ZnSO₄ d) ZnCl₂.',
    implementedBy: ['book-check-q2'],
    questionIds: ['l3-book-mc-1', 'l3-book-mc-2'],
    status: 'implemented',
    note:
      'تصحيح موثَّق: خيارات الفقرة الأولى نُقلت الآن بلفظها المطبوع، والصحيح d (كربونات الكالسيوم). النسخة السابقة استبدلت الخيارين c وd بلفظين غير مطبوعين وجعلت المفتاح c.',
  },
  {
    id: 'p23-q3',
    page: '23',
    kind: 'question',
    locator: 'السؤال الثالث: جدول المادّة/صيغتها',
    title: 'كتابة صيغ أربع مواد',
    excerpt: 'اكتب صيغة كلٍّ من المركّبات الآتية: كبريتات الكالسيوم — أكسيد النحاس I — هيدروكسيد الصوديوم — خَلّات الزنك',
    implementedBy: ['book-check-q3'],
    questionIds: ['l3-book-q3-1', 'l3-book-q3-2', 'l3-book-q3-3', 'l3-book-q3-4'],
    status: 'implemented',
    note:
      'تصحيح موثَّق (تنقيح 4): الموادّ المطبوعة هي كبريتات الكالسيوم وأكسيد النحاس I (لا كبريتات الألمنيوم وأكسيد الحديد I كما سجّل تنقيح 3). والترتيب القرائي من اليمين إلى اليسار: كبريتات الكالسيوم، أكسيد النحاس I، هيدروكسيد الصوديوم، خَلّات الزنك. والحلول المقابلة: CaSO₄، Cu₂O، NaOH، Zn(CH₃COO)₂.',
  },
  {
    id: 'p23-q4',
    page: '23',
    kind: 'question',
    locator: 'السؤال الرابع: جدول الصيغة/اسم المادة',
    title: 'تسمية أربع صيغ',
    excerpt: 'اكتب اسم كلٍّ من المركّبات الآتية: FeO — Al(NO₃)₃ — NH₄Cl — ZnSO₄',
    implementedBy: ['book-check-q4'],
    questionIds: ['l3-book-q4-1', 'l3-book-q4-2', 'l3-book-q4-3', 'l3-book-q4-4'],
    status: 'implemented',
    note: 'الترتيب القرائي من اليمين إلى اليسار كما طُبع: FeO ثم Al(NO₃)₃ ثم NH₄Cl ثم ZnSO₄.',
  },
  {
    id: 'p23-q5',
    page: '23',
    kind: 'question',
    locator: 'السؤال الخامس: خمس مواد شائعة',
    title: 'الاسم العلمي والصيغة لخمس مواد شائعة',
    excerpt:
      'ابحث عن الاسم العلمي لكلٍّ من المركّبات الآتية، ثم اكتب الصيغة الكيميائية لكلٍّ منها: ملح الطعام - الجبس - الحجر الكلسي - الكلس الحي - رائق الكلس.',
    implementedBy: ['book-check-q5'],
    questionIds: ['l3-book-q5'],
    status: 'implemented',
  },
  {
    id: 'p23-page-number',
    page: '23',
    kind: 'pagination',
    locator: 'أسفل الصفحة',
    title: 'رقم الصفحة 23',
    implementedBy: ['book-check-q5'],
    status: 'implemented',
    note: 'آخر صفحة في الدرس؛ مرجعها ظاهر في كل سؤالٍ مطبوع.',
  },
]

/* --------------------------------------------------------------------------- */

export type Lesson3Coverage = {
  total: number
  implemented: number
  reconstructed: number
  decorative: number
  unresolved: number
  byPage: Record<string, number>
  danglingSteps: Array<{ item: string; stepId: string }>
  danglingQuestions: Array<{ item: string; questionId: string }>
  unlistedTextbookQuestions: string[]
  pagesWithoutEntries: string[]
}

function allQuestionIds(lesson: LessonDefinition): Set<string> {
  const ids = new Set<string>()
  const walk = (questions: NonNullable<LessonDefinition['tests']>[number]['questions']) => {
    for (const question of questions) {
      ids.add(question.id)
      if (question.type === 'table-interpretation' || question.type === 'diagram-interpretation') {
        walk(question.questions)
      }
    }
  }
  for (const test of lesson.tests ?? []) walk(test.questions)
  return ids
}

/**
 * يحسب التغطية الفعلية للسجل مقابل تعريف الدرس.
 * لا يعتمد على أي نص مكتوب يدويًا: الخطوة والسؤال المذكوران يجب أن يوجدا فعلًا،
 * وكل سؤال كتابي يجب أن يكون مذكورًا في السجل.
 */
export function computeLedgerCoverage(lesson: LessonDefinition): Lesson3Coverage {
  const stepIds = new Set(lesson.steps.map((step) => step.id))
  const questionIds = allQuestionIds(lesson)
  const danglingSteps: Lesson3Coverage['danglingSteps'] = []
  const danglingQuestions: Lesson3Coverage['danglingQuestions'] = []

  for (const item of LESSON3_LEDGER) {
    for (const stepId of item.implementedBy) {
      if (!stepIds.has(stepId)) danglingSteps.push({ item: item.id, stepId })
    }
    for (const questionId of item.questionIds ?? []) {
      if (!questionIds.has(questionId)) danglingQuestions.push({ item: item.id, questionId })
    }
  }

  const listed = new Set(LESSON3_LEDGER.flatMap((item) => item.questionIds ?? []))
  const unlistedTextbookQuestions: string[] = []
  for (const test of lesson.tests ?? []) {
    for (const question of test.questions) {
      if (question.origin === 'textbook' && !listed.has(question.id)) unlistedTextbookQuestions.push(question.id)
    }
  }

  const byPage: Record<string, number> = {}
  for (const item of LESSON3_LEDGER) byPage[item.page] = (byPage[item.page] ?? 0) + 1

  const pages = lesson.source.pages.map((page) => page.page)
  const pagesWithoutEntries = pages.filter((page) => !byPage[page])

  return {
    total: LESSON3_LEDGER.length,
    implemented: LESSON3_LEDGER.filter((item) => item.status === 'implemented').length,
    reconstructed: LESSON3_LEDGER.filter((item) => item.status === 'reconstructed').length,
    decorative: LESSON3_LEDGER.filter((item) => item.status === 'decorative').length,
    unresolved: LESSON3_LEDGER.filter((item) => item.status === 'unresolved').length,
    byPage,
    danglingSteps,
    danglingQuestions,
    unlistedTextbookQuestions,
    pagesWithoutEntries,
  }
}

/** كتل خطوة معيّنة، يستخدمها الاختبار لفحص المحتوى نفسه لا أسماء الملفات. */
export function stepBlocks(lesson: LessonDefinition, stepId: string): ContentBlock[] {
  return lesson.steps.find((step) => step.id === stepId)?.blocks ?? []
}
