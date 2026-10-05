import { buildBlueprint } from '../blueprint'
import type { TestBank, TestQuestion } from '../types'

/* ============================================================================
   اختبار الدرس الأول — الذرّة والعنصر (الصفحات 3–12)
   ----------------------------------------------------------------------------
   Every question below is authored from material that is actually published in
   the lesson: the atomic models (4–5), the principal levels and their capacity
   law (5–6), the electron distribution (6, 12), the nuclear notation (7–8),
   ions (8–9), the Lewis representation (9–10) and isotopes (10–11).

   None of these questions is the book's question restated, and none is a
   number swap of one: they ask the same knowledge through a new situation, a
   comparison, an ordering, an error to diagnose or a value to derive.
   ========================================================================= */

const p = (page: string, item?: string) => ({ page, item })

const questions: TestQuestion[] = [
  /* 1 — نماذج الذرة: استنتاج رذرفورد ...................................... */
  {
    id: 'ta-l1-q01',
    type: 'single-choice',
    difficulty: 'basic',
    conceptId: 'l1-models',
    tags: ['conceptual'],
    sourceRefs: [p('5')],
    prompt:
      'أسقط رذرفورد حزمة من جسيمات ألفا الموجبة على صفيحة ذهب رقيقة، فنفذ معظمها دون انحراف، وانحرف جزء صغير منها وارتدّ بعضها. أيّ استنتاج يفسّر هذه الملاحظة مباشرة؟',
    options: [
      { id: 'a', label: 'الذرّة جسم مصمت تتوزع شحنته الموجبة في حجمه كله.' },
      { id: 'b', label: 'معظم حجم الذرّة فراغ، وتتركز كتلتها وشحنتها الموجبة في جزء صغير جداً منها.' },
      { id: 'c', label: 'الإلكترونات سالبة الشحنة تتوزع داخل كتلة موجبة متجانسة.' },
      { id: 'd', label: 'جسيمات ألفا سالبة الشحنة فتنجذب إلى نواة الذرّة.' },
    ],
    correctOptionIds: ['b'],
  },

  /* 2 — نموذج بور: اتجاه الطاقة ........................................... */
  {
    id: 'ta-l1-q02',
    type: 'true-false',
    difficulty: 'basic',
    conceptId: 'l1-models',
    tags: ['conceptual'],
    sourceRefs: [p('5')],
    prompt:
      'وفق نموذج بور: عندما ينتقل الإلكترون من سويّة طاقة أعلى إلى سويّة طاقة أدنى، تمتصّ الذرّة مقداراً من الطاقة.',
    correctAnswer: false,
  },

  /* 3 — التوفيق بين قانون السعة وقيد الثمانية ............................. */
  {
    id: 'ta-l1-q03',
    type: 'single-choice',
    difficulty: 'advanced',
    conceptId: 'l1-levels',
    tags: ['conceptual'],
    sourceRefs: [p('6')],
    prompt:
      'تقول عبارة الكتاب إن «السويّة الأخيرة لا تحوي أكثر من ثمانية إلكترونات»، في حين تعطي العلاقة y = 2(n)² للسويّة M سعةً مقدارها 18 إلكتروناً. أيّ تفسير يرفع هذا التعارض؟',
    options: [
      {
        id: 'a',
        label:
          'العلاقة تعطي أقصى ما تتّسع له السويّة، وقيد الثمانية يخصّ السويّة الأخيرة وحدها؛ فلا يلزم أن تُملأ السويّة حتى سعتها العظمى.',
      },
      { id: 'b', label: 'العلاقة y = 2(n)² تُستعمل للسويّات الداخلية فقط، أما الأخيرة فتُحسب بالثمانية.' },
      { id: 'c', label: 'العدد 18 في العلاقة يخصّ السويّتين M وN معاً، فيبقى لكلٍّ منهما ثمانية.' },
      { id: 'd', label: 'قيد الثمانية يخصّ الذرّات المعتدلة وحدها، أما الأيونات فتُملأ سويّاتها كاملة.' },
    ],
    correctOptionIds: ['a'],
  },

  /* 4 — حساب سعة سوية ..................................................... */
  {
    id: 'ta-l1-q04',
    type: 'numeric',
    difficulty: 'basic',
    conceptId: 'l1-levels',
    tags: ['application'],
    sourceRefs: [p('6')],
    prompt:
      'احسب العدد الأعظمي للإلكترونات في السويّة الرئيسية الخامسة O باستعمال العلاقة y = 2(n)²، ثم اكتب الناتج عدداً.',
    answer: { correctValue: 50, integerOnly: true, decimals: { max: 0 } },
  },

  /* 5 — قراءة عبارة علمية من الكتاب ....................................... */
  {
    id: 'ta-l1-q05',
    type: 'exact',
    difficulty: 'basic',
    conceptId: 'l1-models',
    tags: ['data-reading'],
    sourceRefs: [p('4')],
    prompt:
      'ورد في الكتاب أنّ الإلكترون جسيم كتلته تقريباً جزءٌ من أجزاء كتلة نواة ذرّة الهيدروجين. اكتب هذه النسبة كسراً كما وردت.',
    answer: { kind: 'fraction', acceptedAnswers: ['1/1860'] },
  },

  /* 6 — شحنة الأيون بالجبر ................................................ */
  {
    id: 'ta-l1-q06',
    type: 'numeric',
    difficulty: 'medium',
    conceptId: 'l1-ions',
    tags: ['problem-solving'],
    sourceRefs: [p('9')],
    prompt:
      'أيون الفلوريد F⁻ يحوي 10 إلكترونات. كم عدد البروتونات في نواته؟ اكتب عدداً صحيحاً.',
    answer: { correctValue: 9, integerOnly: true, decimals: { max: 0 } },
  },

  /* 7 — المجموع الجبري بعد الفقد .......................................... */
  {
    id: 'ta-l1-q07',
    type: 'single-choice',
    difficulty: 'medium',
    conceptId: 'l1-ions',
    tags: ['application'],
    sourceRefs: [p('9')],
    prompt:
      'فقدت ذرّة كالسيوم ₂₀Ca إلكتروني سطحها. ما المجموع الجبري لشحنات الأيون الناتج؟',
    options: [
      { id: 'a', label: '+2' },
      { id: 'b', label: '−2' },
      { id: 'c', label: 'صفر' },
      { id: 'd', label: '+20' },
    ],
    correctOptionIds: ['a'],
  },

  /* 8 — قواعد تمثيل لويس .................................................. */
  {
    id: 'ta-l1-q08',
    type: 'multi-select',
    difficulty: 'basic',
    conceptId: 'l1-lewis',
    tags: ['conceptual'],
    sourceRefs: [p('9')],
    prompt: 'اختر العبارتين الصحيحتين في وصف تمثيل لويس للذرّة:',
    options: [
      { id: 'a', label: 'يعرض إلكترونات السويّة الأخيرة فقط، لا جميع إلكترونات الذرّة.' },
      { id: 'b', label: 'توضع النقاط فرادى حول الجهات الأربع قبل أن تبدأ الأزواج.' },
      { id: 'c', label: 'يعرض جميع إلكترونات الذرّة مرتّبةً حسب سويّاتها.' },
      { id: 'd', label: 'يُرسم عدد من النقاط يساوي عدد البروتونات في النواة.' },
    ],
    correctOptionIds: ['a', 'b'],
  },

  /* 9 — تعريف النظائر ..................................................... */
  {
    id: 'ta-l1-q09',
    type: 'true-false',
    difficulty: 'basic',
    conceptId: 'l1-isotopes',
    tags: ['conceptual'],
    sourceRefs: [p('10')],
    prompt:
      'ذرّتان للعنصر نفسه تختلفان في عدد النيوترونات تُسمّيان نظيرين لهذا العنصر.',
    correctAnswer: true,
  },

  /* 10 — توقّع رمز أيون from the surface electrons ......................... */
  {
    id: 'ta-l1-q10',
    type: 'exact',
    difficulty: 'medium',
    conceptId: 'l1-ions',
    tags: ['application'],
    sourceRefs: [p('10')],
    prompt:
      'ذرّة الألمنيوم ₁₃Al توزيعها الإلكتروني 2-8-3. اكتب رمز الأيون المتوقّع بعد أن تفقد إلكترونات سطحها (اكتب الشحنة بعد الرمز، مثل Ca2+).',
    answer: { kind: 'ion', acceptedAnswers: ['Al3+'] },
  },

  /* 11 — ترتيب مراحل تكوّن أيون موجب ...................................... */
  {
    id: 'ta-l1-q11',
    type: 'ordering',
    difficulty: 'medium',
    conceptId: 'l1-ions',
    tags: ['application'],
    sourceRefs: [p('9')],
    prompt: 'رتّب الخطوات الآتية لتحديد رمز أيون موجب يتكوّن من ذرّة فلز:',
    items: [
      { id: 'dist', label: 'كتابة التوزيع الإلكتروني للذرّة المعتدلة.' },
      { id: 'surface', label: 'تحديد عدد إلكترونات السويّة الأخيرة.' },
      { id: 'lose', label: 'إزالة إلكترونات السطح كلها من عدد الإلكترونات.' },
      { id: 'sum', label: 'حساب المجموع الجبري: البروتونات − الإلكترونات.' },
      { id: 'symbol', label: 'كتابة رمز الأيون مع مقدار الشحنة وإشارتها.' },
    ],
    correctOrder: ['dist', 'surface', 'lose', 'sum', 'symbol'],
  },

  /* 12 — مطابقة ذرّة بعدد إلكترونات سطحها ................................. */
  {
    id: 'ta-l1-q12',
    type: 'matching',
    difficulty: 'medium',
    conceptId: 'l1-distribution',
    tags: ['application'],
    sourceRefs: [p('9')],
    prompt: 'طابق كل ذرّة مع عدد الإلكترونات في سويّتها الأخيرة:',
    left: [
      { id: 'na', label: '₁₁Na' },
      { id: 'p', label: '₁₅P' },
      { id: 'ar', label: '₁₈Ar' },
      { id: 'o', label: '₈O' },
    ],
    right: [
      { id: 'one', label: 'إلكترون واحد' },
      { id: 'five', label: 'خمسة إلكترونات' },
      { id: 'eight', label: 'ثمانية إلكترونات' },
      { id: 'six', label: 'ستة إلكترونات' },
    ],
    pairs: [
      { leftId: 'na', rightId: 'one' },
      { leftId: 'p', rightId: 'five' },
      { leftId: 'ar', rightId: 'eight' },
      { leftId: 'o', rightId: 'six' },
    ],
  },

  /* 13 — تحليل خطأ: البروتونات لا تتغير .................................... */
  {
    id: 'ta-l1-q13',
    type: 'error-analysis',
    difficulty: 'advanced',
    conceptId: 'l1-ions',
    tags: ['error-analysis'],
    sourceRefs: [p('9')],
    prompt:
      'قرأتُ حلّ طالب ثم طُلب مني تحديد موضع الخطأ فيه. إليك ما كتبه: «ذرّة الأكسجين ₈O توزيعها 2-6؛ تكتسب إلكترونين فيصبح توزيعها 2-8 وشحنتها −2، أي إن عدد بروتوناتها صار 6 لأن الشحنة السالبة زادت». أين الخطأ؟',
    flawedWork:
      'ذرّة الأكسجين ₈O توزيعها 2-6؛ تكتسب إلكترونين فيصبح توزيعها 2-8 وشحنتها −2، أي إن عدد بروتوناتها صار 6 لأن الشحنة السالبة زادت.',
    options: [
      { id: 'a', label: 'الخطأ في التوزيع 2-6؛ فالأكسجين توزيعه 2-8.' },
      { id: 'b', label: 'الخطأ في أنّ اكتساب الإلكترونات يغيّر عدد البروتونات.' },
      { id: 'c', label: 'الخطأ في شحنة الأيون؛ فالأكسجين يكتسب إلكتروناً واحداً.' },
      { id: 'd', label: 'لا يوجد خطأ في الحل.' },
    ],
    correctOptionIds: ['b'],
  },

  /* 14 — تصحيح: نيوترونات أيون ............................................ */
  {
    id: 'ta-l1-q14',
    type: 'error-correction',
    difficulty: 'advanced',
    conceptId: 'l1-nuclear',
    tags: ['error-analysis'],
    sourceRefs: [p('8')],
    prompt:
      'صحّح القيمة الخاطئة في الحل الآتي: كم عدد النيوترونات في أيون ²³₁₁Na⁺؟ اكتب العدد الصحيح.',
    flawedWork:
      'قال الطالب: «عدد النيوترونات في ²³₁₁Na⁺ يساوي 11؛ لأن الأيون فقد إلكتروناً فنقص عدده واحداً عن 12»، وحسبها هكذا: 11 = 12 − 1.',
    correction: { kind: 'numeric', spec: { correctValue: 12, integerOnly: true, decimals: { max: 0 } } },
  },

  /* 15 — لماذا فشل نموذج طومسون ........................................... */
  {
    id: 'ta-l1-q15',
    type: 'single-choice',
    difficulty: 'thinking',
    conceptId: 'l1-models',
    tags: ['thinking'],
    sourceRefs: [p('4'), p('5')],
    prompt:
      'لماذا يعجز نموذج طومسون عن تفسير ارتداد بعض جسيمات ألفا، في حين يفسّره نموذج رذرفورد؟',
    options: [
      {
        id: 'a',
        label:
          'لأن الشحنة الموجبة في نموذج طومسون منتشرة في حجم الذرّة كلها، فلا يوجد مركز كثيف يردّ الجسيم الموجب؛ أما رذرفورد فجعل الكتلة والشحنة الموجبة في نواة صغيرة.',
      },
      { id: 'b', label: 'لأن جسيمات ألفا في نموذج طومسون سالبة الشحنة فلا تُرَدّ.' },
      { id: 'c', label: 'لأن الإلكترونات في نموذج طومسون تدور في سويّات محدّدة تمنع الارتداد.' },
      { id: 'd', label: 'لأن نموذج طومسون ينفي وجود الإلكترونات أصلاً.' },
    ],
    correctOptionIds: ['a'],
  },

  /* 16 — السويّات الرئيسية ................................................ */
  {
    id: 'ta-l1-q16',
    type: 'multi-select',
    difficulty: 'medium',
    conceptId: 'l1-levels',
    tags: ['comparison'],
    sourceRefs: [p('6')],
    prompt: 'اختر العبارتين الصحيحتين عن السويّات الرئيسية في نموذج بور:',
    options: [
      { id: 'a', label: 'تُسمّى بالترتيب من الداخل إلى الخارج: K ثم L ثم M ثم N.' },
      { id: 'b', label: 'تُملأ بالترتيب من السويّة الأدنى طاقةً إلى التي تليها.' },
      { id: 'c', label: 'السويّة الأقرب إلى النواة هي الأعلى طاقة.' },
      { id: 'd', label: 'تتّسع السويّة الأخيرة لأيّ عدد من الإلكترونات بلا حدّ.' },
    ],
    correctOptionIds: ['a', 'b'],
  },

  /* 17 — عدد السويّات المشغولة ............................................ */
  {
    id: 'ta-l1-q17',
    type: 'numeric',
    difficulty: 'medium',
    conceptId: 'l1-distribution',
    tags: ['application'],
    sourceRefs: [p('9')],
    prompt:
      'ذرّة الكالسيوم توزيعها الإلكتروني 2-8-8-2. كم عدد السويّات الرئيسية المشغولة بالإلكترونات فيها؟ اكتب عدداً صحيحاً.',
    answer: { correctValue: 4, integerOnly: true, decimals: { max: 0 } },
  },

  /* 18 — التفريق بين النظير والأيون ....................................... */
  {
    id: 'ta-l1-q18',
    type: 'single-choice',
    difficulty: 'thinking',
    conceptId: 'l1-isotopes',
    tags: ['thinking', 'comparison'],
    sourceRefs: [p('11')],
    prompt: 'أيّ عبارة تفرّق تفريقاً صحيحاً بين النظير والأيون؟',
    options: [
      {
        id: 'a',
        label: 'النظير يختلف عن ذرّة العنصر نفسه بعدد النيوترونات، والأيون يختلف عنها بعدد الإلكترونات.',
      },
      { id: 'b', label: 'كلاهما ينتج عن تغيّر في عدد البروتونات داخل النواة.' },
      { id: 'c', label: 'النظير جسيم مشحون، والأيون ذرّة متعادلة كهربائياً.' },
      { id: 'd', label: 'الأيون يغيّر العدد الكتلي، والنظير يغيّر الشحنة فقط.' },
    ],
    correctOptionIds: ['a'],
  },

  /* 19 — تصحيح: نسيان التربيع ............................................. */
  {
    id: 'ta-l1-q19',
    type: 'error-correction',
    difficulty: 'advanced',
    conceptId: 'l1-levels',
    tags: ['error-analysis'],
    sourceRefs: [p('6')],
    prompt:
      'صحّح القيمة الخاطئة: ما العدد الأعظمي للإلكترونات في السويّة L؟ اكتب القيمة الصحيحة عدداً.',
    flawedWork:
      'كتب الطالب: «رقم السويّة L هو n = 2، إذن y = 2 × 2 = 4 إلكترونات»، فحصل على 4.',
    correction: { kind: 'numeric', spec: { correctValue: 8, integerOnly: true, decimals: { max: 0 } } },
  },

  /* 20 — قراءة الترميز النووي وتحويله إلى نظير آخر ........................ */
  {
    id: 'ta-l1-q20',
    type: 'single-choice',
    difficulty: 'thinking',
    conceptId: 'l1-nuclear',
    tags: ['thinking'],
    sourceRefs: [p('7'), p('11')],
    prompt:
      'الترميز ²⁰₁₀Ne يمثّل ذرّة نيون. أيّ تغيير يجعل الرمز يمثّل نظيراً آخر للنيون نفسه؟',
    options: [
      { id: 'a', label: 'تغيير العدد 20 إلى 22 مع تثبيت العدد 10 والرمز Ne.' },
      { id: 'b', label: 'تغيير العدد 10 إلى 12 مع تثبيت العدد 20.' },
      { id: 'c', label: 'إضافة إلكترون واحد إلى الذرّة المتعادلة.' },
      { id: 'd', label: 'تغيير الرمز Ne إلى رمز عنصر آخر مع تثبيت العددين.' },
    ],
    correctOptionIds: ['a'],
  },
]

export const chemUnit1Lesson1Bank: TestBank = {
  id: 'chem-u1-l1',
  version: 1,
  scope: 'lesson',
  title: 'اختبار الدرس الأول — الذرّة والعنصر',
  summary:
    'عشرون سؤالاً أصلياً تغطّي نماذج الذرّة، السويّات وسعتها، التوزيع الإلكتروني، الترميز النووي، الأيونات، تمثيل لويس، والنظائر.',
  unitId: 'chem-u1',
  lessonIds: ['chem-u1-l1'],
  questions,
  blueprint: buildBlueprint({
    testId: 'chem-u1-l1',
    scope: 'lesson',
    unitId: 'chem-u1',
    lessonIds: ['chem-u1-l1'],
    questions,
    concepts: [
      {
        id: 'l1-models',
        label: 'نماذج الذرّة: طومسون، رذرفورد، بور',
        pageRefs: [p('4'), p('5')],
        questionIds: ['ta-l1-q01', 'ta-l1-q02', 'ta-l1-q05', 'ta-l1-q15'],
      },
      {
        id: 'l1-levels',
        label: 'السويّات الرئيسية وقانون السعة y = 2(n)²',
        pageRefs: [p('5'), p('6')],
        questionIds: ['ta-l1-q03', 'ta-l1-q04', 'ta-l1-q16', 'ta-l1-q19'],
      },
      {
        id: 'l1-distribution',
        label: 'التوزيع الإلكتروني والإلكترونات السطحية',
        pageRefs: [p('6'), p('9')],
        questionIds: ['ta-l1-q12', 'ta-l1-q17'],
      },
      {
        id: 'l1-nuclear',
        label: 'العدد الذرّي والعدد الكتلي والترميز النووي',
        pageRefs: [p('7'), p('8')],
        questionIds: ['ta-l1-q14', 'ta-l1-q20'],
      },
      {
        id: 'l1-ions',
        label: 'تشكّل الأيونات والمجموع الجبري للشحنات',
        pageRefs: [p('8'), p('9')],
        questionIds: ['ta-l1-q06', 'ta-l1-q07', 'ta-l1-q10', 'ta-l1-q11', 'ta-l1-q13'],
      },
      {
        id: 'l1-lewis',
        label: 'تمثيل لويس للإلكترونات السطحية',
        pageRefs: [p('9')],
        questionIds: ['ta-l1-q08'],
      },
      {
        id: 'l1-isotopes',
        label: 'النظائر وتمييزها عن الأيونات',
        pageRefs: [p('10'), p('11')],
        questionIds: ['ta-l1-q09', 'ta-l1-q18'],
      },
    ],
    commonErrors: [
      {
        id: 'e-charge-sign',
        label: 'عكس إشارة الأيون أو حسابها بالحفظ بدل الجبر',
        questionIds: ['ta-l1-q07', 'ta-l1-q13'],
      },
      {
        id: 'e-law-vs-octet',
        label: 'الخلط بين سعة السويّة وقيد الثمانية، أو نسيان التربيع',
        questionIds: ['ta-l1-q03', 'ta-l1-q19'],
      },
      {
        id: 'e-inner-electrons',
        label: 'عدّ إلكترونات السويّات الداخلية بدل السويّة الأخيرة',
        questionIds: ['ta-l1-q08', 'ta-l1-q12'],
      },
      {
        id: 'e-protons-change',
        label: 'افتراض أنّ البروتونات أو النيوترونات تتغيّر عند تكوّن الأيون',
        questionIds: ['ta-l1-q13', 'ta-l1-q14'],
      },
      {
        id: 'e-isotope-vs-ion',
        label: 'الخلط بين النظير والأيون وبين العدد الكتلي والعدد الذرّي',
        questionIds: ['ta-l1-q18', 'ta-l1-q20'],
      },
    ],
    scoring: { pointsPerQuestion: 1, allowPartial: false },
    solutionChunkSize: 5,
  }),
}

export default chemUnit1Lesson1Bank
