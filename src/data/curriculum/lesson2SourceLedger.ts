import type { ContentBlock, LessonDefinition } from './schema'

/* ============================================================================
   الدرس الثاني — «الروابط الكيميائية» — سجل المصدر (الصفحات 13–17)
   ----------------------------------------------------------------------------
   كل عنصر قرأناه في صور الصفحات الخمس مسجَّل هنا مرّة واحدة، مع موضعه داخل
   المنصة. يحرس السجل اختبار `tests/lesson2Coverage.test.ts`:

     * كل مدخل يشير إلى خطوة موجودة فعلاً؛
     * كل سؤال/نشاط كتابي يشير إلى سؤال موجود في طبقة التقييم؛
     * كل سؤال كتابي في طبقة التقييم مذكور هنا (فلا يُسقط سؤال بصمت)؛
     * كل صفحة من صفحات المصدر لها مدخل واحد على الأقل.

   الحالة لكل مدخل:
     `implemented`   نُفّذ محتوى المصدر كما هو في المنصة؛
     `reconstructed` أُعيد بناء الشكل أو التمثيل مع حفظ المعلومات العلمية؛
     `decorative`    عنصر قُرئ ولا يحمل معلومة قابلة للتعليم (صورة فوتوغرافية).
   ========================================================================= */

export type Lesson2ObjectiveId = 'O1' | 'O2' | 'O3' | 'O4' | 'O5'

export type Lesson2Objective = {
  id: Lesson2ObjectiveId
  /** صياغة الهدف كما طُبع في صفحة 13 (منقولة لا معادة الصياغة). */
  printed: string
  /** جملة واحدة موجّهة إلى الطالب. */
  studentFacing: string
  page: string
  /** الخطوات التي تُعلّم هذا الهدف. */
  stepIds: string[]
}

export const LESSON2_OBJECTIVES: Lesson2Objective[] = [
  {
    id: 'O1',
    printed: 'يتعرّف الرابطة الكيميائيّة.',
    studentFacing:
      'أفسّر أن الرابطة الكيميائية قوة تجاذب تربط الذرّات أو الأيونات أو الجزيئات، وأن سبب الارتباط هو الوصول إلى سطح أكثر اكتمالاً.',
    page: '13',
    stepIds: ['discovery-opening', 'observations-13', 'bond-meaning', 'bond-definition', 'summary'],
  },
  {
    id: 'O2',
    printed: 'يتعرّف الرابطة الأيونية.',
    studentFacing:
      'أفسّر تكون الرابطة الأيونية بانتقال الإلكترونات من فلزّ إلى لا فلزّ، وأحسب شحنة الأيون وأربط خواص المركّب ببنية البلورة.',
    page: '13',
    stepIds: ['bond-definition', 'ionic-mechanism', 'ionic-lab', 'ionic-conclude', 'ionic-ratio-example', 'ionic-properties', 'common-errors'],
  },
  {
    id: 'O3',
    printed: 'يتعرّف الرابطة المشتركة.',
    studentFacing:
      'أشرح المشاركة بزوج إلكترونات أو أكثر بين لا فلزّين، وأحدّد رتبة الرابطة من عدد الأزواج المشتركة.',
    page: '13',
    stepIds: ['covalent-figure', 'covalent-meaning', 'covalent-lab', 'covalent-items-16', 'covalent-conclude', 'octet-reasoning'],
  },
  {
    id: 'O4',
    printed: 'يرسم تمثيل لويس لبعض الجزيئات ذات رابطة مشتركة.',
    studentFacing:
      'أرسم تمثيل لويس لجزيء مشترك خطوة بخطوة: أعدّ إلكترونات السطح، أحسب الأزواج المشتركة، أوزّع الأزواج غير المشتركة، ثم أتحقّق من الثمانية.',
    page: '13',
    stepIds: ['lewis-worked-example', 'covalent-meaning', 'covalent-lab', 'book-check-2', 'book-check-3'],
  },
  {
    id: 'O5',
    printed: 'يتعرّف الرابطة المشتركة.',
    studentFacing:
      'أميّز المركّب الأيوني من المشترك بموقع عنصريه في الجدول (فلزّ/لا فلزّ) وبآلية الارتباط، لا بحفظ قائمة أسماء.',
    page: '13',
    stepIds: ['bond-compare', 'research-case', 'book-check-3', 'summary'],
  },
]

export function getLesson2Objective(id: string): Lesson2Objective | undefined {
  return LESSON2_OBJECTIVES.find((objective) => objective.id === id)
}

/* --------------------------------------------------------------------------- */

export type LedgerKind =
  | 'heading'
  | 'objective'
  | 'keyword'
  | 'paragraph'
  | 'definition'
  | 'fact'
  | 'figure'
  | 'table'
  | 'activity'
  | 'example'
  | 'question'
  | 'summary'
  | 'note'

export type LedgerStatus = 'implemented' | 'reconstructed' | 'decorative'

export type Lesson2LedgerItem = {
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
  /** معرّفات الأسئلة التي تحمل العنصر. */
  questionIds?: string[]
  status: LedgerStatus
  /** ملاحظة عند وجود إعادة بناء أو غموض حقيقي، لا عند التخمين. */
  note?: string
}

export const LESSON2_LEDGER: Lesson2LedgerItem[] = [
  /* -------------------------------- صفحة 13 ------------------------------- */
  {
    id: 'p13-heading',
    page: '13',
    kind: 'heading',
    locator: 'عنوان الدرس',
    title: 'الروابط الكيميائية — رقم الدرس ٢',
    excerpt: 'الرّوابط الكيميائيّة',
    implementedBy: ['goals'],
    status: 'implemented',
  },
  ...LESSON2_OBJECTIVES.slice(0, 4).map(
    (objective, index): Lesson2LedgerItem => ({
      id: `p13-objective-${index + 1}`,
      page: '13',
      kind: 'objective',
      locator: 'الأهداف',
      title: objective.printed,
      implementedBy: ['goals'],
      status: 'implemented',
    }),
  ),
  {
    id: 'p13-keywords',
    page: '13',
    kind: 'keyword',
    locator: 'الكلمات المفتاحية',
    title: 'الكلمات المفتاحية الثلاث',
    excerpt: 'رابطة كيميائيّة – رابطة أيونيّة – رابطة مشتركة',
    implementedBy: ['goals'],
    status: 'implemented',
  },
  {
    id: 'p13-figure-photos',
    page: '13',
    kind: 'figure',
    locator: 'الصور الأربع',
    title: 'أربع صور فوتوغرافية: ماء، فحم، ملح طعام، أسطوانة أكسجين، وتحت كل صورة رمزها',
    excerpt: 'H₂O — C — NaCl — O₂',
    implementedBy: ['observations-13'],
    status: 'decorative',
    note: 'الصور نفسها غير محفوظة كملفات في المستودع؛ نُقلت رموزها ووصف مشهدها، ولم تُعد رسم الصور.',
  },
  {
    id: 'p13-activity',
    page: '13',
    kind: 'activity',
    locator: 'ألاحظ وأجيب',
    title: 'بنود النشاط الثلاثة: التسمية، تحديد الذرّات، التساؤل عن الرابط',
    excerpt:
      'أُسمّي المواد المعبّر عنها بالرموز أسفل كل من الصور السّابقة. أُحدّد الذرّات التي تتكوّن منها كلّ مادّة... أتساءل ما الذي يربط ذرّات كلّ مادّة مع بعضها؟',
    implementedBy: ['observations-13'],
    questionIds: ['l2-act-name', 'l2-act-atoms', 'l2-act-bind'],
    status: 'implemented',
  },

  /* -------------------------------- صفحة 14 ------------------------------- */
  {
    id: 'p14-conclusion',
    page: '14',
    kind: 'definition',
    locator: 'أستنتج',
    title: 'استنتاج وجود قوى تربط الذرّات تسمّى روابط كيميائية',
    excerpt: 'هناك قوى تربط بين الذرّات المكوّنة للمادّة نسمّيها روابط كيميائيّة.',
    implementedBy: ['bond-definition'],
    status: 'implemented',
  },
  {
    id: 'p14-bond-definition',
    page: '14',
    kind: 'definition',
    locator: 'تعريف',
    title: 'تعريف الرابطة الكيميائية',
    excerpt: 'هي القوى التي تجذب الذرّات أو الأيونات أو الجزيئات إلى بعضها البعض.',
    implementedBy: ['bond-definition', 'bond-meaning'],
    status: 'implemented',
  },
  {
    id: 'p14-two-types',
    page: '14',
    kind: 'paragraph',
    locator: 'الفقرة الافتتاحية للأنواع',
    title: 'نوعان من الروابط بين الذرّات: الأيونية والمشتركة',
    excerpt: 'لنتعرّف على نوعين من الروابط الكيميائيّة بين الذرّات: هما الرابطة الأيونيّة والرّابطة المشتركة.',
    implementedBy: ['bond-definition'],
    status: 'implemented',
  },
  {
    id: 'p14-ionic-heading',
    page: '14',
    kind: 'heading',
    locator: 'العنوان البرتقالي ١',
    title: '١ - الرّابطة الأيونيّة',
    excerpt: '١ - الرّابطة الأيونيّة:',
    implementedBy: ['bond-definition'],
    status: 'implemented',
  },
  {
    id: 'p14-figure-transfer',
    page: '14',
    kind: 'figure',
    locator: 'شكل انتقال الإلكترون',
    title: 'خمس مراحل: Na ثم Cl ثم Na⁺ وCl⁻ ثم بلورة NaCl، مع سهم انتقال الإلكترون',
    excerpt: 'Na — Cl — Na⁺ — Cl⁻ — NaCl',
    implementedBy: ['bond-definition', 'ionic-lab'],
    status: 'reconstructed',
    note: 'أُعيد بناء الشكل كمكوّن SVG (IonicTransferDiagram) وكمحاكاة تفاعلية؛ الأعداد 11 و17 و10 و18 والسويات الثلاث/اثنتين محفوظة كما في الصورة.',
  },
  {
    id: 'p14-octet-text',
    page: '14',
    kind: 'paragraph',
    locator: 'النص قبل البنود',
    title: 'ميل الصوديوم إلى فقد إلكترون سطحه وميل الكلور إلى اكتسابه',
    excerpt:
      'حتّى تتحقّق قاعدة الثمانيّة نُلاحظُ أنّ ذرّة الصّوديوم Na تميل إلى فقدان إلكترونها السطحي وذرّة الكلور Cl تميل إلى اكتساب إلكترون.',
    implementedBy: ['bond-definition', 'ionic-mechanism'],
    status: 'implemented',
  },
  {
    id: 'p14-ionic-bullets',
    page: '14',
    kind: 'paragraph',
    locator: 'البندان التوضيحيان',
    title: 'انتقال الإلكترون وتكوّن الأيونين وبلورة NaCl المتعادلة، وتسمية التجاذب رابطة أيونية',
    excerpt:
      'عند ارتباط الصّوديوم مع الكلور تفقد ذرّة الصّوديوم إلكترونًا واحدًا متحوّلةً إلى أيون الصّوديوم Na⁺ بينما تكسب ذرّة الكلور ذلك الإلكترون متحوّلةً إلى أيون الكلوريد Cl⁻... وهذا التجاذب الكهربائي السّاكن يسمّى الرابطة الأيونيّة.',
    implementedBy: ['bond-definition'],
    status: 'implemented',
  },

  /* -------------------------------- صفحة 15 ------------------------------- */
  {
    id: 'p15-ionic-conclusion',
    page: '15',
    kind: 'definition',
    locator: 'أستنتج (الرابطة الأيونية)',
    title: 'تعريف الرابطة الأيونية',
    excerpt: 'الرابطة الأيونيّة: قوى تجاذب كهربائيّة ساكنة بين أيون موجب وأيون سالب.',
    implementedBy: ['ionic-conclude'],
    status: 'implemented',
  },
  {
    id: 'p15-ionic-note',
    page: '15',
    kind: 'note',
    locator: 'إضاءة (الرابطة الأيونية)',
    title: 'خواص المركّبات ذات الرابطة الأيونية',
    excerpt:
      'المركبات ذات الرابطة الأيونية صلبة في الدرجة العادية من الحرارة، ولا تنقل التيار الكهربائي في حالتها الصلبة بينما محاليلها ومصاهيرها تنقل التيار الكهربائي ودرجات غليانها وانصهارها مرتفعة.',
    implementedBy: ['ionic-conclude', 'ionic-properties'],
    status: 'implemented',
  },
  {
    id: 'p15-covalent-heading',
    page: '15',
    kind: 'heading',
    locator: 'العنوان البرتقالي ٢',
    title: '٢ - الرّابطة المشتركة',
    excerpt: '٢ - الرّابطة المشتركة:',
    implementedBy: ['covalent-figure'],
    status: 'implemented',
  },
  {
    id: 'p15-observe-heading',
    page: '15',
    kind: 'heading',
    locator: 'عنوان النشاط',
    title: 'أُلاحِظُ وأستنتجُ: الجزيئات الآتية الممثّلة وفق لويس',
    excerpt: 'أُلاحِظُ وأستنتجُ: الجزيئات الآتية الممثّلة وفق لويس:',
    implementedBy: ['covalent-figure'],
    status: 'implemented',
  },
  {
    id: 'p15-figure-lewis',
    page: '15',
    kind: 'figure',
    locator: 'شكل الجزيئات الثلاثة',
    title: 'H₂ وO₂ وN₂ بتمثيل لويس يساراً والنموذج الكروي–العصوي يميناً',
    excerpt:
      'H₂: زوج مشترك واحد بلا أزواج غير مشتركة. O₂: 2×2 نقاط مشتركة، ولكل O زوجان غير مشتركين (خارجي + أسفل). N₂: 6 نقاط مشتركة (عمودان × 3 صفوف)، ولكل N زوج خارجي واحد.',
    implementedBy: ['covalent-figure', 'covalent-lab'],
    status: 'reconstructed',
    note: 'أُعيد بناء الشكل بمكوّن LewisMolecule (نقاط DOM حقيقية) من خريطة نقاط قُرئت من الصورة، والنموذج الكروي مرسوم بنفس عدد الخطوط والأقراص.',
  },
  {
    id: 'p15-activity-h2',
    page: '15',
    kind: 'activity',
    locator: 'بند نشاط الهيدروجين',
    title: 'عدد الإلكترونات المشتركة والسطحية بعد الارتباط وتمثيل الرابطة الوحيدة',
    excerpt:
      'أُحدّد عدد الإلكترونات المشتركة بين ذرّتي الهيدروجين. أُحدّد عدد الإلكترونات السطحيّة لكل من ذرّتي الهيدروجين بعد الارتباط. مَثِّل الزوج المشترك برابطة وحيدة بين ذرّتي الهيدروجين.',
    implementedBy: ['covalent-figure'],
    questionIds: ['l2-act-h2'],
    status: 'implemented',
  },

  /* -------------------------------- صفحة 16 ------------------------------- */
  {
    id: 'p16-activity-rest',
    page: '16',
    kind: 'activity',
    locator: 'بنود النشاط 1–4',
    title: 'أزواج الأكسجين والنيتروجين، ثم المقارنة والاستنتاج وفق قاعدة الثمانية',
    excerpt:
      'أُحدّد عدد أزواج الإلكترونات المشتركة بين ذرّتي الأكسجين... أُقارن بين عدد الأزواج الإلكترونات المشتركة في كل جزيء... أُفسّر اختلاف عدد الأزواج المشتركة...',
    implementedBy: ['covalent-items-16'],
    questionIds: ['l2-act-o2', 'l2-act-n2', 'l2-act-compare', 'l2-act-octet'],
    status: 'implemented',
  },
  {
    id: 'p16-covalent-conclusion',
    page: '16',
    kind: 'definition',
    locator: 'أستنتج (الرابطة المشتركة)',
    title: 'تعريف الرابطة المشتركة',
    excerpt: 'الرابطة المشتركة: اشتراك ذرّتين بزوج من الإلكترونات أو أكثر.',
    implementedBy: ['covalent-conclude'],
    status: 'implemented',
  },
  {
    id: 'p16-covalent-note',
    page: '16',
    kind: 'note',
    locator: 'إضاءة (الرابطة المشتركة)',
    title: 'خواص المركّبات ذات الرابطة المشتركة',
    excerpt: 'المركّبات ذات الرابطة المشتركة معظمها غازات وغير ناقلة للتيار الكهربائي ودرجات غليانها منخفضة.',
    implementedBy: ['covalent-conclude', 'bond-compare'],
    status: 'implemented',
  },
  {
    id: 'p16-research',
    page: '16',
    kind: 'activity',
    locator: 'قضيّة للبحث',
    title: 'بحث نوع الرابطة في NH₃ وH₂O وCH₄ وCaO وAlCl₃ مع أعدادها الذرية',
    excerpt:
      'ابحث مع مدرّسك عن نوع الروابط الكيميائيّة بين ذرّات كل من الجزيئات الآتية: غاز النشادر (NH₃)، الماء (H₂O)، غاز الميتان (CH₄)، أكسيد الكالسيوم (CaO)، كلوريد الألمنيوم (AlCl₃). حيث: ₁₃Al، ₂₀Ca، ₆C، ₁H، ₈O، ₇N، ₁₇Cl.',
    implementedBy: ['research-case'],
    questionIds: ['l2-act-research'],
    status: 'implemented',
  },
  {
    id: 'p16-learn-box',
    page: '16',
    kind: 'summary',
    locator: 'تعلّمُ',
    title: 'خلاصة الكتاب في ثلاثة تعريفات',
    excerpt:
      'الرابطة الكيميائيّة: هي القوّة التي تجذب الذرّات أو الأيونات أو الجزيئات إلى بعضها البعض. الرابطة الأيونية: هي قوة تجاذب كهربائيّة ساكنة بين أيون موجب وأيون سالب. الرابطة المشتركة: هي اشتراك ذرّتين بزوج من الإلكترونات أو أكثر.',
    implementedBy: ['learn-box'],
    status: 'implemented',
  },

  /* -------------------------------- صفحة 17 ------------------------------- */
  {
    id: 'p17-heading',
    page: '17',
    kind: 'heading',
    locator: 'عنوان الاختبار الذاتي',
    title: 'أختبر نفسي — خمسة أسئلة',
    excerpt: 'أختبر نفسي:',
    implementedBy: ['book-check-1', 'book-check-2', 'book-check-3'],
    status: 'implemented',
  },
  {
    id: 'p17-q1',
    page: '17',
    kind: 'question',
    locator: 'السؤال الأول',
    title: 'اختيار من متعدد: الرابطة في جزيء الهيدروجين، والرابطة الأيونية قوى تجاذب',
    excerpt:
      'الرّابطة في جزيء الهيدروجين: a. مشتركة. b. أيونيّة. c. معدنيّة. d. هيدروجينيّة. | الرّابطة الأيونيّة هي قوى تجاذب: a. مغناطيسي. b. نووي. c. كهرطيسي. d. كهربائي.',
    implementedBy: ['book-check-1'],
    questionIds: ['l2-book-mc-1', 'l2-book-mc-2'],
    status: 'implemented',
  },
  {
    id: 'p17-q2',
    page: '17',
    kind: 'question',
    locator: 'السؤال الثاني',
    title: 'رسم آلية الرابطة المشتركة في Cl₂ بتمثيل لويس',
    excerpt: 'وضّح بالرّسم وفق تمثيل لويس آليّة تشكّل الرابطة المشتركة في جزيء الكلور (Cl₂)، حيث أنّ ₁₇Cl.',
    implementedBy: ['book-check-2'],
    questionIds: ['l2-book-q2'],
    status: 'implemented',
  },
  {
    id: 'p17-q3',
    page: '17',
    kind: 'question',
    locator: 'السؤال الثالث',
    title: 'رسم آلية الرابطة الأيونية في MgCl₂ بتمثيل لويس',
    excerpt: 'وضّح بالرسم وفق تمثيل لويس آليّة تشكّل الرابطة الأيونيّة في جزيء كلوريد المغنزيوم MgCl₂. علماً أنّ (₁₂Mg، ₁₇Cl).',
    implementedBy: ['book-check-2'],
    questionIds: ['l2-book-q3'],
    status: 'implemented',
  },
  {
    id: 'p17-q4',
    page: '17',
    kind: 'question',
    locator: 'السؤال الرابع',
    title: 'تحديد الإلكترونات والبروتونات والنيوترونات في أيون O²⁻',
    excerpt: 'حدّد عدد الإلكترونات والبروتونات والنيوترونات في أيون (O²⁻) حيث أنّ ¹⁶₈O.',
    implementedBy: ['book-check-2'],
    questionIds: ['l2-book-q4'],
    status: 'implemented',
  },
  {
    id: 'p17-q5',
    page: '17',
    kind: 'question',
    locator: 'السؤال الخامس',
    title: 'اختر المختلف وعلّل: مركّبات أيونية مقابل مشتركة، وغازات ثنائية الذرّة',
    excerpt:
      'اختر المختلف في كل ممّا يأتي، ثم علّل إجابتك. 1. a. MgO. b. AlCl₃. c. CH₄. d. NaCl. 2. a. Cl₂. b. H₂. c. F₂. d. N₂.',
    implementedBy: ['book-check-3'],
    questionIds: ['l2-book-q5-1', 'l2-book-q5-2'],
    status: 'implemented',
  },
]

/* --------------------------------------------------------------------------- */

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
 * لا يعتمد على أي نص مكتوب يدوياً: الخطوة والسؤال المذكوران يجب أن يوجدا فعلاً،
 * وكل سؤال كتابي يجب أن يكون مذكوراً في السجل.
 */
export function computeLedgerCoverage(lesson: LessonDefinition): LedgerCoverage {
  const stepIds = new Set(lesson.steps.map((step) => step.id))
  const questionIds = allQuestionIds(lesson)
  const danglingSteps: LedgerCoverage['danglingSteps'] = []
  const danglingQuestions: LedgerCoverage['danglingQuestions'] = []

  for (const item of LESSON2_LEDGER) {
    for (const stepId of item.implementedBy) {
      if (!stepIds.has(stepId)) danglingSteps.push({ item: item.id, stepId })
    }
    for (const questionId of item.questionIds ?? []) {
      if (!questionIds.has(questionId)) danglingQuestions.push({ item: item.id, questionId })
    }
  }

  const listed = new Set(LESSON2_LEDGER.flatMap((item) => item.questionIds ?? []))
  const unlistedTextbookQuestions: string[] = []
  for (const test of lesson.tests ?? []) {
    for (const question of test.questions) {
      if (question.origin === 'textbook' && !listed.has(question.id)) unlistedTextbookQuestions.push(question.id)
    }
  }

  const byPage: Record<string, number> = {}
  for (const item of LESSON2_LEDGER) byPage[item.page] = (byPage[item.page] ?? 0) + 1

  const pages = lesson.source.pages.map((page) => page.page)
  const pagesWithoutEntries = pages.filter((page) => !byPage[page])

  return {
    total: LESSON2_LEDGER.length,
    implemented: LESSON2_LEDGER.filter((item) => item.status === 'implemented').length,
    reconstructed: LESSON2_LEDGER.filter((item) => item.status === 'reconstructed').length,
    decorative: LESSON2_LEDGER.filter((item) => item.status === 'decorative').length,
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
