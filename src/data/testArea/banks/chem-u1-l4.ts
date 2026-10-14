import { buildBlueprint } from '../blueprint'
import type { TestBank, TestQuestion } from '../types'

/** Independent Test Area assessment. It does not copy the textbook exercises
 * or the lesson's 20-question final test. All scenarios stay qualitative. */
const p = (page: string) => ({ page })
const questions: TestQuestion[] = [
  {
    id: 'ta-l4-q01', type: 'single-choice', difficulty: 'basic', conceptId: 'l4-transformation', tags: ['conceptual'], sourceRefs: [p('25')],
    prompt: 'مصنف المواد يسأل: ما الفرق الحاسم بين «قبل التفاعل» و«بعده»؟',
    options: [{ id: 'a', label: 'تكون مواد جديدة تختلف عن المواد المتفاعلة.' }, { id: 'b', label: 'نقل جميع الأدوات إلى مكان آخر.' }, { id: 'c', label: 'تغيير عنوان بطاقة التجربة وحده.' }, { id: 'd', label: 'تساوي ألوان كل المواد دائماً.' }], correctOptionIds: ['a'],
  },
  {
    id: 'ta-l4-q02', type: 'single-choice', difficulty: 'basic', conceptId: 'l4-material-roles', tags: ['application'], sourceRefs: [p('25')],
    prompt: 'أين نصنف الجفنة الخزفية التي تحوي الرمل عند تسجيل قائمة احتراق الشريط؟',
    options: [{ id: 'a', label: 'ضمن النواتج البيضاء للتفاعل.' }, { id: 'b', label: 'ضمن الغاز المساعد على الاحتراق.' }, { id: 'c', label: 'ضمن تجهيزات التجربة، لا طرفي المعادلة.' }, { id: 'd', label: 'بدلاً من اسم المغنزيوم في المتفاعلات.' }], correctOptionIds: ['c'],
  },
  {
    id: 'ta-l4-q03', type: 'true-false', difficulty: 'basic', conceptId: 'l4-transformation', tags: ['conceptual'], sourceRefs: [p('25')],
    prompt: 'يمكن أن يكون تكوين راسب تحولاً كيميائياً حتى عندما لا نشاهد فوراناً في السائل.', correctAnswer: true,
  },
  {
    id: 'ta-l4-q04', type: 'exact', difficulty: 'basic', conceptId: 'l4-gas-safety', tags: ['data-reading'], sourceRefs: [p('27')],
    prompt: 'دوّن الحرفين اللاتينيين المكتوبين في إضاءة الدرس بجوار الغاز الذي يعيق نقل الأكسجين، دون كتابة الاسم العربي.',
    answer: { kind: 'formula', acceptedAnswers: ['CO'], caseSensitive: true, inputHint: 'حرفان لاتينيان كبيران' },
  },
  {
    id: 'ta-l4-q05', type: 'single-choice', difficulty: 'basic', conceptId: 'l4-combustion', tags: ['conceptual'], sourceRefs: [p('26')],
    prompt: 'لماذا اعتبر الكتاب الثقب فوق صمام موقد بنزن مهماً في تجربة اللهب؟',
    options: [{ id: 'a', label: 'لأنه يضيف الكبريت إلى الوقود.' }, { id: 'b', label: 'لأنه يسمح بدخول الهواء اللازم لتوفير الأكسجين.' }, { id: 'c', label: 'لأنه يحول الصحن إلى غاز.' }, { id: 'd', label: 'لأنه يجمع أكسيد المغنزيوم.' }], correctOptionIds: ['b'],
  },
  {
    id: 'ta-l4-q06', type: 'multi-select', difficulty: 'basic', conceptId: 'l4-transformation', tags: ['application', 'comparison'], sourceRefs: [p('25')],
    prompt: 'لتمييز المادة الجديدة من الأداة في سجل تجربة الشريط، اختر عبارتين سليمتين:',
    options: [{ id: 'a', label: 'المسحوق الأبيض مادة تكونت بعد احتراق المغنزيوم.' }, { id: 'b', label: 'النظارة الواقية هي المادة البيضاء الناتجة.' }, { id: 'c', label: 'تبريد الأكسيد وحده يعيد الشريط الفلزي.' }, { id: 'd', label: 'الملقط يمسك الشريط ولا يسمى ناتجاً للتفاعل.' }], correctOptionIds: ['a', 'd'],
  },
  {
    id: 'ta-l4-q07', type: 'matching', difficulty: 'medium', conceptId: 'l4-material-roles', tags: ['conceptual', 'application'], sourceRefs: [p('25'), p('27')],
    prompt: 'صل مصطلحات مخطط التفاعل بوظائفها؛ كل وظيفة هنا تخص بطاقة مختلفة:',
    left: [{ id: 'reactants', label: 'مواد متفاعلة' }, { id: 'products', label: 'مواد ناتجة' }, { id: 'heat', label: 'تسخين فوق السهم' }],
    right: [{ id: 'new', label: 'مواد تتكون أثناء التحول' }, { id: 'condition', label: 'شرط بدء، وليس مادة' }, { id: 'start', label: 'مواد تدخل التحول من البداية' }],
    pairs: [{ leftId: 'reactants', rightId: 'start' }, { leftId: 'products', rightId: 'new' }, { leftId: 'heat', rightId: 'condition' }],
  },
  {
    id: 'ta-l4-q08', type: 'single-choice', difficulty: 'medium', conceptId: 'l4-material-roles', tags: ['application'], sourceRefs: [p('25')],
    prompt: 'في مخطط الشريط، نقل الطالب كلمة «تسخين» من أعلى السهم إلى خانة المادة البيضاء. ما التصنيف الذي يعيد الكلمة إلى مكانها؟',
    options: [{ id: 'a', label: 'التسخين اسم مركب أبيض.' }, { id: 'b', label: 'التسخين هو غاز الهواء المتفاعل.' }, { id: 'c', label: 'التسخين مادة جديدة تحل محل الأكسيد.' }, { id: 'd', label: 'التسخين شرط للتفاعل، فيكتب فوق السهم.' }], correctOptionIds: ['d'],
  },
  {
    id: 'ta-l4-q09', type: 'ordering', difficulty: 'medium', conceptId: 'l4-material-roles', tags: ['problem-solving'], sourceRefs: [p('25'), p('28')],
    prompt: 'اعتماداً على وصف تفاعل في الكلمات، رتب عمل كاتب المعادلة من استخراج المعلومات إلى مراجعة طرفيها:',
    items: [{ id: 'review', label: 'أراجع أن كل اسم في جانب دوره الصحيح.' }, { id: 'write', label: 'أكتب أسماء البداية قبل السهم وأسماء المواد الجديدة بعده.' }, { id: 'start', label: 'أحدد المواد التي يبدأ بها وصف التفاعل.' }, { id: 'end', label: 'أحدد المادة أو المواد التي تكونت في النهاية.' }],
    correctOrder: ['start', 'end', 'write', 'review'],
  },
  {
    id: 'ta-l4-q10', type: 'exact', difficulty: 'medium', conceptId: 'l4-word-reactions', tags: ['application'], sourceRefs: [p('28')],
    prompt: 'استبدل عبارة «مركب الزنك مع الكبريت» بالاسم الكيميائي اللفظي المناسب، لا بصيغة رمزية.',
    answer: { kind: 'text', acceptedAnswers: ['كبريتيد الزنك'], inputHint: 'اسم المركب بالعربية' },
  },
  {
    id: 'ta-l4-q11', type: 'true-false', difficulty: 'medium', conceptId: 'l4-gas-safety', tags: ['conceptual'], sourceRefs: [p('27')],
    prompt: 'الرائحة القوية التي تساعد على اكتشاف تسرب الأسطوانة خاصية أصلية للبوتان والبروبان قبل إضافة أي مادة.', correctAnswer: false,
  },
  {
    id: 'ta-l4-q12', type: 'error-analysis', difficulty: 'medium', conceptId: 'l4-combustion', tags: ['error-analysis', 'application'], sourceRefs: [p('26')],
    prompt: 'حدد أين قطع هذا التفسير الرابطة بين المتغير الذي ضبطه الكتاب وبين تغير لهب بنزن:',
    flawedWork: 'أغلقت صمام الوقود فأصبح اللهب أصفر؛ إذن هذه هي الخطوة التي قارنتها تجربة الصفحة 26.',
    options: [{ id: 'a', label: 'التجربة أغلقت ثقب دخول الهواء جزئياً، لا صمام الوقود.' }, { id: 'b', label: 'التجربة أضافت مسحوق المغنزيوم إلى الصحن.' }, { id: 'c', label: 'التجربة استبدلت الأكسجين بثنائي أكسيد الكربون كمساعد احتراق.' }, { id: 'd', label: 'التجربة حولت لون الصحن إلى سبب دخول الهواء.' }], correctOptionIds: ['a'],
  },
  {
    id: 'ta-l4-q13', type: 'matching', difficulty: 'medium', conceptId: 'l4-gas-safety', tags: ['comparison', 'conceptual'], sourceRefs: [p('24'), p('27')],
    prompt: 'اربط كل مادة أو كاشف بدلالته الخاصة في الدرس؛ لا تعامل الثلاثة كاختبار واحد:',
    left: [{ id: 'co', label: 'CO' }, { id: 'lime', label: 'رائق الكلس' }, { id: 'odorant', label: 'المركبتان المضاف للوقود' }],
    right: [{ id: 'odor', label: 'رائحة قوية تساعد على كشف تسرب غاز الوقود' }, { id: 'cloud', label: 'تعكر في اختبار ثنائي أكسيد الكربون' }, { id: 'blood', label: 'إعاقة نقل الأكسجين بكريات الدم الحمراء' }],
    pairs: [{ leftId: 'co', rightId: 'blood' }, { leftId: 'lime', rightId: 'cloud' }, { leftId: 'odorant', rightId: 'odor' }],
  },
  {
    id: 'ta-l4-q14', type: 'single-choice', difficulty: 'advanced', conceptId: 'l4-combustion', tags: ['thinking', 'data-reading'], sourceRefs: [p('26'), p('29')],
    prompt: 'حصلنا على صورة صحن مسود فوق موقد الوقود نفسه. أي استنتاج يراعي حدود الملاحظة ولا يخترع قياساً؟',
    options: [{ id: 'a', label: 'نعرف من الصورة درجة حرارة اللهب بالضبط.' }, { id: 'b', label: 'نعرف كمية CO المنتجة باللتر.' }, { id: 'c', label: 'السخام يوافق احتراقاً غير تام، لكن الصورة لا تقيس نسب النواتج.' }, { id: 'd', label: 'كل ما لا نراه في الصورة غير موجود قطعاً.' }], correctOptionIds: ['c'],
  },
  {
    id: 'ta-l4-q15', type: 'error-correction', difficulty: 'advanced', conceptId: 'l4-gas-safety', tags: ['error-analysis', 'problem-solving'], sourceRefs: [p('24'), p('29')],
    prompt: 'صحح اسم الغاز في الاستنتاج فقط، بحيث يوافق اختبار رائق الكلس الذي وصفه الدرس:',
    flawedWork: 'لاحظت التعكر الأبيض عند بدء تمرير الغاز؛ فكتبت أن هذا الاختبار يكشف أحادي أكسيد الكربون.',
    correction: { kind: 'exact', spec: { kind: 'text', acceptedAnswers: ['ثنائي أكسيد الكربون'], inputHint: 'اكتب الاسم المصحح بالعربية' } },
  },
  {
    id: 'ta-l4-q16', type: 'multi-select', difficulty: 'advanced', conceptId: 'l4-gas-safety', tags: ['thinking', 'error-analysis'], sourceRefs: [p('27')],
    prompt: 'تقرير السلامة اعتمد على الشم والنظر وحدهما لضمان سلامة غرفة التدفئة. اختر اعتراضين علميين على هذا الضمان:',
    options: [{ id: 'a', label: 'الغاز السام المذكور عديم اللون فلا يضمن النظر غيابه.' }, { id: 'b', label: 'اللون الأسود وصف لازم لكل غاز سام.' }, { id: 'c', label: 'كل غرفة مغلقة تنتج كمية ثابتة معروفة من الغاز دون قياس.' }, { id: 'd', label: 'الرائحة المضافة للوقود لا تختبر CO المتولد من الاحتراق.' }], correctOptionIds: ['a', 'd'],
  },
  {
    id: 'ta-l4-q17', type: 'error-analysis', difficulty: 'advanced', conceptId: 'l4-word-reactions', tags: ['error-analysis', 'comparison'], sourceRefs: [p('28')],
    prompt: 'استعمل الطالب اسم الناتج في تفاعلين مختلفين للزنك دون فحص اسم المتفاعل الآخر. أي مراجعة تصحح اختياره؟',
    flawedWork: 'الزنك مع الكبريت يعطي أكسيد الزنك؛ لأن كل تفاعل للزنك يعطي الناتج نفسه مهما كان المتفاعل الآخر.',
    options: [{ id: 'a', label: 'نتجاهل المتفاعل الثاني فلا تختلف النواتج.' }, { id: 'b', label: 'الكبريت يعطي كبريتيد الزنك، والأكسجين يعطي أكسيد الزنك.' }, { id: 'c', label: 'نضع الزنك في طرف النواتج دائماً.' }, { id: 'd', label: 'كلتا الحالتين تعطيان نشادر.' }], correctOptionIds: ['b'],
  },
  {
    id: 'ta-l4-q18', type: 'error-analysis', difficulty: 'thinking', conceptId: 'l4-combustion', tags: ['thinking', 'error-analysis'], sourceRefs: [p('26'), p('28'), p('29')],
    prompt: 'أي خطأ يفسد المقارنة التالية حتى لو لم تظهر طبقة سوداء على الصحن؟',
    flawedWork: 'احتراق البوتان التام وغير التام يعطيان دائماً الماء وأحادي أكسيد الكربون فقط؛ لذا تكفي نظافة الصحن لإثبات أن الغاز غير خطر.',
    options: [{ id: 'a', label: 'الماء لا يتكون في أي احتراق للبوتان.' }, { id: 'b', label: 'كل ناتج غازي له لون ظاهر.' }, { id: 'c', label: 'الأكسجين ليس له دور في الاحتراق.' }, { id: 'd', label: 'التام يعطي ثنائي أكسيد الكربون والماء؛ ونظافة الصحن لا تختبر غياب CO.' }], correctOptionIds: ['d'],
  },
  {
    id: 'ta-l4-q19', type: 'single-choice', difficulty: 'thinking', conceptId: 'l4-combustion', tags: ['thinking', 'comparison'], sourceRefs: [p('25'), p('26')],
    prompt: 'حرصاً على فصل نوع المادة عن لون لهب الوقود، أي مقارنة علمية سليمة بين الشريط والصحن؟',
    options: [{ id: 'a', label: 'كل ناتج أبيض سخام وكل لهب أبيض دليل على نقص الأكسجين.' }, { id: 'b', label: 'لا فرق بين أكسيد المغنزيوم والسخام ما دام كلاهما ناتجاً.' }, { id: 'c', label: 'الأبيض في تجربة الشريط أكسيد مغنزيوم؛ والأسود على صحن الوقود كربون مترسب.' }, { id: 'd', label: 'لون موقد الوقود يحدد وحده ناتج كل مادة أخرى.' }], correctOptionIds: ['c'],
  },
  {
    id: 'ta-l4-q20', type: 'error-correction', difficulty: 'thinking', conceptId: 'l4-combustion', tags: ['error-analysis', 'thinking'], sourceRefs: [p('26')],
    prompt: 'سجل المشرف شرط الأكسجين صحيحاً ثم وضع تصنيفاً مناقضاً له. صحح كلمة التصنيف دون تغيير الشرط:',
    flawedWork: 'في ظروف موقد الدرس تتوافر كمية كافية من الأكسجين، لذلك أسمي الاحتراق غير تام.',
    correction: { kind: 'exact', spec: { kind: 'text', acceptedAnswers: ['تام', 'احتراق تام', 'الاحتراق التام'], inputHint: 'اكتب التصنيف المصحح' } },
  },
]

const concepts = [
  { id: 'l4-transformation', label: 'تكون مواد جديدة ودلالة المشاهدات', pageRefs: [p('24'), p('25')] },
  { id: 'l4-material-roles', label: 'المتفاعلات والنواتج والأدوات والشروط', pageRefs: [p('25'), p('27')] },
  { id: 'l4-word-reactions', label: 'اختيار المواد في المعادلة اللفظية', pageRefs: [p('26'), p('28')] },
  { id: 'l4-combustion', label: 'أكسجين الموقد، تمام الاحتراق والنواتج', pageRefs: [p('26'), p('28'), p('29')] },
  { id: 'l4-gas-safety', label: 'الوقود والرائحة والغازان والكشف الآمن', pageRefs: [p('24'), p('27'), p('29')] },
].map((concept) => ({ ...concept, questionIds: questions.filter((question) => question.conceptId === concept.id).map((question) => question.id) }))

const chemUnit1Lesson4Bank: TestBank = {
  id: 'chem-u1-l4', version: 1, requireComplete: true, scope: 'lesson', title: 'اختبار الدرس الرابع — التفاعلات الكيميائية',
  summary: 'اختبار مستقل عن أسئلة الكتاب واختبار الدرس: تغير المواد، أدوار المعادلة اللفظية، قراءة التجارب، احتراق الوقود وكمية الأكسجين، والكشف عن الغاز والسلامة.',
  unitId: 'chem-u1', lessonIds: ['chem-u1-l4'], questions,
  blueprint: buildBlueprint({
    testId: 'chem-u1-l4', scope: 'lesson', unitId: 'chem-u1', lessonIds: ['chem-u1-l4'], questions, concepts,
    commonErrors: [
      { id: 'l4-signs', label: 'جعل علامة واحدة شرطاً لكل تفاعل', questionIds: ['ta-l4-q03', 'ta-l4-q14'] },
      { id: 'l4-role', label: 'خلط المواد بالأدوات وبالتسخين', questionIds: ['ta-l4-q02', 'ta-l4-q07', 'ta-l4-q08', 'ta-l4-q09'] },
      { id: 'l4-air', label: 'خلط فتحة الهواء بالصمام أو عكس شرط الأكسجين', questionIds: ['ta-l4-q05', 'ta-l4-q12', 'ta-l4-q20'] },
      { id: 'l4-gases', label: 'خلط الغازين أو الرائحة بالكشف عن الغاز السام', questionIds: ['ta-l4-q04', 'ta-l4-q11', 'ta-l4-q13', 'ta-l4-q15', 'ta-l4-q16', 'ta-l4-q18'] },
      { id: 'l4-products', label: 'توحيد كل النواتج أو تعميم لون اللهب', questionIds: ['ta-l4-q06', 'ta-l4-q10', 'ta-l4-q17', 'ta-l4-q19'] },
    ], scoring: { pointsPerQuestion: 1, allowPartial: false }, solutionChunkSize: 5,
  }),
}
export default chemUnit1Lesson4Bank
