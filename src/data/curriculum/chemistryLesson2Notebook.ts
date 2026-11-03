import type { StudentNotebook } from './schema'

/* ============================================================================
   «دفتر الطالب» — Lesson 2 «الروابط الكيميائية» (ص13–17)
   ----------------------------------------------------------------------------
   This is a selection of printed notes, not a second copy of the lesson:
   complete «تعلّمُ» definitions, printed properties, electron-transfer data,
   the three printed diatomic Lewis examples, and the printed compound list.
   Questions, answers, worked solutions, and review prompts are deliberately
   excluded. The formula-reading line is the single authorized platform note
   and is visibly labelled where the student sees it.

   Source basis: the documented transcription and lesson-2 source ledger. The
   original page scans were not directly inspected for this notebook review;
   `source.verified` therefore remains false rather than implying a visual check.
   ========================================================================= */

const printedPages = ['13', '14', '15', '16', '17'].map((page) => ({ page }))

export const chemistryLesson2StudentNotebook: StudentNotebook = {
  title: 'الروابط الكيميائية — مادة الدفتر المدرسي',
  introduction: 'مادة الدفتر المدرسي للدرس «الروابط الكيميائية».',
  source: {
    pages: printedPages,
    verified: false,
    readability: {
      notes: 'أُعدّ اعتماداً على التفريغ الموثق وسجل المصدر؛ صور الصفحات الأصلية لم تُعاين مباشرة في هذه المراجعة.',
    },
  },
  sections: [
    {
      id: 'keywords-and-symbols',
      title: 'الكلمات المفتاحية والرموز',
      points: [
        'الكلمات المفتاحية: رابطة كيميائيّة – رابطة أيونيّة – رابطة مشتركة.',
        'أنواع الروابط الكيميائية: الرابطة الأيونية والرابطة المشتركة.',
      ],
      notes: [
        { text: 'O₂', notation: 'formula' },
        { text: 'NaCl', notation: 'formula' },
        { text: 'C', notation: 'formula' },
        { text: 'H₂O', notation: 'formula' },
      ],
    },
    {
      id: 'formula-reading',
      title: 'قراءة الصيغ الكيميائية',
      source: 'توضيح ضروري من المنصة — ليس نصاً من الكتاب',
      notes: [
        {
          text: 'الحرف اللاتيني الكبير (أو الكبير متبوعاً بصغير مثل Na وCl) يدلّ على نوع العنصر، والرقم الصغير السفلي على يمين الرمز يدلّ على عدد ذرّات ذلك العنصر وحده: ففي H₂O ذرّتا هيدروجين وذرّة أكسجين واحدة.',
        },
      ],
    },
    {
      id: 'ionic-transfer',
      title: 'انتقال الإلكترون بين الصوديوم والكلور',
      points: [
        'عند ارتباط الصّوديوم مع الكلور تفقد ذرّة الصّوديوم إلكترونًا واحدًا متحوّلةً إلى أيون الصّوديوم Na⁺ بينما تكسب ذرّة الكلور ذلك الإلكترون متحوّلةً إلى أيون الكلوريد Cl⁻ وتتحقّق بذلك قاعدة الثمانية لكليهما.',
        'تتجاذب أيونات الصّوديوم الموجبة Na⁺ مع أيونات الكلور السّالبة Cl⁻ لتشكيل جزيئات كلوريد الصّوديوم على شكل بلورات صلبة NaCl (ملح الطعام) المتعادل كهربائيًا.',
      ],
      table: {
        caption: 'أعداد الإلكترونات والتوزّع الإلكتروني في شكل انتقال الإلكترون (ص14)',
        columns: [
          { key: 'particle', header: 'الجسيم', rowHeader: true },
          { key: 'electrons', header: 'عدد الإلكترونات' },
          { key: 'configuration', header: 'التوزّع الإلكتروني' },
        ],
        rows: [
          { id: 'sodium-atom', cells: { particle: 'ذرّة الصّوديوم Na', electrons: '11', configuration: '2-8-1' } },
          { id: 'chlorine-atom', cells: { particle: 'ذرّة الكلور Cl', electrons: '17', configuration: '2-8-7' } },
          { id: 'sodium-ion', cells: { particle: 'أيون الصّوديوم Na⁺', electrons: '10', configuration: '2-8' } },
          { id: 'chloride-ion', cells: { particle: 'أيون الكلوريد Cl⁻', electrons: '18', configuration: '2-8-8' } },
        ],
      },
    },
    {
      id: 'lewis-examples',
      title: 'تمثيلات لويس المطبوعة',
      lewisMolecules: [
        {
          id: 'h2',
          formula: 'H2',
          left: { symbol: 'H' },
          right: { symbol: 'H' },
          sharedPairs: 1,
        },
        {
          id: 'o2',
          formula: 'O2',
          left: { symbol: 'O', lonePairSides: ['left', 'bottom'] },
          right: { symbol: 'O', lonePairSides: ['right', 'bottom'] },
          sharedPairs: 2,
        },
        {
          id: 'n2',
          formula: 'N2',
          left: { symbol: 'N', lonePairSides: ['left'] },
          right: { symbol: 'N', lonePairSides: ['right'] },
          sharedPairs: 3,
        },
      ],
    },
    {
      id: 'compound-properties',
      title: 'خواص المركّبات',
      table: {
        caption: 'الخواص المطبوعة في صندوق «إضاءة» (ص15–16)',
        columns: [
          { key: 'bond', header: 'الرابطة', rowHeader: true },
          { key: 'properties', header: 'خواص المركّبات' },
        ],
        rows: [
          {
            id: 'ionic-properties',
            cells: {
              bond: 'الرابطة الأيونية',
              properties:
                'المركبات ذات الرابطة الأيونية صلبة في الدرجة العادية من الحرارة، ولا تنقل التيار الكهربائي في حالتها الصلبة بينما محاليلها ومصاهيرها تنقل التيار الكهربائي ودرجات غليانها وانصهارها مرتفعة.',
            },
          },
          {
            id: 'covalent-properties',
            cells: {
              bond: 'الرابطة المشتركة',
              properties: 'المركّبات ذات الرابطة المشتركة معظمها غازات وغير ناقلة للتيار الكهربائي ودرجات غليانها منخفضة.',
            },
          },
        ],
      },
    },
    {
      id: 'printed-compounds',
      title: 'المركّبات والأعداد الذرية المطبوعة',
      table: {
        caption: 'المركّبات الواردة في «قضيّة للبحث» (ص16)',
        columns: [
          { key: 'name', header: 'المركّب', rowHeader: true },
          { key: 'formula', header: 'الصيغة' },
        ],
        rows: [
          { id: 'ammonia', cells: { name: 'غاز النشادر', formula: 'NH₃' } },
          { id: 'water', cells: { name: 'الماء', formula: 'H₂O' } },
          { id: 'methane', cells: { name: 'غاز الميتان', formula: 'CH₄' } },
          { id: 'calcium-oxide', cells: { name: 'أكسيد الكالسيوم', formula: 'CaO' } },
          { id: 'aluminium-chloride', cells: { name: 'كلوريد الألمنيوم', formula: 'AlCl₃' } },
        ],
      },
      points: ['حيث: ₁₃Al، ₂₀Ca، ₆C، ₁H، ₈O، ₇N، ₁₇Cl.'],
    },
    {
      id: 'learn-box-definitions',
      title: 'تعريفات صندوق «تعلّمُ»',
      definitions: [
        {
          term: 'الرابطة الكيميائيّة',
          text: 'هي القوّة التي تجذب الذرّات أو الأيونات أو الجزيئات إلى بعضها البعض.',
          source: 'ص16 — صندوق «تعلّمُ»',
        },
        {
          term: 'الرابطة الأيونية',
          text: 'هي قوة تجاذب كهربائيّة ساكنة بين أيون موجب وأيون سالب.',
          source: 'ص16 — صندوق «تعلّمُ»',
        },
        {
          term: 'الرابطة المشتركة',
          text: 'هي اشتراك ذرّتين بزوج من الإلكترونات أو أكثر.',
          source: 'ص16 — صندوق «تعلّمُ»',
        },
      ],
    },
  ],
}
