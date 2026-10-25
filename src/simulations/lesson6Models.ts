/**
 * Pure scientific models for Lesson 6 («المعادلة الكيميائيّة», pp. 36–39).
 *
 * Kept pure and framework-free so every calculation (atom counting across
 * stoichiometric coefficients, greatest-common-divisor simplification checks,
 * and KaTeX equation assembly with physical states) can be unit-tested
 * deterministically in `tests/lesson6.test.tsx`.
 */

export type PhysicalStateCode = 's' | 'l' | 'aq' | 'g'

export type ReactionSpecies = {
  /** Plain ASCII formula without state, e.g. `ZnCl2`, `CH3COOH`, `Na2SO4`. */
  formula: string
  /** KaTeX body for the chemical species without state, e.g. `\mathrm{ZnCl}_{2}`. */
  texFormula: string
  /** Physical state subscript written bottom-right in textbook notation. */
  state: PhysicalStateCode
  /** Arabic name of the substance for accessible labels and hints. */
  arabicName: string
  /** Per-unit atom counts for every element in this species. */
  atoms: Readonly<Record<string, number>>
}

export type BalancerReaction = {
  id: string
  title: string
  /** Difficulty badge shown in the balancer selector. */
  level: 'تأسيسي' | 'متوسط' | 'متقدم'
  /** Optional condition over the reaction arrow (`Δ` for heating). */
  condition?: 'Δ'
  /** Ordered element symbols to display in the atom inventory scale. */
  elements: readonly string[]
  reactants: readonly ReactionSpecies[]
  products: readonly ReactionSpecies[]
  /** Simplest whole-number balanced coefficients. */
  targetCoefficients: {
    reactants: readonly number[]
    products: readonly number[]
  }
  /** Pedagogical strategy note shown to guide the student. */
  strategyTip: string
  /** Optional platform scientific/safety caveat for theoretical textbook reactions. */
  scientificNote?: string
}

export type ElementBalanceRow = {
  element: string
  reactants: number
  products: number
  balanced: boolean
}

export type BalanceEvaluation = {
  rows: ElementBalanceRow[]
  /** True when every element has equal atom counts on both sides. */
  allAtomsEqual: boolean
  /** Greatest common divisor across all coefficients. */
  coefficientsGcd: number
  /** True when `coefficientsGcd === 1`. */
  isSimplestRatio: boolean
  /** True only when all atoms match AND coefficients are in simplest form. */
  isBalancedInSimplestForm: boolean
}

export function gcd(a: number, b: number): number {
  let x = Math.abs(Math.trunc(a))
  let y = Math.abs(Math.trunc(b))
  while (y !== 0) {
    const remainder = x % y
    x = y
    y = remainder
  }
  return x || 1
}

export function gcdList(values: readonly number[]): number {
  if (values.length === 0) return 1
  return values.reduce((acc, current) => gcd(acc, current), Math.abs(Math.trunc(values[0]!)))
}

export function computeSideCounts(
  species: readonly ReactionSpecies[],
  coefficients: readonly number[],
  elements: readonly string[],
): Record<string, number> {
  const counts: Record<string, number> = {}
  for (const element of elements) counts[element] = 0

  species.forEach((item, index) => {
    const coeff = coefficients[index] ?? 1
    for (const element of elements) {
      counts[element] = (counts[element] ?? 0) + coeff * (item.atoms[element] ?? 0)
    }
  })

  return counts
}

export function evaluateBalanceState(
  reaction: BalancerReaction,
  reactantCoefficients: readonly number[],
  productCoefficients: readonly number[],
): BalanceEvaluation {
  const left = computeSideCounts(reaction.reactants, reactantCoefficients, reaction.elements)
  const right = computeSideCounts(reaction.products, productCoefficients, reaction.elements)

  const rows: ElementBalanceRow[] = reaction.elements.map((element) => {
    const r = left[element] ?? 0
    const p = right[element] ?? 0
    return {
      element,
      reactants: r,
      products: p,
      balanced: r > 0 && r === p,
    }
  })

  const allAtomsEqual = rows.every((row) => row.balanced)
  const allCoeffs = [...reactantCoefficients, ...productCoefficients]
  const coefficientsGcd = gcdList(allCoeffs)
  const isSimplestRatio = coefficientsGcd === 1

  return {
    rows,
    allAtomsEqual,
    coefficientsGcd,
    isSimplestRatio,
    isBalancedInSimplestForm: allAtomsEqual && isSimplestRatio,
  }
}

/** Builds a strict-KaTeX string matching the textbook's bottom-right state notation. */
export function formatReactionTeX(
  reaction: BalancerReaction,
  reactantCoefficients: readonly number[],
  productCoefficients: readonly number[],
): string {
  const formatTerm = (item: ReactionSpecies, coeff: number) => {
    const prefix = coeff === 1 ? '' : String(coeff)
    const stateSub = item.state === 'l' ? '(\\ell)' : `(${item.state})`
    const merged = /_\{[^}]+\}$/.test(item.texFormula)
      ? item.texFormula.replace(/_\{([^}]+)\}$/, `_{$1${stateSub}}`)
      : `${item.texFormula}_{${stateSub}}`
    return `${prefix}${merged}`
  }

  const lhs = reaction.reactants
    .map((item, idx) => formatTerm(item, reactantCoefficients[idx] ?? 1))
    .join(' + ')
  const rhs = reaction.products
    .map((item, idx) => formatTerm(item, productCoefficients[idx] ?? 1))
    .join(' + ')
  const arrow = reaction.condition === 'Δ' ? '\\xrightarrow{\\Delta}' : '\\longrightarrow'

  return `${lhs} ${arrow} ${rhs}`
}

export const BALANCER_REACTIONS: readonly BalancerReaction[] = [
  {
    id: 'zn-hcl',
    title: 'الزنك مع حمض كلور الماء الممدّد (تجربة ص37)',
    level: 'تأسيسي',
    elements: ['Zn', 'H', 'Cl'],
    reactants: [
      { formula: 'Zn', texFormula: '\\mathrm{Zn}', state: 's', arabicName: 'الزنك الصلب', atoms: { Zn: 1 } },
      { formula: 'HCl', texFormula: '\\mathrm{HCl}', state: 'aq', arabicName: 'محلول حمض كلور الماء', atoms: { H: 1, Cl: 1 } },
    ],
    products: [
      { formula: 'ZnCl2', texFormula: '\\mathrm{ZnCl}_{2}', state: 'aq', arabicName: 'محلول كلوريد الزنك', atoms: { Zn: 1, Cl: 2 } },
      { formula: 'H2', texFormula: '\\mathrm{H}_{2}', state: 'g', arabicName: 'غاز الهدروجين', atoms: { H: 2 } },
    ],
    targetCoefficients: { reactants: [1, 2], products: [1, 1] },
    strategyTip: 'ذرة الزنك موزونة (1 = 1). انظر إلى Cl وH في الطرف الثاني: كلاهما 2، بينما في HCl كلٌّ منهما 1.',
  },
  {
    id: 'mg-o2',
    title: 'احتراق المغنزيوم بغاز الأكسجين بالتسخين (ص39)',
    level: 'تأسيسي',
    condition: 'Δ',
    elements: ['Mg', 'O'],
    reactants: [
      { formula: 'Mg', texFormula: '\\mathrm{Mg}', state: 's', arabicName: 'المغنزيوم الصلب', atoms: { Mg: 1 } },
      { formula: 'O2', texFormula: '\\mathrm{O}_{2}', state: 'g', arabicName: 'غاز الأكسجين', atoms: { O: 2 } },
    ],
    products: [
      { formula: 'MgO', texFormula: '\\mathrm{MgO}', state: 's', arabicName: 'أكسيد المغنزيوم الصلب', atoms: { Mg: 1, O: 1 } },
    ],
    targetCoefficients: { reactants: [2, 1], products: [2] },
    strategyTip: 'الأكسجين يدخل جزيئاً ثنائي الذرة O₂ (ذرّتان)، فلا بدّ من جزيئين/وحدتين من MgO في النواتج، ثم تحديث معامل Mg.',
  },
  {
    id: 'na-znso4',
    title: 'الصوديوم مع محلول كبريتات الزنك (تمرين نظري — ص39)',
    level: 'متوسط',
    elements: ['Na', 'Zn', 'S', 'O'],
    reactants: [
      { formula: 'Na', texFormula: '\\mathrm{Na}', state: 's', arabicName: 'قطعة الصوديوم', atoms: { Na: 1 } },
      { formula: 'ZnSO4', texFormula: '\\mathrm{ZnSO}_{4}', state: 'aq', arabicName: 'محلول كبريتات الزنك', atoms: { Zn: 1, S: 1, O: 4 } },
    ],
    products: [
      { formula: 'Na2SO4', texFormula: '\\mathrm{Na}_{2}\\mathrm{SO}_{4}', state: 'aq', arabicName: 'محلول كبريتات الصوديوم', atoms: { Na: 2, S: 1, O: 4 } },
      { formula: 'Zn', texFormula: '\\mathrm{Zn}', state: 's', arabicName: 'الزنك الصلب (نظرياً وفق نص التمرين)', atoms: { Zn: 1 } },
    ],
    targetCoefficients: { reactants: [2, 1], products: [1, 1] },
    strategyTip: 'لاحظ أن جذر الكبريتات SO₄ (ذرة S وأربع ذرات O) انتقل كما هو دون تفكّك! وازن ذرات الصوديوم Na فقط.',
    scientificNote:
      'تنبيه علمي ومخبري (إضافة من المنصة): هذه المعادلة تدريب نظري على موازنة الذرات وفق نص نشاط ص39، وليست تعليمةً لتجربة مدرسية؛ فالصوديوم الفلزي الحر يتفاعل بعنف شديد مع ماء المحلول مطلقاً غاز الهدروجين وحرارة عالية بدلاً من ترسيب الزنك بهدوء.',
  },
  {
    id: 'al-hcl',
    title: 'مسحوق الألمنيوم مع حمض كلور الماء (تطبيق ص38)',
    level: 'متوسط',
    elements: ['Al', 'H', 'Cl'],
    reactants: [
      { formula: 'Al', texFormula: '\\mathrm{Al}', state: 's', arabicName: 'مسحوق الألمنيوم', atoms: { Al: 1 } },
      { formula: 'HCl', texFormula: '\\mathrm{HCl}', state: 'aq', arabicName: 'محلول حمض كلور الماء', atoms: { H: 1, Cl: 1 } },
    ],
    products: [
      { formula: 'AlCl3', texFormula: '\\mathrm{AlCl}_{3}', state: 'aq', arabicName: 'محلول كلوريد الألمنيوم', atoms: { Al: 1, Cl: 3 } },
      { formula: 'H2', texFormula: '\\mathrm{H}_{2}', state: 'g', arabicName: 'غاز الهدروجين', atoms: { H: 2 } },
    ],
    targetCoefficients: { reactants: [2, 6], products: [2, 3] },
    strategyTip: 'الكلور ثلاثي في AlCl₃ والهدروجين زوجي في H₂: المضاعف المشترك الأصغر بين 3 و2 هو 6 ذرات لكلٍّ منهما!',
  },
  {
    id: 'kclo3-decomp',
    title: 'التفكك الحراري لكلورات البوتاسيوم (ص39)',
    level: 'متقدم',
    condition: 'Δ',
    elements: ['K', 'Cl', 'O'],
    reactants: [
      { formula: 'KClO3', texFormula: '\\mathrm{KClO}_{3}', state: 's', arabicName: 'كلورات البوتاسيوم الصلبة', atoms: { K: 1, Cl: 1, O: 3 } },
    ],
    products: [
      { formula: 'KCl', texFormula: '\\mathrm{KCl}', state: 's', arabicName: 'كلوريد البوتاسيوم الصلب', atoms: { K: 1, Cl: 1 } },
      { formula: 'O2', texFormula: '\\mathrm{O}_{2}', state: 'g', arabicName: 'غاز الأكسجين', atoms: { O: 2 } },
    ],
    targetCoefficients: { reactants: [2], products: [2, 3] },
    strategyTip: 'ذرات الأكسجين 3 في KClO₃ و2 في O₂: المضاعف المشترك الأصغر هو 6، ثم لا تنسَ تحديث معامل KCl ليتساوى K وCl!',
  },
  {
    id: 'ch4-o2',
    title: 'احتراق غاز الميثان بغاز الأكسجين (ص39)',
    level: 'متقدم',
    elements: ['C', 'H', 'O'],
    reactants: [
      { formula: 'CH4', texFormula: '\\mathrm{CH}_{4}', state: 'g', arabicName: 'غاز الميثان', atoms: { C: 1, H: 4 } },
      { formula: 'O2', texFormula: '\\mathrm{O}_{2}', state: 'g', arabicName: 'غاز الأكسجين', atoms: { O: 2 } },
    ],
    products: [
      { formula: 'CO2', texFormula: '\\mathrm{CO}_{2}', state: 'g', arabicName: 'غاز ثنائي أكسيد الكربون', atoms: { C: 1, O: 2 } },
      { formula: 'H2O', texFormula: '\\mathrm{H}_{2}\\mathrm{O}', state: 'g', arabicName: 'بخار الماء', atoms: { H: 2, O: 1 } },
    ],
    targetCoefficients: { reactants: [1, 2], products: [1, 2] },
    strategyTip: 'وازن C أولاً، ثم H، واترك O₂ الحرّ لآخر خطوة! انتبه: الأكسجين في النواتج موزع بين CO₂ وبخار الماء H₂O.',
  },
]

/* ---------------------------------------------------------------------------
 * Word-to-symbol guided builder scenarios
 * ------------------------------------------------------------------------ */

export type WordToSymbolScenario = {
  id: string
  title: string
  description: string
  /** Optional platform scientific/safety caveat for theoretical textbook scenarios. */
  scientificNote?: string
  wordReactants: readonly string[]
  wordProducts: readonly string[]
  condition?: string
  formulaChoices: readonly {
    id: string
    label: string
    isCorrect: boolean
    feedback: string
  }[]
  stateChoices: readonly {
    id: string
    label: string
    isCorrect: boolean
    feedback: string
  }[]
  balancedChoices: readonly {
    id: string
    tex: string
    plainLabel: string
    isCorrect: boolean
    feedback: string
  }[]
}

export const WORD_TO_SYMBOL_SCENARIOS: readonly WordToSymbolScenario[] = [
  {
    id: 'al-s',
    title: 'تفاعل برادة الألمنيوم مع مسحوق الكبريت',
    description: 'يتفاعل مسحوق (برادة) الألمنيوم مع مسحوق الكبريت فينتج كبريتيد الألمنيوم الصلب.',
    wordReactants: ['برادة الألمنيوم', 'مسحوق الكبريت'],
    wordProducts: ['كبريتيد الألمنيوم الصلب'],
    formulaChoices: [
      {
        id: 'f1',
        label: 'Al + S → AlS',
        isCorrect: false,
        feedback: 'خطأ في صيغة الناتج: تكافؤ الألمنيوم Al هو 3 وتكافؤ الكبريت S في الكبريتيدات هو 2؛ عند مبادلة التكافؤين تصبح الصيغة Al₂S₃ لا AlS.',
      },
      {
        id: 'f2',
        label: 'Al + S → Al₂S₃',
        isCorrect: true,
        feedback: 'أحسنت! الألمنيوم والكبريت عنصران صلبان يُكتبان برمزيهما الذريين Al وS، وصيغة كبريتيد الألمنيوم بمبادلة التكافؤين (3 و2) هي Al₂S₃.',
      },
      {
        id: 'f3',
        label: 'Al₂ + S₃ → Al₂S₃',
        isCorrect: false,
        feedback: 'خطأ شائع: لا نضع أرقام الناتج السفلية على العناصر الحرّة قبل السهم! الألمنيوم الصلب رمزه Al والكبريت رمزه S، وتتم الموازنة لاحقاً بالمعاملات الأمامية.',
      },
    ],
    stateChoices: [
      {
        id: 's1',
        label: 'Al(s) + S(s) → Al₂S₃(s)',
        isCorrect: true,
        feedback: 'صحيح تماماً: برادة الألمنيوم صلبة (s)، ومسحوق الكبريت صلب (s)، وكبريتيد الألمنيوم صلب (s).',
      },
      {
        id: 's2',
        label: 'Al(s) + S(g) → Al₂S₃(aq)',
        isCorrect: false,
        feedback: 'غير دقيق: الكبريت في الشروط العادية مسحوق أصفر صلب (s) لا غاز، والناتج مركّب صلب (s) بلا وجود ماء ليكون محلولاً (aq).',
      },
      {
        id: 's3',
        label: 'Al(l) + S(l) → Al₂S₃(s)',
        isCorrect: false,
        feedback: 'غير صحيح: البرادة والمسحوق في نص التفاعل يدلّان على الحالة الصلبة (s) لا السائلة (l).',
      },
    ],
    balancedChoices: [
      {
        id: 'b1',
        tex: '\\mathrm{Al}_{(s)} + \\mathrm{S}_{(s)} \\longrightarrow \\mathrm{Al}_{2}\\mathrm{S}_{3(s)}',
        plainLabel: 'Al(s) + S(s) → Al₂S₃(s)',
        isCorrect: false,
        feedback: 'المعادلة غير موزونة بعد: في المتفاعلات ذرة Al واحدة وذرة S واحدة، بينما في الناتج 2 Al و3 S.',
      },
      {
        id: 'b2',
        tex: '2\\mathrm{Al}_{(s)} + 3\\mathrm{S}_{(s)} \\longrightarrow \\mathrm{Al}_{2}\\mathrm{S}_{3(s)}',
        plainLabel: '2Al(s) + 3S(s) → Al₂S₃(s)',
        isCorrect: true,
        feedback: 'ممتاز! أصبح عدد ذرات الألمنيوم 2 في الطرفين، وعدد ذرات الكبريت 3 في الطرفين، وبأبسط نسبة عددية صحيحة.',
      },
      {
        id: 'b3',
        tex: '3\\mathrm{Al}_{(s)} + 2\\mathrm{S}_{(s)} \\longrightarrow \\mathrm{Al}_{2}\\mathrm{S}_{3(s)}',
        plainLabel: '3Al(s) + 2S(s) → Al₂S₃(s)',
        isCorrect: false,
        feedback: 'انتبه: عكستَ المعاملين! الصيغة Al₂S₃ تحوي ذرتَي Al وثلاث ذرات S، فيلزم 2 أمام Al و3 أمام S.',
      },
    ],
  },
  {
    id: 'k-o2',
    title: 'تفاعل قطعة بوتاسيوم مع غاز الأكسجين',
    description: 'تتفاعل قطعة بوتاسيوم صلبة مع غاز الأكسجين فينتج أكسيد البوتاسيوم الصلب.',
    wordReactants: ['قطعة بوتاسيوم', 'غاز الأكسجين'],
    wordProducts: ['أكسيد البوتاسيوم'],
    formulaChoices: [
      {
        id: 'f1',
        label: 'K + O → KO',
        isCorrect: false,
        feedback: 'خطآن معاً: غاز الأكسجين جزيء ثنائي الذرة O₂ لا ذرة منفردة O، وتكافؤ الأكسجين 2 بينما تكافؤ البوتاسيوم 1 فصيغة الأكسيد هي K₂O لا KO.',
      },
      {
        id: 'f2',
        label: 'K + O₂ → KO₂',
        isCorrect: false,
        feedback: 'أصبتَ في O₂ لكن أخطأتَ في صيغة أكسيد البوتاسيوم المنهجية: تكافؤ K هو 1 وتكافؤ O هو 2، فالصيغة الأيونية هي K₂O.',
      },
      {
        id: 'f3',
        label: 'K + O₂ → K₂O',
        isCorrect: true,
        feedback: 'صحيح! البوتاسيوم فلزّ رمزه K، وغاز الأكسجين ثنائي الذرة O₂، وأكسيد البوتاسيوم بمبادلة التكافؤين (1 و2) هو K₂O.',
      },
    ],
    stateChoices: [
      {
        id: 's1',
        label: 'K(s) + O₂(g) → K₂O(s)',
        isCorrect: true,
        feedback: 'دقيق: «قطعة بوتاسيوم» صلبة (s)، و«غاز الأكسجين» غازي (g)، وأكسيد الفلزّ الناتج مركّب أيوني صلب (s).',
      },
      {
        id: 's2',
        label: 'K(aq) + O₂(g) → K₂O(l)',
        isCorrect: false,
        feedback: 'غير صحيح: البوتاسيوم قطعة صلبة (s) لا محلول مائي (aq)، وأكسيد البوتاسيوم مركّب بلوري صلب (s) في الشروط العادية.',
      },
      {
        id: 's3',
        label: 'K(s) + O₂(l) → K₂O(g)',
        isCorrect: false,
        feedback: 'غير صحيح: الأكسجين غاز (g) وليس سائلاً، وأكسيد البوتاسيوم صلب (s) وليس غازاً.',
      },
    ],
    balancedChoices: [
      {
        id: 'b1',
        tex: '2\\mathrm{K}_{(s)} + \\mathrm{O}_{2(g)} \\longrightarrow \\mathrm{K}_{2}\\mathrm{O}_{(s)}',
        plainLabel: '2K(s) + O₂(g) → K₂O(s)',
        isCorrect: false,
        feedback: 'البوتاسيوم تساوى (2 = 2)، لكن الأكسجين بقي غير موزون: ذرتا O في المتفاعلات مقابل ذرة O واحدة في النواتج!',
      },
      {
        id: 'b2',
        tex: '4\\mathrm{K}_{(s)} + \\mathrm{O}_{2(g)} \\longrightarrow 2\\mathrm{K}_{2}\\mathrm{O}_{(s)}',
        plainLabel: '4K(s) + O₂(g) → 2K₂O(s)',
        isCorrect: true,
        feedback: 'رائع! وضعنا 2 أمام K₂O لموازنة الأكسجين (2 = 2)، فأصبح البوتاسيوم 2 × 2 = 4 في النواتج، فوضعنا 4 أمام K.',
      },
      {
        id: 'b3',
        tex: '2\\mathrm{K}_{(s)} + \\mathrm{O}_{2(g)} \\longrightarrow 2\\mathrm{K}_{2}\\mathrm{O}_{(s)}',
        plainLabel: '2K(s) + O₂(g) → 2K₂O(s)',
        isCorrect: false,
        feedback: 'الأكسجين موزون (2 = 2)، لكن في 2K₂O يوجد 2 × 2 = 4 ذرات K بينما في المتفاعلات 2 فقط.',
      },
    ],
  },
  {
    id: 'na-acetic',
    title: 'تفاعل قطعة صوديوم مع حمض الخل (تمرين نظري — ص39)',
    description:
      'تمرين كتابي نظري في ص39: نعبّر بالرموز والصيغ عن التفاعل الموصوف بين قطعة صوديوم ومحلول حمض الخل لإنتاج محلول خلات الصوديوم وانطلاق غاز الهدروجين.',
    scientificNote:
      'تنبيه علمي وسلامة مخبرية (إضافة من المنصة): يتفاعل الصوديوم الفلزي الحر بعنف شديد وحرارة عالية مع الماء والمحاليل الحمضية المائية مطلقاً غاز الهدروجين القابل للاشتعال؛ لذا يُقدَّم هذا المثال كتفسير وتدريب نظري على الصيغ والموازنة لا كتجربة مدرسية اعتيادية.',
    wordReactants: ['قطعة صوديوم', 'حمض الخل'],
    wordProducts: ['خلات الصوديوم', 'غاز الهدروجين'],
    formulaChoices: [
      {
        id: 'f1',
        label: 'Na + CH₃COOH → CH₃COONa + H₂',
        isCorrect: true,
        feedback: 'أحسنت! حمض الخل CH₃COOH وجذر الخلّات CH₃COO⁻ أحادي التكافؤ يرتبط بأيون الصوديوم Na⁺ فيعطي CH₃COONa، وغاز الهدروجين ثنائي الذرة H₂.',
      },
      {
        id: 'f2',
        label: 'Na + CH₃COOH → CH₃COONa + H',
        isCorrect: false,
        feedback: 'خطأ في غاز الهدروجين: الغاز الحرّ المنطلق يوجد على هيئة جزيئات ثنائية الذرة H₂ لا ذرات H منفردة.',
      },
      {
        id: 'f3',
        label: 'Na + HCl → NaCl + H₂',
        isCorrect: false,
        feedback: 'هذه معادلة حمض كلور الماء لا حمض الخل! حمض الخل صيغته CH₃COOH وملحه خلات الصوديوم CH₃COONa.',
      },
    ],
    stateChoices: [
      {
        id: 's1',
        label: 'Na(s) + CH₃COOH(aq) → CH₃COONa(aq) + H₂(g)',
        isCorrect: true,
        feedback: 'صحيح وفق معطيات التمرين النظري! قطعة الصوديوم صلبة (s)، ومحلول حمض الخل وخلات الصوديوم محلولان مائيان (aq)، والهدروجين المنطلق غاز (g).',
      },
      {
        id: 's2',
        label: 'Na(s) + CH₃COOH(s) → CH₃COONa(s) + H₂(l)',
        isCorrect: false,
        feedback: 'غير صحيح: الهدروجين المنطلق غاز (g) لا سائل، وحمض الخل وملحه في هذا التمرين المائي محلولان مائيان (aq).',
      },
      {
        id: 's3',
        label: 'Na(aq) + CH₃COOH(g) → CH₃COONa(aq) + H₂(g)',
        isCorrect: false,
        feedback: 'غير صحيح: «قطعة صوديوم» فلزّ صلب (s) وليست محلولاً، وحمض الخل الموصوف في التمرين محلول مائي (aq) لا غاز.',
      },
    ],
    balancedChoices: [
      {
        id: 'b1',
        tex: '\\mathrm{Na}_{(s)} + \\mathrm{CH}_{3}\\mathrm{COOH}_{(aq)} \\longrightarrow \\mathrm{CH}_{3}\\mathrm{COONa}_{(aq)} + \\mathrm{H}_{2(g)}',
        plainLabel: 'Na(s) + CH₃COOH(aq) → CH₃COONa(aq) + H₂(g)',
        isCorrect: false,
        feedback: 'عدّ ذرات الهدروجين H: في المتفاعلات 3 + 1 = 4 ذرات، وفي النواتج 3 + 2 = 5 ذرات! المعادلة غير موزونة.',
      },
      {
        id: 'b2',
        tex: '2\\mathrm{Na}_{(s)} + 2\\mathrm{CH}_{3}\\mathrm{COOH}_{(aq)} \\longrightarrow 2\\mathrm{CH}_{3}\\mathrm{COONa}_{(aq)} + \\mathrm{H}_{2(g)}',
        plainLabel: '2Na(s) + 2CH₃COOH(aq) → 2CH₃COONa(aq) + H₂(g)',
        isCorrect: true,
        feedback: 'ممتاز! تحقّق بالعدّ: Na (2 = 2)، وC (4 = 4)، وH (2×4 = 8 في اليسار، و2×3 + 2 = 8 في اليمين)، وO (4 = 4).',
      },
      {
        id: 'b3',
        tex: '\\mathrm{Na}_{(s)} + 2\\mathrm{CH}_{3}\\mathrm{COOH}_{(aq)} \\longrightarrow \\mathrm{CH}_{3}\\mathrm{COONa}_{(aq)} + \\mathrm{H}_{2(g)}',
        plainLabel: 'Na(s) + 2CH₃COOH(aq) → CH₃COONa(aq) + H₂(g)',
        isCorrect: false,
        feedback: 'ضربتَ CH₃COOH في 2 فأصبح جذر الخلّات مكرراً مرتين في اليسار ومرّة واحدة فقط في اليمين (C: 4 ≠ 2).',
      },
    ],
  },
]

/* ---------------------------------------------------------------------------
 * Misconception Spotter statements (5 false + 1 true)
 * ------------------------------------------------------------------------ */

export type EquationErrorCase = {
  id: string
  claim: string
  texEquation: string
  isTrue: boolean
  verdict: string
  correction: string
}

export const LESSON6_ERROR_CASES: readonly EquationErrorCase[] = [
  {
    id: 'subscript-tampering',
    claim: 'لموازنة ذرّتَي الأكسجين في تفاعل احتراق المغنزيوم نغيّر صيغة الناتج إلى MgO₂ فتصبح المعادلة موزونة.',
    texEquation: '\\mathrm{Mg}_{(s)} + \\mathrm{O}_{2(g)} \\xrightarrow{\\Delta} \\mathrm{MgO}_{2(s)}',
    isTrue: false,
    verdict: 'خطأ جسيم: تغيير الرقم السفلي يغيّر هوية المركّب ويخالف التكافؤ!',
    correction:
      'تكافؤ المغنزيوم 2 وتكافؤ الأكسجين 2، فصيغة أكسيد المغنزيوم هي MgO حصراً. تتم الموازنة بوضع المعامل 2 على يسار MgO وعلى يسار Mg: 2Mg(s) + O₂(g) → 2MgO(s).',
  },
  {
    id: 'liquid-vs-aqueous',
    claim: 'محلول كلوريد الزنك الذائب في الماء يُكتب برمز الحالة السائلة ZnCl₂(l) لأن المحلول المائي سائل المظهر.',
    texEquation: '\\mathrm{ZnCl}_{2(\\ell)}',
    isTrue: false,
    verdict: 'خطأ في التمييز بين السائل النقي (l) والمحلول المائي (aq).',
    correction:
      'الرمز (l) يُخصَّص للمادة النقية في حالتها السائلة (مثل الماء النقي H₂O(l) أو مصهور الملح عند حرارة عالية)، أمّا المادة المذابة في الماء فتُكتب برمز المحلول المائي ZnCl₂(aq) كما في جدول ص37.',
  },
  {
    id: 'monatomic-gas-error',
    claim: 'بما أن الهيدروجين عنصر واحد، نكتبه في معادلة انطلاقه على صورة ذرة منفردة H(g) لتسهيل الموازنة.',
    texEquation: '\\mathrm{Zn}_{(s)} + \\mathrm{HCl}_{(aq)} \\longrightarrow \\mathrm{ZnCl}_{2(aq)} + \\mathrm{H}_{(g)}',
    isTrue: false,
    verdict: 'خطأ في صيغة الجزيء الغازي الثنائي الذرة ومعادلة غير موزونة.',
    correction:
      'غاز الهدروجين يوجد في الطبيعة على هيئة جزيئات ثنائية الذرة H₂(g) (وكذلك O₂ وCl₂ وN₂). كتابة H(g) تخالف البنية الحقيقية للغاز وتترك الكلور غير موزون أيضاً.',
  },
  {
    id: 'al-hcl-balanced-true',
    claim: 'المعادلة الآتية موزونة تماماً وتحقّق تساوي ذرات كل عنصر في طرفيها وبأبسط نسبة عددية صحيحة.',
    texEquation: '2\\mathrm{Al}_{(s)} + 6\\mathrm{HCl}_{(aq)} \\longrightarrow 2\\mathrm{AlCl}_{3(aq)} + 3\\mathrm{H}_{2(g)}',
    isTrue: true,
    verdict: 'عبارة صحيحة تماماً (التطبيق المحلول في ص38).',
    correction:
      'بالفعل: Al (2 = 2)، وH (6 = 6 لأن 3 × 2 = 6)، وCl (6 = 6 لأن 2 × 3 = 6)، والمعاملات (2، 6، 2، 3) قاسمها المشترك الأكبر يساوي 1 فلا تقبل التبسيط أكثر، ورموز الحالة الفيزيائية صحيحة.',
  },
  {
    id: 'split-oxygen-product',
    claim: 'المعادلة الآتية لاحتراق الميثان موزونة لأن ذرات الكربون (1 = 1) وذرات الهدروجين (4 = 4) متساوية.',
    texEquation: '\\mathrm{CH}_{4(g)} + \\mathrm{O}_{2(g)} \\longrightarrow \\mathrm{CO}_{2(g)} + 2\\mathrm{H}_{2}\\mathrm{O}_{(g)}',
    isTrue: false,
    verdict: 'خطأ في جمع ذرات العنصر الموزَّع على أكثر من ناتج!',
    correction:
      'ذرات الأكسجين في النواتج موجودة في مادتين معاً: 2 في CO₂ + 2 في 2H₂O = 4 ذرات أكسجين، بينما في المتفاعلات ذرتان فقط في O₂! التصحيح وضع المعامل 2 أمام O₂(g) لتصبح: CH₄(g) + 2O₂(g) → CO₂(g) + 2H₂O(g).',
  },
  {
    id: 'unsimplified-coefficients',
    claim: 'المعادلة الآتية تمثّل الصورة النهائية المبسّطة لموازنة تفاعل الزنك مع حمض كلور الماء.',
    texEquation: '2\\mathrm{Zn}_{(s)} + 4\\mathrm{HCl}_{(aq)} \\longrightarrow 2\\mathrm{ZnCl}_{2(aq)} + 2\\mathrm{H}_{2(g)}',
    isTrue: false,
    verdict: 'المعاملات ليست في أبسط نسبة عددية صحيحة.',
    correction:
      'رغم تساوي الذرات، فإن جميع المعاملات (2، 4، 2، 2) تقبل القسمة على 2! في الصورة القياسية النهائية نقسم المعاملات على قاسمها المشترك الأكبر فنحصل على: Zn(s) + 2HCl(aq) → ZnCl₂(aq) + H₂(g).',
  },
]
