import type { ContentBlock, LessonDefinition } from './schema'

/* ============================================================================
   الدرس السادس — «المعادلة الكيميائيّة» — سجل المصدر (الصفحات 36–39)
   ----------------------------------------------------------------------------
   يوثّق هذا السجل كل عنصر مطبوع في صور الصفحات الأربع المرفقة (`image-1.png`
   إلى `image-4.png` — الصفحات 36–39)، ويربطه بالخطوات والأسئلة المنفّذة فعلياً
   في المنصة. يحرس هذا السجل ملف الاختبار `tests/lesson6Coverage.test.tsx`:

     * كل مدخل يشير إلى خطوة موجودة فعلاً في `chemistryLesson6`؛
     * كل سؤال أو نشاط كتابي يشير إلى معرّف موجود في طبقة التقييم؛
     * كل سؤال كتابي في طبقة التقييم مذكور في السجل (فلا يسقط أي بند بصمت)؛
     * كل صفحة من الصفحات 36–39 ممثّلة بمدخلات كاملة ومفصّلة؛
     * لا عنصر في حالة `unresolved`.

   الحالات المعتمدة:
     `implemented`   نُفِّذ محتوى المصدر بنصّه وترتيبه في المنصة؛
     `reconstructed` أُعيد بناء الشكل تخطيطياً بـ SVG مع حفظ جميع وسومه العلمية؛
     `decorative`    صورة فوتوغرافية تمهيدية وُثِّق مضمونها دون تضمين المسح النقطي.
   ========================================================================= */

export type Lesson6ObjectiveId = 'O1' | 'O2' | 'O3' | 'O4' | 'O5'

export type Lesson6Objective = {
  id: Lesson6ObjectiveId
  /**
   * `textbook` — هدف مطبوع حرفياً في صفحة 36.
   * `platform` — هدف تقويمي معلَن من إضافة المنصة لتشخيص الأخطاء والتحقق الكمي،
   * ولا يُنسَب إلى نص الكتاب.
   */
  origin: 'textbook' | 'platform'
  printed: string
  studentFacing: string
  page: string
  stepIds: string[]
}

export const LESSON6_OBJECTIVES: Lesson6Objective[] = [
  {
    id: 'O1',
    origin: 'textbook',
    printed: 'يميّزُ رموز الحالة الفيزيائيّة للمواد في المعادلة الكيميائيّة.',
    studentFacing:
      'أميّز بدقة رموز الحالات الفيزيائيّة الأربع (s) و(l) و(aq) و(g) أسفل يمين الصيغة، وأفرّق بين السائل النقي (l) والمحلول المائي (aq)، وبينها وبين رمز التسخين Δ فوق السهم.',
    page: '36',
    stepIds: [
      'entry-source',
      'foundation-reaction-anatomy',
      'observe-and-state-table-source',
      'state-symbols-deep',
      'word-to-symbol-builder',
      'learned-box-source',
      'comprehensive-summary',
    ],
  },
  {
    id: 'O2',
    origin: 'textbook',
    printed: 'يعبّرُ عن التفاعل الكيميائيّ بمعادلة كيميائيّة.',
    studentFacing:
      'أصف التفاعل الكيميائي بمعادلة لفظية ثم بمعادلة رمزية تضع المتفاعلات يسار السهم والنواتج يمينه، وأفهم جانبَي المعادلة الوصفي والكمّي.',
    page: '36',
    stepIds: [
      'discovery-opening',
      'entry-source',
      'foundation-reaction-anatomy',
      'experiment-zinc-hcl-source',
      'experiment-observation-vs-interpretation',
      'zinc-hcl-virtual-lab',
      'observe-and-state-table-source',
      'conclude-equation-source',
      'qualitative-vs-quantitative-deep',
      'comparison-representations',
    ],
  },
  {
    id: 'O3',
    origin: 'textbook',
    printed: 'يكتبُ المعادلة الكيميائيّة بالرّموز والصّيغ.',
    studentFacing:
      'أكتب رموز العناصر الحرّة (الأحادية والثنائية الذرة مثل H₂ وO₂) وصيغ المركّبات الأيونية والجذرية كتابةً صحيحة وفق التكافؤ قبل البدء بالموازنة.',
    page: '36',
    stepIds: [
      'foundation-formulas-and-diatomics',
      'observe-and-state-table-source',
      'worked-example-al-hcl-source',
      'activity-p39-source',
      'activity-p39-review',
      'word-to-symbol-builder',
      'self-test-q1-source',
      'self-test-q1-review',
    ],
  },
  {
    id: 'O4',
    origin: 'textbook',
    printed: 'يوازنُ المعادلة الكيميائيّة.',
    studentFacing:
      'أوازن المعادلة الكيميائيّة بضبط المعاملات الأمامية الصحيحة فقط حتى يتساوى عدد ذرات كل عنصر في طرفي المعادلة وبأبسط نسبة عددية صحيحة.',
    page: '36',
    stepIds: [
      'foundation-numbers-in-chemistry',
      'zinc-balancing-source',
      'conclude-equation-source',
      'worked-example-al-hcl-source',
      'worked-example-al-hcl-explained',
      'balancing-methodology',
      'worked-example-displacement-radicals',
      'worked-example-combustion-decomposition',
      'equation-balancer-simulation',
      'activity-p39-source',
      'self-test-q1-source',
      'self-test-q2-source',
      'self-test-q2-review',
    ],
  },
  {
    id: 'O5',
    origin: 'platform',
    printed:
      'هدف من إضافة المنصة (لم يُطبع في ص36): التحقّق الكمّي من المعادلة الموزونة وتشخيص الأخطاء الشائعة في الصيغ والرموز والمعاملات.',
    studentFacing:
      'أكتشف بنفسي الأخطاء الشائعة مثل تغيير الأرقام السفلية، أو الخلط بين (l) و(aq)، أو إغفال الأكسجين الموزّع على ناتجين، أو ترك المعاملات غير مبسّطة.',
    page: '36',
    stepIds: [
      'foundation-numbers-in-chemistry',
      'qualitative-vs-quantitative-deep',
      'common-errors',
      'error-spotter-activity',
      'comparison-representations',
      'comprehensive-summary',
    ],
  },
]

export function getLesson6Objective(id: string): Lesson6Objective | undefined {
  return LESSON6_OBJECTIVES.find((objective) => objective.id === id)
}

export type LedgerKind =
  | 'heading'
  | 'objective'
  | 'keyword'
  | 'paragraph'
  | 'figure'
  | 'table'
  | 'experiment'
  | 'equation'
  | 'activity'
  | 'example'
  | 'question'
  | 'summary'

export type LedgerStatus = 'implemented' | 'reconstructed' | 'decorative'

export type Lesson6LedgerItem = {
  id: string
  page: '36' | '37' | '38' | '39'
  kind: LedgerKind
  locator: string
  title: string
  excerpt?: string
  implementedBy: string[]
  questionIds?: string[]
  interactiveIds?: string[]
  status: LedgerStatus
  note?: string
}

export const LESSON6_LEDGER: Lesson6LedgerItem[] = [
  /* ============================== الصفحة 36 ============================== */
  {
    id: 'p36-lesson-title',
    page: '36',
    kind: 'heading',
    locator: 'أعلى الصفحة 36',
    title: 'رقم الدرس وعنوانه الرسمي',
    excerpt: '6 المعادلة الكيميائيّة',
    implementedBy: ['entry-source'],
    status: 'implemented',
  },
  {
    id: 'p36-objectives',
    page: '36',
    kind: 'objective',
    locator: 'صندوق الأهداف — أعلى الصفحة 36',
    title: 'الأهداف الأربعة المطبوعة للدرس السادس',
    excerpt:
      'يميّزُ رموز الحالة الفيزيائيّة للمواد في المعادلة الكيميائيّة. / يعبّرُ عن التفاعل الكيميائيّ بمعادلة كيميائيّة. / يكتبُ المعادلة الكيميائيّة بالرّموز والصّيغ. / يوازنُ المعادلة الكيميائيّة.',
    implementedBy: ['entry-source'],
    status: 'implemented',
  },
  {
    id: 'p36-keywords',
    page: '36',
    kind: 'keyword',
    locator: 'صندوق الكلمات المفتاحية — وسط الصفحة 36',
    title: 'الكلمات المفتاحية للدرس السادس',
    excerpt: 'المعادلة الكيميائيّة الموزونة – دلالات الرّموز.',
    implementedBy: ['entry-source'],
    status: 'implemented',
  },
  {
    id: 'p36-intro-iron-bars',
    page: '36',
    kind: 'paragraph',
    locator: 'الفقرة التمهيدية — وسط الصفحة 36',
    title: 'تشكّل البقع البنيّة على قضبان الحديد في الهواء الجوّي',
    excerpt:
      'عندما نضعِ قضبان الحديد النّظيفة في الهواء الجوّي وبعد مدّة من الزّمن يتشكّل على سطحها بقع بنيّة اللون.',
    implementedBy: ['entry-source'],
    status: 'implemented',
  },
  {
    id: 'p36-wonder-questions',
    page: '36',
    kind: 'question',
    locator: 'فقرة «أتساءل :» — وسط الصفحة 36',
    title: 'سؤالا التمهيد حول صدأ الحديد والتعبير عنه بمعادلة كيميائيّة',
    excerpt:
      'ماذا يحدث للحديد عندما يتعرّض للرّطوبة الجوّيّة؟ / هل يمكن التّعبير عن ذلك بمعادلة كيميائيّة؟',
    implementedBy: ['entry-source'],
    questionIds: ['l6-p36-wonder-1', 'l6-p36-wonder-2'],
    status: 'implemented',
  },
  {
    id: 'p36-photo-rust',
    page: '36',
    kind: 'figure',
    locator: 'أسفل الصفحة 36',
    title: 'صورة فوتوغرافية لقضبان حديد تسليح عليها طبقة صدأ بنيّة',
    implementedBy: ['entry-source'],
    status: 'decorative',
    note: 'صورة فوتوغرافية تمهيدية توضّح البقع البنيّة المذكورة في النص؛ وفق سياسة المستودع لا تُحفظ مسوحات الصور الفوتوغرافية، فوُثّق مضمونها في بطاقة مرجعية دون ادّعاء إعادة رسم فوتوغرافي.',
  },

  /* ============================== الصفحة 37 ============================== */
  {
    id: 'p37-section-heading',
    page: '37',
    kind: 'heading',
    locator: 'أعلى يمين الصفحة 37',
    title: 'عنوان القسم الرئيس: كتابة المعادلة الكيميائيّة',
    excerpt: 'كتابة المعادلة الكيميائيّة:',
    implementedBy: ['experiment-zinc-hcl-source'],
    status: 'implemented',
  },
  {
    id: 'p37-experiment-tools',
    page: '37',
    kind: 'experiment',
    locator: 'صندوق «أجرب وأستنتج :» — أدوات التجربة',
    title: 'أدوات تجربة تفاعل الزّنك مع محلول حمض كلور الماء الممدّد',
    excerpt:
      'مسحوق الزّنك - محلول حمض كلور الماء الممدّد - أنابيب اختبار مع حاملها - ملقط خشبيّ - أعواد ثقاب - قطّارة.',
    implementedBy: ['experiment-zinc-hcl-source'],
    status: 'implemented',
  },
  {
    id: 'p37-figure-zinc-hcl',
    page: '37',
    kind: 'figure',
    locator: 'أعلى يسار صندوق «أجرب وأستنتج :» — ص37',
    title: 'شكل أنبوب الاختبار والزّنك وحمض كلور الماء وغاز H₂ وعود الثقاب المشتعل',
    excerpt: 'وسوم الشكل المطبوعة: «زنك» يميناً، «حمض كلور» يساراً، و«H₂» لفقاعات الغاز المتصاعدة مع لهب اشتعال عند الفوهة.',
    implementedBy: ['experiment-zinc-hcl-source'],
    interactiveIds: ['source-figure-p37-zinc-hcl', 'lesson6-zinc-hcl-lab'],
    status: 'reconstructed',
    note: 'أُعيد بناء الشكل تخطيطياً بـ SVG (`source-figure-p37-zinc-hcl`) مع الإبقاء على الوسوم الثلاثة المطبوعة حرفياً («زنك»، «حمض كلور»، «H₂») ومشهد عود الثقاب المشتعل عند فوهة الأنبوب.',
  },
  {
    id: 'p37-experiment-step1',
    page: '37',
    kind: 'experiment',
    locator: 'خطوات التّجربة — البند 1',
    title: 'الخطوة الأولى من التجربة: وضع مسحوق الزّنك في الأنبوب الممسوك بالملقط',
    excerpt: '1 أُمسكُ أنبوب الاختبار بالملقط، ثمّ أضع في الأنبوب قليلاً من مسحوق الزّنك.',
    implementedBy: ['experiment-zinc-hcl-source'],
    status: 'implemented',
  },
  {
    id: 'p37-experiment-step2-3',
    page: '37',
    kind: 'question',
    locator: 'خطوات التّجربة — البندان 2 و3',
    title: 'سؤالا الملاحظة عند إضافة الحمض وعند تقريب عود الثقاب المشتعل',
    excerpt:
      '2 أضيفُ قطرات من محلول حمض كلور الماء فوق الزّنك، ماذا ألاحظ؟ / 3 أقرّبُ عود الثقاب المشتعل بحذر من فوهة الأنبوب، ماذا ألاحظ؟',
    implementedBy: ['experiment-zinc-hcl-source'],
    questionIds: ['l6-p37-exp-step2', 'l6-p37-exp-step3'],
    status: 'implemented',
  },
  {
    id: 'p37-observe-conclude-bullets',
    page: '37',
    kind: 'activity',
    locator: 'قسم «أُلاحظُ وأستنتِجُ :» — البنود الأربعة',
    title: 'بنود الملاحظة والاستنتاج والتعبير اللفظي وكتابة رموز الحالة الفيزيائيّة',
    excerpt:
      'يتفاعل محلول حمض كلور الماء مع مسحوق الزّنك. / يَنتج غاز قابل للاشتعال، ومحلول كلوريد الزّنك. / أعبّرُ عن التفاعل الحاصل بمعادلة كيميائيّة لفظيّة. / أكتبُ رمز الحالة الفيزيائيّة للمواد المتفاعلة والنّاتجة أسفل ويمين كلّ منها حسب الجدول المجاور.',
    implementedBy: ['observe-and-state-table-source'],
    questionIds: ['l6-p37-obs-word', 'l6-p37-obs-states'],
    status: 'implemented',
  },
  {
    id: 'p37-physical-state-table',
    page: '37',
    kind: 'table',
    locator: 'يسار قسم «أُلاحظُ وأستنتِجُ :» — ص37',
    title: 'جدول الحالة الفيزيائيّة والرمز (الصلبة s، السائلة ℓ، المحلول aq، الغازية g، تسخين Δ)',
    excerpt: 'الحالة الفيزيائيّة | الرّمز: الصلبة s، السائلة ℓ، المحلول aq، الغازية g، تسخين Δ.',
    implementedBy: ['observe-and-state-table-source'],
    status: 'implemented',
  },
  {
    id: 'p37-word-equation',
    page: '37',
    kind: 'equation',
    locator: 'تحت جدول الحالة الفيزيائيّة — ص37',
    title: 'المعادلة اللفظية لتفاعل الزّنك مع محلول حمض كلور الماء مع ذكر الحالات بين قوسين',
    excerpt: 'الزّنك (صلب) + حمض كلور الماء (محلول) ⟶ كلوريد الزّنك (محلول) + الهدروجين (غاز)',
    implementedBy: ['observe-and-state-table-source'],
    status: 'implemented',
  },
  {
    id: 'p37-unbalanced-zn-equation',
    page: '37',
    kind: 'equation',
    locator: 'تحت المعادلة اللفظية — ص37',
    title: 'المعادلة الرمزية غير الموزونة لتفاعل الزّنك مع حمض كلور الماء',
    excerpt: 'Zn(s) + HCl(aq) → ZnCl2(aq) + H2(g)',
    implementedBy: ['observe-and-state-table-source', 'zinc-balancing-source'],
    status: 'implemented',
  },
  {
    id: 'p37-balancing-atom-counts',
    page: '37',
    kind: 'activity',
    locator: 'أسفل الصفحة 37',
    title: 'إكمال فراغات عدّ ذرات الزّنك والكلور والهدروجين في طرفي المعادلة واستنتاج كل منها',
    excerpt:
      'لموازنة المعادلة أكملُ الفراغات في العبارات الآتية: عدد ذرّات الزّنك... / عدد ذرّات الكلور... / عدد ذرّات الهدروجين...',
    implementedBy: ['zinc-balancing-source'],
    questionIds: ['l6-p37-bal-zn', 'l6-p37-bal-cl', 'l6-p37-bal-h'],
    status: 'implemented',
  },

  /* ============================== الصفحة 38 ============================== */
  {
    id: 'p38-hcl-coefficient-blank',
    page: '38',
    kind: 'activity',
    locator: 'أعلى الصفحة 38',
    title: 'إكمال الرقم المكتوب على يسار HCl لمساواة ذرات الكلور والهدروجين',
    excerpt: 'لمساواة عدد ذرّات الكلور والهدروجين في طرفي المعادلة، نكتب رقم (..........)، على يسار HCl .',
    implementedBy: ['zinc-balancing-source'],
    questionIds: ['l6-p38-bal-hcl-coeff'],
    status: 'implemented',
  },
  {
    id: 'p38-balanced-zn-equation',
    page: '38',
    kind: 'equation',
    locator: 'أعلى الصفحة 38 — تحت فراغ المعامل',
    title: 'المعادلة الموزونة لتفاعل الزّنك مع حمض كلور الماء',
    excerpt: 'Zn(s) + 2HCl(aq) → ZnCl2(aq) + H2(g)',
    implementedBy: ['zinc-balancing-source'],
    status: 'implemented',
  },
  {
    id: 'p38-atom-verification-table',
    page: '38',
    kind: 'table',
    locator: 'ثلث الصفحة 38 العلوي',
    title: 'جدول التحقّق من أعداد ذرات Zn وCl وH في المواد المتفاعلة والناتجة بعد الموازنة',
    excerpt: 'ذرّة العنصر | عدد الذّرّات في المواد المتفاعلة | عدد الذّرّات في المواد النّاتجة: Zn (1، 1)، Cl (2، 2)، H (2، 2).',
    implementedBy: ['zinc-balancing-source'],
    status: 'implemented',
  },
  {
    id: 'p38-conclude-box',
    page: '38',
    kind: 'summary',
    locator: 'صندوق «أستنتج :» — وسط الصفحة 38',
    title: 'استنتاج تعريف المعادلة الكيميائيّة ومبدأ موازنتها',
    excerpt:
      'المعادلة الكيميائيّة هي تعبيرٌ وصفيٌّ وكمّيٌّ عن التغيّر الكيميائيّ. / نوازن المعادلة الكيميائيّة بجعل عدد ذرّات كل عنصر متساوياً في طرفي المعادلة.',
    implementedBy: ['conclude-equation-source'],
    status: 'implemented',
  },
  {
    id: 'p38-worked-example-al-hcl',
    page: '38',
    kind: 'example',
    locator: 'صندوق «تطبيق محلول :» — النصف السفلي من الصفحة 38',
    title: 'التطبيق المحلول لتفاعل مسحوق الألمنيوم مع محلول حمض كلور الماء الممدّد بخطواته السبع',
    excerpt:
      'ألمنيوم + حمض كلور الماء ⟶ كلوريد الألمنيوم + غاز الهدروجين ... حتى تصبح المعادلة بشكلها النّهائي: 2Al(s) + 6HCl(aq) → 2AlCl3(aq) + 3H2(g).',
    implementedBy: ['worked-example-al-hcl-source', 'worked-example-al-hcl-explained'],
    status: 'implemented',
  },

  /* ============================== الصفحة 39 ============================== */
  {
    id: 'p39-activity-1-carbon',
    page: '39',
    kind: 'activity',
    locator: 'صندوق «نشاط :» — البند ١ أعلى الصفحة 39',
    title: 'نشاط ١: كتابة وإكمال معادلة احتراق مسحوق الكربون بغاز الأكسجين',
    excerpt:
      '١. اكتب بالرّموز والصّيغ المعادلة الكيميائيّة التي تصف تفاعل احتراق مسحوق الكربون بغاز الأكسجين، وينتج غاز ثنائي أكسيد الكربون. C(s) + ............ →(Δ) CO2(g)',
    implementedBy: ['activity-p39-source', 'activity-p39-review'],
    questionIds: ['l6-p39-act-1'],
    status: 'implemented',
  },
  {
    id: 'p39-activity-2-sodium-zinc-sulfate',
    page: '39',
    kind: 'activity',
    locator: 'صندوق «نشاط :» — البند ٢ أعلى الصفحة 39',
    title: 'نشاط ٢: كتابة معادلة تفاعل قطعة الصوديوم مع محلول كبريتات الزّنك وترسّب الزّنك',
    excerpt:
      '٢. اكتب بالرّموز والصّيغ المعادلة الكيميائيّة الممثّلة لتفاعل قطعة من الصوديوم مع محلول كبريتات الزّنك، حيث ينتج محلول كبريتات الصوديوم ويترسب الزّنك.',
    implementedBy: ['activity-p39-source', 'activity-p39-review'],
    questionIds: ['l6-p39-act-2'],
    status: 'implemented',
  },
  {
    id: 'p39-activity-3-aluminum-sulfur',
    page: '39',
    kind: 'activity',
    locator: 'صندوق «نشاط :» — البند ٣ أعلى الصفحة 39',
    title: 'نشاط ٣: كتابة معادلة تفاعل برادة الألمنيوم مع الكبريت لتكوين كبريتيد الألمنيوم الصلب',
    excerpt:
      '٣. اكتب بالرّموز والصّيغ المعادلة الكيميائيّة الممثّلة لتفاعل برادة الألمنيوم مع الكبريت، حيث ينتج كبريتيد الألمنيوم الصلب.',
    implementedBy: ['activity-p39-source', 'activity-p39-review'],
    questionIds: ['l6-p39-act-3'],
    status: 'implemented',
  },
  {
    id: 'p39-learned-box',
    page: '39',
    kind: 'summary',
    locator: 'صندوق «تعلّمتُ :» — وسط الصفحة 39',
    title: 'خلاصة «تعلّمتُ» المطبوعة ببنودها الثلاثة',
    excerpt:
      'تحقّقُ المعادلة الكيميائيّة قانوني التفاعلات الكيميائيّة. / تُكتَبُ المعادلة الكيميائيّة بالرّموز والصّيغ مقرونة برمز الحالة الفيزيائيّة لكلّ منها. / موازنة المعادلة الكيميائيّة تكون بجعل عدد ذرّات كل عنصر متساوية في طرفي المعادلة.',
    implementedBy: ['learned-box-source'],
    status: 'implemented',
  },
  {
    id: 'p39-self-test-q1-heading',
    page: '39',
    kind: 'heading',
    locator: 'صندوق «أختبر نفسي :» — السؤال الأول (ص39)',
    title: 'تعليمة السؤال الأول: اكتبْ المعادلات الكيميائيّة الآتية بالرّموز والصّيغ، ثمّ وازنْها',
    excerpt: 'أختبر نفسي : السؤال الأول: اكتبْ المعادلات الكيميائيّة الآتية بالرّموز والصّيغ، ثمّ وازنْها:',
    implementedBy: ['self-test-q1-source'],
    status: 'implemented',
  },
  {
    id: 'p39-self-test-q1-1',
    page: '39',
    kind: 'question',
    locator: 'أختبر نفسي — السؤال الأول (المعادلة ١)',
    title: 'كتابة وموازنة معادلة تفاعل قطعة بوتاسيوم مع غاز الأكسجين لتكوين أكسيد البوتاسيوم',
    excerpt: 'قطعة بوتاسيوم + غاز الأكسجين ⟶ أكسيد البوتاسيوم',
    implementedBy: ['self-test-q1-source', 'self-test-q1-review'],
    questionIds: ['l6-book-q1-1'],
    status: 'implemented',
  },
  {
    id: 'p39-self-test-q1-2',
    page: '39',
    kind: 'question',
    locator: 'أختبر نفسي — السؤال الأول (المعادلة ٢)',
    title: 'كتابة وموازنة معادلة تفاعل برادة ألمنيوم مع غاز الأكسجين لتكوين أكسيد الألمنيوم',
    excerpt: 'برادة ألمنيوم + غاز الأكسجين ⟶ أكسيد الألمنيوم',
    implementedBy: ['self-test-q1-source', 'self-test-q1-review'],
    questionIds: ['l6-book-q1-2'],
    status: 'implemented',
  },
  {
    id: 'p39-self-test-q1-3',
    page: '39',
    kind: 'question',
    locator: 'أختبر نفسي — السؤال الأول (المعادلة ٣)',
    title: 'كتابة وموازنة معادلة تفاعل قطعة صوديوم مع حمض الخل لتكوين خلات الصوديوم وغاز الهدروجين',
    excerpt: 'قطعة صوديوم + حمض الخل ⟶ خلات الصوديوم + غاز الهدروجين',
    implementedBy: ['self-test-q1-source', 'self-test-q1-review'],
    questionIds: ['l6-book-q1-3'],
    status: 'implemented',
  },
  {
    id: 'p39-self-test-q2-heading',
    page: '39',
    kind: 'heading',
    locator: 'صندوق «أختبر نفسي :» — السؤال الثاني (ص39)',
    title: 'تعليمة السؤال الثاني: وازنْ المعادلات الكيميائيّة الآتية',
    excerpt: 'السؤال الثاني: وازنْ المعادلات الكيميائيّة الآتية:',
    implementedBy: ['self-test-q2-source'],
    status: 'implemented',
  },
  {
    id: 'p39-self-test-q2-1',
    page: '39',
    kind: 'question',
    locator: 'أختبر نفسي — السؤال الثاني (المعادلة ١)',
    title: 'موازنة معادلة احتراق المغنزيوم بالأكسجين بالتسخين',
    excerpt: 'Mg(s) + O2(g) →(Δ) MgO(s)',
    implementedBy: ['self-test-q2-source', 'self-test-q2-review'],
    questionIds: ['l6-book-q2-1'],
    status: 'implemented',
  },
  {
    id: 'p39-self-test-q2-2',
    page: '39',
    kind: 'question',
    locator: 'أختبر نفسي — السؤال الثاني (المعادلة ٢)',
    title: 'موازنة معادلة تفاعل الصوديوم مع محلول كبريتات النحاس',
    excerpt: 'Na(s) + CuSO4(aq) → Na2SO4(aq) + Cu(s)',
    implementedBy: ['self-test-q2-source', 'self-test-q2-review'],
    questionIds: ['l6-book-q2-2'],
    status: 'implemented',
  },
  {
    id: 'p39-self-test-q2-3',
    page: '39',
    kind: 'question',
    locator: 'أختبر نفسي — السؤال الثاني (المعادلة ٣)',
    title: 'موازنة معادلة التفكّك الحراري لكلورات البوتاسيوم',
    excerpt: 'KClO3(s) →(Δ) KCl(s) + O2(g)',
    implementedBy: ['self-test-q2-source', 'self-test-q2-review'],
    questionIds: ['l6-book-q2-3'],
    status: 'implemented',
  },
  {
    id: 'p39-self-test-q2-4',
    page: '39',
    kind: 'question',
    locator: 'أختبر نفسي — السؤال الثاني (المعادلة ٤)',
    title: 'موازنة معادلة احتراق غاز الميثان بغاز الأكسجين',
    excerpt: 'CH4(g) + O2(g) → CO2(g) + H2O(g)',
    implementedBy: ['self-test-q2-source', 'self-test-q2-review'],
    questionIds: ['l6-book-q2-4'],
    status: 'implemented',
  },
]

export type LedgerCoverage = {
  total: number
  implemented: number
  reconstructed: number
  decorative: number
  byPage: Record<string, number>
  danglingSteps: Array<{ item: string; stepId: string }>
  danglingQuestions: Array<{ item: string; questionId: string }>
  unlistedTextbookQuestions: string[]
  pagesWithoutEntries: string[]
}

function collectAllQuestionIds(lesson: LessonDefinition): Set<string> {
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

export function computeLedgerCoverage(lesson: LessonDefinition): LedgerCoverage {
  const stepIds = new Set(lesson.steps.map((step) => step.id))
  const questionIds = collectAllQuestionIds(lesson)
  const danglingSteps: LedgerCoverage['danglingSteps'] = []
  const danglingQuestions: LedgerCoverage['danglingQuestions'] = []

  for (const item of LESSON6_LEDGER) {
    for (const stepId of item.implementedBy) {
      if (!stepIds.has(stepId)) danglingSteps.push({ item: item.id, stepId })
    }
    for (const questionId of item.questionIds ?? []) {
      if (!questionIds.has(questionId)) danglingQuestions.push({ item: item.id, questionId })
    }
  }

  const listed = new Set(LESSON6_LEDGER.flatMap((item) => item.questionIds ?? []))
  const unlistedTextbookQuestions: string[] = []
  for (const test of lesson.tests ?? []) {
    for (const question of test.questions) {
      if (question.origin === 'textbook' && !listed.has(question.id)) {
        unlistedTextbookQuestions.push(question.id)
      }
    }
  }

  const byPage: Record<string, number> = {}
  for (const item of LESSON6_LEDGER) {
    byPage[item.page] = (byPage[item.page] ?? 0) + 1
  }

  const pages = lesson.source.pages.map((page) => page.page)
  const pagesWithoutEntries = pages.filter((page) => !byPage[page])

  return {
    total: LESSON6_LEDGER.length,
    implemented: LESSON6_LEDGER.filter((item) => item.status === 'implemented').length,
    reconstructed: LESSON6_LEDGER.filter((item) => item.status === 'reconstructed').length,
    decorative: LESSON6_LEDGER.filter((item) => item.status === 'decorative').length,
    byPage,
    danglingSteps,
    danglingQuestions,
    unlistedTextbookQuestions,
    pagesWithoutEntries,
  }
}

export function stepBlocks(lesson: LessonDefinition, stepId: string): ContentBlock[] {
  return lesson.steps.find((step) => step.id === stepId)?.blocks ?? []
}
