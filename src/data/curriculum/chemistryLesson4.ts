import type { FinalTest } from '@/assessment/types'
import type { ContentBlock, LessonDefinition, LessonStep } from './schema'
import { bookActivitySolutions, bookQuestions, lesson4Figures } from './chemistryLesson4Questions'
import { finalTest } from './chemistryLesson4Test'

export { bookActivitySolutions, bookQuestions, finalTest }

/** Source-first: intake was completed and C1/C2 resolved BEFORE implementation.
 * The original files are unavailable: each photograph has a precise, visibly
 * labelled printed-page reference. No platform schematic is a claimed scan.
 * See docs/source-reports/lesson4-chemical-reactions-intake.md. */
const ref = (page: string, item?: string) => ({ page, item })
const source = (page: string, item: string) => ({ pages: [ref(page, item)], verified: true })
const quote = (page: string, text: string, item?: string): ContentBlock => ({ kind: 'textbook-verbatim', text, source: ref(page, item) })
const q = (...ids: string[]): ContentBlock[] => ids.map((questionId) => ({ kind: 'question', questionId }))
const explanation = (text: string): ContentBlock => ({ kind: 'paragraph', attribution: 'platform', text })
const word = (reactants: string[], products: string[], condition?: string): ContentBlock => ({ kind: 'word-equation', reactants, products, condition, attribution: 'platform' })

/** Detailed scientific concepts for the independent Lesson 4 Teacher tab. */
export const lesson4TeacherGuide: ContentBlock[] = [
  { kind: 'callout', tone: 'method', title: '1. التحول الكيميائي، الملاحظة والاستنتاج — ص 24–25', attribution: 'platform', text: 'جوهر التفاعل هو تغير المواد وتكون مواد جديدة. المتفاعلات مواد البداية، والنواتج المواد المتكونة. نطلب من الطالب أولاً وصف ما يراه، ثم تفسيره: فقاعات في خليط الليمون والبيكربونات، تغير صباغ الثوب بماء جافيل، وتعكر رائق الكلس. كلمة «غالباً» تمنع تعميم ظهور كل العلامات في كل تفاعل؛ مجرد الفقاعات أو تغير اللون خارج سياق معروف لا يكفي وحده لإثبات تفاعل.' },
  { kind: 'procedure', title: 'توجيه تجربة المغنزيوم — ص25', attribution: 'platform', items: ['نراجع كل أداة: الشريط، الملقط، الموقد، النظارة، والجفنة الخزفية التي تحوي قليلاً من الرمل. لا تختزل شروط السلامة إلى الشريط والموقد.', 'نقرأ التنفيذ المطبوع، مع الإشراف المخبري ومنع التحديق في ضوء المغنزيوم الشديد. لا يحول وجود النظارة التجربة إلى نشاط منزلي آمن.', 'نميز الشريط الفلزي قبل الاحتراق عن أكسيد المغنزيوم الأبيض بعده. المادة الجديدة لا ترجع إلى الشريط بمجرد التبريد أو إعادة الشكل.', 'نستنتج MgO باستخدام تكافؤ المغنزيوم والأكسجين المتساويين من الدروس السابقة، دون أرقام فهرسية أو شحنات للصيغة المتعادلة.'] },
  { kind: 'callout', tone: 'method', title: '2. المعادلة اللفظية ومواضع المواد — ص 25–28', attribution: 'platform', text: 'المعادلة اللفظية تستخدم أسماء المواد لا الرموز. نقرأ سلسلة التفاعل من اليسار إلى اليمين: المواد المتفاعلة قبل السهم، والناتجة بعده، وعلامة الجمع تجمع المواد على الطرف الواحد. الأسماء العربية تظل مقروءة RTL داخل سلسلة LTR معزولة. «تسخين» فوق سهم المغنزيوم شرط، وليس متفاعلاً أو ناتجاً. الرقم II جزء من اسم كبريتيد الحديد في نشاط الصفحة 26، ولا يحول إلى شحنة في النص.' },
  word(['المغنزيوم', 'الأكسجين'], ['أكسيد المغنزيوم'], 'تسخين'),
  { kind: 'callout', tone: 'method', title: '3. الاحتراق والأكسجين: ضبط المتغير — ص26', attribution: 'platform', text: 'الاحتراق تفاعل مادة مع الأكسجين عند درجة حرارة مناسبة؛ لا يقدم المصدر درجة حرارة عددية. موقد بنزن له ثقب يسمح بدخول الهواء فوق الصمام. المتغير المقصود هو دخول الهواء، لا تغيير نوع الوقود ولا اختراع نسبة أكسجين. في الحالة (1) يظهر لهب أزرق وصحن دون سواد؛ في الحالة (2) يضيق الثقب جزئياً، فيظهر لهب أصفر وسخام. قلة الأكسجين تفسر عدم تمام الاحتراق وتوهج دقائق الكربون، ثم ترسبها على الصحن.' },
  { kind: 'callout', tone: 'note', title: '4. النواتج لا اللون وحده — ص 26–29', attribution: 'platform', text: 'احتراق البوتان التام ينتج ثنائي أكسيد الكربون والماء. عند نقص الأكسجين يمكن أن ينتج أحادي أكسيد الكربون و/أو كربون مع الماء، وقد يوجد ثنائي أكسيد الكربون أيضاً في خليط النواتج. لا يوجد في المصدر تركيب ثابت أو نسبة لهذه النواتج، فلا نفرض ذلك في المحاكاة أو الحل. اللون الأزرق/الأصفر وصف لموقد الوقود في الكتاب، وليس قاعدة لكل مادة: المغنزيوم يحترق بضوء أبيض ولا يعني ذلك سخاماً كربونياً.' },
  { kind: 'callout', tone: 'warning', title: '5. الغاز المنزلي، CO، والبحث الآمن — ص27', attribution: 'platform', text: 'نفرق بين غاز الوقود (خليط البوتان والبروبان الذي تضاف له رائحة المركبتان) وبين CO المحتمل من الاحتراق غير التام. رائحة الوقود تساعد على اكتشاف تسربه، لكنها لا تكشف CO ولا تثبت غيابه. CO يعيق نقل الأكسجين بالدم؛ تفسر هذه العلاقة الإعياء واضطراب دقات القلب المذكورين. الغاز الثنائي CO₂ مختلف، ويكشف في تجربة الدرس بتعكر رائق الكلس. رغوة الماء والصابون لفحص التسرب ليست هذا الكاشف الكيميائي.' },
  { kind: 'procedure', title: 'بناء جواب قضية البحث — ص27', attribution: 'platform', items: ['نسجل الظروف: غرفة محكمة الإغلاق ومدفأة وقود وشتاء قارس، لا أرقاماً مفترضة لحجم الغرفة أو مدة التعرض.', 'نرسم علاقة سببية: احتراق يستهلك الأكسجين، وضعف تهوية قد يؤدي إلى نقصه، ثم احتراق غير تام وتراكم CO.', 'نربط الغاز السام بتعطيل نقل الأكسجين، ثم نذكر الاستنتاج الوقائي: تهوية وتجهيز تدفئة سليم، وعدم اعتماد الرائحة أو لون الدخان كضمان سلامة.', 'لا نولد CO لاختبار فرضية؛ البحث مناقشة ومصادر تعليمية آمنة. عند الاشتباه بالخطر يخرج الأشخاص إلى الهواء النقي ويطلبون المساعدة المختصة.'] },
  { kind: 'callout', tone: 'method', title: '6. تصحيح الإجابات وتقدير فهم الطالب — ص 28–29', attribution: 'platform', text: 'في كل معادلة نسمي مواد البداية، ثم المادة الجديدة، ثم نراجع الطرفين والسهم والشروط المطبوعة فقط. نعالج جميع فروع السؤال الثالث، ونقارن النواتج في السؤال الرابع، ونطلب طريقة ومشاهدة وتفسيراً واستنتاجاً في السؤال الخامس. في السؤال السادس نثبت رقم كل شكل ونحل تصنيف الشكلين وتعليل السخام معاً. الاختبار الجديد مستقل، يقيم بعد تسليم جميع الإجابات فقط؛ كل سؤال له تفسير كامل في تبويب حلول الاختبار.' },
]

const bookAssessment: FinalTest = {
  id: 'chem-u1-l4-book', lessonId: 'chem-u1-l4', origin: 'platform', status: 'source-verified',
  // This is a source-question lookup container, not the 20-question final test.
  targetQuestionCount: { min: 33, max: 33 }, questions: [...bookActivitySolutions, ...bookQuestions],
}

const steps: LessonStep[] = [
  {
    id: 'opening', kind: 'source', title: 'التفاعلات الكيميائية — الأهداف والكلمات المفتاحية', attribution: 'textbook', source: source('24', 'عنوان الدرس، الأهداف والكلمات المفتاحية'),
    blocks: [
      quote('24', '4 التفاعلات الكيميائية', 'عنوان الدرس'),
      quote('24', 'الأهداف:'),
      { kind: 'list', attribution: 'textbook', items: ['يتعرّف التفاعل الكيميائي.', 'يميّز بين المواد المتفاعلة والناتجة.', 'يتعرّف تفاعل الاحتراق.', 'يميّز أنواع تفاعلات الاحتراق.', 'يقارن نواتج الاحتراق التام وغير التام.', 'يعبّر عن التفاعل الكيميائي بمعادلة كيميائية لفظية.'] },
      quote('24', 'الكلمات المفتاحية: تفاعل كيميائي – مواد متفاعلة – مواد ناتجة – معادلة كيميائية لفظية – احتراق تام – احتراق غير تام.'),
    ],
  },
  {
    id: 'observe-reactions', kind: 'source', title: 'التفاعل الكيميائي: ألاحظ وأجيب', attribution: 'textbook', source: source('24', 'التفاعل الكيميائي — ألاحظ وأجيب'),
    blocks: [quote('24', 'التفاعل الكيميائي:'), quote('24', 'ألاحظ وأجيب:'), lesson4Figures.observations,
      quote('24', 'إضافة قطرات ليمون إلى بيكربونات الصوديوم (الكربونة)', 'تعليق الصورة اليمنى — مؤكد بالقصّة'),
      ...q('l4-observe-lemon', 'l4-observe-javel', 'l4-observe-limewater', 'l4-observe-name'),
    ],
  },
  {
    id: 'observation-lab', kind: 'simulation', title: 'مختبر الملاحظة: ماذا تغير؟', attribution: 'platform',
    summary: 'ثلاثة مشاهد نوعية؛ افصل ما تراه عن تفسيره.',
    blocks: [explanation('لاحظ أولاً، ثم استنتج. تمثل الرسوم معنى مشاهد الصفحة 24 ولا تعيد رسم صورها الأصلية. لا تقيس أحجاماً أو تركيزات أو زمناً للتفاعل.'), { kind: 'interactive', interactiveId: 'reaction-observation-lab' }],
  },
  {
    id: 'magnesium-experiment', kind: 'source', title: 'تفاعل احتراق المغنزيوم: أجرب وأستنتج', attribution: 'textbook', source: source('25', 'احتراق المغنزيوم — أدوات التجربة وخطوات التنفيذ'),
    blocks: [quote('25', 'تفاعل احتراق المغنزيوم:'), quote('25', 'أجرّب وأستنتج:'), quote('25', 'أدوات التجربة: شريط مغنزيوم، ملقط، موقد، نظارات واقية، جفنة خزفية تحوي قليلاً من الرمل.'),
      quote('25', 'خطوات التنفيذ:'), ...q('l4-mg-observation'), lesson4Figures.magnesium, ...q('l4-mg-q1', 'l4-mg-q2', 'l4-mg-q3')],
  },
  {
    id: 'magnesium-lab', kind: 'simulation', title: 'قبل الاحتراق وأثناءه وبعده', attribution: 'platform', summary: 'تتبع تغير المادة لا مجرد تغير شكلها.',
    blocks: [{ kind: 'callout', tone: 'warning', attribution: 'platform', title: 'محاكاة تعليمية، لا تجربة منزلية', text: 'تجرى تجربة الشريط في المخبر بإشراف المعلم. لا تحدق في الضوء الشديد، ولا تمسك الشريط باليد، ولا تنفذها من أجل المحاكاة.' }, { kind: 'interactive', interactiveId: 'magnesium-combustion-lab' }],
  },
  {
    id: 'reaction-definition', kind: 'source', title: 'أستنتج: التفاعل الكيميائي وعلاماته', attribution: 'textbook', source: source('25', 'أستنتج — تعريف التفاعل وما يرافقه'),
    blocks: [quote('25', 'أستنتج:'), quote('25', 'التفاعل الكيميائي: تحوّل يطرأ على مواد كيميائية (مواد متفاعلة) وتتكون مواد جديدة (مواد ناتجة).'), quote('25', 'غالباً ما يرافق التفاعلات الكيميائية: تغيّر في اللون أو تشكّل راسب أو انطلاق غاز أو نشر حرارة .........')],
  },
  {
    id: 'reactants-explained', kind: 'explanation', title: 'كيف نميز المتفاعلات والنواتج؟', attribution: 'platform',
    blocks: [explanation('المتفاعلات مواد البداية التي تدخل التفاعل، والنواتج مواد جديدة تتكون منه. في الشريط: المغنزيوم وأكسجين الهواء متفاعلان، والأكسيد الأبيض ناتج. الملقط والنظارة والموقد أدوات؛ والتسخين شرط وليس مادة نضعها بجانب المغنزيوم.'),
      explanation('نفصل المشاهدة عن التفسير: «ظهرت فقاعات» ملاحظة، و«انطلق غاز أثناء تفاعل» تفسير. «تعكر السائل» ملاحظة، و«تكون راسب» تفسير. يتقوى الحكم بتكون مادة جديدة في سياق التجربة؛ ليس كل تغير لون أو كل فقاعة في أي ظرف دليلاً كافياً وحده.'),
      { kind: 'callout', tone: 'note', attribution: 'platform', title: 'انتبه إلى «غالباً»', text: 'لا يلزم أن نشاهد كل العلامات في التفاعل نفسه. وعدم وجود فقاعات لا ينفي التفاعل. كذلك لا نقول إن كل التفاعلات مستحيلة العكس؛ المقصود في الشريط أنه لا يرجع إلى حالته الأصلية بمجرد تبريد الأكسيد أو تغيير شكله.' }],
  },
  {
    id: 'magnesium-word-activity', kind: 'source', title: 'نشاط: الغاز والناتج والمعادلة اللفظية', attribution: 'textbook', source: source('25', 'نشاط احتراق المغنزيوم — الفروع 1–3'),
    blocks: [quote('25', 'نشاط: في التجربة السابقة:'), ...q('l4-mg-act1', 'l4-mg-act2', 'l4-mg-act3'),
      { kind: 'word-equation', attribution: 'textbook', reactants: ['المغنزيوم', '................'], products: ['................'], condition: 'تسخين', reactantRoles: ['(مادة متفاعلة)', '(مادة متفاعلة)'], productRoles: ['(مادة ناتجة)'] }],
  },
  {
    id: 'word-equation-activities', kind: 'source', title: 'نشاط: الحديد والكبريت، وتكون الماء', attribution: 'textbook', source: source('26', 'نشاط المعادلات اللفظية — 1 و2'),
    blocks: [quote('26', 'نشاط:'), ...q('l4-word-iron', 'l4-word-water')],
  },
  {
    id: 'word-equation-lab', kind: 'activity', title: 'باني المعادلات اللفظية', attribution: 'platform',
    blocks: [explanation('نكتب أسماء مواد البداية قبل السهم وأسماء المواد الجديدة بعده. علامة الجمع تجمع مواد الطرف نفسه، والسهم يعني «ينتج» ولا يقلب ليتبع اتجاه الفقرة العربية. في هذا النشاط يتغير تركيب البطاقة فعلاً بحسب اختيارك، ويظهر التحقق عند طلبه فقط.'), { kind: 'interactive', interactiveId: 'word-equation-lab' }],
  },
  {
    id: 'burner-experiment', kind: 'source', title: 'أجرب وأستنتج: الهواء ولهب موقد بنزن', attribution: 'textbook', source: source('26', 'موقد بنزن — الأدوات والتنفيذ والأسئلة الأربعة'),
    blocks: [quote('26', 'أجرّب وأستنتج:'), quote('26', 'أدوات التجربة: موقد بنزن في المخبر له ثقب فوق الصمام يسمح بدخول الهواء – صحن خزف.'), quote('26', 'خطوات التنفيذ:'),
      ...q('l4-burner-observe1', 'l4-burner-observe2'), lesson4Figures.burner,
      ...q('l4-burner-q1', 'l4-burner-q2', 'l4-burner-q3', 'l4-burner-q4')],
  },
  {
    id: 'combustion-conclusions', kind: 'source', title: 'أستنتج: الاحتراق التام وغير التام', attribution: 'textbook', source: source('26', 'أستنتج — الاحتراق وأنواعه وشروط الأكسجين'),
    blocks: [quote('26', 'أستنتج:'), quote('26', 'الاحتراق: هو تفاعل المادة مع الأكسجين عند درجة حرارة مناسبة.'), quote('26', 'تختلف نواتج الاحتراق حسب كمية الهواء (الأكسجين) المتوفرة.'), quote('26', 'الاحتراق نوعان: تام وغير تام.'),
      { kind: 'list', attribution: 'textbook', ordered: true, items: ['يحدث الاحتراق التام عندما تتوافر كمية كافية من الأكسجين.', 'يحدث الاحتراق غير التام عندما تكون كمية الأكسجين غير كافية.'] }],
  },
  {
    id: 'burner-lab', kind: 'simulation', title: 'تحكم بالهواء، وقارن النواتج', attribution: 'platform', summary: 'الحالتان (1) و(2) كما يربطهما المصدر بكمية الأكسجين.',
    blocks: [{ kind: 'interactive', interactiveId: 'combustion-air-lab' }, explanation('تغير فتحة الهواء كمية الأكسجين المتاحة. في موقد الكتاب، كفاية الأكسجين تعطي احتراقاً تاماً ولهباً أزرق وصحناً دون سواد. النقص يؤدي إلى احتراق غير تام، ولهب أصفر وسخام. المحاكاة نوعية؛ لا تقدم نسبة أكسجين أو حرارة أو زمن ترسب غير وارد في المصدر.')],
  },
  {
    id: 'products-explained', kind: 'explanation', title: 'لماذا تظهر الطبقة السوداء؟', attribution: 'platform',
    blocks: [explanation('في احتراق البوتان التام ينتج ثنائي أكسيد الكربون والماء. عندما لا يكفي الأكسجين قد يتكون أحادي أكسيد الكربون و/أو الكربون مع الماء؛ وقد يتضمن الخليط أيضاً ثنائي أكسيد الكربون. لا يحدد المصدر نسباً ثابتة للنواتج، لذلك لا نعرضها كأنها قياسات.'),
      explanation('الطبقة السوداء في تجربة الصحن كربون ترسب كسخام نتيجة عدم تمام احتراق الوقود. ليست غاز CO نفسه ولا CO₂، وليست مادة الصحن وقد تحولت إلى فلز. أما الناتج الأبيض عند احتراق المغنزيوم فهو أكسيد المغنزيوم؛ فلا نخلط بين نوعي التجارب.'),
      { kind: 'callout', tone: 'note', title: 'لون اللهب وصف لشروط التجربة، لا قانون لكل مادة', attribution: 'platform', text: 'نستعمل المقارنة الأزرق/الأصفر في موقد الوقود المصور في الكتاب. لا نعمم أن كل لهب غير أزرق احتراق غير تام؛ للمغنزيوم مثلاً ضوء أبيض شديد السطوع. نسأل دائماً: ما المادة؟ وما الأكسجين المتاح؟ وما النواتج؟' }],
  },
  {
    id: 'household-gas', kind: 'source', title: 'هل تعلم؟! الغاز المنزلي', attribution: 'textbook', source: source('27', 'هل تعلم؟!'),
    blocks: [quote('27', 'هل تعلم؟!'), quote('27', 'الغاز المنزلي مكوّن من خليط غازي (البوتان والبروبان) لا رائحة له ولا لون يضاف له مادة عضوية (المركبتان) له رائحة قوية لاكتشاف أي تسرب للغاز. وعند تركيب أسطوانة الغاز استخدم رغوة الماء والصابون للتأكد من وجود تسرب.')],
  },
  {
    id: 'carbon-monoxide', kind: 'source', title: 'إضاءة: أحادي أكسيد الكربون', attribution: 'textbook', source: source('27', 'إضاءة'),
    blocks: [quote('27', 'إضاءة:'), quote('27', 'غاز أحادي أكسيد الكربون (CO) عديم اللون سام جداً، يتّحد مع كريات الدم الحمراء فيمنعها من نقل الأكسجين ممّا يسبب الإعياء واضطراب دقات القلب.')],
  },
  {
    id: 'research-heaters', kind: 'source', title: 'قضية للبحث: المدافئ والغرف المغلقة', attribution: 'textbook', source: source('27', 'قضية للبحث'),
    blocks: [quote('27', 'قضية للبحث:'), ...q('l4-research')],
  },
  {
    id: 'research-guidance', kind: 'explanation', title: 'ابن تفسيراً آمناً: من الأكسجين إلى الخطر', attribution: 'platform',
    blocks: [explanation('ابدأ بالظروف: مدفأة وقود في غرفة محكمة الإغلاق. الاحتراق يستهلك الأكسجين، والتهوية الضعيفة قد تحد تجدد الهواء. مع نقص الأكسجين يحتمل الاحتراق غير التام وتكون CO وتراكمه. هذا الغاز يعيق نقل الأكسجين بالدم؛ لذلك لا تكون المشكلة مجرد دفء زائد أو رائحة مزعجة.'),
      { kind: 'callout', tone: 'warning', title: 'تمييز اختبارين، وحماية الحياة', attribution: 'platform', text: 'رائحة المركبتان تساعد على اكتشاف تسرب غاز الوقود؛ عدمها لا يضمن غياب CO. رغوة الماء والصابون فحص تسرب، أما رائق الكلس فكاشف CO₂ في تجربة الدرس. لا تجرب توليد غاز سام، ولا تستخدم اللهب لكشف التسرب. عند الاشتباه بخطر الغاز يخرج الأشخاص إلى الهواء النقي ويطلبون المساعدة المختصة؛ وتراعى التهوية وسلامة أجهزة التدفئة وفق تعليمات المختصين.' }],
  },
  {
    id: 'learned-summary', kind: 'source', title: 'تعلمت: خلاصة الكتاب', attribution: 'textbook', source: source('27', 'تعلمت — البنود الأربعة ومخطط المعادلة'),
    blocks: [quote('27', 'تعلّمت:'), quote('27', 'التفاعل الكيميائي: تحوّل يطرأ على مواد كيميائية (مواد متفاعلة) وتتكون مواد جديدة (مواد ناتجة).'), quote('27', 'المعادلة الكيميائية اللفظية.'),
      { kind: 'word-equation', attribution: 'textbook', reactants: ['مواد متفاعلة'], products: ['مواد ناتجة'] },
      quote('27', 'يحدث الاحتراق التام عندما تكون كمية الأكسجين كافية.'), quote('27', 'يحدث الاحتراق غير التام عندما تكون كمية الأكسجين غير كافية.')],
  },
  {
    id: 'book-question-1', kind: 'question', title: 'أختبر نفسي — السؤال الأول', attribution: 'textbook', source: source('28', 'السؤال الأول — الفقرات 1–4'),
    blocks: [quote('28', 'أختبر نفسي:'), quote('28', 'السؤال الأول: اختر الإجابة الصحيحة لكل مما يأتي:'), ...q('l4-book-mc1', 'l4-book-mc2', 'l4-book-mc3', 'l4-book-mc4')],
  },
  {
    id: 'book-question-2', kind: 'question', title: 'السؤال الثاني: أكمل التفاعلات اللفظية', attribution: 'textbook', source: source('28', 'السؤال الثاني — المعادلات الثلاث'),
    blocks: [quote('28', 'السؤال الثاني: أكمل التفاعلات اللفظية الآتية:'), ...q('l4-book-q2-1', 'l4-book-q2-2', 'l4-book-q2-3')],
  },
  {
    id: 'book-question-3', kind: 'question', title: 'السؤال الثالث: اكتب المعادلات اللفظية', attribution: 'textbook', source: source('28', 'السؤال الثالث — الفروع 1–3'),
    blocks: [quote('28', 'السؤال الثالث: اكتب المعادلة الكيميائية اللفظية لكل من التفاعلات الآتية:'), ...q('l4-book-q3-1', 'l4-book-q3-2', 'l4-book-q3-3')],
  },
  {
    id: 'book-question-4', kind: 'question', title: 'السؤال الرابع: قارن نواتج احتراق البوتان', attribution: 'textbook', source: source('29', 'السؤال الرابع'),
    blocks: [quote('29', 'السؤال الرابع:'), ...q('l4-book-q4')],
  },
  {
    id: 'book-question-5', kind: 'question', title: 'السؤال الخامس: الكشف التجريبي عن الغاز', attribution: 'textbook', source: source('29', 'السؤال الخامس'),
    blocks: [quote('29', 'السؤال الخامس:'), ...q('l4-book-q5')],
  },
  {
    id: 'book-question-6', kind: 'question', title: 'السؤال السادس: فسر الشكلين والطبقة السوداء', attribution: 'textbook', source: source('29', 'السؤال السادس — الشكلان (1) و(2)'),
    blocks: [quote('29', 'السؤال السادس:'), ...q('l4-book-q6')],
  },
  {
    id: 'connected-summary', kind: 'summary', title: 'اربط أفكار الدرس قبل الاختبار', attribution: 'platform',
    blocks: [{ kind: 'list', attribution: 'platform', items: ['أميز ما يحدث للمادة: التفاعل يكون مواد جديدة، لا مجرد تغيير مكانها.', 'أقرأ المعادلة اللفظية: متفاعلات، علامة جمع إن لزمت، سهم، ثم نواتج؛ التسخين شرط لا مادة.', 'أفسر الاحتراق بوجود الأكسجين ودرجة حرارة مناسبة؛ كفاية الأكسجين تحدد تمامه في ظروف المصدر.', 'أربط الصحن الأسود بالسخام ونقص الأكسجين، وأفرق ذلك عن أكسيد المغنزيوم الأبيض.', 'أفرق CO السام عن CO₂ الذي يكشف بتعكر رائق الكلس، وبين رائحة الوقود وفحص التسرب.', 'أجيب عن جميع أسئلة الاختبار قبل التسليم؛ لا تظهر الإجابات الصحيحة أو النتائج أثناء الحل.'] }],
  },
  {
    id: 'final-test', kind: 'final-test', title: 'اختبار الدرس الرابع — 20 سؤالاً', attribution: 'platform', testId: finalTest.id,
    summary: 'اختبار أصلي محدد الإجابات؛ التصحيح بعد اكتمال الحل والتسليم فقط.', blocks: [],
  },
]

export const chemistryLesson4: LessonDefinition = {
  id: 'chem-u1-l4', slug: 'chemical-reactions', title: 'الدرس الرابع — التفاعلات الكيميائية', order: 4, status: 'source-verified',
  source: {
    pages: ['24', '25', '26', '27', '28', '29'].map((page) => ref(page)), verified: true,
    readability: { arabicText: 'clear', latinText: 'clear', equations: 'clear', numbers: 'clear', units: 'clear', tables: 'clear', diagrams: 'clear', experiments: 'clear', questions: 'clear', notes: 'Source text read in the supplied six images; C1/C2 confirmed by user close-ups and caption transcription before coding. No measured quantities or tables are printed. Original scan files are unavailable: figures retain exact meaning through labelled page references, not guessed redraws. Platform schematics are separate.' },
  },
  summary: 'التفاعل الكيميائي ومواده، المعادلات اللفظية، احتراق المغنزيوم، أثر الأكسجين في الاحتراق التام وغير التام، الغاز المنزلي وخطر أحادي أكسيد الكربون، والكشف عن ثنائي أكسيد الكربون.',
  steps, tests: [bookAssessment, finalTest],
}
