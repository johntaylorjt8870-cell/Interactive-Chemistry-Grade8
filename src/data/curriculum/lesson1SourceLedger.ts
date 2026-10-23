import type { ContentBlock, LessonDefinition } from './schema'

/* ============================================================================
   Lesson 1 — «الذرّة والعنصر» — source ledger (pages 3–12)
   ----------------------------------------------------------------------------
   Every item read from the supplied textbook pages is listed here exactly once,
   with the place in the platform that implements it. The ledger is machine
   checked by `tests/lesson1SourceCoverage.test.ts`:

     * every entry points at a real lesson step;
     * every textbook question/activity entry points at a real question in the
       lesson's assessment layer;
     * every textbook question in the assessment layer is reachable from the
       ledger (so a question cannot be dropped silently);
     * every page of the lesson source appears at least once.

   Category of each implementation is declared by the content itself
   (`attribution`): `textbook` = official material preserved, `platform` =
   platform-authored explanation or practice, `mixed` = a wrapper around both.
   ========================================================================= */

export type Lesson1ObjectiveId = 'O1' | 'O2' | 'O3' | 'O4' | 'O5' | 'O6' | 'O7' | 'O8'

export type Lesson1Objective = {
  id: Lesson1ObjectiveId
  /** Objective wording as printed on page 3 (preserved, not paraphrased). */
  printed: string
  /** One student-facing sentence used on the platform. */
  studentFacing: string
  page: string
  /** Steps that teach this objective. */
  stepIds: string[]
}

export const LESSON1_OBJECTIVES: Lesson1Objective[] = [
  {
    id: 'O1',
    printed: 'يتعرّفُ نموذج رذرفورد للذرّة.',
    studentFacing: 'أفسّر كيف كشفت تجربة رذرفورد أن معظم حجم الذرة فراغ وأن كتلتها تتركز في نواة صغيرة موجبة.',
    page: '3',
    stepIds: ['rutherford-experiment', 'rutherford-reasoning'],
  },
  {
    id: 'O2',
    printed: 'يتعرّفُ نموذج بور للذرّة.',
    studentFacing: 'أشرح نموذج بور: إلكترونات في سويات طاقة محددة، تمتص الذرة طاقة عند الصعود وتصدرها عند الهبوط.',
    page: '3',
    stepIds: ['bohr'],
  },
  {
    id: 'O3',
    printed: 'يمثّلُ توزّع الإلكترونات على مداراتها حول النواة في سويّات الطاقة الرئيسيّة.',
    studentFacing: 'أوزّع إلكترونات الذرة على السويات الرئيسية من الداخل إلى الخارج، وأكتب التوزيع بالشكل 2-8-1.',
    page: '3',
    stepIds: ['levels-law', 'capacity-practice', 'sodium', 'distribution-reasoning'],
  },
  {
    id: 'O4',
    printed: 'يحدّدُ البُنية الإلكترونيّة للذرّة من عددها الذرّي.',
    studentFacing: 'أقرأ العدد الذري والعدد الكتلي من الترميز النووي، وأستخرج عدد البروتونات والنيوترونات والإلكترونات.',
    page: '3',
    stepIds: ['atomic-numbers', 'atomic-identity', 'capacity-practice'],
  },
  {
    id: 'O5',
    printed: 'يحدّدُ مفهوم العنصر الكيميائي.',
    studentFacing: 'أفسّر أن عدد البروتونات هو ما يحدد هوية العنصر، وأن تغييره يحوّل العنصر إلى عنصر آخر.',
    page: '3',
    stepIds: ['atomic-identity', 'isotopes-oxygen', 'isotopes-vs-ions'],
  },
  {
    id: 'O6',
    printed: 'يشرحُ تشكّل الأيون أحادي التكافؤ.',
    studentFacing: 'أفسّر تكوّن الأيون الموجب بفقد الإلكترونات والأيون السالب باكتسابها، وأحسب الشحنة من الفرق بين البروتونات والإلكترونات.',
    page: '3',
    stepIds: ['octet-rule', 'ion-concept', 'ions', 'ion-reasoning', 'ion-examples'],
  },
  {
    id: 'O7',
    printed: 'يكتبُ تمثيل لويس للذرّات.',
    studentFacing: 'أكتب تمثيل لويس لذرة بتحويل إلكترونات سطحها إلى نقاط حول الرمز، فرادى أولاً ثم أزواجاً.',
    page: '3',
    stepIds: ['lewis', 'lewis-deep', 'activity-al-mg-o'],
  },
  {
    id: 'O8',
    printed: 'يتعرّفُ النظائر.',
    studentFacing: 'أميّز النظائر: ذرات العنصر نفسه، متماثلة بالعدد الذري ومختلفة بالعدد الكتلي.',
    page: '3',
    stepIds: ['isotopes', 'isotopes-oxygen', 'isotopes-vs-ions'],
  },
]

export function getObjective(id: string): Lesson1Objective | undefined {
  return LESSON1_OBJECTIVES.find((objective) => objective.id === id)
}

/* --------------------------------------------------------------------------- */

export type LedgerKind =
  | 'heading'
  | 'objective'
  | 'keyword'
  | 'paragraph'
  | 'definition'
  | 'fact'
  | 'rule'
  | 'figure'
  | 'table'
  | 'activity'
  | 'example'
  | 'experiment'
  | 'question'
  | 'summary'
  | 'note'

export type LedgerStatus =
  /** Implemented in the platform as described. */
  | 'implemented'
  /** Implemented as a labelled platform reconstruction because the scan is not stored. */
  | 'reconstructed'
  /** Read and documented, but it is decoration with no teachable content. */
  | 'decorative'

export type Lesson1LedgerItem = {
  id: string
  page: string
  kind: LedgerKind
  /** Where the item sits on the page, e.g. «الأهداف», «نشاط», «السؤال الثاني». */
  locator: string
  /** Short description of the source item. */
  title: string
  /** The source data that must survive, quoted or transcribed. */
  excerpt?: string
  /** Lesson step ids that carry this item. */
  implementedBy: string[]
  /** Assessment ids that carry this item (questions/activities). */
  questionIds?: string[]
  status: LedgerStatus
  /** Only for genuine source ambiguity, never a guess. */
  note?: string
}

const P = (page: string) => page

export const LESSON1_LEDGER: Lesson1LedgerItem[] = [
  /* ------------------------------- page 3 -------------------------------- */
  {
    id: 'p3-heading',
    page: P('3'),
    kind: 'heading',
    locator: 'عنوان الدرس',
    title: 'الوحدة الأولى — الكيمياء البنيوية · الدرس الأول: الذرّة والعنصر',
    excerpt: 'الوحدة الأولى الكيمياء البنيوية — 1 — الذرّة والعنصر',
    implementedBy: ['goals'],
    status: 'implemented',
  },
  ...LESSON1_OBJECTIVES.map((objective): Lesson1LedgerItem => ({
    id: `p3-objective-${objective.id.slice(1)}`,
    page: P('3'),
    kind: 'objective',
    locator: 'الأهداف',
    title: objective.printed,
    implementedBy: objective.stepIds,
    status: 'implemented',
  })),
  {
    id: 'p3-keywords',
    page: P('3'),
    kind: 'keyword',
    locator: 'الكلمات المفتاحية',
    title: 'الكلمات المفتاحية السبع',
    excerpt:
      'النواة — الإلكترونات — النظائر — السويّات الرئيسية — قاعدة الثمانية — النشاط الكيميائي — الأيون.',
    implementedBy: ['goals'],
    status: 'implemented',
  },
  {
    id: 'p3-figure-atom',
    page: P('3'),
    kind: 'figure',
    locator: 'الشكل الافتتاحي',
    title: 'رسم افتتاحي لذرّة/جزيء بنموذج الكرات والعصي',
    implementedBy: ['discovery-opening'],
    status: 'reconstructed',
    note: 'الشكل زخرفي ولا يحمل بيانات مقروءة؛ أُضيف وصف صريح لا صورة مُعاد رسمها.',
  },

  /* ------------------------------- page 4 -------------------------------- */
  {
    id: 'p4-experiment-method',
    page: P('4'),
    kind: 'paragraph',
    locator: 'الفقرة الافتتاحية',
    title: 'اعتماد المنهج التجريبي للتأكد من بنية الذرّة، وأثر اكتشاف التيار الكهربائي وتجارب التفريغ',
    excerpt:
      'بدأ العلماء في العصر الحديث يعتمدون المنهج التجريبي للتأكد من بنية الذرّة، وقد أدّى اكتشاف التيار الكهربائي ونقل محاليل الأملاح للتيار الكهربائي إلى أن الذرّة تتكون من جسيمات تحمل شحنات سالبة وأخرى موجبة.',
    implementedBy: ['electron-discovery'],
    status: 'implemented',
  },
  {
    id: 'p4-figure-discharge-tube',
    page: P('4'),
    kind: 'figure',
    locator: 'الصورة العلوية',
    title: 'صورة أنبوب تفريغ كهربائي مضيء في المختبر',
    implementedBy: ['electron-discovery'],
    status: 'reconstructed',
    note: 'صورة فوتوغرافية من الكتاب غير محفوظة كملف في المستودع؛ يصفها النص ولا يدّعي إعادة إنتاجها.',
  },
  {
    id: 'p4-thomson-electron',
    page: P('4'),
    kind: 'fact',
    locator: 'فقرة طومسون',
    title: 'اكتشاف طومسون للإلكترون: جسيم أصغر من الذرة، كتلته ≈ 1/1860 من كتلة نواة الهيدروجين، وشحنته سالبة',
    excerpt:
      'تمكّن العالم طومسون بعد دراسة التقريب الكهربائي من اكتشاف الإلكترون وهو جسيم صغير كتلته تقريبًا (1/1860) من كتلة نواة ذرّة الهيدروجين ويحمل شحنة سالبة.',
    implementedBy: ['electron-discovery', 'thomson-model'],
    status: 'implemented',
  },
  {
    id: 'p4-figure-thomson-model',
    page: P('4'),
    kind: 'figure',
    locator: 'الشكل الأيسر',
    title: 'رسم نموذج طومسون: كرة موجبة متجانسة تتوزع داخلها إلكترونات سالبة',
    excerpt: 'جسم الذرّة موجب الشحنة — إلكترون',
    implementedBy: ['thomson-model'],
    status: 'reconstructed',
    note: 'أُعيد بناء المخطط كمخطط SVG موسوم «رسم توضيحي من إعداد المنصة»، لا كصورة الكتاب.',
  },
  {
    id: 'p4-thomson-definition',
    page: P('4'),
    kind: 'definition',
    locator: 'نموذج طومسون',
    title: 'تعريف نموذج طومسون',
    excerpt:
      'الذرّة جسيم صغير متجانس المادة ويحمل شحنة موجبة تتوزع الإلكترونات السالبة داخله بحيث تكون الذرّة متعادلة كهربائيًا.',
    implementedBy: ['thomson-model'],
    status: 'implemented',
  },
  {
    id: 'p4-rutherford-procedure',
    page: P('4'),
    kind: 'experiment',
    locator: 'تجربة رذرفورد',
    title: 'إسقاط حزمة من جسيمات ألفا الموجبة على صفيحة ذهب رقيقة',
    excerpt: 'قام رذرفورد بتجربته الآتية: أسقط رزمة من جسيمات ألفا (جسيمات موجبة الشحنة) على صفيحة ذهب رقيقة.',
    implementedBy: ['rutherford-experiment'],
    status: 'implemented',
  },
  {
    id: 'p4-figure-rutherford',
    page: P('4'),
    kind: 'figure',
    locator: 'الشكل السفلي',
    title: 'مخطط التجربة: مصدر جسيمات ألفا، صفيحة ذهب، شاشة ZnS مطلية، مسارات نفذت/انحرفت/ارتدت',
    excerpt: 'مصدر جسيمات ألفا — رقاقة من الذهب — شاشة مطلية بمادة ZnS — دقائق اخترقت — دقائق انحرفت — دقائق ارتدت',
    implementedBy: ['rutherford-experiment', 'rutherford-reasoning'],
    status: 'reconstructed',
    note: 'المخطط أُعيد بناؤه بمحاكاة تفاعلية موسومة «إضافة من المنصة»؛ الوسوم الأصلية محفوظة في الوصف.',
  },
  {
    id: 'p4-observation-1',
    page: P('4'),
    kind: 'fact',
    locator: 'ملاحظة 1',
    title: 'معظم جسيمات ألفا تنفذ من صفيحة الذهب دون أن تنحرف',
    excerpt: 'معظم جسيمات ألفا تنفذ من صفيحة الذهب دون أن تنحرف.',
    implementedBy: ['rutherford-experiment'],
    status: 'implemented',
  },
  {
    id: 'p4-observation-2',
    page: P('4'),
    kind: 'fact',
    locator: 'ملاحظة 2',
    title: 'جزء صغير من جسيمات ألفا ارتدّ وبعضها انحرف بزوايا مختلفة',
    excerpt: 'جزء صغير من جسيمات ألفا ارتدّ وبعضها انحرف بزوايا مختلفة.',
    implementedBy: ['rutherford-experiment'],
    status: 'implemented',
  },
  {
    id: 'p4-conclusion',
    page: P('4'),
    kind: 'fact',
    locator: 'الاستنتاج',
    title: 'معظم حجم الذرّة فراغ، وبداخلها جزء موجب سمّاه رذرفورد النواة تتركز فيه معظم كتلة الذرّة',
    excerpt:
      'ممّا يدلّ على أنّ الذرّة تحوي بداخلها على جزء موجب يمثّل معظم كتلة الذرّة أطلق عليه العالم رذرفورد النواة.',
    implementedBy: ['rutherford-experiment', 'rutherford-reasoning'],
    status: 'implemented',
  },

  /* ------------------------------- page 5 -------------------------------- */
  {
    id: 'p5-bohr-1',
    page: P('5'),
    kind: 'fact',
    locator: 'نموذج بور — النقطة 1',
    title: 'الذرّة نواة موجبة تدور حولها الإلكترونات في سويات لها طاقة محددة',
    excerpt: 'تتكوّن الذرّة من نواة موجبة وتدور حولها الإلكترونات في سويّات (طاقية) لها طاقة محددة.',
    implementedBy: ['bohr'],
    status: 'implemented',
  },
  {
    id: 'p5-bohr-2',
    page: P('5'),
    kind: 'fact',
    locator: 'نموذج بور — النقطة 2',
    title: 'الانتقال إلى سوية أعلى يمتص طاقة مساوية لفرق الطاقة بين السويتين',
    excerpt:
      'تمتصّ الذرّة طاقة محددة عندما يقفز الإلكترون من سوية طاقة أدنى إلى سوية طاقة أعلى بحيث تكون الطاقة الممتصّة تساوي فرق الطاقة بين السويتين اللتين قفز بينهما الإلكترون.',
    implementedBy: ['bohr'],
    status: 'implemented',
  },
  {
    id: 'p5-bohr-3',
    page: P('5'),
    kind: 'fact',
    locator: 'نموذج بور — النقطة 3',
    title: 'العودة إلى سوية أدنى تصدر طاقة على شكل ضوء',
    excerpt:
      'تصدر الذرّة طاقة محددة على شكل ضوء عندما يقفز الإلكترون من سوية طاقة أعلى إلى سوية طاقة أدنى.',
    implementedBy: ['bohr'],
    status: 'implemented',
  },
  {
    id: 'p5-figure-bohr',
    page: P('5'),
    kind: 'figure',
    locator: 'الشكل الأعلى',
    title: 'نموذج مبسط لتركيب الذرّة: نواة وإلكترونات ومسارات، مع وسوم البروتونات والنيوترونات',
    excerpt: 'النواة — الإلكترونات — البروتونات — النيوترونات — نموذج مبسط لتركيب الذرة',
    implementedBy: ['bohr', 'atomic-numbers'],
    status: 'reconstructed',
  },
  {
    id: 'p5-spectral-note',
    page: P('5'),
    kind: 'note',
    locator: 'بين قوسين بعد النقطة 3',
    title: 'هذا ما يفسر طيف الانبعاثات الذي تصدره الذرات بعد إثارتها',
    excerpt: '(هذا ما يفسر طيف الانبعاثات الذي تصدره الذرّات بعد إثارتها)',
    implementedBy: ['bohr'],
    status: 'implemented',
  },
  {
    id: 'p5-building-analogy',
    page: P('5'),
    kind: 'paragraph',
    locator: 'فقرة المبنى المدرسي',
    title: 'تشبيه المبنى المدرسي: طوابق وصفوف لتوضيح توزيع الإلكترونات على السويات',
    excerpt:
      'يتألف بناءٌ مدرسيٌّ من عدة طوابق وكل طابقٍ صفٌّ معيّن، كيف يمكن أن يتمّ توزيع الطلبة على القاعات الصفية؟',
    implementedBy: ['bohr'],
    status: 'implemented',
  },
  {
    id: 'p5-law',
    page: P('5'),
    kind: 'rule',
    locator: 'قانون السعة',
    title: 'العدد الأعظمي للإلكترونات في السوية الرئيسية: y = 2(n)²',
    excerpt: 'y = 2(n)² حيث يعبّر n عن رقم السوية الرئيسية، مع العلم أن السوية الأخيرة لا تحوي أكثر من ثمانية إلكترونات.',
    implementedBy: ['levels-law'],
    status: 'implemented',
  },
  {
    id: 'p5-figure-levels',
    page: P('5'),
    kind: 'figure',
    locator: 'الشكل السفلي',
    title: 'السويات الرئيسية السبع K L M N O P Q وأرقامها n = 1 … 7',
    excerpt: 'n = 1 … 7 مع K, L, M, N, O, P, Q',
    implementedBy: ['levels-law'],
    status: 'implemented',
  },
  {
    id: 'p5-read-k',
    page: P('5'),
    kind: 'question',
    locator: 'أقرأ وأستنتج',
    title: 'العدد الأعظمي لإلكترونات السوية K',
    excerpt: '2 × (1)² = 2',
    implementedBy: ['levels-law'],
    questionIds: ['book-p5-k'],
    status: 'implemented',
  },
  {
    id: 'p5-read-l',
    page: P('5'),
    kind: 'question',
    locator: 'أقرأ وأستنتج',
    title: 'العدد الأعظمي لإلكترونات السوية L',
    excerpt: '2 × (2)² = 8',
    implementedBy: ['levels-law'],
    questionIds: ['book-p5-l'],
    status: 'implemented',
  },
  {
    id: 'p5-read-m',
    page: P('5'),
    kind: 'question',
    locator: 'أقرأ وأستنتج',
    title: 'أحسب عدد الإلكترونات الأعظمي في السوية M',
    excerpt: '2 × (3)² = ……',
    implementedBy: ['levels-law'],
    questionIds: ['book-p5-m'],
    status: 'implemented',
  },
  {
    id: 'p5-read-n',
    page: P('5'),
    kind: 'question',
    locator: 'أقرأ وأستنتج',
    title: 'أحسب عدد الإلكترونات الأعظمي في السوية N',
    excerpt: '2 × (4)² = ……',
    implementedBy: ['levels-law'],
    questionIds: ['book-p5-n'],
    status: 'implemented',
  },

  /* ------------------------------- page 6 -------------------------------- */
  {
    id: 'p6-table',
    page: P('6'),
    kind: 'activity',
    locator: 'أكمل الجدول الآتي',
    title: 'جدول السويات K–O: رقم السوية n والعدد الأعظمي للإلكترونات y',
    excerpt: 'K: n=1, y=2 · L: n=2, y=8 · M: n=3 · N: n=4 · O: n=5',
    implementedBy: ['capacity-practice'],
    questionIds: ['book-p6-table', 'book-p6-table-m', 'book-p6-table-n', 'book-p6-table-o'],
    status: 'implemented',
  },
  {
    id: 'p6-statements',
    page: P('6'),
    kind: 'rule',
    locator: 'أسئلة (خلاصة القواعد)',
    title: 'ثلاث قواعد: سبع سويات، السعة y = 2(n)²، وملء السويات الأدنى أولاً مع عدم تجاوز السوية الأخيرة ثمانية',
    excerpt:
      'تتوزع إلكترونات الذرة على سبع سويات طاقة رئيسية. · تحوي كل سوية عددًا أعظميًا من الإلكترونات y يحددها قانون y = 2(n)². · تشغل الإلكترونات السويات الأدنى أولاً بحيث لا تحوي السوية الأخيرة أكثر من ثمانية إلكترونات.',
    implementedBy: ['capacity-practice', 'levels-law'],
    status: 'implemented',
  },
  {
    id: 'p6-worked-sodium',
    page: P('6'),
    kind: 'example',
    locator: 'تطبيق محلول',
    title: 'توزيع إلكترونات الصوديوم Na (11 إلكتروناً) على السويات الرئيسية',
    excerpt: 'K(2), L(8), M(1) — المجموع 11',
    implementedBy: ['sodium'],
    questionIds: ['book-p6-sodium'],
    status: 'implemented',
  },
  {
    id: 'p6-figure-sodium',
    page: P('6'),
    kind: 'figure',
    locator: 'رسم التطبيق',
    title: 'رسم ذرة الصوديوم مع مفتاح: الإلكترونات، البروتونات، النيوترونات',
    excerpt: 'ذرة الصوديوم Na — الإلكترونات — البروتونات — النيوترونات',
    implementedBy: ['sodium'],
    status: 'reconstructed',
  },

  /* ------------------------------- page 7 -------------------------------- */
  {
    id: 'p7-example-neon',
    page: P('7'),
    kind: 'example',
    locator: 'مثال',
    title: 'رمز ذرة النيون ²⁰₁₀Ne: العدد الكتلي، العدد الذري، عدد الإلكترونات، التوزع الإلكتروني',
    excerpt: 'رمز ذرة النيون ²⁰₁₀Ne · ما قيمة العدد الكتلي A؟ ما قيمة العدد الذري Z؟ ما عدد الإلكترونات؟ اكتب التوزع الإلكتروني.',
    implementedBy: ['atomic-numbers'],
    questionIds: ['book-p7-neon-a', 'book-p7-neon-z', 'book-p7-neon-e', 'book-p7-neon-dist'],
    status: 'implemented',
  },
  {
    id: 'p7-octet-rule',
    page: P('7'),
    kind: 'rule',
    locator: 'قاعدة الثمانية الإلكترونية',
    title: 'تسعى الذرات إلى الاستقرار بثمانية إلكترونات في الطبقة السطحية، ما عدا الهيدروجين',
    excerpt:
      'تسعى ذرّات العناصر الكيميائية إلى الاستقرار بأن يصبح في طبقتها السطحية ثمانية إلكترونات، عدا الهيدروجين الذي يحتوي على إلكترونين فقط. تسعى الذرّة للحصول على ثمانية إلكترونات في طبقتها السطحية، فتكتسب أو تفقد الإلكترونات وهذا ما يسمى النشاط الكيميائي.',
    implementedBy: ['octet-rule'],
    status: 'implemented',
  },
  {
    id: 'p7-ion-phenomenon',
    page: P('7'),
    kind: 'paragraph',
    locator: 'مفهوم الذرة والأيون',
    title: 'سؤال ظاهري: لماذا يسبب الصوديوم حروقاً بينما نستعمل كلوريد الصوديوم في الطعام؟',
    excerpt:
      'نتعامل مع معدن الصوديوم في المختبر باستخدام مِلقط خشبي لأنّه يسبب حروقاً عند ملامسته لليد، بينما نستعمل كلوريد الصوديوم (ملح الطعام) في طعامنا. أفسّر ذلك؟',
    implementedBy: ['ion-concept'],
    status: 'implemented',
  },
  {
    id: 'p7-photo-sodium',
    page: P('7'),
    kind: 'figure',
    locator: 'الصورة اليسرى',
    title: 'صورة فلز الصوديوم في المختبر',
    implementedBy: ['ion-concept'],
    status: 'reconstructed',
    note: 'صورة فوتوغرافية من الكتاب غير محفوظة كملف؛ يوصف محتواها دون ادعاء عرض الصورة الأصلية.',
  },
  {
    id: 'p7-photo-salt',
    page: P('7'),
    kind: 'figure',
    locator: 'الصورة اليمنى',
    title: 'صورة كلوريد الصوديوم (ملح الطعام)',
    implementedBy: ['ion-concept'],
    status: 'reconstructed',
    note: 'صورة فوتوغرافية من الكتاب غير محفوظة كملف؛ يوصف محتواها دون ادعاء عرض الصورة الأصلية.',
  },

  /* ------------------------------- page 8 -------------------------------- */
  {
    id: 'p8-table',
    page: P('8'),
    kind: 'table',
    locator: 'ألاحظ واستنتج',
    title: 'جدول ذرة الصوديوم وأيون الصوديوم وذرة الكلور وأيون الكلور: رمز النواة، عدد الإلكترونات، عدد البروتونات، المجموع الجبري للشحنات',
    excerpt: '²³₁₁Na · Na⁺ · ³⁵₁₇Cl · Cl⁻',
    implementedBy: ['ions'],
    questionIds: ['book-p8-table'],
    status: 'implemented',
  },
  {
    id: 'p8-q1',
    page: P('8'),
    kind: 'question',
    locator: 'السؤال 1',
    title: 'أقارن بين المجموع الجبري للشحنات في الجدول السابق',
    excerpt: 'أقارن بين المجموع الجبري للشّحنات في الجدول السابق. ماذا ألاحظ؟',
    implementedBy: ['ions'],
    questionIds: ['book-p8-q1'],
    status: 'implemented',
  },
  {
    id: 'p8-q2',
    page: P('8'),
    kind: 'question',
    locator: 'السؤال 2',
    title: 'ما الاختلاف بين عدد الإلكترونات في ذرة الصوديوم وفي أيون الصوديوم؟',
    excerpt: 'ما الاختلاف بين عدد الإلكترونات في ذرّة الصوديوم وفي أيون الصوديوم؟',
    implementedBy: ['ions'],
    questionIds: ['book-p8-q2'],
    status: 'implemented',
  },
  {
    id: 'p8-q3',
    page: P('8'),
    kind: 'question',
    locator: 'السؤال 3',
    title: 'أفسّر ما حدث لذرة الصوديوم عندما تحولت إلى أيون الصوديوم',
    excerpt: 'أفسّر ما حدث لذرّة الصوديوم عندما تحولت لأيون الصوديوم.',
    implementedBy: ['ions'],
    questionIds: ['book-p8-q3'],
    status: 'implemented',
  },
  {
    id: 'p8-q4',
    page: P('8'),
    kind: 'question',
    locator: 'السؤال 4',
    title: 'أكرّر ما سبق من أجل ذرة الكلور وأيون الكلور',
    excerpt: 'أكرّر ما سبق من أجل ذرّة الكلور وأيون الكلور.',
    implementedBy: ['ions'],
    questionIds: ['book-p8-q4'],
    status: 'implemented',
  },
  {
    id: 'p8-ion-definition',
    page: P('8'),
    kind: 'definition',
    locator: 'تعريف',
    title: 'تعريف الأيون ورمز الشحنة',
    excerpt:
      'الأيون هو ذرّة فقدت أو اكتسبت إلكترونًا أو أكثر. إذا فقدت الذرّة إلكترونًا (أو أكثر) تتحوّل إلى أيون موجب، ويرمز له برمز ذرّته مع عدد من الإشارات الموجبة يساوي عدد الإلكترونات التي فقدتها. وإذا اكتسبت الذرّة إلكترونًا (أو أكثر) تتحوّل إلى أيون سالب، ويرمز له برمز ذرّته مع عدد من الإشارات السالبة يساوي عدد الإلكترونات التي اكتسبتها.',
    implementedBy: ['ions', 'ion-reasoning'],
    status: 'implemented',
  },

  /* ------------------------------- page 9 -------------------------------- */
  {
    id: 'p9-examples-table',
    page: P('9'),
    kind: 'table',
    locator: 'أمثلة',
    title: 'جدول أمثلة: البوتاسيوم والفلور والكالسيوم والأكسجين — العدد الذري، التوزع، طريقة الوصول، الشحنة، الرمز',
    excerpt: 'K⁺ (19, 2-8-8-1, فقدان إلكترون واحد, 1+) · F⁻ (9, 2-7, اكتساب إلكترون واحد, 1−) · Ca²⁺ (20, 2-8-8-2, فقدان إلكترونين, 2+) · O²⁻ (8, 2-6, اكتساب إلكترونين, 2−)',
    implementedBy: ['ion-examples'],
    questionIds: ['book-p9-examples'],
    status: 'implemented',
  },
  {
    id: 'p9-activity-1',
    page: P('9'),
    kind: 'activity',
    locator: 'نشاط — الفراغ 1',
    title: 'تفقد ذرة الفضة Ag إلكتروناً واحداً فتتحول إلى … موجب نرمز له بالرمز …',
    excerpt: 'تفقد ذرّة الفضة Ag إلكترونًا واحدًا فتتحوّل إلى …… موجب، نرمز له بالرمز ……',
    implementedBy: ['ion-examples'],
    questionIds: ['book-p9-blank-1'],
    status: 'implemented',
    note: 'إشارة شحنة Br⁻ مطبوعة صغيرة جداً في الصورة؛ قُرئت كشحنة سالبة واحدة من سياق «أيون البروم» ومن قاعدة الرمز، ولم يُغيَّر نص السؤال.',
  },
  {
    id: 'p9-activity-2',
    page: P('9'),
    kind: 'activity',
    locator: 'نشاط — الفراغ 2',
    title: 'تتحول ذرة البروم إلى أيون البروم Br⁻ عندما تكتسب …',
    excerpt: 'تتحوّل ذرّة البروم إلى أيون البروم Br⁻ عندما تكتسب ……',
    implementedBy: ['ion-examples'],
    questionIds: ['book-p9-blank-2'],
    status: 'implemented',
  },
  {
    id: 'p9-lewis-definition',
    page: P('9'),
    kind: 'definition',
    locator: 'تمثيل لويس للذرات',
    title: 'تمثيل لويس: رمز الذرة محاطاً بإلكترونات الطبقة السطحية فقط، بنقاط أو حرف X صغير',
    excerpt:
      'اقترح لويس تمثيلًا مبسّطًا للذرات بحيث نكتبُ رمز الذرّة محاطة بالإلكترونات السّطحية فقط ويشار لها بنقاط أو حرف X صغير. مثال: ذرة الكالسيوم Ca نكتبها وفق لويس بالشكل C̈a لأنها تحوي إلكترونين سطحيين.',
    implementedBy: ['lewis', 'lewis-deep'],
    status: 'implemented',
  },
  {
    id: 'p9-lewis-table',
    page: P('9'),
    kind: 'activity',
    locator: 'أكمل الجدول',
    title: 'جدول لويس: الفلور 9، النيتروجين 7، الكربون 6، البورون 5، الليثيوم 3',
    excerpt: 'Li (3) · B (5) · C (6) · N (7) · F (9) مع التوزع وتمثيل لويس',
    implementedBy: ['lewis'],
    questionIds: ['book-p9-lewis-table', 'book-p9-lewis-n', 'book-p9-lewis-f'],
    status: 'implemented',
  },

  /* ------------------------------ page 10 -------------------------------- */
  {
    id: 'p10-activity-al-mg-o',
    page: P('10'),
    kind: 'activity',
    locator: 'نشاط',
    title: 'لدينا الذرات ₈O و₁₂Mg و₁₃Al: عدد الإلكترونات السطحية وتمثيل لويس',
    excerpt: 'لدينا الذرّات: ₈O و ₁₂Mg و ₁₃Al — ما عدد الإلكترونات السطحية في كلّ منها؟ أكتب تمثيل لويس للذرات السابقة.',
    implementedBy: ['activity-al-mg-o'],
    questionIds: ['book-p10-al-mg-o', 'book-p10-al-mg-o-surface', 'book-p10-al-mg-o-lewis'],
    status: 'implemented',
  },
  {
    id: 'p10-figure-hydrogen',
    page: P('10'),
    kind: 'figure',
    locator: 'ألاحظ وأستنتج',
    title: 'نوى نظائر الهيدروجين الثلاثة: العادي ¹₁H، الديوتيريوم ²₁H، التريتيوم ³₁H',
    excerpt: 'الهيدروجين العادي ¹₁H · الديوتيريوم ²₁H · التريتيوم ³₁H · البروتونات والنيوترونات والإلكترونات',
    implementedBy: ['isotopes'],
    status: 'reconstructed',
  },
  {
    id: 'p10-hydrogen-table',
    page: P('10'),
    kind: 'activity',
    locator: 'أملأ الجدول',
    title: 'جدول نظائر الهيدروجين: العدد الكتلي والعدد الذري وعدد النيوترونات',
    excerpt: '³₁H · ²₁H · ¹₁H',
    implementedBy: ['isotopes'],
    questionIds: ['book-p10-hydrogen-table', 'book-p10-hydrogen-a', 'book-p10-hydrogen-z', 'book-p10-hydrogen-n'],
    status: 'implemented',
  },
  {
    id: 'p10-questions',
    page: P('10'),
    kind: 'question',
    locator: 'أسئلة',
    title: 'أوجه الشبه والاختلاف بين نوى ذرات الهيدروجين، وأيها أكبر كتلة، وهل تتماثل في الخصائص الفيزيائية والكيميائية',
    excerpt:
      'ما أوجه الشبه والاختلاف بين نوى ذرّات عنصر الهيدروجين؟ أيّ الذرّات لها كتلة أكبر؟ هل تختلف بخصائصها الفيزيائية؟ وهل تتماثل بالخصائص الكيميائية؟',
    implementedBy: ['isotopes'],
    questionIds: ['book-p10-q1', 'book-p10-q2', 'book-p10-q3'],
    status: 'implemented',
  },

  /* ------------------------------ page 11 -------------------------------- */
  {
    id: 'p11-isotope-definition',
    page: P('11'),
    kind: 'definition',
    locator: 'أسئلة (تعريف النظائر)',
    title: 'تعريف النظائر: ذرات العنصر نفسه متماثلة بالعدد الذري ومختلفة بالعدد الكتلي',
    excerpt:
      'النظائر: هي ذرّات للعنصر نفسه تتماثل بالعدد الذري (فهي تتماثل بخاصياتها الكيميائية)، وتختلف بالعدد الكتلي (فهي تختلف بخاصياتها الفيزيائية).',
    implementedBy: ['isotopes-oxygen'],
    status: 'implemented',
  },
  {
    id: 'p11-oxygen-table',
    page: P('11'),
    kind: 'activity',
    locator: 'نشاط — أملأ الجدول',
    title: 'جدول نظائر الأكسجين ¹⁶O و¹⁷O و¹⁸O: العدد الكتلي والعدد الذري وعدد النيوترونات',
    excerpt: '¹⁶O · ¹⁷O · ¹⁸O',
    implementedBy: ['isotopes-oxygen'],
    questionIds: ['book-p11-oxygen-table', 'book-p11-oxygen-a', 'book-p11-oxygen-z', 'book-p11-oxygen-n'],
    status: 'implemented',
  },
  {
    id: 'p11-learn',
    page: P('11'),
    kind: 'summary',
    locator: 'تعلّمُ',
    title: 'خلاصة الصفحة: السويات السبع، السعة y = 2(n)²، تساوي الإلكترونات والبروتونات، الأيونان، والنظائر',
    excerpt:
      'يوجد في الذرة سبع سويات طاقة أساسية لها الأرقام 1–7 (K, L, M, N, O, P, Q) · كل منها تحوي عددًا أعظميًا من الإلكترونات يساوي 2(n)² · عدد الإلكترونات يساوي عدد البروتونات · فقدت إلكترونًا أو أكثر ← أيون موجب · اكتسبت ← أيون سالب · النظائر ذرات لعنصر واحد متماثلة بالعدد الذري ومختلفة بالعدد الكتلي.',
    implementedBy: ['summary', 'levels-law', 'ions', 'isotopes-oxygen'],
    status: 'implemented',
  },

  /* ------------------------------ page 12 -------------------------------- */
  {
    id: 'p12-q1',
    page: P('12'),
    kind: 'question',
    locator: 'أختبر نفسي — السؤال الأول',
    title: 'صواب أو خطأ: ست عبارات عن الأيونات والنظائر والسويات',
    implementedBy: ['book-check-1'],
    questionIds: ['book-tf-1', 'book-tf-2', 'book-tf-3', 'book-tf-4', 'book-tf-5', 'book-tf-6'],
    status: 'implemented',
  },
  {
    id: 'p12-q2',
    page: P('12'),
    kind: 'question',
    locator: 'أختبر نفسي — السؤال الثاني',
    title: 'اختر الإجابة الصحيحة: خمسة أسئلة بخياراتها الأربعة',
    implementedBy: ['book-check-2'],
    questionIds: ['book-mc-1', 'book-mc-2', 'book-mc-3', 'book-mc-4', 'book-mc-5'],
    status: 'implemented',
  },
  {
    id: 'p12-q3',
    page: P('12'),
    kind: 'question',
    locator: 'أختبر نفسي — السؤال الثالث',
    title: 'اكتب التوزع الإلكتروني ثم تمثيل لويس للذرات ₆C و₂He و₁₈Ar و₈O',
    implementedBy: ['book-check-3'],
    questionIds: ['book-lewis-c', 'book-lewis-he', 'book-lewis-ar', 'book-lewis-o'],
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
  /** Ledger entries whose implementation references do not exist yet. */
  danglingSteps: Array<{ item: string; stepId: string }>
  danglingQuestions: Array<{ item: string; questionId: string }>
  /** Textbook questions in the assessment layer that no ledger entry mentions. */
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
 * Computes the real coverage of the ledger against the lesson definition.
 * Nothing here trusts a hand-written status string: the referenced steps and
 * questions must actually exist, and every textbook question must be listed.
 */
export function computeLedgerCoverage(lesson: LessonDefinition): LedgerCoverage {
  const stepIds = new Set(lesson.steps.map((step) => step.id))
  const questionIds = allQuestionIds(lesson)
  const danglingSteps: LedgerCoverage['danglingSteps'] = []
  const danglingQuestions: LedgerCoverage['danglingQuestions'] = []

  for (const item of LESSON1_LEDGER) {
    for (const stepId of item.implementedBy) {
      if (!stepIds.has(stepId)) danglingSteps.push({ item: item.id, stepId })
    }
    for (const questionId of item.questionIds ?? []) {
      if (!questionIds.has(questionId)) danglingQuestions.push({ item: item.id, questionId })
    }
  }

  const listed = new Set(LESSON1_LEDGER.flatMap((item) => item.questionIds ?? []))
  const unlistedTextbookQuestions: string[] = []
  for (const test of lesson.tests ?? []) {
    for (const question of test.questions) {
      if (question.origin === 'textbook' && !listed.has(question.id)) unlistedTextbookQuestions.push(question.id)
    }
  }

  const byPage: Record<string, number> = {}
  for (const item of LESSON1_LEDGER) byPage[item.page] = (byPage[item.page] ?? 0) + 1

  const pages = lesson.source.pages.map((page) => page.page)
  const pagesWithoutEntries = pages.filter((page) => !byPage[page])

  return {
    total: LESSON1_LEDGER.length,
    implemented: LESSON1_LEDGER.filter((item) => item.status === 'implemented').length,
    reconstructed: LESSON1_LEDGER.filter((item) => item.status === 'reconstructed').length,
    decorative: LESSON1_LEDGER.filter((item) => item.status === 'decorative').length,
    byPage,
    danglingSteps,
    danglingQuestions,
    unlistedTextbookQuestions,
    pagesWithoutEntries,
  }
}

/** Blocks that belong to a given step, used by the coverage test to inspect content. */
export function stepBlocks(lesson: LessonDefinition, stepId: string): ContentBlock[] {
  return lesson.steps.find((step) => step.id === stepId)?.blocks ?? []
}
