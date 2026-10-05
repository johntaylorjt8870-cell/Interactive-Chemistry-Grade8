import type { PageReference } from '@/data/source'

/* ============================================================================
   Curriculum scope guard
   ----------------------------------------------------------------------------
   Test Area questions may only measure content that is actually published in
   the curriculum registry. This file is the machine-readable boundary of that
   rule, and `audit.ts` fails the build when a question steps outside it.

   Two guards, both automatic:

   1. PAGE GUARD — every question carries `sourceRefs`; every page must belong
      to the lessons (or unit) the test declares it covers.
   2. TOKEN GUARD — every Latin token printed in a question (element symbols,
      level letters) must appear in the allowlist below, which lists only the
      symbols the published pages actually contain.

   The allowlist is intentionally explicit and commented: adding a new symbol
   is a deliberate, reviewable act, never a silent one.
   ========================================================================= */

export const CURRICULUM_UNIT_ID = 'chem-u1'

/** Pages of the published unit, exactly as declared in the curriculum registry. */
export const UNIT_PAGES: readonly string[] = [
  '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17',
]

export const LESSON_PAGES: Record<string, readonly string[]> = {
  'chem-u1-l1': ['3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
  'chem-u1-l2': ['13', '14', '15', '16', '17'],
}

export const LESSON_TITLES: Record<string, string> = {
  'chem-u1-l1': 'الدرس الأول — الذرّة والعنصر',
  'chem-u1-l2': 'الدرس الثاني — الروابط الكيميائية',
}

export const UNIT_TITLE = 'الوحدة الأولى — الكيمياء البنيوية'

/**
 * Latin tokens allowed to appear in Test Area content.
 *
 * Element symbols — every one of them is printed with its atomic number or its
 * distribution in the published pages:
 *   H(1)  He(2)  Li(3)  B(5)  C(6)  N(7)  O(8)  F(9)  Ne(10)  Na(11)
 *   Mg(12)  Al(13)  P(15)  S(16)  Cl(17)  Ar(18)  K(19)  Ca(20)
 * Level letters — `K L M N O` name the principal levels (pages 5–6).
 */
export const ALLOWED_LATIN_TOKENS: ReadonlyArray<{ token: string; why: string }> = [
  { token: 'H', why: 'هيدروجين — ص 16 (H₂، H₂O)' },
  { token: 'He', why: 'هيليوم — ص 12 (سؤال لويس)' },
  { token: 'Li', why: 'ليثيوم — ص 9 (جدول لويس)' },
  { token: 'B', why: 'بورون — ص 9 (جدول لويس)' },
  { token: 'C', why: 'كربون — ص 9 و13 و16' },
  { token: 'N', why: 'نيتروجين — ص 9 و16 (N₂)' },
  { token: 'O', why: 'أكسجين — ص 8 و10 و11 و16 (O₂، النظائر)' },
  { token: 'F', why: 'فلور — ص 8 (F⁻)' },
  { token: 'Ne', why: 'نيون — ص 7 (الترميز النووي)' },
  { token: 'Na', why: 'صوديوم — ص 6 و8 و14' },
  { token: 'Mg', why: 'مغنزيوم — ص 10 و17 (MgCl₂، MgO)' },
  { token: 'Al', why: 'ألمنيوم — ص 10 و16 (AlCl₃)' },
  { token: 'P', why: 'فوسفور — ص 12 (السوية M)' },
  { token: 'S', why: 'كبريت — ص 12 (التوزع 2-8-6)' },
  { token: 'Cl', why: 'كلور — ص 8 و14 و17' },
  { token: 'Ar', why: 'أرغون — ص 12 (سؤال لويس)' },
  { token: 'K', why: 'بوتاسيوم — ص 8 (K⁺)؛ واسم السوية الأولى' },
  { token: 'Ca', why: 'كالسيوم — ص 16 (CaO)' },
  { token: 'L', why: 'اسم السوية الرئيسية الثانية — ص 5–6' },
  { token: 'M', why: 'اسم السوية الرئيسية الثالثة — ص 6 و12' },
]

const ALLOWED_SET = new Set(ALLOWED_LATIN_TOKENS.map((entry) => entry.token))

/** Pages covered by a set of lesson ids (falls back to the whole unit). */
export function pagesOfLessons(lessonIds: readonly string[]): string[] {
  if (lessonIds.length === 0) return [...UNIT_PAGES]
  const pages = lessonIds.flatMap((id) => [...(LESSON_PAGES[id] ?? [])])
  return [...new Set(pages)]
}

export function isPageInScope(page: string, lessonIds: readonly string[]): boolean {
  return pagesOfLessons(lessonIds).includes(page.trim())
}

/**
 * Latin tokens printed in a piece of content, in source order, de-duplicated.
 * Arabic prose contains no capital Latin letters, so this extracts exactly the
 * element symbols, level letters and formula runs worth auditing.
 */
export function latinTokens(text: string): string[] {
  const matches = text.match(/[A-Z][a-z]?/g) ?? []
  return [...new Set(matches)]
}

export function unknownLatinTokens(text: string): string[] {
  return latinTokens(text).filter((token) => !ALLOWED_SET.has(token))
}

export function isLatinTokenAllowed(token: string): boolean {
  return ALLOWED_SET.has(token)
}

/** Human-readable page list for a set of references. */
export function formatPageRefs(refs: readonly PageReference[]): string {
  const pages = refs.map((ref) => ref.page.trim()).filter(Boolean)
  const unique = [...new Set(pages)]
  return unique.length === 0 ? '—' : unique.join('، ')
}
