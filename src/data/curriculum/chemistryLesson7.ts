import type { SourceReference } from '@/data/source'
import type { ContentBlock, LessonDefinition, LessonStep, TableRowSpec } from './schema'
import { bookActivitySolutions, bookAssessment, bookQuestions, lesson7BookQuestionCount, lesson7BookQuestionIds } from './chemistryLesson7Book'
import { formativeQuestions, lesson7PracticeQuestions, practiceApplicationQuestions, practiceAssessment, practiceFoundationalQuestions, practiceReasoningQuestions } from './chemistryLesson7Practice'
import { finalTest } from './chemistryLesson7Test'
import { lesson7TeacherGuide } from './chemistryLesson7TeacherGuide'
import { LESSON7_LEDGER, lesson7SourceText } from './lesson7SourceLedger'
import countingObjects from '../../assets/textbook/lesson7/p40-counting-objects.png'
import balanceOriginal from '../../assets/textbook/lesson7/p41-balance-original.png'
import gasesOriginal from '../../assets/textbook/lesson7/p44-gases-original.png'
import jabirOriginal from '../../assets/textbook/lesson7/p46-jabir-original.png'

export { bookActivitySolutions, bookAssessment, bookQuestions, finalTest, formativeQuestions, lesson7BookQuestionCount, lesson7BookQuestionIds, lesson7PracticeQuestions, lesson7TeacherGuide, practiceApplicationQuestions, practiceAssessment, practiceFoundationalQuestions, practiceReasoningQuestions }

const q = (id: string): ContentBlock => {
  const item = LESSON7_LEDGER.find((entry) => entry.id === id)!
  return { kind: 'textbook-verbatim', text: item.content, source: { page: item.page, item: id, scanId: `image-${Number(item.page) - 39}.png` } }
}
const sourceMath = (id: string, tex: string): ContentBlock => {
  const item = LESSON7_LEDGER.find((entry) => entry.id === id)!
  return { kind: 'formula', tex, display: 'block', caption: `الكتاب المدرسي — ص${item.page} — ${id}`, attribution: 'textbook' }
}
const image = (src: string, page: string, item: string, alt: string): ContentBlock => ({ kind: 'source-image', src, alt, caption: 'قصّة أصلية من رسم الكتاب، دون إعادة رسم أو تعديل النص.', source: { page, item, scanId: `image-${Number(page) - 39}.png` } })
const ask = (...ids: string[]): ContentBlock[] => ids.map((questionId) => ({ kind: 'question', questionId, reveal: true }))
const prose = (text: string): ContentBlock => ({ kind: 'paragraph', text, attribution: 'platform' })
const bullets = (items: string[]): ContentBlock => ({ kind: 'list', items, attribution: 'platform' })
const note = (title: string, text: string): ContentBlock => ({ kind: 'callout', tone: 'note', title, text, attribution: 'platform' })
const proc = (title: string, items: string[]): ContentBlock => ({ kind: 'procedure', title, items, attribution: 'platform' })
const tex = (expr: string, caption?: string): ContentBlock => ({ kind: 'formula', tex: expr, display: 'block', caption, attribution: 'platform' })
const sourceFor = (first: number, last: number): SourceReference => ({ verified: true, pages: LESSON7_LEDGER.filter((item) => item.order >= first && item.order <= last).map((item) => ({ page: item.page, item: item.id, scanId: `image-${Number(item.page) - 39}.png` })) })

/** Sixteen rows exactly as printed; no unit is added to the printed header. */
const elementTable: ContentBlock = {
  kind: 'table', caption: lesson7SourceText('L7-P42-E001'), attribution: 'textbook',
  columns: [{ key: 'name', header: 'اسم العنصر', rowHeader: true }, { key: 'symbol', header: 'رمزه' }, { key: 'mass', header: 'الكتلة الذرّية', numeric: true }],
  rows: LESSON7_LEDGER.filter((item) => item.id >= 'L7-P42-E003' && item.id <= 'L7-P42-E018').map((item) => {
    const [name, symbol, mass] = item.content.split(' | ')
    return { id: item.id, cells: { name, symbol, mass } }
  }),
}
/** Intentional blanks stay blank in the source table; answers live in assessment. */
const activityTable: ContentBlock = {
  kind: 'table', caption: 'نشاط ص43 — الخلايا الفارغة كما في الكتاب', attribution: 'textbook',
  columns: [{ key: 'formula', header: 'الصّيغة', rowHeader: true }, { key: 'first', header: 'الكتلة الذرّية للعنصر الأول × عدد ذراته في الصّيغة' }, { key: 'second', header: 'الكتلة الذرّية للعنصر الثاني × عدد ذراته في الصّيغة' }, { key: 'sum', header: 'المجموع' }, { key: 'molar', header: 'الكتلة الموليّة', unit: 'g.mol⁻¹' }],
  rows: [
    { id: 'water', cells: { formula: 'H₂O', first: '1 × 2', second: '16 × 1', sum: '2 + 16', molar: '18' } },
    { id: 'ammonia', cells: { formula: 'NH₃', first: '', second: '', sum: '', molar: '' } },
    { id: 'methane', cells: { formula: 'CH₄', first: '', second: '1 × 4', sum: '', molar: '' } },
  ],
}
const alignmentRows = (first: string[], second: string[]): TableRowSpec[] => [
  { id: 'molar', cells: { fe: first[0], hcl: first[1], fecl2: first[2], h2: first[3] } },
  { id: 'given', cells: { fe: second[0], hcl: second[1], fecl2: second[2], h2: second[3] } },
]
const ironAlignment45: ContentBlock = { kind: 'table', caption: 'مخطط المحاذاة تحت المعادلة — ص45', attribution: 'textbook', columns: [{ key: 'fe', header: 'Fe' }, { key: 'hcl', header: '2HCl(aq)' }, { key: 'fecl2', header: 'FeCl₂(aq)' }, { key: 'h2', header: 'H₂' }], rows: alignmentRows(['56 g', '', '127 g', ''], ['5.6 g', '', 'x g', '']) }
const ironAlignment46: ContentBlock = { kind: 'table', caption: 'مخطط المحاذاة تحت المعادلة — ص46، دون وسوم حالة', attribution: 'textbook', columns: [{ key: 'fe', header: 'Fe' }, { key: 'hcl', header: '2HCl' }, { key: 'fecl2', header: 'FeCl₂' }, { key: 'h2', header: 'H₂' }], rows: alignmentRows(['56 g', '', '', '22.4 L'], ['5.6 g', '', '', 'V (L)']) }

const steps: LessonStep[] = [
  {
    id: 'p40-entry', kind: 'source', title: "المدخل: الحساب الكيميائيّ والأهداف والكلمات المفتاحية", attribution: 'textbook', minutes: 4,
    source: sourceFor(1, 17),
    blocks: [
      q('L7-P40-E001'),
      q('L7-P40-E002'),
      q('L7-P40-E003'),
      q('L7-P40-E004'),
      q('L7-P40-E005'),
      q('L7-P40-E006'),
      q('L7-P40-E007'),
      q('L7-P40-E008'),
      q('L7-P40-E009'),
      image(countingObjects, '40', 'L7-P40-E010', 'أربع صور من اليمين إلى اليسار: أقلام في حامل، وكيس أرز، وكوب ماء، ومسامير، مع تسمياتها المطبوعة.'),
    ],
  },
  {
    id: 'p40-mole-questions', kind: 'source', title: "مفهوم المول: من الدزينة إلى عدّ الجسيمات", attribution: 'mixed', minutes: 5,
    source: sourceFor(18, 24),
    blocks: [
      q('L7-P40-E018'),
      ...ask('l7-p40-q1'),
      ...ask('l7-p40-q2'),
      ...ask('l7-p40-q3'),
      ...ask('l7-p40-q4'),
      ...ask('l7-p40-q5'),
      ...ask('l7-p40-q6'),
    ],
  },
  {
    id: 'p40-counting-review', kind: 'explanation', title: "شرح المنصة: لماذا نعدّ بالجُملة؟", attribution: 'platform', minutes: 4,
    blocks: [
      prose('الدزينة وحدة عدّ للأقلام، والمول وحدة عدّ للجسيمات. الفكرة المشتركة أن عدداً ثابتاً من الأشياء يحمل اسماً واحداً؛ لكن قيمة العدد تختلف بين الوحدتين.'),
      ...ask('l7-fc-1'),
    ],
  },
  {
    id: 'p41-mole-source', kind: 'source', title: "أستنتج: المول والكتلة المولية", attribution: 'textbook', minutes: 5,
    source: sourceFor(25, 33),
    blocks: [
      q('L7-P41-E001'),
      q('L7-P41-E002'),
      q('L7-P41-E003'),
      q('L7-P41-E004'),
      q('L7-P41-E005'),
      q('L7-P41-E006'),
      q('L7-P41-E007'),
      q('L7-P41-E008'),
      q('L7-P41-E009'),
    ],
  },
  {
    id: 'p41-balance-source', kind: 'source', title: "رسم الميزان الأصلي وحدود قراءة تسميته", attribution: 'mixed', minutes: 3,
    source: sourceFor(34, 36),
    blocks: [
      image(balanceOriginal, '41', 'L7-P41-E010', 'ميزان بكفتين كما في الكتاب: دورق بجسيمات بيضاء يساراً وعيار برتقالي يميناً، مع تسميتين متداخلتين إحداهما بيضاء باهتة.'),
      note('التسمية البيضاء المتداخلة غير معتمدة', 'أُبقيت قصّة الميزان الأصلية كما هي. التسمية السوداء المقروءة موثقة، أما نص التسمية البيضاء وأُسها فلم يُعتمدا؛ لا يُعرض لهما تخمين بوصفه محتوى الكتاب.'),
    ],
  },
  {
    id: 'p41-light-note-source', kind: 'source', title: "إضاءة وملاحظة: من كتلة الذرة إلى الكتلة المولية", attribution: 'textbook', minutes: 4,
    source: sourceFor(37, 42),
    blocks: [
      q('L7-P41-E013'),
      q('L7-P41-E014'),
      sourceMath('L7-P41-E015', String.raw`0.16607\times10^{-23}\times6.022\times10^{23}=1\;\mathrm{g}`),
      q('L7-P41-E016'),
      q('L7-P41-E017'),
      q('L7-P41-E018'),
    ],
  },
  {
    id: 'p41-mole-explained', kind: 'explanation', title: "شرح المنصة: عدد الجسيمات نوع وكمية", attribution: 'platform', minutes: 4,
    blocks: [
      prose('عند استخدام المول نحدد نوع الجسيم: ذرة أم جزيء أم أيون أم إلكترون. مول واحد من H₂O يعني عدداً من الجزيئات، بينما مول واحد من Na⁺ يعني عدداً من الأيونات.'),
      tex(String.raw`N=n\times6.022\times10^{23}`, 'العلاقة العددية من إعداد المنصة وفق ثابت الكتاب'),
    ],
  },
  {
    id: 'p42-elements-source', kind: 'source', title: "جدول العناصر: الرمز والكتلة الذرية", attribution: 'textbook', minutes: 4,
    source: sourceFor(43, 60),
    blocks: [
      q('L7-P42-E001'),
      elementTable,
    ],
  },
  {
    id: 'p43-table-source', kind: 'source', title: "نشاط الجدول: بناء الكتلة المولية من الصيغة", attribution: 'mixed', minutes: 6,
    source: sourceFor(61, 66),
    blocks: [
      q('L7-P43-E001'),
      q('L7-P43-E002'),
      activityTable,
      ...ask('l7-p43-table-nh3','l7-p43-table-ch4'),
    ],
  },
  {
    id: 'p43-mgcl2-source', kind: 'source', title: "تطبيق محلول: عدد مولات MgCl₂ في 190 g", attribution: 'textbook', minutes: 5,
    source: sourceFor(67, 74),
    blocks: [
      q('L7-P43-E007'),
      q('L7-P43-E008'),
      q('L7-P43-E009'),
      q('L7-P43-E010'),
      q('L7-P43-E011'),
      sourceMath('L7-P43-E012', String.raw`M=1\times24+2\times35.5=95\;\mathrm{g\,mol^{-1}}`),
      q('L7-P43-E013'),
      sourceMath('L7-P43-E014', String.raw`n=\frac{m}{M}\Longrightarrow n=\frac{190}{95}=2\;\mathrm{mol}`),
    ],
  },
  {
    id: 'p43-activity-source', kind: 'source', title: "نشاط ص43: الكتلة المولية والكتلة وعدد المولات", attribution: 'mixed', minutes: 6,
    source: sourceFor(75, 79),
    blocks: [
      q('L7-P43-E015'),
      ...ask('l7-p43-act1'),
      ...ask('l7-p43-act2'),
      ...ask('l7-p43-act3'),
      q('L7-P43-E019'),
      ...ask('l7-fc-2'),
    ],
  },
  {
    id: 'molar-mass-lab', kind: 'simulation', title: "مختبر المنصة: من الصيغة إلى الكتلة والمولات", attribution: 'platform', minutes: 7,
    blocks: [
      { kind: 'interactive', interactiveId: 'lesson7-molar-mass-lab', caption: 'نموذج حسابي من المنصة؛ اختر مادة وكمية ثم احسب وقارن.' },
    ],
  },
  {
    id: 'p44-gas-observations-source', kind: 'source', title: "الحجم المولي: أتأمل وأجيب", attribution: 'mixed', minutes: 6,
    source: sourceFor(80, 90),
    blocks: [
      q('L7-P44-E001'),
      q('L7-P44-E002'),
      q('L7-P44-E003'),
      image(gasesOriginal, '44', 'L7-P44-E004', 'ثلاث أسطوانات غاز: الهليوم يساراً، والأكسجين وسطاً، والنتروجين يميناً؛ كل منها عند 1 atm و273 K وحجم 22.4 L لمول واحد، بكتل 4.0 و32.0 و28.0 g على الترتيب.'),
      ...ask('l7-p44-q1'),
      ...ask('l7-p44-q2'),
      ...ask('l7-p44-q3'),
      ...ask('l7-p44-q4'),
    ],
  },
  {
    id: 'p44-molar-volume-source', kind: 'source', title: "الاستنتاج والشرطان النظاميان وقانون الحجم", attribution: 'mixed', minutes: 5,
    source: sourceFor(91, 98),
    blocks: [
      q('L7-P44-E012'),
      q('L7-P44-E013'),
      q('L7-P44-E014'),
      q('L7-P44-E015'),
      q('L7-P44-E016'),
      q('L7-P44-E017'),
      q('L7-P44-E018'),
      sourceMath('L7-P44-E019', String.raw`V=n\times22.4\;\mathrm{L}`),
      ...ask('l7-fc-3'),
    ],
  },
  {
    id: 'molar-volume-lab', kind: 'simulation', title: "مختبر المنصة: مقارنة حجوم الغازات", attribution: 'platform', minutes: 7,
    blocks: [
      { kind: 'interactive', interactiveId: 'lesson7-molar-volume-lab', caption: 'غيّر الغاز وعدد المولات وثبّت الشرطين النظاميين، ثم اقرأ الحجم المحسوب.' },
    ],
  },
  {
    id: 'p45-hydrogen-source', kind: 'source', title: "تطبيق محلول: من حجم الغاز إلى عدد المولات", attribution: 'textbook', minutes: 4,
    source: sourceFor(99, 104),
    blocks: [
      q('L7-P45-E001'),
      q('L7-P45-E002'),
      q('L7-P45-E003'),
      sourceMath('L7-P45-E004', String.raw`n=\frac{V}{22.4}`),
      sourceMath('L7-P45-E005', String.raw`n=\frac{44.8}{22.4}`),
      sourceMath('L7-P45-E006', String.raw`n=2\;\mathrm{mol}`),
    ],
  },
  {
    id: 'p45-iron-source', kind: 'source', title: "تطبيقات الحساب الكيميائي: الحديد وحمض كلور الماء", attribution: 'textbook', minutes: 6,
    source: sourceFor(105, 119),
    blocks: [
      q('L7-P45-E007'),
      q('L7-P45-E008'),
      q('L7-P45-E009'),
      { kind: 'chemical-equation', reactants: ['Fe', '2HCl(aq)'], products: ['FeCl2(aq)', 'H2'], caption: 'ص45 — المعادلة المطبوعة بوسمي (aq)', attribution: 'textbook' },
      q('L7-P45-E011'),
      q('L7-P45-E012'),
      q('L7-P45-E013'),
      q('L7-P45-E014'),
      q('L7-P45-E015'),
      q('L7-P45-E016'),
      q('L7-P45-E017'),
      q('L7-P45-E018'),
      q('L7-P45-E019'),
      q('L7-P45-E020'),
      ironAlignment45,
    ],
  },
  {
    id: 'p46-iron-solution-source', kind: 'source', title: "تتمة الحل: كتلة كلوريد الحديد II وحجم الهدروجين", attribution: 'textbook', minutes: 6,
    source: sourceFor(120, 131),
    blocks: [
      q('L7-P46-E001'),
      sourceMath('L7-P46-E002', String.raw`\frac{56}{5.6}=\frac{127}{x}`),
      q('L7-P46-E003'),
      sourceMath('L7-P46-E003', String.raw`x=\frac{127\times5.6}{56}=1.27\;\mathrm{g}`),
      q('L7-P46-E004'),
      q('L7-P46-E005'),
      q('L7-P46-E006'),
      q('L7-P46-E007'),
      q('L7-P46-E008'),
      ironAlignment46,
      q('L7-P46-E010'),
      sourceMath('L7-P46-E011', String.raw`\frac{56}{5.6}=\frac{22.4}{V}`),
      q('L7-P46-E012'),
      sourceMath('L7-P46-E012', String.raw`V=\frac{5.6\times22.4}{56}=2.24\;\mathrm{L}`),
    ],
  },
  {
    id: 'stoichiometry-explained', kind: 'explanation', title: "شرح المنصة: خريطة التحويل في المعادلة الموزونة", attribution: 'platform', minutes: 5,
    blocks: [
      proc('خريطة الحل', ['أوازن المعادلة أولاً.', 'أحول الكتلة المعطاة إلى مولات بقسمتها على الكتلة المولية.', 'أستخدم نسبة المعاملات لانتقال من مادة إلى أخرى.', 'أحول مولات الناتج إلى كتلة أو حجم بحسب المطلوب.', 'أتحقق من الوحدة ومن معقولية النتيجة.']),
      tex(String.raw`m\xrightarrow{\div M}n\xrightarrow{\text{ratio}}n'\xrightarrow{\times22.4}V`, 'خريطة تعليمية من المنصة؛ الحجم في الشرطين النظاميين'),
    ],
  },
  {
    id: 'p46-enrichment-source', kind: 'source', title: "إثراء: جابر بن حيان", attribution: 'textbook', minutes: 3,
    source: sourceFor(132, 139),
    blocks: [
      q('L7-P46-E013'),
      image(jabirOriginal, '46', 'L7-P46-E014', 'الرسم الأصلي لجابر بن حيان بعمامة بيضاء ولحية بيضاء وثوب أصفر، جالساً إلى كتب مفتوحة.'),
      q('L7-P46-E015'),
      q('L7-P46-E016'),
      q('L7-P46-E017'),
      q('L7-P46-E018'),
      q('L7-P46-E019'),
      q('L7-P46-E020'),
    ],
  },
  {
    id: 'p47-summary-source', kind: 'summary', title: "تعلّمتُ: خلاصة الكتاب", attribution: 'textbook', minutes: 4,
    source: sourceFor(140, 148),
    blocks: [
      q('L7-P47-E001'),
      q('L7-P47-E002'),
      q('L7-P47-E003'),
      q('L7-P47-E004'),
      q('L7-P47-E005'),
      q('L7-P47-E006'),
      q('L7-P47-E007'),
      q('L7-P47-E008'),
      q('L7-P47-E009'),
    ],
  },
  {
    id: 'common-errors', kind: 'common-error', title: "أخطاء شائعة وكيف أتجنبها", attribution: 'platform', minutes: 4,
    blocks: [
      bullets(['الخلط بين عدد الجسيمات والكتلة: المول يحدد العدد، والكتلة المولية تربطه بالكتلة.', 'إهمال الدليل خارج القوس في Ca(OH)₂.', 'استخدام 22.4 L خارج الشرطين النظاميين دون مبرر.', 'استعمال معاملات معادلة غير موزونة.', 'نسبة افتراض حل من المنصة إلى نص الكتاب.']),
    ],
  },
  {
    id: 'p48-q1-source', kind: 'source', title: "أختبر نفسي: السؤال الأول", attribution: 'mixed', minutes: 4,
    source: sourceFor(149, 154),
    blocks: [
      q('L7-P48-E001'),
      q('L7-P48-E002'),
      q('L7-P48-E003'),
      ...ask('l7-p48-q1a'),
      ...ask('l7-p48-q1b'),
      ...ask('l7-p48-q1c'),
    ],
  },
  {
    id: 'p48-q2-q3-source', kind: 'source', title: "أختبر نفسي: السؤالان الثاني والثالث", attribution: 'mixed', minutes: 8,
    source: sourceFor(155, 167),
    blocks: [
      q('L7-P48-E007'),
      q('L7-P48-E008'),
      ...ask('l7-p48-q2a'),
      ...ask('l7-p48-q2b'),
      ...ask('l7-p48-q2c'),
      ...ask('l7-p48-q2d'),
      q('L7-P48-E013'),
      q('L7-P48-E014'),
      q('L7-P48-E015'),
      ...ask('l7-p48-q3a'),
      ...ask('l7-p48-q3b'),
      ...ask('l7-p48-q3c'),
      ...ask('l7-p48-q3d'),
    ],
  },
  {
    id: 'p48-q4-q6-source', kind: 'source', title: "أختبر نفسي: الأسئلة الرابع والخامس والسادس", attribution: 'mixed', minutes: 8,
    source: sourceFor(168, 176),
    blocks: [
      q('L7-P48-E020'),
      ...ask('l7-p48-q4'),
      q('L7-P48-E022'),
      ...ask('l7-p48-q5'),
      q('L7-P48-E024'),
      q('L7-P48-E025'),
      ...ask('l7-p48-q6a', 'l7-p48-q6b', 'l7-p48-q6c', 'l7-p48-q6d', 'l7-p48-q6e'),
      ...ask('l7-p48-q6f'),
      q('L7-P48-E028'),
    ],
  },
  {
    id: 'p49-zinc-source', kind: 'source', title: "السؤال السابع: المسألة الأولى — الزنك وحمض الكبريت", attribution: 'mixed', minutes: 7,
    source: sourceFor(177, 185),
    blocks: [
      q('L7-P49-E001'),
      q('L7-P49-E002'),
      q('L7-P49-E003'),
      q('L7-P49-E004'),
      { kind: 'chemical-equation', reactants: ['Zn', 'H2SO4'], products: ['ZnSO4', 'H2'], caption: 'ص49 — المعادلة المطبوعة دون وسوم حالة', attribution: 'textbook' },
      q('L7-P49-E006'),
      ...ask('l7-p49-zinc1'),
      ...ask('l7-p49-zinc2'),
      q('L7-P49-E009'),
    ],
  },
  {
    id: 'p49-methane-source', kind: 'source', title: "السؤال السابع: المسألة الثانية — احتراق الميثان", attribution: 'mixed', minutes: 10,
    source: sourceFor(186, 194),
    blocks: [
      q('L7-P49-E010'),
      q('L7-P49-E011'),
      q('L7-P49-E012'),
      ...ask('l7-p49-methane1'),
      ...ask('l7-p49-methane2'),
      ...ask('l7-p49-methane3'),
      ...ask('l7-p49-methane4'),
      ...ask('l7-p49-methane5'),
      q('L7-P49-E018'),
    ],
  },
  {
    id: 'p49-air-review', kind: 'explanation', title: "حل مطلوب الهواء: افتراض منصة معلن", attribution: 'platform', minutes: 5,
    blocks: [
      note('باعتبار أن نسبة الأكسجين في الهواء تقارب 21% حجماً', 'هذه النسبة إضافة علمية معتمدة من المنصة وليست معطى مطبوعاً في ص49. نستخدمها فقط لحساب حجم الهواء، مع تماثل شروط القياس.'),
      tex(String.raw`V(\mathrm{O_2})=4\times22.4=44.8\;\mathrm{L}`),
      tex(String.raw`V_{\text{air}}=\frac{44.8}{0.21}\approx213.3\;\mathrm{L}`),
      ...ask('l7-fc-4'),
    ],
  },
  {
    id: 'practice-foundations', kind: 'apply', title: "تدريب المنصة (1): المفاهيم والكتلة المولية", attribution: 'platform', minutes: 6,
    blocks: [
      ...ask('l7-practice-01','l7-practice-02','l7-practice-03','l7-practice-04'),
    ],
  },
  {
    id: 'practice-applications', kind: 'apply', title: "تدريب المنصة (2): التحويلات والحساب الكيميائي", attribution: 'platform', minutes: 7,
    blocks: [
      ...ask('l7-practice-05','l7-practice-06','l7-practice-07','l7-practice-08'),
    ],
  },
  {
    id: 'practice-reasoning', kind: 'apply', title: "تدريب المنصة (3): المقارنة والاستدلال", attribution: 'platform', minutes: 7,
    blocks: [
      ...ask('l7-practice-09','l7-practice-10','l7-practice-11','l7-practice-12'),
    ],
  },
  {
    id: 'synthesis', kind: 'summary', title: "بطاقة المراجعة قبل الاختبار", attribution: 'platform', minutes: 4,
    blocks: [
      { kind: 'key-terms', attribution: 'platform', terms: [{ term: 'المول', meaning: 'وحدة كمية مادة تحوي 6.022 × 10²³ جسيماً محدداً.' }, { term: 'الكتلة المولية', meaning: 'كتلة مول واحد؛ تربط الكتلة بعدد المولات عبر n = m/M.' }, { term: 'الحجم المولي', meaning: 'حجم مول واحد من غاز؛ يساوي 22.4 L عند 0°C و1 atm وفق الكتاب.' }, { term: 'نسبة المعادلة', meaning: 'نسبة المولات بين المواد في المعادلة الموزونة.' }] },
      ...ask('l7-practice-10'),
    ],
  },
  {
    id: 'final-test', kind: 'final-test', title: "الاختبار النهائي الشامل — الحساب الكيميائيّ", attribution: 'platform', minutes: 20,
    testId: finalTest.id,
    blocks: [
      
    ],
  },
]

export const chemistryLesson7: LessonDefinition = {
  id: 'chem-u1-l7', slug: 'chemical-calculations', title: 'الدرس السابع — الحساب الكيميائيّ', order: 7,
  status: 'source-verified',
  source: {
    verified: true,
    pages: Array.from({ length: 10 }, (_, index) => ({ page: String(index + 40), scanId: `image-${index + 1}.png` })),
    readability: { arabicText: 'partial', latinText: 'partial', equations: 'partial', numbers: 'partial', units: 'clear', tables: 'clear', diagrams: 'partial', experiments: 'clear', questions: 'clear', notes: '193 بنداً واضحاً وبند جزئي واحد: التسمية البيضاء المتداخلة في ميزان ص41. أُبقي الرسم الأصلي ولم يُخمن نصها. بقية النصوص والجداول والمعادلات والأسئلة مقروءة؛ انظر سجل المصدر وتقرير الاعتماد.' },
  },
  summary: 'المول والكتلة المولية والحجم المولي في الشرطين النظاميين، وتطبيقات الحساب الكيميائي كما وردت في صفحات الكتاب 40–49.',
  steps,
  tests: [bookAssessment, practiceAssessment, finalTest],
}
