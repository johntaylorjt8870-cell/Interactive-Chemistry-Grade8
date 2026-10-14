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
