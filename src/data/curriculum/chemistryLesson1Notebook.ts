import type { StudentNotebook } from './schema'

/* ============================================================================
   «دفتر الطالب» — Lesson 1 «الذرّة والعنصر» (ص3–12)
   ----------------------------------------------------------------------------
   What this file is: the material a student is expected to write in the school
   notebook after studying the lesson, and nothing else.

   The standard applied here, after the final pedagogical review:

     * the notebook holds what the textbook itself prints — definitions quoted
       character for character (`source: 'صN'`), the printed rules, the printed
       statements of Bohr's model and the printed data tables;
     * a platform sentence enters only when the printed page would otherwise be
       impossible to record (a symbol a student cannot read), and then it is
       one short line, never a definition, never a derived formula;
     * a platform explanation is *not* evidence that a fact belongs here. The
       lesson may explain a topic at length; the notebook keeps the printed
       core;
     * nothing is composed from the book plus the platform: no definition in
       this file is a synthesis of two sources.

   Removed on the reviewer's instruction, and not to be restored without an
   explicit request: the platform definition of «السوية الطاقية», the composed
   «مفهوم العنصر الكيميائي», the atomic-number and mass-number definitions,
   the mass-number relation (A − Z), the charge formula (q = Np − Ne), the
   monovalent-ion entry, the gas-notation ordering rule for Lewis dots, and the
   gloss notes that repeated the tables.

   And it leaves out — because the lesson already carries them and copying them
   would turn the notebook into a second copy of the lesson:

     * experiment execution and apparatus;
     * solved examples, worked applications and example grids;
     * solution procedures and checklists describing *how* to answer;
     * re-explanations of why a rule holds, and repeated restatements;
     * the closing self-check questions, which are revision, not notes.
   ========================================================================= */

export const lesson1StudentNotebook: StudentNotebook = {
  title: 'الذرّة والعنصر — مادة الدفتر المدرسي',
  introduction:
    'التعريفات والقواعد والرموز التي تُدوَّن في دفترك بعد درس «الذرّة والعنصر» (ص3–12). الشرح والأمثلة والأنشطة تُقرأ في الدرس.',
  source: {
    pages: Array.from({ length: 10 }, (_, index) => ({ page: String(index + 3) })),
    verified: true,
  },
  sections: [
    {
      id: 'electron',
      title: 'الإلكترون ونموذج طومسون',
      lead: 'أول جسيم داخل الذرّة، وأول تفسير لتوزيع شحنتها.',
      definitions: [
        {
          term: 'الإلكترون',
          text:
            'تمكّن العالم طومسون بعد دراسة التقريب الكهربائي من اكتشاف الإلكترون وهو جسيم صغير كتلته تقريبًا (1/1860) من كتلة نواة ذرّة الهيدروجين ويحمل شحنة سالبة.',
          source: 'ص4',
        },
        {
          term: 'نموذج طومسون',
          text:
            'الذرّة جسيم صغير متجانس المادة ويحمل شحنة موجبة تتوزع الإلكترونات السالبة داخله بحيث تكون الذرّة متعادلة كهربائيًا.',
          source: 'ص4',
        },
      ],
      points: ['الذرّة تتكوّن من جسيمات تحمل شحنات سالبة وأخرى موجبة.'],
    },
    {
      id: 'rutherford',
      title: 'تجربة رذرفورد والنواة',
      lead: 'الملاحظتان المطبوعتان، وتعريف النواة.',
      definitions: [
        {
          /**
           * The printed clause alone, complete in meaning: it names the part,
           * its charge, what it carries and who called it that. The platform's
           * «الكتلة والشحنة الموجبة مركّزتان…» was removed — it is an
           * explanation of the experiment, not a printed definition, and it was
           * previously mis-filed to ص7.
           */
          term: 'النواة',
          text: 'جزء موجب يمثل معظم كتلة الذرة أطلق عليه العالم رذرفورد النواة.',
          source: 'ص4',
        },
      ],
      points: [
        'معظم جسيمات ألفا تنفذ دون انحراف ← معظم حجم الذرّة فراغ.',
        'جزء صغير من جسيمات ألفا ارتد وبعضها انحرف بزوايا مختلفة.',
      ],
    },
    {
      id: 'bohr',
      title: 'نموذج بور والسويات الطاقية',
      lead: 'نقاط نموذج بور الثلاث',
      ordered: [
        'تتكوّن الذرّة من نواة موجبة وتدور حولها الإلكترونات في سويّات لها طاقة محدّدة.',
        'تمتصّ الذرّة طاقة محددة عندما يقفز الإلكترون من سوية طاقة أدنى إلى سوية طاقة أعلى بحيث تكون الطاقة الممتصّة تساوي فرق الطاقة بين السويتين اللتين قفز بينهما الإلكترون.',
        'تصدر الذرّة طاقة محددة على شكل ضوء عندما يقفز الإلكترون من سوية طاقة أعلى إلى سوية طاقة أدنى.',
      ],
    },
    {
      id: 'levels',
      title: 'السويات الرئيسية وقانون السعة',
      lead: 'عدد السويات وقانون السعة العظمى',
      definitions: [
        {
          term: 'السويات الرئيسية',
          text: 'يوجد في الذرة سبع سويات طاقة أساسية لها الأرقام (1 – 2 – 3 – 4 – 5 – 6 – 7) (K, L, M, N, O, P, Q)، وتحوي كل منها عددًا أعظميًا من الإلكترونات يساوي (2n²).',
          source: 'ص11 — «تعلّمُ»',
        },
      ],
      points: [
        'y = 2(n)² حيث يعبّر n عن رقم السوية الرئيسية، مع العلم أن السوية الأخيرة لا تحوي أكثر من ثمانية إلكترونات.',
      ],
      table: {
        caption: 'السعة العظمى للإلكترونات في السويات K–O',
        columns: [
          { key: 'level', header: 'السوية الرئيسية', rowHeader: true },
          { key: 'n', header: 'رقم السوية n' },
          { key: 'y', header: 'العدد الأعظمي y = 2(n)²' },
        ],
        rows: [
          { id: 'k', cells: { level: 'K', n: '1', y: '2' } },
          { id: 'l', cells: { level: 'L', n: '2', y: '8' } },
          { id: 'm', cells: { level: 'M', n: '3', y: '18' } },
          { id: 'n', cells: { level: 'N', n: '4', y: '32' } },
          { id: 'o', cells: { level: 'O', n: '5', y: '50' } },
        ],
        footnote: 'K = 2 وL = 8 كما في الكتاب، ويُكمل M وN وO بالقانون.',
      },
    },
    {
      id: 'distribution',
      title: 'التوزيع الإلكتروني',
      lead: 'قواعد التوزيع على السويات',
      points: [
        'الإلكترونات تشغل السويّات الأدنى أولاً.',
        'عدد الإلكترونات يساوي عدد البروتونات في الذرة.',
      ],
    },
    {
      id: 'atomic-numbers',
      title: 'العدد الذري والعدد الكتلي والترميز النووي',
      lead: 'قراءة رمز النواة',
      /**
       * The only line in the notebook that the book does not print. The book
       * prints the symbol ²⁰₁₀Ne and asks for A, for Z, for the number of
       * electrons and for the distribution, but names neither number — so
       * without this line the printed symbol has no key. It is labelled to the
       * student on the same page, not only here.
       */
      source: 'توضيح ضروري من المنصة — ليس نصاً من الكتاب',
      points: ['في رمز النواة يُكتب العدد الكتلي A في الأعلى والعدد الذري Z في الأسفل.'],
    },
    {
      id: 'octet',
      title: 'قاعدة الثمانية والنشاط الكيميائي',
      lead: 'قاعدة الاستقرار، واستثناء الهيدروجين.',
      definitions: [
        {
          /**
           * The printed sentence is shown whole, not split into a separate
           * "chemical activity" definition. It already names the term inside
           * the rule, and the lesson prints nothing else that defines it — so
           * quoting it as it stands is the only faithful option.
           */
          term: 'قاعدة الثمانية الإلكترونية',
          text:
            'تسعى ذرّات العناصر الكيميائية إلى الاستقرار بأن يصبح في طبقتها السطحية ثمانية إلكترونات، عدا الهيدروجين الذي يحتوي على إلكترونين فقط. تسعى الذرّة للحصول على ثمانية إلكترونات في طبقتها السطحية، فتكتسب أو تفقد الإلكترونات وهذا ما يسمى النشاط الكيميائي.',
          source: 'ص7 — نص الكتاب، كما هو.',
        },
      ],
    },
    {
      id: 'ions',
      title: 'الأيونات ورموزها',
      lead: 'تعريف الأيون وقاعدة شحنته ورمزه',
      definitions: [
        {
          term: 'الأيون',
          text:
            'الأيون هو ذرة فقدت أو اكتسبت إلكترونًا أو أكثر. إذا فقدت الذرة إلكترونًا (أو أكثر) تتحوّل إلى أيون موجب، ويرمز له برمز ذرته مع عدد من الإشارات الموجبة يساوي عدد الإلكترونات التي فقدتها الذرة. إذا اكتسبت الذرة إلكترونًا (أو أكثر) تتحوّل إلى أيون سالب، ويرمز له برمز ذرته مع عدد من الإشارات السالبة يساوي عدد الإلكترونات التي اكتسبتها الذرة.',
          source: 'ص8',
        },
      ],
      points: ['ترتيب إشارة الشحنة في الكتاب: 2+ و2− لا +2 و−2.'],
      table: {
        caption: 'أمثلة الأيونات كما في الكتاب (ص9)',
        columns: [
          { key: 'element', header: 'اسم العنصر', rowHeader: true },
          { key: 'way', header: 'طريقة حصوله على قاعدة الثمانية' },
          { key: 'ion', header: 'شحنة الأيون ورمزه' },
        ],
        rows: [
          { id: 'k', cells: { element: 'البوتاسيوم', way: 'فقدان إلكترون واحد', ion: '1+ ‑ K⁺' } },
          { id: 'f', cells: { element: 'الفلور', way: 'اكتساب إلكترون واحد', ion: '1− ‑ F⁻' } },
          { id: 'ca', cells: { element: 'الكالسيوم', way: 'فقدان إلكترونين', ion: '2+ ‑ Ca²⁺' } },
          { id: 'o', cells: { element: 'الأكسجين', way: 'اكتساب إلكترونين', ion: '2− ‑ O²⁻' } },
        ],
      },
    },
    {
      id: 'lewis',
      title: 'تمثيل لويس للذرّات',
      lead: 'إلكترونات السوية الأخيرة فقط، بنقاط حول الرمز.',
      definitions: [
        {
          /**
           * The printed definition, completed: the previous version dropped the
           * printed «أو حرف X صغير», which is part of what Lewis proposed.
           */
          term: 'تمثيل لويس',
          text:
            'اقترح لويس تمثيلًا مبسّطًا للذرات بحيث نكتبُ رمز الذرّة محاطة بالإلكترونات السّطحية فقط ويشار لها بنقاط أو حرف X صغير.',
          source: 'ص9',
        },
      ],
    },
    {
      id: 'isotopes',
      title: 'النظائر والفرق بينها وبين الأيون',
      lead: 'العنصر نفسه بعدد ذري ثابت وعدد كتلي مختلف.',
      definitions: [
        {
          term: 'النظائر',
          text:
            'ذرّات للعنصر نفسه تتماثل بالعدد الذري (فهي تتماثل بخاصياتها الكيميائية)، وتختلف بالعدد الكتلي (فهي تختلف بخاصياتها الفيزيائية).',
          source: 'ص11',
        },
      ],
      points: [
        'نظائر الهيدروجين الثلاثة ¹₁H و²₁H و³₁H: العدد الذري 1 في الحالات الثلاث، والنيوترونات صفر وواحد واثنان.',
        'النظير: تتغيّر النيوترونات وتثبت البروتونات والإلكترونات. الأيون: تتغيّر الإلكترونات وتثبت البروتونات والنيوترونات.',
      ],
    },
  ],

  /**
   * Revision, not notes. Rendered *outside* the notebook article, under a
   * heading that says so, so a student never copies it into the notebook.
   */
  checklist: {
    title: 'قبل الاختبار: تحقّق أنك تستطيع',
    items: [
      'كتابة التوزيع الإلكتروني لأي ذرّة من عددها الذري على السويات الرئيسية، والتحقق منه بالشروط الأربعة.',
      'قراءة العدد الذري والعدد الكتلي من رمز النواة، وحساب البروتونات والنيوترونات والإلكترونات.',
      'تعليل تكوّن الأيون الموجب والأيون السالب بقاعدة الثمانية، وحساب شحنة الأيون ورمزه.',
      'رسم تمثيل لويس لذرّة من توزيعها الإلكتروني.',
      'التمييز بين النظير والأيون: ما الذي يتغيّر في كل منهما وما الذي يثبت.',
    ],
  },
}
