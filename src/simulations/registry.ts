import type { ComponentType } from 'react'

/**
 * Interactive component registry (experiments, simulations, activities).
 *
 * Lesson content references an interactive by id, and the matching module is
 * loaded lazily through this registry — so a lesson page never pulls every
 * simulation in the book into the initial bundle.
 *
 * `BUILT_IN_INTERACTIVES` lists the labs and simulations used by the
 * source-verified Chemistry lessons. New lesson modules are platform additions,
 * not reproductions of textbook figures; source values and model outputs stay
 * explicitly distinguished. Further Chemistry modules are added here (or
 * registered at runtime through `defineInteractive`), and the host renders an
 * explicit, honest state for anything unregistered.
 */

export type InteractiveKind = 'experiment' | 'simulation' | 'activity' | 'diagram'

export type InteractiveProps = {
  /** Registered id of this interactive. */
  interactiveId: string
  /** Whether the user asked for reduced motion (`prefers-reduced-motion`). */
  reducedMotion: boolean
}

export type InteractiveDefinition = {
  id: string
  title: string
  kind: InteractiveKind
  /** Short description shown while loading and to assistive technology. */
  description: string
  /** Lazy loader, so the module is fetched only when the step is reached. */
  load: () => Promise<{ default: ComponentType<InteractiveProps> }>
}

const BUILT_IN_INTERACTIVES: InteractiveDefinition[] = [
  {
    id: 'source-figure-p5-levels',
    title: 'إعادة رسم: السويات الرئيسية السبع',
    kind: 'diagram',
    description: 'الشكل المطبوع في صفحة 5: نواة في المركز وسبع سويات حولها، مرقمة n = 1…7 وبأسماء K…Q.',
    load: () => import('./LevelsDiagram'),
  },
  {
    id: 'source-figure-p24-observations',
    title: 'إعادة بناء: مشاهد ملاحظة التحولات الكيميائية (ص24)',
    kind: 'diagram',
    description: 'مشاهد الصفحة 24 الثلاثة من اليمين إلى اليسار مع التعليق الأحمر المطبوع على مشهد الكربونة والليمون.',
    load: () => import('./Lesson4ObservationsDiagram'),
  },
  {
    id: 'source-figure-p25-magnesium',
    title: 'إعادة بناء: احتراق شريط المغنزيوم (ص25)',
    kind: 'diagram',
    description: 'تخطيط لشريط المغنزيوم الممسوك بالملقط والمشتعل بضوء أبيض ساطع ودخان أبيض وتكوّن أكسيد المغنزيوم.',
    load: () => import('./Lesson4MagnesiumDiagram'),
  },
  {
    id: 'source-figure-p26-burner',
    title: 'إعادة بناء: موقد بنزن وصحن الخزف في الحالتين (1) و(2) (ص26)',
    kind: 'diagram',
    description: 'شبكة اللوحات الأربع للصفحة 26: يميناً الحالة (1) بلهب أزرق وصحن نظيف، ويساراً الحالة (2) بلهب أصفر وطبقة سوداء.',
    load: () => import('./Lesson4BurnerDiagram'),
  },
  {
    id: 'source-figure-p29-q6',
    title: 'إعادة بناء: شكلا السؤال السادس (١) و(٢) (ص29)',
    kind: 'diagram',
    description: 'لوحتا السؤال السادس في الصفحة 29: يميناً الشكل (١) بلهب موقد منزلي أزرق، ويساراً الشكل (٢) بلهب أصفر وطبقة سوداء.',
    load: () => import('./Lesson4Question6Diagram'),
  },
  {
    id: 'reaction-observation-lab', title: 'مختبر ملاحظة التحولات الكيميائية', kind: 'simulation',
    description: 'تنفيذ مشاهد الليمون والبيكربونات والصباغ ورائق الكلس افتراضياً، ثم فصل الملاحظة عن الاستنتاج.',
    load: () => import('./ReactionObservationLab'),
  },
  {
    id: 'magnesium-combustion-lab', title: 'احتراق المغنزيوم: قبل وأثناء وبعد', kind: 'simulation',
    description: 'مراجعة تجهيز المخبر ثم ملاحظة احتراق الشريط وتكون أكسيد المغنزيوم الأبيض دون قياسات مفترضة.',
    load: () => import('./MagnesiumCombustionLab'),
  },
  {
    id: 'word-equation-lab', title: 'باني المعادلات اللفظية', kind: 'activity',
    description: 'اختيار مواد البداية والناتج والتحقق من معادلة بالأسماء مع بقاء السهم العلمي من اليسار إلى اليمين.',
    load: () => import('./WordEquationLab'),
  },
  {
    id: 'combustion-air-lab', title: 'الهواء والاحتراق التام وغير التام', kind: 'simulation',
    description: 'اختيار الحالتين المصدريتين لفتحة الهواء وملاحظة اللهب وصحن الخزف وتفسير السخام ونواتج احتراق الوقود.',
    load: () => import('./CombustionAirLab'),
  },
  {
    id: 'source-figure-p30-balance',
    title: 'إعادة بناء: ميزان كفتي عدّ الذرات (ص30)',
    kind: 'diagram',
    description: 'كفتا المتفاعلات والنواتج المتوازنتان مع العد المطبوع 3C و5H و5O و1Na وشريطي الصيغ والأسماء العربية.',
    load: () => import('./Lesson5BalanceDiagram'),
  },
  {
    id: 'source-figure-p31-scale',
    title: 'إعادة بناء: ميزانا تجربة أكسيد الكالسيوم الإلكترونيان (ص31)',
    kind: 'diagram',
    description: 'لوحتا قبل التفاعل وبعده بقراءة 125.100 ووسوم HCl وCaO وCaCl2 + H2O دون وحدة مطبوعة.',
    load: () => import('./Lesson5ScaleDiagram'),
  },
  {
    id: 'source-figure-p32-trials',
    title: 'إعادة بناء: تجارب الرصاص والكبريت الثلاث (ص32)',
    kind: 'diagram',
    description: 'صفوف التجارب (1) و(2) و(3) بأكوام الرصاص والكبريت وكبريتيد الرصاص والقيم المطبوعة والمتبقي في كل تجربة.',
    load: () => import('./Lesson5TrialsDiagram'),
  },
  {
    id: 'lesson5-atom-count-lab', title: 'مختبر عدّ الذرات قبل التفاعل وبعده', kind: 'simulation',
    description: 'حساب أعداد ذرات كل عنصر آلياً من صيغ تفاعل حمض الخل وبيكربونات الصوديوم، مع تحقق تفاعلي من إجابة الطالب.',
    load: () => import('./AtomCountLab'),
  },
  {
    id: 'lesson5-mass-boundary-lab', title: 'مختبر النظام المفتوح والمغلق', kind: 'simulation',
    description: 'يفصل قراءة 125.100 المنقولة من الكتاب عن نموذج حسابي يوضح انتقال كتلة مادة عبر حدود النظام.',
    load: () => import('./MassConservationLab'),
  },
  {
    id: 'lesson5-fixed-ratio-lab', title: 'مختبر النسب الكتلية الثابتة', kind: 'simulation',
    description: 'تطبيق نسب الحديد والكبريت أو الرصاص والكبريت على مدخلات الطالب وحساب الكتلة المتفاعلة والفائض كنموذج رياضي.',
    load: () => import('./FixedRatioLab'),
  },
  {
    id: 'bohr-energy-transition',
    title: 'انتقالات الطاقة في نموذج بور',
    kind: 'simulation',
    description: 'نقل إلكترون بين السويات وملاحظة امتصاص الطاقة أو إصدارها على شكل ضوء.',
    load: () => import('./BohrEnergyTransition'),
  },
  {
    id: 'ion-formation-lab',
    title: 'تشكّل الأيونات',
    kind: 'simulation',
    description: 'تحريك الإلكترون ومقارنة أعداد البروتونات والإلكترونات والشحنة الناتجة.',
    load: () => import('./IonFormationLab'),
  },
  {
    id: 'rutherford-scattering',
    title: 'محاكاة تجربة رذرفورد',
    kind: 'experiment',
    description: 'إطلاق جسيمات ألفا وقياس مسارات النفاذ والانحراف والارتداد.',
    load: () => import('./RutherfordScattering'),
  },
  {
    id: 'electron-shell-builder',
    title: 'باني التوزيع الإلكتروني',
    kind: 'simulation',
    description: 'إضافة الإلكترونات فعلياً إلى السويات وقراءة التوزع الناتج.',
    load: () => import('./ElectronShellBuilder'),
  },
  {
    id: 'isotope-lab',
    title: 'مختبر نظائر الأكسجين',
    kind: 'simulation',
    description: 'تغيير عدد النيوترونات مع تثبيت البروتونات ومراقبة العدد الكتلي.',
    load: () => import('./IsotopeLab'),
  },
  {
    id: 'shell-capacity-lab',
    title: 'سعة السويات الرئيسية y = 2(n)²',
    kind: 'activity',
    description: 'تعويض قانون السعة لكل سوية من K إلى Q ثم إكمال جدول الكتاب والتحقق من M وN وO.',
    load: () => import('./ShellCapacityLab'),
  },
  {
    id: 'atom-inventory-lab',
    title: 'مخزون الجسيمات: هوية الجسيم وشحنته',
    kind: 'simulation',
    description: 'ضبط البروتونات والنيوترونات والإلكترونات وحساب العدد الذري والكتلي والتوزع والشحنة ونوع الجسيم.',
    load: () => import('./AtomInventoryLab'),
  },
  {
    id: 'lewis-dot-lab',
    title: 'مختبر تمثيل لويس',
    kind: 'activity',
    description: 'بناء نقاط لويس لعناصر الدرس من التوزيع الإلكتروني والتحقق من العدد وقاعدة الازدواج.',
    load: () => import('./LewisDotLab'),
  },
  {
    id: 'ionic-bonding-lab',
    title: 'محاكاة الرابطة الأيونية: انتقال الإلكترون',
    kind: 'simulation',
    description: 'نقل الإلكترون السطحي من الصوديوم إلى الكلور ومراقبة تكوّن الأيونين ثم بلورة NaCl.',
    load: () => import('./IonicBondingLab'),
  },
  {
    id: 'covalent-bond-lab',
    title: 'مختبر الرابطة المشتركة: الأزواج المشتركة',
    kind: 'simulation',
    description: 'مقارنة H₂ وO₂ وN₂ بين تمثيل لويس والنموذج وقراءة الأزواج المشتركة وغير المشتركة.',
    load: () => import('./CovalentBondLab'),
  },
  {
    id: 'lesson2-ion-balance',
    title: 'شكل تأسيسي: الذرّة المتعادلة والأيون الموجب والأيون السالب',
    kind: 'diagram',
    description:
      'مقارنة بصرية وحسابية لذرّة الصوديوم المتعادلة وأيون الصوديوم الموجب وأيون الكلوريد السالب، مع ثبات عدد البروتونات وحساب الشحنة الكلية.',
    load: () => import('./Lesson2IonBalanceDiagram'),
  },
  {
    id: 'lesson2-element-behavior-lab',
    title: 'مختبر استنتاج سلوك الذرّات ونوع الرابطة',
    kind: 'activity',
    description:
      'استنتاج تصنيف العنصرين (فلزّ/لا فلزّ) ومصير إلكترونات التكافؤ (انتقال أيوني أو مشاركة تساهمية) عبر خمسة أزواج تكشف دور الطرف المقابل واستثناء الهيدروجين.',
    load: () => import('./ElementBehaviorLab'),
  },
  {
    id: 'lesson2-valence-map',
    title: 'إعادة رسم تعليمية: إلكترونات السطح في خمس ذرّات',
    kind: 'diagram',
    description:
      'الشكل نفسه الذي يبنيه الدرس: Na وMg وH وO وCl بتوزيعاتها المطبوعة، وإبراز السوية الأخيرة وحدها، مع مفتاح يفرّق بين النواة والإلكترون الداخلي وإلكترون السطح.',
    load: () => import('./Lesson2ValenceDiagram'),
  },
  {
    id: 'lesson2-bond-anatomy',
    title: 'شكل مقارن: انتقال الإلكترون مقابل مشاركته',
    kind: 'diagram',
    description:
      'لوحتان مرقّمتان: في الأولى ينتقل إلكترون الصوديوم إلى الموضع الفارغ عند الكلور، وفي الثانية يبقى زوج الإلكترونات داخل إطار مشترك بين ذرّتي الهيدروجين، مع تصريح بأن الرسم يعرض السطح فقط.',
    load: () => import('./Lesson2BondAnatomyDiagram'),
  },
  {
    id: 'lesson2-lewis-anatomy',
    title: 'إعادة رسم تعليمية: كيف يُقرأ تمثيل لويس؟',
    kind: 'diagram',
    description:
      'H₂ وO₂ وN₂ بتمثيل لويس، مع مفتاح للنقطة والزوج والمشترك وغير المشترك ورقم يشرح رتبة الرابطة والتحقّق عند 8 (و2 للهيدروجين).',
    load: () => import('./Lesson2LewisAnatomyDiagram'),
  },
  {
    id: 'lesson2-octet-bridge',
    title: 'إعادة رسم تعليمية: من إلكترونات السطح إلى الصيغة',
    kind: 'diagram',
    description:
      'سلسلة من خمس خطوات لكل من H₂ وO₂ وN₂: سطح الذرّة، الناقص للاكتمال، الأزواج المشتركة، رتبة الرابطة، الصيغة — مع تنبيه أن هدف الهيدروجين 2 لا 8.',
    load: () => import('./Lesson2OctetBridgeDiagram'),
  },
  {
    id: 'lesson2-transfer-cao',
    title: 'إعادة رسم تعليمية: انتقال إلكترونين في CaO',
    kind: 'diagram',
    description:
      'أربع مراحل لأكسيد الكالسيوم: الذرّات المتعادلة (2-8-8-2 و2-6)، انتقال إلكترونين، الأيونات Ca²⁺ وO²⁻، ثم التجاذب والصيغة المتعادلة.',
    load: () => import('./Lesson2TransferMechanismDiagram'),
  },
  {
    id: 'lesson2-transfer-mgcl2',
    title: 'إعادة رسم تعليمية: آلية MgCl₂ بمراحلها الأربع',
    kind: 'diagram',
    description:
      'مراجعة كاملة لسؤال الكتاب الثالث (ص17): توزيعا 12Mg و17Cl، انتقال إلكترونين إلى ذرّتَي كلور، الأيونات Mg²⁺ و2Cl⁻، ثم البلورة المتعادلة بنسبة 1:2.',
    load: () => import('./Lesson2TransferMechanismDiagram'),
  },
  {
    id: 'lesson2-valence-counter',
    title: 'مختبر عدّ إلكترونات السطح',
    kind: 'activity',
    description:
      'اختيار ذرّة من ذرّات الدرس، ثم اختيار عدد إلكترونات سطحها والتحقّق منه مع تعليل وميل متوقّع وإعادة ضبط.',
    load: () => import('./ValenceCounterLab'),
  },
  {
    id: 'lesson2-bond-steps',
    title: 'منصّة خطوات تكوّن الرابطة الأيونية',
    kind: 'simulation',
    description:
      'NaCl وMgCl₂ وCaO: خمس مراحل مع أزرار السابق والتالي وإعادة، وعدادات بروتونات وإلكترونات وشحنة تتغيّر مع المرحلة.',
    load: () => import('./BondStepsLab'),
  },
  {
    id: 'lesson2-error-spotter',
    title: 'مختبر اكتشف الخطأ في الروابط',
    kind: 'activity',
    description:
      'ست عبارات من الأخطاء الشائعة في الدرس، يحكم الطالب على كل واحدة ثم يرى التصحيح المعلَّل، مع نتيجة وإعادة ضبط.',
    load: () => import('./ErrorSpotterLab'),
  },
  {
    id: 'valence-model-lab',
    title: 'مختبر التكافؤ في النماذج الجزيئية',
    kind: 'simulation',
    description: 'تشكيل روابط H₂O وNH₃ وCH₄ رابطةً رابطة وقراءة التكافؤ كعدد الروابط المشتركة.',
    load: () => import('./ValenceModelLab'),
  },
  {
    id: 'ion-equation-lab',
    title: 'مختبر المعادلات الأيونية: الفقد والاكتساب',
    kind: 'simulation',
    description: 'تنفيذ المعادلات الخمس للصفحة 19 إلكتروناً إلكتروناً مع قراءة الشحنة والتوزع.',
    load: () => import('./IonEquationLab'),
  },
  {
    id: 'formula-builder-lab',
    title: 'مختبر بناء الصيغة الكيميائية',
    kind: 'simulation',
    description: 'اختيار أيونين وتحقيق التعادل الكهربائي وكتابة الصيغة مع قوس الجذر عند التكرار.',
    load: () => import('./FormulaBuilderLab'),
  },
]

const registry = new Map<string, InteractiveDefinition>(
  BUILT_IN_INTERACTIVES.map((definition) => [definition.id, definition]),
)

/** Registers an interactive module. Throws on duplicate ids, loudly. */
export function defineInteractive(definition: InteractiveDefinition): InteractiveDefinition {
  if (registry.has(definition.id)) {
    throw new Error(`Interactive "${definition.id}" is already registered.`)
  }
  registry.set(definition.id, definition)
  return definition
}

export function getInteractive(id: string): InteractiveDefinition | undefined {
  return registry.get(id)
}

export function listInteractives(): InteractiveDefinition[] {
  return [...registry.values()]
}

/** Only registered ids may appear in lesson content. */
export function isInteractiveRegistered(id: string): boolean {
  return registry.has(id)
}

/** Test-only helper: clears the registry between test cases. */
export function __resetInteractiveRegistry() {
  registry.clear()
}
