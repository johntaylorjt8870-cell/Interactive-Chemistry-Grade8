import type { ComponentType } from 'react'

/**
 * Interactive component registry (experiments, simulations, activities).
 *
 * Lesson content references an interactive by id, and the matching module is
 * loaded lazily through this registry — so a lesson page never pulls every
 * simulation in the book into the initial bundle.
 *
 * The registry is intentionally empty in the foundation phase: no experiment
 * or simulation may be built before its textbook pages are supplied and read.
 * `defineInteractive` is the single place where they will be registered, and
 * the host renders an explicit, honest state for anything unregistered.
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
