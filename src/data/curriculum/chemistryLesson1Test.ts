import type { FinalTest, Question } from '@/assessment/types'
import type { ContentBlock } from './schema'

/* ============================================================================
   Lesson 1 — final assessment (platform-authored, 15 questions).
   ----------------------------------------------------------------------------
   Design rules:
     * every question is tied to a learning objective from page 3 (`objectiveId`);
     * no question is copied from the textbook — textbook items are solved in
       the book layer, and this test measures transfer to new situations;
     * distractors are plausible misconceptions, not noise;
     * every question carries a hint, a reasoned explanation, and (where a
       calculation or reading is involved) structured solution blocks;
     * answers are only shown after submission — the assessment engine owns
       that behaviour.
   ========================================================================= */

const step = (text: string): ContentBlock => ({ kind: 'paragraph', text, attribution: 'platform' })
const formula = (tex: string, caption?: string): ContentBlock => ({
  kind: 'formula',
  tex,
  display: 'block',
  caption,
  attribution: 'platform',
})
const method = (text: string, title?: string): ContentBlock => ({
  kind: 'callout',
  tone: 'method',
  title,
  text,
  attribution: 'platform',
})

const nuclearReading: Question = {
  id: 'l1-final-table-reading',
  type: 'table-interpretation',
  origin: 'platform',
  prompt: 'اقرأ جدول رموز النوى الآتي، ثم أجب عن الفروع الثلاثة.',
  table: {
    caption: 'رموز نوى مستخدمة في الدرس',
    columns: [
      { key: 'symbol', header: 'الرمز', rowHeader: true },
      { key: 'a', header: 'العدد الكتلي A', numeric: true },
      { key: 'z', header: 'العدد الذري Z', numeric: true },
      { key: 'neutrons', header: 'عدد النيوترونات', numeric: true },
      { key: 'electrons', header: 'الإلكترونات في الذرة المتعادلة', numeric: true },
    ],
    rows: [
      { id: 'na', cells: { symbol: '²³₁₁Na', a: '23', z: '11', neutrons: '12', electrons: '11' } },
      { id: 'cl', cells: { symbol: '³⁵₁₇Cl', a: '35', z: '17', neutrons: '18', electrons: '17' } },
      { id: 'o18', cells: { symbol: '¹⁸₈O', a: '18', z: '8', neutrons: '10', electrons: '8' } },
    ],
  },
  questions: [
    {
      id: 'l1-final-table-z',
      type: 'multiple-choice',
      selection: 'single',
      origin: 'platform',
      prompt: 'ما العدد الذري للكلور وفق الجدول؟',
      options: [
        { id: 'a', label: '17' },
        { id: 'b', label: '35' },
        { id: 'c', label: '18' },
        { id: 'd', label: '1' },
      ],
      correctOptionIds: ['a'],
      explanation: 'العدد الذري هو الرقم السفلي في الرمز ³⁵₁₇Cl، ويساوي 17. وهو عدد البروتونات.',
      objectiveId: 'O4',
    },
    {
      id: 'l1-final-table-n',
      type: 'numerical',
      origin: 'platform',
      prompt: 'كم عدد النيوترونات في ¹⁸₈O؟',
      acceptedAnswers: [10],
      explanation: 'عدد النيوترونات = 18 − 8 = 10.',
      objectiveId: 'O4',
    },
    {
      id: 'l1-final-table-sum',
      type: 'multiple-choice',
      selection: 'single',
      origin: 'platform',
      prompt: 'لو اكتسبت ذرة الكلور إلكتروناً واحداً، فما المجموع الجبري للشحنات في الأيون الناتج؟',
      options: [
        { id: 'a', label: '+1' },
        { id: 'b', label: '−1' },
        { id: 'c', label: 'صفر' },
        { id: 'd', label: '−2' },
      ],
      correctOptionIds: ['b'],
      explanation:
        'ذرة الكلور المتعادلة فيها 17 بروتوناً و17 إلكتروناً. بعد اكتساب إلكترون واحد تصبح الإلكترونات 18، والمجموع = 17 − 18 = −1، وهو أيون Cl⁻.',
      objectiveId: 'O6',
    },
  ],
  hint: 'العدد العلوي كتلي، والسفلي ذري، والفرق بينهما هو عدد النيوترونات.',
  explanation:
    'الجدول يختبر قراءة الترميز النووي: A = 23 و35 و18، وZ = 11 و17 و8، والنيوترونات = A − Z = 12 و18 و10. والجدول صالح لأن السؤال ينقل القراءة نفسها إلى مواقف جديدة.',
  objectiveId: 'O4',
}

export const lesson1FinalTest: FinalTest = {
  id: 'chem-u1-l1-final',
  lessonId: 'chem-u1-l1',
  origin: 'platform',
  status: 'source-verified',
  targetQuestionCount: { min: 10, max: 20 },
  questions: [
    {
      id: 'l1-final-rutherford-1',
      type: 'multiple-choice',
      selection: 'single',
      origin: 'platform',
      prompt:
        'في تجربة رذرفورد، مرّت معظم جسيمات ألفا عبر صفيحة الذهب مستقيمة. ما الاستنتاج الأكثر مباشرة من هذه الملاحظة وحدها؟',
      options: [
        { id: 'a', label: 'معظم حجم الذرة فراغ لا يعترض الجسيمات.' },
        { id: 'b', label: 'الإلكترونات تحمل شحنة موجبة.' },
        { id: 'c', label: 'نواة الذرة سالبة الشحنة.' },
        { id: 'd', label: 'كتلة الذرة موزعة بالتساوي على حجمها.' },
      ],
      correctOptionIds: ['a'],
      hint: 'الجسيم الذي يمر دون انحراف لم يقابل شيئاً كثيفاً أو مشحوناً بقوة في طريقه.',
      explanation:
        'استقامة المسار تعني غياب عائق مؤثر في معظم الحجم، ومنها استُنتج أن معظم حجم الذرة فراغ. الاستنتاجات الأخرى تناقض الملاحظات نفسها: لو كانت الكتلة موزعة بالتساوي لتوزعت الانحرافات على معظم الجسيمات.',
      objectiveId: 'O1',
      solutionBlocks: [
        step('الملاحظة: مسارات مستقيمة في معظم الحالات.'),
        step('الاستنتاج: لا شيء كثيف يعترض المسار في معظم الحجم ← معظم الحجم فراغ.'),
      ],
    },
    {
      id: 'l1-final-rutherford-2',
      type: 'multiple-choice',
      selection: 'single',
      origin: 'platform',
      prompt: 'لماذا ارتدّ جزء صغير جداً من جسيمات ألفا بعد اصطدامه بصفيحة الذهب؟',
      options: [
        { id: 'a', label: 'لأن الإلكترونات السالبة تكفي لردّ جسيم ألفا.' },
        { id: 'b', label: 'لأن جسيمات ألفا تنجذب إلى النواة الموجبة.' },
        { id: 'c', label: 'لأنه اقترب من نواة صغيرة موجبة تتركز فيها معظم الكتلة فتنافر معها بقوة.' },
        { id: 'd', label: 'لأن صفيحة الذهب مشحونة سالباً.' },
      ],
      correctOptionIds: ['c'],
      hint: 'جسيم ألفا موجب، وما يرده بقوة لا بد أن يكون موجباً وثقيلاً.',
      explanation:
        'جسيمات ألفا موجبة، والنواة الموجبة كثيفة الكتلة. عند الاقتراب الشديد يحدث تنافر كهربائي قوي يردّ الجسيم. الإلكترونات أخف بآلاف المرات فلا تُنتج هذا الرد.',
      objectiveId: 'O1',
    },
    {
      id: 'l1-final-bohr-1',
      type: 'true-false',
      origin: 'platform',
      prompt: 'عندما ينتقل إلكترون من سوية طاقة أدنى إلى سوية أعلى، تمتص الذرّة طاقة بمقدار فرق الطاقة بين السويتين.',
      correctAnswer: true,
      hint: 'الصعود يحتاج طاقة تُضاف.',
      explanation:
        'صح. هذه هي النقطة الثانية في نموذج بور: الانتقال إلى سوية أعلى يمتص طاقة محددة تساوي فرق الطاقة بين السويتين. وعند العودة إلى سوية أدنى تصدر الذرّة طاقة على شكل ضوء.',
      objectiveId: 'O2',
    },
    {
      id: 'l1-final-bohr-2',
      type: 'multiple-choice',
      selection: 'single',
      origin: 'platform',
      prompt: 'ما الذي يحدث عندما يعود إلكترون من سوية أعلى إلى سوية أدنى؟',
      options: [
        { id: 'a', label: 'تمتص الذرّة طاقة وتسخن.' },
        { id: 'b', label: 'تصدر الذرّة طاقة محددة على شكل ضوء.' },
        { id: 'c', label: 'يفقد العنصر بروتوناً ويغيّر هويته.' },
        { id: 'd', label: 'يختفي الإلكترون داخل النواة.' },
      ],
      correctOptionIds: ['b'],
      hint: 'الهبوط يحرّر فرق الطاقة الذي كان الإلكترون قد امتصه.',
      explanation:
        'الإجابة b. عند الهبوط يتحرر فرق الطاقة على شكل ضوء. ولأن السويات محددة، تكون الطاقات المنبعثة محددة أيضاً، وهذا يفسر طيف الانبعاثات الذي تصدره الذرات بعد إثارتها.',
      objectiveId: 'O2',
    },
    {
      id: 'l1-final-capacity',
      type: 'numerical',
      origin: 'platform',
      prompt: 'اعتماداً على العلاقة y = 2(n)²، ما العدد الأعظمي للإلكترونات في السوية الرئيسية الثالثة M؟',
      acceptedAnswers: [18],
      hint: 'رقم السوية M هو n = 3.',
      explanation: 'y = 2 × (3)² = 2 × 9 = 18 إلكتروناً.',
      objectiveId: 'O3',
      solutionBlocks: [formula('y = 2(n)^2 \\;\\Longrightarrow\\; y = 2 \\times 3^2 = 18', 'التعويض')],
    },
    {
      id: 'l1-final-distribution',
      type: 'multiple-choice',
      selection: 'single',
      origin: 'platform',
      prompt: 'ذرّة توزيعها الإلكتروني 2-8-6. ما هو هذا العنصر؟',
      options: [
        { id: 'a', label: 'الأكسجين ₈O' },
        { id: 'b', label: 'الكبريت ₁₆S' },
        { id: 'c', label: 'النيون ₁₀Ne' },
        { id: 'd', label: 'الأرغون ₁₈Ar' },
      ],
      correctOptionIds: ['b'],
      hint: 'اجمع الإلكترونات أولاً؛ المجموع = العدد الذري في الذرة المتعادلة.',
      explanation:
        '2 + 8 + 6 = 16 إلكتروناً، والذرة متعادلة فعدد البروتونات 16، وهذا هو الكبريت ₁₆S. الأرغون مجموعه 18، والنيون 10، والأكسجين 8.',
      objectiveId: 'O3',
    },
    nuclearReading,
    {
      id: 'l1-final-identity',
      type: 'multiple-choice',
      selection: 'single',
      origin: 'platform',
      prompt:
        'ذرة لها 11 بروتوناً و12 نيوتروناً. أيّ تغيير يجعلها ذرّة عنصر آخر؟',
      options: [
        { id: 'a', label: 'فقدان إلكترون واحد.' },
        { id: 'b', label: 'اكتساب إلكترون واحد.' },
        { id: 'c', label: 'فقدان بروتون واحد.' },
        { id: 'd', label: 'اكتساب نيوترون واحد.' },
      ],
      correctOptionIds: ['c'],
      hint: 'هوية العنصر يحددها عدد البروتونات وحده.',
      explanation:
        'الإجابة c. البروتونات هي هوية العنصر؛ فقدان بروتون واحد يحوّل الصوديوم (11) إلى نيون (10). أما تغيير الإلكترونات فينتج أيوناً، وتغيير النيوترونات ينتج نظيراً، ويبقى العنصر نفسه في الحالتين.',
      objectiveId: 'O5',
    },
    {
      id: 'l1-final-neutral',
      type: 'fill-blank',
      origin: 'platform',
      prompt: 'أكمل الجملتين في الذرّة المتعادلة.',
      template:
        'في الذرّة المتعادلة يساوي عدد الإلكترونات العدد {b1}، وعدد النيوترونات يساوي العدد الكتلي ناقص العدد {b2}.',
      blanks: [
        { id: 'b1', acceptedAnswers: ['الذري', 'الذرّي'] },
        { id: 'b2', acceptedAnswers: ['الذري', 'الذرّي'] },
      ],
      hint: 'الرقم السفلي في الترميز النووي يحمل الاسم نفسه في الفراغين.',
      explanation:
        'كل من عدد الإلكترونات (في الذرة المتعادلة) وعدد النيوترونات يُحسبان من العدد الذري: الإلكترونات = العدد الذري، والنيوترونات = العدد الكتلي − العدد الذري.',
      objectiveId: 'O4',
    },
    {
      id: 'l1-final-isotope',
      type: 'numerical',
      origin: 'platform',
      prompt: 'كم عدد النيوترونات في ¹⁸O؟',
      acceptedAnswers: [10],
      hint: 'العدد الذري للأكسجين 8.',
      explanation: '18 − 8 = 10 نيوترونات. النظير ¹⁸O يختلف عن ¹⁶O في عدد النيوترونات فقط.',
      objectiveId: 'O8',
    },
    {
      id: 'l1-final-ion-k',
      type: 'multiple-choice',
      selection: 'single',
      origin: 'platform',
      prompt:
        'عدد البوتاسيوم الذري 19 وتوزيعه 2-8-8-1. كيف يتكوّن أيون K⁺؟',
      options: [
        { id: 'a', label: 'يكتسب إلكتروناً واحداً فتزيد شحنته السالبة.' },
        { id: 'b', label: 'يفقد إلكتروناً واحداً من سويتِه الأخيرة فيصبح 2-8-8.' },
        { id: 'c', label: 'يفقد بروتوناً واحداً من نواته.' },
        { id: 'd', label: 'يفقد نيوتروناً واحداً من نواته.' },
      ],
      correctOptionIds: ['b'],
      hint: 'قاعدة الثمانية: البوتاسيوم أقرب إلى الثمانية بفقد إلكترون واحد.',
      explanation:
        'الإجابة b. بفقد الإلكترون الوحيد في السوية الأخيرة تصبح السوية L ممتلئة والسوية M بثمانية إلكترونات (2-8-8)، وهي حالة أكثر استقراراً وفق قاعدة الثمانية. وعدد الإلكترونات المفقودة يساوي عدد إشارات الشحنة (+1).',
      objectiveId: 'O6',
    },
    {
      id: 'l1-final-ion-al',
      type: 'multiple-choice',
      selection: 'single',
      origin: 'platform',
      prompt: 'العدد الذري للألمنيوم 13، وتوزيعه 2-8-3. ما عدد إلكترونات أيون Al³⁺؟',
      options: [
        { id: 'a', label: '13' },
        { id: 'b', label: '16' },
        { id: 'c', label: '10' },
        { id: 'd', label: '3' },
      ],
      correctOptionIds: ['c'],
      hint: 'الشحنة 3+ تعني فقدان ثلاثة إلكترونات.',
      explanation:
        '13 − 3 = 10 إلكترونات، فيصبح التوزيع 2-8 فقط. لاحظ أن الشحنة +3 تعني فائض الموجب بمقدار 3، أي أن عدد البروتونات (13) يفوق الإلكترونات (10) بثلاثة.',
      objectiveId: 'O6',
    },
    {
      id: 'l1-final-lewis',
      type: 'multiple-choice',
      selection: 'single',
      origin: 'platform',
      prompt: 'ما العدد الصحيح لنقاط لويس حول رمز ذرة الكلور (العدد الذري 17)؟',
      options: [
        { id: 'a', label: '17 نقطة' },
        { id: 'b', label: '8 نقاط' },
        { id: 'c', label: '7 نقاط' },
        { id: 'd', label: '2 نقطتان' },
      ],
      correctOptionIds: ['c'],
      hint: 'عدد إلكترونات السوية الأخيرة فقط هو ما يُرسم.',
      explanation:
        'الكلور 2-8-7، وإلكترونات السوية الأخيرة سبعة، فتُرسم سبع نقاط: ثلاثة أزواج ونقطة مفردة. تمثيل لويس لا يعرض الإلكترونات السبع عشرة كلها.',
      objectiveId: 'O7',
    },
    {
      id: 'l1-final-concepts',
      type: 'matching',
      origin: 'platform',
      prompt: 'طابق كل مثال بالمفهوم الذي يمثّله.',
      left: [
        { id: 'na-atom', label: 'ذرة صوديوم 11 بروتوناً و11 إلكتروناً' },
        { id: 'na-ion', label: 'الجسيم بعد فقد إلكترون واحد' },
        { id: 'o-18', label: 'أكسجين بعدد نيوترونات 10' },
        { id: 'cl-ion', label: 'كلور بعدد إلكترونات 18 وبروتونات 17' },
      ],
      right: [
        { id: 'neutral', label: 'ذرّة متعادلة' },
        { id: 'cation', label: 'أيون موجب' },
        { id: 'isotope', label: 'نظير' },
        { id: 'anion', label: 'أيون سالب' },
      ],
      pairs: [
        { leftId: 'na-atom', rightId: 'neutral' },
        { leftId: 'na-ion', rightId: 'cation' },
        { leftId: 'o-18', rightId: 'isotope' },
        { leftId: 'cl-ion', rightId: 'anion' },
      ],
      hint: 'الأيون يتغير فيه عدد الإلكترونات، والنظير يتغير فيه عدد النيوترونات.',
      explanation:
        'الذرّة المتعادلة بروتوناتها تساوي إلكتروناتها. أيون الصوديوم فقد إلكتروناً فصار موجباً. ¹⁸O نظير للأكسجين (8 بروتونات، 10 نيوترونات). وأيون الكلور اكتسب إلكتروناً فصار سالباً.',
      objectiveId: 'O6',
    },
    {
      id: 'l1-final-reasoning',
      type: 'short-answer',
      origin: 'platform',
      prompt:
        'لماذا يُسبب معدن الصوديوم حروقاً عند ملامسة اليد، بينما يُستعمل كلوريد الصوديوم في الطعام؟ اشرح بالاعتماد على فكرة الأيون وقاعدة الثمانية.',
      referenceAnswer:
        'ذرة الصوديوم في الفلز لها إلكترون وحيد في سويتها الأخيرة (2-8-1)، وهي غير مستقرة وتسعى إلى فقدانه؛ لذلك هي شديدة النشاط الكيميائي وتتفاعل بسرعة مع رطوبة الجلد. أما في كلوريد الصوديوم فالصوديوم موجود أصلاً على هيئة أيون Na⁺ بعد أن فقد إلكترونَه (2-8) وأصبح أكثر استقراراً، والكلور أيون Cl⁻ (2-8-8)، والمركّب الأيوني الناتج له خصائص مختلفة عن العنصرين، لذلك يختلف سلوكه وخواصه.',
      rubric: [
        'ذكر توزيع الصوديوم 2-8-1 والإلكترون الوحيد في السوية الأخيرة',
        'ربط النشاط الكيميائي بالسعي إلى الثمانية/الاستقرار',
        'ذكر أن الصوديوم في الملح أيون Na⁺ مستقر بعد فقد الإلكترون',
        'ذكر أن المركب يختلف في خواصه عن العناصر المكوّنة له',
      ],
      hint: 'هل الصوديوم في ملح الطعام ذرة متعادلة أم أيون؟',
      explanation:
        'الفرق ليس في «اسم» المادة بل في حالة الجسيم: ذرة الصوديوم المتعادلة نشطة جداً لأنها تحمل إلكتروناً زائداً عن حاجة الاستقرار، أما في المركّب فهي أيون Na⁺ فقد إلكترونَه وأصبح توزيعه 2-8. لذلك تختلف الخواص الكيميائية للمادة الناتجة عن خواص العناصر المكوّنة لها. هذه إضافة تفسيرية من المنصة فوق سؤال الكتاب في صفحة 7.',
      objectiveId: 'O5',
      solutionBlocks: [
        method('نقارن دائماً: ما عدد إلكترونات السوية الأخيرة؟ وهل الجسيم ذرة أم أيون؟', 'مفتاح الإجابة'),
        step('الصوديوم 2-8-1: إلكترون وحيد سهل الفقد ← نشاط كيميائي عالٍ.'),
        step('في NaCl: Na⁺ توزيعه 2-8، وCl⁻ توزيعه 2-8-8 ← حالة أكثر استقراراً.'),
        step('الخواص التي نراها تعود إلى المادة الناتجة، لا إلى ذرات العناصر المنفصلة.'),
      ],
    },
  ],
}
