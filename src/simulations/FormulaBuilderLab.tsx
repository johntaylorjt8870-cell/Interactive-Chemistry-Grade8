import { useMemo, useState } from 'react'
import { ChemicalFormula } from '@/scientific'
import type { InteractiveProps } from './registry'

/* ============================================================================
   مختبر بناء الصيغة الكيميائية — إضافة من المنصة
   يطبّق خطوات الكتاب الثلاث في الصفحة 21 على أي زوج أيونات اختاره الطالب:
   (1) أكتب الأيونَين، (2) أحقّق التعادلَ الكهربائي، (3) أكتب الصيغة —
   مع إظهار حركي لعدد الأيونات اللازم، وقوس الجذر عند تكراره، وتحقّق التعادل.
   الأيونات كلها واردة في جداول الصفحتين 20 و21؛ والأمثلة الجاهزة هي أمثلة
   الكتاب نفسها (ZnCl₂ وAl₂O₃ وAl₂(SO₄)₃ وCaO) أو تطبيق مباشر لقاعدتها.
   ========================================================================= */

type IonSpec = {
  id: string
  formula: string
  name: string
  charge: number
  radical?: boolean
}

const CATIONS: IonSpec[] = [
  { id: 'Na', formula: 'Na^+', name: 'أيون الصوديوم', charge: 1 },
  { id: 'Mg', formula: 'Mg^2+', name: 'أيون المغنزيوم', charge: 2 },
  { id: 'Ca', formula: 'Ca^2+', name: 'أيون الكالسيوم', charge: 2 },
  { id: 'Zn', formula: 'Zn^2+', name: 'أيون الزنك', charge: 2 },
  { id: 'Al', formula: 'Al^3+', name: 'أيون الألمنيوم', charge: 3 },
  { id: 'NH4', formula: 'NH4^+', name: 'جذر الأمونيوم', charge: 1, radical: true },
]

const ANIONS: IonSpec[] = [
  { id: 'Cl', formula: 'Cl^-', name: 'أيون الكلوريد', charge: 1 },
  { id: 'O', formula: 'O^2-', name: 'أيون الأكسيد', charge: 2 },
  { id: 'S', formula: 'S^2-', name: 'أيون الكبريتيد', charge: 2 },
  { id: 'OH', formula: 'OH^-', name: 'جذر الهيدروكسيل', charge: 1, radical: true },
  { id: 'NO3', formula: 'NO3^-', name: 'جذر النترات', charge: 1, radical: true },
  { id: 'CO3', formula: 'CO3^2-', name: 'جذر الكربونات', charge: 2, radical: true },
  { id: 'SO4', formula: 'SO4^2-', name: 'جذر الكبريتات', charge: 2, radical: true },
  { id: 'PO4', formula: 'PO4^3-', name: 'جذر الفوسفات', charge: 3, radical: true },
]

type Preset = { cationId: string; anionId: string; label: string; fromBook: boolean }

/** أمثلة جاهزة: أمثلة الكتاب الثلاث أولًا ثم تطبيقات مباشرة على قاعدته. */
const PRESETS: Preset[] = [
  { cationId: 'Zn', anionId: 'Cl', label: 'كلوريد الزنك', fromBook: true },
  { cationId: 'Al', anionId: 'O', label: 'أكسيد الألمنيوم', fromBook: true },
  { cationId: 'Al', anionId: 'SO4', label: 'كبريتات الألمنيوم', fromBook: true },
  { cationId: 'Ca', anionId: 'O', label: 'أكسيد الكالسيوم', fromBook: true },
  { cationId: 'Na', anionId: 'OH', label: 'هيدروكسيد الصوديوم', fromBook: true },
  { cationId: 'Ca', anionId: 'CO3', label: 'كربونات الكالسيوم', fromBook: false },
]

function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b)
}

function lowestCommonMultiple(a: number, b: number): number {
  return (a * b) / gcd(a, b)
}

/** يبني نص الصيغة بصيغة المُحرِّك العلمي: أُسّ سفلي بالأرقام، وشحنة بعلامة ^. */
function formulaText(cation: IonSpec, anion: IonSpec, cationCount: number, anionCount: number): string {
  const cationPart =
    cationCount === 1
      ? cation.formula.replace(/\^[0-9]*[+-]$/u, '')
      : `${cation.formula.replace(/\^[0-9]*[+-]$/u, '')}${cationCount}`
  const anionBase = anion.formula.replace(/\^[0-9]*[+-]$/u, '')
  const anionPart =
    anionCount === 1
      ? anionBase
      : anion.radical
        ? `(${anionBase})${anionCount}`
        : `${anionBase}${anionCount}`
  return `${cationPart}${anionPart}`
}

type Phase = 'ions' | 'balance' | 'formula'

export default function FormulaBuilderLab({ reducedMotion }: InteractiveProps) {
  const [cationId, setCationId] = useState('Zn')
  const [anionId, setAnionId] = useState('Cl')
  const [phase, setPhase] = useState<Phase>('ions')
  const [placed, setPlaced] = useState(0)

  const cation = CATIONS.find((item) => item.id === cationId)!
  const anion = ANIONS.find((item) => item.id === anionId)!

  const cationCount = phase === 'ions' ? 0 : lowestCommonMultiple(cation.charge, anion.charge) / cation.charge
  const anionCount = phase === 'ions' ? 0 : lowestCommonMultiple(cation.charge, anion.charge) / anion.charge
  const total = cationCount + anionCount
  const balanceEquation = `(+${cation.charge})×${cationCount} + (−${anion.charge})×${anionCount} = 0`
  const formula = formulaText(cation, anion, cationCount, anionCount)
  const needsParentheses = anion.radical && anionCount > 1

  const ready = phase !== 'ions'
  const tiles = useMemo(
    () => [
      ...Array.from({ length: cationCount }, (_, index) => ({ key: `c-${index}`, kind: 'cation' as const })),
      ...Array.from({ length: anionCount }, (_, index) => ({ key: `a-${index}`, kind: 'anion' as const })),
    ],
    [cationCount, anionCount],
  )

  function pick(cationNext: string, anionNext: string) {
    setCationId(cationNext)
    setAnionId(anionNext)
    setPhase('ions')
    setPlaced(0)
  }

  function applyPreset(preset: Preset) {
    pick(preset.cationId, preset.anionId)
  }

  function startBalance() {
    setPhase('balance')
    setPlaced(0)
  }

  const visibleTiles = reducedMotion ? placed : placed
  const donePlacing = placed >= total

  function placeAll() {
    setPlaced(total)
  }

  return (
    <section
      className={`lab formula-builder-lab ${reducedMotion ? 'lab--still' : ''}`}
      data-phase={phase}
      data-balanced={donePlacing ? 'true' : undefined}
      aria-labelledby="formula-builder-title"
    >
      <header className="lab__header">
        <div>
          <p className="lab__phase">إضافة من المنصة · مختبر بناء الصيغة</p>
          <h3 id="formula-builder-title">من الأيونات المتعادلة إلى الصيغة النهائية</h3>
        </div>
      </header>

      <div className="formula-builder-lab__pickers">
        <fieldset className="formula-builder-lab__group">
          <legend>الخطوة 1: أكتبُ أيونَي المادّة — اختر الأيون الموجب</legend>
          <div role="group" aria-label="الأيون الموجب">
            {CATIONS.map((item) => (
              <button
                type="button"
                key={item.id}
                className="formula-builder-lab__ion"
                aria-pressed={item.id === cationId}
                onClick={() => pick(item.id, anionId)}
              >
                <span dir="ltr"><ChemicalFormula formula={item.formula} /></span>
                <small>{item.name}</small>
              </button>
            ))}
          </div>
        </fieldset>
        <fieldset className="formula-builder-lab__group">
          <legend>ثم الأيون السالب</legend>
          <div role="group" aria-label="الأيون السالب">
            {ANIONS.map((item) => (
              <button
                type="button"
                key={item.id}
                className="formula-builder-lab__ion"
                aria-pressed={item.id === anionId}
                onClick={() => pick(cationId, item.id)}
              >
                <span dir="ltr"><ChemicalFormula formula={item.formula} /></span>
                <small>{item.name}</small>
              </button>
            ))}
          </div>
        </fieldset>
      </div>

      <div className="formula-builder-lab__stage">
        <div className="formula-builder-lab__column">
          <h4>الخطوة 2: أحقّقُ التعادلَ الكهربائيَّ</h4>
          {ready ? (
            <>
              <p className="formula-builder-lab__balance" dir="ltr">{balanceEquation}</p>
              <div className="formula-builder-lab__tiles" aria-label={`أيونات لازمة: ${cationCount} موجبة و${anionCount} سالبة`}>
                {tiles.slice(0, visibleTiles).map((tile) => (
                  <span
                    key={tile.key}
                    className={`formula-builder-lab__tile formula-builder-lab__tile--${tile.kind}`}
                  >
                    <ChemicalFormula formula={tile.kind === 'cation' ? cation.formula : anion.formula} size="sm" />
                  </span>
                ))}
              </div>
              {!donePlacing ? (
                <div className="lab__actions">
                  <button type="button" className="button button--primary" onClick={() => setPlaced((value) => value + 1)}>
                    ضع أيوناً واحداً
                  </button>
                  <button type="button" className="button button--quiet" onClick={placeAll}>
                    ضع الكل دفعة واحدة
                  </button>
                </div>
              ) : (
                <p className="formula-builder-lab__verdict" aria-live="polite">
                  ✅ تعادلت الشحنة: {cationCount} × (+{cation.charge}) = {cationCount * cation.charge} و{' '}
                  {anionCount} × (−{anion.charge}) = −{anionCount * anion.charge}؛ والمجموع صفر.
                </p>
              )}
            </>
          ) : (
            <div className="lab__actions">
              <button type="button" className="button button--primary" onClick={startBalance}>
                ابدأ تحقيق التعادل
              </button>
            </div>
          )}
        </div>

        <div className="formula-builder-lab__column">
          <h4>الخطوة 3: أكتبُ الصّيغةَ</h4>
          {donePlacing ? (
            <>
              <p className="formula-builder-lab__result" dir="ltr">
                <ChemicalFormula formula={formula} size="lg" />
              </p>
              {needsParentheses ? (
                <p className="formula-builder-lab__paren-note">
                  لماذا القوس حول الجذر؟ لأن الجذر <strong dir="ltr"><ChemicalFormula formula={anion.formula} size="sm" /></strong>{' '}
                  يتكرر {anionCount} مرات، فنضع الصيغة كاملةً داخل قوسٍ ثم نكتب عدد التكرار بعد القوس؛
                  لو كتبنا العدد داخل الجذر لتغيّر مادة الجذر نفسها.
                </p>
              ) : (
                <p className="formula-builder-lab__paren-note">
                  لا حاجة للقوس هنا: {anion.radical ? 'الجذر واحدٌ في هذه الصيغة.' : 'المكوّن سالب أيون ذرّي لا جذر متكرر.'}
                </p>
              )}
              <p className="formula-builder-lab__verify">
                تحقّق: نسبة الأيونات <bdi dir="ltr">{cationCount} : {anionCount}</bdi>
                {' '}— وهذا هو التبادل المتقاطع لتكافؤَي المؤلَّفَين كما في الكتاب.
              </p>
            </>
          ) : (
            <p className="formula-builder-lab__hint">أكمل تحقيق التعادل أولًا؛ فالصيغة تُكتب بعد تعادل الشحنة لا قبلها.</p>
          )}
        </div>
      </div>

      <div className="formula-builder-lab__presets">
        <h4>أمثلة جاهزة</h4>
        <div role="group" aria-label="أمثلة جاهزة">
          {PRESETS.map((preset) => (
            <button type="button" key={preset.label} className="formula-builder-lab__preset" onClick={() => applyPreset(preset)}>
              {preset.label}
              {preset.fromBook ? <small>مثال من الكتاب</small> : <small>تطبيق من المنصة</small>}
            </button>
          ))}
        </div>
      </div>

      <p className="lab__conclusion" aria-live="polite">
        <strong>الاستنتاج:</strong>{' '}
        {donePlacing
          ? `صيغة المركّب من ${cation.name} و${anion.name} هي ${''}`
          : 'اختر الأيونين ثم حقّق التعادل؛ ستلاحظ أن عدد كل أيون يأتي من تكافؤ الطرف الآخر — هذا هو التبادل المتقاطع.'}
        {donePlacing ? (
          <span dir="ltr" className="formula-builder-lab__final">
            <ChemicalFormula formula={formula} />
          </span>
        ) : null}
      </p>
    </section>
  )
}
