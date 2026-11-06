import type { ContentBlock, LessonExtra } from './schema'

// Board transcription resolved by the user's final instructions, not textbook
// material. In particular, retain Fe I=1 and Fe II=2 without silent correction.
// `platform` marks the non-textbook wrapper; visible provenance below distinguishes
// the supplied board text from the separately authored scientific clarification.
const valenceTable = (
  caption: string,
  entries: Array<[id: string, name: string, symbol: string, valence: string]>,
): ContentBlock => ({
  kind: 'table',
  caption,
  attribution: 'platform',
  columns: [
    { key: 'name', header: 'العنصر', rowHeader: true },
    { key: 'symbol', header: 'الرمز والتمييز الوارد في النقل' },
    { key: 'valence', header: 'التكافؤ المنقول' },
  ],
  rows: entries.map(([id, name, symbol, valence]) => ({ id, cells: { name, symbol, valence } })),
})

export const chemistryLesson2Extra: LessonExtra = {
  title: 'إضافي',
  sourceNote: 'نقل من السبورة مع اعتماد توضيحات المستخدم النهائية. هذا المحتوى مستقل عن نص الكتاب ودفتر الطالب؛ أما الشرح العلمي من المنصة فمفصول أدناه بعنوان «توضيح إضافي».',
  sections: [
    {
      id: 'valence-definition',
      title: 'تعريف التكافؤ',
      blocks: [
        {
          kind: 'definition',
          term: 'التكافؤ',
          text: 'هو عدد الإلكترونات التي تفقدها أو تكتسبها أو تشترك بها الذرة أثناء تفاعلها لتصل لحالة الاستقرار',
          attribution: 'platform',
        },
      ],
    },
    {
      id: 'metals',
      title: 'جدول تكافؤ الفلزات',
      blocks: [
        valenceTable('تكافؤ الفلزات — نقل من السبورة وفق القيم المعتمدة', [
          ['na', 'صوديوم', 'Na', '1'],
          ['k', 'بوتاسيوم', 'K', '1'],
          ['ag', 'فضة', 'Ag', '1'],
          ['au', 'ذهب', 'Au', '1'],
          ['hg', 'زئبق', 'Hg', '1'],
          ['cu-i', 'نحاس أحادي', 'Cu I', '1'],
          ['cu-ii', 'نحاس ثنائي', 'Cu II', '2'],
          ['mg', 'مغنزيوم', 'Mg', '2'],
          ['ca', 'كالسيوم', 'Ca', '2'],
          ['ba', 'باريوم', 'Ba', '2'],
          ['pb', 'رصاص', 'Pb', '2'],
          ['zn', 'زنك', 'Zn', '2'],
          ['al', 'ألمنيوم', 'Al', '3'],
          ['fe-i', 'حديد — التمييز I كما نُقل', 'Fe I', '1'],
          ['fe-ii', 'حديد — التمييز II كما نُقل', 'Fe II', '2'],
        ]),
        {
          kind: 'callout', tone: 'note', title: 'ملاحظة السبورة — الفلزات',
          text: 'يدلنا التكافؤ على عدد الالكترونات المفقودة لذلك نعتبر المعادن أيونات موجبة',
          attribution: 'platform',
        },
      ],
    },
    {
      id: 'nonmetals',
      title: 'جدول تكافؤ اللافلزات',
      blocks: [
        valenceTable('تكافؤ اللافلزات — نقل من السبورة وفق القيم المعتمدة', [
          ['cl', 'كلور', 'Cl', '1'],
          ['br', 'بروم', 'Br', '1'],
          ['f', 'فلور', 'F', '1'],
          ['h', 'هيدروجين', 'H', '1'],
          ['o', 'أكسجين', 'O', '2'],
          ['s', 'كبريت', 'S', '2'],
          ['n', 'آزوت', 'N', '3'],
          ['p', 'فوسفور', 'P', '3'],
          ['c', 'كربون', 'C', '2 و4'],
        ]),
        {
          kind: 'callout', tone: 'note', title: 'ملاحظة السبورة — اللافلزات',
          text: 'يدلنا التكافؤ على عدد الالكترونات المكتسبة فتعتبر اللامعادن أيونات سالبة',
          attribution: 'platform',
        },
      ],
    },
  ],
  clarification: [
    {
      kind: 'callout', tone: 'warning', title: 'نطاق الملاحظتين',
      text: 'الملاحظتان المنقولتان تتعلقان بتكوّن الأيونات بالفقد والاكتساب في الأمثلة الأيونية، وليستا حكماً بأن كل فلز أو لا فلز أيون دائماً. في الرابطة المشتركة تحدث مشاركة؛ راجع شرح الدرس من الروابط أدناه بدلاً من تكراره هنا.',
      attribution: 'platform',
    },
    {
      kind: 'callout', tone: 'method', title: 'اقرأ الأعداد دون خلط',
      text: 'التكافؤ ليس عدد إلكترونات السطح، ولا الرقم السفلي الذي يبيّن عدد الذرات أو نسبتها في الصيغة، ولا شحنة تُكتب تلقائياً بإشارة. الرموز Cu وFe هي رموز العناصر؛ والأرقام الرومانية ليست جزءاً منها. في تسمية المركبات تحدد الأرقام الرومانية حالة التأكسد، فلا نساويها دائماً بالتكافؤ. عند تعدد القيم نرجع إلى اسم المركب أو صيغته وبيانات السؤال، ولا نختار قيمة عشوائياً من الجدول.',
      attribution: 'platform',
    },
    {
      kind: 'callout', tone: 'warning', title: 'الحديد: تمييز النقل عن المعلومة العلمية',
      text: 'أُبقيت القيمتان Fe I = 1 وFe II = 2 كما اعتمدهما المستخدم في نقل السبورة، دون استبدال. هذا لا يجعلهما الزوج المدرسي الشائع للحديد: في أمثلة المركبات المعتادة يُدرَس الحديد الثنائي والثلاثي. هذا تنبيه علمي من المنصة وليس نصاً من السبورة، ولا يُغيّر القيم المنقولة أعلاه.',
      attribution: 'platform',
    },
  ],
  relatedStepIds: ['atoms-and-shells', 'nonmetals-and-comparison', 'bond-meaning', 'ionic-ratio-example', 'research-case'],
}
