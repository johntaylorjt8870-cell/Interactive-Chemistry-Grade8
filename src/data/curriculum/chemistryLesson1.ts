import type { FinalTest, Question } from '@/assessment/types'
import type { LessonDefinition, LessonStep } from './schema'

const source = (page: string, item?: string) => ({ page, item })
const pages = Array.from({ length: 10 }, (_, index) => ({ page: String(index + 3) }))
const verifiedSource = {
  pages,
  verified: true,
  readability: {
    arabicText: 'clear' as const,
    latinText: 'clear' as const,
    equations: 'clear' as const,
    numbers: 'clear' as const,
    units: 'clear' as const,
    tables: 'clear' as const,
    diagrams: 'clear' as const,
    experiments: 'clear' as const,
    questions: 'clear' as const,
    notes: 'Final Source Readability Confirmation — الصفحات 3–12.',
  },
}

export const bookQuestions: Question[] = [
  {
    id: 'book-tf-1', type: 'true-false', origin: 'textbook', source: source('12', 'أختبر نفسي — السؤال الأول (1)'),
    prompt: 'الذرّة التي تخسر إلكتروناً تصبح أيوناً موجباً.', correctAnswer: true,
    explanation: 'صح. خسارة إلكترون سالب تُنقص مقدار الشحنة السالبة بينما يبقى عدد البروتونات الموجبة ثابتاً، فيصبح المجموع الجبري للشحنات موجباً.',
  },
  {
    id: 'book-tf-2', type: 'true-false', origin: 'textbook', source: source('12', 'أختبر نفسي — السؤال الأول (2)'),
    prompt: 'الأيونات معتدلة كهربائياً.', correctAnswer: false,
    explanation: 'غلط. الأيون جسيم مشحون لأن عدد إلكتروناته لا يساوي عدد بروتوناته؛ يكون موجباً عند فقد الإلكترونات وسالباً عند اكتسابها.',
  },
  {
    id: 'book-tf-3', type: 'true-false', origin: 'textbook', source: source('12', 'أختبر نفسي — السؤال الأول (3)'),
    prompt: 'الذرّة التي تكتسب إلكتروناً تصبح أيوناً سالباً.', correctAnswer: true,
    explanation: 'صح. الإلكترون المكتسب يحمل شحنة سالبة؛ لذلك يصبح عدد الشحنات السالبة أكبر من عدد الشحنات الموجبة.',
  },
  {
    id: 'book-tf-4', type: 'true-false', origin: 'textbook', source: source('12', 'أختبر نفسي — السؤال الأول (4)'),
    prompt: 'النظائر هي ذرّات متماثلة بالعدد الكتلي ومختلفة بالعدد الذري.', correctAnswer: false,
    explanation: 'غلط. نظائر العنصر الواحد متماثلة في العدد الذري، أي في عدد البروتونات، ومختلفة في عدد النيوترونات ولذلك تختلف في العدد الكتلي.',
  },
  {
    id: 'book-tf-5', type: 'true-false', origin: 'textbook', source: source('12', 'أختبر نفسي — السؤال الأول (5)'),
    prompt: 'العدد الأعظمي للإلكترونات في السويّة الرئيسية الثالثة 18.', correctAnswer: true,
    explanation: 'صح. نعوّض n = 3 في العلاقة y = 2(n)² فنحصل على y = 2 × 3² = 2 × 9 = 18 إلكتروناً.',
  },
  {
    id: 'book-tf-6', type: 'true-false', origin: 'textbook', source: source('12', 'أختبر نفسي — السؤال الأول (6)'),
    prompt: 'تمتلىء السويّة الطاقية الرئيسية الأولى K بثلاثة إلكترونات.', correctAnswer: false,
    explanation: 'غلط. للسوية K الرقم n = 1، ومن العلاقة y = 2(n)² يكون عددها الأعظمي 2 × 1² = 2 إلكترون فقط.',
  },
  {
    id: 'book-mc-1', type: 'multiple-choice', selection: 'single', origin: 'textbook', source: source('12', 'أختبر نفسي — السؤال الثاني (1)'),
    prompt: 'النظائر هي ذرّات متماثلة بالعدد:',
    options: [{ id: 'a', label: 'الكتلي.' }, { id: 'b', label: 'الذرّي.' }, { id: 'c', label: 'الكتلي والذرّي معاً.' }, { id: 'd', label: 'النيوترونات.' }], correctOptionIds: ['b'],
    explanation: 'الإجابة b: الذرّي. ثبات عدد البروتونات يحافظ على هوية العنصر، أما اختلاف عدد النيوترونات فيغيّر العدد الكتلي ويُنتج نظائر مختلفة.',
  },
  {
    id: 'book-mc-2', type: 'multiple-choice', selection: 'single', origin: 'textbook', source: source('12', 'أختبر نفسي — السؤال الثاني (2)'),
    prompt: 'إذا فقدت الذرّة إلكتروناً أو أكثر أصبحت:',
    options: [{ id: 'a', label: 'أيون موجب.' }, { id: 'b', label: 'أيون سالب.' }, { id: 'c', label: 'معتدلة.' }, { id: 'd', label: 'نظيراً.' }], correctOptionIds: ['a'],
    explanation: 'الإجابة a: أيون موجب؛ لأن فقد الشحنة السالبة يجعل عدد البروتونات الموجبة أكبر من عدد الإلكترونات.',
  },
  {
    id: 'book-mc-3', type: 'multiple-choice', selection: 'single', origin: 'textbook', source: source('12', 'أختبر نفسي — السؤال الثاني (3)'),
    prompt: 'في تمثيل لويس تُكتب حول رمز الذرة نقاط عددها يساوي:',
    options: [{ id: 'a', label: 'جميع الإلكترونات.' }, { id: 'b', label: 'الإلكترونات السطحية فقط.' }, { id: 'c', label: 'البروتونات.' }, { id: 'd', label: 'النيوترونات.' }], correctOptionIds: ['b'],
    explanation: 'الإجابة b: الإلكترونات السطحية فقط، أي إلكترونات السوية الأخيرة التي ترتبط بالسلوك الكيميائي للذرة.',
  },
  {
    id: 'book-mc-4', type: 'multiple-choice', selection: 'single', origin: 'textbook', source: source('12', 'أختبر نفسي — السؤال الثاني (4)'),
    prompt: 'الذرّة ذات التوزيع الإلكتروني وفق نظرية بور (2-8-6) هي:',
    options: [{ id: 'a', label: '₆C' }, { id: 'b', label: '₁₆S' }, { id: 'c', label: '₁₀Ne' }, { id: 'd', label: '₈O' }], correctOptionIds: ['b'],
    explanation: 'الإجابة b: ₁₆S. مجموع الإلكترونات = 2 + 8 + 6 = 16، وفي الذرة المعتدلة يساوي عدد الإلكترونات العدد الذري.',
  },
  {
    id: 'book-mc-5', type: 'multiple-choice', selection: 'single', origin: 'textbook', source: source('12', 'أختبر نفسي — السؤال الثاني (5)'),
    prompt: 'إذا كان العدد الذرّي للفوسفور 15 فيكون عدد الإلكترونات في السويّة الرئيسيّة الثالثة M هو:',
    options: [{ id: 'a', label: '2' }, { id: 'b', label: '5' }, { id: 'c', label: '6' }, { id: 'd', label: '7' }], correctOptionIds: ['b'],
    explanation: 'الإجابة b: 5. نوزّع 15 إلكتروناً من الداخل إلى الخارج: K(2)، ثم L(8)، ويبقى 15 − 10 = 5 إلكترونات في M.',
  },
  ...[
    { id: 'c', atom: '₆C', distribution: '2-4', lewis: 'أربع نقاط منفردة، نقطة في كل جهة حول C.' },
    { id: 'he', atom: '₂He', distribution: '2', lewis: 'نقطتان حول He.' },
    { id: 'ar', atom: '₁₈Ar', distribution: '2-8-8', lewis: 'ثماني نقاط حول Ar، زوج في كل جهة.' },
    { id: 'o', atom: '₈O', distribution: '2-6', lewis: 'ست نقاط حول O: زوجان ونقطتان منفردتان.' },
  ].map(({ id, atom, distribution, lewis }): Question => ({
    id: `book-lewis-${id}`, type: 'short-answer', origin: 'textbook', source: source('12', 'أختبر نفسي — السؤال الثالث'),
    prompt: `اكتب التوزع الإلكتروني ثم تمثيل لويس للذرّة ${atom}.`,
    referenceAnswer: `التوزع الإلكتروني: ${distribution}. تمثيل لويس: ${lewis}`,
    rubric: ['توزيع العدد الكامل للإلكترونات بدءاً من السوية الداخلية', 'تمثيل إلكترونات السوية الأخيرة فقط بنقاط لويس', 'وضع النقاط منفردة قبل بدء الازدواج'],
    explanation: `نقرأ العدد الذري بوصفه عدد الإلكترونات في الذرة المعتدلة، فنملأ السويات بالتتابع. النتيجة ${distribution}؛ لذلك ${lewis}`,
  })),
]

export const bookActivitySolutions: Question[] = [
  {
    id: 'activity-sodium', type: 'short-answer', origin: 'textbook', source: source('6', 'تطبيق الصوديوم'),
    prompt: 'وزّع إلكترونات ذرّة الصوديوم Na وعددها 11 إلكتروناً على السويات الرئيسية.',
    referenceAnswer: 'K(2), L(8), M(1).',
    rubric: ['ملء K بإلكترونين', 'ملء L بثمانية إلكترونات', 'وضع الإلكترون المتبقي في M'],
    explanation: 'نبدأ من السوية الأدنى K فنعطيها 2، ويتبقى 9. نملأ L بـ8، فيتبقى إلكترون واحد يوضع في M. التحقق: 2 + 8 + 1 = 11.',
  },
  {
    id: 'activity-neon', type: 'short-answer', origin: 'textbook', source: source('7', 'تطبيق النيون'),
    prompt: 'اقرأ الترميز ²⁰₁₀Ne وحدد العدد الكتلي والعدد الذري وعدد البروتونات والإلكترونات والنيوترونات والتوزع الإلكتروني.',
    referenceAnswer: 'العدد الكتلي 20، والعدد الذري 10، والبروتونات 10، والإلكترونات 10، والنيوترونات 10، والتوزع 2-8.',
    rubric: ['قراءة العددين من موضعيهما', 'استخدام تعادل الذرة', 'طرح العدد الذري من الكتلي', 'توزيع الإلكترونات'],
    explanation: 'العلوي هو العدد الكتلي 20 والسفلي هو العدد الذري 10. إذن البروتونات 10، ولأن الذرة متعادلة فالإلكترونات 10. النيوترونات = 20 − 10 = 10، وتوزع الإلكترونات 2-8.',
  },
  {
    id: 'activity-ion-table', type: 'short-answer', origin: 'textbook', source: source('8', 'جدول الذرات والأيونات'),
    prompt: 'قارن المجموع الجبري للشحنات في ذرّتي ²³₁₁Na و³⁵₁₇Cl وفي أيوني الصوديوم والكلور الناتجين عنهما.',
    referenceAnswer: 'ذرة Na: صفر، وأيون Na⁺: +1. ذرة Cl: صفر، وأيون Cl⁻: −1.',
    rubric: ['تساوي البروتونات والإلكترونات في الذرتين', 'فقد Na إلكتروناً', 'اكتساب Cl إلكتروناً'],
    explanation: 'في الذرة المتعادلة يتساوى الموجب والسالب فيكون المجموع صفراً. للصوديوم 11 بروتوناً و10 إلكترونات بعد الفقد فيكون +1. للكلور 17 بروتوناً و18 إلكتروناً بعد الاكتساب فيكون −1.',
  },
  {
    id: 'activity-lewis-al-mg-o', type: 'short-answer', origin: 'textbook', source: source('10', 'النشاط'),
    prompt: 'اكتب التوزع الإلكتروني وحدد عدد الإلكترونات السطحية ومثّل لويس لكل من ₁₃Al و₁₂Mg و₈O.',
    referenceAnswer: 'Al: 2-8-3 وثلاث نقاط لويس. Mg: 2-8-2 ونقطتا لويس. O: 2-6 وست نقاط لويس.',
    rubric: ['عدم إضافة أعداد كتلية', 'توزيع 13 و12 و8 إلكترونات على الترتيب', 'تمثيل إلكترونات السوية الأخيرة فقط'],
    explanation: 'الأعداد المكتوبة أسفل الرموز أعداد ذرية فقط. في الذرات المتعادلة هي أعداد الإلكترونات. بعد التوزيع يظهر عدد السطح: 3 للألمنيوم، و2 للمغنزيوم، و6 للأكسجين؛ وهو عدد نقاط لويس.',
  },
]

export const finalTest: FinalTest = {
  id: 'chem-u1-l1-final', lessonId: 'chem-u1-l1', origin: 'platform', status: 'source-verified', targetQuestionCount: { min: 10, max: 20 },
  questions: [
    { id: 'final-1', type: 'multiple-choice', selection: 'single', origin: 'platform', prompt: 'مرّت معظم جسيمات ألفا عبر صفيحة الذهب دون انحراف. ما الاستنتاج الأكثر مباشرة؟', options: [{ id: 'a', label: 'معظم حجم الذرة فراغ.' }, { id: 'b', label: 'الإلكترونات موجبة.' }, { id: 'c', label: 'النواة سالبة.' }, { id: 'd', label: 'كتلة الذرة موزعة بالتساوي.' }], correctOptionIds: ['a'], explanation: 'إذا كان معظم المسار خالياً من العائق المركز، تمر معظم الجسيمات مستقيمة؛ لذلك استنتج رذرفورد أن معظم حجم الذرة فراغ.' },
    { id: 'final-2', type: 'true-false', origin: 'platform', prompt: 'يتغيّر العنصر إلى عنصر آخر عندما يكتسب إلكتروناً واحداً.', correctAnswer: false, explanation: 'هوية العنصر يحددها عدد البروتونات، لا عدد الإلكترونات. اكتساب إلكترون يحوّل الذرة إلى أيون سالب من العنصر نفسه.' },
    { id: 'final-3', type: 'fill-blank', origin: 'platform', prompt: 'أكمل العلاقة بين أعداد الجسيمات.', template: 'في الذرة المتعادلة: عدد {b1} يساوي عدد {b2}.', blanks: [{ id: 'b1', acceptedAnswers: ['البروتونات', 'البروتون'] }, { id: 'b2', acceptedAnswers: ['الإلكترونات', 'الالكترونات', 'الإلكترون'] }], explanation: 'تعادل الذرة يعني تساوي الشحنات الموجبة والسالبة؛ لذا يتساوى عدد البروتونات والإلكترونات.' },
    { id: 'final-4', type: 'numerical', origin: 'platform', prompt: 'احسب العدد الأعظمي للإلكترونات في السوية الرئيسية الرابعة N باستعمال y = 2(n)².', acceptedAnswers: [32], explanation: 'n = 4، إذن y = 2 × 4² = 2 × 16 = 32 إلكتروناً. هذه سعة السوية وليست بالضرورة عدد إلكترونات السوية الأخيرة.' },
    { id: 'final-5', type: 'ordering', origin: 'platform', prompt: 'رتّب خطوات تحديد تمثيل لويس لذرة متعادلة.', items: [{ id: 'atomic', label: 'تحديد العدد الذري.' }, { id: 'electrons', label: 'تحديد عدد الإلكترونات.' }, { id: 'distribution', label: 'كتابة التوزع الإلكتروني.' }, { id: 'surface', label: 'عدّ إلكترونات السوية الأخيرة.' }, { id: 'dots', label: 'توزيع نقاط لويس حول الرمز.' }], correctOrder: ['atomic', 'electrons', 'distribution', 'surface', 'dots'], explanation: 'يبدأ الحل بالعدد الذري، ثم عدد الإلكترونات والتوزع، ومنه نعرف الإلكترونات السطحية التي تمثل وحدها بنقاط لويس.' },
    { id: 'final-6', type: 'matching', origin: 'platform', prompt: 'طابق كل ذرة مع توزيعها الإلكتروني.', left: [{ id: 'na', label: '₁₁Na' }, { id: 'f', label: '₉F' }, { id: 'ca', label: '₂₀Ca' }, { id: 'o', label: '₈O' }], right: [{ id: 'r1', label: '2-8-1' }, { id: 'r2', label: '2-7' }, { id: 'r3', label: '2-8-8-2' }, { id: 'r4', label: '2-6' }], pairs: [{ leftId: 'na', rightId: 'r1' }, { leftId: 'f', rightId: 'r2' }, { leftId: 'ca', rightId: 'r3' }, { leftId: 'o', rightId: 'r4' }], explanation: 'مجموع أعداد كل توزيع يساوي العدد الذري: 11، 9، 20، 8 على الترتيب.' },
    { id: 'final-7', type: 'multiple-choice', selection: 'single', origin: 'platform', prompt: 'ذرة متعادلة توزيعها 2-8-1. أي تغير يجعلها ذات شحنة +1؟', options: [{ id: 'a', label: 'تفقد إلكتروناً واحداً.' }, { id: 'b', label: 'تكتسب إلكتروناً واحداً.' }, { id: 'c', label: 'تفقد بروتوناً.' }, { id: 'd', label: 'تكتسب نيوتروناً.' }], correctOptionIds: ['a'], explanation: 'فقد إلكترون سالب واحد يترك فائضاً مقداره شحنة موجبة واحدة؛ فتغدو 2-8 وشحنتها +1.' },
    { id: 'final-8', type: 'short-answer', origin: 'platform', prompt: 'فسّر لماذا لا تُعدّ ¹⁶₈O و¹⁸₈O عنصرين مختلفين.', referenceAnswer: 'لأن لهما العدد الذري نفسه 8، أي العدد نفسه من البروتونات؛ لذا فهما ذرتان للعنصر نفسه. اختلاف العدد الكتلي سببه اختلاف عدد النيوترونات، ولذلك هما نظيران للأكسجين.', rubric: ['ثبات العدد الذري', 'ثبات عدد البروتونات وهوية العنصر', 'اختلاف عدد النيوترونات والعدد الكتلي'], minWords: 12, explanation: 'عدد البروتونات هو بطاقة هوية العنصر. كلا الرمزين يحمل 8 أسفل الرمز، والفرق 16 مقابل 18 في الأعلى ناتج عن النيوترونات.' },
    { id: 'final-9', type: 'numerical', origin: 'platform', prompt: 'لنظير الأكسجين ¹⁷₈O، احسب عدد النيوترونات.', acceptedAnswers: [9], explanation: 'عدد النيوترونات = العدد الكتلي − العدد الذري = 17 − 8 = 9.' },
    { id: 'final-10', type: 'multiple-choice', selection: 'multiple', origin: 'platform', prompt: 'اختر العبارتين الصحيحتين عن نموذج بور.', options: [{ id: 'a', label: 'للإلكترونات سويات طاقة محددة.' }, { id: 'b', label: 'النواة سالبة الشحنة.' }, { id: 'c', label: 'ينبعث الضوء عند انتقال الإلكترون من سوية أعلى إلى أدنى.' }, { id: 'd', label: 'تتسع السوية الأخيرة دائماً لأكثر من ثمانية إلكترونات.' }], correctOptionIds: ['a', 'c'], explanation: 'في نموذج بور تشغل الإلكترونات سويات محددة، ويظهر فرق الطاقة ضوءاً عند الانتقال إلى سوية أدنى.' },
    { id: 'final-11', type: 'fill-blank', origin: 'platform', prompt: 'أكمل وصف الترميز النووي.', template: 'في ²³₁₁Na العدد الكتلي هو {mass}، والعدد الذري هو {atomic}، وعدد النيوترونات هو {neutrons}.', blanks: [{ id: 'mass', acceptedAnswers: ['23', '٢٣'], kind: 'number' }, { id: 'atomic', acceptedAnswers: ['11', '١١'], kind: 'number' }, { id: 'neutrons', acceptedAnswers: ['12', '١٢'], kind: 'number' }], explanation: 'العدد العلوي 23 هو الكتلي، والسفلي 11 هو الذري، والنيوترونات = 23 − 11 = 12.' },
    { id: 'final-12', type: 'short-answer', origin: 'platform', prompt: 'قارن بين تكوّن K⁺ وتكوّن O²⁻ من حيث فقد الإلكترونات أو اكتسابها وسبب إشارة الشحنة.', referenceAnswer: 'تفقد ذرة البوتاسيوم إلكتروناً واحداً فيصبح عدد البروتونات أكبر بواحد من الإلكترونات فتتشكل K⁺. تكتسب ذرة الأكسجين إلكترونين فيصبح عدد الإلكترونات أكبر باثنين من البروتونات فتتشكل O²⁻.', rubric: ['K يفقد إلكتروناً', 'O يكتسب إلكترونين', 'ربط فرق الأعداد بإشارة الشحنة'], minWords: 15, explanation: 'الإشارة لا تُحفظ منفصلة: الفقد يزيل شحنة سالبة فيعطي موجباً، والاكتساب يضيف شحنات سالبة فيعطي سالباً.' },
    { id: 'final-13', type: 'matching', origin: 'platform', prompt: 'طابق الرمز مع الوصف الصحيح.', left: [{ id: 'mass', label: 'العدد الكتلي' }, { id: 'atomic', label: 'العدد الذري' }, { id: 'lewis', label: 'نقاط لويس' }, { id: 'charge', label: 'شحنة الأيون' }], right: [{ id: 'rn', label: 'بروتونات + نيوترونات' }, { id: 'rp', label: 'عدد البروتونات' }, { id: 'rs', label: 'إلكترونات السوية الأخيرة' }, { id: 'rd', label: 'الفرق الجبري بين الشحنات' }], pairs: [{ leftId: 'mass', rightId: 'rn' }, { leftId: 'atomic', rightId: 'rp' }, { leftId: 'lewis', rightId: 'rs' }, { leftId: 'charge', rightId: 'rd' }], explanation: 'هذه المطابقة تربط كل تمثيل بالكمية التي يصفها؛ وهي تمنع الخلط بين العدد الكتلي والذري وبين جميع الإلكترونات وإلكترونات لويس.' },
    { id: 'final-14', type: 'true-false', origin: 'platform', prompt: 'لذرتي نظيرين للعنصر نفسه العدد نفسه من النيوترونات.', correctAnswer: false, explanation: 'خطأ؛ النظائر تتفق في البروتونات وتختلف تحديداً في النيوترونات، لذلك تختلف أعدادها الكتلية.' },
    { id: 'final-15', type: 'short-answer', origin: 'platform', prompt: 'طالب مثّل الكربون C بنقطتين فقط لأن السوية K تحوي إلكترونين. حدّد الخطأ وصححه.', referenceAnswer: 'الخطأ أنه مثّل إلكترونات السوية الداخلية K. العدد الذري للكربون 6 وتوزعه 2-4؛ وتمثيل لويس يستخدم إلكترونات السوية الأخيرة L وعددها 4، فتُرسم أربع نقاط حول C، نقطة في كل جهة.', rubric: ['تحديد أن K سوية داخلية', 'كتابة التوزع 2-4', 'أربع نقاط منفردة حول C'], minWords: 12, explanation: 'لويس لا يعرض كل الإلكترونات ولا السوية الأولى وحدها، بل إلكترونات السوية الخارجية فقط.' },
  ],
}

const bookAssessment: FinalTest = {
  id: 'chem-u1-l1-book', lessonId: 'chem-u1-l1', origin: 'platform', status: 'source-verified', targetQuestionCount: { min: 10, max: 20 }, questions: [...bookActivitySolutions, ...bookQuestions],
}

const steps: LessonStep[] = [
  { id: 'goals', kind: 'source', title: 'مدخل الدرس ومفاهيمه', summary: 'النواة والإلكترونات والنظائر والسويات والأيونات.', attribution: 'textbook', source: { pages: [source('3')], verified: true }, minutes: 4, blocks: [
    { kind: 'key-terms', attribution: 'textbook', terms: [{ term: 'النواة', meaning: 'جزء الذرة المركزي الذي تتركز فيه معظم كتلتها.' }, { term: 'الإلكترونات', meaning: 'جسيمات سالبة الشحنة توجد حول النواة.' }, { term: 'النظائر', meaning: 'ذرات العنصر الواحد المتفقة في العدد الذري والمختلفة في العدد الكتلي.' }, { term: 'السويات الرئيسية', meaning: 'سويات طاقة محددة توجد فيها الإلكترونات حول النواة.' }, { term: 'قاعدة الثمانية', meaning: 'ارتباط الاستقرار بوجود ثمانية إلكترونات في السوية الأخيرة.' }, { term: 'النشاط الكيميائي', meaning: 'قابلية الذرة للدخول في تغير كيميائي.' }, { term: 'الأيون', meaning: 'ذرة فقدت أو اكتسبت إلكتروناً أو أكثر فأصبحت مشحونة.' }] },
  ] },
  { id: 'thomson-source', kind: 'source', title: 'نموذج طومسون', summary: 'اكتشاف الإلكترون والتصور الأول لبنية الذرة.', attribution: 'textbook', source: { pages: [source('4')], verified: true }, minutes: 5, blocks: [
    { kind: 'textbook-verbatim', text: '…وهو جسيم صغير كتلته تقريبًا (1/1860) من كتلة نواة ذرّة الهيدروجين ويحمل شحنة سالبة.', source: source('4') },
    { kind: 'formula', tex: '\\frac{1}{1860}', display: 'block', caption: 'النسبة كما وردت في الكتاب', attribution: 'textbook' },
    { kind: 'definition', term: 'نموذج طومسون', text: 'الذرة جسيم صغير متجانس المادة ويحمل شحنة موجبة تتوزع الإلكترونات السالبة داخله بحيث تكون الذرة متعادلة كهربائيًا.', attribution: 'textbook' },
  ] },
  { id: 'thomson-explain', kind: 'explanation', title: 'كيف نفهم نموذج طومسون؟', summary: 'الشحنة والتعادل وحدود النموذج.', attribution: 'platform', minutes: 6, blocks: [
    { kind: 'paragraph', text: 'كلمة «نموذج» تعني تصوراً علمياً يفسّر الملاحظات المتاحة في زمنه. بعد اكتشاف الإلكترون لم تعد الذرة تُعد جسماً غير قابل للتجزئة؛ صار لا بد من تفسير وجود شحنة سالبة داخل مادة متعادلة. افترض طومسون شحنة موجبة منتشرة تتخللها إلكترونات سالبة، فتتوازن الشحنتان.', attribution: 'platform' },
    { kind: 'callout', tone: 'method', title: 'اقرأ الكسر علمياً', text: 'الكسر العمودي 1 فوق 1860 يعني أن كتلة الإلكترون، بحسب العبارة المثبتة في المصدر، جزء واحد من 1860 جزءاً من كتلة نواة ذرة الهيدروجين. صِغَر الكتلة لا يعني انعدامها.', attribution: 'platform' },
  ] },
  { id: 'rutherford-source', kind: 'experiment', title: 'تجربة رذرفورد', summary: 'فعل ثم ملاحظة ثم استنتاج.', attribution: 'textbook', source: { pages: [source('4'), source('5')], verified: true }, minutes: 8, blocks: [
    { kind: 'procedure', title: 'الفعل', items: ['أسقط رذرفورد حزمة من جسيمات ألفا الموجبة على صفيحة ذهب رقيقة.', 'رُصدت مسارات الجسيمات بعد اصطدامها بالصفيحة.'], attribution: 'textbook' },
    { kind: 'list', items: ['معظم جسيمات ألفا تنفذ من صفيحة الذهب دون أن تنحرف.', 'جزء صغير من جسيمات ألفا ارتدّ وبعضها انحرف بزوايا مختلفة.'], attribution: 'textbook' },
    { kind: 'interactive', interactiveId: 'rutherford-scattering', caption: 'حرّك عدد الجسيمات ثم أطلق الحزمة، وراقب قياسات النفاذ والانحراف والارتداد.' },
    { kind: 'list', ordered: true, items: ['معظم حجم الذرة فراغ، بدليل نفاذ معظم جسيمات ألفا دون أن تنحرف.', 'تحتوي الذرة بداخلها جزء موجب سمّاه النواة، تتركز فيه معظم كتلة الذرة.'], attribution: 'textbook' },
  ] },
  { id: 'bohr', kind: 'source', title: 'نموذج بور للذرّة', summary: 'سويات محددة وانتقال الإلكترون بينها.', attribution: 'textbook', source: { pages: [source('5')], verified: true }, minutes: 6, blocks: [
    { kind: 'list', ordered: true, items: ['تتكوّن الذرّة من نواة موجبة وتدور حولها الإلكترونات في سويّات لها طاقة محدّدة.', 'تمتص الذرّة طاقة عندما ينتقل الإلكترون من سويّة طاقة أدنى إلى سويّة طاقة أعلى، ومقدار الطاقة الممتصة يساوي فرق الطاقة بين السويتين.', 'تُصدر الذرّة طاقة محددة على شكل ضوء عندما يقفز الإلكترون من سويّة طاقة أعلى إلى سويّة طاقة أدنى.'], attribution: 'textbook' },
    { kind: 'paragraph', text: 'لا يتحرك الإلكترون بين السويات بلا تبادل للطاقة. الانتقال إلى الخارج يحتاج امتصاصاً، والعودة إلى الداخل ترافقها طاقة منبعثة. لذلك يربط النموذج موضع الإلكترون النسبي بمقدار طاقته.', attribution: 'platform' },
  ] },
  { id: 'levels-law', kind: 'source', title: 'السويّات الرئيسية وقانون السعة', summary: 'y = 2(n)² ومعنى الرمزين.', attribution: 'mixed', source: { pages: [source('5'), source('6')], verified: true }, minutes: 8, blocks: [
    { kind: 'list', items: ['تدور الإلكترونات حول النواة في سويات طاقة.', 'تشغل الإلكترونات السوية الأدنى ثم الأعلى وهكذا، ويُسمى ذلك التوزيع الإلكتروني.', 'السوية الأخيرة لا تحوي أكثر من ثمانية إلكترونات.'], attribution: 'textbook' },
    { kind: 'formula', tex: 'y = 2(n)^2', caption: 'y العدد الأعظمي للإلكترونات، و n رقم السوية الرئيسية', attribution: 'textbook' },
    { kind: 'paragraph', text: 'لاختيار قيمة n ننظر إلى رقم السوية لا إلى حرفها: K تقابل n = 1، وL تقابل 2، وهكذا. نحسب مربع n أولاً، ثم نضرب الناتج في 2. العلاقة تعطي السعة العظمى للسوية، ولا تعني أن كل ذرة تملأها دائماً حتى هذه السعة.', attribution: 'platform' },
    { kind: 'table', caption: 'السويات الرئيسية من K إلى O', columns: [{ key: 'level', header: 'السوية', rowHeader: true }, { key: 'n', header: 'n', numeric: true }, { key: 'work', header: 'التعويض' }, { key: 'y', header: 'y', numeric: true }], rows: [
      { id: 'k', cells: { level: 'K', n: '1', work: '2 × 1²', y: '2' } }, { id: 'l', cells: { level: 'L', n: '2', work: '2 × 2²', y: '8' } }, { id: 'm', cells: { level: 'M', n: '3', work: '2 × 3²', y: '18' } }, { id: 'n', cells: { level: 'N', n: '4', work: '2 × 4²', y: '32' } }, { id: 'o', cells: { level: 'O', n: '5', work: '2 × 5²', y: '50' } },
    ], attribution: 'textbook' },
  ] },
  { id: 'sodium', kind: 'example', title: 'تطبيق: التوزيع الإلكتروني للصوديوم', summary: 'توزيع 11 إلكتروناً من الداخل إلى الخارج.', attribution: 'mixed', source: { pages: [source('6', 'تطبيق')], verified: true }, minutes: 7, blocks: [
    { kind: 'chemical-formula', formula: 'Na', caption: 'الصوديوم — 11 إلكتروناً في الذرة المعتدلة', attribution: 'textbook' },
    { kind: 'table', caption: 'توزيع إلكترونات الصوديوم', columns: [{ key: 'level', header: 'السوية', rowHeader: true }, { key: 'electrons', header: 'عدد الإلكترونات', numeric: true }, { key: 'reason', header: 'التفسير' }], rows: [{ id: 'k', cells: { level: 'K', electrons: '2', reason: 'تمتلئ أولاً' } }, { id: 'l', cells: { level: 'L', electrons: '8', reason: 'تمتلئ بعدها' } }, { id: 'm', cells: { level: 'M', electrons: '1', reason: 'الإلكترون المتبقي' } }], footnote: 'K(2), L(8), M(1) — المجموع 11.', attribution: 'textbook' },
    { kind: 'interactive', interactiveId: 'electron-shell-builder', caption: 'ابنِ توزيعاً إلكترونياً بنفسك؛ كل إضافة تغيّر العدادات والسوية الأخيرة فعلياً.' },
  ] },
  { id: 'atomic-numbers', kind: 'source', title: 'العدد الذري والعدد الكتلي', summary: 'قراءة الترميز النووي واستخراج الجسيمات.', attribution: 'mixed', source: { pages: [source('7'), source('8')], verified: true }, minutes: 8, blocks: [
    { kind: 'nuclear', symbol: 'Ne', massNumber: 20, atomicNumber: 10, caption: 'النيون كما ورد في الصفحة 7', attribution: 'textbook' },
    { kind: 'paragraph', text: 'يوضع العدد الكتلي أعلى يسار الرمز، والعدد الذري أسفل يساره. تُبنى العلامات هنا بعناصر مستقلة، لا بمسافات أو محارف مرتفعة جاهزة.', attribution: 'platform' },
    { kind: 'formula', tex: '\\text{عدد النيوترونات}=\\text{العدد الكتلي}-\\text{العدد الذري}', attribution: 'platform' },
    { kind: 'table', caption: 'الترميز النووي والجسيمات والشحنة', columns: [{ key: 'form', header: 'شكل', rowHeader: true }, { key: 'nucleus', header: 'رمز النواة' }, { key: 'electrons', header: 'عدد الإلكترونات', numeric: true }, { key: 'protons', header: 'عدد البروتونات', numeric: true }, { key: 'sum', header: 'المجموع الجبري للشحنات' }], rows: [{ id: 'na-atom', cells: { form: 'ذرة الصوديوم', nucleus: '²³₁₁Na', electrons: '11', protons: '11', sum: '0' } }, { id: 'na-ion', cells: { form: 'أيون الصوديوم', nucleus: '²³₁₁Na', electrons: '10', protons: '11', sum: '+1' } }, { id: 'cl-atom', cells: { form: 'ذرة الكلور', nucleus: '³⁵₁₇Cl', electrons: '17', protons: '17', sum: '0' } }, { id: 'cl-ion', cells: { form: 'أيون الكلور', nucleus: '³⁵₁₇Cl', electrons: '18', protons: '17', sum: '−1' } }], attribution: 'textbook' },
  ] },
  { id: 'ions', kind: 'source', title: 'تشكّل الأيونات', summary: 'الفقد والاكتساب والمجموع الجبري للشحنات.', attribution: 'mixed', source: { pages: [source('8'), source('9')], verified: true }, minutes: 8, blocks: [
    { kind: 'ion', formula: 'K', charge: '+', caption: 'K⁺ — التوزع قبل الفقد 2-8-8-1', attribution: 'textbook' },
    { kind: 'ion', formula: 'F', charge: '-', caption: 'F⁻ — التوزع قبل الاكتساب 2-7', attribution: 'textbook' },
    { kind: 'ion', formula: 'Ca', charge: '2+', caption: 'Ca²⁺ — التوزع قبل الفقد 2-8-8-2', attribution: 'textbook' },
    { kind: 'ion', formula: 'O', charge: '2-', caption: 'O²⁻ — التوزع قبل الاكتساب 2-6', attribution: 'textbook' },
    { kind: 'callout', tone: 'warning', title: 'لا تعكس الإشارة', text: 'فقد الإلكترونات السالبة يعطي أيوناً موجباً، واكتساب الإلكترونات السالبة يعطي أيوناً سالباً. البروتونات لا تتغير عند تشكل هذه الأيونات.', attribution: 'platform' },
  ] },
  { id: 'lewis', kind: 'source', title: 'تمثيل لويس', summary: 'الإلكترونات السطحية كنقاط مستقلة حول الرمز.', attribution: 'mixed', source: { pages: [source('9')], verified: true }, minutes: 8, blocks: [
    { kind: 'paragraph', text: 'يمثل لويس إلكترونات السوية الأخيرة فقط، لا جميع إلكترونات الذرة. نضع الإلكترونات فرادى حول الجهات الأربع قبل أن نبدأ بتكوين الأزواج.', attribution: 'platform' },
    { kind: 'table', caption: 'عناصر جدول لويس في الكتاب', columns: [{ key: 'symbol', header: 'الرمز', rowHeader: true }, { key: 'atomic', header: 'العدد الذري', numeric: true }, { key: 'distribution', header: 'التوزع الإلكتروني' }, { key: 'surface', header: 'الإلكترونات السطحية', numeric: true }], rows: [{ id: 'li', cells: { symbol: 'Li', atomic: '3', distribution: '2-1', surface: '1' } }, { id: 'b', cells: { symbol: 'B', atomic: '5', distribution: '2-3', surface: '3' } }, { id: 'c', cells: { symbol: 'C', atomic: '6', distribution: '2-4', surface: '4' } }, { id: 'n', cells: { symbol: 'N', atomic: '7', distribution: '2-5', surface: '5' } }], attribution: 'textbook' },
    { kind: 'lewis', symbol: 'Li', dots: [{ position: 'right' }], caption: 'Li — إلكترون سطحي واحد', attribution: 'textbook' },
    { kind: 'lewis', symbol: 'B', dots: [{ position: 'top' }, { position: 'right' }, { position: 'bottom' }], caption: 'B — ثلاثة إلكترونات سطحية', attribution: 'textbook' },
    { kind: 'lewis', symbol: 'C', dots: [{ position: 'top' }, { position: 'right' }, { position: 'bottom' }, { position: 'left' }], caption: 'C — أربع نقاط في الجهات الأربع', attribution: 'textbook' },
    { kind: 'lewis', symbol: 'N', pairs: { top: 1 }, dots: [{ position: 'right' }, { position: 'bottom' }, { position: 'left' }], caption: 'N — خمسة إلكترونات سطحية', attribution: 'textbook' },
  ] },
  { id: 'activity-al-mg-o', kind: 'activity', title: 'نشاط: التوزع وتمثيل لويس', summary: 'الأعداد الذرية 13 و12 و8 فقط.', attribution: 'textbook', source: { pages: [source('10', 'نشاط')], verified: true }, minutes: 8, blocks: [
    { kind: 'nuclear', symbol: 'Al', atomicNumber: 13, caption: '₁₃Al — عدد ذري فقط', attribution: 'textbook' },
    { kind: 'nuclear', symbol: 'Mg', atomicNumber: 12, caption: '₁₂Mg — عدد ذري فقط', attribution: 'textbook' },
    { kind: 'nuclear', symbol: 'O', atomicNumber: 8, caption: '₈O — عدد ذري فقط', attribution: 'textbook' },
    { kind: 'callout', tone: 'method', title: 'خطة العمل', text: 'اعتبر العدد الذري عدد الإلكترونات في الذرة المتعادلة، وزّعها من السوية الداخلية إلى الخارجية، ثم مثّل عدد إلكترونات السوية الأخيرة بنقاط لويس. لا يوجد عدد كتلي في رموز النشاط.', attribution: 'platform' },
  ] },
  { id: 'isotopes', kind: 'source', title: 'النظائر', summary: 'أكسجين-16 وأكسجين-17 وأكسجين-18.', attribution: 'mixed', source: { pages: [source('10'), source('11')], verified: true }, minutes: 9, blocks: [
    { kind: 'definition', term: 'النظائر', text: 'ذرّات للعنصر نفسه متماثلة بالعدد الذري ومختلفة بالعدد الكتلي.', attribution: 'textbook' },
    { kind: 'nuclear', symbol: 'O', massNumber: 16, atomicNumber: 8, caption: '¹⁶₈O', attribution: 'textbook' },
    { kind: 'nuclear', symbol: 'O', massNumber: 17, atomicNumber: 8, caption: '¹⁷₈O', attribution: 'textbook' },
    { kind: 'nuclear', symbol: 'O', massNumber: 18, atomicNumber: 8, caption: '¹⁸₈O', attribution: 'textbook' },
    { kind: 'table', caption: 'مقارنة نظائر الأكسجين', columns: [{ key: 'isotope', header: 'النظير', rowHeader: true }, { key: 'mass', header: 'العدد الكتلي', numeric: true }, { key: 'atomic', header: 'العدد الذري', numeric: true }, { key: 'neutrons', header: 'عدد النيوترونات', numeric: true }], rows: [{ id: 'o16', cells: { isotope: '¹⁶₈O', mass: '16', atomic: '8', neutrons: '8' } }, { id: 'o17', cells: { isotope: '¹⁷₈O', mass: '17', atomic: '8', neutrons: '9' } }, { id: 'o18', cells: { isotope: '¹⁸₈O', mass: '18', atomic: '8', neutrons: '10' } }], attribution: 'textbook' },
    { kind: 'interactive', interactiveId: 'isotope-lab', caption: 'ثبّت عدد البروتونات وغيّر النيوترونات، ثم راقب العدد الكتلي واسم النظير.' },
    { kind: 'callout', tone: 'note', title: 'تعلّمُ', text: 'هوية العنصر تبقى مرتبطة بعدد البروتونات؛ تغيير النيوترونات يغيّر النظير والعدد الكتلي، لا رمز العنصر.', attribution: 'mixed' },
  ] },
  { id: 'book-check-1', kind: 'question', title: 'أختبر نفسي: صح أم غلط', summary: 'العبارات الست كما في الكتاب.', attribution: 'textbook', source: { pages: [source('12', 'أختبر نفسي — السؤال الأول')], verified: true }, minutes: 8, blocks: bookQuestions.slice(0, 6).map((question) => ({ kind: 'question' as const, questionId: question.id })) },
  { id: 'book-check-2', kind: 'question', title: 'أختبر نفسي: اختر الإجابة', summary: 'الأسئلة الخمسة وخياراتها.', attribution: 'textbook', source: { pages: [source('12', 'أختبر نفسي — السؤال الثاني')], verified: true }, minutes: 8, blocks: bookQuestions.slice(6, 11).map((question) => ({ kind: 'question' as const, questionId: question.id })) },
  { id: 'book-check-3', kind: 'question', title: 'أختبر نفسي: التوزع ولويس', summary: 'أربع ذرات وتمثيلاتها.', attribution: 'textbook', source: { pages: [source('12', 'أختبر نفسي — السؤال الثالث')], verified: true }, minutes: 10, blocks: bookQuestions.slice(11).map((question) => ({ kind: 'question' as const, questionId: question.id })) },
  { id: 'summary', kind: 'summary', title: 'خلاصة مترابطة', summary: 'من النموذج الذري إلى النظائر والأيونات.', attribution: 'platform', minutes: 5, blocks: [
    { kind: 'list', items: ['كشف الإلكترون أن الذرة تحوي جسيمات أصغر منها.', 'أظهرت تجربة رذرفورد أن معظم الذرة فراغ وأن الكتلة والشحنة الموجبة تتركزان في النواة.', 'نظّم نموذج بور الإلكترونات في سويات طاقة، وتحسب سعتها بالعلاقة y = 2(n)² مع قيد السوية الأخيرة في الدرس.', 'العدد الذري يحدد عدد البروتونات وهوية العنصر، والعدد الكتلي يساوي البروتونات والنيوترونات.', 'الأيون ينتج من فقد الإلكترونات أو اكتسابها، أما النظير فينتج من اختلاف عدد النيوترونات.', 'تمثيل لويس يعرض إلكترونات السوية الأخيرة كنقاط مستقلة حول رمز العنصر.'], attribution: 'platform' },
  ] },
  { id: 'final-test', kind: 'final-test', title: 'الاختبار الشامل للدرس', summary: '15 سؤالاً جديداً ومتنوّعاً.', attribution: 'platform', testId: finalTest.id, minutes: 25, blocks: [] },
]

export const chemistryLesson1: LessonDefinition = {
  id: 'chem-u1-l1', slug: 'atom-and-element', title: 'الدرس الأول — الذرّة والعنصر', order: 1, status: 'source-verified', source: verifiedSource,
  summary: 'بنية الذرة ونماذجها، السويات الرئيسية، التوزيع الإلكتروني، الأيونات، تمثيل لويس، والنظائر.',
  steps,
  tests: [bookAssessment, finalTest],
}
