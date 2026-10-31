import type { FinalTest, Question } from '@/assessment/types'
import type { ContentBlock } from './schema'
import type { Lesson7ObjectiveId } from './lesson7SourceLedger'
import { lesson7SourceText as t } from './lesson7SourceLedger'

/**
 * Printed questions for pp.40–49. Prompts are taken from the audited inventory;
 * answers and worked solutions are platform additions, never printed answers.
 * The p49 air-volume question keeps its exact printed prompt: the approved 21%
 * by-volume assumption appears only in the explicitly platform solution.
 */
const page = (number: string, item: string) => ({ page: number, item })
const proc = (items: string[]): ContentBlock => ({ kind: 'procedure', title: 'المعطيات ← القانون ← التعويض ← النتيجة ← التحقق', items, attribution: 'platform' })
const math = (tex: string, caption?: string): ContentBlock => ({ kind: 'formula', tex, display: 'block', caption, attribution: 'platform' })
const note = (text: string): ContentBlock => ({ kind: 'callout', tone: 'note', title: 'معطى حل من المنصة — ليس نصاً من الكتاب', text, attribution: 'platform' })

function short(id: string, p: string, item: string, prompt: string, answer: string, steps: string[], objectiveId: Lesson7ObjectiveId, extra: ContentBlock[] = []): Question {
  return {
    id, type: 'short-answer', origin: 'textbook', source: page(p, item), objectiveId,
    prompt, referenceAnswer: answer, rubric: steps,
    hint: 'اكتب الملاحظة أو الفكرة أولاً، ثم علّلها بمعطيات الصفحة وقانون الدرس.',
    explanation: 'إجابة مرجعية من إعداد المنصة؛ نص السؤال ومعطياته من الكتاب.',
    solutionBlocks: [proc(steps), ...extra],
  }
}

function numeric(id: string, p: string, item: string, prompt: string, answer: number, unit: string, steps: string[], equations: string[], objectiveId: Lesson7ObjectiveId, material: ContentBlock[] = [], extra: ContentBlock[] = [], tolerance = 0.001): Question {
  return {
    id, type: 'numerical', origin: 'textbook', source: page(p, item), objectiveId,
    prompt, acceptedAnswers: [answer], tolerance, unit,
    acceptedUnits: unit === 'g' ? ['غ', 'غرام', 'g'] : unit === 'L' ? ['ل', 'لتر', 'L'] : unit === 'mol' ? ['مول', 'mol'] : [],
    hint: 'حدّد المعطيات والمطلوب، ثم اختر العلاقة المناسبة وانتبه إلى الوحدة.',
    material, explanation: 'الحل التفصيلي من إعداد المنصة استناداً إلى معطيات السؤال المطبوعة.',
    solutionBlocks: [proc(steps), ...equations.map((tex) => math(tex)), ...extra],
  }
}

export const bookActivitySolutions: Question[] = [
  short('l7-p40-q1', '40', t('L7-P40-E018'), t('L7-P40-E019'), 'في الدزينة 12 قلماً.', ['الدزينة وحدة عدّ تساوي 12 شيئاً.', 'إذن عدد الأقلام في دزينة واحدة هو 12.'], 'O1'),
  short('l7-p40-q2', '40', t('L7-P40-E018'), t('L7-P40-E020'), 'في خمس دزينات 60 قلماً.', ['المعطى: 5 دزينات، وكل دزينة 12 قلماً.', 'الحساب: 5 × 12 = 60 قلماً.', 'التحقق: 60 ÷ 12 = 5 دزينات.'], 'O1'),
  short('l7-p40-q3', '40', t('L7-P40-E018'), t('L7-P40-E021'), 'يشكل 120 قلماً عشر دزينات.', ['نحوّل عدد الأقلام إلى دزينات بالقسمة على 12.', '120 ÷ 12 = 10 دزينات.'], 'O1'),
  short('l7-p40-q4', '40', t('L7-P40-E018'), t('L7-P40-E022'), 'يمكن من حيث المبدأ عدّ الحبات، لكنه غير عملي لكبر عددها وصغرها؛ لذلك نستخدم وحدات قياس كمية مناسبة بدل عدّ كل حبة.', ['أفرّق بين إمكان العدّ نظرياً وصعوبته عملياً.', 'كبر العدد يجعل العدّ الفردي مرهقاً، فنلجأ إلى وحدة كمية مثل الكتلة.'], 'O1'),
  short('l7-p40-q5', '40', t('L7-P40-E018'), t('L7-P40-E023'), 'لا أستطيع عدّها عملياً؛ فالذرات والجزيئات متناهية الصغر وأعدادها هائلة، حتى في كمية صغيرة من المادة.', ['الملاحظة: المسمار وكوب الماء يحتويان أعداداً هائلة من الجسيمات.', 'التفسير: صغر الجسيمات وكثرة عددها يجعلان العدّ الفردي غير ممكن عملياً.', 'الاستنتاج: نحتاج وحدة عدّ جماعية'], 'O1'),
  short('l7-p40-q6', '40', t('L7-P40-E018'), t('L7-P40-E024'), 'أسمّي العدد المحدد من الجسيمات «مولاً»، وكتلة هذا العدد «الكتلة المولية».', ['المول وحدة لقياس كمية المادة بعدد محدد من الجسيمات.', 'كتلة مول واحد من جسيمات المادة هي كتلتها المولية.'], 'O1'),
  {
    id: 'l7-p43-table-nh3', type: 'fill-blank', origin: 'textbook', source: page('43', 'جدول النشاط — NH₃'), objectiveId: 'O2',
    prompt: t('L7-P43-E002'), material: [{ kind: 'chemical-formula', formula: 'NH3', caption: 'صف النشادر في جدول ص43', attribution: 'textbook' }],
    template: 'العنصر الأول: {first}؛ العنصر الثاني: {second}؛ المجموع: {sum}؛ الكتلة المولية (g·mol⁻¹): {molar}.',
    blanks: [
      { id: 'first', acceptedAnswers: ['14 × 1', '14×1', '14 * 1', '14'] },
      { id: 'second', acceptedAnswers: ['1 × 3', '1×3', '1 * 3', '3'] },
      { id: 'sum', acceptedAnswers: ['14 + 3', '14+3', '17'] },
      { id: 'molar', kind: 'number', acceptedAnswers: ['17'] },
    ],
    hint: 'في NH₃ ذرة نتروجين واحدة وثلاث ذرات هيدروجين.',
    explanation: 'إكمال الجدول من المنصة: 14 × 1، ثم 1 × 3، فالمجموع 17 والكتلة المولية 17 g·mol⁻¹.',
    solutionBlocks: [proc(['المعطيات: N = 14 وH = 1 من جدول ص42.', 'القانون: مجموع الكتلة الذرية لكل عنصر مضروبة في عدد ذراته.', 'التعويض: 14 × 1 + 1 × 3 = 17.', 'التحقق: الصف المحلول للماء يستخدم الطريقة نفسها.']), math('M(\\mathrm{NH_3})=14+3=17\\;\\mathrm{g\\,mol^{-1}}')],
  },
  {
    id: 'l7-p43-table-ch4', type: 'fill-blank', origin: 'textbook', source: page('43', 'جدول النشاط — CH₄'), objectiveId: 'O2',
    prompt: t('L7-P43-E002'), material: [{ kind: 'chemical-formula', formula: 'CH4', caption: 'صف الميثان في جدول ص43؛ خانة 1 × 4 مطبوعة', attribution: 'textbook' }],
    template: 'العنصر الأول: {first}؛ العنصر الثاني (مطبوع): 1 × 4؛ المجموع: {sum}؛ الكتلة المولية (g·mol⁻¹): {molar}.',
    blanks: [
      { id: 'first', acceptedAnswers: ['12 × 1', '12×1', '12 * 1', '12'] },
      { id: 'sum', acceptedAnswers: ['12 + 4', '12+4', '16'] },
      { id: 'molar', kind: 'number', acceptedAnswers: ['16'] },
    ],
    hint: 'الخانة المطبوعة 1 × 4 تمثل الهيدروجين؛ احسب خانة الكربون والمجموع.',
    explanation: 'إكمال من المنصة: 12 × 1 للكربون، و1 × 4 للهيدروجين، فالمجموع 16 والكتلة المولية 16 g·mol⁻¹.',
    solutionBlocks: [proc(['المعطيات: C = 12 وH = 1.', 'القانون: مجموع مساهمات العناصر في الصيغة.', 'التعويض: 12 × 1 + 1 × 4 = 16.', 'التحقق: أربع ذرات هيدروجين تساهم بـ4 وحدات كتلة.']), math('M(\\mathrm{CH_4})=12+4=16\\;\\mathrm{g\\,mol^{-1}}')],
  },
  numeric('l7-p43-act1', '43', 'نشاط ص43 — ١', t('L7-P43-E016'), 98, 'g/mol', ['المعطيات: H = 1، S = 32، O = 16.', 'القانون: M مجموع الكتل الذرية موزونة بأعداد الذرات.', 'التعويض: 2 × 1 + 32 + 4 × 16 = 98.', 'التحقق: الأكسجين يساهم بـ64، ومجموع المساهمات 2 + 32 + 64 = 98.'], ['M(\\mathrm{H_2SO_4})=2(1)+32+4(16)=98\\;\\mathrm{g\\,mol^{-1}}'], 'O2', [], [], 0.001),
  numeric('l7-p43-act2', '43', 'نشاط ص43 — ٢', t('L7-P43-E017'), 36, 'g', ['المعطيات: n = 2 mol، وM(H₂O) = 18 g·mol⁻¹.', 'القانون: m = n × M.', 'التعويض: m = 2 × 18 = 36 g.', 'التحقق: 36 ÷ 18 = 2 mol.'], ['m=nM=2\\times18=36\\;\\mathrm{g}'], 'O2'),
  numeric('l7-p43-act3', '43', 'نشاط ص43 — ٣', t('L7-P43-E018'), 4, 'mol', ['المعطيات: m = 68 g، وM(NH₃) = 17 g·mol⁻¹.', 'القانون: n = m/M.', 'التعويض: n = 68/17 = 4 mol.', 'التحقق: 4 × 17 = 68 g.'], ['n=\\frac{m}{M}=\\frac{68}{17}=4\\;\\mathrm{mol}'], 'O2'),
  short('l7-p44-q1', '44', 'أتأمل وأجيب — 1', t('L7-P44-E008'), 'درجة الحرارة في التجارب الثلاث 273 K؛ ألاحظ أنها متساوية.', ['أقرأ ميزان الحرارة في كل أسطوانة: 273 K.', 'أقارن القراءات فأجدها متماثلة.'], 'O3'),
  short('l7-p44-q2', '44', 'أتأمل وأجيب — 2', t('L7-P44-E009'), 'الضغط المطبق على الغازات الثلاثة 1 atm؛ ألاحظ أنه متساوٍ.', ['أقرأ وسم الضغط أعلى كل أسطوانة: P = 1 atm.', 'أستنتج أن التجارب أجريت عند الضغط نفسه.'], 'O3'),
  short('l7-p44-q3', '44', 'أتأمل وأجيب — 3', t('L7-P44-E010'), 'الكتل المولية مختلفة: الهليوم 4.0 g، والأكسجين 32.0 g، والنتروجين 28.0 g لمول واحد.', ['أسجل الكتل المطبوعة لمول واحد من كل غاز.', 'أقارن: 4.0 و32.0 و28.0 g ليست متساوية.'], 'O3'),
  short('l7-p44-q4', '44', 'أتأمل وأجيب — 4', t('L7-P44-E011'), 'حجم مول واحد من الغازات الثلاثة متساوٍ ويساوي 22.4 L عند 273 K و1 atm، رغم اختلاف كتلها المولية.', ['الملاحظة: V = 22.4 L لكل من He وO₂ وN₂.', 'الشروط: الحرارة والضغط متماثلان، وكمية كل غاز مول واحد.', 'الاستنتاج: الحجوم المتساوية في الشروط نفسها تحتوي أعداداً متساوية من المولات.'], 'O3'),
]

const q2Prompt = t('L7-P48-E008')
const q3Prompt = t('L7-P48-E015')
const formulaMaterial = (formula: string): ContentBlock[] => [{ kind: 'chemical-formula', formula, attribution: 'textbook' }]

export const bookQuestions: Question[] = [
  {
    id: 'l7-p48-q1a', type: 'fill-blank', origin: 'textbook', source: page('48', 'السؤال الأول — الفراغ الأول'), objectiveId: 'O2',
    prompt: t('L7-P48-E003'), template: 'مجموع الكتل الموليّة الذرّية المكونة للجزيء يُسمّى {answer}.',
    blanks: [{ id: 'answer', acceptedAnswers: ['الكتلة المولية', 'الكتلة الموليّة', 'الكتلة المولية (الجزيئية)', 'الكتلة الموليّة (الجزيئية)'] }],
    explanation: 'الكتلة المولية (الجزيئية) هي مجموع الكتل المولية الذرية المكونة للجزيء.',
    solutionBlocks: [proc(['أرجع إلى تعريف الكتلة المولية في ص41 وبند الخلاصة في ص47.', 'المجموع المذكور هو الكتلة المولية (الجزيئية).'])],
  },
  {
    id: 'l7-p48-q1b', type: 'fill-blank', origin: 'textbook', source: page('48', 'السؤال الأول — الفراغ الثاني'), objectiveId: 'O3',
    prompt: t('L7-P48-E003'), template: 'الحجم المولي هو حجم {answer} من أي غاز مقاساً في الشرطين النظاميين.',
    blanks: [{ id: 'answer', acceptedAnswers: ['واحد مول', 'مول واحد', '1 mol'] }],
    explanation: 'الحجم المولي هو حجم مول واحد من الغاز في شروط التجربة.',
    solutionBlocks: [proc(['أستخدم تعريف الحجم المولي في خلاصة ص47.', 'الكمية التي يقابلها الحجم المولي هي مول واحد.'])],
  },
  {
    id: 'l7-p48-q1c', type: 'fill-blank', origin: 'textbook', source: page('48', 'السؤال الأول — الفراغ الثالث'), objectiveId: 'O3',
    prompt: t('L7-P48-E003'), template: 'الحجوم المتساوية من غازات مختلفة تحوي أعداداً {answer} من المولات، في الشروط نفسها.',
    blanks: [{ id: 'answer', acceptedAnswers: ['متساوية', 'متساويه', 'متساويةً'] }],
    explanation: 'في الشروط نفسها تتناسب حجوم الغازات مع أعداد مولاتها؛ فالحجوم المتساوية تقابل أعداداً متساوية من المولات.',
    solutionBlocks: [proc(['أثبت درجة الحرارة والضغط.', 'من V = n × 22.4 في الشرطين النظاميين، تساوي V يعني تساوي n.'])],
  },
  numeric('l7-p48-q2a', '48', 'السؤال الثاني — a', q2Prompt, 63, 'g/mol', ['المعطيات: H = 1، N = 14، O = 16.', 'القانون: مجموع الكتل الذرية × أعداد الذرات.', 'التعويض: 1 + 14 + 3 × 16 = 63.', 'التحقق: 3 ذرات أكسجين تساهم بـ48.'], ['M(\\mathrm{HNO_3})=1+14+3(16)=63\\;\\mathrm{g\\,mol^{-1}}'], 'O2', formulaMaterial('HNO3')),
  numeric('l7-p48-q2b', '48', 'السؤال الثاني — b', q2Prompt, 142, 'g/mol', ['المعطيات: Na = 23، S = 32، O = 16.', 'التعويض: 2 × 23 + 32 + 4 × 16 = 142.', 'التحقق: 46 + 32 + 64 = 142.'], ['M(\\mathrm{Na_2SO_4})=2(23)+32+4(16)=142\\;\\mathrm{g\\,mol^{-1}}'], 'O2', formulaMaterial('Na2SO4')),
  numeric('l7-p48-q2c', '48', 'السؤال الثاني — c', q2Prompt, 74, 'g/mol', ['المعطيات: Ca = 40، O = 16، H = 1.', 'الدليل 2 خارج القوس يوزع على O وH.', 'التعويض: 40 + 2 × (16 + 1) = 74.', 'التحقق: مساهمة مجموعتي OH هي 34.'], ['M(\\mathrm{Ca(OH)_2})=40+2(16+1)=74\\;\\mathrm{g\\,mol^{-1}}'], 'O2', formulaMaterial('Ca(OH)2')),
  numeric('l7-p48-q2d', '48', 'السؤال الثاني — d', q2Prompt, 40, 'g/mol', ['المعطيات: Na = 23، O = 16، H = 1.', 'التعويض: 23 + 16 + 1 = 40.', 'التحقق: كل عنصر يظهر مرة واحدة في الصيغة.'], ['M(\\mathrm{NaOH})=23+16+1=40\\;\\mathrm{g\\,mol^{-1}}'], 'O2', formulaMaterial('NaOH')),
  numeric('l7-p48-q3a', '48', 'السؤال الثالث — a', q3Prompt, 44.8, 'L', ['المعطى: 2 mol من H₂ في الشرطين النظاميين.', 'القانون: V = n × 22.4.', 'التعويض: 2 × 22.4 = 44.8 L.', 'التحقق: ضعف حجم المول الواحد.'], ['V=2\\times22.4=44.8\\;\\mathrm{L}'], 'O3', formulaMaterial('2H2')),
  numeric('l7-p48-q3b', '48', 'السؤال الثالث — b', q3Prompt, 67.2, 'L', ['المعطى: 3 mol من SO₂.', 'التعويض: V = 3 × 22.4 = 67.2 L.', 'التحقق: ثلاثة أمثال الحجم المولي.'], ['V=3\\times22.4=67.2\\;\\mathrm{L}'], 'O3', formulaMaterial('3SO2')),
  numeric('l7-p48-q3c', '48', 'السؤال الثالث — c', q3Prompt, 112, 'L', ['المعطى: 5 mol من O₂.', 'التعويض: V = 5 × 22.4 = 112 L.', 'التحقق: 112 ÷ 22.4 = 5.'], ['V=5\\times22.4=112\\;\\mathrm{L}'], 'O3', formulaMaterial('5O2')),
  numeric('l7-p48-q3d', '48', 'السؤال الثالث — d', q3Prompt, 224, 'L', ['المعطى: 10 mol من N₂.', 'التعويض: V = 10 × 22.4 = 224 L.', 'التحقق: عشرة أمثال الحجم المولي.'], ['V=10\\times22.4=224\\;\\mathrm{L}'], 'O3', formulaMaterial('10N2')),
  numeric('l7-p48-q4', '48', 'السؤال الرابع', t('L7-P48-E021'), 280, 'g', ['المعطيات: n = 5 mol، Ca = 40، O = 16.', 'أحسب M(CaO) = 40 + 16 = 56 g·mol⁻¹.', 'القانون: m = nM = 5 × 56 = 280 g.', 'التحقق: 280 ÷ 56 = 5 mol.'], ['M(\\mathrm{CaO})=56\\;\\mathrm{g\\,mol^{-1}}', 'm=5\\times56=280\\;\\mathrm{g}'], 'O2'),
  numeric('l7-p48-q5', '48', 'السؤال الخامس', t('L7-P48-E023'), 3, 'mol', ['المعطيات: m = 51 g، N = 14، H = 1.', 'M(NH₃) = 14 + 3 = 17 g·mol⁻¹.', 'n = m/M = 51/17 = 3 mol.', 'التحقق: 3 × 17 = 51 g.'], ['n=\\frac{51}{17}=3\\;\\mathrm{mol}'], 'O2'),
  numeric('l7-p48-q6a', '48', 'السؤال السادس — 1 / CO₂', t('L7-P48-E025'), 22.4, 'L', ['المعامل غير المكتوب قبل CO₂ يساوي 1.', 'V = 1 × 22.4 = 22.4 L.'], ['V=22.4\\;\\mathrm{L}'], 'O3', formulaMaterial('CO2')),
  numeric('l7-p48-q6b', '48', 'السؤال السادس — 1 / 5SO₂', t('L7-P48-E025'), 112, 'L', ['المعامل 5 يعني 5 mol.', 'V = 5 × 22.4 = 112 L.'], ['V=5\\times22.4=112\\;\\mathrm{L}'], 'O3', formulaMaterial('5SO2')),
  numeric('l7-p48-q6c', '48', 'السؤال السادس — 1 / 2O₂', t('L7-P48-E025'), 44.8, 'L', ['المعامل 2 يعني 2 mol.', 'V = 2 × 22.4 = 44.8 L.'], ['V=2\\times22.4=44.8\\;\\mathrm{L}'], 'O3', formulaMaterial('2O2')),
  numeric('l7-p48-q6d', '48', 'السؤال السادس — 1 / 4NO', t('L7-P48-E025'), 89.6, 'L', ['المعامل 4 يعني 4 mol.', 'V = 4 × 22.4 = 89.6 L.'], ['V=4\\times22.4=89.6\\;\\mathrm{L}'], 'O3', formulaMaterial('4NO')),
  numeric('l7-p48-q6e', '48', 'السؤال السادس — 1 / 3CH₄', t('L7-P48-E025'), 67.2, 'L', ['المعامل 3 يعني 3 mol.', 'V = 3 × 22.4 = 67.2 L.'], ['V=3\\times22.4=67.2\\;\\mathrm{L}'], 'O3', formulaMaterial('3CH4')),
  numeric('l7-p48-q6f', '48', 'السؤال السادس — 2', t('L7-P48-E027'), 234, 'g', ['المعطيات: n = 4 mol، Na = 23، Cl = 35.5.', 'M(NaCl) = 23 + 35.5 = 58.5 g·mol⁻¹.', 'm = 4 × 58.5 = 234 g.', 'التحقق: 234 ÷ 4 = 58.5.'], ['M(\\mathrm{NaCl})=58.5\\;\\mathrm{g\\,mol^{-1}}', 'm=4\\times58.5=234\\;\\mathrm{g}'], 'O2'),
  numeric('l7-p49-zinc1', '49', 'المسألة الأولى — المطلوب 1', t('L7-P49-E007'), 16.1, 'g', ['المعطيات: m(Zn) = 6.5 g، M(Zn) = 65، وM(ZnSO₄) = 65 + 32 + 4 × 16 = 161 g·mol⁻¹.', 'عدد مولات الزنك: 6.5/65 = 0.1 mol.', 'من المعادلة الموزونة نسبة Zn إلى ZnSO₄ هي 1 : 1، فتتكون 0.1 mol من الملح.', 'الكتلة: 0.1 × 161 = 16.1 g.', 'التحقق: كتلة الملح تساوي عُشر كتلته المولية.'], ['n(\\mathrm{Zn})=\\frac{6.5}{65}=0.1\\;\\mathrm{mol}', 'm(\\mathrm{ZnSO_4})=0.1\\times161=16.1\\;\\mathrm{g}'], 'O4'),
  numeric('l7-p49-zinc2', '49', 'المسألة الأولى — المطلوب 2', t('L7-P49-E008'), 2.24, 'L', ['نسبة Zn إلى H₂ في المعادلة 1 : 1.', 'n(H₂) = n(Zn) = 0.1 mol.', 'في الشرطين النظاميين: V = 0.1 × 22.4 = 2.24 L.', 'التحقق: عُشر مول يشغل عُشر الحجم المولي.'], ['V(\\mathrm{H_2})=0.1\\times22.4=2.24\\;\\mathrm{L}'], 'O4'),
  short('l7-p49-methane1', '49', 'المسألة الثانية — المطلوب 1', t('L7-P49-E013'), 'CH₄ + 2O₂ ⟶ CO₂ + 2H₂O', ['أكتب المتفاعلات CH₄ وO₂ والناتجين CO₂ وH₂O.', 'أوازن الكربون: ذرة واحدة في الطرفين.', 'أوازن الهيدروجين: معامل 2 أمام الماء يعطي 4 ذرات H.', 'أوازن الأكسجين: 2 في CO₂ و2 في 2H₂O، فالمجموع 4؛ أضع معامل 2 أمام O₂.', 'التحقق: C = 1، H = 4، O = 4 في الطرفين.'], 'O4', [{ kind: 'chemical-equation', reactants: ['CH4', '2O2'], products: ['CO2', '2H2O'], caption: 'المعادلة الموزونة — حل من المنصة', attribution: 'platform' }]),
  numeric('l7-p49-methane2', '49', 'المسألة الثانية — المطلوب 2', t('L7-P49-E014'), 4, 'mol', ['M(CH₄) = 12 + 4 = 16 g·mol⁻¹.', 'n(CH₄) = 32/16 = 2 mol.', 'من المعادلة الموزونة يحتاج كل مول ميثان مولين من O₂.', 'n(O₂) = 2 × 2 = 4 mol.', 'التحقق: نسبة الميثان إلى الأكسجين 1 : 2.'], ['n(\\mathrm{CH_4})=\\frac{32}{16}=2\\;\\mathrm{mol}', 'n(\\mathrm{O_2})=2\\times2=4\\;\\mathrm{mol}'], 'O4'),
  numeric('l7-p49-methane3', '49', 'المسألة الثانية — المطلوب 3', t('L7-P49-E015'), 72, 'g', ['نسبة CH₄ إلى H₂O هي 1 : 2.', 'n(H₂O) = 2 × 2 = 4 mol.', 'M(H₂O) = 18 g·mol⁻¹.', 'm = 4 × 18 = 72 g.', 'التحقق: 72 ÷ 18 = 4 mol.'], ['m(\\mathrm{H_2O})=4\\times18=72\\;\\mathrm{g}'], 'O4'),
  numeric('l7-p49-methane4', '49', 'المسألة الثانية — المطلوب 4', t('L7-P49-E016'), 44.8, 'L', ['نسبة CH₄ إلى CO₂ هي 1 : 1.', 'n(CO₂) = 2 mol.', 'V = 2 × 22.4 = 44.8 L في الشرطين النظاميين.'], ['V(\\mathrm{CO_2})=2\\times22.4=44.8\\;\\mathrm{L}'], 'O4'),
  numeric('l7-p49-methane5', '49', 'المسألة الثانية — المطلوب 5', t('L7-P49-E017'), 213.3, 'L', ['معطى كتابي محسوب: حجم الأكسجين اللازم = 4 × 22.4 = 44.8 L.', 'معطى منصة معتمد: نسبة الأكسجين في الهواء تقارب 21% حجماً.', 'نفترض تماثل شروط قياس الهواء والأكسجين، فنقسم حجم الأكسجين على 0.21.', 'V(air) = 44.8/0.21 ≈ 213.3 L.', 'التحقق: 213.3 × 0.21 ≈ 44.8 L. النتيجة تقريبية لأن النسبة تقريبية.'], ['V(\\mathrm{O_2})=4\\times22.4=44.8\\;\\mathrm{L}', 'V_{\\text{air}}=\\frac{44.8}{0.21}\\approx213.3\\;\\mathrm{L}'], 'O4', [], [note('باعتبار أن نسبة الأكسجين في الهواء تقارب 21% حجماً، وهي إضافة علمية من المنصة وليست معطى مطبوعاً في نص السؤال.')], 0.1),
]

export const lesson7BookQuestionIds = [...bookActivitySolutions, ...bookQuestions].map((question) => question.id)
export const lesson7BookQuestionCount = lesson7BookQuestionIds.length
export const bookAssessment: FinalTest = {
  id: 'chem-u1-l7-book', lessonId: 'chem-u1-l7', origin: 'platform', status: 'source-verified',
  targetQuestionCount: { min: lesson7BookQuestionCount, max: lesson7BookQuestionCount },
  requireComplete: false, questions: [...bookActivitySolutions, ...bookQuestions],
}
