import { buildBlueprint } from '../blueprint'
import type { TestBank, TestQuestion } from '../types'

/* ============================================================================
   اختبار الدرس الثاني — الروابط الكيميائية (الصفحات 13–17)
   ----------------------------------------------------------------------------
   هذه أسئلة مستقلة عن أسئلة الكتاب وتقويم الدرس واختباره النهائي. لا تعيد
   صياغة بند الرسم أو الاختيار نفسه؛ بل تطلب قراءة دليل، حساباً، مقارنةً،
   تشخيص خطأ أو بناء استدلال من إلكترونات السطح إلى نوع الرابطة.
   ========================================================================= */

const p = (page: string, item?: string) => ({ page, item })

const questions: TestQuestion[] = [
  /* 1 — معنى الرابطة في سياق مادة ........................................ */
  {
    id: 'ta-l2-q01',
    type: 'single-choice',
    difficulty: 'basic',
    conceptId: 'l2-bond-nature',
    tags: ['conceptual'],
    sourceRefs: [p('14')],
    prompt: 'أيّ عبارة تضع مصطلح «الرابطة الكيميائية» في موضعه الصحيح عند وصف مادة؟',
    options: [
      { id: 'a', label: 'قوة تجذب مكوّنات المادة إلى بعضها فتحافظ على تماسكها.' },
      { id: 'b', label: 'عدد النيوترونات في نواة كل ذرّة.' },
      { id: 'c', label: 'عدد السويات التي تشغلها الإلكترونات.' },
      { id: 'd', label: 'مجموع شحنات البروتونات داخل النواة فقط.' },
    ],
    correctOptionIds: ['a'],
  },

  /* 2 — قراءة دليلين من مقارنة الخواص ..................................... */
  {
    id: 'ta-l2-q02',
    type: 'single-choice',
    difficulty: 'basic',
    conceptId: 'l2-properties',
    tags: ['comparison', 'data-reading'],
    sourceRefs: [p('15'), p('16')],
    prompt: 'أيّ زوج من الملاحظات ينسجم مع المقارنة التي يوردها الدرس بين نوعي المركّبات؟',
    options: [
      { id: 'a', label: 'مركّب صلب مرتفعا الانصهار يوصل مصهوره، ومركّب آخر غازي غالباً منخفض الغليان.' },
      { id: 'b', label: 'مركّبان غازيان كلاهما يوصل التيار في حالته الصلبة.' },
      { id: 'c', label: 'مركّب أيوني لا يحوي أيونات، ومركّب مشترك مكوّن من معدن ولا معدن.' },
      { id: 'd', label: 'كل المركّبات المشتركة صلبة، وكل المركّبات الأيونية غازات.' },
    ],
    correctOptionIds: ['a'],
  },

  /* 3 — الفرق بين عدّ الجزيء وعدّ سطح الذرّة ......................... */
  {
    id: 'ta-l2-q03',
    type: 'true-false',
    difficulty: 'basic',
    conceptId: 'l2-lewis-counting',
    tags: ['conceptual'],
    sourceRefs: [p('15'), p('16')],
    prompt: 'عند عدّ إلكترونات الجزيء الكلية يُحسب الزوج المشترك مرة واحدة، أمّا عند فحص اكتمال سطح كل ذرّة فيُحسب هذا الزوج ضمن سطح كل طرف.',
    correctAnswer: true,
  },

  /* 4 — تطبيق قاعدة الثمانية على النيتروجين ......................... */
  {
    id: 'ta-l2-q04',
    type: 'numeric',
    difficulty: 'basic',
    conceptId: 'l2-covalent',
    tags: ['application'],
    sourceRefs: [p('15'), p('16')],
    prompt: 'تملك كل ذرّة نيتروجين 5 إلكترونات سطحية قبل الارتباط. كم إلكتروناً تحتاجه الذرّة الواحدة لتصل إلى 8؟ اكتب عدداً صحيحاً.',
    answer: { correctValue: 3, integerOnly: true, decimals: { max: 0 } },
  },

  /* 5 — رتبة الرابطة من عدد الأزواج ..................................... */
  {
    id: 'ta-l2-q05',
    type: 'exact',
    difficulty: 'basic',
    conceptId: 'l2-covalent',
    tags: ['conceptual'],
    sourceRefs: [p('15'), p('16')],
    prompt: 'جزيء O₂ فيه زوجان مشتركان بين الذرّتين. اكتب رتبة الرابطة بالكلمة: وحيدة، مضاعفة، أم ثلاثية؟',
    answer: { kind: 'text', acceptedAnswers: ['مضاعفة'] },
  },

  /* 6 — آلية الرابطة الأيونية ........................................... */
  {
    id: 'ta-l2-q06',
    type: 'multi-select',
    difficulty: 'basic',
    conceptId: 'l2-ionic',
    tags: ['conceptual'],
    sourceRefs: [p('14'), p('15')],
    prompt: 'اختر العبارتين اللتين تصفان الآلية الأيونية كما يشرحها الدرس:',
    options: [
      { id: 'a', label: 'ينتقل إلكترون أو أكثر من معدن إلى لا معدن.' },
      { id: 'b', label: 'ينشأ تجاذب كهربائي ساكن بين أيونات متعاكسة الشحنة.' },
      { id: 'c', label: 'تتقاسم الذرّتان زوجاً من الإلكترونات بينهما.' },
      { id: 'd', label: 'تنتقل البروتونات من النواة إلى ذرّات أخرى.' },
    ],
    correctOptionIds: ['a', 'b'],
  },

  /* 7 — قراءة تغيّر التوزيع في مثال جديد ............................... */
  {
    id: 'ta-l2-q07',
    type: 'single-choice',
    difficulty: 'medium',
    conceptId: 'l2-ionic',
    tags: ['application'],
    sourceRefs: [p('14'), p('15')],
    prompt: 'لدى Mg التوزيع 2-8-2، ولدى Cl التوزيع 2-8-7. أيّ وصف للانتقال يحافظ على قاعدة الثمانية للطرفين؟',
    options: [
      { id: 'a', label: 'يفقد Mg إلكترونين، ويكتسب كل Cl إلكتروناً واحداً.' },
      { id: 'b', label: 'يكتسب Mg إلكترونين، ويفقد كل Cl إلكتروناً واحداً.' },
      { id: 'c', label: 'يفقد Mg إلكتروناً واحداً، ويكتسب Cl إلكترونين.' },
      { id: 'd', label: 'تتشارك Mg وCl بثلاثة أزواج دون تكوّن أيونات.' },
    ],
    correctOptionIds: ['a'],
  },

  /* 8 — تعادل البلورة الأيونية .......................................... */
  {
    id: 'ta-l2-q08',
    type: 'true-false',
    difficulty: 'medium',
    conceptId: 'l2-ionic',
    tags: ['problem-solving'],
    sourceRefs: [p('15'), p('17')],
    prompt: 'في وحدة متعادلة من MgCl₂، تعادل شحنة Mg²⁺ الموجبة شحنتين سالبتين من أيونَي Cl⁻، مع بقاء كل أيون محتفظاً بعدد بروتوناته.',
    correctAnswer: true,
  },

  /* 9 — توسيع النسبة إلى عيّنة من الجسيمات ......................... */
  {
    id: 'ta-l2-q09',
    type: 'numeric',
    difficulty: 'medium',
    conceptId: 'l2-ionic',
    tags: ['application', 'problem-solving'],
    sourceRefs: [p('14'), p('15')],
    prompt: 'إذا تكوّنت 3 وحدات متعادلة من MgCl₂، فما عدد أيونات Cl⁻ اللازمة لها؟ اكتب عدداً صحيحاً.',
    answer: { correctValue: 6, integerOnly: true, decimals: { max: 0 } },
  },

  /* 10 — كتابة أيون بعد الفقد ........................................... */
  {
    id: 'ta-l2-q10',
    type: 'exact',
    difficulty: 'medium',
    conceptId: 'l2-ionic',
    tags: ['application'],
    sourceRefs: [p('14'), p('15')],
    prompt: 'يفقد المغنزيوم إلكترونَي سطحه في المثال الأيوني. اكتب رمز الأيون الناتج بصيغة الرمز والشحنة، مثل Ca2+.',
    answer: { kind: 'ion', acceptedAnswers: ['Mg2+'] },
  },

  /* 11 — بناء تمثيل لويس بخطة لا بحفظ شكل ......................... */
  {
    id: 'ta-l2-q11',
    type: 'ordering',
    difficulty: 'medium',
    conceptId: 'l2-lewis-counting',
    tags: ['application', 'problem-solving'],
    sourceRefs: [p('15'), p('16')],
    prompt: 'رتّب خطوات بناء تمثيل لويس لجزيء O₂ من المعطى إلى الرسم النهائي:',
    items: [
      { id: 'surface', label: 'تحديد أن لكل ذرّة أكسجين 6 إلكترونات سطحية.' },
      { id: 'need', label: 'حساب أن كل ذرّة تحتاج إلكترونين لإكمال 8.' },
      { id: 'pairs', label: 'تحويل الإلكترونين المطلوبين لكل طرف إلى زوجين مشتركين بين الطرفين.' },
      { id: 'lone', label: 'إبقاء زوجين غير مشتركين حول كل ذرّة بعد تكوين الرابطتين.' },
      { id: 'mark', label: 'وضع علامة الرابطة المضاعفة بين رمزي O.' },
    ],
    correctOrder: ['surface', 'need', 'pairs', 'lone', 'mark'],
  },

  /* 12 — مطابقة مقدار النقص أو الفقد ................................. */
  {
    id: 'ta-l2-q12',
    type: 'matching',
    difficulty: 'medium',
    conceptId: 'l2-covalent',
    tags: ['comparison', 'data-reading'],
    sourceRefs: [p('15'), p('16')],
    prompt: 'طابق كل الحالة مع عدد الإلكترونات الذي يعبّر عن النقص أو الفقد في الذرّة قبل الارتباط:',
    left: [
      { id: 'h', label: 'H: ما ينقصه لإكمال السوية الأولى' },
      { id: 'o', label: 'O: ما ينقصه لإكمال الثمانية' },
      { id: 'n', label: 'N: ما ينقصه لإكمال الثمانية' },
      { id: 'mg', label: 'Mg: ما يفقده للوصول إلى 2-8' },
    ],
    right: [
      { id: 'one', label: 'إلكترون واحد' },
      { id: 'two-covalent', label: 'إلكترونان في المشاركة' },
      { id: 'three', label: 'ثلاثة إلكترونات' },
      { id: 'two-transfer', label: 'إلكترونان في الانتقال' },
    ],
    pairs: [
      { leftId: 'h', rightId: 'one' },
      { leftId: 'o', rightId: 'two-covalent' },
      { leftId: 'n', rightId: 'three' },
      { leftId: 'mg', rightId: 'two-transfer' },
    ],
  },

  /* 13 — تحليل الخلط بين السطح وما ينقص ............................... */
  {
    id: 'ta-l2-q13',
    type: 'error-analysis',
    difficulty: 'medium',
    conceptId: 'l2-lewis-counting',
    tags: ['error-analysis'],
    sourceRefs: [p('15'), p('16')],
    prompt: 'حلّل العبارة الخاطئة الآتية عن O₂: «للأكسجين 6 إلكترونات سطحية، إذن نرسم 6 أزواج مشتركة بين الذرّتين، فتكون الرابطة سداسية». أين الخلل الرئيس؟',
    flawedWork: 'للأكسجين 6 إلكترونات سطحية، إذن نرسم 6 أزواج مشتركة بين الذرّتين، فتكون الرابطة سداسية.',
    options: [
      { id: 'a', label: 'الخلل هو عدّ ما ينقص الذرّة كأنه عدد الأزواج؛ ينقصها إلكترونان فقط، أي زوجان مشتركان.' },
      { id: 'b', label: 'الخلل هو أن للأكسجين إلكتروناً سطحياً واحداً فقط.' },
      { id: 'c', label: 'الخلل هو أن الإلكترونات المشتركة لا تدخل في عدّ سطح الذرّة.' },
      { id: 'd', label: 'لا خلل؛ ستة أزواج هي تمثيل O₂ الصحيح.' },
    ],
    correctOptionIds: ['a'],
  },

  /* 14 — تصحيح صيغة المركب من ميزان الشحنة ......................... */
  {
    id: 'ta-l2-q14',
    type: 'error-correction',
    difficulty: 'advanced',
    conceptId: 'l2-ionic',
    tags: ['error-analysis', 'problem-solving'],
    sourceRefs: [p('15'), p('17')],
    prompt: 'صحّح الصيغة في الحل الآتي: «لأن Mg²⁺ يحمل شحنتين، يكفي أيون Cl⁻ واحد، لذلك صيغة المركب MgCl». اكتب الصيغة المتعادلة.',
    flawedWork: 'لأن Mg²⁺ يحمل شحنتين، يكفي أيون Cl⁻ واحد، لذلك صيغة المركب MgCl.',
    correction: { kind: 'exact', spec: { kind: 'formula', acceptedAnswers: ['MgCl2'] } },
  },

  /* 15 — الاستدلال من ثلاث خاصيات معاً ................................. */
  {
    id: 'ta-l2-q15',
    type: 'single-choice',
    difficulty: 'advanced',
    conceptId: 'l2-properties',
    tags: ['comparison', 'thinking'],
    sourceRefs: [p('15'), p('16')],
    prompt: 'مادة مجهولة صلبة في درجة الغرفة، لا تنقل التيار وهي صلبة، تنقله عند صهرها، ودرجة انصهارها مرتفعة. ما الاستنتاج الأقوى وفق خواص الدرس؟',
    options: [
      { id: 'a', label: 'أنها مادة ذات رابطة أيونية؛ تتحرّك أيوناتها عند الصهر.' },
      { id: 'b', label: 'أنها جزيء مشترك غازي؛ لأن كل المواد المشتركة موصلة عند الصهر.' },
      { id: 'c', label: 'أنها ذرّة منفردة؛ لأن الذرّة الصلبة لا تحوي روابط.' },
      { id: 'd', label: 'أنها رابطة مشتركة حتماً؛ لأن الصلب لا ينقل التيار.' },
    ],
    correctOptionIds: ['a'],
  },

  /* 16 — اختيار خطوات سليمة لبناء المقارنة ......................... */
  {
    id: 'ta-l2-q16',
    type: 'multi-select',
    difficulty: 'advanced',
    conceptId: 'l2-covalent',
    tags: ['application', 'comparison', 'problem-solving'],
    sourceRefs: [p('15'), p('16')],
    prompt: 'اختر الخطوات التي تساعد فعلاً على توقّع عدد الأزواج المشتركة من إلكترونات السطح:',
    options: [
      { id: 'a', label: 'نحسب ما ينقص كل ذرّة لتصل إلى 8، أو إلى 2 للهيدروجين.' },
      { id: 'b', label: 'نحوّل عدد الإلكترونات التي تنقص الطرف الواحد إلى عدد الأزواج المشتركة.' },
      { id: 'c', label: 'نساوي عدد الأزواج المشتركة بعدد البروتونات في النواة.' },
      { id: 'd', label: 'نراجع بعد الرسم أن عدد الإلكترونات حول كل طرف يحقق القاعدة المناسبة.' },
    ],
    correctOptionIds: ['a', 'b', 'd'],
  },

  /* 17 — فحص الثمانية بعد رسم N₂ ......................................... */
  {
    id: 'ta-l2-q17',
    type: 'numeric',
    difficulty: 'advanced',
    conceptId: 'l2-lewis-counting',
    tags: ['application', 'data-reading'],
    sourceRefs: [p('15'), p('16')],
    prompt: 'في N₂ يحيط بكل ذرّة زوج غير مشترك واحد، وتصلها ثلاثة أزواج مشتركة. كم إلكتروناً يُعدّ حول ذرّة نيتروجين واحدة؟',
    answer: { correctValue: 8, integerOnly: true, decimals: { max: 0 } },
  },

  /* 18 — تفسير نوع الرابطة لا تسميته فقط ............................... */
  {
    id: 'ta-l2-q18',
    type: 'single-choice',
    difficulty: 'thinking',
    conceptId: 'l2-covalent',
    tags: ['thinking', 'comparison'],
    sourceRefs: [p('15'), p('16')],
    prompt: 'قال طالب: «وجود عنصرين مختلفين يكفي لأسمّي الرابطة أيونية». أيّ دليل من الدرس يصحّح حكمه عند النظر إلى H₂O؟',
    options: [
      { id: 'a', label: 'كلا العنصرين لا معدنيان، فتتشارك الذرّات أزواجاً بدلاً من انتقال إلكترونات معدن إلى لا معدن.' },
      { id: 'b', label: 'كل عنصرين مختلفين يتبادلان البروتونات، ولذلك تكون الرابطة أيونية.' },
      { id: 'c', label: 'الماء لا يحوي إلكترونات سطحية، لذلك لا رابطة فيه.' },
      { id: 'd', label: 'العدد الكتلي للماء يحدد نوع الرابطة وحده.' },
    ],
    correctOptionIds: ['a'],
  },

  /* 19 — تحليل قلب عدد الإلكترونات المطلوبة ......................... */
  {
    id: 'ta-l2-q19',
    type: 'error-analysis',
    difficulty: 'thinking',
    conceptId: 'l2-covalent',
    tags: ['error-analysis', 'thinking', 'comparison'],
    sourceRefs: [p('15'), p('16')],
    prompt: 'يقول حلّ خاطئ: «O سطحه 6، لذلك يحتاج 6 أزواج مشتركة، بينما N سطحه 5، لذلك يحتاج 5 أزواج». ما التصحيح الذي يكشف سبب الخطأ؟',
    flawedWork: 'O سطحه 6، لذلك يحتاج 6 أزواج مشتركة، بينما N سطحه 5، لذلك يحتاج 5 أزواج.',
    options: [
      { id: 'a', label: 'نحسب الفارق إلى 8: O ينقصه 2 إلكترون فيشارك بزوجين، وN ينقصه 3 فيشارك بثلاثة أزواج.' },
      { id: 'b', label: 'نطرح عدد السطح من 2 دائماً؛ فيحتاج O أربعة أزواج وN ثلاثة.' },
      { id: 'c', label: 'نعدّ البروتونات؛ فيحتاج O ثمانية أزواج وN سبعة.' },
      { id: 'd', label: 'لا نحتاج إلى قاعدة؛ كل الذرّات تشارك بزوج واحد.' },
    ],
    correctOptionIds: ['a'],
  },

  /* 20 — تصحيح قراءة النموذج الكروي ................................. */
  {
    id: 'ta-l2-q20',
    type: 'error-correction',
    difficulty: 'thinking',
    conceptId: 'l2-lewis-counting',
    tags: ['error-analysis', 'thinking'],
    sourceRefs: [p('15'), p('16')],
    prompt: 'صحّح العبارة الآتية عن النموذج الكروي للرابطة المشتركة: «كل قرص سالب مرسوم حول الكرة يمثّل زوجاً مشتركاً بين الذرّتين». اكتب ما يمثّله القرص المفرد.',
    flawedWork: 'كل قرص سالب مرسوم حول الكرة يمثّل زوجاً مشتركاً بين الذرّتين.',
    correction: {
      kind: 'exact',
      spec: { kind: 'text', acceptedAnswers: ['إلكترون غير مشترك'] },
    },
  },
]

export const chemUnit1Lesson2Bank: TestBank = {
  id: 'chem-u1-l2',
  version: 1,
  scope: 'lesson',
  title: 'اختبار الدرس الثاني — الروابط الكيميائية',
  summary:
    'عشرون سؤالاً أصلياً تقيس الرابطة الكيميائية، الانتقال والمشاركة، عدّ الأزواج وتمثيل لويس، خواص المركّبات وتحليل الأخطاء.',
  unitId: 'chem-u1',
  lessonIds: ['chem-u1-l2'],
  questions,
  blueprint: buildBlueprint({
    testId: 'chem-u1-l2',
    scope: 'lesson',
    unitId: 'chem-u1',
    lessonIds: ['chem-u1-l2'],
    questions,
    concepts: [
      {
        id: 'l2-bond-nature',
        label: 'مفهوم الرابطة الكيميائية وقوى التماسك',
        pageRefs: [p('13'), p('14')],
        questionIds: ['ta-l2-q01'],
      },
      {
        id: 'l2-ionic',
        label: 'انتقال الإلكترونات والأيونات والمركب الأيوني',
        pageRefs: [p('14'), p('15'), p('17')],
        questionIds: ['ta-l2-q06', 'ta-l2-q07', 'ta-l2-q08', 'ta-l2-q09', 'ta-l2-q10', 'ta-l2-q14'],
      },
      {
        id: 'l2-properties',
        label: 'خواص المركبات الأيونية والمشتركة',
        pageRefs: [p('15'), p('16')],
        questionIds: ['ta-l2-q02', 'ta-l2-q15'],
      },
      {
        id: 'l2-covalent',
        label: 'المشاركة ورتبة الرابطة وقاعدة الثمانية',
        pageRefs: [p('15'), p('16')],
        questionIds: ['ta-l2-q04', 'ta-l2-q05', 'ta-l2-q12', 'ta-l2-q16', 'ta-l2-q18', 'ta-l2-q19'],
      },
      {
        id: 'l2-lewis-counting',
        label: 'قراءة تمثيل لويس وعدّ الإلكترونات المشتركة وغير المشتركة',
        pageRefs: [p('15'), p('16')],
        questionIds: ['ta-l2-q03', 'ta-l2-q11', 'ta-l2-q13', 'ta-l2-q17', 'ta-l2-q20'],
      },
    ],
    commonErrors: [
      {
        id: 'e2-transfer-share',
        label: 'الخلط بين انتقال الإلكترونات في الأيونية ومشاركتها في المشتركة',
        questionIds: ['ta-l2-q06', 'ta-l2-q07', 'ta-l2-q18'],
      },
      {
        id: 'e2-surface-deficit',
        label: 'اعتبار عدد الإلكترونات السطحية هو عدد الإلكترونات أو الأزواج المطلوبة',
        questionIds: ['ta-l2-q04', 'ta-l2-q13', 'ta-l2-q19'],
      },
      {
        id: 'e2-double-count',
        label: 'عدّ الزوج المشترك مرة واحدة أو مرتين في الموضع الخطأ',
        questionIds: ['ta-l2-q03', 'ta-l2-q11', 'ta-l2-q17'],
      },
      {
        id: 'e2-charge-balance',
        label: 'إهمال تعادل الشحنة أو كتابة نسبة MgCl₂ غير المتعادلة',
        questionIds: ['ta-l2-q08', 'ta-l2-q09', 'ta-l2-q14'],
      },
      {
        id: 'e2-model-symbols',
        label: 'الخلط بين القرص غير المشترك والزوج المشترك في النموذج',
        questionIds: ['ta-l2-q20'],
      },
    ],
    scoring: { pointsPerQuestion: 1, allowPartial: false },
    solutionChunkSize: 5,
  }),
}

export default chemUnit1Lesson2Bank
