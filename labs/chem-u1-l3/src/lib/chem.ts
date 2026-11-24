/* =====================================================================
   مكتبة الكيمياء — بيانات الدرس الثالث (ص18–23)
   ===================================================================== */

export interface Elem {
  sym: string
  ar: string
  color: string
  ink: string
  r: number
}

export const ELEMENTS: Record<string, Elem> = {
  H: { sym: 'H', ar: 'الهيدروجين', color: '#eef2ea', ink: '#24473b', r: 13 },
  C: { sym: 'C', ar: 'الكربون', color: '#4d5d57', ink: '#ffffff', r: 17 },
  N: { sym: 'N', ar: 'النتروجين', color: '#4f80c4', ink: '#ffffff', r: 17 },
  O: { sym: 'O', ar: 'الأكسجين', color: '#dc6a5e', ink: '#ffffff', r: 17 },
  Na: { sym: 'Na', ar: 'الصوديوم', color: '#9a82c9', ink: '#ffffff', r: 19 },
  K: { sym: 'K', ar: 'البوتاسيوم', color: '#b684b0', ink: '#ffffff', r: 20 },
  Ag: { sym: 'Ag', ar: 'الفضة', color: '#aeb9bd', ink: '#17302a', r: 19 },
  Mg: { sym: 'Mg', ar: 'المغنزيوم', color: '#78b77c', ink: '#ffffff', r: 19 },
  Ca: { sym: 'Ca', ar: 'الكالسيوم', color: '#d1a257', ink: '#ffffff', r: 20 },
  Zn: { sym: 'Zn', ar: 'الزنك', color: '#7f9cb2', ink: '#ffffff', r: 19 },
  Al: { sym: 'Al', ar: 'الألمنيوم', color: '#a9a39a', ink: '#ffffff', r: 19 },
  Fe: { sym: 'Fe', ar: 'الحديد', color: '#c2784b', ink: '#ffffff', r: 19 },
  Cu: { sym: 'Cu', ar: 'النحاس', color: '#c9733f', ink: '#ffffff', r: 19 },
  S: { sym: 'S', ar: 'الكبريت', color: '#dcbd48', ink: '#3b3210', r: 18 },
  Cl: { sym: 'Cl', ar: 'الكلور', color: '#4cb17b', ink: '#ffffff', r: 18 },
  Br: { sym: 'Br', ar: 'البروم', color: '#a4483f', ink: '#ffffff', r: 19 },
  P: { sym: 'P', ar: 'الفوسفور', color: '#e0904b', ink: '#ffffff', r: 18 },
}

/* ---------------------------------------------------------------------
   الأيونات والجذور (جدولا ص20 وص21)
   ------------------------------------------------------------------ */

export interface Ion {
  id: string
  sym: string // بصيغة mhchem بلا شحنة: Na، SO4، CH3COO
  charge: number // مع الإشارة
  ar: string // الاسم داخل اسم المركّب
  radical: boolean
  roman?: string // للفلزات متعددة التكافؤ
  note?: string
}

const I = (
  id: string,
  sym: string,
  charge: number,
  ar: string,
  radical = false,
  roman?: string,
  note?: string,
): Ion => ({ id, sym, charge, ar, radical, roman, note })

export const CATIONS: Ion[] = [
  I('Na+', 'Na', 1, 'الصوديوم'),
  I('K+', 'K', 1, 'البوتاسيوم'),
  I('Ag+', 'Ag', 1, 'الفضة'),
  I('H+', 'H', 1, 'الهيدروجين'),
  I('NH4+', 'NH4', 1, 'الأمونيوم', true),
  I('Mg2+', 'Mg', 2, 'المغنزيوم'),
  I('Ca2+', 'Ca', 2, 'الكالسيوم'),
  I('Zn2+', 'Zn', 2, 'الزنك'),
  I('Fe2+', 'Fe', 2, 'الحديد', false, 'II'),
  I('Cu2+', 'Cu', 2, 'النحاس', false, 'II'),
  I('Cu+', 'Cu', 1, 'النحاس', false, 'I'),
  I('Al3+', 'Al', 3, 'الألمنيوم'),
  I('Fe3+', 'Fe', 3, 'الحديد', false, 'III'),
]

export const ANIONS: Ion[] = [
  I('Cl-', 'Cl', -1, 'كلوريد'),
  I('Br-', 'Br', -1, 'بروميد'),
  I('O2-', 'O', -2, 'أكسيد'),
  I('S2-', 'S', -2, 'كبريتيد'),
  I('OH-', 'OH', -1, 'هيدروكسيد', true, undefined, 'جذر الهيدروكسيل'),
  I('NO3-', 'NO3', -1, 'نترات', true, undefined, 'جذر النترات'),
  I('HCOO-', 'HCOO', -1, 'فورمات', true, undefined, 'جذر الفورمات (النّملات)'),
  I('CH3COO-', 'CH3COO', -1, 'خلّات', true, undefined, 'جذر الخلّات'),
  I('SO42-', 'SO4', -2, 'كبريتات', true, undefined, 'جذر الكبريتات'),
  I('CO32-', 'CO3', -2, 'كربونات', true, undefined, 'جذر الكربونات'),
  I('PO43-', 'PO4', -3, 'فوسفات', true, undefined, 'جذر الفوسفات'),
]

export const ALL_IONS: Ion[] = [...CATIONS, ...ANIONS]
export const ion = (id: string): Ion => {
  const f = ALL_IONS.find((i) => i.id === id)
  if (!f) throw new Error('unknown ion ' + id)
  return f
}

export const valenceOf = (i: Ion) => Math.abs(i.charge)

const chargeStr = (c: number) => {
  const a = Math.abs(c)
  const s = c > 0 ? '+' : '-'
  return a === 1 ? s : `^${a}${s}`
}

/** \ce للأيون: Ca^2+ */
export const ionCe = (i: Ion) => `${i.sym}${chargeStr(i.charge)}`
export const ionTex = (i: Ion) => `\\ce{${ionCe(i)}}`

/* ---------------------------------------------------------------------
   جدول تكافؤات العناصر (ص20) — 16 بنداً بالترتيب المطبوع
   ------------------------------------------------------------------ */

export interface ValenceItem {
  sym: string
  ar: string
  v: number
  roman?: string
  sign: 1 | -1
  ionId: string
}

export const VALENCE_TABLE: ValenceItem[] = [
  { sym: 'Na', ar: 'الصوديوم', v: 1, sign: 1, ionId: 'Na+' },
  { sym: 'Ca', ar: 'الكالسيوم', v: 2, sign: 1, ionId: 'Ca2+' },
  { sym: 'H', ar: 'الهيدروجين', v: 1, sign: 1, ionId: 'H+' },
  { sym: 'O', ar: 'الأكسجين', v: 2, sign: -1, ionId: 'O2-' },
  { sym: 'Br', ar: 'البروم', v: 1, sign: -1, ionId: 'Br-' },
  { sym: 'Zn', ar: 'الزنك', v: 2, sign: 1, ionId: 'Zn2+' },
  { sym: 'K', ar: 'البوتاسيوم', v: 1, sign: 1, ionId: 'K+' },
  { sym: 'Al', ar: 'الألمنيوم', v: 3, sign: 1, ionId: 'Al3+' },
  { sym: 'Cl', ar: 'الكلور', v: 1, sign: -1, ionId: 'Cl-' },
  { sym: 'Fe', ar: 'الحديد', v: 3, roman: 'III', sign: 1, ionId: 'Fe3+' },
  { sym: 'Ag', ar: 'الفضة', v: 1, sign: 1, ionId: 'Ag+' },
  { sym: 'Fe', ar: 'الحديد', v: 2, roman: 'II', sign: 1, ionId: 'Fe2+' },
  { sym: 'S', ar: 'الكبريت', v: 2, sign: -1, ionId: 'S2-' },
  { sym: 'Cu', ar: 'النحاس', v: 2, roman: 'II', sign: 1, ionId: 'Cu2+' },
  { sym: 'Mg', ar: 'المغنزيوم', v: 2, sign: 1, ionId: 'Mg2+' },
  { sym: 'Cu', ar: 'النحاس', v: 1, roman: 'I', sign: 1, ionId: 'Cu+' },
]

/* ---------------------------------------------------------------------
   بناء الصيغة (التبادل المتقاطع ثم التبسيط)
   ------------------------------------------------------------------ */

export const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b))

/** الأعداد الأبسط التي تحقق التعادل الكهربائي */
export function simplestRatio(cat: Ion, an: Ion) {
  const v1 = valenceOf(cat)
  const v2 = valenceOf(an)
  const g = gcd(v1, v2)
  return { nc: v2 / g, na: v1 / g, raw: { nc: v2, na: v1 }, g }
}

const OVERRIDES: Record<string, string> = {
  'H+|HCOO-': 'HCOOH',
  'H+|CH3COO-': 'CH3COOH',
  'H+|OH-': 'H2O',
}

const part = (i: Ion, n: number) => (n === 1 ? i.sym : i.radical ? `(${i.sym})${n}` : `${i.sym}${n}`)

/** صيغة mhchem (نص عادي) للمركّب مع أعداد معيّنة */
export function formulaPlain(cat: Ion, an: Ion, nc: number, na: number): string {
  const s = simplestRatio(cat, an)
  if (nc === s.nc && na === s.na && OVERRIDES[`${cat.id}|${an.id}`]) return OVERRIDES[`${cat.id}|${an.id}`]
  return part(cat, nc) + part(an, na)
}

export const compoundPlain = (cat: Ion, an: Ion) => {
  const s = simplestRatio(cat, an)
  return formulaPlain(cat, an, s.nc, s.na)
}

export const ce = (plain: string) => `\\ce{${plain}}`

/** اسم المركّب كوحدات: الجزء السالب أولاً ثم الموجب ثم الرقم الروماني */
export type NameToken = string | { roman: string }

export function nameTokens(cat: Ion, an: Ion): NameToken[] {
  const t: NameToken[] = [an.ar, cat.ar]
  if (cat.roman) t.push({ roman: cat.roman })
  return t
}

export const tokensKey = (t: NameToken[]) => t.map((x) => (typeof x === 'string' ? x : '#' + x.roman)).join('|')

export const COMMON_NAMES: Record<string, string> = {
  H2O: 'الماء',
  NaCl: 'ملح الطعام',
  CaSO4: 'الجبس',
  CaCO3: 'الحجر الكلسي',
  CaO: 'الكلس الحي',
  'Ca(OH)2': 'رائق الكلس',
  H2SO4: 'حمض الكبريت',
  HCl: 'حمض كلور الماء',
  NaOH: 'الصودا الكاوية',
}

/* ---------------------------------------------------------------------
   تحليل الصيغة إلى ذرّات (مع الأقواس)
   ------------------------------------------------------------------ */

export function parseFormula(f: string): Record<string, number> {
  let i = 0
  const readNum = () => {
    let s = ''
    while (i < f.length && /\d/.test(f[i])) s += f[i++]
    return s ? parseInt(s, 10) : 1
  }
  const group = (): Record<string, number> => {
    const counts: Record<string, number> = {}
    while (i < f.length) {
      const ch = f[i]
      if (ch === '(') {
        i++
        const inner = group()
        const n = readNum()
        for (const k in inner) counts[k] = (counts[k] || 0) + inner[k] * n
      } else if (ch === ')') {
        i++
        return counts
      } else if (/[A-Z]/.test(ch)) {
        let sym = ch
        i++
        while (i < f.length && /[a-z]/.test(f[i])) sym += f[i++]
        const n = readNum()
        counts[sym] = (counts[sym] || 0) + n
      } else i++
    }
    return counts
  }
  return group()
}

/** يفصل المعامل البادئ: "2H2O" → [2, "H2O"] */
export function splitCoef(f: string): [number, string] {
  const m = /^(\d+)(.*)$/.exec(f)
  return m ? [parseInt(m[1], 10), m[2]] : [1, f]
}

/* ---------------------------------------------------------------------
   تحويلات نصية
   ------------------------------------------------------------------ */

const SUB = '₀₁₂₃₄₅₆₇₈₉'
export function normFormula(s: string): string {
  return s
    .replace(/[₀-₉]/g, (c) => String(SUB.indexOf(c)))
    .replace(/[\[\{]/g, '(')
    .replace(/[\]\}]/g, ')')
    .replace(/[\s\u200e\u200f·.]/g, '')
}

/* ---------------------------------------------------------------------
   أدوات عامة
   ------------------------------------------------------------------ */

export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export const pick = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)]

/** يضيف شدّة لون hex: amt>0 يفتّح، amt<0 يغمّق */
export function shade(hex: string, amt: number): string {
  const n = parseInt(hex.slice(1), 16)
  const ch = (v: number) => Math.max(0, Math.min(255, Math.round(amt >= 0 ? v + (255 - v) * amt : v * (1 + amt))))
  const r = ch((n >> 16) & 255)
  const g = ch((n >> 8) & 255)
  const b = ch(n & 255)
  return `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1)}`
}
