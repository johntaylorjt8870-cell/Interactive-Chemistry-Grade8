import { useMemo, useState } from 'react'
import { ElectronConfiguration, LewisStructure, ScientificNotationText, type LewisPosition } from '@/scientific'
import type { InteractiveProps } from './registry'
import './lesson1-labs.css'

/* ============================================================================
   Lewis dot lab (pages 9–10)
   ----------------------------------------------------------------------------
   The lab derives everything from one number, the atomic number:

       distribution  = textbook fill order (K = 2, later shells ≤ 8)
       valence       = electrons in the last occupied shell
       dots          = valence electrons drawn around the symbol

   The student builds the arrangement themselves; the check is a real rule test
   (all electrons placed, no side over two, and no side doubled before every
   side has one). The reference arrangement is only shown after a check, so it
   can never act as an answer key before the student tries.
   ========================================================================= */

const SIDES: Array<{ id: LewisPosition; label: string }> = [
  { id: 'top', label: 'أعلى' },
  { id: 'right', label: 'يمين' },
  { id: 'bottom', label: 'أسفل' },
  { id: 'left', label: 'يسار' },
]

const ELEMENTS = [
  { symbol: 'Li', z: 3 },
  { symbol: 'B', z: 5 },
  { symbol: 'C', z: 6 },
  { symbol: 'N', z: 7 },
  { symbol: 'O', z: 8 },
  { symbol: 'F', z: 9 },
  { symbol: 'Ne', z: 10 },
  { symbol: 'Na', z: 11 },
  { symbol: 'Mg', z: 12 },
  { symbol: 'Al', z: 13 },
  { symbol: 'Ar', z: 18 },
  { symbol: 'Ca', z: 20 },
] as const

type SymbolName = (typeof ELEMENTS)[number]['symbol']

function distributionOf(electrons: number): number[] {
  const shells: number[] = []
  let remaining = electrons
  let n = 1
  while (remaining > 0 && n <= 4) {
    const capacity = n === 1 ? 2 : 8
    const used = Math.min(capacity, remaining)
    shells.push(used)
    remaining -= used
    n += 1
  }
  return shells
}

type Counts = Record<LewisPosition, number>
const EMPTY: Counts = { top: 0, right: 0, bottom: 0, left: 0 }

/** Reference order: all four sides once, then a second electron per side. */
function referenceOrder(): LewisPosition[] {
  return [...SIDES.map((side) => side.id), ...SIDES.map((side) => side.id)]
}

export default function LewisDotLab({ reducedMotion }: InteractiveProps) {
  const [symbol, setSymbol] = useState<SymbolName>('C')
  const [counts, setCounts] = useState<Counts>(EMPTY)
  const [checked, setChecked] = useState(false)

  const element = ELEMENTS.find((item) => item.symbol === symbol)!
  const distribution = useMemo(() => distributionOf(element.z), [element.z])
  const valence = distribution.at(-1) ?? 0
  const placed = SIDES.reduce((total, side) => total + counts[side.id], 0)

  const pairsAllowed = Math.max(0, valence - 4)
  const ruleIssue = useMemo(() => {
    const paired = SIDES.filter((side) => counts[side.id] === 2).length
    if (paired > pairsAllowed) {
      return 'قاعدة الازدواج: لا تضع النقطة الثانية في جهة قبل أن تأخذ الجهات الأربع نقطتها الأولى؛ فالإلكترونات الخمسة أو أقل تُرسم كلها مفردة، والزوج يظهر فقط عندما يزيد العدد على أربعة.'
    }
    if (paired < pairsAllowed) {
      return `يجب أن يظهر ${pairsAllowed} زوج على الأقل: ذرة ${element.symbol} لها ${valence} إلكتروناً سطحياً، وبعد الأربع نقاط المفردة تُزدوج النقاط المتبقية.`
    }
    return null
  }, [counts, element.symbol, pairsAllowed, valence])

  const complete = placed === valence && ruleIssue === null
  const referenceCounts = useMemo(() => {
    const result: Counts = { ...EMPTY }
    referenceOrder()
      .slice(0, valence)
      .forEach((side) => {
        result[side] += 1
      })
    return result
  }, [valence])

  const studentDots = SIDES.flatMap((side) =>
    Array.from({ length: counts[side.id] }, (_, slot) => ({ position: side.id, slot })),
  )

  function change(side: LewisPosition, delta: number) {
    setCounts((current) => ({
      ...current,
      [side]: Math.min(2, Math.max(0, current[side] + delta)),
    }))
    setChecked(false)
  }

  function select(next: SymbolName) {
    setSymbol(next)
    setCounts(EMPTY)
    setChecked(false)
  }

  return (
    <section className="lab lewis-lab" aria-labelledby="lewis-lab-title">
      <header className="lab__header">
        <div>
          <p className="lab__phase">إضافة من المنصة · بناء تمثيل لويس</p>
          <h3 id="lewis-lab-title">نقاط حول الرمز: إلكترونات السوية الأخيرة فقط</h3>
        </div>
        <div className="ion-lab__picker" role="group" aria-label="اختر العنصر">
          {ELEMENTS.map((item) => (
            <button
              type="button"
              key={item.symbol}
              className="ion-lab__choice"
              aria-pressed={item.symbol === symbol}
              onClick={() => select(item.symbol)}
            >
              {item.symbol}
            </button>
          ))}
        </div>
      </header>

      <div className="lab__measurements">
        <div>
          <span>العدد الذري</span>
          <strong>{element.z}</strong>
        </div>
        <div>
          <span>التوزيع الإلكتروني</span>
          <strong>
            <ElectronConfiguration value={distribution.join('-')} />
          </strong>
        </div>
        <div>
          <span>إلكترونات السوية الأخيرة</span>
          <strong>{valence}</strong>
        </div>
        <div>
          <span>النقاط الموضوعة</span>
          <strong>{placed}</strong>
        </div>
      </div>

      <div className="lewis-lab__grid">
        <div className="lewis-lab__preview">
          <LewisStructure
            symbol={element.symbol}
            dots={studentDots}
            size="lg"
            label={`تمثيل لويس الذي بنيته لذرّة ${element.symbol}: ${placed} من ${valence} إلكتروناً سطحياً`}
            caption={reducedMotion ? undefined : 'تتحدث النقاط المعروضة مباشرةً مع كل ضغطة'}
          />
        </div>

        <div className="lewis-lab__sides">
          {SIDES.map((side) => (
            <div className="lewis-lab__side" key={side.id}>
              <span>{side.label}</span>
              <div className="particle-stepper__controls">
                <button
                  type="button"
                  className="button button--quiet button--small"
                  onClick={() => change(side.id, -1)}
                  disabled={counts[side.id] === 0}
                  aria-label={`إزالة إلكترون من جهة ${side.label}`}
                >
                  −
                </button>
                <output aria-live="polite">{counts[side.id]}</output>
                <button
                  type="button"
                  className="button button--quiet button--small"
                  onClick={() => change(side.id, 1)}
                  disabled={counts[side.id] === 2}
                  aria-label={`إضافة إلكترون إلى جهة ${side.label}`}
                >
                  +
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="lab__actions">
        <button type="button" className="button button--primary" onClick={() => setChecked(true)}>
          تحقّق من تمثيلي
        </button>
        <button
          type="button"
          className="button button--secondary"
          onClick={() => {
            setCounts(EMPTY)
            setChecked(false)
          }}
        >
          امسح النقاط
        </button>
        <button
          type="button"
          className="button button--quiet"
          onClick={() => {
            setCounts(EMPTY)
            setChecked(false)
            const sequence = referenceOrder().slice(0, valence)
            setCounts(
              sequence.reduce<Counts>(
                (result, side) => ({ ...result, [side]: result[side] + 1 }),
                { ...EMPTY },
              ),
            )
          }}
        >
          اعرض الترتيب المرجعي
        </button>
      </div>

      {checked ? (
        <p className="lewis-lab__feedback" data-state={complete ? 'correct' : 'wrong'} role="status">
          {complete ? (
            `صحيح: ${element.symbol} لها ${valence} إلكتروناً في السوية الأخيرة، وعدد نقاطك ${placed}، وكل جهة لا تحمل أكثر من إلكترونين بعد أن أخذت كل جهة نقطتها الأولى.`
          ) : ruleIssue ? (
            ruleIssue
          ) : (
            <>
              {`عدد النقاط غير مطابق بعد: تحتاج ${valence} نقطة، ووضعت ${placed}. راجع التوزيع `}
              <ElectronConfiguration value={distribution.join('-')} />
              {' وعدّ إلكترونات السوية الأخيرة فقط.'}
            </>
          )}
        </p>
      ) : null}

      {checked && !complete ? (
        <div className="lewis-lab__preview">
          <LewisStructure
            symbol={element.symbol}
            pairs={referencePairs(referenceCounts)}
            dots={referenceDots(referenceCounts)}
            size="md"
            label={`الترتيب المرجعي لتمثيل لويس لذرّة ${element.symbol}`}
            caption="الترتيب المرجعي بعد المحاولة: نقاط مفردة في كل جهة، ثم إكمال الأزواج."
          />
        </div>
      ) : null}

      <p className="lab__conclusion">
        <strong>الخلاصة:</strong>{' '}
        <ScientificNotationText>
          عدد النقاط في تمثيل لويس يساوي عدد إلكترونات السوية الأخيرة، لا العدد الكلي للإلكترونات. فالكربون (2-4) له أربع نقاط، والأرغون (2-8-8) له ثماني نقاط، والليثيوم (2-1) له نقطة واحدة.
        </ScientificNotationText>
      </p>
      <p className="lab__note">
        النموذج يطبق قاعدة الكتاب في هذا الدرس: K تتسع لإلكترونين، وكل سوية تالية بحد أقصى ثمانية إلكترونات، مع
        إشغال السويات من الداخل إلى الخارج. العناصر المتاحة هي عناصر الدرس والأمثلة المطبوعة فقط.
      </p>
    </section>
  )
}

function referencePairs(counts: Counts): Partial<Record<LewisPosition, number>> {
  const pairs: Partial<Record<LewisPosition, number>> = {}
  SIDES.forEach((side) => {
    if (counts[side.id] === 2) pairs[side.id] = 1
  })
  return pairs
}

function referenceDots(counts: Counts): Array<{ position: LewisPosition }> {
  return SIDES.filter((side) => counts[side.id] === 1).map((side) => ({ position: side.id }))
}
