/**
 * Independent interactive lab registry.
 *
 * Labs are standalone applied projects hosted under `labs/<lessonId>/` and
 * rendered inside a sandboxed `<iframe>` without `allow-same-origin` or
 * `allow-top-navigation`. They are NOT curriculum source material and are
 * strictly separated from `src/data/curriculum` and `sourceFidelity`.
 */

export const ALLOWED_LAB_SANDBOX_TOKENS = [
  'allow-scripts',
  'allow-popups',
  'allow-popups-to-escape-sandbox',
] as const

export type AllowedLabSandboxToken = (typeof ALLOWED_LAB_SANDBOX_TOKENS)[number]

const ALLOWED_SET: ReadonlySet<string> = new Set(ALLOWED_LAB_SANDBOX_TOKENS)

export const FORBIDDEN_LAB_SANDBOX_TOKENS = [
  'allow-same-origin',
  'allow-top-navigation',
  'allow-top-navigation-by-user-activation',
  'allow-top-navigation-to-custom-protocols',
] as const

export type LessonLabDefinition = {
  /** Matches `LessonDefinition.id` (e.g. `chem-u1-l3`). */
  lessonId: string
  /** Label shown on the lesson outline tab. */
  tabTitle: string
  /** Accessible title of the sandboxed lab iframe. */
  frameTitle: string
  /** Relative path beneath `BASE_URL` (no leading slash). */
  entryPath: string
  /**
   * Explicit sandbox token list for this lab's `<iframe>`.
   * Baseline is `['allow-scripts']`; extra tokens require explicit approval
   * and are validated against `ALLOWED_LAB_SANDBOX_TOKENS`.
   */
  sandbox: readonly AllowedLabSandboxToken[]
}

/**
 * Builds and validates the `sandbox` attribute string for a lab iframe.
 * Rejects `allow-same-origin`, `allow-top-navigation*`, or any unapproved
 * permission so a lab frame always runs in an opaque `null` origin.
 */
export function buildLabSandboxAttribute(tokens: readonly string[]): string {
  if (!tokens.includes('allow-scripts')) {
    throw new Error('Lab sandbox configuration must include "allow-scripts".')
  }

  const seen = new Set<string>()
  const validated: string[] = []
  for (const token of tokens) {
    if (!ALLOWED_SET.has(token)) {
      throw new Error(`Disallowed iframe sandbox token in lab configuration: "${token}".`)
    }
    if (!seen.has(token)) {
      seen.add(token)
      validated.push(token)
    }
  }

  return validated.join(' ')
}

/** Resolves a lab's `entryPath` under Vite's `BASE_URL` without doubling slashes. */
export function resolveLabUrl(
  lab: LessonLabDefinition,
  baseUrl: string = import.meta.env.BASE_URL,
): string {
  const normalizedBase = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`
  const normalizedEntry = lab.entryPath.replace(/^\/+/, '')
  return `${normalizedBase}${normalizedEntry}`
}

const LESSON_LABS: readonly LessonLabDefinition[] = [
  {
    lessonId: 'chem-u1-l3',
    tabTitle: 'المخبر',
    frameTitle: 'مختبر صيغة المركّبات الكيميائية — الصف الثامن',
    entryPath: 'labs/chem-u1-l3/index.html',
    sandbox: ['allow-scripts', 'allow-popups', 'allow-popups-to-escape-sandbox'],
  },
]

const LABS_BY_LESSON_ID: ReadonlyMap<string, LessonLabDefinition> = new Map(
  LESSON_LABS.map((lab) => {
    // Validate every registered lab's sandbox configuration at module load.
    buildLabSandboxAttribute(lab.sandbox)
    return [lab.lessonId, lab]
  }),
)

export function getLessonLab(lessonId: string): LessonLabDefinition | undefined {
  return LABS_BY_LESSON_ID.get(lessonId)
}

export function listLessonLabs(): readonly LessonLabDefinition[] {
  return LESSON_LABS
}
